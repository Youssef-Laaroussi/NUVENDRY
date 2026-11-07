import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { ResearchExperiment } from '../../types';
import { FlaskConical, Play, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';

export const ResearchLab: React.FC = () => {
  const [evaluations, setEvaluations] = useState<ResearchExperiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      const data = await api.getEvaluations();
      setEvaluations(data);
    } catch (err) {
      console.error('Failed to load evaluations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const handleRunEvaluation = async () => {
    setRunning(true);
    try {
      const newRuns = await api.runEvaluation({ baseline: 'all', dataset_size: 60 });
      fetchEvaluations();
    } catch (err) {
      console.error('Evaluation run failed', err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-forest font-mono">
              Academic Research & Evaluation
            </span>
            <h1 className="text-2xl font-serif text-charcoal mt-1">Research Evaluation Lab</h1>
            <p className="text-xs text-charcoal/60">
              Executable comparisons of Baseline TF-IDF vs NUVENDRY Constraint-Aware Aggregation.
            </p>
          </div>

          <button
            onClick={handleRunEvaluation}
            disabled={running}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest hover:bg-charcoal text-ivory text-xs font-semibold transition-colors shrink-0 shadow-xs"
          >
            {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>Execute Benchmark Run</span>
          </button>
        </div>

        {/* Methodology Card */}
        <div className="bg-white rounded-2xl border border-warmgray p-6 space-y-3 shadow-xs">
          <h3 className="font-semibold text-sm text-charcoal flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-forest" />
            Evaluation Methodology & Hypotheses
          </h3>
          <p className="text-xs text-charcoal/70 leading-relaxed">
            Standard text-clustering algorithms (e.g. TF-IDF or unconstrained sentence embeddings) frequently cluster requests that share keywords but have fundamentally incompatible constraints (such as language disparities, extreme budget differences, or clashing difficulty levels). NUVENDRY implements hard constraint gating, maintaining near-zero constraint violation rates while preserving semantic coherence.
          </p>
        </div>

        {/* Executed Results Table */}
        <div className="bg-white rounded-2xl border border-warmgray p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-charcoal text-sm">
              Executed Empirical Benchmark Results
            </h3>
            <span className="text-xs text-charcoal/50 font-mono">{evaluations.length} Runs Recorded</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-charcoal/60">Loading benchmark logs...</div>
          ) : evaluations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-ivory text-charcoal/60 font-mono uppercase text-[10px] border-b border-warmgray">
                  <tr>
                    <th className="py-3 px-3">System / Baseline</th>
                    <th className="py-3 px-3">Dataset</th>
                    <th className="py-3 px-3">Cluster Purity</th>
                    <th className="py-3 px-3">Adjusted Rand Index (ARI)</th>
                    <th className="py-3 px-3">Constraint Violation Rate</th>
                    <th className="py-3 px-3">Latency</th>
                    <th className="py-3 px-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warmgray/60 font-medium font-mono text-[11px]">
                  {evaluations.map((e) => {
                    const isProposed = e.baseline_name.toLowerCase().includes('nuvendry');
                    return (
                      <tr key={e.id} className={isProposed ? 'bg-mint/20' : 'hover:bg-ivory/50'}>
                        <td className="py-3 px-3 font-sans font-semibold text-charcoal">
                          <div className="flex items-center gap-1.5">
                            {isProposed && <CheckCircle2 className="w-3.5 h-3.5 text-forest shrink-0" />}
                            <span>{e.baseline_name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-charcoal/70">{e.dataset_size} items</td>
                        <td className="py-3 px-3 text-forest font-bold">{Number(e.metric_purity).toFixed(4)}</td>
                        <td className="py-3 px-3 text-charcoal">{Number(e.metric_ari).toFixed(4)}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              Number(e.metric_constraint_violation_rate) === 0
                                ? 'bg-mint text-forest'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {(Number(e.metric_constraint_violation_rate) * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-charcoal/70">{Number(e.latency_ms).toFixed(1)} ms</td>
                        <td className="py-3 px-3 text-charcoal/50 text-[10px]">
                          {new Date(e.created_at).toLocaleTimeString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-charcoal/60 bg-ivory rounded-xl">
              No benchmark runs recorded yet. Click 'Execute Benchmark Run' above to compute live metrics.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

