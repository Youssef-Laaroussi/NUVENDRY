import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { User, Mail, ShieldCheck, Key, Loader2, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';

export const LearnerSettings: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [saving, setSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (user?.full_name) {
      setFullName(user.full_name);
    }
  }, [user?.full_name]);

  const isDirty = fullName.trim() !== (user?.full_name || '').trim();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty || saving) return;
    if (fullName.trim().length < 2) {
      setFeedback({ type: 'error', message: 'Full name must be at least 2 characters.' });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      await api.updateProfile({ full_name: fullName.trim() });
      await refreshUser();
      setFeedback({ type: 'success', message: 'Profile updated successfully.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCopyCode = () => {
    if (!user?.referral_code) return;
    navigator.clipboard?.writeText(user.referral_code).catch(() => {});
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif text-charcoal">Account & Security</h1>
          <p className="text-xs text-charcoal/60">Manage your profile, identity, and security preferences.</p>
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
              <label htmlFor="settings-full-name" className="text-xs font-medium text-charcoal/70 mb-1 block">
                Full Name
              </label>
              <div className="relative">
                <input
                  id="settings-full-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (feedback) setFeedback(null);
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-ivory border border-warmgray rounded-xl text-xs text-charcoal focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-forest"
                />
                <User className="w-4 h-4 text-charcoal/40 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label htmlFor="settings-email" className="text-xs font-medium text-charcoal/70 mb-1 block">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="settings-email"
                  type="email"
                  readOnly
                  value={user?.email || ''}
                  className="w-full pl-9 pr-3 py-2 bg-ivory border border-warmgray rounded-xl text-xs text-charcoal/75 select-all"
                />
                <Mail className="w-4 h-4 text-charcoal/40 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-charcoal/70 mb-1 block">Role</label>
              <span className="inline-block px-3 py-1 bg-mint text-forest text-xs font-semibold rounded-full capitalize">
                {user?.role}
              </span>
            </div>

            <div>
              <label htmlFor="settings-referral-code" className="text-xs font-medium text-charcoal/70 mb-1 block">
                Referral Code
              </label>
              <div className="relative flex items-center">
                <input
                  id="settings-referral-code"
                  type="text"
                  readOnly
                  value={user?.referral_code || ''}
                  onClick={(e) => (e.currentTarget as HTMLInputElement).select()}
                  className="w-full pl-9 pr-9 py-2 bg-ivory border border-warmgray rounded-xl text-xs font-mono text-charcoal select-all"
                />
                <Key className="w-4 h-4 text-charcoal/40 absolute left-3 top-2.5" />
                {user?.referral_code && (
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="absolute right-2.5 p-1 rounded text-charcoal/50 hover:text-forest transition-colors"
                    title="Copy referral code"
                    aria-label="Copy referral code"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-forest" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-warmgray/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-charcoal/60">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
              <span>Encrypted with modern bcrypt and JWT authentication standards.</span>
            </div>

            <button
              type="submit"
              disabled={!isDirty || saving}
              className="nv-btn-press px-4 py-2 rounded-xl bg-forest text-ivory text-xs font-semibold hover:bg-charcoal disabled:opacity-45 transition-colors inline-flex items-center justify-center gap-1.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
