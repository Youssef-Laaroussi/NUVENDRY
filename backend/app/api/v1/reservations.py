import uuid
from datetime import datetime, timezone, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.entities import User, Workshop, Reservation, ReservationHold, AuditLog, WorkshopSession, MerchantProfile, Notification, ReservationReschedule, WorkshopReview
from app.schemas.reservation import (
    ReservationQuoteRequest, ReservationQuoteResponse,
    ReservationCreate, ReservationResponse, RescheduleRequest, ReservedWorkshop, ReservationReviewCreate
)
from app.rewards.engine import reward_engine
from app.api.deps import get_current_user

router = APIRouter(prefix="/reservations", tags=["Reservations & Booking"])

@router.post("/quote", response_model=ReservationQuoteResponse)
async def get_reservation_quote(
    req: ReservationQuoteRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Workshop).where(Workshop.id == req.workshop_id)
    workshop = (await db.execute(stmt)).scalar_one_or_none()
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found.")
        
    quote = await reward_engine.evaluate_rewards(
        db=db,
        user=user,
        workshop=workshop,
        campaign_ids=req.campaign_ids,
        use_store_credit=req.use_store_credit
    )
    return quote

@router.post("", response_model=ReservationResponse, status_code=status.HTTP_201_CREATED)
async def create_reservation(
    req: ReservationCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Creates a pending reservation and acquires a temporary concurrency-safe seat hold.
    Authoritatively checks available seats.
    """
    # 1. Fetch workshop with lock
    stmt = select(Workshop).where(Workshop.id == req.workshop_id).with_for_update()
    workshop = (await db.execute(stmt)).scalar_one_or_none()
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found.")
        
    if not workshop.is_published:
        raise HTTPException(400, "Workshop is not published.")
    if workshop.remaining_seats <= 0:
        raise HTTPException(status_code=400, detail="Workshop is fully booked. No seats remaining.")
        
    # 2. Check if user already has an active or confirmed reservation
    existing_stmt = select(Reservation).where(
        Reservation.workshop_id == workshop.id,
        Reservation.user_id == user.id,
        Reservation.status.in_(["pending_payment", "confirmed"])
    )
    existing = (await db.execute(existing_stmt)).scalar_one_or_none()
    if existing and existing.status == "confirmed":
        raise HTTPException(status_code=400, detail="You already have a confirmed seat in this workshop.")
    elif existing and existing.status == "pending_payment":
        # Recalculate authoritative quote if reward selection changed prior to payment
        quote = await reward_engine.evaluate_rewards(
            db=db,
            user=user,
            workshop=workshop,
            campaign_ids=req.campaign_ids,
            use_store_credit=req.use_store_credit
        )
        if existing.final_amount_cents != quote["final_amount_cents"] or existing.currency != quote["currency"]:
            existing.paypal_order_id = None
        existing.final_amount_cents = quote["final_amount_cents"]
        existing.currency = quote["currency"]
        db.add(AuditLog(
            user_id=user.id,
            action="RESERVATION_QUOTE_APPLIED",
            resource_type="Reservation",
            resource_id=existing.id,
            details={
                "workshop_id": workshop.id,
                "amount_cents": quote["final_amount_cents"],
                "quote": {
                    "rewards_applied": quote["rewards_applied"],
                    "store_credit_applied_cents": quote["store_credit_applied_cents"]
                }
            }
        ))
        await db.commit()
        await db.refresh(existing)
        return ReservationResponse(
            id=existing.id,
            workshop_id=existing.workshop_id,
            workshop_title=workshop.title,
            user_id=existing.user_id,
            final_amount_cents=existing.final_amount_cents,
            currency=existing.currency,
            status=existing.status,
            paypal_order_id=existing.paypal_order_id,
            paypal_capture_id=existing.paypal_capture_id,
            created_at=existing.created_at,
            confirmed_at=existing.confirmed_at
        )

    # 3. Calculate authoritative quote
    quote = await reward_engine.evaluate_rewards(
        db=db,
        user=user,
        workshop=workshop,
        campaign_ids=req.campaign_ids,
        use_store_credit=req.use_store_credit
    )
    
    reservation_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    reservation = Reservation(
        id=reservation_id,
        workshop_id=workshop.id,
        user_id=user.id,
        final_amount_cents=quote["final_amount_cents"],
        currency=quote["currency"],
        status="pending_payment"
    )
    db.add(reservation)
    
    # Create expiring hold (15 minutes)
    hold = ReservationHold(
        id=str(uuid.uuid4()),
        workshop_id=workshop.id,
        user_id=user.id,
        expires_at=now + timedelta(minutes=15),
        status="active"
    )
    db.add(hold)
    
    # Audit
    db.add(AuditLog(
        user_id=user.id,
        action="RESERVATION_INITIATED",
        resource_type="Reservation",
        resource_id=reservation_id,
        details={
            "workshop_id": workshop.id,
            "amount_cents": quote["final_amount_cents"],
            "quote": {
                "rewards_applied": quote["rewards_applied"],
                "store_credit_applied_cents": quote["store_credit_applied_cents"]
            }
        }
    ))
    
    await db.commit()
    await db.refresh(reservation)
    
    return ReservationResponse(
        id=reservation.id,
        workshop_id=reservation.workshop_id,
        workshop_title=workshop.title,
        user_id=reservation.user_id,
        final_amount_cents=reservation.final_amount_cents,
        currency=reservation.currency,
        status=reservation.status,
        paypal_order_id=reservation.paypal_order_id,
        paypal_capture_id=reservation.paypal_capture_id,
        created_at=reservation.created_at,
        confirmed_at=reservation.confirmed_at
    )

@router.get("/me", response_model=List[ReservationResponse])
async def list_my_reservations(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Reservation)
        .options(selectinload(Reservation.workshop), selectinload(Reservation.attendance))
        .where(Reservation.user_id == user.id)
        .order_by(desc(Reservation.created_at))
    )
    result = await db.execute(stmt)
    reservations = result.scalars().all()
    schedules = {
        change.reservation_id: (change, session)
        for change, session in await db.execute(
            select(ReservationReschedule, WorkshopSession)
            .outerjoin(WorkshopSession, WorkshopSession.id == ReservationReschedule.approved_session_id)
            .where(ReservationReschedule.reservation_id.in_([item.id for item in reservations]))
        )
    } if reservations else {}
    responses = []
    review_rows = await db.execute(select(WorkshopReview.reservation_id, WorkshopReview.rating).where(
        WorkshopReview.reservation_id.in_([item.id for item in reservations])
    )) if reservations else None
    review_ratings = dict(review_rows.all()) if review_rows else {}
    for r in reservations:
        change, session = schedules.get(r.id, (None, None))
        workshop = ReservedWorkshop.model_validate(r.workshop) if r.workshop else None
        if workshop and session:
            workshop.scheduled_at = ReservedWorkshop.normalize_schedule(session.session_date)
        responses.append(ReservationResponse(
            id=r.id,
            workshop_id=r.workshop_id,
            workshop_title=r.workshop.title if r.workshop else "NUVENDRY Workshop",
            workshop=workshop,
            reschedule_status=change.status if change else None,
            attended=r.attendance.attended if r.attendance else None,
            review_rating=review_ratings.get(r.id),
            user_id=r.user_id,
            final_amount_cents=r.final_amount_cents,
            currency=r.currency,
            status=r.status,
            paypal_order_id=r.paypal_order_id,
            paypal_capture_id=r.paypal_capture_id,
            created_at=r.created_at,
            confirmed_at=r.confirmed_at,
        ))
    return responses


@router.post("/{reservation_id}/review")
async def submit_reservation_review(
    reservation_id: str,
    payload: ReservationReviewCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    reservation = await db.scalar(select(Reservation)
        .options(selectinload(Reservation.attendance))
        .where(Reservation.id == reservation_id, Reservation.user_id == user.id))
    if not reservation or reservation.status != "confirmed":
        raise HTTPException(404, "Confirmed reservation not found.")
    if not reservation.attendance or not reservation.attendance.attended:
        raise HTTPException(409, "You can review a workshop after the instructor marks your attendance.")

    review = await db.scalar(select(WorkshopReview).where(WorkshopReview.reservation_id == reservation.id))
    if review:
        review.rating = payload.rating
    else:
        db.add(WorkshopReview(
            reservation_id=reservation.id,
            workshop_id=reservation.workshop_id,
            user_id=user.id,
            rating=payload.rating,
        ))
    await db.commit()
    return {"reservation_id": reservation.id, "rating": payload.rating}

@router.post("/{reservation_id}/cancel", response_model=ReservationResponse)
async def cancel_pending_reservation(
    reservation_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Reservation)
        .options(selectinload(Reservation.workshop))
        .where(Reservation.id == reservation_id, Reservation.user_id == user.id)
        .with_for_update()
    )
    reservation = (await db.execute(stmt)).scalar_one_or_none()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found.")
    if reservation.status != "pending_payment":
        raise HTTPException(status_code=400, detail="Only pending unpaid reservations can be cancelled.")

    reservation.status = "cancelled"
    holds_stmt = select(ReservationHold).where(
        ReservationHold.workshop_id == reservation.workshop_id,
        ReservationHold.user_id == user.id,
        ReservationHold.status == "active"
    )
    for h in (await db.execute(holds_stmt)).scalars().all():
        h.status = "released"

    db.add(AuditLog(
        user_id=user.id,
        action="RESERVATION_CANCELLED",
        resource_type="Reservation",
        resource_id=reservation.id,
        details={"workshop_id": reservation.workshop_id}
    ))
    await db.commit()
    await db.refresh(reservation)

    return ReservationResponse(
        id=reservation.id,
        workshop_id=reservation.workshop_id,
        workshop_title=reservation.workshop.title if reservation.workshop else "NUVENDRY Workshop",
        user_id=reservation.user_id,
        final_amount_cents=reservation.final_amount_cents,
        currency=reservation.currency,
        status=reservation.status,
        paypal_order_id=reservation.paypal_order_id,
        paypal_capture_id=reservation.paypal_capture_id,
        created_at=reservation.created_at,
        confirmed_at=reservation.confirmed_at
    )



@router.get("/{reservation_id}/reschedule-options")
async def reschedule_options(
    reservation_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    reservation = await get_reschedulable_reservation(reservation_id, user.id, db)
    change = await db.get(ReservationReschedule, reservation.id)
    if change and change.status == "requested":
        raise HTTPException(409, "A reschedule request is already pending.")
    sessions = await db.scalars(available_reschedule_sessions(reservation.workshop))
    return [
        {"id": session.id, "scheduled_at": session.session_date.replace(tzinfo=timezone.utc) if session.session_date.tzinfo is None else session.session_date}
        for session in sessions if not change or session.id != change.approved_session_id
    ]


@router.post("/{reservation_id}/reschedule-requests", status_code=201)
async def request_reschedule(
    reservation_id: str,
    payload: RescheduleRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    reservation = await get_reschedulable_reservation(reservation_id, user.id, db, lock=True)
    session = await db.scalar(available_reschedule_sessions(reservation.workshop).where(
        WorkshopSession.id == payload.session_id
    ))
    if not session:
        raise HTTPException(409, "This alternate session is no longer available.")
    change = await db.get(ReservationReschedule, reservation.id)
    if change and change.status == "requested":
        raise HTTPException(409, "A reschedule request is already pending.")
    if change and change.approved_session_id == session.id:
        raise HTTPException(409, "You are already booked for this session.")
    if not change:
        change = ReservationReschedule(reservation_id=reservation.id)
        db.add(change)
    change.requested_session_id = session.id
    change.status = "requested"
    merchant = await db.get(MerchantProfile, reservation.workshop.merchant_id)
    db.add(Notification(
        user_id=merchant.user_id,
        title="Reservation reschedule request",
        message=f"{user.full_name} requested to move {reservation.workshop.title} to {session.session_date.isoformat()}.",
        link="/merchant/reservations?workspace=account",
    ))
    db.add(AuditLog(
        user_id=user.id, action="RESCHEDULE_REQUESTED", resource_type="Reservation",
        resource_id=reservation.id, details={"session_id": session.id},
    ))
    await db.commit()
    return {"status": "requested"}


async def get_reschedulable_reservation(reservation_id, user_id, db, *, lock=False):
    query = select(Reservation).options(selectinload(Reservation.workshop)).where(
        Reservation.id == reservation_id, Reservation.user_id == user_id
    )
    reservation = await db.scalar(query.with_for_update() if lock else query)
    if not reservation:
        raise HTTPException(404, "Reservation not found.")
    if reservation.status != "confirmed":
        raise HTTPException(409, "Only confirmed reservations can be rescheduled.")
    return reservation


def available_reschedule_sessions(workshop):
    return select(WorkshopSession).where(
        WorkshopSession.workshop_id == workshop.id,
        WorkshopSession.status == "scheduled",
        WorkshopSession.session_date > datetime.now(timezone.utc),
        WorkshopSession.session_date != workshop.scheduled_at,
    ).order_by(WorkshopSession.session_date)
