import React, { useEffect, useState } from 'react';
import { WorkshopCard } from '../components/WorkshopCard';
import { api } from '../api/client';
import { Workshop } from '../types';
import { Search, ChevronDown, Sparkles, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = ["All", "AI & LLMs", "MLOps", "Full-Stack", "Data", "DevOps"];

export const WorkshopsMarketplace: React.FC = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('All');

  const fetchWorkshops = async () => {
    setLoading(true);
    try {
      // Map category
      let catParam: string | undefined;
      if (selectedCategory === 'MLOps') catParam = 'MLOps';
      else if (selectedCategory === 'Full-Stack') catParam = 'React + FastAPI';
      else if (selectedCategory === 'AI & LLMs') catParam = 'LangGraph Agents';

      const data = await api.getWorkshops({
        category: catParam,
        search: search.trim() || undefined
      });
      setWorkshops(data);
    } catch (err) {
      console.error('Failed to load workshops', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkshops();
  }, [selectedCategory, selectedLevel, selectedFormat]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWorkshops();
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
              <Search className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by topic, skill, or instructor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-warmgray bg-white text-xs text-charcoal placeholder-charcoal/40 focus:outline-hidden focus:ring-2 focus:ring-forest shadow-2xs"
              />
            </form>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                aria-label="Filter by level"
                className="px-3 py-2.5 rounded-xl border border-warmgray bg-white text-xs text-charcoal font-medium hover:bg-ivory cursor-pointer shadow-2xs focus:outline-hidden focus:ring-1 focus:ring-forest"
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
                className="px-3 py-2.5 rounded-xl border border-warmgray bg-white text-xs text-charcoal font-medium hover:bg-ivory cursor-pointer shadow-2xs focus:outline-hidden focus:ring-1 focus:ring-forest"
              >
                <option value="All">Format ▾</option>
                <option value="live">Live Lab</option>
                <option value="workshop">Workshop</option>
              </select>

              <select 
                aria-label="Filter by date"
                className="px-3 py-2.5 rounded-xl border border-warmgray bg-white text-xs text-charcoal font-medium hover:bg-ivory cursor-pointer shadow-2xs focus:outline-hidden focus:ring-1 focus:ring-forest"
              >
                <option>Date ▾</option>
                <option>This Weekend</option>
                <option>Next 14 Days</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills matching mock */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#205C49] text-white font-semibold shadow-xs'
                    : 'bg-white border border-warmgray text-charcoal/70 hover:bg-white/80'
                }`}
              >
                {cat}
              </button>
            ))}
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
        ) : workshops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {workshops.map((w) => (
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
            <Link
              to="/demand"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-forest text-ivory text-xs font-semibold rounded-lg hover:bg-charcoal transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold" /> Request This Workshop
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkshopsMarketplace;
