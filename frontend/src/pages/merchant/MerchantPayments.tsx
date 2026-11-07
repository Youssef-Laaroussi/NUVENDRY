import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { CreditCard, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const MerchantPayments: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPaymentTransactions()
      .then(setPayments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-forest font-mono">
              PayPal Orders v2
            </span>
            <span className="text-[10px] bg-forest text-ivory px-2 py-0.5 rounded-full font-mono">
              Sandbox Verified
            </span>
          </div>
          <h1 className="text-2xl font-serif text-charcoal mt-1">Transaction Ledger</h1>
          <p className="text-xs text-charcoal/60">
            Authoritative payment captures verified directly via PayPal Sandbox API. All monetary totals are stored in integer cents.
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-charcoal/60">Loading transaction ledger...</div>
        ) : payments.length > 0 ? (
          <div className="bg-white rounded-2xl border border-warmgray overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-ivory text-charcoal/60 font-mono uppercase text-[10px] border-b border-warmgray">
                  <tr>
                    <th className="py-3 px-4">Local Order ID</th>
                    <th className="py-3 px-4">PayPal Order ID</th>
                    <th className="py-3 px-4">PayPal Capture ID</th>
                    <th className="py-3 px-4">Buyer</th>
                    <th className="py-3 px-4">Workshop</th>
                    <th className="py-3 px-4">Captured Amount</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warmgray/60 font-medium">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-ivory/50">
                      <td className="py-3 px-4 font-mono text-[11px] text-charcoal/60">
                        {p.id.slice(0, 8)}...
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-charcoal">
                        {p.paypal_order_id}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-forest font-semibold">
                        {p.paypal_capture_id}
                      </td>
                      <td className="py-3 px-4 text-charcoal">{p.buyer_name}</td>
                      <td className="py-3 px-4 text-charcoal/80 max-w-xs truncate">{p.workshop_title}</td>
                      <td className="py-3 px-4 font-mono font-bold text-forest">
                        ${(p.amount_cents / 100).toFixed(2)} {p.currency}
                      </td>
                      <td className="py-3 px-4 text-charcoal/60 text-[11px]">
                        {new Date(p.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-mint text-forest text-[10px] font-semibold">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="py-16 text-center bg-white rounded-2xl border border-warmgray p-8 space-y-3">
            <CreditCard className="w-8 h-8 text-charcoal/30 mx-auto" />
            <h3 className="font-semibold text-sm text-charcoal">No Sandbox transactions yet</h3>
            <p className="text-xs text-charcoal/60">
              Transactions captured through the PayPal Sandbox checkout interface will be recorded here in real-time.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

