/**
 * Centralized Category API Configuration
 * Contains all category-related backend endpoints and specifications
 */

const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

/**
 * CATEGORY ENDPOINTS
 * ===================
 * Handles service category operations (CRUD)
 */
export const CATEGORY_ENDPOINTS = {
  /**
   * Home / Welcome
   * GET /services/
   * 
   * Response Success (200):
   * {
   *   message: "Welcome to the Service Category API"
   * }
   */
  home: `${API_BASE_URL}/services/`,

  /**
   * Create Service Category
   * POST /services/create
   * 
   * Request Payload:
   * {
   *   service_name: string (required, non-empty)
   * }
   * 
   * Response Success (201):
   * {
   *   message: "Service category created successfully",
   *   data: {
   *     id: string (MongoDB ObjectId as string)
   *   }
   * }
   * 
   * Response Error:
   * - 400: Service name is required
   * - 500: Server error
   */
  create: `${API_BASE_URL}/services/create`,

  /**
   * Get All Service Categories
   * GET /services/fetch_all
   * 
   * Response Success (200):
   * {
   *   message: "Service categories retrieved successfully",
   *   data: [
   *     {
   *       _id: string (MongoDB ObjectId as string),
   *       service_name: string
   *     },
   *     ...
   *   ]
   * }
   * 
   * Response Error:
   * - 500: Server error
   */
  fetchAll: `${API_BASE_URL}/services/fetch_all`,

  fetch_by_id: `${API_BASE_URL}/services/fetch/{service_id}`,

  /**
   * Update Service Category
   * PUT /services/update/:id
   * 
   * Request Payload:
   * {
   *   service_name: string (required, non-empty)
   * }
   * 
   * Response Success (200):
   * {
   *   message: "Service category updated successfully",
   *   data: {
   *     id: string (MongoDB ObjectId as string)
   *   }
   * }
   * 
   * Response Error:
   * - 400: Service name is required
   * - 404: Service not found
   * - 500: Server error
   */
  update: `${API_BASE_URL}/services/update`,

  /**
   * Delete Service Category
   * DELETE /services/delete/:id
   * 
   * Response Success (200):
   * {
   *   message: "Service category deleted successfully",
   *   data: {
   *     id: string (MongoDB ObjectId as string)
   *   }
   * }
   * 
   * Response Error:
   * - 404: Service not found
   * - 500: Server error
   */
  delete: `${API_BASE_URL}/services/delete`,
};

/**
 * CATEGORY VALIDATION
 * ===================
 */
export const CATEGORY_VALIDATION = {
  // Service name: alphabets, numbers, spaces, and hyphens
  SERVICE_NAME: /^[a-zA-Z0-9\s\-]+$/,

  // Minimum and maximum length for service name
  MIN_LENGTH: 2,
  MAX_LENGTH: 50,
};

/**
 * CATEGORY ERROR MESSAGES
 * =======================
 */
export const CATEGORY_ERRORS = {
  SERVICE_CREATED_SUCCESS: "Service category created successfully",
  SERVICE_NAME_REQUIRED: "Service name is required",
  SERVICE_NAME_INVALID: "Service name can only contain letters, numbers, spaces, and hyphens",
  SERVICE_NAME_SHORT: "Service name must be at least 2 characters",
  SERVICE_NAME_LONG: "Service name cannot exceed 50 characters",
  CATEGORIES_FETCHED_SUCCESS: "Service categories retrieved successfully",
  FETCH_ERROR: "Failed to fetch service categories",
  CREATE_ERROR: "Failed to create service category",
};

export default {
  API_BASE_URL,
  CATEGORY_ENDPOINTS,
  CATEGORY_VALIDATION,
  CATEGORY_ERRORS,
};
