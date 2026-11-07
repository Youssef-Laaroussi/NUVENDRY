import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, DollarSign, Layers, Users } from 'lucide-react';

export const ForInstructorsPage: React.FC = () => {
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-forest font-mono">
            Instructor Studio
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif text-charcoal">
            Monetize Real Learner Demand With AI & PayPal Sandbox
          </h1>
          <p className="text-sm sm:text-base text-charcoal/70 leading-relaxed">
            Eliminate curriculum guesswork. Inspect aggregated demand clusters with verified budget metrics, generate AI proposals, and launch interactive workshops with guaranteed payments.
          </p>
          <div className="pt-2">
            <Link
              to="/sign-up"
              className="inline-flex items-center gap-2 px-6 py-3 bg-forest text-ivory text-xs font-semibold rounded-xl hover:bg-charcoal transition-colors shadow-sm"
            >
              <span>Create Instructor Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-warmgray space-y-3">
            <Layers className="w-6 h-6 text-forest" />
            <h3 className="font-semibold text-base text-charcoal">Demand Intelligence</h3>
            <p className="text-xs text-charcoal/70 leading-relaxed">
              Access real-time clusters of learners seeking specific topics, with transparent constraint summaries and willingness-to-pay calculations.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-warmgray space-y-3">
            <Sparkles className="w-6 h-6 text-forest" />
            <h3 className="font-semibold text-base text-charcoal">AI Offer Studio</h3>
            <p className="text-xs text-charcoal/70 leading-relaxed">
              One-click draft proposal generation synthesized from cluster requests. Review, edit, price, and publish directly to the marketplace.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-warmgray space-y-3">
            <ShieldCheck className="w-6 h-6 text-forest" />
            <h3 className="font-semibold text-base text-charcoal">PayPal Sandbox Checkout</h3>
            <p className="text-xs text-charcoal/70 leading-relaxed">
              Safe, verified payment capture with automatic seat reservation confirmation, attendance tracking, and financial analytics.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

