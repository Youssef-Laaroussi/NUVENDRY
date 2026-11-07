from typing import List, Dict, Any

class LearnerRecommender:
    """
    Transparent AI recommendation engine matching learner preferences with available workshops.
    """
    
    def score_workshop(self, learner_demands: List[Dict[str, Any]], workshop: Dict[str, Any]) -> Dict[str, Any]:
        best_score = 0.0
        reasons = []
        
        ws_title = workshop.get("title", "").lower()
        ws_desc = workshop.get("description", "").lower()
        ws_cat = workshop.get("category", "").lower()
        ws_price = workshop.get("price_cents", 0)
        
        for d in learner_demands:
            score = 0.0
            match_tags = []
            
            topic = d.get("topic", "").lower()
            if topic in ws_title or topic in ws_desc or topic in ws_cat:
                score += 0.50
                match_tags.append(f"Direct match on topic '{d.get('topic')}'")
                
            for skill in d.get("related_skills", []):
                if skill.lower() in ws_title or skill.lower() in ws_desc:
                    score += 0.20
                    match_tags.append(f"Skill match on '{skill}'")
                    
            # Budget check
            max_b = d.get("max_budget_cents", 5000)
            if ws_price <= max_b:
                score += 0.20
                match_tags.append("Within your target budget")
            else:
                score -= 0.15
                
            # Difficulty check
            if d.get("preferred_difficulty", "").lower() == workshop.get("difficulty", "").lower():
                score += 0.10
                match_tags.append(f"Matches your '{workshop.get('difficulty')}' level")
                
            if score > best_score:
                best_score = score
                reasons = match_tags
                
        return {
            "workshop_id": workshop.get("id"),
            "match_score": min(0.99, max(0.0, round(best_score, 2))),
            "reasons": reasons if reasons else ["General AI engineering curriculum match"]
        }

recommender = LearnerRecommender()

