from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional, Tuple
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models.entities import (
    User, MerchantProfile, Workshop, RewardCampaign, RewardRedemption, 
    StoreCredit, RewardLedger, DigitalGift, ReferralEvent, AttendanceRecord, Reservation
)

class RewardEngine:
    """
    Merchant-Funded Promotion & Reward Engine for NUVENDRY.
    Enforces server-side eligibility, zero overselling of campaign budgets,
    non-stackable integrity, and verifiable event-driven rewards.
    """
    
    async def evaluate_rewards(
        self,
        db: AsyncSession,
        user: User,
        workshop: Workshop,
        campaign_ids: Optional[List[str]] = None,
        use_store_credit: bool = False
    ) -> Dict[str, Any]:
        """
        Calculates authoritative price reduction, applicable rewards, and store credit.
        Never allows final total to drop below $5.00 (500 cents) or below 0.
        """
        base_price_cents = workshop.price_cents
        current_amount_cents = base_price_cents
        rewards_applied = []
        now = datetime.now(timezone.utc)
        
        # 1. Fetch available active campaigns for this merchant
        stmt = select(RewardCampaign).where(
            RewardCampaign.merchant_id == workshop.merchant_id,
            RewardCampaign.is_active == True,
            RewardCampaign.remaining_budget_cents > 0
        )
        if campaign_ids:
            stmt = stmt.where(RewardCampaign.id.in_(campaign_ids))
            
        result = await db.execute(stmt)
        campaigns = result.scalars().all()
        
        for campaign in campaigns:
            # Check expiration
            if campaign.expires_at and (campaign.expires_at if campaign.expires_at.tzinfo else campaign.expires_at.replace(tzinfo=timezone.utc)) < now:
                continue
                
            # Check min spend
            if base_price_cents < campaign.min_spend_cents:
                continue
                
            # Check user redemption count for this campaign
            count_stmt = select(func.count(RewardRedemption.id)).where(
                RewardRedemption.campaign_id == campaign.id,
                RewardRedemption.user_id == user.id
            )
            count_res = await db.execute(count_stmt)
            user_redemptions = count_res.scalar() or 0
            if user_redemptions >= campaign.max_per_user:
                continue
                
            # Evaluate based on campaign type
            discount = 0
            
            # Reward 1: Welcome Discount
            if campaign.campaign_type == "welcome":
                # Verify if user has ANY confirmed reservation or redemption previously
                prior_res_stmt = select(func.count(RewardRedemption.id)).where(
                    RewardRedemption.user_id == user.id
                )
                prior_res = (await db.execute(prior_res_stmt)).scalar() or 0
                confirmed_stmt = select(func.count(Reservation.id)).where(
                    Reservation.user_id == user.id,
                    Reservation.status == "confirmed"
                )
                prior_confirmed = (await db.execute(confirmed_stmt)).scalar() or 0
                if prior_res == 0 and prior_confirmed == 0:
                    if campaign.discount_amount_cents > 0:
                        discount = campaign.discount_amount_cents
                    elif campaign.discount_percentage > 0:
                        discount = int(current_amount_cents * (campaign.discount_percentage / 100))
                        
            # Reward 2: Early-Bird Discount
            elif campaign.campaign_type == "early_bird":
                # Check if now is at least 3 days before workshop.scheduled_at
                scheduled_at = workshop.scheduled_at
                if scheduled_at.tzinfo is None:
                    scheduled_at = scheduled_at.replace(tzinfo=timezone.utc)
                if scheduled_at - now >= timedelta(days=3):
                    if campaign.discount_amount_cents > 0:
                        discount = campaign.discount_amount_cents
                    elif campaign.discount_percentage > 0:
                        discount = int(current_amount_cents * (campaign.discount_percentage / 100))
                        
            # Cap discount by campaign's remaining budget
            discount = min(discount, campaign.remaining_budget_cents)
            # Ensure price doesn't go below 500 cents ($5.00) minimum processing amount
            max_allowed_discount = max(0, current_amount_cents - 500)
            discount = min(discount, max_allowed_discount)
            
            if discount > 0:
                current_amount_cents -= discount
                rewards_applied.append({
                    "campaign_id": campaign.id,
                    "campaign_name": campaign.name,
                    "campaign_type": campaign.campaign_type,
                    "discount_cents": discount
                })
                # By default, do not stack multiple discount campaigns unless specified
                break
                
        # Reward 3: Store Credit application
        store_credit_applied_cents = 0
        if use_store_credit:
            sc_stmt = select(StoreCredit).where(StoreCredit.user_id == user.id)
            sc_res = await db.execute(sc_stmt)
            store_credit = sc_res.scalar_one_or_none()
            if store_credit and store_credit.currency == workshop.currency and store_credit.balance_cents > 0:
                available_sc = store_credit.balance_cents
                max_sc_discount = max(0, current_amount_cents - 500)
                store_credit_applied_cents = min(available_sc, max_sc_discount)
                current_amount_cents -= store_credit_applied_cents

        return {
            "workshop_id": workshop.id,
            "base_price_cents": base_price_cents,
            "rewards_applied": rewards_applied,
            "store_credit_applied_cents": store_credit_applied_cents,
            "final_amount_cents": current_amount_cents,
            "currency": workshop.currency,
            "seat_available": workshop.remaining_seats > 0
        }

    async def validate_checkout_funding(self, db: AsyncSession, reservation: Reservation, quote: Dict[str, Any]):
        for reward in quote.get("rewards_applied", []):
            campaign = await db.scalar(select(RewardCampaign).where(
                RewardCampaign.id == reward["campaign_id"],
            ).with_for_update().execution_options(populate_existing=True))
            if not campaign or not campaign.is_active or campaign.remaining_budget_cents < reward["discount_cents"]:
                raise HTTPException(409, "The promotion has changed. Refresh the checkout quote before paying.")
            redemptions = await db.scalar(select(func.count(RewardRedemption.id)).where(
                RewardRedemption.campaign_id == campaign.id,
                RewardRedemption.user_id == reservation.user_id,
            ))
            if redemptions >= campaign.max_per_user:
                raise HTTPException(409, "This promotion has already been used. Refresh the checkout quote before paying.")

        credit_used = quote.get("store_credit_applied_cents", 0)
        if credit_used:
            credit = await db.scalar(select(StoreCredit).where(
                StoreCredit.user_id == reservation.user_id,
            ).with_for_update().execution_options(populate_existing=True))
            if not credit or credit.currency != reservation.currency or credit.balance_cents < credit_used:
                raise HTTPException(409, "Your store credit balance has changed. Refresh the checkout quote before paying.")

    async def consume_rewards_on_payment_success(
        self,
        db: AsyncSession,
        user_id: str,
        reservation_id: str,
        quote: Dict[str, Any]
    ):
        """
        Deducts campaign budgets and updates store credits atomically upon verified payment.
        """
        # Deduct campaign budget & create redemptions
        for rew in quote.get("rewards_applied", []):
            camp_id = rew["campaign_id"]
            discount = rew["discount_cents"]
            
            camp_stmt = select(RewardCampaign).where(RewardCampaign.id == camp_id).with_for_update()
            camp_res = await db.execute(camp_stmt)
            campaign = camp_res.scalar_one_or_none()
            if campaign:
                campaign.remaining_budget_cents = max(0, campaign.remaining_budget_cents - discount)
                
            redemption = RewardRedemption(
                campaign_id=camp_id,
                user_id=user_id,
                reservation_id=reservation_id,
                amount_applied_cents=discount
            )
            db.add(redemption)
            
        # Deduct store credit if used
        sc_used = quote.get("store_credit_applied_cents", 0)
        if sc_used > 0:
            sc_stmt = select(StoreCredit).where(StoreCredit.user_id == user_id).with_for_update()
            sc_res = await db.execute(sc_stmt)
            store_credit = sc_res.scalar_one_or_none()
            if store_credit:
                store_credit.balance_cents = max(0, store_credit.balance_cents - sc_used)
                
            ledger_entry = RewardLedger(
                user_id=user_id,
                entry_type="debit",
                amount_cents=sc_used,
                currency="USD",
                description=f"Store credit redeemed for reservation {reservation_id[:8]}"
            )
            db.add(ledger_entry)

    async def trigger_post_payment_rewards(
        self,
        db: AsyncSession,
        user_id: str,
        reservation_id: str,
        workshop_id: str
    ):
        """
        Handles:
        - Reward 4: Digital Gift delivery (workshop materials)
        - Reward 5: Referral Reward credit upon first completed purchase
        - Reward 6: Achievement Badges
        """
        # Reward 4: Deliver Digital Gift materials
        gift_campaign_id = "system-gift-campaign"
        gift_title = "Interactive Workshop Starter Kit & Production Code Repo"
        workshop = await db.get(Workshop, workshop_id)
        if workshop:
            gift_title = f"{workshop.title} — Starter Kit & Code Repo"
            gift_camp_stmt = select(RewardCampaign).where(
                RewardCampaign.merchant_id == workshop.merchant_id,
                RewardCampaign.campaign_type == "digital_gift",
                RewardCampaign.is_active == True
            )
            gift_camp = (await db.execute(gift_camp_stmt)).scalars().first()
            if gift_camp:
                gift_campaign_id = gift_camp.id
            else:
                merchant_exists = await db.get(MerchantProfile, workshop.merchant_id)
                if merchant_exists:
                    auto_gift_camp = RewardCampaign(
                        merchant_id=workshop.merchant_id,
                        name="Workshop Starter Kit & Digital Resources",
                        campaign_type="digital_gift",
                        discount_amount_cents=0,
                        discount_percentage=0,
                        min_spend_cents=0,
                        total_budget_cents=100000,
                        remaining_budget_cents=100000,
                        max_per_user=10,
                        is_active=True
                    )
                    db.add(auto_gift_camp)
                    await db.flush()
                    gift_campaign_id = auto_gift_camp.id

        gift = DigitalGift(
            campaign_id=gift_campaign_id,
            user_id=user_id,
            title=gift_title,
            download_url=f"/api/v1/workshops/{workshop_id}/materials",
            access_code=f"NV-GIFT-{reservation_id[:8].upper()}"
        )
        db.add(gift)
        
        # Reward 5: Check if this user was referred by someone and award referrer $10
        ref_stmt = select(ReferralEvent).where(
            ReferralEvent.referee_id == user_id,
            ReferralEvent.status == "pending"
        ).with_for_update()
        ref_res = await db.execute(ref_stmt)
        referral_event = ref_res.scalar_one_or_none()
        
        if referral_event and referral_event.referrer_id != user_id:
            referral_event.status = "rewarded"
            referral_event.reservation_id = reservation_id
            
            # Credit referrer store credit
            referrer_sc_stmt = select(StoreCredit).where(
                StoreCredit.user_id == referral_event.referrer_id
            ).with_for_update()
            referrer_sc_res = await db.execute(referrer_sc_stmt)
            referrer_sc = referrer_sc_res.scalar_one_or_none()
            
            if not referrer_sc:
                referrer_sc = StoreCredit(
                    user_id=referral_event.referrer_id,
                    balance_cents=referral_event.reward_amount_cents,
                    currency="USD"
                )
                db.add(referrer_sc)
            else:
                referrer_sc.balance_cents += referral_event.reward_amount_cents
                
            db.add(RewardLedger(
                user_id=referral_event.referrer_id,
                entry_type="credit",
                amount_cents=referral_event.reward_amount_cents,
                currency="USD",
                description=f"Referral reward earned from referee booking"
            ))

reward_engine = RewardEngine()

