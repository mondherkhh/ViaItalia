const prisma = require('../config/prisma');
const notificationsService = require('../services/notifications');

// Get all notifications for a user
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const result = await notificationsService.listForUser(userId, 30);
    if (!result.success) return res.status(500).json({ success: false, message: result.error });
    res.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

// Get unread notifications count for a user
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const result = await notificationsService.unreadCount(userId);
    if (!result.success) return res.status(500).json({ success: false, message: result.error });
    res.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.userId || req.user?.id;
    const result = await notificationsService.markRead(id, userId);
    if (!result.success) return res.status(500).json({ success: false, message: result.error });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read for a user
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const result = await notificationsService.markAllRead(userId);
    if (!result.success) return res.status(500).json({ success: false, message: result.error });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read',
      error: error.message
    });
  }
};

// Delete a notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    
    const notification = await prisma.notification.deleteMany({
      where: {
        id: parseInt(id),
        userId: userId
      }
    });

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
};

module.exports = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
