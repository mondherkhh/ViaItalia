import axiosInstance from './axiosInstance';

const studentService = {
  // Aggregated dashboard payload
  getDashboardData: async () => {
    try {
      const response = await axiosInstance.get('/student/dashboard');
      return response.data;
    } catch (error) {
      console.error('Student dashboard error:', error);
      throw error;
    }
  },

  // Stats only (lightweight, used for refreshes)
  getDashboardStats: async () => {
    try {
      const response = await axiosInstance.get('/student/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Student stats error:', error);
      throw error;
    }
  },

  // Stable slices for reuse across sections
  getPayments: async () => {
    try {
      const response = await axiosInstance.get('/student/dashboard/payments');
      return response.data?.data || [];
    } catch (error) {
      console.error('Student payments error:', error);
      return [];
    }
  },

  getMessages: async () => {
    try {
      const response = await axiosInstance.get('/student/dashboard/messages');
      return response.data?.data || [];
    } catch (error) {
      console.error('Student messages error:', error);
      return [];
    }
  },

  getAnnouncements: async () => {
    try {
      const response = await axiosInstance.get('/student/dashboard/announcements');
      return response.data?.data || [];
    } catch (error) {
      console.error('Student announcements error:', error);
      return [];
    }
  },

  getAppointments: async () => {
    try {
      const response = await axiosInstance.get('/student/dashboard/appointments');
      return response.data?.data || [];
    } catch (error) {
      console.error('Student appointments error:', error);
      return [];
    }
  },

  getDossier: async () => {
    try {
      const response = await axiosInstance.get('/student/dashboard/dossier');
      return response.data?.data || null;
    } catch (error) {
      console.error('Student dossier error:', error);
      return null;
    }
  }
};

export default studentService;
