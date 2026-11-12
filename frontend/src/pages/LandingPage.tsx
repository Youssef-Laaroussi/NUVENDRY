import { motion, useReducedMotion } from 'framer-motion';
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DemandToCommerceJourney } from '../components/DemandToCommerceJourney';
import { LifecycleSection } from '../components/LifecycleSection';
import { UpcomingWorkshops } from '../components/UpcomingWorkshops';
import { WorkshopCard } from '../components/WorkshopCard';
import { DemandIntelligencePreview } from '../components/DemandIntelligencePreview';
import { RewardsShowcase } from '../components/RewardsShowcase';
import { InstructorStudioPreview } from '../components/InstructorStudioPreview';
import { FinalCtaSection } from '../components/FinalCtaSection';
import { api, useSyncRefresh } from '../api/client';
import { Workshop, DemandCluster } from '../types';
import collaborativeWorkspace from '../assets/collaborative-learning-workspace.png';
import { ArrowRight, ShieldCheck, Tag, CheckCircle2 } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const reduceMotion = useReducedMotion();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [clusters, setClusters] = useState<DemandCluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [workshopsFailed, setWorkshopsFailed] = useState(false);
  const [externalJourneyStage, setExternalJourneyStage] = useState<{
    stage: 1 | 2 | 3 | 4;
    seq: number;
  } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [workshopResult, clusterResult] = await Promise.allSettled([
      api.getWorkshops(), api.getClusters(),
    ]);
    if (workshopResult.status === 'fulfilled') {
      setWorkshops(workshopResult.value);
    }
    setWorkshopsFailed(workshopResult.status === 'rejected');
    if (clusterResult.status === 'fulfilled') {
      setClusters(clusterResult.value);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useSyncRefresh(['workshops', 'clusters'], loadData);

  return (
    <div className="bg-ivory text-charcoal">
      {/* ========================================================= */}
      {/* 1. HERO SECTION                                           */}
      {/* ========================================================= */}
      <section
        id="hero"
        tabIndex={-1}
        className="relative isolate min-h-[620px] md:min-h-[700px] bg-[#10251d] overflow-hidden scroll-mt-20 focus:outline-hidden"
      >
        <img
          src={collaborativeWorkspace}
          alt="Learners and an instructor using NUVENDRY to connect learning requests with workshops and PayPal Sandbox checkout"
          className="absolute inset-0 -z-10 h-full w-full object-cover object-[center_8%]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/25 to-black/5" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/35 via-transparent to-transparent" />

        <div className="mx-auto flex min-h-[620px] max-w-7xl items-end px-4 pb-12 pt-32 sm:px-6 md:min-h-[700px] md:px-8 md:pb-16 lg:px-8">
          <motion.div
            className="max-w-3xl space-y-5"
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.65, ease: 'easeOut' }}
          >
            <div className="space-y-1">
              <h1 className="text-4xl font-serif font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[64px]">
                Build skills.
              </h1>
              <h2 className="text-4xl font-serif font-normal italic leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[64px]">
                Shape what comes next.
              </h2>
            </div>

            <p className="max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">
              People express demand, AI identifies opportunities, instructors create offers, and learners pay through PayPal Sandbox.
            </p>

            <div className="flex flex-col items-stretch gap-3 pt-1 sm:flex-row sm:items-center">
              <Link
                to="/workshops"
                className="nv-btn-press group inline-flex items-center justify-center gap-2 rounded-lg bg-[#0e3c2f] px-6 py-3 text-xs font-semibold text-white shadow-lg transition-all hover:bg-[#08281e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
              >
                <span>Explore Workshops</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/demand"
                className="nv-btn-press inline-flex items-center justify-center rounded-lg border border-white/75 bg-white/10 px-6 py-3 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span>Request a Workshop</span>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-[11px] text-white/90 sm:text-xs">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-[#b9efc9]" />Real Learner Requests</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-[#b9efc9]" />PayPal Sandbox Verified</span>
              <span className="inline-flex items-center gap-1.5"><Tag className="h-4 w-4 text-[#b9efc9]" />Merchant-Funded Rewards</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. AFTER HERO · CORE DIFFERENTIATION                      */}
      {/* ========================================================= */}
      <DemandToCommerceJourney
        clusters={clusters}
        workshops={workshops}
        externalStage={externalJourneyStage}
      />

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
              <span className="text-xs font-bold uppercase tracking-widest text-[#14533c]">MARKETPLACE</span>

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
                      price_cents: 1500,
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
                      price_cents: 1000,
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
                      price_cents: 1200,
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
                .map((w, index) => (
                  <motion.div
                    key={w.id}
                    className="landing-featured-card grid min-w-0"
                    initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: reduceMotion ? 0 : 0.42, delay: reduceMotion ? 0 : index * 0.14 }}
                  >
                    <WorkshopCard workshop={w} />
                  </motion.div>
                ))}
            </div>
          )}
        </div>
      </section>

      <UpcomingWorkshops workshops={workshops} loading={loading} failed={workshopsFailed} retry={loadData} />

      {/* ========================================================= */}
      {/* 5. SECTION 05 · AI DEMAND INTELLIGENCE PREVIEW            */}
      {/* ========================================================= */}
      <DemandIntelligencePreview clusters={clusters} />

      {/* ========================================================= */}
      {/* 6. SECTION 06 · SIX REAL REWARD MECHANISMS                */}
      {/* ========================================================= */}
      <RewardsShowcase workshops={workshops} />

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
