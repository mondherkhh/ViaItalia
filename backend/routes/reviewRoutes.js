const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/roleMiddleware');
const { createReview, getMyReviews, getApprovedReviews, getAdminReviews, moderateReview } = require('../controllers/reviewController');

router.get('/approved', getApprovedReviews);
router.use(authMiddleware);
router.post('/', createReview);
router.get('/mine', getMyReviews);
router.get('/admin', requireAdmin, getAdminReviews);
router.patch('/:id/moderate', requireAdmin, moderateReview);

module.exports = router;
