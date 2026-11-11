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

  // If token is missing but admin session is active, try auto-acquiring from backend
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

/**
 * Handle unauthorized (401) responses by cleaning up invalid tokens
 */
function handleUnauthorizedResponse(status, message) {
  if (status === 401) {
    removeAdminToken();
    // Dispatch custom event for app-wide auth expiration listeners
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('admin:unauthorized'));
    }
    throw new Error(message || 'Not authorized: Admin session expired or invalid. Please sign in again.');
  }
}

/**
 * Submit a public loan interest enquiry
 * POST /api/loan-enquiries (Public, no auth)
 * @param {Object} enquiryData
 * @returns {Promise<Object>}
 */
export async function submitLoanEnquiryApi(enquiryData) {
  const payload = {
    fullName: (enquiryData.fullName || '').trim(),
    mobileNumber: String(enquiryData.mobileNumber || enquiryData.phone || '').replace(/\D/g, ''),
    email: (enquiryData.email || '').trim().toLowerCase(),
    ...(enquiryData.loanCategory ? { loanCategory: enquiryData.loanCategory } : {}),
  };

  const response = await fetch(`${apiConfig.baseURL}/loan-enquiries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  let data;
  try {
    data = await response.json();
  } catch (err) {
    throw new Error(`Server returned ${response.status} ${response.statusText}`);
  }

  if (!response.ok || !data.success) {
    const errorMsg =
      data.errors && Object.values(data.errors).length > 0
        ? Object.values(data.errors)[0]
        : data.message || 'Failed to submit loan enquiry';
    const err = new Error(errorMsg);
    err.errors = data.errors;
    throw err;
  }

  return data;
}

/**
 * Fetch all loan enquiries with metrics and filters
 * GET /api/loan-enquiries (Admin protected)
 * @param {Object} filters { search, status, dateFilter, startDate, endDate }
 */
export async function getLoanEnquiriesApi(filters = {}) {
  const query = new URLSearchParams();
  if (filters.search) query.append('search', filters.search);
  if (filters.status && filters.status !== 'All') query.append('status', filters.status);
  if (filters.dateFilter && filters.dateFilter !== 'All') query.append('dateFilter', filters.dateFilter);
  if (filters.startDate) query.append('startDate', filters.startDate);
  if (filters.endDate) query.append('endDate', filters.endDate);

  const queryString = query.toString() ? `?${query.toString()}` : '';

  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/loan-enquiries${queryString}`, {
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
    throw new Error(data.message || 'Failed to fetch loan enquiries');
  }

  return {
    enquiries: data.enquiries || [],
    summary: data.summary || { total: 0, new: 0, contacted: 0, membershipInformed: 0, converted: 0, closed: 0 },
    count: data.count || 0,
  };
}

/**
 * Fetch single loan enquiry by ID or enquiryId
 * GET /api/loan-enquiries/:id (Admin protected)
 * @param {string} id
 */
export async function getLoanEnquiryByIdApi(id) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/loan-enquiries/${id}`, {
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
    throw new Error(data.message || 'Failed to fetch loan enquiry details');
  }

  return data.enquiry || null;
}

/**
 * Update loan enquiry status and admin remarks
 * PATCH /api/loan-enquiries/:id/status (Admin protected)
 * @param {string} id
 * @param {Object} updatePayload { status, adminRemarks }
 */
export async function updateLoanEnquiryStatusApi(id, updatePayload) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/loan-enquiries/${id}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(updatePayload),
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
    throw new Error(data.message || 'Failed to update loan enquiry status');
  }

  return data;
}
