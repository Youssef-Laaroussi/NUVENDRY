from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class AnalyticsOverview(BaseModel):
    total_demands: int
    active_clusters: int
    published_workshops: int
    total_reservations: int
    confirmed_reservations: int
    total_revenue_cents: int
    total_rewards_redeemed_cents: int
    conversion_rate_percentage: float

class DemandTrendItem(BaseModel):
    topic: str
    count: int
    avg_budget_cents: int

class PaymentTransactionItem(BaseModel):
    id: str
    paypal_order_id: Optional[str]
    paypal_capture_id: Optional[str]
    buyer_name: str
    workshop_title: str
    amount_cents: int
    currency: str
    status: str
    created_at: datetime

class ResearchEvaluationRequest(BaseModel):
    baseline: str = "all"  # "baseline_a", "baseline_b", "proposed", or "all"
    dataset_size: int = 60

class ResearchEvaluationResult(BaseModel):
    id: str
    experiment_name: str
    baseline_name: str
    dataset_size: int
    metric_purity: float
    metric_ari: float
    metric_constraint_violation_rate: float
    latency_ms: float
    status: str
    details: Dict[str, Any]
    created_at: datetime

