import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.models.entities import User, LearningDemand, AuditLog
from app.schemas.demand import DemandCreate, DemandUpdate, DemandResponse
from app.ai.extractor import extractor
from app.api.deps import get_current_user

router = APIRouter(prefix="/demands", tags=["Demand Management"])

@router.post("", response_model=DemandResponse, status_code=status.HTTP_201_CREATED)
async def create_demand(
    req: DemandCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 1. AI Extraction of raw prompt if fields not manually provided
    extracted = extractor.extract(req.raw_prompt)
    
    topic = req.topic or extracted.topic
    related_skills = req.related_skills or extracted.related_skills
    objective = req.objective or extracted.objective
    diff = req.preferred_difficulty or extracted.preferred_difficulty
    dur = req.preferred_duration_hours or extracted.preferred_duration_hours
    lang = req.language or extracted.language
    budget = req.max_budget_cents or extracted.max_budget_cents
    curr = req.currency or extracted.currency
    sched = req.preferred_schedule or extracted.preferred_schedule
    form = req.delivery_format or extracted.delivery_format
    conf = extracted.confidence_score
    
    demand = LearningDemand(
        id=str(uuid.uuid4()),
        user_id=user.id,
        raw_prompt=req.raw_prompt,
        topic=topic,
        related_skills=related_skills,
        objective=objective,
        preferred_difficulty=diff,
        preferred_duration_hours=dur,
        language=lang,
        max_budget_cents=budget,
        currency=curr,
        preferred_schedule=sched,
        delivery_format=form,
        confidence_score=conf,
        status="pending"
    )
    db.add(demand)
    
    # Audit
    db.add(AuditLog(
        user_id=user.id,
        action="DEMAND_SUBMITTED",
        resource_type="LearningDemand",
        resource_id=demand.id,
        details={"topic": topic, "budget_cents": budget}
    ))
    
    await db.commit()
    await db.refresh(demand)
    return demand

@router.get("", response_model=List[DemandResponse])
async def list_demands(
    mine_only: bool = Query(False, description="Filter to current user demands"),
    topic: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(LearningDemand).order_by(desc(LearningDemand.created_at))
    if mine_only or user.role == "learner":
        stmt = stmt.where(LearningDemand.user_id == user.id)
    if topic:
        stmt = stmt.where(LearningDemand.topic.ilike(f"%{topic}%"))
        
    result = await db.execute(stmt)
    demands = result.scalars().all()
    return demands

@router.get("/{demand_id}", response_model=DemandResponse)
async def get_demand(
    demand_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(LearningDemand).where(LearningDemand.id == demand_id)
    result = await db.execute(stmt)
    demand = result.scalar_one_or_none()
    if not demand or (user.role == "learner" and demand.user_id != user.id):
        raise HTTPException(status_code=404, detail="Demand not found.")
    return demand

@router.patch("/{demand_id}", response_model=DemandResponse)
async def update_demand(
    demand_id: str,
    req: DemandUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(LearningDemand).where(LearningDemand.id == demand_id, LearningDemand.user_id == user.id)
    result = await db.execute(stmt)
    demand = result.scalar_one_or_none()
    if not demand:
        raise HTTPException(status_code=404, detail="Demand not found or unauthorized.")
        
    if req.topic is not None:
        demand.topic = req.topic
    if req.related_skills is not None:
        demand.related_skills = req.related_skills
    if req.objective is not None:
        demand.objective = req.objective
    if req.preferred_difficulty is not None:
        demand.preferred_difficulty = req.preferred_difficulty
    if req.preferred_duration_hours is not None:
        demand.preferred_duration_hours = req.preferred_duration_hours
    if req.max_budget_cents is not None:
        demand.max_budget_cents = req.max_budget_cents
    if req.preferred_schedule is not None:
        demand.preferred_schedule = req.preferred_schedule
    if req.delivery_format is not None:
        demand.delivery_format = req.delivery_format
        
    await db.commit()
    await db.refresh(demand)
    return demand

@router.delete("/{demand_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_demand(
    demand_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(LearningDemand).where(LearningDemand.id == demand_id, LearningDemand.user_id == user.id)
    result = await db.execute(stmt)
    demand = result.scalar_one_or_none()
    if not demand:
        raise HTTPException(status_code=404, detail="Demand not found or unauthorized.")
    await db.delete(demand)
    await db.commit()
    return None

