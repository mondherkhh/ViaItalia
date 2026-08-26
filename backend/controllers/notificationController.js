const prisma = require('../config/prisma');

// Get all notifications for a user
const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.user;
    
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: notifications
    });
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
    const { userId } = req.user;
    
    const unreadCount = await prisma.notification.count({
      where: { 
        userId,
        isRead: false 
      }
    });

    res.json({
      success: true,
      data: unreadCount
    });
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
    const { id } = req.params;
    const { userId } = req.user;
    
    const notification = await prisma.notification.updateMany({
      where: {
        id: parseInt(id),
        userId: userId
      },
      data: {
        isRead: true
      }
    });

    res.json({
      success: true,
      data: notification
    });
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
    const { userId } = req.user;
    
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    res.json({
      success: true,
      data: result
    });
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
