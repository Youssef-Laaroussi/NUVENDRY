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
    user?.role === 'instructor' ? '/merchant/offer-studio' : '/sign-up';

  return (
    <section
      id="for-instructors"
      tabIndex={-1}
      className="relative py-16 md:py-22 bg-[#FAFBF9] text-[#111827] overflow-hidden border-t border-[#EBF0EC] scroll-mt-20 focus:outline-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ========================================================= */}
        {/* TOP SPLIT: Left Editorial CTA + Right 3D Tilted Card      */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-6 items-center">
          {/* Left Column: Instructor Value Proposition & CTAs */}
          <div className="lg:col-span-5 xl:col-span-6 space-y-5">
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

          {/* Right Column: Prominent Organic Mint Wave + Sculpted 3D Inclined Card */}
          <div className="lg:col-span-7 xl:col-span-6 relative flex items-center justify-center py-8 sm:py-10 px-2 sm:px-6">
            {/* Bold 3-Lobe Organic Mint Backdrop matching exact silhouette behind the 3D card */}
            <svg
              viewBox="0 0 680 500"
              className="absolute -inset-x-6 -inset-y-4 w-[114%] h-[112%] pointer-events-none overflow-visible"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Main Organic Sage-Mint Wave Shape */}
              <path
                d="M92 64 C138 6, 246 4, 326 56 C392 98, 488 156, 596 222 C668 266, 676 346, 616 386 C568 418, 486 392, 412 418 C338 444, 282 494, 184 484 C84 474, 22 392, 30 292 C36 206, 56 112, 92 64 Z"
                fill="#D4ECDF"
              />
              {/* Subtle Inner Layered Mint Contour */}
              <path
                d="M118 92 C160 40, 250 38, 324 84 C386 122, 472 174, 568 232 C630 270, 636 336, 586 370 C542 398, 470 378, 402 402 C334 426, 276 466, 192 458 C106 450, 56 378, 62 290 C68 214, 86 134, 118 92 Z"
                fill="#C5E5D4"
                opacity="0.55"
              />
            </svg>

            {/* 3D Perspective Stage */}
            <div
              className="relative z-10 w-full max-w-[545px]"
              style={{ perspective: '1100px' }}
            >
              {/* Inclined 3D Tablet Assembly matching reference tilt & 3D thickness */}
              <div
                className="relative transition-transform duration-500"
                style={{
                  transform:
                    'rotateY(-15deg) rotateX(10deg) rotateZ(-2.2deg) skewX(-5.5deg)',
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Grounding Contact Shadow under the 3D Slab */}
                <div
                  className="absolute -bottom-5 left-4 right-0 h-11 rounded-[30px] pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(ellipse at center, rgba(15, 42, 30, 0.20) 0%, rgba(15, 42, 30, 0.08) 55%, rgba(15, 42, 30, 0) 80%)',
                    filter: 'blur(10px)',
                  }}
                />

                {/* Outer 3D Extruded Slab Wall (Right & Bottom 3D Thickness) */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 rounded-[26px] pointer-events-none"
                  style={{
                    transform: 'translate(11px, 10px)',
                    background:
                      'linear-gradient(135deg, #EDF2EF 0%, #E1EAE4 55%, #CFDAD3 100%)',
                    border: '1px solid #C6D3CB',
                    boxShadow: '8px 16px 32px rgba(14, 40, 29, 0.12)',
                  }}
                />

                {/* Intermediate Bevel Extrusion Layer for Seamless Solid 3D Edge */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 rounded-[26px] pointer-events-none"
                  style={{
                    transform: 'translate(5.5px, 5px)',
                    background:
                      'linear-gradient(135deg, #F5F8F6 0%, #E7EFEA 60%, #DAE4DE 100%)',
                  }}
                />

                {/* Front Crisp White 3D Tablet Surface */}
                <div className="relative z-20 bg-white rounded-[26px] border-[1.5px] border-white ring-1 ring-[#E1EBE5] p-5 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
                  {/* Feed Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#E8F6EE] text-[#167347] flex items-center justify-center shrink-0">
                        <AscendingBarsIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-[18px] sm:text-[20px] text-[#111827] tracking-tight leading-tight">
                          Real-Time Demand Feed
                        </h3>
                        <p className="text-[12px] sm:text-[12.5px] text-[#4B5563] leading-[1.38] mt-0.5 max-w-[275px]">
                          Live learner demand to help you build and sell, confidently.
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F1FAF4] border border-[#DCECE2] shadow-[0_3px_10px_rgba(15,41,30,0.08)] text-[#14533C] text-[12px] font-bold shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#198754]" />
                      <span>Live</span>
                    </span>
                  </div>

                  {/* Inner Spotlight Topic Card */}
                  <div className="bg-[#FAFDFB] rounded-2xl border border-[#EAF1EC] shadow-[0_3px_14px_rgba(15,41,30,0.03)] p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-4">
                    <div className="w-full sm:w-[136px] h-[116px] rounded-xl overflow-hidden shrink-0 bg-[#111827] shadow-xs">
                      <img
                        src={workshopFullstackImg}
                        alt="AI for Product Managers"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-2.5">
                      <h4 className="font-bold text-[15.5px] sm:text-[16px] text-[#111827] leading-tight">
                        AI for Product Managers
                      </h4>

                      {/* Demand & Interest Pills */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E5F5EC] text-[#156947] text-[11px] font-semibold whitespace-nowrap">
                          <TrendingUp className="w-3 h-3 stroke-[2.3]" />
                          <span>High Demand</span>
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#EEF2F0] text-[#1F2937] text-[11px] font-semibold whitespace-nowrap">
                          2,340 interested learners
                        </span>
                      </div>

                      {/* 3 Metric Signals Row */}
                      <div className="pt-1 flex items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1">
                            <AscendingBarsIcon className="w-3.5 h-3.5 text-[#167347]" />
                            <span className="font-extrabold text-[14px] text-[#111827]">
                              +418%
                            </span>
                          </div>
                          <span className="text-[10.5px] text-[#4B5563] block mt-0.5">
                            Demand (30d)
                          </span>
                        </div>

                        <div className="h-7 w-px bg-[#E3ECE6]" />

                        <div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-[#167347] stroke-[2]" />
                            <span className="font-extrabold text-[14px] text-[#111827]">2.3K</span>
                          </div>
                          <span className="text-[10.5px] text-[#4B5563] block mt-0.5">
                            Learners Interested
                          </span>
                        </div>

                        <div className="h-7 w-px bg-[#E3ECE6]" />

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
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-b from-[#19804D] to-[#13683E] hover:from-[#156F43] hover:to-[#0E5432] text-white text-[12.5px] font-semibold inline-flex items-center justify-center gap-2 transition-all shadow-[0_5px_14px_rgba(19,104,62,0.26)] whitespace-nowrap"
                    >
                      <span>Create Workshop for This Topic</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => setSaved((prev) => !prev)}
                      className={`py-3 px-4 rounded-xl border text-[12.5px] font-semibold inline-flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-[0_3px_10px_rgba(15,41,30,0.06)] ${
                        saved
                          ? 'bg-[#E6F4EC] border-[#BFE0CD] text-[#14533C]'
                          : 'bg-white hover:bg-[#F7FAF8] border-[#E2EAE5] text-[#111827]'
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
