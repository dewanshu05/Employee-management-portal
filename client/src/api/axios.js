import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT auth token
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('emp_portal_token') || sessionStorage.getItem('emp_portal_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Do not redirect if user is on any public authentication page
      const publicPaths = ['/login', '/register', '/forgot-password', '/pending-approval'];
      const isPublicPage = publicPaths.some((p) => window.location.pathname.includes(p));

      if (!isPublicPage && !error.config?._skipAuthRedirect) {
        localStorage.removeItem('emp_portal_token');
        localStorage.removeItem('emp_portal_user');
        sessionStorage.removeItem('emp_portal_token');
        sessionStorage.removeItem('emp_portal_user');
        window.location.href = '/login?session_expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
