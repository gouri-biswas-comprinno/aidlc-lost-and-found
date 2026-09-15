const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const TOKEN_STORAGE_KEY = 'lost-and-found.auth-token';
const USER_STORAGE_KEY = 'lost-and-found.auth-user';

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
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

export function getStoredToken() {
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function getStoredAuth() {
  const token = getStoredToken();
  const userValue = window.localStorage.getItem(USER_STORAGE_KEY);
  if (!token || !userValue) return null;

  try {
    return { token, user: JSON.parse(userValue) };
  } catch {
    clearStoredAuth();
    return null;
  }
}

export function getAuthHeaders() {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function storeAuth(authResponse) {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, authResponse.token);
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authResponse.user));
  return authResponse;
}

export function signup(userDetails) {
  return request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userDetails)
  });
}

export async function login(credentials) {
  const authResponse = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  return storeAuth(authResponse);
}

export function logout() {
  return request('/auth/logout', {
    method: 'POST',
    headers: getAuthHeaders()
  });
}

export function clearStoredAuth() {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(USER_STORAGE_KEY);
}
