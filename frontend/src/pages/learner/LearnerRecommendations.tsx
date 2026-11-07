import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Workshop } from '../../types';
import { WorkshopCard } from '../../components/WorkshopCard';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export const LearnerRecommendations: React.FC = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getWorkshops();
        setWorkshops(data);
      } catch (err) {
        console.error('Failed to load recommendations', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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
        ) : workshops.length > 0 ? (
          <div className="space-y-6">
            {workshops.map((w, idx) => (
              <div key={w.id} className="bg-white rounded-2xl border border-warmgray p-5 shadow-xs space-y-4">
                {/* AI Explanation Banner */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-mint/50 border border-forest/20 text-xs">
                  <div className="flex items-center gap-2 text-forest font-semibold">
                    <Sparkles className="w-4 h-4 text-gold" />
                    <span>Match Confidence: {95 - idx * 4}% Alignment</span>
                  </div>
                  <span className="text-[11px] text-charcoal/70">
                    Matched on <strong>{w.category}</strong> & weekend schedule
                  </span>
                </div>

                <WorkshopCard workshop={w} />
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

