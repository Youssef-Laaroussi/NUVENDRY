from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class DemandCreate(BaseModel):
    raw_prompt: str = Field(min_length=5, max_length=10000)
    topic: Optional[str] = None
    related_skills: Optional[List[str]] = None
    objective: Optional[str] = None
    preferred_difficulty: Optional[str] = None
    preferred_duration_hours: Optional[int] = None
    language: Optional[str] = None
    max_budget_cents: Optional[int] = None
    currency: Optional[str] = None
    preferred_schedule: Optional[str] = None
    delivery_format: Optional[str] = None

class DemandUpdate(BaseModel):
    topic: Optional[str] = None
    related_skills: Optional[List[str]] = None
    objective: Optional[str] = None
    preferred_difficulty: Optional[str] = None
    preferred_duration_hours: Optional[int] = None
    max_budget_cents: Optional[int] = None
    preferred_schedule: Optional[str] = None
    delivery_format: Optional[str] = None

class DemandResponse(BaseModel):
    id: str
    user_id: str
    raw_prompt: str
    topic: str
    related_skills: List[str]
    objective: Optional[str] = None
    preferred_difficulty: str
    preferred_duration_hours: int
    language: str
    max_budget_cents: int
    currency: str
    preferred_schedule: str
    delivery_format: str
    confidence_score: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class ExtractionResult(BaseModel):
    topic: str
    related_skills: List[str]
    objective: str
    preferred_difficulty: str
    preferred_duration_hours: int
    language: str
    max_budget_cents: int
    currency: str
    preferred_schedule: str
    delivery_format: str
    missing_information: List[str] = []
    confidence_score: float

class ClusterResponse(BaseModel):
    id: str
    name: str
    topic: str
    summary: str
    member_count: int
    avg_budget_cents: int
    currency: str
    difficulty: str
    status: str
    created_at: datetime
    member_demands: Optional[List[DemandResponse]] = None

    class Config:
        from_attributes = True

