import axios from 'axios';

// Base API URL for the Node.js backend
// Since admin is on 5174 and backend is probably on another port (e.g. 5000)
// Let's assume standard port for now or read from env.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or unauthorized
      localStorage.removeItem('adminToken');
      localStorage.removeItem('admin_authed');
      sessionStorage.removeItem('admin_authed');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
