import asyncio
import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.entities import (
    User, UserProfile, MerchantProfile, LearningDemand, 
    DemandCluster, ClusterMembership, OfferProposal,
    Workshop, WorkshopSession, RewardCampaign, StoreCredit, ResearchExperiment
)
from app.ai.evaluator import evaluator

async def seed():
    print("🌱 Initializing Database Schema...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as db:
        if await db.scalar(select(User.id).limit(1)) is not None:
            print("Database already initialized. Skipping demo seed.")
            return
        now = datetime.now(timezone.utc)
        
        # 1. Admin User
        admin_id = str(uuid.uuid4())
        admin = User(
            id=admin_id,
            email="admin@nuvendry.com",
            hashed_password=get_password_hash("Admin2026!"),
            full_name="Platform Administrator",
            role="admin",
            referral_code="NV-ADMIN"
        )
        db.add(admin)
        db.add(UserProfile(user_id=admin_id, bio="NUVENDRY Platform Operations", skills_interested=[]))
        
        # 2. Instructors
        instructor_id = str(uuid.uuid4())
        instructor = User(
            id=instructor_id,
            email="elena.ai@nuvendry.com",
            hashed_password=get_password_hash("Instructor2026!"),
            full_name="Dr. Elena Rostova",
            role="instructor",
            referral_code="NV-ELENA"
        )
        db.add(instructor)
        db.add(UserProfile(user_id=instructor_id, bio="Staff AI Researcher & Multi-Agent Systems Architect", skills_interested=["LangGraph", "MLOps"]))
        
        merchant_profile_id = str(uuid.uuid4())
        merchant = MerchantProfile(
            id=merchant_profile_id,
            user_id=instructor_id,
            business_name="Autonomous Systems Academy",
            description="Specialized high-impact interactive engineering sessions on production LLMs and distributed multi-agent workflows.",
            paypal_receiver_email="elena.ai@nuvendry.com",
            rating=4.98
        )
        db.add(merchant)
        
        # 3. Learners
        learner1_id = str(uuid.uuid4())
        learner1 = User(
            id=learner1_id,
            email="learner.sophia@example.com",
            hashed_password=get_password_hash("Learner2026!"),
            full_name="Sophia Chen",
            role="learner",
            referral_code="NV-SOPHIA"
        )
        db.add(learner1)
        db.add(UserProfile(user_id=learner1_id, bio="Senior Software Engineer transitioning to AI Engineering", skills_interested=["LangGraph", "FastAPI"]))
        db.add(StoreCredit(user_id=learner1_id, balance_cents=2000, currency="USD"))  # $20 store credit
        
        learner2_id = str(uuid.uuid4())
        learner2 = User(
            id=learner2_id,
            email="learner.marcus@example.com",
            hashed_password=get_password_hash("Learner2026!"),
            full_name="Marcus Vance",
            role="learner",
            referral_code="NV-MARCUS"
        )
        db.add(learner2)
        db.add(UserProfile(user_id=learner2_id, bio="Data Engineer eager to build streaming agent pipelines", skills_interested=["Kafka", "LangGraph"]))
        db.add(StoreCredit(user_id=learner2_id, balance_cents=0, currency="USD"))
        
        # 4. Realistic Learner Demands
        d1_id = str(uuid.uuid4())
        d1 = LearningDemand(
            id=d1_id,
            user_id=learner1_id,
            raw_prompt="I want to learn LangGraph with real projects and human-in-the-loop workflows for under $40 this weekend in English.",
            topic="LangGraph Agents",
            related_skills=["LangGraph", "StateGraph", "Human-in-the-Loop", "Multi-Agent"],
            objective="Build resilient multi-agent supervisors with persistent state checkpoints.",
            preferred_difficulty="intermediate",
            preferred_duration_hours=2,
            language="English",
            max_budget_cents=4000,
            currency="USD",
            preferred_schedule="Weekend",
            delivery_format="live_interactive",
            confidence_score=0.940,
            status="clustered"
        )
        
        d2_id = str(uuid.uuid4())
        d2 = LearningDemand(
            id=d2_id,
            user_id=learner2_id,
            raw_prompt="Need a practical AI agents workshop this Saturday covering LangGraph error recovery and streaming tokens, budget $45.",
            topic="LangGraph Agents",
            related_skills=["LangGraph", "Streaming", "Error Recovery"],
            objective="Implement robust streaming responses and retry policies in production agents.",
            preferred_difficulty="intermediate",
            preferred_duration_hours=2,
            language="English",
            max_budget_cents=4500,
            currency="USD",
            preferred_schedule="Weekend",
            delivery_format="live_interactive",
            confidence_score=0.910,
            status="clustered"
        )
        
        d3_id = str(uuid.uuid4())
        d3 = LearningDemand(
            id=d3_id,
            user_id=learner1_id,
            raw_prompt="Looking for an MLOps deep dive: model registry, evaluation gates, and FastAPI deployment for under $60.",
            topic="Production MLOps",
            related_skills=["MLflow", "FastAPI", "Model Serving", "CI/CD"],
            objective="Automate continuous training and zero-downtime canary deployments.",
            preferred_difficulty="advanced",
            preferred_duration_hours=3,
            language="English",
            max_budget_cents=6000,
            currency="USD",
            preferred_schedule="Weekend",
            delivery_format="live_interactive",
            confidence_score=0.920,
            status="pending"
        )
        db.add_all([d1, d2, d3])
        
        # 5. Demand Cluster
        cluster_id = str(uuid.uuid4())
        cluster = DemandCluster(
            id=cluster_id,
            name="Opportunity: Production LangGraph Agents & Memory Systems",
            topic="LangGraph Agents",
            summary="Aggregated 2 learner requests demanding hands-on implementation of LangGraph multi-agent supervisors with streaming and persistence.",
            member_count=2,
            avg_budget_cents=4250,
            currency="USD",
            difficulty="intermediate",
            status="offer_generated"
        )
        db.add(cluster)
        
        db.add(ClusterMembership(id=str(uuid.uuid4()), cluster_id=cluster_id, demand_id=d1_id, similarity_score=0.930))
        db.add(ClusterMembership(id=str(uuid.uuid4()), cluster_id=cluster_id, demand_id=d2_id, similarity_score=0.890))
        
        # 6. Offer Proposal
        offer_id = str(uuid.uuid4())
        offer = OfferProposal(
            id=offer_id,
            cluster_id=cluster_id,
            merchant_id=merchant_profile_id,
            suggested_title="Building Production-Ready LangGraph Agents with Resilient State",
            skills_covered=["LangGraph StateGraph", "Human-in-the-loop Tool Inspection", "Checkpointers", "PayPal Order Integration"],
            learning_outcomes=[
                "Architect a multi-agent supervisor with isolated state boundaries",
                "Implement persistent checkpointing with PostgreSQL",
                "Stream tokens and tool invocation events in real time",
                "Deploy and secure the agent using FastAPI and containerized runners"
            ],
            session_outline=[
                "00:00 - 00:25 | Architecture: StateGraph vs Cyclical Routing",
                "00:25 - 01:10 | Hands-on Lab: Multi-Agent Supervisor Implementation",
                "01:10 - 01:40 | State Persistence, Memory & Tool Fallbacks",
                "01:40 - 02:00 | Live Deployment, PayPal Sandbox Checkout Flow & Q&A"
            ],
            suggested_duration_hours=2,
            suggested_level="intermediate",
            suggested_price_cents=1200,  # $12.00
            currency="USD",
            evidence_summary="Demand derived from 2 validated learner requests with $42.50 average target budget.",
            constraints_summary="English language delivery, interactive code repository provided.",
            status="approved"
        )
        db.add(offer)
        
        # 7. Published Workshops
        ws1_id = str(uuid.uuid4())
        ws1 = Workshop(
            id=ws1_id,
            merchant_id=merchant_profile_id,
            offer_id=offer_id,
            title="Building Production-Ready LangGraph Agents",
            description="Design, build, and deploy multi-step AI agents with LangGraph, tool use, memory, and real-world production patterns.",
            category="LangGraph Agents",
            difficulty="Intermediate",
            duration_hours=2,
            price_cents=1200,
            currency="USD",
            total_seats=25,
            remaining_seats=23,
            scheduled_at=now + timedelta(days=4, hours=3),
            is_published=True
        )
        
        ws2_id = str(uuid.uuid4())
        ws2 = Workshop(
            id=ws2_id,
            merchant_id=merchant_profile_id,
            offer_id=None,
            title="Production MLOps: Serving, Monitoring & Automated Retraining",
            description="Deploy, monitor, and automatically retrain ML models in production with FastAPI, observability, and data pipelines.",
            category="MLOps",
            difficulty="Advanced",
            duration_hours=3,
            price_cents=1500,
            currency="USD",
            total_seats=20,
            remaining_seats=18,
            scheduled_at=now + timedelta(days=11, hours=4),
            is_published=True
        )
        
        ws3_id = str(uuid.uuid4())
        ws3 = Workshop(
            id=ws3_id,
            merchant_id=merchant_profile_id,
            offer_id=None,
            title="Full-Stack AI Apps with React, FastAPI & PayPal Checkout",
            description="Build a complete AI web app with React, FastAPI, and a secure PayPal Sandbox checkout, from end to end.",
            category="React + FastAPI",
            difficulty="Beginner-Intermediate",
            duration_hours=2,
            price_cents=1000,
            currency="USD",
            total_seats=30,
            remaining_seats=29,
            scheduled_at=now + timedelta(days=7, hours=2),
            is_published=True
        )
        db.add_all([ws1, ws2, ws3])
        
        # 8. Merchant Reward Campaigns
        camp1 = RewardCampaign(
            id=str(uuid.uuid4()),
            merchant_id=merchant_profile_id,
            name="First-Timer Welcome Discount ($2 Off)",
            campaign_type="welcome",
            discount_amount_cents=200,
            min_spend_cents=1200,
            total_budget_cents=50000,
            remaining_budget_cents=48000,
            max_per_user=1,
            is_active=True
        )
        
        camp2 = RewardCampaign(
            id=str(uuid.uuid4()),
            merchant_id=merchant_profile_id,
            name="Early Bird Booking ($2 Off 3+ Days in Advance)",
            campaign_type="early_bird",
            discount_amount_cents=200,
            min_spend_cents=1200,
            total_budget_cents=75000,
            remaining_budget_cents=72000,
            max_per_user=1,
            is_active=True
        )
        db.add_all([camp1, camp2])
        
        # 9. Pre-populate initial research experiment
        bench_data = evaluator.generate_synthetic_benchmark_dataset(size=50)
        res_a = evaluator.evaluate_baseline_a(bench_data)
        res_p = evaluator.evaluate_proposed_system(bench_data)
        
        db.add(ResearchExperiment(
            id=str(uuid.uuid4()),
            experiment_name=res_a["experiment_name"],
            baseline_name=res_a["baseline_name"],
            dataset_size=res_a["dataset_size"],
            metric_purity=res_a["metric_purity"],
            metric_ari=res_a["metric_ari"],
            metric_constraint_violation_rate=res_a["metric_constraint_violation_rate"],
            latency_ms=res_a["latency_ms"],
            status="completed",
            details=res_a["details"]
        ))
        db.add(ResearchExperiment(
            id=str(uuid.uuid4()),
            experiment_name=res_p["experiment_name"],
            baseline_name=res_p["baseline_name"],
            dataset_size=res_p["dataset_size"],
            metric_purity=res_p["metric_purity"],
            metric_ari=res_p["metric_ari"],
            metric_constraint_violation_rate=res_p["metric_constraint_violation_rate"],
            latency_ms=res_p["latency_ms"],
            status="completed",
            details=res_p["details"]
        ))
        
        await db.commit()
        print("✅ Demo Database Seeded Successfully with Real PostgreSQL Records!")

if __name__ == "__main__":
    asyncio.run(seed())

