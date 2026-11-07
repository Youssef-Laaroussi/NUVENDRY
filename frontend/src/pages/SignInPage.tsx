import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Lock, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await api.login({ email, password });
      login(data.access_token, data);
      if (data.role === 'instructor') {
        navigate('/merchant/overview');
      } else if (data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/app/overview');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="w-full max-w-md my-8">
      <div className="bg-white rounded-2xl border border-warmgray p-8 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-serif text-charcoal">Sign In to NUVENDRY</h1>
            <p className="text-xs text-charcoal/60">Access your demand requests, bookings, and studio.</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-forest hover:bg-charcoal text-ivory text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In</span>}
            </button>
          </form>

          {/* Quick Demo Logins for Hackathon Evaluators */}
          <div className="pt-4 border-t border-warmgray/60 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-charcoal/50 block text-center">
              Evaluator Quick-Fill Accounts
            </span>
            <div className="grid grid-cols-1 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setDemoCredentials('learner.sophia@example.com', 'Learner2026!')}
                className="p-1.5 rounded-lg bg-ivory hover:bg-warmgray/60 border border-warmgray/60 text-left text-charcoal/80 text-[11px] flex justify-between"
              >
                <span>Demo Learner (Sophia Chen)</span>
                <span className="font-mono text-forest">Fill</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('elena.ai@nuvendry.com', 'Instructor2026!')}
                className="p-1.5 rounded-lg bg-ivory hover:bg-warmgray/60 border border-warmgray/60 text-left text-charcoal/80 text-[11px] flex justify-between"
              >
                <span>Dr. Elena Rostova (Instructor)</span>
                <span className="font-mono text-forest">Fill</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('admin@nuvendry.com', 'Admin2026!')}
                className="p-1.5 rounded-lg bg-ivory hover:bg-warmgray/60 border border-warmgray/60 text-left text-charcoal/80 text-[11px] flex justify-between"
              >
                <span>Admin User</span>
                <span className="font-mono text-forest">Fill</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-charcoal/60">
            Don't have an account?{' '}
            <Link to="/sign-up" className="text-forest font-semibold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
  );
};

