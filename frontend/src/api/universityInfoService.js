import axiosInstance from "./axiosInstance";

export const universityInfoService = {
  // Get all university info
  getAllUniversityInfo: async () => {
    const response = await axiosInstance.get("/university-info");
    return response.data;
  },

  // Get university info by ID
  getUniversityInfoById: async (id) => {
    const response = await axiosInstance.get(`/university-info/${id}`);
    return response.data;
  },

  // Get university info by user ID
  getUniversityInfoByUserId: async (userId) => {
    const response = await axiosInstance.get(`/university-info/user/${userId}`);
    return response.data;
  },

  // Create new university info
  createUniversityInfo: async (universityInfoData) => {
    const response = await axiosInstance.post("/university-info", universityInfoData);
    return response.data;
  },

  // Update university info
  updateUniversityInfo: async (id, universityInfoData) => {
    const response = await axiosInstance.put(`/university-info/${id}`, universityInfoData);
    return response.data;
  },

  // Delete university info
  deleteUniversityInfo: async (id) => {
    const response = await axiosInstance.delete(`/university-info/${id}`);
    return response.data;
  }
};

export default universityInfoService;
