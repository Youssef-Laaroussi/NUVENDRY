from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

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

class ReservationResponse(BaseModel):
    id: str
    workshop_id: str
    workshop_title: Optional[str] = None
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

