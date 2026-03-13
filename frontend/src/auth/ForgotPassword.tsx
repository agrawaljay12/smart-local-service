import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEye, FaEyeSlash, FaCheck } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import { OTP_ENDPOINTS, USER_ENDPOINTS, VALIDATION } from "../config/api";

export function ForgotPassword() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!VALIDATION.EMAIL.test(email.trim())) {
      newErrors.email = 'Invalid email format';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(OTP_ENDPOINTS.generate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.detail || 'Failed to send OTP');
        setLoading(false);
        return;
      }

      setStep('otp');
      setErrors({});
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    const newErrors: Record<string, string> = {};

    if (!VALIDATION.OTP.test(otp)) {
      newErrors.otp = 'OTP must be exactly 6 digits';
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(OTP_ENDPOINTS.verify, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.detail || 'Failed to verify OTP');
        setLoading(false);
        return;
      }

      setStep('password');
      setErrors({});
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    const newErrors: Record<string, string> = {};

    // Validate new password
    if (!newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (!VALIDATION.PASSWORD.test(newPassword)) {
      newErrors.newPassword = 'Password must: Start with uppercase, be 8-15 chars, contain lowercase, digit, and special character (e.g., Password123!)';
    }

    // Validate confirm password
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(USER_ENDPOINTS.forgotPassword, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: newPassword,
          confirm_password: confirmPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.detail || 'Failed to reset password');
        setLoading(false);
        return;
      }

      alert('Password reset successfully! Please sign in with your new password.');
      navigate('/auth/signin');
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setServerError('');
    setLoading(true);
    try {
      const response = await fetch(OTP_ENDPOINTS.generate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      if (!response.ok) {
        const data = await response.json();
        setServerError(data.detail || 'Failed to resend OTP');
      } else {
        alert('OTP sent successfully!');
      }
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBackStep = () => {
    if (step === 'otp') {
      setStep('email');
    } else if (step === 'password') {
      setStep('otp');
    }
    setErrors({});
    setServerError('');
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

  const errorStyle = {
    color: '#ef4444',
    fontFamily: 'var(--font-worksans)'
  };

  const successStyle = {
    backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
    color: '#10b981',
    fontFamily: 'var(--font-worksans)'
  };

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
          <div className="text-center mb-8">
            <h1 style={{ fontFamily: 'var(--font-outfit)', color: theme === 'dark' ? '#ffffff' : '#000000' }} className="text-4xl font-black mb-2">
              Reset Password
            </h1>
            <p style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#aaaaaa' : '#666666' }} className="text-sm">
              Recover your account in 3 steps
            </p>
          </div>

          {/* Progress Bar */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                style={{
                  backgroundColor:
                    step === 'email' && num === 1
                      ? '#0891b2'
                      : step === 'otp' && (num === 1 || num === 2)
                      ? '#0891b2'
                      : step === 'password'
                      ? '#0891b2'
                      : theme === 'dark'
                      ? '#333333'
                      : '#e5e5e5'
                }}
                className="flex-1 h-2 rounded-full transition-all"
              ></div>
            ))}
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div style={{ color: '#ef4444', backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)' }} className="p-3 rounded-lg mb-5 text-sm">
              {serverError}
            </div>
          )}

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
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-opacity-100 transition-all"
                />
                {errors.email && <p style={errorStyle} className="mt-2 text-sm">{errors.email}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ fontFamily: 'var(--font-worksans)' }}
                className="w-full bg-linear-to-r from-[#0891b2] to-[#06b6d4] text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 mt-6"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>

              <p style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#aaaaaa' : '#666666' }} className="text-center text-sm">
                Remember your password?{' '}
                <Link to="/auth/signin" style={{ color: '#0891b2', fontWeight: 'bold' }} className="hover:underline">
                  Sign In
                </Link>
              </p>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <form onSubmit={handleOTPSubmit} className="space-y-5">
              <div style={successStyle} className="p-4 rounded-lg text-center">
                <FaCheck className="mx-auto mb-2" size={24} />
                <p style={{ fontFamily: 'var(--font-worksans)' }} className="font-semibold">Check Your Email</p>
                <p style={{ fontFamily: 'var(--font-worksans)', fontSize: '0.875rem' }}>We sent a 6-digit OTP to {email}</p>
              </div>

              <div>
                <label style={labelStyle} className="block text-sm font-semibold mb-2">
                  Enter OTP Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(value);
                    if (errors.otp) setErrors({ ...errors, otp: '' });
                  }}
                  placeholder="000000"
                  maxLength={6}
                  style={inputStyle}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-opacity-100 text-center text-2xl tracking-widest transition-all"
                />
                {errors.otp && <p style={errorStyle} className="mt-2 text-sm">{errors.otp}</p>}
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                style={{ fontFamily: 'var(--font-worksans)' }}
                className="w-full bg-linear-to-r from-[#0891b2] to-[#06b6d4] text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 mt-6"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBackStep}
                  style={{ fontFamily: 'var(--font-worksans)', color: '#0891b2' }}
                  className="flex-1 border-2 border-[#0891b2] py-2 rounded-lg hover:opacity-80 transition-opacity font-semibold text-sm"
                >
                  Change Email
                </button>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  style={{ fontFamily: 'var(--font-worksans)', color: '#0891b2' }}
                  className="flex-1 border-2 border-[#0891b2] py-2 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50 font-semibold text-sm"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Password */}
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
                    placeholder="Password123!"
                    style={inputStyle}
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-opacity-100 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ color: '#0891b2' }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-80 transition-opacity"
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
                {errors.newPassword && <p style={errorStyle} className="mt-2 text-sm">{errors.newPassword}</p>}
                <p style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#888888' : '#999999' }} className="mt-2 text-xs">
                  Must: Start uppercase, 8-15 chars, have lowercase, digit, special char
                </p>
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
                    placeholder="Confirm password"
                    style={inputStyle}
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-opacity-100 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ color: '#0891b2' }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-80 transition-opacity"
                  >
                    {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && <p style={errorStyle} className="mt-2 text-sm">{errors.confirmPassword}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ fontFamily: 'var(--font-worksans)' }}
                className="w-full bg-linear-to-r from-[#0891b2] to-[#06b6d4] text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 mt-6"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              <button
                type="button"
                onClick={handleBackStep}
                style={{ fontFamily: 'var(--font-worksans)', color: '#0891b2' }}
                className="w-full border-2 border-[#0891b2] py-2 rounded-lg hover:opacity-80 transition-opacity font-semibold"
              >
                Back to OTP
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
