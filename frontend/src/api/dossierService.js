import axiosInstance from './axiosInstance';

const dossierService = {
  // Get all dossiers
  getAllDossiers: async () => {
    try {
      const response = await axiosInstance.get('/dossiers');
      return response.data;
    } catch (error) {
      console.error('Error fetching dossiers:', error);
      throw error;
    }
  },

  // Get dossier by ID
  getDossierById: async (id) => {
    try {
      const response = await axiosInstance.get(`/dossiers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dossier:', error);
      throw error;
    }
  },

  // Create dossier
  createDossier: async (dossierData) => {
    try {
      const response = await axiosInstance.post('/dossiers', dossierData);
      return response.data;
    } catch (error) {
      console.error('Error creating dossier:', error);
      throw error;
    }
  },

  // Update dossier
  updateDossier: async (dossierId, updateData) => {
    try {
      const response = await axiosInstance.put(`/dossiers/${dossierId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating dossier:', error);
      throw error;
    }
  },

  // Delete dossier
  deleteDossier: async (id) => {
    try {
      const response = await axiosInstance.delete(`/dossiers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting dossier:', error);
      throw error;
    }
  },

  // Get dossier statistics
  getDossierStats: async () => {
    try {
      const response = await axiosInstance.get('/dossiers/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dossier stats:', error);
      throw error;
    }
  },

  // Get dossiers by user ID
  getDossiersByUserId: async (userId) => {
    try {
      const response = await axiosInstance.get(`/dossiers/users/${userId}/dossiers`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user dossiers:', error);
      throw error;
    }
  },

  // Get single dossier by user ID
  getDossierByUserId: async (userId) => {
    try {
      const response = await axiosInstance.get(`/dossiers/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user dossier:', error);
      throw error;
    }
  },

  // Create missing dossiers for existing users
  createMissingDossiers: async () => {
    try {
      const response = await axiosInstance.post('/dossiers/create-missing');
      return response.data;
    } catch (error) {
      console.error('Error creating missing dossiers:', error);
      throw error;
    }
  }
};

export default dossierService;
