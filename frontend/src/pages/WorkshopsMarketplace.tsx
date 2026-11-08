import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { WorkshopCard } from '../components/WorkshopCard';
import { api, useSyncRefresh } from '../api/client';
import { Workshop } from '../types';
import { Search, Sparkles, BookOpen, X } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const CATEGORIES = ["All", "AI & LLMs", "MLOps", "Full-Stack", "Data", "DevOps"];

export const WorkshopsMarketplace: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(() => searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [selectedDateSort, setSelectedDateSort] = useState('All');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 220);
    return () => window.clearTimeout(timer);
  }, [search]);

  const fetchWorkshops = useCallback(async () => {
    setLoading(true);
    try {
      let catParam: string | undefined;
      if (selectedCategory === 'MLOps') catParam = 'MLOps';
      else if (selectedCategory === 'Full-Stack') catParam = 'React + FastAPI';
      else if (selectedCategory === 'AI & LLMs') catParam = 'LangGraph Agents';

      const data = await api.getWorkshops({
        category: catParam,
        search: debouncedSearch || undefined,
      });
      setWorkshops(data);
    } catch (err) {
      console.error('Failed to load workshops', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, debouncedSearch]);

  useEffect(() => {
    fetchWorkshops();
  }, [fetchWorkshops]);

  useSyncRefresh(['workshops', 'reservations'], fetchWorkshops);

  const filteredAndSortedWorkshops = useMemo(() => {
    let list = [...workshops];

    // Category refinement for Data / DevOps keywords on actual published records
    if (selectedCategory === 'Data') {
      list = list.filter((w) =>
        `${w.category} ${w.title} ${w.description}`.toLowerCase().match(/data|pipeline|postgres|mlops/)
      );
    } else if (selectedCategory === 'DevOps') {
      list = list.filter((w) =>
        `${w.category} ${w.title} ${w.description}`.toLowerCase().match(/devops|deploy|production|monitoring|mlops/)
      );
    }

    // Difficulty filter on actual records
    if (selectedLevel !== 'All') {
      const targetLvl = selectedLevel.toLowerCase();
      list = list.filter((w) => w.difficulty.toLowerCase().includes(targetLvl));
    }

    // Format filter on actual records
    if (selectedFormat === 'live') {
      list = list.filter((w) => w.duration_hours <= 2);
    } else if (selectedFormat === 'workshop') {
      list = list.filter((w) => w.duration_hours >= 2);
    }

    // Date & Sort filter on actual records
    if (selectedDateSort === 'weekend') {
      list = list.filter((w) => {
        const day = new Date(w.scheduled_at).getUTCDay();
        return day === 0 || day === 6 || day === 5;
      });
    } else if (selectedDateSort === 'next14') {
      const timestamps = list.map((w) => new Date(w.scheduled_at).getTime()).filter((t) => !isNaN(t));
      const anchor = timestamps.length > 0 ? Math.min(...timestamps) : Date.now();
      const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
      list = list.filter((w) => {
        const t = new Date(w.scheduled_at).getTime();
        return t - anchor <= fourteenDaysMs;
      });
    } else if (selectedDateSort === 'soonest') {
      list.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
    } else if (selectedDateSort === 'price_asc') {
      list.sort((a, b) => a.price_cents - b.price_cents);
    } else if (selectedDateSort === 'seats_desc') {
      list.sort((a, b) => b.remaining_seats - a.remaining_seats);
    }

    return list;
  }, [workshops, selectedCategory, selectedLevel, selectedFormat, selectedDateSort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(search.trim());
  };

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    selectedLevel !== 'All' ||
    selectedFormat !== 'All' ||
    selectedDateSort !== 'All' ||
    search.trim().length > 0;

  const resetAllFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setSelectedCategory('All');
    setSelectedLevel('All');
    setSelectedFormat('All');
    setSelectedDateSort('All');
  };

  return (
    <div className="bg-ivory min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header matching mock */}
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-serif text-charcoal tracking-tight">
            Discover Workshops
          </h1>
          <p className="text-xs sm:text-sm text-charcoal/65">
            Browse and book practical, demand-driven workshops.
          </p>
        </div>

        {/* Search Bar + Dropdown Filters (Level, Format, Date) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by topic, skill, or instructor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-warmgray bg-white text-xs text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-forest shadow-2xs"
              />
              {search.length > 0 && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setSearch('');
                    setDebouncedSearch('');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-charcoal/40 hover:text-charcoal"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                aria-label="Filter by level"
                className="px-3 py-2.5 rounded-xl border border-warmgray bg-white text-xs text-charcoal font-medium hover:bg-ivory cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-forest"
              >
                <option value="All">Level ▾</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                aria-label="Filter by format"
                className="px-3 py-2.5 rounded-xl border border-warmgray bg-white text-xs text-charcoal font-medium hover:bg-ivory cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-forest"
              >
                <option value="All">Format ▾</option>
                <option value="live">Live Lab (≤ 2h)</option>
                <option value="workshop">Full Workshop (2h+)</option>
              </select>

              <select
                value={selectedDateSort}
                onChange={(e) => setSelectedDateSort(e.target.value)}
                aria-label="Filter by date or sort order"
                className="px-3 py-2.5 rounded-xl border border-warmgray bg-white text-xs text-charcoal font-medium hover:bg-ivory cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-forest"
              >
                <option value="All">Date ▾</option>
                <option value="weekend">This Weekend</option>
                <option value="next14">Next 14 Days</option>
                <option value="soonest">Sort: Soonest Date</option>
                <option value="price_asc">Sort: Price Low → High</option>
                <option value="seats_desc">Sort: Most Seats Left</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills matching mock */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                aria-pressed={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
                className={`nv-btn-press nv-chip-interactive px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest ${
                  selectedCategory === cat
                    ? 'bg-[#205C49] text-white font-semibold shadow-xs'
                    : 'bg-white border border-warmgray text-charcoal/70 hover:bg-white/80'
                }`}
              >
                {cat}
              </button>
            ))}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="nv-btn-press px-3 py-1.5 rounded-full text-xs font-medium text-forest hover:bg-mint/50 transition-colors whitespace-nowrap"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* Workshops Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-warmgray p-6 animate-pulse space-y-4">
                <div className="h-44 bg-warmgray/50 rounded-xl" />
                <div className="h-4 bg-warmgray/60 rounded w-3/4" />
                <div className="h-3 bg-warmgray/40 rounded w-full" />
              </div>
            ))}
          </div>
        ) : filteredAndSortedWorkshops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredAndSortedWorkshops.map((w) => (
              <WorkshopCard key={w.id} workshop={w} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-warmgray max-w-xl mx-auto space-y-4">
            <BookOpen className="w-10 h-10 text-charcoal/30 mx-auto" />
            <h3 className="font-semibold text-base text-charcoal">No workshops match your criteria</h3>
            <p className="text-xs text-charcoal/60">
              Try adjusting your category or search keywords. If you don't find what you need, submit a request and shape a new workshop!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="nv-btn-press px-4 py-2 bg-ivory border border-warmgray text-charcoal text-xs font-semibold rounded-lg hover:bg-warmgray/40 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
              <Link
                to="/demand"
                className="nv-btn-press inline-flex items-center gap-1.5 px-4 py-2 bg-forest text-ivory text-xs font-semibold rounded-lg hover:bg-charcoal transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-gold" /> Request This Workshop
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkshopsMarketplace;
