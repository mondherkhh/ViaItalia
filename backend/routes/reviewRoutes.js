const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { requireAdmin, requireStaff } = require('../middlewares/roleMiddleware');
const { requireSection } = require('../middlewares/requireRole');
const { createReview, createAdminReview, getMyReviews, getApprovedReviews, getAdminReviews, moderateReview, deleteAdminReview } = require('../controllers/reviewController');

router.get('/approved', getApprovedReviews);
router.use(authMiddleware);
router.post('/', createReview);
router.post('/admin', requireStaff, requireSection('reviews'), createAdminReview);
router.get('/mine', getMyReviews);
router.get('/admin', requireStaff, requireSection('reviews'), getAdminReviews);
router.patch('/:id/moderate', requireStaff, requireSection('reviews'), moderateReview);
const logDeleteRequest = (req, res, next) => {
  console.log('[REVIEWS DELETE ROUTE] received', { method: req.method, url: req.originalUrl, id: req.params.id });
  next();
};
router.delete('/:id', logDeleteRequest, requireStaff, requireSection('reviews'), deleteAdminReview);
router.post('/admin/:id/delete', logDeleteRequest, requireStaff, requireSection('reviews'), deleteAdminReview);

module.exports = router;
