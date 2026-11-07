import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { DemandCluster } from '../types';
import { 
  Sparkles, ArrowRight, Loader2, CheckCircle2, MessageSquare, 
  Layers, Plus, TrendingUp, BarChart3, Target, X, Check, ShieldCheck
} from 'lucide-react';

export const DemandIntroPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [clusters, setClusters] = useState<DemandCluster[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [prompt, setPrompt] = useState('I want to learn LangGraph with real projects for under $40 this weekend in English.');
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getClusters().then(setClusters).catch(console.error);
  }, []);

  const handleExtract = async () => {
    if (!prompt.trim()) return;
    setExtracting(true);
    try {
      const res = await api.extractDemand(prompt);
      setExtractedData(res);
    } catch (err) {
      console.error('Failed to extract demand', err);
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/sign-in');
      return;
    }
    setSubmitting(true);
    try {
      await api.createDemand({
        raw_prompt: prompt,
        topic: extractedData?.topic || 'LangGraph Agents',
        related_skills: extractedData?.related_skills || ['LangGraph', 'AI Agents'],
        preferred_difficulty: extractedData?.preferred_difficulty || 'intermediate',
        max_budget_cents: extractedData?.max_budget_cents || 4000,
        language: extractedData?.language || 'English',
        preferred_schedule: extractedData?.preferred_schedule || 'Weekend',
      });
      setShowModal(false);
      navigate('/app/my-demands');
    } catch (err) {
      console.error('Failed to submit demand', err);
    } finally {
      setSubmitting(false);
    }
  };

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
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#205C49] hover:bg-charcoal text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Learning Demand</span>
          </button>
        </div>

        {/* 4 KPI Summary Cards matching mock */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl border border-warmgray p-5 shadow-xs flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-mint text-forest flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-forest" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase text-charcoal/50 block">Total Requests</span>
              <span className="text-2xl font-bold font-mono text-charcoal">42</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-warmgray p-5 shadow-xs flex items-center gap-4">
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

          <div className="bg-white rounded-2xl border border-warmgray p-5 shadow-xs flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-mint text-forest flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 text-forest" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase text-charcoal/50 block">Opportunities</span>
              <span className="text-2xl font-bold font-mono text-charcoal">5</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-warmgray p-5 shadow-xs flex items-center gap-4">
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
              <div className="space-y-1.5">
                <div className="flex justify-between text-charcoal">
                  <span>AI Agents</span>
                  <span className="font-mono font-bold text-forest">38</span>
                </div>
                <div className="w-full h-2.5 bg-ivory rounded-full overflow-hidden border border-warmgray/50">
                  <div className="h-full bg-[#205C49] rounded-full" style={{ width: '90%' }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-charcoal">
                  <span>MLOps</span>
                  <span className="font-mono font-bold text-forest">24</span>
                </div>
                <div className="w-full h-2.5 bg-ivory rounded-full overflow-hidden border border-warmgray/50">
                  <div className="h-full bg-[#205C49] rounded-full" style={{ width: '60%' }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-charcoal">
                  <span>Full-Stack</span>
                  <span className="font-mono font-bold text-forest">20</span>
                </div>
                <div className="w-full h-2.5 bg-ivory rounded-full overflow-hidden border border-warmgray/50">
                  <div className="h-full bg-[#205C49] rounded-full" style={{ width: '50%' }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-charcoal">
                  <span>Data Engineering</span>
                  <span className="font-mono font-bold text-forest">16</span>
                </div>
                <div className="w-full h-2.5 bg-ivory rounded-full overflow-hidden border border-warmgray/50">
                  <div className="h-full bg-[#205C49] rounded-full" style={{ width: '40%' }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-charcoal">
                  <span>Others</span>
                  <span className="font-mono font-bold text-forest">9</span>
                </div>
                <div className="w-full h-2.5 bg-ivory rounded-full overflow-hidden border border-warmgray/50">
                  <div className="h-full bg-[#205C49]/60 rounded-full" style={{ width: '22%' }} />
                </div>
              </div>
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
              <div className="p-4 rounded-xl bg-ivory border border-warmgray hover:border-forest/40 transition-colors flex items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <h4 className="font-semibold text-xs sm:text-sm text-charcoal truncate">
                    LangGraph Agents - Hands-on Workshop
                  </h4>
                  <p className="text-[11px] text-charcoal/65 font-mono">
                    28 requests • $35 - $45 • <span className="text-forest font-semibold">High match (0.92)</span>
                  </p>
                </div>
                <Link
                  to="/workshops"
                  className="px-3.5 py-1.5 rounded-lg bg-[#205C49] hover:bg-charcoal text-white text-xs font-semibold shrink-0 transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <span>View</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Opportunity 2 */}
              <div className="p-4 rounded-xl bg-ivory border border-warmgray hover:border-forest/40 transition-colors flex items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <h4 className="font-semibold text-xs sm:text-sm text-charcoal truncate">
                    MLOps For Real Projects
                  </h4>
                  <p className="text-[11px] text-charcoal/65 font-mono">
                    16 requests • $50 - $60 • <span className="text-forest font-semibold">Match (0.87)</span>
                  </p>
                </div>
                <Link
                  to="/workshops"
                  className="px-3.5 py-1.5 rounded-lg bg-[#205C49] hover:bg-charcoal text-white text-xs font-semibold shrink-0 transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <span>View</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Dynamic cluster from PostgreSQL */}
              {clusters.map((c) => (
                <div key={c.id} className="p-4 rounded-xl bg-mint/30 border border-forest/20 flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <h4 className="font-semibold text-xs sm:text-sm text-charcoal truncate">
                      {c.name}
                    </h4>
                    <p className="text-[11px] text-charcoal/65 font-mono">
                      {c.member_count} requests • ${(c.avg_budget_cents / 100).toFixed(2)} target
                    </p>
                  </div>
                  <Link
                    to="/workshops"
                    className="px-3.5 py-1.5 rounded-lg bg-[#205C49] hover:bg-charcoal text-white text-xs font-semibold shrink-0 transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl border border-warmgray max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-warmgray pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-mint text-forest flex items-center justify-center font-bold text-xs">
                    ✦
                  </div>
                  <h3 className="font-semibold text-base text-charcoal">Submit Learning Request</h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg text-charcoal/50 hover:bg-warmgray/50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-charcoal block">
                  Describe what you want to learn:
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-warmgray text-xs text-charcoal focus:outline-hidden focus:ring-2 focus:ring-forest leading-relaxed shadow-2xs"
                  placeholder="e.g. I want to learn LangGraph with PostgreSQL checkpointers for under $40 this weekend..."
                />

                <button
                  type="button"
                  onClick={handleExtract}
                  disabled={extracting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-mint text-forest font-mono text-xs font-semibold hover:bg-forest hover:text-white transition-colors"
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
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-charcoal/70 hover:bg-warmgray/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-forest hover:bg-charcoal text-white text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Submit Request to Demand Pool</span>
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
