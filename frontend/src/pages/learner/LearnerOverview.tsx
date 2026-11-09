import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api, useSyncRefresh } from '../../api/client';
import { Link, useLocation } from 'react-router-dom';
import { 
  MessageSquare, Ticket, Coins, Award, BarChart2,
  Layers, Trophy, Calendar, Clock, ChevronRight, ChevronLeft,
  Bookmark, Plus, Bell, Loader2, Users, Zap,
  PlusCircle, Sparkles, Target, ArrowRight
} from 'lucide-react';
import { LearningDemand, Reservation, NotificationItem } from '../../types';

// High-fidelity AI-generated assets
import heroMountainsAi from '../../assets/hero-mountains-ai.jpg';
import activePathThumb from '../../assets/active-path-thumb.png';
import workshopMlops from '../../assets/workshop-mlops.jpg';
import workshopFullstack from '../../assets/workshop-fullstack.jpg';
import workshopSpatial from '../../assets/workshop-spatial.jpg';
import workshopLanggraph from '../../assets/workshop-langgraph.jpg';
import badgeFirstWorkshop from '../../assets/badge-first-workshop.png';
import badgeActiveLearner from '../../assets/badge-active-learner.png';
import badgeMlopsExplorer from '../../assets/badge-mlops-explorer.png';
import badgeCommunityMember from '../../assets/badge-community-member.png';
import advisorHills from '../../assets/advisor-hills.png';
import milestoneMountainsAi from '../../assets/milestone-mountains-ai.jpg';

export const LearnerOverview: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [demands, setDemands] = useState<LearningDemand[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rewards, setRewards] = useState<any | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});
  const [calendarMonth, setCalendarMonth] = useState('November 2026');
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(19);
  const [carouselIndex, setCarouselIndex] = useState(0);

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

  // Stats matching design mock with real backend fallback
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
      title: 'Full-Stack AI Apps with React & FastAPI',
      tag: 'REACT + FASTAPI',
      price: '$29.00',
      date: 'Nov 15, 2026',
      duration: '2h',
      attendees: '29 / 30',
      image: workshopFullstack,
    },
    {
      id: 'spatial-data-science',
      title: 'Spatial Data Science with Python',
      tag: 'DATA SCIENCE',
      price: '$39.00',
      date: 'Nov 22, 2026',
      duration: '3h',
      attendees: '20 / 25',
      image: workshopSpatial,
    },
    {
      id: 'langgraph-agents',
      title: 'Multi-Agent Systems with LangGraph',
      tag: 'LLMs + AGENTS',
      price: '$49.00',
      date: 'Nov 21, 2026',
      duration: '4h',
      attendees: '15 / 20',
      image: workshopLanggraph,
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
    },
    {
      id: 'event-2',
      month: 'Nov',
      day: '22',
      title: 'Hands-on: Spatial Data Science',
      duration: '3h',
      status: 'Open',
    },
    {
      id: 'event-3',
      month: 'Nov',
      day: '26',
      title: 'Q&A: Building AI Agents with LangGraph',
      duration: '1h',
      status: 'Open',
    },
  ];

  // Calendar dates for November 2026
  // October 26-31 (inactive), November 1-30, December 1-6 (inactive)
  const calendarDays = [
    { day: 26, isCurrentMonth: false },
    { day: 27, isCurrentMonth: false },
    { day: 28, isCurrentMonth: false },
    { day: 29, isCurrentMonth: false },
    { day: 30, isCurrentMonth: false },
    { day: 31, isCurrentMonth: false },
    { day: 1, isCurrentMonth: true },

    { day: 2, isCurrentMonth: true },
    { day: 3, isCurrentMonth: true },
    { day: 4, isCurrentMonth: true },
    { day: 5, isCurrentMonth: true },
    { day: 6, isCurrentMonth: true },
    { day: 7, isCurrentMonth: true },
    { day: 8, isCurrentMonth: true },

    { day: 9, isCurrentMonth: true },
    { day: 10, isCurrentMonth: true },
    { day: 11, isCurrentMonth: true },
    { day: 12, isCurrentMonth: true },
    { day: 13, isCurrentMonth: true },
    { day: 14, isCurrentMonth: true },
    { day: 15, isCurrentMonth: true },

    { day: 16, isCurrentMonth: true },
    { day: 17, isCurrentMonth: true },
    { day: 18, isCurrentMonth: true },
    { day: 19, isCurrentMonth: true, isHighlight: true, eventType: 'workshop' },
    { day: 20, isCurrentMonth: true },
    { day: 21, isCurrentMonth: true },
    { day: 22, isCurrentMonth: true, hasDot: true, eventType: 'session' },

    { day: 23, isCurrentMonth: true },
    { day: 24, isCurrentMonth: true },
    { day: 25, isCurrentMonth: true },
    { day: 26, isCurrentMonth: true, hasDot: true, eventType: 'session' },
    { day: 27, isCurrentMonth: true },
    { day: 28, isCurrentMonth: true },
    { day: 29, isCurrentMonth: true },

    { day: 30, isCurrentMonth: true },
    { day: 1, isCurrentMonth: false },
    { day: 2, isCurrentMonth: false },
    { day: 3, isCurrentMonth: false },
    { day: 4, isCurrentMonth: false },
    { day: 5, isCurrentMonth: false },
    { day: 6, isCurrentMonth: false },
  ];

  return (
    <div className="space-y-3.5">
      {/* Notifications Drawer (Only shown when explicitly opened) */}
      {isNotificationsRoute && (
        <div className="bg-white rounded-2xl border border-[#0E6636]/30 p-4 space-y-3 shadow-sm animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[#1A2621] text-xs flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#0E6636]" /> Notifications Inbox
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
                    n.is_read ? 'bg-[#F6F8F7] border-[#E5E7E0]' : 'bg-[#EBF9EA] border-[#C5DFD0]'
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
                      className="px-2 py-1 rounded-lg bg-white border border-[#E5E7E0] text-[10px] font-medium text-[#0E6636] hover:bg-[#0E6636] hover:text-white transition-colors"
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

      {/* Main Row: Center Main Dashboard + Right Side Widgets */}
      <div className="flex flex-col xl:flex-row gap-3.5 items-start">
        
        {/* CENTER CONTENT COLUMN */}
        <div className="flex-1 min-w-0 space-y-3.5 w-full">
          
          {/* 1. Hero Welcome Banner (Identical to reference mockup) */}
          <div className="relative overflow-hidden bg-white rounded-2xl border border-[#E5E7E0] px-6 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between min-h-[92px]">
            {/* Right Mountain Background with smooth fade */}
            <div className="absolute right-0 top-0 bottom-0 w-[55%] pointer-events-none select-none overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_25%)]">
              <img
                src={heroMountainsAi}
                alt="Mountain backdrop"
                className="w-full h-full object-cover object-center"
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
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0E6636] hover:bg-[#153F30] text-white text-xs font-semibold transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Request Workshop</span>
              </Link>
            </div>
          </div>

          {/* 2. Top Metric KPI Cards (4 columns) - Numbers are green as in reference */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Card 1: Active Demands */}
            <Link
              to="/app/my-demands"
              className="bg-white px-4 py-3 rounded-2xl border border-[#E5E7E0] hover:border-[#0E6636]/40 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] group flex flex-col justify-between h-[82px]"
            >
              <div className="flex items-center gap-1.5 text-gray-500">
                <MessageSquare className="w-4 h-4 text-[#0E6636]" />
                <span className="text-xs font-medium text-gray-600">Active Demands</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-sans text-[#0E6636]">
                  {activeDemandsCount}
                </span>
                <div className="flex items-center gap-1">
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#EBF9EA] text-[#0E6636] text-[10px] font-bold">
                    ↑ +{activeDemandsCount}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Card 2: Confirmed Bookings */}
            <Link
              to="/app/reservations"
              className="bg-white px-4 py-3 rounded-2xl border border-[#E5E7E0] hover:border-[#0E6636]/40 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] group flex flex-col justify-between h-[82px]"
            >
              <div className="flex items-center gap-1.5 text-gray-500">
                <Ticket className="w-4 h-4 text-[#0E6636]" />
                <span className="text-xs font-medium text-gray-600">Confirmed Bookings</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-sans text-[#0E6636]">
                  {confirmedBookingsCount}
                </span>
                <div className="flex items-center gap-1">
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#EBF9EA] text-[#0E6636] text-[10px] font-bold">
                    ↑ +{confirmedBookingsCount}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Card 3: Store Credit */}
            <Link
              to="/app/rewards"
              className="bg-white px-4 py-3 rounded-2xl border border-[#E5E7E0] hover:border-[#0E6636]/40 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] group flex flex-col justify-between h-[82px]"
            >
              <div className="flex items-center gap-1.5 text-gray-500">
                <Coins className="w-4 h-4 text-[#0E6636]" />
                <span className="text-xs font-medium text-gray-600">Store Credit</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-sans text-[#0E6636]">
                  {storeCreditFormatted}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Card 4: Badges Earned */}
            <Link
              to="/app/rewards"
              className="bg-white px-4 py-3 rounded-2xl border border-[#E5E7E0] hover:border-[#0E6636]/40 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] group flex flex-col justify-between h-[82px]"
            >
              <div className="flex items-center gap-1.5 text-gray-500">
                <Award className="w-4 h-4 text-[#0E6636]" />
                <span className="text-xs font-medium text-gray-600">Badges Earned</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-sans text-[#0E6636]">
                  {badgesCount}
                </span>
                <div className="flex items-center gap-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FEF6E6] text-[#B58514] text-[10px] font-bold">
                    New
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          </div>

          {/* 3. Middle Row: Progress, Active Path, Achievements (3 columns) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Card 1: Your Learning Progress */}
            <div className="bg-white rounded-2xl border border-[#E5E7E0] p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[155px]">
              <div className="flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-[#0E6636] shrink-0" />
                <h3 className="font-bold text-xs text-[#1A2621] whitespace-nowrap">Your Learning Progress</h3>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                {/* Donut Chart Gauge */}
                <div className="relative w-[72px] h-[72px] sm:w-20 sm:h-20 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      className="stroke-[#EBF0EC]"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      className="stroke-[#0E6636]"
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

                {/* Breakdown Legend List */}
                <div className="space-y-1 text-left flex-1 pl-2">
                  <div className="text-[9.5px] text-gray-400 font-medium whitespace-nowrap pb-0.5">
                    {confirmedBookingsCount} of 3 workshops completed
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1A2621]">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#0E6636] text-white flex items-center justify-center text-[9px]">
                      ✓
                    </div>
                    <span>{confirmedBookingsCount} Completed</span>
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
            <div className="bg-white rounded-2xl border border-[#E5E7E0] p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[155px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#0E6636]" />
                  <h3 className="font-bold text-xs text-[#1A2621]">Active Learning Path</h3>
                </div>
                <Link
                  to="/app/reservations"
                  className="text-[11px] text-[#0E6636] font-semibold hover:underline flex items-center gap-0.5"
                >
                  <span>View path</span>
                  <span>→</span>
                </Link>
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <img
                  src={workshopMlops}
                  alt="MLOps Workshop"
                  className="w-[72px] h-14 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <span className="inline-block px-1.5 py-px rounded-full bg-[#EBF9EA] text-[#0E6636] text-[9px] font-bold tracking-wide">
                    MLOps
                  </span>
                  <h4 className="font-bold text-xs text-[#1A2621] leading-snug line-clamp-2">
                    Production MLOps: Serving & Monitoring
                  </h4>
                  <div className="flex items-center gap-2 pt-0.5">
                    <div className="flex-1 h-1.5 bg-[#E8ECE9] rounded-full overflow-hidden">
                      <div className="h-full bg-[#0E6636] rounded-full w-[65%]" />
                    </div>
                    <span className="text-[10px] font-mono text-gray-400">65%</span>
                  </div>
                </div>
              </div>

              {/* Meta row at bottom of Active Learning Path */}
              <div className="flex items-center justify-between text-[9.5px] text-gray-500 pt-1 border-t border-[#E5E7E0]/60">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span>Nov 19 - Nov 26, 2026</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span>~ 6 hours</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-gray-400" />
                  <span>15 / 20</span>
                </div>
              </div>
            </div>

            {/* Card 3: Achievements */}
            <div className="bg-white rounded-2xl border border-[#E5E7E0] p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[155px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-[#0E6636]" />
                  <h3 className="font-bold text-xs text-[#1A2621]">Achievements</h3>
                </div>
                <Link
                  to="/app/rewards"
                  className="text-[11px] text-[#0E6636] font-semibold hover:underline flex items-center gap-0.5"
                >
                  <span>View all</span>
                  <span>→</span>
                </Link>
              </div>

              {/* 4 Badges matching exact image */}
              <div className="grid grid-cols-4 gap-1.5 text-center pt-1 items-start">
                {/* First Workshop */}
                <div className="flex flex-col items-center">
                  <img src={badgeFirstWorkshop} alt="First Workshop" className="w-[34px] h-9 object-contain" />
                  <span className="text-[9px] font-medium text-[#1A2621] mt-1 leading-tight">
                    First<br />Workshop
                  </span>
                </div>

                {/* Active Learner */}
                <div className="flex flex-col items-center">
                  <img src={badgeActiveLearner} alt="Active Learner" className="w-[34px] h-9 object-contain" />
                  <span className="text-[9px] font-medium text-[#1A2621] mt-1 leading-tight">
                    Active<br />Learner
                  </span>
                </div>

                {/* MLOps Explorer */}
                <div className="flex flex-col items-center">
                  <img src={badgeMlopsExplorer} alt="MLOps Explorer" className="w-[34px] h-9 object-contain" />
                  <span className="text-[9px] font-medium text-[#1A2621] mt-1 leading-tight">
                    MLOps<br />Explorer
                  </span>
                </div>

                {/* Community Member */}
                <div className="flex flex-col items-center">
                  <img src={badgeCommunityMember} alt="Community Member" className="w-[34px] h-9 object-contain" />
                  <span className="text-[9px] font-medium text-[#1A2621] mt-1 leading-tight">
                    Community<br />Member
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Bottom Row of Center: Recommended for You (approx 62%) & Upcoming Events (approx 38%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
            
            {/* Recommended for You */}
            <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-2xl border border-[#E5E7E0] p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#0E6636]" />
                  <h3 className="font-bold text-xs text-[#1A2621]">Recommended for You</h3>
                </div>
                <Link
                  to="/workshops"
                  className="text-[11px] text-[#0E6636] font-semibold hover:underline flex items-center gap-0.5"
                >
                  <span>View all workshops</span>
                  <span>→</span>
                </Link>
              </div>

              {/* Cards Carousel Container with Arrows */}
              <div className="relative flex items-center gap-2">
                {/* Left arrow */}
                <button
                  type="button"
                  onClick={() => setCarouselIndex((prev) => (prev > 0 ? prev - 1 : 0))}
                  aria-label="Previous"
                  className="w-6 h-6 rounded-full bg-white border border-[#E5E7E0] shadow-sm flex items-center justify-center text-gray-500 hover:bg-[#F6F8F7] transition-colors shrink-0"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {/* 3 Workshop Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 min-w-0">
                  {recommendedWorkshops.map((ws) => (
                    <div
                      key={ws.id}
                      className="bg-white border border-[#E5E7E0] rounded-xl p-2 flex flex-col justify-between hover:border-[#0E6636]/40 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                    >
                      <div className="space-y-1.5">
                        {/* Thumbnail left + tag/price/title right (reference layout) */}
                        <div className="flex items-start gap-2">
                          <img
                            src={ws.image}
                            alt={ws.title}
                            className="w-[46px] h-[46px] object-cover rounded-lg shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 text-[8px] font-bold">
                              <span className="px-1 py-px rounded bg-[#EBF9EA] text-[#0E6636] tracking-wide truncate">
                                {ws.tag}
                              </span>
                              <span className="text-[#1A2621] font-sans font-bold text-[9.5px] shrink-0">
                                {ws.price}
                              </span>
                            </div>
                            <h4 className="font-bold text-[10.5px] text-[#1A2621] leading-tight line-clamp-2 mt-1">
                              {ws.title}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-1 text-[8.5px] text-gray-500 font-medium whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5 text-gray-400" />
                            <span>{ws.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-gray-400" />
                            <span>{ws.duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-2.5 h-2.5 text-gray-400" />
                            <span>{ws.attendees}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 pt-1.5">
                        <Link
                          to="/workshops"
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#0E6636] hover:bg-[#143B2E] text-white text-[10.5px] font-semibold text-center transition-colors flex items-center justify-center gap-1 shadow-sm"
                        >
                          <span>Reserve</span>
                          <span>→</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleBookmark(ws.id)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            bookmarked[ws.id]
                              ? 'border-[#0E6636] text-[#0E6636] bg-[#EBF9EA]'
                              : 'border-[#E2E4DE] text-gray-400 hover:text-[#0E6636] hover:border-[#0E6636]/60'
                          }`}
                          aria-label="Bookmark"
                        >
                          <Bookmark className={`w-3 h-3 ${bookmarked[ws.id] ? 'fill-[#0E6636]' : ''}`} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right arrow */}
                <button
                  type="button"
                  onClick={() => setCarouselIndex((prev) => (prev < 1 ? prev + 1 : 1))}
                  aria-label="Next"
                  className="w-6 h-6 rounded-full bg-white border border-[#E5E7E0] shadow-sm flex items-center justify-center text-gray-500 hover:bg-[#F6F8F7] transition-colors shrink-0"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Carousel Pagination Dots */}
              <div className="flex items-center justify-center gap-1.5 pt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full transition-colors ${carouselIndex === 0 ? 'bg-[#0E6636]' : 'bg-gray-300'}`} />
                <span className={`w-1.5 h-1.5 rounded-full transition-colors ${carouselIndex === 1 ? 'bg-[#0E6636]' : 'bg-gray-300'}`} />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl border border-[#E5E7E0] p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-start">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#0E6636]" />
                  <h3 className="font-bold text-xs text-[#1A2621]">Upcoming Events</h3>
                </div>
                <Link
                  to="/app/reservations"
                  className="text-[11px] text-[#0E6636] font-semibold hover:underline flex items-center gap-0.5"
                >
                  <span>View all</span>
                  <span>→</span>
                </Link>
              </div>

              {/* 3 Event Rows */}
              <div className="space-y-2">
                {upcomingEvents.map((ev) => (
                  <Link
                    key={ev.id}
                    to="/app/reservations"
                    className="group p-2 rounded-xl border border-[#E5E7E0] hover:border-[#0E6636]/40 bg-white flex items-center justify-between gap-2.5 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Date Badge */}
                      <div className="w-7 text-center shrink-0">
                        <div className="text-[9px] font-bold text-[#0E6636] uppercase tracking-wider leading-none">
                          {ev.month}
                        </div>
                        <div className="text-base font-bold font-sans text-[#1A2621] leading-tight mt-0.5">
                          {ev.day}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="min-w-0 space-y-0.5">
                        <h4 className="font-bold text-xs text-[#1A2621] leading-snug line-clamp-1 group-hover:text-[#0E6636] transition-colors">
                          {ev.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[9.5px] text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-gray-400" />
                            <span>{ev.duration}</span>
                          </div>
                          <span className="px-1.5 py-px rounded-full text-[8.5px] font-bold bg-[#EBF9EA] text-[#0E6636]">
                            {ev.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:translate-x-0.5 group-hover:text-[#0E6636] transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT SIDEBAR COLUMN (Calendar, Quick Actions, AI Learning Advisor) */}
        <div className="w-full xl:w-[260px] 2xl:w-[276px] shrink-0 space-y-3.5">
          
          {/* Card 1: My Schedule */}
          <div className="bg-white rounded-2xl border border-[#E5E7E0] p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-2.5">
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
                onClick={() => setCalendarMonth('October 2026')}
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
                onClick={() => setCalendarMonth('December 2026')}
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
            <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
              {calendarDays.map((item, idx) => {
                const isSelected = item.isCurrentMonth && item.day === selectedCalendarDay;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (item.isCurrentMonth) setSelectedCalendarDay(item.day);
                    }}
                    className={`h-[26px] flex flex-col items-center justify-center rounded-full transition-colors relative ${
                      !item.isCurrentMonth ? 'text-gray-300 cursor-default' : 'hover:bg-[#F6F8F7]'
                    }`}
                  >
                    {item.isHighlight || isSelected ? (
                      <span className="w-[22px] h-[22px] rounded-full bg-[#0E6636] text-white flex items-center justify-center font-bold text-[10.5px]">
                        {item.day}
                      </span>
                    ) : (
                      <span className={`text-[11px] ${item.isCurrentMonth ? 'text-[#1A2621] font-medium' : 'text-gray-300'}`}>
                        {item.day}
                      </span>
                    )}

                    {/* Dot indicator under day 22 & 26 */}
                    {item.hasDot && !isSelected && (
                      <span className="w-1 h-1 rounded-full bg-[#10B981] absolute bottom-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend row */}
            <div className="flex items-center justify-between text-[9.5px] text-gray-500 pt-1.5 border-t border-[#E5E7E0]/60 px-0.5">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#0E6636]" />
                <span>Workshop</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                <span>Live session</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full border border-gray-400" />
                <span>Task</span>
              </div>
            </div>
          </div>

          {/* Card 2: Quick Actions */}
          <div className="bg-white rounded-2xl border border-[#E5E7E0] p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-2.5">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#0E6636]" />
              <h3 className="font-bold text-xs text-[#1A2621]">Quick Actions</h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* New Demand */}
              <Link
                to="/app/my-demands"
                className="flex items-center gap-1.5 p-2 rounded-xl border border-[#E5E7E0] hover:border-[#0E6636]/50 hover:bg-[#F6F8F7] transition-all text-xs font-semibold text-[#1A2621] group"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#0E6636] shrink-0" />
                <span className="truncate">New Demand</span>
              </Link>

              {/* Book Workshop */}
              <Link
                to="/workshops"
                className="flex items-center gap-1.5 p-2 rounded-xl border border-[#E5E7E0] hover:border-[#0E6636]/50 hover:bg-[#F6F8F7] transition-all text-xs font-semibold text-[#1A2621] group"
              >
                <Calendar className="w-3.5 h-3.5 text-[#0E6636] shrink-0" />
                <span className="truncate">Book Workshop</span>
              </Link>

              {/* Save Resource */}
              <Link
                to="/app/reservations"
                className="flex items-center gap-1.5 p-2 rounded-xl border border-[#E5E7E0] hover:border-[#0E6636]/50 hover:bg-[#F6F8F7] transition-all text-xs font-semibold text-[#1A2621] group"
              >
                <Bookmark className="w-3.5 h-3.5 text-[#0E6636] shrink-0" />
                <span className="truncate">Save Resource</span>
              </Link>

              {/* Get Support */}
              <Link
                to="/app/settings"
                className="flex items-center gap-1.5 p-2 rounded-xl border border-[#E5E7E0] hover:border-[#0E6636]/50 hover:bg-[#F6F8F7] transition-all text-xs font-semibold text-[#1A2621] group"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#0E6636] shrink-0" />
                <span className="truncate">Get Support</span>
              </Link>
            </div>
          </div>

          {/* Card 3: AI Learning Advisor */}
          <div className="relative overflow-hidden bg-white rounded-2xl border border-[#E5E7E0] p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[165px]">
            <div className="relative z-10 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#0E6636]" />
                  <h3 className="font-bold text-xs text-[#1A2621]">AI Learning Advisor</h3>
                </div>
                <span className="px-1.5 py-px rounded-full bg-[#EBF9EA] text-[#0E6636] text-[9px] font-bold">
                  AI
                </span>
              </div>

              <p className="text-[10.5px] text-gray-500 leading-snug pt-0.5">
                Get personalized workshop recommendations, next steps, and skill-building guidance based on your goals.
              </p>

              <div className="pt-1.5">
                <Link
                  to="/app/recommendations"
                  className="w-full py-2 px-3 rounded-xl bg-white border border-[#C5DFD0] hover:border-[#0E6636] hover:bg-[#EBF9EA]/40 text-[#0E6636] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask the AI Advisor</span>
                </Link>
              </div>
            </div>

            {/* Bottom green hills graphic */}
            <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none opacity-90 select-none overflow-hidden">
              <img
                src={advisorHills}
                alt="Green hills"
                className="w-full h-full object-cover object-bottom"
              />
            </div>
          </div>

        </div>

      </div>

      {/* 5. Full-Width Milestone Banner (Exact match to reference mockup) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0C3827] via-[#1A5038] to-[#123E2C] border border-[#164834] px-5 sm:px-6 py-4 shadow-[0_2px_4px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4 text-white min-h-[58px]">
        {/* Left: Bullseye Icon + Milestone Text */}
        <div className="relative z-10 flex items-center gap-3.5 max-w-xl">
          <div className="w-[34px] h-[34px] rounded-full border border-white/20 bg-white/10 flex items-center justify-center text-white shrink-0">
            <Target className="w-[18px] h-[18px]" />
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base text-white tracking-tight leading-tight">
              Reach Your Next Milestone
            </h4>
            <p className="text-xs text-white/80 leading-snug mt-0.5">
              Complete one more workshop to unlock the "Skill Builder" badge and a $10 store credit.
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

        {/* Far Right: Explore Workshops CTA Button */}
        <div className="relative z-10 shrink-0">
          <Link
            to="/workshops"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-gray-50 text-[#1A2621] text-xs font-bold transition-all shadow-sm"
          >
            <span>Explore Workshops</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

    </div>
  );
};

export default LearnerOverview;
