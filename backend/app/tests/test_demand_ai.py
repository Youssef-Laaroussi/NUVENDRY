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

