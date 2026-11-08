import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center px-4 py-10 sm:py-14 text-[#111827]"
      style={{
        background:
          'radial-gradient(circle at 50% 44%, #FCFDFB 0%, #F6F8F5 64%, #EFF4EF 100%)',
      }}
    >
      {/* Top-Right Layered Organic Sage & Emerald Corner Waves */}
      <svg
        aria-hidden="true"
        viewBox="0 0 360 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none select-none fixed top-0 right-0 w-[230px] sm:w-[310px] lg:w-[360px] h-auto z-0"
      >
        <defs>
          <linearGradient id="authTopRightOuter" x1="60" y1="0" x2="360" y2="300" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#DCEBE0" stopOpacity="0.82" />
            <stop offset="100%" stopColor="#C4DEC9" stopOpacity="0.58" />
          </linearGradient>
          <linearGradient id="authTopRightInner" x1="150" y1="0" x2="360" y2="230" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7BAE91" stopOpacity="0.78" />
            <stop offset="100%" stopColor="#9EC8AF" stopOpacity="0.62" />
          </linearGradient>
        </defs>
        {/* Soft outer translucent sage lobe */}
        <path
          d="M118 0 C112 108, 178 228, 360 282 L360 0 Z"
          fill="url(#authTopRightOuter)"
        />
        {/* Deeper overlapping emerald-sage lobe */}
        <path
          d="M196 0 C194 84, 248 168, 360 206 L360 0 Z"
          fill="url(#authTopRightInner)"
        />
      </svg>

      {/* Bottom-Left Layered Organic Sage & Forest Corner Waves */}
      <svg
        aria-hidden="true"
        viewBox="0 0 420 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none select-none fixed bottom-0 left-0 w-[260px] sm:w-[340px] lg:w-[410px] h-auto z-0"
      >
        <defs>
          <linearGradient id="authBottomLeftOuter" x1="0" y1="80" x2="340" y2="280" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#CBE1D2" stopOpacity="0.78" />
            <stop offset="100%" stopColor="#DFEDE3" stopOpacity="0.62" />
          </linearGradient>
          <linearGradient id="authBottomLeftInner" x1="0" y1="140" x2="290" y2="280" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6EA385" stopOpacity="0.82" />
            <stop offset="100%" stopColor="#9BC4AC" stopOpacity="0.72" />
          </linearGradient>
        </defs>
        {/* Outer pale sage flowing hillside wave */}
        <path
          d="M0 98 C56 94, 96 138, 158 176 C220 214, 292 232, 378 280 L0 280 Z"
          fill="url(#authBottomLeftOuter)"
        />
        {/* Inner deeper forest-sage wave */}
        <path
          d="M0 156 C48 152, 86 186, 144 214 C198 240, 248 250, 312 280 L0 280 Z"
          fill="url(#authBottomLeftInner)"
        />
      </svg>

      {/* Centered Auth Stack: Brand Mark + Page Outlet */}
      <div className="relative z-10 w-full max-w-[440px] flex flex-col items-center">
        <Link
          to="/"
          aria-label="NUVENDRY Home"
          className="inline-flex items-center gap-3 mb-7 sm:mb-8 group rounded-xl px-2 py-1 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#147448]"
        >
          <div className="w-[38px] h-[38px] rounded-[10px] bg-[#147448] group-hover:bg-[#0F5B38] transition-colors flex items-center justify-center text-white font-sans font-extrabold text-[19px] shadow-[0_3px_10px_rgba(20,116,72,0.22)]">
            N
          </div>
          <span className="font-sans font-extrabold text-[21px] tracking-[0.03em] text-[#14201E]">
            NUVENDRY
          </span>
        </Link>

        <main className="w-full flex flex-col items-center">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AuthLayout;
