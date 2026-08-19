import { useState, useEffect } from 'react';
import messageService from '../../../api/messageService';

export const useMessaging = (userId) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [error, setError] = useState(null);

  const fetchMessages = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await messageService.getMessagesByUserId(userId);
      if (response.success && response.data) {
        // Sort messages by createdAt (oldest first for proper chat flow)
        const sortedMessages = response.data.sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        );
        setMessages(sortedMessages);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Erreur lors de la récupération des messages');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content) => {
    if (!userId || (!content.trim() && !attachedFile)) return;
    
    setIsSending(true);
    setError(null);
    
    try {
      let response;
      
      if (attachedFile) {
        // Send message with file
        const formData = new FormData();
        formData.append('content', content.trim());
        formData.append('sender', 'USER');
        formData.append('userId', userId);
        formData.append('file', attachedFile);
        
        response = await messageService.createMessageWithFile(formData);
      } else {
        // Send text-only message
        response = await messageService.createMessage({
          content: content.trim(),
          sender: 'USER',
          userId
        });
      }

      if (response.success && response.data) {
        // Add the new message to the messages list
        setMessages(prev => [...prev, response.data]);
        setNewMessage('');
        setAttachedFile(null);
        return response.data;
      }
    } catch (err) {
      console.error('Error sending message:', err);
      
      // Handle 401 authentication errors specifically
      if (err.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
        // Optionally redirect to login or clear token
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        setError('Erreur lors de l\'envoi du message');
      }
      throw err;
    } finally {
      setIsSending(false);
    }
  };

  const handleFileAttach = (file) => {
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Le fichier ne doit pas dépasser 10MB');
        return;
      }
      setAttachedFile(file);
      setError(null);
    }
  };

  const removeAttachedFile = () => {
    setAttachedFile(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (newMessage.trim()) {
        sendMessage(newMessage);
      }
    }
  };

  const clearNewMessage = () => {
    setNewMessage('');
  };

  useEffect(() => {
    fetchMessages();
  }, [userId]);

  return {
    messages,
    isLoading,
    isSending,
    newMessage,
    attachedFile,
    error,
    fetchMessages,
    sendMessage,
    setNewMessage,
    handleKeyPress,
    clearNewMessage,
    handleFileAttach,
    removeAttachedFile
  };
};
