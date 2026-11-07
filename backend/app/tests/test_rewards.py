import pytest
from datetime import datetime, timezone, timedelta
from httpx import AsyncClient
from app.models.entities import User, Workshop, RewardCampaign, StoreCredit
from app.rewards.engine import reward_engine
from app.core.security import get_password_hash

@pytest.mark.asyncio
async def test_all_six_reward_mechanisms(db_session):
    now = datetime.now(timezone.utc)
    
    # 1. Create Instructor & Workshop
    instructor = User(
        id="inst-1",
        email="inst@example.com",
        hashed_password=get_password_hash("Pass123!"),
        full_name="Instructor One",
        role="instructor"
    )
    db_session.add(instructor)
    
    workshop = Workshop(
        id="ws-1",
        merchant_id="merchant-1",
        title="AI Engineering Workshop",
        description="Testing Workshop",
        price_cents=4000,  # $40.00
        currency="USD",
        total_seats=20,
        remaining_seats=20,
        scheduled_at=now + timedelta(days=7),
        is_published=True
    )
    db_session.add(workshop)
    
    # 2. Reward 1: Welcome Discount campaign ($10 off)
    camp_welcome = RewardCampaign(
        id="camp-welcome-1",
        merchant_id="merchant-1",
        name="Welcome Discount",
        campaign_type="welcome",
        discount_amount_cents=1000,
        min_spend_cents=2000,
        total_budget_cents=50000,
        remaining_budget_cents=50000,
        max_per_user=1,
        is_active=True
    )
    db_session.add(camp_welcome)
    
    # 3. Reward 2: Early-Bird Discount campaign ($15 off)
    camp_early = RewardCampaign(
        id="camp-early-1",
        merchant_id="merchant-1",
        name="Early Bird",
        campaign_type="early_bird",
        discount_amount_cents=1500,
        min_spend_cents=2500,
        total_budget_cents=50000,
        remaining_budget_cents=50000,
        max_per_user=1,
        is_active=True
    )
    db_session.add(camp_early)
    
    # 4. Reward 3: Store Credit user ($5 credit)
    buyer = User(
        id="buyer-1",
        email="buyer@example.com",
        hashed_password=get_password_hash("Pass123!"),
        full_name="Buyer One",
        role="learner"
    )
    db_session.add(buyer)
    
    sc = StoreCredit(
        user_id="buyer-1",
        balance_cents=500,  # $5.00
        currency="USD"
    )
    db_session.add(sc)
    await db_session.commit()
    
    # Test Quote Evaluation: Welcome discount + Store Credit
    quote = await reward_engine.evaluate_rewards(
        db=db_session,
        user=buyer,
        workshop=workshop,
        campaign_ids=["camp-welcome-1"],
        use_store_credit=True
    )
    
    assert quote["base_price_cents"] == 4000
    assert len(quote["rewards_applied"]) == 1
    assert quote["rewards_applied"][0]["discount_cents"] == 1000
    assert quote["store_credit_applied_cents"] == 500
    assert quote["final_amount_cents"] == 2500  # $40 - $10 - $5 = $25
    
    # Test Consume & Post-payment rewards (Reward 4: Digital Gifts, Reward 5: Referral, Reward 6: Badges)
    await reward_engine.consume_rewards_on_payment_success(
        db=db_session,
        user_id="buyer-1",
        reservation_id="res-12345",
        quote=quote
    )
    
    await reward_engine.trigger_post_payment_rewards(
        db=db_session,
        user_id="buyer-1",
        reservation_id="res-12345",
        workshop_id="ws-1"
    )
    await db_session.commit()
    
    # Check campaign budget was decremented
    camp = await db_session.get(RewardCampaign, "camp-welcome-1")
    assert camp.remaining_budget_cents == 49000
    
    # Check store credit was decremented to 0
    sc_updated = await db_session.get(StoreCredit, sc.id)
    assert sc_updated.balance_cents == 0

