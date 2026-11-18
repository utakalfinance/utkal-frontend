import { apiConfig } from './api';
import {
  getAdminToken,
  ensureAdminToken,
  isAdminAuthenticated,
} from '../auth/adminAuth';

/**
 * Get active Super Admin JWT token
 */
export function getSuperAdminToken() {
  try {
    const candidateKeys = [
      'utkal_admin_token',
      'admin_token',
      'token',
    ];

    for (const key of candidateKeys) {
      const val = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (val && typeof val === 'string') {
        const trimmed = val.trim();
        if (trimmed && trimmed !== 'undefined' && trimmed !== 'null' && trimmed.length > 10) {
          return trimmed;
        }
      }
    }

    const adminToken = getAdminToken();
    if (adminToken && typeof adminToken === 'string') {
      const trimmed = adminToken.trim();
      if (trimmed && trimmed !== 'undefined' && trimmed !== 'null' && trimmed.length > 10) {
        return trimmed;
      }
    }
  } catch (err) {
    console.error('Error retrieving super admin token:', err);
  }
  return null;
}

/**
 * Super Admin Auth Headers
 */
async function getAuthHeaders() {
  let token = getSuperAdminToken();

  if (!token && isAdminAuthenticated()) {
    try {
      token = await ensureAdminToken();
    } catch (err) {
      console.warn('Unable to auto-acquire super admin token:', err);
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
 * Fetch Super Admin Loan KPI metrics and recent activities
 */
export async function getSuperAdminLoanStatsApi() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${apiConfig.baseURL}/loan-applications/admin/stats`, {
    method: 'GET',
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch loan statistics');
  }
  return data;
}

/**
 * Fetch applications verified and forwarded by District Admin awaiting Super Admin final approval
 */
export async function getSuperAdminPendingApprovalsApi(params = {}) {
  const headers = await getAuthHeaders();
  const query = new URLSearchParams();

  if (params.district && params.district !== 'All') {
    query.set('district', params.district);
  }
  if (params.search) {
    query.set('search', params.search);
  }

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const res = await fetch(
    `${apiConfig.baseURL}/loan-applications/admin/pending-final-approval${queryString}`,
    {
      method: 'GET',
      headers,
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch pending final approvals');
  }
  return data;
}

/**
 * Fetch master list of all loan applications across all districts
 */
export async function getSuperAdminAllLoansApi(params = {}) {
  const headers = await getAuthHeaders();
  const query = new URLSearchParams();

  if (params.status && params.status !== 'All') {
    query.set('status', params.status);
  }
  if (params.district && params.district !== 'All') {
    query.set('district', params.district);
  }
  if (params.search) {
    query.set('search', params.search);
  }
  if (params.page) {
    query.set('page', params.page);
  }
  if (params.limit) {
    query.set('limit', params.limit);
  }

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const res = await fetch(`${apiConfig.baseURL}/loan-applications/admin/all${queryString}`, {
    method: 'GET',
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch all loan applications');
  }
  return data;
}

/**
 * Fetch loan details for Super Admin review
 */
export async function getSuperAdminLoanByIdApi(id) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${apiConfig.baseURL}/loan-applications/admin/${id}`, {
    method: 'GET',
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch loan application details');
  }
  return data.loan || data;
}

/**
 * Record Super Admin final decision (Approve / Reject / Hold)
 * @param {string} id - MongoDB ObjectId or applicationId
 * @param {object} payload - { action: 'approve'|'reject'|'hold', approvedAmount, approvedTenureMonths, interestPolicyReference, remarks, rejectionReason }
 */
export async function superAdminProcessLoanDecisionApi(id, payload) {
  const headers = await getAuthHeaders();
  const cleanId = String(id || payload.id || payload.applicationId || '').trim();

  const res = await fetch(
    `${apiConfig.baseURL}/loan-applications/admin/${cleanId}/final-approval`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...payload,
        id: cleanId,
        applicationId: cleanId,
      }),
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to record Super Admin final decision');
  }
  return data;
}

/**
 * Fetch approved loans awaiting disbursement
 */
export async function getSuperAdminPendingDisbursementsApi(params = {}) {
  const headers = await getAuthHeaders();
  const query = new URLSearchParams();

  if (params.district && params.district !== 'All') {
    query.set('district', params.district);
  }
  if (params.search) {
    query.set('search', params.search);
  }
  if (params.page) {
    query.set('page', params.page);
  }
  if (params.limit) {
    query.set('limit', params.limit);
  }

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const res = await fetch(
    `${apiConfig.baseURL}/loan-applications/admin/disbursements/pending${queryString}`,
    {
      method: 'GET',
      headers,
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch pending disbursements');
  }
  return data;
}

/**
 * Record Super Admin loan disbursement
 * @param {string} id - MongoDB ObjectId or applicationId
 * @param {object} payload - { disbursementDate, paymentMethod, transactionId, remarks }
 */
export async function superAdminDisburseLoanApi(id, payload) {
  const headers = await getAuthHeaders();
  const cleanId = String(id || payload.id || payload.applicationId || '').trim();

  const res = await fetch(
    `${apiConfig.baseURL}/loan-applications/admin/${cleanId}/disburse`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to record loan disbursement');
  }
  return data;
}

/**
 * Fetch disbursement history for Super Admin
 */
export async function getSuperAdminDisbursementHistoryApi(params = {}) {
  const headers = await getAuthHeaders();
  const query = new URLSearchParams();

  if (params.district && params.district !== 'All') {
    query.set('district', params.district);
  }
  if (params.search) {
    query.set('search', params.search);
  }
  if (params.page) {
    query.set('page', params.page);
  }
  if (params.limit) {
    query.set('limit', params.limit);
  }

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const res = await fetch(
    `${apiConfig.baseURL}/loan-applications/admin/disbursements/history${queryString}`,
    {
      method: 'GET',
      headers,
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch disbursement history');
  }
  return data;
}

/**
 * Fetch aggregated district summary counts for All District Applications
 */
export async function getSuperAdminDistrictSummaryApi() {
  const headers = await getAuthHeaders();
  const res = await fetch(
    `${apiConfig.baseURL}/loan-applications/admin/districts-summary`,
    {
      method: 'GET',
      headers,
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch district summary');
  }
  return data;
}

/**
 * Fetch EMI Collection Dashboard summary stats for Super Admin
 */
export async function getSuperAdminEmiDashboardApi() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${apiConfig.baseURL}/loan-applications/admin/emi/dashboard`, {
    method: 'GET',
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch EMI dashboard statistics');
  }
  return data;
}

/**
 * Fetch all due, upcoming, paid and overdue EMIs across all loans
 */
export async function getSuperAdminAllEmisApi(params = {}) {
  const headers = await getAuthHeaders();
  const query = new URLSearchParams();

  if (params.district && params.district !== 'All') {
    query.set('district', params.district);
  }
  if (params.status && params.status !== 'All') {
    query.set('status', params.status);
  }
  if (params.search) {
    query.set('search', params.search);
  }
  if (params.page) {
    query.set('page', params.page);
  }
  if (params.limit) {
    query.set('limit', params.limit);
  }

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const res = await fetch(
    `${apiConfig.baseURL}/loan-applications/admin/emi/installments${queryString}`,
    {
      method: 'GET',
      headers,
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch EMI installments');
  }
  return data;
}

/**
 * Record Super Admin EMI collection payment
 */
export async function superAdminCollectEmiPaymentApi(payload) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${apiConfig.baseURL}/loan-applications/admin/emi/collect`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to record EMI payment');
  }
  return data;
}

/**
 * Fetch Super Admin EMI reports & analytics
 */
export async function getSuperAdminEmiReportsApi(params = {}) {
  const headers = await getAuthHeaders();
  const query = new URLSearchParams();

  if (params.district && params.district !== 'All') {
    query.set('district', params.district);
  }
  if (params.startDate) {
    query.set('startDate', params.startDate);
  }
  if (params.endDate) {
    query.set('endDate', params.endDate);
  }
  if (params.month) {
    query.set('month', params.month);
  }

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const res = await fetch(
    `${apiConfig.baseURL}/loan-applications/admin/emi/reports${queryString}`,
    {
      method: 'GET',
      headers,
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch EMI reports');
  }
  return data;
}

/**
 * Fetch dynamic loan parameters and EMI policy settings
 */
export async function getLoanSettingsApi() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${apiConfig.baseURL}/loan-applications/admin/settings`, {
    method: 'GET',
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch loan policy settings');
  }
  return data;
}

/**
 * Update dynamic loan parameters, interest rates, and EMI policy settings
 */
export async function updateLoanSettingsApi(payload) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${apiConfig.baseURL}/loan-applications/admin/settings`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to update loan policy settings');
  }
  return data;
}
