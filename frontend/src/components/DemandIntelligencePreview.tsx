import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Layers, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, 
  Users, DollarSign, Clock, AlertCircle, Bot
} from 'lucide-react';
import { DemandCluster } from '../types';

interface Props {
  clusters: DemandCluster[];
}

export const DemandIntelligencePreview: React.FC<Props> = ({ clusters }) => {
  const [selectedClusterIndex, setSelectedClusterIndex] = useState(0);

  const displayClusters = clusters.length > 0 ? clusters : [
    {
      id: 'mock-1',
      name: 'Opportunity: Production LangGraph Agents & Memory Systems',
      topic: 'LangGraph Agents',
      summary: 'Aggregated 2 learner requests demanding hands-on implementation of LangGraph multi-agent supervisors with PostgreSQL checkpointers.',
      member_count: 2,
      avg_budget_cents: 4250,
      currency: 'USD',
      difficulty: 'intermediate',
      status: 'offer_generated',
      created_at: new Date().toISOString()
    }
  ];

  const activeCluster = displayClusters[selectedClusterIndex] || displayClusters[0];

  return (
    <section className="py-20 bg-ivory text-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint text-forest text-xs font-mono font-semibold uppercase tracking-wider">
              <Bot className="w-3.5 h-3.5" />
              <span>Real-Time Market Discovery</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif text-charcoal tracking-tight">
              AI Demand Intelligence Preview
            </h2>
            <p className="text-sm sm:text-base text-charcoal/70 leading-relaxed">
              Inspect how fragmented learner prompts are parsed, validated against conflicting constraints, and organized into viable commercial opportunities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/demand"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-warmgray text-charcoal text-xs font-semibold hover:bg-ivory transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-forest" />
              <span>Submit Demand Request</span>
            </Link>
            <Link
              to="/merchant/demand-intelligence"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest text-ivory text-xs font-semibold hover:bg-charcoal transition-colors shadow-xs"
            >
              <span>Explore Studio Table</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Demand Intelligence Panel */}
        <div className="bg-white rounded-2xl border border-warmgray p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Cluster List Selector */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-warmgray/60 text-xs text-charcoal/60">
                <span className="font-mono uppercase text-[11px]">Identified Demand Opportunities</span>
                <span className="font-mono">{displayClusters.length} Active Records</span>
              </div>

              <div className="space-y-2">
                {displayClusters.map((cluster, idx) => {
                  const isSelected = selectedClusterIndex === idx;
                  const avgPrice = (cluster.avg_budget_cents / 100).toFixed(2);
                  return (
                    <button
                      key={cluster.id}
                      onClick={() => setSelectedClusterIndex(idx)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-mint/40 border-forest shadow-xs'
                          : 'bg-ivory/50 border-warmgray hover:border-charcoal/30 hover:bg-ivory'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="font-semibold text-xs text-charcoal line-clamp-1">
                          {cluster.name}
                        </span>
                        <span className="font-mono text-xs font-bold text-forest shrink-0">
                          ${avgPrice}
                        </span>
                      </div>
                      <p className="text-[11px] text-charcoal/60 line-clamp-2 leading-relaxed mb-2">
                        {cluster.summary}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] font-mono text-charcoal/50">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-forest" /> {cluster.member_count} Learners
                        </span>
                        <span>•</span>
                        <span className="capitalize">{cluster.difficulty}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Selected Cluster Inspector */}
            <div className="lg:col-span-7 bg-ivory/80 rounded-xl border border-warmgray p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-warmgray gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase text-forest font-semibold">
                    Synthesized Opportunity Overview
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-medium text-charcoal mt-0.5">
                    {activeCluster.name}
                  </h3>
                </div>
                <div className="shrink-0">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-forest text-ivory text-[10px] font-mono font-semibold uppercase">
                    <CheckCircle2 className="w-3 h-3 text-mint" />
                    <span>Validated Cluster</span>
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase text-charcoal/50 block">Opportunity Summary</span>
                <p className="text-xs sm:text-sm text-charcoal/80 leading-relaxed bg-white p-3.5 rounded-lg border border-warmgray/60">
                  {activeCluster.summary}
                </p>
              </div>

              {/* Constraint Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white rounded-lg border border-warmgray/60 space-y-0.5">
                  <span className="text-[10px] font-mono text-charcoal/50 uppercase block">Cohort Size</span>
                  <div className="font-bold text-charcoal text-sm">{activeCluster.member_count} Qualified Learners</div>
                  <span className="text-[10px] text-charcoal/50">Willing to enroll</span>
                </div>

                <div className="p-3 bg-white rounded-lg border border-warmgray/60 space-y-0.5">
                  <span className="text-[10px] font-mono text-charcoal/50 uppercase block">Avg Budget Target</span>
                  <div className="font-bold text-forest font-mono text-sm">
                    ${(activeCluster.avg_budget_cents / 100).toFixed(2)} USD
                  </div>
                  <span className="text-[10px] text-charcoal/50">Derived from prompts</span>
                </div>

                <div className="p-3 bg-white rounded-lg border border-warmgray/60 space-y-0.5 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-mono text-charcoal/50 uppercase block">Delivery Model</span>
                  <div className="font-bold text-charcoal text-sm capitalize">{activeCluster.difficulty} Lab</div>
                  <span className="text-[10px] text-charcoal/50">Interactive live format</span>
                </div>
              </div>

              {/* Algorithmic Integrity Callout */}
              <div className="p-3.5 rounded-lg bg-mint/50 border border-forest/20 flex items-start gap-2.5 text-xs text-charcoal/80">
                <ShieldCheck className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Constraint Integrity:</strong> The algorithm validates pairwise budget constraints and schedule compatibility to avoid aggregating members with conflicting requirements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemandIntelligencePreview;

