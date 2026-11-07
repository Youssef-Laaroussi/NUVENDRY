import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Tag, TrendingUp, ShieldCheck, Gift, Users, Award, 
  ArrowRight, Check, DollarSign, Calculator, HelpCircle
} from 'lucide-react';

export const RewardsShowcase: React.FC = () => {
  // Interactive Simulator State
  const [basePrice, setBasePrice] = useState<number>(39);
  const [applyWelcome, setApplyWelcome] = useState<boolean>(true);
  const [applyEarlyBird, setApplyEarlyBird] = useState<boolean>(false);
  const [applyStoreCredit, setApplyStoreCredit] = useState<boolean>(false);

  // Calculations
  const welcomeDiscount = applyWelcome ? 10 : 0;
  const earlyBirdDiscount = applyEarlyBird ? 5 : 0;
  const storeCreditDiscount = applyStoreCredit ? 10 : 0;
  const totalDeductions = welcomeDiscount + earlyBirdDiscount + storeCreditDiscount;
  const payableAmount = Math.max(basePrice - totalDeductions, 5); // Minimum floor

  return (
    <section className="py-20 bg-white border-t border-warmgray text-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint text-forest text-xs font-mono font-semibold uppercase tracking-wider mb-3">
            <Tag className="w-3.5 h-3.5 text-gold" />
            <span>Merchant-Funded Incentives</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-charcoal tracking-tight leading-tight mb-4">
            Transparent Platform Rewards
          </h2>
          <p className="text-base sm:text-lg text-charcoal/70 leading-relaxed">
            All incentives on NUVENDRY are funded directly by instructors and merchants to reward early commitments, referrals, and verified workshop attendance.
          </p>
        </div>

        {/* Two-Column Asymmetrical Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Calculator / Simulator */}
          <div className="lg:col-span-5 bg-ivory/80 rounded-2xl border border-warmgray p-6 sm:p-7 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-warmgray pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-forest" />
                <span className="font-semibold text-sm text-charcoal">Authoritative Reward Simulator</span>
              </div>
              <span className="text-[10px] font-mono text-charcoal/50 uppercase">Illustrative Model</span>
            </div>

            {/* Base Workshop Selection */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-charcoal/60 block">Select Target Workshop Fee:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { price: 29, label: '$29 (Intro)' },
                  { price: 39, label: '$39 (Standard)' },
                  { price: 55, label: '$55 (Deep Dive)' },
                ].map((item) => (
                  <button
                    key={item.price}
                    type="button"
                    onClick={() => setBasePrice(item.price)}
                    className={`py-2 px-2.5 rounded-lg text-xs font-medium border text-center transition-all ${
                      basePrice === item.price
                        ? 'bg-forest text-ivory font-semibold border-forest shadow-xs'
                        : 'bg-white border-warmgray text-charcoal/70 hover:bg-white/80'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Configurable Promotion Toggles */}
            <div className="space-y-2.5">
              <span className="text-xs font-mono uppercase text-charcoal/60 block">Toggle Eligible Promotions:</span>
              
              <label className="flex items-center justify-between p-3 rounded-xl bg-white border border-warmgray cursor-pointer hover:border-forest/40 transition-colors">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={applyWelcome}
                    onChange={(e) => setApplyWelcome(e.target.checked)}
                    className="w-4 h-4 text-forest rounded border-warmgray focus:ring-forest"
                  />
                  <div>
                    <div className="text-xs font-semibold text-charcoal">Welcome Discount</div>
                    <div className="text-[11px] text-charcoal/50">First verified purchase on account</div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-forest">-$10.00</span>
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-white border border-warmgray cursor-pointer hover:border-forest/40 transition-colors">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={applyEarlyBird}
                    onChange={(e) => setApplyEarlyBird(e.target.checked)}
                    className="w-4 h-4 text-forest rounded border-warmgray focus:ring-forest"
                  />
                  <div>
                    <div className="text-xs font-semibold text-charcoal">Early-Bird Commitment</div>
                    <div className="text-[11px] text-charcoal/50">Booked ≥ 3 days prior to session</div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-forest">-$5.00</span>
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-white border border-warmgray cursor-pointer hover:border-forest/40 transition-colors">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={applyStoreCredit}
                    onChange={(e) => setApplyStoreCredit(e.target.checked)}
                    className="w-4 h-4 text-forest rounded border-warmgray focus:ring-forest"
                  />
                  <div>
                    <div className="text-xs font-semibold text-charcoal">Redeem Store Credit</div>
                    <div className="text-[11px] text-charcoal/50">Ledger balance with this instructor</div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-forest">-$10.00</span>
              </label>
            </div>

            {/* Authoritative Calculation Box */}
            <div className="p-4 rounded-xl bg-mint/50 border border-forest/20 space-y-2 text-xs">
              <div className="flex justify-between text-charcoal/70">
                <span>Base Workshop Fee</span>
                <span className="font-mono">${basePrice}.00 USD</span>
              </div>
              <div className="flex justify-between text-forest font-medium">
                <span>Total Deductions Applied</span>
                <span className="font-mono">-${totalDeductions}.00 USD</span>
              </div>
              <div className="pt-2 border-t border-forest/20 flex justify-between font-bold text-sm text-charcoal">
                <span>Authoritative Amount Sent to PayPal:</span>
                <span className="font-mono text-forest text-base">${payableAmount}.00 USD</span>
              </div>
            </div>

            <p className="text-[10px] text-charcoal/50 text-center font-mono">
              Promotions are evaluated server-side. Not redeemable for cash.
            </p>
          </div>

          {/* Right Column: Structured 3-Tier Promotion Catalog */}
          <div className="lg:col-span-7 space-y-6">
            {/* Category A: Direct Price Deductions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-forest tracking-wider">
                <span className="w-5 h-5 rounded-full bg-mint text-forest flex items-center justify-center text-[10px] font-bold">A</span>
                <span>Direct Checkout Discounts</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-white border border-warmgray space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-forest">
                    <Tag className="w-4 h-4" />
                    <h4 className="font-semibold text-xs text-charcoal">1. Welcome Discount</h4>
                  </div>
                  <p className="text-[11px] text-charcoal/70 leading-relaxed">
                    Automatically applied on first-time learner bookings when verified by server history.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-warmgray space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-forest">
                    <TrendingUp className="w-4 h-4" />
                    <h4 className="font-semibold text-xs text-charcoal">2. Early-Bird Discount</h4>
                  </div>
                  <p className="text-[11px] text-charcoal/70 leading-relaxed">
                    Incentivizes early registration at least 3 days before scheduled live workshop date.
                  </p>
                </div>
              </div>
            </div>

            {/* Category B: Merchant Store Credit Ledger */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-forest tracking-wider">
                <span className="w-5 h-5 rounded-full bg-mint text-forest flex items-center justify-center text-[10px] font-bold">B</span>
                <span>Merchant-Specific Credit Ledger</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-white border border-warmgray space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-forest">
                    <ShieldCheck className="w-4 h-4" />
                    <h4 className="font-semibold text-xs text-charcoal">3. Store Credit</h4>
                  </div>
                  <p className="text-[11px] text-charcoal/70 leading-relaxed">
                    Internal ledger balance earned through promotions or refunds. Applicable only toward instructor's future sessions.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-warmgray space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-forest">
                    <Users className="w-4 h-4" />
                    <h4 className="font-semibold text-xs text-charcoal">4. Verified Referrals</h4>
                  </div>
                  <p className="text-[11px] text-charcoal/70 leading-relaxed">
                    Share a personal invite link. Credit is awarded only after the referred learner completes a paid booking.
                  </p>
                </div>
              </div>
            </div>

            {/* Category C: Learning Assets & Verified Credentials */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-forest tracking-wider">
                <span className="w-5 h-5 rounded-full bg-mint text-forest flex items-center justify-center text-[10px] font-bold">C</span>
                <span>Digital Assets & Verified Credentials</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-white border border-warmgray space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-forest">
                    <Gift className="w-4 h-4" />
                    <h4 className="font-semibold text-xs text-charcoal">5. Digital Gifts</h4>
                  </div>
                  <p className="text-[11px] text-charcoal/70 leading-relaxed">
                    Starter code repositories and reference cheat-sheets provided automatically upon confirmed payment.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-warmgray space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-gold">
                    <Award className="w-4 h-4" />
                    <h4 className="font-semibold text-xs text-charcoal">6. Achievement Badges</h4>
                  </div>
                  <p className="text-[11px] text-charcoal/70 leading-relaxed">
                    Non-financial credentials awarded based strictly on verified attendance records (never merely for initiating checkout).
                  </p>
                </div>
              </div>
            </div>

            {/* Section CTA */}
            <div className="pt-2">
              <Link
                to="/rewards"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:text-charcoal transition-colors"
              >
                <span>Read detailed platform rewards documentation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RewardsShowcase;

