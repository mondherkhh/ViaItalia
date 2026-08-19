const express = require('express');
const router = express.Router();
const dossierController = require('../controllers/dossierController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireAdmin, requireSelfOrAdmin } = require('../middlewares/roleMiddleware');

// All dossier routes require authentication
router.use(authMiddleware);

// --- Admin-only management ---
// Create a new dossier
router.post('/', requireAdmin, dossierController.createDossier);

// Create missing dossiers for existing users
router.post('/create-missing', requireAdmin, dossierController.createMissingDossiers);

// Get all dossiers
router.get('/', requireAdmin, dossierController.getAllDossiers);

// Get dossier statistics
router.get('/stats', requireAdmin, dossierController.getDossierStats);

// Get dossier by ID
router.get('/:id', requireAdmin, dossierController.getDossierById);

// Update dossier (status progression managed by the agency)
router.put('/:id', requireAdmin, dossierController.updateDossier);

// Delete dossier
router.delete('/:id', requireAdmin, dossierController.deleteDossier);

// --- Owner or admin ---
// Get dossiers by user ID
router.get('/users/:userId/dossiers', requireSelfOrAdmin, dossierController.getDossiersByUserId);

// Get single dossier by user ID
router.get('/user/:userId', requireSelfOrAdmin, dossierController.getDossierByUserId);

module.exports = router;
