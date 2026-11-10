const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const prisma = require('../config/prisma');

// GET /api/student/dashboard — aggregated student home; userId ONLY from token
const { computePipelineStage, computeDocuments, computeRemainingDue, computeUnreadMessages } = require("../utils/studentPipeline");
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'USER') {
      return res.status(403).json({ success: false, message: 'Accès refusé - Réservé aux étudiants' });
    }
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { isApproved: true, firstName: true, lastName: true, email: true } });
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    if (!user.isApproved) return res.status(403).json({ success: false, message: 'Compte en attente d\'approbation' });

    const dossier = await prisma.dossier.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } });
    const progressPercent = dossier ? Math.round([dossier.traductionStatus, dossier.inscriptionStatus, dossier.visaStatus].filter(s => s === 'VALIDE').length * 33.33) : 0;

    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, amount: true, status: true, userId: true, createdAt: true, prixPaye: true, prixReste: true, prixTotal: true, method: true, paidAt: true }
    });
    const totalPaid = payments.reduce((s, p) => s + Number(p.prixPaye || 0), 0);

    const announcements = await prisma.announcement.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' }, take: 3 });
    const messages = await prisma.message.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 5 });
    const contracts = await prisma.contract.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 1 });

    const openTasks = await prisma.studentTask.count({ where: { userId, status: 'OPEN' } });
    const applications = await prisma.universityInfo.count({ where: { userId } });
    const docCount = await prisma.document.count({ where: { dossierId: dossier ? dossier.id : -1 } });

    const totalDue = payments.reduce((s, p) => s + Number(p.prixTotal || p.amount || 0), 0);
    const pipelineStage = computePipelineStage(dossier);
    const documentsValidated = docCount;
    const documentsMissing = dossier ? Math.max(0, 5 - docCount) : 5;
    const remainingDue = Math.max(0, totalDue - totalPaid);
    const unreadMessages = messages.filter(m => m.sender === 'ADMIN' && !m.readAt).length;

    return res.json({
      success: true,
      data: {
        profile: { id: userId, firstName: user.firstName, lastName: user.lastName, email: user.email, isApproved: user.isApproved },
        dossier: dossier || null,
        progressPercent,
        pipelineStage,
        documentsValidated,
        documentsMissing,
        remainingDue,
        unreadMessages,
        payments: { items: Array.isArray(payments) ? payments : [], totalPaid },
        announcements: Array.isArray(announcements) ? announcements : [],
        messages: Array.isArray(messages) ? messages : [],
        contract: contracts[0] || null,
        counts: { openTasks, applications, documents: docCount }
      }
    });
  } catch (err) {
    console.error('Student /dashboard error:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Sub-routes: userId ONLY from req.user.userId (no URL/body params); each in own try/catch
router.get('/dashboard/payments', authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'USER') return res.status(403).json({ success: false, message: 'Accès refusé' });
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { isApproved: true } });
    if (!user || !user.isApproved) return res.status(403).json({ success: false, message: 'Compte en attente d\'approbation' });
    const data = await prisma.payment.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, select: { id: true, amount: true, status: true, userId: true, createdAt: true, prixPaye: true, prixReste: true, prixTotal: true, method: true, paidAt: true } });
    return res.json({ success: true, data: Array.isArray(data) ? data : [] });
  } catch (err) { console.error('/dashboard/payments error:', err); return res.status(500).json({ success: false, message: 'Erreur serveur' }); }
});

router.get('/dashboard/messages', authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'USER') return res.status(403).json({ success: false, message: 'Accès refusé' });
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { isApproved: true } });
    if (!user || !user.isApproved) return res.status(403).json({ success: false, message: 'Compte en attente d\'approbation' });
    const data = await prisma.message.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 10 });
    return res.json({ success: true, data: Array.isArray(data) ? data : [] });
  } catch (err) { console.error('/dashboard/messages error:', err); return res.status(500).json({ success: false, message: 'Erreur serveur' }); }
});

router.get('/dashboard/announcements', authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'USER') return res.status(403).json({ success: false, message: 'Accès refusé' });
    const user = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { isApproved: true } });
    if (!user || !user.isApproved) return res.status(403).json({ success: false, message: 'Compte en attente d\'approbation' });
    const data = await prisma.announcement.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' }, take: 5 });
    return res.json({ success: true, data: Array.isArray(data) ? data : [] });
  } catch (err) { console.error('/dashboard/announcements error:', err); return res.status(500).json({ success: false, message: 'Erreur serveur' }); }
});

router.get('/dashboard/appointments', authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'USER') return res.status(403).json({ success: false, message: 'Accès refusé' });
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { isApproved: true } });
    if (!user || !user.isApproved) return res.status(403).json({ success: false, message: 'Compte en attente d\'approbation' });
    const data = await prisma.appointment.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
      take: 5,
      select: { id: true, type: true, date: true, status: true, userId: true, etat: true, slotId: true }
    });
    return res.json({ success: true, data: Array.isArray(data) ? data : [] });
  } catch (err) { console.error('/dashboard/appointments error:', err); return res.status(500).json({ success: false, message: 'Erreur serveur' }); }
});

router.get('/dashboard/dossier', authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'USER') return res.status(403).json({ success: false, message: 'Accès refusé' });
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { isApproved: true } });
    if (!user || !user.isApproved) return res.status(403).json({ success: false, message: 'Compte en attente d\'approbation' });
    const data = await prisma.dossier.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } });
    return res.json({ success: true, data: data || null });
  } catch (err) { console.error('/dashboard/dossier error:', err); return res.status(500).json({ success: false, message: 'Erreur serveur' }); }
});

module.exports = router;
