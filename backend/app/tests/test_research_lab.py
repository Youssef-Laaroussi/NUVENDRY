import pytest
from app.ai.evaluator import evaluator

def test_research_evaluator_baselines():
    dataset = evaluator.generate_synthetic_benchmark_dataset(size=30)
    assert len(dataset) == 30
    
    # Baseline A
    res_a = evaluator.evaluate_baseline_a(dataset)
    assert "metric_purity" in res_a
    assert "metric_ari" in res_a
    assert "metric_constraint_violation_rate" in res_a
    assert res_a["metric_purity"] > 0
    
    # Proposed system
    res_prop = evaluator.evaluate_proposed_system(dataset)
    assert "metric_purity" in res_prop
    assert "metric_ari" in res_prop
    assert "metric_constraint_violation_rate" in res_prop
    
    # Proposed constraint-aware matching must have 0% constraint violations
    assert res_prop["metric_constraint_violation_rate"] == 0.0

