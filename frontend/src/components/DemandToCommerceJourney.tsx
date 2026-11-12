import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Check,
  User,
  Tag,
  Globe,
  Calendar,
  Layers,
  Target,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { DemandCluster, Workshop } from '../types';
import { api } from '../api/client';
import { PayPalOfficialLogo } from './HeroVisualization';
import stage1LearnerImg from '../assets/stage1-male-learner.png';
import stage3InstructorImg from '../assets/stage3-male-instructor.png';

interface Props {
  clusters?: DemandCluster[];
  workshops?: Workshop[];
  externalStage?: { stage: 1 | 2 | 3 | 4; seq: number } | null;
}

interface DemandExample {
  id: string;
  label: string;
  learner: string;
  prompt: string;
  budgetLabel: string;
  language: string;
  schedule: string;
  categoryMatch: string;
  clusterFallbackTitle: string;
  clusterFallbackSummary: string;
  offerFallbackTitle: string;
  offerFallbackMeta: string;
  offerFallbackPrice: string;
}

const DEMAND_EXAMPLES: DemandExample[] = [
  {
    id: 'langgraph',
    label: 'LangGraph Agents',
    learner: 'Alex K.',
    prompt:
      'I want to learn LangGraph with PostgreSQL checkpointers and real tools for under $40 this weekend in English.',
    budgetLabel: '≤ $40',
    language: 'English',
    schedule: 'This weekend',
    categoryMatch: 'LangGraph Agents',
    clusterFallbackTitle: 'Production LangGraph Agents & Memory Systems',
    clusterFallbackSummary:
      'Compatible requests seeking hands-on LangGraph checkpointers and tool execution.',
    offerFallbackTitle: 'LangGraph Agents in Practice',
    offerFallbackMeta: '2h Live Hands-on · Intermediate',
    offerFallbackPrice: '39',
  },
  {
    id: 'mlops',
    label: 'Production MLOps',
    learner: 'Sophia M.',
    prompt:
      'Looking for an advanced hands-on MLOps workshop covering FastAPI model serving, drift monitoring, and automated retraining under $65 in English.',
    budgetLabel: '≤ $65',
    language: 'English',
    schedule: 'Evening / Weekend',
    categoryMatch: 'MLOps',
    clusterFallbackTitle: 'Production MLOps: Serving & Drift Retraining',
    clusterFallbackSummary:
      'Practitioner cohort aligned on model observability, FastAPI serving, and retraining pipelines.',
    offerFallbackTitle: 'Production MLOps: Serving, Monitoring & Automated Retraining',
    offerFallbackMeta: '3h Live Hands-on · Advanced',
    offerFallbackPrice: '55',
  },
  {
    id: 'fullstack',
    label: 'React + FastAPI + PayPal',
    learner: 'Marcus T.',
    prompt:
      'I need a practical workshop building a React and FastAPI AI app with verified PayPal Sandbox checkout under $35 this weekend.',
    budgetLabel: '≤ $35',
    language: 'English',
    schedule: 'This weekend',
    categoryMatch: 'React + FastAPI',
    clusterFallbackTitle: 'Full-Stack AI Commerce with React, FastAPI & PayPal',
    clusterFallbackSummary:
      'Validated requests for end-to-end AI apps with server-authoritative PayPal Orders v2.',
    offerFallbackTitle: 'Full-Stack AI Apps with React, FastAPI & PayPal Checkout',
    offerFallbackMeta: '2h Live Hands-on · Beginner-Intermediate',
    offerFallbackPrice: '29',
  },
];

/* --- Card 1 Visual: 3D Male Learner + Organic Mint Wave + Floating Prompt Speech Bubble --- */
const LearnerIntentVisual: React.FC = () => (
  <div className="relative w-full h-[104px] flex items-end justify-start overflow-visible">
    <img
      src={stage1LearnerImg}
      alt="Learner expressing intent"
      className="h-[104px] w-auto object-contain select-none -ml-1"
    />

    {/* Floating Request Speech Bubble on Top-Right */}
    <motion.div
      animate={{ y: [0, -3.5, 0] }}
      transition={{ repeat: Infinity, duration: 3.6, ease: 'easeInOut' }}
      className="absolute right-0 top-2 z-10 w-[88px] rounded-[10px] bg-white border border-[#DCE8E1] shadow-[0_4px_12px_rgba(16,42,31,0.08)] px-3 py-2.5 space-y-1.5"
    >
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
    </motion.div>
  </div>
);

/* --- Card 2 Visual: Crisp AI Microchip + Topic / Constraints / Budget Pills --- */
const AIUnderstandingVisual: React.FC = () => (
  <div className="relative w-full h-[104px] flex items-center justify-between gap-2.5">
    {/* AI Microchip with Soft Mint Wave Glow */}
    <div className="relative w-[82px] h-[86px] flex items-center justify-center shrink-0">
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.75, 1, 0.75] }}
        transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
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
    <motion.div
      animate={{ y: [0, -3.5, 0] }}
      transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 0.5 }}
      className="relative z-10 flex flex-col gap-1.5 flex-1 min-w-0"
    >
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
    </motion.div>
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
    <motion.div
      animate={{ y: [0, -3, 0] }}
      transition={{ repeat: Infinity, duration: 3.8, ease: 'easeInOut', delay: 1 }}
      className="relative z-10 w-full bg-white rounded-xl border border-[#E7EEEA] shadow-[0_6px_20px_rgba(15,41,30,0.06)] px-3.5 py-3 flex items-center justify-between gap-2"
    >
      <PayPalOfficialLogo className="h-[22px] w-auto shrink-0" />
      <span className="px-2.5 py-0.5 rounded-full bg-[#E6F3EB] text-[#14533C] text-[11px] font-semibold whitespace-nowrap">
        Orders v2
      </span>

      {/* Overlapping Checkmark Circle on Bottom-Right */}
      <div className="absolute -bottom-3 right-2.5 w-7 h-7 rounded-full bg-[#156947] text-white flex items-center justify-center shadow-md ring-2 ring-white">
        <Check className="w-3.5 h-3.5 stroke-[3]" />
      </div>
    </motion.div>
  </div>
);

export const DemandToCommerceJourney: React.FC<Props> = ({
  clusters = [],
  workshops = [],
  externalStage = null,
}) => {
  const [selectedStage, setSelectedStage] = useState<1 | 2 | 3 | 4>(1);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [exampleIdx, setExampleIdx] = useState(0);
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<Record<string, any> | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);

  useEffect(() => {
    if (externalStage) {
      setSelectedStage(externalStage.stage);
      setHasInteracted(true);
    }
  }, [externalStage]);

  const activeExample = DEMAND_EXAMPLES[exampleIdx] || DEMAND_EXAMPLES[0];

  const activeCluster =
    clusters.find((c) =>
      c.topic.toLowerCase().includes(activeExample.id === 'langgraph' ? 'langgraph' : activeExample.id)
    ) || (exampleIdx === 0 && clusters.length > 0 ? clusters[0] : null);

  const matchedWorkshop =
    workshops.find(
      (w) => w.category === activeExample.categoryMatch && !w.id.startsWith('fallback-')
    ) ||
    (exampleIdx === 0 && workshops.length > 0 ? workshops[0] : null);

  const reservationUrl =
    matchedWorkshop && !matchedWorkshop.id.startsWith('fallback-')
      ? `/workshops/${matchedWorkshop.id}`
      : '/workshops';

  const handleStageSelect = (stage: 1 | 2 | 3 | 4) => {
    setSelectedStage(stage);
    setHasInteracted(true);
  };

  const handleStageKeyDown = (e: React.KeyboardEvent, current: 1 | 2 | 3 | 4) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = (current === 4 ? 1 : (current + 1)) as 1 | 2 | 3 | 4;
      handleStageSelect(next);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = (current === 1 ? 4 : (current - 1)) as 1 | 2 | 3 | 4;
      handleStageSelect(prev);
    }
  };

  const handleExampleChange = (idx: number) => {
    setExampleIdx(idx);
    setHasInteracted(true);
    setExtractedData(null);
    setExtractError(null);
  };

  const handleLiveExtract = async () => {
    if (extracting) return;
    setExtracting(true);
    setExtractError(null);
    try {
      const res = await api.extractDemand(activeExample.prompt);
      setExtractedData(res);
    } catch (err: any) {
      setExtractError(err?.message || 'AI extraction service temporarily unavailable.');
    } finally {
      setExtracting(false);
    }
  };

  const stageCardClasses = (stageNum: 1 | 2 | 3 | 4) =>
    `nv-card-lift flex-1 text-left bg-white rounded-2xl p-5 border shadow-[0_6px_22px_rgba(15,41,30,0.05)] hover:shadow-[0_10px_28px_rgba(15,41,30,0.08)] transition-all cursor-pointer flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#165C45] ${
      hasInteracted && selectedStage === stageNum
        ? 'border-[#BFE0CD] ring-2 ring-[#165C45]/25'
        : 'border-[#E5ECE7]'
    }`;

  return (
    <section
      id="marketplace-journey"
      tabIndex={-1}
      className="relative py-16 md:py-20 bg-[#F8FAF8] text-[#111827] overflow-hidden scroll-mt-20 focus:outline-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ========================================================= */}
        {/* Section Header                                            */}
        {/* ========================================================= */}
        <div className="text-center max-w-4xl mx-auto mb-12 space-y-3.5">
          <span className="text-xs font-bold uppercase tracking-widest text-[#14533c]">HOW THE MARKETPLACE WORKS</span>

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
          <motion.button
            type="button"
            aria-pressed={selectedStage === 1}
            onClick={() => handleStageSelect(1)}
            onKeyDown={(e) => handleStageKeyDown(e, 1)}
            whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
            whileTap={{ scale: 0.985 }}
            className={`relative ${stageCardClasses(1)}`}
          >
            {hasInteracted && selectedStage === 1 && (
              <motion.div
                layoutId="activeStageGlow"
                className="absolute inset-0 rounded-2xl border-2 border-[#165C45] pointer-events-none"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <div className="mb-3">
              <LearnerIntentVisual />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-[15.5px] text-[#111827]">1. Learner Intent</h3>
              <p className="text-[12.5px] text-[#4B5563] leading-[1.45]">
                A real, free-form request written in natural language.
              </p>
            </div>
          </motion.button>

          {/* Arrow 1 -> 2 */}
          <div className="hidden lg:flex items-center justify-center px-2.5 shrink-0">
            <ArrowRight className="w-4 h-4 text-[#165C45] stroke-[1.8]" />
          </div>

          {/* Card 2 */}
          <motion.button
            type="button"
            aria-pressed={selectedStage === 2}
            onClick={() => handleStageSelect(2)}
            onKeyDown={(e) => handleStageKeyDown(e, 2)}
            whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
            whileTap={{ scale: 0.985 }}
            className={`relative ${stageCardClasses(2)}`}
          >
            {hasInteracted && selectedStage === 2 && (
              <motion.div
                layoutId="activeStageGlow"
                className="absolute inset-0 rounded-2xl border-2 border-[#165C45] pointer-events-none"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <div className="mb-3">
              <AIUnderstandingVisual />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-[15.5px] text-[#111827]">2. AI Understanding</h3>
              <p className="text-[12.5px] text-[#4B5563] leading-[1.45]">
                Parse the request, extract constraints, and identify opportunities.
              </p>
            </div>
          </motion.button>

          {/* Arrow 2 -> 3 */}
          <div className="hidden lg:flex items-center justify-center px-2.5 shrink-0">
            <ArrowRight className="w-4 h-4 text-[#165C45] stroke-[1.8]" />
          </div>

          {/* Card 3 */}
          <motion.button
            type="button"
            aria-pressed={selectedStage === 3}
            onClick={() => handleStageSelect(3)}
            onKeyDown={(e) => handleStageKeyDown(e, 3)}
            whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
            whileTap={{ scale: 0.985 }}
            className={`relative ${stageCardClasses(3)}`}
          >
            {hasInteracted && selectedStage === 3 && (
              <motion.div
                layoutId="activeStageGlow"
                className="absolute inset-0 rounded-2xl border-2 border-[#165C45] pointer-events-none"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <div className="mb-3">
              <OfferCreationVisual />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-[15.5px] text-[#111827]">3. Offer Creation</h3>
              <p className="text-[12.5px] text-[#4B5563] leading-[1.45]">
                Instructors review the demand, shape a workshop, and publish an offer.
              </p>
            </div>
          </motion.button>

          {/* Arrow 3 -> 4 */}
          <div className="hidden lg:flex items-center justify-center px-2.5 shrink-0">
            <ArrowRight className="w-4 h-4 text-[#165C45] stroke-[1.8]" />
          </div>

          {/* Card 4 */}
          <motion.button
            type="button"
            aria-pressed={selectedStage === 4}
            onClick={() => handleStageSelect(4)}
            onKeyDown={(e) => handleStageKeyDown(e, 4)}
            whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
            whileTap={{ scale: 0.985 }}
            className={`relative ${stageCardClasses(4)}`}
          >
            {hasInteracted && selectedStage === 4 && (
              <motion.div
                layoutId="activeStageGlow"
                className="absolute inset-0 rounded-2xl border-2 border-[#165C45] pointer-events-none"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <div className="mb-3">
              <TransactionVisual />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-[15.5px] text-[#111827]">4. Transaction</h3>
              <p className="text-[12.5px] text-[#4B5563] leading-[1.45]">
                Learners reserve and pay securely via PayPal Orders v2.
              </p>
            </div>
          </motion.button>
        </div>

        {/* ========================================================= */}
        {/* Bottom Stage Showcase Card                                */}
        {/* ========================================================= */}
        <div
          aria-live="polite"
          className="relative rounded-2xl bg-[#FAFBF9] border border-[#E5ECE7] p-6 sm:p-8 shadow-[0_6px_24px_rgba(15,41,30,0.04)] overflow-hidden"
        >
          {/* Curved Mint Wave Backdrop on Right Side */}
          <div
            className="hidden lg:block absolute -top-8 -bottom-8 left-[33%] right-0 pointer-events-none rounded-l-[180px]"
            style={{
              background:
                'linear-gradient(90deg, rgba(221, 241, 229, 0.72) 0%, rgba(232, 246, 237, 0.45) 55%, rgba(250, 251, 249, 0.1) 100%)',
            }}
          />

          {/* Interactive Example Switcher (shown after user selects any stage) */}
          {hasInteracted && (
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-[#E5ECE7]">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#4B5563] mr-1">
                  Demand Example:
                </span>
                {DEMAND_EXAMPLES.map((ex, idx) => (
                  <motion.button
                    key={ex.id}
                    type="button"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleExampleChange(idx)}
                    className={`relative px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                      exampleIdx === idx
                        ? 'text-white'
                        : 'bg-white border border-[#DCE8E1] text-[#374151] hover:bg-[#EAF5EE]'
                    }`}
                  >
                    {exampleIdx === idx && (
                      <motion.div
                        layoutId="activeExamplePill"
                        className="absolute inset-0 rounded-full bg-[#14533C] -z-10"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      />
                    )}
                    {ex.label}
                  </motion.button>
                ))}
              </div>
              <span className="text-[11px] font-mono text-[#14533C] font-semibold">
                Stage 0{selectedStage} / 04
              </span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* Stage 01 — Expressed Customer Need */}
            {selectedStage === 1 && (
              <motion.div
                key={`stage-1-${activeExample.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center"
              >
              <div className="lg:col-span-4 space-y-2.5">
                <h3 className="text-xl sm:text-[22px] font-serif font-bold text-[#134E3A] tracking-tight">
                  Stage 01 — Expressed Customer Need
                </h3>
                <p className="text-[13.5px] text-[#374151] leading-[1.6]">
                  A real example of learner demand captured on NUVENDRY. The request is written in
                  the learner&apos;s own words and already includes key purchasing constraints.
                </p>
                {hasInteracted && (
                  <div className="pt-1 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStageSelect(2)}
                      className="nv-btn-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14533C] hover:bg-[#0E3C2B] text-white text-xs font-semibold"
                    >
                      <span>Inspect AI Extraction</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <Link
                      to="/demand"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-[#DCE8E1] text-[#14533C] text-xs font-semibold hover:bg-[#F2F8F4]"
                    >
                      <span>Submit Your Own</span>
                    </Link>
                  </div>
                )}
              </div>

              <div className="lg:col-span-8">
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E8EEEA] shadow-[0_8px_28px_rgba(15,41,30,0.07)]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#E9F5EE] text-[#165C45] flex items-center justify-center shrink-0">
                      <User className="w-6 h-6 stroke-[1.9]" />
                    </div>
                    <p className="text-[15.5px] sm:text-[18px] font-semibold text-[#111827] leading-[1.38]">
                      “{activeExample.prompt}”
                    </p>
                  </div>

                  <div className="border-t border-[#EDF1EE] my-4" />

                  <div className="flex flex-wrap xl:flex-nowrap items-center justify-between gap-y-2 gap-x-3 text-xs">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <User className="w-3.5 h-3.5 text-[#165C45] stroke-[2]" />
                      <span className="text-[#4B5563]">Learner</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E6F3EB] text-[#134937] font-semibold">
                        {activeExample.learner}
                      </span>
                    </div>

                    <div className="hidden sm:block h-4 w-px bg-[#E2E8E4]" />

                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <Tag className="w-3.5 h-3.5 text-[#165C45] stroke-[2]" />
                      <span className="text-[#4B5563]">Budget</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E6F3EB] text-[#134937] font-bold">
                        {activeExample.budgetLabel}
                      </span>
                    </div>

                    <div className="hidden sm:block h-4 w-px bg-[#E2E8E4]" />

                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <Globe className="w-3.5 h-3.5 text-[#165C45] stroke-[2]" />
                      <span className="text-[#4B5563]">Language</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E6F3EB] text-[#134937] font-semibold">
                        {activeExample.language}
                      </span>
                    </div>

                    <div className="hidden sm:block h-4 w-px bg-[#E2E8E4]" />

                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <Calendar className="w-3.5 h-3.5 text-[#165C45] stroke-[2]" />
                      <span className="text-[#4B5563]">Schedule</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E6F3EB] text-[#134937] font-semibold">
                        {activeExample.schedule}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stage 02 — Constraint-Aware Clustering */}
          {selectedStage === 2 && (
            <motion.div
              key={`stage-2-${activeExample.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center"
            >
              <div className="lg:col-span-4 space-y-2.5">
                <h3 className="text-xl sm:text-[22px] font-serif font-bold text-[#134E3A] tracking-tight">
                  Stage 02 — Constraint-Aware Clustering
                </h3>
                <p className="text-[13.5px] text-[#374151] leading-[1.6]">
                  Our AI validates budget, language, and timeline across learner requests, grouping
                  compatible learners into commercially viable cohorts.
                </p>
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={extracting}
                    onClick={handleLiveExtract}
                    className="nv-btn-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14533C] hover:bg-[#0E3C2B] disabled:opacity-60 text-white text-xs font-semibold"
                  >
                    {extracting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Extracting via Backend AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{extractedData ? 'Re-Run Live AI Extraction' : 'Run Live AI Extraction'}</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStageSelect(3)}
                    className="nv-btn-press inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-[#DCE8E1] text-[#14533C] text-xs font-semibold hover:bg-[#F2F8F4]"
                  >
                    <span>Next: Offer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
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
                          {activeCluster?.name || activeExample.clusterFallbackTitle}
                        </h4>
                        <p className="text-xs text-[#4B5563]">
                          {activeCluster?.summary || activeExample.clusterFallbackSummary}
                        </p>
                      </div>
                    </div>
                    {activeCluster && (
                      <span className="px-3 py-1 rounded-full bg-[#E6F3EB] text-[#134937] text-xs font-semibold shrink-0">
                        {activeCluster.member_count} Learners
                      </span>
                    )}
                  </div>

                  {extractError && (
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                      {extractError}
                    </div>
                  )}

                  {extractedData && (
                    <div className="p-3 rounded-xl bg-[#F4FBF7] border border-[#CDE5D6] space-y-2 text-xs">
                      <div className="flex items-center justify-between font-semibold text-[#134937]">
                        <span>Live FastAPI AI Extraction Result</span>
                        <span className="font-mono">
                          Confidence: {((extractedData.confidence_score || 0.9) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[#1F2937]">
                        <span className="px-2 py-0.5 rounded bg-white border border-[#DCE8E1]">
                          Topic: <strong>{extractedData.topic}</strong>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white border border-[#DCE8E1]">
                          Max Budget: <strong>${((extractedData.max_budget_cents || 4000) / 100).toFixed(0)}</strong>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white border border-[#DCE8E1]">
                          Level: <strong>{extractedData.preferred_difficulty}</strong>
                        </span>
                        {Array.isArray(extractedData.related_skills) &&
                          extractedData.related_skills.slice(0, 3).map((s: string) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded bg-[#E6F3EB] text-[#134937] font-medium"
                            >
                              {s}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-[#EDF1EE] pt-3 flex flex-wrap items-center gap-2.5 text-xs">
                    <span className="px-2.5 py-1 rounded-full bg-[#E6F3EB] text-[#134937] font-semibold">
                      Budget {activeExample.budgetLabel} Verified
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#E6F3EB] text-[#134937] font-semibold">
                      Language: {activeExample.language}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#E6F3EB] text-[#134937] font-semibold">
                      Schedule: {activeExample.schedule}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stage 03 — Offer Creation */}
          {selectedStage === 3 && (
            <motion.div
              key={`stage-3-${activeExample.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center"
            >
              <div className="lg:col-span-4 space-y-2.5">
                <h3 className="text-xl sm:text-[22px] font-serif font-bold text-[#134E3A] tracking-tight">
                  Stage 03 — Calibrated Workshop Offer
                </h3>
                <p className="text-[13.5px] text-[#374151] leading-[1.6]">
                  Instructors review demand evidence, refine the syllabus, calibrate pricing within
                  verified learner budgets, and publish the live workshop.
                </p>
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <Link
                    to={reservationUrl}
                    className="nv-btn-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14533C] hover:bg-[#0E3C2B] text-white text-xs font-semibold"
                  >
                    <span>View Approved Offer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleStageSelect(4)}
                    className="nv-btn-press inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-[#DCE8E1] text-[#14533C] text-xs font-semibold hover:bg-[#F2F8F4]"
                  >
                    <span>Next: Checkout</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-8">
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E8EEEA] shadow-[0_8px_28px_rgba(15,41,30,0.07)] space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-base sm:text-lg text-[#111827]">
                        {matchedWorkshop?.title || activeExample.offerFallbackTitle}
                      </h4>
                      <p className="text-xs text-[#4B5563] mt-0.5">
                        {matchedWorkshop
                          ? `${matchedWorkshop.duration_hours}h Live Hands-on · ${matchedWorkshop.difficulty} · ${matchedWorkshop.remaining_seats}/${matchedWorkshop.total_seats} seats open`
                          : activeExample.offerFallbackMeta}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#E6F3EB] text-[#134937] text-sm font-bold shrink-0">
                      $
                      {matchedWorkshop
                        ? (matchedWorkshop.price_cents / 100).toFixed(0)
                        : activeExample.offerFallbackPrice}
                    </span>
                  </div>

                  <div className="border-t border-[#EDF1EE] pt-3 flex flex-wrap items-center gap-2.5 text-xs">
                    <span className="px-2.5 py-1 rounded-full bg-[#E6F3EB] text-[#134937] font-semibold">
                      Topic Match Confirmed
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#E6F3EB] text-[#134937] font-semibold">
                      Within {activeExample.budgetLabel} Cohort Budget
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#E6F3EB] text-[#134937] font-semibold">
                      Published to Marketplace
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stage 04 — Transaction */}
          {selectedStage === 4 && (
            <motion.div
              key={`stage-4-${activeExample.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center"
            >
              <div className="lg:col-span-4 space-y-2.5">
                <h3 className="text-xl sm:text-[22px] font-serif font-bold text-[#134E3A] tracking-tight">
                  Stage 04 — PayPal Orders v2 Checkout
                </h3>
                <p className="text-[13.5px] text-[#374151] leading-[1.6]">
                  Authoritative server-side pricing applies eligible merchant-funded rewards and
                  completes seat reservation through PayPal Sandbox Orders v2.
                </p>
                <div className="pt-1">
                  <Link
                    to={reservationUrl}
                    className="nv-btn-press inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#14533C] hover:bg-[#0E3C2B] text-white text-xs font-semibold shadow-xs"
                  >
                    <span>Go to Genuine Reservation Flow</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
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
                      Server-verified capture with atomic seat reservation and reward deduction
                      {matchedWorkshop ? ` for “${matchedWorkshop.title}”` : ''}.
                    </p>
                  </div>
                  <Link
                    to={reservationUrl}
                    className="nv-btn-press inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#E6F3EB] hover:bg-[#D6ECDF] text-[#134937] text-xs font-bold shrink-0 transition-colors"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#156947] text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                    <span>Verified Checkout</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default DemandToCommerceJourney;
