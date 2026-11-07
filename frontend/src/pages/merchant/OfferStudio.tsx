import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { DemandCluster, OfferProposal } from '../../types';
import { 
  Sparkles, CheckCircle2, ArrowRight, Loader2, Calendar, 
  Clock, Users, DollarSign, Layers, BookOpen, Check
} from 'lucide-react';

export const OfferStudio: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialClusterId = searchParams.get('cluster_id') || '';

  const [clusters, setClusters] = useState<DemandCluster[]>([]);
  const [selectedClusterId, setSelectedClusterId] = useState<string>(initialClusterId);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(3); // Matches customized step in mock
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Form State
  const [title, setTitle] = useState('Building Production-Ready LangGraph Agents');
  const [duration, setDuration] = useState('2 hours');
  const [level, setLevel] = useState('Intermediate');
  const [priceDollars, setPriceDollars] = useState('39.00');
  const [capacity, setCapacity] = useState('25');
  const [category, setCategory] = useState('LangGraph Agents');

  useEffect(() => {
    api.getClusters().then((res) => {
      setClusters(res);
      if (!selectedClusterId && res.length > 0) {
        setSelectedClusterId(res[0].id);
      }
    }).catch(console.error);
  }, []);

  const selectedCluster = clusters.find((c) => c.id === selectedClusterId) || {
    id: 'demo-c1',
    name: 'Cluster: LangGraph Agents',
    topic: 'LangGraph Agents',
    summary: '28 learner requests • $35 - $45 budget range • High match',
    member_count: 28,
    avg_budget_cents: 3900,
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishing(true);
    try {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + 5);
      scheduledDate.setHours(18, 0, 0, 0);

      await api.createWorkshop({
        offer_id: null,
        title,
        description: `Hands-on live lab covering LangGraph multi-agent systems, PostgreSQL checkpointers, and resilient error recovery patterns. Calibrated to learner demand.`,
        category,
        difficulty: level.toLowerCase(),
        duration_hours: parseInt(duration) || 2,
        price_cents: Math.round(parseFloat(priceDollars) * 100),
        total_seats: parseInt(capacity) || 25,
        scheduled_at: scheduledDate.toISOString(),
      });
      navigate('/merchant/workshops');
    } catch (err: any) {
      alert(err.message || 'Failed to publish workshop.');
    } finally {
      setPublishing(false);
    }
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

      {/* 4-Step Wizard Stepper matching mock */}
      <div className="bg-white rounded-2xl border border-warmgray p-4 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {[
            { num: 1, label: 'Select Opportunity' },
            { num: 2, label: 'AI Proposal' },
            { num: 3, label: 'Customize' },
            { num: 4, label: 'Publish' },
          ].map((step) => {
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;
            return (
              <div
                key={step.num}
                className={`flex items-center gap-2 p-2 rounded-xl font-medium ${
                  isCurrent 
                    ? 'bg-mint text-forest font-bold' 
                    : isCompleted 
                    ? 'text-forest' 
                    : 'text-charcoal/40'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                  isCurrent ? 'bg-forest text-white' : isCompleted ? 'bg-mint text-forest' : 'bg-warmgray text-charcoal'
                }`}>
                  {isCompleted ? '✓' : step.num}
                </span>
                <span className="truncate">{step.label}</span>
              </div>
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
                LangGraph
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
            <strong>Willingness-to-Pay:</strong> Average target budget derived from learner submissions is $39.00 USD.
          </div>
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
              <label className="text-xs font-semibold text-charcoal block mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-warmgray bg-ivory text-xs text-charcoal font-medium focus:ring-2 focus:ring-forest focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-charcoal block mb-1">Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-warmgray bg-ivory text-xs text-charcoal font-medium focus:ring-2 focus:ring-forest focus:outline-hidden cursor-pointer"
                >
                  <option value="2 hours">2 hours</option>
                  <option value="3 hours">3 hours</option>
                  <option value="4 hours">4 hours</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal block mb-1">Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
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
                <label className="text-xs font-semibold text-charcoal block mb-1">Price (USD)</label>
                <input
                  type="text"
                  value={priceDollars}
                  onChange={(e) => setPriceDollars(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-warmgray bg-ivory text-xs font-mono font-bold text-forest focus:ring-2 focus:ring-forest focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal block mb-1">Capacity</label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-warmgray bg-ivory text-xs font-mono text-charcoal focus:ring-2 focus:ring-forest focus:outline-hidden"
                />
              </div>
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
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-white/90 text-forest text-[10px] font-mono font-bold">
                LANGGRAPH
              </span>
            </div>
            <div className="p-3 space-y-1">
              <h4 className="font-semibold text-xs text-charcoal leading-snug line-clamp-2">
                {title}
              </h4>
              <p className="text-[11px] font-mono text-charcoal/60">
                Nov 11, 2026 • {duration} • <strong className="text-forest">${priceDollars}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing}
            className="w-full py-2.5 px-4 rounded-xl bg-[#205C49] hover:bg-charcoal text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>Publish Workshop</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfferStudio;
