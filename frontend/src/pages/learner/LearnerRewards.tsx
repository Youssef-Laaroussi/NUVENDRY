import './LearnerRewards.css';
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api, useSyncRefresh } from '../../api/client';
import { RewardsDashboard, WorkshopMaterials } from '../../types';
import {
  Gift,
  Award,
  ShieldCheck,
  Star,
  SquareCheck,
  Download,
  Key,
  Copy,
  Check,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  CreditCard,
  Zap,
  HelpCircle,
  Flame,
  Calendar,
  Lock,
  Layers,
  ChevronDown,
  Sparkles,
  Target,
  Wallet,
  Info,
  Trophy,
} from 'lucide-react';

// Alpine Mountain Backdrops
import heroRewardsMountainsClean from '../../assets/hero-mountains-perfect-crop.jpg';
import rewardsMilestoneHiker from '../../assets/rewards-milestone-hiker.jpg';
import rewardsBottomPanorama from '../../assets/rewards-bottom-panorama.jpg';

// AI Generated Gift Product Mockups
import giftPromptPack from '../../assets/gift-prompt-pack.jpg';
import giftMlopsToolkit from '../../assets/gift-mlops-toolkit.jpg';
import giftWallpaperPack from '../../assets/gift-wallpaper-pack.jpg';
import giftDatascienceCheat from '../../assets/gift-datascience-cheat.jpg';

// AI Generated 3D Achievement Badges
import badgeFirstWorkshop3d from '../../assets/badge-first-workshop-3d.png';
import badgeActiveLearner3d from '../../assets/badge-active-learner-3d.png';
import badgeMlopsExplorer3d from '../../assets/badge-mlops-explorer-3d.png';
import badgeCommunityMember3d from '../../assets/badge-community-member-3d.png';

interface ShowcaseGift {
  id: string;
  badgeTag: string;
  badgeTagType: 'gift' | 'material' | 'exclusive' | 'learning';
  title: string;
  description: string;
  image: string;
  accessCode: string;
  deliverables: string[];
}

const SHOWCASE_GIFTS: ShowcaseGift[] = [
  {
    id: 'gift-prompt-pack',
    badgeTag: 'DIGITAL GIFT',
    badgeTagType: 'gift',
    title: 'AI Prompt Pack (Pro)',
    description: '50+ expert prompts for learning & projects',
    image: giftPromptPack,
    accessCode: 'PROMPT-PRO-2026',
    deliverables: [
      '50+ Battle-tested system prompts for LLMs and agentic workflows',
      'Evaluation benchmarks & prompt engineering cheat sheet (PDF)',
      'Jupyter notebook starter with LangChain & OpenAI integrations',
    ],
  },
  {
    id: 'gift-mlops-toolkit',
    badgeTag: 'DIGITAL MATERIAL',
    badgeTagType: 'material',
    title: 'MLOps Toolkit',
    description: 'Templates, checklists & deployment guides',
    image: giftMlopsToolkit,
    accessCode: 'MLOPS-TOOLKIT-99',
    deliverables: [
      'Production Docker Compose & Kubernetes manifest templates',
      'CI/CD GitHub Actions pipelines for model linting & automated testing',
      'Model registry checklist & Grafana monitoring dashboards',
    ],
  },
  {
    id: 'gift-wallpaper-pack',
    badgeTag: '★ EXCLUSIVE GIFT',
    badgeTagType: 'exclusive',
    title: 'NUVENDRY Wallpaper Pack',
    description: 'Premium mountain editions (4K, desktop & mobile)',
    image: giftWallpaperPack,
    accessCode: 'ALPINE-4K-WALL',
    deliverables: [
      '12 Ultra-high-resolution 4K & 5K desktop wallpapers',
      '6 Optimized vertical mobile wallpapers with lock-screen designs',
      'Original photography license for personal workstation use',
    ],
  },
  {
    id: 'gift-datascience-cheat',
    badgeTag: 'LEARNING MATERIAL',
    badgeTagType: 'learning',
    title: 'Data Science Cheat Sheet',
    description: 'Essential concepts, tools & quick references',
    image: giftDatascienceCheat,
    accessCode: 'DS-REF-CHEATSHEET',
    deliverables: [
      'Vector calculus, probability & gradient descent quick formulas',
      'Pandas, NumPy, and PyTorch syntax reference sheets',
      'Interview prep guide for machine learning engineers (PDF)',
    ],
  },
];

export const LearnerRewards: React.FC = () => {
  const [rewards, setRewards] = useState<RewardsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedGiftId, setCopiedGiftId] = useState<string | null>(null);
  const [giftOffset, setGiftOffset] = useState(0);
  const [showLedger, setShowLedger] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [activeMaterials, setActiveMaterials] = useState<WorkshopMaterials | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.getMyRewards();
      setRewards(data);
    } catch (err) {
      console.error('Failed to load rewards dashboard', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useSyncRefresh(['rewards', 'reservations'], load);

  useEffect(() => {
    if (!activeMaterials) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveMaterials(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeMaterials]);

  const copyCode = (id: string, code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedGiftId(id);
    setTimeout(() => setCopiedGiftId(null), 2000);
  };

  const handleOpenShowcaseMaterials = (gift: ShowcaseGift) => {
    setActiveMaterials({
      workshop_id: gift.id,
      workshop_title: gift.title,
      access_code: gift.accessCode,
      deliverables: gift.deliverables,
      download_url: 'https://github.com/nuvendry-platform',
    });
  };

  const storeCreditDollars = ((rewards?.store_credit_cents ?? 4250) / 100).toFixed(2);
  const badgesCount = rewards?.achievement_badges?.length || 4;
  const giftsCount = (rewards?.digital_gifts?.length || 0) + 7;

  return (
    <div className="rewards-page pb-4 text-[#1A2621]">
      <div className="rewards-columns">
      <section className="rewards-center">
      {/* 1. Header Hero Banner with Alpine Mountains */}
      <div className="rewards-hero relative overflow-hidden flex items-center px-3">
        {/* Mountain Backdrop Illustration - exact positioning to blend into white */}
        <div className="absolute right-0 top-0 bottom-0 w-[62%] pointer-events-none overflow-hidden select-none">
          <img
            src={heroRewardsMountainsClean}
            alt="Alpine Mountains"
            className="w-full h-full object-cover object-right [mask-image:linear-gradient(to_left,black_60%,transparent_100%)]"
          />
        </div>

        <div className="relative z-10 max-w-lg space-y-1">
          <h1 className="text-2xl sm:text-[27px] font-serif font-bold text-[#1F2937] flex items-center gap-2 tracking-tight">
            Rewards & Gifts <span className="text-xl sm:text-2xl">🎁</span>
          </h1>
          <p className="text-xs sm:text-[13px] text-[#4B5563] leading-relaxed max-w-md">
            Earn rewards as you learn, build skills, and stay active on NUVENDRY.<br className="hidden sm:inline" />
            Collect credits, unlock gifts, and grow your achievement badges.
          </p>
        </div>
      </div>

      {/* 2. Top Metric Cards Row (4 cards matching reference 100%) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
        {/* Card 1: Store Credit */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-3.5 sm:p-4 flex flex-col justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 text-xs">
            <Wallet className="w-4 h-4 text-[#0E6636] stroke-[2.2]" />
            <span className="font-semibold text-xs text-[#1F2937]">Store Credit</span>
            <button
              type="button"
              onClick={() => setShowLedger(!showLedger)}
              title="Toggle ledger audit"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Info className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-2xl sm:text-[27px] font-bold font-sans text-[#0E6636] tracking-tight leading-none">
              ${storeCreditDollars}
            </span>
            <Link
              to="/workshops"
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E8F5E9] text-[#0E6636] text-[11px] font-semibold hover:bg-[#DDF4E0] transition-colors leading-none"
            >
              <span>Use Credit</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 2: Earned Badges */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-3.5 sm:p-4 flex flex-col justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 text-xs">
            <Award className="w-4 h-4 text-[#0E6636] stroke-[2.2]" />
            <span className="font-semibold text-xs text-[#1F2937]">Earned Badges</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-2xl sm:text-[27px] font-bold font-sans text-[#0E6636] tracking-tight leading-none">
              {badgesCount}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706] text-[11px] font-bold font-mono leading-tight">
              +2 new
            </span>
          </div>
        </div>

        {/* Card 3: Gifts Unlocked */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-3.5 sm:p-4 flex flex-col justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 text-xs">
            <Gift className="w-4 h-4 text-[#0E6636] stroke-[2.2]" />
            <span className="font-semibold text-xs text-[#1F2937]">Gifts Unlocked</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-2xl sm:text-[27px] font-bold font-sans text-[#0E6636] tracking-tight leading-none">
              {giftsCount}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706] text-[11px] font-bold font-mono leading-tight">
              +3 new
            </span>
          </div>
        </div>

        {/* Card 4: Benefit Eligibility */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-3.5 sm:p-4 flex flex-col justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 text-xs">
            <ShieldCheck className="w-4 h-4 text-[#0E6636] stroke-[2.2]" />
            <span className="font-semibold text-xs text-[#1F2937]">Benefit Eligibility</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-2xl sm:text-[27px] font-bold font-sans text-[#0E6636] tracking-tight leading-none">
              3 / 4
            </span>
            <a
              href="#program-benefits"
              className="inline-flex items-center gap-1 text-[#0E6636] text-[11px] font-semibold hover:underline leading-none"
            >
              <span>View Benefits</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Store Credit Ledger (expandable on help icon click) */}
      {showLedger && (
        <div className="bg-white rounded-2xl border border-[#E5E7E0] p-4 shadow-xs space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E7E0]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0E6636]">
              Store Credit Ledger Audit
            </span>
            <button onClick={() => setShowLedger(false)} className="text-xs text-gray-400 hover:text-gray-600">
              Close
            </button>
          </div>
          {rewards?.ledger && rewards.ledger.length > 0 ? (
            <div className="divide-y divide-[#E5E7E0]/60">
              {rewards.ledger.map((entry) => (
                <div key={entry.id} className="py-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-[#1A2621]">{entry.description}</span>
                    <span className="text-[10px] text-gray-400 ml-2">{new Date(entry.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className={`font-mono font-bold ${entry.delta_cents >= 0 ? 'text-[#0E6636]' : 'text-[#1A2621]'}`}>
                    {entry.delta_cents >= 0 ? '+' : '-'}${(Math.abs(entry.delta_cents) / 100).toFixed(2)} USD
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-500 py-2">
              All store credits automatically apply at workshop checkout. No prior deductions found.
            </div>
          )}
        </div>
      )}

          {/* Row A: Gifts + Badges side by side */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 items-stretch">
            {/* Card 1: Your Unlocked Gifts & Digital Materials (7 cols) */}
            <div className="xl:col-span-7 bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-[#0E6636] stroke-[2.2]" />
                    <h2 className="text-xs sm:text-[13px] font-bold text-[#1F2937]">
                      Your Unlocked Gifts & Digital Materials
                    </h2>
                  </div>
                  <Link
                    to="/workshops"
                    className="text-[11px] font-semibold text-[#0E6636] hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>View all gifts</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* 4 Cards displayed side-by-side with carousel navigation */}
                <div className="relative">
                  {/* Left Arrow Button */}
                  <button
                    type="button"
                    aria-label="Previous gifts"
                    onClick={() => setGiftOffset(i => (i + SHOWCASE_GIFTS.length - 1) % SHOWCASE_GIFTS.length)}
                    className="absolute -left-2.5 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-[#E5E7EB] shadow-sm flex items-center justify-center text-gray-500 hover:text-[#0E6636] hover:border-[#0E6636] transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[...SHOWCASE_GIFTS.slice(giftOffset), ...SHOWCASE_GIFTS.slice(0, giftOffset)].map((gift) => (
                      <div
                        key={gift.id}
                        className="bg-white rounded-xl border border-[#E5E7EB] p-2 flex flex-col justify-between hover:border-[#C5DFD0] hover:shadow-xs transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                      >
                        <div className="space-y-1.5">
                          {/* Tag Pill */}
                          <div className="flex justify-start">
                            <span
                              className={`text-[8px] font-bold font-mono px-1.5 py-0.5 rounded leading-none ${
                                gift.badgeTagType === 'exclusive'
                                  ? 'bg-[#FEF3C7] text-[#B45309]'
                                  : 'bg-[#E8F5E9] text-[#15803D]'
                              }`}
                            >
                              {gift.badgeTag}
                            </span>
                          </div>

                          {/* Image Box */}
                          <div className="w-full h-[clamp(68px,5vw,88px)] rounded-lg overflow-hidden bg-[#F8FAF9] border border-[#E5E7EB]/60 flex items-center justify-center">
                            <img
                              src={gift.image}
                              alt={gift.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Title & Description */}
                          <div>
                            <div className="text-[11px] font-bold text-[#1F2937] leading-tight min-h-[22px] flex items-center">
                              {gift.title}
                            </div>
                            <div className="text-[10px] text-[#48534e] leading-tight mt-0.5 line-clamp-2 min-h-[20px]">
                              {gift.description}
                            </div>
                          </div>
                        </div>

                        {/* Download Button */}
                        <div className="pt-2 mt-1">
                          <button
                            type="button"
                            onClick={() => handleOpenShowcaseMaterials(gift)}
                            className="w-full py-1.5 rounded-lg bg-[#0E6636] hover:bg-[#0A4D28] text-white text-[9.5px] font-semibold flex items-center justify-center gap-1 shadow-xs transition-colors"
                          >
                            <span>Download</span>
                            <Download className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right Arrow Button */}
                  <button
                    type="button"
                    aria-label="Next gifts"
                    onClick={() => setGiftOffset(i => (i + 1) % SHOWCASE_GIFTS.length)}
                    className="absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-[#E5E7EB] shadow-sm flex items-center justify-center text-gray-500 hover:text-[#0E6636] hover:border-[#0E6636] transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Pagination Dots */}
              <div className="flex items-center justify-center gap-1.5 pt-3">
                {SHOWCASE_GIFTS.map((gift, index) => (
                  <button key={gift.id} aria-label={`Show ${gift.title} first`} aria-pressed={giftOffset === index}
                    onClick={() => setGiftOffset(index)} className={`w-2 h-2 rounded-full ${giftOffset === index ? 'bg-green-800' : 'bg-slate-300'}`} />
                ))}
              </div>
            </div>

            {/* Card 2: Your Badges & Achievements (5 cols) */}
            <div className="xl:col-span-5 bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[#0E6636] stroke-[2.2]" />
                    <h2 className="text-xs sm:text-[13px] font-bold text-[#1F2937]">
                      Your Badges & Achievements
                    </h2>
                  </div>
                  <Link
                    to="/app/overview"
                    className="text-[11px] font-semibold text-[#0E6636] hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>View all</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* 4 Badges in a row */}
                <div className="grid grid-cols-4 gap-1 text-center py-1">
                  <div className="flex flex-col items-center space-y-1.5 group cursor-pointer">
                    <div className="w-16 h-16 flex items-center justify-center transition-transform group-hover:scale-105">
                      <img
                        src={badgeFirstWorkshop3d}
                        alt="First Workshop"
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-[#1F2937] leading-tight">
                      First<br />Workshop
                    </span>
                  </div>

                  <div className="flex flex-col items-center space-y-1.5 group cursor-pointer">
                    <div className="w-16 h-16 flex items-center justify-center transition-transform group-hover:scale-105">
                      <img
                        src={badgeActiveLearner3d}
                        alt="Active Learner"
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-[#1F2937] leading-tight">
                      Active<br />Learner
                    </span>
                  </div>

                  <div className="flex flex-col items-center space-y-1.5 group cursor-pointer">
                    <div className="w-16 h-16 flex items-center justify-center transition-transform group-hover:scale-105">
                      <img
                        src={badgeMlopsExplorer3d}
                        alt="MLOps Explorer"
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-[#1F2937] leading-tight">
                      MLOps<br />Explorer
                    </span>
                  </div>

                  <div className="flex flex-col items-center space-y-1.5 group cursor-pointer">
                    <div className="w-16 h-16 flex items-center justify-center transition-transform group-hover:scale-105">
                      <img
                        src={badgeCommunityMember3d}
                        alt="Community Member"
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-[#1F2937] leading-tight">
                      Community<br />Member
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Badge: Skill Builder Progress Box with Mountain Summit Flag */}
              <div className="mt-3 bg-[#F2FBF5] rounded-xl p-3 border border-[#E2F5E9] flex items-center justify-between gap-3 relative overflow-hidden">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#0E6636] shrink-0">
                      <Award className="w-3.5 h-3.5 stroke-[2.2]" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-[#1F2937] leading-tight">
                        Next Badge: Skill Builder
                      </div>
                      <div className="text-[9.5px] text-[#4B5563] leading-tight mt-0.5">
                        Complete 2 more workshops to unlock.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 pt-0.5">
                    <div className="flex-1 h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                      <div className="h-full bg-[#0E6636] rounded-full w-1/2" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#1F2937]">2 / 4</span>
                  </div>
                </div>

                {/* Stylized Mountain Summit with Green Flag (Vector Graphic) */}
                <div className="shrink-0 w-20 h-14 flex items-end justify-center select-none pointer-events-none">
                  <svg viewBox="0 0 100 60" fill="none" className="w-20 h-14">
                    {/* Background light foothills */}
                    <path d="M0 60 Q25 45 45 52 Q65 58 100 60 Z" fill="#E8F5E9" />
                    {/* Background mountain ridge */}
                    <path d="M15 60 L70 14 L100 60 Z" fill="#C8E6C9" />
                    {/* Foreground left slope */}
                    <path d="M35 60 L70 14 L78 60 Z" fill="#81C784" />
                    {/* Foreground dark shaded right slope */}
                    <path d="M70 14 L100 60 L78 60 Z" fill="#2E7D32" />
                    {/* Snow cap */}
                    <path d="M70 14 L65 24 L70 22 L73 26 L76 22 L70 14 Z" fill="#FFFFFF" />
                    {/* Flag pole */}
                    <line x1="70" y1="14" x2="70" y2="4" stroke="#0E6636" strokeWidth="2" strokeLinecap="round" />
                    {/* Triangular green flag */}
                    <path d="M70 4 L84 8 L70 12 Z" fill="#0E6636" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Row B: Rewards Program & Milestones */}
          <div className="bg-white rounded-2xl border border-[#E5E7E0] p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#E5E7E0] pb-2.5">
              <div>
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#0E6636]" />
                  <h2 className="text-xs sm:text-[13px] font-bold text-[#1A2621]">
                    Rewards Program & Milestones
                  </h2>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Turn your learning into real value. Earn points, unlock gifts, gain store credit, and access exclusive benefits.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHowItWorks(!showHowItWorks)}
                className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#0E6636] hover:underline shrink-0"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>How It Works?</span>
              </button>
            </div>

            {/* 3 Columns: Hiker Card + Milestone Steps + Program Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch">
              {/* Column 1: Hiker Illustration Card (4 cols) */}
              <div className="md:col-span-4 rounded-xl overflow-hidden relative border border-[#E5E7E0] min-h-[190px] flex flex-col justify-between p-3.5 bg-gradient-to-b from-[#143D2B] to-[#0A261A] text-white">
                <img
                  src={rewardsMilestoneHiker}
                  alt="Hiker in Mountains"
                  className="absolute inset-0 w-full h-full object-cover object-bottom opacity-80"
                />
                <div className="relative z-10 space-y-1">
                  <h3 className="text-sm font-serif font-bold text-white flex items-center gap-1.5">
                    <span>Learn</span>
                    <span className="text-[11px] opacity-80">→</span>
                    <span>Earn</span>
                    <span className="text-[11px] opacity-80">→</span>
                    <span>Unlock</span>
                  </h3>
                  <p className="text-[10px] text-white/90 leading-relaxed max-w-[180px]">
                    Complete learning activities, collect points, and reach meaningful rewards.
                  </p>
                </div>
              </div>

              <ol className="milestone-track md:col-span-4" aria-label="Workshop milestones">
                {[
                  { title: 'Get Started', detail: 'Complete your first workshop', reward: '100 pts', state: 'complete' },
                  { title: 'Build Momentum', detail: 'Complete 3 workshops', reward: '300 pts + Gift', state: 'complete' },
                  { title: 'Become a Skill Builder', detail: 'Complete 4 workshops', reward: '', state: 'current' },
                  { title: 'Learning Champion', detail: 'Complete 8 workshops', reward: '+1,000 pts + $10 Credit', state: 'locked' },
                ].map(step => (
                  <li key={step.title} data-state={step.state} aria-current={step.state === 'current' ? 'step' : undefined}>
                    <span className="milestone-marker" aria-label={step.state}>
                      {step.state === 'complete' && <Check size={12} strokeWidth={3} />}
                    </span>
                    <div><strong>{step.title}</strong><small>{step.detail}</small></div>
                    {step.state === 'current' ? (
                      <div className="milestone-progress"><progress value={2} max={4} aria-label="Workshops completed" />2 / 4</div>
                    ) : (
                      <span className="milestone-prize">
                        {step.state === 'locked' ? <Lock size={12} /> : <Check size={13} />}
                        {step.reward}{step.title === 'Build Momentum' && <Gift size={12} />}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
              <section id="program-benefits" className="milestone-benefits md:col-span-4">
                <h3><Star size={16} />Program Benefits</h3>
                <ul>
                  {[
                    'Earn store credit for future workshops',
                    'Unlock digital gifts & premium materials',
                    'Collect achievement badges',
                    'Access exclusive workshops & early invites',
                    'Get special recognition in the community',
                  ].map(benefit => <li key={benefit}><SquareCheck size={13} />{benefit}</li>)}
                </ul>
              </section>
            </div>
          </div>
      </section>

        {/* Summary and activity */}
        <div className="rewards-rail">
          {/* Card 1: Rewards Summary */}
          <div className="bg-white rounded-2xl border border-[#E5E7E0] p-4 sm:p-5 shadow-xs space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#0E6636]" />
                <h2 className="text-xs sm:text-[13px] font-bold text-[#1A2621]">
                  Rewards Summary
                </h2>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-[#E5E7E0] bg-[#F9FAF9] text-[10px] font-medium text-gray-600 hover:text-[#1A2621]"
              >
                <span>This Month</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            <div className="rewards-summary-values">
            {/* Circular Donut Ring */}
            <div className="flex flex-col items-center justify-center py-1">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-[#EBF9EA]"
                    strokeWidth="9"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-[#0E6636]"
                    strokeWidth="9"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - 0.76)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-bold font-sans text-[#1A2621]">2,480</span>
                  <span className="text-[10px] text-gray-500 font-medium">Points</span>
                </div>
              </div>
            </div>

            {/* Summary Metrics */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-600">
                  <Zap className="w-3.5 h-3.5 text-[#0E6636]" />
                  <span className="font-bold text-[#0E6636]">+480</span>
                </div>
                <span className="text-gray-500 text-[11px]">Points Earned</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-600">
                  <Gift className="w-3.5 h-3.5 text-[#0E6636]" />
                  <span className="font-bold text-[#1A2621]">7</span>
                </div>
                <span className="text-gray-500 text-[11px]">Gifts Unlocked</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-600">
                  <Award className="w-3.5 h-3.5 text-[#0E6636]" />
                  <span className="font-bold text-[#1A2621]">4</span>
                </div>
                <span className="text-gray-500 text-[11px]">Badges Earned</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-600">
                  <CreditCard className="w-3.5 h-3.5 text-[#0E6636]" />
                  <span className="font-bold font-mono text-[#0E6636]">${storeCreditDollars}</span>
                </div>
                <span className="text-gray-500 text-[11px]">Store Credit</span>
              </div>
            </div>

            </div>
            {/* Mountain Watermark along card bottom */}
            <div className="absolute -bottom-1 left-0 right-0 h-10 pointer-events-none opacity-20 overflow-hidden">
              <svg viewBox="0 0 300 40" preserveAspectRatio="none" className="w-full h-full fill-[#0E6636]">
                <path d="M0,40 L30,20 L60,32 L110,12 L160,28 L210,8 L260,26 L300,16 L300,40 Z" />
              </svg>
            </div>
          </div>

          {/* Card 2: Recent Rewards Activity */}
          <div className="bg-white rounded-2xl border border-[#E5E7E0] p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#0E6636]" />
                <h2 className="text-xs sm:text-[13px] font-bold text-[#1A2621]">
                  Recent Rewards Activity
                </h2>
              </div>
              <Link
                to="/app/overview"
                className="text-[11px] font-semibold text-[#0E6636] hover:underline inline-flex items-center gap-0.5"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2 text-xs">
                <div className="flex items-start gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#0E6636] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-[#1A2621] text-[10.5px]">Workshop Completed</div>
                    <div className="text-[9.5px] text-gray-500">MLOps in Production</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10.5px] font-bold font-mono text-[#0E6636]">+250 pts</div>
                  <div className="text-[9px] text-gray-400">Nov 26</div>
                </div>
              </div>

              <div className="flex items-start justify-between gap-2 text-xs">
                <div className="flex items-start gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#0E6636] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-[#1A2621] text-[10.5px]">Learning Streak (7 Days)</div>
                    <div className="text-[9.5px] text-gray-500">Consistency Bonus</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10.5px] font-bold font-mono text-[#0E6636]">+100 pts</div>
                  <div className="text-[9px] text-gray-400">Nov 24</div>
                </div>
              </div>

              <div className="flex items-start justify-between gap-2 text-xs">
                <div className="flex items-start gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-[#0E6636] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-[#1A2621] text-[10.5px]">Gift Unlocked</div>
                    <div className="text-[9.5px] text-gray-500">AI Prompt Pack (Pro)</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10.5px] font-bold font-mono text-[#0E6636]">+1 gift</div>
                  <div className="text-[9px] text-gray-400">Nov 22</div>
                </div>
              </div>

              <div className="flex items-start justify-between gap-2 text-xs">
                <div className="flex items-start gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#0E6636] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-[#1A2621] text-[10.5px]">Badge Earned</div>
                    <div className="text-[9.5px] text-gray-500">Active Learner</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10.5px] font-bold font-mono text-[#0E6636]">+ badge</div>
                  <div className="text-[9px] text-gray-400">Nov 19</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Keep Your Momentum! */}
          <div className="bg-[#ECFAED] rounded-2xl border border-[#C5DFD0] p-3.5 shadow-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0E6636]">
              <Flame className="w-4 h-4 text-[#D97706]" />
              <span>Keep Your Momentum!</span>
            </div>
            <p className="text-[10.5px] text-[#2C4837] leading-tight">
              Maintain a 14-day learning streak to earn +300 points and a special badge.
            </p>
            <div className="pt-1 space-y-1">
              <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-[#C5DFD0]">
                <div className="h-full bg-[#0E6636] rounded-full w-[14%]" />
              </div>
              <div className="text-right text-[9.5px] font-mono font-bold text-gray-600">
                2 / 14 days
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Full-Width Bottom Panorama Banner: Reach Your Next Reward */}
      <div className="relative overflow-hidden rounded-2xl border border-[#0E6636]/30 bg-[#0E6636] shadow-sm text-white p-4 sm:p-5">
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <img
            src={rewardsBottomPanorama}
            alt="Mountain Panorama"
            className="w-full h-full object-cover object-center opacity-45 mix-blend-overlay"
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 max-w-xl">
            <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold font-serif text-white">
                Reach Your Next Reward
              </h3>
              <p className="text-[11px] text-white/90 leading-tight">
                Complete 2 more workshops to unlock the &ldquo;Skill Builder&rdquo; badge and a $10 store credit.
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <Link
              to="/workshops"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[#0E6636] text-xs font-bold hover:bg-[#F2F8F4] transition-colors shadow-sm"
            >
              <span>Explore Workshops</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 5. Materials & Deliverables Modal */}
      {activeMaterials && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveMaterials(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-2xl border border-[#E5E7E0] max-w-md w-full p-5 shadow-2xl space-y-3.5">
            <div className="flex items-start justify-between gap-3 border-b border-[#E5E7E0] pb-2.5">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#0E6636] font-bold">
                  Unlocked Reward & Materials
                </span>
                <h3 className="font-bold text-sm text-[#1A2621]">
                  {activeMaterials.workshop_title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveMaterials(null)}
                aria-label="Close modal"
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-[#F6F8F7]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-[#F9FAF9] border border-[#E5E7E0] flex items-center justify-between text-xs font-mono">
              <span>
                Access Code: <strong>{activeMaterials.access_code}</strong>
              </span>
              <button
                type="button"
                onClick={() => copyCode('modal', activeMaterials.access_code)}
                className="text-[#0E6636] font-semibold inline-flex items-center gap-1 hover:underline"
              >
                {copiedGiftId === 'modal' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedGiftId === 'modal' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-[#1A2621] block">
                Included Deliverables:
              </span>
              <ul className="space-y-1 text-xs text-[#4A5550]">
                {activeMaterials.deliverables.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#0E6636] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2.5 border-t border-[#E5E7E0] flex items-center justify-end gap-2">
              {activeMaterials.download_url && (
                <a
                  href={activeMaterials.download_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#ECFAED] text-[#0E6636] text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-[#DCF3E0]"
                >
                  <span>Open Repository</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <button
                type="button"
                onClick={() => setActiveMaterials(null)}
                className="px-4 py-1.5 rounded-xl bg-[#0E6636] text-white text-xs font-semibold hover:bg-[#0A4D28]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnerRewards;
