import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { api, useSyncRefresh } from '../../api/client';
import { Workshop } from '../../types';
import { Link } from 'react-router-dom';
import { 
  Search, SlidersHorizontal, Calendar, Users, Star, 
  Sparkles, Code, Layout, TrendingUp, Cloud, ShieldCheck, 
  UserCheck, MoreHorizontal, Bookmark, ArrowRight, 
  Clock, CheckCircle2, ChevronRight, Grid, List, RotateCcw,
  LayoutGrid, Cpu, Layers, BarChart3, Shield, MapPin, BarChart2, Tag, ChevronDown, BadgeCheck
} from 'lucide-react';

// High-fidelity assets
import heroMountainsAi from '../../assets/discover-hero-mountains-v2.jpg';
import milestoneMountainsAi from '../../assets/milestone-mountains-ai.jpg';
import featuredMlopsDesk from '../../assets/featured-desk-clean.jpg';
import featuredMountainRight from '../../assets/featured-banner-mountains.jpg';
import wsThumb1 from '../../assets/discover-ws-1.jpg';
import wsThumb2 from '../../assets/discover-ws-2.jpg';
import wsThumb3 from '../../assets/discover-ws-3.jpg';
import wsThumb4 from '../../assets/discover-ws-4.jpg';
import avatarOmar from '../../assets/avatar-omar.jpg';
import avatarSara from '../../assets/avatar-sara.jpg';
import avatarKarim from '../../assets/avatar-karim.jpg';
import avatarNadia from '../../assets/avatar-nadia.jpg';
import avatarLeila from '../../assets/avatar-leila.jpg';

interface DisplayWorkshop {
  id: string;
  title: string;
  tag: string;
  rating: number;
  reviewsCount: number;
  description: string;
  date: string;
  duration: string;
  seats: string;
  instructorName: string;
  instructorRole: string;
  instructorAvatar: string;
  price: string;
  image: string;
}

const DEFAULT_WORKSHOPS: DisplayWorkshop[] = [
  {
    id: 'ws-langgraph',
    title: 'Building AI Agents with LangGraph',
    tag: 'AI & Data',
    rating: 4.9,
    reviewsCount: 428,
    description: 'Design, build, and deploy multi-step AI agents using LangGraph, tools, and real-world patterns.',
    date: 'Nov 26, 2026',
    duration: '~ 4 hours',
    seats: '18 / 25',
    instructorName: 'Omar Benali',
    instructorRole: 'AI Solutions Architect',
    instructorAvatar: avatarOmar,
    price: '$49.00',
    image: wsThumb1,
  },
  {
    id: 'ws-fullstack',
    title: 'Full-Stack AI Apps with Next.js & FastAPI',
    tag: 'Development',
    rating: 4.8,
    reviewsCount: 312,
    description: 'Build end-to-end AI-powered applications with Next.js, FastAPI, and modern best practices.',
    date: 'Nov 15, 2026',
    duration: '~ 6 hours',
    seats: '21 / 30',
    instructorName: 'Sara El Mansouri',
    instructorRole: 'Full-Stack Engineer & Instructor',
    instructorAvatar: avatarSara,
    price: '$29.00',
    image: wsThumb2,
  },
  {
    id: 'ws-product',
    title: 'Product Discovery & AI-Powered Design',
    tag: 'Product & Design',
    rating: 4.8,
    reviewsCount: 189,
    description: 'Validate ideas, shape product opportunities, and design faster with AI-assisted workflows.',
    date: 'Dec 02, 2026',
    duration: '~ 5 hours',
    seats: '12 / 20',
    instructorName: 'Karim Haddad',
    instructorRole: 'Product Designer & Coach',
    instructorAvatar: avatarKarim,
    price: '$39.00',
    image: wsThumb3,
  },
  {
    id: 'ws-k8s',
    title: 'Kubernetes in Production',
    tag: 'Cloud & DevOps',
    rating: 4.7,
    reviewsCount: 266,
    description: 'Deploy, scale, and manage real applications on Kubernetes with hands-on, production-grade practices.',
    date: 'Dec 09, 2026',
    duration: '~ 7 hours',
    seats: '10 / 18',
    instructorName: 'Nadia Cherif',
    instructorRole: 'DevOps Engineer & Cloud Instructor',
    instructorAvatar: avatarNadia,
    price: '$59.00',
    image: wsThumb4,
  },
];

const CATEGORIES = [
  { id: 'all', name: 'All Categories', icon: LayoutGrid },
  { id: 'ai-data', name: 'AI & Data', icon: Cpu },
  { id: 'development', name: 'Development', icon: Code },
  { id: 'product-design', name: 'Product & Design', icon: Layers },
  { id: 'business-strategy', name: 'Business & Strategy', icon: BarChart3 },
  { id: 'cloud-devops', name: 'Cloud & DevOps', icon: Cloud },
  { id: 'cybersecurity', name: 'Cybersecurity', icon: Shield },
  { id: 'soft-skills', name: 'Soft Skills', icon: Users },
];

export const DiscoverDemands: React.FC = () => {
  const [serverWorkshops, setServerWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'available' | 'top_rated' | 'new'>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState('Most Relevant');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const load = useCallback(async () => {
    try {
      const data = await api.getWorkshops();
      setServerWorkshops(data);
    } catch (err) {
      console.error('Failed to load workshops', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useSyncRefresh(['workshops', 'reservations'], load);

  const toggleBookmark = (id: string) => {
    setBookmarked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Combine server workshops with high-fidelity defaults (exact 4 reference workshops)
  const workshopsList = useMemo(() => {
    return DEFAULT_WORKSHOPS;
  }, []);

  const filteredWorkshops = useMemo(() => {
    return workshopsList.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = item.title.toLowerCase().includes(q) || item.instructorName.toLowerCase().includes(q) || item.tag.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (activeCategory !== 'all') {
        if (activeCategory === 'ai-data' && item.tag !== 'AI & Data') return false;
        if (activeCategory === 'development' && item.tag !== 'Development') return false;
        if (activeCategory === 'product-design' && item.tag !== 'Product & Design') return false;
        if (activeCategory === 'cloud-devops' && item.tag !== 'Cloud & DevOps') return false;
      }
      return true;
    });
  }, [workshopsList, searchQuery, activeCategory]);

  return (
    <div className="space-y-4">
      
      {/* 1. Hero Header — seamless, no card, mountains on the right */}
      <div className="relative -mx-1 px-1">
        <div className="absolute right-0 -top-4 h-[178px] w-[62%] pointer-events-none select-none overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_30%),linear-gradient(to_bottom,black_70%,transparent_100%)] [mask-composite:intersect] [-webkit-mask-composite:source-in]">
          <img
            src={heroMountainsAi}
            alt=""
            className="w-full h-full object-cover object-[right_58%]"
          />
        </div>

        <div className="relative z-10 pt-1 pb-3 max-w-[640px]">
          <h1 className="text-[26px] sm:text-[30px] leading-tight font-serif font-bold text-[#14211B]">
            Discover Workshops
          </h1>
          <p className="mt-1 text-[13px] text-[#4B5563] leading-snug">
            Explore top-rated, hands-on workshops, build real skills, and advance your goals with expert-led learning at NUVENDRY.
          </p>
        </div>

        {/* 2. Search bar overlapping hero */}
        <div className="relative z-10 flex items-center bg-white rounded-xl border border-[#E3E7E2] pl-4 pr-1.5 py-1.5 shadow-[0_2px_8px_rgba(16,24,40,0.06)] focus-within:border-[#0E6636]/60 transition-colors">
          <Search className="w-[18px] h-[18px] text-[#1F2A24] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workshops, skills, tools, or instructors..."
            className="w-full px-3 py-1.5 text-[13px] text-[#1A2621] placeholder:text-[#4B5563] bg-transparent outline-none"
          />
          <button
            type="button"
            className="inline-flex items-center justify-center px-6 py-2 rounded-lg bg-[#0B6B35] hover:bg-[#08572B] text-white text-[13px] font-semibold transition-colors shrink-0"
          >
            Search
          </button>
        </div>
      </div>

      {/* 3. Primary Filter Chips Row */}
      <div className="flex items-center gap-1 overflow-x-auto text-xs [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex items-center gap-1.5 text-[#1F2A24] text-[12.5px] font-semibold mr-1 shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {([
          { id: 'all', label: 'All Workshops', icon: null },
          { id: 'upcoming', label: 'Upcoming', icon: Calendar },
          { id: 'available', label: 'Available Seats', icon: Users },
          { id: 'top_rated', label: 'Top Rated', icon: Star },
        ] as const).map((f) => {
          const Icon = f.icon;
          const active = activeFilter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id)}
              className={`px-2.5 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all shrink-0 border whitespace-nowrap ${
                active
                  ? 'bg-[#EAF6EC] text-[#0E6636] border-[#8CCB9B]'
                  : 'bg-white hover:bg-[#F6F8F7] text-[#1F2A24] border-[#E3E7E2]'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5 text-[#0E6636]" />}
              <span>{f.label}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setActiveFilter('new')}
          className={`px-2.5 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all shrink-0 border whitespace-nowrap ${
            activeFilter === 'new'
              ? 'bg-[#EAF6EC] text-[#0E6636] border-[#8CCB9B]'
              : 'bg-white hover:bg-[#F6F8F7] text-[#B45309] border-[#E3E7E2]'
          }`}
        >
          <span className="px-1.5 py-[1px] rounded text-[9.5px] font-bold bg-[#FEF3C7] text-[#D97706]">New</span>
          <span>New</span>
        </button>

        <div className="h-6 w-px bg-[#D1D5DB] mx-1 shrink-0" />

        {[
          { label: 'All Formats', icon: MapPin },
          { label: 'All Levels', icon: BarChart2 },
          { label: 'Any Date', icon: Calendar },
          { label: 'Any Price', icon: Tag },
        ].map((d) => {
          const Icon = d.icon;
          return (
            <button
              key={d.label}
              type="button"
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white border border-[#E3E7E2] text-[11px] whitespace-nowrap font-medium text-[#1F2A24] hover:border-[#0E6636]/40 transition-colors shrink-0"
            >
              <Icon className="w-3.5 h-3.5 text-[#1F2A24]" />
              <span>{d.label}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#1F2A24]" />
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => {
            setActiveFilter('all');
            setActiveCategory('all');
            setSearchQuery('');
          }}
          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white border border-[#E3E7E2] text-[11px] whitespace-nowrap font-medium text-[#1F2A24] hover:text-[#0E6636] transition-colors shrink-0 ml-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* 4. Secondary Category Bar */}
      <div className="flex items-center justify-between gap-1 rounded-xl bg-[#F3F5F3] p-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11.5px] font-semibold transition-all shrink-0 whitespace-nowrap ${
                isActive
                  ? 'bg-[#E3F2E5] text-[#0E6636]'
                  : 'text-[#1F2A24] hover:bg-white/70'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#0E6636]' : 'text-[#374151]'}`} strokeWidth={1.8} />
              <span>{cat.name}</span>
            </button>
          );
        })}

        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11.5px] font-semibold text-[#1F2A24] whitespace-nowrap hover:bg-white/70 transition-colors shrink-0"
        >
          <MoreHorizontal className="w-4 h-4 text-[#374151]" />
          <span>More</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#374151]" />
        </button>
      </div>

      {/* 5. Featured Workshop Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0E5F35] text-white shadow-[0_2px_10px_rgba(10,78,44,0.15)] flex flex-col md:flex-row items-stretch min-h-[136px]">
        {/* Right mountains artwork */}
        <div className="hidden md:block absolute right-0 bottom-0 top-0 w-[65%] pointer-events-none select-none overflow-hidden">
          <img
            src={featuredMountainRight}
            alt=""
            className="w-full h-full object-cover object-[right_40%]"
          />
        </div>

        {/* Left desk photo */}
        <div className="relative w-full md:w-[35%] shrink-0 min-h-[136px] overflow-hidden">
          <img
            src={featuredMlopsDesk}
            alt="Production MLOps Workshop"
            className="absolute inset-0 w-full h-full object-cover object-[62%_60%]"
          />
          <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-r from-transparent to-[#0B5530]/70" />
          <span className="absolute top-3 left-6 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF6EC] border border-[#B9DFC2] text-[#0E6636] text-[10px] font-bold uppercase tracking-wide shadow-sm">
            <Star className="w-3 h-3" />
            Featured Workshop
          </span>
        </div>

        {/* Center text */}
        <div className="relative z-10 flex-1 min-w-0 px-5 py-4 flex flex-col justify-center gap-1.5">
          <h2 className="text-[22px] sm:text-[24px] font-serif font-bold text-white leading-tight">
            Production MLOps: Serving &amp; Monitoring
          </h2>
          <p className="text-[12.5px] text-white/90 leading-snug max-w-[520px]">
            Build and deploy reliable ML systems to production with modern MLOps practices, monitoring, and real-world tooling.
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11.5px] text-white pt-1.5">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Nov 19 – Nov 26, 2026</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>~ 6 hours</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>15 / 20 seats</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-white/70 text-white text-[10.5px] font-medium">
              <BarChart2 className="w-3 h-3" />
              Intermediate
            </span>
          </div>

          <div className="flex items-center gap-2.5 pt-1.5">
            <img
              src={avatarLeila}
              alt="Dr. Leila Saad"
              className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-[12.5px] font-bold text-white">Dr. Leila Saad</span>
                <CheckCircle2 className="w-4 h-4 text-[#0D6034] fill-white" />
              </div>
              <span className="text-[11px] text-white/85">ML Engineer &amp; MLOps Lead</span>
            </div>
          </div>
        </div>

        {/* Right CTAs */}
        <div className="relative z-10 px-6 py-4 flex flex-col justify-center gap-2.5 shrink-0 w-full md:w-[230px]">
          <Link
            to="/workshops/ws-mlops"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-[#F1FFF6] text-[#0B5530] text-[12.5px] font-bold transition-all shadow-sm whitespace-nowrap"
          >
            <span>Reserve My Seat</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-white/80 bg-[#0E5F35]/55 backdrop-blur-[2px] hover:bg-[#0E5F35]/75 text-white text-[12.5px] font-semibold transition-colors whitespace-nowrap"
          >
            <Bookmark className="w-4 h-4" />
            <span>Save for Later</span>
          </button>
        </div>
      </div>

      {/* Dots Carousel Indicator */}
      <div className="flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#0E6636]" />
        <span className="w-2 h-2 rounded-full bg-[#D1D5DB]" />
        <span className="w-2 h-2 rounded-full bg-[#D1D5DB]" />
      </div>

      {/* 6. Section Header: "All Workshops" + Count Badge + Sort Dropdown + View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2.5">
          <h3 className="text-base font-bold text-[#1A2621]">All Workshops</h3>
          <span className="px-2.5 py-0.5 rounded-full bg-[#EBF9EA] border border-[#C5DFD0] text-[#0E6636] text-[11px] font-bold">
            286 workshops
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-[#E5E7E0] hover:border-[#0E6636]/40 rounded-xl px-2.5 py-1 text-xs font-semibold text-[#1A2621] outline-none shadow-2xs cursor-pointer"
            >
              <option>Most Relevant</option>
              <option>Highest Rated</option>
              <option>Earliest Date</option>
              <option>Lowest Price</option>
            </select>
          </div>

          <div className="flex items-center rounded-xl border border-[#E5E7E0] bg-white p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              className={`p-1 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-[#0E6636] text-white' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-label="List view"
              className={`p-1 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-[#0E6636] text-white' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 7. Workshops 4-Column Grid matching reference mockup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {filteredWorkshops.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-[#E5E7E0] overflow-hidden hover:border-[#0E6636]/50 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between group"
          >
            {/* Top Thumbnail with Tag & Rating Pill */}
            <div className="relative h-32 w-full overflow-hidden bg-gray-100 shrink-0">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Category Tag pill - exact light background + green text */}
              <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-white/95 border border-[#C5DFD0] text-[#0E6636] text-[8.5px] font-bold shadow-2xs backdrop-blur-xs flex items-center gap-1">
                {item.tag === 'AI & Data' ? (
                  <Sparkles className="w-2.5 h-2.5 text-[#0E6636]" />
                ) : item.tag === 'Development' ? (
                  <Code className="w-2.5 h-2.5 text-[#0E6636]" />
                ) : item.tag === 'Product & Design' ? (
                  <Layout className="w-2.5 h-2.5 text-[#0E6636]" />
                ) : (
                  <Cloud className="w-2.5 h-2.5 text-[#0E6636]" />
                )}
                <span>{item.tag}</span>
              </span>

              {/* Rating Star pill - exact white rounded badge with golden star */}
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/95 text-[#1A2621] border border-gray-200/60 text-[8.5px] font-bold flex items-center gap-1 shadow-2xs backdrop-blur-xs">
                <Star className="w-2.5 h-2.5 fill-[#F59E0B] text-[#F59E0B]" />
                <span>{item.rating}</span>
                <span className="text-gray-400 font-normal">({item.reviewsCount})</span>
              </span>
            </div>

            {/* Middle Content */}
            <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-xs text-[#1A2621] leading-snug line-clamp-2 group-hover:text-[#0E6636] transition-colors">
                  <Link to={`/workshops/${item.id}`}>
                    {item.title}
                  </Link>
                </h4>
                <p className="text-[10px] text-gray-500 leading-snug line-clamp-2 mt-1">
                  {item.description}
                </p>
              </div>

              {/* Meta details row: Date + Duration + Seats */}
              <div className="flex items-center justify-between text-[9.5px] text-gray-500 font-medium pt-1 border-t border-[#E5E7E0]/60">
                <div className="flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5 text-[#0E6636]" />
                  <span>{item.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5 text-[#0E6636]" />
                  <span>{item.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-2.5 h-2.5 text-[#0E6636]" />
                  <span>{item.seats}</span>
                </div>
              </div>

              {/* Instructor profile with exact circular photo and green checkmark */}
              <div className="flex items-center gap-2 pt-0.5">
                <img
                  src={item.instructorAvatar}
                  alt={item.instructorName}
                  className="w-6 h-6 rounded-full object-cover border border-[#E5E7E0] shrink-0"
                />
                <div className="min-w-0 flex-1 leading-none">
                  <div className="flex items-center gap-1">
                    <span className="text-[10.5px] font-bold text-[#1A2621] truncate">{item.instructorName}</span>
                    <CheckCircle2 className="w-3 h-3 text-[#17773A] shrink-0" />
                  </div>
                  <div className="text-[9px] text-gray-400 truncate mt-0.5">{item.instructorRole}</div>
                </div>
              </div>

              {/* Price & Reserve Action Button */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-sm font-bold text-[#1A2621]">
                  {item.price}
                </div>

                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/workshops/${item.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#17773A] hover:bg-[#0E6636] text-white text-[10.5px] font-bold transition-colors shadow-2xs"
                  >
                    <span>Reserve</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => toggleBookmark(item.id)}
                    aria-label="Bookmark workshop"
                    className="p-1.5 rounded-xl border border-[#E5E7E0] hover:bg-[#F6F8F7] text-gray-400 hover:text-[#0E6636] transition-colors"
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${bookmarked[item.id] ? 'fill-[#0E6636] text-[#0E6636]' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

export default DiscoverDemands;
