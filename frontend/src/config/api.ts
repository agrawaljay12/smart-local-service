/**
 * Centralized API Configuration
 * Contains all backend endpoints and their specifications
 */

const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

/**
 * OTP ENDPOINTS
 * ============
 * Handles OTP generation and verification for authentication flows
 */
export const OTP_ENDPOINTS = {
  /**
   * Generate OTP
   * POST /otp/generate
   * 
   * Request Payload:
   * {
   *   email: string (must be an existing user)
   * }
   * 
   * Response Success (201):
   * {
   *   status: 201,
   *   message: "OTP generated and sent to email successfully"
   * }
   * 
   * Response Error:
   * - 404: User not found
   * - 500: Server error
   */
  generate: `${API_BASE_URL}/otp/generate`,

  /**
   * Verify OTP
   * POST /otp/verify
   * 
   * Request Payload:
   * {
   *   email: string,
   *   otp: string (6 digits, numeric)
   * }
   * 
   * Response Success (200):
   * {
   *   status: 200,
   *   message: "OTP verified successfully"
   * }
   * 
   * Response Error:
   * - 400: Invalid OTP or OTP expired (10 minute expiration)
   * - 500: Server error
   * 
   * Note: OTP is deleted after successful verification
   */
  verify: `${API_BASE_URL}/otp/verify`,
};

/**
 * USER ENDPOINTS
 * ==============
 * Handles user registration, login, and password management
 */
export const USER_ENDPOINTS = {
  /**
   * Create User (Registration)
   * POST /users/create
   * 
   * Request Payload:
   * {
   *   name: string (letters and spaces only),
   *   email: string (valid email format),
   *   password: string (must match password requirements)
   * }
   * 
   * Password Requirements:
   * - Minimum 8 characters, maximum 15 characters
   * - Must start with uppercase letter
   * - Must contain at least one lowercase letter
   * - Must contain at least one numeric digit
   * - Must contain at least one special character (!@#$%^&* etc)
   * 
   * Example valid password: "Password123!"
   * 
   * Response Success (201):
   * {
   *   message: "User created successfully",
   *   data: {
   *     user_id: string
   *   }
   * }
   * 
   * Response Error:
   * - 400: Invalid format or user already exists
   *   - "Invalid name format" (must be letters and spaces)
   *   - "Invalid email format"
   *   - "Invalid password format" (doesn't meet requirements)
   *   - "User already exists"
   * - 500: Server error
   */
  create: `${API_BASE_URL}/users/create`,

  /**
   * Login User
   * POST /users/login
   * 
   * Request Payload:
   * {
   *   email: string,
   *   password: string
   * }
   * 
   * Response Success (200):
   * {
   *   message: "Login successful",
   *   data: {
   *     access_token: string (JWT token),
   *     token_type: "bearer",
   *     user: {
   *       user_id: string,
   *       email: string,
   *       name: string,
   *       role: string ("user" by default)
   *     }
   *   }
   * }
   * 
   * Response Error:
   * - 400: Required fields missing
   * - 404: User not found
   * - 401: Invalid password
   * - 500: Server error
   * 
   * Note: Store access_token in localStorage for authenticated requests
   */
  login: `${API_BASE_URL}/users/login`,

  /**
   * Forgot Password (Reset Password)
   * PUT /users/forgot-password
   * 
   * Request Payload:
   * {
   *   email: string,
   *   password: string (must match password requirements),
   *   confirm_password: string (must match password)
   * }
   * 
   * Password Requirements: Same as user creation
   * - Minimum 8 characters, maximum 15 characters
   * - Must start with uppercase letter
   * - Must contain at least one lowercase letter
   * - Must contain at least one numeric digit
   * - Must contain at least one special character
   * 
   * Response Success (200):
   * {
   *   message: "Password reset successful"
   * }
   * 
   * Response Error:
   * - 400: Invalid format or passwords don't match
   * - 404: User not found
   * - 500: Server error
   * 
   * Note: Typically called after OTP verification in forgot password flow
   */
  forgotPassword: `${API_BASE_URL}/users/forgot-password`,
};

/**
 * AUTHENTICATION FLOW GUIDE
 * =========================
 * 
 * SIGN UP FLOW:
 * 1. User fills: Name, Email, Password, Confirm Password
 * 2. Frontend validates locally
 * 3. Call POST /users/create with { name, email, password }
 * 4. On success → Ask for OTP verification
 * 5. Call POST /otp/generate with { email }
 * 6. User enters 6-digit OTP
 * 7. Call POST /otp/verify with { email, otp }
 * 8. On success → Redirect to Sign In page
 * 
 * SIGN IN FLOW:
 * 1. User fills: Email, Password
 * 2. Frontend validates locally
 * 3. Call POST /users/login with { email, password }
 * 4. On success → Store access_token, redirect to home
 * 5. Use access_token in Authorization header for future requests
 * 
 * FORGOT PASSWORD FLOW:
 * 1. User enters Email
 * 2. Call POST /otp/generate with { email }
 * 3. User enters 6-digit OTP received in email
 * 4. Call POST /otp/verify with { email, otp }
 * 5. User enters New Password and Confirm Password
 * 6. Call PUT /users/forgot-password with { email, password, confirm_password }
 * 7. On success → Redirect to Sign In page
 */

/**
 * VALIDATION PATTERNS
 * ===================
 */
export const VALIDATION = {
  // Email regex pattern used by backend
  EMAIL: /^[\w\.-]+@[\w\.-]+\.\w+$/,

  // Name pattern: letters and spaces only
  NAME: /^[a-zA-Z\s]+$/,

  // Password pattern: Must follow backend requirements
  // - Starts with uppercase
  // - 8-15 characters total
  // - Contains lowercase, uppercase, digit, and special character
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Z][A-Za-z\d\W_]{7,15}$/,

  // OTP: Exactly 6 digits
  OTP: /^\d{6}$/,
};

/**
 * ERROR MESSAGES
 * ==============
 * Backend error messages and their meanings
 */
export const BACKEND_ERRORS = {
  // OTP Errors
  USER_NOT_FOUND: "User not found",
  INVALID_OTP: "Invalid OTP",
  OTP_EXPIRED: "OTP has expired",

  // User Errors
  REQUIRED_FIELDS_MISSING: "Required fields missing",
  INVALID_NAME_FORMAT: "Invalid name format (letters and spaces only)",
  INVALID_EMAIL_FORMAT: "Invalid email format",
  INVALID_PASSWORD_FORMAT: "Password must: Start with uppercase, be 8-15 chars, contain lowercase, digit, and special character",
  USER_ALREADY_EXISTS: "User already exists",
  INVALID_PASSWORD: "Invalid password",
};

/**
 * AXIOS CONFIG
 * ============
 * Helper to make authenticated API requests
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export default {
  API_BASE_URL,
  OTP_ENDPOINTS,
  USER_ENDPOINTS,
  VALIDATION,
  BACKEND_ERRORS,
  getAuthHeaders,
};
