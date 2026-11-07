import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Share2, Copy, Check, Users, DollarSign, ShieldCheck } from 'lucide-react';

export const LearnerReferrals: React.FC = () => {
  const [referralData, setReferralData] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyReferrals().then(setReferralData).catch(console.error).finally(() => setLoading(false));
  }, []);

  const referralUrl = `${window.location.origin}/sign-up?ref=${referralData?.referral_code || ''}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralUrl);
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
          <label className="text-xs font-semibold text-charcoal uppercase tracking-wider block">
            Your Personal Referral Link
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              readOnly
              value={referralUrl}
              className="flex-1 p-3 bg-ivory border border-warmgray rounded-xl text-xs font-mono text-charcoal select-all"
            />
            <button
              onClick={copyToClipboard}
              className="px-4 py-3 bg-forest hover:bg-charcoal text-ivory text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shrink-0 shadow-xs"
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
      </div>
    </>
  );
};

