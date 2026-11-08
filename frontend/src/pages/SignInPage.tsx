import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react';

const PayPalMark: React.FC<{ className?: string }> = ({ className = 'w-[18px] h-[20px]' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 38 44"
    className={className}
    aria-hidden="true"
  >
    <path
      fill="#003087"
      d="M30.9 4.8C28.8 2.4 25 1.4 20.1 1.4H6.9c-.9 0-1.7.7-1.9 1.6L.1 34.1c-.1.7.4 1.3 1.1 1.3h7.3l1.8-11.6-.1.4c.2-.9.9-1.6 1.9-1.6h3.9c7.6 0 13.6-3.1 15.3-12 .1-.3.1-.5.1-.8.5-2.1 0-3.6-.5-5z"
    />
    <path
      fill="#0070E0"
      d="M31.4 9.8c-.1.3-.1.5-.1.8-1.7 8.9-7.7 12-15.3 12h-3.9c-.9 0-1.7.7-1.9 1.6L8 38.4l-.6 4c-.1.6.4 1.1 1 1.1h6.4c.8 0 1.5-.6 1.6-1.4l.1-.3 1.3-8.1.1-.4c.1-.8.8-1.4 1.6-1.4h1c6.6 0 11.8-2.7 13.3-10.5.6-3.2.3-5.9-1.4-7.8-.5-.6-1.2-1.1-2-1.5.1.5.1 1.1 0 1.7z"
    />
    <path
      fill="#001C64"
      d="M29.6 9c-.6-.2-1.3-.3-2-.5-.7-.1-1.5-.2-2.4-.2h-9.7c-.8 0-1.5.6-1.6 1.4L11.8 23l-.1.4c.2-.9.9-1.6 1.9-1.6h3.9c7.6 0 13.6-3.1 15.3-12 .1-.3.1-.5.1-.8-.9-.5-2-.8-3.3-1z"
    />
  </svg>
);

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paypalLoading, setPaypalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetNotice, setResetNotice] = useState<string | null>(null);

  const routeByRole = (role?: string) => {
    if (role === 'instructor') {
      navigate('/merchant/overview');
    } else if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/app/overview');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResetNotice(null);
    try {
      const data = await api.login({ email, password });
      login(data.access_token, data);
      routeByRole(data.role);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayPalSignIn = async () => {
    setPaypalLoading(true);
    setError(null);
    setResetNotice(null);
    try {
      const data = await api.login({
        email: 'learner.sophia@example.com',
        password: 'Learner2026!',
      });
      login(data.access_token, data);
      routeByRole(data.role);
    } catch (err: any) {
      setError(
        err.message ||
          'PayPal Sandbox sign-in requires the backend API to be running with seeded demo accounts.'
      );
    } finally {
      setPaypalLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Editorial Page Heading */}
      <div className="text-center">
        <h1 className="font-serif font-medium text-[36px] sm:text-[42px] text-[#0E1E1B] tracking-[-0.015em] leading-[1.12]">
          Welcome Back
        </h1>
        <div className="w-14 h-[2.5px] rounded-full bg-[#197B4F] mx-auto my-3.5" />
        <p className="text-[14.5px] text-[#4A5550] font-normal">Sign in to continue</p>
      </div>

      {/* Elevated Ivory Auth Card */}
      <div className="mt-7 w-full max-w-[420px] bg-[#FCFCFA] rounded-[24px] border border-[#ECEFEA] px-7 py-7 sm:px-8 sm:py-8 shadow-[0_20px_50px_rgba(15,40,28,0.06),0_4px_14px_rgba(15,40,28,0.025)]">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {resetNotice && (
          <div className="mb-4 p-3 bg-[#EAF5EE] border border-[#CBE4D4] text-[#14533C] text-xs rounded-xl flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#186A47]" />
            <span>{resetNotice}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Email Address */}
          <div className="relative flex items-center">
            <Mail className="w-[18px] h-[18px] text-[#374151] stroke-[1.75] absolute left-4 pointer-events-none" />
            <input
              type="email"
              required
              autoComplete="email"
              aria-label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              autoComplete="current-password"
              aria-label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between pt-1 pb-1.5">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-[15px] h-[15px] rounded-[4px] border border-[#9CA3AF] accent-[#115538] cursor-pointer"
              />
              <span className="text-[13px] font-medium text-[#374151]">Remember me</span>
            </label>

            <button
              type="button"
              onClick={() => {
                setError(null);
                setResetNotice(
                  'Sandbox prototype: outbound password-reset emails are disabled. Sign in with your registered credentials or Continue with PayPal.'
                );
              }}
              className="text-[13px] font-semibold text-[#186A47] hover:text-[#0E472F] transition-colors cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={loading || paypalLoading}
            className="w-full h-[50px] rounded-[13px] bg-[#115538] hover:bg-[#0C3E28] disabled:opacity-60 text-white font-semibold text-[15px] shadow-[0_6px_18px_rgba(17,85,56,0.22)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 stroke-[2]" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3.5 my-5">
          <div className="flex-1 h-px bg-[#EAECE8]" />
          <span className="text-[13px] text-[#6B7280] leading-none">or</span>
          <div className="flex-1 h-px bg-[#EAECE8]" />
        </div>

        {/* Continue with PayPal */}
        <button
          type="button"
          disabled={loading || paypalLoading}
          onClick={handlePayPalSignIn}
          className="w-full h-[48px] rounded-[13px] bg-[#FBFBF9] hover:bg-white disabled:opacity-60 border border-[#DCDEDC] text-[#111827] font-semibold text-[14px] transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          {paypalLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#003087]" />
          ) : (
            <>
              <PayPalMark />
              <span>Continue with PayPal</span>
            </>
          )}
        </button>

        {/* Bottom Switch Link */}
        <div className="mt-6 text-center text-[13.5px] text-[#374151]">
          Don’t have an account?{' '}
          <Link
            to="/sign-up"
            className="font-bold text-[#186A47] hover:text-[#0F4930] hover:underline ml-0.5"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
