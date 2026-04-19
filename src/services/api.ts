import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default headers
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

function clearAuthStorage() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  localStorage.removeItem('user');
  sessionStorage.clear();
}

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthStorage();
      window.location.replace("/login");
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data) => apiClient.post('/auth/register', data),
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
};

export const adminAPI = {
  getOverview: () => apiClient.get('/admin/overview'),
  connectAllUsers: () => apiClient.post('/admin/automation/connect-all'),
};

export const roleWorkflowAPI = {
  getOwnFoodRequests: () => apiClient.get('/food-request'),
  createFoodRequest: (data) => apiClient.post('/food-request', data),
  getNgoAssignedRequests: () => apiClient.get('/food-request'),
  patchFoodStatus: (id, data) => apiClient.patch(`/food-request/${id}/status`, data),
  patchVolunteerStatus: (data) => apiClient.patch('/volunteer/status', data),
  getAssignedDeliveries: () => apiClient.get('/food-request/assigned-deliveries/list'),
  getIncomingDeliveries: () => apiClient.get('/food-request/incoming-deliveries/list'),
  confirmDelivery: (id) => apiClient.patch(`/food-request/delivery/confirm/${id}`),
};

// Donors API
export const donorsAPI = {
  getAll: () => apiClient.get('/donors'),
  getById: (id) => apiClient.get(`/donors/${id}`),
  create: (data) => apiClient.post('/donors', data),
  update: (id, data) => apiClient.put(`/donors/${id}`, data),
  delete: (id) => apiClient.delete(`/donors/${id}`),
};

// Food Requests API
export const foodRequestsAPI = {
  getAll: () => apiClient.get('/food-requests'),
  getById: (id) => apiClient.get(`/food-requests/${id}`),
  create: (data) => apiClient.post('/food-requests', data),
  update: (id, data) => apiClient.put(`/food-requests/${id}`, data),
  delete: (id) => apiClient.delete(`/food-requests/${id}`),
};

// NGOs API
export const ngosAPI = {
  getAll: () => apiClient.get('/ngos'),
  getById: (id) => apiClient.get(`/ngos/${id}`),
  create: (data) => apiClient.post('/ngos', data),
  update: (id, data) => apiClient.put(`/ngos/${id}`, data),
  delete: (id) => apiClient.delete(`/ngos/${id}`),
};

// Care Institutions API
export const careInstitutionsAPI = {
  getAll: () => apiClient.get('/care-institutions'),
  getById: (id) => apiClient.get(`/care-institutions/${id}`),
  create: (data) => apiClient.post('/care-institutions', data),
  update: (id, data) => apiClient.put(`/care-institutions/${id}`, data),
  delete: (id) => apiClient.delete(`/care-institutions/${id}`),
};

// Volunteers API
export const volunteersAPI = {
  getAll: () => apiClient.get('/volunteers'),
  getById: (id) => apiClient.get(`/volunteers/${id}`),
  create: (data) => apiClient.post('/volunteers', data),
  update: (id, data) => apiClient.put(`/volunteers/${id}`, data),
  delete: (id) => apiClient.delete(`/volunteers/${id}`),
};

export default apiClient;
