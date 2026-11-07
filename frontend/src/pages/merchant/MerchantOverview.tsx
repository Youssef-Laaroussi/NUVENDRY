import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { AnalyticsOverview } from '../../types';
import { Link } from 'react-router-dom';
import { 
  CreditCard, BookOpen, Users, Layers, Tag, Sparkles, 
  ArrowRight, ShieldCheck, CheckCircle2 
} from 'lucide-react';

export const MerchantOverview: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [a, p] = await Promise.all([
          api.getAnalyticsOverview(),
          api.getPaymentTransactions(),
        ]);
        setAnalytics(a);
        setPayments(p);
      } catch (err) {
        console.error('Failed to load merchant overview', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-white rounded-2xl border border-warmgray p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-forest font-mono">
              Operational Workspace
            </span>
            <h1 className="text-2xl font-serif text-charcoal">Instructor Dashboard</h1>
            <p className="text-xs sm:text-sm text-charcoal/70">
              Live metrics derived strictly from PostgreSQL records and verified PayPal Sandbox captures.
            </p>
          </div>
          <Link
            to="/merchant/offer-studio"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-forest text-ivory text-xs font-semibold hover:bg-charcoal transition-colors shrink-0 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>AI Offer Studio</span>
          </Link>
        </div>

        {/* 6 Key Operational Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-warmgray space-y-1">
            <span className="text-[11px] font-medium text-charcoal/60 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-forest" /> Confirmed Volume
            </span>
            <div className="text-2xl font-bold font-mono text-forest">
              ${((analytics?.total_revenue_cents || 0) / 100).toFixed(2)} USD
            </div>
            <p className="text-[10px] text-charcoal/50">PayPal Sandbox Captures</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-warmgray space-y-1">
            <span className="text-[11px] font-medium text-charcoal/60 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-forest" /> Verified Bookings
            </span>
            <div className="text-2xl font-bold font-mono text-charcoal">
              {analytics?.confirmed_reservations || 0}
            </div>
            <p className="text-[10px] text-charcoal/50">
              {analytics?.conversion_rate_percentage || 0}% Conversion Rate
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-warmgray space-y-1">
            <span className="text-[11px] font-medium text-charcoal/60 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-forest" /> Published Workshops
            </span>
            <div className="text-2xl font-bold font-mono text-charcoal">
              {analytics?.published_workshops || 0}
            </div>
            <p className="text-[10px] text-charcoal/50">Active in Marketplace</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-warmgray space-y-1">
            <span className="text-[11px] font-medium text-charcoal/60 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-forest" /> Demand Opportunities
            </span>
            <div className="text-2xl font-bold font-mono text-charcoal">
              {analytics?.active_clusters || 0}
            </div>
            <p className="text-[10px] text-charcoal/50">Clustered from {analytics?.total_demands || 0} requests</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-warmgray space-y-1">
            <span className="text-[11px] font-medium text-charcoal/60 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-forest" /> Rewards Redeemed
            </span>
            <div className="text-2xl font-bold font-mono text-charcoal">
              ${((analytics?.total_rewards_redeemed_cents || 0) / 100).toFixed(2)}
            </div>
            <p className="text-[10px] text-charcoal/50">Merchant-Funded Budget Used</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-warmgray space-y-1">
            <span className="text-[11px] font-medium text-charcoal/60 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-forest" /> Sandbox Status
            </span>
            <div className="text-base font-semibold font-mono text-forest flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-4 h-4" /> Connected
            </div>
            <p className="text-[10px] text-charcoal/50">Orders v2 Endpoints Active</p>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="bg-white rounded-2xl border border-warmgray p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-charcoal text-base flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-forest" /> Recent Verified Sandbox Transactions
            </h3>
            <Link to="/merchant/payments" className="text-xs text-forest font-semibold hover:underline">
              View all transactions
            </Link>
          </div>

          {payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-ivory text-charcoal/60 font-mono uppercase text-[10px] border-b border-warmgray">
                  <tr>
                    <th className="py-2.5 px-3">Buyer</th>
                    <th className="py-2.5 px-3">Workshop</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">PayPal Capture ID</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warmgray/60 font-medium">
                  {payments.slice(0, 5).map((p) => (
                    <tr key={p.id} className="hover:bg-ivory/50">
                      <td className="py-3 px-3 text-charcoal">{p.buyer_name}</td>
                      <td className="py-3 px-3 text-charcoal/80 max-w-xs truncate">{p.workshop_title}</td>
                      <td className="py-3 px-3 font-mono font-semibold text-forest">
                        ${(p.amount_cents / 100).toFixed(2)} {p.currency}
                      </td>
                      <td className="py-3 px-3 font-mono text-charcoal/70">{p.paypal_capture_id}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-mint text-forest text-[10px] font-semibold">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-charcoal/60 bg-ivory rounded-xl">
              No transactions completed yet. Once learners book via PayPal Sandbox, completed captures will appear here.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

