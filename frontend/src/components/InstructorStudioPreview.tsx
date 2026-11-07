import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ArrowRight,
  TrendingUp,
  Box,
  Bookmark,
  Zap,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import workshopFullstackImg from '../assets/workshop-fullstack.jpg';

/* Crisp 4-Bar Ascending Outline Icon matching the reference mockup */
const AscendingBarsIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="15" width="3" height="5" rx="0.8" />
    <rect x="8.3" y="12" width="3" height="8" rx="0.8" />
    <rect x="13.6" y="8.5" width="3" height="11.5" rx="0.8" />
    <rect x="18.9" y="4.5" width="3" height="15.5" rx="0.8" />
  </svg>
);

export const InstructorStudioPreview: React.FC = () => {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  const topicsHref =
    user?.role === 'instructor' ? '/merchant/demand-intelligence' : '/demand';
  const createWorkshopHref =
    user?.role === 'instructor' ? '/merchant/offer-studio' : '/for-instructors';

  return (
    <section className="relative py-16 md:py-20 bg-[#FAFBF9] text-[#111827] overflow-hidden border-t border-[#EBF0EC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ========================================================= */}
        {/* TOP SPLIT: Left Editorial CTA + Right 3D Product Card     */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Instructor Value Proposition & CTAs */}
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E6F4EC] text-[#14533C] text-[12px] font-semibold">
              <Users className="w-4 h-4 text-[#156847] stroke-[1.9]" />
              <span>For Instructors &amp; Subject Experts</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-serif font-bold text-[#14201B] tracking-tight leading-[1.1]">
              Stop guessing what to build
              <br className="hidden sm:inline" /> and sell what learners
              <br className="hidden sm:inline" />{' '}
              <span className="italic font-normal text-[#187446]">are asking for.</span>
            </h2>

            <p className="text-[14.5px] sm:text-[15.5px] text-[#374151] leading-[1.6] max-w-xl">
              Use real-time learner demand to find proven topics, create relevant workshops, and
              turn your expertise into revenue on NUVENDRY.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                to={topicsHref}
                className="px-6 py-3.5 rounded-[12px] bg-[#167347] hover:bg-[#115C38] text-white text-[14px] font-semibold inline-flex items-center justify-center gap-2.5 shadow-[0_6px_18px_rgba(22,115,71,0.22)] transition-all group"
              >
                <span>Find In-Demand Topics</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to={createWorkshopHref}
                className="px-7 py-3.5 rounded-[12px] bg-white hover:bg-[#F5F8F6] text-[#111827] border border-[#E2EAE5] text-[14px] font-bold inline-flex items-center justify-center shadow-[0_4px_14px_rgba(15,41,30,0.06)] transition-all"
              >
                <span>Create a Workshop</span>
              </Link>
            </div>
          </div>

          {/* Right Column: 3D-Tilted Real-Time Demand Feed Card over Organic Mint Wave */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            {/* Signature Two-Tone Organic Mint Wave Backdrop */}
            <svg
              viewBox="0 0 560 400"
              className="absolute -inset-x-4 -inset-y-6 w-[108%] h-[114%] pointer-events-none overflow-visible"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M44 295 C12 225, 34 92, 118 46 C188 8, 258 44, 336 42 C424 40, 526 98, 538 205 C548 292, 492 356, 398 362 C308 368, 224 378, 128 364 C72 356, 56 322, 44 295 Z"
                fill="#DFF2E7"
                opacity="0.82"
              />
              <path
                d="M78 292 C56 232, 76 124, 152 86 C214 54, 280 80, 356 82 C432 84, 504 134, 510 218 C515 286, 466 334, 384 340 L146 344 C98 344, 88 318, 78 292 Z"
                fill="#CFEAD9"
                opacity="0.48"
              />
            </svg>

            {/* 3D Perspective Product Tablet Card */}
            <div
              className="relative z-10 w-full max-w-[540px] bg-white rounded-[24px] border border-[#E3ECE6] p-5 sm:p-6 transition-transform duration-300"
              style={{
                transform: 'perspective(1350px) rotateY(-8deg) rotateX(3deg)',
                boxShadow:
                  '6px 7px 0px #E4ECE7, 16px 26px 46px rgba(15, 41, 30, 0.11)',
              }}
            >
              {/* Feed Card Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#EAF6EF] text-[#167347] flex items-center justify-center shrink-0">
                    <AscendingBarsIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[17px] sm:text-[18.5px] text-[#111827] leading-tight">
                      Real-Time Demand Feed
                    </h3>
                    <p className="text-[12px] text-[#4B5563] leading-[1.42] mt-0.5">
                      Live learner demand to help you build and sell, confidently.
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF7F1] border border-[#DCECE2] text-[#14533C] text-[11.5px] font-bold shrink-0">
                  <span className="w-2 h-2 rounded-full bg-[#198754]" />
                  <span>Live</span>
                </span>
              </div>

              {/* Spotlight Topic Card */}
              <div className="bg-[#FAFDFB] rounded-2xl border border-[#ECF2EE] p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-4">
                <div className="w-full sm:w-[132px] h-[118px] rounded-xl overflow-hidden shrink-0 bg-[#111827] shadow-2xs">
                  <img
                    src={workshopFullstackImg}
                    alt="AI for Product Managers"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-2.5">
                  <h4 className="font-bold text-[15.5px] text-[#111827] leading-tight">
                    AI for Product Managers
                  </h4>

                  {/* Demand & Interest Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E6F4EC] text-[#156947] text-[11px] font-semibold whitespace-nowrap">
                      <TrendingUp className="w-3 h-3 stroke-[2.3]" />
                      <span>High Demand</span>
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#F0F4F1] text-[#1F2937] text-[11px] font-semibold whitespace-nowrap">
                      2,340 interested learners
                    </span>
                  </div>

                  {/* 3 Metric Signals Row */}
                  <div className="pt-1 flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1">
                        <AscendingBarsIcon className="w-3.5 h-3.5 text-[#167347]" />
                        <span className="font-extrabold text-[14px] text-[#111827]">+418%</span>
                      </div>
                      <span className="text-[10.5px] text-[#4B5563] block mt-0.5">
                        Demand (30d)
                      </span>
                    </div>

                    <div className="h-7 w-px bg-[#E5ECE7]" />

                    <div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#167347] stroke-[2]" />
                        <span className="font-extrabold text-[14px] text-[#111827]">2.3K</span>
                      </div>
                      <span className="text-[10.5px] text-[#4B5563] block mt-0.5">
                        Learners Interested
                      </span>
                    </div>

                    <div className="h-7 w-px bg-[#E5ECE7]" />

                    <div>
                      <div className="flex items-center gap-1">
                        <Box className="w-3.5 h-3.5 text-[#167347] stroke-[2]" />
                        <span className="font-extrabold text-[14px] text-[#111827]">Low</span>
                      </div>
                      <span className="text-[10.5px] text-[#4B5563] block mt-0.5">
                        Competition
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Action Footer */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link
                  to={createWorkshopHref}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#167347] hover:bg-[#115C38] text-white text-[12.5px] font-semibold inline-flex items-center justify-center gap-2 transition-colors shadow-xs whitespace-nowrap"
                >
                  <span>Create Workshop for This Topic</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  type="button"
                  onClick={() => setSaved((prev) => !prev)}
                  className={`py-2.5 px-4 rounded-xl border text-[12.5px] font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                    saved
                      ? 'bg-[#E6F4EC] border-[#BFE0CD] text-[#14533C]'
                      : 'bg-[#F8FAF9] hover:bg-[#EFF4F1] border-[#E2EAE5] text-[#111827]'
                  }`}
                >
                  <Bookmark
                    className={`w-3.5 h-3.5 ${
                      saved ? 'fill-[#14533C] text-[#14533C]' : 'text-[#1F2937]'
                    }`}
                  />
                  <span>{saved ? 'Opportunity Saved' : 'Save Opportunity'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM 3-COLUMN VALUE STRIP WITH VERTICAL DIVIDERS        */}
        {/* ========================================================= */}
        <div className="mt-14 pt-10 border-t border-[#E5ECE7]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 md:divide-x md:divide-[#E5ECE7]">
            {/* Pillar 1 */}
            <div className="flex items-start gap-4 md:pr-8">
              <div className="w-11 h-11 rounded-xl bg-[#EAF6EF] text-[#167347] flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-5 h-5 stroke-[1.9]" />
              </div>
              <div>
                <h3 className="font-bold text-[15.5px] text-[#111827] mb-1">
                  Real Learner Demand
                </h3>
                <p className="text-[13px] text-[#4B5563] leading-[1.52]">
                  Discover topics learners are actively searching for right now.
                </p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="flex items-start gap-4 md:px-8">
              <div className="w-11 h-11 rounded-xl bg-[#EAF6EF] text-[#167347] flex items-center justify-center shrink-0 mt-0.5">
                <Layers className="w-5 h-5 stroke-[1.9]" />
              </div>
              <div>
                <h3 className="font-bold text-[15.5px] text-[#111827] mb-1">
                  Create with Confidence
                </h3>
                <p className="text-[13px] text-[#4B5563] leading-[1.52]">
                  Build workshops backed by real interest and growing demand.
                </p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="flex items-start gap-4 md:pl-8">
              <div className="w-11 h-11 rounded-xl bg-[#EAF6EF] text-[#167347] flex items-center justify-center shrink-0 mt-0.5">
                <AscendingBarsIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[15.5px] text-[#111827] mb-1">
                  Turn Expertise into Revenue
                </h3>
                <p className="text-[13px] text-[#4B5563] leading-[1.52]">
                  Publish, reach ready learners, and earn with every enrollment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstructorStudioPreview;
