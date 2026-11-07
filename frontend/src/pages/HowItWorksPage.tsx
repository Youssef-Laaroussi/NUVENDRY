import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Tag, Users, CheckCircle2 } from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-forest font-mono">
            Architecture & Workflow
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif text-charcoal">
            How NUVENDRY Turns Learner Demand into Paid Workshops
          </h1>
          <p className="text-sm sm:text-base text-charcoal/70 leading-relaxed">
            A comprehensive overview of our AI-powered demand aggregation, instructor offer generation, merchant-funded rewards, and verified PayPal Sandbox checkout flow.
          </p>
        </div>

        {/* 4 Deep Workflow Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 bg-white rounded-2xl border border-warmgray space-y-4">
            <div className="w-10 h-10 rounded-xl bg-mint text-forest flex items-center justify-center font-bold text-base">
              01
            </div>
            <h3 className="font-semibold text-lg text-charcoal">1. Unstructured Demand Ingestion</h3>
            <p className="text-xs sm:text-sm text-charcoal/70 leading-relaxed">
              Learners submit free-form requests specifying topics, budget ceilings, scheduling preferences, and formats. Our deterministic extractor and Pydantic validator identify constraints and preserve missing details with uncertainty tracking.
            </p>
          </div>

          <div className="p-8 bg-white rounded-2xl border border-warmgray space-y-4">
            <div className="w-10 h-10 rounded-xl bg-mint text-forest flex items-center justify-center font-bold text-base">
              02
            </div>
            <h3 className="font-semibold text-lg text-charcoal">2. Constraint-Aware Clustering</h3>
            <p className="text-xs sm:text-sm text-charcoal/70 leading-relaxed">
              Unlike generic clustering algorithms that blindly merge incompatible requests, NUVENDRY enforces hard constraint validation: budget disparity checks, language synchronization, and difficulty compatibility before grouping.
            </p>
          </div>

          <div className="p-8 bg-white rounded-2xl border border-warmgray space-y-4">
            <div className="w-10 h-10 rounded-xl bg-mint text-forest flex items-center justify-center font-bold text-base">
              03
            </div>
            <h3 className="font-semibold text-lg text-charcoal">3. Instructor Offer Studio</h3>
            <p className="text-xs sm:text-sm text-charcoal/70 leading-relaxed">
              Instructors inspect demand opportunities, view evidence from learner prompts, and generate structured draft proposals. Instructors retain 100% control over final pricing, scheduled dates, and seat capacity.
            </p>
          </div>

          <div className="p-8 bg-white rounded-2xl border border-warmgray space-y-4">
            <div className="w-10 h-10 rounded-xl bg-mint text-forest flex items-center justify-center font-bold text-base">
              04
            </div>
            <h3 className="font-semibold text-lg text-charcoal">4. Verified PayPal Sandbox Checkout</h3>
            <p className="text-xs sm:text-sm text-charcoal/70 leading-relaxed">
              Authoritative server-calculated amounts create PayPal Sandbox Orders v2. Upon approved capture, seats are decremented atomically with overselling prevention, rewards are consumed, and digital materials are delivered.
            </p>
          </div>
        </div>

        <div className="p-8 bg-charcoal text-ivory rounded-2xl text-center space-y-4 max-w-3xl mx-auto">
          <h3 className="text-2xl font-serif">Ready to experience demand-driven education?</h3>
          <p className="text-xs text-ivory/70 max-w-lg mx-auto">
            Explore live workshops currently published on the platform or submit your own custom learning request.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link to="/workshops" className="px-5 py-2.5 bg-forest text-ivory font-semibold text-xs rounded-lg hover:bg-mint hover:text-forest transition-colors">
              Explore Workshops
            </Link>
            <Link to="/demand" className="px-5 py-2.5 bg-white/10 text-ivory font-semibold text-xs rounded-lg hover:bg-white/20 transition-colors">
              Request a Workshop
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

