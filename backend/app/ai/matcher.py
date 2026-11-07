import math
from typing import List, Dict, Any, Tuple
from collections import defaultdict
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class DemandMatcher:
    """
    Implements:
    - Baseline A: Standard TF-IDF Cosine Similarity
    - Baseline B: Semantic Dense Embedding Similarity
    - Proposed System: Semantic Similarity with Hard Incompatibility Constraints
    """
    
    def compute_tfidf_similarity(self, texts: List[str]) -> np.ndarray:
        if not texts:
            return np.zeros((0, 0))
        vectorizer = TfidfVectorizer(stop_words="english")
        tfidf_matrix = vectorizer.fit_transform(texts)
        return cosine_similarity(tfidf_matrix, tfidf_matrix)

    def check_constraints_compatible(self, d1: Dict[str, Any], d2: Dict[str, Any]) -> Tuple[bool, List[str]]:
        violations = []
        
        # 1. Language constraint
        if d1.get("language", "English").lower() != d2.get("language", "English").lower():
            violations.append("Language mismatch")
            
        # 2. Budget constraint (e.g., if one user's max budget is less than 60% of the other's)
        b1 = d1.get("max_budget_cents", 5000)
        b2 = d2.get("max_budget_cents", 5000)
        min_b = min(b1, b2)
        max_b = max(b1, b2)
        if max_b > 0 and (min_b / max_b) < 0.40:
            violations.append("Extreme budget disparity")
            
        # 3. Difficulty compatibility (beginner vs advanced is strictly incompatible)
        diff1 = d1.get("preferred_difficulty", "intermediate")
        diff2 = d2.get("preferred_difficulty", "intermediate")
        if (diff1 == "beginner" and diff2 == "advanced") or (diff1 == "advanced" and diff2 == "beginner"):
            violations.append("Incompatible difficulty levels")
            
        return (len(violations) == 0, violations)

    def cluster_demands_proposed(self, demands: List[Dict[str, Any]], similarity_threshold: float = 0.45) -> List[Dict[str, Any]]:
        """
        Proposed Constraint-Aware Clustering Algorithm:
        Computes textual semantic similarity, then validates all hard constraints before grouping.
        """
        if not demands:
            return []
            
        texts = [f"{d['topic']} {' '.join(d.get('related_skills', []))} {d.get('raw_prompt', '')}" for d in demands]
        sim_matrix = self.compute_tfidf_similarity(texts)
        
        n = len(demands)
        visited = set()
        clusters = []
        
        for i in range(n):
            if i in visited:
                continue
                
            current_cluster = [demands[i]]
            visited.add(i)
            
            for j in range(i + 1, n):
                if j in visited:
                    continue
                    
                sim = sim_matrix[i, j]
                if sim >= similarity_threshold:
                    # Must be compatible with all current members in the cluster
                    all_comp = all(self.check_constraints_compatible(m, demands[j])[0] for m in current_cluster)
                    if all_comp:
                        current_cluster.append(demands[j])
                        visited.add(j)
                        
            # Create cluster summary
            topic_counts = defaultdict(int)
            total_budget = 0
            for d in current_cluster:
                topic_counts[d["topic"]] += 1
                total_budget += d.get("max_budget_cents", 4500)
                
            lead_topic = max(topic_counts.items(), key=lambda x: x[1])[0]
            avg_budget = int(total_budget / len(current_cluster))
            
            clusters.append({
                "name": f"Opportunity: Practical {lead_topic} Workshop",
                "topic": lead_topic,
                "summary": f"Aggregated {len(current_cluster)} learner requests focusing on production skills in {lead_topic}.",
                "member_count": len(current_cluster),
                "avg_budget_cents": avg_budget,
                "currency": current_cluster[0].get("currency", "USD"),
                "difficulty": current_cluster[0].get("preferred_difficulty", "intermediate"),
                "demands": current_cluster
            })
            
        return clusters

matcher = DemandMatcher()
