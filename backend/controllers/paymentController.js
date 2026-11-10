const prisma = require("../config/prisma");

// Create a new payment
const createPayment = async (req, res) => {
  try {
    const { userId: reqUserId, studentId, amount, prixTotal, prixPaye = 0, status = 'PENDING', method, loggedBy } = req.body;
    const userId = parseInt(reqUserId || studentId);
    
    const effectivePrixTotal = (prixTotal != null && !isNaN(parseFloat(prixTotal))) ? parseFloat(prixTotal) : parseFloat(amount || 0);
    const effectivePrixPaye = parseFloat(prixPaye || 0);
    const prixReste = effectivePrixTotal - effectivePrixPaye;
    
    if (req.user && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Seul un admin peut créer un paiement' });
    }
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: parseFloat(amount),
        prixTotal: effectivePrixTotal,
        prixPaye: effectivePrixPaye,
        prixReste,
        status: 'PENDING',
        method: method || null,
        loggedBy: null,
        paidAt: null
      }
    });

    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: payment
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({
      success: false,
      message: "Error creating payment",
      error: error.message
    });
  }
};

// Get all payments
const getAllPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: {},
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payments",
      error: error.message
    });
  }
};

// Get payment by ID
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const payment = await prisma.payment.findUnique({
      where: {
        id: parseInt(id)
      },

    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment",
      error: error.message
    });
  }
};

// Update payment
const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, prixTotal, prixPaye, status } = req.body;
    
    // Calculate remaining amount if prixPaye or prixTotal is provided
    let prixReste;
    if (prixPaye !== undefined && prixTotal !== undefined) {
      prixReste = prixTotal - prixPaye;
    } else if (prixPaye !== undefined) {
      // Get current payment to calculate new reste
      const currentPayment = await prisma.payment.findUnique({
        where: { id: parseInt(id) }
      });
      if (!currentPayment) {
        return res.status(404).json({
          success: false,
          message: "Payment not found"
        });
      }
      prixReste = currentPayment.prixTotal - prixPaye;
    }

    const updateData = {};
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (prixTotal !== undefined) updateData.prixTotal = parseFloat(prixTotal);
    if (prixPaye !== undefined) updateData.prixPaye = parseFloat(prixPaye);
    if (prixReste !== undefined) updateData.prixReste = parseFloat(prixReste);
    if (status !== undefined) updateData.status = status;

    const payment = await prisma.payment.update({
      where: {
        id: parseInt(id)
      },
      data: updateData,

    });

    res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      data: payment
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    res.status(500).json({
      success: false,
      message: "Error updating payment",
      error: error.message
    });
  }
};

// Add payment amount (partial payment)
const addPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Payment amount must be greater than 0"
      });
    }

    const currentPayment = await prisma.payment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!currentPayment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    // Ownership check: a regular user can only pay their own installment.
    if (req.user.role !== 'ADMIN' && currentPayment.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Accès refusé - Ce paiement ne vous appartient pas"
      });
    }

    const newPrixPaye = currentPayment.prixPaye + parseFloat(amount);
    const newPrixReste = currentPayment.prixTotal - newPrixPaye;
    
    // Check if overpaid
    if (newPrixReste < 0) {
      return res.status(400).json({
        success: false,
        message: "Payment amount exceeds remaining balance"
      });
    }

    // Update status if fully paid
    const newStatus = newPrixReste === 0 ? 'PAID' : currentPayment.status;

    const payment = await prisma.payment.update({
      where: {
        id: parseInt(id)
      },
      data: {
        prixPaye: newPrixPaye,
        prixReste: newPrixReste,
        status: newStatus
      },

    });

    res.status(200).json({
      success: true,
      message: "Payment added successfully",
      data: payment
    });
  } catch (error) {
    console.error("Error adding payment:", error);
    res.status(500).json({
      success: false,
      message: "Error adding payment",
      error: error.message
    });
  }
};

// Delete payment
const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const payment = await prisma.payment.delete({
      where: {
        id: parseInt(id)
      }
    });

    res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
      data: payment
    });
  } catch (error) {
    console.error("Error deleting payment:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting payment",
      error: error.message
    });
  }
};

// Get payments for the authenticated user (client read-only via /me)
const getMyPayments = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const payments = await prisma.payment.findMany({
      where: { userId: parseInt(req.user.userId) },
            orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    console.error('Error fetching my payments:', error, '| userId=', req.user?.userId, '| stack=', error.stack);
    res.status(500).json({ success: false, message: error.message || 'Erreur', error: error.message });
  }
};

// Get payments by user ID
const getPaymentsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const payments = await prisma.payment.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    console.error("Error fetching user payments:", error);
    res.status(500).json({ success: false, message: "Error fetching user payments", error: error.message });
  }
};

// Get payment statistics
const getPaymentStats = async (req, res) => {
  try {
    const totalPayments = await prisma.payment.count();
    const paidPayments = await prisma.payment.count({ where: { status: 'PAID' } });
    const pendingPayments = await prisma.payment.count({ where: { status: 'PENDING' } });
    const totalAmount = await prisma.payment.aggregate({ _sum: { amount: true } });
    const totalPaid = await prisma.payment.aggregate({ _sum: { amount: true } });
    const totalRemaining = await prisma.payment.aggregate({ _sum: { amount: true } });
    res.status(200).json({
      success: true,
      data: {
        totalPayments, paidPayments, pendingPayments,
        totalAmount: totalAmount._sum.amount || 0,
        totalPaid: totalPaid._sum.amount || 0,
        totalRemaining: totalRemaining._sum.amount || 0
      }
    });
  } catch (error) {
    console.error("Error fetching payment stats:", error);
    res.status(500).json({ success: false, message: "Error fetching payment stats", error: error.message });
  }
};

module.exports = {
  createPayment, getAllPayments, getPaymentById, updatePayment, addPayment, deletePayment, getPaymentsByUserId, getMyPayments, getPaymentStats
};
