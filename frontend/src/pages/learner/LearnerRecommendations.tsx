import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Layers, Target, TrendingUp, Filter, Star, BarChart3,
  Zap, ChevronDown, Calendar, Clock, BarChart2, MoreVertical,
  Check, ArrowRight, Pencil, Info, Brain, Cpu, MessageSquare,
  Network, Code, MapPin, PlayCircle
} from 'lucide-react';

import heroMountains from '../../assets/discover-hero-mountains-v2.jpg';
import matchMlops from '../../assets/match-ws-mlops.jpg';
import matchPython from '../../assets/match-ws-python.jpg';
import matchAgents from '../../assets/discover-ws-1.jpg';
import matchSpatial from '../../assets/workshop-spatial.jpg';

interface RecommendedWorkshop {
  id: string;
  tag: string;
  title: string;
  description: string;
  date: string;
  duration: string;
  level: string;
  compatibility: number;
  image: string;
  reasons: string[];
  primaryAction: 'reserve' | 'details';
}

const RECOMMENDATIONS: RecommendedWorkshop[] = [
  {
    id: 'ws-mlops',
    tag: 'MLOps',
    title: 'Production MLOps: Serving & Monitoring',
    description: 'Take models from experimentation to reliable, scalable production with MLOps best practices.',
    date: 'Nov 19 – Nov 26, 2026',
    duration: '~ 6 hours',
    level: 'Intermediate',
    compatibility: 97,
    image: matchMlops,
    reasons: [
      'Builds on your ML and Python skills',
      'Closes a key gap in production deployment',
      'Highly aligned with your AI product goal',
    ],
    primaryAction: 'reserve',
  },
  {
    id: 'ws-langgraph',
    tag: 'LLMs + Agents',
    title: 'Building AI Agents with LangGraph',
    description: 'Design, build, and deploy robust AI agents using LangGraph for real-world use cases.',
    date: 'Nov 21, 2026',
    duration: '~ 4 hours',
    level: 'Intermediate',
    compatibility: 95,
    image: matchAgents,
    reasons: [
      'Matches your interest in AI agents',
      'Leverages your Python and LLM experience',
      'A practical step toward building AI solutions',
    ],
    primaryAction: 'reserve',
  },
  {
    id: 'ws-spatial',
    tag: 'Spatial Data Science',
    title: 'Spatial Data Science with Python',
    description: 'Work with geospatial data using Python to analyze, visualize, and solve real-world problems.',
    date: 'Nov 22, 2026',
    duration: '~ 3 hours',
    level: 'Beginner – Intermediate',
    compatibility: 93,
    image: matchSpatial,
    reasons: [
      'Aligns with your data and analytics interests',
      'Builds a complementary spatial skill set',
      'Applicable to real-world AI/ML projects',
    ],
    primaryAction: 'details',
  },
  {
    id: 'ws-python-ai',
    tag: 'Python',
    title: 'Advanced Python for AI',
    description: 'Level up your Python skills with advanced patterns, performance tips, and real AI project examples.',
    date: 'Nov 25, 2026',
    duration: '~ 5 hours',
    level: 'Intermediate',
    compatibility: 90,
    image: matchPython,
    reasons: [
      'Strengthens your core Python foundation',
      'Supports your AI and MLOps learning path',
      'High ROI for your current goals',
    ],
    primaryAction: 'reserve',
  },
];

const SKILLS = [
  { name: 'Python', value: 92 },
  { name: 'Machine Learning', value: 85 },
  { name: 'Data Analysis', value: 83 },
  { name: 'LLMs', value: 78 },
  { name: 'MLOps', value: 62 },
];

const INTERESTS = [
  { label: 'Artificial Intelligence', icon: Brain },
  { label: 'MLOps', icon: Cpu },
  { label: 'Data Science', icon: BarChart3 },
  { label: 'LLMs', icon: MessageSquare },
  { label: 'AI Agents', icon: Network },
  { label: 'Python', icon: Code },
  { label: 'Geospatial / Spatial Data', icon: MapPin },
];

const CompatibilityGauge: React.FC<{ value: number }> = ({ value }) => {
  const radius = 22;
  const stroke = 3.5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center shrink-0">
      <div className="relative w-14 h-14 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 54 54">
          <circle
            cx="27"
            cy="27"
            r={radius}
            fill="transparent"
            stroke="#E5E7EB"
            strokeWidth={stroke}
          />
          <circle
            cx="27"
            cy="27"
            r={radius}
            fill="transparent"
            stroke="#0E6636"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-[13px] font-bold text-[#14211B]">{value}%</span>
      </div>
      <span className="text-[9.5px] text-[#6B7280] font-medium mt-0.5">Compatibility</span>
    </div>
  );
};

export const LearnerRecommendations: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'recommended' | 'gap' | 'career' | 'quick'>('all');

  return (
    <div className="space-y-3.5 text-[#1A2621]">
      {/* 1. Hero Header */}
      <div className="relative">
        <div className="absolute right-0 -top-4 h-[130px] w-[58%] pointer-events-none select-none overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_35%),linear-gradient(to_bottom,black_65%,transparent_100%)] [mask-composite:intersect] [-webkit-mask-composite:source-in]">
          <img src={heroMountains} alt="" className="w-full h-full object-cover object-[right_62%]" />
        </div>
        <div className="relative z-10 pt-0.5 max-w-[640px]">
          <h1 className="text-[26px] leading-tight font-serif font-bold text-[#14211B] flex items-center gap-2">
            AI Matches
            <span className="text-xl">✨</span>
          </h1>
          <p className="mt-1 text-[13px] text-[#4B5563] leading-snug">
            Intelligent, personalized learning recommendations powered by AI.<br />
            Discover the right workshops to build your skills, achieve your goals, and grow faster.
          </p>
        </div>
      </div>

      {/* 2. Top Banner & Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.9fr_1fr_1fr_1.05fr] gap-3">
        {/* Left AI Insight Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#EAF6ED] via-[#F2FBF4] to-[#F8FDF9] border border-[#CDE5D4] p-4 flex items-start gap-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="w-11 h-11 rounded-full bg-[#D6EFE0] border border-[#BCE1CA] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#0E6636]" />
          </div>
          <div className="min-w-0 pr-2">
            <h2 className="text-[15px] font-bold text-[#14211B] leading-tight">Your AI Learning Insight</h2>
            <p className="text-[11.5px] text-[#374151] leading-relaxed mt-1">
              Your profile shows a strong focus on AI, data, and production systems. I've matched workshops that build on your current skills, fill key gaps (MLOps, LLMs), and align with your goal to deliver AI solutions in production.
            </p>
          </div>
        </div>

        {/* Stat 1: 12 AI Matches */}
        <div className="bg-white rounded-2xl border border-[#E3E7E2] p-4 flex flex-col justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <Layers className="w-5 h-5 text-[#0E6636]" strokeWidth={1.8} />
          </div>
          <div>
            <div className="text-[28px] font-bold font-serif text-[#14211B] leading-none">12</div>
            <div className="text-[11px] text-[#4B5563] mt-1 font-medium">AI Matches</div>
          </div>
          <div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#E3F4E6] text-[#0E7A3C] text-[10px] font-bold">
              +3 new
            </span>
          </div>
        </div>

        {/* Stat 2: 92% Avg. Compatibility */}
        <div className="bg-white rounded-2xl border border-[#E3E7E2] p-4 flex flex-col justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <Target className="w-5 h-5 text-[#0E6636]" strokeWidth={1.8} />
          </div>
          <div>
            <div className="text-[28px] font-bold font-serif text-[#14211B] leading-none">92%</div>
            <div className="flex items-center gap-1 text-[11px] text-[#4B5563] mt-1 font-medium">
              <span>Avg. Compatibility</span>
              <Info className="w-3 h-3 text-[#9CA3AF]" />
            </div>
          </div>
          <div className="h-5" />
        </div>

        {/* Stat 3: +37% Skill Growth Potential */}
        <div className="bg-white rounded-2xl border border-[#E3E7E2] p-4 flex flex-col justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <TrendingUp className="w-5 h-5 text-[#0E6636]" strokeWidth={1.8} />
          </div>
          <div>
            <div className="text-[28px] font-bold font-serif text-[#14211B] leading-none">+37%</div>
            <div className="flex items-center gap-1 text-[11px] text-[#4B5563] mt-1 font-medium">
              <span>Skill Growth Potential</span>
              <Info className="w-3 h-3 text-[#9CA3AF]" />
            </div>
          </div>
          <div className="h-5" />
        </div>
      </div>

      {/* 3. Filters / Refine Matches Row */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pt-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[#14211B] text-[12px] font-semibold mr-1 shrink-0">
            <Filter className="w-4 h-4 text-[#0E6636]" strokeWidth={2} />
            <span>Refine Matches</span>
          </div>

          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-semibold transition-all shrink-0 border ${
              activeFilter === 'all'
                ? 'bg-[#0E6636] text-white border-[#0E6636]'
                : 'bg-white hover:bg-[#F6F8F7] text-[#1F2A24] border-[#E3E7E2]'
            }`}
          >
            <span>All Matches</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeFilter === 'all' ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-700'
            }`}>
              12
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('recommended')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-semibold transition-all shrink-0 border ${
              activeFilter === 'recommended'
                ? 'bg-[#0E6636] text-white border-[#0E6636]'
                : 'bg-white hover:bg-[#F6F8F7] text-[#1F2A24] border-[#E3E7E2]'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Recommended for You</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">7</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('gap')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-semibold transition-all shrink-0 border ${
              activeFilter === 'gap'
                ? 'bg-[#0E6636] text-white border-[#0E6636]'
                : 'bg-white hover:bg-[#F6F8F7] text-[#1F2A24] border-[#E3E7E2]'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 text-[#0E6636]" />
            <span>Skill Gap</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">3</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('career')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-semibold transition-all shrink-0 border ${
              activeFilter === 'career'
                ? 'bg-[#0E6636] text-white border-[#0E6636]'
                : 'bg-white hover:bg-[#F6F8F7] text-[#1F2A24] border-[#E3E7E2]'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-[#0E6636]" />
            <span>Career Goal</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">2</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('quick')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-semibold transition-all shrink-0 border ${
              activeFilter === 'quick'
                ? 'bg-[#0E6636] text-white border-[#0E6636]'
                : 'bg-white hover:bg-[#F6F8F7] text-[#1F2A24] border-[#E3E7E2]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Quick Wins</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">2</span>
          </button>
        </div>

        <div className="flex items-center gap-1 text-[11.5px] text-[#4B5563] shrink-0">
          <span>Sort by:</span>
          <button
            type="button"
            className="inline-flex items-center gap-1 font-semibold text-[#14211B] hover:text-[#0E6636]"
          >
            <span>Best Match</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. Main Two-Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_310px] lg:grid-cols-[1fr_295px] gap-3.5 items-start">
        {/* Left Column: Recommended Learning Opportunities */}
        <div className="space-y-3 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0E6636]" strokeWidth={2} />
              <h2 className="text-[15px] font-serif font-bold text-[#14211B]">Recommended Learning Opportunities</h2>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#6B7280]">
              <span>12 matches • Personalized for you by AI</span>
              <Info className="w-3 h-3 text-[#9CA3AF]" />
            </div>
          </div>

          <div className="space-y-2.5">
            {RECOMMENDATIONS.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#E3E7E2] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center gap-3.5 hover:border-[#0E6636]/40 transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-[124px] h-[82px] rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>

                {/* Middle-left: Title, description, meta */}
                <div className="flex-1 min-w-0 overflow-hidden pr-2 space-y-1">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-[#EAF6EC] text-[#0E6636] font-semibold text-[9.5px]">
                    {item.tag}
                  </span>
                  <h3 className="text-[13.5px] font-bold text-[#14211B] leading-tight">
                    <Link to={`/workshops/${item.id}`} className="hover:text-[#0E6636]">
                      {item.title}
                    </Link>
                  </h3>
                  <p className="text-[10.5px] text-[#4B5563] leading-snug line-clamp-1">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-[#6B7280] pt-0.5">
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <Calendar className="w-3 h-3 text-[#0E6636]" />
                      <span>{item.date}</span>
                    </div>
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <Clock className="w-3 h-3 text-[#0E6636]" />
                      <span>{item.duration}</span>
                    </div>
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <BarChart2 className="w-3 h-3 text-[#0E6636]" />
                      <span>{item.level}</span>
                    </div>
                  </div>
                </div>

                {/* Middle: Compatibility Circle */}
                <div className="w-[78px] flex justify-center shrink-0">
                  <CompatibilityGauge value={item.compatibility} />
                </div>

                {/* Middle-right: Why this matches you */}
                <div className="w-[200px] shrink-0 space-y-1 border-t md:border-t-0 md:border-l border-[#E5E7EB] pt-2 md:pt-0 md:pl-3">
                  <div className="flex items-center gap-1.5 text-[#0E6636] text-[10.5px] font-bold">
                    <Sparkles className="w-3 h-3" />
                    <span>Why this matches you</span>
                  </div>
                  <ul className="space-y-0.5">
                    {item.reasons.map((r) => (
                      <li key={r} className="flex items-start gap-1 text-[9.5px] text-[#374151] leading-tight">
                        <Check className="w-2.5 h-2.5 text-[#0E6636] shrink-0 mt-0.5" strokeWidth={2.5} />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1.5 shrink-0 self-center">
                  <div className="flex flex-col gap-1.5 w-[105px]">
                    {item.primaryAction === 'reserve' ? (
                      <>
                        <Link
                          to={`/workshops/${item.id}`}
                          className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0E6636] hover:bg-[#0A522B] text-white text-[11px] font-semibold shadow-xs transition-colors whitespace-nowrap"
                        >
                          <span>Reserve Seat</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                        <Link
                          to={`/workshops/${item.id}`}
                          className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E3E7E2] hover:bg-gray-50 text-[#14211B] text-[11px] font-medium transition-colors whitespace-nowrap"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3 h-3 text-gray-400" />
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to={`/workshops/${item.id}`}
                          className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0E6636] hover:bg-[#0A522B] text-white text-[11px] font-semibold shadow-xs transition-colors whitespace-nowrap"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E3E7E2] hover:bg-gray-50 text-[#14211B] text-[11px] font-medium transition-colors whitespace-nowrap"
                        >
                          <Calendar className="w-3 h-3 text-[#0E6636]" />
                          <span>Reserve Seat</span>
                        </button>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label="More options"
                    className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Insights & Profile Context */}
        <div className="space-y-3.5 w-full">
          {/* Card 1: Your Interests */}
          <div className="bg-white rounded-2xl border border-[#E3E7E2] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#0E6636]" strokeWidth={2} />
                <h3 className="text-[14px] font-serif font-bold text-[#14211B]">Your Interests</h3>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-[#E3E7E2] text-[11px] font-medium text-[#14211B] hover:border-[#0E6636]/40 transition-colors"
              >
                <Pencil className="w-3 h-3 text-[#0E6636]" />
                <span>Edit</span>
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {INTERESTS.map((item) => {
                const Icon = item.icon;
                return (
                  <span
                    key={item.label}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E3E7E2] text-[10.5px] font-medium text-[#1F2A24]"
                  >
                    <Icon className="w-3.5 h-3.5 text-[#0E6636]" />
                    <span>{item.label}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Card 2: Detected Skills */}
          <div className="bg-white rounded-2xl border border-[#E3E7E2] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#0E6636]" strokeWidth={2} />
                <h3 className="text-[14px] font-serif font-bold text-[#14211B]">Detected Skills</h3>
              </div>
              <Info className="w-3.5 h-3.5 text-[#9CA3AF]" />
            </div>

            <div className="mt-3.5 space-y-2.5">
              {SKILLS.map((s) => (
                <div key={s.name} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#14211B]">{s.name}</span>
                    <span className="text-[#6B7280] font-medium">{s.value}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#E5E7EB] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#0E6636] transition-all duration-500"
                      style={{ width: `${s.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: AI Tip for You */}
          <div className="relative overflow-hidden bg-white rounded-2xl border border-[#E3E7E2] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[175px]">
            {/* Background Mountains at the bottom */}
            <div className="absolute inset-x-0 bottom-0 h-[85px] pointer-events-none select-none overflow-hidden [mask-image:linear-gradient(to_top,black_50%,transparent_100%)]">
              <img src={heroMountains} alt="" className="w-full h-full object-cover object-[center_60%] opacity-80" />
            </div>

            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#D6EFE0] flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-[#0E6636]" />
                  </div>
                  <h3 className="text-[14px] font-serif font-bold text-[#14211B]">AI Tip for You</h3>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-[#FEF3C7] text-[#D97706]">
                  New
                </span>
              </div>

              <p className="text-[11.5px] text-[#374151] leading-relaxed">
                To accelerate your progress, focus on completing <strong className="text-[#14211B]">"Production MLOps"</strong> and <strong className="text-[#14211B]">"Building AI Agents"</strong>. Together, they can increase your job-readiness by <strong className="text-[#0E6636]">~37%</strong>.
              </p>
            </div>

            <div className="relative z-10 pt-3">
              <button
                type="button"
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#EAF6EC] hover:bg-[#DDF2E0] text-[#0E6636] border border-[#BCE1CA] text-[11px] font-bold transition-colors shadow-2xs"
              >
                <PlayCircle className="w-3.5 h-3.5 text-[#0E6636]" />
                <span>See a Personalized Learning Plan</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
