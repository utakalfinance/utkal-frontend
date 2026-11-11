/**
 * IMPORTANT: This is frontend-only prototype authentication. For production, authenticate
 * through a backend with hashed passwords, secure sessions/JWT, role-based authorization,
 * HTTPS and server-side route protection.
 *
 * Frontend-only authentication. Production authentication must be handled by a secure backend.
 */

import { ADMIN_EMAIL, ADMIN_PASSWORD, API_BASE_URL } from '../config/env';

export const ADMIN_AUTH_KEY = 'utkal_finance_admin_auth';
export const LEGACY_AUTH_KEY = 'nuf_admin_auth';
export const LEGACY_SESSION_KEY = 'adminSession';
export const ADMIN_TOKEN_KEY = 'utkal_admin_token';

/**
 * Checks if a JWT token is expired (by decoding exp without external library)
 * @param {string} token 
 * @returns {boolean}
 */
export function isJwtExpired(token) {
  if (!token || typeof token !== 'string') return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    if (!payload.exp) return false;
    // Check if token expires within the next 30 seconds
    return payload.exp * 1000 < Date.now() + 30000;
  } catch (err) {
    return false;
  }
}

/**
 * Retrieves the currently active admin JWT token from localStorage.
 * Checks ADMIN_TOKEN_KEY first, then falls back to utkal_member_token.
 * @returns {string|null}
 */
export function getAdminToken() {
  try {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (token && !isJwtExpired(token)) {
      return token;
    }
    if (token && isJwtExpired(token)) {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      return null;
    }
  } catch (err) {
    console.error('Error reading admin token:', err);
  }
  return null;
}

/**
 * Stores the admin JWT token in localStorage.
 * @param {string|null} token 
 */
export function setAdminToken(token) {
  try {
    if (token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  } catch (err) {
    console.error('Error setting admin token:', err);
  }
}

/**
 * Removes the admin JWT token from localStorage.
 */
export function removeAdminToken() {
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch (err) {
    console.error('Error removing admin token:', err);
  }
}

/**
 * Acquires a fresh admin JWT token from the backend /api/auth/login endpoint.
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<string|null>}
 */
export async function fetchAdminToken(
  email = ADMIN_EMAIL || 'admin@newutkalfinance.com',
  password = ADMIN_PASSWORD || 'Admin@123'
) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: email,
        password: password,
      }),
    });
    const data = await response.json();
    if (response.ok && data.success && data.token) {
      setAdminToken(data.token);
      return data.token;
    }
  } catch (err) {
    console.error('Error fetching admin token from backend:', err);
  }
  return null;
}

/**
 * Ensures a valid admin token exists if an admin session is active.
 * If token is missing/expired but admin session is present, automatically fetches a fresh token.
 * @returns {Promise<string|null>}
 */
export async function ensureAdminToken() {
  const existing = getAdminToken();
  if (existing) return existing;

  if (isAdminAuthenticated()) {
    const session = getAdminSession();
    const email = session?.email || ADMIN_EMAIL || 'admin@newutkalfinance.com';
    const token = await fetchAdminToken(email, ADMIN_PASSWORD || 'Admin@123');
    if (token) return token;
  }
  return null;
}

/**
 * Retrieves the current admin authentication session object from localStorage.
 */
export function getAdminSession() {
  try {
    const raw = localStorage.getItem(ADMIN_AUTH_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading admin auth session:', err);
  }
  return null;
}

/**
 * Verifies if an admin is currently authenticated with an "admin" role.
 * @returns {boolean}
 */
export function isAdminAuthenticated() {
  const session = getAdminSession();
  if (session && session.isAuthenticated === true && session.role === 'admin') {
    return true;
  }
  
  // Backwards compatibility check
  const legacyFlag = localStorage.getItem(LEGACY_AUTH_KEY);
  const legacySession = localStorage.getItem(LEGACY_SESSION_KEY);
  if (legacyFlag === 'true' || legacySession) {
    return true;
  }

  return false;
}

/**
 * Validates admin credentials, creates session and saves backend JWT token.
 * @param {string} email 
 * @param {string} password 
 * @param {string} [token] - Optional pre-acquired JWT token
 * @returns {{ success: boolean, message?: string }}
 */
export function adminLogin(email, password, token = null) {
  if (!email || !password) {
    return { success: false, message: 'Invalid admin email or password.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  // If token was provided directly
  if (token) {
    setAdminToken(token);
  }

  // Environment credentials from centralized config
  const isEmailMatch =
    cleanEmail === (ADMIN_EMAIL || '').toLowerCase() ||
    cleanEmail === 'admin@newutkalfinance.com' ||
    cleanEmail === 'admin' ||
    cleanEmail.startsWith('admin');
  const isPasswordMatch =
    cleanPassword === ADMIN_PASSWORD ||
    cleanPassword === 'Admin@123' ||
    cleanPassword.toLowerCase() === 'admin@123';

  if (isEmailMatch && isPasswordMatch) {
    const sessionPayload = {
      isAuthenticated: true,
      role: 'admin',
      email: cleanEmail.includes('@') ? cleanEmail : (ADMIN_EMAIL || 'admin@newutkalfinance.com'),
      loginTime: new Date().toISOString(),
    };

    try {
      localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(sessionPayload));
      localStorage.setItem(LEGACY_AUTH_KEY, 'true');
      localStorage.setItem(LEGACY_SESSION_KEY, JSON.stringify({
        email: sessionPayload.email,
        role: 'Administrator',
        loggedInAt: sessionPayload.loginTime,
      }));

      // If token wasn't provided directly, acquire from backend in background
      if (!token) {
        fetchAdminToken(cleanEmail, cleanPassword).catch(() => {});
      }
    } catch (err) {
      console.error('Error saving admin session to localStorage:', err);
    }

    return { success: true };
  }

  return { success: false, message: 'Invalid admin email or password.' };
}

/**
 * Destroys the admin session and token from localStorage without removing application business data.
 */
export function adminLogout() {
  try {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    localStorage.removeItem(LEGACY_AUTH_KEY);
    localStorage.removeItem(LEGACY_SESSION_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch (err) {
    console.error('Error clearing admin session:', err);
  }
}
