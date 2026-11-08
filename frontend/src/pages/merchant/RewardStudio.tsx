import React, { useEffect, useState, useCallback } from 'react';
import { api, useSyncRefresh } from '../../api/client';
import { RewardCampaign } from '../../types';
import { Tag, Plus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

type CampaignMechanism =
  | 'welcome'
  | 'early_bird'
  | 'store_credit'
  | 'digital_gift'
  | 'referral'
  | 'badge';

export const RewardStudio: React.FC = () => {
  const [campaigns, setCampaigns] = useState<RewardCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [campaignType, setCampaignType] = useState<CampaignMechanism>('welcome');
  const [discountAmountDollars, setDiscountAmountDollars] = useState('10.00');
  const [minSpendDollars, setMinSpendDollars] = useState('25.00');
  const [totalBudgetDollars, setTotalBudgetDollars] = useState('500.00');
  const [creating, setCreating] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    try {
      const data = await api.getMerchantRewards();
      setCampaigns(data);
    } catch (err) {
      console.error('Failed to load campaigns', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  useSyncRefresh(['rewards', 'analytics'], fetchCampaigns);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creating) return;
    const discountNum = parseFloat(discountAmountDollars);
    const minSpendNum = parseFloat(minSpendDollars);
    const budgetNum = parseFloat(totalBudgetDollars);
    if (!name.trim() || Number.isNaN(discountNum) || discountNum < 0 || Number.isNaN(budgetNum) || budgetNum < 0) {
      setFeedback({ type: 'error', message: 'Please enter a campaign name and valid non-negative USD amounts.' });
      return;
    }
    setCreating(true);
    setFeedback(null);
    try {
      await api.createMerchantReward({
        name: name.trim(),
        campaign_type: campaignType,
        discount_amount_cents: Math.round(discountNum * 100),
        min_spend_cents: Math.max(0, Math.round((Number.isNaN(minSpendNum) ? 0 : minSpendNum) * 100)),
        total_budget_cents: Math.round(budgetNum * 100),
        max_per_user: 1,
      });
      setName('');
      setShowForm(false);
      setFeedback({ type: 'success', message: 'Merchant-funded reward campaign launched.' });
      await fetchCampaigns();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create campaign.' });
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (campaign: RewardCampaign) => {
    if (togglingId) return;
    setTogglingId(campaign.id);
    setFeedback(null);
    try {
      await api.updateMerchantReward(campaign.id, { is_active: !campaign.is_active });
      setFeedback({
        type: 'success',
        message: `"${campaign.name}" ${!campaign.is_active ? 'activated' : 'paused'}. Server checkout quotes updated.`,
      });
      await fetchCampaigns();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update campaign status.' });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gold font-mono">
              Incentive Engine
            </span>
            <h1 className="text-2xl font-serif text-charcoal mt-1">Reward Studio</h1>
            <p className="text-xs text-charcoal/60">
              Configure merchant-funded promotions to drive early enrollments and customer acquisition.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowForm(!showForm);
              setFeedback(null);
            }}
            className="nv-btn-press inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest text-ivory text-xs font-semibold hover:bg-charcoal transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
          >
            <Plus className="w-4 h-4" />
            <span>{showForm ? 'Cancel' : 'New Campaign'}</span>
          </button>
        </div>

        {feedback && (
          <div
            role={feedback.type === 'error' ? 'alert' : 'status'}
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
              feedback.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-mint/50 border-forest/20 text-forest font-medium'
            }`}
          >
            {feedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-forest" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Campaign Creation Form */}
        {showForm && (
          <form onSubmit={handleCreateCampaign} className="bg-white rounded-2xl border border-warmgray p-6 space-y-4 shadow-xs">
            <h3 className="font-semibold text-sm text-charcoal">Launch a New Promotion Campaign</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-charcoal/70 mb-1 block">Campaign Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. November Welcome Special ($10 Off)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-ivory border border-warmgray rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-charcoal/70 mb-1 block">Promotion Type</label>
                <select
                  value={campaignType}
                  onChange={(e) => setCampaignType(e.target.value as CampaignMechanism)}
                  className="w-full p-2.5 bg-ivory border border-warmgray rounded-xl text-xs"
                >
                  <option value="welcome">Welcome Discount (First Purchase)</option>
                  <option value="early_bird">Early-Bird Discount (3+ Days Ahead)</option>
                  <option value="store_credit">Store Credit Allocation</option>
                  <option value="digital_gift">Digital Gift & Starter Kit</option>
                  <option value="referral">Verified Referral Bonus</option>
                  <option value="badge">Achievement Badge Trigger</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-charcoal/70 mb-1 block">Discount / Credit Value ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={discountAmountDollars}
                  onChange={(e) => setDiscountAmountDollars(e.target.value)}
                  className="w-full p-2.5 bg-ivory border border-warmgray rounded-xl text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-charcoal/70 mb-1 block">Min Spend ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={minSpendDollars}
                    onChange={(e) => setMinSpendDollars(e.target.value)}
                    className="w-full p-2.5 bg-ivory border border-warmgray rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-charcoal/70 mb-1 block">Total Budget ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={totalBudgetDollars}
                    onChange={(e) => setTotalBudgetDollars(e.target.value)}
                    className="w-full p-2.5 bg-ivory border border-warmgray rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={creating}
                className="nv-btn-press px-5 py-2.5 bg-forest hover:bg-charcoal disabled:opacity-60 text-ivory text-xs font-semibold rounded-xl transition-colors flex items-center gap-2"
              >
                {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{creating ? 'Launching...' : 'Launch Promotion'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Existing Campaigns Table */}
        <div className="bg-white rounded-2xl border border-warmgray p-6 space-y-4 shadow-xs">
          <h3 className="font-semibold text-sm text-charcoal flex items-center gap-2">
            <Tag className="w-4 h-4 text-forest" /> Active Promotional Campaigns
          </h3>

          {loading ? (
            <div className="py-12 text-center text-xs text-charcoal/60">Loading reward campaigns...</div>
          ) : campaigns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-ivory text-charcoal/60 font-mono uppercase text-[10px] border-b border-warmgray">
                  <tr>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Discount</th>
                    <th className="py-2.5 px-3">Remaining Budget</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warmgray/60 font-medium">
                  {campaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-ivory/50">
                      <td className="py-3 px-3 text-charcoal font-semibold">{c.name}</td>
                      <td className="py-3 px-3 capitalize text-charcoal/80 font-mono text-[11px]">
                        {c.campaign_type.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-3 font-mono text-forest">
                        -${(c.discount_amount_cents / 100).toFixed(2)} USD
                      </td>
                      <td className="py-3 px-3 font-mono text-charcoal/70">
                        ${(c.remaining_budget_cents / 100).toFixed(2)} of ${(c.total_budget_cents / 100).toFixed(2)}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          disabled={togglingId === c.id}
                          onClick={() => handleToggleActive(c)}
                          title={c.is_active ? 'Click to pause campaign' : 'Click to activate campaign'}
                          className={`nv-btn-press inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest ${
                            c.is_active
                              ? 'bg-mint text-forest hover:bg-forest hover:text-ivory'
                              : 'bg-warmgray text-charcoal/70 hover:bg-charcoal hover:text-ivory'
                          }`}
                        >
                          {togglingId === c.id && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                          <span>{c.is_active ? 'Active' : 'Paused'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-charcoal/60 bg-ivory rounded-xl">
              No reward campaigns launched yet. Create a campaign above to incentivize learner bookings.
            </div>
          )}
        </div>
      </div>
    </>
  );
};
