import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import { USER_ENDPOINTS, VALIDATION } from "../config/api";

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function SignIn() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [serverError, setServerError] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!VALIDATION.EMAIL.test(formData.email.trim())) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(USER_ENDPOINTS.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.detail || 'Login failed');
        setLoading(false);
        return;
      }

      // Success - Store token and user data with session info
      if (data.data) {
        const { access_token, user } = data.data;
        
        // Store token
        localStorage.setItem('access_token', access_token);
        
        // Store user info
        localStorage.setItem('user', JSON.stringify(user));
        
        // Store session timestamp for timeout tracking
        localStorage.setItem('sessionStart', new Date().getTime().toString());
        localStorage.setItem('sessionTimeout', SESSION_TIMEOUT.toString());
        
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }

        // redirection based on user role
        const getRedirectPath = (role: string) => {
            switch (role) {
              case "admin":
                return "/admin";
              case "provider":
                return "/provider/dashboard";
              case "user":
                return "/user/services";
              default:
                return "/";
            }
          };
        
        const redirectPath = getRedirectPath(user.role);

        // Redirect to home after short delay
       setTimeout(() => {
            navigate(redirectPath, { replace: true });
          }, 300);
        }


    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
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

  const errorStyle = {
    color: '#ef4444',
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
              Welcome Back
            </h1>
            <p style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#aaaaaa' : '#666666' }} className="text-sm">
              Sign in to your Smart Local account
            </p>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div style={{ color: '#ef4444', backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)' }} className="p-3 rounded-lg mb-5 text-sm">
              {serverError}
            </div>
          )}

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
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-opacity-100 transition-all"
              />
              {errors.email && <p style={errorStyle} className="mt-2 text-sm">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label style={labelStyle} className="block text-sm font-semibold mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  placeholder="Your password"
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
              {errors.password && <p style={errorStyle} className="mt-2 text-sm">{errors.password}</p>}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#0891b2' }}
                  className="w-4 h-4"
                />
                <span style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#aaaaaa' : '#666666' }} className="text-sm">
                  Remember me
                </span>
              </label>
              <Link
                to="/auth/forgot-password"
                style={{ color: '#0891b2', fontFamily: 'var(--font-worksans)' }}
                className="text-sm font-semibold hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{ fontFamily: 'var(--font-worksans)' }}
              className="w-full bg-linear-to-r from-[#0891b2] to-[#06b6d4] text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 mt-6"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div style={{ backgroundColor: theme === 'dark' ? '#333333' : '#e5e5e5' }} className="flex-1 h-px"></div>
              <span style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#888888' : '#999999' }} className="text-sm">
                OR
              </span>
              <div style={{ backgroundColor: theme === 'dark' ? '#333333' : '#e5e5e5' }} className="flex-1 h-px"></div>
            </div>

            {/* Social Login Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                disabled={loading}
                style={{ backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f5f5f5', fontFamily: 'var(--font-worksans)' }}
                className="flex-1 px-4 py-2 rounded-lg border border-[#0891b2] hover:opacity-80 transition-opacity disabled:opacity-50 font-semibold text-sm"
              >
                Google
              </button>
              <button
                type="button"
                disabled={loading}
                style={{ backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f5f5f5', fontFamily: 'var(--font-worksans)' }}
                className="flex-1 px-4 py-2 rounded-lg border border-[#0891b2] hover:opacity-80 transition-opacity disabled:opacity-50 font-semibold text-sm"
              >
                GitHub
              </button>
            </div>

            {/* Sign Up Link */}
            <p style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#aaaaaa' : '#666666' }} className="text-center text-sm mt-4">
              Don't have an account?{' '}
              <Link to="/auth/signup" style={{ color: '#0891b2', fontWeight: 'bold' }} className="hover:underline">
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
