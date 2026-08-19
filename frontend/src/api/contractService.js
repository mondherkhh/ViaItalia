import axiosInstance from "./axiosInstance";

export const contractService = {

  uploadContract: async (formData) => {
    try {
      console.log("🚀 Sending contract upload request...");

      // 🔍 Debug: show FormData content
      for (let [key, value] of formData.entries()) {
        console.log("📦", key, value);
      }

      // ⚠️ IMPORTANT:
      // DO NOT set Content-Type manually
      // Axios will handle multipart/form-data automatically

      const response = await axiosInstance.post(
        "/contracts/upload",
        formData
      );

      console.log("✅ Upload success:", response.data);
      return response.data;

    } catch (error) {
      console.error("❌ Upload failed:");
      console.error("Message:", error.message);
      console.error("Backend response:", error.response?.data);
      console.error("Status:", error.response?.status);

      throw error;
    }
  },

  // (optional but useful later)
  getContractByUserId: async () => {
    try {
      const response = await axiosInstance.get("/contracts/my-contract");
      return response.data;
    } catch (error) {
      console.error("❌ Fetch contract error:", error.response?.data);
      throw error;
    }
  },

  // Admin methods
  getAllContracts: async () => {
    try {
      const response = await axiosInstance.get("/contracts");
      return response.data;
    } catch (error) {
      console.error("❌ Fetch all contracts error:", error.response?.data);
      throw error;
    }
  },

  updateContractStatus: async (contractId, status) => {
    try {
      const response = await axiosInstance.patch(`/contracts/${contractId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error("❌ Update contract status error:", error.response?.data);
      throw error;
    }
  },

  downloadContract: async (contractId) => {
    try {
      const response = await axiosInstance.get(`/contracts/${contractId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error("❌ Download contract error:", error.response?.data);
      throw error;
    }
  },

  deleteContract: async (contractId) => {
    try {
      const response = await axiosInstance.delete(`/contracts/${contractId}`);
      return response.data;
    } catch (error) {
      console.error("❌ Delete contract error:", error.response?.data);
      throw error;
    }
  }

};

export default contractService;