/**
 * Centralized Environment Configuration
 * 
 * All environment variable access is consolidated here to ensure:
 * - Single source of truth for runtime variables
 * - Type-safe fallback defaults
 * - Clean imports across components and services
 */

const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
// Default to localhost:5000/api in local dev, or handle clean API URL
const cleanApiUrl = rawApiUrl
  ? rawApiUrl.replace(/\/+$/, '')
  : 'http://localhost:5000/api';

// Derive server root base URL (without /api suffix)
let rawServerUrl = (import.meta.env.VITE_SERVER_URL || '').trim();
if (!rawServerUrl) {
  if (cleanApiUrl.startsWith('http://') || cleanApiUrl.startsWith('https://')) {
    rawServerUrl = cleanApiUrl.replace(/\/api\/?$/, '');
  } else {
    rawServerUrl = 'http://localhost:5000';
  }
}
const cleanServerUrl = rawServerUrl.replace(/\/+$/, '');

export const env = Object.freeze({
  /** Base URL for all REST API calls (e.g. 'http://localhost:5000/api') */
  API_BASE_URL: cleanApiUrl,

  /** Base root URL of backend server for static uploads/assets (e.g. 'http://localhost:5000') */
  SERVER_BASE_URL: cleanServerUrl,

  /** Default prototype Admin Email */
  ADMIN_EMAIL: (import.meta.env.VITE_ADMIN_EMAIL || 'admin@newutkalfinance.com').trim().toLowerCase(),

  /** Default prototype Admin Password */
  ADMIN_PASSWORD: import.meta.env.VITE_ADMIN_PASSWORD || 'Admin@123',

  /** Environment mode */
  MODE: import.meta.env.MODE || 'development',
  IS_DEV: import.meta.env.DEV ?? true,
  IS_PROD: import.meta.env.PROD ?? false,
});

/**
 * Utility helper to convert relative asset/document paths into full backend URLs
 * @param {string} pathStr - Relative or absolute path / data URI
 * @returns {string} Fully qualified URL
 */
export function getBackendAssetUrl(pathStr) {
  if (!pathStr) return '';
  let raw = pathStr;
  if (typeof pathStr === 'object') {
    raw = pathStr.url || pathStr.documentUrl || pathStr.previewUrl || pathStr.path || pathStr.filename || '';
  }
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!trimmed || trimmed === '/' || trimmed === 'null' || trimmed === 'undefined') {
    return '';
  }

  // If already absolute or base64 data URI
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    // If it points to an /uploads/documents path on the same or external server, route via API endpoint
    if (trimmed.includes('/uploads/documents/')) {
      const filename = trimmed.split('/uploads/documents/')[1];
      if (filename) {
        return `${cleanApiUrl}/applications/files/${filename}`;
      }
    }
    return trimmed;
  }

  // Route uploaded document files directly through the dedicated Express API file stream
  if (trimmed.includes('/uploads/documents/') || trimmed.startsWith('uploads/documents/')) {
    const filename = trimmed.split('documents/')[1] || trimmed.split('/').pop();
    if (filename) {
      return `${cleanApiUrl}/applications/files/${filename}`;
    }
  }

  // If it's a bare filename with an extension stored in uploads
  if (/^[a-zA-Z0-9_\-.]+\.(pdf|jpg|jpeg|png|webp|gif|svg)$/i.test(trimmed)) {
    return `${cleanApiUrl}/applications/files/${trimmed}`;
  }

  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const base = env.SERVER_BASE_URL || (cleanApiUrl.startsWith('http') ? cleanApiUrl.replace(/\/api\/?$/, '') : '');
  if (base) {
    return `${base}${cleanPath}`;
  }
  return cleanPath;
}

export const {
  API_BASE_URL,
  SERVER_BASE_URL,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  MODE,
  IS_DEV,
  IS_PROD,
} = env;

export default env;
