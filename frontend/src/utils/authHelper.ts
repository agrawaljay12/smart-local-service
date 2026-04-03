/**
 * Auth Helper Utilities
 * Provides utilities for token management and authorized API calls
 */

/**
 * Get the authorization header with Bearer token for JSON requests
 * @returns Object with Authorization and Content-Type headers
 */
export const getAuthHeader = (): Record<string, string> => {
  const token = sessionStorage.getItem('access_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Get the authorization header for FormData requests (multipart/form-data)
 * Do NOT set Content-Type - let browser handle it automatically with boundary
 * @returns Object with only Authorization header
 */
export const getAuthHeaderForFormData = (): Record<string, string> => {
  const token = sessionStorage.getItem('access_token');
  const headers: Record<string, string> = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Check if user is authenticated
 * @returns true if user has valid token and session
 */
export const isAuthenticated = (): boolean => {
  const token = sessionStorage.getItem('access_token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

/**
 * Get current user from localStorage
 * @returns User object or null
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  }
  return null;
};

/**
 * Check if session has expired
 * @returns true if session has timed out
 */
export const isSessionExpired = (): boolean => {
  const sessionStart = sessionStorage.getItem('sessionStart');
  const sessionTimeout = sessionStorage.getItem('sessionTimeout');
  
  if (!sessionStart || !sessionTimeout) {
    return false;
  }
  
  const startTime = parseInt(sessionStart);
  const timeout = parseInt(sessionTimeout);
  const currentTime = new Date().getTime();
  
  return (currentTime - startTime) > timeout;
};

/**
 * Clear all auth data
 */
export const clearAuthData = () => {
  sessionStorage.removeItem('access_token');
  localStorage.removeItem('user');
  localStorage.removeItem('rememberMe');
  localStorage.removeItem('sessionStart');
  localStorage.removeItem('sessionTimeout');
};

/**
 * Refresh session timestamp
 */
export const refreshSession = () => {
  sessionStorage.setItem('sessionStart', new Date().getTime().toString());
};

// Function to refresh access token using refresh token
export const refreshAccessToken = async () => {
  try {
    const refresh_token = localStorage.getItem("refresh_token");

    const res = await fetch("/refresh-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token }),
    });

    if (!res.ok) {
      throw new Error("Refresh failed");
    }

    const data = await res.json();

    sessionStorage.setItem("access_token", data.access_token);

    return data.access_token;
  } catch (error) {
    // logout if refresh fails
    sessionStorage.clear();
    window.location.href = "/auth/signin";
  }
};