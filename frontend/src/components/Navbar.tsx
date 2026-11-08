import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { scrollToSectionById } from '../layouts/PublicLayout';
import {
  Sparkles,
  ArrowRight,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  ChevronDown,
  BookOpen,
  User,
} from 'lucide-react';

const NAV_LINKS = [
  { name: 'Discover Workshops', path: '/workshops' },
  { name: 'AI Demand', path: '/#ai-demand' },
  { name: 'How It Works', path: '/#how-it-works' },
  { name: 'Rewards', path: '/#rewards' },
  { name: 'For Instructors', path: '/#for-instructors' },
];

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, isInstructor, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close mobile menu and user dropdown on route or hash change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname, location.hash]);

  // Handle elevation on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle ESC key to close menus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setUserDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getWorkspacePath = () => {
    if (isAdmin) return '/admin';
    if (isInstructor) return '/merchant/overview';
    return '/app/overview';
  };

  const getWorkspaceLabel = () => {
    if (isAdmin) return 'Admin Governance';
    if (isInstructor) return 'Instructor Studio';
    return 'Learner Hub';
  };

  const isActive = (path: string) => {
    if (path.startsWith('/#')) {
      const targetHash = path.slice(1);
      return location.pathname === '/' && location.hash === targetHash;
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    setMobileMenuOpen(false);
    if (path.startsWith('/#')) {
      const targetHash = path.slice(1);
      if (location.pathname === '/' && location.hash === targetHash) {
        e.preventDefault();
        scrollToSectionById(targetHash.slice(1));
      }
    } else if (path === '/' && location.pathname === '/' && !location.hash) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 border-b ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-gray-200 shadow-xs'
          : 'bg-white border-gray-200/70'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Wordmark */}
        <Link
          to="/"
          onClick={(e) => handleNavClick(e, '/')}
          className="flex items-center space-x-2.5 group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-forest rounded-lg py-1 pr-2"
          aria-label="NUVENDRY Home"
        >
          <div className="w-8 h-8 rounded-lg bg-[#0e3c2f] flex items-center justify-center text-white font-bold text-base shadow-xs">
            N
          </div>
          <span className="font-bold text-lg tracking-tight text-charcoal">NUVENDRY</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden md:flex items-center space-x-6 lg:space-x-7"
          aria-label="Main Navigation"
        >
          {NAV_LINKS.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={(e) => handleNavClick(e, link.path)}
                aria-current={
                  active ? (link.path.startsWith('/#') ? 'location' : 'page') : undefined
                }
                className={`text-xs font-medium transition-colors rounded-md px-1 py-0.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0e3c2f] ${
                  active
                    ? 'text-[#0e3c2f] font-semibold'
                    : 'text-charcoal/80 hover:text-charcoal'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Authentication Controls */}
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <div className="relative">
              <div className="flex items-center space-x-2">
                <Link
                  to={getWorkspacePath()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e3c2f] text-white text-xs font-semibold hover:bg-charcoal transition-colors shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                  <span>{getWorkspaceLabel()}</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="p-1.5 rounded-lg border border-warmgray text-charcoal/80 hover:bg-warmgray/50 transition-colors flex items-center gap-1 text-xs"
                  aria-expanded={userDropdownOpen}
                  aria-label="User account menu"
                >
                  <span className="w-6 h-6 rounded-md bg-mint text-forest font-semibold flex items-center justify-center text-xs">
                    {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-charcoal/50" />
                </button>
              </div>

              {/* Accessible Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-warmgray p-1.5 shadow-lg space-y-1 z-50 text-xs text-charcoal"
                  role="menu"
                >
                  <div className="px-3 py-2 border-b border-warmgray/60">
                    <div className="font-semibold text-charcoal truncate">{user?.full_name}</div>
                    <div className="text-[11px] text-charcoal/60 truncate font-mono">
                      {user?.email}
                    </div>
                  </div>

                  <Link
                    to={getWorkspacePath()}
                    role="menuitem"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-charcoal hover:bg-ivory hover:text-forest transition-colors font-medium"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <BookOpen className="w-4 h-4 text-forest" />
                    <span>Workspace Dashboard</span>
                  </Link>

                  <Link
                    to={isInstructor ? '/merchant/settings' : '/app/settings'}
                    role="menuitem"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-charcoal hover:bg-ivory transition-colors"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <User className="w-4 h-4 text-charcoal/50" />
                    <span>Account Settings</span>
                  </Link>

                  <div className="pt-1 border-t border-warmgray/60">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-charcoal/80 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2.5">
              <Link
                to="/sign-in"
                className="px-4 py-2 text-xs font-medium text-charcoal bg-white hover:bg-gray-50 rounded-lg border border-gray-300 transition-all shadow-2xs"
              >
                Sign In
              </Link>
              <Link
                to="/sign-up"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#0e3c2f] text-white text-xs font-semibold hover:bg-[#0a281f] transition-all shadow-xs"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg border border-warmgray text-charcoal/80 hover:bg-warmgray/50 transition-colors"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-warmgray bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-charcoal/50">
            Platform Navigation
          </div>
          <nav className="space-y-1" aria-label="Mobile Navigation">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={(e) => handleNavClick(e, link.path)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    active
                      ? 'bg-mint text-forest font-semibold'
                      : 'text-charcoal/80 hover:bg-ivory hover:text-charcoal'
                  }`}
                >
                  <span>{link.name}</span>
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-forest" />}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-warmgray/60 space-y-2">
            {isAuthenticated ? (
              <div className="space-y-1.5">
                <Link
                  to={getWorkspacePath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-forest text-ivory text-xs font-semibold shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-gold" />
                  <span>Enter {getWorkspaceLabel()}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="w-full py-2 rounded-xl border border-warmgray text-charcoal/70 text-xs font-medium hover:bg-ivory transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2 rounded-xl border border-warmgray text-charcoal text-xs font-medium hover:bg-ivory"
                >
                  Sign In
                </Link>
                <Link
                  to="/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2 rounded-xl bg-forest text-ivory text-xs font-semibold shadow-xs"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <div className="pt-2 text-center text-[10px] text-charcoal/50 font-mono flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-forest" />
            <span>PayPal Sandbox Verified Prototype</span>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
