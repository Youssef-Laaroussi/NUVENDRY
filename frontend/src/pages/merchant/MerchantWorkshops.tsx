import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Workshop } from '../../types';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Calendar, Clock, Plus, CheckCircle2, Edit2 } from 'lucide-react';

export const MerchantWorkshops: React.FC = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit capacity state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSeats, setEditSeats] = useState(25);

  const fetchWorkshops = async () => {
    setLoading(true);
    try {
      const data = await api.getMerchantWorkshops();
      setWorkshops(data);
    } catch (err) {
      console.error('Failed to load merchant workshops', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const handleUpdateCapacity = async (id: string) => {
    try {
      await api.updateWorkshop(id, { total_seats: editSeats });
      setEditingId(null);
      fetchWorkshops();
    } catch (err: any) {
      alert(err.message || 'Failed to update capacity.');
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
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest text-ivory text-xs font-semibold hover:bg-charcoal transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create from AI Demand</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-charcoal/60">Loading workshop inventory...</div>
        ) : workshops.length > 0 ? (
          <div className="space-y-4">
            {workshops.map((w) => (
              <div key={w.id} className="bg-white rounded-2xl border border-warmgray p-6 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-mint text-forest uppercase">
                        {w.category}
                      </span>
                      <span className="text-xs font-semibold text-charcoal/50 capitalize font-mono">
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
                  <div className="flex items-center gap-2 pt-2 border-t border-warmgray/60">
                    <input
                      type="number"
                      min={w.total_seats - w.remaining_seats}
                      value={editSeats}
                      onChange={(e) => setEditSeats(Number(e.target.value))}
                      className="p-1.5 bg-ivory border border-warmgray rounded text-xs w-24 font-mono"
                    />
                    <button
                      onClick={() => handleUpdateCapacity(w.id)}
                      className="px-3 py-1 bg-forest text-ivory text-xs font-semibold rounded"
                    >
                      Save Capacity
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 bg-warmgray text-charcoal text-xs rounded"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-2 border-t border-warmgray/60 text-xs">
                    <span className="text-charcoal/50 text-[11px]">
                      Created {new Date(w.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => {
                        setEditingId(w.id);
                        setEditSeats(w.total_seats);
                      }}
                      className="text-forest font-semibold hover:underline flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Adjust Capacity
                    </button>
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

