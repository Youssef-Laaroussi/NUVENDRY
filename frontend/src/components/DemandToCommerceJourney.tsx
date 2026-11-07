import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Check, User, Tag, Globe, Calendar, Layers, ShieldCheck, CheckCircle2
} from 'lucide-react';
import { DemandCluster, Workshop } from '../types';
import { PayPalOfficialLogo } from './HeroVisualization';
import step1Img from '../assets/step1-learner.png';
import step3Img from '../assets/step3-instructor.png';

interface Props {
  clusters?: DemandCluster[];
  workshops?: Workshop[];
}

export const DemandToCommerceJourney: React.FC<Props> = ({ clusters = [], workshops = [] }) => {
  const [selectedStage, setSelectedStage] = useState<1 | 2 | 3 | 4>(1);

  const activeCluster = clusters.length > 0 ? clusters[0] : null;
  const activeWorkshop = workshops.length > 0 ? workshops[0] : null;

  return (
    <section className="relative py-20 bg-[#FBFBF9] text-[#111827] overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ========================================================= */}
        {/* Section Header                                            */}
        {/* ========================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF5ED] text-[#14533C] text-xs font-semibold tracking-wide border border-[#CDE5D6]">
            <Layers className="w-3.5 h-3.5 text-[#14533C]" />
            <span>How the Marketplace Works</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-serif font-bold text-[#111827] tracking-tight leading-tight">
            The marketplace begins <span className="italic font-normal text-[#165C45]">with a question.</span>
          </h2>

          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Instead of guessing what learners want, instructors discover real needs already expressed in natural language, with verified willingness-to-pay.
          </p>
        </div>

        {/* ========================================================= */}
        {/* 4 Connected Stages Stepper Cards                          */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-3 mb-10 relative">
          
          {/* STEP 1: Learner Intent */}
          <div className="relative flex items-center">
            <button
              type="button"
              onClick={() => setSelectedStage(1)}
              className={`w-full text-left bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-md cursor-pointer flex flex-col justify-between h-full ${
                selectedStage === 1
                  ? 'border-[#165C45] ring-2 ring-[#165C45]/20 bg-white'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              {/* Visual Frame */}
              <div className="relative w-full h-28 mb-3 rounded-xl bg-[#F8FAF9] flex items-center justify-center overflow-hidden">
                <img 
                  src={step1Img} 
                  alt="Learner Intent" 
                  className="w-full h-full object-contain p-1"
                />
              </div>

              {/* Text */}
              <div className="space-y-1">
                <h3 className="font-bold text-sm sm:text-base text-gray-900">
                  1. Learner Intent
                </h3>
                <p className="text-xs text-gray-600 leading-snug">
                  A real, free-form request written in natural language.
                </p>
              </div>
            </button>

            {/* Arrow to Step 2 (visible on desktop) */}
            <div className="hidden lg:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-20 text-gray-400 pointer-events-none">
              <ArrowRight className="w-4 h-4 text-gray-400 stroke-[1.8]" />
            </div>
          </div>

          {/* STEP 2: AI Understanding */}
          <div className="relative flex items-center">
            <button
              type="button"
              onClick={() => setSelectedStage(2)}
              className={`w-full text-left bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-md cursor-pointer flex flex-col justify-between h-full ${
                selectedStage === 2
                  ? 'border-[#165C45] ring-2 ring-[#165C45]/20 bg-white'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              {/* Visual Frame: 3D AI Chip with Constraints Tag Column */}
              <div className="relative w-full h-28 mb-3 rounded-xl bg-[#F8FAF9] flex items-center justify-between px-3 overflow-hidden">
                {/* 3D Chip */}
                <div className="w-14 h-14 rounded-xl bg-white border border-[#165C45] flex items-center justify-center shadow-xs shrink-0 relative">
                  <div className="absolute -top-1 left-2 right-2 h-1 bg-[#165C45] rounded-t-xs" />
                  <div className="absolute -bottom-1 left-2 right-2 h-1 bg-[#165C45] rounded-b-xs" />
                  <span className="font-bold text-[#165C45] text-base font-mono">AI</span>
                </div>

                {/* Constraint tags */}
                <div className="flex flex-col gap-1.5 flex-1 pl-3 min-w-0">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EAF5ED] text-[#14533C] text-[10px] font-medium truncate">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#14533C]/20 flex items-center justify-center text-[8px]">🎯</span>
                    <span>Topic</span>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EAF5ED] text-[#14533C] text-[10px] font-medium truncate">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#14533C]/20 flex items-center justify-center text-[8px]">⚖️</span>
                    <span>Constraints</span>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EAF5ED] text-[#14533C] text-[10px] font-medium truncate">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#14533C]/20 flex items-center justify-center text-[8px]">💳</span>
                    <span>Budget</span>
                  </div>
                </div>
              </div>

              {/* Text */}
              <div className="space-y-1">
                <h3 className="font-bold text-sm sm:text-base text-gray-900">
                  2. AI Understanding
                </h3>
                <p className="text-xs text-gray-600 leading-snug">
                  Parse the request, extract constraints, and identify opportunities.
                </p>
              </div>
            </button>

            {/* Arrow to Step 3 (visible on desktop) */}
            <div className="hidden lg:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-20 text-gray-400 pointer-events-none">
              <ArrowRight className="w-4 h-4 text-gray-400 stroke-[1.8]" />
            </div>
          </div>

          {/* STEP 3: Offer Creation */}
          <div className="relative flex items-center">
            <button
              type="button"
              onClick={() => setSelectedStage(3)}
              className={`w-full text-left bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-md cursor-pointer flex flex-col justify-between h-full ${
                selectedStage === 3
                  ? 'border-[#165C45] ring-2 ring-[#165C45]/20 bg-white'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              {/* Visual Frame */}
              <div className="relative w-full h-28 mb-3 rounded-xl bg-[#F8FAF9] flex items-center justify-center overflow-hidden">
                <img 
                  src={step3Img} 
                  alt="Offer Creation" 
                  className="w-full h-full object-contain p-1"
                />
              </div>

              {/* Text */}
              <div className="space-y-1">
                <h3 className="font-bold text-sm sm:text-base text-gray-900">
                  3. Offer Creation
                </h3>
                <p className="text-xs text-gray-600 leading-snug">
                  Instructors review the demand, shape a workshop, and publish an offer.
                </p>
              </div>
            </button>

            {/* Arrow to Step 4 (visible on desktop) */}
            <div className="hidden lg:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-20 text-gray-400 pointer-events-none">
              <ArrowRight className="w-4 h-4 text-gray-400 stroke-[1.8]" />
            </div>
          </div>

          {/* STEP 4: Transaction */}
          <div className="relative flex items-center">
            <button
              type="button"
              onClick={() => setSelectedStage(4)}
              className={`w-full text-left bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-md cursor-pointer flex flex-col justify-between h-full ${
                selectedStage === 4
                  ? 'border-[#165C45] ring-2 ring-[#165C45]/20 bg-white'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              {/* Visual Frame: PayPal with Orders v2 and Checkmark */}
              <div className="relative w-full h-28 mb-3 rounded-xl bg-[#F8FAF9] flex items-center justify-center px-3 overflow-hidden">
                <div className="w-full bg-white rounded-xl py-2 px-3 shadow-xs border border-gray-100 flex items-center justify-between gap-1.5">
                  <PayPalOfficialLogo className="h-5 w-auto" />
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-700 font-medium">
                    Orders v2
                  </span>
                  <div className="w-5 h-5 rounded-full bg-[#14533C] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
              </div>

              {/* Text */}
              <div className="space-y-1">
                <h3 className="font-bold text-sm sm:text-base text-gray-900">
                  4. Transaction
                </h3>
                <p className="text-xs text-gray-600 leading-snug">
                  Learners reserve and pay securely via PayPal Orders v2.
                </p>
              </div>
            </button>
          </div>

        </div>

        {/* ========================================================= */}
        {/* Dynamic Detail Card matching reference design             */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden">
          
          {/* Stage 1: Expressed Customer Need */}
          {selectedStage === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column Description */}
              <div className="lg:col-span-5 space-y-3">
                <h3 className="text-lg sm:text-xl font-bold text-[#14533C]">
                  Stage 01 — Expressed Customer Need
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  A real example of learner demand captured on NUVENDRY. The request is written in the learner's own words and already includes key purchasing constraints.
                </p>
              </div>

              {/* Right Column Interactive Evidence Card */}
              <div className="lg:col-span-7 relative">
                {/* Soft mint backdrop aura */}
                <div 
                  className="absolute inset-0 rounded-2xl bg-[#EAF5ED] opacity-60 pointer-events-none -z-0"
                  style={{ filter: 'blur(24px)' }}
                />

                <div className="relative z-10 bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#EAF5EE] text-[#14533C] flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm sm:text-base text-gray-900 leading-snug">
                        “I want to learn LangGraph with PostgreSQL checkpointers and real tools for under $40 this weekend in English.”
                      </p>
                    </div>
                  </div>

                  {/* Horizontal Divider */}
                  <div className="border-t border-gray-100 pt-3 flex flex-wrap items-center gap-3 text-xs text-gray-700">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-500">Learner:</span>
                      <span className="font-semibold text-gray-900 bg-gray-50 px-2 py-0.5 rounded">Alex K.</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-500">Budget:</span>
                      <span className="font-semibold text-[#14533C] bg-[#EAF5ED] px-2 py-0.5 rounded">≤ $40</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-500">Language:</span>
                      <span className="font-semibold text-gray-900 bg-gray-50 px-2 py-0.5 rounded">English</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-500">Schedule:</span>
                      <span className="font-semibold text-gray-900 bg-gray-50 px-2 py-0.5 rounded">This weekend</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stage 2: AI Constraint-Aware Clustering */}
          {selectedStage === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-3">
                <h3 className="text-lg sm:text-xl font-bold text-[#14533C]">
                  Stage 02 — Constraint-Aware Clustering
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Our AI NLP validates budget, language, and timeline across learner requests, strictly rejecting incompatible constraints to group commercially viable cohorts.
                </p>
              </div>

              <div className="lg:col-span-7 relative">
                <div 
                  className="absolute inset-0 rounded-2xl bg-[#EAF5ED] opacity-60 pointer-events-none -z-0"
                  style={{ filter: 'blur(24px)' }}
                />

                <div className="relative z-10 bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2 text-xs">
                    <span className="font-semibold text-gray-900 text-sm">Aggregated Cohort Opportunity</span>
                    <span className="text-[#14533C] font-semibold text-xs bg-[#EAF5ED] px-2.5 py-1 rounded-full">
                      {activeCluster?.member_count || 4} Compatible Learners
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-sm sm:text-base text-gray-900">
                      {activeCluster?.name || 'Production LangGraph Agents & Memory Systems'}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {activeCluster?.summary || 'Aggregated requests for LangGraph supervisors, memory persistence, and tool binding.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs pt-1">
                    <span className="px-2.5 py-1 rounded-md bg-[#EAF5ED] text-[#14533C] font-medium">✓ Budget Ceiling: $40</span>
                    <span className="px-2.5 py-1 rounded-md bg-[#EAF5ED] text-[#14533C] font-medium">✓ Language: English</span>
                    <span className="px-2.5 py-1 rounded-md bg-[#EAF5ED] text-[#14533C] font-medium">✓ Format: Live Hands-on</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stage 3: Demand-to-Offer Synthesis */}
          {selectedStage === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-3">
                <h3 className="text-lg sm:text-xl font-bold text-[#14533C]">
                  Stage 03 — Demand-to-Offer Synthesis
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Instructors approve pre-validated offers generated by AI. Pricing is calibrated directly against learner budgets ($39 vs $40 threshold).
                </p>
              </div>

              <div className="lg:col-span-7 relative">
                <div 
                  className="absolute inset-0 rounded-2xl bg-[#EAF5ED] opacity-60 pointer-events-none -z-0"
                  style={{ filter: 'blur(24px)' }}
                />

                <div className="relative z-10 bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2 text-xs">
                    <span className="font-semibold text-gray-900 text-sm">Instructor Studio Proposal</span>
                    <span className="text-[#14533C] font-semibold text-xs bg-[#EAF5ED] px-2.5 py-1 rounded-full">
                      Ready to Publish
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-sm sm:text-base text-gray-900">
                      LangGraph Agents in Practice: State, Memory & Multi-Agent Teams
                    </h4>
                    <p className="text-xs text-gray-600">
                      2h Live Workshop • 25 Seats Max • Target Calibrated Price: $39.00 USD
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Cohort Willingness-to-Pay: $40</span>
                    <span className="font-bold text-[#14533C] text-sm font-mono">$39.00 USD</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stage 4: Verified Transaction & PayPal Sandbox */}
          {selectedStage === 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-3">
                <h3 className="text-lg sm:text-xl font-bold text-[#14533C]">
                  Stage 04 — Verified Commerce & PayPal Checkout
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  PayPal Sandbox Orders v2 captures server-authoritative amounts, consumes eligible merchant rewards, and prevents overselling with atomic locks.
                </p>
              </div>

              <div className="lg:col-span-7 relative">
                <div 
                  className="absolute inset-0 rounded-2xl bg-[#EAF5ED] opacity-60 pointer-events-none -z-0"
                  style={{ filter: 'blur(24px)' }}
                />

                <div className="relative z-10 bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2 text-xs">
                    <span className="font-semibold text-gray-900 text-sm">Server-Authoritative Order v2</span>
                    <span className="text-[#14533C] font-semibold text-xs bg-[#EAF5ED] px-2.5 py-1 rounded-full">
                      PayPal Sandbox Verified
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-700">
                    <div className="flex justify-between">
                      <span>Workshop Ticket:</span>
                      <span className="font-mono font-medium">$39.00 USD</span>
                    </div>
                    <div className="flex justify-between text-[#14533C] font-semibold">
                      <span>Welcome Reward Applied:</span>
                      <span className="font-mono">-$10.00 USD</span>
                    </div>
                    <div className="pt-2 border-t border-gray-100 flex justify-between font-bold text-sm text-gray-900">
                      <span>Authoritative Total:</span>
                      <span className="font-mono text-[#14533C] text-base">$29.00 USD</span>
                    </div>
                  </div>
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
