import React from 'react';
import { Link } from 'react-router-dom';
import { User, Layers, Check } from 'lucide-react';
import laptopImg from '../assets/laptop-mockup.jpg';

export const HeroVisualization: React.FC = () => {
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
          <div className="bg-white rounded-2xl p-4 shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-gray-100 flex items-start gap-3 w-full transition-transform hover:-translate-y-0.5">
            <div className="w-10 h-10 rounded-xl bg-[#eaf5ee] text-[#14533c] flex items-center justify-center shrink-0">
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
          </div>

          {/* Vertical dashed connector 1 -> 2 */}
          <div className="w-full flex justify-center py-1">
            <div className="w-0 h-4 border-l-2 border-dashed border-[#a3d9bc]" />
          </div>

          {/* 2. AI Insight Card */}
          <div className="bg-white rounded-2xl p-4 shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-gray-100 flex items-start gap-3 w-full transition-transform hover:-translate-y-0.5">
            <div className="w-10 h-10 rounded-xl bg-[#eaf5ee] text-[#14533c] flex items-center justify-center shrink-0">
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
          </div>

          {/* Vertical dashed connector 2 -> 3 */}
          <div className="w-full flex justify-center py-1">
            <div className="w-0 h-4 border-l-2 border-dashed border-[#a3d9bc]" />
          </div>

          {/* 3. Instructor Offer Card */}
          <div className="bg-white rounded-2xl p-4 shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-gray-100 w-full transition-transform hover:-translate-y-0.5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-md bg-[#eaf5ee] text-[#14533c] flex items-center justify-center">
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
          </div>

        </div>

        {/* Right Column: Code Laptop Mockup Frame + Pay with PayPal Card */}
        <div className="md:col-span-6 relative flex flex-col items-center md:items-end w-full mt-4 md:mt-0">
          
          {/* Laptop Mockup in thick rounded white card matching reference */}
          <div className="w-full max-w-[340px] sm:max-w-[380px] bg-white p-2.5 rounded-3xl shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-gray-100/90 overflow-hidden transition-transform hover:scale-[1.01]">
            <img
              src={laptopImg}
              alt="Code Editor Laptop"
              className="w-full h-auto rounded-2xl object-contain block bg-[#0f172a]"
            />
          </div>

          {/* 4. Pay with PayPal Card - Floating in foreground */}
          <div className="w-56 sm:w-60 bg-white rounded-2xl p-4 shadow-[0_16px_36px_rgba(0,0,0,0.12)] border border-gray-100 -mt-12 sm:-mt-16 md:-mt-20 mr-0 md:mr-2 z-20">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-[#d2e8dc] text-[#14533c] text-[11px] font-bold flex items-center justify-center shrink-0">
                4
              </span>
              <span className="font-bold text-sm text-gray-900">Pay with PayPal</span>
            </div>

            {/* Official PayPal Logo with Monogram Icon and Wordmark */}
            <div className="flex items-center justify-center gap-1.5 py-2">
              <svg className="w-5 h-6" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.8 6.4C18.2 2.7 15.6 0 11.2 0H3.3C2.6 0 2 0.5 1.9 1.2L0 14.3C-0.1 14.9 0.4 15.4 1 15.4H6.1L7.2 7.7C7.3 7 7.9 6.5 8.6 6.5H11.7C15.1 6.5 17.5 7.9 18.2 11.8C18.5 10 18.7 8.1 18.8 6.4Z" fill="#003087"/>
                <path d="M18.2 11.8C17.4 16.5 14.1 18.9 9.3 18.9H7.1C6.6 18.9 6.2 19.3 6.1 19.8L4.6 28.5C4.5 29 4.9 29.4 5.4 29.4H9.4C9.9 29.4 10.4 29 10.5 28.5L11.4 23.3C11.5 22.8 11.9 22.4 12.4 22.4H13.5C18.4 22.4 22 20.2 22.9 14.9C23.3 12.7 22.8 11.2 21.6 10.3C20.6 11.1 19.4 11.6 18.2 11.8Z" fill="#0079C1"/>
              </svg>
              <span className="text-xl font-bold tracking-tight inline-flex items-center">
                <span className="text-[#003087] italic font-serif">Pay</span>
                <span className="text-[#0079C1] italic font-serif">Pal</span>
              </span>
            </div>

            {/* Reserve & Pay Button */}
            <Link
              to="/workshops"
              className="w-full py-2.5 px-4 rounded-xl bg-[#0e3c2f] hover:bg-[#08281e] text-white text-xs sm:text-sm font-semibold flex items-center justify-center transition-all shadow-xs text-center mt-1 active:scale-[0.98]"
            >
              <span>Reserve & Pay</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
