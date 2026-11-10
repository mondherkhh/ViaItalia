const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const requireStaff = require('../middlewares/roleMiddleware').requireStaff;
const { requireSection } = require('../middlewares/requireRole');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/stats', authMiddleware, requireStaff, requireSection('payments'), async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({ select: { amount: true, status: true, userId: true } });
    const collected = payments.filter(p => p.status === 'PAID').reduce((s, p) => s + (p.amount || 0), 0);
    const dossiers = await prisma.dossier.findMany({ select: { agreedFee: true, userId: true } });
    const agreedFees = dossiers.reduce((s, d) => s + (d.agreedFee ? parseFloat(d.agreedFee) : 0), 0);
    const outstanding = Math.max(agreedFees - collected, 0);
    res.json({ success: true, data: { collected, outstanding, agreedFees, expenses: 0, totalIncome: collected } });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: e.message }); }
});

router.get('/', authMiddleware, requireStaff, requireSection('payments'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const q = (req.query.q || '').toLowerCase();
    const skip = (page - 1) * pageSize;
    const users = await prisma.user.findMany({ where: { role: 'USER' }, select: { id: true, firstName: true, lastName: true } });
    const userMap = {}; users.forEach(u => { userMap[u.id] = `${(u.firstName || '')} ${(u.lastName || '')}`.trim() || '—'; });
    const statusFilter = req.query.status || 'ALL';
    const where = statusFilter === 'ALL' ? {} : (statusFilter === 'PAID' ? { status: 'PAID' } : (statusFilter === 'PENDING' ? { status: 'PENDING' } : {}));
    const allPaid = await prisma.payment.findMany({ where, orderBy: { createdAt: 'desc' }, select: { id: true, userId: true, amount: true, method: true, paidAt: true, loggedBy: true, status: true, createdAt: true } });
    let items = allPaid.filter(p => {
      if (!q) return true;
      const name = (userMap[p.userId] || '').toLowerCase();
      return name.includes(q);
    });
    const total = items.length;
    items = items.slice(skip, skip + pageSize);
    const data = items.map(p => ({ id: p.id, userId: p.userId, studentName: userMap[p.userId] || '—', amount: p.amount, method: p.method || null, date: p.paidAt ? p.paidAt.toISOString() : p.createdAt.toISOString(), loggedBy: p.loggedBy || null, hasReceipt: false, status: p.status }));
    res.json({ success: true, data: { items: data, total, page, pageSize } });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: e.message }); }
});

router.post('/', authMiddleware, requireStaff, requireSection('payments'), async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    const userId = Number(req.body.userId);
    const { method, date } = req.body;
    if (!userId || isNaN(amount) || amount <= 0) return res.status(400).json({ success: false, message: 'Valid userId and amount > 0 required' });
    if (!['Cash', 'Card', 'Bank transfer'].includes(method)) return res.status(400).json({ success: false, message: 'Method must be Cash, Card or Bank transfer' });
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
    if (!user || user.role !== 'USER') return res.status(400).json({ success: false, message: 'User not found or not a student' });
    const admin = await prisma.user.findUnique({ where: { id: (req.user && req.user.userId) ? Number(req.user.userId) : null }, select: { firstName: true, lastName: true } });
    const loggedBy = admin ? `${(admin.firstName || '')} ${(admin.lastName || '')}`.trim() || 'Admin' : 'Admin';
    const prise = amount;
    const prixPaye = 0;
    const prixReste = prise - prixPaye;
    const adminId = (req.user && req.user.userId) ? Number(req.user.userId) : null;
    const payment = await prisma.payment.create({ data: { userId, amount, prixTotal: prise, prixPaye, prixReste, status: 'PENDING', method: method || null, paidAt: null, loggedBy: adminId ? loggedBy : null } });
    res.json({ success: true, data: payment.id });
  } catch (e) {
    console.error("PAYMENT CREATE ERROR:", e);
    const msg = (e.message || '').trim();
    const lastLine = msg.split(/\r?\n/).pop().trim();
    res.status(500).json({ success: false, message: lastLine || msg });
  }
});

router.patch('/:id/mark-paid', authMiddleware, requireStaff, requireSection('payments'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const admin = await prisma.user.findUnique({ where: { id: (req.user && req.user.userId) ? Number(req.user.userId) : null }, select: { firstName: true, lastName: true } });
    const loggedBy = admin ? `${(admin.firstName || '')} ${(admin.lastName || '')}`.trim() || 'Admin' : 'Admin';
    const payment = await prisma.payment.update({ where: { id }, data: { status: 'PAID', paidAt: new Date(), loggedBy } });
    res.json({ success: true, data: payment });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: e.message }); }
});

router.patch('/:id/mark-pending', authMiddleware, requireStaff, requireSection('payments'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const payment = await prisma.payment.update({ where: { id }, data: { status: 'PENDING', paidAt: null, loggedBy: null } });
    res.json({ success: true, data: payment });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: e.message }); }
});

router.patch('/:id/status', authMiddleware, requireStaff, requireSection('payments'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    if (status !== 'PAID' && status !== 'PENDING') return res.status(400).json({ success: false, message: 'Status must be PAID or PENDING' });
    const admin = await prisma.user.findUnique({ where: { id: (req.user && req.user.userId) ? Number(req.user.userId) : null }, select: { firstName: true, lastName: true } });
    const loggedBy = admin ? `${(admin.firstName || '')} ${(admin.lastName || '')}`.trim() || 'Admin' : 'Admin';
    const update = { status };
    if (status === 'PAID') {
      update.paidAt = new Date();
      update.loggedBy = loggedBy;
    } else {
      update.paidAt = null;
      update.loggedBy = null;
    }
    const payment = await prisma.payment.update({ where: { id }, data: update });
    res.json({ success: true, data: payment });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/:id', authMiddleware, requireStaff, requireSection('payments'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.payment.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: e.message }); }
});

router.patch('/dossier-fee/:dossierId', authMiddleware, requireStaff, requireSection('payments'), async (req, res) => {
  try {
    const dossierId = parseInt(req.params.dossierId);
    const { agreedFee } = req.body;
    await prisma.dossier.update({ where: { id: dossierId }, data: { agreedFee: agreedFee ? parseFloat(agreedFee) : null } });
    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
