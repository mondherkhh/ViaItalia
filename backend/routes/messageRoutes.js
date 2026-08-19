const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { requireAdmin, requireSelfOrAdmin } = require("../middlewares/roleMiddleware");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/messages/';
    // Ensure directory exists
    const fs = require('fs');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow common file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé. Types autorisés: ' + allowedTypes.join(', ')), false);
    }
  }
});

const {
  createMessage,
  getAllMessages,
  getMessageById,
  getMessagesByUserId,
  getMessagesBySender,
  updateMessage,
  deleteMessage
} = require("../controllers/messageController");

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create message (file upload optional)
router.post("/", upload.any(), (req, res, next) => {
  // upload.any() puts files in req.files; normalise the first "file" field to req.file
  if (req.files && req.files.length > 0) {
    const uploadedFile = req.files[0];
    if (uploadedFile.fieldname === 'file') {
      req.file = uploadedFile;
    }
  }
  next(); // Continue to controller
}, createMessage);

// Get all messages (admin only)
router.get("/", requireAdmin, getAllMessages);

// Get message by ID
router.get("/:id", getMessageById);

// Get messages by user ID (owner or admin)
router.get("/user/:userId", requireSelfOrAdmin, getMessagesByUserId);

// Get messages by sender (admin only)
router.get("/sender/:sender", requireAdmin, getMessagesBySender);

// Update message
router.put("/:id", updateMessage);

// Delete message
router.delete("/:id", deleteMessage);

module.exports = router;
