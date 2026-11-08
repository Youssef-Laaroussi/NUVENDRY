import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { PayPalOfficialLogo } from './HeroVisualization';
import { scrollToSectionById } from '../layouts/PublicLayout';
import step1Img from '../assets/step1-learner.png';
import step3Img from '../assets/step3-instructor.png';

/* --- Exact Organic Mint Wave Cloud Backdrop matching reference design --- */
const OrganicWaveBackdrop: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg 
    viewBox="0 0 240 180" 
    className={`absolute inset-0 w-full h-full pointer-events-none -z-10 ${className}`} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer soft ambient mint wave */}
    <path 
      d="M 38,95 C 18,50 62,18 118,16 C 172,14 212,42 216,88 C 220,132 182,166 128,168 C 68,170 44,132 38,95 Z" 
      fill="#E5F6EE" 
      opacity="0.85"
    />
    {/* Inner fluid wave contour */}
    <path 
      d="M 52,90 C 35,58 72,30 120,28 C 165,26 200,50 202,86 C 205,124 172,154 126,155 C 75,156 56,120 52,90 Z" 
      fill="#DAF0E4" 
    />
  </svg>
);

/* --- Step 2: 3D AI Chip on Pedestal with Circuit Pins --- */
const Step2Illustration: React.FC = () => (
  <div className="relative w-full h-44 mx-auto flex items-center justify-center">
    <OrganicWaveBackdrop />

    <svg viewBox="0 0 190 140" className="relative z-10 w-full h-full max-w-[200px]" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 3D Circular Pedestal */}
      <g id="pedestal">
        <ellipse cx="95" cy="118" rx="46" ry="12" fill="#B9E5CE" />
        <path d="M49 118 V110 C49 116.6 69.6 122 95 122 C120.4 122 141 116.6 141 110 V118 C141 124.6 120.4 130 95 130 C69.6 130 49 124.6 49 118 Z" fill="#9DD5B7" />
        <ellipse cx="95" cy="110" rx="46" ry="12" fill="#DCF4E7" />
        <ellipse cx="95" cy="110" rx="36" ry="8" fill="#EAF9F1" />
      </g>

      {/* AI Chip standing upright on pedestal */}
      <motion.g
        id="ai-chip"
        animate={{ y: [0, -3.5, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
      >
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
      </motion.g>
    </svg>
  </div>
);

/* --- Step 4: Official PayPal Badge Card with Checkmark Circle --- */
const Step4Illustration: React.FC = () => (
  <div className="relative w-full h-44 mx-auto flex items-center justify-center">
    <OrganicWaveBackdrop />

    {/* Floating White Card with Official PayPal Logo + Checkmark Badge */}
    <motion.div
      animate={{ y: [0, -3.5, 0] }}
      transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
      whileHover={{ scale: 1.03 }}
      className="relative z-10 w-44 sm:w-48 bg-white py-4 px-4 rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.07)] border border-gray-100/90 flex items-center justify-between gap-3 transition-transform"
    >
      <div className="flex-1 flex items-center justify-center">
        <PayPalOfficialLogo className="h-6 sm:h-7 w-auto" />
      </div>
      <div className="w-6 h-6 rounded-full bg-[#14533c] text-white flex items-center justify-center shrink-0 shadow-xs">
        <Check className="w-3.5 h-3.5 stroke-[3]" />
      </div>
    </motion.div>
  </div>
);

export const LifecycleSection: React.FC = () => {
  const navigate = useNavigate();

  const activateStep = (action: () => void) => {
    action();
  };

  const onStepKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  return (
    <section
      id="how-it-works"
      tabIndex={-1}
      className="relative py-20 bg-white overflow-hidden select-none scroll-mt-20 focus:outline-hidden"
    >
      {/* ========================================================= */}
      {/* Background Flowing Waves on Top Left and Top Right        */}
      {/* ========================================================= */}
      <svg 
        className="absolute top-0 left-0 w-[380px] sm:w-[480px] h-[340px] pointer-events-none -z-0 opacity-70" 
        viewBox="0 0 480 340" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M 0,0 L 0,220 C 110,260 210,180 290,120 C 370,60 410,40 480,0 Z" 
          fill="#EAF6EE" 
        />
        <path 
          d="M 0,0 L 0,160 C 90,200 170,140 250,90 C 330,40 370,20 420,0 Z" 
          fill="#DFEFE6" 
          opacity="0.6"
        />
      </svg>

      <svg 
        className="absolute top-0 right-0 w-[380px] sm:w-[480px] h-[340px] pointer-events-none -z-0 opacity-70" 
        viewBox="0 0 480 340" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M 480,0 L 480,220 C 370,260 270,180 190,120 C 110,60 70,40 0,0 Z" 
          fill="#EAF6EE" 
        />
        <path 
          d="M 480,0 L 480,160 C 390,200 310,140 230,90 C 150,40 110,20 60,0 Z" 
          fill="#DFEFE6" 
          opacity="0.6"
        />
      </svg>

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
          <motion.div
            role="button"
            tabIndex={0}
            whileHover={{ y: -4, transition: { type: 'spring', stiffness: 450, damping: 25 } }}
            whileTap={{ scale: 0.985 }}
            onClick={() => activateStep(() => navigate('/demand'))}
            onKeyDown={(e) => onStepKeyDown(e, () => navigate('/demand'))}
            className="flex flex-col relative group cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14533c]"
          >
            {/* Step badge */}
            <div className="mb-2">
              <span className="w-7 h-7 rounded-full bg-[#14533c] text-white flex items-center justify-center font-bold text-xs shadow-xs transition-transform duration-150 group-hover:scale-105">
                1
              </span>
            </div>

            {/* 3D Illustration with surrounding organic wave (dark circle & arrows 100% removed) */}
            <div className="relative mb-4 h-44 w-full flex items-center justify-center overflow-visible">
              <img 
                src={step1Img} 
                alt="Learner stating demand" 
                className="w-full h-full object-contain relative z-10 transition-transform group-hover:scale-105 duration-300"
              />
            </div>

            {/* Content */}
            <div className="space-y-2 text-left">
              <h3 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-[#14533c] transition-colors">
                Express Your Need
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Learners state what they want to learn in plain language, along with budget, language, and schedule.
              </p>
            </div>

            {/* Arrow connector to next step (visible on desktop) */}
            <motion.div
              animate={{ x: [0, 3, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="hidden lg:flex absolute -right-3 top-20 -translate-y-1/2 text-gray-400 z-20 pointer-events-none"
            >
              <ArrowRight className="w-5 h-5 text-gray-400 stroke-[1.8]" />
            </motion.div>
          </motion.div>

          {/* STEP 2 */}
          <motion.div
            role="button"
            tabIndex={0}
            whileHover={{ y: -4, transition: { type: 'spring', stiffness: 450, damping: 25 } }}
            whileTap={{ scale: 0.985 }}
            onClick={() => activateStep(() => scrollToSectionById('ai-demand'))}
            onKeyDown={(e) => onStepKeyDown(e, () => scrollToSectionById('ai-demand'))}
            className="flex flex-col relative group cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14533c]"
          >
            {/* Step badge */}
            <div className="mb-2">
              <span className="w-7 h-7 rounded-full bg-[#14533c] text-white flex items-center justify-center font-bold text-xs shadow-xs transition-transform duration-150 group-hover:scale-105">
                2
              </span>
            </div>

            {/* 3D Illustration with surrounding organic wave */}
            <div className="relative mb-4 h-44 w-full flex items-center justify-center overflow-visible transition-transform duration-200 group-hover:-translate-y-0.5">
              <Step2Illustration />
            </div>

            {/* Content */}
            <div className="space-y-2 text-left">
              <h3 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-[#14533c] transition-colors">
                AI Clusters Demand
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Our AI validates budget and compatibility across requests, then intelligently clusters them into real opportunities.
              </p>
            </div>

            {/* Arrow connector to next step (visible on desktop) */}
            <motion.div
              animate={{ x: [0, 3, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="hidden lg:flex absolute -right-3 top-20 -translate-y-1/2 text-gray-400 z-20 pointer-events-none"
            >
              <ArrowRight className="w-5 h-5 text-gray-400 stroke-[1.8]" />
            </motion.div>
          </motion.div>

          {/* STEP 3 */}
          <motion.div
            role="button"
            tabIndex={0}
            whileHover={{ y: -4, transition: { type: 'spring', stiffness: 450, damping: 25 } }}
            whileTap={{ scale: 0.985 }}
            onClick={() => activateStep(() => scrollToSectionById('for-instructors'))}
            onKeyDown={(e) => onStepKeyDown(e, () => scrollToSectionById('for-instructors'))}
            className="flex flex-col relative group cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14533c]"
          >
            {/* Step badge */}
            <div className="mb-2">
              <span className="w-7 h-7 rounded-full bg-[#14533c] text-white flex items-center justify-center font-bold text-xs shadow-xs transition-transform duration-150 group-hover:scale-105">
                3
              </span>
            </div>

            {/* 3D Illustration: Male Instructor with Glasses and Checklist surrounded by organic wave */}
            <div className="relative mb-4 h-44 w-full flex items-center justify-center overflow-visible">
              <img 
                src={step3Img} 
                alt="Male Instructor publishing workshop" 
                className="w-full h-full object-contain relative z-10 transition-transform group-hover:scale-105 duration-300"
              />
            </div>

            {/* Content */}
            <div className="space-y-2 text-left">
              <h3 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-[#14533c] transition-colors">
                Instructor Publishes
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Instructors review an AI-generated offer, adjust the content, price, and capacity, then publish it as a workshop.
              </p>
            </div>

            {/* Arrow connector to next step (visible on desktop) */}
            <motion.div
              animate={{ x: [0, 3, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="hidden lg:flex absolute -right-3 top-20 -translate-y-1/2 text-gray-400 z-20 pointer-events-none"
            >
              <ArrowRight className="w-5 h-5 text-gray-400 stroke-[1.8]" />
            </motion.div>
          </motion.div>

          {/* STEP 4 */}
          <motion.div
            role="button"
            tabIndex={0}
            whileHover={{ y: -4, transition: { type: 'spring', stiffness: 450, damping: 25 } }}
            whileTap={{ scale: 0.985 }}
            onClick={() => activateStep(() => scrollToSectionById('featured-workshops'))}
            onKeyDown={(e) => onStepKeyDown(e, () => scrollToSectionById('featured-workshops'))}
            className="flex flex-col relative group cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14533c]"
          >
            {/* Step badge */}
            <div className="mb-2">
              <span className="w-7 h-7 rounded-full bg-[#14533c] text-white flex items-center justify-center font-bold text-xs shadow-xs transition-transform duration-150 group-hover:scale-105">
                4
              </span>
            </div>

            {/* 3D Illustration with surrounding organic wave */}
            <div className="relative mb-4 h-44 w-full flex items-center justify-center overflow-visible">
              <Step4Illustration />
            </div>

            {/* Content */}
            <div className="space-y-2 text-left">
              <h3 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-[#14533c] transition-colors">
                Book with PayPal
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Learners receive rewards for eligible bookings and complete a seamless checkout via PayPal Sandbox.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default LifecycleSection;
