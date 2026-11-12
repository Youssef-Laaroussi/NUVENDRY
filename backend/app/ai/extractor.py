import re
from typing import List, Dict, Any, Optional
from app.schemas.demand import ExtractionResult

class DemandExtractor:
    """
    Parses natural language learner requests into structured, validated demand items.
    Preserves uncertainty and flags missing constraints.
    """
    
    TOPIC_KEYWORDS = {
        "LangGraph Agents": ["langgraph", "agent", "agents", "multi-agent", "stategraph", "langchain"],
        "Production MLOps": ["mlops", "deployment", "model serving", "kubeflow", "mlflow", "monitoring"],
        "FastAPI & React Full-Stack": ["fastapi", "react", "fullstack", "full stack", "full-stack", "typescript"],
        "Data Engineering & Kafka": ["data engineering", "kafka", "streaming", "spark", "pipeline", "etl"],
        "LLM Fine-Tuning & RAG": ["rag", "fine-tuning", "fine tuning", "embeddings", "vector db", "retrieval"],
        "Large Language Models": ["llms", "llm", "large language models", "large language model"],
        "Python": ["python"],
        "DevOps & Kubernetes": ["kubernetes", "k8s", "docker", "ci/cd", "devops", "cloud"]
    }
    
    DIFFICULTIES = ["beginner", "intermediate", "advanced"]
    
    SCHEDULE_PATTERNS = {
        "Weekend": [r"\bweekend\b", r"\bsaturday\b", r"\bsunday\b"],
        "Weekday Evening": [r"\bevening\b", r"\bweeknight\b", r"\bafter work\b", r"\bnight\b"],
        "Weekday Morning": [r"\bmorning\b", r"\bam\b"],
        "Flexible": [r"\bflexible\b", r"\banytime\b"]
    }

    def extract(self, text: str) -> ExtractionResult:
        lower_text = text.lower()
        
        # 1. Topic Extraction
        extracted_topic = "AI Engineering"
        max_matches = 0
        detected_skills = []
        
        for topic, keywords in self.TOPIC_KEYWORDS.items():
            matches = [k for k in keywords if re.search(rf"(?<!\w){re.escape(k)}(?!\w)", lower_text)]
            if len(matches) > max_matches:
                max_matches = len(matches)
                extracted_topic = topic
            detected_skills.extend(matches)
            
        detected_skills = list(dict.fromkeys(detected_skills))
            
        # 2. Budget Extraction ($XX or XX dollars or XX USD)
        budget_match = re.search(r"(?:\$|usd\s*)(\d{1,6}(?:\.\d{1,2})?)|\b(\d{1,6}(?:\.\d{1,2})?)\s*(?:dollars|usd|\$)", lower_text)
        max_budget_cents = 5000
        missing_info = []
        if budget_match:
            from decimal import Decimal
            max_budget_cents = int(Decimal(next(g for g in budget_match.groups() if g)) * 100)
        else:
            missing_info.append("Budget not explicitly stated; assumed standard range ($50).")

        # 3. Difficulty
        extracted_diff = "intermediate"
        for diff in self.DIFFICULTIES:
            if re.search(rf"\b{diff}\b", lower_text):
                extracted_diff = diff
                break
                
        # 4. Duration
        duration_match = re.search(r"(\d+)\s*(hour|hr|hours|hrs)", lower_text)
        duration_hours = 2
        if duration_match:
            duration_hours = max(1, min(8, int(duration_match.group(1))))
        else:
            missing_info.append("Duration not specified; defaulted to 2 hours.")
            
        # 5. Language
        language = "English"
        if "french" in lower_text or "français" in lower_text:
            language = "French"
        elif "spanish" in lower_text or "español" in lower_text:
            language = "Spanish"
        elif "german" in lower_text:
            language = "German"
            
        # 6. Schedule
        extracted_schedule = "Flexible"
        schedule_found = False
        for sched, pats in self.SCHEDULE_PATTERNS.items():
            for pat in pats:
                if re.search(pat, lower_text):
                    extracted_schedule = sched
                    schedule_found = True
                    break
            if schedule_found:
                break
                
        if not schedule_found:
            missing_info.append("Schedule unspecified; all session times can be considered.")
            
        # 7. Delivery format
        delivery_format = "live_interactive"
        if "recorded" in lower_text or "async" in lower_text:
            delivery_format = "on_demand"
        elif re.search(r"\b(?:hands[- ]on |practical )?labs?\b", lower_text):
            delivery_format = "hands_on_lab"
            
        if not max_matches:
            missing_info.append("Topic needs confirmation.")
        if not any(re.search(rf"\b{diff}\b", lower_text) for diff in self.DIFFICULTIES):
            missing_info.append("Difficulty not stated; intermediate is a suggested default.")
        if not re.search(r"\b(english|french|spanish|german|français|español)\b", lower_text):
            missing_info.append("Language not stated; English is a suggested default.")
        if not re.search(r"recorded|async|hands.on|workshop|live", lower_text):
            missing_info.append("Format not stated; a live session is a suggested default.")

        # Confidence Calibration
        confidence = 0.95
        if missing_info:
            confidence -= 0.03 * len(missing_info)
        confidence = max(0.60, min(0.99, confidence))
        
        # Learning Objective
        objective = f"Master {extracted_topic} through practical, production-ready exercises and direct guidance."
        
        return ExtractionResult(
            topic=extracted_topic,
            related_skills=detected_skills[:5],
            objective=objective,
            preferred_difficulty=extracted_diff,
            preferred_duration_hours=duration_hours,
            language=language,
            max_budget_cents=max_budget_cents,
            currency="USD",
            preferred_schedule=extracted_schedule,
            delivery_format=delivery_format,
            missing_information=missing_info,
            confidence_score=round(confidence, 3)
        )

extractor = DemandExtractor()

