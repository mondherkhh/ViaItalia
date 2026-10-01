import { useState, useEffect } from 'react';
import notificationService from '../../../api/notificationService';

export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await notificationService.getAllNotifications();
      // Ensure we always set an array, handle different response formats
      const notificationsArray = Array.isArray(response) ? response : 
                               (response?.data && Array.isArray(response.data)) ? response.data : 
                               [];
      setNotifications(notificationsArray);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Erreur lors de la récupération des notifications');
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!userId) return;
    
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response?.count || 0);
    } catch (err) {
      console.error('Error fetching unread count:', err);
      setUnreadCount(0);
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
      setError('Erreur lors du marquage des notifications comme lues');
      throw err;
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError('Erreur lors de la suppression de la notification');
      throw err;
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      'APPOINTMENT': '📅',
      'MESSAGE': '💬',
      'CONTRACT': '📄',
      'DOSSIER': '📁',
      'ANNOUNCEMENT': '📢',
      'SYSTEM': '⚙️',
      'SUCCESS': '✅',
      'WARNING': '⚠️',
      'ERROR': '❌',
      'INFO': 'ℹ️',
      'appointment': '📅',
      'message': '💬',
      'contract': '📄',
      'dossier': '📁',
      'announcement': '📢',
      'system': '⚙️',
      'success': '✅',
      'warning': '⚠️',
      'error': '❌',
      'info': 'ℹ️'
    };
    
    return iconMap[type] || '📢';
  };

  const getNotificationTypeLabel = (type) => {
    const typeMap = {
      'APPOINTMENT': 'Rendez-vous',
      'MESSAGE': 'Message',
      'CONTRACT': 'Contrat',
      'DOSSIER': 'Dossier',
      'ANNOUNCEMENT': 'Annonce',
      'SYSTEM': 'Système',
      'SUCCESS': 'Succès',
      'WARNING': 'Attention',
      'ERROR': 'Erreur',
      'INFO': 'Information',
      'appointment': 'Rendez-vous',
      'message': 'Message',
      'contract': 'Contrat',
      'dossier': 'Dossier',
      'announcement': 'Annonce',
      'system': 'Système',
      'success': 'Succès',
      'warning': 'Attention',
      'error': 'Erreur',
      'info': 'Information'
    };
    
    return typeMap[type] || 'Notification';
  };

  const formatNotificationTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Maintenant';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Il y a ${minutes} min`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Il y a ${hours}h`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [userId]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAllAsRead,
    markAsRead,
    deleteNotification,
    getNotificationIcon,
    getNotificationTypeLabel,
    formatNotificationTime
  };
};
