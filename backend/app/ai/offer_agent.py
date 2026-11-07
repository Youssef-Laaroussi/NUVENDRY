from typing import Dict, Any, List
from app.schemas.workshop import OfferProposalCreate

class OfferAgent:
    """
    AI Offer Generation Agent:
    Transforms aggregated learner demand clusters into cohesive, practical workshop proposals.
    All outputs remain in 'draft' status until approved by an instructor.
    """
    
    def generate_proposal(self, cluster_data: Dict[str, Any]) -> OfferProposalCreate:
        topic = cluster_data.get("topic", "AI Engineering")
        member_count = cluster_data.get("member_count", 1)
        avg_budget = cluster_data.get("avg_budget_cents", 4500)
        difficulty = cluster_data.get("difficulty", "intermediate")
        
        # Determine pricing based on cluster budget (target 85%-90% of avg budget to maximize conversion)
        suggested_price = int(avg_budget * 0.90)
        # Round to whole dollar cents
        suggested_price = max(2500, (suggested_price // 100) * 100 + 99)  # e.g. $39.99
        
        suggested_title = f"Mastering {topic}: Production Architecture & Hands-on Lab"
        
        skills_covered = [
            f"{topic} Core Patterns",
            "Real-World State & Memory Management",
            "Production Error Recovery & Guardrails",
            "Deployment & Observability"
        ]
        
        learning_outcomes = [
            f"Build and test an end-to-end {topic} workflow from ground up.",
            "Implement enterprise-grade resilience and error handling.",
            "Optimize latency and API cost while preserving response fidelity.",
            "Deploy a working demo ready for peer code review and production evaluation."
        ]
        
        session_outline = [
            "00:00 - 00:20 | Foundations, Architectural Blueprint & Case Study",
            "00:20 - 01:00 | Live Interactive Lab: Coding the Core Logic",
            "01:00 - 01:30 | Stress Testing, Edge Cases & Guardrails",
            "01:30 - 02:00 | Deployment, Real PayPal Sandbox Flow & Q&A"
        ]
        
        evidence_summary = (
            f"Synthesized from {member_count} active learner requests on NUVENDRY. "
            f"Learners indicated an average willingness-to-pay of ${avg_budget / 100:.2f} "
            f"with a preference for {difficulty} level and weekend live interactive delivery."
        )
        
        constraints_summary = (
            f"Requires delivery in English. Learners requested practical code walkthroughs "
            f"rather than theoretical slides. Target duration is 2 hours."
        )
        
        return OfferProposalCreate(
            cluster_id=cluster_data.get("id", "temp-cluster-id"),
            suggested_title=suggested_title,
            skills_covered=skills_covered,
            learning_outcomes=learning_outcomes,
            session_outline=session_outline,
            suggested_duration_hours=2,
            suggested_level=difficulty,
            suggested_price_cents=suggested_price,
            currency="USD",
            evidence_summary=evidence_summary,
            constraints_summary=constraints_summary
        )

offer_agent = OfferAgent()

