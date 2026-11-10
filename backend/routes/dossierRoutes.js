const express = require('express');
const router = express.Router();
const dossierController = require('../controllers/dossierController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireAdmin, requireSelfOrAdmin, requireStaff } = require('../middlewares/roleMiddleware');
const { requireSection } = require('../middlewares/requireRole');

// All dossier routes require authentication
router.use(authMiddleware);

// --- Admin/staff management ---
// Create a new dossier
router.post('/', requireStaff, requireSection('students'), dossierController.createDossier);

// Create missing dossiers for existing users
router.post('/create-missing', requireStaff, requireSection('students'), dossierController.createMissingDossiers);

// Get all dossiers
router.get('/', requireStaff, requireSection('students'), dossierController.getAllDossiers);

// Get dossier statistics
router.get('/stats', requireStaff, requireSection('students'), dossierController.getDossierStats);

// Get dossier by ID
router.get('/:id', requireStaff, requireSection('students'), dossierController.getDossierById);

// Update dossier (status progression managed by the agency)
router.put('/:id', requireStaff, requireSection('students'), dossierController.updateDossier);

// Delete dossier
router.delete('/:id', requireStaff, requireSection('students'), dossierController.deleteDossier);

// --- Owner or admin ---
// Get dossiers by user ID
router.get('/users/:userId/dossiers', requireSelfOrAdmin, dossierController.getDossiersByUserId);

// Get single dossier by user ID
router.get('/user/:userId', requireSelfOrAdmin, dossierController.getDossierByUserId);

module.exports = router;
