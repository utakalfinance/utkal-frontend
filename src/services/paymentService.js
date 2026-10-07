import { apiConfig } from './api';

/**
 * Fetch all real payments from MongoDB payments collection
 * GET /api/payments
 */
export async function getPaymentsApi() {
  const response = await fetch(`${apiConfig.baseURL}/payments`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch payments from server');
  }

  return data.payments || [];
}

/**
 * Fetch single payment by paymentId or Mongo _id
 * GET /api/payments/:id
 */
export async function getPaymentByIdApi(id) {
  const response = await fetch(`${apiConfig.baseURL}/payments/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch payment details');
  }

  return data.payment || null;
}

/**
 * Create a new payment record in MongoDB
 * POST /api/payments
 */
export async function createPaymentApi(paymentData) {
  const response = await fetch(`${apiConfig.baseURL}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to create payment record');
  }

  return data.payment;
}

/**
 * Update payment record in MongoDB
 * PATCH /api/payments/:id
 */
export async function updatePaymentApi(id, updates) {
  const response = await fetch(`${apiConfig.baseURL}/payments/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to update payment');
  }

  return data.payment;
}

/**
 * Verify payment in MongoDB
 * POST /api/payments/:id/verify
 */
export async function verifyPaymentApi(id) {
  const response = await fetch(`${apiConfig.baseURL}/payments/${id}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to verify payment');
  }

  return data.payment;
}

/**
 * Refund payment in MongoDB
 * POST /api/payments/:id/refund
 */
export async function refundPaymentApi(id) {
  const response = await fetch(`${apiConfig.baseURL}/payments/${id}/refund`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to refund payment');
  }

  return data.payment;
}
