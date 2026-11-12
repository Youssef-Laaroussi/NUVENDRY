import React, { useEffect, useState, useCallback } from 'react';
import { AGGridDemandTable } from '../../components/AGGridDemandTable';
import { api, useSyncRefresh } from '../../api/client';
import { DemandCluster } from '../../types';
import { useNavigate } from 'react-router-dom';
import { Loader2, Layers, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export const AccountDemandIntelligence: React.FC = () => {
  const navigate = useNavigate();
  const [clusters, setClusters] = useState<DemandCluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [clustering, setClustering] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchClusters = useCallback(async () => {
    try {
      const data = await api.getClusters();
      setClusters(data);
    } catch (err) {
      console.error('Failed to load clusters', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClusters();
  }, [fetchClusters]);

  useSyncRefresh(['clusters', 'demands'], fetchClusters);

  const handleRunClustering = async () => {
    if (clustering) return;
    setClustering(true);
    setFeedback(null);
    try {
      const results = await api.matchDemands();
      setClusters(results);
      setFeedback({
        type: 'success',
        message: `AI clustering finished: ${results.length} constraint-validated opportunity clusters synchronized.`,
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'AI clustering run failed.',
      });
    } finally {
      setClustering(false);
    }
  };

  const handleGenerateOffer = (clusterId: string) => {
    navigate(`/merchant/offer-studio?cluster_id=${encodeURIComponent(clusterId)}`);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-forest font-mono">
              AI Market Aggregation
            </span>
            <h1 className="text-2xl font-serif text-charcoal mt-1">Demand Intelligence</h1>
            <p className="text-xs text-charcoal/60">
              Aggregated learner requests grouped by semantic similarity and hard constraint validation.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRunClustering}
            disabled={clustering}
            className="nv-btn-press inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-forest text-ivory text-xs font-semibold hover:bg-charcoal disabled:opacity-60 transition-colors shrink-0 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
          >
            {clustering ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span>{clustering ? 'Clustering...' : 'Re-cluster Demands'}</span>
          </button>
        </div>

        {feedback && (
          <div
            role={feedback.type === 'error' ? 'alert' : 'status'}
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
              feedback.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-mint/50 border-forest/20 text-forest font-medium'
            }`}
          >
            {feedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-forest" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* AG Grid Operational Table */}
        <div className="bg-white rounded-2xl border border-warmgray p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-charcoal text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-forest" />
              Active Opportunities Table (Sortable & Filterable)
            </h3>
            <span className="text-xs text-charcoal/50 font-mono">{clusters.length} Opportunities Found</span>
          </div>

          {loading ? (
            <div className="py-20 text-center text-xs text-charcoal/60">
              Loading demand intelligence data...
            </div>
          ) : (
            <AGGridDemandTable
              clusters={clusters}
              onGenerateOffer={handleGenerateOffer}
            />
          )}
        </div>
      </div>
    </>
  );
};
