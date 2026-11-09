import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, MessageSquare, Layers, Compass, Sparkles, 
  Ticket, Gift, Share2, Settings, LogOut, Menu, X, 
  Bell, ExternalLink, ChevronDown, Search, ArrowRight,
  ShieldCheck, Calendar
} from 'lucide-react';
import sidebarHillsAi from '../assets/sidebar-hills-ai.jpg';

const TOP_NAV_TABS = [
  { name: 'Overview', path: '/app/overview' },
  { name: 'Workshops', path: '/workshops' },
  { name: 'AI Matches', path: '/app/recommendations' },
  { name: 'Rewards', path: '/app/rewards' },
  { name: 'Referrals', path: '/app/referrals' },
];

const SIDEBAR_NAV = [
  { name: 'Overview', path: '/app/overview', icon: Home },
  { name: 'My Demands', path: '/app/my-demands', icon: MessageSquare },
  { name: 'My Learning', path: '/app/my-learning', icon: Layers },
  { name: 'Discover', path: '/app/discover', icon: Compass },
  { name: 'AI Matches', path: '/app/recommendations', icon: Sparkles },
  { name: 'Reservations', path: '/app/reservations', icon: Calendar },
  { name: 'Rewards & Gifts', path: '/app/rewards', icon: Gift },
  { name: 'Referrals', path: '/app/referrals', icon: Share2 },
  { name: 'Settings', path: '/app/settings', icon: Settings },
];

export const LearnerLayout: React.FC = () => {
  const { user, logout, isInstructor } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = user?.full_name?.split(' ')[0] || 'yassirL';
  const initial = displayName.charAt(0).toUpperCase() || 'Y';

  return (
    <div className="min-h-screen bg-[#F6F8F7] flex flex-col text-[#1A2621]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 h-[52px] sm:h-14 bg-white border-b border-[#E5E7E0] px-4 sm:px-6 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        {/* Left: Brand + Hub Badge + Nav Tabs */}
        <div className="flex items-center gap-4 lg:gap-6">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-charcoal/70 hover:bg-[#F6F8F7] transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-[26px] h-[26px] sm:w-7 sm:h-7 rounded-lg bg-[#0E6636] flex items-center justify-center text-white font-bold text-xs tracking-tight">
              N
            </div>
            <span className="font-bold text-xs sm:text-sm tracking-wide text-[#1A2621] uppercase">
              NUVENDRY
            </span>
          </Link>

          {/* Learner Hub Pill */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFAED] border border-[#C5DFD0] text-[#0E6636] text-xs font-semibold">
            <Layers className="w-3.5 h-3.5 text-[#0E6636]" />
            <span>Learner Hub</span>
          </div>

          {/* Top Horizontal Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5">
            {TOP_NAV_TABS.map((tab) => {
              const isActive = location.pathname === tab.path;
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`relative py-4 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'text-[#1A2621]'
                      : 'text-gray-500 hover:text-[#1A2621]'
                  }`}
                >
                  {tab.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#0E6636] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Search + Bell + User Pill */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Search bar */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border border-[#E2E4DE] bg-white text-xs shadow-[0_1px_2px_rgba(0,0,0,0.02)] focus-within:border-[#0E6636]/60 transition-colors">
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search workshops, topics, or skills..."
              className="bg-transparent border-none outline-none text-xs text-[#1A2621] placeholder:text-gray-400 w-48 lg:w-56"
            />
            <kbd className="hidden lg:inline-block px-1 py-px text-[9px] font-mono text-gray-400 bg-[#F0F2ED] border border-[#E2E4DE] rounded">
              Ctrl K
            </kbd>
          </div>

          {/* Bell Icon */}
          <Link
            to="/app/notifications"
            className="relative p-1.5 rounded-full hover:bg-[#F6F8F7] text-gray-600 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-gray-700" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#1B8441] ring-2 ring-white" />
          </Link>

          {/* User Profile */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-[#F6F8F7] transition-colors focus-visible:outline-none"
              aria-label="User menu"
            >
              <div className="w-7 h-7 rounded-full bg-[#1B8441] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                {initial}
              </div>
              <div className="hidden sm:block text-left leading-none">
                <div className="text-xs font-bold text-[#1A2621]">
                  {displayName}
                </div>
                <div className="text-[10px] text-gray-400 font-sans mt-0.5">
                  {user?.role || 'Learner'}
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-[#E5E7E0] p-2 shadow-lg z-50">
                <div className="px-3 py-2 border-b border-[#E5E7E0] mb-1">
                  <div className="text-xs font-bold text-[#1A2621]">{user?.full_name || displayName}</div>
                  <div className="text-[10px] text-gray-400 truncate font-mono">{user?.email}</div>
                </div>

                <Link
                  to="/app/settings"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[#1A2621] hover:bg-[#F6F8F7] transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-gray-500" />
                  <span>Settings</span>
                </Link>

                {isInstructor && (
                  <Link
                    to="/merchant/overview"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#0E6636] hover:bg-[#EBF9EA] transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0E6636]" />
                    <span>Switch to Instructor</span>
                  </Link>
                )}

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    logout();
                    navigate('/');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 max-w-[1380px] w-full mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row gap-4 items-stretch">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-[185px] shrink-0 gap-3">
          {/* Menu Card - compact, identical to reference mockup */}
          <div className="bg-white rounded-2xl border border-[#E5E7E0] p-2 space-y-0.5 shadow-sm">
            <div className="px-2.5 py-1 text-[9.5px] font-mono font-semibold text-gray-400 uppercase tracking-wider">
              LEARNER WORKSPACE
            </div>

            {SIDEBAR_NAV.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path === '/app/overview' && location.pathname === '/app/notifications');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#EBF9EA] text-[#0E6636] font-semibold'
                      : 'text-[#333F39] hover:bg-[#F6F8F7] hover:text-[#1A2621]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#0E6636]' : 'text-gray-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <div className="pt-2 mt-1 border-t border-[#E5E7E0] px-2.5 pb-1">
              <Link
                to="/workshops"
                className="flex items-center justify-between text-xs font-semibold text-[#1A2621] hover:text-[#0E6636] transition-colors"
              >
                <span>Marketplace Catalog</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </Link>
            </div>
          </div>

          {/* Learn. Book. Earn Rewards Promo Card - matches exact reference mockup */}
          <div className="relative overflow-hidden bg-white rounded-2xl border border-[#E5E7E0] p-3.5 shadow-sm h-[195px] flex flex-col justify-between">
            <div className="relative z-10 space-y-1">
              <h4 className="font-serif font-bold text-[#0E6636] text-sm sm:text-base leading-tight">
                {location.pathname === '/app/discover' ? (
                  <>Explore<br />Workshops<br />That Grow You.</>
                ) : (
                  <>Learn. Book.<br />Earn Rewards.</>
                )}
              </h4>
              <p className="text-[10px] text-gray-500 leading-snug">
                {location.pathname === '/app/discover'
                  ? 'Discover curated, hands-on workshops from expert instructors and industry practitioners.'
                  : location.pathname === '/app/reservations'
                  ? 'Reserve workshops, manage your bookings, and never miss a session.'
                  : 'Complete workshops, earn credits & gifts, and grow your skills.'}
              </p>
              <div className="pt-2">
                <Link
                  to="/workshops"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#026630] hover:bg-[#025628] text-white text-[11px] font-semibold transition-colors shadow-sm"
                >
                  <span>{location.pathname === '/app/discover' ? 'Browse Catalog' : 'Explore Catalog'}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Bottom mountain backdrop from AI */}
            <div className="absolute bottom-0 left-0 right-0 h-[68px] pointer-events-none opacity-90 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,black_20%)]">
              <img
                src={sidebarHillsAi}
                alt="Mountains"
                className="w-full h-full object-cover object-bottom"
              />
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden w-full bg-white rounded-2xl border border-[#E5E7E0] p-4 space-y-2 mb-3 shadow-sm animate-in fade-in">
            <div className="px-3 py-1 text-[10px] font-mono font-semibold text-gray-400 uppercase">
              LEARNER WORKSPACE
            </div>
            {SIDEBAR_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#EBF9EA] text-[#0E6636] font-semibold'
                      : 'text-[#333F39] hover:bg-[#F6F8F7]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#0E6636]" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-[#E5E7E0] px-3">
              <Link
                to="/workshops"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-semibold text-[#0E6636] flex items-center justify-between py-1"
              >
                <span>Marketplace Catalog</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Content Outlet */}
        <main className="flex-1 w-full min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LearnerLayout;
