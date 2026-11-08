import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift,
  Calculator,
  Calendar,
  Clock,
  Zap,
  CreditCard,
  Users,
} from 'lucide-react';
import { Workshop } from '../types';
import demandOpportunityLaptopImg from '../assets/demand-opportunity-laptop.jpg';

/* Official PayPal Double-P Monogram Vector Mark */
const PayPalMonogramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
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

/* Star-in-Rosette Achievement Badge Icon matching reference Card 6 */
const StarBadgeIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="9.5" r="6.5" />
    <path d="M12 6.2l1.05 2.13 2.35.34-1.7 1.65.4 2.34L12 11.55l-2.1 1.11.4-2.34-1.7-1.65 2.35-.34L12 6.2z" />
    <path d="M8.5 15.2L7 21.5l5-2.6 5 2.6-1.5-6.3" />
  </svg>
);

interface MechanismItem {
  number: number;
  title: string;
  description: string;
  icon: 'gift' | 'zap' | 'card' | 'users' | 'badge';
}

const REWARD_MECHANISMS: MechanismItem[] = [
  {
    number: 1,
    title: 'Welcome Discount',
    description:
      'A merchant-funded discount for new learners, typically 5%–15% off the workshop fee.',
    icon: 'gift',
  },
  {
    number: 2,
    title: 'Early-Bird Discount',
    description:
      'A time-limited discount (e.g., 10% off) for learners who enroll a set number of days before the workshop.',
    icon: 'zap',
  },
  {
    number: 3,
    title: 'Store Credit',
    description:
      'Use instructor-issued credit (e.g., $5–$20) at checkout, often earned from past purchases or activities.',
    icon: 'card',
  },
  {
    number: 4,
    title: 'Digital Gifts',
    description:
      'Get bonus digital resources, such as prompts, templates, or datasets, funded by the instructor.',
    icon: 'gift',
  },
  {
    number: 5,
    title: 'Referral Rewards',
    description:
      'Earn credits or a discount (e.g., $5 each) when friends enroll using your referral link.',
    icon: 'users',
  },
  {
    number: 6,
    title: 'Achievement Badges',
    description:
      'Earn verified badges (e.g., Completer, Top Referrer) that showcase your progress and contributions.',
    icon: 'badge',
  },
];

interface RewardsShowcaseProps {
  workshops?: Workshop[];
}

const POST_CHECKOUT_NOTES: Record<number, string> = {
  4: 'Digital Gifts unlock automatically after PayPal Sandbox payment verification (starter repo, prompts & datasets).',
  5: 'Verified Referrals credit $5.00 to the merchant-local ledger only after a referred learner completes booking.',
  6: 'Achievement Badges unlock after verified workshop enrollment, attendance, or top referral milestones.',
};

export const RewardsShowcase: React.FC<RewardsShowcaseProps> = ({ workshops = [] }) => {
  const baseFee = 39.0;
  const [applyWelcome, setApplyWelcome] = useState<boolean>(true);
  const [applyEarlyBird, setApplyEarlyBird] = useState<boolean>(true);
  const [applyStoreCredit, setApplyStoreCredit] = useState<boolean>(false);
  const [selectedMechanismCard, setSelectedMechanismCard] = useState<number | null>(null);

  const langGraphWorkshop =
    workshops.find((w) => w.category === 'LangGraph Agents' && !w.id.startsWith('fallback-')) ||
    workshops.find((w) => !w.id.startsWith('fallback-'));
  const workshopHref = langGraphWorkshop ? `/workshops/${langGraphWorkshop.id}` : '/workshops';

  const welcomeDeduction = applyWelcome ? 5.0 : 0;
  const earlyBirdDeduction = applyEarlyBird ? 5.0 : 0;
  const storeCreditDeduction = applyStoreCredit ? 5.0 : 0;

  const totalDiscount = welcomeDeduction + earlyBirdDeduction + storeCreditDeduction;
  const amountSentToPayPal = Math.max(baseFee - totalDiscount, 5.0);

  const handleMechanismCardActivate = (num: number) => {
    setSelectedMechanismCard((prev) => (prev === num ? null : num));
    if (num === 1) setApplyWelcome((prev) => !prev);
    if (num === 2) setApplyEarlyBird((prev) => !prev);
    if (num === 3) setApplyStoreCredit((prev) => !prev);
  };

  const renderMechanismIcon = (type: MechanismItem['icon']) => {
    switch (type) {
      case 'zap':
        return <Zap className="w-6 h-6 stroke-[1.75]" />;
      case 'card':
        return <CreditCard className="w-6 h-6 stroke-[1.75]" />;
      case 'users':
        return <Users className="w-6 h-6 stroke-[1.75]" />;
      case 'badge':
        return <StarBadgeIcon className="w-6 h-6" />;
      case 'gift':
      default:
        return <Gift className="w-6 h-6 stroke-[1.75]" />;
    }
  };

  return (
    <section
      id="rewards"
      tabIndex={-1}
      className="relative py-16 md:py-20 bg-[#F8FAF8] text-[#111827] overflow-hidden border-t border-[#EBF0EC] scroll-mt-20 focus:outline-hidden"
    >
      {/* Top-Left Soft Organic Mint Wave Backdrop */}
      <div
        className="hidden lg:block absolute top-20 -left-32 w-[540px] h-[540px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 55% 48%, rgba(214, 240, 225, 0.72) 0%, rgba(226, 244, 234, 0.42) 54%, rgba(248, 250, 248, 0) 76%)',
        }}
      />

      {/* Bottom-Right Soft Organic Mint Wave Backdrop */}
      <div
        className="hidden lg:block absolute -bottom-36 -right-24 w-[520px] h-[420px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 48% 48%, rgba(208, 237, 220, 0.65) 0%, rgba(225, 244, 233, 0.36) 56%, rgba(248, 250, 248, 0) 78%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ========================================================= */}
        {/* Section Header                                            */}
        {/* ========================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3.5">
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#E5F3EB] text-[#14533C] text-[11px] font-bold uppercase tracking-[0.09em]">
            <Gift className="w-3.5 h-3.5 text-[#14533C] stroke-[2]" />
            <span>MERCHANT-FUNDED</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-serif font-medium text-[#111827] tracking-tight leading-[1.12]">
            Six Real{' '}
            <span className="italic font-normal text-[#165C45]">Reward Mechanisms</span>
          </h2>

          <p className="text-sm sm:text-[15.5px] text-[#374151] leading-relaxed">
            Promotions funded directly by instructors to encourage early enrollment and referrals.
          </p>
        </div>

        {/* ========================================================= */}
        {/* Two-Column Layout: Left Simulator + Right 3x2 Cards Grid  */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-[31fr_69fr] gap-6 items-stretch">
          {/* LEFT CARD: Interactive Reward Simulator */}
          <div className="bg-white rounded-2xl border border-[#E5ECE7] p-5 sm:p-6 shadow-[0_8px_28px_rgba(15,41,30,0.06)] flex flex-col justify-between">
            <div>
              {/* Simulator Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-[#E8F5ED] text-[#156847] flex items-center justify-center shrink-0 mt-0.5">
                  <Calculator className="w-5 h-5 stroke-[1.9]" />
                </div>
                <div>
                  <h3 className="font-bold text-[15.5px] text-[#111827] leading-snug">
                    Reward Simulator
                  </h3>
                  <p className="text-[11.5px] text-[#4B5563] leading-[1.42] mt-0.5">
                    See how merchant-funded rewards reduce the amount you pay at checkout.
                  </p>
                </div>
              </div>

              {/* Selected Workshop Preview Strip */}
              <Link
                to={workshopHref}
                className="bg-[#F8FAF9] hover:bg-[#F2F7F4] rounded-xl border border-[#EBF1ED] p-2.5 flex items-center gap-3 mb-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#156947]"
              >
                <img
                  src={demandOpportunityLaptopImg}
                  alt="Building Production-Ready LangGraph Agents"
                  className="w-[74px] h-[54px] rounded-lg object-cover shrink-0 bg-[#111827]"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-[12px] text-[#111827] leading-[1.28]">
                    Building Production-Ready LangGraph Agents
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[10.5px] text-[#4B5563] mt-1">
                    <span className="inline-flex items-center gap-1 whitespace-nowrap">
                      <Calendar className="w-3 h-3 text-[#166547]" />
                      <span>Nov 11, 2026</span>
                    </span>
                    <span className="inline-flex items-center gap-1 whitespace-nowrap">
                      <Clock className="w-3 h-3 text-[#166547]" />
                      <span>2h · Intermediate</span>
                    </span>
                  </div>
                </div>
              </Link>

              {/* Base Workshop Fee Row */}
              <div className="flex items-center justify-between py-2.5 border-b border-[#EDF2EE]">
                <span className="text-[13px] font-medium text-[#374151]">Workshop Fee</span>
                <span className="text-[14px] font-bold text-[#111827]">
                  ${baseFee.toFixed(2)}
                </span>
              </div>

              {/* 3 Interactive Toggle Rows */}
              <div className="divide-y divide-[#F1F5F2]">
                {/* Toggle 1: Welcome Discount */}
                <div className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#EAF6EF] text-[#156847] flex items-center justify-center shrink-0">
                      <Gift className="w-4 h-4 stroke-[1.9]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-bold text-[#111827] leading-tight">
                        Welcome Discount
                      </div>
                      <div className="text-[11px] text-[#6B7280] mt-0.5">
                        New learners: 10% off
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={applyWelcome}
                    aria-label="Toggle Welcome Discount"
                    onClick={() => setApplyWelcome((prev) => !prev)}
                    className={`w-10 h-[22px] rounded-full p-0.5 transition-colors duration-200 shrink-0 cursor-pointer ${
                      applyWelcome ? 'bg-[#156947]' : 'bg-[#C5CFC9]'
                    }`}
                  >
                    <motion.span
                      layout
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className={`block w-[18px] h-[18px] rounded-full bg-white shadow-xs ${
                        applyWelcome ? 'translate-x-[18px]' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle 2: Early-Bird Commitment */}
                <div className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#EAF6EF] text-[#156847] flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4 stroke-[1.9]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-bold text-[#111827] leading-tight">
                        Early-Bird Commitment
                      </div>
                      <div className="text-[11px] text-[#6B7280] mt-0.5">
                        Enroll ≥ 7 days early: 10% off
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={applyEarlyBird}
                    aria-label="Toggle Early-Bird Commitment"
                    onClick={() => setApplyEarlyBird((prev) => !prev)}
                    className={`w-10 h-[22px] rounded-full p-0.5 transition-colors duration-200 shrink-0 cursor-pointer ${
                      applyEarlyBird ? 'bg-[#156947]' : 'bg-[#C5CFC9]'
                    }`}
                  >
                    <motion.span
                      layout
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className={`block w-[18px] h-[18px] rounded-full bg-white shadow-xs ${
                        applyEarlyBird ? 'translate-x-[18px]' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle 3: Redeem Store Credit */}
                <div className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#EAF6EF] text-[#156847] flex items-center justify-center shrink-0">
                      <CreditCard className="w-4 h-4 stroke-[1.9]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-bold text-[#111827] leading-tight">
                        Redeem Store Credit
                      </div>
                      <div className="text-[11px] text-[#6B7280] mt-0.5">
                        Use your balance: $5.00
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={applyStoreCredit}
                    aria-label="Toggle Redeem Store Credit"
                    onClick={() => setApplyStoreCredit((prev) => !prev)}
                    className={`w-10 h-[22px] rounded-full p-0.5 transition-colors duration-200 shrink-0 cursor-pointer ${
                      applyStoreCredit ? 'bg-[#156947]' : 'bg-[#C5CFC9]'
                    }`}
                  >
                    <motion.span
                      layout
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className={`block w-[18px] h-[18px] rounded-full bg-white shadow-xs ${
                        applyStoreCredit ? 'translate-x-[18px]' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Totals & Authoritative PayPal Summary */}
            <div className="pt-3 border-t border-[#EDF2EE] space-y-3">
              <div className="space-y-1.5 text-[13px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#374151]">Subtotal</span>
                  <span className="font-medium text-[#111827]">${baseFee.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#374151]">Total Discount</span>
                  <span className="font-semibold text-[#D9383A]">
                    {totalDiscount > 0 ? `−$${totalDiscount.toFixed(2)}` : '$0.00'}
                  </span>
                </div>
              </div>

              {/* Green PayPal Amount Banner */}
              <div className="rounded-xl bg-[#E6F4EC] px-3.5 py-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-white shadow-2xs flex items-center justify-center shrink-0">
                    <PayPalMonogramIcon className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-[12.5px] text-[#111827] truncate">
                    Amount Sent to PayPal
                  </span>
                </div>

                <motion.span
                  key={amountSentToPayPal}
                  initial={{ scale: 1.15, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="text-[21px] font-extrabold text-[#135A3E] tracking-tight shrink-0"
                >
                  ${amountSentToPayPal.toFixed(2)}
                </motion.span>
              </div>

              {selectedMechanismCard && POST_CHECKOUT_NOTES[selectedMechanismCard] && (
                <div className="nv-stage-panel rounded-lg bg-[#F8FBF9] border border-[#DCE8E1] px-3 py-2 text-[11px] text-[#374151] leading-snug">
                  {POST_CHECKOUT_NOTES[selectedMechanismCard]}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: 3x2 Grid of Six Reward Mechanism Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {REWARD_MECHANISMS.map((item) => {
              const isCardSelected = selectedMechanismCard === item.number;
              return (
                <motion.div
                  key={item.number}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isCardSelected}
                  whileHover={{ y: -4, transition: { type: 'spring', stiffness: 450, damping: 25 } }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => handleMechanismCardActivate(item.number)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleMechanismCardActivate(item.number);
                    }
                  }}
                  className={`nv-card-lift bg-white rounded-2xl border p-5 sm:p-6 shadow-[0_4px_20px_rgba(15,41,30,0.04)] hover:shadow-[0_10px_28px_rgba(15,41,30,0.07)] transition-all flex flex-col justify-start cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#156847] ${
                    isCardSelected
                      ? 'border-[#BFE0CD] ring-2 ring-[#156847]/20'
                      : 'border-[#E6EDE8]'
                  }`}
                >
                  {/* Number Circle + Mint Rounded Icon Box */}
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className="w-7 h-7 rounded-full bg-[#E6F4EC] text-[#14533C] text-[12.5px] font-bold flex items-center justify-center shrink-0">
                      {item.number}
                    </span>

                    <div className="w-12 h-12 rounded-xl bg-[#EAF6EF] text-[#156847] flex items-center justify-center shrink-0">
                      {renderMechanismIcon(item.icon)}
                    </div>
                  </div>

                  <h3 className="font-bold text-[16.5px] text-[#111827] mb-2 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-[13px] text-[#374151] leading-[1.58]">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RewardsShowcase;
