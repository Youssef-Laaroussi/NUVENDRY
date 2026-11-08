import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { ShieldCheck, Mail, DollarSign, Store, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export const MerchantSettings: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const merchant = user?.merchant_profile;

  const initialBusinessName = merchant?.business_name || `${user?.full_name || 'Instructor'}'s Academy`;
  const initialReceiverEmail = merchant?.paypal_receiver_email || user?.email || '';

  const [businessName, setBusinessName] = useState(initialBusinessName);
  const [receiverEmail, setReceiverEmail] = useState(initialReceiverEmail);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    setBusinessName(merchant?.business_name || `${user?.full_name || 'Instructor'}'s Academy`);
    setReceiverEmail(merchant?.paypal_receiver_email || user?.email || '');
  }, [merchant?.business_name, merchant?.paypal_receiver_email, user?.full_name, user?.email]);

  const isDirty =
    businessName.trim() !== initialBusinessName.trim() ||
    receiverEmail.trim() !== initialReceiverEmail.trim();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty || saving) return;
    if (businessName.trim().length < 2) {
      setFeedback({ type: 'error', message: 'Business name must be at least 2 characters.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(receiverEmail.trim())) {
      setFeedback({ type: 'error', message: 'Please enter a valid PayPal Sandbox receiver email.' });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      await api.updateProfile({
        business_name: businessName.trim(),
        paypal_receiver_email: receiverEmail.trim(),
      });
      await refreshUser();
      setFeedback({ type: 'success', message: 'Merchant credentials saved.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update merchant settings.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif text-charcoal">Merchant Settings & Credentials</h1>
          <p className="text-xs text-charcoal/60">
            Configure your teaching profile, business entity name, and PayPal receiver email.
          </p>
        </div>

        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-warmgray p-6 sm:p-8 space-y-6 shadow-xs max-w-2xl">
          {feedback && (
            <div
              role={feedback.type === 'error' ? 'alert' : 'status'}
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
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

          <div className="space-y-4">
            <div>
              <label htmlFor="merchant-business-name" className="text-xs font-medium text-charcoal/70 mb-1 block">
                Business / Academy Name
              </label>
              <div className="relative">
                <input
                  id="merchant-business-name"
                  type="text"
                  value={businessName}
                  onChange={(e) => {
                    setBusinessName(e.target.value);
                    if (feedback) setFeedback(null);
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-ivory border border-warmgray rounded-xl text-xs text-charcoal font-semibold focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-forest"
                />
                <Store className="w-4 h-4 text-charcoal/40 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label htmlFor="merchant-primary-email" className="text-xs font-medium text-charcoal/70 mb-1 block">
                Instructor Primary Email
              </label>
              <div className="relative">
                <input
                  id="merchant-primary-email"
                  type="email"
                  readOnly
                  value={user?.email || ''}
                  className="w-full pl-9 pr-3 py-2 bg-ivory border border-warmgray rounded-xl text-xs text-charcoal/75 select-all"
                />
                <Mail className="w-4 h-4 text-charcoal/40 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label htmlFor="merchant-receiver-email" className="text-xs font-medium text-charcoal/70 mb-1 block">
                PayPal Sandbox Receiver Email
              </label>
              <div className="relative">
                <input
                  id="merchant-receiver-email"
                  type="email"
                  value={receiverEmail}
                  onChange={(e) => {
                    setReceiverEmail(e.target.value);
                    if (feedback) setFeedback(null);
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-ivory border border-warmgray rounded-xl text-xs text-charcoal focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-forest"
                />
                <DollarSign className="w-4 h-4 text-charcoal/40 absolute left-3 top-2.5" />
              </div>
              <span className="text-[10px] text-charcoal/50 mt-1 block">
                Direct receiver email registered for Sandbox settlement.
              </span>
            </div>

            <div>
              <label className="text-xs font-medium text-charcoal/70 mb-1 block">Instructor Rating</label>
              <div className="text-sm font-bold font-mono text-charcoal flex items-center gap-1.5">
                <span>⭐ {merchant?.rating || '5.00'} / 5.00</span>
                <span className="text-[10px] font-normal text-forest bg-mint px-2 py-0.5 rounded-full font-sans">
                  Verified Educator
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-warmgray/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-charcoal/60">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
              <span>PayPal Sandbox Integration is configured for Orders v2 captures.</span>
            </div>

            <button
              type="submit"
              disabled={!isDirty || saving}
              className="nv-btn-press px-4 py-2 rounded-xl bg-forest text-ivory text-xs font-semibold hover:bg-charcoal disabled:opacity-45 transition-colors inline-flex items-center justify-center gap-1.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
