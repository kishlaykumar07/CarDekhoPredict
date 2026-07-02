// API Configuration
const API_BASE_URL = window.location.origin === 'http://localhost:4200' 
  ? 'http://localhost:5000'
  : window.location.origin.replace(':4200', '').replace('frontend', 'backend');

export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  endpoints: {
    recommendations: `${API_BASE_URL}/api/recommendations`
  }
};
