import { ReserveLink } from '../../components/ReservationPopup';
import { useWorkshopBookmarks } from './savedWorkshops';
import { useAuth } from '../../context/AuthContext';
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
import defaultWorkshopImage from '../../assets/featured-desk-clean.jpg';
import featuredMountainRight from '../../assets/featured-banner-mountains.jpg';

interface DisplayWorkshop {
  id: string;
  title: string;
  tag: string;
  format?: string;
  level?: string;
  createdAt?: string;
  priceAmount?: number;
  rating: number;
  reviewsCount: number;
  description: string;
  date: string;
  duration: string;
  seats: string;
  instructorName: string;
  price: string;
  image?: string | null;
}

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
  const { user } = useAuth();
  const { saved, busy: savingBookmark, error: bookmarkError, toggle: toggleBookmark } = useWorkshopBookmarks(user?.id);
  const bookmarked = Object.fromEntries(saved.map(item => [item.id, true]));
  const workshopLink = (id: string) => serverWorkshops.some(w => w.id === id) ? '/workshops/' + id : '/workshops';
  const [format, setFormat] = useState('');
  const [level, setLevel] = useState('');
  const [month, setMonth] = useState('');
  const [price, setPrice] = useState('');
  const [onlySaved, setOnlySaved] = useState(false);
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

  const workshopsList = useMemo<DisplayWorkshop[]>(() => serverWorkshops.length
    ? serverWorkshops.map(w => ({
      id: w.id, title: w.title, description: w.description, tag: w.category, level: w.difficulty,
      rating: 0, reviewsCount: 0, createdAt: w.created_at,
      date: new Date(w.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      duration: `${w.duration_hours} hours`, seats: `${w.total_seats - w.remaining_seats} / ${w.total_seats}`,
      instructorName: w.instructor_name || 'Workshop instructor',
      price: new Intl.NumberFormat('en-US', { style: 'currency', currency: w.currency }).format(w.price_cents / 100),
      priceAmount: w.price_cents / 100, image: w.image_url?.trim() || defaultWorkshopImage,
    }))
    : [], [serverWorkshops]);

  const upcomingWorkshops = serverWorkshops
    .filter(workshop => workshop.remaining_seats > 0 && Date.parse(workshop.scheduled_at) > Date.now())
    .sort((a, b) => Date.parse(a.scheduled_at) - Date.parse(b.scheduled_at));
  const featured = workshopsList.find(workshop => workshop.id === upcomingWorkshops[0]?.id);

  const monthOf = (date: string) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  const priceOf = (item: DisplayWorkshop) => item.priceAmount ?? Number(item.price.slice(1));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const filteredWorkshops = workshopsList.filter(item => {
    const query = searchQuery.trim().toLowerCase();
    const [taken, capacity] = item.seats.split('/').map(Number);
    const category = CATEGORIES.find(c => c.id === activeCategory)?.name ?? activeCategory;
    return [item.title, item.description, item.instructorName, item.tag].join(' ').toLowerCase().includes(query)
      && (activeCategory === 'all' || category.toLowerCase() === item.tag.toLowerCase())
      && (!format || item.format === format) && (!level || item.level === level)
      && (!month || monthOf(item.date) === month)
      && (!price || (price === 'Under 50' ? priceOf(item) < 50 : priceOf(item) >= 50))
      && (!onlySaved || bookmarked[item.id])
      && (activeFilter !== 'upcoming' || Date.parse(item.date) >= today.getTime())
      && (activeFilter !== 'available' || taken < capacity)
      && (activeFilter !== 'top_rated' || item.rating >= 4.8)
      && (activeFilter !== 'new' || (item.createdAt && Date.parse(item.createdAt) >= today.getTime() - 30 * 86400000));
  });
  if (sortBy === 'Highest Rated') filteredWorkshops.sort((a,b) => b.rating - a.rating);
  if (sortBy === 'Earliest Date') filteredWorkshops.sort((a,b) => Date.parse(a.date) - Date.parse(b.date));
  if (sortBy === 'Lowest Price') filteredWorkshops.sort((a,b) => priceOf(a) - priceOf(b));

  return (
    <div className="space-y-4">
      {bookmarkError && <p role="alert" className="text-xs text-red-700">{bookmarkError}</p>}
      
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
            type="button" onClick={() => document.getElementById('discover-results')?.scrollIntoView({ block: 'start' })}
            className="inline-flex items-center justify-center px-6 py-2 rounded-lg bg-[#0B6B35] hover:bg-[#08572B] text-white text-[13px] font-semibold transition-colors shrink-0"
          >
            Search
          </button>
        </div>
      </div>

      {/* 3. Primary Filter Chips Row */}
      <div className="flex items-center gap-1 flex-wrap text-xs">
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
          { label: 'All Formats', value: format, set: setFormat, options: workshopsList.map(w => w.format) },
          { label: 'All Levels', value: level, set: setLevel, options: workshopsList.map(w => w.level) },
          { label: 'Any Date', value: month, set: setMonth, options: workshopsList.map(w => monthOf(w.date)) },
          { label: 'Any Price', value: price, set: setPrice, options: ['Under 50', '50 and above'] },
        ].map(d => (
          <select key={d.label} aria-label={d.label} value={d.value} onChange={e => d.set(e.target.value)}
            className="rounded-lg bg-white border px-2 py-1.5 text-[11px]">
            <option value="">{d.label}</option>
            {[...new Set(d.options)].filter(Boolean).map(option => <option key={option}>{option}</option>)}
          </select>
        ))}

        <button
          type="button"
          onClick={() => {
            setActiveFilter('all');
            setActiveCategory('all');
            setSearchQuery(''); setFormat(''); setLevel(''); setMonth(''); setPrice(''); setOnlySaved(false); setSortBy('Most Relevant');
          }}
          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white border border-[#E3E7E2] text-[11px] whitespace-nowrap font-medium text-[#1F2A24] hover:text-[#0E6636] transition-colors shrink-0 ml-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* 4. Secondary Category Bar */}
      <div className="flex items-center justify-between gap-1 rounded-xl bg-[#F3F5F3] p-1 flex-wrap">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => { setActiveCategory(cat.id); setOnlySaved(false); }}
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

        <select aria-label="More workshop filters" className="rounded-lg bg-white text-xs p-2" value={onlySaved ? 'saved' : CATEGORIES.some(c => c.id === activeCategory) ? '' : activeCategory}
          onChange={e => { setOnlySaved(e.target.value === 'saved'); setActiveCategory(e.target.value && e.target.value !== 'saved' ? e.target.value : 'all'); }}>
          <option value="">More</option><option value="saved">Saved workshops</option>
          {[...new Set(workshopsList.map(w => w.tag))].filter(tag => !CATEGORIES.some(c => c.name.toLowerCase() === tag.toLowerCase())).map(tag => <option key={tag}>{tag}</option>)}
        </select>
      </div>

      {featured && (
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
          {featured.image && <img
            src={featured.image}
            alt={featured.title}
            className="absolute inset-0 w-full h-full object-cover object-[62%_60%]"
          />}
          <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-r from-transparent to-[#0B5530]/70" />
          <span className="absolute top-3 left-6 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF6EC] border border-[#B9DFC2] text-[#0E6636] text-[10px] font-bold uppercase tracking-wide shadow-sm">
            <Star className="w-3 h-3" />
            Featured Workshop
          </span>
        </div>

        {/* Center text */}
        <div className="relative z-10 flex-1 min-w-0 px-5 py-4 flex flex-col justify-center gap-1.5">
          <h2 className="text-[22px] sm:text-[24px] font-serif font-bold text-white leading-tight">
            {featured.title}
          </h2>
          <p className="text-[12.5px] text-white/90 leading-snug max-w-[520px]">
            {featured.description}
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11.5px] text-white pt-1.5">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{featured.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{featured.duration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>{featured.seats} seats</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-white/70 text-white text-[10.5px] font-medium">
              <BarChart2 className="w-3 h-3" />
              {featured.level}
            </span>
          </div>

          <p className="pt-1.5 text-[12.5px] font-bold text-white">{featured.instructorName}</p>
        </div>

        {/* Right CTAs */}
        <div className="relative z-10 px-6 py-4 flex flex-col justify-center gap-2.5 shrink-0 w-full md:w-[230px]">
          <ReserveLink
                      workshopId={featured.id}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-[#F1FFF6] text-[#0B5530] text-[12.5px] font-bold transition-all shadow-sm whitespace-nowrap"
          >
            <span>Reserve My Seat</span>
            <ArrowRight className="w-4 h-4" />
          </ReserveLink>
          <button
            type="button"
            disabled={savingBookmark} onClick={() => toggleBookmark(featured.id)} aria-pressed={!!bookmarked[featured.id]}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-white/80 bg-[#0E5F35]/55 backdrop-blur-[2px] hover:bg-[#0E5F35]/75 text-white text-[12.5px] font-semibold transition-colors whitespace-nowrap"
          >
            <Bookmark className="w-4 h-4" />
            <span>{bookmarked[featured.id] ? 'Saved' : 'Save for Later'}</span>
          </button>
        </div>
      </div>

      )}

      {/* 6. Section Header: "All Workshops" + Count Badge + Sort Dropdown + View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2.5">
          <h3 id="discover-results" className="text-base font-bold text-[#1A2621]">All Workshops</h3>
          <span className="px-2.5 py-0.5 rounded-full bg-[#EBF9EA] border border-[#C5DFD0] text-[#0E6636] text-[11px] font-bold">
            {filteredWorkshops.length} workshops
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
      <div className={viewMode === 'list' ? "grid grid-cols-1 gap-3" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"}>
        {!filteredWorkshops.length && <p className="text-sm text-gray-600">No workshops match these filters.</p>}
        {filteredWorkshops.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-[#E5E7E0] overflow-hidden hover:border-[#0E6636]/50 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between group"
          >
            {/* Top Thumbnail with Tag & Rating Pill */}
            <div className="relative h-32 w-full overflow-hidden bg-gray-100 shrink-0">
              {item.image && <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />}
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
                <span>{item.reviewsCount ? item.rating : 'Unrated'}</span>
                <span className="text-gray-400 font-normal">({item.reviewsCount})</span>
              </span>
            </div>

            {/* Middle Content */}
            <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-xs text-[#1A2621] leading-snug line-clamp-2 group-hover:text-[#0E6636] transition-colors">
                  <Link to={workshopLink(item.id)}>
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

                <div className="min-w-0 flex-1 leading-none">
                  <div className="flex items-center gap-1">
                    <span className="text-[10.5px] font-bold text-[#1A2621] truncate">{item.instructorName}</span>
                    <CheckCircle2 className="w-3 h-3 text-[#17773A] shrink-0" />
                  </div>
                </div>
              </div>

              {/* Price & Reserve Action Button */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-sm font-bold text-[#1A2621]">
                  {item.price}
                </div>

                <div className="flex items-center gap-1.5">
                  <ReserveLink
                      workshopId={item.id}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#17773A] hover:bg-[#0E6636] text-white text-[10.5px] font-bold transition-colors shadow-2xs"
                  >
                    <span>Reserve</span>
                    <ArrowRight className="w-3 h-3" />
                  </ReserveLink>

                  <button
                    type="button"
                    disabled={savingBookmark}
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
