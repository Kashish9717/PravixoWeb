import api from "../lib/api";

export const authApi = {
  login: async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    return response.data;
  },

  register: async ({ role, email, name, password, otp }) => {
    const response = await api.post("/auth/register", {
      role,
      email,
      name,
      password,
      otp,
    });

    return response.data;
  },

  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  logout: async () => {
    try {
      const response = await api.post("/auth/logout");
      return response.data;
    } catch {
      return null;
    }
  },

  sendOtp: async (email) => {
    const response = await api.post("/otp/send", {
      email,
    });

    return response.data;
  },

  verifyOtp: async (email, otp) => {
    const response = await api.post("/otp/verify", {
      email,
      otp,
    });

    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post("/auth/forgot-password", {
      email,
    });

    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.post("/auth/reset-password", {
      token,
      password,
    });

    return response.data;
  },
};