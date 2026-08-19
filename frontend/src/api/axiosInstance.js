import axios from "axios";

const apiBaseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

const axiosInstance = axios.create({
  baseURL: `${apiBaseUrl.replace(/\/$/, "")}/api`,
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
