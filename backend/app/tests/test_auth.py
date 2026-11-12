import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_register_and_login_learner(client: AsyncClient):
    # 1. Register learner
    reg_payload = {
        "email": "test.learner@example.com",
        "password": "Password123!",
        "full_name": "Test Learner",
        "role": "learner"
    }
    res = await client.post("/api/v1/auth/register", json=reg_payload)
    assert res.status_code == 201, res.text
    data = res.json()
    assert "access_token" in data
    assert data["email"] == "test.learner@example.com"
    assert data["role"] == "learner"
    token = data["access_token"]
    
    # 2. Get profile
    me_res = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "test.learner@example.com"
    
    # 3. Login
    login_payload = {
        "email": "test.learner@example.com",
        "password": "Password123!"
    }
    log_res = await client.post("/api/v1/auth/login", json=login_payload)
    assert log_res.status_code == 200
    assert "access_token" in log_res.json()

@pytest.mark.asyncio
async def test_register_duplicate_email_fails(client: AsyncClient):
    reg_payload = {
        "email": "dup@example.com",
        "password": "Password123!",
        "full_name": "Duplicate User",
        "role": "learner"
    }
    res1 = await client.post("/api/v1/auth/register", json=reg_payload)
    assert res1.status_code == 201
    
    res2 = await client.post("/api/v1/auth/register", json=reg_payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]



@pytest.mark.asyncio
async def test_learner_settings_merge_and_sync_interests(client: AsyncClient):
    url = "/api/v1/auth/settings"
    update = f"{url}/learner"
    assert (await client.patch(update, json={"location": "Rabat"})).status_code == 401
    registration = await client.post("/api/v1/auth/register", json={
        "email": "settings@example.com", "password": "Password123!", "full_name": "Settings User",
    })
    headers = {"Authorization": f"Bearer {registration.json()['access_token']}"}
    assert (await client.put(url, headers=headers, json={"bookmarks": ["workshop"]})).status_code == 200
    assert (await client.patch(update, headers=headers, json={"preferences": {"format": "invalid"}})).status_code == 422
    assert (await client.patch(update, headers=headers, json={"location": "Rabat", "preferences": {"level": "Advanced"}})).status_code == 200
    assert (await client.patch(update, headers=headers, json={"preferences": {"interests": ["Python"]}})).status_code == 200
    data = (await client.get(url, headers=headers)).json()
    assert data == {"bookmarks": ["workshop"], "learner": {
        "location": "Rabat", "preferences": {"level": "Advanced", "interests": ["Python"]},
    }}
    me = await client.get("/api/v1/auth/me", headers=headers)
    assert me.json()["profile"]["skills_interested"] == ["Python"]


@pytest.mark.asyncio
async def test_password_change_requires_current_password(client: AsyncClient):
    email = "password-change@example.com"
    old_password = "OldPassword123!"
    new_password = "NewPassword123!"
    registration = await client.post("/api/v1/auth/register", json={
        "email": email, "password": old_password, "full_name": "Password User",
    })
    headers = {"Authorization": f"Bearer {registration.json()['access_token']}"}
    url = "/api/v1/auth/password"
    rejected = await client.post(url, headers=headers, json={
        "current_password": "incorrect", "new_password": new_password,
    })
    assert rejected.status_code == 400
    changed = await client.post(url, headers=headers, json={
        "current_password": old_password, "new_password": new_password,
    })
    assert changed.status_code == 204
    login = "/api/v1/auth/login"
    assert (await client.post(login, json={"email": email, "password": old_password})).status_code == 401
    assert (await client.post(login, json={"email": email, "password": new_password})).status_code == 200


@pytest.mark.asyncio
async def test_legacy_referral_code_can_be_redeemed(client: AsyncClient, db_session):
    from app.core.security import create_access_token
    from app.models.entities import User

    referrer = User(id="legacy-referrer", email="legacy@example.com", hashed_password="unused",
                    full_name="Legacy Referrer", role="learner")
    db_session.add(referrer)
    await db_session.commit()
    headers = {"Authorization": f"Bearer {create_access_token(subject=referrer.id)}"}
    url = "/api/v1/rewards/referrals/me"
    code = (await client.get(url, headers=headers)).json()["referral_code"]
    assert code
    payload = {"email": "new-referral@example.com", "full_name": "Referred Learner", "password": "Password123!"}
    bad = await client.post("/api/v1/auth/register", json={**payload, "referral_code": "bad-code"})
    assert bad.status_code == 422
    good = await client.post("/api/v1/auth/register", json={**payload, "referral_code": code.lower()})
    assert good.status_code == 201, good.text
    dashboard = (await client.get(url, headers=headers)).json()
    assert dashboard["referral_code"] == code
    assert dashboard["pending_referrals"] == 1
