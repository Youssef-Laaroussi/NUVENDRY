import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, ArrowRight, ShieldCheck, CheckCircle2, 
  Layers, Users, DollarSign, Clock, Settings, Store
} from 'lucide-react';

export const InstructorStudioPreview: React.FC = () => {
  return (
    <section className="py-20 bg-charcoal text-ivory overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left: B2B Editorial Copy */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-mint text-xs font-mono font-semibold uppercase tracking-wider border border-white/10">
              <Store className="w-3.5 h-3.5 text-mint" />
              <span>For Instructors & Subject Experts</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white tracking-tight leading-tight">
                Stop guessing what to teach. Start with real learner demand.
              </h2>
              <p className="text-sm sm:text-base text-ivory/70 leading-relaxed max-w-xl">
                Conventional courses take weeks of speculative effort with no guarantee of enrollment. NUVENDRY flips the equation: inspect aggregated cohorts with stated budgets, generate targeted workshop proposals, and publish with verified PayPal Sandbox checkout.
              </p>
            </div>

            {/* Core Instructor Benefits List */}
            <div className="space-y-3 pt-2 text-xs sm:text-sm text-ivory/80">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-mint shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-medium">Pre-Aggregated Cohorts</strong>
                  <span className="text-ivory/60 text-xs">Discover verified demand clusters with actual stated willingness-to-pay.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-mint shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-medium">1-Click AI Offer Generation</strong>
                  <span className="text-ivory/60 text-xs">Synthesizes targeted curriculum outlines and outcomes calibrated to learner budgets.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-mint shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-medium">PayPal Sandbox Payment Capture</strong>
                  <span className="text-ivory/60 text-xs">Guaranteed seat reservations backed by server-authoritative payment confirmation.</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
              <Link
                to="/for-instructors"
                className="px-6 py-3 rounded-xl bg-forest text-ivory font-semibold text-xs hover:bg-mint hover:text-forest transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>Learn How Instructors Monetize</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/merchant/overview"
                className="px-6 py-3 rounded-xl bg-white/10 text-white font-medium text-xs hover:bg-white/20 transition-colors border border-white/10 flex items-center justify-center"
              >
                <span>Open Instructor Studio</span>
              </Link>
            </div>
          </div>

          {/* Right: Embedded High-Fidelity Studio UI Preview */}
          <div className="lg:col-span-6 bg-[#24332F] rounded-2xl border border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-mint" />
                <span className="font-mono font-medium text-ivory">NUVENDRY Offer Studio</span>
              </div>
              <span className="text-[10px] font-mono text-ivory/50">Production Interface Preview</span>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-3 text-xs">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono text-mint uppercase">Detected Cohort: LangGraph Agents</span>
                <span className="font-mono text-[11px] text-ivory/70 bg-white/10 px-2 py-0.5 rounded">2 Learners Waiting</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-ivory/50 font-mono uppercase block">Proposed Workshop Title</label>
                <div className="font-semibold text-sm text-white bg-white/5 p-2 rounded border border-white/10">
                  Building Production-Ready LangGraph Agents with Resilient State
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] text-ivory/50 font-mono uppercase block">Calibrated Price</label>
                  <div className="p-2 rounded bg-white/5 border border-white/10 font-mono font-bold text-mint text-sm">
                    $39.00 USD
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-ivory/50 font-mono uppercase block">Total Seat Capacity</label>
                  <div className="p-2 rounded bg-white/5 border border-white/10 font-mono text-white text-sm">
                    25 Seats Max
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-ivory/50 font-mono uppercase block">Synthesized Syllabus Outline</span>
                <div className="space-y-1 text-[11px] text-ivory/75">
                  <div className="p-1.5 rounded bg-white/5 flex items-center justify-between">
                    <span>1. StateGraph Architecture & Isolated State Bounds</span>
                    <span className="font-mono text-ivory/40">25m</span>
                  </div>
                  <div className="p-1.5 rounded bg-white/5 flex items-center justify-between">
                    <span>2. PostgreSQL Checkpointer Memory Implementation</span>
                    <span className="font-mono text-ivory/40">45m</span>
                  </div>
                  <div className="p-1.5 rounded bg-white/5 flex items-center justify-between">
                    <span>3. PayPal Orders v2 Sandbox Integration & Deployment</span>
                    <span className="font-mono text-ivory/40">30m</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <div className="w-full py-2.5 rounded-lg bg-mint text-forest font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Instructor Approved & Ready to Publish</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstructorStudioPreview;

