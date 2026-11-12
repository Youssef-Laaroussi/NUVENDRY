from app.ai.advisor import terms


class LearnerRecommender:
    """Validate constraints before ranking workshops with observable topic and skill evidence."""

    def score_workshop(self, learner_demands, workshop, interests=()):
        best = {
            "workshop_id": workshop["id"],
            "match_score": 0,
            "reasons": [],
            "matched_demand_id": None,
            "unresolved_constraints": [],
        }
        title_terms = terms(f'{workshop["title"]} {workshop["category"]}')
        catalog_terms = title_terms | terms(workshop["description"])

        for demand in learner_demands:
            if not self.compatible(demand, workshop):
                continue
            topic = terms(demand["topic"]) - {"ai", "engineering", "workshop"}
            topic_overlap = topic & catalog_terms
            skills = [
                skill for skill in demand["related_skills"]
                if terms(skill) and terms(skill) <= catalog_terms
            ]
            if not topic_overlap and not skills:
                continue
            topic_relevance = len(topic_overlap) / max(1, len(topic))
            skill_relevance = min(len(skills) / 2, 1)
            level_match = demand["preferred_difficulty"].casefold() == workshop["difficulty"].casefold()
            score = round(0.50 * topic_relevance + 0.30 * skill_relevance + 0.10 + 0.10 * level_match, 2)
            if score <= best["match_score"]:
                continue
            reasons = [f"Topic overlap: {', '.join(sorted(topic_overlap))}"] if topic_overlap else []
            reasons.extend(f"Covers {skill}" for skill in skills[:3])
            reasons.append("Within your budget")
            if level_match:
                reasons.append(f"Matches your {workshop['difficulty']} level")
            schedule = demand["preferred_schedule"]
            unresolved = []
            if not workshop.get("language"):
                unresolved.append(f"Workshop language is unlisted (requested: {demand['language']}).")
            else:
                reasons.append(f"Language: {workshop['language']}")
            delivery = self.published_format(workshop)
            if not delivery:
                unresolved.append(f"Confirm workshop format (requested: {demand['delivery_format'].replace('_', ' ')}).")
            else:
                reasons.append(f"Format: {delivery.replace('_', ' ')}")
            if schedule.casefold() not in {"flexible", "weekend", "weekday evening", "weekday morning", ""}:
                unresolved.append(f"Confirm the session time against your schedule ({schedule}).")
            best.update(match_score=score, reasons=reasons, matched_demand_id=demand["id"],
                        unresolved_constraints=unresolved)

        if not learner_demands:
            matched = [interest for interest in interests if terms(interest) and terms(interest) <= catalog_terms]
            if matched:
                best.update(
                    match_score=round(len(matched) / len(interests), 2),
                    reasons=[f"Matches your interest in {interest}" for interest in matched],
                    unresolved_constraints=[label for missing, label in ((not workshop.get("language"), "Workshop language is unlisted."), (not self.published_format(workshop), "Workshop format is unlisted.")) if missing],
                )
        return best

    @staticmethod
    def published_format(workshop):
        if workshop.get("delivery_format"):
            return workshop["delivery_format"]
        legacy = {"Live Workshop (Online)": "live_online", "In Person": "in_person", "Hybrid": "hybrid"}
        return next((legacy[line.strip()] for line in workshop["description"].splitlines() if line.strip() in legacy), None)

    @classmethod
    def compatible(cls, demand, workshop):
        if demand["currency"].upper() != workshop["currency"].upper() or workshop["price_cents"] > demand["max_budget_cents"]:
            return False
        levels = {demand["preferred_difficulty"].casefold(), workshop["difficulty"].casefold()}
        if levels == {"beginner", "advanced"}:
            return False
        language = workshop.get("language")
        aliases = {"en": "english", "fr": "french", "français": "french", "ar": "arabic", "العربية": "arabic"}
        if language and demand.get("language"):
            requested, offered = (v.strip().casefold() for v in (demand["language"], language))
            if aliases.get(requested, requested) != aliases.get(offered, offered):
                return False
        delivery = cls.published_format(workshop)
        allowed = {
            "live_interactive": {"live_online", "in_person", "hybrid", "hands_on_lab"},
            "hands_on_lab": {"hands_on_lab"},
            "on_demand": {"on_demand"},
        }.get(demand["delivery_format"])
        if delivery and allowed and delivery not in allowed:
            return False
        date = workshop["scheduled_at"]
        schedule = demand["preferred_schedule"].casefold()
        return {
            "weekend": date.weekday() >= 5,
            "weekday evening": date.weekday() < 5 and date.hour >= 17,
            "weekday morning": date.weekday() < 5 and date.hour < 12,
        }.get(schedule, True)


recommender = LearnerRecommender()
