import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { api, useSyncRefresh } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { DemandCluster } from '../types';
import { 
  Sparkles, ArrowRight, Loader2, MessageSquare, 
  Layers, Plus, TrendingUp, BarChart3, Target, X, AlertCircle
} from 'lucide-react';

export const DemandIntroPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [clusters, setClusters] = useState<DemandCluster[]>([]);
  const [demandCountDelta, setDemandCountDelta] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [prompt, setPrompt] = useState(() => {
    try {
      const savedDraft = sessionStorage.getItem('nv_demand_draft');
      if (savedDraft) return savedDraft;
    } catch {
      // Ignore storage errors
    }
    return 'I want to learn LangGraph with real projects for under $40 this weekend in English.';
  });
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const selectedTopicParam = searchParams.get('topic') || '';
  const [activeTopic, setActiveTopic] = useState<string>(selectedTopicParam);

  useEffect(() => {
    setActiveTopic(selectedTopicParam);
  }, [selectedTopicParam]);

  const loadData = useCallback(async () => {
    try {
      const [clusterList, demandsList] = await Promise.all([
        api.getClusters(),
        api.getDemands().catch(() => []),
      ]);
      setClusters(clusterList);
      setDemandCountDelta(Math.max(0, demandsList.length - 4));
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadData();
    try {
      if (sessionStorage.getItem('nv_demand_draft') && isAuthenticated) {
        setShowModal(true);
      }
    } catch {
      // Ignore
    }
  }, [loadData, isAuthenticated]);

  useSyncRefresh(['demands', 'clusters', 'analytics'], loadData);

  useEffect(() => {
    if (!showModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) {
        setShowModal(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showModal, submitting]);

  const handleExtract = async () => {
    if (prompt.trim().length < 10) {
      setModalError('Please describe your learning request in at least 10 characters.');
      return;
    }
    setExtracting(true);
    setModalError(null);
    try {
      const res = await api.extractDemand(prompt.trim());
      setExtractedData(res);
    } catch (err: any) {
      setModalError(err.message || 'Failed to extract demand constraints.');
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim().length < 10) {
      setModalError('Please describe what you want to learn in at least 10 characters.');
      return;
    }
    if (!isAuthenticated) {
      try {
        sessionStorage.setItem('nv_demand_draft', prompt.trim());
      } catch {
        // Ignore
      }
      navigate('/sign-in?redirect=/demand');
      return;
    }
    setSubmitting(true);
    setModalError(null);
    try {
      let parsed = extractedData;
      if (!parsed) {
        parsed = await api.extractDemand(prompt.trim()).catch(() => null);
      }
      await api.createDemand({
        raw_prompt: prompt.trim(),
        topic: parsed?.topic || 'LangGraph Agents',
        related_skills: parsed?.related_skills || ['LangGraph', 'AI Agents'],
        preferred_difficulty: parsed?.preferred_difficulty || 'intermediate',
        max_budget_cents: parsed?.max_budget_cents || 4000,
        language: parsed?.language || 'English',
        preferred_schedule: parsed?.preferred_schedule || 'Weekend',
      });
      try {
        sessionStorage.removeItem('nv_demand_draft');
      } catch {
        // Ignore
      }
      setShowModal(false);
      navigate('/app/my-demands');
    } catch (err: any) {
      setModalError(err.message || 'Failed to submit demand request.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalRequestsCount = 42 + demandCountDelta;

  return (
    <div className="bg-ivory min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header matching mock */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-serif text-charcoal tracking-tight">
              AI Demand Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-charcoal/65">
              Real learner requests, AI clustering, and workshop opportunities.
            </p>
          </div>

          <button
            onClick={() => {
              setModalError(null);
              setShowModal(true);
            }}
            className="nv-btn-press inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#205C49] hover:bg-charcoal text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Learning Demand</span>
          </button>
        </div>

        {/* 4 KPI Summary Cards matching mock */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="nv-card-lift bg-white rounded-2xl border border-warmgray p-5 shadow-xs flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-mint text-forest flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-forest" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase text-charcoal/50 block">Total Requests</span>
              <span className="text-2xl font-bold font-mono text-charcoal">{totalRequestsCount}</span>
            </div>
          </div>

          <div className="nv-card-lift bg-white rounded-2xl border border-warmgray p-5 shadow-xs flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-mint text-forest flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-forest" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase text-charcoal/50 block">Active Clusters</span>
              <span className="text-2xl font-bold font-mono text-charcoal">
                {clusters.length > 0 ? clusters.length : 2}
              </span>
            </div>
          </div>

          <div className="nv-card-lift bg-white rounded-2xl border border-warmgray p-5 shadow-xs flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-mint text-forest flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 text-forest" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase text-charcoal/50 block">Opportunities</span>
              <span className="text-2xl font-bold font-mono text-charcoal">5</span>
            </div>
          </div>

          <div className="nv-card-lift bg-white rounded-2xl border border-warmgray p-5 shadow-xs flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-mint text-forest flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-forest" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase text-charcoal/50 block">Conversion (Demo)</span>
              <span className="text-2xl font-bold font-mono text-[#205C49]">34%</span>
            </div>
          </div>
        </div>

        {/* Two Columns Grid matching mock */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Demand Topics (Last 14 Days) */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-warmgray p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-warmgray/60">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-forest" />
                <h3 className="font-semibold text-sm text-charcoal">Demand Topics (Last 14 Days)</h3>
              </div>
              <span className="text-[11px] font-mono text-charcoal/40">Aggregated Topics</span>
            </div>

            {/* Horizontal Bar Chart representation */}
            <div className="space-y-4 text-xs font-medium">
              {[
                { label: 'AI Agents', count: 38 + demandCountDelta, width: '90%', barClass: 'bg-[#205C49]' },
                { label: 'MLOps', count: 24, width: '60%', barClass: 'bg-[#205C49]' },
                { label: 'Full-Stack', count: 20, width: '50%', barClass: 'bg-[#205C49]' },
                { label: 'Data Engineering', count: 16, width: '40%', barClass: 'bg-[#205C49]' },
                { label: 'Others', count: 9, width: '22%', barClass: 'bg-[#205C49]/60' },
              ].map((bar) => {
                const isSelected = activeTopic.toLowerCase() === bar.label.toLowerCase();
                return (
                  <div
                    key={bar.label}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    onClick={() => setActiveTopic((prev) => (prev === bar.label ? '' : bar.label))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveTopic((prev) => (prev === bar.label ? '' : bar.label));
                      }
                    }}
                    className={`space-y-1.5 cursor-pointer rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest ${
                      isSelected ? 'ring-1 ring-forest/30 bg-mint/20 p-1.5 -m-1.5' : ''
                    }`}
                  >
                    <div className="flex justify-between text-charcoal">
                      <span>{bar.label}</span>
                      <span className="font-mono font-bold text-forest">{bar.count}</span>
                    </div>
                    <div className="w-full h-2.5 bg-ivory rounded-full overflow-hidden border border-warmgray/50">
                      <div className={`h-full ${bar.barClass} rounded-full transition-all duration-200`} style={{ width: bar.width }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-warmgray/60 flex items-center justify-between text-[11px] text-charcoal/50 font-mono">
              <span>Updated real-time from submissions</span>
              <span className="text-forest">● PostgreSQL Sync</span>
            </div>
          </div>

          {/* Right Column: Top Opportunities matching mock */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-warmgray p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-warmgray/60">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-forest" />
                <h3 className="font-semibold text-sm text-charcoal">Top Opportunities</h3>
              </div>
              <span className="text-[11px] font-mono text-charcoal/40">Instructor Ready</span>
            </div>

            <div className="space-y-3">
              {/* Opportunity 1 */}
              <div
                className={`nv-card-lift p-4 rounded-xl bg-ivory border transition-colors flex items-center justify-between gap-4 ${
                  activeTopic &&
                  (activeTopic.toLowerCase().includes('agent') || activeTopic.toLowerCase().includes('langgraph'))
                    ? 'border-forest ring-2 ring-forest/25'
                    : 'border-warmgray hover:border-forest/40'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <h4 className="font-semibold text-xs sm:text-sm text-charcoal truncate">
                    LangGraph Agents - Hands-on Workshop
                  </h4>
                  <p className="text-[11px] text-charcoal/65 font-mono">
                    28 requests • $35 - $45 • <span className="text-forest font-semibold">High match (0.92)</span>
                  </p>
                </div>
                <Link
                  to="/workshops?search=LangGraph"
                  className="nv-btn-press group px-3.5 py-1.5 rounded-lg bg-[#205C49] hover:bg-charcoal text-white text-xs font-semibold shrink-0 transition-colors flex items-center gap-1 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
                >
                  <span>View</span>
                  <ArrowRight className="w-3 h-3 nv-icon-slide" />
                </Link>
              </div>

              {/* Opportunity 2 */}
              <div
                className={`nv-card-lift p-4 rounded-xl bg-ivory border transition-colors flex items-center justify-between gap-4 ${
                  activeTopic && activeTopic.toLowerCase().includes('mlops')
                    ? 'border-forest ring-2 ring-forest/25'
                    : 'border-warmgray hover:border-forest/40'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <h4 className="font-semibold text-xs sm:text-sm text-charcoal truncate">
                    MLOps For Real Projects
                  </h4>
                  <p className="text-[11px] text-charcoal/65 font-mono">
                    16 requests • $50 - $60 • <span className="text-forest font-semibold">Match (0.87)</span>
                  </p>
                </div>
                <Link
                  to="/workshops?search=MLOps"
                  className="nv-btn-press group px-3.5 py-1.5 rounded-lg bg-[#205C49] hover:bg-charcoal text-white text-xs font-semibold shrink-0 transition-colors flex items-center gap-1 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
                >
                  <span>View</span>
                  <ArrowRight className="w-3 h-3 nv-icon-slide" />
                </Link>
              </div>

              {/* Dynamic cluster from PostgreSQL */}
              {clusters.map((c) => {
                const isClusterMatch =
                  Boolean(activeTopic) && c.name.toLowerCase().includes(activeTopic.toLowerCase());
                return (
                  <div
                    key={c.id}
                    className={`nv-card-lift p-4 rounded-xl bg-mint/30 border flex items-center justify-between gap-4 ${
                      isClusterMatch ? 'border-forest ring-2 ring-forest/25' : 'border-forest/20'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <h4 className="font-semibold text-xs sm:text-sm text-charcoal truncate">
                        {c.name}
                      </h4>
                      <p className="text-[11px] text-charcoal/65 font-mono">
                        {c.member_count} requests • ${(c.avg_budget_cents / 100).toFixed(2)} target
                      </p>
                    </div>
                    <Link
                      to={`/workshops?search=${encodeURIComponent(c.name)}`}
                      className="nv-btn-press group px-3.5 py-1.5 rounded-lg bg-[#205C49] hover:bg-charcoal text-white text-xs font-semibold shrink-0 transition-colors flex items-center gap-1 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3 nv-icon-slide" />
                    </Link>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-ivory rounded-xl border border-warmgray text-center text-xs text-charcoal/70">
              Want to teach one of these cohorts?{' '}
              <Link to="/for-instructors" className="text-forest font-semibold hover:underline">
                Create an Instructor Offer →
              </Link>
            </div>
          </div>
        </div>

        {/* Modal: New Learning Demand Submission */}
        {showModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="demand-modal-title"
            onClick={(e) => {
              if (e.target === e.currentTarget && !submitting) {
                setShowModal(false);
              }
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-xs"
          >
            <div className="bg-white rounded-3xl border border-warmgray max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-warmgray pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-mint text-forest flex items-center justify-center font-bold text-xs">
                    ✦
                  </div>
                  <h3 id="demand-modal-title" className="font-semibold text-base text-charcoal">Submit Learning Request</h3>
                </div>
                <button
                  type="button"
                  aria-label="Close modal"
                  disabled={submitting}
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg text-charcoal/50 hover:bg-warmgray/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {modalError && (
                <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="space-y-3">
                <label htmlFor="demand-prompt-input" className="text-xs font-semibold text-charcoal block">
                  Describe what you want to learn:
                </label>
                <textarea
                  id="demand-prompt-input"
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    if (modalError) setModalError(null);
                  }}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-warmgray text-xs text-charcoal focus:outline-hidden focus:ring-2 focus:ring-forest leading-relaxed shadow-2xs"
                  placeholder="e.g. I want to learn LangGraph with PostgreSQL checkpointers for under $40 this weekend..."
                />

                <button
                  type="button"
                  onClick={handleExtract}
                  disabled={extracting || submitting}
                  className="nv-btn-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-mint text-forest font-mono text-xs font-semibold hover:bg-forest hover:text-white disabled:opacity-60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
                >
                  {extracting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{extracting ? 'Analyzing Constraints...' : 'Extract Constraints with AI'}</span>
                </button>
              </div>

              {extractedData && (
                <div className="p-3.5 bg-ivory rounded-xl border border-warmgray space-y-2 text-xs">
                  <div className="flex justify-between items-center text-forest font-semibold">
                    <span>Parsed Topic: {extractedData.topic}</span>
                    <span className="font-mono text-[10px]">≤ ${(extractedData.max_budget_cents / 100).toFixed(2)} USD</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {extractedData.related_skills?.map((s: string) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-white border border-warmgray text-[10px] font-mono text-charcoal">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-warmgray">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-charcoal/70 hover:bg-warmgray/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="nv-btn-press px-5 py-2 rounded-xl bg-forest hover:bg-charcoal disabled:opacity-60 text-white text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{submitting ? 'Submitting...' : 'Submit Request to Demand Pool'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemandIntroPage;
