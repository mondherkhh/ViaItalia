import axiosInstance from './axiosInstance';

const authService = {
  // Update user role
  updateUserRole: async (userId, role) => {
    try {
      const response = await axiosInstance.put(`/auth/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  // Create user
  createUser: async (userData) => {
    try {
      const response = await axiosInstance.post('/auth/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Get all users for admin selectors
  getAllUsers: async () => {
    try {
      const response = await axiosInstance.get('/auth/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Search users
  searchUsers: async (query) => {
    try {
      const response = await axiosInstance.get(`/auth/users/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    try {
      const response = await axiosInstance.delete(`/auth/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};

export default authService;
