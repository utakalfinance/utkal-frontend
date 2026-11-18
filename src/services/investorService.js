import { apiConfig } from './api';
import {
  getAdminToken,
  ensureAdminToken,
  removeAdminToken,
  isAdminAuthenticated,
} from '../auth/adminAuth';

/**
 * Get authorization headers with valid JWT Bearer token
 */
async function getAuthHeaders(isMultipart = false) {
  let token = getAdminToken();

  if (!token && isAdminAuthenticated()) {
    try {
      token = await ensureAdminToken();
    } catch (err) {
      console.warn('Unable to acquire admin token:', err);
    }
  }

  // Fallback to associate/member token if admin token is not present
  if (!token && typeof localStorage !== 'undefined') {
    token = localStorage.getItem('utkal_member_token') || localStorage.getItem('utkal_token') || '';
  }

  const headers = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }

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
 * Get Top Summary Statistics
 * GET /api/investors/stats
 */
export async function getInvestorStatsApi() {
  const headers = await getAuthHeaders();
  const response = await fetch(`${apiConfig.baseURL}/investors/stats`, {
    method: 'GET',
    headers,
  });

  const data = await response.json();
  if (response.status === 401) handleUnauthorizedResponse(401, data.message);
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch investor statistics');
  }
  return data.stats;
}

/**
 * Get Investors List with Filters & Search
 * GET /api/investors
 */
export async function getInvestorsApi(filters = {}) {
  const query = new URLSearchParams();
  if (filters.search) query.append('search', filters.search);
  if (filters.district && filters.district !== 'All') query.append('district', filters.district);
  if (filters.kycStatus && filters.kycStatus !== 'All') query.append('kycStatus', filters.kycStatus);
  if (filters.paymentStatus && filters.paymentStatus !== 'All') query.append('paymentStatus', filters.paymentStatus);
  if (filters.planStatus && filters.planStatus !== 'All') query.append('planStatus', filters.planStatus);
  if (filters.page) query.append('page', filters.page);
  if (filters.limit) query.append('limit', filters.limit);

  const qs = query.toString() ? `?${query.toString()}` : '';
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/investors${qs}`, {
    method: 'GET',
    headers,
  });

  const data = await response.json();
  if (response.status === 401) handleUnauthorizedResponse(401, data.message);
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch investors list');
  }
  return data;
}

/**
 * Get Full Investor Details
 * GET /api/investors/:id
 */
export async function getInvestorByIdApi(id) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${apiConfig.baseURL}/investors/${id}`, {
    method: 'GET',
    headers,
  });

  const data = await response.json();
  if (response.status === 401) handleUnauthorizedResponse(401, data.message);
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch investor details');
  }
  return data;
}

/**
 * Create New Investor (Multipart with file uploads)
 * POST /api/investors
 */
export async function createInvestorApi(formData) {
  const headers = await getAuthHeaders(true);
  const response = await fetch(`${apiConfig.baseURL}/investors`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();
  if (response.status === 401) handleUnauthorizedResponse(401, data.message);
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to create investor');
  }
  return data;
}

/**
 * Update Investor Details
 * PUT /api/investors/:id
 */
export async function updateInvestorApi(id, payload) {
  const isMultipart = payload instanceof FormData;
  const headers = await getAuthHeaders(isMultipart);

  const response = await fetch(`${apiConfig.baseURL}/investors/${id}`, {
    method: 'PUT',
    headers,
    body: isMultipart ? payload : JSON.stringify(payload),
  });

  const data = await response.json();
  if (response.status === 401) handleUnauthorizedResponse(401, data.message);
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to update investor');
  }
  return data;
}

/**
 * Verify / Reject KYC
 * PATCH /api/investors/:id/kyc-verify
 */
export async function verifyKycApi(id, { status, rejectionReason = '' }) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${apiConfig.baseURL}/investors/${id}/kyc-verify`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status, rejectionReason }),
  });

  const data = await response.json();
  if (response.status === 401) handleUnauthorizedResponse(401, data.message);
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to update KYC status');
  }
  return data;
}

/**
 * Record Additional Payment
 * POST /api/investors/:id/payments
 */
export async function recordPaymentApi(id, formData) {
  const headers = await getAuthHeaders(true);
  const response = await fetch(`${apiConfig.baseURL}/investors/${id}/payments`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();
  if (response.status === 401) handleUnauthorizedResponse(401, data.message);
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to record payment');
  }
  return data;
}

/**
 * Verify or Reject Payment
 * PATCH /api/investors/payments/:paymentId/verify
 */
export async function verifyPaymentApi(paymentId, { status, adminRemarks = '', rejectionReason = '' }) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${apiConfig.baseURL}/investors/payments/${paymentId}/verify`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status, adminRemarks, rejectionReason }),
  });

  const data = await response.json();
  if (response.status === 401) handleUnauthorizedResponse(401, data.message);
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to verify payment');
  }
  return data;
}

/**
 * Get Available Authorized Investment Plans
 * GET /api/investors/plans
 */
export async function getInvestmentPlansApi() {
  const headers = await getAuthHeaders();
  const response = await fetch(`${apiConfig.baseURL}/investors/plans`, {
    method: 'GET',
    headers,
  });

  const data = await response.json();
  if (response.status === 401) handleUnauthorizedResponse(401, data.message);
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch investment plans');
  }
  return data.plans;
}

/**
 * Create New Investment Plan (Admin Configuration)
 * POST /api/investors/plans
 */
export async function createInvestmentPlanApi(planData) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${apiConfig.baseURL}/investors/plans`, {
    method: 'POST',
    headers,
    body: JSON.stringify(planData),
  });

  const data = await response.json();
  if (response.status === 401) handleUnauthorizedResponse(401, data.message);
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to create investment plan');
  }
  return data.plan;
}

/**
 * Update Existing Investment Plan (Admin Configuration)
 * PUT /api/investors/plans/:id
 */
export async function updateInvestmentPlanApi(id, planData) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${apiConfig.baseURL}/investors/plans/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(planData),
  });

  const data = await response.json();
  if (response.status === 401) handleUnauthorizedResponse(401, data.message);
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to update investment plan');
  }
  return data.plan;
}

/**
 * Assign Approved Plan to Investor
 * POST /api/investors/:id/assign-plan
 */
export async function assignPlanApi(id, planPayload) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${apiConfig.baseURL}/investors/${id}/assign-plan`, {
    method: 'POST',
    headers,
    body: JSON.stringify(planPayload),
  });

  const data = await response.json();
  if (response.status === 401) handleUnauthorizedResponse(401, data.message);
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to assign plan');
  }
  return data;
}

/**
 * Activate Assigned Investment Plan
 * PATCH /api/investors/:id/activate-plan
 */
export async function activateInvestorPlanApi(id, { auditReason } = {}) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${apiConfig.baseURL}/investors/${id}/activate-plan`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ auditReason }),
  });

  const data = await response.json();
  if (response.status === 401) handleUnauthorizedResponse(401, data.message);
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to activate plan');
  }
  return data;
}

/**
 * Record Authorized Payout or Refund
 * POST /api/investors/:id/payouts
 */
export async function recordPayoutOrRefundApi(id, payload) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${apiConfig.baseURL}/investors/${id}/payouts`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (response.status === 401) handleUnauthorizedResponse(401, data.message);
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to record payout/refund');
  }
  return data;
}

/**
 * Manual Ledger Adjustment
 * POST /api/investors/:id/ledger-adjustments
 */
export async function addLedgerAdjustmentApi(id, payload) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${apiConfig.baseURL}/investors/${id}/ledger-adjustments`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (response.status === 401) handleUnauthorizedResponse(401, data.message);
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to post ledger adjustment');
  }
  return data;
}

/**
 * Send Official Investment Confirmation Email
 * POST /api/investors/:id/send-confirmation-email
 */
export async function sendConfirmationEmailApi(id) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${apiConfig.baseURL}/investors/${id}/send-confirmation-email`, {
    method: 'POST',
    headers,
  });

  const data = await response.json();
  if (response.status === 401) handleUnauthorizedResponse(401, data.message);
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to send confirmation email');
  }
  return data;
}

/**
 * Send Multi-Channel Investor Notification (Email / SMS)
 * POST /api/investors/:id/send-notification
 */
export async function sendInvestorNotificationApi(id, payload = {}) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${apiConfig.baseURL}/investors/${id}/send-notification`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (response.status === 401) handleUnauthorizedResponse(401, data.message);
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to dispatch notification');
  }
  return data;
}

/**
 * Upload Executed Agreement
 * POST /api/investors/:id/agreement
 */
export async function uploadAgreementApi(id, formData) {
  const headers = await getAuthHeaders(true);
  const response = await fetch(`${apiConfig.baseURL}/investors/${id}/agreement`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();
  if (response.status === 401) handleUnauthorizedResponse(401, data.message);
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to upload agreement');
  }
  return data;
}

/**
 * Request KYC Correction
 * PATCH /api/investors/:id/request-correction
 */
export async function requestKycCorrectionApi(id, { instructions, reason }) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${apiConfig.baseURL}/investors/${id}/request-correction`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ instructions, reason }),
  });

  const data = await response.json();
  if (response.status === 401) handleUnauthorizedResponse(401, data.message);
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to submit correction request');
  }
  return data;
}

/**
 * Reverse Confirmed Ledger Entry (Double-Entry Reversal)
 * POST /api/investors/ledger/reverse/:entryId
 */
export async function reverseLedgerEntryApi(entryId, { reason }) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${apiConfig.baseURL}/investors/ledger/reverse/${entryId}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ reason }),
  });

  const data = await response.json();
  if (response.status === 401) handleUnauthorizedResponse(401, data.message);
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to reverse ledger entry');
  }
  return data;
}

/**
 * Get All Global / Filtered Ledger Entries
 * GET /api/investors/ledger/all
 */
export async function getAllLedgerEntriesApi(filters = {}) {
  const query = new URLSearchParams();
  if (filters.investorId && filters.investorId !== 'All') query.append('investorId', filters.investorId);
  if (filters.category && filters.category !== 'All') query.append('category', filters.category);
  if (filters.type && filters.type !== 'All') query.append('type', filters.type);
  if (filters.search) query.append('search', filters.search);
  if (filters.startDate) query.append('startDate', filters.startDate);
  if (filters.endDate) query.append('endDate', filters.endDate);
  if (filters.page) query.append('page', filters.page);
  if (filters.limit) query.append('limit', filters.limit);

  const qs = query.toString() ? `?${query.toString()}` : '';
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/investors/ledger/all${qs}`, {
    method: 'GET',
    headers,
  });

  const data = await response.json();
  if (response.status === 401) handleUnauthorizedResponse(401, data.message);
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch ledger entries');
  }
  return data;
}

/**
 * Get Fund Allocation and Loan Reconciliation
 * GET /api/investors/reconciliation/funds-and-loans
 */
export async function getFundAllocationAndReconciliationApi() {
  const headers = await getAuthHeaders();
  const response = await fetch(`${apiConfig.baseURL}/investors/reconciliation/funds-and-loans`, {
    method: 'GET',
    headers,
  });

  const data = await response.json();
  if (response.status === 401) handleUnauthorizedResponse(401, data.message);
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch fund allocation and reconciliation');
  }
  return data.reconciliation;
}

/**
 * Get Financial Reports
 * GET /api/investors/reports/generate
 */
export async function getFinancialReportsApi(params = {}) {
  const query = new URLSearchParams();
  if (params.type) query.append('type', params.type);
  if (params.investorId && params.investorId !== 'All') query.append('investorId', params.investorId);
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);

  const qs = query.toString() ? `?${query.toString()}` : '';
  const headers = await getAuthHeaders();

  const response = await fetch(`${apiConfig.baseURL}/investors/reports/generate${qs}`, {
    method: 'GET',
    headers,
  });

  const data = await response.json();
  if (response.status === 401) handleUnauthorizedResponse(401, data.message);
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to generate financial report');
  }
  return data;
}

/**
 * Get All Investment Records for an Investor
 * GET /api/investors/:id/investments
 */
export async function getInvestorInvestmentsApi(id) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${apiConfig.baseURL}/investors/${id}/investments`, {
    method: 'GET',
    headers,
  });

  const data = await response.json();
  if (response.status === 401) handleUnauthorizedResponse(401, data.message);
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch investment records');
  }
  return data;
}

/**
 * Create Additional / Repeat Investment
 * POST /api/investors/:id/investments
 */
export async function createAdditionalInvestmentApi(id, formData) {
  const headers = await getAuthHeaders(true);
  const response = await fetch(`${apiConfig.baseURL}/investors/${id}/investments`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();
  if (response.status === 401) handleUnauthorizedResponse(401, data.message);
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to record additional investment');
  }
  return data;
}

/**
 * Verify Payment for a Specific Investment Record
 * PATCH /api/investors/:id/investments/:investmentRecordId/verify
 */
export async function verifyInvestmentPaymentApi(id, investmentRecordId, adminRemarks = '') {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${apiConfig.baseURL}/investors/${id}/investments/${investmentRecordId}/verify`,
    {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ adminRemarks }),
    }
  );

  const data = await response.json();
  if (response.status === 401) handleUnauthorizedResponse(401, data.message);
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to verify investment payment');
  }
  return data;
}

/**
 * Associate Member Approves Investor -> Advances to Admin Approval
 * POST /api/investors/:id/associate-approve
 */
export async function associateApproveInvestorApi(id, remarks = '') {
  const headers = await getAuthHeaders();
  const response = await fetch(`${apiConfig.baseURL}/investors/${id}/associate-approve`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ remarks }),
  });

  const data = await response.json();
  if (response.status === 401) handleUnauthorizedResponse(401, data.message);
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to approve investor');
  }
  return data;
}

/**
 * Super Admin Final Approval
 * POST /api/investors/:id/final-approve
 */
export async function finalApproveInvestorApi(id, remarks = '') {
  const headers = await getAuthHeaders();
  const response = await fetch(`${apiConfig.baseURL}/investors/${id}/final-approve`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ remarks }),
  });

  const data = await response.json();
  if (response.status === 401) handleUnauthorizedResponse(401, data.message);
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to give final approval to investor');
  }
  return data;
}

/**
 * Fetch List of Active Associate Members for assignment dropdown (Admin Only)
 * GET /api/investors/associates-list
 */
export async function getAssociatesListApi() {
  const headers = await getAuthHeaders();
  const response = await fetch(`${apiConfig.baseURL}/investors/associates-list`, {
    headers,
  });

  const data = await response.json();
  if (response.status === 401) handleUnauthorizedResponse(401, data.message);
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch associate members list');
  }
  return data.associates || [];
}


