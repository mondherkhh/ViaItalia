import axiosInstance from './axiosInstance';

const announcementService = {
  // Get all announcements (admin)
  getAllAnnouncements: async () => {
    try {
      const response = await axiosInstance.get('/announcements/admin');
      return response.data;
    } catch (error) {
      console.error('Error fetching all announcements:', error);
      throw error;
    }
  },

  // Get active announcements (users)
  getActiveAnnouncements: async () => {
    try {
      const response = await axiosInstance.get('/announcements/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching active announcements:', error);
      throw error;
    }
  },

  // Get announcement by ID
  getAnnouncementById: async (id) => {
    try {
      const response = await axiosInstance.get(`/announcements/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching announcement:', error);
      throw error;
    }
  },

  // Create announcement
  createAnnouncement: async (announcementData) => {
    try {
      const response = await axiosInstance.post('/announcements', announcementData);
      return response.data;
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  },

  // Update announcement
  updateAnnouncement: async (id, announcementData) => {
    try {
      const response = await axiosInstance.put(`/announcements/${id}`, announcementData);
      return response.data;
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  },

  // Delete announcement
  deleteAnnouncement: async (id) => {
    try {
      const response = await axiosInstance.delete(`/announcements/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  },

  // Toggle announcement status
  toggleAnnouncementStatus: async (id) => {
    try {
      const response = await axiosInstance.patch(`/announcements/${id}/toggle`);
      return response.data;
    } catch (error) {
      console.error('Error toggling announcement status:', error);
      throw error;
    }
  },

  // Send email notification to all users for new announcement

};

export default announcementService;
