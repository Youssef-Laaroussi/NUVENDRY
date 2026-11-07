from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class OfferProposalCreate(BaseModel):
    cluster_id: str
    suggested_title: str
    skills_covered: List[str]
    learning_outcomes: List[str]
    session_outline: List[str]
    suggested_duration_hours: int = 2
    suggested_level: str = "intermediate"
    suggested_price_cents: int = 3900
    currency: str = "USD"
    evidence_summary: str
    constraints_summary: Optional[str] = None

class OfferProposalResponse(BaseModel):
    id: str
    cluster_id: Optional[str]
    merchant_id: Optional[str]
    suggested_title: str
    skills_covered: List[str]
    learning_outcomes: List[str]
    session_outline: List[str]
    suggested_duration_hours: int
    suggested_level: str
    suggested_price_cents: int
    currency: str
    evidence_summary: str
    constraints_summary: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class WorkshopCreate(BaseModel):
    offer_id: Optional[str] = None
    title: str
    description: str
    category: str = "AI Engineering"
    difficulty: str = "intermediate"
    duration_hours: int = 2
    price_cents: int
    currency: str = "USD"
    total_seats: int
    scheduled_at: datetime

class WorkshopUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price_cents: Optional[int] = None
    total_seats: Optional[int] = None
    scheduled_at: Optional[datetime] = None
    is_published: Optional[bool] = None

class WorkshopResponse(BaseModel):
    id: str
    merchant_id: str
    offer_id: Optional[str]
    title: str
    description: str
    category: str
    difficulty: str
    duration_hours: int
    price_cents: int
    currency: str
    total_seats: int
    remaining_seats: int
    scheduled_at: datetime
    is_published: bool
    created_at: datetime
    merchant_name: Optional[str] = None

    class Config:
        from_attributes = True

