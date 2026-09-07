const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export async function getReports(filters = {}) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value) searchParams.set(key, value);
  }

  const query = searchParams.toString();
  const response = await fetch(`${API_BASE_URL}/reports${query ? `?${query}` : ''}`);

  if (!response.ok) {
    let message = 'Unable to load reports.';
    try {
      const error = await response.json();
      message = error.message || message;
    } catch {
      // Use the friendly fallback when the server does not return JSON.
    }
    throw new Error(message);
  }

  return response.json();
}
