import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, User, Layers, Zap } from 'lucide-react';
import finalCtaLaptopImg from '../assets/final-cta-laptop.jpg';
import { scrollToSectionById } from '../layouts/PublicLayout';

/* Official PayPal Double-P Monogram (Blue Brand Variant) */
const PayPalBlueMark: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 38 44"
    className={className}
    aria-label="PayPal"
  >
    <path
      fill="#003087"
      d="M30.9 4.8C28.8 2.4 25 1.4 20.1 1.4H6.9c-.9 0-1.7.7-1.9 1.6L.1 34.1c-.1.7.4 1.3 1.1 1.3h7.3l1.8-11.6-.1.4c.2-.9.9-1.6 1.9-1.6h3.9c7.6 0 13.6-3.1 15.3-12 .1-.3.1-.5.1-.8.5-2.1 0-3.6-.5-5z"
    />
    <path
      fill="#0070E0"
      d="M31.4 9.8c-.1.3-.1.5-.1.8-1.7 8.9-7.7 12-15.3 12h-3.9c-.9 0-1.7.7-1.9 1.6L8 38.4l-.6 4c-.1.6.4 1.1 1 1.1h6.4c.8 0 1.5-.6 1.6-1.4l.1-.3 1.3-8.1.1-.4c.1-.8.8-1.4 1.6-1.4h1c6.6 0 11.8-2.7 13.3-10.5.6-3.2.3-5.9-1.4-7.8-.5-.6-1.2-1.1-2-1.5.1.5.1 1.1 0 1.7z"
    />
    <path
      fill="#001C64"
      d="M29.6 9c-.6-.2-1.3-.3-2-.5-.7-.1-1.5-.2-2.4-.2h-9.7c-.8 0-1.5.6-1.6 1.4L11.8 23l-.1.4c.2-.9.9-1.6 1.9-1.6h3.9c7.6 0 13.6-3.1 15.3-12 .1-.3.1-.5.1-.8-.9-.5-2-.8-3.3-1z"
    />
  </svg>
);

/* Official PayPal Double-P Monogram (Forest-Green Monochrome Trust Bar Variant) */
const PayPalForestMark: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 38 44"
    className={className}
    aria-label="PayPal Sandbox"
  >
    <path
      fill="#115939"
      d="M30.9 4.8C28.8 2.4 25 1.4 20.1 1.4H6.9c-.9 0-1.7.7-1.9 1.6L.1 34.1c-.1.7.4 1.3 1.1 1.3h7.3l1.8-11.6-.1.4c.2-.9.9-1.6 1.9-1.6h3.9c7.6 0 13.6-3.1 15.3-12 .1-.3.1-.5.1-.8.5-2.1 0-3.6-.5-5z"
    />
    <path
      fill="#268E5E"
      d="M31.4 9.8c-.1.3-.1.5-.1.8-1.7 8.9-7.7 12-15.3 12h-3.9c-.9 0-1.7.7-1.9 1.6L8 38.4l-.6 4c-.1.6.4 1.1 1 1.1h6.4c.8 0 1.5-.6 1.6-1.4l.1-.3 1.3-8.1.1-.4c.1-.8.8-1.4 1.6-1.4h1c6.6 0 11.8-2.7 13.3-10.5.6-3.2.3-5.9-1.4-7.8-.5-.6-1.2-1.1-2-1.5.1.5.1 1.1 0 1.7z"
    />
    <path
      fill="#0B3F28"
      d="M29.6 9c-.6-.2-1.3-.3-2-.5-.7-.1-1.5-.2-2.4-.2h-9.7c-.8 0-1.5.6-1.6 1.4L11.8 23l-.1.4c.2-.9.9-1.6 1.9-1.6h3.9c7.6 0 13.6-3.1 15.3-12 .1-.3.1-.5.1-.8-.9-.5-2-.8-3.3-1z"
    />
  </svg>
);

/* 4-Point Diamond Star Icon matching the top pill */
const FourPointStarIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M10 2.2L12.1 7.9L17.8 10L12.1 12.1L10 17.8L7.9 12.1L2.2 10L7.9 7.9L10 2.2Z" />
  </svg>
);

export const FinalCtaSection: React.FC = () => {
  const location = useLocation();

  return (
    <section
      id="get-started"
      tabIndex={-1}
      className="relative pt-14 md:pt-18 bg-white text-[#111827] overflow-hidden border-t border-[#EBF0EC] scroll-mt-20 focus:outline-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ========================================================= */}
        {/* MAIN SPLIT: Left Editorial CTA + Right Stacked & 3D Frame */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center">
          {/* Left Column: Editorial Headline & Dual CTAs */}
          <div className="lg:col-span-5 space-y-5">
            <span className="text-xs font-bold uppercase tracking-widest text-[#14533c]">DEMAND-DRIVEN LEARNING MARKETPLACE</span>

            <h2 className="text-4xl sm:text-5xl lg:text-[52px] font-serif font-medium text-[#111827] tracking-tight leading-[1.08]">
              Turn interest into
              <br />
              <span className="italic font-normal text-[#165C45]">opportunity.</span>
            </h2>

            <p className="text-[14.5px] sm:text-[15.5px] text-[#374151] leading-[1.6] max-w-md">
              Whether you are learning advanced AI engineering or sharing expertise, NUVENDRY aligns
              demand with real commerce.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <motion.div whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.015 }}>
                <Link
                  to="/workshops"
                  className="nv-btn-press px-6 py-3.5 rounded-[12px] bg-[#104631] hover:bg-[#0A3122] text-white text-[14px] font-semibold inline-flex items-center justify-center gap-2 shadow-[0_6px_18px_rgba(16,70,49,0.20)] transition-all group"
                >
                  <span>Discover Workshops</span>
                  <ArrowRight className="w-4 h-4 nv-icon-slide" />
                </Link>
              </motion.div>

              <motion.div whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.015 }}>
                <Link
                  to="/#for-instructors"
                  onClick={(e) => {
                    if (location.pathname === '/' && location.hash === '#for-instructors') {
                      e.preventDefault();
                      scrollToSectionById('for-instructors');
                    }
                  }}
                  className="nv-btn-press px-6 py-3.5 rounded-[12px] bg-white hover:bg-[#F7FAF8] text-[#111827] border border-[#E2EAE5] text-[14px] font-bold inline-flex items-center justify-center shadow-[0_4px_14px_rgba(15,41,30,0.06)] transition-all"
                >
                  <span>Become an Instructor</span>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Right Column: 3 Connected Cards + 3D Inclined Laptop Frame over Organic Mint Wave */}
          <div className="lg:col-span-7 relative flex flex-col sm:flex-row items-center justify-end gap-4 sm:gap-5 py-4">
            {/* Signature Two-Tone Organic Mint Wave Backdrop */}
            <svg
              viewBox="0 0 760 440"
              className="absolute -inset-x-4 -inset-y-2 w-[108%] h-[106%] pointer-events-none overflow-visible"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M195 365 C140 335, 225 225, 330 120 C408 42, 488 8, 580 34 C668 58, 756 155, 748 262 C740 356, 654 412, 535 416 C408 420, 265 404, 195 365 Z"
                fill="#D6EDE0"
              />
              <path
                d="M245 352 C205 322, 272 226, 366 138 C436 72, 506 44, 586 68 C658 90, 722 170, 715 260 C708 338, 636 386, 528 390 C416 394, 302 384, 245 352 Z"
                fill="#C7E6D5"
                opacity="0.55"
              />
            </svg>

            {/* Left Stack: 3 Connected Feature Cards */}
            <div className="relative z-20 flex flex-col items-start shrink-0">
              {/* Card 1: Learn In-Demand Skills */}
              <motion.div
                whileHover={{ x: 5, transition: { type: 'spring', stiffness: 450, damping: 25 } }}
                whileTap={{ scale: 0.985 }}
              >
                <Link
                  to="/workshops"
                  className="nv-card-lift w-[258px] sm:w-[268px] bg-white rounded-2xl border border-[#E6EFE9] px-4 py-3.5 shadow-[0_8px_24px_rgba(15,41,30,0.06)] hover:shadow-[0_12px_28px_rgba(15,41,30,0.09)] flex items-center gap-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#156847]"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#EAF6EF] text-[#156847] flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 stroke-[1.9]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-[13.5px] text-[#111827] leading-tight">
                      Learn In-Demand Skills
                    </h3>
                    <p className="text-[11.5px] text-[#4B5563] leading-snug mt-0.5">
                      AI, data, MLOps, and more.
                    </p>
                  </div>
                </Link>
              </motion.div>

              {/* Vertical Green Connector 1 -> 2 */}
              <div className="ml-[37px] w-[1.5px] h-3.5 bg-[#76BB9A]" />

              {/* Card 2: Share Your Expertise */}
              <motion.div
                whileHover={{ x: 5, transition: { type: 'spring', stiffness: 450, damping: 25 } }}
                whileTap={{ scale: 0.985 }}
              >
                <Link
                  to="/#for-instructors"
                  onClick={(e) => {
                    if (location.pathname === '/') {
                      e.preventDefault();
                      scrollToSectionById('for-instructors');
                    }
                  }}
                  className="nv-card-lift w-[258px] sm:w-[268px] bg-white rounded-2xl border border-[#E6EFE9] px-4 py-3.5 shadow-[0_8px_24px_rgba(15,41,30,0.06)] hover:shadow-[0_12px_28px_rgba(15,41,30,0.09)] flex items-center gap-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#156847]"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#EAF6EF] text-[#156847] flex items-center justify-center shrink-0">
                    <Layers className="w-5 h-5 stroke-[1.9]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-[13.5px] text-[#111827] leading-tight">
                      Share Your Expertise
                    </h3>
                    <p className="text-[11.5px] text-[#4B5563] leading-snug mt-0.5">
                      Turn knowledge into
                      <br />
                      real opportunities.
                    </p>
                  </div>
                </Link>
              </motion.div>

              {/* Vertical Green Connector 2 -> 3 */}
              <div className="ml-[37px] w-[1.5px] h-3.5 bg-[#76BB9A]" />

              {/* Card 3: Get Real Rewards */}
              <motion.div
                whileHover={{ x: 5, transition: { type: 'spring', stiffness: 450, damping: 25 } }}
                whileTap={{ scale: 0.985 }}
              >
                <Link
                  to="/#rewards"
                  onClick={(e) => {
                    if (location.pathname === '/') {
                      e.preventDefault();
                      scrollToSectionById('rewards');
                    }
                  }}
                  className="nv-card-lift w-[258px] sm:w-[268px] bg-white rounded-2xl border border-[#E6EFE9] px-4 py-3.5 shadow-[0_8px_24px_rgba(15,41,30,0.06)] hover:shadow-[0_12px_28px_rgba(15,41,30,0.09)] flex items-center gap-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#156847]"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#F2F7FC] border border-[#E5EFF9] flex items-center justify-center shrink-0">
                    <PayPalBlueMark className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-[13.5px] text-[#111827] leading-tight">
                      Get Real Rewards
                    </h3>
                    <p className="text-[11.5px] text-[#4B5563] leading-snug mt-0.5">
                      Secure checkout via
                      <br />
                      PayPal Sandbox.
                    </p>
                  </div>
                </Link>
              </motion.div>
            </div>

            {/* Subtle Diagonal Connector + Green Node Dot between Stack & 3D Frame */}
            <div className="hidden xl:flex flex-col items-center justify-center relative z-20 -mx-2 pointer-events-none">
              <svg width="28" height="90" viewBox="0 0 28 90" fill="none">
                <line
                  x1="4"
                  y1="78"
                  x2="20"
                  y2="20"
                  stroke="#8AC7AA"
                  strokeWidth="1.4"
                />
                <motion.circle
                  cx="19"
                  cy="24"
                  r="3.5"
                  fill="#18794E"
                  animate={{ r: [3.5, 4.3, 3.5], opacity: [0.85, 1, 0.85] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                />
              </svg>
            </div>

            {/* Right 3D Inclined White-Framed Laptop Card */}
            <div
              className="relative z-20 w-full max-w-[355px] sm:max-w-[375px] py-2 pr-2"
              style={{ perspective: '1050px' }}
            >
              <div
                className="relative transition-transform duration-500"
                style={{
                  transform:
                    'rotateY(-15deg) rotateX(9deg) rotateZ(-1.8deg) skewX(-6deg)',
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Grounding Contact Shadow underneath the 3D Frame */}
                <div
                  className="absolute -bottom-4 left-3 right-1 h-9 rounded-[28px] pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(ellipse at center, rgba(15, 42, 30, 0.20) 0%, rgba(15, 42, 30, 0.08) 55%, rgba(15, 42, 30, 0) 80%)',
                    filter: 'blur(9px)',
                  }}
                />

                {/* Outer 3D Extruded White/Pearl Slab Edge */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 rounded-[26px] pointer-events-none"
                  style={{
                    transform: 'translate(9px, 8px)',
                    background:
                      'linear-gradient(135deg, #F0F5F2 0%, #E2ECE6 55%, #CFDCD4 100%)',
                    border: '1px solid #C6D5CC',
                    boxShadow: '8px 16px 32px rgba(14, 40, 29, 0.12)',
                  }}
                />

                {/* Intermediate Smooth Bevel Layer */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 rounded-[26px] pointer-events-none"
                  style={{
                    transform: 'translate(4.5px, 4px)',
                    background:
                      'linear-gradient(135deg, #FFFFFF 0%, #EAF1ED 65%, #DCE6E0 100%)',
                  }}
                />

                {/* Front Glossy White Frame housing the Developer Laptop Photo */}
                <div className="relative z-20 bg-white rounded-[26px] p-2.5 sm:p-3 border-[1.5px] border-white ring-1 ring-[#E2ECE6] shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
                  <div className="rounded-[18px] overflow-hidden bg-[#161D1B] aspect-[4/3]">
                    <img
                      src={finalCtaLaptopImg}
                      alt="NUVENDRY AI Engineering Workspace"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* BOTTOM 3-PILLAR TRUST STRIP                               */}
      {/* ========================================================= */}
      <div className="mt-12 border-t border-[#EDF2EE] bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-center gap-y-3 gap-x-6 sm:gap-x-10 text-[13px] font-semibold text-[#1F2937]">
          <div className="inline-flex items-center gap-2 whitespace-nowrap">
            <Zap className="w-4 h-4 text-[#167347] stroke-[2]" />
            <span>Real Learner Demand</span>
          </div>

          <div className="hidden sm:block h-5 w-px bg-[#E3EBE6]" />

          <div className="inline-flex items-center gap-2 whitespace-nowrap">
            <Layers className="w-4 h-4 text-[#167347] stroke-[2]" />
            <span>AI Proposal Generation</span>
          </div>

          <div className="hidden sm:block h-5 w-px bg-[#E3EBE6]" />

          <div className="inline-flex items-center gap-2 whitespace-nowrap">
            <PayPalForestMark className="w-4 h-4 shrink-0" />
            <span>PayPal Sandbox Payments</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCtaSection;

