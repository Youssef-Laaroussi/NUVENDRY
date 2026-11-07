import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, ShieldCheck, Key } from 'lucide-react';

export const LearnerSettings: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif text-charcoal">Account & Security</h1>
          <p className="text-xs text-charcoal/60">Manage your profile, identity, and security preferences.</p>
        </div>

        <div className="bg-white rounded-2xl border border-warmgray p-6 sm:p-8 space-y-6 shadow-xs max-w-2xl">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-charcoal/70 mb-1 block">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={user?.full_name || ''}
                  className="w-full pl-9 pr-3 py-2 bg-ivory border border-warmgray rounded-xl text-xs text-charcoal select-all"
                />
                <User className="w-4 h-4 text-charcoal/40 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-charcoal/70 mb-1 block">Email Address</label>
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
              <label className="text-xs font-medium text-charcoal/70 mb-1 block">Role</label>
              <span className="inline-block px-3 py-1 bg-mint text-forest text-xs font-semibold rounded-full capitalize">
                {user?.role}
              </span>
            </div>

            <div>
              <label className="text-xs font-medium text-charcoal/70 mb-1 block">Referral Code</label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={user?.referral_code || ''}
                  className="w-full pl-9 pr-3 py-2 bg-ivory border border-warmgray rounded-xl text-xs font-mono text-charcoal select-all"
                />
                <Key className="w-4 h-4 text-charcoal/40 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-warmgray/60 flex items-center gap-2 text-xs text-charcoal/60">
            <ShieldCheck className="w-4 h-4 text-forest" />
            <span>Encrypted with modern bcrypt and JWT authentication standards.</span>
          </div>
        </div>
      </div>
    </>
  );
};

