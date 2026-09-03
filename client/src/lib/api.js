import axios from "axios";

let baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
if (baseURL.endsWith("/")) {
  baseURL = baseURL.slice(0, -1);
}
if (!baseURL.endsWith("/api")) {
  baseURL = `${baseURL}/api`;
}

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    // Prevent double /api prefix if passed directly
    if (config.url && config.url.startsWith("/api/")) {
      config.url = config.url.replace(/^\/api/, "");
    }

    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("Pravixo_token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;