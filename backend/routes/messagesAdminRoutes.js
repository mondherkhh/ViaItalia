const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { requireAdmin, requireStaff } = require("../middlewares/roleMiddleware");
const { requireSection } = require("../middlewares/requireRole");
const controller = require("../controllers/messagesAdminController");

router.get("/conversations", authMiddleware, requireStaff, requireSection('messages'), controller.getConversations);
router.get("/conversation/:userId", authMiddleware, requireStaff, requireSection('messages'), controller.getConversation);
router.post("/conversation/:userId", authMiddleware, requireStaff, requireSection('messages'), controller.sendMessage);
router.patch("/conversation/:userId/read", authMiddleware, requireStaff, requireSection('messages'), controller.markRead);
router.get("/unread-count", authMiddleware, requireStaff, requireSection('messages'), controller.getUnreadCount);

module.exports = router;
