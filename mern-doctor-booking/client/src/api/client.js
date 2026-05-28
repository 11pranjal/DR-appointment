import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Extract server base URL from API_URL
// If API_URL is '/api', server is on same origin
// If API_URL is 'http://localhost:3000/api', extract the base
let SERVER_URL = '';
if (API_URL.startsWith('http')) {
  SERVER_URL = API_URL.replace('/api', '');
} else {
  SERVER_URL = window.location.origin;
}

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { SERVER_URL };
export default api;
