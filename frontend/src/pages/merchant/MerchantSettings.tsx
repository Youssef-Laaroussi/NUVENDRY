import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, User, Mail, DollarSign, Store } from 'lucide-react';

export const MerchantSettings: React.FC = () => {
  const { user } = useAuth();
  const merchant = user?.merchant_profile;

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif text-charcoal">Merchant Settings & Credentials</h1>
          <p className="text-xs text-charcoal/60">
            Configure your teaching profile, business entity name, and PayPal receiver email.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-warmgray p-6 sm:p-8 space-y-6 shadow-xs max-w-2xl">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-charcoal/70 mb-1 block">Business / Academy Name</label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={merchant?.business_name || `${user?.full_name}'s Academy`}
                  className="w-full pl-9 pr-3 py-2 bg-ivory border border-warmgray rounded-xl text-xs text-charcoal font-semibold select-all"
                />
                <Store className="w-4 h-4 text-charcoal/40 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-charcoal/70 mb-1 block">Instructor Primary Email</label>
              <div className="relative">
                <input
                  type="email"
                  readOnly
                  value={user?.email || ''}
                  className="w-full pl-9 pr-3 py-2 bg-ivory border border-warmgray rounded-xl text-xs text-charcoal select-all"
                />
                <Mail className="w-4 h-4 text-charcoal/40 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-charcoal/70 mb-1 block">PayPal Sandbox Receiver Email</label>
              <div className="relative">
                <input
                  type="email"
                  readOnly
                  value={merchant?.paypal_receiver_email || user?.email || ''}
                  className="w-full pl-9 pr-3 py-2 bg-ivory border border-warmgray rounded-xl text-xs text-charcoal select-all"
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

          <div className="pt-4 border-t border-warmgray/60 flex items-center gap-2 text-xs text-charcoal/60">
            <ShieldCheck className="w-4 h-4 text-forest" />
            <span>PayPal Sandbox Integration is configured for Orders v2 captures.</span>
          </div>
        </div>
      </div>
    </>
  );
};

