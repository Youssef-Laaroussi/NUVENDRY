import React, { useEffect, useState, useCallback } from 'react';
import { api, useSyncRefresh } from '../../api/client';
import { Reservation } from '../../types';
import { Ticket, CheckCircle2, Clock, AlertCircle, Loader2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LearnerReservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.getMyReservations();
      setReservations(data);
    } catch (err) {
      console.error('Failed to load reservations', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useSyncRefresh(['reservations', 'workshops', 'rewards'], load);

  const handleCancelHold = async (id: string) => {
    if (cancellingId) return;
    setCancellingId(id);
    setFeedback(null);
    try {
      await api.cancelReservation(id);
      setFeedback({ type: 'success', message: 'Pending seat hold cancelled.' });
      await load();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Unable to cancel reservation hold.' });
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif text-charcoal">My Reservations & Purchases</h1>
          <p className="text-xs text-charcoal/60">
            Real-time status of your workshop seat bookings and verified PayPal Sandbox transactions.
          </p>
        </div>

        {feedback && (
          <div
            role={feedback.type === 'error' ? 'alert' : 'status'}
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
              feedback.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-mint/50 border-forest/20 text-forest font-medium'
            }`}
          >
            {feedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-forest" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-xs text-charcoal/60">Loading reservation records...</div>
        ) : reservations.length > 0 ? (
          <div className="space-y-4">
            {reservations.map((r) => {
              const isConfirmed = r.status === 'confirmed';
              const isPending = r.status === 'pending_payment';
              const isCancelled = r.status === 'cancelled';
              return (
                <div key={r.id} className="nv-card-lift bg-white rounded-2xl border border-warmgray p-6 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-charcoal/50">
                        Reservation #{r.id.slice(0, 8)}
                      </span>
                      <h3 className="font-semibold text-base text-charcoal">
                        <Link to={`/workshops/${r.workshop_id}`} className="hover:text-forest transition-colors">
                          {r.workshop_title}
                        </Link>
                      </h3>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full self-start sm:self-auto ${
                        isConfirmed
                          ? 'bg-mint text-forest'
                          : isCancelled
                          ? 'bg-warmgray/60 text-charcoal/60'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {isConfirmed ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : isCancelled ? (
                        <XCircle className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
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

                  {isPending && (
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                      <span className="text-amber-800 font-medium">
                        Awaiting authoritative PayPal Sandbox checkout verification
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={cancellingId === r.id}
                          onClick={() => handleCancelHold(r.id)}
                          className="text-charcoal/60 hover:text-red-600 font-medium transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                        >
                          {cancellingId === r.id && <Loader2 className="w-3 h-3 animate-spin" />}
                          <span>Cancel Hold</span>
                        </button>
                        <Link
                          to={`/workshops/${r.workshop_id}`}
                          className="nv-btn-press px-3 py-1.5 rounded-lg bg-forest text-ivory font-semibold hover:bg-charcoal transition-colors"
                        >
                          Complete Checkout →
                        </Link>
                      </div>
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
              className="nv-btn-press inline-flex items-center gap-1 px-4 py-2 bg-forest text-ivory text-xs font-semibold rounded-lg hover:bg-charcoal transition-colors"
            >
              Browse Workshops
            </Link>
          </div>
        )}
      </div>
    </>
  );
};
