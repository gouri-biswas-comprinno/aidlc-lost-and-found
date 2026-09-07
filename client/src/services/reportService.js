const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!response.ok) {
    let message = 'The request could not be completed.';
    try {
      const error = await response.json();
      message = error.message || message;
    } catch {
      // Use the friendly fallback when the server does not return JSON.
    }
    throw new Error(message);
  }

  return response.status === 204 ? null : response.json();
}

export async function getReports(filters = {}) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value) searchParams.set(key, value);
  }

  const query = searchParams.toString();
  return request(`/reports${query ? `?${query}` : ''}`);
}

export function getReportById(id) {
  return request(`/reports/${id}`);
}

export function createReport(report) {
  return request('/reports', {
    method: 'POST',
    body: JSON.stringify(report)
  });
}

export function updateReport(id, report) {
  return request(`/reports/${id}`, {
    method: 'PUT',
    body: JSON.stringify(report)
  });
}
