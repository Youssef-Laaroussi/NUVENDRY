import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PayPalCheckoutButton } from '../components/PayPalCheckoutButton';
import { api } from '../api/client';
import { Workshop, ReservationQuote, Reservation } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, Clock, Users, ShieldCheck, Tag, CheckCircle2, 
  ArrowLeft, Sparkles, BookOpen, AlertCircle, X, Check
} from 'lucide-react';

export const WorkshopDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quote State
  const [useStoreCredit, setUseStoreCredit] = useState(false);
  const [quote, setQuote] = useState<ReservationQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  // Reservation & Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [activeReservation, setActiveReservation] = useState<Reservation | null>(null);
  const [confirmedCapture, setConfirmedCapture] = useState<any | null>(null);

  useEffect(() => {
    async function loadWorkshop() {
      if (!id) return;
      try {
        const data = await api.getWorkshop(id);
        setWorkshop(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load workshop details.');
      } finally {
        setLoading(false);
      }
    }
    loadWorkshop();
  }, [id]);

  // Recalculate Quote whenever options change
  useEffect(() => {
    async function fetchQuote() {
      if (!id || !isAuthenticated) return;
      setQuoteLoading(true);
      try {
        const q = await api.getQuote({
          workshop_id: id,
          use_store_credit: useStoreCredit,
        });
        setQuote(q);
      } catch (err: any) {
        console.error('Failed to calculate quote', err);
      } finally {
        setQuoteLoading(false);
      }
    }
    fetchQuote();
  }, [id, isAuthenticated, useStoreCredit]);

  const handleOpenReservationModal = async () => {
    if (!isAuthenticated) {
      navigate('/sign-in');
      return;
    }
    setShowConfirmModal(true);
    if (!activeReservation && id) {
      try {
        const res = await api.createReservation({
          workshop_id: id,
          use_store_credit: useStoreCredit,
        });
        setActiveReservation(res);
      } catch (err: any) {
        console.error('Hold reservation error', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-sm text-charcoal/60 bg-ivory min-h-screen">
        Loading workshop specifications...
      </div>
    );
  }

  if (error || !workshop) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-4 bg-ivory min-h-screen">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-xl font-semibold text-charcoal">Workshop Not Found</h2>
        <p className="text-sm text-charcoal/60">{error || 'The requested workshop does not exist.'}</p>
        <Link to="/workshops" className="inline-flex items-center gap-1 text-sm font-semibold text-forest">
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(workshop.scheduled_at).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const basePriceDollars = (workshop.price_cents / 100).toFixed(2);
  const payableDollars = quote 
    ? (quote.final_amount_cents / 100).toFixed(2)
    : basePriceDollars;
  const discountDollars = quote 
    ? ((quote.base_price_cents - quote.final_amount_cents) / 100).toFixed(2)
    : '10.00';

  return (
    <div className="bg-ivory min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <Link
          to="/workshops"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal/60 hover:text-forest transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Workshops
        </Link>

        {confirmedCapture ? (
          <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-warmgray text-center space-y-5 shadow-lg">
            <div className="w-14 h-14 rounded-full bg-mint text-forest flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-forest" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase text-forest font-semibold">Payment Verified</span>
              <h2 className="text-2xl font-serif text-charcoal">Seat Successfully Reserved!</h2>
              <p className="text-xs text-charcoal/70">
                PayPal Sandbox capture confirmed. Your seat is officially assigned.
              </p>
            </div>

            <div className="p-4 bg-ivory rounded-2xl text-xs space-y-2 border border-warmgray text-left">
              <div className="flex justify-between">
                <span className="text-charcoal/60">Workshop</span>
                <strong className="text-charcoal">{workshop.title}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/60">PayPal Capture ID</span>
                <span className="font-mono text-forest">{confirmedCapture.paypal_capture_id || 'CAP-SANDBOX-SUCCESS'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/60">Amount Paid</span>
                <span className="font-mono font-bold text-charcoal">${payableDollars} USD</span>
              </div>
            </div>

            <Link
              to="/app/reservations"
              className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-forest text-ivory text-xs font-semibold shadow-xs"
            >
              View My Reservations & Tickets →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Content Column */}
            <div className="lg:col-span-8 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-mint text-forest font-semibold">
                    {workshop.category}
                  </span>
                  <span className="text-xs font-mono capitalize px-2.5 py-0.5 rounded-full bg-white border border-warmgray text-charcoal/70">
                    {workshop.difficulty} Level
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-serif text-charcoal tracking-tight leading-tight">
                  {workshop.title}
                </h1>
                <p className="text-xs sm:text-sm text-charcoal/70 leading-relaxed">
                  Demand-backed live workshop with hands-on lab code, real-time instructor feedback, and guaranteed verified attendance credentials.
                </p>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-white rounded-2xl border border-warmgray text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-charcoal/50 font-mono uppercase block">Date & Time</span>
                  <div className="font-semibold text-charcoal">{formattedDate}</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-charcoal/50 font-mono uppercase block">Session Duration</span>
                  <div className="font-semibold text-charcoal">{workshop.duration_hours} Hours Live</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-charcoal/50 font-mono uppercase block">Available Seats</span>
                  <div className="font-semibold text-forest font-mono">{workshop.remaining_seats} / {workshop.total_seats} Left</div>
                </div>
              </div>

              {/* Syllabus Outline */}
              <div className="bg-white p-6 rounded-2xl border border-warmgray space-y-4 shadow-xs">
                <h3 className="font-semibold text-base text-charcoal">Workshop Syllabus & Deliverables</h3>
                <p className="text-xs sm:text-sm text-charcoal/80 leading-relaxed whitespace-pre-line">
                  {workshop.description}
                </p>

                <div className="pt-4 border-t border-warmgray/60 space-y-2">
                  <h4 className="text-xs font-semibold text-charcoal uppercase tracking-wider">What You Will Build</h4>
                  <ul className="text-xs text-charcoal/70 space-y-1.5 list-disc pl-4 leading-relaxed">
                    <li>Production-ready code architecture with comprehensive exception handling.</li>
                    <li>Live state checkpointing and persistence with PostgreSQL.</li>
                    <li>Verified PayPal Sandbox checkout implementation for digital commerce.</li>
                    <li>Full repository access and downloadable starter kit delivered immediately upon booking.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Booking Card */}
            <div className="lg:col-span-4 sticky top-24 bg-white rounded-2xl border border-warmgray p-6 shadow-md space-y-6">
              <div className="flex items-baseline justify-between border-b border-warmgray/60 pb-4">
                <span className="text-xs text-charcoal/60">Workshop Fee</span>
                <div className="text-right">
                  <span className="text-3xl font-bold font-mono text-charcoal">${payableDollars}</span>
                  <span className="text-xs text-charcoal/60 ml-1 uppercase">{workshop.currency}</span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-charcoal/70">
                  <span>Base Price</span>
                  <span className="font-mono">${basePriceDollars} USD</span>
                </div>
                <div className="flex justify-between text-forest font-medium">
                  <span>Welcome Discount</span>
                  <span className="font-mono">-${discountDollars} USD</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenReservationModal}
                disabled={workshop.remaining_seats <= 0}
                className="w-full py-3 rounded-xl bg-[#205C49] hover:bg-charcoal text-white text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>{workshop.remaining_seats > 0 ? 'Reserve Seat with PayPal' : 'Workshop Fully Booked'}</span>
              </button>

              <div className="text-[11px] text-charcoal/50 text-center font-mono">
                15-minute temporary seat hold upon checkout initiation.
              </div>
            </div>
          </div>
        )}

        {/* Modal: Confirm Your Reservation matching exact Bottom-Right mock */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl border border-warmgray max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-warmgray">
                <h3 className="font-semibold text-lg sm:text-xl text-charcoal font-serif">
                  Confirm Your Reservation
                </h3>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="p-1.5 rounded-lg text-charcoal/50 hover:bg-warmgray/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 3-Column / 3-Box Horizontal Layout matching mock */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                {/* Column 1: Workshop Details */}
                <div className="bg-ivory/80 rounded-2xl p-5 border border-warmgray space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-charcoal leading-snug">
                      {workshop.title}
                    </h4>
                    <p className="text-xs text-charcoal/60 font-mono">
                      Nov 11, 2026, 08:15 PM
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs text-charcoal/70 pt-2 border-t border-warmgray/60 font-medium">
                    <div className="flex justify-between">
                      <span className="text-charcoal/50">Duration:</span>
                      <span>{workshop.duration_hours} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal/50">Instructor:</span>
                      <span>Fatima Zahra</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal/50">Seats:</span>
                      <span>1</span>
                    </div>
                  </div>
                </div>

                {/* Column 2: Apply Rewards & Price Breakdown */}
                <div className="bg-ivory/80 rounded-2xl p-5 border border-warmgray space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[11px] font-mono uppercase text-charcoal/60 font-semibold block">
                      Apply Rewards
                    </span>

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-forest/30 cursor-pointer text-xs">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded text-forest focus:ring-forest"
                        />
                        <span className="font-semibold text-charcoal">Welcome Discount</span>
                      </div>
                      <span className="font-mono font-bold text-forest">-$10.00</span>
                    </label>
                  </div>

                  <div className="space-y-1.5 text-xs pt-3 border-t border-warmgray/60">
                    <div className="flex justify-between text-charcoal/70">
                      <span>Subtotal</span>
                      <span className="font-mono">${basePriceDollars}</span>
                    </div>
                    <div className="flex justify-between text-forest font-medium">
                      <span>Discount</span>
                      <span className="font-mono">-${discountDollars}</span>
                    </div>
                    <div className="pt-2 border-t border-warmgray flex justify-between font-bold text-sm text-charcoal">
                      <span>Total (USD)</span>
                      <span className="font-mono text-forest text-base">${payableDollars}</span>
                    </div>
                  </div>
                </div>

                {/* Column 3: Pay with PayPal */}
                <div className="bg-white rounded-2xl p-5 border border-warmgray shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[11px] font-mono uppercase text-charcoal/60 font-semibold block">
                      Pay with PayPal
                    </span>

                    {/* Official PayPal Logo Badge */}
                    <div className="py-2.5 px-4 bg-ivory rounded-xl border border-warmgray flex items-center justify-center">
                      <span className="font-serif italic font-bold text-xl text-[#003087]">
                        Pay<span className="text-[#0079C1]">Pal</span>
                      </span>
                    </div>

                    <p className="text-[11px] text-charcoal/60 leading-relaxed text-center">
                      You will complete payment securely in the official PayPal Sandbox checkout environment.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    {activeReservation ? (
                      <PayPalCheckoutButton
                        reservationId={activeReservation.id}
                        finalAmountCents={activeReservation.final_amount_cents}
                        currency={activeReservation.currency}
                        workshopTitle={workshop.title}
                        onSuccess={(data) => {
                          setConfirmedCapture(data);
                          setShowConfirmModal(false);
                        }}
                      />
                    ) : (
                      <div className="py-2.5 px-4 bg-[#0070BA] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5">
                        <span>Pay with PayPal</span>
                      </div>
                    )}

                    <div className="text-[10px] font-mono text-charcoal/40 text-center">
                      Sandbox environment • No real money
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkshopDetail;
