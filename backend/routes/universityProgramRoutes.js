const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { requireAdmin, requireStaff } = require('../middlewares/roleMiddleware');
const { requireSection } = require('../middlewares/requireRole');
const controller = require('../controllers/universityProgramController');

router.use(auth, requireStaff, requireSection('programs'));
router.get('/', controller.listPrograms);
router.get('/institutions', controller.listInstitutions);
router.get('/catalogue', controller.discoverCatalogue);
router.post('/catalogue/enrich', controller.enrichCatalogue);
router.post('/catalogue/import', controller.importCatalogue);
router.post('/sync', controller.syncPrograms);
router.post('/', controller.createProgram);

module.exports = router;
