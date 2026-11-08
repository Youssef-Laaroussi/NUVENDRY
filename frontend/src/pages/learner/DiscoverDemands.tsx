import React, { useEffect, useState, useCallback } from 'react';
import { api, useSyncRefresh } from '../../api/client';
import { DemandCluster, Workshop } from '../../types';
import { WorkshopCard } from '../../components/WorkshopCard';
import { Layers, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DiscoverDemands: React.FC = () => {
  const [clusters, setClusters] = useState<DemandCluster[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [c, w] = await Promise.all([api.getClusters(), api.getWorkshops()]);
      setClusters(c);
      setWorkshops(w);
    } catch (err) {
      console.error('Failed to load discovery data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useSyncRefresh(['clusters', 'workshops', 'reservations'], load);

  return (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-serif text-charcoal">Discover Workshops & Demand</h1>
          <p className="text-xs text-charcoal/60">
            See what topics are actively forming into workshops and book confirmed sessions.
          </p>
        </div>

        {/* Active Demand Clusters */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-charcoal flex items-center gap-2">
            <Layers className="w-4 h-4 text-forest" />
            Trending Demand Clusters
          </h3>
          {loading ? (
            <div className="py-8 text-center text-xs text-charcoal/60">Loading demand clusters...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {clusters.map((c) => (
                <Link
                  key={c.id}
                  to={`/workshops?search=${encodeURIComponent(c.name)}`}
                  className="nv-card-lift bg-white p-5 rounded-2xl border border-warmgray hover:border-forest/40 space-y-2 shadow-xs block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-xs text-charcoal">{c.name}</span>
                    <span className="font-mono text-xs font-semibold text-forest bg-mint px-2 py-0.5 rounded">
                      ${(c.avg_budget_cents / 100).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-charcoal/70 line-clamp-2">{c.summary}</p>
                  <div className="flex items-center justify-between text-[11px] text-charcoal/50 pt-2 border-t border-warmgray/60">
                    <span>{c.member_count} interested learners</span>
                    <span className="capitalize">{c.difficulty}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Published Workshops */}
        <div className="space-y-4 pt-4 border-t border-warmgray/60">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-charcoal flex items-center gap-2">
              <Compass className="w-4 h-4 text-forest" />
              Published Workshops Ready to Book
            </h3>
            <Link to="/workshops" className="text-xs font-semibold text-forest hover:underline">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-charcoal/60">Loading published workshops...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {workshops.map((w) => (
                <WorkshopCard key={w.id} workshop={w} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
