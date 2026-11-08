import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HeroVisualization } from '../components/HeroVisualization';
import { DemandToCommerceJourney } from '../components/DemandToCommerceJourney';
import { LifecycleSection } from '../components/LifecycleSection';
import { WorkshopCard } from '../components/WorkshopCard';
import { DemandIntelligencePreview } from '../components/DemandIntelligencePreview';
import { RewardsShowcase } from '../components/RewardsShowcase';
import { InstructorStudioPreview } from '../components/InstructorStudioPreview';
import { FinalCtaSection } from '../components/FinalCtaSection';
import { api } from '../api/client';
import { Workshop, DemandCluster } from '../types';
import { Sparkles, ArrowRight, ShieldCheck, Tag, CheckCircle2 } from 'lucide-react';

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
      <section
        id="hero"
        tabIndex={-1}
        className="relative pt-8 pb-14 md:pt-12 md:pb-20 bg-white overflow-hidden scroll-mt-20 focus:outline-hidden"
      >
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
      {/* 2. AFTER HERO · CORE DIFFERENTIATION                      */}
      {/* ========================================================= */}
      <DemandToCommerceJourney clusters={clusters} workshops={workshops} />

      {/* ========================================================= */}
      {/* 3. THE LIFECYCLE — HOW NUVENDRY WORKS                     */}
      {/* ========================================================= */}
      <LifecycleSection />

      {/* ========================================================= */}
      {/* 4. SECTION 04 · FEATURED INTERACTIVE WORKSHOPS            */}
      {/* ========================================================= */}
      <section
        id="featured-workshops"
        tabIndex={-1}
        className="relative py-16 md:py-20 bg-[#F8FAF8] overflow-hidden scroll-mt-20 focus:outline-hidden"
      >
        {/* Soft curved organic mint backdrop on the right side */}
        <div
          className="hidden lg:block absolute top-12 -right-28 w-[640px] h-[640px] rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 42% 45%, rgba(215, 240, 226, 0.65) 0%, rgba(227, 245, 234, 0.42) 52%, rgba(248, 250, 248, 0) 74%)',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E5F3EB] text-[#14533C] text-[11px] font-bold uppercase tracking-[0.08em]">
                <Sparkles className="w-3.5 h-3.5 text-[#14533C] stroke-[2]" />
                <span>MARKETPLACE</span>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-serif font-medium text-[#111827] tracking-tight leading-[1.12]">
                  Featured Interactive{' '}
                  <span className="italic font-normal text-[#165C45]">Workshops</span>
                </h2>
                <p className="text-sm sm:text-[15.5px] text-[#374151]">
                  Live, demand-backed sessions with verified PayPal checkout.
                </p>
              </div>
            </div>

            <Link
              to="/workshops"
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#111827] hover:text-[#165C45] transition-colors self-start md:self-center group"
            >
              <span>View all workshops</span>
              <ArrowRight className="w-4 h-4 text-[#111827] group-hover:text-[#165C45] group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>

          {/* 3 Featured Workshop Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-2xl border border-[#E5ECE7] p-5 animate-pulse space-y-4"
                >
                  <div className="flex gap-4">
                    <div className="w-[120px] h-[136px] bg-warmgray/50 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2.5 py-1">
                      <div className="h-4 bg-warmgray/50 rounded w-1/2" />
                      <div className="h-5 bg-warmgray/60 rounded w-full" />
                      <div className="h-3 bg-warmgray/40 rounded w-5/6" />
                    </div>
                  </div>
                  <div className="h-10 bg-warmgray/40 rounded-xl w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {(workshops.length > 0
                ? [...workshops].sort((a, b) => {
                    const order: Record<string, number> = {
                      MLOps: 1,
                      'React + FastAPI': 2,
                      'LangGraph Agents': 3,
                    };
                    return (order[a.category] || 99) - (order[b.category] || 99);
                  })
                : [
                    {
                      id: 'fallback-mlops',
                      merchant_id: 'demo-merchant',
                      title: 'Production MLOps: Serving, Monitoring & Automated Retraining',
                      description:
                        'Deploy, monitor, and automatically retrain ML models in production with FastAPI, observability, and data pipelines.',
                      category: 'MLOps',
                      difficulty: 'Advanced',
                      duration_hours: 3,
                      price_cents: 5500,
                      currency: 'USD',
                      total_seats: 20,
                      remaining_seats: 18,
                      scheduled_at: '2026-11-18T16:00:00Z',
                      is_published: true,
                      created_at: '2026-11-01T10:00:00Z',
                    },
                    {
                      id: 'fallback-fullstack',
                      merchant_id: 'demo-merchant',
                      title: 'Full-Stack AI Apps with React, FastAPI & PayPal Checkout',
                      description:
                        'Build a complete AI web app with React, FastAPI, and a secure PayPal Sandbox checkout, from end to end.',
                      category: 'React + FastAPI',
                      difficulty: 'Beginner-Intermediate',
                      duration_hours: 2,
                      price_cents: 2900,
                      currency: 'USD',
                      total_seats: 30,
                      remaining_seats: 29,
                      scheduled_at: '2026-11-14T15:00:00Z',
                      is_published: true,
                      created_at: '2026-11-01T10:00:00Z',
                    },
                    {
                      id: 'fallback-langgraph',
                      merchant_id: 'demo-merchant',
                      title: 'Building Production-Ready LangGraph Agents',
                      description:
                        'Design, build, and deploy multi-step AI agents with LangGraph, tool use, memory, and real-world production patterns.',
                      category: 'LangGraph Agents',
                      difficulty: 'Intermediate',
                      duration_hours: 2,
                      price_cents: 3900,
                      currency: 'USD',
                      total_seats: 25,
                      remaining_seats: 23,
                      scheduled_at: '2026-11-11T17:00:00Z',
                      is_published: true,
                      created_at: '2026-11-01T10:00:00Z',
                    },
                  ]
              )
                .slice(0, 3)
                .map((w) => (
                  <WorkshopCard key={w.id} workshop={w} />
                ))}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. SECTION 05 · AI DEMAND INTELLIGENCE PREVIEW            */}
      {/* ========================================================= */}
      <DemandIntelligencePreview clusters={clusters} />

      {/* ========================================================= */}
      {/* 6. SECTION 06 · SIX REAL REWARD MECHANISMS                */}
      {/* ========================================================= */}
      <RewardsShowcase />

      {/* ========================================================= */}
      {/* 7. SECTION 07 · FINAL CTA + INSTRUCTOR DEMAND FEED        */}
      {/* ========================================================= */}
      <InstructorStudioPreview />

      {/* ========================================================= */}
      {/* 8. SECTION 08 · TURN INTEREST INTO OPPORTUNITY            */}
      {/* ========================================================= */}
      <FinalCtaSection />
    </div>
  );
};

export default LandingPage;
