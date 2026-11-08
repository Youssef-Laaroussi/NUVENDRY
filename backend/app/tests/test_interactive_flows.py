import pytest
from datetime import datetime, timezone, timedelta
from app.models.entities import (
    User,
    MerchantProfile,
    Workshop,
    RewardCampaign,
    StoreCredit,
    Notification,
    LearningDemand,
)
from app.core.security import get_password_hash, create_access_token


@pytest.mark.asyncio
async def test_profile_updates_and_notifications(client, db_session):
    learner = User(
        id="learner-prof-1",
        email="learner.prof@example.com",
        hashed_password=get_password_hash("Pass123!"),
        full_name="Original Learner",
        role="learner",
        referral_code="REFPROF1",
    )
    instructor = User(
        id="inst-prof-1",
        email="inst.prof@example.com",
        hashed_password=get_password_hash("Pass123!"),
        full_name="Original Instructor",
        role="instructor",
    )
    merchant = MerchantProfile(
        id="mp-prof-1",
        user_id=instructor.id,
        business_name="Original Academy",
        paypal_receiver_email="old.receiver@example.com",
    )
    notif = Notification(
        id="notif-prof-1",
        user_id=learner.id,
        title="Workshop Matched",
        message="A new LangGraph workshop matches your request.",
        link="/app/my-demands",
        is_read=False,
    )
    db_session.add_all([learner, instructor, merchant, notif])
    await db_session.commit()

    learner_headers = {"Authorization": f"Bearer {create_access_token(subject=learner.id)}"}
    inst_headers = {"Authorization": f"Bearer {create_access_token(subject=instructor.id)}"}

    # Update learner profile
    patch_learner = await client.patch(
        "/api/v1/auth/me",
        json={"full_name": "Updated Sophia"},
        headers=learner_headers,
    )
    assert patch_learner.status_code == 200
    assert patch_learner.json()["full_name"] == "Updated Sophia"

    # Update merchant credentials
    patch_inst = await client.patch(
        "/api/v1/auth/me",
        json={
            "business_name": "Sophia AI Labs",
            "paypal_receiver_email": "sandbox.receiver@nuvendry.com",
        },
        headers=inst_headers,
    )
    assert patch_inst.status_code == 200
    assert patch_inst.json()["merchant_profile"]["business_name"] == "Sophia AI Labs"
    assert patch_inst.json()["merchant_profile"]["paypal_receiver_email"] == "sandbox.receiver@nuvendry.com"

    # Notifications list and mark-as-read
    list_notifs = await client.get("/api/v1/auth/notifications", headers=learner_headers)
    assert list_notifs.status_code == 200
    assert len(list_notifs.json()) == 1
    assert list_notifs.json()[0]["is_read"] is False

    read_resp = await client.post(
        "/api/v1/auth/notifications/notif-prof-1/read",
        headers=learner_headers,
    )
    assert read_resp.status_code == 200
    assert read_resp.json()["is_read"] is True

    # Admin directory & audit endpoints
    admin = User(
        id="admin-prof-1",
        email="admin.prof@example.com",
        hashed_password=get_password_hash("Pass123!"),
        full_name="Root Admin",
        role="admin",
    )
    db_session.add(admin)
    await db_session.commit()
    admin_headers = {"Authorization": f"Bearer {create_access_token(subject=admin.id)}"}
    users_resp = await client.get("/api/v1/admin/users", headers=admin_headers)
    assert users_resp.status_code == 200
    assert len(users_resp.json()) >= 3
    audit_resp = await client.get("/api/v1/admin/audit", headers=admin_headers)
    assert audit_resp.status_code == 200


@pytest.mark.asyncio
async def test_pending_quote_recalculation_cancel_and_reward_capture_consumption(client, db_session):
    now = datetime.now(timezone.utc)

    instructor = User(
        id="inst-rew-1",
        email="inst.rew@example.com",
        hashed_password=get_password_hash("Pass123!"),
        full_name="Elena AI",
        role="instructor",
    )
    merchant = MerchantProfile(
        id="mp-rew-1",
        user_id=instructor.id,
        business_name="Elena AI Studio",
        paypal_receiver_email="elena.sandbox@example.com",
    )
    learner = User(
        id="learner-rew-1",
        email="learner.rew@example.com",
        hashed_password=get_password_hash("Pass123!"),
        full_name="Checkout Learner",
        role="learner",
    )
    workshop = Workshop(
        id="ws-rew-1",
        merchant_id=merchant.id,
        title="Production LangGraph Agents",
        description="Hands-on Lab",
        category="AI Agents",
        difficulty="intermediate",
        price_cents=4000,
        currency="USD",
        total_seats=10,
        remaining_seats=10,
        scheduled_at=now + timedelta(days=6),
        is_published=True,
    )
    campaign = RewardCampaign(
        id="camp-welcome-1",
        merchant_id=merchant.id,
        name="Welcome $10 Off",
        campaign_type="welcome",
        discount_amount_cents=1000,
        min_spend_cents=2000,
        total_budget_cents=5000,
        remaining_budget_cents=5000,
        is_active=True,
    )
    credit = StoreCredit(
        id="sc-rew-1",
        user_id=learner.id,
        balance_cents=500,
        currency="USD",
    )
    demand = LearningDemand(
        id="dem-rew-1",
        user_id=learner.id,
        raw_prompt="I want to learn LangGraph AI Agents under $45",
        topic="AI Agents",
        related_skills=["LangGraph", "AI Agents"],
        preferred_difficulty="intermediate",
        max_budget_cents=4500,
        status="clustered",
    )
    db_session.add_all([instructor, merchant, learner, workshop, campaign, credit, demand])
    await db_session.commit()

    learner_headers = {"Authorization": f"Bearer {create_access_token(subject=learner.id)}"}
    inst_headers = {"Authorization": f"Bearer {create_access_token(subject=instructor.id)}"}

    # AI recommendations endpoint
    rec_resp = await client.get("/api/v1/ai/recommendations", headers=learner_headers)
    assert rec_resp.status_code == 200
    assert len(rec_resp.json()) == 1
    assert rec_resp.json()[0]["workshop"]["id"] == "ws-rew-1"
    assert rec_resp.json()[0]["alignment_percentage"] >= 70

    # Hold seat WITHOUT promotions or store credit ($40.00)
    res1 = await client.post(
        "/api/v1/reservations",
        json={
            "workshop_id": "ws-rew-1",
            "use_store_credit": False,
            "campaign_ids": ["__none__"],
        },
        headers=learner_headers,
    )
    assert res1.status_code == 201
    assert res1.json()["final_amount_cents"] == 4000
    res_id = res1.json()["id"]

    # Toggle promotions + store credit ON -> updates existing pending reservation to $25.00 ($40 - $10 - $5)
    res2 = await client.post(
        "/api/v1/reservations",
        json={
            "workshop_id": "ws-rew-1",
            "use_store_credit": True,
        },
        headers=learner_headers,
    )
    assert res2.status_code == 201
    assert res2.json()["id"] == res_id
    assert res2.json()["final_amount_cents"] == 2500

    # Cancel hold
    cancel_resp = await client.post(f"/api/v1/reservations/{res_id}/cancel", headers=learner_headers)
    assert cancel_resp.status_code == 200
    assert cancel_resp.json()["status"] == "cancelled"

    # Re-create fresh hold with promotions + credit ($25.00), create PayPal order, and capture
    res3 = await client.post(
        "/api/v1/reservations",
        json={"workshop_id": "ws-rew-1", "use_store_credit": True},
        headers=learner_headers,
    )
    assert res3.status_code == 201
    new_res_id = res3.json()["id"]
    assert res3.json()["final_amount_cents"] == 2500

    order_resp = await client.post(
        "/api/v1/paypal/orders",
        json={"reservation_id": new_res_id},
        headers=learner_headers,
    )
    assert order_resp.status_code == 200
    pp_order_id = order_resp.json()["paypal_order_id"]

    cap_resp = await client.post(
        f"/api/v1/paypal/orders/{pp_order_id}/capture",
        headers=learner_headers,
    )
    assert cap_resp.status_code == 200
    assert cap_resp.json()["status"] == "COMPLETED"

    # Verify store credit and campaign budget were consumed atomically after PayPal capture
    await db_session.refresh(credit)
    await db_session.refresh(campaign)
    assert credit.balance_cents == 0
    assert campaign.remaining_budget_cents == 4000

    # Verify unlocked workshop materials endpoint works for confirmed buyer
    mat_resp = await client.get("/api/v1/workshops/ws-rew-1/materials", headers=learner_headers)
    assert mat_resp.status_code == 200
    assert mat_resp.json()["workshop_id"] == "ws-rew-1"
    assert len(mat_resp.json()["deliverables"]) >= 3

    # Verify merchant can pause/activate campaign via PATCH
    pause_resp = await client.patch(
        "/api/v1/merchant/rewards/camp-welcome-1",
        json={"is_active": False},
        headers=inst_headers,
    )
    assert pause_resp.status_code == 200
    assert pause_resp.json()["is_active"] is False
