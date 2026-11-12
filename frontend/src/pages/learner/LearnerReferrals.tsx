import React, { useEffect, useState, useCallback } from 'react';
import { api, useSyncRefresh } from '../../api/client';
import {
  Link2, Copy, Check, Mail, Users, Coins, ArrowUp, ChevronRight, ChevronDown, CalendarCheck,
  Layers, ShieldCheck, Gift, Filter, MoreHorizontal, Clock, Wallet, Ticket, CircleCheck, ArrowRight,
  UserRoundPlus,
} from 'lucide-react';

import heroMountains from '../../assets/discover-hero-mountains-v2.jpg';
import referralBannerMountains from '../../assets/referral-banner-mountains.jpg';

type ActivityStatus = 'completed' | 'in_progress' | 'invited' | 'invalid';

interface ActivityRow {
  id: string;
  name: string;
  email: string;
  invitedOn: string;
  status: ActivityStatus;
  detail: string;
  reward: number | null;
}

const STATUS_LABEL: Record<ActivityStatus, string> = {
  completed: 'Completed',
  in_progress: 'Booking in Progress',
  invited: 'Invited',
  invalid: 'Ineligible',
};

const StatusIcon: React.FC<{ status: ActivityStatus }> = ({ status }) => {
  if (status === 'completed') {
    return (
      <span className="w-6 h-6 rounded-full bg-[#E3F4E6] flex items-center justify-center shrink-0">
        <ShieldCheck className="w-3.5 h-3.5 text-[#0E7A3C]" strokeWidth={2.2} />
      </span>
    );
  }
  if (status === 'in_progress') {
    return (
      <span className="w-6 h-6 rounded-full bg-[#FDEFC8] flex items-center justify-center shrink-0">
        <Clock className="w-3.5 h-3.5 text-[#C98A0B]" strokeWidth={2.2} />
      </span>
    );
  }
  return (
    <span className="w-6 h-6 rounded-full bg-[#EEF1EE] flex items-center justify-center shrink-0">
      <UserRoundPlus className="w-3.5 h-3.5 text-[#6B7280]" strokeWidth={2.2} />
    </span>
  );
};

export const LearnerReferrals: React.FC = () => {
  const [referralData, setReferralData] = useState<any | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState('');
  const [copyError, setCopyError] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.getMyReferrals();
      setReferralData(data);
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useSyncRefresh(['rewards', 'reservations'], load);

  const code: string = referralData?.referral_code || '';
  const referralUrl = `${window.location.origin}/sign-up?ref=${code}`;

  const copyToClipboard = async () => {
    if (!code) return;
    try { await navigator.clipboard.writeText(referralUrl); setCopyError(false); }
    catch { setCopyError(true); (document.getElementById('referral-url-input') as HTMLInputElement)?.select(); return; }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activity: ActivityRow[] = (referralData?.referrals ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    email: '',
    invitedOn: new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    status: row.status === 'rewarded' ? 'completed' : row.status === 'invalid' ? 'invalid' : 'invited',
    detail: row.status === 'rewarded' ? 'Workshop booked' : row.status === 'invalid' ? 'No credit issued' : 'Awaiting booking',
    reward: row.status === 'rewarded' ? row.reward_amount_cents / 100 : null,
  }));
  const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
  const stats = [
    { label: 'Tracked Referrals', value: referralData ? String(referralData.total_referrals) : '—', delta: 0, icon: Mail },
    { label: 'Completed Referrals', value: referralData ? String(activity.filter(row => row.status === 'completed').length) : '—', delta: 0, icon: Users },
    { label: 'Earned Store Credit', value: referralData ? money(referralData.total_earned_cents) : '—', delta: 0, icon: Coins },
  ];

  const displayLink = code ? referralUrl : loadError ? 'Referral link unavailable' : 'Loading referral link…';
  const filtered = activity.filter(row => filter === 'all' || row.status === filter);


  return (
    <div className="space-y-3.5 text-[#1A2621]">
      {loadError && <p role="alert" className="text-xs text-red-700">Unable to load referrals. <button type="button" onClick={load} className="underline">Retry</button></p>}
      {/* 1. Hero header */}
      <div className="relative min-h-[100px] overflow-hidden rounded-xl">
        <div className="absolute right-0 -top-4 h-[120px] w-[58%] pointer-events-none select-none overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_35%),linear-gradient(to_bottom,black_65%,transparent_100%)] [mask-composite:intersect] [-webkit-mask-composite:source-in]">
          <img src={heroMountains} alt="" className="w-full h-full object-cover object-[right_62%]" />
        </div>
        <div className="relative z-10 pt-0.5 max-w-[640px]">
          <h1 className="text-[26px] leading-tight font-serif font-bold text-[#14211B] flex items-center gap-2.5">
            Refer &amp; Earn Store Credit
            <Gift className="w-6 h-6 text-[#F08A1C]" strokeWidth={2.2} />
          </h1>
          <p className="mt-1 text-[13px] text-[#4B5563] leading-snug">
            Invite peers to NUVENDRY, help them grow their skills, and earn store credit when they complete a workshop booking.
          </p>
        </div>
      </div>

      {copyError && <p role="status">Select and copy your referral link manually.</p>}
      {/* 2. Link card + stats */}
      <div className="grid grid-cols-1 lg:grid-cols-[2.3fr_1fr_1fr_1.02fr] gap-3">
        <div className="relative overflow-hidden rounded-2xl bg-[#0E5F35] text-white p-4 min-h-[118px]">
          <img
            src={referralBannerMountains}
            alt=""
            className="absolute right-0 top-0 h-full w-[70%] object-cover object-[right_60%] pointer-events-none select-none [mask-image:linear-gradient(to_right,transparent_0%,black_35%)]"
          />
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <Link2 className="w-5 h-5" strokeWidth={2.2} />
              <h2 className="text-[17px] font-serif font-bold">Your Referral Link</h2>
            </div>
            <p className="text-[11px] text-white/85 mt-0.5">Share this link with your peers to invite them to NUVENDRY.</p>
            <div className="mt-3 flex items-center bg-white border-2 border-white/90 rounded-xl pl-3 pr-1 py-1 gap-2">
              <Link2 className="w-3.5 h-3.5 shrink-0 text-green-800" />
              <input
                id="referral-url-input"
                type="text"
                readOnly
                value={displayLink}
                onClick={(e) => (e.currentTarget as HTMLInputElement).select()}
                className="flex-1 min-w-0 bg-transparent text-[13px] font-semibold text-[#14211B] outline-none truncate"
              />
              <button
                type="button"
                disabled={!code} onClick={copyToClipboard}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B7A3E] hover:bg-[#0A6A35] border border-white/40 text-[12px] font-semibold shrink-0 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-[#E3E7E2] p-4 flex flex-col justify-between min-h-[118px] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-2.5">
                <Icon className="w-6 h-6 text-[#0E6636]" strokeWidth={1.8} />
                <span className="text-[12px] text-[#374151] font-medium leading-tight">{s.label}</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-[34px] leading-none font-serif font-bold text-[#0E5F35]">{s.value}</span>
                <div className="flex items-center gap-1.5 pb-1">
                  {s.delta > 0 && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[#E3F4E6] text-[#0E7A3C] text-[11px] font-bold">
                      <ArrowUp className="w-3 h-3" strokeWidth={3} />+{s.delta}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-[#6B7280]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. How it works */}
      <div className="bg-white rounded-2xl border border-[#E3E7E2] px-5 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#0E6636]" strokeWidth={1.8} />
            <h2 className="text-[16px] font-serif font-bold">How it Works</h2>
          </div>
          <a href="#referral-guidelines" className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#0E6636] hover:underline">
            Learn more about referrals <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-4">
          {[
            { n: 1, icon: Link2, title: 'Share Your Link', text: 'Invite peers using your unique referral link.' },
            { n: 2, icon: CalendarCheck, title: 'They Book a Workshop', text: 'Your invitee creates an account and completes a workshop booking.' },
            { n: 3, icon: Coins, title: 'You Earn Credit', text: 'Get store credit automatically when their booking is completed.' },
          ].map((step, i) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={step.n}>
                <div className="flex items-center gap-3">
                  <span className="w-[58px] h-[58px] rounded-full bg-[#E4F3E6] flex items-center justify-center shrink-0">
                    <Icon className="w-7 h-7 text-[#0E6636]" strokeWidth={1.7} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="w-[18px] h-[18px] rounded-full bg-[#0E6636] text-white text-[10px] font-bold flex items-center justify-center shrink-0">{step.n}</span>
                      <h3 className="text-[13px] font-bold">{step.title}</h3>
                    </div>
                    <p className="text-[11px] text-[#4B5563] leading-snug mt-0.5">{step.text}</p>
                  </div>
                </div>
                {i < 2 && <ArrowRight className="hidden md:block w-5 h-5 text-[#8CCB9B]" strokeWidth={1.8} />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 4. Activity + guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-3">
        <div className="bg-white rounded-2xl border border-[#E3E7E2] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#0E6636]" strokeWidth={1.8} />
                <h2 className="text-[16px] font-serif font-bold">Referral Activity</h2>
              </div>
              <p className="text-[11.5px] text-[#4B5563] mt-0.5 ml-7">Track your invites, booking completion, and earned rewards.</p>
            </div>
            <label className="inline-flex items-center gap-1 rounded-lg border bg-white p-2 text-xs"><Filter size={14}/><select aria-label="Filter referral activity" value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All Activity</option>{Object.entries(STATUS_LABEL).map(([value,label]) => <option key={value} value={value}>{label}</option>)}
            </select></label>
          </div>

          <div className="mt-3 rounded-xl bg-[#EEF5EF] grid grid-cols-[1.5fr_1fr_1.6fr_1fr_32px] px-4 py-2 text-[11px] font-semibold text-[#374151]">
            <span>Invitee</span>
            <span>Invited On</span>
            <span>Booking Status</span>
            <span className="text-center">Credited Reward</span>
            <span />
          </div>

          <div className="divide-y divide-[#EEF0EC]">
            {!filtered.length && <p className="p-4 text-sm">No referral activity to show.</p>}
            {filtered.map((row) => (
              <div key={row.id} className="grid grid-cols-[1.5fr_1fr_1.6fr_1fr_32px] items-center px-4 py-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-7 h-7 rounded-full bg-[#E3F4E6] text-[#0E6636] text-[12px] font-bold flex items-center justify-center shrink-0">
                    {row.name.replace('Invitee #', '').charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 leading-tight">
                    <div className="text-[12px] font-bold truncate">{row.name}</div>
                    {row.email && <div className="text-[10.5px] text-[#6B7280] truncate">{row.email}</div>}
                  </div>
                </div>
                <span className="text-[11.5px] text-[#374151]">{row.invitedOn}</span>
                <div className="flex items-center gap-2 min-w-0">
                  <StatusIcon status={row.status} />
                  <div className="leading-tight min-w-0">
                    <div className="text-[12px] font-bold truncate">{STATUS_LABEL[row.status]}</div>
                    <div className="text-[10.5px] text-[#6B7280] truncate">{row.detail}</div>
                  </div>
                </div>
                <div className="flex justify-center">
                  {row.reward ? (
                    <span className="px-3 py-1 rounded-full bg-[#DFF3E2] text-[#0E7A3C] text-[11.5px] font-bold">+ ${row.reward.toFixed(2)}</span>
                  ) : (
                    <span className="text-[#6B7280]">—</span>
                  )}
                </div>
                <button type="button" aria-label={`Details for ${row.name}`} aria-expanded={expanded === row.id} onClick={() => setExpanded(expanded === row.id ? '' : row.id)} className="p-1 rounded-md text-[#374151] hover:bg-[#F3F5F3]">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {expanded === row.id && <p className="col-span-full mt-2 rounded-lg bg-green-50 p-2 text-xs">{row.name} · {row.invitedOn} · {row.detail} · {row.reward ? `$${row.reward.toFixed(2)} credited` : 'No credit issued'}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3" id="referral-guidelines">
          <div className="relative overflow-hidden bg-white rounded-2xl border border-[#E3E7E2] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <img src={heroMountains} alt="" className="absolute right-0 top-0 w-[45%] h-[70px] object-cover object-[right_70%] opacity-90 pointer-events-none select-none [mask-image:linear-gradient(to_right,transparent,black_50%)]" />
            <div className="relative flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#0E6636]" strokeWidth={1.8} />
              <h2 className="text-[16px] font-serif font-bold">Referral Guidelines</h2>
            </div>
            <ul className="relative mt-2.5 space-y-1.5">
              {[
                'Invite peers who are new to NUVENDRY.',
                'They must create an account using your referral link.',
                'Store credit is awarded after they complete a paid workshop booking.',
                'No limit on the number of peers you can refer.',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2 text-[11.5px] text-[#1F2A24] leading-snug">
                  <Check className="w-3.5 h-3.5 text-[#0E6636] mt-0.5 shrink-0" strokeWidth={3} />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-[#E3E7E2] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#0E6636]" strokeWidth={1.8} />
              <h2 className="text-[16px] font-serif font-bold">Payout Rules</h2>
            </div>
            <div className="mt-2.5 space-y-2.5">
              {[
                { icon: Ticket, label: 'Reward per completed referral', value: referralData ? money(referralData.reward_per_referral_cents) + ' store credit' : '—', pill: true },
                { icon: CalendarCheck, label: 'When you receive it', value: 'Immediately after booking completion', pill: true },
                { icon: Wallet, label: 'How to use it', value: 'Apply at checkout for workshops, reservations, and more', pill: true },
              ].map((r) => {
                const Icon = r.icon;
                return (
                  <div key={r.label} className="grid grid-cols-[16px_1fr_auto] items-center gap-2">
                    <Icon className="w-4 h-4 text-[#0E6636]" strokeWidth={1.8} />
                    <span className="text-[10.5px] text-[#1F2A24] leading-tight">{r.label}</span>
                    <span className="max-w-[150px] text-center text-[10px] font-semibold leading-tight px-2 py-1.5 rounded-md bg-[#DFF3E2] text-[#0E6636]">{r.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom CTA banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0E5F35] text-white px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-h-[70px]">
        <img
          src={referralBannerMountains}
          alt=""
          className="absolute right-0 top-0 h-full w-[70%] object-cover object-[right_58%] pointer-events-none select-none [mask-image:linear-gradient(to_right,transparent_0%,black_35%)]"
        />
        <div className="relative z-10 flex items-center gap-3">
          <Gift className="w-9 h-9 shrink-0" strokeWidth={1.4} />
          <div>
            <h3 className="text-[19px] font-serif font-bold leading-tight">Invite More, Earn More</h3>
            <p className="text-[11.5px] text-white/90 leading-snug">The more peers who complete a workshop booking, the more store credit you earn.</p>
          </div>
        </div>
        <button
          type="button"
          disabled={!code} onClick={copyToClipboard}
          className="relative z-10 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-[#F1FFF6] text-[#0E5F35] text-[12.5px] font-bold transition-colors whitespace-nowrap shadow-sm"
        >
          <span>{copied ? 'Link Copied' : 'Share Your Link'}</span>
          {copied ? <CircleCheck className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
