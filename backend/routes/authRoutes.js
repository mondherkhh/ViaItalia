const express = require("express");
const router = express.Router();
const { register, login, getAllUsers, deleteUser, createUser, searchUsers, updateUser, changePassword } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const { requireAdmin } = require("../middlewares/roleMiddleware");

// Public
router.post("/register", register);
router.post("/login", login);

// Admin-only user management
router.get("/users", authMiddleware, requireAdmin, getAllUsers);
router.delete("/users/:id", authMiddleware, requireAdmin, deleteUser);
router.post("/users", authMiddleware, requireAdmin, createUser);
router.get("/users/search", authMiddleware, requireAdmin, searchUsers);

// Authenticated self-service
router.put("/update", authMiddleware, updateUser);
router.put("/change-password", authMiddleware, changePassword);

module.exports = router;