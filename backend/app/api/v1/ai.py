from datetime import datetime, timezone
from pydantic import BaseModel, Field, field_validator
from app.ai.advisor import advise
import uuid
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, select, desc, update
from app.core.database import get_db
from app.models.entities import User, LearningDemand, DemandCluster, ClusterMembership, OfferProposal, Workshop, AuditLog, AdvisorTurn, MerchantProfile
from app.schemas.demand import ExtractionResult, ClusterResponse
from app.schemas.workshop import OfferProposalCreate, OfferProposalResponse
from app.ai.extractor import extractor
from app.ai.matcher import matcher
from app.ai.offer_agent import offer_agent
from app.ai.recommender import recommender
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
    stmt = select(LearningDemand).where(LearningDemand.status != "offered").order_by(LearningDemand.id).with_for_update()
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
            "preferred_duration_hours": d.preferred_duration_hours,
            "preferred_schedule": d.preferred_schedule,
            "delivery_format": d.delivery_format,
            "objective": d.objective,
            "currency": d.currency
        }
        for d in demands
    ]
    
    computed_clusters = matcher.cluster_demands_proposed(demand_dicts)
    cluster_responses = []
    
    await db.execute(update(DemandCluster).where(DemandCluster.status == "active").values(status="archived"))
    for demand in demands:
        demand.status = "clustered"
    for c_data in computed_clusters:
        cluster_id = str(uuid.uuid5(uuid.NAMESPACE_URL, "nuvendry-cluster:" + ":".join(sorted(d['id'] for d in c_data['demands']))))
        existing = await db.get(DemandCluster, cluster_id)
        if existing:
            existing.status = "active"
            existing.avg_budget_cents = c_data['avg_budget_cents']
            existing.summary = c_data['summary']
            existing.difficulty = c_data['difficulty']
            cluster_responses.append(existing)
            continue
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
        await db.flush()
        
        for m in c_data["demands"]:
            membership = ClusterMembership(
                id=str(uuid.uuid4()),
                cluster_id=cluster_id,
                demand_id=m["id"],
                similarity_score=float(matcher.compute_tfidf_similarity([c_data["demands"][0]["raw_prompt"], m["raw_prompt"]])[0,1])
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
    stmt = select(DemandCluster).where(DemandCluster.status != "archived").order_by(desc(DemandCluster.created_at))
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
        
    members = (await db.execute(select(LearningDemand).join(ClusterMembership,
        ClusterMembership.demand_id == LearningDemand.id).where(ClusterMembership.cluster_id == cluster.id))).scalars().all()
    if not members:
        raise HTTPException(409, "This cluster has no learner evidence. Run demand matching first.")
    proposal_data = await offer_agent.generate({
        "id": cluster.id,
        "topic": cluster.topic,
        "member_count": cluster.member_count,
        "avg_budget_cents": cluster.avg_budget_cents,
        "difficulty": cluster.difficulty,
        "currency": cluster.currency,
        "demands": [{k:getattr(d,k) for k in ('raw_prompt','topic','related_skills','objective','max_budget_cents',
            'preferred_duration_hours','preferred_schedule','preferred_difficulty','language','delivery_format')} for d in members]
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

def available_workshops():
    return select(Workshop).where(
        Workshop.is_published.is_(True),
        Workshop.remaining_seats > 0,
        Workshop.scheduled_at > datetime.now(timezone.utc),
    )


@router.get("/recommendations")
async def get_personalized_recommendations(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy.orm import selectinload
    d_stmt = select(LearningDemand).where(LearningDemand.user_id == user.id).order_by(desc(LearningDemand.created_at))
    demands = (await db.execute(d_stmt)).scalars().all()

    w_stmt = (
        available_workshops()
        .options(selectinload(Workshop.merchant).selectinload(MerchantProfile.user))
        .order_by(desc(Workshop.scheduled_at))
    )
    workshops = (await db.execute(w_stmt)).scalars().all()

    demand_dicts = []
    for demand in demands:
        # Older requests may have been saved with the generic extraction topic.
        legacy = extractor.extract(demand.raw_prompt) if demand.topic == "AI Engineering" and not demand.related_skills else None
        delivery_format = demand.delivery_format
        if legacy and delivery_format == "hands_on_lab":
            delivery_format = legacy.delivery_format

        demand_dicts.append({
            "id": demand.id,
            "topic": legacy.topic if legacy else demand.topic,
            "related_skills": legacy.related_skills if legacy else (demand.related_skills or []),
            "max_budget_cents": demand.max_budget_cents,
            "preferred_difficulty": demand.preferred_difficulty,
            "preferred_schedule": demand.preferred_schedule,
            "currency": demand.currency,
            "language": demand.language,
            "delivery_format": delivery_format,
        })

    interests = tuple(user.profile.skills_interested or ()) if user.profile else ()
    scored = []
    for w in workshops:
        rec = recommender.score_workshop(demand_dicts, {
            "id": w.id,
            "title": w.title,
            "description": w.description,
            "category": w.category,
            "difficulty": w.difficulty,
            "language": w.language,
            "delivery_format": w.delivery_format,
            "price_cents": w.price_cents,
            "currency": w.currency,
            "scheduled_at": w.scheduled_at,
        }, interests)
        if not rec["match_score"]:
            continue

        scored.append({
            "workshop": {
                "id": w.id,
                "merchant_id": w.merchant_id,
                "offer_id": w.offer_id,
                "title": w.title,
                "description": w.description,
                "category": w.category,
                "difficulty": w.difficulty,
                "language": w.language,
                "delivery_format": w.delivery_format,
                "image_url": w.image_url,
                "duration_hours": w.duration_hours,
                "price_cents": w.price_cents,
                "currency": w.currency,
                "total_seats": w.total_seats,
                "remaining_seats": w.remaining_seats,
                "scheduled_at": w.scheduled_at,
                "is_published": w.is_published,
                "created_at": w.created_at,
                "merchant_name": w.merchant.user.full_name if w.merchant and w.merchant.user else None,
            },
            "alignment_percentage": round(rec["match_score"] * 100),
            "reasons": rec["reasons"],
            "matched_demand_id": rec["matched_demand_id"],
            "unresolved_constraints": rec["unresolved_constraints"],
            "based_on_demands": len(demand_dicts),
        })

    scored.sort(key=lambda item: item["alignment_percentage"], reverse=True)
    return scored




class AdvisorQuestion(BaseModel):
    question: str = Field(min_length=1, max_length=1200)

    @field_validator("question")
    @classmethod
    def trim_question(cls, value):
        if not value.strip():
            raise ValueError("Enter a question.")
        return value.strip()


def advisor_turn_response(turn):
    return {
        "id": turn.id, "question": turn.question, "answer": turn.answer,
        "sources": turn.sources, "mode": turn.mode,
    }


async def advisor_history(db, user_id, limit=20):
    turns = await db.scalars(
        select(AdvisorTurn).where(AdvisorTurn.user_id == user_id)
        .order_by(AdvisorTurn.created_at.desc(), AdvisorTurn.id.desc()).limit(limit)
    )
    return list(reversed(turns.all()))


@router.get("/advisor")
async def get_advisor_history(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return [advisor_turn_response(turn) for turn in await advisor_history(db, user.id)]


@router.delete("/advisor", status_code=204)
async def reset_advisor_history(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await db.execute(delete(AdvisorTurn).where(AdvisorTurn.user_id == user.id))
    await db.commit()


@router.post("/advisor", status_code=201)
async def ask_advisor(
    payload: AdvisorQuestion, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db),
):
    previous = await advisor_history(db, user.id, limit=4)
    workshops = (await db.scalars(
        select(Workshop).where(Workshop.is_published.is_(True)).order_by(Workshop.scheduled_at)
    )).all()
    interests = user.profile.skills_interested or [] if user.profile else []
    answer, sources, mode = await advise(
        payload.question, previous, workshops, interests, ground_catalog=True,
    )
    turn = AdvisorTurn(user_id=user.id, question=payload.question, answer=answer, sources=sources, mode=mode)
    db.add(turn)
    await db.commit()
    return advisor_turn_response(turn)
