import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Layers,
  CheckCircle2,
  LayoutGrid,
  FileText,
  Target,
  Compass,
  Info,
  Users,
  Banknote,
  BarChart2,
  Flame,
  ArrowRight,
  Box,
  Code2,
  Coins,
  FlaskConical,
  Check,
} from 'lucide-react';
import { DemandCluster } from '../types';
import demandHeaderLaptopImg from '../assets/demand-header-laptop.png';
import demandOpportunityLaptopImg from '../assets/demand-opportunity-laptop.jpg';
import workshopMlopsImg from '../assets/workshop-mlops.jpg';
import workshopFullstackImg from '../assets/workshop-fullstack.jpg';

interface Props {
  clusters?: DemandCluster[];
}

interface OpportunityItem {
  id: string;
  title: string;
  requestsLabel: string;
  budgetRange: string;
  matchLabel: string;
  demandScore: number;
  iconBg: string;
  iconColor: string;
  iconType: 'layers' | 'box' | 'code';
  thumbnail: string;
  overviewSummary: string;
  qualifiedLearners: number;
  avgBudgetDollars: string;
  deliveryModel: string;
  validationNote: string;
}

const DEMAND_TOPICS = [
  { label: 'AI Agents', count: 38, widthPct: 82, color: '#156847' },
  { label: 'MLOps', count: 24, widthPct: 52, color: '#388E6C' },
  { label: 'Full-Stack', count: 20, widthPct: 43, color: '#67B596' },
  { label: 'Data Engineering', count: 16, widthPct: 35, color: '#A3D7C1' },
  { label: 'Others', count: 9, widthPct: 19, color: '#CBE8DA' },
];

export const DemandIntelligencePreview: React.FC<Props> = ({ clusters = [] }) => {
  const navigate = useNavigate();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [hasSwitched, setHasSwitched] = useState(false);

  const handleSelectOpp = (idx: number) => {
    setSelectedIdx(idx);
    setHasSwitched(true);
  };

  const primaryCluster = clusters.length > 0 ? clusters[0] : null;

  const opportunities: OpportunityItem[] = [
    {
      id: primaryCluster?.id || 'opp-langgraph',
      title: 'Production LangGraph Agents & Memory Systems',
      requestsLabel: `${primaryCluster?.member_count || 2} requests`,
      budgetRange: '$35 – $50',
      matchLabel: 'High match (0.91)',
      demandScore: 91,
      iconBg: 'bg-[#E8F6EE]',
      iconColor: 'text-[#156847]',
      iconType: 'layers',
      thumbnail: demandOpportunityLaptopImg,
      overviewSummary:
        'High-intent demand for building production-grade LangGraph agents with persistent memory, tools, and deployment patterns.',
      qualifiedLearners: primaryCluster?.member_count || 2,
      avgBudgetDollars: primaryCluster
        ? (primaryCluster.avg_budget_cents / 100).toFixed(2)
        : '42.50',
      deliveryModel: 'Intermediate Lab',
      validationNote:
        'The algorithm validates pairwise budget constraints and schedule compatibility (e.g., 2 learners, overlapping availability, target $35 – $50).',
    },
    {
      id: 'opp-mlops',
      title: 'MLOps for Real Projects',
      requestsLabel: '16 requests',
      budgetRange: '$50 – $90',
      matchLabel: 'Match (0.87)',
      demandScore: 87,
      iconBg: 'bg-[#F3EEFF]',
      iconColor: 'text-[#7C3AED]',
      iconType: 'box',
      thumbnail: workshopMlopsImg,
      overviewSummary:
        'Strong practitioner demand for end-to-end ML model serving, observability dashboards, drift detection, and automated retraining pipelines.',
      qualifiedLearners: 16,
      avgBudgetDollars: '64.00',
      deliveryModel: 'Advanced Lab',
      validationNote:
        'The algorithm validates pairwise budget constraints and schedule compatibility (e.g., 16 learners, weekend cohort alignment, target $50 – $90).',
    },
    {
      id: 'opp-react-paypal',
      title: 'React + PayPal Workshops',
      requestsLabel: '6 requests',
      budgetRange: '$29 – $49',
      matchLabel: 'Match (0.83)',
      demandScore: 83,
      iconBg: 'bg-[#EAF4FF]',
      iconColor: 'text-[#2563EB]',
      iconType: 'code',
      thumbnail: workshopFullstackImg,
      overviewSummary:
        'Focused full-stack cohort seeking practical React + FastAPI integration with authoritative server-side pricing and PayPal Orders v2 checkout.',
      qualifiedLearners: 6,
      avgBudgetDollars: '36.00',
      deliveryModel: 'Hands-on Lab',
      validationNote:
        'The algorithm validates pairwise budget constraints and schedule compatibility (e.g., 6 learners, English delivery, target $29 – $49).',
    },
  ];

  const activeOpp = opportunities[selectedIdx] || opportunities[0];
  const activeClusterCount = Math.max(clusters.length, 2);

  const renderOppIcon = (item: OpportunityItem) => {
    if (item.iconType === 'box') {
      return <Box className="w-5 h-5 stroke-[1.9]" />;
    }
    if (item.iconType === 'code') {
      return <Code2 className="w-5 h-5 stroke-[2]" />;
    }
    return <Layers className="w-5 h-5 stroke-[1.9]" />;
  };

  return (
    <section
      id="ai-demand"
      tabIndex={-1}
      className="relative py-16 md:py-20 bg-[#F8FAF8] text-[#111827] overflow-hidden border-t border-[#EBF0EC] scroll-mt-20 focus:outline-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ========================================================= */}
        {/* BAND 1: Section Header + Right Laptop & Floating Pills    */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-8">
          {/* Left Title & Description */}
          <div className="lg:col-span-7 space-y-3.5">
            <span className="text-xs font-bold uppercase tracking-widest text-[#14533c]">AI DEMAND INTELLIGENCE</span>

            <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-serif font-medium text-[#111827] tracking-tight leading-[1.12]">
              AI Demand Intelligence{' '}
              <span className="italic font-normal text-[#165C45]">Preview</span>
            </h2>

            <p className="text-sm sm:text-[15px] text-[#374151] max-w-2xl leading-[1.58]">
              Parse fragmented learner prompts, validate constraints, and organize viable commercial
              opportunities for instructors with clear demand, budget, and delivery signals.
            </p>
          </div>

          {/* Right Laptop Cutout + Organic Mint Wave + 3 Floating Pills */}
          <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end min-h-[175px]">
            {/* Organic Two-Tone Mint Wave Backdrop */}
            <svg
              viewBox="0 0 460 210"
              className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M52 175 C28 130, 56 54, 136 36 C202 20, 258 42, 316 32 C382 20, 442 58, 444 122 C446 168, 408 192, 344 192 L96 192 C66 192, 60 186, 52 175 Z"
                fill="#E3F4EB"
                opacity="0.85"
              />
              <path
                d="M92 178 C78 140, 108 74, 182 62 C246 52, 294 74, 348 66 C394 60, 424 92, 420 140 C417 174, 386 190, 332 190 L124 190 C102 190, 97 186, 92 178 Z"
                fill="#D4EEE0"
                opacity="0.55"
              />
            </svg>

            <div className="relative z-10 flex items-center justify-center gap-1 sm:gap-2">
              <img
                src={demandHeaderLaptopImg}
                alt="AI Demand Parsing Studio"
                className="w-[215px] sm:w-[248px] h-auto object-contain select-none drop-shadow-[0_10px_18px_rgba(15,41,30,0.08)]"
              />

              {/* 3 Staggered Floating White Capability Pills */}
              <div className="flex flex-col gap-2.5 -ml-3 sm:-ml-2">
                <motion.div
                  animate={{ y: [0, -3.5, 0] }}
                  transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
                  whileHover={{ scale: 1.04 }}
                  className="ml-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E4EDE7] shadow-[0_4px_14px_rgba(15,41,30,0.07)] text-[12px] font-semibold text-[#1F2937] whitespace-nowrap"
                >
                  <Layers className="w-3.5 h-3.5 text-[#156847] stroke-[2] shrink-0" />
                  <span>Parse Prompts</span>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut', delay: 0.3 }}
                  whileHover={{ scale: 1.04 }}
                  className="-ml-1 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E4EDE7] shadow-[0_4px_14px_rgba(15,41,30,0.07)] text-[12px] font-semibold text-[#1F2937] whitespace-nowrap"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#156847] stroke-[2] shrink-0" />
                  <span>Validate Constraints</span>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -3.5, 0] }}
                  transition={{ repeat: Infinity, duration: 3.4, ease: 'easeInOut', delay: 0.6 }}
                  whileHover={{ scale: 1.04 }}
                  className="ml-1 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E4EDE7] shadow-[0_4px_14px_rgba(15,41,30,0.07)] text-[12px] font-semibold text-[#1F2937] whitespace-nowrap"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-[#156847] stroke-[2] shrink-0" />
                  <span>Organize Opportunities</span>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BAND 2: 4 KPI Summary Cards                               */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {/* KPI 1: Total Requests */}
          <motion.div
            whileHover={{ y: -3, transition: { type: 'spring', stiffness: 450, damping: 25 } }}
            className="bg-white rounded-2xl border border-[#E6EDE8] px-5 py-4 shadow-[0_4px_18px_rgba(15,41,30,0.04)] flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#EEF5FF] text-[#2563EB] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 stroke-[1.9]" />
              </div>
              <div>
                <div className="flex items-center gap-1 text-[12.5px] font-medium text-[#374151]">
                  <span>Total Requests</span>
                  <Info className="w-3.5 h-3.5 text-[#9CA3AF]" />
                </div>
                <div className="text-[28px] leading-tight font-extrabold text-[#111827] tracking-tight mt-0.5">
                  42
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#E6F4EC] text-[#156947] text-[11px] font-bold">
                ↑ +16%
              </span>
              <span className="text-[10.5px] text-[#6B7280] mt-1">vs. prior 14 days</span>
            </div>
          </motion.div>

          {/* KPI 2: Active Clusters */}
          <motion.div
            whileHover={{ y: -3, transition: { type: 'spring', stiffness: 450, damping: 25 } }}
            className="bg-white rounded-2xl border border-[#E6EDE8] px-5 py-4 shadow-[0_4px_18px_rgba(15,41,30,0.04)] flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#FEF7E6] text-[#D99B26] flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5 stroke-[1.9]" />
              </div>
              <div>
                <div className="flex items-center gap-1 text-[12.5px] font-medium text-[#374151]">
                  <span>Active Clusters</span>
                  <Info className="w-3.5 h-3.5 text-[#9CA3AF]" />
                </div>
                <div className="text-[28px] leading-tight font-extrabold text-[#111827] tracking-tight mt-0.5">
                  {activeClusterCount}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#E6F4EC] text-[#156947] text-[11px] font-bold">
                ↑ +100%
              </span>
              <span className="text-[10.5px] text-[#6B7280] mt-1">vs. prior 14 days</span>
            </div>
          </motion.div>

          {/* KPI 3: Opportunities */}
          <motion.div
            whileHover={{ y: -3, transition: { type: 'spring', stiffness: 450, damping: 25 } }}
            className="bg-white rounded-2xl border border-[#E6EDE8] px-5 py-4 shadow-[0_4px_18px_rgba(15,41,30,0.04)] flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#FFF1E6] text-[#EA7A24] flex items-center justify-center shrink-0">
                <Target className="w-5 h-5 stroke-[1.9]" />
              </div>
              <div>
                <div className="flex items-center gap-1 text-[12.5px] font-medium text-[#374151]">
                  <span>Opportunities</span>
                  <Info className="w-3.5 h-3.5 text-[#9CA3AF]" />
                </div>
                <div className="text-[28px] leading-tight font-extrabold text-[#111827] tracking-tight mt-0.5">
                  5
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#E6F4EC] text-[#156947] text-[11px] font-bold">
                ↑ +25%
              </span>
              <span className="text-[10.5px] text-[#6B7280] mt-1">vs. prior 14 days</span>
            </div>
          </motion.div>

          {/* KPI 4: Conversion Rate */}
          <motion.div
            whileHover={{ y: -3, transition: { type: 'spring', stiffness: 450, damping: 25 } }}
            className="bg-white rounded-2xl border border-[#E6EDE8] px-5 py-4 shadow-[0_4px_18px_rgba(15,41,30,0.04)] flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#E8F6EE] text-[#16794F] flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5 stroke-[1.9]" />
              </div>
              <div>
                <div className="flex items-center gap-1 text-[12.5px] font-medium text-[#374151]">
                  <span>Conversion Rate</span>
                  <Info className="w-3.5 h-3.5 text-[#9CA3AF]" />
                </div>
                <div className="text-[28px] leading-tight font-extrabold text-[#111827] tracking-tight mt-0.5">
                  34%
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#E6F4EC] text-[#156947] text-[11px] font-bold">
                ↑ +9 pp
              </span>
              <span className="text-[10.5px] text-[#6B7280] mt-1">vs. prior 14 days</span>
            </div>
          </motion.div>
        </div>

        {/* ========================================================= */}
        {/* BAND 3: Demand Topics Chart + Top Opportunities List      */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-[46fr_54fr] gap-5 mb-5 items-stretch">
          {/* Left Card: Demand Topics (Last 14 Days) */}
          <div className="bg-white rounded-2xl border border-[#E6EDE8] p-6 shadow-[0_4px_20px_rgba(15,41,30,0.04)] flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2 mb-6">
              <h3 className="font-bold text-[16px] text-[#111827]">
                Demand Topics (Last 14 Days)
              </h3>
              <span className="text-[12px] font-medium text-[#4B5563]">Total Requests: 42</span>
            </div>

            <div className="space-y-4 my-auto">
              {DEMAND_TOPICS.map((topic, tIdx) => {
                const handleTopicSelect = () => {
                  if (tIdx <= 2) {
                    handleSelectOpp(tIdx);
                  } else {
                    navigate(`/demand?topic=${encodeURIComponent(topic.label)}`);
                  }
                };
                return (
                  <div
                    key={topic.label}
                    role="button"
                    tabIndex={0}
                    onClick={handleTopicSelect}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleTopicSelect();
                      }
                    }}
                    className="group flex items-center gap-3.5 cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#156847]"
                  >
                    <span className="w-[106px] text-right text-[12.5px] font-medium text-[#1F2937] group-hover:text-[#156847] transition-colors shrink-0">
                      {topic.label}
                    </span>

                    <div className="flex-1 flex items-center gap-2.5 min-w-0">
                      <div
                        className="h-[18px] rounded-[5px] transition-all duration-300 group-hover:brightness-105"
                        style={{
                          width: `${topic.widthPct}%`,
                          backgroundColor: topic.color,
                        }}
                      />
                      <span className="text-[13px] font-bold text-[#111827] shrink-0">
                        {topic.count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Card: Top Opportunities */}
          <div className="bg-white rounded-2xl border border-[#E6EDE8] p-6 shadow-[0_4px_20px_rgba(15,41,30,0.04)] flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="font-bold text-[16px] text-[#111827]">Top Opportunities</h3>
              <span className="inline-flex items-center gap-1 text-[12px] text-[#4B5563]">
                <span>Sorted by demand score</span>
                <Info className="w-3.5 h-3.5 text-[#6B7280]" />
              </span>
            </div>

            <div className="space-y-2.5">
              {opportunities.map((opp, idx) => {
                const isSelected = selectedIdx === idx;
                return (
                  <motion.div
                    key={opp.id}
                    onClick={() => handleSelectOpp(idx)}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    whileHover={{ x: 3, transition: { type: 'spring', stiffness: 450, damping: 25 } }}
                    whileTap={{ scale: 0.99 }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectOpp(idx);
                      }
                    }}
                    className={`rounded-xl px-3.5 py-3 border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#135A3E] ${
                      isSelected
                        ? 'bg-[#F8FBF9] border-[#DCECE3] shadow-[0_2px_10px_rgba(15,41,30,0.03)]'
                        : 'bg-white border-[#EEF2EF] hover:border-[#DCE8E1] hover:bg-[#FAFDFB]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl ${opp.iconBg} ${opp.iconColor} flex items-center justify-center shrink-0`}
                      >
                        {renderOppIcon(opp)}
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-bold text-[13.5px] sm:text-[14px] text-[#111827] truncate">
                          {opp.title}
                        </h4>

                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11.5px] text-[#4B5563] mt-0.5">
                          <span className="inline-flex items-center gap-1 whitespace-nowrap">
                            <Users className="w-3.5 h-3.5 text-[#6B7280]" />
                            <span>{opp.requestsLabel}</span>
                          </span>
                          <span className="text-[#D1D5DB]">|</span>
                          <span className="inline-flex items-center gap-1 whitespace-nowrap">
                            <Banknote className="w-3.5 h-3.5 text-[#6B7280]" />
                            <span>{opp.budgetRange}</span>
                          </span>
                          <span className="text-[#D1D5DB]">|</span>
                          <span className="inline-flex items-center gap-1 whitespace-nowrap">
                            <BarChart2 className="w-3.5 h-3.5 text-[#6B7280]" />
                            <span>{opp.matchLabel}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E6F4EC] text-[#14533C] text-[11.5px] font-semibold whitespace-nowrap">
                        <Flame className="w-3.5 h-3.5 text-[#1F8A5B] fill-[#1F8A5B]" />
                        <span>Demand {opp.demandScore}</span>
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/demand?topic=${encodeURIComponent(opp.title)}`);
                        }}
                        className="nv-btn-press px-3.5 py-1.5 rounded-lg bg-[#135A3E] hover:bg-[#0D432E] text-white text-[12px] font-semibold inline-flex items-center gap-1.5 transition-colors shadow-2xs whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#135A3E] focus-visible:ring-offset-1"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BAND 4: Bottom Synthesized Opportunity Overview Card      */}
        {/* ========================================================= */}
        <div
          aria-live="polite"
          className="bg-white rounded-2xl border border-[#E6EDE8] p-5 sm:p-6 shadow-[0_6px_26px_rgba(15,41,30,0.05)] overflow-hidden"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeOpp.id}
              initial={{ opacity: 0.9, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0.9, y: -3 }}
              transition={{ duration: 0.16 }}
              className="flex flex-col lg:flex-row items-stretch lg:items-center gap-6"
            >
            {/* Left Rounded Thumbnail */}
            <div className="w-full lg:w-[208px] h-[142px] rounded-xl overflow-hidden shrink-0 bg-[#111827] shadow-2xs">
              <img
                src={activeOpp.thumbnail}
                alt={activeOpp.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right Synthesized Details + Validation Banner */}
            <div className="flex-1 min-w-0 flex flex-col justify-between gap-3.5">
              {/* Top Row: Overview Text + 3 Metric Columns */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
                <div className="xl:max-w-[49%] space-y-1">
                  <span className="text-[12px] font-bold text-[#155E44] block">
                    Synthesized Opportunity Overview
                  </span>
                  <h3 className="font-serif font-bold text-[20px] sm:text-[22px] text-[#111827] leading-[1.2] tracking-tight">
                    {activeOpp.title}
                  </h3>
                  <p className="text-[12.5px] text-[#4B5563] leading-[1.5]">
                    {activeOpp.overviewSummary}
                  </p>
                </div>

                {/* 3 Right Metric Columns with Dividers */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-5 sm:gap-6 shrink-0">
                  <div className="hidden xl:block h-12 w-px bg-[#E5ECE7]" />

                  {/* Qualified Learners */}
                  <div className="flex items-start gap-2.5">
                    <Users className="w-5 h-5 text-[#166547] stroke-[1.8] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11.5px] text-[#4B5563] block whitespace-nowrap">
                        Qualified Learners
                      </span>
                      <span className="text-[20px] font-extrabold text-[#111827] leading-tight block mt-0.5">
                        {activeOpp.qualifiedLearners}
                      </span>
                    </div>
                  </div>

                  <div className="hidden sm:block h-11 w-px bg-[#E5ECE7]" />

                  {/* Avg. Budget Target */}
                  <div className="flex items-start gap-2.5">
                    <Coins className="w-5 h-5 text-[#166547] stroke-[1.8] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11.5px] text-[#4B5563] block whitespace-nowrap">
                        Avg. Budget Target
                      </span>
                      <div className="leading-tight mt-0.5 whitespace-nowrap">
                        <span className="text-[20px] font-extrabold text-[#111827]">
                          ${activeOpp.avgBudgetDollars}
                        </span>{' '}
                        <span className="text-[12px] font-medium text-[#374151]">USD</span>
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:block h-11 w-px bg-[#E5ECE7]" />

                  {/* Delivery Model */}
                  <div className="flex items-start gap-2.5">
                    <FlaskConical className="w-5 h-5 text-[#166547] stroke-[1.8] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11.5px] text-[#4B5563] block whitespace-nowrap">
                        Delivery Model
                      </span>
                      <span className="text-[17px] font-extrabold text-[#111827] leading-tight block mt-0.5 whitespace-nowrap">
                        {activeOpp.deliveryModel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Algorithmic Validation Callout Bar */}
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-[#E6F4EC] text-[#134E3A] text-[12px] font-medium">
                <span className="w-4 h-4 rounded-full bg-[#18794E] text-white flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
                <span>{activeOpp.validationNote}</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  </section>
);
};

export default DemandIntelligencePreview;
