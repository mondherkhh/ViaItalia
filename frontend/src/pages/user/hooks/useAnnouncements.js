import { useState, useEffect } from 'react';
import announcementService from '../../../api/announcementService';

export const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await announcementService.getAllAnnouncements();
      if (response.success && response.data) {
        setAnnouncements(response.data);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError('Erreur lors de la récupération des annonces');
    } finally {
      setIsLoading(false);
    }
  };

  const getAnnouncementType = (type) => {
    const typeMap = {
      'INFO': { color: 'blue', icon: 'ℹ️', label: 'Information' },
      'SUCCESS': { color: 'green', icon: '✅', label: 'Succès' },
      'WARNING': { color: 'yellow', icon: '⚠️', label: 'Attention' },
      'ERROR': { color: 'red', icon: '❌', label: 'Erreur' },
      'UPDATE': { color: 'purple', icon: '🔄', label: 'Mise à jour' }
    };
    
    return typeMap[type] || typeMap['INFO'];
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Il y a quelques secondes';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  const getAnnouncementsByType = (type) => {
    return announcements.filter(announcement => announcement.type === type);
  };

  const getLatestAnnouncements = (limit = 5) => {
    return announcements
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return {
    announcements,
    isLoading,
    error,
    fetchAnnouncements,
    getAnnouncementType,
    formatRelativeTime,
    getAnnouncementsByType,
    getLatestAnnouncements
  };
};
