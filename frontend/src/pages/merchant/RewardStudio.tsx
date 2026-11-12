import { useCallback, useEffect, useState } from 'react';
import { Award, BarChart3, Coins, Gift, History, Layers, PlusCircle, Target } from 'lucide-react';
import { api, useSyncRefresh } from '../../api/client';
import type { RewardCampaign } from '../../types';
import { AccountRewards } from './AccountRewards';
import trophy from '../../assets/reward-studio-trophy.webp';
import './RewardStudio.css';

const money = (cents: number) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(cents / 100);

export function RewardStudio() {
  const [campaigns, setCampaigns] = useState<RewardCampaign[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [manage, setManage] = useState(false);
  const [filter, setFilter] = useState('all');

  const refresh = useCallback(async () => {
    try {
      setCampaigns(await api.getMerchantRewards());
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  useSyncRefresh(['rewards', 'analytics'], refresh);

  const active = campaigns.filter(campaign => campaign.is_active);
  const featured = active[0];
  const budget = campaigns.reduce((total, campaign) => total + campaign.total_budget_cents, 0);
  const remaining = campaigns.reduce((total, campaign) => total + campaign.remaining_budget_cents, 0);
  const visible = filter === 'all' ? campaigns : filter === 'active' ? active : campaigns.filter(campaign => !campaign.is_active);
  const cards = [
    { label: 'Active Reward Campaigns', Icon: Gift, value: active.length },
    { label: 'Campaign Budget', Icon: Coins, value: money(budget) },
    { label: 'Remaining Budget', Icon: Target, value: money(remaining) },
    { label: 'Badge Campaigns', Icon: Award, value: campaigns.filter(campaign => campaign.campaign_type === 'badge').length },
  ];

  return <div className="rw">
    <header className="studio-hero">
      <h1>Reward Studio <Gift/></h1>
      <p>Design reward campaigns and track the budget for your workshops.</p>
    </header>
    {status === 'error' && <p role="alert">Could not load reward campaigns. <button onClick={refresh}>Retry</button></p>}
    {status === 'loading' && <p role="status">Loading reward campaigns…</p>}
    <div className="studio-kpis">
      {cards.map(({ label, Icon, value }) => <section key={label}>
        <span><Icon/>{label}</span><div><strong>{status === 'ready' ? value : '—'}</strong></div>
      </section>)}
    </div>
    <div className="rw-grid">
      <div className="rw-column">
        <section className="rw-feature">
          <img src={trophy} alt=""/>
          <div><small>FEATURED CAMPAIGN</small><h2>{featured?.name ?? 'No active campaign'}</h2>
            {featured && <p>{money(featured.remaining_budget_cents)} remaining</p>}
          </div>
          <button onClick={() => setManage(true)}>{featured ? 'Manage Campaigns' : 'Create Campaign'}</button>
        </section>
        <section className="rw-card rw-catalog">
          <header><h2><Gift/>Reward Campaigns</h2><button onClick={() => setManage(true)}>Manage Campaigns</button></header>
          <nav aria-label="Filter campaigns">
            {[['all', 'All Campaigns'], ['active', 'Active'], ['inactive', 'Inactive']].map(([value, label]) =>
              <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}
          </nav>
          <div className="rw-products">{visible.map(campaign => <article key={campaign.id}>
            <span>{campaign.campaign_type.replace(/_/g, ' ')}</span>
            <h3>{campaign.name}</h3>
            <p>{campaign.is_active ? 'Active' : 'Inactive'}</p>
            <footer><b><Coins/>{money(campaign.remaining_budget_cents)} remaining</b></footer>
          </article>)}</div>
          {status === 'ready' && !visible.length && <p>No campaigns for this filter.</p>}
        </section>
        <section className="rw-card"><h2><History/>Recent Redemptions</h2><p>Redemption history is unavailable.</p></section>
      </div>
      <aside className="rw-column">
        <section className="rw-card rw-manage">
          <h2><Layers/>Reward Management</h2>
          <button onClick={() => setManage(true)}><PlusCircle/>Manage Reward Campaigns</button>
        </section>
        <section className="rw-card rw-performance">
          <header><h2><BarChart3/>Campaign Budget</h2></header>
          <div>{cards.slice(1, 3).map(({ label, Icon, value }) =>
            <article key={label}><Icon/><strong>{status === 'ready' ? value : '—'}</strong>{label}</article>)}</div>
        </section>
      </aside>
    </div>
    {manage && <dialog className="rw-dialog rw-campaign-dialog" ref={element => { if (element && !element.open) element.showModal(); }} onClose={() => setManage(false)}>
      <button onClick={() => setManage(false)}>Close</button>
      <AccountRewards/>
    </dialog>}
  </div>;
}
