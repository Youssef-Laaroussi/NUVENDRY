import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { RewardsDashboard } from '../../types';
import { Tag, Gift, Award, ShieldCheck, Download, Key } from 'lucide-react';

export const LearnerRewards: React.FC = () => {
  const [rewards, setRewards] = useState<RewardsDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getMyRewards();
        setRewards(data);
      } catch (err) {
        console.error('Failed to load rewards dashboard', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      <div className="space-y-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-gold font-mono">
            Platform Benefits
          </span>
          <h1 className="text-2xl font-serif text-charcoal mt-1">Rewards, Store Credit & Badges</h1>
          <p className="text-xs text-charcoal/60">
            Track your available merchant-funded store credit, unlocked digital materials, and verified achievements.
          </p>
        </div>

        {/* Store Credit Balance Banner */}
        <div className="bg-white rounded-2xl border border-warmgray p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-charcoal/60 uppercase tracking-wider">
              Available Store Credit
            </span>
            <div className="text-3xl font-bold font-mono text-forest">
              ${((rewards?.store_credit_cents || 0) / 100).toFixed(2)} {rewards?.currency || 'USD'}
            </div>
            <p className="text-xs text-charcoal/60 max-w-md">
              Automatically applied to reduce your checkout total at reservation time. Ledger-tracked and merchant-specific.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-ivory border border-warmgray text-xs space-y-1 sm:max-w-xs shrink-0">
            <span className="font-semibold text-charcoal flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-forest" />
              Welcome Eligibility
            </span>
            <p className="text-charcoal/70 text-[11px]">
              {rewards?.first_purchase_eligible
                ? 'Eligible for new learner discount on your first workshop purchase.'
                : 'First purchase completed; welcome incentive consumed.'}
            </p>
          </div>
        </div>

        {/* Unlocked Digital Gifts */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-charcoal flex items-center gap-2">
            <Gift className="w-4 h-4 text-forest" /> Unlocked Digital Gifts & Materials
          </h3>

          {rewards?.digital_gifts && rewards.digital_gifts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rewards.digital_gifts.map((gift) => (
                <div key={gift.id} className="bg-white rounded-xl border border-warmgray p-5 space-y-3 shadow-xs">
                  <div className="flex items-start justify-between">
                    <span className="font-semibold text-xs text-charcoal">{gift.title}</span>
                    <span className="text-[10px] bg-mint text-forest px-2 py-0.5 rounded-full font-mono font-semibold">
                      Unlocked
                    </span>
                  </div>
                  {gift.access_code && (
                    <div className="flex items-center gap-1.5 text-xs font-mono bg-ivory p-2 rounded-lg border border-warmgray/60">
                      <Key className="w-3.5 h-3.5 text-charcoal/50" />
                      <span>Code: <strong>{gift.access_code}</strong></span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-warmgray/50 flex justify-between items-center text-xs">
                    <span className="text-charcoal/50 text-[11px]">
                      {new Date(gift.redeemed_at).toLocaleDateString()}
                    </span>
                    <a
                      href={gift.download_url || '#'}
                      onClick={(e) => {
                        e.preventDefault();
                        alert(`Accessing materials for: ${gift.title}`);
                      }}
                      className="inline-flex items-center gap-1 text-forest font-semibold hover:underline"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Materials
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center bg-white rounded-xl border border-warmgray text-xs text-charcoal/60">
              No digital gifts unlocked yet. Digital starter kits and code repositories unlock automatically upon confirmed PayPal workshop booking.
            </div>
          )}
        </div>

        {/* Achievement Badges */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-charcoal flex items-center gap-2">
            <Award className="w-4 h-4 text-gold" /> Verified Achievement Badges
          </h3>

          {rewards?.achievement_badges && rewards.achievement_badges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {rewards.achievement_badges.map((b) => (
                <div key={b.badge_id} className="bg-white rounded-xl border border-warmgray p-4 space-y-2 shadow-xs text-center">
                  <div className="w-10 h-10 rounded-full bg-gold/15 text-gold flex items-center justify-center mx-auto">
                    <Award className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-xs text-charcoal">{b.title}</h4>
                  <p className="text-[11px] text-charcoal/70 leading-relaxed">{b.description}</p>
                  <span className="inline-block text-[10px] font-mono text-forest bg-mint px-2 py-0.5 rounded-full font-semibold">
                    Verified
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center bg-white rounded-xl border border-warmgray text-xs text-charcoal/60">
              Badges are awarded from verified internal events such as completed bookings and confirmed workshop attendance.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

