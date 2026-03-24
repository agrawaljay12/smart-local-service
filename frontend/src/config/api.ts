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
   * Home / Welcome
   * GET /otp/
   * 
   * Response Success (200):
   * {
   *   message: "Welcome to the OTP Management API"
   * }
   */
  home: `${API_BASE_URL}/otp/`,

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
   * Note: OTP is automatically deleted after successful verification
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
   * Home / Welcome
   * GET /users/
   * 
   * Response Success (200):
   * {
   *   message: "Welcome to the User Management API"
   * }
   */
  home: `${API_BASE_URL}/users/`,

  /**
   * Create User (Registration)
   * POST /users/create
   * 
   * Request Payload:
   * {
   *   name: string (letters and spaces only),
   *   email: string (valid email format),
   *   password: string (must match password requirements),
   *   phone_no: string (format: +countrycode + 7-14 digits, e.g., +919876543210),
   *   address: string (format: "street/building, city, state, country, postal_code")
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
   * Example phone: "+919876543210"
   * Example address: "123 Main St, New York, NY, USA, 100001"
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
   *   - "Invalid phone number format" (must be +countrycode + 7-14 digits)
   *   - "Invalid address format" (must match: street, city, state, country, postal_code)
   *   - "User with this email already exists"
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
   *   message: "Login Successful",
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
   * Get All Users
   * GET /users/fetch/all
   * 
   * Authentication: Required (Admin role)
   * Header: Authorization: Bearer <access_token>
   * 
   * Response Success (200):
   * {
   *   message: "Users retrieved successfully",
   *   data: [
   *     {
   *       _id: string,
   *       name: string,
   *       email: string,
   *       phone_no: string,
   *       address: string,
   *       status: string,
   *       role: string,
   *       created_at: datetime
   *     },
   *     ...
   *   ]
   * }
   * 
   * Response Error:
   * - 401: Unauthorized (token missing or invalid)
   * - 403: Forbidden (insufficient permissions, requires admin role)
   * - 500: Server error
   */
  fetchAll: `${API_BASE_URL}/users/fetch/all`,

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
  fetch_user_by_id: `${API_BASE_URL}/users/fetch/{user_id}`,
  change_password: `${API_BASE_URL}/users/change_password/{user_id}`,
  edit_user: `${API_BASE_URL}/users/edit/{user_id}`,
  delete_user_by_id:`${API_BASE_URL}/users/delete/{user_id}`,
  fetch_all_provider:`${API_BASE_URL}/users/fetch/all/provider`

  /*

    METHOD:PUT,
    URL: `${API_BASE_URL}/users/change_password/{user_id}`
    BODY:{
      old_password:,
      new_password,
      confirm_password
    }
  */ 
};

/**
 * AUTHENTICATION FLOW GUIDE
 * =========================
 * 
 * SIGN UP FLOW:
 * 1. User fills: Name, Email, Password, Confirm Password, Phone Number, Address
 * 2. Frontend validates locally
 * 3. Call POST /users/create with { name, email, password, phone_no, address }
 * 4. Phone format: +countrycode + 7-14 digits (e.g., +919876543210)
 * 5. Address format: "street/building, city, state, country, postal_code"
 * 6. On success → Ask for OTP verification
 * 7. Call POST /otp/generate with { email }
 * 8. User enters 6-digit OTP
 * 9. Call POST /otp/verify with { email, otp }
 * 10. On success → Redirect to Sign In page
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
 * 
 * GET ALL USERS (Admin only):
 * 1. Requires admin role
 * 2. Call GET /users/fetch/all with Authorization header
 * 3. Header: Authorization: Bearer <access_token>
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

  // Phone number pattern: +countrycode + 7-14 digits
  // Example: +919876543210
  PHONE: /^\+\d{1,3}\d{7,14}$/,

  // Address pattern: street, city, state, country, postal_code
  // Example: "123 Main St, New York, NY, USA, 100001"
  ADDRESS: /^[A-Za-z0-9\/\-\,\s]+,\s[A-Za-z\s]+,\s[A-Za-z\s]+,\s[A-Za-z\s]+,\s\d{6}$/,

  // OTP: Exactly 6 digits
  OTP: /^\d{6}$/,
};

/**
 * ERROR MESSAGES
 * ==============
 * Backend error messages and their meanings
 */
export const BACKEND_ERRORS = {
  // User Errors
  USER_CREATED_SUCCESS: "User created successfully",
  USER_ALREADY_EXISTS: "User with this email already exists",
  USER_NOT_FOUND: "User not found",
  INVALID_PASSWORD: "Invalid password",
  LOGIN_SUCCESS: "Login Successful",
  
  // Validation Errors
  REQUIRED_FIELDS_MISSING: "Required fields are missing",
  INVALID_NAME_FORMAT: "Invalid name format",
  INVALID_EMAIL_FORMAT: "Invalid email format",
  INVALID_PASSWORD_FORMAT: "Invalid password format",
  INVALID_PHONE_FORMAT: "Invalid phone number format",
  INVALID_ADDRESS_FORMAT: "Invalid address format",

  // Auth Errors
  UNAUTHORIZED: "Unauthorized access",
  TOKEN_EXPIRED: "Token has expired",

  // OTP Errors
  INVALID_OTP: "Invalid OTP",
  OTP_EXPIRED: "OTP has expired",
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
