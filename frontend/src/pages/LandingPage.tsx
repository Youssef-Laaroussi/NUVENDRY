import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HeroVisualization } from '../components/HeroVisualization';
import { WorkshopCard } from '../components/WorkshopCard';
import { api } from '../api/client';
import { Workshop, DemandCluster } from '../types';
import { 
  Sparkles, ArrowRight, ShieldCheck, Tag, Gift, Users, 
  Award, TrendingUp, Layers, CheckCircle2, Bot, Calendar,
  CreditCard, Share2, HelpCircle
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [clusters, setClusters] = useState<DemandCluster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [wsData, clusterData] = await Promise.all([
          api.getWorkshops(),
          api.getClusters()
        ]);
        setWorkshops(wsData);
        setClusters(clusterData);
      } catch (err) {
        console.error('Error fetching landing page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="bg-ivory text-charcoal">
      {/* ========================================================= */}
      {/* 1. HERO SECTION                                           */}
      {/* ========================================================= */}
      <section className="relative pt-8 pb-14 md:pt-12 md:pb-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Hero Value Proposition */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF4ED] text-[#134937] text-xs font-semibold tracking-wide border border-[#CDE5D6]">
                <Sparkles className="w-3.5 h-3.5 text-[#134937]" />
                <span>Demand-Driven Learning Marketplace</span>
              </div>

              <div className="space-y-1">
                <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-serif font-bold text-[#111827] tracking-tight leading-[1.1]">
                  Build skills.
                </h1>
                <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-serif italic font-normal text-[#165C45] tracking-tight leading-[1.1]">
                  Shape what comes next.
                </h2>
              </div>

              <p className="text-sm sm:text-base text-[#4B5563] max-w-xl leading-relaxed">
                People express demand, AI identifies opportunities, instructors create offers, and learners pay through PayPal Sandbox.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  to="/workshops"
                  className="px-6 py-3 rounded-lg bg-[#0e3c2f] hover:bg-[#08281e] text-white font-medium text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 group"
                >
                  <span>Explore Workshops</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/demand"
                  className="px-6 py-3 rounded-lg bg-white border border-gray-300 text-[#111827] font-medium text-xs sm:text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-2xs"
                >
                  <span>Request a Workshop</span>
                </Link>
              </div>

              {/* Micro-Trust Badges */}
              <div className="pt-3 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-[#374151]">
                <div className="flex items-center gap-1.5 font-normal">
                  <CheckCircle2 className="w-4 h-4 text-[#165C45] shrink-0" />
                  <span>Real Learner Requests</span>
                </div>
                <div className="flex items-center gap-1.5 font-normal">
                  <ShieldCheck className="w-4 h-4 text-[#165C45] shrink-0" />
                  <span>PayPal Sandbox Verified</span>
                </div>
                <div className="flex items-center gap-1.5 font-normal">
                  <Tag className="w-4 h-4 text-[#165C45] shrink-0" />
                  <span>Merchant-Funded Rewards</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Assembly */}
            <div className="lg:col-span-6">
              <HeroVisualization />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. FOUR FEATURE VALUE CARDS                               */}
      {/* ========================================================= */}
      <section className="py-12 bg-white border-y border-warmgray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-ivory/50 rounded-2xl border border-warmgray p-6 space-y-3 hover:border-forest/40 transition-colors shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-mint text-forest flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-forest" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-charcoal">
                AI Demand Intelligence
              </h3>
              <p className="text-xs text-charcoal/70 leading-relaxed">
                Understand learner requests, extract constraints, and detect real opportunities.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-ivory/50 rounded-2xl border border-warmgray p-6 space-y-3 hover:border-forest/40 transition-colors shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-mint text-forest flex items-center justify-center">
                <Layers className="w-5 h-5 text-forest" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-charcoal">
                Demand-to-Offer Creation
              </h3>
              <p className="text-xs text-charcoal/70 leading-relaxed">
                Turn grouped demand into high-potential workshop proposals for instructors.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-ivory/50 rounded-2xl border border-warmgray p-6 space-y-3 hover:border-forest/40 transition-colors shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-mint text-forest flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-forest" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-charcoal">
                Verified PayPal Reservations
              </h3>
              <p className="text-xs text-charcoal/70 leading-relaxed">
                Secure checkout with PayPal Sandbox and automatic seat confirmation.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-ivory/50 rounded-2xl border border-warmgray p-6 space-y-3 hover:border-forest/40 transition-colors shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-mint text-forest flex items-center justify-center">
                <Gift className="w-5 h-5 text-forest" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-charcoal">
                Merchant-Funded Rewards
              </h3>
              <p className="text-xs text-charcoal/70 leading-relaxed">
                Welcome discounts, early-bird offers, store credit, digital gifts, referrals, and achievement badges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. THE LIFECYCLE — HOW NUVENDRY WORKS                     */}
      {/* ========================================================= */}
      <section className="py-20 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-forest font-semibold">
              THE LIFECYCLE
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-charcoal tracking-tight">
              How NUVENDRY Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl border border-warmgray p-6 space-y-4 shadow-xs relative flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-8 h-8 rounded-full bg-[#205C49] text-white flex items-center justify-center font-bold text-xs">
                  1
                </div>
                {/* Visual Avatar Mockup */}
                <div className="h-24 rounded-xl bg-mint/50 border border-forest/15 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
                    alt="Learner"
                    className="w-14 h-14 rounded-full object-cover border-2 border-forest/30"
                  />
                </div>
                <h3 className="font-semibold text-base text-charcoal">Express Your Need</h3>
                <p className="text-xs text-charcoal/70 leading-relaxed">
                  Learners describe what they want to learn, with topic, budget, language, and schedule.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl border border-warmgray p-6 space-y-4 shadow-xs relative flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-8 h-8 rounded-full bg-[#205C49] text-white flex items-center justify-center font-bold text-xs">
                  2
                </div>
                {/* Visual AI Chip */}
                <div className="h-24 rounded-xl bg-mint/50 border border-forest/15 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-xl bg-white border border-forest/30 flex items-center justify-center shadow-xs">
                    <span className="font-mono font-bold text-forest text-sm">[ AI ]</span>
                  </div>
                </div>
                <h3 className="font-semibold text-base text-charcoal">AI Clusters Demand</h3>
                <p className="text-xs text-charcoal/70 leading-relaxed">
                  Our AI groups similar requests, validates constraints, and identifies commercial opportunities.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl border border-warmgray p-6 space-y-4 shadow-xs relative flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-8 h-8 rounded-full bg-[#205C49] text-white flex items-center justify-center font-bold text-xs">
                  3
                </div>
                {/* Visual Instructor Mockup */}
                <div className="h-24 rounded-xl bg-mint/50 border border-forest/15 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80"
                    alt="Instructor"
                    className="w-14 h-14 rounded-full object-cover border-2 border-forest/30"
                  />
                </div>
                <h3 className="font-semibold text-base text-charcoal">Instructor Publishes</h3>
                <p className="text-xs text-charcoal/70 leading-relaxed">
                  Instructors review an AI-generated offer, adjust content, set price and capacity, then publish.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl border border-warmgray p-6 space-y-4 shadow-xs relative flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-8 h-8 rounded-full bg-[#205C49] text-white flex items-center justify-center font-bold text-xs">
                  4
                </div>
                {/* Visual PayPal Badge */}
                <div className="h-24 rounded-xl bg-mint/50 border border-forest/15 flex items-center justify-center">
                  <div className="px-4 py-2 bg-white rounded-xl border border-warmgray shadow-xs">
                    <span className="font-serif italic font-bold text-lg text-[#003087]">
                      Pay<span className="text-[#0079C1]">Pal</span>
                    </span>
                  </div>
                </div>
                <h3 className="font-semibold text-base text-charcoal">Book with PayPal</h3>
                <p className="text-xs text-charcoal/70 leading-relaxed">
                  Learners reserve their seat, apply eligible rewards, and checkout via PayPal Sandbox.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. FEATURED WORKSHOPS MARKETPLACE                         */}
      {/* ========================================================= */}
      <section className="py-20 bg-white border-t border-warmgray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-forest font-semibold">
                MARKETPLACE
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-charcoal tracking-tight">
                Featured Workshops
              </h2>
              <p className="text-xs sm:text-sm text-charcoal/65">
                Live, demand-backed sessions with verified PayPal checkout.
              </p>
            </div>

            <Link
              to="/workshops"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:text-charcoal transition-colors self-start md:self-auto"
            >
              <span>View all workshops</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 3 Workshop Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-2xl border border-warmgray p-6 animate-pulse space-y-4">
                  <div className="h-44 bg-warmgray/50 rounded-xl" />
                  <div className="h-4 bg-warmgray/60 rounded w-3/4" />
                  <div className="h-3 bg-warmgray/40 rounded w-full" />
                </div>
              ))}
            </div>
          ) : workshops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {workshops.slice(0, 3).map((w) => (
                <WorkshopCard key={w.id} workshop={w} />
              ))}
            </div>
          ) : (
            <div className="p-10 text-center bg-ivory rounded-2xl border border-warmgray">
              <p className="text-sm text-charcoal/70">No workshops published yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. MERCHANT-FUNDED SIX REWARD MECHANISMS                  */}
      {/* ========================================================= */}
      <section className="py-14 bg-[#1B4D3E] text-white border-t border-forest/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Header */}
            <div className="lg:col-span-4 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-mint/80 font-semibold block">
                MERCHANT-FUNDED
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif text-white tracking-tight">
                Six Reward Mechanisms
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Transparent, instructor-funded incentives to encourage early enrollment and community referrals.
              </p>
            </div>

            {/* Right: 6 Horizontal Mechanism Icons */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2 flex flex-col items-center justify-center">
                <Tag className="w-5 h-5 text-mint" />
                <span className="text-[11px] font-medium leading-tight">Welcome Discount</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2 flex flex-col items-center justify-center">
                <TrendingUp className="w-5 h-5 text-mint" />
                <span className="text-[11px] font-medium leading-tight">Early-Bird Discount</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2 flex flex-col items-center justify-center">
                <CreditCard className="w-5 h-5 text-mint" />
                <span className="text-[11px] font-medium leading-tight">Store Credit</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2 flex flex-col items-center justify-center">
                <Gift className="w-5 h-5 text-mint" />
                <span className="text-[11px] font-medium leading-tight">Digital Gifts</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2 flex flex-col items-center justify-center">
                <Share2 className="w-5 h-5 text-mint" />
                <span className="text-[11px] font-medium leading-tight">Referral Rewards</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2 flex flex-col items-center justify-center">
                <Award className="w-5 h-5 text-gold" />
                <span className="text-[11px] font-medium leading-tight">Achievement Badges</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
