from typing import Optional, List, Literal
from datetime import datetime
from pydantic import BaseModel, Field

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
    price_cents: int = Field(ge=1, le=100000000)
    currency: str = "USD"
    total_seats: int = Field(ge=1, le=100000)
    scheduled_at: datetime

    image_data: Optional[str] = Field(default=None, max_length=2_796_230)
    language: Optional[str] = Field(default=None, max_length=50)
    delivery_format: Optional[Literal["live_online", "in_person", "hybrid", "hands_on_lab", "on_demand"]] = None


class WorkshopUpdate(BaseModel):
    image_data: Optional[str] = Field(default=None, max_length=2_796_230)
    title: Optional[str] = None
    description: Optional[str] = None
    price_cents: Optional[int] = Field(default=None, ge=1, le=100000000)
    total_seats: Optional[int] = Field(default=None, ge=1, le=100000)
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
    instructor_name: Optional[str] = None
    image_url: Optional[str] = None
    language: Optional[str] = None
    delivery_format: Optional[str] = None

    class Config:
        from_attributes = True

