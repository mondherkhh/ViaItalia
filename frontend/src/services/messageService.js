// Simple message functions for frontend

// Fetch all messages
const fetchAllMessages = async () => {
  try {
    const response = await axios.get('/api/messages');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

// Send message
const sendMessage = async (content, sender, userId) => {
  try {
    const response = await axios.post('/api/messages', {
      content: content.trim(),
      sender,
      userId: parseInt(userId)
    });
    return response.data.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export { fetchAllMessages, sendMessage };
