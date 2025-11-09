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
    const { response } = error;
    let message = 'An unexpected error occurred';

    if (response) {
      switch (response.status) {
        case 400:
          message = response.data?.message || 'Bad Request';
          break;
        case 401:
          message = 'Please log in to continue';
          window.location.href = "/login";
          break;
        case 403:
          message = 'Access Denied';
          break;
        case 404:
          message = 'Resource Not Found';
          break;
        case 413:
          message = 'File size is too large';
          break;
        case 500:
          message = 'Server Error - Please try again later';
          break;
        default:
          message = response.data?.message || 'Something went wrong';
      }
    }

    // Create a custom error event
    const errorEvent = new CustomEvent('api-error', { 
      detail: { 
        message,
        status: response?.status,
        validationErrors: response?.data?.validationErrors 
      } 
    });
    window.dispatchEvent(errorEvent);

    return Promise.reject(error);
  }
);

export default API;
