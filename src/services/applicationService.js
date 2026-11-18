import { apiConfig } from './api';

/**
 * Submit a new member registration application
 * POST /api/applications
 * @param {Object} applicationData
 */
export async function createApplicationApi(applicationData) {
  const response = await fetch(`${apiConfig.baseURL}/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(applicationData),
  });

  let data;
  try {
    data = await response.json();
  } catch (e) {
    if (response.status === 413) {
      throw new Error('Uploaded documents/photos are too large. Please upload smaller images.');
    }
    throw new Error(`Server returned ${response.status} ${response.statusText}`);
  }

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to submit application');
  }

  return data;
}

/**
 * Fetch all applications from backend MongoDB database
 * GET /api/applications
 */
export async function getApplicationsApi() {
  const response = await fetch(`${apiConfig.baseURL}/applications`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch applications from server');
  }

  return data.applications || [];
}

/**
 * Update application status via Admin Approval API
 * PATCH /api/applications/:id/status
 * @param {string} id - MongoDB document _id
 * @param {string} status - 'approved', 'rejected', or 'pending'
 */
export async function updateApplicationStatusApi(id, status = 'approved', role = null) {
  const payload = { status };
  if (role) {
    payload.role = role;
  }

  const response = await fetch(`${apiConfig.baseURL}/applications/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to update application status');
  }

  return data;
}

/**
 * Update application details via Admin Edit API
 * PUT /api/applications/:id
 * @param {string} id - MongoDB document _id or applicationId
 * @param {Object} updateData - updated application fields
 */
export async function updateApplicationApi(id, updateData) {
  const response = await fetch(`${apiConfig.baseURL}/applications/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to update application');
  }

  return data;
}

/**
 * Delete an application from backend MongoDB database
 * DELETE /api/applications/:id
 * @param {string} id - MongoDB document _id or applicationId
 */
export async function deleteApplicationApi(id) {
  const response = await fetch(`${apiConfig.baseURL}/applications/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to delete application');
  }

  return data;
}

/**
 * Fetch application document records from MongoDB
 * GET /api/applications/documents
 */
export async function getDocumentsApi() {
  const response = await fetch(`${apiConfig.baseURL}/applications/documents`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch application documents from server');
  }

  return data.documents || [];
}

/**
 * Upload statutory document files to backend server
 * POST /api/applications/upload-documents
 * @param {FormData} formDataFiles
 */
export async function uploadDocumentsApi(formDataFiles) {
  const response = await fetch(`${apiConfig.baseURL}/applications/upload-documents`, {
    method: 'POST',
    body: formDataFiles,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to upload document files');
  }

  return data.files || {};
}

/**
 * Resend login credentials email for an approved application
 * POST /api/applications/:id/resend-credentials
 * @param {string} id - MongoDB document _id or applicationId
 */
export async function resendCredentialsApi(id) {
  const response = await fetch(`${apiConfig.baseURL}/applications/${id}/resend-credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to resend credentials email');
  }

  return data;
}



