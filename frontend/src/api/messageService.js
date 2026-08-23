import axiosInstance from './axiosInstance';

const messageService = {
  // Get all messages
  getAllMessages: async () => {
    try {
      const response = await axiosInstance.get('/messages');
      return response.data;
    } catch (error) {
      console.error('Error fetching all messages:', error);
      throw error;
    }
  },

  // Get message by ID
  getMessageById: async (id) => {
    try {
      const response = await axiosInstance.get(`/messages/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching message:', error);
      throw error;
    }
  },

  // Get messages by user ID
  getMessagesByUserId: async (userId) => {
    try {
      const response = await axiosInstance.get(`/messages/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user messages:', error);
      throw error;
    }
  },

  // Get messages by sender
  getMessagesBySender: async (sender) => {
    try {
      const response = await axiosInstance.get(`/messages/sender/${sender}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching messages by sender:', error);
      throw error;
    }
  },

  // Create new message
  createMessage: async (messageData) => {
    try {
      const response = await axiosInstance.post('/messages', messageData);
      return response.data;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  },

  // Create message with file attachment
  createMessageWithFile: async (formData) => {
    try {
      const response = await axiosInstance.post('/messages', formData, {
        // Don't set Content-Type header for FormData - let browser set it automatically
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating message with file:', error);
      throw error;
    }
  },

  // Update message
  updateMessage: async (id, messageData) => {
    try {
      const response = await axiosInstance.put(`/messages/${id}`, messageData);
      return response.data;
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  },

  // Delete message
  deleteMessage: async (id) => {
    try {
      const response = await axiosInstance.delete(`/messages/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }
};

export default messageService;
