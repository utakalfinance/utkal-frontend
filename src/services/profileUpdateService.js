import { apiConfig } from './api';

/**
 * Fetch all member profile update requests
 * GET /api/profile-updates
 * @param {Object} [params]
 * @param {string} [params.status]
 * @param {string} [params.search]
 */
export async function getProfileUpdateRequestsApi(params = {}) {
  const query = new URLSearchParams();
  if (params.status && params.status !== 'all') query.append('status', params.status);
  if (params.search && params.search.trim()) query.append('search', params.search.trim());

  const response = await fetch(`${apiConfig.baseURL}/profile-updates?${query.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch profile update requests');
  }

  return data;
}

/**
 * Fetch single profile update request by ID
 * GET /api/profile-updates/:id
 */
export async function getProfileUpdateRequestByIdApi(id) {
  const response = await fetch(`${apiConfig.baseURL}/profile-updates/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch request details');
  }

  return data;
}

/**
 * Approve profile update request and apply changes
 * PATCH /api/profile-updates/:id/approve
 */
export async function approveProfileUpdateRequestApi(id, payload = {}) {
  const response = await fetch(`${apiConfig.baseURL}/profile-updates/${id}/approve`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      adminRemarks: payload.adminRemarks || 'Approved by branch administrator.',
      reviewerName: payload.reviewerName || 'Administrator',
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to approve profile update request');
  }

  return data;
}

/**
 * Reject profile update request
 * PATCH /api/profile-updates/:id/reject
 */
export async function rejectProfileUpdateRequestApi(id, payload = {}) {
  const response = await fetch(`${apiConfig.baseURL}/profile-updates/${id}/reject`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      adminRemarks: payload.adminRemarks || 'Rejected by branch administrator.',
      reviewerName: payload.reviewerName || 'Administrator',
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to reject profile update request');
  }

  return data;
}
