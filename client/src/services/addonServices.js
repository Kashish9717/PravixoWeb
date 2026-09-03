import api from "../lib/api";

export const addonApi = {
  // Get all addon services
  getServices: async (enabledOnly = false) => {
    const response = await api.get("/addons/services", {
      params: enabledOnly ? { enabledOnly: true } : {},
    });

    return response.data;
  },

  // Create addon service
  createService: async (serviceData) => {
    const response = await api.post("/addons/services", serviceData);

    return response.data;
  },

  // Update addon service
  updateService: async (id, serviceData) => {
    const response = await api.patch(
      `/addons/services/${id}`,
      serviceData
    );

    return response.data;
  },

  // Delete addon service
  deleteService: async (id) => {
    const response = await api.delete(`/addons/services/${id}`);

    return response.data;
  },

  // Get bookings
  getBookings: async (profileId) => {
    const response = await api.get("/addons/bookings", {
      params: profileId ? { profileId } : {},
    });

    return response.data;
  },

  // Create booking
  createBooking: async (bookingData) => {
    const response = await api.post(
      "/addons/bookings",
      bookingData
    );

    return response.data;
  },
};