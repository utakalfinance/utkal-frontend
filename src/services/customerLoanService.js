import { apiConfig } from './api';

/**
 * Get active member authentication token
 */
function getMemberToken(overrideToken) {
  return overrideToken || localStorage.getItem('utkal_member_token') || '';
}

/**
 * Fetch customer loan overview stats
 * GET /api/loan-applications/overview
 */
export async function fetchCustomerLoanOverviewApi(token) {
  const authToken = getMemberToken(token);
  const response = await fetch(`${apiConfig.baseURL}/loan-applications/overview`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch loan overview');
  }
  return data.data;
}

/**
 * Fetch client-approved available loan products and eligibility
 * GET /api/loan-applications/products
 */
export async function fetchAvailableLoanProductsApi(token) {
  const authToken = getMemberToken(token);
  const response = await fetch(`${apiConfig.baseURL}/loan-applications/products`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch loan products');
  }
  return data;
}

/**
 * Fetch dynamic loan parameters and EMI policy settings for members
 * GET /api/loan-applications/settings
 */
export async function fetchCustomerLoanSettingsApi(token) {
  const authToken = getMemberToken(token);
  const response = await fetch(`${apiConfig.baseURL}/loan-applications/settings`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch loan settings');
  }
  return data.settings;
}

/**
 * Submit loan application with uploaded documents
 * POST /api/loan-applications/apply
 */
export async function submitCustomerLoanApplicationApi(formData, token) {
  const authToken = getMemberToken(token);
  // Note: When sending FormData, do not set Content-Type header so browser sets multipart boundary
  const response = await fetch(`${apiConfig.baseURL}/loan-applications/apply`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    const error = new Error(data.message || 'Failed to submit loan application');
    error.errors = data.errors;
    throw error;
  }
  return data;
}

/**
 * Fetch all loan applications for the authenticated member
 * GET /api/loan-applications/my-applications
 */
export async function fetchCustomerLoanApplicationsApi(token) {
  const authToken = getMemberToken(token);
  const response = await fetch(`${apiConfig.baseURL}/loan-applications/my-applications`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch loan applications');
  }
  return data.applications || [];
}

/**
 * Fetch only active (approved and disbursed) loans
 * GET /api/loan-applications/my-active-loans
 */
export async function fetchCustomerActiveLoansApi(token) {
  const authToken = getMemberToken(token);
  const response = await fetch(`${apiConfig.baseURL}/loan-applications/my-active-loans`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch active loans');
  }
  return data.activeLoans || [];
}

/**
 * Fetch EMI & repayments schedule
 * GET /api/loan-applications/repayments
 */
export async function fetchCustomerRepaymentsApi(token) {
  const authToken = getMemberToken(token);
  const response = await fetch(`${apiConfig.baseURL}/loan-applications/repayments`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch repayments schedule');
  }
  return data;
}

/**
 * Record customer EMI repayment (Backend verified)
 * POST /api/loan-applications/repay
 */
export async function recordCustomerEmiRepaymentApi(payload, token) {
  const authToken = getMemberToken(token);
  const response = await fetch(`${apiConfig.baseURL}/loan-applications/repay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to process EMI repayment');
  }
  return data;
}

/**
 * Fetch customer loan payment history
 * GET /api/loan-applications/payment-history
 */
export async function fetchCustomerLoanPaymentHistoryApi(token) {
  const authToken = getMemberToken(token);
  const response = await fetch(`${apiConfig.baseURL}/loan-applications/payment-history`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch loan payment history');
  }
  return data.payments || [];
}

/**
 * Track loan application status
 * GET /api/loan-applications/track
 */
export async function fetchTrackApplicationStatusApi(token) {
  const authToken = getMemberToken(token);
  const response = await fetch(`${apiConfig.baseURL}/loan-applications/track`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to track application status');
  }
  return data;
}

/**
 * Fetch official EMI schedule
 * GET /api/loan-applications/emi-schedule
 */
export async function fetchEmiScheduleApi(token) {
  const authToken = getMemberToken(token);
  const response = await fetch(`${apiConfig.baseURL}/loan-applications/emi-schedule`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch EMI schedule');
  }
  return data;
}

/**
 * Fetch Next Loan Eligibility status
 * GET /api/loan-applications/next-eligibility
 */
export async function fetchNextLoanEligibilityApi(token) {
  const authToken = getMemberToken(token);
  const response = await fetch(`${apiConfig.baseURL}/loan-applications/next-eligibility`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch next loan eligibility');
  }
  return data;
}

