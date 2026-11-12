from typing import Optional, List, Literal
from datetime import datetime, timezone
from pydantic import AwareDatetime, BaseModel, Field, field_validator

class ReservationQuoteRequest(BaseModel):
    workshop_id: str
    campaign_ids: Optional[List[str]] = None
    use_store_credit: bool = False

class RewardAppliedDetail(BaseModel):
    campaign_id: str
    campaign_name: str
    campaign_type: str
    discount_cents: int

class ReservationQuoteResponse(BaseModel):
    workshop_id: str
    base_price_cents: int
    rewards_applied: List[RewardAppliedDetail]
    store_credit_applied_cents: int
    final_amount_cents: int
    currency: str
    seat_available: bool

class ReservationCreate(BaseModel):
    workshop_id: str
    campaign_ids: Optional[List[str]] = None
    use_store_credit: bool = False

class ReservedWorkshop(BaseModel):
    image_url: str | None = None
    description: str
    category: str
    difficulty: str
    scheduled_at: datetime
    duration_hours: int
    total_seats: int
    remaining_seats: int

    model_config = {"from_attributes": True}

    @field_validator("scheduled_at")
    @classmethod
    def normalize_schedule(cls, value):
        return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value


class ReservationResponse(BaseModel):
    id: str
    workshop_id: str
    workshop_title: Optional[str] = None
    workshop: Optional[ReservedWorkshop] = None
    attended: Optional[bool] = None
    review_rating: Optional[int] = None
    reschedule_status: Optional[str] = None
    user_id: str
    final_amount_cents: int
    currency: str
    status: str
    paypal_order_id: Optional[str] = None
    paypal_capture_id: Optional[str] = None
    created_at: datetime
    confirmed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ReservationReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)


class RescheduleRequest(BaseModel):
    session_id: str


class RescheduleDecision(BaseModel):
    decision: Literal["approved", "rejected"]


class AlternateSessionCreate(BaseModel):
    scheduled_at: AwareDatetime
