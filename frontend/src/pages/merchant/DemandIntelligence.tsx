import React, { useEffect, useState } from 'react';
import { AGGridDemandTable } from '../../components/AGGridDemandTable';
import { api } from '../../api/client';
import { DemandCluster } from '../../types';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, Layers, RefreshCw } from 'lucide-react';

export const DemandIntelligence: React.FC = () => {
  const navigate = useNavigate();
  const [clusters, setClusters] = useState<DemandCluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [clustering, setClustering] = useState(false);

  const fetchClusters = async () => {
    setLoading(true);
    try {
      const data = await api.getClusters();
      setClusters(data);
    } catch (err) {
      console.error('Failed to load clusters', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClusters();
  }, []);

  const handleRunClustering = async () => {
    setClustering(true);
    try {
      const results = await api.matchDemands();
      setClusters(results);
    } catch (err) {
      console.error('Clustering failed', err);
    } finally {
      setClustering(false);
    }
  };

  const handleGenerateOffer = async (clusterId: string) => {
    navigate(`/merchant/offer-studio?cluster_id=${clusterId}`);
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
            onClick={handleRunClustering}
            disabled={clustering}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-forest text-ivory text-xs font-semibold hover:bg-charcoal transition-colors shrink-0 shadow-xs"
          >
            {clustering ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span>Re-cluster Demands</span>
          </button>
        </div>

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

