import { API_BASE_URL, SERVER_BASE_URL, getBackendAssetUrl } from '../config/env';

export { API_BASE_URL, SERVER_BASE_URL, getBackendAssetUrl };

export const apiConfig = {
  baseURL: API_BASE_URL,
  baseUrl: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Mock async delay helper to simulate network latency in frontend
 */
export const mockDelay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

