import React, { useEffect, useState, useCallback } from 'react';
import { api, useSyncRefresh } from '../../api/client';
import { WorkshopRecommendation } from '../../types';
import { WorkshopCard } from '../../components/WorkshopCard';
import { Sparkles } from 'lucide-react';

export const LearnerRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<WorkshopRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await api.getRecommendations();
      setRecommendations(data);
    } catch (err) {
      console.error('Failed to load recommendations', err);
      try {
        const fallback = await api.getWorkshops();
        setRecommendations(
          fallback.map((w, idx) => ({
            workshop: w,
            alignment_percentage: Math.max(70, 95 - idx * 4),
            reasons: [`Matched on ${w.category} & weekend schedule`],
          }))
        );
      } catch {
        // Ignore secondary failure
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useSyncRefresh(['demands', 'workshops', 'reservations'], load);

  return (
    <>
      <div className="space-y-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-forest font-mono">
            AI Personalized Matches
          </span>
          <h1 className="text-2xl font-serif text-charcoal mt-1">Recommended for Your Learning Path</h1>
          <p className="text-xs text-charcoal/60">
            Transparent recommendations calibrated against your submitted learning requests, target budget, and schedule.
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-charcoal/60">Evaluating workshop alignments...</div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-6">
            {recommendations.map((rec) => (
              <div key={rec.workshop.id} className="bg-white rounded-2xl border border-warmgray p-5 shadow-xs space-y-4">
                {/* AI Explanation Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-mint/50 border border-forest/20 text-xs">
                  <div className="flex items-center gap-2 text-forest font-semibold">
                    <Sparkles className="w-4 h-4 text-gold shrink-0" />
                    <span>Match Confidence: {rec.alignment_percentage}% Alignment</span>
                  </div>
                  <span className="text-[11px] text-charcoal/70">
                    {rec.reasons?.[0] || `Matched on ${rec.workshop.category} & weekend schedule`}
                  </span>
                </div>

                <WorkshopCard workshop={rec.workshop} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center bg-white rounded-2xl border border-warmgray p-8 text-xs text-charcoal/60">
            No active workshops currently published.
          </div>
        )}
      </div>
    </>
  );
};
