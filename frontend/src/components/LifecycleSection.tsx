import React from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { PayPalOfficialLogo } from './HeroVisualization';

/* --- Step 1 Illustration: Learner at desk with laptop, plant and books --- */
const Step1Illustration: React.FC = () => (
  <div className="relative w-48 h-36 mx-auto flex items-center justify-center">
    {/* Soft mint circular backdrop aura */}
    <div 
      className="absolute inset-0 w-36 h-36 m-auto rounded-full pointer-events-none"
      style={{
        background: 'radial-gradient(circle, rgba(206, 238, 220, 0.95) 0%, rgba(228, 248, 237, 0.6) 55%, rgba(255, 255, 255, 0) 75%)',
        filter: 'blur(8px)'
      }}
    />

    <svg viewBox="0 0 190 140" className="relative z-10 w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Table top surface */}
      <rect x="15" y="118" width="160" height="4" rx="2" fill="#E2E8F0" />

      {/* Potted plant on left */}
      <g id="plant">
        {/* Pot */}
        <path d="M26 106 L30 118 H40 L44 106 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
        {/* Leaves */}
        <path d="M35 106 C30 96 23 98 25 90 C32 90 35 98 35 106 Z" fill="#22C55E" />
        <path d="M35 106 C40 94 48 96 46 88 C39 88 35 96 35 106 Z" fill="#16A34A" />
        <path d="M35 106 C32 92 36 82 35 80 C37 86 38 98 35 106 Z" fill="#15803D" />
      </g>

      {/* Learner character */}
      <g id="learner">
        {/* Torso / Shirt */}
        <path d="M72 118 L76 96 C76 89 82 86 94 86 C106 86 112 89 112 96 L116 118 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
        <path d="M88 86 L94 98 L100 86" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
        {/* Neck */}
        <rect x="90" y="80" width="8" height="8" rx="2" fill="#FBD5B5" />
        {/* Head */}
        <circle cx="94" cy="72" r="11" fill="#FCD9BD" />
        {/* Hair */}
        <path d="M83 72 C83 60 91 58 97 58 C104 58 107 62 107 69 C107 72 105 73 103 72 C101 70 99 66 94 66 C89 66 85 69 83 72 Z" fill="#1E293B" />
        <path d="M83 70 Q81 74 83 77 Q86 75 86 72 Z" fill="#1E293B" />
        {/* Face details */}
        <circle cx="98" cy="71" r="1.2" fill="#1E293B" />
        <path d="M96 76 Q99 78 101 76" stroke="#EA580C" strokeWidth="1" strokeLinecap="round" />
        {/* Arms typing */}
        <path d="M78 98 Q88 105 102 108" stroke="#FCD9BD" strokeWidth="5" strokeLinecap="round" />
      </g>

      {/* Laptop */}
      <g id="laptop">
        {/* Base */}
        <rect x="100" y="112" width="38" height="4" rx="1.5" fill="#475569" />
        {/* Screen */}
        <path d="M106 112 L115 88 H142 L133 112 Z" fill="#1E293B" />
        <path d="M108 110 L116 90 H140 L132 110 Z" fill="#0F172A" />
        {/* Logo indicator */}
        <circle cx="126" cy="99" r="1.5" fill="#94A3B8" />
      </g>

      {/* Stack of books on right */}
      <g id="books">
        {/* Book 1 (bottom, green) */}
        <rect x="148" y="112" width="26" height="5" rx="1" fill="#166534" />
        {/* Book 2 (middle, ivory) */}
        <rect x="150" y="106" width="23" height="5" rx="1" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="0.8" />
        {/* Book 3 (top, coral) */}
        <rect x="152" y="101" width="20" height="4.5" rx="1" fill="#EA580C" />
      </g>
    </svg>
  </div>
);

/* --- Step 2 Illustration: 3D AI Chip on Pedestal with Circuit Pins --- */
const Step2Illustration: React.FC = () => (
  <div className="relative w-48 h-36 mx-auto flex items-center justify-center">
    {/* Soft mint circular backdrop aura */}
    <div 
      className="absolute inset-0 w-36 h-36 m-auto rounded-full pointer-events-none"
      style={{
        background: 'radial-gradient(circle, rgba(206, 238, 220, 0.95) 0%, rgba(228, 248, 237, 0.6) 55%, rgba(255, 255, 255, 0) 75%)',
        filter: 'blur(8px)'
      }}
    />

    <svg viewBox="0 0 190 140" className="relative z-10 w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 3D Circular Pedestal */}
      <g id="pedestal">
        {/* Pedestal Base cylinder */}
        <ellipse cx="95" cy="118" rx="46" ry="12" fill="#B9E5CE" />
        <path d="M49 118 V110 C49 116.6 69.6 122 95 122 C120.4 122 141 116.6 141 110 V118 C141 124.6 120.4 130 95 130 C69.6 130 49 124.6 49 118 Z" fill="#9DD5B7" />
        {/* Pedestal Top face */}
        <ellipse cx="95" cy="110" rx="46" ry="12" fill="#DCF4E7" />
        <ellipse cx="95" cy="110" rx="36" ry="8" fill="#EAF9F1" />
      </g>

      {/* AI Chip standing upright on pedestal */}
      <g id="ai-chip">
        {/* Circuit Pins - Left */}
        <line x1="72" y1="56" x2="63" y2="56" stroke="#165C45" strokeWidth="2.8" strokeLinecap="round" />
        <line x1="72" y1="67" x2="63" y2="67" stroke="#165C45" strokeWidth="2.8" strokeLinecap="round" />
        <line x1="72" y1="78" x2="63" y2="78" stroke="#165C45" strokeWidth="2.8" strokeLinecap="round" />

        {/* Circuit Pins - Right */}
        <line x1="118" y1="56" x2="127" y2="56" stroke="#165C45" strokeWidth="2.8" strokeLinecap="round" />
        <line x1="118" y1="67" x2="127" y2="67" stroke="#165C45" strokeWidth="2.8" strokeLinecap="round" />
        <line x1="118" y1="78" x2="127" y2="78" stroke="#165C45" strokeWidth="2.8" strokeLinecap="round" />

        {/* Circuit Pins - Top */}
        <line x1="84" y1="46" x2="84" y2="37" stroke="#165C45" strokeWidth="2.8" strokeLinecap="round" />
        <line x1="95" y1="46" x2="95" y2="37" stroke="#165C45" strokeWidth="2.8" strokeLinecap="round" />
        <line x1="106" y1="46" x2="106" y2="37" stroke="#165C45" strokeWidth="2.8" strokeLinecap="round" />

        {/* Circuit Pins - Bottom */}
        <line x1="84" y1="88" x2="84" y2="97" stroke="#165C45" strokeWidth="2.8" strokeLinecap="round" />
        <line x1="95" y1="88" x2="95" y2="97" stroke="#165C45" strokeWidth="2.8" strokeLinecap="round" />
        <line x1="106" y1="88" x2="106" y2="97" stroke="#165C45" strokeWidth="2.8" strokeLinecap="round" />

        {/* Chip Outer Body */}
        <rect x="72" y="46" width="46" height="42" rx="7" fill="#FFFFFF" stroke="#165C45" strokeWidth="3" />
        {/* Chip Inner Core Border */}
        <rect x="78" y="52" width="34" height="30" rx="4" fill="#F0FDF4" stroke="#86EFAC" strokeWidth="1.2" />

        {/* "AI" Text centered in Chip */}
        <text 
          x="95" 
          y="73" 
          textAnchor="middle" 
          fill="#165C45" 
          fontFamily="system-ui, -apple-system, sans-serif" 
          fontWeight="800" 
          fontSize="16"
          letterSpacing="0.5"
        >
          AI
        </text>
      </g>
    </svg>
  </div>
);

/* --- Step 3 Illustration: Instructor with Glasses, Laptop, and Floating Checklist Card --- */
const Step3Illustration: React.FC = () => (
  <div className="relative w-48 h-36 mx-auto flex items-center justify-center">
    {/* Soft mint circular backdrop aura */}
    <div 
      className="absolute inset-0 w-36 h-36 m-auto rounded-full pointer-events-none"
      style={{
        background: 'radial-gradient(circle, rgba(206, 238, 220, 0.95) 0%, rgba(228, 248, 237, 0.6) 55%, rgba(255, 255, 255, 0) 75%)',
        filter: 'blur(8px)'
      }}
    />

    <svg viewBox="0 0 190 140" className="relative z-10 w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Desk surface */}
      <rect x="15" y="118" width="160" height="4" rx="2" fill="#E2E8F0" />

      {/* Instructor Character */}
      <g id="instructor">
        {/* Green Blouse / Torso */}
        <path d="M46 118 L52 94 C54 86 62 84 74 84 C86 84 94 86 96 94 L102 118 Z" fill="#15803D" />
        <path d="M70 84 L74 94 L78 84" stroke="#166534" strokeWidth="1.5" strokeLinecap="round" />
        {/* Neck */}
        <rect x="70" y="78" width="8" height="8" rx="2" fill="#FCD9BD" />
        {/* Head */}
        <circle cx="74" cy="70" r="10.5" fill="#FCD9BD" />
        {/* Hair - Stylish Bob / Ponytail */}
        <path d="M63 72 C61 58 71 56 79 56 C87 56 89 60 89 67 C89 74 87 76 85 75 C83 73 82 66 75 66 C68 66 65 69 63 72 Z" fill="#0F172A" />
        <path d="M62 72 Q60 84 65 92 Q68 84 65 74 Z" fill="#0F172A" />
        {/* Spectacles / Glasses */}
        <rect x="71" y="67" width="5.5" height="4.5" rx="1.2" stroke="#0F172A" strokeWidth="1.2" fill="none" />
        <rect x="78" y="67" width="5.5" height="4.5" rx="1.2" stroke="#0F172A" strokeWidth="1.2" fill="none" />
        <line x1="76.5" y1="69" x2="78" y2="69" stroke="#0F172A" strokeWidth="1.2" />
        {/* Arm Typing */}
        <path d="M56 96 Q70 104 84 108" stroke="#FCD9BD" strokeWidth="4.5" strokeLinecap="round" />
      </g>

      {/* Silver Laptop */}
      <g id="instructor-laptop">
        <rect x="80" y="112" width="34" height="3.5" rx="1.5" fill="#94A3B8" />
        <path d="M86 112 L94 92 H118 L110 112 Z" fill="#CBD5E1" />
        <path d="M88 110 L95 94 H116 L109 110 Z" fill="#F8FAFC" />
        <circle cx="106" cy="102" r="1.5" fill="#94A3B8" />
      </g>

      {/* Floating Card: Content, Price, Capacity */}
      <g id="floating-card">
        {/* Card shadow & container */}
        <rect x="120" y="38" width="56" height="52" rx="8" fill="#FFFFFF" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.08))" />
        <rect x="120" y="38" width="56" height="52" rx="8" stroke="#E2E8F0" strokeWidth="1" />

        {/* Item 1: Content */}
        <circle cx="129" cy="49" r="4" fill="#22C55E" />
        <path d="M127.5 49 L128.5 50.2 L130.8 47.8" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <text x="136" y="52" fill="#334155" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="600" fontSize="7.5">Content</text>

        {/* Item 2: Price */}
        <circle cx="129" cy="64" r="4" fill="#22C55E" />
        <path d="M127.5 64 L128.5 65.2 L130.8 62.8" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <text x="136" y="67" fill="#334155" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="600" fontSize="7.5">Price</text>

        {/* Item 3: Capacity */}
        <circle cx="129" cy="79" r="4" fill="#22C55E" />
        <path d="M127.5 79 L128.5 80.2 L130.8 77.8" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <text x="136" y="82" fill="#334155" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="600" fontSize="7.5">Capacity</text>
      </g>
    </svg>
  </div>
);

/* --- Step 4 Illustration: Official PayPal Badge Card with Checkmark Circle --- */
const Step4Illustration: React.FC = () => (
  <div className="relative w-48 h-36 mx-auto flex items-center justify-center">
    {/* Soft mint circular backdrop aura */}
    <div 
      className="absolute inset-0 w-36 h-36 m-auto rounded-full pointer-events-none"
      style={{
        background: 'radial-gradient(circle, rgba(206, 238, 220, 0.95) 0%, rgba(228, 248, 237, 0.6) 55%, rgba(255, 255, 255, 0) 75%)',
        filter: 'blur(8px)'
      }}
    />

    {/* Floating White Card with Official PayPal Logo + Checkmark Badge */}
    <div className="relative z-10 w-44 sm:w-48 bg-white py-4 px-4 rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.07)] border border-gray-100/90 flex items-center justify-between gap-3 transition-transform hover:-translate-y-0.5">
      <div className="flex-1 flex items-center justify-center">
        <PayPalOfficialLogo className="h-6 sm:h-7 w-auto" />
      </div>
      <div className="w-6 h-6 rounded-full bg-[#14533c] text-white flex items-center justify-center shrink-0 shadow-xs">
        <Check className="w-3.5 h-3.5 stroke-[3]" />
      </div>
    </div>
  </div>
);

export const LifecycleSection: React.FC = () => {
  return (
    <section className="relative py-20 bg-white overflow-hidden">
      {/* Soft background ambient gradient aura matching the hero design */}
      <div 
        className="absolute top-1/2 left-0 -translate-y-1/2 w-[420px] h-[360px] rounded-full pointer-events-none z-0 opacity-60"
        style={{
          background: 'radial-gradient(circle, rgba(206, 238, 220, 0.75) 0%, rgba(228, 248, 237, 0.35) 55%, rgba(255, 255, 255, 0) 75%)',
          filter: 'blur(40px)',
        }}
      />
      <div 
        className="absolute top-1/2 right-0 -translate-y-1/2 w-[420px] h-[360px] rounded-full pointer-events-none z-0 opacity-60"
        style={{
          background: 'radial-gradient(circle, rgba(206, 238, 220, 0.75) 0%, rgba(228, 248, 237, 0.35) 55%, rgba(255, 255, 255, 0) 75%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-widest text-[#14533c]">
            THE LIFECYCLE
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-bold text-gray-900 tracking-tight leading-tight">
            How NUVENDRY Works
          </h2>
        </div>

        {/* 4-Step Horizontal Sequence */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative">
          
          {/* STEP 1 */}
          <div className="flex flex-col relative group">
            {/* Step badge */}
            <div className="mb-2">
              <span className="w-7 h-7 rounded-full bg-[#14533c] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                1
              </span>
            </div>

            {/* Illustration */}
            <div className="mb-4">
              <Step1Illustration />
            </div>

            {/* Content */}
            <div className="space-y-2 text-left">
              <h3 className="font-bold text-base sm:text-lg text-gray-900">
                Express Your Need
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Learners state what they want to learn in plain language, along with budget, language, and schedule.
              </p>
            </div>

            {/* Arrow connector to next step (visible on desktop) */}
            <div className="hidden lg:flex absolute -right-3 top-20 -translate-y-1/2 text-gray-400 z-20 pointer-events-none">
              <ArrowRight className="w-5 h-5 text-gray-400 stroke-[1.8]" />
            </div>
          </div>

          {/* STEP 2 */}
          <div className="flex flex-col relative group">
            {/* Step badge */}
            <div className="mb-2">
              <span className="w-7 h-7 rounded-full bg-[#14533c] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                2
              </span>
            </div>

            {/* Illustration */}
            <div className="mb-4">
              <Step2Illustration />
            </div>

            {/* Content */}
            <div className="space-y-2 text-left">
              <h3 className="font-bold text-base sm:text-lg text-gray-900">
                AI Clusters Demand
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Our AI validates budget and compatibility across requests, then intelligently clusters them into real opportunities.
              </p>
            </div>

            {/* Arrow connector to next step (visible on desktop) */}
            <div className="hidden lg:flex absolute -right-3 top-20 -translate-y-1/2 text-gray-400 z-20 pointer-events-none">
              <ArrowRight className="w-5 h-5 text-gray-400 stroke-[1.8]" />
            </div>
          </div>

          {/* STEP 3 */}
          <div className="flex flex-col relative group">
            {/* Step badge */}
            <div className="mb-2">
              <span className="w-7 h-7 rounded-full bg-[#14533c] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                3
              </span>
            </div>

            {/* Illustration */}
            <div className="mb-4">
              <Step3Illustration />
            </div>

            {/* Content */}
            <div className="space-y-2 text-left">
              <h3 className="font-bold text-base sm:text-lg text-gray-900">
                Instructor Publishes
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Instructors review an AI-generated offer, adjust the content, price, and capacity, then publish it as a workshop.
              </p>
            </div>

            {/* Arrow connector to next step (visible on desktop) */}
            <div className="hidden lg:flex absolute -right-3 top-20 -translate-y-1/2 text-gray-400 z-20 pointer-events-none">
              <ArrowRight className="w-5 h-5 text-gray-400 stroke-[1.8]" />
            </div>
          </div>

          {/* STEP 4 */}
          <div className="flex flex-col relative group">
            {/* Step badge */}
            <div className="mb-2">
              <span className="w-7 h-7 rounded-full bg-[#14533c] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                4
              </span>
            </div>

            {/* Illustration */}
            <div className="mb-4">
              <Step4Illustration />
            </div>

            {/* Content */}
            <div className="space-y-2 text-left">
              <h3 className="font-bold text-base sm:text-lg text-gray-900">
                Book with PayPal
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Learners receive rewards for eligible bookings and complete a seamless checkout via PayPal Sandbox.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default LifecycleSection;

