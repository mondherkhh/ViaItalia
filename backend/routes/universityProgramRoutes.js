const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/roleMiddleware');
const controller = require('../controllers/universityProgramController');

router.use(auth, requireAdmin);
router.get('/', controller.listPrograms);
router.post('/sync', controller.syncPrograms);
router.post('/', controller.createProgram);

module.exports = router;
