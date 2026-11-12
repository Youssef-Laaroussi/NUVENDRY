import { ReserveLink } from './ReservationPopup';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Workshop } from '../types';
import { Calendar, Clock, Users, Gift, Info, ArrowRight } from 'lucide-react';
import workshopMlopsImg from '../assets/workshop-mlops.jpg';
import workshopFullstackImg from '../assets/workshop-fullstack.jpg';
import workshopLanggraphImg from '../assets/workshop-langgraph.jpg';

interface WorkshopCardProps {
  workshop: Workshop;
}

export const WorkshopCard: React.FC<WorkshopCardProps> = ({ workshop }) => {
  const [showRewardNote, setShowRewardNote] = useState(false);
  const formattedDate = new Date(workshop.scheduled_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const priceDollars = (workshop.price_cents / 100).toFixed(2);
  const seatsLeft = workshop.remaining_seats;
  const isAvailable = seatsLeft > 0;

  const getWorkshopMeta = (w: Workshop) => {
    switch (w.category) {
      case 'MLOps':
        return {
          imageUrl: workshopMlopsImg,
          instructorName: w.merchant_name || 'Sarah El Amrani',
          instructorAvatar:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
          badgeText: 'MLOps',
          displayTitle: w.title,
          displayDescription:
            w.title.startsWith('Production MLOps')
              ? 'Deploy, monitor, and automatically retrain ML models in production with FastAPI, observability, and data pipelines.'
              : w.description,
          displayDifficulty:
            w.difficulty.toLowerCase() === 'advanced' ? 'Advanced' : w.difficulty,
        };
      case 'React + FastAPI':
        return {
          imageUrl: workshopFullstackImg,
          instructorName: w.merchant_name || 'Omar Belkacem',
          instructorAvatar:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
          badgeText: 'REACT + FASTAPI',
          displayTitle: w.title,
          displayDescription:
            w.title.startsWith('Full-Stack AI Apps')
              ? 'Build a complete AI web app with React, FastAPI, and a secure PayPal Sandbox checkout, from end to end.'
              : w.description,
          displayDifficulty:
            w.difficulty.toLowerCase() === 'beginner' ||
            w.difficulty.toLowerCase() === 'beginner-intermediate'
              ? 'Beginner-Intermediate'
              : w.difficulty,
        };
      case 'LangGraph Agents':
      default:
        return {
          imageUrl: workshopLanggraphImg,
          instructorName: w.merchant_name || 'Fatima Zahra',
          instructorAvatar:
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80',
          badgeText: w.category === 'LangGraph Agents' ? 'LANGGRAPH' : w.category.toUpperCase(),
          displayTitle: w.title.startsWith('Building Production-Ready LangGraph Agents')
            ? 'Building Production-Ready LangGraph Agents'
            : w.title,
          displayDescription: w.title.startsWith('Building Production-Ready LangGraph Agents')
            ? 'Design, build, and deploy multi-step AI agents with LangGraph, tool use, memory, and real-world production patterns.'
            : w.description,
          displayDifficulty:
            w.difficulty.toLowerCase() === 'intermediate' ? 'Intermediate' : w.difficulty,
        };
    }
  };

  const meta = getWorkshopMeta(workshop);
  const targetUrl = workshop.id.startsWith('fallback-')
    ? '/workshops'
    : `/workshops/${workshop.id}`;

  return (
    <motion.div
      whileHover={{ y: -6, transition: { type: 'spring', stiffness: 350, damping: 22 } }}
      className="bg-white rounded-2xl border border-[#E5ECE7] p-5 shadow-[0_6px_26px_rgba(15,41,30,0.055)] hover:shadow-[0_14px_34px_rgba(15,41,30,0.11)] transition-all flex flex-col justify-between group"
    >
      <div>
        {/* Top Split: Rounded Left Thumbnail + Right Category/Price/Title/Description */}
        <div className="flex items-start gap-4">
          <Link
            to={targetUrl}
            tabIndex={-1}
            aria-hidden="true"
            className="w-[114px] h-[132px] sm:w-[122px] sm:h-[140px] rounded-xl overflow-hidden shrink-0 bg-[#111827] shadow-2xs block"
          >
            <img
              src={workshop.image_url || meta.imageUrl}
              alt={meta.displayTitle}
              className={`w-full h-full ${workshop.image_url ? "object-contain" : "object-cover group-hover:scale-105 transition-transform duration-300"}`}
            />
          </Link>

          <div className="flex-1 min-w-0">
            {/* Category Pill & Price */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#E6F3EB] text-[#14533C] text-[10.5px] font-bold tracking-wide whitespace-nowrap">
                {meta.badgeText}
              </span>
              <div className="text-right whitespace-nowrap">
                <span className="text-[18.5px] font-extrabold text-[#111827] tracking-tight">
                  ${priceDollars}
                </span>{' '}
                <span className="text-[11px] font-normal text-[#4B5563]">
                  {workshop.currency || 'USD'}
                </span>
              </div>
            </div>

            {/* Workshop Title */}
            <h3 className="font-bold text-[15px] sm:text-[15.5px] text-[#111827] group-hover:text-[#14533C] transition-colors leading-[1.28] mb-1.5">
              <Link
                to={targetUrl}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#135A3E] rounded"
              >
                {meta.displayTitle}
              </Link>
            </h3>

            {/* Workshop Summary */}
            <p className="text-[11.5px] sm:text-[12px] text-[#4B5563] leading-[1.45] line-clamp-3">
              {meta.displayDescription}
            </p>
          </div>
        </div>

        {/* Instructor & Difficulty Pill */}
        <div className="flex items-center justify-between gap-2 pt-4 pb-3 border-b border-[#EDF2EE]">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={meta.instructorAvatar}
              alt={meta.instructorName}
              className="w-7 h-7 rounded-full object-cover border border-[#E2EAE5] shrink-0"
            />
            <span className="text-[12.5px] font-medium text-[#1F2937] truncate">
              {meta.instructorName}
            </span>
          </div>

          <span className="px-2.5 py-0.5 rounded-full bg-[#E6F3EB] text-[#14533C] text-[11px] font-semibold whitespace-nowrap">
            {meta.displayDifficulty}
          </span>
        </div>
      </div>

      <div>
        {/* Schedule · Duration · Remaining Seats */}
        <div className="flex items-center justify-between gap-2 py-3 text-[12px] text-[#374151]">
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <Calendar className="w-3.5 h-3.5 text-[#165C45] shrink-0" />
            <span>{formattedDate}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <Clock className="w-3.5 h-3.5 text-[#165C45] shrink-0" />
            <span>{workshop.duration_hours}h</span>
          </span>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <Users className="w-3.5 h-3.5 text-[#165C45] shrink-0" />
            <span>
              {seatsLeft} / {workshop.total_seats} seats left
            </span>
          </span>
        </div>

        {/* Eligible Merchant-Funded Rewards Pill Banner */}
        <button
          type="button"
          aria-expanded={showRewardNote}
          onClick={() => setShowRewardNote((prev) => !prev)}
          className="w-full text-left flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#E8F5ED] hover:bg-[#DCF0E4] text-[#134E3A] text-[11.5px] font-medium mb-3.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#135A3E]"
          title="Click to preview reward eligibility rules"
        >
          <span className="inline-flex items-center gap-2 min-w-0">
            <Gift className="w-3.5 h-3.5 text-[#165C45] shrink-0" />
            <span className="truncate">Eligible for Welcome &amp; Early-Bird Rewards</span>
          </span>
          <Info className="w-3.5 h-3.5 text-[#165C45] shrink-0" />
        </button>

        <AnimatePresence>
          {showRewardNote && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="overflow-hidden mb-3"
            >
              <div className="px-3 py-2 rounded-lg bg-[#F8FBF9] border border-[#DCE8E1] text-[11px] text-[#374151] leading-snug">
                Merchant-funded 10% Welcome Discount, Early-Bird commitment savings, and local Store
                Credit are evaluated on the server prior to PayPal Sandbox checkout.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full-Width Reserve Button */}
        <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.97 }}>
          <ReserveLink
                      workshopId={workshop.id}
            aria-disabled={!isAvailable}
            className={`w-full py-2.5 px-4 rounded-xl text-[13.5px] font-semibold flex items-center justify-center gap-2 transition-all shadow-xs group/btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#135A3E] focus-visible:ring-offset-2 ${
              isAvailable
                ? 'bg-[#135A3E] hover:bg-[#0D432E] text-white'
                : 'bg-warmgray text-charcoal/50 cursor-not-allowed pointer-events-none'
            }`}
          >
            <span>{isAvailable ? 'Reserve' : 'Sold Out'}</span>
            {isAvailable && (
              <ArrowRight className="w-4 h-4 nv-icon-slide" />
            )}
          </ReserveLink>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WorkshopCard;
