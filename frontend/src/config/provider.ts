/**
 * Centralized Provider API Configuration
 * Based on backend: backend/controllers/provider_controller.py
 * Contains all provider-related backend endpoints and specifications
 */

const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

/**
 * PROVIDER ENDPOINTS
 * ==================
 * Handles provider registration, management, and authority requests
 */
export const PROVIDER_ENDPOINTS = {
  /**
   * Create Provider (Register as Provider)
   * POST /provider/create
   * 
   * Request: FormData (multipart/form-data)
   * Fields (all required):
   * - service_category_id: string (MongoDB ObjectId referencing service_category collection)
   * - location: string (provider's location/address)
   * - experience: string (years of experience or description)
   * - price: string (service price)
   * - description: string (provider description/bio)
   * - file: File (proof document - ID/certification/qualification)
   * 
   * Authentication: REQUIRED
   * - Header: Authorization: Bearer {JWT_TOKEN}
   * - Backend extracts user_id from JWT token claims (current_user["_id"])
   * - Token expires after 30 minutes of inactivity
   * 
   * Backend Processing:
   * 1. Validates service_category_id exists in database
   * 2. Extracts user_id from JWT token
   * 3. Saves uploaded file to disk
   * 4. Creates provider document with status "pending" (awaiting admin approval)
   * 5. Returns provider ID
   * 
   * Response Success (201 Created):
   * {
   *   message: "Provider created successfully",
   *   data: {
   *     id: string (MongoDB ObjectId as string - Provider ID)
   *   },
   *   status: 201
   * }
   * 
   * Response Errors:
   * - 400: Invalid data format or missing fields
   * - 401: Unauthorized - Missing/invalid/expired JWT token
   * - 404: Service category not found
   * - 500: Server error (check backend logs)
   * 
   * Status Responses:
   * - 201: Provider registration created successfully (pending approval)
   * - 401: Session expired - user needs to login again
   * - 404: Service category ID doesn't exist in database
   * - 500: Backend error (file save failed, database error, etc.)
   */
  create: `${API_BASE_URL}/provider/create`,

  /**
   * Get All Approved Providers
   * GET /provider/fetch_all/approved
   * 
   * Authentication: Not required
   * 
   * Response Success (200):
   * {
   *   message: "Providers retrieved successfully",
   *   data: [
   *     {
   *       _id: string (Provider ID)
   *       user_id: string (User ID who owns this provider)
   *       service_category_id: string (Category reference)
   *       location: string
   *       experience: string
   *       price: string
   *       description: string
   *       provider_status: "approved" (only approved providers returned)
   *       created_at: string (ISO datetime)
   *       proof_document: string (file path/URL)
   *       rating: number (if calculated)
   *     }
   *   ],
   *   status: 200
   * }
   * 
   * Response Error:
   * - 500: Server error
   * 
   * Note: Only returns providers with status "approved"
   */
  fetchAll: `${API_BASE_URL}/provider/fetch_all/approved`,

  fetch_all_pending_Provider:`${API_BASE_URL}/provider/fetch_all/pending`,

  verify_request:`${API_BASE_URL}/provider/verify/{provider_id}`
};

/**
 * Provider Status Options
 * Set by backend during approval workflow
 */
export const PROVIDER_STATUS = {
  PENDING: 'pending',      // Initial status - awaiting admin review
  APPROVED: 'approved',    // Admin approved - provider can offer services
  REJECTED: 'rejected'     // Admin rejected - provider cannot offer services
} as const;

/**
 * HTTP Status Codes Expected from Backend
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const;

/**
 * Maximum file size for proof document (in bytes)
 * Currently set to 10 MB
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Allowed file types for proof document (MIME types)
 * Validated backend-side
 */
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

/**
 * Error Messages
 */
export const PROVIDER_ERRORS = {
  SESSION_EXPIRED: 'Your session expired. Please login again.',
  CATEGORY_NOT_FOUND: 'Service category not found',
  REGISTRATION_FAILED: 'Registration failed',
  CONNECTION_ERROR: 'Connection error - check your internet connection',
  MISSING_TOKEN: 'Authentication token missing. Please login again.',
  INVALID_FILE: 'Invalid file type or size. Max 10MB allowed.',
  FORM_INCOMPLETE: 'Please fill all required fields'
} as const;

/**
 * Success Messages
 */
export const PROVIDER_SUCCESS = {
  REGISTERED: '✓ Registration submitted! Your provider account is pending approval.',
  REDIRECTING: 'Redirecting...'
} as const;
