from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class CampaignCreate(BaseModel):
    name: str
    campaign_type: str  # welcome, early_bird, store_credit, digital_gift, referral, badge
    discount_amount_cents: int = 0
    discount_percentage: int = 0
    min_spend_cents: int = 0
    total_budget_cents: int = 50000
    max_per_user: int = 1
    expires_at: Optional[datetime] = None

class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    discount_amount_cents: Optional[int] = None
    discount_percentage: Optional[int] = None
    total_budget_cents: Optional[int] = None
    is_active: Optional[bool] = None

class CampaignResponse(BaseModel):
    id: str
    merchant_id: str
    name: str
    campaign_type: str
    discount_amount_cents: int
    discount_percentage: int
    min_spend_cents: int
    total_budget_cents: int
    remaining_budget_cents: int
    max_per_user: int
    expires_at: Optional[datetime]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class StoreCreditResponse(BaseModel):
    balance_cents: int
    currency: str
    updated_at: datetime

class DigitalGiftResponse(BaseModel):
    id: str
    title: str
    download_url: Optional[str]
    access_code: Optional[str]
    redeemed_at: datetime

    class Config:
        from_attributes = True

class ReferralActivity(BaseModel):
    id: str
    name: str
    created_at: datetime
    status: str
    reward_amount_cents: int

class ReferralResponse(BaseModel):
    referral_code: str
    reward_per_referral_cents: int
    total_referrals: int
    total_earned_cents: int
    pending_referrals: int
    referrals: List[ReferralActivity]

