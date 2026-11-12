import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, Users, Activity, Database, LogOut, 
  Menu, X, ArrowRight, ShieldCheck
} from 'lucide-react';

const ADMIN_NAV = [
  { name: 'Admin Overview', path: '/admin', icon: ShieldAlert },
  { name: 'User Directory', path: '/admin/users', icon: Users },
  { name: 'Security Audit Logs', path: '/admin/audit', icon: Activity },
];

export const AdminLayout: React.FC = () => {
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
    if (location.pathname === '/admin/payments') return 'Payment Audit';
    if (location.pathname === '/admin/content') return 'Content Governance';
    const active = ADMIN_NAV.find((item) => item.path === location.pathname);
    return active ? active.name : 'Administrator Workspace';
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
            <img src="/nuvendry-mark.png" alt="" className="w-8 h-8 shrink-0 rounded-md object-contain" />
            <span className="font-semibold text-base tracking-tight text-charcoal hidden sm:inline">
              NUVENDRY
            </span>
          </Link>

          <span className="text-charcoal/30 text-sm hidden sm:inline">/</span>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-charcoal text-ivory text-[11px] font-mono font-semibold uppercase tracking-wider">
              Admin Governance
            </span>
            <span className="text-sm font-semibold text-charcoal hidden md:inline">
              {getPageTitle()}
            </span>
          </div>
        </div>

        {/* Right: User & Actions */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link
            to="/merchant/overview"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-forest hover:text-charcoal px-2.5 py-1 rounded-md bg-mint/50 transition-colors"
          >
            <span>Instructor Studio</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          <div className="h-5 w-px bg-warmgray hidden sm:block" />

          {/* Profile */}
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-full bg-forest text-ivory flex items-center justify-center text-xs font-bold font-mono">
              A
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-charcoal leading-none">
                {user?.full_name?.split(' ')[0] || 'Administrator'}
              </div>
              <div className="text-[10px] text-charcoal/50 font-mono mt-0.5">
                Root Admin
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="p-1.5 rounded-lg text-charcoal/60 hover:text-charcoal hover:bg-warmgray/60 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Area: Sidebar + Outlet */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white rounded-2xl border border-warmgray p-3.5 space-y-1 shadow-2xs sticky top-22">
          <div className="px-3 py-2 text-[11px] font-mono font-semibold text-charcoal/40 uppercase tracking-wider">
            Admin Menu
          </div>

          {ADMIN_NAV.map((item) => {
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
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden w-full bg-white rounded-2xl border border-warmgray p-4 space-y-1 mb-4 shadow-sm">
            <div className="px-3 py-1.5 text-[11px] font-mono font-semibold text-charcoal/40 uppercase">
              Admin Navigation
            </div>
            {ADMIN_NAV.map((item) => {
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

export default AdminLayout;

