import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-ivory text-charcoal">
      {/* Clean Auth Topbar */}
      <header className="h-16 border-b border-warmgray bg-white/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-forest flex items-center justify-center text-ivory font-bold text-lg group-hover:bg-charcoal transition-colors">
            N
          </div>
          <span className="font-semibold text-lg tracking-tight text-charcoal">
            NUVENDRY
          </span>
        </Link>

        <div className="flex items-center space-x-4 text-xs">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-mint text-forest font-mono text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sandbox Authenticated</span>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-charcoal/70 hover:text-forest transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Auth Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Outlet />
      </main>

      {/* Minimal Footer */}
      <footer className="py-4 text-center text-xs text-charcoal/50 border-t border-warmgray/60 font-mono">
        NUVENDRY Prototype — PayPal AI Hackathon 2026
      </footer>
    </div>
  );
};

export default AuthLayout;

