import api from "../lib/api";

export const profileService = {
  // Get current logged-in profile
  getMyProfile: async () => {
    const response = await api.get("/auth/me");
    return response.data?.profile || response.data?.data?.profile;
  },

  // Get profile by Mongo _id or userId
  getProfileById: async (id) => {
    const response = await api.get(`/profiles/${id}`);
    return response.data?.data || response.data;
  },

  // Get profile by deterministic userId
  getByUserId: async (userId) => {
    const response = await api.get(`/profiles/user/${userId}`);
    return response.data?.data || response.data;
  },

  // Update profile details
  updateProfile: async (id, data) => {
    const response = await api.put(`/profiles/${id}`, data);
    return response.data?.data || response.data;
  },

  // Upload avatar
  uploadAvatar: async (profileId, file) => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await api.post(`/profiles/${profileId}/avatar`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Upload cover image
  uploadCover: async (profileId, file) => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await api.post(`/profiles/${profileId}/cover`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Submit creator/brand verification
  submitVerification: async (data) => {
    const response = await api.post("/profiles/verification", data);
    return response.data;
  },

  // Submit brand verification
  submitBrandVerification: async (data) => {
    const response = await api.post("/profiles/brand-verification", data);
    return response.data;
  },
};

export const getProfile = profileService.getMyProfile;
export const getProfileById = profileService.getProfileById;
export const updateProfile = (id, data) => profileService.updateProfile(id, data);
export const updateProfileImage = (id, file) => profileService.uploadAvatar(id, file);

export default profileService;