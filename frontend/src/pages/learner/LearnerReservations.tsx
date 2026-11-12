import { useLearnerCalendar } from './useLearnerCalendar';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { api, useSyncRefresh } from '../../api/client';
import { Reservation } from '../../types';
import { 
  Calendar, Clock, Users, Monitor, MapPin, CheckCircle2, 
  AlertCircle, XCircle, ChevronRight, ChevronLeft, ChevronDown, 
  MoreHorizontal, RefreshCw, Zap, Award, Layers, ArrowRight, 
  Check, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';

// High-fidelity AI-generated assets
import heroMountainsAi from '../../assets/hero-mountains-ai.jpg';
import milestoneMountainsAi from '../../assets/milestone-mountains-ai.jpg';
import workshopMlops from '../../assets/workshop-mlops.jpg';
import workshopSpatial from '../../assets/workshop-spatial.jpg';
import workshopLanggraph from '../../assets/workshop-langgraph.jpg';

interface DisplayReservation {
  id: string;
  workshop_id: string;
  title: string;
  subtitle: string;
  tag: string;
  date: string;
  time: string;
  timestamp: number;
  seats: string;
  location: string;
  isOnline: boolean;
  status: 'confirmed' | 'upcoming' | 'completed' | 'cancelled';
  statusLabel: string;
  image: string;
}

function displayReservation(reservation: Reservation): DisplayReservation {
  const workshop = reservation.workshop;
  const scheduledAt = workshop?.scheduled_at;
  const timestamp = scheduledAt ? Date.parse(scheduledAt) : Number.POSITIVE_INFINITY;
  const cancelled = reservation.status === 'cancelled';
  const confirmed = reservation.status === 'confirmed';
  const completed = confirmed && timestamp + (workshop?.duration_hours ?? 0) * 3600000 < Date.now();
  const category = workshop?.category ?? 'Workshop';
  return {
    id: reservation.id,
    workshop_id: reservation.workshop_id,
    title: reservation.workshop_title ?? 'Workshop reservation',
    subtitle: workshop?.description ?? '',
    tag: category,
    date: scheduledAt ? new Date(scheduledAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Schedule unavailable',
    time: scheduledAt ? new Date(scheduledAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) + ` (${workshop?.duration_hours} hours)` : '—',
    timestamp,
    seats: workshop ? `${workshop.total_seats - workshop.remaining_seats} / ${workshop.total_seats} seats` : '—',
    location: 'See workshop details',
    isOnline: false,
    status: cancelled ? 'cancelled' : completed ? 'completed' : confirmed ? 'confirmed' : 'upcoming',
    statusLabel: cancelled ? 'Cancelled' : completed ? 'Past session' : reservation.reschedule_status === 'requested' ? 'Reschedule pending' : confirmed ? 'Confirmed' : 'Pending payment',
    image: workshop?.image_url?.trim() || (/spatial|geo/i.test(category) ? workshopSpatial : /llm|agent/i.test(category) ? workshopLanggraph : workshopMlops),
  };
}

export const LearnerReservations: React.FC = () => {
  const [serverReservations, setServerReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [sortBy, setSortBy] = useState<'earliest' | 'latest' | 'title'>('earliest');
  const { calendarMonth, calendarDays, selectedCalendarDay, setSelectedCalendarDay, changeMonth } = useLearnerCalendar();
  
  // Interactive Modals & Actions
  const [cancellingItem, setCancellingItem] = useState<DisplayReservation | null>(null);
  const [reschedulingItem, setReschedulingItem] = useState<DisplayReservation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.getMyReservations();
      setServerReservations(data);
      setLoadError(false);
    } catch (err) {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useSyncRefresh(['reservations', 'workshops', 'rewards'], load);

  const reservations = useMemo(() => serverReservations.map(displayReservation), [serverReservations]);
  const upcomingList = reservations.filter(item => item.status === 'upcoming' || item.status === 'confirmed');
  const pastList = reservations.filter(item => item.status === 'completed' || item.status === 'cancelled');

  const attendance = serverReservations.filter(item => typeof item.attended === 'boolean');
  const attendanceRate = attendance.length ? Math.round(100 * attendance.filter(item => item.attended).length / attendance.length) : null;
  const nextReservation = upcomingList.reduce<DisplayReservation | undefined>((first, item) =>
    !first || item.timestamp < first.timestamp ? item : first,
    undefined
  );

  // Apply sorting
  const displayedReservations = useMemo(() => {
    const source = activeTab === 'upcoming' ? upcomingList : pastList;
    const sorted = [...source];
    if (sortBy === 'title') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      const direction = sortBy === 'earliest' ? 1 : -1;
      sorted.sort((a, b) => direction * (a.timestamp === b.timestamp ? 0 : a.timestamp - b.timestamp));
    }
    return sorted;
  }, [activeTab, upcomingList, pastList, sortBy]);



  const openCancellation = (item: DisplayReservation) => {
    setFeedback(null);
    setCancellingItem(item);
  };

  const handleConfirmCancel = async () => {
    if (cancellingItem?.status !== 'upcoming' || isProcessing) return;
    setIsProcessing(true);
    setFeedback(null);
    try {
      await api.cancelReservation(cancellingItem.id);
      setFeedback({ type: 'success', message: `Reservation for "${cancellingItem.title}" was cancelled successfully.` });
      setCancellingItem(null);
      await load();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Unable to cancel reservation.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const [options, setOptions] = useState<{ id: string; scheduled_at: string }[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [rescheduleMessage, setRescheduleMessage] = useState('');
  useEffect(() => {
    if (!reschedulingItem) return;
    let current = true;
    setOptions([]);
    setSessionId('');
    setRescheduleMessage('Loading alternate sessions…');
    api.getRescheduleOptions(reschedulingItem.id).then(rows => {
      if (!current) return;
      setOptions(rows);
      setSessionId(rows[0]?.id ?? '');
      setRescheduleMessage(rows.length ? '' : 'No alternate sessions are available.');
    }).catch((error: Error) => {
      if (current) setRescheduleMessage(error.message);
    });
    return () => { current = false; };
  }, [reschedulingItem]);

  const handleConfirmReschedule = async () => {
    if (!reschedulingItem || !sessionId || isProcessing) return;
    setIsProcessing(true);
    try {
      await api.requestReschedule(reschedulingItem.id, sessionId);
      setFeedback({ type: 'success', message: 'Reschedule request sent to the instructor for review.' });
      setReschedulingItem(null);
      await load();
    } catch (error) {
      setRescheduleMessage(error instanceof Error ? error.message : 'Unable to submit the reschedule request.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-3">
      
      {/* Toast Feedback Notification */}
      {feedback && (
        <div
          role={feedback.type === 'error' ? 'alert' : 'status'}
          className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 shadow-xs transition-all animate-in fade-in ${
            feedback.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-[#EBF9EA] border-[#C5DFD0] text-[#0E6636] font-medium'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0E6636]" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-gray-400 hover:text-gray-700 text-xs font-semibold px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Layout: Center Reservations Column + Right Schedule Column */}
      <div className="flex flex-col xl:flex-row gap-3.5 items-start">
        
        {/* CENTER CONTENT COLUMN */}
        <div className="flex-1 min-w-0 space-y-3 w-full">
          
          {/* 1. Hero Header Banner (Exact match to reference mockup) */}
          <div className="relative overflow-hidden bg-white rounded-2xl border border-[#E5E7E0] px-6 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between min-h-[84px]">
            {/* Right Mountain Background with smooth fade */}
            <div className="absolute right-0 top-0 bottom-0 w-[55%] pointer-events-none select-none overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_20%)]">
              <img
                src={heroMountainsAi}
                alt="Mountain backdrop"
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Left Hero Text Content */}
            <div className="relative z-10 space-y-0.5 max-w-sm sm:max-w-md">
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#1A2621] tracking-tight flex items-center gap-2">
                <span>Your Reservations</span>
                <Calendar className="w-5 h-5 text-[#0E6636] stroke-[2.2]" />
              </h1>
              <p className="text-xs text-gray-500 leading-snug">
                Manage your workshop bookings, keep track of your schedule, and make the most of your learning journey with NUVENDRY.
              </p>
            </div>
          </div>

          {/* 2. Top Metric KPI Cards (4 columns) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Card 1: Upcoming Bookings */}
            <div className="bg-white px-3.5 py-2.5 rounded-2xl border border-[#E5E7E0] shadow-[0_1px_2px_rgba(0,0,0,0.02)] group flex flex-col justify-between h-[76px]">
              <div className="flex items-center gap-1.5 text-gray-500">
                <Calendar className="w-3.5 h-3.5 text-[#0E6636]" />
                <span className="text-[11.5px] font-medium text-gray-600">Upcoming Bookings</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-sans text-[#0E6636]">
                  {upcomingList.length}
                </span>
                <div className="flex items-center gap-1">
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#EBF9EA] text-[#0E6636] text-[10px] font-bold">
                    —
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>

            {/* Card 2: Completed Bookings */}
            <div className="bg-white px-3.5 py-2.5 rounded-2xl border border-[#E5E7E0] shadow-[0_1px_2px_rgba(0,0,0,0.02)] group flex flex-col justify-between h-[76px]">
              <div className="flex items-center gap-1.5 text-gray-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0E6636]" />
                <span className="text-[11.5px] font-medium text-gray-600">Completed Bookings</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-sans text-[#0E6636]">
                  {pastList.filter(item => item.status === 'completed').length}
                </span>
                <div className="flex items-center gap-1">
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#EBF9EA] text-[#0E6636] text-[10px] font-bold">
                    —
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>

            {/* Card 3: Total Bookings */}
            <div className="bg-white px-3.5 py-2.5 rounded-2xl border border-[#E5E7E0] shadow-[0_1px_2px_rgba(0,0,0,0.02)] group flex flex-col justify-between h-[76px]">
              <div className="flex items-center gap-1.5 text-gray-500">
                <Layers className="w-3.5 h-3.5 text-[#0E6636]" />
                <span className="text-[11.5px] font-medium text-gray-600">Total Bookings</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-sans text-[#0E6636]">
                  {reservations.length}
                </span>
                <div className="flex items-center gap-1">
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#EBF9EA] text-[#0E6636] text-[10px] font-bold">
                    —
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>

            {/* Card 4: Attendance Rate */}
            <div className="bg-white px-3.5 py-2.5 rounded-2xl border border-[#E5E7E0] shadow-[0_1px_2px_rgba(0,0,0,0.02)] group flex flex-col justify-between h-[76px]">
              <div className="flex items-center gap-1.5 text-gray-500">
                <Award className="w-3.5 h-3.5 text-[#0E6636]" />
                <span className="text-[11.5px] font-medium text-gray-600">Attendance Rate</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-sans text-[#0E6636]">
                  {attendanceRate === null ? '—' : `${attendanceRate}%`}
                </span>
                <div className="flex items-center gap-1">
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#EBF9EA] text-[#0E6636] text-[10px] font-bold">
                    —
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Filter Tabs & Sort Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
            {/* Left Tabs */}
            <div className="inline-flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('upcoming')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'upcoming'
                    ? 'bg-[#025F28] text-white shadow-xs'
                    : 'bg-white hover:bg-[#F6F8F7] text-[#333F39] border border-[#E5E7E0]'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Upcoming Reservations ({upcomingList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('past')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'past'
                    ? 'bg-[#025F28] text-white shadow-xs'
                    : 'bg-white hover:bg-[#F6F8F7] text-[#333F39] border border-[#E5E7E0]'
                }`}
              >
                <Check className={`w-3.5 h-3.5 ${activeTab === 'past' ? 'text-white' : 'text-[#0E6636]'}`} />
                <span>Past Reservations ({pastList.length})</span>
              </button>
            </div>

            {/* Right Sort By Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500 self-end sm:self-auto">
              <span className="text-gray-400 font-medium">Sort by:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none bg-white border border-[#E5E7E0] hover:border-[#0E6636]/50 rounded-xl px-2.5 py-1 pr-6 text-xs font-semibold text-[#1A2621] outline-none shadow-xs cursor-pointer transition-colors"
                >
                  <option value="earliest">Date (Earliest)</option>
                  <option value="latest">Date (Latest)</option>
                  <option value="title">Workshop Title</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* 4. Reservations List (Cards matching exact mockup) */}
          <div className="space-y-2.5">
            {loadError ? (
              <p role="alert" className="text-xs text-red-700">
                Unable to load reservations. <button type="button" onClick={load} className="underline">Retry</button>
              </p>
            ) : !displayedReservations.length && (
              <p role="status" className="text-xs text-gray-600">{loading ? 'Loading reservations…' : 'No reservations in this tab.'}</p>
            )}
            {displayedReservations.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#E5E7E0] p-3 hover:border-[#0E6636]/40 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col md:flex-row gap-3.5 md:items-center justify-between group"
              >
                {/* Left Thumbnail with Tag Overlay */}
                <div className="relative w-full md:w-36 aspect-video rounded-xl overflow-hidden shrink-0 bg-gray-50 shadow-xs">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-contain"
                  />
                  <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-[#DFF6DA] text-[#000E18] text-[8.5px] font-bold tracking-wide shadow-xs border border-[#C5DFD0]">
                    {item.tag}
                  </span>
                </div>

                {/* Middle Content Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="font-bold text-[13.5px] text-[#1A2621] leading-snug">
                    <Link to={`/workshops/${item.workshop_id}`} className="hover:text-[#0E6636] transition-colors">
                      {item.title}
                    </Link>
                  </h3>
                  <p className="text-[11px] text-gray-500 leading-snug line-clamp-1">
                    {item.subtitle}
                  </p>

                  {/* Metadata Row 1 */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-600 font-medium pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-[#0E6636]" />
                      <span>{item.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-[#0E6636]" />
                      <span>{item.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-[#0E6636]" />
                      <span>{item.seats}</span>
                    </div>
                  </div>

                  {/* Metadata Row 2: Location / Platform */}
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-600 font-medium">
                    {item.isOnline ? (
                      <Monitor className="w-3 h-3 text-[#0E6636]" />
                    ) : (
                      <MapPin className="w-3 h-3 text-[#0E6636]" />
                    )}
                    <span>{item.location}</span>
                  </div>
                </div>

                {/* Right Side: Status Badge + Action Buttons */}
                <div className="flex md:flex-col items-end justify-between md:justify-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#E5E7E0]/60">
                  {/* Status Badge */}
                  <div>
                    {item.status === 'confirmed' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#E4FBE1] text-[#194919] border border-[#A5E1A1]">
                        <Calendar className="w-2.5 h-2.5 text-[#194919]" />
                        <span>{item.statusLabel}</span>
                      </span>
                    ) : item.status === 'upcoming' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#FDF0CE] text-[#85660C] border border-[#FDE68A]">
                        <Clock className="w-2.5 h-2.5 text-[#85660C]" />
                        <span>{item.statusLabel}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>{item.statusLabel}</span>
                      </span>
                    )}
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setReschedulingItem(item)}
                      disabled={item.status !== 'confirmed'}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-[#E2ECE4] bg-[#F2FCF3] hover:bg-[#EBF7EC] text-[11px] font-semibold text-[#1D471F] transition-colors shadow-2xs"
                    >
                      <Calendar className="w-3 h-3 text-[#1D471F]" />
                      <span>Reschedule</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openCancellation(item)}
                      disabled={item.status !== 'upcoming' && item.status !== 'confirmed'}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-[#E8C8C9] bg-[#FEEEEE] hover:bg-[#FDDCDC] text-[11px] font-semibold text-[#BF3A3B] transition-colors shadow-2xs"
                    >
                      <XCircle className="w-3 h-3 text-[#BF3A3B]" />
                      <span>Cancel</span>
                    </button>

                    <Link
                      to={`/workshops/${item.workshop_id}`}
                      aria-label="View workshop details"
                      className="p-1 rounded-xl border border-[#E5E7E0] hover:bg-gray-50 text-gray-400 transition-colors"
                    >
                      <MoreHorizontal className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>

        {/* RIGHT SIDEBAR COLUMN (My Schedule, Next Reservation, Quick Actions) */}
        <div className="w-full xl:w-[260px] 2xl:w-[276px] shrink-0 space-y-3">
          
          {/* Card 1: My Schedule (Calendar Widget) */}
          <div className="bg-white rounded-2xl border border-[#E5E7E0] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#0E6636]" />
                <h3 className="font-bold text-xs text-[#1A2621]">My Schedule</h3>
              </div>
            </div>

            {/* Month Navigator */}
            <div className="flex items-center justify-between text-xs px-1">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="text-gray-400 hover:text-[#1A2621] p-0.5 rounded transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-bold text-[#1A2621] text-xs">
                {calendarMonth}
              </span>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="text-gray-400 hover:text-[#1A2621] p-0.5 rounded transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-gray-400">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-y-0.5 text-center text-xs">
              {calendarDays.map((item, idx) => {
                const scheduled = item.isCurrentMonth && upcomingList.some(reservation => new Date(reservation.timestamp).toDateString() === item.date.toDateString());
                const isSelected = item.isCurrentMonth && item.day === selectedCalendarDay;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (item.isCurrentMonth) setSelectedCalendarDay(item.day);
                    }}
                    className={`h-[24px] flex flex-col items-center justify-center rounded-full transition-colors relative ${
                      !item.isCurrentMonth ? 'text-gray-300 cursor-default' : 'hover:bg-[#F6F8F7]'
                    }`}
                  >
                    {scheduled || isSelected ? (
                      <span className="w-5 h-5 rounded-full bg-[#105F1D] text-white flex items-center justify-center font-bold text-[10px]">
                        {item.day}
                      </span>
                    ) : (
                      <span className={`text-[10.5px] ${item.isCurrentMonth ? 'text-[#1A2621] font-medium' : 'text-gray-300'}`}>
                        {item.day}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend matching exact mockup */}
            <div className="flex items-center justify-between text-[9px] text-gray-500 pt-1.5 border-t border-[#E5E7E0]/60 px-0.5">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#105F1D]" />
                <span>Your reservations</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#C7F0C4] border border-[#A5E1A1]" />
                <span>Other learning events</span>
              </div>
            </div>
          </div>

          {/* Card 2: Next Reservation Widget */}
          <div className="bg-white rounded-2xl border border-[#E5E7E0] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#0E6636]" />
                <h3 className="font-bold text-xs text-[#1A2621]">Next Reservation</h3>
              </div>
            </div>

            {nextReservation ? (
              <div className="space-y-1.5">
                <Link
                  to={`/workshops/${nextReservation.workshop_id}`}
                  className="group p-1.5 rounded-xl border border-[#E5E7E0] hover:border-[#0E6636]/50 hover:bg-[#F6F8F7] transition-all flex items-center gap-2"
                >
                  <div className="relative w-12 h-9 rounded-lg overflow-hidden shrink-0 shadow-2xs">
                    <img
                      src={nextReservation.image}
                      alt={nextReservation.title}
                      className="w-full h-full object-contain bg-gray-50"
                    />
                    <span className="absolute top-0.5 left-0.5 px-1 py-px rounded bg-[#F4F9F2] text-[#2D6F28] border border-[#C5DFD0] text-[7px] font-bold">
                      {nextReservation.tag}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[11px] text-[#1A2621] leading-tight line-clamp-1 group-hover:text-[#0E6636] transition-colors">
                      {nextReservation.title}
                    </h4>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#0E6636] group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>

                {/* Meta info list */}
                <div className="space-y-0.5 text-[10px] text-gray-600 font-medium px-0.5 pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-2.5 h-2.5 text-[#0E6636]" />
                    <span>{nextReservation.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-2.5 h-2.5 text-[#0E6636]" />
                    <span>{nextReservation.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {nextReservation.isOnline ? <Monitor className="w-2.5 h-2.5 text-[#0E6636]" /> : <MapPin className="w-2.5 h-2.5 text-[#0E6636]" />}
                    <span>{nextReservation.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-2.5 h-2.5 text-[#0E6636]" />
                    <span>{nextReservation.seats}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p role="status" className="text-xs text-gray-600">
                {loading ? 'Loading reservations…' : 'No upcoming reservations.'}
              </p>
            )}
          </div>

          {/* Card 3: Quick Actions */}
          <div className="bg-white rounded-2xl border border-[#E5E7E0] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-2">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#0E6636]" />
              <h3 className="font-bold text-xs text-[#1A2621]">Quick Actions</h3>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <Link
                to="/workshops"
                className="flex items-center gap-1.5 p-1.5 rounded-xl border border-[#E5E7E0] hover:border-[#0E6636]/50 hover:bg-[#F6F8F7] transition-all text-[11px] font-semibold text-[#1A2621] group"
              >
                <Calendar className="w-3 h-3 text-[#0E6636] shrink-0" />
                <span className="truncate">Book a Workshop</span>
              </Link>

              <button
                type="button"
                onClick={() => setActiveTab('upcoming')}
                className="flex items-center gap-1.5 p-1.5 rounded-xl border border-[#E5E7E0] hover:border-[#0E6636]/50 hover:bg-[#F6F8F7] transition-all text-[11px] font-semibold text-[#1A2621] text-left group"
              >
                <CheckCircle2 className="w-3 h-3 text-[#0E6636] shrink-0" />
                <span className="truncate">Manage Bookings</span>
              </button>

              <button
                type="button"
                onClick={() => setReschedulingItem(upcomingList.find(item => item.status === 'confirmed') ?? null)}
                disabled={!upcomingList.some(item => item.status === 'confirmed')}
                className="flex items-center gap-1.5 p-1.5 rounded-xl border border-[#E5E7E0] hover:border-[#0E6636]/50 hover:bg-[#F6F8F7] transition-all text-[11px] font-semibold text-[#1A2621] text-left group"
              >
                <RefreshCw className="w-3 h-3 text-[#0E6636] shrink-0" />
                <span className="truncate">Reschedule a Booking</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const item = upcomingList.find(item => item.status === 'upcoming') ?? nextReservation;
                  if (item) openCancellation(item);
                }}
                disabled={!nextReservation}
                className="flex items-center gap-1.5 p-1.5 rounded-xl border border-[#E5E7E0] hover:border-[#0E6636]/50 hover:bg-[#F6F8F7] transition-all text-[11px] font-semibold text-[#1A2621] text-left group"
              >
                <XCircle className="w-3 h-3 text-[#0E6636] shrink-0" />
                <span className="truncate">Cancel a Booking</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* 5. Bottom Milestone Banner: "Never Miss a Workshop" */}
      <div className="relative overflow-hidden rounded-2xl bg-[#015D38] border border-[#00502F] px-5 sm:px-6 py-3.5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-white min-h-[54px]">
        {/* Left: Icon + Heading Text */}
        <div className="relative z-10 flex items-center gap-3 max-w-xl">
          <div className="w-[32px] h-[32px] rounded-full border border-white/20 bg-white/10 flex items-center justify-center text-white shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base text-white tracking-tight leading-tight">
              Never Miss a Workshop
            </h4>
            <p className="text-xs text-white/85 leading-snug mt-0.5">
              Keep your reservations up to date, reschedule with ease, and stay on track with your learning goals.
            </p>
          </div>
        </div>

        {/* Mountain illustration seamlessly embedded into banner */}
        <div className="hidden md:block absolute right-[180px] top-0 bottom-0 w-[380px] pointer-events-none select-none overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_20%,black_80%,transparent_100%)]">
          <img
            src={milestoneMountainsAi}
            alt="Mountains"
            className="w-full h-full object-cover object-center opacity-85"
          />
        </div>

        {/* Far Right: Browse Workshops CTA Button */}
        <div className="relative z-10 shrink-0">
          <Link
            to="/workshops"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-[#F1FBF2] text-[#015D38] text-xs font-bold transition-all shadow-sm"
          >
            <span>Browse Workshops</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#015D38]" />
          </Link>
        </div>
      </div>

      {/* Reschedule Modal */}
      {reschedulingItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E7E0] max-w-md w-full p-6 space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#1A2621] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0E6636]" />
                <span>Reschedule Workshop</span>
              </h3>
              <button
                type="button"
                onClick={() => setReschedulingItem(null)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>
            
            <p className="text-xs text-gray-600">
              Select an alternate session date for <strong className="text-[#1A2621]">{reschedulingItem.title}</strong>:
            </p>

            <div className="space-y-2">
              {rescheduleMessage && <p role="status" className="text-xs text-gray-600">{rescheduleMessage}</p>}
              {options.map(option => (
                <label key={option.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer text-xs ${sessionId === option.id ? 'border-[#0E6636] bg-[#EBF9EA]/40' : 'border-[#E5E7E0] hover:bg-gray-50'}`}>
                  <input type="radio" name="slot" checked={sessionId === option.id} disabled={isProcessing} onChange={() => setSessionId(option.id)} className="text-[#0E6636] focus:ring-[#0E6636]" />
                  <span className="font-bold text-[#1A2621]">{new Date(option.scheduled_at).toLocaleString()}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReschedulingItem(null)}
                className="px-4 py-2 rounded-xl border border-[#E5E7E0] hover:bg-gray-50 text-xs font-semibold text-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReschedule}
                disabled={!sessionId || isProcessing}
                className="px-4 py-2 rounded-xl bg-[#0E6636] hover:bg-[#153F30] text-white text-xs font-semibold transition-colors shadow-sm"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancellingItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E7E0] max-w-md w-full p-6 space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-9 h-9 rounded-full bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#1A2621]">Cancel Reservation</h3>
                <p className="text-xs text-gray-500">This will release your workshop seat hold.</p>
              </div>
            </div>

            <p className="text-xs text-gray-600">
              {cancellingItem.status === 'confirmed'
                ? 'This booking is confirmed. Contact the instructor to discuss cancellation or a refund.'
                : <>Cancel your seat for <strong className="text-[#1A2621]">{cancellingItem.title}</strong>? This will release the seat held for your unpaid booking.</>}
            </p>

            {feedback?.type === 'error' && <p role="alert" className="text-xs text-red-700">{feedback.message}</p>}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setCancellingItem(null)}
                className="px-4 py-2 rounded-xl border border-[#E5E7E0] hover:bg-gray-50 text-xs font-semibold text-gray-600 transition-colors"
              >
                {cancellingItem.status === 'confirmed' ? 'Close' : 'Keep Seat'}
              </button>
              {cancellingItem.status === 'upcoming' && <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                <span>Confirm Cancellation</span>
              </button>}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LearnerReservations;
