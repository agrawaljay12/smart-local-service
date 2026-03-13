import { useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaCheck } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

export function SignUp() {
  const { theme } = useTheme();
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      // Simulate API call to check email and send OTP
      setTimeout(() => {
        setLoading(false);
        setStep('otp');
      }, 1500);
    }
  };

  const validateOTP = () => {
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setErrors({ otp: 'OTP must be 6 digits' });
      return false;
    }
    return true;
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateOTP()) {
      setLoading(true);
      // Simulate API call to verify OTP and create account
      setTimeout(() => {
        setLoading(false);
        // Redirect to sign in or home
        alert('Account created successfully! Please sign in.');
      }, 1500);
    }
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
              Join Us Today
            </h1>
            <p style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#aaaaaa' : '#666666' }} className="text-sm">
              Create your Smart Local account
            </p>
          </div>

          {step === 'form' ? (
            <form onSubmit={handleSubmitForm} className="space-y-5">
              {/* Name Field */}
              <div>
                <label style={labelStyle} className="block text-sm font-semibold mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  placeholder="John Doe"
                  style={inputStyle}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                />
                {errors.name && (
                  <p style={{ color: '#ef4444', fontFamily: 'var(--font-worksans)' }} className="text-sm mt-1">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label style={labelStyle} className="block text-sm font-semibold mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
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

              {/* Password Field */}
              <div>
                <label style={labelStyle} className="block text-sm font-semibold mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  placeholder="••••••••"
                  style={inputStyle}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                />
                {errors.password && (
                  <p style={{ color: '#ef4444', fontFamily: 'var(--font-worksans)' }} className="text-sm mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label style={labelStyle} className="block text-sm font-semibold mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                  }}
                  placeholder="••••••••"
                  style={inputStyle}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                />
                {errors.confirmPassword && (
                  <p style={{ color: '#ef4444', fontFamily: 'var(--font-worksans)' }} className="text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{ fontFamily: 'var(--font-outfit)', backgroundColor: loading ? '#666666' : '#0891b2', color: '#ffffff' }}
                className="w-full px-4 py-3 font-bold rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Continue'}
              </button>

              {/* Sign In Link */}
              <p style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#aaaaaa' : '#666666' }} className="text-center text-sm">
                Already have an account?{' '}
                <Link to="/auth/signin" style={{ color: '#0891b2' }} className="font-semibold hover:underline">
                  Sign In
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="text-center mb-6">
                <p style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#aaaaaa' : '#666666' }} className="text-sm">
                  We've sent a 6-digit verification code to
                </p>
                <p style={{ fontFamily: 'var(--font-outfit)', color: '#0891b2' }} className="font-semibold mt-1">
                  {formData.email}
                </p>
              </div>

              {/* OTP Input */}
              <div>
                <label style={labelStyle} className="block text-sm font-semibold mb-2">
                  Enter OTP
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

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                style={{ fontFamily: 'var(--font-outfit)', backgroundColor: loading || otp.length !== 6 ? '#666666' : '#0891b2', color: '#ffffff' }}
                className="w-full px-4 py-3 font-bold rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Verifying...' : (
                  <>
                    <FaCheck size={16} />
                    Verify & Create Account
                  </>
                )}
              </button>

              {/* Resend OTP */}
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
                      alert('OTP resent to your email');
                    }, 1000);
                  }}
                >
                  Resend OTP
                </button>
              </p>

              {/* Back to Form */}
              <button
                type="button"
                onClick={() => setStep('form')}
                style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#aaaaaa' : '#666666' }}
                className="w-full text-sm hover:underline"
              >
                ← Back to Form
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
