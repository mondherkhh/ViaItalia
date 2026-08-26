const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireAdmin, requireSelfOrAdmin } = require('../middlewares/roleMiddleware');

// All payment routes require authentication
router.use(authMiddleware);

// --- Admin-only management ---
// Create a new payment
router.post('/', requireAdmin, paymentController.createPayment);

// Get all payments
router.get('/', requireAdmin, paymentController.getAllPayments);

// Get global payment statistics
router.get('/stats', requireAdmin, paymentController.getPaymentStats);

// Get payment by ID
router.get('/:id', requireAdmin, paymentController.getPaymentById);

// Update payment
router.put('/:id', requireAdmin, paymentController.updatePayment);

// Delete payment
router.delete('/:id', requireAdmin, paymentController.deletePayment);

// --- Owner or admin ---
// Add partial payment (owner pays their own installment; ownership enforced in controller)
router.post('/:id/add-payment', paymentController.addPayment);

// Get payments by user ID
router.get('/users/:userId/payments', requireSelfOrAdmin, paymentController.getPaymentsByUserId);

module.exports = router;
