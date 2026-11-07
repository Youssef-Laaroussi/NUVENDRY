import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, Ticket, Tag, Sparkles, ArrowRight, Calendar, 
  CheckCircle2, Clock 
} from 'lucide-react';
import { LearningDemand, Reservation, Workshop } from '../../types';

export const LearnerOverview: React.FC = () => {
  const { user } = useAuth();
  const [demands, setDemands] = useState<LearningDemand[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rewards, setRewards] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [d, r, rew] = await Promise.all([
          api.getDemands({ mine_only: true }),
          api.getMyReservations(),
          api.getMyRewards(),
        ]);
        setDemands(d);
        setReservations(r);
        setRewards(rew);
      } catch (err) {
        console.error('Failed to load overview data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const confirmedReservations = reservations.filter((r) => r.status === 'confirmed');

  return (
    <>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-white rounded-2xl border border-warmgray p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <h1 className="text-2xl font-serif text-charcoal">
              Welcome back, {user?.full_name}
            </h1>
            <p className="text-xs sm:text-sm text-charcoal/70">
              Track your active demand requests, verified workshop bookings, and merchant rewards.
            </p>
          </div>
          <Link
            to="/app/my-demands"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-forest text-ivory text-xs font-semibold hover:bg-charcoal transition-colors shrink-0 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>New Learning Demand</span>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-warmgray space-y-1">
            <span className="text-[11px] font-medium text-charcoal/60 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-forest" /> Active Demands
            </span>
            <div className="text-xl font-bold font-mono text-charcoal">{demands.length}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-warmgray space-y-1">
            <span className="text-[11px] font-medium text-charcoal/60 flex items-center gap-1">
              <Ticket className="w-3.5 h-3.5 text-forest" /> Confirmed Bookings
            </span>
            <div className="text-xl font-bold font-mono text-charcoal">{confirmedReservations.length}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-warmgray space-y-1">
            <span className="text-[11px] font-medium text-charcoal/60 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-forest" /> Store Credit
            </span>
            <div className="text-xl font-bold font-mono text-forest">
              ${((rewards?.store_credit_cents || 0) / 100).toFixed(2)}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-warmgray space-y-1">
            <span className="text-[11px] font-medium text-charcoal/60 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-gold" /> Badges Earned
            </span>
            <div className="text-xl font-bold font-mono text-charcoal">
              {rewards?.achievement_badges?.length || 0}
            </div>
          </div>
        </div>

        {/* Confirmed Workshops / Reservations */}
        <div className="bg-white rounded-2xl border border-warmgray p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-charcoal text-base flex items-center gap-2">
              <Ticket className="w-4 h-4 text-forest" /> My Upcoming Workshops
            </h3>
            <Link to="/app/reservations" className="text-xs text-forest font-semibold hover:underline">
              View all
            </Link>
          </div>

          {confirmedReservations.length > 0 ? (
            <div className="space-y-3">
              {confirmedReservations.map((r) => (
                <div key={r.id} className="p-4 rounded-xl bg-ivory border border-warmgray flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-xs sm:text-sm text-charcoal">{r.workshop_title}</h4>
                    <div className="flex items-center gap-3 text-[11px] text-charcoal/60 font-mono">
                      <span>PayPal Capture: {r.paypal_capture_id}</span>
                      <span className="text-forest font-semibold">${(r.final_amount_cents / 100).toFixed(2)} USD</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest bg-mint px-2.5 py-1 rounded-full self-start sm:self-auto">
                    <CheckCircle2 className="w-3 h-3" /> Confirmed
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center bg-ivory rounded-xl border border-warmgray/60 space-y-2">
              <p className="text-xs text-charcoal/60">You have no confirmed workshop reservations yet.</p>
              <Link to="/workshops" className="inline-flex items-center gap-1 text-xs font-semibold text-forest">
                Discover Available Workshops <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>

        {/* Active Demands */}
        <div className="bg-white rounded-2xl border border-warmgray p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-charcoal text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-forest" /> My Learning Requests
            </h3>
            <Link to="/app/my-demands" className="text-xs text-forest font-semibold hover:underline">
              Manage requests
            </Link>
          </div>

          {demands.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {demands.map((d) => (
                <div key={d.id} className="p-4 rounded-xl bg-ivory border border-warmgray space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-forest">{d.topic}</span>
                    <span className="text-xs font-mono font-medium">${(d.max_budget_cents / 100).toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-charcoal italic line-clamp-2">"{d.raw_prompt}"</p>
                  <div className="flex items-center justify-between text-[10px] text-charcoal/60 pt-1 border-t border-warmgray/50">
                    <span className="capitalize">{d.preferred_difficulty}</span>
                    <span className="text-forest font-mono">Status: {d.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center bg-ivory rounded-xl border border-warmgray/60 space-y-2">
              <p className="text-xs text-charcoal/60">No learning requests submitted yet.</p>
              <Link to="/app/my-demands" className="inline-flex items-center gap-1 text-xs font-semibold text-forest">
                Create First Learning Request <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

