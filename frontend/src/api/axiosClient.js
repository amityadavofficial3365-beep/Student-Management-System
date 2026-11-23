import axios from "axios";

export const AUTH_STORAGE_KEY = "sms_auth";

// One shared axios instance. Every request goes to the backend API.
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Before each request: attach the JWT token (if the admin is logged in).
axiosClient.interceptors.request.use((config) => {
  try {
    const saved = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
    if (saved?.token) {
      config.headers.Authorization = `Bearer ${saved.token}`;
    }
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
  return config;
});

// After each response: if the token is expired/invalid (401), log the admin out.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes("/auth/login");
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
