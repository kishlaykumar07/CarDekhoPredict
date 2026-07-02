const RENDER_BACKEND_URL = 'https://YOUR_RENDER_URL.onrender.com';

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : RENDER_BACKEND_URL;

export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  endpoints: {
    recommendations: `${API_BASE_URL}/api/recommendations`
  }
};
