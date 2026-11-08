import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.entities import (
    User, MerchantProfile, Workshop, WorkshopSession, 
    Reservation, AttendanceRecord, RewardCampaign, OfferProposal, AuditLog
)
from app.schemas.workshop import WorkshopCreate, WorkshopUpdate, WorkshopResponse
from app.schemas.reward import CampaignCreate, CampaignUpdate, CampaignResponse
from app.schemas.reservation import ReservationResponse
from app.api.deps import get_current_instructor

router = APIRouter(prefix="/merchant", tags=["Merchant / Instructor Operations"])

@router.post("/workshops", response_model=WorkshopResponse, status_code=status.HTTP_201_CREATED)
async def create_workshop(
    req: WorkshopCreate,
    user: User = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    if not user.merchant_profile:
        raise HTTPException(status_code=400, detail="Merchant profile not configured for this user.")
        
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

@router.get("/reservations")
async def list_merchant_reservations(
    user: User = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
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
    
    return [
        {
            "id": r.id,
            "workshop_id": r.workshop_id,
            "workshop_title": r.workshop.title,
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
    stmt = (
        select(Reservation)
        .join(Workshop, Reservation.workshop_id == Workshop.id)
        .where(
            Reservation.id == reservation_id,
            Workshop.merchant_id == user.merchant_profile.id
        )
    )
    reservation = (await db.execute(stmt)).scalar_one_or_none()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found or unauthorized.")
        
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
    stmt = select(RewardCampaign).where(
        RewardCampaign.id == campaign_id,
        RewardCampaign.merchant_id == user.merchant_profile.id
    )
    campaign = (await db.execute(stmt)).scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found or unauthorized.")
        
    if req.name is not None:
        campaign.name = req.name
    if req.discount_amount_cents is not None:
        campaign.discount_amount_cents = req.discount_amount_cents
    if req.discount_percentage is not None:
        campaign.discount_percentage = req.discount_percentage
    if req.total_budget_cents is not None:
        campaign.total_budget_cents = req.total_budget_cents
    if req.is_active is not None:
        campaign.is_active = req.is_active
        
    await db.commit()
    await db.refresh(campaign)
    return campaign

