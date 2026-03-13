import { useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

export function SignIn() {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        alert('Sign in successful!');
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
              Welcome Back
            </h1>
            <p style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#aaaaaa' : '#666666' }} className="text-sm">
              Sign in to your Smart Local account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
              <div className="flex justify-between items-center mb-2">
                <label style={labelStyle} className="text-sm font-semibold">
                  Password
                </label>
                <Link
                  to="/auth/forgot-password"
                  style={{ color: '#0891b2', fontFamily: 'var(--font-worksans)' }}
                  className="text-xs hover:underline font-medium"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: '' });
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
              {errors.password && (
                <p style={{ color: '#ef4444', fontFamily: 'var(--font-worksans)' }} className="text-sm mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: '#0891b2' }}
                className="w-4 h-4 rounded cursor-pointer"
              />
              <label
                htmlFor="remember"
                style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#aaaaaa' : '#666666' }}
                className="ml-2 text-sm cursor-pointer"
              >
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{ fontFamily: 'var(--font-outfit)', backgroundColor: loading ? '#666666' : '#0891b2', color: '#ffffff' }}
              className="w-full px-4 py-3 font-bold rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            {/* Sign Up Link */}
            <p style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#aaaaaa' : '#666666' }} className="text-center text-sm">
              Don't have an account?{' '}
              <Link to="/auth/signup" style={{ color: '#0891b2' }} className="font-semibold hover:underline">
                Sign Up
              </Link>
            </p>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div style={{ backgroundColor: theme === 'dark' ? '#333333' : '#e5e5e5' }} className="flex-1 h-px"></div>
            <p style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#888888' : '#999999' }} className="text-xs">
              OR
            </p>
            <div style={{ backgroundColor: theme === 'dark' ? '#333333' : '#e5e5e5' }} className="flex-1 h-px"></div>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <button
              type="button"
              style={{
                backgroundColor: theme === 'dark' ? '#111111' : '#f5f5f5',
                color: theme === 'dark' ? '#ffffff' : '#000000',
                borderColor: theme === 'dark' ? '#333333' : '#e5e5e5',
                borderWidth: '2px',
                fontFamily: 'var(--font-worksans)'
              }}
              className="w-full px-4 py-3 font-semibold rounded-lg hover:opacity-80 transition-opacity"
            >
              Continue with Google
            </button>
            <button
              type="button"
              style={{
                backgroundColor: theme === 'dark' ? '#111111' : '#f5f5f5',
                color: theme === 'dark' ? '#ffffff' : '#000000',
                borderColor: theme === 'dark' ? '#333333' : '#e5e5e5',
                borderWidth: '2px',
                fontFamily: 'var(--font-worksans)'
              }}
              className="w-full px-4 py-3 font-semibold rounded-lg hover:opacity-80 transition-opacity"
            >
              Continue with GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
