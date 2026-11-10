const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');

// GET /api/public-invites/:token — validate invite (public endpoint)
router.get('/:token', async (req, res) => {
  try {
    const token = String(req.params.token || '').trim();
    if (!token) return res.status(400).json({ success: false, message: 'Token manquant.' });

    const invite = await prisma.studentInvite.findUnique({ where: { token } });
    if (!invite) return res.status(404).json({ success: false, message: 'Invitation introuvable.' });

    if (invite.usedAt) return res.status(410).json({ success: false, message: 'Invitation déjà utilisée.' });

    if (new Date(invite.expiresAt) < new Date()) {
      return res.status(410).json({ success: false, message: 'Invitation expirée.' });
    }

    return res.json({ success: true, valid: true, email: invite.email });
  } catch (error) {
    console.error('GET /public-invites/:token error:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;