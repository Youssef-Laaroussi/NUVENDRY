import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  GraduationCap,
  Store,
} from 'lucide-react';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const initialRole = searchParams.get('role') === 'instructor' ? 'instructor' : 'learner';
  const referralCodeFromUrl = searchParams.get('ref') || '';
  const redirectParam = searchParams.get('redirect') || '';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'learner' | 'instructor'>(initialRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (fullName.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await api.register({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        role,
        referral_code: referralCodeFromUrl.trim() || undefined,
      });
      login(data.access_token, data);
      if (redirectParam.startsWith('/') && !redirectParam.startsWith('//')) {
        navigate(redirectParam);
      } else if (data.role === 'instructor') {
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
    <div className="w-full flex flex-col items-center">
      {/* Editorial Page Heading */}
      <div className="text-center">
        <h1 className="font-serif font-medium text-[36px] sm:text-[42px] text-[#0E1E1B] tracking-[-0.015em] leading-[1.12]">
          Create Your Account
        </h1>
        <div className="w-14 h-[2.5px] rounded-full bg-[#197B4F] mx-auto my-3.5" />
        <p className="text-[14.5px] text-[#4A5550] font-normal">Get started in seconds</p>
      </div>

      {/* Elevated Ivory Auth Card */}
      <div className="mt-7 w-full max-w-[420px] bg-[#FCFCFA] rounded-[24px] border border-[#ECEFEA] px-7 py-7 sm:px-8 sm:py-8 shadow-[0_20px_50px_rgba(15,40,28,0.06),0_4px_14px_rgba(15,40,28,0.025)]">
        {error && (
          <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name */}
          <div className="relative flex items-center">
            <User className="w-[18px] h-[18px] text-[#374151] stroke-[1.75] absolute left-4 pointer-events-none" />
            <input
              type="text"
              required
              autoComplete="name"
              aria-label="Full name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Full name"
              className="w-full h-[48px] pl-11 pr-4 rounded-[12px] bg-[#FBFBF9] border border-[#DFDFE0] text-[14px] text-[#111827] placeholder-[#78827E] transition-all focus:outline-hidden focus:bg-white focus:border-[#166544] focus:ring-3 focus:ring-[#166544]/10"
            />
          </div>

          {/* Email Address */}
          <div className="relative flex items-center">
            <Mail className="w-[18px] h-[18px] text-[#374151] stroke-[1.75] absolute left-4 pointer-events-none" />
            <input
              type="email"
              required
              autoComplete="email"
              aria-label="Email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Email address"
              className="w-full h-[48px] pl-11 pr-4 rounded-[12px] bg-[#FBFBF9] border border-[#DFDFE0] text-[14px] text-[#111827] placeholder-[#78827E] transition-all focus:outline-hidden focus:bg-white focus:border-[#166544] focus:ring-3 focus:ring-[#166544]/10"
            />
          </div>

          {/* Password */}
          <div className="relative flex items-center">
            <Lock className="w-[18px] h-[18px] text-[#374151] stroke-[1.75] absolute left-4 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              aria-label="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Password"
              className="w-full h-[48px] pl-11 pr-11 rounded-[12px] bg-[#FBFBF9] border border-[#DFDFE0] text-[14px] text-[#111827] placeholder-[#78827E] transition-all focus:outline-hidden focus:bg-white focus:border-[#166544] focus:ring-3 focus:ring-[#166544]/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3.5 p-1 text-[#4B5563] hover:text-[#111827] transition-colors cursor-pointer"
            >
              {showPassword ? (
                <Eye className="w-[18px] h-[18px] stroke-[1.75]" />
              ) : (
                <EyeOff className="w-[18px] h-[18px] stroke-[1.75]" />
              )}
            </button>
          </div>

          {/* Segmented Role Selector: Learner | Instructor */}
          <div className="pt-1 pb-1">
            <div
              role="group"
              aria-label="Account role"
              className="w-full p-1 rounded-[13px] bg-[#FBFBF9] border border-[#E2E6E3] grid grid-cols-2 gap-1"
            >
              <button
                type="button"
                aria-pressed={role === 'learner'}
                onClick={() => setRole('learner')}
                className={`h-[42px] rounded-[10px] text-[13.5px] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  role === 'learner'
                    ? 'bg-[#DFEFE5] text-[#14583B] shadow-[inset_0_0_0_1px_rgba(20,88,59,0.08)]'
                    : 'bg-transparent text-[#1F2937] hover:bg-[#F2F5F3]'
                }`}
              >
                <GraduationCap className="w-[18px] h-[18px] stroke-[1.8]" />
                <span>Learner</span>
              </button>

              <button
                type="button"
                aria-pressed={role === 'instructor'}
                onClick={() => setRole('instructor')}
                className={`h-[42px] rounded-[10px] text-[13.5px] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  role === 'instructor'
                    ? 'bg-[#DFEFE5] text-[#14583B] shadow-[inset_0_0_0_1px_rgba(20,88,59,0.08)]'
                    : 'bg-transparent text-[#1F2937] hover:bg-[#F2F5F3]'
                }`}
              >
                <Store className="w-[17px] h-[17px] stroke-[1.8]" />
                <span>Instructor</span>
              </button>
            </div>
          </div>

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="nv-btn-press w-full h-[50px] rounded-[13px] bg-[#115538] hover:bg-[#0C3E28] disabled:opacity-60 text-white font-semibold text-[15px] shadow-[0_6px_18px_rgba(17,85,56,0.22)] transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#115538] focus-visible:ring-offset-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4 stroke-[2]" />
              </>
            )}
          </button>
        </form>

        {/* Bottom Switch Link */}
        <div className="mt-6 text-center text-[13.5px] text-[#374151]">
          Already have an account?{' '}
          <Link
            to={redirectParam ? `/sign-in?redirect=${encodeURIComponent(redirectParam)}` : '/sign-in'}
            className="font-bold text-[#186A47] hover:text-[#0F4930] hover:underline ml-0.5"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
