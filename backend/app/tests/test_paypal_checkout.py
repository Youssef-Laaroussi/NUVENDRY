import pytest
from datetime import datetime, timezone, timedelta
from app.models.entities import User, Workshop, Reservation, PaymentOrder
from app.core.security import get_password_hash, create_access_token

@pytest.mark.asyncio
async def test_paypal_order_creation_and_capture_flow(client, db_session):
    now = datetime.now(timezone.utc)
    
    # User & Workshop
    user = User(
        id="learner-chk-1",
        email="learner.chk@example.com",
        hashed_password=get_password_hash("Pass123!"),
        full_name="Checkout Tester",
        role="learner"
    )
    db_session.add(user)
    
    workshop = Workshop(
        id="ws-chk-1",
        merchant_id="merch-chk-1",
        title="Production Agents Workshop",
        description="Hands-on Lab",
        price_cents=3900,
        currency="USD",
        total_seats=2,
        remaining_seats=2,
        scheduled_at=now + timedelta(days=5),
        is_published=True
    )
    db_session.add(workshop)
    await db_session.commit()
    
    token = create_access_token(subject=user.id)
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Create Reservation
    res_resp = await client.post(
        "/api/v1/reservations",
        json={"workshop_id": "ws-chk-1"},
        headers=headers
    )
    assert res_resp.status_code == 201, res_resp.text
    reservation_id = res_resp.json()["id"]
    assert res_resp.json()["status"] == "pending_payment"
    
    # 2. Create PayPal Order
    order_resp = await client.post(
        "/api/v1/paypal/orders",
        json={"reservation_id": reservation_id},
        headers=headers
    )
    assert order_resp.status_code == 200, order_resp.text
    paypal_order_id = order_resp.json()["paypal_order_id"]
    assert paypal_order_id.startswith("SANDBOX-ORDER-") or len(paypal_order_id) > 5
    
    # 3. Capture PayPal Order
    capture_resp = await client.post(
        f"/api/v1/paypal/orders/{paypal_order_id}/capture",
        headers=headers
    )
    assert capture_resp.status_code == 200, capture_resp.text
    capture_data = capture_resp.json()
    assert capture_data["status"] == "COMPLETED"
    assert "paypal_capture_id" in capture_data
    
    # Verify Workshop seat decremented
    ws_db = await db_session.get(Workshop, "ws-chk-1")
    assert ws_db.remaining_seats == 1
    
    # 4. Test Idempotency: Repeating capture of same order must succeed cleanly without double decrement
    dup_capture = await client.post(
        f"/api/v1/paypal/orders/{paypal_order_id}/capture",
        headers=headers
    )
    assert dup_capture.status_code == 200
    assert dup_capture.json()["status"] == "COMPLETED"
    
    # Seat count must remain 1 (no double seat consumption)
    await db_session.refresh(ws_db)
    assert ws_db.remaining_seats == 1

@pytest.mark.asyncio
async def test_oversold_prevention(client, db_session):
    now = datetime.now(timezone.utc)
    user = User(
        id="learner-oversold",
        email="oversold@example.com",
        hashed_password=get_password_hash("Pass123!"),
        full_name="Oversold Tester",
        role="learner"
    )
    db_session.add(user)
    
    # Fully booked workshop (0 seats remaining)
    workshop = Workshop(
        id="ws-full",
        merchant_id="merch-full",
        title="Full Workshop",
        description="No seats left",
        price_cents=3900,
        currency="USD",
        total_seats=10,
        remaining_seats=0,
        scheduled_at=now + timedelta(days=5),
        is_published=True
    )
    db_session.add(workshop)
    await db_session.commit()
    
    token = create_access_token(subject=user.id)
    headers = {"Authorization": f"Bearer {token}"}
    
    # Attempting to create reservation must fail with 400
    res_resp = await client.post(
        "/api/v1/reservations",
        json={"workshop_id": "ws-full"},
        headers=headers
    )
    assert res_resp.status_code == 400
    assert "fully booked" in res_resp.json()["detail"].lower()

