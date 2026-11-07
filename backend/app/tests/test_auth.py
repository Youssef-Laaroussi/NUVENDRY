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

