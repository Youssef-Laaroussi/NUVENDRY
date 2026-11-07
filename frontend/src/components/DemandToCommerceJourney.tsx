import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  User,
  Tag,
  Globe,
  Calendar,
  Layers,
  Target,
} from 'lucide-react';
import { DemandCluster, Workshop } from '../types';
import { PayPalOfficialLogo } from './HeroVisualization';
import stage1LearnerImg from '../assets/stage1-male-learner.png';
import stage3InstructorImg from '../assets/stage3-male-instructor.png';

interface Props {
  clusters?: DemandCluster[];
  workshops?: Workshop[];
}

/* --- Card 1 Visual: 3D Male Learner + Organic Mint Wave + Floating Prompt Speech Bubble --- */
const LearnerIntentVisual: React.FC = () => (
  <div className="relative w-full h-[104px] flex items-end justify-start overflow-visible">
    <img
      src={stage1LearnerImg}
      alt="Learner expressing intent"
      className="h-[104px] w-auto object-contain select-none -ml-1"
    />

    {/* Floating Request Speech Bubble on Top-Right */}
    <div className="absolute right-0 top-2 z-10 w-[88px] rounded-[10px] bg-white border border-[#DCE8E1] shadow-[0_4px_12px_rgba(16,42,31,0.08)] px-3 py-2.5 space-y-1.5">
      <div className="w-full h-[3px] rounded-full bg-[#5D7A6C]" />
      <div className="w-[82%] h-[3px] rounded-full bg-[#8CA599]" />
      <div className="w-[62%] h-[3px] rounded-full bg-[#B3C6BC]" />
      {/* Speech bubble pointer */}
      <svg
        viewBox="0 0 14 8"
        className="absolute -bottom-[7px] left-2.5 w-3.5 h-2 overflow-visible"
        fill="none"
      >
        <path d="M1 0 L0 7 L9 0 Z" fill="#FFFFFF" />
        <path d="M1 0 L0 7 L9 0" stroke="#DCE8E1" strokeWidth="1" strokeLinejoin="round" />
      </svg>
    </div>
  </div>
);

/* --- Card 2 Visual: Crisp AI Microchip + Topic / Constraints / Budget Pills --- */
const AIUnderstandingVisual: React.FC = () => (
  <div className="relative w-full h-[104px] flex items-center justify-between gap-2.5">
    {/* AI Microchip with Soft Mint Wave Glow */}
    <div className="relative w-[82px] h-[86px] flex items-center justify-center shrink-0">
      <div
        className="absolute inset-1 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(206, 238, 220, 0.85) 0%, rgba(231, 247, 238, 0.35) 65%, rgba(255,255,255,0) 100%)',
        }}
      />
      <svg
        viewBox="0 0 80 80"
        className="relative z-10 w-[72px] h-[72px]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top pins */}
        <line x1="28" y1="19" x2="28" y2="10" stroke="#165C45" strokeWidth="2.4" strokeLinecap="round" />
        <line x1="40" y1="19" x2="40" y2="10" stroke="#165C45" strokeWidth="2.4" strokeLinecap="round" />
        <line x1="52" y1="19" x2="52" y2="10" stroke="#165C45" strokeWidth="2.4" strokeLinecap="round" />
        {/* Bottom pins */}
        <line x1="28" y1="61" x2="28" y2="70" stroke="#165C45" strokeWidth="2.4" strokeLinecap="round" />
        <line x1="40" y1="61" x2="40" y2="70" stroke="#165C45" strokeWidth="2.4" strokeLinecap="round" />
        <line x1="52" y1="61" x2="52" y2="70" stroke="#165C45" strokeWidth="2.4" strokeLinecap="round" />
        {/* Left pins */}
        <line x1="19" y1="28" x2="10" y2="28" stroke="#165C45" strokeWidth="2.4" strokeLinecap="round" />
        <line x1="19" y1="40" x2="10" y2="40" stroke="#165C45" strokeWidth="2.4" strokeLinecap="round" />
        <line x1="19" y1="52" x2="10" y2="52" stroke="#165C45" strokeWidth="2.4" strokeLinecap="round" />
        {/* Right pins */}
        <line x1="61" y1="28" x2="70" y2="28" stroke="#165C45" strokeWidth="2.4" strokeLinecap="round" />
        <line x1="61" y1="40" x2="70" y2="40" stroke="#165C45" strokeWidth="2.4" strokeLinecap="round" />
        <line x1="61" y1="52" x2="70" y2="52" stroke="#165C45" strokeWidth="2.4" strokeLinecap="round" />

        {/* Outer Chip */}
        <rect
          x="19"
          y="19"
          width="42"
          height="42"
          rx="8"
          fill="#F4FBF7"
          stroke="#165C45"
          strokeWidth="2.4"
        />
        {/* Inner Subtle Frame */}
        <rect
          x="24"
          y="24"
          width="32"
          height="32"
          rx="5"
          fill="#FFFFFF"
          stroke="#B7DFC9"
          strokeWidth="1.2"
        />
        <text
          x="40"
          y="45.5"
          textAnchor="middle"
          fill="#165C45"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="800"
          fontSize="15"
        >
          AI
        </text>
      </svg>
    </div>

    {/* 3 Extracted Signal Pills */}
    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#E6F3EB] text-[#1F2937] text-[11.5px] font-medium w-fit">
        <Target className="w-3.5 h-3.5 text-[#165C45] shrink-0 stroke-[2]" />
        <span>Topic</span>
      </div>
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#E6F3EB] text-[#1F2937] text-[11.5px] font-medium w-fit">
        <Layers className="w-3.5 h-3.5 text-[#165C45] shrink-0 stroke-[2]" />
        <span>Constraints</span>
      </div>
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#E6F3EB] text-[#1F2937] text-[11.5px] font-medium w-fit">
        <Tag className="w-3.5 h-3.5 text-[#165C45] shrink-0 stroke-[2]" />
        <span>Budget</span>
      </div>
    </div>
  </div>
);

/* --- Card 3 Visual: 3D Male Instructor + Organic Mint Wave + Actionable Offer Pills --- */
const OfferCreationVisual: React.FC = () => (
  <div className="relative w-full h-[104px] flex items-center justify-between gap-1.5">
    <img
      src={stage3InstructorImg}
      alt="Instructor creating workshop offer"
      className="h-[104px] w-auto object-contain shrink-0 select-none -ml-2"
    />

    {/* 3 Actionable Offer Pills */}
    <div className="relative z-10 flex flex-col gap-1.5 flex-1 min-w-0">
      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#E6F3EB] text-[#1F2937] text-[11px] font-medium w-fit whitespace-nowrap">
        <span className="w-3.5 h-3.5 rounded-full bg-[#156947] text-white flex items-center justify-center shrink-0">
          <Check className="w-2.5 h-2.5 stroke-[3]" />
        </span>
        <span>Topic Match</span>
      </div>
      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#E6F3EB] text-[#1F2937] text-[11px] font-medium w-fit whitespace-nowrap">
        <span className="w-3.5 h-3.5 rounded-full bg-[#156947] text-white flex items-center justify-center shrink-0">
          <Check className="w-2.5 h-2.5 stroke-[3]" />
        </span>
        <span>Scope & Price</span>
      </div>
      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#E6F3EB] text-[#1F2937] text-[11px] font-medium w-fit whitespace-nowrap">
        <span className="w-3.5 h-3.5 rounded-full bg-[#156947] text-white flex items-center justify-center shrink-0">
          <Check className="w-2.5 h-2.5 stroke-[3]" />
        </span>
        <span>Publish</span>
      </div>
    </div>
  </div>
);

/* --- Card 4 Visual: PayPal + Orders v2 Pill + Overlapping Bottom-Right Green Checkmark --- */
const TransactionVisual: React.FC = () => (
  <div className="relative w-full h-[104px] flex items-center justify-center">
    <div
      className="absolute inset-x-4 inset-y-3 rounded-full pointer-events-none"
      style={{
        background:
          'radial-gradient(ellipse at center, rgba(214, 240, 225, 0.55) 0%, rgba(255,255,255,0) 75%)',
      }}
    />
    <div className="relative z-10 w-full bg-white rounded-xl border border-[#E7EEEA] shadow-[0_6px_20px_rgba(15,41,30,0.06)] px-3.5 py-3 flex items-center justify-between gap-2">
      <PayPalOfficialLogo className="h-[22px] w-auto shrink-0" />
      <span className="px-2.5 py-0.5 rounded-full bg-[#E6F3EB] text-[#14533C] text-[11px] font-semibold whitespace-nowrap">
        Orders v2
      </span>

      {/* Overlapping Checkmark Circle on Bottom-Right */}
      <div className="absolute -bottom-3 right-2.5 w-7 h-7 rounded-full bg-[#156947] text-white flex items-center justify-center shadow-md ring-2 ring-white">
        <Check className="w-3.5 h-3.5 stroke-[3]" />
      </div>
    </div>
  </div>
);

export const DemandToCommerceJourney: React.FC<Props> = ({ clusters = [], workshops = [] }) => {
  const [selectedStage, setSelectedStage] = useState<1 | 2 | 3 | 4>(1);

  const activeCluster = clusters.length > 0 ? clusters[0] : null;
  const activeWorkshop = workshops.length > 0 ? workshops[0] : null;

  return (
    <section className="relative py-16 md:py-20 bg-[#F8FAF8] text-[#111827] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ========================================================= */}
        {/* Section Header                                            */}
        {/* ========================================================= */}
        <div className="text-center max-w-4xl mx-auto mb-12 space-y-3.5">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E6F3EB] text-[#14533C] text-xs font-semibold tracking-wide">
            <Layers className="w-3.5 h-3.5 text-[#14533C] stroke-[2]" />
            <span>How the Marketplace Works</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-serif font-bold text-[#111827] tracking-tight leading-[1.12]">
            The marketplace begins{' '}
            <span className="italic font-normal text-[#165C45]">with a question.</span>
          </h2>

          <p className="text-sm sm:text-[15.5px] text-[#374151] max-w-2xl mx-auto leading-relaxed">
            Instead of guessing what learners want, instructors discover real needs already expressed
            in natural language, with verified willingness-to-pay.
          </p>
        </div>

        {/* ========================================================= */}
        {/* 4 Connected Stage Cards with Clean Arrow Separators       */}
        {/* ========================================================= */}
        <div className="flex flex-col lg:flex-row items-stretch justify-between gap-4 lg:gap-0 mb-8">
          {/* Card 1 */}
          <button
            type="button"
            onClick={() => setSelectedStage(1)}
            className="flex-1 text-left bg-white rounded-2xl p-5 border border-[#E5ECE7] shadow-[0_6px_22px_rgba(15,41,30,0.05)] hover:shadow-[0_10px_28px_rgba(15,41,30,0.08)] transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="mb-3">
              <LearnerIntentVisual />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-[15.5px] text-[#111827]">1. Learner Intent</h3>
              <p className="text-[12.5px] text-[#4B5563] leading-[1.45]">
                A real, free-form request written in natural language.
              </p>
            </div>
          </button>

          {/* Arrow 1 -> 2 */}
          <div className="hidden lg:flex items-center justify-center px-2.5 shrink-0">
            <ArrowRight className="w-4 h-4 text-[#165C45] stroke-[1.8]" />
          </div>

          {/* Card 2 */}
          <button
            type="button"
            onClick={() => setSelectedStage(2)}
            className="flex-1 text-left bg-white rounded-2xl p-5 border border-[#E5ECE7] shadow-[0_6px_22px_rgba(15,41,30,0.05)] hover:shadow-[0_10px_28px_rgba(15,41,30,0.08)] transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="mb-3">
              <AIUnderstandingVisual />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-[15.5px] text-[#111827]">2. AI Understanding</h3>
              <p className="text-[12.5px] text-[#4B5563] leading-[1.45]">
                Parse the request, extract constraints, and identify opportunities.
              </p>
            </div>
          </button>

          {/* Arrow 2 -> 3 */}
          <div className="hidden lg:flex items-center justify-center px-2.5 shrink-0">
            <ArrowRight className="w-4 h-4 text-[#165C45] stroke-[1.8]" />
          </div>

          {/* Card 3 */}
          <button
            type="button"
            onClick={() => setSelectedStage(3)}
            className="flex-1 text-left bg-white rounded-2xl p-5 border border-[#E5ECE7] shadow-[0_6px_22px_rgba(15,41,30,0.05)] hover:shadow-[0_10px_28px_rgba(15,41,30,0.08)] transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="mb-3">
              <OfferCreationVisual />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-[15.5px] text-[#111827]">3. Offer Creation</h3>
              <p className="text-[12.5px] text-[#4B5563] leading-[1.45]">
                Instructors review the demand, shape a workshop, and publish an offer.
              </p>
            </div>
          </button>

          {/* Arrow 3 -> 4 */}
          <div className="hidden lg:flex items-center justify-center px-2.5 shrink-0">
            <ArrowRight className="w-4 h-4 text-[#165C45] stroke-[1.8]" />
          </div>

          {/* Card 4 */}
          <button
            type="button"
            onClick={() => setSelectedStage(4)}
            className="flex-1 text-left bg-white rounded-2xl p-5 border border-[#E5ECE7] shadow-[0_6px_22px_rgba(15,41,30,0.05)] hover:shadow-[0_10px_28px_rgba(15,41,30,0.08)] transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="mb-3">
              <TransactionVisual />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-[15.5px] text-[#111827]">4. Transaction</h3>
              <p className="text-[12.5px] text-[#4B5563] leading-[1.45]">
                Learners reserve and pay securely via PayPal Orders v2.
              </p>
            </div>
          </button>
        </div>

        {/* ========================================================= */}
        {/* Bottom Stage Showcase Card                                */}
        {/* ========================================================= */}
        <div className="relative rounded-2xl bg-[#FAFBF9] border border-[#E5ECE7] p-6 sm:p-8 shadow-[0_6px_24px_rgba(15,41,30,0.04)] overflow-hidden">
          {/* Curved Mint Wave Backdrop on Right Side */}
          <div
            className="hidden lg:block absolute -top-8 -bottom-8 left-[33%] right-0 pointer-events-none rounded-l-[180px]"
            style={{
              background:
                'linear-gradient(90deg, rgba(221, 241, 229, 0.72) 0%, rgba(232, 246, 237, 0.45) 55%, rgba(250, 251, 249, 0.1) 100%)',
            }}
          />

          {/* Stage 01 — Expressed Customer Need */}
          {selectedStage === 1 && (
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              <div className="lg:col-span-4 space-y-2.5">
                <h3 className="text-xl sm:text-[22px] font-serif font-bold text-[#134E3A] tracking-tight">
                  Stage 01 — Expressed Customer Need
                </h3>
                <p className="text-[13.5px] text-[#374151] leading-[1.6]">
                  A real example of learner demand captured on NUVENDRY. The request is written in
                  the learner&apos;s own words and already includes key purchasing constraints.
                </p>
              </div>

              <div className="lg:col-span-8">
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E8EEEA] shadow-[0_8px_28px_rgba(15,41,30,0.07)]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#E9F5EE] text-[#165C45] flex items-center justify-center shrink-0">
                      <User className="w-6 h-6 stroke-[1.9]" />
                    </div>
                    <p className="text-[15.5px] sm:text-[18px] font-semibold text-[#111827] leading-[1.38]">
                      “I want to learn LangGraph with PostgreSQL checkpointers and real tools for
                      under $40 this weekend in English.”
                    </p>
                  </div>

                  <div className="border-t border-[#EDF1EE] my-4" />

                  <div className="flex flex-wrap xl:flex-nowrap items-center justify-between gap-y-2 gap-x-3 text-xs">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <User className="w-3.5 h-3.5 text-[#165C45] stroke-[2]" />
                      <span className="text-[#4B5563]">Learner</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E6F3EB] text-[#134937] font-semibold">
                        Alex K.
                      </span>
                    </div>

                    <div className="hidden sm:block h-4 w-px bg-[#E2E8E4]" />

                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <Tag className="w-3.5 h-3.5 text-[#165C45] stroke-[2]" />
                      <span className="text-[#4B5563]">Budget</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E6F3EB] text-[#134937] font-bold">
                        ≤ $40
                      </span>
                    </div>

                    <div className="hidden sm:block h-4 w-px bg-[#E2E8E4]" />

                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <Globe className="w-3.5 h-3.5 text-[#165C45] stroke-[2]" />
                      <span className="text-[#4B5563]">Language</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E6F3EB] text-[#134937] font-semibold">
                        English
                      </span>
                    </div>

                    <div className="hidden sm:block h-4 w-px bg-[#E2E8E4]" />

                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <Calendar className="w-3.5 h-3.5 text-[#165C45] stroke-[2]" />
                      <span className="text-[#4B5563]">Schedule</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E6F3EB] text-[#134937] font-semibold">
                        This weekend
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stage 02 — Constraint-Aware Clustering */}
          {selectedStage === 2 && (
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              <div className="lg:col-span-4 space-y-2.5">
                <h3 className="text-xl sm:text-[22px] font-serif font-bold text-[#134E3A] tracking-tight">
                  Stage 02 — Constraint-Aware Clustering
                </h3>
                <p className="text-[13.5px] text-[#374151] leading-[1.6]">
                  Our AI validates budget, language, and timeline across learner requests, grouping
                  compatible learners into commercially viable cohorts.
                </p>
              </div>

              <div className="lg:col-span-8">
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E8EEEA] shadow-[0_8px_28px_rgba(15,41,30,0.07)] space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#E9F5EE] text-[#165C45] flex items-center justify-center shrink-0">
                        <Layers className="w-5 h-5 stroke-[2]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-[#111827]">
                          {activeCluster?.name || 'Production LangGraph Agents & Memory Systems'}
                        </h4>
                        <p className="text-xs text-[#4B5563]">
                          {activeCluster?.summary ||
                            'Compatible requests seeking hands-on LangGraph checkpointers and tool execution.'}
                        </p>
                      </div>
                    </div>
                    {activeCluster && (
                      <span className="px-3 py-1 rounded-full bg-[#E6F3EB] text-[#134937] text-xs font-semibold shrink-0">
                        {activeCluster.member_count} Learners
                      </span>
                    )}
                  </div>

                  <div className="border-t border-[#EDF1EE] pt-3 flex flex-wrap items-center gap-2.5 text-xs">
                    <span className="px-2.5 py-1 rounded-full bg-[#E6F3EB] text-[#134937] font-semibold">
                      Budget ≤ $40 Verified
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#E6F3EB] text-[#134937] font-semibold">
                      Language: English
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#E6F3EB] text-[#134937] font-semibold">
                      Schedule: Weekend Cohort
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stage 03 — Offer Creation */}
          {selectedStage === 3 && (
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              <div className="lg:col-span-4 space-y-2.5">
                <h3 className="text-xl sm:text-[22px] font-serif font-bold text-[#134E3A] tracking-tight">
                  Stage 03 — Calibrated Workshop Offer
                </h3>
                <p className="text-[13.5px] text-[#374151] leading-[1.6]">
                  Instructors review demand evidence, refine the syllabus, calibrate pricing within
                  verified learner budgets, and publish the live workshop.
                </p>
              </div>

              <div className="lg:col-span-8">
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E8EEEA] shadow-[0_8px_28px_rgba(15,41,30,0.07)] space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-base sm:text-lg text-[#111827]">
                        {activeWorkshop?.title || 'LangGraph Agents in Practice'}
                      </h4>
                      <p className="text-xs text-[#4B5563] mt-0.5">
                        {activeWorkshop
                          ? `${activeWorkshop.duration_hours}h Live Hands-on · ${activeWorkshop.difficulty}`
                          : '2h Live Hands-on · Intermediate'}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#E6F3EB] text-[#134937] text-sm font-bold shrink-0">
                      $
                      {activeWorkshop
                        ? (activeWorkshop.price_cents / 100).toFixed(0)
                        : '39'}
                    </span>
                  </div>

                  <div className="border-t border-[#EDF1EE] pt-3 flex flex-wrap items-center gap-2.5 text-xs">
                    <span className="px-2.5 py-1 rounded-full bg-[#E6F3EB] text-[#134937] font-semibold">
                      Topic Match Confirmed
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#E6F3EB] text-[#134937] font-semibold">
                      Within ≤ $40 Cohort Budget
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#E6F3EB] text-[#134937] font-semibold">
                      Published to Marketplace
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stage 04 — Transaction */}
          {selectedStage === 4 && (
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              <div className="lg:col-span-4 space-y-2.5">
                <h3 className="text-xl sm:text-[22px] font-serif font-bold text-[#134E3A] tracking-tight">
                  Stage 04 — PayPal Orders v2 Checkout
                </h3>
                <p className="text-[13.5px] text-[#374151] leading-[1.6]">
                  Authoritative server-side pricing applies eligible merchant-funded rewards and
                  completes seat reservation through PayPal Sandbox Orders v2.
                </p>
              </div>

              <div className="lg:col-span-8">
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E8EEEA] shadow-[0_8px_28px_rgba(15,41,30,0.07)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <PayPalOfficialLogo className="h-6 w-auto" />
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E6F3EB] text-[#134937] text-xs font-semibold">
                        Orders v2 Sandbox
                      </span>
                    </div>
                    <p className="text-xs text-[#4B5563]">
                      Server-verified capture with atomic seat reservation and reward deduction.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#E6F3EB] text-[#134937] text-xs font-bold shrink-0">
                    <span className="w-5 h-5 rounded-full bg-[#156947] text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                    <span>Verified Checkout</span>
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
