import React from 'react';
import { Link } from 'react-router-dom';
import { Tag, TrendingUp, ShieldCheck, Gift, Users, Award, CheckCircle2 } from 'lucide-react';

export const RewardsPage: React.FC = () => {
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-gold font-mono">
            Merchant-Funded Incentives
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif text-charcoal">
            Transparent Platform Rewards
          </h1>
          <p className="text-sm sm:text-base text-charcoal/70 leading-relaxed">
            All promotions on NUVENDRY are funded directly by instructors and merchants to reward early commitments, referrals, and continuous learning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-warmgray space-y-3">
            <div className="flex items-center gap-2 text-forest">
              <Tag className="w-5 h-5" />
              <h3 className="font-semibold text-base text-charcoal">1. Welcome Discount</h3>
            </div>
            <p className="text-xs text-charcoal/70 leading-relaxed">
              New learners enjoy a merchant-configured discount on their first verified booking. The engine validates that no previous bookings exist on the learner's account.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-warmgray space-y-3">
            <div className="flex items-center gap-2 text-forest">
              <TrendingUp className="w-5 h-5" />
              <h3 className="font-semibold text-base text-charcoal">2. Early-Bird Discount</h3>
            </div>
            <p className="text-xs text-charcoal/70 leading-relaxed">
              Encourages early workshop commitments. Automatically validated server-side if booking is completed at least 3 days before the scheduled session.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-warmgray space-y-3">
            <div className="flex items-center gap-2 text-forest">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-semibold text-base text-charcoal">3. Store Credit</h3>
            </div>
            <p className="text-xs text-charcoal/70 leading-relaxed">
              Ledger-backed credit balances awarded for loyal participation and community contributions. Applied directly to reduce checkout totals. Never cash-withdrawable.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-warmgray space-y-3">
            <div className="flex items-center gap-2 text-forest">
              <Gift className="w-5 h-5" />
              <h3 className="font-semibold text-base text-charcoal">4. Digital Gifts</h3>
            </div>
            <p className="text-xs text-charcoal/70 leading-relaxed">
              Non-cash digital benefits such as comprehensive code repositories, production checklists, and lecture slides delivered automatically upon verified payment.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-warmgray space-y-3">
            <div className="flex items-center gap-2 text-forest">
              <Users className="w-5 h-5" />
              <h3 className="font-semibold text-base text-charcoal">5. Referral Rewards</h3>
            </div>
            <p className="text-xs text-charcoal/70 leading-relaxed">
              Share your personal referral link. When an eligible referred friend completes their first paid workshop, you automatically receive $10 in store credit.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-warmgray space-y-3">
            <div className="flex items-center gap-2 text-gold">
              <Award className="w-5 h-5" />
              <h3 className="font-semibold text-base text-charcoal">6. Achievement Badges</h3>
            </div>
            <p className="text-xs text-charcoal/70 leading-relaxed">
              Non-financial credentials awarded based strictly on verified attendance records (never merely for initiating checkout).
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

