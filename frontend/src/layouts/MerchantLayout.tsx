import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Layers, Sparkles, BookOpen, Users, 
  Tag, CreditCard, BarChart3, FlaskConical, Settings, 
  LogOut, Menu, X, ShieldCheck, ArrowRight, Plus
} from 'lucide-react';

const MERCHANT_NAV = [
  { name: 'Overview', path: '/merchant/overview', icon: LayoutDashboard },
  { name: 'Demand Intelligence', path: '/merchant/demand-intelligence', icon: Layers },
  { name: 'Offer Studio', path: '/merchant/offer-studio', icon: Sparkles },
  { name: 'Workshops', path: '/merchant/workshops', icon: BookOpen },
  { name: 'Reservations & Attendance', path: '/merchant/reservations', icon: Users },
  { name: 'Reward Studio', path: '/merchant/reward-studio', icon: Tag },
  { name: 'PayPal Transactions', path: '/merchant/payments', icon: CreditCard },
  { name: 'Analytics', path: '/merchant/analytics', icon: BarChart3 },
  { name: 'Academic Research Lab', path: '/merchant/research-lab', icon: FlaskConical },
  { name: 'Settings', path: '/merchant/settings', icon: Settings },
];

export const MerchantLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  const getPageTitle = () => {
    const active = MERCHANT_NAV.find((item) => item.path === location.pathname);
    return active ? active.name : 'Instructor Studio';
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col text-charcoal">
      {/* Dedicated Workspace Topbar */}
      <header className="sticky top-0 z-40 h-16 bg-white border-b border-warmgray px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-2xs">
        {/* Left: Mobile trigger & Page Context */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-charcoal/70 hover:bg-warmgray/50 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 rounded-lg bg-forest flex items-center justify-center text-ivory font-bold text-base">
              N
            </div>
            <span className="font-semibold text-base tracking-tight text-charcoal hidden sm:inline">
              NUVENDRY
            </span>
          </Link>

          <span className="text-charcoal/30 text-sm hidden sm:inline">/</span>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-forest text-ivory text-[11px] font-mono font-semibold uppercase tracking-wider">
              Instructor Studio
            </span>
            <span className="text-sm font-semibold text-charcoal hidden md:inline">
              {getPageTitle()}
            </span>
          </div>
        </div>

        {/* Right: PayPal Status & Actions */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-mint text-forest font-mono text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-forest" />
            <span>PayPal Sandbox Orders v2</span>
          </div>

          <Link
            to="/merchant/offer-studio"
            className="nv-btn-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest text-ivory text-xs font-semibold hover:bg-charcoal transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span className="hidden sm:inline">AI Offer Studio</span>
          </Link>

          <div className="h-5 w-px bg-warmgray hidden sm:block" />

          {/* User Profile */}
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-full bg-charcoal text-ivory flex items-center justify-center text-xs font-bold font-mono">
              {user?.full_name?.charAt(0) || 'I'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-charcoal leading-none">
                {user?.full_name?.split(' ')[0]}
              </div>
              <div className="text-[10px] text-forest font-mono mt-0.5">
                Instructor
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="nv-btn-press p-1.5 rounded-lg text-charcoal/60 hover:text-charcoal hover:bg-warmgray/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace: Sidebar + Outlet */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white rounded-2xl border border-warmgray p-3.5 space-y-1 shadow-2xs sticky top-22">
          <div className="px-3 py-2 text-[11px] font-mono font-semibold text-charcoal/40 uppercase tracking-wider">
            Operational Menu
          </div>

          {MERCHANT_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest ${
                  isActive
                    ? 'bg-mint text-forest font-semibold shadow-xs'
                    : 'text-charcoal/70 hover:bg-ivory hover:text-charcoal'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-forest' : 'text-charcoal/50'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-4 mt-2 border-t border-warmgray/60 px-3">
            <Link
              to="/app/overview"
              className="flex items-center justify-between text-xs font-medium text-charcoal/60 hover:text-forest transition-colors group"
            >
              <span>Switch to Learner View</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden w-full bg-white rounded-2xl border border-warmgray p-4 space-y-1 mb-4 shadow-sm">
            <div className="px-3 py-1.5 text-[11px] font-mono font-semibold text-charcoal/40 uppercase">
              Instructor Studio Navigation
            </div>
            {MERCHANT_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-mint text-forest font-semibold'
                      : 'text-charcoal/70 hover:bg-ivory hover:text-charcoal'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
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

export default MerchantLayout;

