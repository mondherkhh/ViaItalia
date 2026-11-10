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
const { requireAdmin, requireStaff } = require('../middlewares/roleMiddleware');
const { requireSection } = require('../middlewares/requireRole');

const router = express.Router();

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
router.get('/user/:userId', authMiddleware, requireStaff, requireSection('users'), getContractByUserIdAdmin);

// Get all contracts (admin only)
router.get('/', authMiddleware, requireStaff, requireSection('payments'), getAllContracts);

// Update contract status (admin only)
router.patch('/:id/status', authMiddleware, requireStaff, requireSection('payments'), updateContractStatus);

// Download contract (admin only)
router.get('/:id/download', authMiddleware, requireStaff, requireSection('payments'), downloadContract);

// Delete contract (admin only)
router.delete('/:id', authMiddleware, requireStaff, requireSection('payments'), deleteContract);

// Get contract status (authenticated users)
router.get('/status/:userId', authMiddleware, getContractStatus);

module.exports = router;
