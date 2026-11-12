import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, Check } from 'lucide-react';
import { scrollToSectionById } from '../layouts/PublicLayout';

export const Footer: React.FC = () => {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleFooterLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
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

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError('Please enter an email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError(null);
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="bg-[#F4F7F4] text-[#111827] pt-12 pb-7 border-t border-[#E4ECE7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ========================================================= */}
        {/* Main 3-Zone Footer Layout with Subtle Vertical Dividers   */}
        {/* ========================================================= */}
        <div className="flex flex-col lg:flex-row items-stretch justify-between gap-10 lg:gap-8">
          {/* Left Column: Brand + Description + 5 Social Icon Cards */}
          <div className="lg:w-[29%] space-y-4">
            <Link
              to="/"
              onClick={(e) => handleFooterLinkClick(e, '/')}
              className="inline-flex items-center gap-2.5"
            >
              <img src="/nuvendry-mark.png" alt="" className="w-9 h-9 shrink-0 rounded-md object-contain" />
              <span className="font-extrabold text-[19px] tracking-[0.02em] text-[#111827]">
                NUVENDRY
              </span>
            </Link>

            <p className="text-[13px] text-[#374151] leading-[1.6] max-w-[295px]">
              A demand-driven learning marketplace that connects learners, instructors, and real
              needs with AI, secure payments, and merchant-funded rewards.
            </p>

            {/* 5 Social Icon Buttons: GitHub, LinkedIn, X, YouTube, Discord */}
            <div className="flex items-center gap-2.5 pt-1">
              {/* GitHub */}
              <a
                href="https://github.com/Youssef-Laaroussi/NUVENDRY"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="w-8 h-8 rounded-lg bg-white border border-[#E5ECE7] shadow-[0_2px_6px_rgba(15,41,30,0.04)] text-[#1F2937] hover:text-[#146C43] hover:border-[#C5DDD0] flex items-center justify-center transition-all"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.92.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.26 5.67.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="#linkedin"
                onClick={(e) => e.preventDefault()}
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-lg bg-white border border-[#E5ECE7] shadow-[0_2px_6px_rgba(15,41,30,0.04)] text-[#1F2937] hover:text-[#146C43] hover:border-[#C5DDD0] flex items-center justify-center transition-all"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19M8.34 17.34V10.67H6.12V17.34H8.34M7.23 9.75C7.97 9.75 8.53 9.18 8.53 8.46C8.53 7.73 7.97 7.17 7.23 7.17C6.49 7.17 5.93 7.73 5.93 8.46C5.93 9.18 6.49 9.75 7.23 9.75M17.88 17.34V13.56C17.88 11.54 16.8 10.5 15.26 10.5C14.12 10.5 13.56 11.12 13.26 11.61V10.67H11.05C11.08 11.3 11.05 17.34 11.05 17.34H13.26V13.62C13.26 13.42 13.28 13.22 13.34 13.08C13.5 12.68 13.86 12.27 14.48 12.27C15.28 12.27 15.66 12.88 15.66 13.78V17.34H17.88Z" />
                </svg>
              </a>

              {/* X (Twitter) */}
              <a
                href="#x"
                onClick={(e) => e.preventDefault()}
                aria-label="X"
                className="w-8 h-8 rounded-lg bg-white border border-[#E5ECE7] shadow-[0_2px_6px_rgba(15,41,30,0.04)] text-[#1F2937] hover:text-[#146C43] hover:border-[#C5DDD0] flex items-center justify-center transition-all"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="#youtube"
                onClick={(e) => e.preventDefault()}
                aria-label="YouTube"
                className="w-8 h-8 rounded-lg bg-white border border-[#E5ECE7] shadow-[0_2px_6px_rgba(15,41,30,0.04)] text-[#1F2937] hover:text-[#146C43] hover:border-[#C5DDD0] flex items-center justify-center transition-all"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M21.58 7.19a2.51 2.51 0 0 0-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42a2.51 2.51 0 0 0 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81ZM10 15V9l5.2 3-5.2 3Z" />
                </svg>
              </a>

              {/* Discord */}
              <a
                href="#discord"
                onClick={(e) => e.preventDefault()}
                aria-label="Discord"
                className="w-8 h-8 rounded-lg bg-white border border-[#E5ECE7] shadow-[0_2px_6px_rgba(15,41,30,0.04)] text-[#1F2937] hover:text-[#146C43] hover:border-[#C5DDD0] flex items-center justify-center transition-all"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.04.03.04.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.32.61.68 1.19 1.07 1.74.03.02.06.03.09.02 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02ZM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12Zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Left Vertical Divider */}
          <div className="hidden lg:block w-px bg-[#E1E9E3] self-stretch my-1" />

          {/* Center Column: "Let's Stay In Touch" Newsletter */}
          <div className="lg:w-[37%] flex flex-col items-center justify-center text-center space-y-3 px-2">
            <h3 className="font-serif font-medium text-[24px] sm:text-[26px] text-[#111827] tracking-tight leading-tight">
              Let’s Stay In Touch
            </h3>

            <p className="text-[12.5px] text-[#4B5563] leading-[1.55] max-w-[315px]">
              Sign up with your email address to receive product updates, workshops, and
              opportunities.
            </p>

            <form
              onSubmit={handleSubscribe}
              noValidate
              className="w-full max-w-[385px] flex items-center gap-2 pt-1"
            >
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-[#1E754C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                    if (subscribed) setSubscribed(false);
                  }}
                  placeholder="Enter your email address"
                  aria-label="Email address"
                  aria-invalid={!!emailError}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white border border-[#E2EAE5] text-[12.5px] text-[#111827] placeholder-[#8A948E] shadow-[0_2px_8px_rgba(15,41,30,0.03)] focus:outline-none focus:ring-2 focus:ring-[#146C43]/30 focus:border-[#146C43]"
                />
              </div>

              <button
                type="submit"
                className="nv-btn-press px-5 py-2.5 rounded-lg bg-[#125E3B] hover:bg-[#0D462B] text-white text-[11.5px] font-bold uppercase tracking-[0.06em] transition-colors shrink-0 cursor-pointer inline-flex items-center gap-1.5 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#125E3B] focus-visible:ring-offset-1"
              >
                {subscribed ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>SAVED</span>
                  </>
                ) : (
                  <span>SIGN UP</span>
                )}
              </button>
            </form>

            {emailError ? (
              <span role="alert" className="text-[11px] text-red-700 font-medium">
                {emailError}
              </span>
            ) : (
              <span aria-live="polite" className="text-[11px] text-[#6B7280]">
                {subscribed ? 'Subscribed to marketplace updates.' : 'We respect your privacy.'}
              </span>
            )}
          </div>

          {/* Right Vertical Divider */}
          <div className="hidden lg:block w-px bg-[#E1E9E3] self-stretch my-1" />

          {/* Right Columns: EXPLORE + SUPPORT */}
          <div className="lg:w-[30%] grid grid-cols-2 gap-6 sm:gap-8">
            {/* EXPLORE */}
            <div>
              <h4 className="text-[11.5px] font-bold uppercase tracking-[0.09em] text-[#165C45] mb-3.5">
                EXPLORE
              </h4>
              <ul className="space-y-2.5 text-[13px] text-[#374151]">
                <li>
                  <Link to="/workshops" className="hover:text-[#146C43] transition-colors">
                    Discover Workshops
                  </Link>
                </li>
                <li>
                  <Link
                    to="/#ai-demand"
                    onClick={(e) => handleFooterLinkClick(e, '/#ai-demand')}
                    className="hover:text-[#146C43] transition-colors"
                  >
                    AI Demand
                  </Link>
                </li>
                <li>
                  <Link
                    to="/#how-it-works"
                    onClick={(e) => handleFooterLinkClick(e, '/#how-it-works')}
                    className="hover:text-[#146C43] transition-colors"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    to="/#rewards"
                    onClick={(e) => handleFooterLinkClick(e, '/#rewards')}
                    className="hover:text-[#146C43] transition-colors"
                  >
                    Rewards
                  </Link>
                </li>
                <li>
                  <Link
                    to="/#for-instructors"
                    onClick={(e) => handleFooterLinkClick(e, '/#for-instructors')}
                    className="hover:text-[#146C43] transition-colors"
                  >
                    For Instructors
                  </Link>
                </li>
              </ul>
            </div>

            {/* SUPPORT */}
            <div>
              <h4 className="text-[11.5px] font-bold uppercase tracking-[0.09em] text-[#165C45] mb-3.5">
                SUPPORT
              </h4>
              <ul className="space-y-2.5 text-[13px] text-[#374151]">
                <li>
                  <Link
                    to="/#how-it-works"
                    onClick={(e) => handleFooterLinkClick(e, '/#how-it-works')}
                    className="hover:text-[#146C43] transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-[#146C43] transition-colors">
                    Privacy Notice
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-[#146C43] transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-[#146C43] transition-colors">
                    Acceptable Use Policy
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-[#146C43] transition-colors">
                    Security &amp; Sandbox Info
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* Copyright                                                 */}
        {/* ========================================================= */}
        <div className="mt-10 pt-5 border-t border-[#E1E9E3] flex justify-center md:justify-end text-[12px] text-[#374151]">
          <p className="shrink-0">
            © 2026 <strong className="font-bold text-[#111827]">NUVENDRY.</strong> All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
