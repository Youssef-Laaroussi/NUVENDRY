from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.core.database import get_db
from app.models.entities import (
    User, StoreCredit, DigitalGift, ReferralEvent, 
    Reservation, AttendanceRecord
)
from app.schemas.reward import StoreCreditResponse, DigitalGiftResponse, ReferralResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/rewards", tags=["Rewards & Referrals"])

@router.get("/me")
async def get_my_rewards_dashboard(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns the learner's complete reward status across the 6 reward mechanisms:
    1. Welcome eligibility
    2. Early-bird eligibility status
    3. Store Credit balance & history
    4. Unlocked Digital Gifts
    5. Referral statistics
    6. Verified Achievement Badges
    """
    # 1. Store Credit
    sc_stmt = select(StoreCredit).where(StoreCredit.user_id == user.id)
    sc = (await db.execute(sc_stmt)).scalar_one_or_none()
    balance_cents = sc.balance_cents if sc else 0
    
    # 2. Digital Gifts
    gift_stmt = select(DigitalGift).where(DigitalGift.user_id == user.id).order_by(desc(DigitalGift.redeemed_at))
    gifts = (await db.execute(gift_stmt)).scalars().all()
    
    # 3. Badges (Computed from real DB events)
    # Check completed reservations
    res_stmt = select(func.count(Reservation.id)).where(
        Reservation.user_id == user.id,
        Reservation.status == "confirmed"
    )
    confirmed_count = (await db.execute(res_stmt)).scalar() or 0
    
    # Check verified attendance
    att_stmt = select(func.count(AttendanceRecord.id)).where(
        AttendanceRecord.user_id == user.id,
        AttendanceRecord.attended == True
    )
    attended_count = (await db.execute(att_stmt)).scalar() or 0
    
    badges = []
    if confirmed_count >= 1:
        badges.append({
            "badge_id": "first_workshop_booked",
            "title": "Pioneer Learner",
            "description": "Reserved your first AI workshop on NUVENDRY.",
            "unlocked": True
        })
    if attended_count >= 1:
        badges.append({
            "badge_id": "first_attended",
            "title": "Interactive Participant",
            "description": "Attended and completed a live engineering workshop.",
            "unlocked": True
        })
    if attended_count >= 3:
        badges.append({
            "badge_id": "three_workshops",
            "title": "Mastery Pathway",
            "description": "Completed 3 specialized AI engineering workshops.",
            "unlocked": True
        })
        
    return {
        "store_credit_cents": balance_cents,
        "currency": "USD",
        "digital_gifts": [
            {
                "id": g.id,
                "title": g.title,
                "download_url": g.download_url,
                "access_code": g.access_code,
                "redeemed_at": g.redeemed_at
            }
            for g in gifts
        ],
        "achievement_badges": badges,
        "first_purchase_eligible": confirmed_count == 0
    }

@router.get("/referrals/me", response_model=ReferralResponse)
async def get_my_referrals(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(ReferralEvent).where(ReferralEvent.referrer_id == user.id)
    events = (await db.execute(stmt)).scalars().all()
    
    total_referrals = len(events)
    rewarded = [e for e in events if e.status == "rewarded"]
    pending = [e for e in events if e.status == "pending"]
    total_earned = sum(e.reward_amount_cents for e in rewarded)
    
    return ReferralResponse(
        referral_code=user.referral_code or f"NV-{user.id[:6].upper()}",
        total_referrals=total_referrals,
        total_earned_cents=total_earned,
        pending_referrals=len(pending)
    )

