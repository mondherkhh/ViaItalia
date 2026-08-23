const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');

// Get all notifications for the authenticated user
router.get('/', authMiddleware, getUserNotifications);

// Get unread notifications count for the authenticated user
router.get('/unread/count', authMiddleware, getUnreadCount);

// Mark a specific notification as read
router.put('/:id/read', authMiddleware, markAsRead);

// Mark all notifications as read for the authenticated user
router.put('/read-all', authMiddleware, markAllAsRead);

// Delete a specific notification
router.delete('/:id', authMiddleware, deleteNotification);

module.exports = router;
