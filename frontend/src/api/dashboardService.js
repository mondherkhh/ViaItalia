import axiosInstance from './axiosInstance';

const dashboardService = {
  // Get all dashboard data in one call
  getDashboardData: async (userId) => {
    try {
      const response = await axiosInstance.get(`/dashboard/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  // Get latest appointments for dashboard
  getLatestAppointments: async (userId, limit = 5) => {
    try {
      const response = await axiosInstance.get(`/appointments/user/${userId}?limit=${limit}&sort=date:desc`);
      return response.data;
    } catch (error) {
      console.error('Error fetching latest appointments:', error);
      throw error;
    }
  },

  // Get latest messages for dashboard
  getLatestMessages: async (userId, limit = 5) => {
    try {
      const response = await axiosInstance.get(`/messages/user/${userId}?limit=${limit}&sort=createdAt:desc`);
      return response.data;
    } catch (error) {
      console.error('Error fetching latest messages:', error);
      throw error;
    }
  },

  // Get contract info for dashboard
  getContractInfo: async (userId) => {
    try {
      const response = await axiosInstance.get(`/contracts/my-contract`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contract info:', error);
      throw error;
    }
  },

  // Get dossier info for dashboard
  getDossierInfo: async (userId) => {
    try {
      const response = await axiosInstance.get(`/dossiers/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dossier info:', error);
      throw error;
    }
  },

  // Get latest announcements for dashboard
  getLatestAnnouncements: async (limit = 3) => {
    try {
      const response = await axiosInstance.get('/announcements/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching latest announcements:', error);
      throw error;
    }
  },

  // Get dashboard statistics
  getDashboardStats: async (userId) => {
    try {
      const response = await axiosInstance.get(`/dashboard/stats/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get upcoming appointments count
  getUpcomingAppointmentsCount: async (userId) => {
    try {
      const response = await axiosInstance.get(`/appointments/user/${userId}/upcoming/count`);
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming appointments count:', error);
      throw error;
    }
  },

  // Get unread messages count
  getUnreadMessagesCount: async (userId) => {
    try {
      const response = await axiosInstance.get(`/messages/user/${userId}/unread/count`);
      return response.data;
    } catch (error) {
      console.error('Error fetching unread messages count:', error);
      throw error;
    }
  },

  // Get contract status
  getContractStatus: async (userId) => {
    try {
      const response = await axiosInstance.get(`/contracts/my-contract`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contract status:', error);
      throw error;
    }
  },

  // Get dossier progress
  getDossierProgress: async (userId) => {
    try {
      const response = await axiosInstance.get(`/dossiers/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dossier progress:', error);
      throw error;
    }
  },

  // Get payment info for dashboard
  getPaymentInfo: async (userId) => {
    try {
      console.log('=== DASHBOARD: FETCHING PAYMENTS FOR USER:', userId);
      const response = await axiosInstance.get(`/payments/users/${userId}/payments`);
      console.log('Dashboard Payments API response:', response);
      console.log('Dashboard Response data:', response.data);
      console.log('Dashboard Response status:', response.status);
      
      if (response.data.success) {
        const paymentsData = response.data.data || [];
        console.log('✅ Dashboard Payments fetched successfully:', paymentsData);
        
        // If no payments found, don't set an error - this is normal
        if (paymentsData.length === 0) {
          console.log('ℹ️ Dashboard: No payments found for user:', userId);
        }
        
        return response.data;
      } else {
        console.log('❌ Dashboard API returned success=false:', response.data.message);
        return { success: false, data: [] };
      }
    } catch (error) {
      console.error('❌ Dashboard Error fetching payment info:', error);
      console.error('Dashboard Error status:', error.response?.status);
      console.error('Dashboard Error data:', error.response?.data);
      console.error('Dashboard Error config:', error.config);
      return { success: false, data: [] };
    }
  },

  // Get latest payment for dashboard
  getLatestPayment: async (userId) => {
    try {
      console.log('=== DASHBOARD: FETCHING LATEST PAYMENT FOR USER:', userId);
      const response = await axiosInstance.get(`/payments/users/${userId}/payments`);
      console.log('Dashboard Latest payment API response:', response);
      console.log('Dashboard Latest payment response data:', response.data);
      console.log('Dashboard Latest payment response status:', response.status);
      
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        const latestPayment = response.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        console.log('✅ Dashboard Latest payment fetched successfully:', latestPayment);
        return { success: true, data: latestPayment };
      }
      console.log('ℹ️ Dashboard: No payments found for user:', userId);
      return { success: true, data: null };
    } catch (error) {
      console.error('❌ Dashboard Error fetching latest payment:', error);
      console.error('Dashboard Latest payment error status:', error.response?.status);
      console.error('Dashboard Latest payment error data:', error.response?.data);
      console.error('Dashboard Latest payment error config:', error.config);
      return { success: false, data: null };
    }
  }
};

export default dashboardService;
