import uuid
import logging
from decimal import Decimal, InvalidOperation
from datetime import datetime, timezone
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.config import settings
from app.models.entities import (
    User, Workshop, Reservation, PaymentOrder, PaymentCapture,
    WebhookEvent, AuditLog, Notification, ReservationHold, MerchantProfile
)
from app.schemas.payment import (
    PayPalConfigResponse, PayPalOrderCreate, PayPalOrderResponse,
    PayPalCaptureRequest, PayPalCaptureResponse
)
from app.payments.paypal_client import paypal_client
from app.rewards.engine import reward_engine
from app.api.deps import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/paypal", tags=["PayPal Sandbox Payment Integration"])

@router.get("/config", response_model=PayPalConfigResponse)
async def get_paypal_config():
    """
    Returns public PayPal Sandbox Client ID for SDK initialization.
    Secrets are strictly protected server-side.
    """
    return PayPalConfigResponse(
        client_id=settings.PAYPAL_CLIENT_ID or "",
        environment=settings.PAYPAL_ENV,
        currency="USD"
    )

@router.post("/orders", response_model=PayPalOrderResponse)
async def create_paypal_order(
    req: PayPalOrderCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Creates an official PayPal Orders v2 transaction using the authoritative server-calculated amount.
    """
    stmt = (
        select(Reservation)
        .options(selectinload(Reservation.workshop))
        .where(Reservation.id == req.reservation_id, Reservation.user_id == user.id)
        .with_for_update()
    )
    reservation = (await db.execute(stmt)).scalar_one_or_none()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found or unauthorized.")
        
    if reservation.status != "pending_payment":
        raise HTTPException(status_code=400, detail="Reservation has already been paid and confirmed.")
        
    if reservation.final_amount_cents <= 0:
        raise HTTPException(409, "This reservation has no payable balance.")

    # Re-verify seats
    if reservation.workshop.remaining_seats <= 0 or not reservation.workshop.is_published:
        raise HTTPException(409, "This workshop is no longer available.")
    if reservation.paypal_order_id:
        existing_order = await db.scalar(select(PaymentOrder).where(
            PaymentOrder.paypal_order_id == reservation.paypal_order_id,
            PaymentOrder.reservation_id == reservation.id,
        ))
        if existing_order and existing_order.status == "created":
            return PayPalOrderResponse(
                paypal_order_id=existing_order.paypal_order_id, status="CREATED",
                amount_cents=existing_order.amount_cents, currency=existing_order.currency,
            )
        
    # Call PayPal Orders v2
    order_data = await paypal_client.create_order(
        amount_cents=reservation.final_amount_cents,
        currency=reservation.currency,
        custom_id=reservation.id,
        description=f"NUVENDRY: {reservation.workshop.title[:100]}"
    )
    
    paypal_order_id = order_data["id"]
    reservation.paypal_order_id = paypal_order_id
    
    # PayPal may return the same order after a retry of its idempotency key.
    payment_order = await db.scalar(select(PaymentOrder).where(PaymentOrder.paypal_order_id == paypal_order_id))
    if payment_order and (
        payment_order.reservation_id != reservation.id
        or payment_order.amount_cents != reservation.final_amount_cents
        or payment_order.currency != reservation.currency
        or payment_order.status != "created"
    ):
        raise HTTPException(409, "PayPal returned an order that cannot be used for this reservation.")
    if not payment_order:
        db.add(PaymentOrder(
            id=str(uuid.uuid4()), reservation_id=reservation.id, paypal_order_id=paypal_order_id,
            amount_cents=reservation.final_amount_cents, currency=reservation.currency, status="created",
        ))

    await db.commit()
    
    approval_url = None
    for link in order_data.get("links", []):
        if link.get("rel") == "approve":
            approval_url = link.get("href")
            break
            
    return PayPalOrderResponse(
        paypal_order_id=paypal_order_id,
        status=order_data.get("status", "CREATED"),
        amount_cents=reservation.final_amount_cents,
        currency=reservation.currency,
        approval_url=approval_url
    )

@router.post("/orders/{order_id}/capture", response_model=PayPalCaptureResponse)
async def capture_paypal_order(
    order_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Authoritative server-side capture of approved PayPal order.
    Locks seat inventory, confirms reservation, updates reward ledgers atomically.
    Idempotent: Duplicate calls safely return the already confirmed transaction.
    """
    # 1. Fetch reservation
    stmt = (
        select(Reservation)
        .options(selectinload(Reservation.workshop))
        .where(Reservation.paypal_order_id == order_id, Reservation.user_id == user.id)
        .with_for_update()
    )
    reservation = (await db.execute(stmt)).scalar_one_or_none()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation matching this PayPal Order ID was not found.")
        
    # Check idempotency: If already confirmed, return current confirmed status
    if reservation.status == "confirmed" and reservation.paypal_capture_id:
        return PayPalCaptureResponse(
            reservation_id=reservation.id,
            paypal_order_id=reservation.paypal_order_id,
            paypal_capture_id=reservation.paypal_capture_id,
            status="COMPLETED",
            amount_cents=reservation.final_amount_cents,
            currency=reservation.currency,
            confirmed_at=reservation.confirmed_at or datetime.now(timezone.utc)
        )

    if reservation.status != "pending_payment":
        raise HTTPException(409, "Only pending reservations can be paid.")
    # Lock inventory BEFORE contacting PayPal, so a sold-out session is not charged.
    workshop = (await db.execute(select(Workshop).where(
        Workshop.id == reservation.workshop_id).with_for_update())).scalar_one()
    if workshop.remaining_seats <= 0 or not workshop.is_published:
        raise HTTPException(409, "This workshop is no longer available. No capture was attempted.")
    quote_audit_stmt = (
        select(AuditLog)
        .where(
            AuditLog.resource_type == "Reservation",
            AuditLog.resource_id == reservation.id,
            AuditLog.action.in_(["RESERVATION_QUOTE_APPLIED", "RESERVATION_INITIATED"])
        )
        .order_by(desc(AuditLog.created_at))
    )
    quote_audit = (await db.execute(quote_audit_stmt)).scalars().first()
    saved_quote = (quote_audit.details or {}).get("quote") if quote_audit else None
    if saved_quote:
        await reward_engine.validate_checkout_funding(db, reservation, saved_quote)
    capture_resp = await paypal_client.capture_order(order_id)
    try:
        captures = [capture for unit in capture_resp["purchase_units"]
                    for capture in unit.get("payments", {}).get("captures", [])]
        if len(captures) != 1:
            raise ValueError("Expected one capture")
        capture = captures[0]
        paypal_capture_id = capture["id"]
        amount = Decimal(capture["amount"]["value"]) * 100
        valid = (capture_resp.get("id") == order_id and capture["status"] == "COMPLETED"
                 and bool(paypal_capture_id) and amount == reservation.final_amount_cents
                 and capture["amount"]["currency_code"] == reservation.currency)
        if not valid:
            raise ValueError("Capture mismatch")
    except (KeyError, TypeError, ValueError, InvalidOperation) as exc:
        raise HTTPException(409, "Capture not verified against this reservation. Contact support before retrying.") from exc

    workshop.remaining_seats -= 1
    
    # 4. Finalize Reservation
    now = datetime.now(timezone.utc)
    reservation.status = "confirmed"
    reservation.paypal_capture_id = paypal_capture_id
    reservation.confirmed_at = now
    holds = await db.scalars(select(ReservationHold).where(
        ReservationHold.workshop_id == reservation.workshop_id,
        ReservationHold.user_id == reservation.user_id,
        ReservationHold.status == "active",
    ))
    for hold in holds:
        hold.status = "released"
    
    # Update payment order record
    po_stmt = select(PaymentOrder).where(PaymentOrder.paypal_order_id == order_id)
    payment_order = (await db.execute(po_stmt)).scalar_one_or_none()
    if payment_order:
        payment_order.status = "captured"
        
        # Add capture record
        db.add(PaymentCapture(
            id=str(uuid.uuid4()),
            payment_order_id=payment_order.id,
            paypal_capture_id=paypal_capture_id,
            capture_status="COMPLETED",
            amount_cents=reservation.final_amount_cents,
            currency=reservation.currency,
            raw_response=capture_resp
        ))
        
    # 5. Consume Applied Checkout Discounts/Credits & Process Post-Payment Rewards
    if saved_quote:
        await reward_engine.consume_rewards_on_payment_success(
            db=db,
            user_id=user.id,
            reservation_id=reservation.id,
            quote=saved_quote
        )

    await reward_engine.trigger_post_payment_rewards(
        db=db,
        user_id=user.id,
        reservation_id=reservation.id,
        workshop_id=workshop.id
    )
    
    # Notification to user
    db.add(Notification(
        id=str(uuid.uuid4()),
        user_id=user.id,
        title="Reservation Confirmed!",
        message=f"Your seat in '{workshop.title}' is confirmed. PayPal Transaction: {paypal_capture_id}.",
        link=f"/app/reservations"
    ))
    
    merchant = await db.get(MerchantProfile, workshop.merchant_id)
    if merchant:
        db.add(Notification(
            user_id=merchant.user_id,
            title="New workshop reservation",
            message=(
                f"{user.full_name or user.email} reserved '{workshop.title}' "
                f"and paid {reservation.final_amount_cents / 100:.2f} {reservation.currency}. "
                f"Reservation reference: {reservation.id}."
            ),
            link="/merchant/reservations",
        ))

    # Audit log
    db.add(AuditLog(
        user_id=user.id,
        action="PAYMENT_CAPTURED_AND_CONFIRMED",
        resource_type="Reservation",
        resource_id=reservation.id,
        details={
            "paypal_order_id": order_id,
            "paypal_capture_id": paypal_capture_id,
            "amount_cents": reservation.final_amount_cents
        }
    ))
    
    await db.commit()
    await db.refresh(reservation)
    
    return PayPalCaptureResponse(
        reservation_id=reservation.id,
        paypal_order_id=order_id,
        paypal_capture_id=paypal_capture_id,
        status="COMPLETED",
        amount_cents=reservation.final_amount_cents,
        currency=reservation.currency,
        confirmed_at=now
    )

@router.post("/webhooks")
async def receive_paypal_webhook(
    request: Request,
    paypal_transmission_id: str = Header(None, alias="paypal-transmission-id"),
    paypal_transmission_time: str = Header(None, alias="paypal-transmission-time"),
    paypal_cert_url: str = Header(None, alias="paypal-cert-url"),
    paypal_auth_algo: str = Header(None, alias="paypal-auth-algo"),
    paypal_transmission_sig: str = Header(None, alias="paypal-transmission-sig"),
    db: AsyncSession = Depends(get_db)
):
    """
    Receives and authoritatively handles PayPal webhook events.
    Enforces signature verification, idempotency, and deduplication.
    """
    body = await request.json()
    event_id = body.get("id")
    event_type = body.get("event_type")
    
    if not event_id:
        raise HTTPException(status_code=400, detail="Missing webhook event id.")
        
    # Deduplicate event
    existing_stmt = select(WebhookEvent).where(WebhookEvent.event_id == event_id)
    existing = (await db.execute(existing_stmt)).scalar_one_or_none()
    if existing:
        return {"status": "ignored", "detail": "Event already processed"}
        
    # Missing signatures/configuration must never bypass verification.
    if not settings.PAYPAL_WEBHOOK_ID:
        raise HTTPException(503, "PayPal webhook verification is not configured.")
    if not all([paypal_transmission_id, paypal_transmission_time, paypal_cert_url,
                paypal_auth_algo, paypal_transmission_sig]):
        raise HTTPException(400, "Missing PayPal signature headers.")
    if settings.PAYPAL_WEBHOOK_ID and paypal_transmission_sig:
        is_valid = await paypal_client.verify_webhook_signature(
            transmission_id=paypal_transmission_id,
            transmission_time=paypal_transmission_time,
            cert_url=paypal_cert_url,
            auth_algo=paypal_auth_algo,
            transmission_sig=paypal_transmission_sig,
            webhook_id=settings.PAYPAL_WEBHOOK_ID,
            event_body=body
        )
        if not is_valid:
            logger.warning(f"Unverified webhook signature rejected: {event_id}")
            raise HTTPException(status_code=400, detail="Invalid webhook signature")
            
    # Persist webhook event
    wh_event = WebhookEvent(
        id=str(uuid.uuid4()),
        event_id=event_id,
        event_type=event_type,
        resource_id=body.get("resource", {}).get("id"),
        payload=body,
        status="verified"
    )
    db.add(wh_event)
    await db.commit()
    
    return {"status": "success", "event_id": event_id}

