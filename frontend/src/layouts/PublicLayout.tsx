import React, { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Info } from 'lucide-react';

export function scrollToSectionById(sectionId: string): boolean {
  const target = document.getElementById(sectionId);
  if (!target) return false;

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  target.scrollIntoView({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    block: 'start',
  });
  return true;
}

export const PublicLayout: React.FC = () => {
  const location = useLocation();
  const prevPathnameRef = useRef<string>(location.pathname);

  useEffect(() => {
    const prevPathname = prevPathnameRef.current;
    prevPathnameRef.current = location.pathname;

    if (location.hash) {
      const rawId = decodeURIComponent(location.hash.replace(/^#/, ''));
      if (rawId) {
        let attempts = 0;
        const interval = window.setInterval(() => {
          attempts += 1;
          if (scrollToSectionById(rawId) || attempts >= 10) {
            window.clearInterval(interval);
          }
        }, 50);
        return () => window.clearInterval(interval);
      }
    } else {
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const samePath = prevPathname === location.pathname;
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: samePath && !prefersReducedMotion ? 'smooth' : 'auto',
      });
    }
  }, [location.pathname, location.hash]);

  // Support direct browser URL-bar hash edits via native hashchange event
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.pathname === '/' && window.location.hash) {
        const rawId = decodeURIComponent(window.location.hash.replace(/^#/, ''));
        if (rawId) {
          scrollToSectionById(rawId);
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#FBFBF9] text-[#111827]">
      {/* Sandbox Test Banner matching exact design */}
      <div className="bg-[#0f2e23] text-white/90 text-xs py-2 px-4 sm:px-8 flex items-center justify-between border-b border-[#1b4334]">
        <div className="flex items-center gap-2 max-w-5xl">
          <Info className="w-4 h-4 text-[#d8eb69] shrink-0" />
          <span className="text-[11px] sm:text-xs font-normal text-[#eaf3ed] tracking-normal">
            PayPal AI Hackathon 2026 Prototype — Connected to PayPal Sandbox (Mock/Verified Environment). No real transactions or funds.
          </span>
        </div>
        <div className="hidden sm:inline-flex items-center px-3.5 py-1 rounded-full bg-[#1b5e3f] text-white text-[11px] font-medium tracking-wide">
          <span>Sandbox Mode</span>
        </div>
      </div>

      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
