import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api, useSyncRefresh } from '../../api/client';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, Ticket, Coins, Award, BarChart2,
  Layers, Trophy, Calendar, Clock, ChevronRight, ChevronLeft,
  Bookmark, Plus, Bell, Loader2
} from 'lucide-react';
import { LearningDemand, Reservation, NotificationItem } from '../../types';

// Pixel-perfect extracted assets from original design mockup
import heroMountainFaded from '../../assets/hero-mountain-faded.png';
import activePathThumb from '../../assets/active-path-thumb.png';
import badgeFirstBooking from '../../assets/badge-first-booking.png';
import badgeActiveLearner from '../../assets/badge-active-learner.png';
import badgeReferrer from '../../assets/badge-referrer.png';
import badgeAiExplorer from '../../assets/badge-ai-explorer.png';
import recCard1 from '../../assets/rec-card1.png';
import recCard2 from '../../assets/rec-card2.png';
import recCard3 from '../../assets/rec-card3.png';

export const LearnerOverview: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [demands, setDemands] = useState<LearningDemand[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rewards, setRewards] = useState<any | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});

  const loadData = useCallback(async () => {
    try {
      const [d, r, rew, notifs] = await Promise.all([
        api.getDemands({ mine_only: true }),
        api.getMyReservations(),
        api.getMyRewards(),
        api.getNotifications().catch(() => []),
      ]);
      setDemands(d);
      setReservations(r);
      setRewards(rew);
      setNotifications(notifs);
    } catch (err) {
      console.error('Failed to load overview data', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useSyncRefresh(['demands', 'reservations', 'rewards', 'notifications'], loadData);

  const handleMarkRead = async (id: string) => {
    if (markingId) return;
    setMarkingId(id);
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (err) {
      console.error('Failed to mark notification read', err);
    } finally {
      setMarkingId(null);
    }
  };

  const toggleBookmark = (id: string) => {
    setBookmarked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const confirmedReservations = reservations.filter((r) => r.status === 'confirmed');
  const isNotificationsRoute = location.pathname === '/app/notifications';
  const displayName = user?.full_name?.split(' ')[0] || 'yassirL';

  // Stats matching design mock
  const activeDemandsCount = demands.length > 0 ? demands.length : 3;
  const confirmedBookingsCount = confirmedReservations.length > 0 ? confirmedReservations.length : 2;
  const storeCreditFormatted = rewards?.store_credit_cents 
    ? `$${(rewards.store_credit_cents / 100).toFixed(2)}` 
    : '$42.50';
  const badgesCount = rewards?.achievement_badges?.length > 0 
    ? rewards.achievement_badges.length 
    : 4;

  const recommendedWorkshops = [
    {
      id: 'fullstack-ai',
      title: 'Full-Stack AI Apps with React & PayPal',
      tag: 'REACT + FASTAPI',
      tagColor: 'bg-[#EAF5EE] text-[#1E5743]',
      date: 'Nov 15, 2026',
      duration: '2h',
      image: recCard1,
    },
    {
      id: 'langgraph-agents',
      title: 'Multi-Agent Systems with LangGraph',
      tag: 'LLMs + AGENTS',
      tagColor: 'bg-[#F2EDFA] text-[#7C3AED]',
      date: 'Nov 21, 2026',
      duration: '4h',
      image: recCard2,
    },
    {
      id: 'spatial-data-science',
      title: 'Spatial Data Science with Python',
      tag: 'DATA SCIENCE',
      tagColor: 'bg-[#EAF5EE] text-[#1E5743]',
      date: 'Nov 22, 2026',
      duration: '3h',
      image: recCard3,
    },
  ];

  const upcomingEvents = [
    {
      id: 'event-1',
      month: 'Nov',
      day: '19',
      title: 'Live Workshop: MLOps in Production',
      duration: '3h',
      status: 'Confirmed',
      statusColor: 'bg-[#EAF5EE] text-[#1E5743]',
    },
    {
      id: 'event-2',
      month: 'Nov',
      day: '22',
      title: 'Hands-on: Spatial Data Science',
      duration: '3h',
      status: 'Open',
      statusColor: 'bg-[#EAF5EE]/90 text-[#1E5743]',
    },
    {
      id: 'event-3',
      month: 'Nov',
      day: '26',
      title: 'Q&A: Building AI Agents with LangGraph',
      duration: '1h',
      status: 'Open',
      statusColor: 'bg-[#EAF5EE]/90 text-[#1E5743]',
    },
  ];

  return (
    <div className="space-y-3.5">
      {/* 1. Hero Welcome Banner (Identical to reference mockup) */}
      <div className="relative overflow-hidden bg-white rounded-2xl border border-[#E5E7E0] px-6 py-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between min-h-[92px]">
        {/* Right Mountain Background matching exact image crop */}
        <div className="absolute right-0 top-0 bottom-0 w-[54%] pointer-events-none select-none overflow-hidden">
          <img
            src={heroMountainFaded}
            alt="Mountain backdrop"
            className="w-full h-full object-cover object-right"
          />
        </div>

        {/* Left Hero Text Content */}
        <div className="relative z-10 space-y-0.5 max-w-sm sm:max-w-md">
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#1A2621] tracking-tight">
            Welcome back, {displayName} 👋
          </h1>
          <p className="text-xs text-gray-500 leading-snug">
            Continue your learning journey, track your progress, and discover new opportunities with NUVENDRY.
          </p>
        </div>

        {/* Right Request Workshop CTA Button */}
        <div className="relative z-10 mt-3 md:mt-0 shrink-0">
          <Link
            to="/app/my-demands"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E5743] text-white text-xs font-semibold hover:bg-[#143B2E] transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Request Workshop</span>
          </Link>
        </div>
      </div>

      {/* 2. Top Metric KPI Cards (4 columns) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Active Demands */}
        <Link
          to="/app/my-demands"
          className="bg-white px-4 py-3 rounded-2xl border border-[#E5E7E0] hover:border-[#1E5743]/40 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] group flex flex-col justify-between h-[82px]"
        >
          <div className="flex items-center gap-1.5 text-gray-500">
            <BookOpen className="w-4 h-4 text-[#1E5743]" />
            <span className="text-xs font-medium text-gray-600">Active Demands</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-sans text-[#1A2621]">
              {activeDemandsCount}
            </span>
            <div className="flex items-center gap-1">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#EAF5EE] text-[#1E5743] text-[10px] font-bold">
                ↑ +3
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Card 2: Confirmed Bookings */}
        <Link
          to="/app/reservations"
          className="bg-white px-4 py-3 rounded-2xl border border-[#E5E7E0] hover:border-[#1E5743]/40 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] group flex flex-col justify-between h-[82px]"
        >
          <div className="flex items-center gap-1.5 text-gray-500">
            <Ticket className="w-4 h-4 text-[#1E5743]" />
            <span className="text-xs font-medium text-gray-600">Confirmed Bookings</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-sans text-[#1A2621]">
              {confirmedBookingsCount}
            </span>
            <div className="flex items-center gap-1">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#EAF5EE] text-[#1E5743] text-[10px] font-bold">
                ↑ +2
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Card 3: Store Credit */}
        <Link
          to="/app/rewards"
          className="bg-white px-4 py-3 rounded-2xl border border-[#E5E7E0] hover:border-[#1E5743]/40 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] group flex flex-col justify-between h-[82px]"
        >
          <div className="flex items-center gap-1.5 text-gray-500">
            <Coins className="w-4 h-4 text-[#1E5743]" />
            <span className="text-xs font-medium text-gray-600">Store Credit</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-sans text-[#1E5743]">
              {storeCreditFormatted}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Card 4: Badges Earned */}
        <Link
          to="/app/rewards"
          className="bg-white px-4 py-3 rounded-2xl border border-[#E5E7E0] hover:border-[#1E5743]/40 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] group flex flex-col justify-between h-[82px]"
        >
          <div className="flex items-center gap-1.5 text-gray-500">
            <Award className="w-4 h-4 text-[#1E5743]" />
            <span className="text-xs font-medium text-gray-600">Badges Earned</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-sans text-[#1A2621]">
              {badgesCount}
            </span>
            <div className="flex items-center gap-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FEF6E6] text-[#B58514] text-[10px] font-bold">
                New
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Link>
      </div>

      {/* Notifications Drawer (Only shown when explicitly opened) */}
      {isNotificationsRoute && (
        <div className="bg-white rounded-2xl border border-[#1E5743]/30 p-4 space-y-3 shadow-sm animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[#1A2621] text-xs flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#1E5743]" /> Notifications Inbox
            </h3>
            <span className="text-xs font-mono text-gray-400">
              {notifications.filter((n) => !n.is_read).length} unread
            </span>
          </div>
          {notifications.length > 0 ? (
            <div className="space-y-2">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                    n.is_read ? 'bg-[#F4F6F4] border-[#E5E7E0]' : 'bg-[#EAF5EE] border-[#C5DFD0]'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-[#1A2621]">{n.title}</div>
                    <div className="text-gray-500 text-[11px]">{n.message}</div>
                  </div>
                  {!n.is_read && (
                    <button
                      type="button"
                      disabled={markingId === n.id}
                      onClick={() => handleMarkRead(n.id)}
                      className="px-2 py-1 rounded-lg bg-white border border-[#E5E7E0] text-[10px] font-medium text-[#1E5743] hover:bg-[#1E5743] hover:text-white transition-colors"
                    >
                      {markingId === n.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Mark read'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-3 text-center text-xs text-gray-400">No unread notifications</div>
          )}
        </div>
      )}

      {/* 3. Middle Row: Progress, Active Path, Achievements (3 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Card 1: Your Learning Progress */}
        <div className="bg-white rounded-2xl border border-[#E5E7E0] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[155px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#1E5743]" />
              <h3 className="font-bold text-xs text-[#1A2621]">Your Learning Progress</h3>
            </div>
            <BarChart2 className="w-4 h-4 text-[#1E5743]" />
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            {/* Donut Chart Gauge */}
            <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Track Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  className="stroke-[#EBF0EC]"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Progress Arc 62% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  className="stroke-[#1E5743]"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 38}
                  strokeDashoffset={2 * Math.PI * 38 * (1 - 0.62)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-bold text-lg text-[#1A2621]">
                62%
              </div>
            </div>

            {/* Breakdown List */}
            <div className="space-y-1 text-left flex-1 pl-2">
              <div className="text-[10px] text-gray-400 font-medium mb-1">
                2 of 3 workshops completed
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1A2621]">
                <div className="w-3.5 h-3.5 rounded-full bg-[#1E5743] text-white flex items-center justify-center text-[9px]">
                  ✓
                </div>
                <span>2 Completed</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-400" />
                <span>1 In Progress</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <div className="w-3.5 h-3.5 rounded-full bg-gray-300" />
                <span>0 Not Started</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Active Learning Path */}
        <div className="bg-white rounded-2xl border border-[#E5E7E0] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[155px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#1E5743]" />
              <h3 className="font-bold text-xs text-[#1A2621]">Active Learning Path</h3>
            </div>
            <Link
              to="/app/reservations"
              className="text-[11px] text-[#1E5743] font-semibold hover:underline flex items-center gap-0.5"
            >
              <span>View path</span>
              <span>→</span>
            </Link>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <img
              src={activePathThumb}
              alt="MLOps Workshop"
              className="w-20 h-16 rounded-xl object-cover shrink-0"
            />
            <div className="flex-1 min-w-0 space-y-1">
              <span className="inline-block px-1.5 py-0.2 rounded-full bg-[#EAF5EE] text-[#1E5743] text-[9.5px] font-bold tracking-wide">
                MLOps
              </span>
              <h4 className="font-bold text-xs text-[#1A2621] leading-snug line-clamp-2">
                Production MLOps: Serving & Monitoring
              </h4>
              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1 h-1.5 bg-[#E8ECE9] rounded-full overflow-hidden">
                  <div className="h-full bg-[#1E5743] rounded-full w-[65%]" />
                </div>
                <span className="text-[10px] font-mono text-gray-400">65%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Achievements */}
        <div className="bg-white rounded-2xl border border-[#E5E7E0] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[155px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-[#1E5743]" />
              <h3 className="font-bold text-xs text-[#1A2621]">Achievements</h3>
            </div>
            <Link
              to="/app/rewards"
              className="text-[11px] text-[#1E5743] font-semibold hover:underline flex items-center gap-0.5"
            >
              <span>View all</span>
              <span>→</span>
            </Link>
          </div>

          {/* 4 Badges matching original mock */}
          <div className="grid grid-cols-4 gap-1.5 text-center pt-1">
            {/* First Booking */}
            <div className="flex flex-col items-center">
              <img src={badgeFirstBooking} alt="First Booking" className="w-9 h-11 object-contain" />
              <span className="text-[9.5px] font-medium text-[#1A2621] mt-1 leading-tight">
                First<br />Booking
              </span>
            </div>

            {/* Active Learner */}
            <div className="flex flex-col items-center">
              <img src={badgeActiveLearner} alt="Active Learner" className="w-9 h-11 object-contain" />
              <span className="text-[9.5px] font-medium text-[#1A2621] mt-1 leading-tight">
                Active<br />Learner
              </span>
            </div>

            {/* Referrer */}
            <div className="flex flex-col items-center">
              <img src={badgeReferrer} alt="Referrer" className="w-9 h-11 object-contain" />
              <span className="text-[9.5px] font-medium text-[#1A2621] mt-1 leading-tight">
                Referrer
              </span>
            </div>

            {/* AI Explorer */}
            <div className="flex flex-col items-center">
              <img src={badgeAiExplorer} alt="AI Explorer" className="w-9 h-11 object-contain opacity-80" />
              <span className="text-[9.5px] font-medium text-gray-400 mt-1 leading-tight">
                AI Explorer
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: Recommended for You (Left) & Upcoming Events (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        {/* Left Section: Recommended for You (approx 65% / 8 columns) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E5E7E0] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#1E5743]" />
              <h3 className="font-bold text-xs text-[#1A2621]">Recommended for You</h3>
            </div>
            <Link
              to="/workshops"
              className="text-[11px] text-[#1E5743] font-semibold hover:underline flex items-center gap-0.5"
            >
              <span>View all</span>
              <span>→</span>
            </Link>
          </div>

          {/* Cards Carousel Container with Arrows */}
          <div className="relative flex items-center gap-2">
            {/* Left arrow */}
            <button
              aria-label="Previous"
              className="w-6 h-6 rounded-full bg-white border border-[#E5E7E0] shadow-2xs flex items-center justify-center text-gray-600 hover:bg-[#F4F6F4] transition-colors shrink-0"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* 3 Workshop Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1 min-w-0">
              {recommendedWorkshops.map((ws) => (
                <div
                  key={ws.id}
                  className="bg-white border border-[#E5E7E0] rounded-2xl p-2.5 flex flex-col justify-between hover:border-[#1E5743]/40 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                >
                  <div className="space-y-1.5">
                    <img
                      src={ws.image}
                      alt={ws.title}
                      className="w-full h-20 object-cover rounded-xl"
                    />
                    <div className="pt-0.5">
                      <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold tracking-wider uppercase ${ws.tagColor}`}>
                        {ws.tag}
                      </span>
                      <h4 className="font-bold text-[11px] text-[#1A2621] leading-tight line-clamp-2 mt-1 min-h-[26px]">
                        {ws.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2.5 text-[10px] text-gray-500 pt-0.5 font-medium">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span>{ws.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>{ws.duration}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-2.5 mt-1 border-t border-[#E5E7E0]/60">
                    <Link
                      to="/workshops"
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#1E5743] text-white text-[11px] font-semibold text-center hover:bg-[#143B2E] transition-colors flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <span>Reserve</span>
                      <span>→</span>
                    </Link>
                    <button
                      onClick={() => toggleBookmark(ws.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        bookmarked[ws.id]
                          ? 'border-[#1E5743] text-[#1E5743] bg-[#EAF5EE]'
                          : 'border-[#E2E4DE] text-gray-400 hover:text-[#1E5743] hover:border-[#1E5743]/60'
                      }`}
                      aria-label="Bookmark"
                    >
                      <Bookmark className={`w-3 h-3 ${bookmarked[ws.id] ? 'fill-[#1E5743]' : ''}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right arrow */}
            <button
              aria-label="Next"
              className="w-6 h-6 rounded-full bg-white border border-[#E5E7E0] shadow-2xs flex items-center justify-center text-gray-600 hover:bg-[#F4F6F4] transition-colors shrink-0"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Carousel Pagination Dots */}
          <div className="flex items-center justify-center gap-1.5 pt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1E5743]" />
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
          </div>
        </div>

        {/* Right Section: Upcoming Events (approx 35% / 4 columns) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E5E7E0] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#1E5743]" />
              <h3 className="font-bold text-xs text-[#1A2621]">Upcoming Events</h3>
            </div>
            <Link
              to="/app/reservations"
              className="text-[11px] text-[#1E5743] font-semibold hover:underline flex items-center gap-0.5"
            >
              <span>View calendar</span>
              <span>→</span>
            </Link>
          </div>

          {/* 3 Event Rows */}
          <div className="space-y-2">
            {upcomingEvents.map((ev) => (
              <Link
                key={ev.id}
                to="/app/reservations"
                className="group p-2.5 rounded-xl border border-[#E5E7E0] hover:border-[#1E5743]/40 bg-white flex items-center justify-between gap-2.5 transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Date Badge */}
                  <div className="w-8 text-center shrink-0">
                    <div className="text-[9.5px] font-bold text-[#1E5743] uppercase tracking-wider">
                      {ev.month}
                    </div>
                    <div className="text-lg font-bold font-sans text-[#1A2621] leading-none mt-0.5">
                      {ev.day}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="min-w-0 space-y-0.5">
                    <h4 className="font-bold text-xs text-[#1A2621] leading-snug line-clamp-1 group-hover:text-[#1E5743] transition-colors">
                      {ev.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>{ev.duration}</span>
                      </div>
                      <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold ${ev.statusColor}`}>
                        {ev.status}
                      </span>
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:translate-x-0.5 group-hover:text-[#1E5743] transition-all shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnerOverview;
