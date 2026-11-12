import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-6 text-charcoal">
        <h1 className="text-3xl font-serif">Terms of Service & Sandbox Disclosure</h1>
        <p className="text-xs text-charcoal/60">Last updated: November 2026</p>
        
        <div className="space-y-4 text-xs sm:text-sm text-charcoal/80 leading-relaxed bg-white p-8 rounded-2xl border border-warmgray">
          <div className="p-4 rounded-xl bg-mint/50 border border-forest/30 font-medium text-forest text-xs">
            Payments are processed in PayPal Sandbox using simulated funds.
          </div>

          <h2 className="text-base font-semibold text-charcoal">1. Sandbox Payments</h2>
          <p>
            NUVENDRY verifies test orders through the PayPal Orders v2 API.
          </p>

          <h2 className="text-base font-semibold text-charcoal">2. Merchant-Funded Rewards</h2>
          <p>
            Store credit and reward campaigns are merchant-specific promotional allocations enforced on the application server. Store credit is not redeemable for cash and cannot be withdrawn.
          </p>

          <h2 className="text-base font-semibold text-charcoal">3. Seat Reservations & Holds</h2>
          <p>
            Seat holds expire after 15 minutes if payment is not authoritatively captured by PayPal. Overselling prevention logic locks seat counts during checkout capture.
          </p>
        </div>
      </div>
    </>
  );
};

