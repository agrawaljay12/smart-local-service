import { useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaEye, FaEyeSlash, FaCheck } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

export function ForgotPassword() {
  const { theme } = useTheme();
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    // Simulate API call to send OTP
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      setErrors({});
    }, 1500);
  };

  const handleOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      newErrors.otp = 'OTP must be 6 digits';
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    // Simulate API call to verify OTP
    setTimeout(() => {
      setLoading(false);
      setStep('password');
      setErrors({});
    }, 1500);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    // Simulate API call to reset password
    setTimeout(() => {
      setLoading(false);
      alert('Password reset successfully! Please sign in with your new password.');
      // Redirect to sign in
    }, 1500);
  };

  const inputStyle = {
    backgroundColor: theme === 'dark' ? '#111111' : '#f5f5f5',
    color: theme === 'dark' ? '#ffffff' : '#000000',
    borderColor: '#0891b2'
  };

  const labelStyle = {
    color: theme === 'dark' ? '#ffffff' : '#000000',
    fontFamily: 'var(--font-outfit)'
  };

  const containerBg = {
    backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
    color: theme === 'dark' ? '#ffffff' : '#000000'
  };

  const progressBg = theme === 'dark' ? '#111111' : '#f5f5f5';

  return (
    <div style={containerBg} className="min-h-screen flex flex-col">
      {/* Back Button */}
      <Link
        to="/"
        style={{ color: '#0891b2' }}
        className="p-4 inline-flex items-center gap-2 hover:opacity-80 transition-opacity w-fit"
      >
        <FaArrowLeft size={18} />
        <span style={{ fontFamily: 'var(--font-worksans)' }} className="font-medium">Back to Home</span>
      </Link>

      {/* Form Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Progress Indicator */}
          <div className="mb-8 flex gap-2">
            {['email', 'otp', 'password'].map((s, i) => (
              <div
                key={s}
                style={{
                  backgroundColor: ['email', 'otp', 'password'].indexOf(step) >= i ? '#0891b2' : progressBg
                }}
                className="h-2 flex-1 rounded-full transition-colors duration-300"
              ></div>
            ))}
          </div>

          <div className="text-center mb-8">
            <h1 style={{ fontFamily: 'var(--font-outfit)', color: theme === 'dark' ? '#ffffff' : '#000000' }} className="text-4xl font-black mb-2">
              Reset Password
            </h1>
            <p style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#aaaaaa' : '#666666' }} className="text-sm">
              {step === 'email' && 'Enter your email to get started'}
              {step === 'otp' && 'Enter the 6-digit code sent to your email'}
              {step === 'password' && 'Create a new strong password'}
            </p>
          </div>

          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div>
                <label style={labelStyle} className="block text-sm font-semibold mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  placeholder="you@example.com"
                  style={inputStyle}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                />
                {errors.email && (
                  <p style={{ color: '#ef4444', fontFamily: 'var(--font-worksans)' }} className="text-sm mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ fontFamily: 'var(--font-outfit)', backgroundColor: loading ? '#666666' : '#0891b2', color: '#ffffff' }}
                className="w-full px-4 py-3 font-bold rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending Code...' : 'Send Reset Code'}
              </button>

              <p style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#aaaaaa' : '#666666' }} className="text-center text-sm">
                Remember your password?{' '}
                <Link to="/auth/signin" style={{ color: '#0891b2' }} className="font-semibold hover:underline">
                  Sign In
                </Link>
              </p>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <form onSubmit={handleOTPSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <p style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#aaaaaa' : '#666666' }} className="text-sm">
                  Verification code sent to
                </p>
                <p style={{ fontFamily: 'var(--font-outfit)', color: '#0891b2' }} className="font-semibold mt-1">
                  {email}
                </p>
              </div>

              <div>
                <label style={labelStyle} className="block text-sm font-semibold mb-2">
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(val);
                    if (errors.otp) setErrors({ ...errors, otp: '' });
                  }}
                  placeholder="000000"
                  maxLength={6}
                  style={inputStyle}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-center text-2xl tracking-widest font-mono"
                />
                {errors.otp && (
                  <p style={{ color: '#ef4444', fontFamily: 'var(--font-worksans)' }} className="text-sm mt-1">
                    {errors.otp}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                style={{ fontFamily: 'var(--font-outfit)', backgroundColor: loading || otp.length !== 6 ? '#666666' : '#0891b2', color: '#ffffff' }}
                className="w-full px-4 py-3 font-bold rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              <p style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#aaaaaa' : '#666666' }} className="text-center text-sm">
                Didn't receive code?{' '}
                <button
                  type="button"
                  style={{ color: '#0891b2' }}
                  className="font-semibold hover:underline focus:outline-none"
                  onClick={() => {
                    setLoading(true);
                    setTimeout(() => {
                      setLoading(false);
                      alert('Code resent to your email');
                    }, 1000);
                  }}
                >
                  Resend
                </button>
              </p>

              <button
                type="button"
                onClick={() => setStep('email')}
                style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#aaaaaa' : '#666666' }}
                className="w-full text-sm hover:underline"
              >
                ← Back to Email
              </button>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label style={labelStyle} className="block text-sm font-semibold mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errors.newPassword) setErrors({ ...errors, newPassword: '' });
                    }}
                    placeholder="••••••••"
                    style={inputStyle}
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ color: theme === 'dark' ? '#aaaaaa' : '#666666' }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-80 transition-opacity"
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p style={{ color: '#ef4444', fontFamily: 'var(--font-worksans)' }} className="text-sm mt-1">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              <div>
                <label style={labelStyle} className="block text-sm font-semibold mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                    }}
                    placeholder="••••••••"
                    style={inputStyle}
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ color: theme === 'dark' ? '#aaaaaa' : '#666666' }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-80 transition-opacity"
                  >
                    {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p style={{ color: '#ef4444', fontFamily: 'var(--font-worksans)' }} className="text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ fontFamily: 'var(--font-outfit)', backgroundColor: loading ? '#666666' : '#0891b2', color: '#ffffff' }}
                className="w-full px-4 py-3 font-bold rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Resetting...' : (
                  <>
                    <FaCheck size={16} />
                    Reset Password
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('otp')}
                style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#aaaaaa' : '#666666' }}
                className="w-full text-sm hover:underline"
              >
                ← Back to Code
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
