const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'development' ? 'http://localhost:4000/api' : '/api');

function getToken() {
  return localStorage.getItem('ttm_token');
}

function getCurrentUser() {
  const userJson = localStorage.getItem('ttm_user');
  return userJson ? JSON.parse(userJson) : null;
}

function saveSession(token, user) {
  localStorage.setItem('ttm_token', token);
  localStorage.setItem('ttm_user', JSON.stringify(user));
}

function logout() {
  localStorage.removeItem('ttm_token');
  localStorage.removeItem('ttm_user');
}

async function apiRequest(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await response.json();
  if (!response.ok) {
    throw data;
  }
  return data;
}

async function login(email, password) {
  return apiRequest('/auth/login', { method: 'POST', body: { email, password } });
}

async function signup(name, email, password) {
  return apiRequest('/auth/signup', { method: 'POST', body: { name, email, password } });
}

export { getCurrentUser, saveSession, logout, apiRequest, login, signup };
