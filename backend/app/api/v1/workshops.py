from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.entities import Workshop, MerchantProfile
from app.schemas.workshop import WorkshopResponse

router = APIRouter(prefix="/workshops", tags=["Public Workshops Marketplace"])

@router.get("", response_model=List[WorkshopResponse])
async def list_workshops(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Workshop)
        .options(selectinload(Workshop.merchant))
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
            merchant_name=merchant_name
        )
        responses.append(resp)
        
    return responses

@router.get("/{workshop_id}", response_model=WorkshopResponse)
async def get_workshop(workshop_id: str, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Workshop)
        .options(selectinload(Workshop.merchant))
        .where(Workshop.id == workshop_id)
    )
    result = await db.execute(stmt)
    w = result.scalar_one_or_none()
    if not w:
        raise HTTPException(status_code=404, detail="Workshop not found.")
        
    merchant_name = w.merchant.business_name if w.merchant else "Verified Instructor"
    return WorkshopResponse(
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
        merchant_name=merchant_name
    )

