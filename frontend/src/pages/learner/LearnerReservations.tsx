import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Reservation } from '../../types';
import { Ticket, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LearnerReservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getMyReservations();
        setReservations(data);
      } catch (err) {
        console.error('Failed to load reservations', err);
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
          <h1 className="text-2xl font-serif text-charcoal">My Reservations & Purchases</h1>
          <p className="text-xs text-charcoal/60">
            Real-time status of your workshop seat bookings and verified PayPal Sandbox transactions.
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-charcoal/60">Loading reservation records...</div>
        ) : reservations.length > 0 ? (
          <div className="space-y-4">
            {reservations.map((r) => {
              const isConfirmed = r.status === 'confirmed';
              return (
                <div key={r.id} className="bg-white rounded-2xl border border-warmgray p-6 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-charcoal/50">
                        Reservation #{r.id.slice(0, 8)}
                      </span>
                      <h3 className="font-semibold text-base text-charcoal">{r.workshop_title}</h3>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full self-start sm:self-auto ${
                        isConfirmed
                          ? 'bg-mint text-forest'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {isConfirmed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      <span className="capitalize">{r.status.replace('_', ' ')}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-ivory border border-warmgray/60 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-charcoal/50 block">Amount</span>
                      <strong className="text-forest text-sm font-semibold">
                        ${(r.final_amount_cents / 100).toFixed(2)} {r.currency}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-charcoal/50 block">PayPal Order</span>
                      <span className="text-charcoal/80 text-[11px] truncate block" title={r.paypal_order_id || 'N/A'}>
                        {r.paypal_order_id || 'Pending'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-charcoal/50 block">Capture ID</span>
                      <span className="text-charcoal/80 text-[11px] truncate block" title={r.paypal_capture_id || 'N/A'}>
                        {r.paypal_capture_id || 'Uncaptured'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-charcoal/50 block">Date</span>
                      <span className="text-charcoal/80 text-[11px]">
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {isConfirmed && (
                    <div className="flex items-center justify-between pt-1 text-xs text-charcoal/70">
                      <span className="text-forest font-medium">Verified Sandbox Transaction</span>
                      <Link to="/app/rewards" className="text-forest font-semibold hover:underline">
                        Access Unlocked Digital Materials →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center bg-white rounded-2xl border border-warmgray p-8 space-y-3">
            <Ticket className="w-8 h-8 text-charcoal/30 mx-auto" />
            <h3 className="font-semibold text-sm text-charcoal">No bookings yet</h3>
            <p className="text-xs text-charcoal/60">
              Browse workshops and reserve your place using PayPal Sandbox checkout.
            </p>
            <Link
              to="/workshops"
              className="inline-flex items-center gap-1 px-4 py-2 bg-forest text-ivory text-xs font-semibold rounded-lg hover:bg-charcoal transition-colors"
            >
              Browse Workshops
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

