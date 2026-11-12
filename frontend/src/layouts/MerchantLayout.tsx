import './InstructorStudio.css';
import './InstructorSidebar.css';
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { InstructorNotifications } from '../components/InstructorNotifications';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Layers, Sparkles, BookOpen, Users, 
  Gift, CreditCard, BarChart3, FlaskConical, Settings, 
  LogOut, Menu, X, ShieldCheck, ArrowRight, ChevronDown
} from 'lucide-react';

const MERCHANT_NAV = [
  { name: 'Overview', path: '/merchant/overview', icon: LayoutDashboard },
  { name: 'Demand Intelligence', path: '/merchant/demand-intelligence', icon: Layers },
  { name: 'Offer Studio', path: '/merchant/offer-studio', icon: Sparkles },
  { name: 'Workshops', path: '/merchant/workshops', icon: BookOpen },
  { name: 'Reservations & Attendance', path: '/merchant/reservations', icon: Users },
  { name: 'Reward Studio', path: '/merchant/reward-studio', icon: Gift },
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
            <span className="studio-wordmark">NUVENDRY<sup>™</sup></span>
          </Link>
          <span className="studio-label">Instructor Studio</span>
        </div>

        {/* Right: PayPal Status & Actions */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link to="/merchant/offer-studio" aria-label="AI Offer Studio" className="studio-pill studio-primary"><Sparkles size={16}/><span>AI Offer Studio</span></Link>
          {user && <InstructorNotifications key={user.id} />}
          <details key={location.pathname} className="studio-profile">
            <summary><i/><span>{user?.full_name || 'Dr. Elena Park'}</span><ChevronDown size={14}/></summary>
            <div><Link to="/merchant/settings">Settings</Link><Link to="/app/overview">Switch to Learner View</Link><button onClick={() => { logout(); navigate('/'); }}><LogOut size={14}/>Sign Out</button></div>
          </details>
        </div>
      </header>

      {/* Main Workspace: Sidebar + Outlet */}
      <div className="flex-1 studio-frame w-full mx-auto flex flex-col md:flex-row gap-4 items-start">
        {/* Desktop Sidebar */}
        <aside className="studio-sidebar hidden md:flex flex-col shrink-0">
          <nav className="studio-menu">
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

          </nav>
          <section className="studio-support">
            <h2>Instructor Support<br/>&amp; Growth.</h2>
            <p>{location.pathname === '/merchant/settings' ? 'Get setup help, integration guides, and best practices to scale your academy with NUVENDRY.' : location.pathname === '/merchant/research-lab' ? 'Design rigorous experiments, benchmark learning systems, and advance research in real-world workshop settings with NUVENDRY.' : location.pathname === '/merchant/reward-studio' ? 'Create reward campaigns, recognize learner achievements, and build lasting engagement with NUVENDRY.' : 'Create standout workshops, validate demand, manage bookings and rewards, and scale your learning impact with NUVENDRY.'}</p>
            <Link className="studio-pill studio-primary" to="/merchant/research-lab">{location.pathname === '/merchant/research-lab' ? 'Get Research Resources' : 'Get Instructor Resources'} <ArrowRight size={14}/></Link>
          </section>
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

