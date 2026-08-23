const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/roleMiddleware');
const controller = require('../controllers/admissionsSyncController');

router.use(auth, requireAdmin);
router.post('/start', controller.startAdmissionsSync);
router.get('/:jobId', controller.getAdmissionsSyncStatus);
router.delete('/:jobId', controller.cancelAdmissionsSync);

module.exports = router;
