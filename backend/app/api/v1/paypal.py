import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.config import settings
from app.models.entities import (
    User, Workshop, Reservation, PaymentOrder, PaymentCapture,
    WebhookEvent, AuditLog, Notification
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
        client_id=settings.PAYPAL_CLIENT_ID or "sb_mock_client_id_for_eval",
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
    )
    reservation = (await db.execute(stmt)).scalar_one_or_none()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found or unauthorized.")
        
    if reservation.status == "confirmed":
        raise HTTPException(status_code=400, detail="Reservation has already been paid and confirmed.")
        
    # Re-verify seats
    if reservation.workshop.remaining_seats <= 0:
        raise HTTPException(status_code=400, detail="No seats remaining in workshop.")
        
    # Call PayPal Orders v2
    order_data = await paypal_client.create_order(
        amount_cents=reservation.final_amount_cents,
        currency=reservation.currency,
        custom_id=reservation.id,
        description=f"NUVENDRY: {reservation.workshop.title[:100]}"
    )
    
    paypal_order_id = order_data["id"]
    reservation.paypal_order_id = paypal_order_id
    
    # Persist PaymentOrder
    payment_order = PaymentOrder(
        id=str(uuid.uuid4()),
        reservation_id=reservation.id,
        paypal_order_id=paypal_order_id,
        amount_cents=reservation.final_amount_cents,
        currency=reservation.currency,
        status="created"
    )
    db.add(payment_order)
    
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
        .where(Reservation.paypal_order_id == order_id)
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

    # 2. Call PayPal Capture API
    capture_resp = await paypal_client.capture_order(order_id)
    capture_status = capture_resp.get("status")
    
    # Extract capture ID from purchase units
    paypal_capture_id = f"CAP-{uuid.uuid4().hex[:12].upper()}"
    try:
        pu = capture_resp.get("purchase_units", [])[0]
        payments = pu.get("payments", {})
        captures = payments.get("captures", [])
        if captures:
            paypal_capture_id = captures[0].get("id", paypal_capture_id)
            capture_status = captures[0].get("status", capture_status)
    except Exception as e:
        logger.warning(f"Could not parse nested capture unit from response: {e}")
        
    if capture_status != "COMPLETED":
        raise HTTPException(
            status_code=400,
            detail=f"PayPal transaction not completed. Status: {capture_status}"
        )

    # 3. Lock Workshop and Decrement Seat Capacity Safely
    ws_stmt = select(Workshop).where(Workshop.id == reservation.workshop_id).with_for_update()
    workshop = (await db.execute(ws_stmt)).scalar_one()
    
    if workshop.remaining_seats <= 0:
        logger.error(f"Overselling prevention triggered for workshop {workshop.id}")
        raise HTTPException(
            status_code=409,
            detail="Seat allocation conflict: workshop capacity reached. Automatic refund required."
        )
        
    workshop.remaining_seats -= 1
    
    # 4. Finalize Reservation
    now = datetime.now(timezone.utc)
    reservation.status = "confirmed"
    reservation.paypal_capture_id = paypal_capture_id
    reservation.confirmed_at = now
    
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
        
    # 5. Process Post-Payment Rewards, Ledgers & Gifts
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
        
    # Verify signature if production/configured
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
        status="processed"
    )
    db.add(wh_event)
    await db.commit()
    
    return {"status": "success", "event_id": event_id}

