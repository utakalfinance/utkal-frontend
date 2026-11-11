import { apiConfig } from './api';
import {
  getAdminToken,
  ensureAdminToken,
  removeAdminToken,
  isAdminAuthenticated,
} from '../auth/adminAuth';

/**
 * Robust helper to obtain District Admin JWT token from candidate storage keys
 */
export function getDistrictAdminToken() {
  try {
    const candidateKeys = [
      'utkal_district_admin_token',
      'utkal_admin_token',
      'token',
      'utkal_member_token',
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
    console.error('Error retrieving district admin token:', err);
  }
  return null;
}

/**
 * Helper to get authorization headers with valid JWT Bearer token
 */
async function getAuthHeaders() {
  let token = getDistrictAdminToken();

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
 * Fetch all district admins with summary counters and filters
 * GET /api/district-admins
 */
export async function getDistrictAdminsApi(filters = {}) {
  const query = new URLSearchParams();
  if (filters.search) query.append('search', filters.search);
  if (filters.status && filters.status !== 'All') query.append('status', filters.status);
  if (filters.districtId && filters.districtId !== 'All') query.append('districtId', filters.districtId);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/district-admins${queryString}`, {
    method: 'GET',
    headers,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch district administrators');
  }

  return data;
}

/**
 * Fetch single district admin details and assigned loan metrics
 * GET /api/district-admins/:id
 */
export async function getDistrictAdminByIdApi(id) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/district-admins/${id}`, {
    method: 'GET',
    headers,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch district admin details');
  }

  return data.admin;
}

/**
 * Create a new District Admin account
 * POST /api/district-admins
 */
export async function createDistrictAdminApi(adminData) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/district-admins`, {
    method: 'POST',
    headers,
    body: JSON.stringify(adminData),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to create district administrator');
  }

  return data;
}

/**
 * Update District Admin profile details
 * PUT /api/district-admins/:id
 */
export async function updateDistrictAdminApi(id, updateData) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/district-admins/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(updateData),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to update district administrator');
  }

  return data;
}

/**
 * Reassign District Admin to a different district
 * PATCH /api/district-admins/:id/reassign-district
 */
export async function reassignDistrictApi(id, newDistrictId) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/district-admins/${id}/reassign-district`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ newDistrictId }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to reassign district administrator');
  }

  return data;
}

/**
 * Toggle District Admin account status (active / inactive)
 * PATCH /api/district-admins/:id/status
 */
export async function toggleDistrictAdminStatusApi(id, status = null) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/district-admins/${id}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to update account status');
  }

  return data;
}

/**
 * Reset District Admin password
 * POST /api/district-admins/:id/reset-password
 */
export async function resetDistrictAdminPasswordApi(id, customPassword = '') {
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/district-admins/${id}/reset-password`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ customPassword }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to reset password');
  }

  return data;
}

/**
 * Fetch loan applications assigned strictly to authenticated District Admin
 * GET /api/district-admins/assigned/loans
 */
export async function getAssignedLoanApplicationsApi(filters = {}) {
  const query = new URLSearchParams();
  if (filters.search) query.append('search', filters.search);
  if (filters.status && filters.status !== 'All') query.append('status', filters.status);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/district-admins/assigned/loans${queryString}`, {
    method: 'GET',
    headers,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch assigned loan applications');
  }

  return data;
}

/**
 * Fetch assigned loan application details by ID
 * GET /api/district-admins/assigned/loans/:id
 */
export async function getAssignedLoanApplicationByIdApi(id) {
  if (!id || id === 'undefined' || id === 'null') {
    throw new Error('A valid loan application ID is required');
  }
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/district-admins/assigned/loans/${id}`, {
    method: 'GET',
    headers,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch loan application details');
  }

  return data.loan || data;
}

/**
 * Verify or forward loan application by District Admin
 * POST /api/district-admins/assigned/loans/:id/verify
 */
export async function verifyLoanApplicationApi(id, action, remarks) {
  if (!id || id === 'undefined' || id === 'null') {
    throw new Error('A valid loan application ID is required');
  }
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/district-admins/assigned/loans/${id}/verify`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ id, applicationId: id, action, remarks }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to record verification action');
  }

  return data;
}

/**
 * Get District Admin Dashboard summary metrics
 * GET /api/district-admins/assigned/summary
 */
export async function getDistrictDashboardSummaryApi() {
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/district-admins/assigned/summary`, {
    method: 'GET',
    headers,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch district dashboard summary');
  }

  return data;
}

/**
 * Verify individual document item
 * PATCH /api/district-admins/assigned/loans/:id/documents/:docId
 */
export async function verifyDocumentItemApi(id, docId, verificationStatus, remarks = '') {
  if (!id || id === 'undefined' || id === 'null') {
    throw new Error('A valid loan application ID is required');
  }
  if (!docId || docId === 'undefined' || docId === 'null') {
    throw new Error('A valid document ID is required');
  }
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${apiConfig.baseURL}/district-admins/assigned/loans/${id}/documents/${docId}`,
    {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ id, applicationId: id, verificationStatus, remarks }),
    }
  );

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to verify document item');
  }

  return data;
}

/**
 * Verify customer details
 * POST /api/district-admins/assigned/loans/:id/customer-verify
 */
export async function verifyCustomerDetailsApi(id, action, remarks = '', rejectionReason = '') {
  if (!id || id === 'undefined' || id === 'null') {
    throw new Error('A valid loan application ID is required');
  }
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${apiConfig.baseURL}/district-admins/assigned/loans/${id}/customer-verify`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ id, applicationId: id, action, remarks, rejectionReason }),
    }
  );

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to verify customer details');
  }

  return data;
}

/**
 * Record application decision (verify & forward / reject / hold)
 * POST /api/district-admins/assigned/loans/:id/decision
 */
export async function recordApplicationDecisionApi(id, decision, remarks = '') {
  if (!id || id === 'undefined' || id === 'null') {
    throw new Error('A valid loan application ID is required to record a decision');
  }
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${apiConfig.baseURL}/district-admins/assigned/loans/${id}/decision`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ id, applicationId: id, decision, remarks }),
    }
  );

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to record decision');
  }

  return data;
}

/**
 * Get comprehensive district loan reports
 * GET /api/district-admins/assigned/reports
 */
export async function getDistrictLoanReportsApi(filters = {}) {
  const query = new URLSearchParams();
  if (filters.startDate) query.append('startDate', filters.startDate);
  if (filters.endDate) query.append('endDate', filters.endDate);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/district-admins/assigned/reports${queryString}`, {
    method: 'GET',
    headers,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch district loan reports');
  }

  return data;
}

/**
 * Get district notifications
 * GET /api/district-admins/assigned/notifications
 */
export async function getDistrictNotificationsApi() {
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/district-admins/assigned/notifications`, {
    method: 'GET',
    headers,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch notifications');
  }

  return data;
}

/**
 * Get logged-in District Admin profile
 * GET /api/district-admins/me/profile
 */
export async function getDistrictAdminProfileApi() {
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/district-admins/me/profile`, {
    method: 'GET',
    headers,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch admin profile');
  }

  return data.profile;
}

/**
 * Update District Admin profile
 * PUT /api/district-admins/me/profile
 */
export async function updateDistrictAdminProfileApi(profileData) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/district-admins/me/profile`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(profileData),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to update admin profile');
  }

  return data;
}

/**
 * ============================================================================
 * DISTRICT PARTNER APIS (FINAL CLIENT HANDOVER SPECIFICATION)
 * ============================================================================
 */

/**
 * Get District Partner Dashboard summary & charts
 * GET /api/district-admins/assigned/partner-summary
 */
export async function getPartnerDashboardSummaryApi() {
  const headers = await getAuthHeaders();
  const response = await fetch(`${apiConfig.baseURL}/district-admins/assigned/partner-summary`, {
    method: 'GET',
    headers,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch partner dashboard summary');
  }

  return data;
}

/**
 * Get District Associates with Search & Filters
 * GET /api/district-admins/assigned/associates
 */
export async function getDistrictAssociatesApi(filters = {}) {
  const query = new URLSearchParams();
  if (filters.search) query.append('search', filters.search);
  if (filters.status && filters.status !== 'All') query.append('status', filters.status);
  if (filters.page) query.append('page', filters.page);
  if (filters.limit) query.append('limit', filters.limit);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/district-admins/assigned/associates${queryString}`, {
    method: 'GET',
    headers,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch district associates');
  }

  return data;
}

/**
 * Get single Associate Member details & performance
 * GET /api/district-admins/assigned/associates/:id
 */
export async function getDistrictAssociateByIdApi(id) {
  if (!id) throw new Error('A valid Associate ID is required');
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/district-admins/assigned/associates/${id}`, {
    method: 'GET',
    headers,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch associate details');
  }

  return data;
}

/**
 * Update Associate membership status (active, pending, suspended)
 * PATCH /api/district-admins/assigned/associates/:id/status
 */
export async function updateAssociateStatusApi(id, status, remarks = '') {
  if (!id) throw new Error('A valid Associate ID is required');
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/district-admins/assigned/associates/${id}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status, remarks }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to update associate status');
  }

  return data;
}

/**
 * Get District Referrals with Statistics & Filters
 * GET /api/district-admins/assigned/referrals
 */
export async function getDistrictReferralsApi(filters = {}) {
  const query = new URLSearchParams();
  if (filters.search) query.append('search', filters.search);
  if (filters.status && filters.status !== 'All') query.append('status', filters.status);
  if (filters.type && filters.type !== 'All') query.append('type', filters.type);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/district-admins/assigned/referrals${queryString}`, {
    method: 'GET',
    headers,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch district referrals');
  }

  return data;
}

/**
 * Create a new Referral in District
 * POST /api/district-admins/assigned/referrals
 */
export async function createDistrictReferralApi(referralData) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/district-admins/assigned/referrals`, {
    method: 'POST',
    headers,
    body: JSON.stringify(referralData),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to create referral');
  }

  return data;
}

/**
 * Update Referral Status
 * PATCH /api/district-admins/assigned/referrals/:id/status
 */
export async function updateDistrictReferralStatusApi(id, status, notes = '') {
  if (!id) throw new Error('A valid Referral ID is required');
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/district-admins/assigned/referrals/${id}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status, notes }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to update referral status');
  }

  return data;
}

/**
 * Get District Financial Records (Own Membership, Associate Payments, Transactions, Commissions, Payouts)
 * GET /api/district-admins/assigned/financial-records
 */
export async function getDistrictFinancialRecordsApi() {
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/district-admins/assigned/financial-records`, {
    method: 'GET',
    headers,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch financial records');
  }

  return data;
}

/**
 * Get District Commissions Summary & Ledgers
 * GET /api/district-admins/assigned/commissions
 */
export async function getDistrictCommissionsApi() {
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/district-admins/assigned/commissions`, {
    method: 'GET',
    headers,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch commissions');
  }

  return data;
}

/**
 * Get District Partner Reports
 * GET /api/district-admins/assigned/partner-reports
 */
export async function getDistrictPartnerReportsApi(filters = {}) {
  const query = new URLSearchParams();
  if (filters.period) query.append('period', filters.period);
  if (filters.category) query.append('category', filters.category);
  if (filters.startDate) query.append('startDate', filters.startDate);
  if (filters.endDate) query.append('endDate', filters.endDate);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/district-admins/assigned/partner-reports${queryString}`, {
    method: 'GET',
    headers,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch partner reports');
  }

  return data;
}
