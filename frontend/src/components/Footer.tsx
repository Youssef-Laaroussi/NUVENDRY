import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-charcoal text-ivory/80 pt-16 pb-12 border-t border-charcoal/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-ivory/10">
          {/* Brand Info & Positioning */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-forest flex items-center justify-center text-ivory font-serif font-bold text-lg">
                N
              </div>
              <span className="font-semibold text-xl tracking-tight text-white">NUVENDRY</span>
            </div>
            <p className="text-xs sm:text-sm text-ivory/65 max-w-sm leading-relaxed">
              From customer demand to new commerce. An AI-powered demand-driven learning marketplace that turns fragmented learner requests into live workshops and verified PayPal Sandbox transactions.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-mint text-xs font-mono">
              <ShieldCheck className="w-4 h-4 text-mint shrink-0" />
              <span>PayPal AI Hackathon 2026 Submission</span>
            </div>
          </div>

          {/* Nav Column 1: Marketplace */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white/90 font-semibold">
              Marketplace
            </h4>
            <ul className="space-y-2 text-xs text-ivory/70">
              <li>
                <Link to="/workshops" className="hover:text-mint transition-colors">
                  Discover Workshops
                </Link>
              </li>
              <li>
                <Link to="/demand" className="hover:text-mint transition-colors">
                  Submit Learning Demand
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-mint transition-colors">
                  How NUVENDRY Works
                </Link>
              </li>
              <li>
                <Link to="/rewards" className="hover:text-mint transition-colors">
                  Merchant-Funded Rewards
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav Column 2: Instructors */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white/90 font-semibold">
              Instructors
            </h4>
            <ul className="space-y-2 text-xs text-ivory/70">
              <li>
                <Link to="/for-instructors" className="hover:text-mint transition-colors">
                  For Instructors Overview
                </Link>
              </li>
              <li>
                <Link to="/merchant/demand-intelligence" className="hover:text-mint transition-colors">
                  Demand Intelligence
                </Link>
              </li>
              <li>
                <Link to="/merchant/offer-studio" className="hover:text-mint transition-colors">
                  AI Offer Studio
                </Link>
              </li>
              <li>
                <Link to="/sign-up" className="hover:text-mint transition-colors">
                  Create Instructor Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav Column 3: Governance & Transparency */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white/90 font-semibold">
              Transparency & Legal
            </h4>
            <ul className="space-y-2 text-xs text-ivory/70">
              <li>
                <Link to="/privacy" className="hover:text-mint transition-colors">
                  Privacy Policy & NLP Notice
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-mint transition-colors">
                  Terms of Service & Sandbox Notice
                </Link>
              </li>
              <li>
                <span className="text-[11px] font-mono text-ivory/40 block">
                  Backend: Python 3.12 + FastAPI + AsyncPG
                </span>
              </li>
              <li>
                <span className="text-[11px] font-mono text-ivory/40 block">
                  Database: PostgreSQL (ACID Guaranteed)
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Sandbox Disclosure & Copyright Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-ivory/50 gap-4">
          <p className="text-center md:text-left text-[11px] leading-relaxed max-w-3xl">
            <strong>Sandbox Disclosure:</strong> NUVENDRY is an independent hackathon prototype built for the PayPal AI Hackathon 2026. Payment checkout flows are executed against the official PayPal Sandbox Orders v2 API in a simulated test environment. No real funds or production credit lines are processed.
          </p>
          <p className="text-[11px] font-mono shrink-0">
            © 2026 NUVENDRY. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
