const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireOwner } = require('../middlewares/requireRole');
const prisma = require('../config/prisma');

// POST /api/invites — owner only
router.post('/', authMiddleware, requireOwner, async (req, res) => {
  try {
    const email = req.body?.email ? String(req.body.email).trim().toLowerCase() : null;
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const invite = await prisma.studentInvite.create({
      data: {
        token,
        email,
        expiresAt,
        createdById: req.user.userId
      }
    });
    const url = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?invite=${token}`;
    return res.json({ success: true, data: { token, url, expiresAt: invite.expiresAt, email: invite.email || null } });
  } catch (error) {
    console.error('POST /invites error:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/invites/manual — admin only; create student directly
router.post('/manual', authMiddleware, requireOwner, async (req, res) => {
  try {
    const firstName = String(req.body?.firstName || '').trim();
    const lastName = String(req.body?.lastName || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const phoneNumber = String(req.body?.phoneNumber || '').trim();
    const passport = req.body?.passport ? String(req.body.passport).trim() : null;
    const address = req.body?.address ? String(req.body.address).trim() : null;
    const password = req.body?.password ? String(req.body.password) : null;
    const bcrypt = require('bcryptjs');

    if (!firstName || firstName.length > 60 || !lastName || lastName.length > 60) {
      return res.status(400).json({ success: false, message: 'Prénom et nom requis (1-60 caractères).' });
    }
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!email || !validEmail) return res.status(400).json({ success: false, message: 'Adresse email invalide.' });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ success: false, message: 'Un utilisateur avec cette adresse email existe déjà.' });

    const tempPassword = password || crypto.randomBytes(8).toString('hex');
    const hashed = await bcrypt.hash(tempPassword, 10);
    const user = await prisma.user.create({
      data: {
        firstName, lastName, email, password: hashed,
        passport, address, phoneNumber,
        role: 'USER', isApproved: false
      }
    });

    // Optionally create dossier same as register flow
    try {
      await prisma.dossier.create({ data: { title: `Dossier de ${firstName} ${lastName}`, status: 'PENDING', userId: user.id } });
    } catch (e) { /* ignore */ }

    return res.status(201).json({
      success: true,
      message: 'Étudiant créé.',
      user: { id: user.id, firstName, lastName, email, role: user.role, isApproved: user.isApproved, createdAt: user.createdAt },
      temporaryPassword: password ? null : tempPassword
    });
  } catch (error) {
    console.error('POST /invites/manual error:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;
