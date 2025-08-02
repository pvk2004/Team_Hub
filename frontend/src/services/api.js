import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('teamhub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('teamhub_token');
      localStorage.removeItem('teamhub_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  signup: async (email, password, role) => {
    const response = await apiClient.post('/auth/signup', {
      email,
      password,
      role,
    });
    return response.data;
  },

  signin: async (email, password) => {
    const response = await apiClient.post('/auth/signin', {
      email,
      password,
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/user');
    return response.data;
  },
};

// Announcements API
export const announcementAPI = {
  getAll: async () => {
    const response = await apiClient.get('/announcements');
    return response.data;
  },

  create: async (title, content) => {
    const response = await apiClient.post('/announcements', {
      title,
      content,
    });
    return response.data;
  },

  update: async (id, title, content) => {
    const response = await apiClient.put(`/announcements/${id}`, {
      title,
      content,
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/announcements/${id}`);
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getAllUsers: async () => {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await apiClient.put(`/admin/users/${userId}/role`, {
      role,
    });
    return response.data;
  },
};

// Helper function to handle API errors
export const handleApiError = (error) => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};