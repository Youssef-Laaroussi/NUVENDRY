import React, { useEffect, useState, useCallback } from 'react';
import { api, useSyncRefresh } from '../../api/client';
import { Share2, Copy, Check, Users, DollarSign, ShieldCheck } from 'lucide-react';

export const LearnerReferrals: React.FC = () => {
  const [referralData, setReferralData] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.getMyReferrals();
      setReferralData(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useSyncRefresh(['rewards', 'reservations'], load);

  const referralUrl = `${window.location.origin}/sign-up?ref=${referralData?.referral_code || ''}`;

  const copyToClipboard = () => {
    if (!referralData?.referral_code) return;
    navigator.clipboard?.writeText(referralUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-forest font-mono">
            Growth & Community
          </span>
          <h1 className="text-2xl font-serif text-charcoal mt-1">Referral Rewards</h1>
          <p className="text-xs text-charcoal/60">
            Invite colleagues and peers. When a referred friend completes their first paid workshop, you earn $10 in store credit.
          </p>
        </div>

        {/* Link Share Box */}
        <div className="bg-white rounded-2xl border border-warmgray p-6 sm:p-8 space-y-4 shadow-xs">
          <label htmlFor="referral-url-input" className="text-xs font-semibold text-charcoal uppercase tracking-wider block">
            Your Personal Referral Link
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              id="referral-url-input"
              type="text"
              readOnly
              value={referralUrl}
              onClick={(e) => (e.currentTarget as HTMLInputElement).select()}
              className="flex-1 p-3 bg-ivory border border-warmgray rounded-xl text-xs font-mono text-charcoal select-all focus:outline-hidden focus:ring-2 focus:ring-forest"
            />
            <button
              type="button"
              onClick={copyToClipboard}
              disabled={!referralData?.referral_code}
              className="nv-btn-press px-4 py-3 bg-forest hover:bg-charcoal disabled:opacity-60 text-ivory text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shrink-0 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
            >
              {copied ? <Check className="w-4 h-4 text-mint" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Link'}</span>
            </button>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-charcoal/50">
            <ShieldCheck className="w-4 h-4 text-forest" />
            <span>Anti-fraud verified: Self-referrals and duplicate claims are automatically rejected.</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-warmgray space-y-1">
            <span className="text-xs text-charcoal/60 flex items-center gap-1">
              <Users className="w-4 h-4 text-forest" /> Total Invites
            </span>
            <div className="text-2xl font-bold font-mono text-charcoal">
              {referralData?.total_referrals || 0}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-warmgray space-y-1">
            <span className="text-xs text-charcoal/60 flex items-center gap-1">
              <Share2 className="w-4 h-4 text-forest" /> Pending Bookings
            </span>
            <div className="text-2xl font-bold font-mono text-amber-700">
              {referralData?.pending_referrals || 0}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-warmgray space-y-1">
            <span className="text-xs text-charcoal/60 flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-forest" /> Earned Store Credit
            </span>
            <div className="text-2xl font-bold font-mono text-forest">
              ${((referralData?.total_earned_cents || 0) / 100).toFixed(2)}
            </div>
          </div>
        </div>

        {referralData?.referrals && referralData.referrals.length > 0 && (
          <div className="bg-white rounded-2xl border border-warmgray p-6 space-y-3 shadow-xs">
            <h3 className="font-semibold text-sm text-charcoal">Referral Activity</h3>
            <div className="space-y-2">
              {referralData.referrals.map((ref: any) => (
                <div
                  key={ref.id}
                  className="p-3 rounded-xl bg-ivory border border-warmgray/60 flex items-center justify-between text-xs"
                >
                  <span className="font-mono text-charcoal/70">
                    Invite #{ref.id.slice(0, 8)} • {new Date(ref.created_at).toLocaleDateString()}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold capitalize ${
                      ref.status === 'qualified' ? 'bg-mint text-forest' : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    {ref.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
