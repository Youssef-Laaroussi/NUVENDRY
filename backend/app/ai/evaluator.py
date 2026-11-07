import time
import random
from typing import Dict, Any, List
from collections import defaultdict, Counter
from sklearn.metrics import adjusted_rand_score
from app.ai.matcher import matcher
from app.ai.extractor import extractor

class ResearchLabEvaluator:
    """
    Executes reproducible benchmark evaluations comparing:
    - Baseline A: Standard TF-IDF Cosine Similarity without constraints
    - Baseline B: Unconstrained Semantic Vector Clustering
    - Proposed System: Semantic Similarity + Incompatibility Constraint Validation
    """
    
    def generate_synthetic_benchmark_dataset(self, size: int = 60) -> List[Dict[str, Any]]:
        topics = [
            ("LangGraph Agents", ["langgraph", "multi-agent", "stategraph"], 4500, "English", "intermediate"),
            ("Production MLOps", ["kubeflow", "mlflow", "serving"], 5500, "English", "advanced"),
            ("FastAPI & React Full-Stack", ["fastapi", "react", "typescript"], 3500, "English", "beginner"),
            ("LLM Fine-Tuning & RAG", ["rag", "vector db", "embeddings"], 5000, "French", "intermediate"),
            ("Data Engineering & Kafka", ["kafka", "spark", "streaming"], 6000, "English", "advanced"),
        ]
        
        dataset = []
        for i in range(size):
            lead = topics[i % len(topics)]
            # introduce some intentional constraint variations (language, budget outlier, difficulty)
            lang = lead[3]
            budget = lead[2] + random.choice([-1000, 0, 500, 1000])
            diff = lead[4]
            
            # 10% edge cases: French or extreme budget disparity
            if i % 7 == 0:
                lang = "French" if lead[3] == "English" else "English"
            if i % 9 == 0:
                budget = 1500  # extreme budget
            if i % 8 == 0:
                diff = "advanced" if lead[4] == "beginner" else "beginner"
                
            prompt = f"I want to learn {lead[0]} focusing on {random.choice(lead[1])} in {lang} for around ${budget//100}. Level {diff}."
            
            dataset.append({
                "id": f"bench-{i}",
                "true_label": lead[0],
                "topic": lead[0],
                "related_skills": lead[1],
                "raw_prompt": prompt,
                "language": lang,
                "max_budget_cents": budget,
                "preferred_difficulty": diff,
                "preferred_schedule": "Weekend",
                "delivery_format": "live_interactive"
            })
            
        return dataset

    def evaluate_baseline_a(self, dataset: List[Dict[str, Any]]) -> Dict[str, Any]:
        """TF-IDF keyword baseline without constraint filtering"""
        t0 = time.perf_counter()
        texts = [f"{d['topic']} {' '.join(d['related_skills'])} {d['raw_prompt']}" for d in dataset]
        sim_matrix = matcher.compute_tfidf_similarity(texts)
        
        # Simple greedy clustering
        n = len(dataset)
        labels = [-1] * n
        cluster_id = 0
        for i in range(n):
            if labels[i] != -1:
                continue
            labels[i] = cluster_id
            for j in range(i + 1, n):
                if labels[j] == -1 and sim_matrix[i, j] >= 0.40:
                    labels[j] = cluster_id
            cluster_id += 1
            
        latency_ms = (time.perf_counter() - t0) * 1000
        
        true_labels = [d["true_label"] for d in dataset]
        ari = adjusted_rand_score(true_labels, labels)
        
        # Calculate constraint violations (e.g. language or budget clashes inside same cluster)
        violations = 0
        total_pairs = 0
        for i in range(n):
            for j in range(i + 1, n):
                if labels[i] == labels[j]:
                    total_pairs += 1
                    comp, _ = matcher.check_constraints_compatible(dataset[i], dataset[j])
                    if not comp:
                        violations += 1
                        
        violation_rate = (violations / total_pairs) if total_pairs > 0 else 0.0
        
        # Purity
        purity = self._calculate_purity(true_labels, labels)
        
        return {
            "experiment_name": "Academic Evaluation: Baseline A (TF-IDF Matching)",
            "baseline_name": "TF-IDF Baseline (No Constraints)",
            "dataset_size": len(dataset),
            "metric_purity": round(float(purity), 4),
            "metric_ari": round(float(ari), 4),
            "metric_constraint_violation_rate": round(float(violation_rate), 4),
            "latency_ms": round(float(latency_ms), 2),
            "status": "completed",
            "details": {
                "clusters_found": cluster_id,
                "total_pairs_clustered": total_pairs,
                "constraint_violations": violations,
                "description": "Deterministic TF-IDF similarity without budget, language, or difficulty constraint gating."
            }
        }

    def evaluate_proposed_system(self, dataset: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Proposed constraint-aware clustering"""
        t0 = time.perf_counter()
        clusters = matcher.cluster_demands_proposed(dataset, similarity_threshold=0.45)
        latency_ms = (time.perf_counter() - t0) * 1000
        
        # Map back to labels
        n = len(dataset)
        labels = [-1] * n
        for c_idx, cluster in enumerate(clusters):
            for member in cluster["demands"]:
                # find index
                for i, d in enumerate(dataset):
                    if d["id"] == member["id"]:
                        labels[i] = c_idx
                        break
                        
        for i in range(n):
            if labels[i] == -1:
                labels[i] = len(clusters)
                
        true_labels = [d["true_label"] for d in dataset]
        ari = adjusted_rand_score(true_labels, labels)
        
        violations = 0
        total_pairs = 0
        for i in range(n):
            for j in range(i + 1, n):
                if labels[i] == labels[j]:
                    total_pairs += 1
                    comp, _ = matcher.check_constraints_compatible(dataset[i], dataset[j])
                    if not comp:
                        violations += 1
                        
        violation_rate = (violations / total_pairs) if total_pairs > 0 else 0.0
        purity = self._calculate_purity(true_labels, labels)
        
        return {
            "experiment_name": "Academic Evaluation: Proposed NUVENDRY Architecture",
            "baseline_name": "NUVENDRY Constraint-Aware Aggregation",
            "dataset_size": len(dataset),
            "metric_purity": round(float(purity), 4),
            "metric_ari": round(float(ari), 4),
            "metric_constraint_violation_rate": round(float(violation_rate), 4),
            "latency_ms": round(float(latency_ms), 2),
            "status": "completed",
            "details": {
                "clusters_found": len(clusters),
                "total_pairs_clustered": total_pairs,
                "constraint_violations": violations,
                "description": "Semantic aggregation with strict server-side budget, language, and difficulty constraint verification."
            }
        }

    def _calculate_purity(self, true_labels: List[str], pred_labels: List[int]) -> float:
        from collections import Counter
        cluster_map = defaultdict(list)
        for t, p in zip(true_labels, pred_labels):
            cluster_map[p].append(t)
            
        correct = sum(Counter(members).most_common(1)[0][1] for members in cluster_map.values())
        return correct / len(true_labels) if true_labels else 0.0

evaluator = ResearchLabEvaluator()
