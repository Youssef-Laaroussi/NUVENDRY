import React from 'react';
import { LearningDemand } from '../types';
import { Sparkles, DollarSign, Clock, Globe } from 'lucide-react';

export const DemandCard: React.FC<{ demand: LearningDemand }> = ({ demand }) => {
  return (
    <div className="bg-white rounded-xl border border-warmgray p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-mint text-forest">
          {demand.topic}
        </span>
        <span className="text-xs font-mono text-charcoal/60">
          ${(demand.max_budget_cents / 100).toFixed(2)} target
        </span>
      </div>

      <p className="text-xs text-charcoal italic bg-ivory/60 p-2.5 rounded-lg border border-warmgray/50 line-clamp-2">
        "{demand.raw_prompt}"
      </p>

      <div className="flex flex-wrap gap-1">
        {demand.related_skills.slice(0, 3).map((skill, idx) => (
          <span key={idx} className="text-[10px] bg-warmgray/40 text-charcoal/80 px-2 py-0.5 rounded">
            {skill}
          </span>
        ))}
      </div>

      <div className="pt-2 border-t border-warmgray/40 flex items-center justify-between text-[11px] text-charcoal/60">
        <span className="flex items-center gap-1">
          <Globe className="w-3 h-3 text-forest" /> {demand.language}
        </span>
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-forest" /> {Math.round(demand.confidence_score * 100)}% Match
        </span>
      </div>
    </div>
  );
};

