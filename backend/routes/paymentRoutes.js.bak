const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireStaff, requireSelfOrAdmin } = require('../middlewares/roleMiddleware');
const { requireSection } = require('../middlewares/requireRole');

// All payment routes require authentication
router.use(authMiddleware);

// --- Admin-only management ---
// Create a new payment
router.post('/', requireStaff, paymentController.createPayment);

// Get all payments
router.get('/', requireStaff, requireSection('payments'), paymentController.getAllPayments);

// Get global payment statistics
router.get('/stats', requireStaff, paymentController.getPaymentStats);

// Get payment by ID
router.get('/:id', requireStaff, paymentController.getPaymentById);

// Update payment
router.put('/:id', requireStaff, paymentController.updatePayment);

// Delete payment
router.delete('/:id', requireStaff, paymentController.deletePayment);

// --- Owner or admin ---
// Add partial payment (owner pays their own installment; ownership enforced in controller)
router.post('/:id/add-payment', paymentController.addPayment);

// Get payments for the authenticated user (client read-only)
router.get('/me', authMiddleware, paymentController.getMyPayments);

// Get payments by user ID
router.get('/users/:userId/payments', requireSelfOrAdmin, paymentController.getPaymentsByUserId);

module.exports = router;
