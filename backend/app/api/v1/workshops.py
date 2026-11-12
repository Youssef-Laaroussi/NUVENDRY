from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, delete
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.entities import Workshop, MerchantProfile, Reservation, DigitalGift, User, WorkshopBookmark, WorkshopDetails
from app.schemas.workshop import WorkshopResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/workshops", tags=["Public Workshops Marketplace"])

@router.get("/{workshop_id}/image")
async def workshop_image(workshop_id: str, db: AsyncSession = Depends(get_db)):
    row = (await db.execute(
        select(WorkshopDetails.image_type, WorkshopDetails.image_bytes)
        .join(Workshop, Workshop.id == WorkshopDetails.workshop_id)
        .where(Workshop.id == workshop_id, Workshop.is_published.is_(True))
    )).one_or_none()
    if not row or not row.image_type:
        raise HTTPException(404, "Workshop image not found.")
    return Response(row.image_bytes, media_type=row.image_type, headers={"X-Content-Type-Options": "nosniff"})


@router.get("", response_model=List[WorkshopResponse])
async def list_workshops(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Workshop)
        .options(selectinload(Workshop.merchant).selectinload(MerchantProfile.user))
        .where(Workshop.is_published == True)
        .order_by(desc(Workshop.scheduled_at))
    )
    
    if category:
        stmt = stmt.where(Workshop.category.ilike(f"%{category}%"))
    if difficulty:
        stmt = stmt.where(Workshop.difficulty.ilike(f"%{difficulty}%"))
    if search:
        stmt = stmt.where(
            (Workshop.title.ilike(f"%{search}%")) | (Workshop.description.ilike(f"%{search}%"))
        )
        
    result = await db.execute(stmt)
    workshops = result.scalars().all()
    
    responses = []
    for w in workshops:
        merchant_name = w.merchant.business_name if w.merchant else "Verified Instructor"
        resp = WorkshopResponse(
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
            instructor_name=w.merchant.user.full_name if w.merchant and w.merchant.user else None,
            merchant_name=merchant_name
        )
        responses.append(resp)
        
    return responses

@router.get("/bookmarks")
async def list_bookmarks(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    workshops = await db.scalars(
        select(Workshop).join(WorkshopBookmark, WorkshopBookmark.workshop_id == Workshop.id)
        .where(WorkshopBookmark.user_id == user.id, Workshop.is_published.is_(True))
        .order_by(WorkshopBookmark.created_at.desc())
    )
    return [
        {"id": workshop.id, "title": workshop.title, "category": workshop.category, "duration_hours": workshop.duration_hours}
        for workshop in workshops
    ]


@router.put("/{workshop_id}/bookmark", status_code=204)
async def save_bookmark(workshop_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await db.execute(select(User.id).where(User.id == user.id).with_for_update())
    if not await db.scalar(select(Workshop.id).where(Workshop.id == workshop_id, Workshop.is_published.is_(True))):
        raise HTTPException(404, "Published workshop not found.")
    if not await db.get(WorkshopBookmark, (user.id, workshop_id)):
        db.add(WorkshopBookmark(user_id=user.id, workshop_id=workshop_id))
    await db.commit()


@router.delete("/{workshop_id}/bookmark", status_code=204)
async def remove_bookmark(workshop_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await db.execute(select(User.id).where(User.id == user.id).with_for_update())
    await db.execute(delete(WorkshopBookmark).where(
        WorkshopBookmark.user_id == user.id, WorkshopBookmark.workshop_id == workshop_id,
    ))
    await db.commit()


@router.get("/{workshop_id}", response_model=WorkshopResponse)
async def get_workshop(workshop_id: str, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Workshop)
        .options(selectinload(Workshop.merchant).selectinload(MerchantProfile.user))
        .where(Workshop.id == workshop_id, Workshop.is_published == True)
    )
    result = await db.execute(stmt)
    w = result.scalar_one_or_none()
    if not w:
        raise HTTPException(status_code=404, detail="Workshop not found.")
        
    merchant_name = w.merchant.business_name if w.merchant else "Verified Instructor"
    return WorkshopResponse(
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
        instructor_name=w.merchant.user.full_name if w.merchant and w.merchant.user else None,
        merchant_name=merchant_name
    )

@router.get("/{workshop_id}/materials")
async def get_workshop_materials(
    workshop_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Workshop)
        .options(selectinload(Workshop.merchant))
        .where(Workshop.id == workshop_id)
    )
    w = (await db.execute(stmt)).scalar_one_or_none()
    if not w:
        raise HTTPException(status_code=404, detail="Workshop not found.")

    res_stmt = select(Reservation).where(
        Reservation.workshop_id == workshop_id,
        Reservation.user_id == user.id,
        Reservation.status == "confirmed"
    )
    confirmed_res = (await db.execute(res_stmt)).scalars().first()
    gift_stmt = select(DigitalGift).where(
        DigitalGift.user_id == user.id,
        DigitalGift.download_url.like(f"%{workshop_id}%")
    )
    gift = (await db.execute(gift_stmt)).scalars().first()

    if not confirmed_res and not gift and user.role != "admin":
        raise HTTPException(status_code=403, detail="Materials require a confirmed workshop reservation.")

    return {
        "workshop_id": w.id,
        "workshop_title": w.title,
        "instructor": w.merchant.business_name if w.merchant else "Verified Instructor",
        "access_code": gift.access_code if gift else f"NV-KIT-{w.id[:8].upper()}",
        "deliverables": [
            f"Starter repository & environment setup for {w.title}",
            "Architecture diagrams, prompt templates & evaluation harness",
            "Live lab instructions and dataset configuration",
            "Post-session reference implementation & checklist"
        ]
    }


