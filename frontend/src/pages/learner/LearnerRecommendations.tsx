import { ReserveLink } from '../../components/ReservationPopup';
import './LearnerRecommendations.css';
import { LearningAdvisor } from '../../components/LearningAdvisor';
import { api, subscribeSync } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Workshop } from '../../types';
import React, { useEffect, useState } from 'react';
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
  instructor?: string;
  language?: string | null;
  price?: string;
  seats?: number;
  unresolved?: string[];
  image: string;
  hasUploadedCover: boolean;
  reasons: string[];
  primaryAction: 'reserve' | 'details';
}

function workshopImage(workshop: Workshop) {
  if (workshop.image_url) return workshop.image_url;
  const subject = `${workshop.title} ${workshop.category}`.toLowerCase();
  if (/langgraph|agents/.test(subject)) return matchAgents;
  if (/spatial|geoai/.test(subject)) return matchSpatial;
  if (/python/.test(subject)) return matchPython;
  return matchMlops;
}

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

  const { user } = useAuth();
  const [live, setLive] = useState<RecommendedWorkshop[] | null>(null);
  const [upcoming, setUpcoming] = useState<Workshop[]>([]);
  const [sort, setSort] = useState('Best Match');
  const [details, setDetails] = useState<RecommendedWorkshop | null>(null);
  const [editing, setEditing] = useState(false);
  const [plan, setPlan] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [savingInterests, setSavingInterests] = useState(false);
  const [matchError, setMatchError] = useState('');
  useEffect(() => {
    let current = true;
    api.getWorkspaceSettings().then(({ learner }) => {
      if (current) setInterests(learner?.preferences?.interests ?? user?.profile?.skills_interested ?? []);
    }).catch(() => { if (current) setMatchError('Unable to load your learning interests.'); });
    return () => { current = false; };
  }, [user?.id]);
  useEffect(() => {
    let current = true;
    let generation = 0;
    setLive(null);
    const refresh = async () => {
      if (!user) return;
      const request = ++generation;
      try {
        const rows = await api.getRecommendations();
        if (!current || request !== generation) return;
        setLive(rows.map(({ workshop: w, alignment_percentage, reasons, unresolved_constraints }: {
          workshop: Workshop; alignment_percentage: number; reasons: string[]; unresolved_constraints?: string[];
        }) => ({
          id: w.id, tag: w.category, title: w.title, description: w.description,
          date: new Date(w.scheduled_at).toLocaleString('en-US', {dateStyle: 'medium', timeStyle: 'short'}),
          duration: `${w.duration_hours} hours`, level: w.difficulty, compatibility: alignment_percentage,
          instructor: w.merchant_name, language: w.language,
          price: new Intl.NumberFormat(undefined, {style: 'currency', currency: w.currency}).format(w.price_cents / 100),
          seats: w.remaining_seats, unresolved: unresolved_constraints,
          image: workshopImage(w), hasUploadedCover: Boolean(w.image_url), reasons, primaryAction: 'reserve',
        })));
        setMatchError('');
        if (rows.length) {
          setUpcoming([]);
          return;
        }

        const workshops = await api.getWorkshops().catch(() => []);
        if (!current || request !== generation) return;
        setUpcoming(workshops
          .filter(workshop => workshop.remaining_seats > 0 && Date.parse(workshop.scheduled_at) > Date.now())
          .sort((a, b) => Date.parse(a.scheduled_at) - Date.parse(b.scheduled_at))
          .slice(0, 3));
      } catch {
        if (current && request === generation) setMatchError('Unable to load recommendations.');
      }
    };
    void refresh();
    const unsubscribe = subscribeSync(['demands', 'workshops', 'reservations'], refresh);
    window.addEventListener('focus', refresh);
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void refresh();
    }, 60_000);
    return () => {
      current = false;
      unsubscribe();
      window.removeEventListener('focus', refresh);
      window.clearInterval(timer);
    };
  }, [user?.id, interests]);
  const matches = live ?? [];
  const hours = (item: RecommendedWorkshop) => Number(item.duration.match(/[\d.]+/)?.[0] || 0);
  const groups = {
    all: matches,
    recommended: matches.filter(item => item.compatibility >= 90),
    gap: matches.filter(item => /gap|complementary|skill/i.test(item.reasons.join(' '))),
    career: matches.filter(item => /goal|career/i.test(item.reasons.join(' '))),
    quick: matches.filter(item => hours(item) <= 4),
  };
  const visible = [...groups[activeFilter]].sort((a,b) => sort === 'Shortest first' ? hours(a) - hours(b) : b.compatibility - a.compatibility);
  async function toggleInterest(label: string) {
    if (savingInterests) return;
    const next = interests.includes(label) ? interests.filter(i => i !== label) : [...interests, label];
    setSavingInterests(true);
    setMatchError('');
    try {
      await api.updateLearnerSettings({ preferences: { interests: next } });
      setInterests(next);
    } catch {
      setMatchError('Unable to save your learning interests.');
    } finally {
      setSavingInterests(false);
    }
  }
  return (
    <div className="grid min-w-0 items-start gap-4 text-[#1A2621] xl:grid-cols-[minmax(0,1fr)_minmax(16rem,24%)]"><div className="min-w-0 space-y-3.5">
      {/* 1. Hero Header */}
      <div className="relative min-h-[96px] overflow-hidden rounded-xl">
        <div className="absolute right-0 -top-4 h-[130px] w-[58%] pointer-events-none select-none overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_35%),linear-gradient(to_bottom,black_65%,transparent_100%)] [mask-composite:intersect] [-webkit-mask-composite:source-in]">
          <img src={heroMountains} alt="" className="w-full h-full object-cover object-[right_62%]" />
        </div>
        <div className="relative z-10 pt-0.5 max-w-[640px]">
          <div className="flex items-center gap-2">
          <h1 className="text-[26px] leading-tight font-serif font-bold text-[#14211B] flex items-center gap-2">
            AI Matches
          </h1>
          <Sparkles className="h-6 w-6 text-amber-500" aria-hidden="true" />
          </div>
          <p className="mt-1 text-[13px] text-[#4B5563] leading-snug">
            Intelligent, personalized learning recommendations powered by AI.<br />
            Discover the right workshops to build your skills, achieve your goals, and grow faster.
          </p>
        </div>
      </div>

      {matchError && <p role="alert" className="text-xs text-red-700">{matchError}</p>}

      {/* 2. Top Banner & Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-[1.18fr_1fr] gap-2">
        {/* Left AI Insight Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#EAF6ED] via-[#F2FBF4] to-[#F8FDF9] border border-[#CDE5D4] p-4 flex items-start gap-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="w-11 h-11 rounded-full bg-[#D6EFE0] border border-[#BCE1CA] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#0E6636]" />
          </div>
          <img src={heroMountains} alt="" className="absolute bottom-0 right-0 h-14 w-40 object-cover opacity-40 [mask-image:linear-gradient(to_right,transparent,black)]" />
          <div className="relative min-w-0 pr-2">
            <h2 className="text-[15px] font-bold text-[#14211B] leading-tight">Your AI Learning Insight</h2>
            <p className="text-[11.5px] text-[#374151] leading-relaxed mt-1">
              {matches[0]?.reasons.join(' ') || 'Recommendations appear when a published workshop with open seats fits your learning request.'}
            </p>
          </div>
        </div>

        <div className="matches-summary grid grid-cols-3 items-stretch rounded-2xl border bg-white py-3 divide-x">
        {/* Stat 1: 12 AI Matches */}
        <div className="flex flex-col items-center justify-center gap-1 px-1 text-center">
          <div className="flex items-center justify-between">
            <Layers className="w-5 h-5 text-[#0E6636]" strokeWidth={1.8} />
          </div>
          <div>
            <div className="text-[28px] font-bold font-serif text-[#14211B] leading-none">{matches.length}</div>
            <div className="text-[11px] text-[#4B5563] mt-1 font-medium">AI Matches</div>
          </div>
          <div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#E3F4E6] text-[#0E7A3C] text-[10px] font-bold">
              Matched
            </span>
          </div>
        </div>

        {/* Stat 2: 92% Avg. Compatibility */}
        <div className="flex flex-col items-center justify-center gap-1 px-1 text-center">
          <div className="flex items-center justify-between">
            <Target className="w-5 h-5 text-[#0E6636]" strokeWidth={1.8} />
          </div>
          <div>
            <div className="text-[28px] font-bold font-serif text-[#14211B] leading-none">{matches.length ? Math.round(matches.reduce((n,r) => n+r.compatibility,0)/matches.length) : 0}%</div>
            <div className="flex items-center gap-1 text-[11px] text-[#4B5563] mt-1 font-medium">
              <span>Avg. Compatibility</span>
              <Info className="w-3 h-3 text-[#9CA3AF]" />
            </div>
          </div>
          <div className="h-5" />
        </div>

        {/* Stat 3: +37% Skill Growth Potential */}
        <div className="flex flex-col items-center justify-center gap-1 px-1 text-center">
          <div className="flex items-center justify-between">
            <TrendingUp className="w-5 h-5 text-[#0E6636]" strokeWidth={1.8} />
          </div>
          <div>
            <div className="text-[28px] font-bold font-serif text-[#14211B] leading-none">—</div>
            <div className="flex items-center gap-1 text-[11px] text-[#4B5563] mt-1 font-medium">
              <span>Skill Growth Potential</span>
              <Info className="w-3 h-3 text-[#9CA3AF]" />
            </div>
          </div>
          <div className="h-5" />
        </div>
      </div>

      </div>

      {/* 3. Filters / Refine Matches Row */}
      <div className="match-toolbar">
        <div className="match-toolbar-filters">
          <div className="flex items-center gap-1.5 text-[#14211B] text-[12px] font-semibold mr-1 shrink-0">
            <Filter className="w-4 h-4 text-[#0E6636]" strokeWidth={2} />
            <span>Refine Matches</span>
          </div>

          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            aria-pressed={activeFilter === 'all'}
            className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-full text-[11.5px] font-semibold transition-all shrink-0 border ${
              activeFilter === 'all'
                ? 'bg-[#0E6636] text-white border-[#0E6636]'
                : 'bg-white hover:bg-[#F6F8F7] text-[#1F2A24] border-[#E3E7E2]'
            }`}
          >
            <span>All Matches</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeFilter === 'all' ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-700'
            }`}>
              {matches.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('recommended')}
            aria-pressed={activeFilter === 'recommended'}
            className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-full text-[11.5px] font-semibold transition-all shrink-0 border ${
              activeFilter === 'recommended'
                ? 'bg-[#0E6636] text-white border-[#0E6636]'
                : 'bg-white hover:bg-[#F6F8F7] text-[#1F2A24] border-[#E3E7E2]'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Recommended for You</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">{groups.recommended.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('gap')}
            aria-pressed={activeFilter === 'gap'}
            className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-full text-[11.5px] font-semibold transition-all shrink-0 border ${
              activeFilter === 'gap'
                ? 'bg-[#0E6636] text-white border-[#0E6636]'
                : 'bg-white hover:bg-[#F6F8F7] text-[#1F2A24] border-[#E3E7E2]'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 text-[#0E6636]" />
            <span>Skill Gap</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">{groups.gap.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('career')}
            aria-pressed={activeFilter === 'career'}
            className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-full text-[11.5px] font-semibold transition-all shrink-0 border ${
              activeFilter === 'career'
                ? 'bg-[#0E6636] text-white border-[#0E6636]'
                : 'bg-white hover:bg-[#F6F8F7] text-[#1F2A24] border-[#E3E7E2]'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-[#0E6636]" />
            <span>Career Goal</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">{groups.career.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('quick')}
            aria-pressed={activeFilter === 'quick'}
            className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-full text-[11.5px] font-semibold transition-all shrink-0 border ${
              activeFilter === 'quick'
                ? 'bg-[#0E6636] text-white border-[#0E6636]'
                : 'bg-white hover:bg-[#F6F8F7] text-[#1F2A24] border-[#E3E7E2]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Quick Wins</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">{groups.quick.length}</span>
          </button>
        </div>

        <label className="match-toolbar-sort">
          <span>Sort by:</span>
          <select aria-label="Sort matches" value={sort} onChange={e => setSort(e.target.value)}><option>Best Match</option><option>Shortest first</option></select>
        </label>
      </div>

      {/* 4. Recommendations */}
      <div className="rounded-2xl border bg-white p-2.5">
        {/* Recommended Learning Opportunities */}
        <div className="space-y-3 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0E6636]" strokeWidth={2} />
              <h2 className="text-[15px] font-serif font-bold text-[#14211B]">Recommended Learning Opportunities</h2>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#6B7280]">
              <span>{visible.length} matches • Based on your learning profile</span>
              <Info className="w-3 h-3 text-[#9CA3AF]" />
            </div>
          </div>

          <div className="match-results space-y-2.5">
            {!matchError && !visible.length && <p className="p-4 text-sm">{live === null ? "Finding workshops…" : matches.length ? "No workshops match this filter." : "No available workshops match your current demands or interests."}</p>}
            {visible.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#E3E7E2] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)] match-result items-center gap-3 hover:border-[#0E6636]/40 transition-colors"
              >
                {/* Thumbnail */}
                <div className="match-result-image aspect-[3/2] w-full rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <img src={item.image} alt={item.title} className={`w-full h-full ${item.hasUploadedCover ? "object-contain" : "object-cover"}`} />
                </div>

                {/* Middle-left: Title, description, meta */}
                <div className="match-result-details min-w-0 space-y-1">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-[#EAF6EC] text-[#0E6636] font-semibold text-[9.5px]">
                    {item.tag}
                  </span>
                  <h3 className="text-[13.5px] font-bold text-[#14211B] leading-tight">
                    <button onClick={() => setDetails(item)} className="text-left hover:text-[#0E6636]">
                      {item.title}
                    </button>
                  </h3>
                  <p className="text-[10.5px] text-[#4B5563] leading-snug line-clamp-2">
                    {item.description}
                  </p>
                  <p className="text-[10.5px] text-[#4B5563]">{[item.instructor, item.language, item.price, item.seats === undefined ? undefined : `${item.seats} seats available`].filter(Boolean).join(' · ')}</p>

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
                <div className="match-result-score flex justify-center">
                  <CompatibilityGauge value={item.compatibility} />
                </div>

                {/* Middle-right: Why this matches you */}
                <div className="match-result-reasons min-w-0 space-y-1 border-[#E5E7EB]">
                  <div className="flex items-center gap-1.5 text-[#0E6636] text-[10.5px] font-bold">
                    <Sparkles className="w-3 h-3" />
                    <span>Why this matches you</span>
                  </div>
                  <ul className="space-y-0.5">
                    {[...item.reasons, ...(item.unresolved ?? [])].map((r) => (
                      <li key={r} className="flex items-start gap-1 text-[9.5px] text-[#374151] leading-tight">
                        <Check className="w-2.5 h-2.5 text-[#0E6636] shrink-0 mt-0.5" strokeWidth={2.5} />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right Actions */}
                <div className="match-result-actions flex items-center gap-1.5">
                  <div className="match-result-buttons flex gap-1.5">
                    {item.primaryAction === 'reserve' ? (
                      <>
                        <ReserveLink
                      workshopId={item.id}
                          className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-b from-[#098040] to-[#07572E] hover:brightness-105 text-white text-[11px] font-semibold shadow-sm transition-colors whitespace-nowrap"
                        >
                          <span>Reserve Seat</span>
                          <ArrowRight className="w-3 h-3" />
                        </ReserveLink>
                        <button onClick={() => setDetails(item)}
                          className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E3E7E2] bg-[#F8FAF8] hover:bg-[#EDF5EF] text-[#0E6636] text-[11px] font-semibold shadow-sm transition-colors whitespace-nowrap"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3 h-3 text-gray-400" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setDetails(item)}
                          className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-b from-[#098040] to-[#07572E] hover:brightness-105 text-white text-[11px] font-semibold shadow-sm transition-colors whitespace-nowrap"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <ReserveLink
                      workshopId={item.id}
                          className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E3E7E2] bg-[#F8FAF8] hover:bg-[#EDF5EF] text-[#0E6636] text-[11px] font-semibold shadow-sm transition-colors whitespace-nowrap"
                        >
                          <Calendar className="w-3 h-3 text-[#0E6636]" />
                          <span>Reserve Seat</span>
                        </ReserveLink>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label={`More about ${item.title}`} onClick={() => setDetails(item)}
                    className="p-1 rounded-full border border-[#E3E7E2] bg-white text-[#14211B] shadow-sm hover:bg-gray-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

          {live?.length === 0 && upcoming.length > 0 && (
            <section className="rounded-2xl border border-[#E3E7E2] bg-white p-4">
              <h2 className="font-serif text-base font-bold">Upcoming Workshops</h2>
              <ul className="mt-2 divide-y">
                {upcoming.map(workshop => (
                  <li key={workshop.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <Link className="font-semibold text-[#0E6636] hover:underline" to={`/workshops/${workshop.id}`}>
                      {workshop.title}
                    </Link>
                    <span className="shrink-0 text-gray-600">
                      {new Date(workshop.scheduled_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
      </div>
        {/* Insights & Profile Context */}
        <aside aria-label="Learning profile" className="grid min-w-0 gap-3.5 sm:grid-cols-2 xl:grid-cols-1">
          {/* Card 1: Your Interests */}
          <div className="bg-white rounded-2xl border border-[#E3E7E2] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#0E6636]" strokeWidth={2} />
                <h3 className="text-[14px] font-serif font-bold text-[#14211B]">Your Interests</h3>
              </div>
              <button
                type="button" onClick={() => setEditing(!editing)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-[#E3E7E2] text-[11px] font-medium text-[#14211B] hover:border-[#0E6636]/40 transition-colors"
              >
                <Pencil className="w-3 h-3 text-[#0E6636]" />
                <span>{editing ? 'Done' : 'Edit'}</span>
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {[...new Set([...INTERESTS.map(i => i.label), ...interests])].filter(label => editing || interests.includes(label)).map(label => INTERESTS.find(i => i.label === label) || { label, icon: Brain }).map((item) => {
                const Icon = item.icon;
                return (
                  <span
                    key={item.label}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#edf7ef] border border-[#E3E7E2] text-[10.5px] font-medium text-[#1F2A24]"
                  >
                    <Icon className="w-3.5 h-3.5 text-[#0E6636]" />
                    {editing && <input aria-label={item.label} type="checkbox" checked={interests.includes(item.label)} onChange={() => toggleInterest(item.label)} />}<span>{item.label}</span>
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
              <p className="text-xs text-gray-600">Skill assessments are unavailable for this profile.</p>
            </div>
          </div>

          {/* Card 3: AI Tip for You */}
          <div className="relative overflow-hidden bg-white rounded-2xl border border-[#E3E7E2] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between sm:col-span-2 lg:col-span-1 pb-10">
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
                {matches[0] ? `Start with ${matches[0].title}, your highest-ranked workshop.` : 'Check your budget, language, level, and format against the workshop listing.'}
              </p>
            </div>

            <div className="relative z-10 pt-3">
              <button
                type="button" onClick={() => setPlan(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#EAF6EC] hover:bg-[#DDF2E0] text-[#0E6636] border border-[#BCE1CA] text-[11px] font-bold transition-colors shadow-2xs"
              >
                <PlayCircle className="w-3.5 h-3.5 text-[#0E6636]" />
                <span>See a Personalized Learning Plan</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </div>
        </aside>
      <LearningAdvisor iconOnly />
      {(details || plan) && <dialog ref={node => { if (node && !node.open) node.showModal(); }} onCancel={() => { setDetails(null); setPlan(false); }} className="max-w-md rounded-2xl p-6 shadow-xl backdrop:bg-black/30">
        <h2 className="font-serif text-xl font-bold">{details?.title || 'Your learning plan'}</h2>
        {details ? <div className="my-4 space-y-2 text-sm"><p>{details.description}</p><p>{details.date} · {details.duration} · {details.level}</p><ul className="list-disc pl-5">{details.reasons.map(r => <li key={r}>{r}</li>)}</ul></div>
          : <ol className="my-4 list-decimal pl-5">{matches.map(item => <li key={item.id}>{item.title} · {item.duration}</li>)}</ol>}
        <button onClick={() => { setDetails(null); setPlan(false); }} className="rounded-lg bg-green-800 px-4 py-2 text-white">Close</button>
      </dialog>}
    </div>
  );
};
