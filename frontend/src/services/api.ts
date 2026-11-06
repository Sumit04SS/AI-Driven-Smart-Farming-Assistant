import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agri_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      const currentToken = localStorage.getItem('agri_token');
      if (currentToken) {
        localStorage.removeItem('agri_token');
        localStorage.removeItem('agri_user');
        window.dispatchEvent(new Event('auth_logout'));
      }
    }

    // Extract cleanest user-facing message
    let message = 'An unexpected error occurred. Please try again.';
    if (error.response?.data) {
      const data = error.response.data;
      if (typeof data.detail === 'string') {
        message = data.detail;
      } else if (Array.isArray(data.detail) && data.detail.length > 0) {
        // FastAPI validation errors
        message = data.detail.map((e: any) => `${e.loc?.slice(-1)[0] || 'field'}: ${e.msg}`).join(', ');
      } else if (typeof data.message === 'string') {
        message = data.message;
      }
    } else if (error.message) {
      message = error.message;
    }

    const enhancedError = new Error(message);
    (enhancedError as any).status = error.response?.status;
    (enhancedError as any).raw = error;
    return Promise.reject(enhancedError);
  }
);

export default api;
