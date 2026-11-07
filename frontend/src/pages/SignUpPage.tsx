import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Lock, Mail, User, ArrowRight, Loader2, AlertCircle, Sparkles } from 'lucide-react';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'learner' | 'instructor'>('learner');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await api.register({
        email,
        password,
        full_name: fullName,
        role,
        referral_code: referralCode.trim() || undefined,
      });
      login(data.access_token, data);
      if (data.role === 'instructor') {
        navigate('/merchant/overview');
      } else {
        navigate('/app/overview');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md my-8">
      <div className="bg-white rounded-2xl border border-warmgray p-8 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-serif text-charcoal">Create an Account</h1>
            <p className="text-xs text-charcoal/60">Join NUVENDRY to shape demand and access live workshops.</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-charcoal/70 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-ivory border border-warmgray rounded-xl text-xs text-charcoal focus:outline-hidden focus:ring-1 focus:ring-forest"
                  placeholder="e.g. Alex Morgan"
                />
                <User className="w-4 h-4 text-charcoal/40 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal/70 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-ivory border border-warmgray rounded-xl text-xs text-charcoal focus:outline-hidden focus:ring-1 focus:ring-forest"
                  placeholder="name@example.com"
                />
                <Mail className="w-4 h-4 text-charcoal/40 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal/70 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-ivory border border-warmgray rounded-xl text-xs text-charcoal focus:outline-hidden focus:ring-1 focus:ring-forest"
                  placeholder="••••••••"
                />
                <Lock className="w-4 h-4 text-charcoal/40 absolute left-3 top-3" />
              </div>
            </div>

            {/* Role Select */}
            <div>
              <label className="block text-xs font-medium text-charcoal/70 mb-1.5">I want to join as:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('learner')}
                  className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    role === 'learner'
                      ? 'border-forest bg-mint/50 text-forest font-semibold'
                      : 'border-warmgray bg-ivory text-charcoal/70 hover:bg-warmgray'
                  }`}
                >
                  Learner / Buyer
                </button>
                <button
                  type="button"
                  onClick={() => setRole('instructor')}
                  className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    role === 'instructor'
                      ? 'border-forest bg-mint/50 text-forest font-semibold'
                      : 'border-warmgray bg-ivory text-charcoal/70 hover:bg-warmgray'
                  }`}
                >
                  Instructor / Merchant
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal/70 mb-1">Referral Code (Optional)</label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="w-full px-3 py-2 bg-ivory border border-warmgray rounded-xl text-xs text-charcoal focus:outline-hidden focus:ring-1 focus:ring-forest"
                placeholder="NV-XXXXXX"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-forest hover:bg-charcoal text-ivory text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Account</span>}
            </button>
          </form>

          <div className="text-center text-xs text-charcoal/60">
            Already have an account?{' '}
            <Link to="/sign-in" className="text-forest font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
  );
};

