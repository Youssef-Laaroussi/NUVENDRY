import React from 'react';
import { Link } from 'react-router-dom';
import { User, Layers, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Workshop } from '../types';
import { scrollToSectionById } from '../layouts/PublicLayout';
import laptopImg from '../assets/laptop-mockup.jpg';

export const PayPalOfficialLogo: React.FC<{ className?: string }> = ({ className = "h-7 w-auto" }) => (
  <svg 
    viewBox="0 0 124 33" 
    className={className} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    aria-label="PayPal"
  >
    {/* Wordmark: Pay */}
    <path fill="#253B80" d="M46.211,6.749h-6.839c-0.468,0-0.866,0.34-0.939,0.802l-2.766,17.537c-0.055,0.346,0.213,0.658,0.564,0.658h3.265c0.468,0,0.866-0.34,0.939-0.803l0.746-4.73c0.072-0.463,0.471-0.803,0.938-0.803h2.165c4.505,0,7.105-2.18,7.784-6.5c0.306-1.89,0.013-3.375-0.872-4.415C50.224,7.353,48.5,6.749,46.211,6.749z M47,13.154c-0.374,2.454-2.249,2.454-4.062,2.454h-1.032l0.724-4.583c0.043-0.277,0.283-0.481,0.563-0.481h0.473c1.235,0,2.4,0,3.002,0.704C47.027,11.668,47.137,12.292,47,13.154z"/>
    <path fill="#253B80" d="M66.654,13.075h-3.275c-0.279,0-0.52,0.204-0.563,0.481l-0.145,0.916l-0.229-0.332c-0.709-1.029-2.29-1.373-3.868-1.373c-3.619,0-6.71,2.741-7.312,6.586c-0.313,1.918,0.132,3.752,1.22,5.031c0.998,1.176,2.426,1.666,4.125,1.666c2.916,0,4.533-1.875,4.533-1.875l-0.146,0.91c-0.055,0.348,0.213,0.66,0.562,0.66h2.95c0.469,0,0.865-0.34,0.939-0.803l1.77-11.209C67.271,13.388,67.004,13.075,66.654,13.075z M62.089,19.449c-0.316,1.871-1.801,3.127-3.695,3.127c-0.951,0-1.711-0.305-2.199-0.883c-0.484-0.574-0.668-1.391-0.514-2.301c0.295-1.855,1.805-3.152,3.67-3.152c0.93,0,1.686,0.309,2.184,0.892C62.034,17.721,62.232,18.543,62.089,19.449z"/>
    <path fill="#253B80" d="M84.096,13.075h-3.291c-0.314,0-0.609,0.156-0.787,0.417l-4.539,6.686l-1.924-6.425c-0.121-0.402-0.492-0.678-0.912-0.678h-3.234c-0.393,0-0.666,0.384-0.541,0.754l3.625,10.638l-3.408,4.811c-0.268,0.379,0.002,0.9,0.465,0.9h3.287c0.312,0,0.604-0.152,0.781-0.408L84.564,13.97C84.826,13.592,84.557,13.075,84.096,13.075z"/>
    {/* Wordmark: Pal */}
    <path fill="#179BD7" d="M94.992,6.749h-6.84c-0.467,0-0.865,0.34-0.938,0.802l-2.766,17.537c-0.055,0.346,0.213,0.658,0.562,0.658h3.51c0.326,0,0.605-0.238,0.656-0.562l0.785-4.971c0.072-0.463,0.471-0.803,0.938-0.803h2.164c4.506,0,7.105-2.18,7.785-6.5c0.307-1.89,0.012-3.375-0.873-4.415C99.004,7.353,97.281,6.749,94.992,6.749z M95.781,13.154c-0.373,2.454-2.248,2.454-4.062,2.454h-1.031l0.725-4.583c0.043-0.277,0.281-0.481,0.562-0.481h0.473c1.234,0,2.4,0,3.002,0.704C95.809,11.668,95.918,12.292,95.781,13.154z"/>
    <path fill="#179BD7" d="M115.434,13.075h-3.273c-0.281,0-0.52,0.204-0.562,0.481l-0.145,0.916l-0.23-0.332c-0.709-1.029-2.289-1.373-3.867-1.373c-3.619,0-6.709,2.741-7.311,6.586c-0.312,1.918,0.131,3.752,1.219,5.031c1,1.176,2.426,1.666,4.125,1.666c2.916,0,4.533-1.875,4.533-1.875l-0.146,0.91c-0.055,0.348,0.213,0.66,0.564,0.66h2.949c0.467,0,0.865-0.34,0.938-0.803l1.771-11.209C116.053,13.388,115.785,13.075,115.434,13.075z M110.869,19.449c-0.314,1.871-1.801,3.127-3.695,3.127c-0.949,0-1.711-0.305-2.199-0.883c-0.484-0.574-0.666-1.391-0.514-2.301c0.297-1.855,1.805-3.152,3.67-3.152c0.93,0,1.686,0.309,2.184,0.892C110.816,17.721,111.014,18.543,110.869,19.449z"/>
    <path fill="#179BD7" d="M119.295,7.23l-2.807,17.858c-0.055,0.346,0.213,0.658,0.562,0.658h2.822c0.469,0,0.867-0.34,0.939-0.803l2.768-17.536c0.055-0.346-0.213-0.659-0.562-0.659h-3.16C119.578,6.749,119.338,6.953,119.295,7.23z"/>
    {/* Monogram PP */}
    <path fill="#253B80" d="M7.266,29.154l0.523-3.322l-1.165-0.027H1.061L4.927,1.292C4.939,1.218,4.978,1.149,5.035,1.1c0.057-0.049,0.13-0.076,0.206-0.076h9.38c3.114,0,5.263,0.648,6.385,1.927c0.526,0.6,0.861,1.227,1.023,1.917c0.17,0.724,0.173,1.589,0.007,2.644l-0.012,0.077v0.676l0.526,0.298c0.443,0.235,0.795,0.504,1.065,0.812c0.45,0.513,0.741,1.165,0.864,1.938c0.127,0.795,0.085,1.741-0.123,2.812c-0.24,1.232-0.628,2.305-1.152,3.183c-0.482,0.809-1.096,1.48-1.825,2c-0.696,0.494-1.523,0.869-2.458,1.109c-0.906,0.236-1.939,0.355-3.072,0.355h-0.73c-0.522,0-1.029,0.188-1.427,0.525c-0.399,0.344-0.663,0.814-0.744,1.328l-0.055,0.299l-0.924,5.855l-0.042,0.215c-0.011,0.068-0.03,0.102-0.058,0.125c-0.025,0.021-0.061,0.035-0.096,0.035H7.266z"/>
    <path fill="#179BD7" d="M23.048,7.667c-0.028,0.179-0.06,0.362-0.096,0.55c-1.237,6.351-5.469,8.545-10.874,8.545H9.326c-0.661,0-1.218,0.48-1.321,1.132l0,0L6.596,26.83l-0.399,2.533c-0.067,0.428,0.263,0.814,0.695,0.814h4.881c0.578,0,1.069-0.42,1.16-0.99l0.048-0.248l0.919-5.832l0.059-0.32c0.09-0.572,0.582-0.992,1.16-0.992h0.73c4.729,0,8.431-1.92,9.513-7.476c0.452-2.321,0.218-4.259-0.978-5.622C24.022,8.286,23.573,7.945,23.048,7.667z"/>
    <path fill="#222D65" d="M21.754,7.151c-0.189-0.055-0.384-0.105-0.584-0.15c-0.201-0.044-0.407-0.083-0.619-0.117c-0.742-0.12-1.555-0.177-2.426-0.177h-7.352c-0.181,0-0.353,0.041-0.507,0.115C9.927,6.985,9.675,7.306,9.614,7.699L8.05,17.605l-0.045,0.289c0.103-0.652,0.66-1.132,1.321-1.132h2.752c5.405,0,9.637-2.195,10.874-8.545c0.037-0.188,0.068-0.371,0.096-0.55c-0.313-0.166-0.652-0.308-1.017-0.429C21.941,7.208,21.848,7.179,21.754,7.151z"/>
    <path fill="#253B80" d="M9.614,7.699c0.061-0.393,0.313-0.714,0.652-0.876c0.155-0.074,0.326-0.115,0.507-0.115h7.352c0.871,0,1.684,0.057,2.426,0.177c0.212,0.034,0.418,0.073,0.619,0.117c0.2,0.045,0.395,0.095,0.584,0.15c0.094,0.028,0.187,0.057,0.278,0.086c0.365,0.121,0.704,0.264,1.017,0.429c0.368-2.347-0.003-3.945-1.272-5.392C20.378,0.682,17.853,0,14.622,0h-9.38c-0.66,0-1.223,0.48-1.325,1.133L0.01,25.898c-0.077,0.49,0.301,0.932,0.795,0.932h5.791l1.454-9.225L9.614,7.699z"/>
  </svg>
);

interface HeroVisualizationProps {
  workshops?: Workshop[];
  onSelectStage?: (stage: 1 | 2 | 3 | 4) => void;
}

export const HeroVisualization: React.FC<HeroVisualizationProps> = ({
  workshops = [],
  onSelectStage,
}) => {
  const matchedLangGraph =
    workshops.find((w) => w.category === 'LangGraph Agents' && !w.id.startsWith('fallback-')) ||
    workshops.find((w) => !w.id.startsWith('fallback-'));
  const reserveHref = matchedLangGraph ? `/workshops/${matchedLangGraph.id}` : '/workshops';

  const handleStageActivate = (stage: 1 | 2 | 3 | 4) => {
    onSelectStage?.(stage);
    scrollToSectionById('marketplace-journey');
  };

  const handleKeyActivate = (e: React.KeyboardEvent, stage: 1 | 2 | 3 | 4) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleStageActivate(stage);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto lg:max-w-none py-2 select-none">
      {/* Soft organic green gradient blob in background matching reference */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[480px] rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at 55% 50%, rgba(200, 237, 216, 0.85) 0%, rgba(225, 246, 235, 0.5) 45%, rgba(255, 255, 255, 0) 72%)',
          filter: 'blur(32px)',
        }}
      />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-5 items-center">
        {/* Left Column of Pipeline Cards: Demand -> AI Insight -> Instructor Offer */}
        <div className="md:col-span-6 flex flex-col space-y-0 w-full max-w-[340px] mx-auto md:mx-0">
          
          {/* 1. Demand Card */}
          <motion.div
            role="button"
            tabIndex={0}
            aria-label="Inspect Stage 1: Learner Demand"
            onClick={() => handleStageActivate(1)}
            onKeyDown={(e) => handleKeyActivate(e, 1)}
            whileHover={{ y: -4, scale: 1.015, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
            whileTap={{ scale: 0.985 }}
            animate={{ y: [0, -3.5, 0] }}
            transition={{ repeat: Infinity, duration: 5.2, ease: 'easeInOut' }}
            className="group bg-white rounded-2xl p-4 shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.09)] border border-gray-100 flex items-start gap-3 w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14533c]"
          >
            <div className="w-10 h-10 rounded-xl bg-[#eaf5ee] text-[#14533c] flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105">
              <User className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-full bg-[#d2e8dc] text-[#14533c] text-[11px] font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <span className="font-bold text-sm text-gray-900">Demand</span>
              </div>
              <p className="text-xs text-gray-700 leading-snug">
                “I want a hands-on workshop on LangGraph agents under $40.”
              </p>
            </div>
          </motion.div>

          {/* Vertical dashed connector 1 -> 2 with animated pulse signal */}
          <div className="w-full flex justify-center py-1 relative">
            <div className="w-0 h-4 border-l-2 border-dashed border-[#a3d9bc]" />
            <motion.div
              animate={{ y: [-2, 14], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              className="absolute w-1.5 h-1.5 rounded-full bg-[#14533c] pointer-events-none"
            />
          </div>

          {/* 2. AI Insight Card */}
          <motion.div
            role="button"
            tabIndex={0}
            aria-label="Inspect Stage 2: AI Insight"
            onClick={() => handleStageActivate(2)}
            onKeyDown={(e) => handleKeyActivate(e, 2)}
            whileHover={{ y: -4, scale: 1.015, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
            whileTap={{ scale: 0.985 }}
            animate={{ y: [0, -3.5, 0] }}
            transition={{ repeat: Infinity, duration: 5.8, ease: 'easeInOut', delay: 0.6 }}
            className="group bg-white rounded-2xl p-4 shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.09)] border border-gray-100 flex items-start gap-3 w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14533c]"
          >
            <div className="w-10 h-10 rounded-xl bg-[#eaf5ee] text-[#14533c] flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105">
              <Layers className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-[#d2e8dc] text-[#14533c] text-[11px] font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <span className="font-bold text-sm text-gray-900">AI Insight</span>
                <div className="w-4 h-4 rounded-full bg-[#14533c] text-white flex items-center justify-center ml-0.5">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-md bg-[#e6f4ec] text-[#14533c] text-[11px] font-medium">
                  LangGraph
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#e6f4ec] text-[#14533c] text-[11px] font-medium">
                  AI Agents
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#e6f4ec] text-[#14533c] text-[11px] font-medium">
                  Hands-on
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#e6f4ec] text-[#14533c] text-[11px] font-medium">
                  Budget ≤ $40
                </span>
              </div>
            </div>
          </motion.div>

          {/* Vertical dashed connector 2 -> 3 with animated pulse signal */}
          <div className="w-full flex justify-center py-1 relative">
            <div className="w-0 h-4 border-l-2 border-dashed border-[#a3d9bc]" />
            <motion.div
              animate={{ y: [-2, 14], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut', delay: 0.9 }}
              className="absolute w-1.5 h-1.5 rounded-full bg-[#14533c] pointer-events-none"
            />
          </div>

          {/* 3. Instructor Offer Card */}
          <motion.div
            role="button"
            tabIndex={0}
            aria-label="Inspect Stage 3: Instructor Offer"
            onClick={() => handleStageActivate(3)}
            onKeyDown={(e) => handleKeyActivate(e, 3)}
            whileHover={{ y: -4, scale: 1.015, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
            whileTap={{ scale: 0.985 }}
            animate={{ y: [0, -3.5, 0] }}
            transition={{ repeat: Infinity, duration: 5.4, ease: 'easeInOut', delay: 1.2 }}
            className="group bg-white rounded-2xl p-4 shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.09)] border border-gray-100 w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14533c]"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-md bg-[#eaf5ee] text-[#14533c] flex items-center justify-center transition-transform duration-150 group-hover:scale-105">
                <User className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <span className="w-5 h-5 rounded-full bg-[#d2e8dc] text-[#14533c] text-[11px] font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <span className="font-bold text-sm text-gray-900">Instructor Offer</span>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
                alt="Instructor"
                className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/instructor-avatar.png';
                }}
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                  LangGraph Agents in Practice
                </h4>
                <div className="text-[11px] sm:text-xs text-gray-600 mt-0.5">
                  2h · Intermediate · $39
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Right Column: Code Laptop Mockup Frame + Pay with PayPal Card */}
        <div className="md:col-span-6 relative flex flex-col items-center md:items-end w-full mt-4 md:mt-0">
          
          {/* Laptop Mockup in thick rounded white card matching reference */}
          <motion.div
            whileHover={{ scale: 1.018, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 6.2, ease: 'easeInOut', delay: 0.4 }}
            className="w-full max-w-[340px] sm:max-w-[380px] bg-white p-2.5 rounded-3xl shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-gray-100/90 overflow-hidden"
          >
            <img
              src={laptopImg}
              alt="Code Editor Laptop"
              className="w-full h-auto rounded-2xl object-contain block bg-[#0f172a]"
            />
          </motion.div>

          {/* 4. Pay with PayPal Card - Floating in foreground */}
          <motion.div
            whileHover={{ y: -5, scale: 1.025, transition: { type: 'spring', stiffness: 350, damping: 22 } }}
            animate={{ y: [0, -3.5, 0] }}
            transition={{ repeat: Infinity, duration: 4.8, ease: 'easeInOut', delay: 1.6 }}
            className="w-56 sm:w-60 bg-white rounded-2xl p-4 shadow-[0_16px_36px_rgba(0,0,0,0.12)] border border-gray-100 -mt-12 sm:-mt-16 md:-mt-20 mr-0 md:mr-2 z-20 hover:shadow-[0_20px_42px_rgba(0,0,0,0.15)]"
          >
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-5 h-5 rounded-full bg-[#d2e8dc] text-[#14533c] text-[11px] font-bold flex items-center justify-center shrink-0">
                4
              </span>
              <span className="font-bold text-sm text-gray-900">Pay with PayPal</span>
            </div>

            {/* Official PayPal Logo from Official Brand Vector */}
            <div className="flex items-center justify-center py-2.5">
              <PayPalOfficialLogo className="h-7 w-auto" />
            </div>

            {/* Reserve & Pay Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                to={reserveHref}
                className="nv-btn-press w-full py-2.5 px-4 rounded-xl bg-[#0e3c2f] hover:bg-[#08281e] text-white text-xs sm:text-sm font-semibold flex items-center justify-center transition-all shadow-xs text-center mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e3c2f] focus-visible:ring-offset-2"
              >
                <span>Reserve & Pay</span>
              </Link>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};
