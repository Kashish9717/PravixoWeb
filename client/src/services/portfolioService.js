import api from "../lib/api";

export const portfolioService = {
  // Get portfolio images for a profile
  getByProfile: async (profileId) => {
    const response = await api.get(`/portfolio/profile/${profileId}`);
    return response.data?.data || response.data || [];
  },

  // Upload a new portfolio image
  addImage: async (profileId, imageFile, sortOrder = 0) => {
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("profileId", profileId);
    if (sortOrder != null) {
      formData.append("sortOrder", String(sortOrder));
    }

    const response = await api.post("/portfolio", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data?.data || response.data;
  },

  // Delete portfolio image by id
  deleteImage: async (id) => {
    const response = await api.delete(`/portfolio/${id}`);
    return response.data;
  },

  // Reorder portfolio images
  reorder: async (images) => {
    const response = await api.post("/portfolio/reorder", { images });
    return response.data;
  },
};

export default portfolioService;