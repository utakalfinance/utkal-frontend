import { apiConfig } from './api';

/**
 * Fetch loan overview data for authenticated member
 * GET /api/members/loan-overview
 * @param {string} token - Optional JWT token (falls back to localStorage)
 */
export async function fetchMemberLoanOverviewApi(token) {
  const authToken = token || localStorage.getItem('utkal_member_token');
  if (!authToken) {
    throw new Error('Member authentication session expired. Please sign in again.');
  }

  const response = await fetch(`${apiConfig.baseURL}/members/loan-overview`, {
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
 * Fetch available loans for authenticated member
 * GET /api/members/available-loans
 * @param {string} token - Optional JWT token (falls back to localStorage)
 */
export async function fetchAvailableLoansApi(token) {
  const authToken = token || localStorage.getItem('utkal_member_token');
  if (!authToken) {
    throw new Error('Member authentication session expired. Please sign in again.');
  }

  const response = await fetch(`${apiConfig.baseURL}/members/available-loans`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch available loans');
  }

  return data.data;
}

/**
 * Fetch real loan history for authenticated member
 * GET /api/members/loan-history
 * @param {string} token - Optional JWT token (falls back to localStorage)
 */
export async function fetchMemberLoanHistoryApi(token) {
  const authToken = token || localStorage.getItem('utkal_member_token');
  if (!authToken) {
    throw new Error('Member authentication session expired. Please sign in again.');
  }

  const response = await fetch(`${apiConfig.baseURL}/members/loan-history`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch loan history');
  }

  return data;
}

