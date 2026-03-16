import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheck } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import { USER_ENDPOINTS, OTP_ENDPOINTS, VALIDATION } from "../config/api";

export function SignUp() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone_no: '',
    street: '',
    city: '',
    state: '',
    country: '',
    postal_code: ''
  });
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Step 1: Email verification - send OTP to email

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!VALIDATION.NAME.test(formData.name.trim())) {
      newErrors.name = 'Name must contain only letters and spaces';
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!VALIDATION.EMAIL.test(formData.email.trim())) {
      newErrors.email = 'Invalid email format';
    }

    // Validate password - Backend requires: Start uppercase, 8-15 chars, lowercase, digit, special char
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!VALIDATION.PASSWORD.test(formData.password)) {
      newErrors.password = 'Password must: Start with uppercase, be 8-15 chars, contain lowercase, digit, and special character (e.g., Password123!)';
    }

    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Validate phone number
    if (!formData.phone_no.trim()) {
      newErrors.phone_no = 'Phone number is required';
    } else if (!VALIDATION.PHONE.test(formData.phone_no.trim())) {
      newErrors.phone_no = 'Phone must be in format: +countrycode + 7-14 digits (e.g., +919876543210)';
    }

    // Validate address fields
    if (!formData.street.trim()) {
      newErrors.street = 'Street address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State/Province is required';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    if (!formData.postal_code.trim()) {
      newErrors.postal_code = 'Postal code is required';
    } else if (!/^\d{4,10}$/.test(formData.postal_code.trim())) {
      newErrors.postal_code = 'Postal code must be 4-10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Step 1: Create user
      const createResponse = await fetch(USER_ENDPOINTS.create, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone_no: formData.phone_no.trim(),
          address: `${formData.street.trim()}, ${formData.city.trim()}, ${formData.state.trim()}, ${formData.country.trim()}, ${formData.postal_code.trim()}`
        })
      });

      const createData = await createResponse.json();

      if (!createResponse.ok) {
        // Log the full response for debugging
        console.error('Backend error response:', createData);
        setServerError(createData.detail || JSON.stringify(createData) || 'Failed to create account');
        setLoading(false);
        return;
      }

      // Step 2: Generate OTP
      const otpResponse = await fetch(OTP_ENDPOINTS.generate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim() })
      });

      const otpData = await otpResponse.json();

      if (!otpResponse.ok) {
        setServerError(otpData.detail || 'Failed to send OTP');
        setLoading(false);
        return;
      }

      // Move to OTP step
      setStep('otp');
      setErrors({});
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const validateOTP = () => {
    if (!VALIDATION.OTP.test(otp)) {
      setErrors({ otp: 'OTP must be exactly 6 digits' });
      return false;
    }
    return true;
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validateOTP()) {
      return;
    }

    setLoading(true);
    try {
      // Verify OTP
      const verifyResponse = await fetch(OTP_ENDPOINTS.verify, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          otp: otp
        })
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        setServerError(verifyData.detail || 'Failed to verify OTP');
        setLoading(false);
        return;
      }

      // Success - show message and redirect
      alert('Account created successfully! Please sign in.');
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
        body: JSON.stringify({ email: formData.email.trim() })
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
              Create Account
            </h1>
            <p style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#aaaaaa' : '#666666' }} className="text-sm">
              Join Smart Local Services today
            </p>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div style={{ ...errorStyle, backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)' }} className="p-3 rounded-lg mb-5 text-sm">
              {serverError}
            </div>
          )}

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
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-opacity-100 transition-all"
                />
                {errors.name && <p style={errorStyle} className="mt-2 text-sm">{errors.name}</p>}
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
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-opacity-100 transition-all"
                />
                {errors.email && <p style={errorStyle} className="mt-2 text-sm">{errors.email}</p>}
              </div>

              {/* Phone Number Field */}
              <div>
                <label style={labelStyle} className="block text-sm font-semibold mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone_no}
                  onChange={(e) => {
                    setFormData({ ...formData, phone_no: e.target.value });
                    if (errors.phone_no) setErrors({ ...errors, phone_no: '' });
                  }}
                  placeholder="+919876543210"
                  style={inputStyle}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-opacity-100 transition-all"
                />
                {errors.phone_no && <p style={errorStyle} className="mt-2 text-sm">{errors.phone_no}</p>}
              </div>

              {/* Address Fields */}
              <div>
                <label style={labelStyle} className="block text-sm font-semibold mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => {
                    setFormData({ ...formData, street: e.target.value });
                    if (errors.street) setErrors({ ...errors, street: '' });
                  }}
                  placeholder="123 Main Street"
                  style={inputStyle}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-opacity-100 transition-all"
                />
                {errors.street && <p style={errorStyle} className="mt-2 text-sm">{errors.street}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle} className="block text-sm font-semibold mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => {
                      setFormData({ ...formData, city: e.target.value });
                      if (errors.city) setErrors({ ...errors, city: '' });
                    }}
                    placeholder="New York"
                    style={inputStyle}
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-opacity-100 transition-all"
                  />
                  {errors.city && <p style={errorStyle} className="mt-2 text-sm">{errors.city}</p>}
                </div>
                <div>
                  <label style={labelStyle} className="block text-sm font-semibold mb-2">
                    State/Province
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => {
                      setFormData({ ...formData, state: e.target.value });
                      if (errors.state) setErrors({ ...errors, state: '' });
                    }}
                    placeholder="NY"
                    style={inputStyle}
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-opacity-100 transition-all"
                  />
                  {errors.state && <p style={errorStyle} className="mt-2 text-sm">{errors.state}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle} className="block text-sm font-semibold mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => {
                      setFormData({ ...formData, country: e.target.value });
                      if (errors.country) setErrors({ ...errors, country: '' });
                    }}
                    placeholder="USA"
                    style={inputStyle}
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-opacity-100 transition-all"
                  />
                  {errors.country && <p style={errorStyle} className="mt-2 text-sm">{errors.country}</p>}
                </div>
                <div>
                  <label style={labelStyle} className="block text-sm font-semibold mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => {
                      setFormData({ ...formData, postal_code: e.target.value });
                      if (errors.postal_code) setErrors({ ...errors, postal_code: '' });
                    }}
                    placeholder="10001"
                    style={inputStyle}
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-opacity-100 transition-all"
                  />
                  {errors.postal_code && <p style={errorStyle} className="mt-2 text-sm">{errors.postal_code}</p>}
                </div>
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
                  placeholder="Password123!"
                  style={inputStyle}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-opacity-100 transition-all"
                />
                {errors.password && <p style={errorStyle} className="mt-2 text-sm">{errors.password}</p>}
                <p style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#888888' : '#999999' }} className="mt-2 text-xs">
                  Must: Start uppercase, 8-15 chars, have lowercase, digit, special char
                </p>
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
                  placeholder="Confirm password"
                  style={inputStyle}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-opacity-100 transition-all"
                />
                {errors.confirmPassword && <p style={errorStyle} className="mt-2 text-sm">{errors.confirmPassword}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{ fontFamily: 'var(--font-worksans)' }}
                className="w-full bg-linear-to-r from-[#0891b2] to-[#06b6d4] text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 mt-6"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              {/* Sign In Link */}
              <p style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#aaaaaa' : '#666666' }} className="text-center text-sm">
                Already have an account?{' '}
                <Link to="/auth/signin" style={{ color: '#0891b2', fontWeight: 'bold' }} className="hover:underline">
                  Sign In
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div style={successStyle} className="p-4 rounded-lg text-center">
                <FaCheck className="mx-auto mb-2" size={24} />
                <p style={{ fontFamily: 'var(--font-worksans)' }} className="font-semibold">Check Your Email</p>
                <p style={{ fontFamily: 'var(--font-worksans)', fontSize: '0.875rem' }}>We sent a 6-digit OTP to {formData.email}</p>
              </div>

              {/* OTP Field */}
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                style={{ fontFamily: 'var(--font-worksans)' }}
                className="w-full bg-linear-to-r from-[#0891b2] to-[#06b6d4] text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 mt-6"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              {/* Resend OTP Button */}
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                style={{ fontFamily: 'var(--font-worksans)', color: '#0891b2' }}
                className="w-full border-2 border-[#0891b2] py-3 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50 font-semibold"
              >
                Resend OTP
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
