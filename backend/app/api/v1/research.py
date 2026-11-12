import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.models.entities import ResearchExperiment, AuditLog
from app.schemas.analytics import ResearchEvaluationRequest, ResearchEvaluationResult
from app.ai.evaluator import evaluator
from app.api.deps import get_current_instructor

router = APIRouter(prefix="/research", tags=["Academic Research Lab"], dependencies=[Depends(get_current_instructor)])

@router.post("/evaluations", response_model=List[ResearchEvaluationResult])
async def execute_evaluation(
    req: ResearchEvaluationRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Executes live academic benchmark comparing:
    - Baseline A: Deterministic TF-IDF keyword clustering
    - Proposed System: NUVENDRY Semantic & Constraint-Aware Aggregation
    Results are calculated dynamically and persisted in PostgreSQL.
    """
    dataset = evaluator.generate_synthetic_benchmark_dataset(size=req.dataset_size)
    runs_to_persist = []
    
    if req.baseline in ("baseline_a", "all"):
        res_a = evaluator.evaluate_baseline_a(dataset)
        exp_a = ResearchExperiment(
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
        )
        db.add(exp_a)
        runs_to_persist.append(exp_a)
        
    if req.baseline in ("proposed", "all"):
        res_prop = evaluator.evaluate_proposed_system(dataset)
        exp_prop = ResearchExperiment(
            id=str(uuid.uuid4()),
            experiment_name=res_prop["experiment_name"],
            baseline_name=res_prop["baseline_name"],
            dataset_size=res_prop["dataset_size"],
            metric_purity=res_prop["metric_purity"],
            metric_ari=res_prop["metric_ari"],
            metric_constraint_violation_rate=res_prop["metric_constraint_violation_rate"],
            latency_ms=res_prop["latency_ms"],
            status="completed",
            details=res_prop["details"]
        )
        db.add(exp_prop)
        runs_to_persist.append(exp_prop)
        
    await db.commit()
    for exp in runs_to_persist:
        await db.refresh(exp)
        
    return [
        ResearchEvaluationResult(
            id=e.id,
            experiment_name=e.experiment_name,
            baseline_name=e.baseline_name,
            dataset_size=e.dataset_size,
            metric_purity=float(e.metric_purity),
            metric_ari=float(e.metric_ari),
            metric_constraint_violation_rate=float(e.metric_constraint_violation_rate),
            latency_ms=float(e.latency_ms),
            status=e.status,
            details=e.details or {},
            created_at=e.created_at
        )
        for e in runs_to_persist
    ]

@router.get("/evaluations", response_model=List[ResearchEvaluationResult])
async def list_evaluations(db: AsyncSession = Depends(get_db)):
    stmt = select(ResearchExperiment).order_by(desc(ResearchExperiment.created_at))
    result = await db.execute(stmt)
    experiments = result.scalars().all()
    
    return [
        ResearchEvaluationResult(
            id=e.id,
            experiment_name=e.experiment_name,
            baseline_name=e.baseline_name,
            dataset_size=e.dataset_size,
            metric_purity=float(e.metric_purity),
            metric_ari=float(e.metric_ari),
            metric_constraint_violation_rate=float(e.metric_constraint_violation_rate),
            latency_ms=float(e.latency_ms),
            status=e.status,
            details=e.details or {},
            created_at=e.created_at
        )
        for e in experiments
    ]

