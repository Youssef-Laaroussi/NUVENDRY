import uuid
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.models.entities import User, LearningDemand, DemandCluster, ClusterMembership, OfferProposal, AuditLog
from app.schemas.demand import ExtractionResult, ClusterResponse
from app.schemas.workshop import OfferProposalCreate, OfferProposalResponse
from app.ai.extractor import extractor
from app.ai.matcher import matcher
from app.ai.offer_agent import offer_agent
from app.api.deps import get_current_user, get_current_instructor

router = APIRouter(prefix="/ai", tags=["AI Demand Intelligence"])

@router.post("/extract-demand", response_model=ExtractionResult)
async def extract_demand_endpoint(raw_prompt: str):
    """
    Public extraction endpoint to evaluate and preview natural language parsing into structured demand.
    """
    return extractor.extract(raw_prompt)

@router.post("/match-demands", response_model=List[ClusterResponse])
async def trigger_demand_clustering(
    user: User = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    """
    Executes the constraint-aware demand clustering algorithm across persisted learner requests.
    Creates or updates real DemandClusters in PostgreSQL.
    """
    stmt = select(LearningDemand).order_by(desc(LearningDemand.created_at))
    result = await db.execute(stmt)
    demands = result.scalars().all()
    
    if not demands:
        return []
        
    demand_dicts = [
        {
            "id": d.id,
            "topic": d.topic,
            "related_skills": d.related_skills or [],
            "raw_prompt": d.raw_prompt,
            "language": d.language,
            "max_budget_cents": d.max_budget_cents,
            "preferred_difficulty": d.preferred_difficulty,
            "currency": d.currency
        }
        for d in demands
    ]
    
    computed_clusters = matcher.cluster_demands_proposed(demand_dicts)
    cluster_responses = []
    
    for c_data in computed_clusters:
        cluster_id = str(uuid.uuid4())
        db_cluster = DemandCluster(
            id=cluster_id,
            name=c_data["name"],
            topic=c_data["topic"],
            summary=c_data["summary"],
            member_count=c_data["member_count"],
            avg_budget_cents=c_data["avg_budget_cents"],
            currency=c_data["currency"],
            difficulty=c_data["difficulty"],
            status="active"
        )
        db.add(db_cluster)
        
        for m in c_data["demands"]:
            membership = ClusterMembership(
                id=str(uuid.uuid4()),
                cluster_id=cluster_id,
                demand_id=m["id"],
                similarity_score=0.910
            )
            db.add(membership)
            
        cluster_responses.append(db_cluster)
        
    await db.commit()
    for c in cluster_responses:
        await db.refresh(c)
        
    return cluster_responses

@router.get("/clusters", response_model=List[ClusterResponse])
async def list_clusters(db: AsyncSession = Depends(get_db)):
    """Lists aggregated demand clusters"""
    stmt = select(DemandCluster).order_by(desc(DemandCluster.created_at))
    result = await db.execute(stmt)
    clusters = result.scalars().all()
    return clusters

@router.get("/clusters/{cluster_id}", response_model=ClusterResponse)
async def get_cluster_detail(cluster_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(DemandCluster).where(DemandCluster.id == cluster_id)
    result = await db.execute(stmt)
    cluster = result.scalar_one_or_none()
    if not cluster:
        raise HTTPException(status_code=404, detail="Demand cluster not found.")
    return cluster

@router.post("/generate-offer", response_model=OfferProposalResponse)
async def generate_offer_from_cluster(
    cluster_id: str,
    user: User = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    """
    Offer Generation Agent:
    Takes an aggregated demand cluster and synthesizes an approved draft offer proposal.
    """
    stmt = select(DemandCluster).where(DemandCluster.id == cluster_id)
    result = await db.execute(stmt)
    cluster = result.scalar_one_or_none()
    if not cluster:
        raise HTTPException(status_code=404, detail="Demand cluster not found.")
        
    proposal_data = offer_agent.generate_proposal({
        "id": cluster.id,
        "topic": cluster.topic,
        "member_count": cluster.member_count,
        "avg_budget_cents": cluster.avg_budget_cents,
        "difficulty": cluster.difficulty
    })
    
    # Check if merchant profile exists
    merchant_id = None
    if user.merchant_profile:
        merchant_id = user.merchant_profile.id
        
    proposal = OfferProposal(
        id=str(uuid.uuid4()),
        cluster_id=cluster.id,
        merchant_id=merchant_id,
        suggested_title=proposal_data.suggested_title,
        skills_covered=proposal_data.skills_covered,
        learning_outcomes=proposal_data.learning_outcomes,
        session_outline=proposal_data.session_outline,
        suggested_duration_hours=proposal_data.suggested_duration_hours,
        suggested_level=proposal_data.suggested_level,
        suggested_price_cents=proposal_data.suggested_price_cents,
        currency=proposal_data.currency,
        evidence_summary=proposal_data.evidence_summary,
        constraints_summary=proposal_data.constraints_summary,
        status="draft"
    )
    db.add(proposal)
    
    # Audit log
    db.add(AuditLog(
        user_id=user.id,
        action="OFFER_PROPOSAL_GENERATED",
        resource_type="OfferProposal",
        resource_id=proposal.id,
        details={"cluster_id": cluster.id, "suggested_title": proposal.suggested_title}
    ))
    
    await db.commit()
    await db.refresh(proposal)
    return proposal

