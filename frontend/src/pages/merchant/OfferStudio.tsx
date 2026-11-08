import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api, useSyncRefresh } from '../../api/client';
import { DemandCluster } from '../../types';
import { 
  Sparkles, ArrowRight, Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';

const DRAFT_STORAGE_KEY = 'nv_offer_studio_draft';

interface OfferDraftState {
  title: string;
  description: string;
  duration: string;
  level: string;
  priceDollars: string;
  capacity: string;
  category: string;
  offerId: string | null;
}

const DEFAULT_DRAFT: OfferDraftState = {
  title: 'Building Production-Ready LangGraph Agents',
  description:
    'Hands-on live lab covering LangGraph multi-agent systems, PostgreSQL checkpointers, and resilient error recovery patterns. Calibrated to learner demand.',
  duration: '2 hours',
  level: 'Intermediate',
  priceDollars: '39.00',
  capacity: '25',
  category: 'LangGraph Agents',
  offerId: null,
};

export const OfferStudio: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialClusterId = searchParams.get('cluster_id') || '';
  const initialTopic = searchParams.get('topic') || '';

  const [clusters, setClusters] = useState<DemandCluster[]>([]);
  const [selectedClusterId, setSelectedClusterId] = useState<string>(initialClusterId);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(3);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [draft, setDraft] = useState<OfferDraftState>(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        return { ...DEFAULT_DRAFT, ...JSON.parse(raw) };
      }
    } catch {
      // Ignore storage errors
    }
    if (initialTopic) {
      return {
        ...DEFAULT_DRAFT,
        title: `${initialTopic} — Hands-on Intensive`,
        category: initialTopic,
      };
    }
    return DEFAULT_DRAFT;
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Ignore
    }
  }, [draft]);

  const loadClusters = useCallback(async () => {
    try {
      const res = await api.getClusters();
      setClusters(res);
      if (initialClusterId && res.some((c) => c.id === initialClusterId)) {
        setSelectedClusterId(initialClusterId);
      } else if (initialTopic) {
        const byTopic = res.find((c) => c.name.toLowerCase().includes(initialTopic.toLowerCase()));
        if (byTopic) setSelectedClusterId(byTopic.id);
      } else if (!selectedClusterId && res.length > 0) {
        setSelectedClusterId(res[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  }, [initialClusterId, initialTopic, selectedClusterId]);

  useEffect(() => {
    loadClusters();
  }, [loadClusters]);

  useSyncRefresh(['clusters', 'demands'], loadClusters);

  const selectedCluster = clusters.find((c) => c.id === selectedClusterId) || {
    id: 'demo-c1',
    name: 'Cluster: LangGraph Agents',
    topic: 'LangGraph Agents',
    summary: '28 learner requests • $35 - $45 budget range • High match',
    member_count: 28,
    avg_budget_cents: 3900,
    difficulty: 'intermediate',
  };

  const handleGenerateProposal = async () => {
    if (generating) return;
    if (!clusters.some((c) => c.id === selectedCluster.id)) {
      setFeedback({ type: 'error', message: 'Select an active PostgreSQL cluster before generating an AI proposal.' });
      return;
    }
    setGenerating(true);
    setFeedback(null);
    setCurrentStep(2);
    try {
      const proposal = await api.generateOffer(selectedCluster.id);
      const capLevel =
        selectedCluster.difficulty.charAt(0).toUpperCase() + selectedCluster.difficulty.slice(1).toLowerCase();
      setDraft({
        title: proposal.proposed_title,
        description: proposal.description,
        duration: `${proposal.duration_hours} hours`,
        level: ['Beginner', 'Intermediate', 'Advanced'].includes(capLevel) ? capLevel : 'Intermediate',
        priceDollars: (proposal.suggested_price_cents / 100).toFixed(2),
        capacity: String(proposal.expected_seat_count || 25),
        category: selectedCluster.topic || selectedCluster.name,
        offerId: proposal.id,
      });
      setCurrentStep(3);
      setFeedback({
        type: 'success',
        message: 'AI workshop proposal synthesized from cluster constraints. Review and customize below.',
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to generate AI workshop proposal.' });
    } finally {
      setGenerating(false);
    }
  };

  const persistWorkshop = async (publishImmediately: boolean) => {
    const parsedPrice = parseFloat(draft.priceDollars);
    const parsedSeats = parseInt(draft.capacity, 10);
    if (!draft.title.trim() || Number.isNaN(parsedPrice) || parsedPrice <= 0 || Number.isNaN(parsedSeats) || parsedSeats < 1) {
      setFeedback({ type: 'error', message: 'Please provide a valid title, positive USD price, and seat capacity.' });
      return;
    }

    if (publishImmediately) {
      setPublishing(true);
      setCurrentStep(4);
    } else {
      setSavingDraft(true);
    }
    setFeedback(null);

    try {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + 5);
      scheduledDate.setHours(18, 0, 0, 0);

      const created = await api.createWorkshop({
        offer_id: draft.offerId,
        title: draft.title.trim(),
        description: draft.description,
        category: draft.category || 'AI Systems',
        difficulty: draft.level.toLowerCase(),
        duration_hours: parseInt(draft.duration, 10) || 2,
        price_cents: Math.round(parsedPrice * 100),
        total_seats: parsedSeats,
        scheduled_at: scheduledDate.toISOString(),
      });

      if (publishImmediately) {
        await api.publishWorkshop(created.id);
      }

      try {
        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // Ignore
      }
      navigate(publishImmediately ? '/merchant/workshops?published=1' : '/merchant/workshops?draft=1');
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to persist workshop.' });
    } finally {
      setPublishing(false);
      setSavingDraft(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (publishing || savingDraft) return;
    await persistWorkshop(true);
  };

  return (
    <div className="space-y-8">
      {/* Top Header matching mock */}
      <div className="space-y-1">
        <h1 className="text-3xl font-serif text-charcoal tracking-tight">
          Instructor Offer Studio
        </h1>
        <p className="text-xs sm:text-sm text-charcoal/65">
          Turn learner demand into a published workshop.
        </p>
      </div>

      {feedback && (
        <div
          role={feedback.type === 'error' ? 'alert' : 'status'}
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            feedback.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-mint/50 border-forest/20 text-forest font-medium'
          }`}
        >
          {feedback.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-forest" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 4-Step Wizard Stepper matching mock */}
      <div className="bg-white rounded-2xl border border-warmgray p-4 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {[
            { num: 1 as const, label: 'Select Opportunity' },
            { num: 2 as const, label: 'AI Proposal' },
            { num: 3 as const, label: 'Customize' },
            { num: 4 as const, label: 'Publish' },
          ].map((step) => {
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;
            return (
              <button
                key={step.num}
                type="button"
                aria-current={isCurrent ? 'step' : undefined}
                onClick={() => setCurrentStep(step.num)}
                className={`flex items-center gap-2 p-2 rounded-xl font-medium text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest ${
                  isCurrent 
                    ? 'bg-mint text-forest font-bold' 
                    : isCompleted 
                    ? 'text-forest hover:bg-ivory' 
                    : 'text-charcoal/40 hover:bg-ivory hover:text-charcoal/70'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 ${
                  isCurrent ? 'bg-forest text-white' : isCompleted ? 'bg-mint text-forest' : 'bg-warmgray text-charcoal'
                }`}>
                  {isCompleted ? '✓' : step.num}
                </span>
                <span className="truncate">{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3-Column Layout matching mock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Column 1: Selected Demand Opportunity */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-warmgray p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-warmgray/60">
            <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal/50 font-semibold">
              Selected Demand Opportunity
            </span>
            <span className="w-2 h-2 rounded-full bg-forest" />
          </div>

          {clusters.length > 1 && (
            <div>
              <label htmlFor="cluster-select" className="sr-only">Select demand cluster</label>
              <select
                id="cluster-select"
                value={selectedCluster.id}
                onChange={(e) => {
                  setSelectedClusterId(e.target.value);
                  setCurrentStep(1);
                }}
                className="w-full p-2 rounded-xl border border-warmgray bg-ivory text-xs font-medium text-charcoal focus:outline-hidden focus:ring-2 focus:ring-forest cursor-pointer"
              >
                {clusters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.member_count} requests)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="p-4 rounded-xl bg-ivory border border-warmgray space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-charcoal block">
                  {selectedCluster.name || 'Cluster: LangGraph Agents'}
                </span>
                <span className="text-[11px] text-charcoal/60 font-mono">
                  {selectedCluster.member_count || 28} learner requests
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-forest bg-mint px-2 py-0.5 rounded">
                High Match (0.92)
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2 py-0.5 rounded-md bg-white border border-warmgray text-[10px] font-mono text-charcoal font-medium">
                {selectedCluster.topic || 'LangGraph'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-warmgray text-[10px] font-mono text-charcoal font-medium">
                AI Agents
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-warmgray text-[10px] font-mono text-charcoal font-medium">
                Hands-on
              </span>
            </div>
          </div>

          <div className="text-[11px] text-charcoal/60 leading-relaxed bg-mint/30 p-3 rounded-xl border border-forest/15">
            <strong>Willingness-to-Pay:</strong> Average target budget derived from learner submissions is ${(selectedCluster.avg_budget_cents / 100).toFixed(2)} USD.
          </div>

          <button
            type="button"
            onClick={handleGenerateProposal}
            disabled={generating || publishing}
            className="nv-btn-press w-full py-2 px-3 rounded-xl bg-mint text-forest hover:bg-forest hover:text-ivory disabled:opacity-60 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{generating ? 'Synthesizing Proposal...' : 'Generate AI Proposal from Cluster'}</span>
          </button>
        </div>

        {/* Column 2: AI-Generated Workshop (Editable Form) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-warmgray p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-warmgray/60">
            <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal/50 font-semibold">
              AI-Generated Workshop (Editable)
            </span>
            <span className="text-[10px] font-mono bg-mint text-forest px-2 py-0.5 rounded font-semibold">
              Draft Mode
            </span>
          </div>

          <form onSubmit={handlePublish} className="space-y-4">
            <div>
              <label htmlFor="offer-title" className="text-xs font-semibold text-charcoal block mb-1">Title</label>
              <input
                id="offer-title"
                type="text"
                value={draft.title}
                onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-warmgray bg-ivory text-xs text-charcoal font-medium focus:ring-2 focus:ring-forest focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="offer-duration" className="text-xs font-semibold text-charcoal block mb-1">Duration</label>
                <select
                  id="offer-duration"
                  value={draft.duration}
                  onChange={(e) => setDraft((prev) => ({ ...prev, duration: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-warmgray bg-ivory text-xs text-charcoal font-medium focus:ring-2 focus:ring-forest focus:outline-hidden cursor-pointer"
                >
                  <option value="2 hours">2 hours</option>
                  <option value="3 hours">3 hours</option>
                  <option value="4 hours">4 hours</option>
                </select>
              </div>

              <div>
                <label htmlFor="offer-level" className="text-xs font-semibold text-charcoal block mb-1">Level</label>
                <select
                  id="offer-level"
                  value={draft.level}
                  onChange={(e) => setDraft((prev) => ({ ...prev, level: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-warmgray bg-ivory text-xs text-charcoal font-medium focus:ring-2 focus:ring-forest focus:outline-hidden cursor-pointer"
                >
                  <option value="Intermediate">Intermediate</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="offer-price" className="text-xs font-semibold text-charcoal block mb-1">Price (USD)</label>
                <input
                  id="offer-price"
                  type="text"
                  value={draft.priceDollars}
                  onChange={(e) => setDraft((prev) => ({ ...prev, priceDollars: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-warmgray bg-ivory text-xs font-mono font-bold text-forest focus:ring-2 focus:ring-forest focus:outline-hidden"
                />
              </div>

              <div>
                <label htmlFor="offer-capacity" className="text-xs font-semibold text-charcoal block mb-1">Capacity</label>
                <input
                  id="offer-capacity"
                  type="number"
                  min={1}
                  value={draft.capacity}
                  onChange={(e) => setDraft((prev) => ({ ...prev, capacity: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-warmgray bg-ivory text-xs font-mono text-charcoal focus:ring-2 focus:ring-forest focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-xs">
              <span className="text-[11px] text-charcoal/50 font-mono">Draft saved automatically</span>
              <button
                type="button"
                disabled={savingDraft || publishing}
                onClick={() => persistWorkshop(false)}
                className="text-forest font-semibold hover:underline disabled:opacity-50 inline-flex items-center gap-1"
              >
                {savingDraft && <Loader2 className="w-3 h-3 animate-spin" />}
                <span>Save as Draft</span>
              </button>
            </div>
          </form>
        </div>

        {/* Column 3: Offer Preview */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-warmgray p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-warmgray/60">
            <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal/50 font-semibold">
              Offer Preview
            </span>
            <span className="text-[10px] font-mono text-forest">Live Card</span>
          </div>

          <div className="rounded-xl border border-warmgray overflow-hidden bg-ivory space-y-2 pb-3">
            <div className="h-28 w-full bg-charcoal overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80"
                alt="Preview"
                className="w-full h-full object-cover opacity-90"
              />
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-white/90 text-forest text-[10px] font-mono font-bold uppercase">
                {(draft.category || 'LANGGRAPH').slice(0, 16)}
              </span>
            </div>
            <div className="p-3 space-y-1">
              <h4 className="font-semibold text-xs text-charcoal leading-snug line-clamp-2">
                {draft.title}
              </h4>
              <p className="text-[11px] font-mono text-charcoal/60">
                Nov 11, 2026 • {draft.duration} • <strong className="text-forest">${draft.priceDollars}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing || savingDraft}
            className="nv-btn-press w-full py-2.5 px-4 rounded-xl bg-[#205C49] hover:bg-charcoal disabled:opacity-60 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
          >
            {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{publishing ? 'Publishing...' : 'Publish Workshop'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfferStudio;
