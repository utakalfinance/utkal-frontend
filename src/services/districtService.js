import { apiConfig } from './api';
import {
  getAdminToken,
  ensureAdminToken,
  removeAdminToken,
  isAdminAuthenticated,
} from '../auth/adminAuth';

/**
 * Helper to get authorization headers with valid JWT Bearer token
 */
async function getAuthHeaders() {
  let token = getAdminToken();

  if (!token && isAdminAuthenticated()) {
    try {
      token = await ensureAdminToken();
    } catch (err) {
      console.warn('Unable to auto-acquire admin token:', err);
    }
  }

  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

function handleUnauthorizedResponse(status, message) {
  if (status === 401) {
    removeAdminToken();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('admin:unauthorized'));
    }
    throw new Error(message || 'Not authorized: Admin session expired. Please sign in again.');
  }
}

/**
 * Fetch all districts with live summary metrics and filters
 * GET /api/districts (Admin Protected)
 */
export async function getDistrictsApi(filters = {}) {
  const query = new URLSearchParams();
  if (filters.search) query.append('search', filters.search);
  if (filters.status && filters.status !== 'All') query.append('status', filters.status);
  if (filters.state && filters.state !== 'All') query.append('state', filters.state);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/districts${queryString}`, {
    method: 'GET',
    headers,
  });

  let data;
  try {
    data = await response.json();
  } catch (err) {
    throw new Error(`Server returned ${response.status} ${response.statusText}`);
  }

  if (response.status === 401) {
    handleUnauthorizedResponse(401, data.message);
  }

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch districts');
  }

  return {
    districts: data.districts || [],
    summary: data.summary || {
      totalDistricts: 0,
      activeDistricts: 0,
      inactiveDistricts: 0,
      totalDistrictAdmins: 0,
    },
    count: data.count || 0,
  };
}

/**
 * Fetch detailed district record by ID
 * GET /api/districts/:id (Admin Protected)
 */
export async function getDistrictByIdApi(id) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/districts/${id}`, {
    method: 'GET',
    headers,
  });

  let data;
  try {
    data = await response.json();
  } catch (err) {
    throw new Error(`Server returned ${response.status} ${response.statusText}`);
  }

  if (response.status === 401) {
    handleUnauthorizedResponse(401, data.message);
  }

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch district details');
  }

  return data.district || null;
}

/**
 * Create a new district
 * POST /api/districts (Super Admin Protected)
 */
export async function createDistrictApi(districtData) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/districts`, {
    method: 'POST',
    headers,
    body: JSON.stringify(districtData),
  });

  let data;
  try {
    data = await response.json();
  } catch (err) {
    throw new Error(`Server returned ${response.status} ${response.statusText}`);
  }

  if (response.status === 401) {
    handleUnauthorizedResponse(401, data.message);
  }

  if (!response.ok || !data.success) {
    const error = new Error(data.message || 'Failed to create district');
    error.errors = data.errors;
    throw error;
  }

  return data;
}

/**
 * Update an existing district
 * PUT /api/districts/:id (Super Admin Protected)
 */
export async function updateDistrictApi(id, districtData) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/districts/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(districtData),
  });

  let data;
  try {
    data = await response.json();
  } catch (err) {
    throw new Error(`Server returned ${response.status} ${response.statusText}`);
  }

  if (response.status === 401) {
    handleUnauthorizedResponse(401, data.message);
  }

  if (!response.ok || !data.success) {
    const error = new Error(data.message || 'Failed to update district');
    error.errors = data.errors;
    throw error;
  }

  return data;
}

/**
 * Activate or Deactivate district
 * PATCH /api/districts/:id/status (Super Admin Protected)
 */
export async function updateDistrictStatusApi(id, status) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/districts/${id}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status }),
  });

  let data;
  try {
    data = await response.json();
  } catch (err) {
    throw new Error(`Server returned ${response.status} ${response.statusText}`);
  }

  if (response.status === 401) {
    handleUnauthorizedResponse(401, data.message);
  }

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to update district status');
  }

  return data;
}

/**
 * Delete a district (Safe deletion)
 * DELETE /api/districts/:id (Super Admin Protected)
 */
export async function deleteDistrictApi(id) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/districts/${id}`, {
    method: 'DELETE',
    headers,
  });

  let data;
  try {
    data = await response.json();
  } catch (err) {
    throw new Error(`Server returned ${response.status} ${response.statusText}`);
  }

  if (response.status === 401) {
    handleUnauthorizedResponse(401, data.message);
  }

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to delete district');
  }

  return data;
}
