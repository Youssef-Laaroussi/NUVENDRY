import React, { useEffect, useState, useCallback } from 'react';
import { api, useSyncRefresh } from '../../api/client';
import { Users, CheckSquare, Square, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export const MerchantReservations: React.FC = () => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchReservations = useCallback(async () => {
    try {
      const data = await api.getMerchantReservations();
      setReservations(data);
    } catch (err) {
      console.error('Failed to load merchant reservations', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  useSyncRefresh(['reservations', 'workshops', 'rewards', 'analytics'], fetchReservations);

  const handleToggleAttendance = async (reservationId: string, currentStatus: boolean, buyerName: string) => {
    if (togglingId) return;
    setTogglingId(reservationId);
    setFeedback(null);
    try {
      await api.markAttendance(reservationId, !currentStatus);
      await fetchReservations();
      setFeedback({
        type: 'success',
        message: !currentStatus
          ? `Attendance verified for ${buyerName}. Completion badge evaluated.`
          : `Attendance unmarked for ${buyerName}.`,
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update attendance.' });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-forest font-mono">
            Attendee Roster
          </span>
          <h1 className="text-2xl font-serif text-charcoal mt-1">Reservations & Attendance</h1>
          <p className="text-xs text-charcoal/60">
            Review confirmed learner registrations and verify live workshop attendance to award achievement badges.
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
          <div className="py-12 text-center text-xs text-charcoal/60">Loading attendance roster...</div>
        ) : reservations.length > 0 ? (
          <div className="bg-white rounded-2xl border border-warmgray overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-ivory text-charcoal/60 font-mono uppercase text-[10px] border-b border-warmgray">
                  <tr>
                    <th className="py-3 px-4">Learner Name</th>
                    <th className="py-3 px-4">Workshop</th>
                    <th className="py-3 px-4">Amount Paid</th>
                    <th className="py-3 px-4">PayPal Capture</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Verify Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warmgray/60 font-medium">
                  {reservations.map((r) => {
                    const isConfirmed = r.status === 'confirmed';
                    const isBusy = togglingId === r.id;
                    return (
                      <tr key={r.id} className="nv-row-hover hover:bg-ivory/50">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-charcoal">{r.buyer_name}</div>
                          <div className="text-[11px] text-charcoal/50 font-normal">{r.buyer_email}</div>
                        </td>
                        <td className="py-3.5 px-4 text-charcoal/80 max-w-xs truncate">{r.workshop_title}</td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-forest">
                          ${(r.amount_cents / 100).toFixed(2)} {r.currency}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-charcoal/60 text-[11px]">
                          {r.paypal_capture_id || 'Pending'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                              isConfirmed ? 'bg-mint text-forest' : 'bg-amber-50 text-amber-800'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {isConfirmed ? (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleToggleAttendance(r.id, Boolean(r.attended), r.buyer_name)}
                              className="nv-btn-press inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-ivory border border-warmgray hover:border-forest disabled:opacity-60 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
                            >
                              {isBusy ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-forest" />
                              ) : r.attended ? (
                                <CheckSquare className="w-3.5 h-3.5 text-forest" />
                              ) : (
                                <Square className="w-3.5 h-3.5 text-charcoal/40" />
                              )}
                              {r.attended ? (
                                <span className="text-forest font-semibold">Attended</span>
                              ) : (
                                <span className="text-charcoal/60">Mark Present</span>
                              )}
                            </button>
                          ) : (
                            <span className="text-charcoal/40 text-[11px]">Awaiting Payment</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="py-16 text-center bg-white rounded-2xl border border-warmgray p-8 space-y-3">
            <Users className="w-8 h-8 text-charcoal/30 mx-auto" />
            <h3 className="font-semibold text-sm text-charcoal">No customer reservations recorded</h3>
            <p className="text-xs text-charcoal/60">
              When learners book seats in your published workshops, their verified reservations will appear here.
            </p>
          </div>
        )}
      </div>
    </>
  );
};
