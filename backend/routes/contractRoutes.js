const express = require('express');
const multer = require('multer');
const {
  uploadContract,
  getContractByUserId,
  getContractByUserIdAdmin,
  getAllContracts,
  updateContractStatus,
  downloadContract,
  deleteContract,
  getContractStatus
} = require('../controllers/contractController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Admin check middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Accès non autorisé - Admin requis'
    });
  }
  next();
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const path = require('path');
    const uploadDir = path.join(__dirname, '../uploads/contracts');
    
    // Create upload directory if it doesn't exist
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1000);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.pdf');
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF sont autorisés'), false);
    }
  }
});

// Contract routes
router.post('/upload', authMiddleware, upload.single('contract'), uploadContract);

// Get user's own contract
router.get('/my-contract', authMiddleware, getContractByUserId);

// Get contract by user ID (admin only)
router.get('/user/:userId', authMiddleware, requireAdmin, getContractByUserIdAdmin);

// Get all contracts (admin only)
router.get('/', authMiddleware, requireAdmin, getAllContracts);

// Update contract status (admin only)
router.patch('/:id/status', authMiddleware, requireAdmin, updateContractStatus);

// Download contract (admin only)
router.get('/:id/download', authMiddleware, requireAdmin, downloadContract);

// Delete contract (admin only)
router.delete('/:id', authMiddleware, requireAdmin, deleteContract);

// Get contract status (authenticated users)
router.get('/status/:userId', authMiddleware, getContractStatus);

module.exports = router;
