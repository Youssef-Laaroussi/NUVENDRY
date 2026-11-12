import pytest
from app.ai.extractor import extractor
from app.ai.matcher import matcher
from app.ai.offer_agent import offer_agent

def test_demand_extraction_structured():
    raw = "I want to learn LangGraph with real projects for under $40 this weekend in English."
    extracted = extractor.extract(raw)
    
    assert extracted.topic == "LangGraph Agents"
    assert "langgraph" in [s.lower() for s in extracted.related_skills]
    assert extracted.max_budget_cents == 4000
    assert extracted.language == "English"
    assert extracted.preferred_schedule == "Weekend"
    assert extracted.confidence_score > 0.80

def test_incompatible_constraint_rejection():
    # Language clash
    d1 = {"topic": "MLOps", "language": "English", "max_budget_cents": 5000, "preferred_difficulty": "intermediate"}
    d2 = {"topic": "MLOps", "language": "French", "max_budget_cents": 5000, "preferred_difficulty": "intermediate"}
    comp, violations = matcher.check_constraints_compatible(d1, d2)
    assert comp is False
    assert any("Language mismatch" in v for v in violations)

    # Extreme budget disparity clash ($10 vs $100)
    d3 = {"topic": "MLOps", "language": "English", "max_budget_cents": 1000, "preferred_difficulty": "intermediate"}
    d4 = {"topic": "MLOps", "language": "English", "max_budget_cents": 10000, "preferred_difficulty": "intermediate"}
    comp_b, violations_b = matcher.check_constraints_compatible(d3, d4)
    assert comp_b is False
    assert any("budget disparity" in v for v in violations_b)

    # Difficulty clash (beginner vs advanced)
    d5 = {"topic": "MLOps", "language": "English", "max_budget_cents": 5000, "preferred_difficulty": "beginner"}
    d6 = {"topic": "MLOps", "language": "English", "max_budget_cents": 5000, "preferred_difficulty": "advanced"}
    comp_d, violations_d = matcher.check_constraints_compatible(d5, d6)
    assert comp_d is False
    assert any("difficulty" in v for v in violations_d)

def test_offer_agent_draft_generation():
    cluster = {
        "id": "clust-123",
        "topic": "LangGraph Agents",
        "member_count": 3,
        "avg_budget_cents": 4200,
        "difficulty": "intermediate"
    }
    proposal = offer_agent.generate_proposal(cluster)
    assert "LangGraph" in proposal.suggested_title
    assert len(proposal.skills_covered) >= 3
    assert len(proposal.learning_outcomes) >= 3
    assert len(proposal.session_outline) >= 3
    assert proposal.suggested_price_cents > 2000
    assert proposal.suggested_price_cents <= 4200
    assert "3 active learner requests" in proposal.evidence_summary



@pytest.mark.asyncio
async def test_advisor_persists_private_catalog_conversation(client, db_session, monkeypatch):
    from datetime import datetime, timedelta, timezone
    from app.core.config import settings
    from app.core.security import create_access_token
    from app.models.entities import MerchantProfile, User, Workshop

    monkeypatch.setattr(settings, "OLLAMA_MODEL", "")
    learner = User(id="advisor-learner", email="advisor@example.com", hashed_password="unused", full_name="Learner", role="learner")
    instructor = User(id="advisor-instructor", email="advisor-teacher@example.com", hashed_password="unused", full_name="Teacher", role="instructor")
    merchant = MerchantProfile(id="advisor-merchant", user_id=instructor.id, business_name="Academy")
    workshop = Workshop(
        id="advisor-python", merchant_id=merchant.id, title="Python Fundamentals", category="Python",
        description="Practice Python", price_cents=2000, total_seats=5, remaining_seats=5,
        scheduled_at=datetime.now(timezone.utc) + timedelta(days=2), is_published=True,
    )
    db_session.add_all([learner, instructor, merchant, workshop])
    await db_session.commit()
    url = "/api/v1/ai/advisor"
    learner_headers = {"Authorization": f"Bearer {create_access_token(subject=learner.id)}"}
    instructor_headers = {"Authorization": f"Bearer {create_access_token(subject=instructor.id)}"}
    assert (await client.get(url)).status_code == 401
    assert (await client.post(url, headers=learner_headers, json={"question": " "})).status_code == 422
    reply = await client.post(url, headers=learner_headers, json={"question": "Je veux apprendre Python"})
    assert reply.status_code == 201, reply.text
    assert reply.json()["sources"] == [{"id": workshop.id, "title": workshop.title}]
    assert reply.json()["mode"] == "catalog"
    assert (await client.get(url, headers=learner_headers)).json() == [reply.json()]
    assert (await client.get(url, headers=instructor_headers)).json() == []


@pytest.mark.asyncio
async def test_advisor_uses_configured_deepseek_provider(monkeypatch):
    from types import SimpleNamespace
    from pydantic import SecretStr
    from app.ai import advisor

    monkeypatch.setattr(advisor.settings, "DEEPSEEK_API_KEY", SecretStr("test-key"))

    async def fake_deepseek(messages, api_key):
        assert api_key == "test-key"
        assert messages[-1]["content"] == "Je veux apprendre Python"
        assert "Python Fundamentals" in messages[0]["content"]
        return "Commence par Python Fundamentals."

    monkeypatch.setattr(advisor, "ask_deepseek", fake_deepseek)
    workshop = SimpleNamespace(id="python", title="Python Fundamentals", category="Python", description="Practice", difficulty="beginner", duration_hours=2)
    answer, sources, mode = await advisor.advise("Je veux apprendre Python", [], [workshop], [])
    assert (answer, sources, mode) == ("Commence par Python Fundamentals.", [{"id": "python", "title": "Python Fundamentals"}], "model")


@pytest.mark.asyncio
async def test_langchain_deepseek_request_without_live_api(monkeypatch):
    import json
    import httpx
    from app.ai.advisor import ask_deepseek

    async def send(_client, request, **_kwargs):
        assert request.url.host == "api.deepseek.com"
        assert request.url.path.endswith("/chat/completions")
        assert request.headers["Authorization"] == "Bearer test-key"
        payload = json.loads(request.content)
        assert payload["messages"][-1]["content"] == "Learn Python"
        return response_type(200, request=request, json={
            "id": "test-completion", "object": "chat.completion", "created": 0,
            "model": payload["model"], "choices": [{"index": 0, "finish_reason": "stop",
                "message": {"role": "assistant", "content": "Try Python Fundamentals."}}],
        })

    response_type = httpx.Response
    monkeypatch.setattr(httpx.AsyncClient, "send", send)
    try:
        import httpx2
    except ImportError:
        pass
    else:
        response_type = httpx2.Response
        monkeypatch.setattr(httpx2.AsyncClient, "send", send)
    assert await ask_deepseek([{"role": "user", "content": "Learn Python"}], "test-key") == "Try Python Fundamentals."


@pytest.mark.asyncio
async def test_catalog_request_returns_only_matching_workshops(monkeypatch):
    from types import SimpleNamespace
    from pydantic import SecretStr
    from app.ai import advisor

    monkeypatch.setattr(advisor.settings, "DEEPSEEK_API_KEY", SecretStr("test-key"))

    async def unexpected_model_call(*args):
        pytest.fail("Catalog recommendations must come from the workshop query.")

    monkeypatch.setattr(advisor, "ask_deepseek", unexpected_model_call)
    workshops = [
        SimpleNamespace(id="agents", title="Building LangGraph Agents", category="AI", description="State graphs"),
        SimpleNamespace(id="python", title="Python Basics", category="Programming", description="A practical lesson"),
    ]
    _, sources, mode = await advisor.advise("I want a lesson about LangGraph.", [], workshops, [], ground_catalog=True)
    assert mode == "catalog"
    assert sources == [{"id": "agents", "title": "Building LangGraph Agents"}]



async def test_advisor_returns_every_matching_python_workshop():
    from types import SimpleNamespace
    from app.ai.advisor import advise

    workshops = [
        SimpleNamespace(id=str(i), title=f"Python Workshop {i}", category="Programming", description="")
        for i in range(4)
    ]
    workshops.extend([
        SimpleNamespace(id="description", title="Data Analysis", category="Data", description="Learn Python."),
        SimpleNamespace(id="unrelated", title="Java Workshop", category="Programming", description=""),
    ])
    previous = [SimpleNamespace(question="I want to learn Java")]
    _, sources, mode = await advise("I will to learn Python", previous, workshops, [], ground_catalog=True)
    assert mode == "catalog"
    assert [source["id"] for source in sources] == ["0", "1", "2", "3", "description"]


def test_recommendations_require_topic_evidence_and_compatible_budget():
    from datetime import datetime, timezone
    from app.ai.recommender import recommender

    demand = {
        "id": "demand", "topic": "LangGraph", "related_skills": ["LangGraph"],
        "max_budget_cents": 2000, "currency": "USD", "preferred_difficulty": "beginner",
        "preferred_schedule": "Flexible", "language": "English", "delivery_format": "live_interactive",
    }
    workshop = {
        "id": "lesson", "title": "LangGraph Basics", "category": "AI", "description": "State graphs",
        "price_cents": 1500, "currency": "USD", "difficulty": "beginner",
        "scheduled_at": datetime(2027, 1, 4, tzinfo=timezone.utc),
    }
    match = recommender.score_workshop([demand], workshop)
    assert match["matched_demand_id"] == demand["id"]
    assert match["match_score"] > 0
    assert match["unresolved_constraints"]
    assert not recommender.score_workshop([demand], {**workshop, "price_cents": 2500})["match_score"]
    assert not recommender.score_workshop([demand], {**workshop, "title": "Python Basics"})["match_score"]


@pytest.mark.asyncio
async def test_workshop_cover_and_catalog_visibility_follow_publication(client, db_session):
    from datetime import datetime, timedelta, timezone
    from app.core.security import create_access_token
    from app.models.entities import MerchantProfile, User

    teacher = User(id="cover-teacher", email="cover-teacher@example.com", hashed_password="unused", full_name="Teacher", role="instructor")
    learner = User(id="cover-learner", email="cover-learner@example.com", hashed_password="unused", full_name="Learner", role="learner")
    db_session.add_all([teacher, learner, MerchantProfile(id="cover-merchant", user_id=teacher.id, business_name="Studio")])
    await db_session.commit()
    instructor = {"Authorization": f"Bearer {create_access_token(subject=teacher.id)}"}
    student = {"Authorization": f"Bearer {create_access_token(subject=learner.id)}"}
    body = {
        "title": "LangGraph state machines", "description": "Build a state graph",
        "category": "LangGraph", "total_seats": 10, "price_cents": 1200,
        "scheduled_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "language": "English", "delivery_format": "hands_on_lab",
        "image_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=",
    }
    base = "/api/v1"
    invalid = await client.post(base + "/merchant/workshops", json={**body, "image_data": "data:image/png;base64,eA=="}, headers=instructor)
    assert invalid.status_code == 422
    draft = await client.post(base + "/merchant/workshops", json=body, headers=instructor)
    assert draft.status_code == 201, draft.text
    workshop = draft.json()
    assert workshop["is_published"] is False
    assert (await client.get(workshop["image_url"])).status_code == 404
    chat = base + "/ai/advisor"
    question = {"question": "Show me a course on Lang Graph"}
    before = await client.post(chat, json=question, headers=student)
    assert before.json()["sources"] == []
    published = await client.post(f"{base}/merchant/workshops/{workshop['id']}/publish", headers=instructor)
    assert published.status_code == 200, published.text
    cover = await client.get(workshop["image_url"])
    assert cover.status_code == 200 and cover.headers["content-type"] == "image/png"
    assert cover.content.startswith(b"\x89PNG")
    after = await client.post(chat, json=question, headers=student)
    assert [item["id"] for item in after.json()["sources"]] == [workshop["id"]]
    detail = await client.get(f"{base}/workshops/{workshop['id']}")
    assert detail.json()["language"] == "English"
    assert detail.json()["delivery_format"] == "hands_on_lab"

    update_url = f"{base}/merchant/workshops/{workshop['id']}"
    updated = await client.patch(update_url, json={
        "image_data": "data:image/gif;base64,R0lGODlh",
    }, headers=instructor)
    assert updated.status_code == 422
    updated = await client.patch(update_url, json={"image_data": body["image_data"]}, headers=instructor)
    assert updated.status_code == 200, updated.text
    private_cover = await client.get(update_url + "/image", headers=instructor)
    assert private_cover.content == cover.content
    assert (await client.delete(update_url, headers=instructor)).status_code == 204
    assert (await client.get(workshop["image_url"])).status_code == 404
