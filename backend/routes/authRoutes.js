const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getAllUsers,
  deleteUser,
  createUser,
  searchUsers,
  updateUser,
  changePassword,
  updateUserAccess,
  getMe
} = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireAdmin, requireStaff } = require('../middlewares/roleMiddleware');
const { requireOwner, requireSection } = require('../middlewares/requireRole');

// Public
router.post('/register', register);
router.post('/login', login);

// Authenticated self-service
router.get('/me', authMiddleware, getMe);

// Admin-only user management
router.get('/users', authMiddleware, requireStaff, requireSection('users'), getAllUsers);
router.delete('/users/:id', authMiddleware, requireOwner, deleteUser);
router.post('/users', authMiddleware, requireOwner, createUser);
router.get('/users/search', authMiddleware, requireStaff, requireSection('users'), searchUsers);
router.patch('/users/:id/access', authMiddleware, requireOwner, updateUserAccess);

// Authenticated self-service
router.put('/update', authMiddleware, updateUser);
router.put('/change-password', authMiddleware, changePassword);

module.exports = router;
