import React, { useEffect, useState, useCallback } from 'react';
import { api, useSyncRefresh } from '../../api/client';
import { Workshop } from '../../types';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, Plus, CheckCircle2, Edit2, Loader2, AlertCircle, ExternalLink } from 'lucide-react';

export const MerchantWorkshops: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(() => {
    if (searchParams.get('published') === '1') {
      return { type: 'success', message: 'Workshop published to the live marketplace.' };
    }
    if (searchParams.get('draft') === '1') {
      return { type: 'success', message: 'Workshop draft saved.' };
    }
    return null;
  });

  // Edit capacity & price state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSeats, setEditSeats] = useState(25);
  const [editPriceUsd, setEditPriceUsd] = useState('39.00');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [togglingPublishId, setTogglingPublishId] = useState<string | null>(null);

  const fetchWorkshops = useCallback(async () => {
    try {
      const data = await api.getMerchantWorkshops();
      setWorkshops(data);
    } catch (err) {
      console.error('Failed to load merchant workshops', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkshops();
  }, [fetchWorkshops]);

  useSyncRefresh(['workshops', 'reservations', 'analytics'], fetchWorkshops);

  const handleUpdateCapacity = async (w: Workshop) => {
    if (savingId) return;
    const minSeats = Math.max(1, w.total_seats - w.remaining_seats);
    const parsedUsd = parseFloat(editPriceUsd);
    if (editSeats < minSeats || Number.isNaN(parsedUsd) || parsedUsd <= 0) {
      setFeedback({
        type: 'error',
        message: `Capacity must be at least ${minSeats} (seats already booked) and price must be positive.`,
      });
      return;
    }
    setSavingId(w.id);
    setFeedback(null);
    try {
      await api.updateWorkshop(w.id, {
        total_seats: editSeats,
        price_cents: Math.round(parsedUsd * 100),
      });
      setEditingId(null);
      setFeedback({ type: 'success', message: `Updated "${w.title}".` });
      await fetchWorkshops();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update workshop.' });
    } finally {
      setSavingId(null);
    }
  };

  const handleTogglePublish = async (w: Workshop) => {
    if (togglingPublishId) return;
    setTogglingPublishId(w.id);
    setFeedback(null);
    try {
      if (w.is_published) {
        await api.updateWorkshop(w.id, { is_published: false });
        setFeedback({ type: 'success', message: `"${w.title}" moved to draft.` });
      } else {
        await api.publishWorkshop(w.id);
        setFeedback({ type: 'success', message: `"${w.title}" published to the marketplace.` });
      }
      await fetchWorkshops();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to change publication status.' });
    } finally {
      setTogglingPublishId(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif text-charcoal">Workshop Management</h1>
            <p className="text-xs text-charcoal/60">
              Oversee your curriculum inventory, seat capacities, and scheduled sessions.
            </p>
          </div>
          <Link
            to="/merchant/offer-studio"
            className="nv-btn-press inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest text-ivory text-xs font-semibold hover:bg-charcoal transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create from AI Demand</span>
          </Link>
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
          <div className="py-12 text-center text-xs text-charcoal/60">Loading workshop inventory...</div>
        ) : workshops.length > 0 ? (
          <div className="space-y-4">
            {workshops.map((w) => (
              <div key={w.id} className="nv-card-lift bg-white rounded-2xl border border-warmgray p-6 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-mint text-forest uppercase">
                        {w.category}
                      </span>
                      <span
                        className={`text-xs font-semibold capitalize font-mono ${
                          w.is_published ? 'text-forest' : 'text-charcoal/50'
                        }`}
                      >
                        {w.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-base text-charcoal">{w.title}</h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-bold font-mono text-charcoal">
                      ${(w.price_cents / 100).toFixed(2)}
                    </span>
                    <span className="text-xs text-charcoal/60 ml-1">{w.currency}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-ivory border border-warmgray/60 text-xs">
                  <div>
                    <span className="text-[10px] text-charcoal/50 block">Seats Remaining</span>
                    <strong className="text-forest text-sm font-semibold">
                      {w.remaining_seats} / {w.total_seats}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-charcoal/50 block">Scheduled Date</span>
                    <span className="text-charcoal/80 font-medium">
                      {new Date(w.scheduled_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-charcoal/50 block">Duration</span>
                    <span className="text-charcoal/80 font-medium">{w.duration_hours} Hours</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-charcoal/50 block">Difficulty</span>
                    <span className="text-charcoal/80 capitalize font-medium">{w.difficulty}</span>
                  </div>
                </div>

                {editingId === w.id ? (
                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-warmgray/60 text-xs">
                    <label className="flex items-center gap-1.5">
                      <span className="text-charcoal/60">Seats:</span>
                      <input
                        type="number"
                        min={Math.max(1, w.total_seats - w.remaining_seats)}
                        value={editSeats}
                        onChange={(e) => setEditSeats(Number(e.target.value))}
                        className="p-1.5 bg-ivory border border-warmgray rounded text-xs w-20 font-mono"
                      />
                    </label>
                    <label className="flex items-center gap-1.5">
                      <span className="text-charcoal/60">Price ($):</span>
                      <input
                        type="number"
                        step="0.50"
                        min="1"
                        value={editPriceUsd}
                        onChange={(e) => setEditPriceUsd(e.target.value)}
                        className="p-1.5 bg-ivory border border-warmgray rounded text-xs w-24 font-mono"
                      />
                    </label>
                    <button
                      type="button"
                      disabled={savingId === w.id}
                      onClick={() => handleUpdateCapacity(w)}
                      className="nv-btn-press px-3 py-1.5 bg-forest text-ivory text-xs font-semibold rounded disabled:opacity-60 inline-flex items-center gap-1"
                    >
                      {savingId === w.id && <Loader2 className="w-3 h-3 animate-spin" />}
                      <span>Save Changes</span>
                    </button>
                    <button
                      type="button"
                      disabled={savingId === w.id}
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 bg-warmgray text-charcoal text-xs rounded"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-warmgray/60 text-xs">
                    <span className="text-charcoal/50 text-[11px]">
                      Created {new Date(w.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-4">
                      {w.is_published && (
                        <Link
                          to={`/workshops/${w.id}`}
                          className="text-charcoal/65 hover:text-forest font-medium inline-flex items-center gap-1"
                        >
                          <span>View Live</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                      <button
                        type="button"
                        disabled={togglingPublishId === w.id}
                        onClick={() => handleTogglePublish(w)}
                        className="text-forest font-semibold hover:underline inline-flex items-center gap-1 disabled:opacity-50"
                      >
                        {togglingPublishId === w.id && <Loader2 className="w-3 h-3 animate-spin" />}
                        <span>{w.is_published ? 'Move to Draft' : 'Publish to Marketplace'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(w.id);
                          setEditSeats(w.total_seats);
                          setEditPriceUsd((w.price_cents / 100).toFixed(2));
                        }}
                        className="text-forest font-semibold hover:underline flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Adjust Capacity
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-white rounded-2xl border border-warmgray p-8 space-y-3">
            <BookOpen className="w-8 h-8 text-charcoal/30 mx-auto" />
            <h3 className="font-semibold text-sm text-charcoal">No workshops created yet</h3>
            <p className="text-xs text-charcoal/60">
              Inspect demand intelligence clusters and generate your first workshop offer.
            </p>
          </div>
        )}
      </div>
    </>
  );
};
