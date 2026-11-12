import React, { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

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
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
