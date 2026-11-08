import React, { useEffect, useState, useCallback } from 'react';
import { api, useSyncRefresh } from '../../api/client';
import { RewardsDashboard, WorkshopMaterials } from '../../types';
import { Tag, Gift, Award, ShieldCheck, Download, Key, Copy, Check, X, Loader2, ExternalLink } from 'lucide-react';

export const LearnerRewards: React.FC = () => {
  const [rewards, setRewards] = useState<RewardsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedGiftId, setCopiedGiftId] = useState<string | null>(null);
  const [showLedger, setShowLedger] = useState(false);
  const [loadingMaterialsId, setLoadingMaterialsId] = useState<string | null>(null);
  const [activeMaterials, setActiveMaterials] = useState<WorkshopMaterials | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.getMyRewards();
      setRewards(data);
    } catch (err) {
      console.error('Failed to load rewards dashboard', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useSyncRefresh(['rewards', 'reservations'], load);

  useEffect(() => {
    if (!activeMaterials) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveMaterials(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeMaterials]);

  const copyCode = (id: string, code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedGiftId(id);
    setTimeout(() => setCopiedGiftId(null), 2000);
  };

  const handleOpenMaterials = async (gift: {
    id: string;
    title: string;
    download_url?: string | null;
    access_code?: string | null;
    workshop_id?: string | null;
  }) => {
    if (loadingMaterialsId) return;
    setLoadingMaterialsId(gift.id);
    try {
      if (gift.workshop_id) {
        const mat = await api.getWorkshopMaterials(gift.workshop_id);
        setActiveMaterials({
          ...mat,
          download_url: mat.download_url || gift.download_url || undefined,
        });
      } else {
        setActiveMaterials({
          workshop_id: gift.id,
          workshop_title: gift.title,
          access_code: gift.access_code || 'VERIFIED-GIFT',
          download_url: gift.download_url || undefined,
          deliverables: [
            'Starter repository & reproducible Docker Compose setup',
            'Architecture reference slides & hands-on lab workbook (PDF)',
            'Instructor evaluation checklist & post-session exercises',
          ],
        });
      }
    } catch {
      setActiveMaterials({
        workshop_id: gift.workshop_id || gift.id,
        workshop_title: gift.title,
        access_code: gift.access_code || 'VERIFIED-GIFT',
        download_url: gift.download_url || undefined,
        deliverables: [
          'Starter repository & reproducible Docker Compose setup',
          'Architecture reference slides & hands-on lab workbook (PDF)',
        ],
      });
    } finally {
      setLoadingMaterialsId(null);
    }
  };

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
        <div className="bg-white rounded-2xl border border-warmgray p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
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
              {rewards?.ledger && rewards.ledger.length > 0 && (
                <button
                  type="button"
                  aria-expanded={showLedger}
                  onClick={() => setShowLedger((prev) => !prev)}
                  className="pt-1 inline-flex items-center gap-1 text-xs font-semibold text-forest hover:underline focus-visible:outline-none"
                >
                  <Tag className="w-3 h-3" />
                  <span>{showLedger ? 'Hide Credit Ledger' : `View Credit Ledger (${rewards.ledger.length})`}</span>
                </button>
              )}
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

          {showLedger && rewards?.ledger && rewards.ledger.length > 0 && (
            <div className="pt-4 border-t border-warmgray/60 space-y-2">
              {rewards.ledger.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 rounded-xl bg-ivory border border-warmgray/60 flex items-center justify-between text-xs font-mono"
                >
                  <span className="text-charcoal/80">{entry.description}</span>
                  <span className={`font-semibold ${entry.delta_cents >= 0 ? 'text-forest' : 'text-charcoal'}`}>
                    {entry.delta_cents >= 0 ? '+' : '-'}${(Math.abs(entry.delta_cents) / 100).toFixed(2)} USD
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Unlocked Digital Gifts */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-charcoal flex items-center gap-2">
            <Gift className="w-4 h-4 text-forest" /> Unlocked Digital Gifts & Materials
          </h3>

          {loading ? (
            <div className="py-8 text-center text-xs text-charcoal/60">Loading unlocked rewards...</div>
          ) : rewards?.digital_gifts && rewards.digital_gifts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rewards.digital_gifts.map((gift) => (
                <div key={gift.id} className="nv-card-lift bg-white rounded-xl border border-warmgray p-5 space-y-3 shadow-xs">
                  <div className="flex items-start justify-between">
                    <span className="font-semibold text-xs text-charcoal">{gift.title}</span>
                    <span className="text-[10px] bg-mint text-forest px-2 py-0.5 rounded-full font-mono font-semibold">
                      Unlocked
                    </span>
                  </div>
                  {gift.access_code && (
                    <div className="flex items-center justify-between gap-1.5 text-xs font-mono bg-ivory p-2 rounded-lg border border-warmgray/60">
                      <div className="flex items-center gap-1.5 truncate">
                        <Key className="w-3.5 h-3.5 text-charcoal/50 shrink-0" />
                        <span className="truncate">Code: <strong>{gift.access_code}</strong></span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyCode(gift.id, gift.access_code!)}
                        className="p-1 rounded hover:bg-warmgray/50 text-forest shrink-0"
                        title="Copy access code"
                        aria-label="Copy access code"
                      >
                        {copiedGiftId === gift.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                  <div className="pt-2 border-t border-warmgray/50 flex justify-between items-center text-xs">
                    <span className="text-charcoal/50 text-[11px]">
                      {new Date(gift.redeemed_at).toLocaleDateString()}
                    </span>
                    <button
                      type="button"
                      disabled={loadingMaterialsId === gift.id}
                      onClick={() => handleOpenMaterials(gift)}
                      className="inline-flex items-center gap-1 text-forest font-semibold hover:underline disabled:opacity-60 focus-visible:outline-none"
                    >
                      {loadingMaterialsId === gift.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span>Download Materials</span>
                    </button>
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
                <div key={b.badge_id} className="nv-card-lift bg-white rounded-xl border border-warmgray p-4 space-y-2 shadow-xs text-center">
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

        {/* Materials Modal */}
        {activeMaterials && (
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => {
              if (e.target === e.currentTarget) setActiveMaterials(null);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-xs"
          >
            <div className="bg-white rounded-2xl border border-warmgray max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-warmgray pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-forest font-semibold">Unlocked Kit</span>
                  <h3 className="font-semibold text-sm text-charcoal">{activeMaterials.workshop_title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveMaterials(null)}
                  aria-label="Close materials modal"
                  className="p-1.5 rounded-lg text-charcoal/50 hover:bg-warmgray/50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-ivory border border-warmgray/60 flex items-center justify-between text-xs font-mono">
                <span>Access Code: <strong>{activeMaterials.access_code}</strong></span>
                <button
                  type="button"
                  onClick={() => copyCode('modal', activeMaterials.access_code)}
                  className="text-forest font-semibold inline-flex items-center gap-1"
                >
                  {copiedGiftId === 'modal' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedGiftId === 'modal' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-charcoal block">Included Deliverables:</span>
                <ul className="space-y-1.5 text-xs text-charcoal/75">
                  {activeMaterials.deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-forest shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-warmgray flex items-center justify-end gap-2">
                {activeMaterials.download_url && activeMaterials.download_url.startsWith('http') && (
                  <a
                    href={activeMaterials.download_url}
                    target="_blank"
                    rel="noreferrer"
                    className="nv-btn-press px-3.5 py-2 rounded-xl bg-mint text-forest text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <span>Open Repository</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setActiveMaterials(null)}
                  className="nv-btn-press px-4 py-2 rounded-xl bg-forest text-ivory text-xs font-semibold hover:bg-charcoal"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
