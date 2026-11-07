import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, CheckCircle2, ShieldCheck, Tag, ArrowRight, 
  Layers, Clock, DollarSign, Users, ChevronRight, Check,
  Bot, AlertCircle, HelpCircle, FileCheck
} from 'lucide-react';
import { DemandCluster, Workshop } from '../types';

interface Props {
  clusters: DemandCluster[];
  workshops: Workshop[];
}

export const DemandToCommerceJourney: React.FC<Props> = ({ clusters, workshops }) => {
  const [selectedStage, setSelectedStage] = useState<1 | 2 | 3 | 4>(1);

  // If seeded clusters exist, use the first one as concrete evidence
  const activeCluster = clusters.length > 0 ? clusters[0] : null;
  const activeWorkshop = workshops.length > 0 ? workshops[0] : null;

  return (
    <section className="py-20 bg-white border-y border-warmgray text-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint text-forest text-xs font-mono font-semibold uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>Core Differentiation</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-charcoal tracking-tight leading-tight mb-4">
            The marketplace begins with a question.
          </h2>
          <p className="text-base sm:text-lg text-charcoal/70 leading-relaxed">
            Instead of guessing what learners want, instructors can discover needs already being expressed in natural language with verified willingness-to-pay.
          </p>
        </div>

        {/* 4 Connected Stages Stepper Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            {
              stage: 1,
              title: '1. Learner Intent',
              subtitle: 'Free-form request',
              badge: 'Unstructured Need'
            },
            {
              stage: 2,
              title: '2. AI Understanding',
              subtitle: 'Constraint parsing',
              badge: 'Semantic Clustering'
            },
            {
              stage: 3,
              title: '3. Offer Creation',
              subtitle: 'Instructor review',
              badge: 'Calibrated Offer'
            },
            {
              stage: 4,
              title: '4. Transaction',
              subtitle: 'PayPal Orders v2',
              badge: 'Guaranteed Seat'
            }
          ].map((item) => {
            const isActive = selectedStage === item.stage;
            return (
              <button
                key={item.stage}
                onClick={() => setSelectedStage(item.stage as any)}
                className={`text-left p-4 rounded-xl border transition-all relative ${
                  isActive
                    ? 'bg-mint/40 border-forest shadow-xs'
                    : 'bg-ivory/60 border-warmgray hover:border-charcoal/30 hover:bg-ivory'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[11px] font-mono font-semibold uppercase tracking-wider ${
                    isActive ? 'text-forest' : 'text-charcoal/50'
                  }`}>
                    {item.badge}
                  </span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-forest" />}
                </div>
                <div className="font-semibold text-sm sm:text-base text-charcoal">{item.title}</div>
                <div className="text-xs text-charcoal/60 mt-0.5">{item.subtitle}</div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Connected Canvas Box */}
        <div className="bg-ivory/80 rounded-2xl border border-warmgray p-6 sm:p-8 relative overflow-hidden">
          {/* Stage 1: Learner Intent */}
          {selectedStage === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-mono uppercase tracking-wider text-forest font-semibold">
                  Stage 01 — Expressed Customer Need
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif text-charcoal">
                  Learners post unstructured requirements without navigating rigid catalogs.
                </h3>
                <p className="text-xs sm:text-sm text-charcoal/70 leading-relaxed">
                  Traditional education platforms force learners to search for pre-recorded courses that might be outdated, over-budget, or irrelevant. In NUVENDRY, a learner expresses their concrete goal, timeline, and maximum budget in plain prose.
                </p>
                <div className="pt-2">
                  <Link
                    to="/demand"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-forest text-ivory text-xs font-semibold hover:bg-charcoal transition-colors shadow-xs"
                  >
                    <span>Submit Your Own Learning Demand</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-warmgray shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-warmgray/60 pb-2 text-xs">
                  <span className="font-mono text-charcoal/50 uppercase text-[10px]">Actual Input Ingestion</span>
                  <span className="text-forest font-mono text-[11px]">Database Record #d1</span>
                </div>
                <div className="p-3 bg-ivory rounded-lg text-xs italic text-charcoal leading-relaxed font-serif">
                  "I want to learn LangGraph with PostgreSQL checkpointers and real tools for under $40 this weekend in English."
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-ivory/70 border border-warmgray/50">
                    <span className="block text-[10px] text-charcoal/50 font-mono">Learner</span>
                    <strong className="text-charcoal font-medium">Sophia Chen</strong>
                  </div>
                  <div className="p-2 rounded bg-ivory/70 border border-warmgray/50">
                    <span className="block text-[10px] text-charcoal/50 font-mono">Max Budget</span>
                    <strong className="text-forest font-mono">$40.00 USD</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stage 2: AI Understanding & Clustering */}
          {selectedStage === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-mono uppercase tracking-wider text-forest font-semibold">
                  Stage 02 — Constraint-Aware Clustering
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif text-charcoal">
                  AI extracts hard constraints and aggregates commercially viable cohorts.
                </h3>
                <p className="text-xs sm:text-sm text-charcoal/70 leading-relaxed">
                  Unlike naive semantic similarity that groups any keyword match, NUVENDRY validates constraint compatibility. If two learners request opposite languages or conflicting delivery times, the system avoids merging them, preserving commercial feasibility.
                </p>
                <div className="flex flex-wrap gap-2 text-xs pt-1">
                  <span className="px-2.5 py-1 rounded bg-white border border-warmgray text-forest font-mono font-medium">
                    Budget Constraint Check
                  </span>
                  <span className="px-2.5 py-1 rounded bg-white border border-warmgray text-forest font-mono font-medium">
                    Language Alignment
                  </span>
                  <span className="px-2.5 py-1 rounded bg-white border border-warmgray text-forest font-mono font-medium">
                    Delivery Format Harmony
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-warmgray shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-warmgray/60 pb-2 text-xs">
                  <span className="font-mono text-charcoal/50 uppercase text-[10px]">Active Cluster Output</span>
                  <span className="text-forest font-semibold text-xs bg-mint px-2 py-0.5 rounded">
                    {activeCluster?.member_count || 2} Learners Aggregated
                  </span>
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-charcoal">
                    {activeCluster?.name || 'Production LangGraph Agents & Memory Systems'}
                  </span>
                  <p className="text-xs text-charcoal/60 leading-relaxed">
                    {activeCluster?.summary || 'Aggregated learner requests seeking hands-on multi-agent supervisor implementation.'}
                  </p>
                </div>
                <div className="p-3 bg-mint/30 rounded-lg border border-forest/20 text-xs flex justify-between items-center font-mono">
                  <span className="text-charcoal/70">Willingness-to-Pay Pool:</span>
                  <span className="font-bold text-forest text-sm">
                    ${activeCluster ? (activeCluster.avg_budget_cents / 100).toFixed(2) : '42.50'} avg / learner
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Stage 3: Offer Creation & Instructor Review */}
          {selectedStage === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-mono uppercase tracking-wider text-forest font-semibold">
                  Stage 03 — Demand-to-Offer Synthesis
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif text-charcoal">
                  Instructors approve pre-validated offers rather than risking unbacked courses.
                </h3>
                <p className="text-xs sm:text-sm text-charcoal/70 leading-relaxed">
                  The AI Offer Studio synthesizes a concrete draft proposal including module syllabus, learning outcomes, and suggested pricing derived directly from learner budget distributions. The instructor retains full editorial control to modify capacity and scheduled dates.
                </p>
                <div className="pt-2">
                  <Link
                    to="/for-instructors"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-forest text-ivory text-xs font-semibold hover:bg-charcoal transition-colors shadow-xs"
                  >
                    <span>Inspect Instructor Offer Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-warmgray shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-warmgray/60 pb-2 text-xs">
                  <span className="font-mono text-charcoal/50 uppercase text-[10px]">Synthesized Proposal</span>
                  <span className="text-forest font-mono text-[11px]">Approved by Dr. Elena Rostova</span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm text-charcoal">
                    Building Production-Ready LangGraph Agents with Resilient State
                  </h4>
                  <div className="flex gap-2 text-[11px] text-charcoal/60">
                    <span>2 Hours Live</span> • <span>Intermediate Level</span> • <span>25 Total Seats</span>
                  </div>
                </div>
                <div className="bg-ivory p-3 rounded-lg border border-warmgray/60 text-xs space-y-1 text-charcoal/75">
                  <div className="font-semibold text-charcoal text-[11px] uppercase font-mono">Calibrated Pricing:</div>
                  <div className="flex justify-between items-center">
                    <span>Target Market Price:</span>
                    <span className="font-bold text-forest font-mono text-sm">$39.00 USD</span>
                  </div>
                  <p className="text-[10px] text-charcoal/50 pt-1">
                    Calibrated within $40 max budget threshold expressed by cohort members.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stage 4: Transaction & PayPal Checkout */}
          {selectedStage === 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-mono uppercase tracking-wider text-forest font-semibold">
                  Stage 04 — Verified Commerce & Fulfillment
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif text-charcoal">
                  Transactions captured through PayPal Sandbox with server-authoritative locks.
                </h3>
                <p className="text-xs sm:text-sm text-charcoal/70 leading-relaxed">
                  Upon seat selection, server-side promotion rules evaluate reward eligibility (e.g. Welcome Discounts or merchant-funded store credit). PayPal Sandbox Orders v2 captures the authoritative amount, securing the seat reservation with an automated 15-minute hold to prevent overselling.
                </p>
                <div className="pt-2">
                  <Link
                    to={activeWorkshop ? `/workshops/${activeWorkshop.id}` : '/workshops'}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-forest text-ivory text-xs font-semibold hover:bg-charcoal transition-colors shadow-xs"
                  >
                    <span>View Workshop Reservation Flow</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-warmgray shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-warmgray/60 pb-2 text-xs">
                  <span className="font-mono text-charcoal/50 uppercase text-[10px]">Live PayPal Orders v2 Order</span>
                  <span className="text-forest font-mono text-[11px] bg-mint px-2 py-0.5 rounded">Verified Calculation</span>
                </div>
                <div className="space-y-1.5 text-xs text-charcoal">
                  <div className="flex justify-between">
                    <span className="text-charcoal/70">Workshop Price:</span>
                    <span className="font-mono">$39.00 USD</span>
                  </div>
                  <div className="flex justify-between text-forest font-medium">
                    <span>Welcome Reward Applied:</span>
                    <span className="font-mono">-$10.00 USD</span>
                  </div>
                  <div className="pt-2 border-t border-warmgray flex justify-between font-bold text-sm">
                    <span>Payable Total:</span>
                    <span className="font-mono text-forest">$29.00 USD</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-mint/50 border border-forest/20 text-[11px] text-forest flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Authoritative server verification before seat assignment.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DemandToCommerceJourney;

