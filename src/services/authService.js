import { apiConfig } from './api';

/**
 * Member Portal Login API
 * POST /api/auth/member-login
 * @param {Object} credentials
 * @param {string} credentials.identifier - Member ID or Email
 * @param {string} credentials.password - Password
 */
export async function memberLoginApi(credentials) {
  const response = await fetch(`${apiConfig.baseURL}/auth/member-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      identifier: credentials.identifier || credentials.email || credentials.memberId,
      password: credentials.password,
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Login failed. Please check your credentials.');
  }

  return data;
}

/**
 * Fetch currently authenticated member profile & linked application details
 * GET /api/auth/me
 * @param {string} token - JWT Token
 */
export async function getMemberProfileApi(token) {
  const authToken = token || localStorage.getItem('utkal_member_token');
  if (!authToken) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${apiConfig.baseURL}/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch member profile');
  }

  return data;
}

/**
 * Change member password
 * POST /api/auth/change-password
 * @param {Object} payload
 * @param {string} payload.currentPassword
 * @param {string} payload.newPassword
 * @param {string} [token]
 */
export async function changePasswordApi({ currentPassword, newPassword }, token) {
  const authToken = token || localStorage.getItem('utkal_member_token');
  if (!authToken) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${apiConfig.baseURL}/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      currentPassword,
      newPassword,
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to update password');
  }

  return data;
}

/**
 * Update authenticated member profile
 * PUT /api/auth/profile
 * @param {Object} profileData
 * @param {string} [token]
 */
export async function updateMemberProfileApi(profileData, token) {
  const authToken = token || localStorage.getItem('utkal_member_token');
  if (!authToken) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${apiConfig.baseURL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(profileData),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to update profile details');
  }

  return data;
}

/**
 * Legacy portal helpers
 */
export async function loginUser(credentials) {
  return memberLoginApi(credentials);
}

export async function registerUser(userData) {
  const stored = {
    id: `usr_${Date.now()}`,
    name: userData.fullName || userData.name,
    email: userData.email,
    phone: userData.phone,
    role: 'customer',
  };
  return { user: stored, token: 'mock-jwt-token' };
}

export async function getCurrentUser() {
  const stored = localStorage.getItem('utkal_member_user');
  return stored ? JSON.parse(stored) : null;
}
