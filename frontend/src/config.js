export const getApiUrl = () => {
  if (import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, ""); // Remove trailing slash if any
  }
  // Fallback to local development if running on localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return "http://localhost:8000";
  }
  // Fallback to deployed production API on Render
  return "https://findit-backend-uc54.onrender.com";
};
