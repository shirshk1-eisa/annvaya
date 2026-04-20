// API utility for making authenticated requests to the backend
// example.com
const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

// Get stored token
function getToken() {
  return localStorage.getItem('annvaya_token');
}

// Set token
export function setToken(token) {
  localStorage.setItem('annvaya_token', token);
}

// Remove token
export function removeToken() {
  localStorage.removeItem('annvaya_token');
}

// Generic fetch wrapper with auth
async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

// Auth API
export const authAPI = {
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getProfile: () => request('/auth/me'),

  updateProfile: (data) =>
    request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Donations API
export const donationsAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return request(`/donations${params ? `?${params}` : ''}`);
  },

  getMy: (history = false) =>
    request(`/donations/my${history ? '?history=true' : ''}`),

  create: (donationData) =>
    request('/donations', {
      method: 'POST',
      body: JSON.stringify(donationData),
    }),

  update: (id, data) =>
    request(`/donations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  accept: (id) =>
    request(`/donations/${id}/accept`, { method: 'PATCH' }),

  updateStatus: (id, status) =>
    request(`/donations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// Food Requests API
export const foodRequestsAPI = {
  getAll: (history = false) =>
    request(`/food-requests${history ? '?history=true' : ''}`),

  getMy: (history = false) =>
    request(`/food-requests/my${history ? '?history=true' : ''}`),

  create: (data) =>
    request('/food-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  fulfill: (id, items) =>
    request(`/food-requests/${id}/fulfill`, {
      method: 'PATCH',
      body: JSON.stringify({ items }),
    }),

  updateStatus: (id, status) =>
    request(`/food-requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  cancel: (id) =>
    request(`/food-requests/${id}`, { method: 'DELETE' }),
};

// Events API
export const eventsAPI = {
  getAll: (status) => {
    const params = status ? `?status=${status}` : '';
    return request(`/events${params}`);
  },

  getMy: () => request('/events/my'),

  create: (data) =>
    request('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  claim: (id, quantityClaimed) =>
    request(`/events/${id}/claim`, {
      method: 'PATCH',
      body: JSON.stringify({ quantityClaimed }),
    }),

  subscribe: (id) =>
    request(`/events/${id}/subscribe`, { method: 'PATCH' }),

  unsubscribe: (id) =>
    request(`/events/${id}/unsubscribe`, { method: 'PATCH' }),
};

// Pickups API
export const pickupsAPI = {
  getAll: (history = false) =>
    request(`/pickups${history ? '?history=true' : ''}`),

  create: (data) =>
    request('/pickups', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id, status) =>
    request(`/pickups/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  cancel: (id) =>
    request(`/pickups/${id}`, { method: 'DELETE' }),
};
