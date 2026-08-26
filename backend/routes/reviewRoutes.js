const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/roleMiddleware');
const { createReview, createAdminReview, getMyReviews, getApprovedReviews, getAdminReviews, moderateReview, deleteAdminReview } = require('../controllers/reviewController');

router.get('/approved', getApprovedReviews);
router.use(authMiddleware);
router.post('/', createReview);
router.post('/admin', requireAdmin, createAdminReview);
router.get('/mine', getMyReviews);
router.get('/admin', requireAdmin, getAdminReviews);
router.patch('/:id/moderate', requireAdmin, moderateReview);
const logDeleteRequest = (req, res, next) => {
  console.log('[REVIEWS DELETE ROUTE] received', { method: req.method, url: req.originalUrl, id: req.params.id });
  next();
};
router.delete('/:id', logDeleteRequest, requireAdmin, deleteAdminReview);
router.post('/admin/:id/delete', logDeleteRequest, requireAdmin, deleteAdminReview);

module.exports = router;
