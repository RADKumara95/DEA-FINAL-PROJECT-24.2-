import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true, // Important for session cookies
});

// Function to get CSRF token from cookie
const getCsrfToken = () => {
  const name = "XSRF-TOKEN";
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split("=");
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return null;
};

// Request interceptor to add CSRF token
API.interceptors.request.use(
  (config) => {
    const csrfToken = getCsrfToken();
    if (csrfToken && (config.method === "post" || config.method === "put" || config.method === "delete")) {
      config.headers["X-XSRF-TOKEN"] = csrfToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;
