import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, MessageSquare, Layers, Compass, Sparkles, 
  Ticket, Gift, Share2, Settings, LogOut, Menu, X, 
  Bell, ExternalLink, ChevronDown, Search, ArrowRight,
  ShieldCheck
} from 'lucide-react';
import sidebarExploreCard from '../assets/sidebar-explore-card.png';

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
  { name: 'My Learning', path: '/app/reservations', icon: Layers },
  { name: 'Discover', path: '/app/discover', icon: Compass },
  { name: 'AI Matches', path: '/app/recommendations', icon: Sparkles },
  { name: 'Reservations', path: '/app/reservations', icon: Ticket },
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
    <div className="min-h-screen bg-[#F4F6F4] flex flex-col text-[#1A2621]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 h-13 sm:h-14 bg-white border-b border-[#E5E7E0] px-4 sm:px-6 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        {/* Left: Brand + Hub Badge + Nav Tabs */}
        <div className="flex items-center gap-4 lg:gap-6">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-charcoal/70 hover:bg-[#F4F6F4] transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-lg bg-[#1E5743] flex items-center justify-center text-white font-bold text-xs tracking-tight">
              N
            </div>
            <span className="font-bold text-xs sm:text-sm tracking-wide text-[#1A2621] uppercase">
              NUVENDRY
            </span>
          </Link>

          {/* Learner Hub Pill */}
          <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EAF5EE] border border-[#C5DFD0] text-[#1E5743] text-xs font-semibold">
            <Layers className="w-3.5 h-3.5" />
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
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#1E5743] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Search + Bell + User Pill */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Search bar */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border border-[#E2E4DE] bg-white text-xs shadow-[0_1px_2px_rgba(0,0,0,0.02)] focus-within:border-[#1E5743]/60 transition-colors">
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search workshops, topics, or skills..."
              className="bg-transparent border-none outline-none text-xs text-[#1A2621] placeholder:text-gray-400 w-48 lg:w-56"
            />
            <kbd className="hidden lg:inline-block px-1 py-0.2 text-[9px] font-mono text-gray-400 bg-[#F0F2ED] border border-[#E2E4DE] rounded">
              Ctrl K
            </kbd>
          </div>

          {/* Bell Icon */}
          <Link
            to="/app/notifications"
            className="relative p-1.5 rounded-full hover:bg-[#F4F6F4] text-gray-600 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-gray-700" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white" />
          </Link>

          {/* User Profile */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-[#F4F6F4] transition-colors focus-visible:outline-none"
              aria-label="User menu"
            >
              <div className="w-7 h-7 rounded-full bg-[#1E5743] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
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
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[#1A2621] hover:bg-[#F4F6F4] transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-gray-500" />
                  <span>Settings</span>
                </Link>

                {isInstructor && (
                  <Link
                    to="/merchant/overview"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#1E5743] hover:bg-[#EAF5EE] transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#1E5743]" />
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
      <div className="flex-1 max-w-[1380px] w-full mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row gap-4 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-[176px] shrink-0 space-y-3.5 sticky top-18">
          {/* Menu Card */}
          <div className="bg-white rounded-2xl border border-[#E5E7E0] p-2 space-y-0.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="px-2.5 py-1.5 text-[9.5px] font-mono font-semibold text-gray-400 uppercase tracking-wider">
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
                      ? 'bg-[#EAF5EE] text-[#1E5743] font-semibold'
                      : 'text-[#333F39] hover:bg-[#F4F6F4] hover:text-[#1A2621]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#1E5743]' : 'text-gray-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <div className="pt-2 mt-1 border-t border-[#E5E7E0] px-2.5 pb-1">
              <Link
                to="/workshops"
                className="flex items-center justify-between text-xs font-semibold text-[#1A2621] hover:text-[#1E5743] transition-colors"
              >
                <span>Marketplace Catalog</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </Link>
            </div>
          </div>

          {/* Learn. Book. Earn Rewards Promo Card */}
          <div className="relative overflow-hidden bg-white rounded-2xl border border-[#E5E7E0] p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[175px]">
            <div className="relative z-10 space-y-1">
              <h4 className="font-serif font-bold text-[#1E5743] text-sm sm:text-base leading-tight">
                Learn. Book.<br />Earn Rewards.
              </h4>
              <p className="text-[10px] text-gray-500 leading-snug">
                Complete workshops, earn credits & gifts, and grow your skills.
              </p>
              <div className="pt-2">
                <Link
                  to="/workshops"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#1E5743] text-white text-[11px] font-semibold hover:bg-[#153F30] transition-colors shadow-2xs"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Bottom mountain backdrop from original mock */}
            <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none opacity-80">
              <img
                src={sidebarExploreCard}
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
                      ? 'bg-[#EAF5EE] text-[#1E5743] font-semibold'
                      : 'text-[#333F39] hover:bg-[#F4F6F4]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#1E5743]" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-[#E5E7E0] px-3">
              <Link
                to="/workshops"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-semibold text-[#1E5743] flex items-center justify-between py-1"
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
