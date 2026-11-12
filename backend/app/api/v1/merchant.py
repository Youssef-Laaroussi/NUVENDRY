import base64
import binascii
import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, select, desc, func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.entities import (
    User, MerchantProfile, Workshop, WorkshopSession, WorkshopDetails,
    Reservation, ReservationHold, AttendanceRecord, RewardCampaign, OfferProposal, AuditLog, Notification, ReservationReschedule, WorkshopReview
)
from app.schemas.workshop import WorkshopCreate, WorkshopUpdate, WorkshopResponse
from app.schemas.reward import CampaignCreate, CampaignUpdate, CampaignResponse
from app.schemas.reservation import AlternateSessionCreate, RescheduleDecision
from app.api.deps import get_current_instructor

router = APIRouter(prefix="/merchant", tags=["Merchant / Instructor Operations"])

def set_workshop_image(details: WorkshopDetails, image_data: str):
    header, _, data = image_data.partition(",")
    mime = header.removeprefix("data:").removesuffix(";base64")
    try:
        blob = base64.b64decode(data, validate=True)
    except (ValueError, binascii.Error):
        raise HTTPException(422, "Invalid workshop image.")
    valid = {
        "image/png": blob.startswith(b"\x89PNG\r\n\x1a\n"),
        "image/jpeg": blob.startswith(b"\xff\xd8\xff") and blob.endswith(b"\xff\xd9"),
        "image/webp": blob.startswith(b"RIFF") and blob[8:12] == b"WEBP",
    }
    if not valid.get(mime) or len(blob) > 2 * 1024 * 1024:
        raise HTTPException(422, "Choose a JPEG, PNG, or WebP image up to 2 MB.")
    details.image_type = mime
    details.image_bytes = blob


@router.post("/workshops", response_model=WorkshopResponse, status_code=status.HTTP_201_CREATED)
async def create_workshop(
    req: WorkshopCreate,
    user: User = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    if not user.merchant_profile:
        raise HTTPException(status_code=400, detail="Merchant profile not configured for this user.")
        
    if req.offer_id:
        proposal = (await db.execute(select(OfferProposal).where(OfferProposal.id == req.offer_id,
            OfferProposal.merchant_id == user.merchant_profile.id))).scalar_one_or_none()
        if not proposal:
            raise HTTPException(404, "Offer proposal not found or unauthorized.")
    workshop_id = str(uuid.uuid4())
    workshop = Workshop(
        id=workshop_id,
        merchant_id=user.merchant_profile.id,
        offer_id=req.offer_id,
        title=req.title,
        description=req.description,
        category=req.category,
        difficulty=req.difficulty,
        duration_hours=req.duration_hours,
        price_cents=req.price_cents,
        currency=req.currency,
        total_seats=req.total_seats,
        remaining_seats=req.total_seats,
        scheduled_at=req.scheduled_at,
        is_published=False  # created in draft status
    )
    if req.image_data or req.language or req.delivery_format:
        details = WorkshopDetails(language=req.language, delivery_format=req.delivery_format)
        if req.image_data:
            set_workshop_image(details, req.image_data)
        workshop.details = details
    db.add(workshop)
    
    # Also link proposal if provided
    if req.offer_id:
        prop_stmt = select(OfferProposal).where(OfferProposal.id == req.offer_id)
        proposal = (await db.execute(prop_stmt)).scalar_one_or_none()
        if proposal:
            proposal.status = "approved"
            
    # Audit log
    db.add(AuditLog(
        user_id=user.id,
        action="WORKSHOP_CREATED",
        resource_type="Workshop",
        resource_id=workshop_id,
        details={"title": req.title, "price_cents": req.price_cents}
    ))
    
    await db.commit()
    await db.refresh(workshop)
    
    return WorkshopResponse(
        id=workshop.id,
        image_url=workshop.image_url,
        language=workshop.language,
        delivery_format=workshop.delivery_format,
        merchant_id=workshop.merchant_id,
        offer_id=workshop.offer_id,
        title=workshop.title,
        description=workshop.description,
        category=workshop.category,
        difficulty=workshop.difficulty,
        duration_hours=workshop.duration_hours,
        price_cents=workshop.price_cents,
        currency=workshop.currency,
        total_seats=workshop.total_seats,
        remaining_seats=workshop.remaining_seats,
        scheduled_at=workshop.scheduled_at,
        is_published=workshop.is_published,
        created_at=workshop.created_at,
        merchant_name=user.merchant_profile.business_name
    )

@router.patch("/workshops/{workshop_id}", response_model=WorkshopResponse)
async def update_workshop(
    workshop_id: str,
    req: WorkshopUpdate,
    user: User = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Workshop).where(
        Workshop.id == workshop_id,
        Workshop.merchant_id == user.merchant_profile.id
    )
    workshop = (await db.execute(stmt)).scalar_one_or_none()
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found or unauthorized.")
        
    if req.image_data is not None:
        if workshop.details is None:
            workshop.details = WorkshopDetails()
        set_workshop_image(workshop.details, req.image_data)
    if req.title is not None:
        workshop.title = req.title
    if req.description is not None:
        workshop.description = req.description
    if req.price_cents is not None:
        workshop.price_cents = req.price_cents
    if req.total_seats is not None:
        # Prevent reducing capacity below already reserved seats
        reserved = workshop.total_seats - workshop.remaining_seats
        if req.total_seats < reserved:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot reduce capacity below currently reserved seats ({reserved})."
            )
        workshop.remaining_seats = req.total_seats - reserved
        workshop.total_seats = req.total_seats
    if req.scheduled_at is not None:
        workshop.scheduled_at = req.scheduled_at
    if req.is_published is not None:
        workshop.is_published = req.is_published
        
    await db.commit()
    await db.refresh(workshop)
    
    return WorkshopResponse(
        id=workshop.id,
        image_url=workshop.image_url,
        language=workshop.language,
        delivery_format=workshop.delivery_format,
        merchant_id=workshop.merchant_id,
        offer_id=workshop.offer_id,
        title=workshop.title,
        description=workshop.description,
        category=workshop.category,
        difficulty=workshop.difficulty,
        duration_hours=workshop.duration_hours,
        price_cents=workshop.price_cents,
        currency=workshop.currency,
        total_seats=workshop.total_seats,
        remaining_seats=workshop.remaining_seats,
        scheduled_at=workshop.scheduled_at,
        is_published=workshop.is_published,
        created_at=workshop.created_at,
        merchant_name=user.merchant_profile.business_name
    )

@router.get("/workshops/{workshop_id}/image")
async def merchant_workshop_image(
    workshop_id: str,
    user: User = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db),
):
    row = (await db.execute(
        select(WorkshopDetails.image_type, WorkshopDetails.image_bytes)
        .join(Workshop, Workshop.id == WorkshopDetails.workshop_id)
        .where(Workshop.id == workshop_id, Workshop.merchant_id == user.merchant_profile.id)
    )).one_or_none()
    if not row or not row.image_type:
        raise HTTPException(404, "Workshop image not found.")
    return Response(row.image_bytes, media_type=row.image_type, headers={
        "X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-store",
    })


@router.delete("/workshops/{workshop_id}", status_code=204)
async def delete_workshop(
    workshop_id: str,
    user: User = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db),
):
    owned_workshop = await db.scalar(select(Workshop.id).where(
        Workshop.id == workshop_id, Workshop.merchant_id == user.merchant_profile.id
    ).with_for_update())
    if owned_workshop is None:
        raise HTTPException(404, "Workshop not found.")
    reservation = await db.scalar(select(Reservation.id).where(
        Reservation.workshop_id == workshop_id
    ).limit(1))
    active_hold = await db.scalar(select(ReservationHold.id).where(
        ReservationHold.workshop_id == workshop_id,
        ReservationHold.status == "active",
        ReservationHold.expires_at > datetime.now(timezone.utc),
    ).limit(1))
    if reservation or active_hold:
        raise HTTPException(409, "This workshop has reservations or an active checkout. You can unpublish it instead.")
    try:
        await db.execute(delete(Workshop).where(Workshop.id == workshop_id))
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(409, "This workshop has linked records. You can unpublish it instead.")
    return Response(status_code=204)


@router.post("/workshops/{workshop_id}/publish", response_model=WorkshopResponse)
async def publish_workshop(
    workshop_id: str,
    user: User = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Workshop).where(
        Workshop.id == workshop_id,
        Workshop.merchant_id == user.merchant_profile.id
    )
    workshop = (await db.execute(stmt)).scalar_one_or_none()
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found or unauthorized.")
        
    workshop.is_published = True
    if workshop.offer_id:
        from app.models.entities import LearningDemand, ClusterMembership, DemandCluster
        proposal = await db.get(OfferProposal, workshop.offer_id)
        if proposal:
            proposal.status = "published"
            if proposal.cluster_id:
                cluster = await db.get(DemandCluster, proposal.cluster_id)
                if cluster:
                    cluster.status = "offer_generated"
                members = (await db.execute(select(LearningDemand).join(ClusterMembership,
                    ClusterMembership.demand_id == LearningDemand.id).where(ClusterMembership.cluster_id == proposal.cluster_id))).scalars().all()
                for demand in members:
                    demand.status = "offered"
    
    # Audit log
    db.add(AuditLog(
        user_id=user.id,
        action="WORKSHOP_PUBLISHED",
        resource_type="Workshop",
        resource_id=workshop_id,
        details={"title": workshop.title}
    ))
    
    await db.commit()
    await db.refresh(workshop)
    
    return WorkshopResponse(
        id=workshop.id,
        image_url=workshop.image_url,
        language=workshop.language,
        delivery_format=workshop.delivery_format,
        merchant_id=workshop.merchant_id,
        offer_id=workshop.offer_id,
        title=workshop.title,
        description=workshop.description,
        category=workshop.category,
        difficulty=workshop.difficulty,
        duration_hours=workshop.duration_hours,
        price_cents=workshop.price_cents,
        currency=workshop.currency,
        total_seats=workshop.total_seats,
        remaining_seats=workshop.remaining_seats,
        scheduled_at=workshop.scheduled_at,
        is_published=workshop.is_published,
        created_at=workshop.created_at,
        merchant_name=user.merchant_profile.business_name
    )

@router.get("/workshops", response_model=List[WorkshopResponse])
async def list_merchant_workshops(
    user: User = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Workshop).where(
        Workshop.merchant_id == user.merchant_profile.id
    ).order_by(desc(Workshop.created_at))
    result = await db.execute(stmt)
    workshops = result.scalars().all()
    
    return [
        WorkshopResponse(
            id=w.id,
            image_url=w.image_url,
            language=w.language,
            delivery_format=w.delivery_format,
            merchant_id=w.merchant_id,
            offer_id=w.offer_id,
            title=w.title,
            description=w.description,
            category=w.category,
            difficulty=w.difficulty,
            duration_hours=w.duration_hours,
            price_cents=w.price_cents,
            currency=w.currency,
            total_seats=w.total_seats,
            remaining_seats=w.remaining_seats,
            scheduled_at=w.scheduled_at,
            is_published=w.is_published,
            created_at=w.created_at,
            merchant_name=user.merchant_profile.business_name
        )
        for w in workshops
    ]


@router.get("/ratings")
async def get_merchant_rating_summary(
    user: User = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db),
):
    if not user.merchant_profile:
        raise HTTPException(400, "Instructor profile not configured.")
    average, count = (await db.execute(
        select(func.avg(WorkshopReview.rating), func.count(WorkshopReview.id))
        .join(Workshop, Workshop.id == WorkshopReview.workshop_id)
        .where(Workshop.merchant_id == user.merchant_profile.id)
    )).one()
    return {"average": round(float(average), 1) if average is not None else None, "count": count}

@router.get("/reservations")
async def list_merchant_reservations(
    user: User = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    if not user.merchant_profile:
        raise HTTPException(403, "An instructor profile is required.")
    stmt = (
        select(Reservation)
        .join(Workshop, Reservation.workshop_id == Workshop.id)
        .options(
            selectinload(Reservation.user),
            selectinload(Reservation.workshop),
            selectinload(Reservation.attendance)
        )
        .where(Workshop.merchant_id == user.merchant_profile.id)
        .order_by(desc(Reservation.created_at))
    )
    result = await db.execute(stmt)
    reservations = result.scalars().all()
    
    requests = {
        change.reservation_id: {"scheduled_at": session.session_date}
        for change, session in await db.execute(
            select(ReservationReschedule, WorkshopSession)
            .join(WorkshopSession, WorkshopSession.id == ReservationReschedule.requested_session_id)
            .where(
                ReservationReschedule.reservation_id.in_([item.id for item in reservations]),
                ReservationReschedule.status == "requested",
            )
        )
    } if reservations else {}
    return [
        {
            "id": r.id,
            "workshop_id": r.workshop_id,
            "workshop_title": r.workshop.title,
            "scheduled_at": r.workshop.scheduled_at,
            "attendance_marked_at": r.attendance.marked_at if r.attendance else None,
            "reschedule_request": requests.get(r.id),
            "buyer_name": r.user.full_name,
            "buyer_email": r.user.email,
            "amount_cents": r.final_amount_cents,
            "currency": r.currency,
            "status": r.status,
            "attended": bool(r.attendance and r.attendance.attended),
            "paypal_order_id": r.paypal_order_id,
            "paypal_capture_id": r.paypal_capture_id,
            "created_at": r.created_at,
            "confirmed_at": r.confirmed_at
        }
        for r in reservations
    ]

@router.post("/reservations/{reservation_id}/attendance")
async def mark_attendance(
    reservation_id: str,
    attended: bool = True,
    user: User = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    if not user.merchant_profile:
        raise HTTPException(403, "An instructor profile is required.")
    stmt = (
        select(Reservation)
        .join(Workshop, Reservation.workshop_id == Workshop.id)
        .where(
            Reservation.id == reservation_id,
            Workshop.merchant_id == user.merchant_profile.id
        )
        .with_for_update(of=Reservation)
    )
    reservation = (await db.execute(stmt)).scalar_one_or_none()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found or unauthorized.")
        
    if reservation.status != "confirmed":
        raise HTTPException(409, "Only confirmed reservations can be marked for attendance.")

    att_stmt = select(AttendanceRecord).where(AttendanceRecord.reservation_id == reservation_id)
    att = (await db.execute(att_stmt)).scalar_one_or_none()
    
    if not att:
        att = AttendanceRecord(
            reservation_id=reservation_id,
            workshop_id=reservation.workshop_id,
            user_id=reservation.user_id,
            attended=attended
        )
        db.add(att)
    else:
        att.attended = attended
        att.marked_at = datetime.now(timezone.utc)
        
    await db.commit()
    return {"message": "Attendance updated successfully.", "attended": attended}

# Reward Campaigns Management
@router.post("/rewards", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
async def create_reward_campaign(
    req: CampaignCreate,
    user: User = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    if not user.merchant_profile:
        raise HTTPException(403, "An instructor profile is required.")
    campaign = RewardCampaign(
        id=str(uuid.uuid4()),
        merchant_id=user.merchant_profile.id,
        name=req.name,
        campaign_type=req.campaign_type,
        discount_amount_cents=req.discount_amount_cents,
        discount_percentage=req.discount_percentage,
        min_spend_cents=req.min_spend_cents,
        total_budget_cents=req.total_budget_cents,
        remaining_budget_cents=req.total_budget_cents,
        max_per_user=req.max_per_user,
        expires_at=req.expires_at,
        is_active=True
    )
    db.add(campaign)
    await db.commit()
    await db.refresh(campaign)
    return campaign

@router.get("/rewards", response_model=List[CampaignResponse])
async def list_merchant_rewards(
    user: User = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    if not user.merchant_profile:
        raise HTTPException(403, "An instructor profile is required.")
    stmt = select(RewardCampaign).where(
        RewardCampaign.merchant_id == user.merchant_profile.id
    ).order_by(desc(RewardCampaign.created_at))
    result = await db.execute(stmt)
    return result.scalars().all()

@router.patch("/rewards/{campaign_id}", response_model=CampaignResponse)
async def update_reward_campaign(
    campaign_id: str,
    req: CampaignUpdate,
    user: User = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    if not user.merchant_profile:
        raise HTTPException(403, "An instructor profile is required.")
    stmt = select(RewardCampaign).where(
        RewardCampaign.id == campaign_id,
        RewardCampaign.merchant_id == user.merchant_profile.id
    ).with_for_update().execution_options(populate_existing=True)
    campaign = (await db.execute(stmt)).scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found or unauthorized.")
        
    if req.total_budget_cents is not None:
        spent = campaign.total_budget_cents - campaign.remaining_budget_cents
        if req.total_budget_cents < spent:
            raise HTTPException(422, "The budget cannot be less than the amount already redeemed.")
        campaign.total_budget_cents = req.total_budget_cents
        campaign.remaining_budget_cents = req.total_budget_cents - spent
    if req.name is not None:
        campaign.name = req.name
    if req.discount_amount_cents is not None:
        campaign.discount_amount_cents = req.discount_amount_cents
    if req.discount_percentage is not None:
        campaign.discount_percentage = req.discount_percentage
    if req.is_active is not None:
        campaign.is_active = req.is_active
        
    await db.commit()
    await db.refresh(campaign)
    return campaign



@router.post("/workshops/{workshop_id}/alternate-sessions", status_code=201)
async def create_alternate_session(
    workshop_id: str,
    payload: AlternateSessionCreate,
    user: User = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db),
):
    if not user.merchant_profile:
        raise HTTPException(403, "An instructor profile is required.")
    workshop = await db.scalar(select(Workshop).where(
        Workshop.id == workshop_id, Workshop.merchant_id == user.merchant_profile.id,
    ).with_for_update())
    if not workshop:
        raise HTTPException(404, "Workshop not found.")
    scheduled_at = payload.scheduled_at.astimezone(timezone.utc)
    main_date = workshop.scheduled_at
    if main_date.tzinfo is None:
        main_date = main_date.replace(tzinfo=timezone.utc)
    if scheduled_at <= datetime.now(timezone.utc) or scheduled_at == main_date:
        raise HTTPException(422, "Choose a future date different from the main workshop session.")
    existing = await db.scalar(select(WorkshopSession).where(
        WorkshopSession.workshop_id == workshop.id, WorkshopSession.session_date == scheduled_at,
    ))
    if existing:
        raise HTTPException(409, "This session already exists.")
    session = WorkshopSession(id=str(uuid.uuid4()), workshop_id=workshop.id, session_date=scheduled_at, status="scheduled")
    db.add(session)
    await db.commit()
    return {"id": session.id, "scheduled_at": scheduled_at}


@router.patch("/reservations/{reservation_id}/reschedule")
async def decide_reschedule(
    reservation_id: str,
    payload: RescheduleDecision,
    user: User = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db),
):
    if not user.merchant_profile:
        raise HTTPException(403, "An instructor profile is required.")
    reservation = await db.scalar(select(Reservation).join(Workshop).where(
        Reservation.id == reservation_id, Workshop.merchant_id == user.merchant_profile.id,
    ).with_for_update(of=Reservation))
    if not reservation:
        raise HTTPException(404, "Reservation not found.")
    change = await db.get(ReservationReschedule, reservation.id)
    if not change or change.status != "requested":
        raise HTTPException(409, "There is no pending reschedule request.")
    if payload.decision == "approved":
        session = await db.scalar(select(WorkshopSession).where(
            WorkshopSession.id == change.requested_session_id,
            WorkshopSession.workshop_id == reservation.workshop_id,
            WorkshopSession.status == "scheduled",
            WorkshopSession.session_date > datetime.now(timezone.utc),
        ))
        if not session or reservation.status != "confirmed":
            raise HTTPException(409, "The reservation or alternate session is no longer eligible.")
        change.approved_session_id = session.id
    change.status = payload.decision
    db.add(Notification(
        user_id=reservation.user_id,
        title=f"Reschedule request {change.status}",
        message=f"Your instructor {change.status} your workshop reschedule request.",
        link="/app/reservations",
    ))
    db.add(AuditLog(
        user_id=user.id, action=f"RESCHEDULE_{change.status.upper()}", resource_type="Reservation",
        resource_id=reservation.id, details={"session_id": change.requested_session_id},
    ))
    await db.commit()
    return {"status": change.status}
