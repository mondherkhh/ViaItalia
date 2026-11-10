const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const requireStaff = require('../middlewares/roleMiddleware').requireStaff;
const { requireSection } = require('../middlewares/requireRole');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// Settings-driven thresholds (defaults when no stored setting exists)
const getThreshold = async (key, defaultVal) => {
  try {
    const row = await prisma.agencySetting.findUnique({ where: { settingKey: key } });
    if (row && row.settingValue !== null && row.settingValue !== '') {
      const n = parseInt(row.settingValue, 10); if (!isNaN(n)) return n;
    }
  } catch (e) {}
  return defaultVal;
};

router.get('/', authMiddleware, requireStaff, requireSection('alerts'), async (req, res) => {
  const results = [];
  try {
    // unanswered
    try {
      const users = await prisma.user.findMany({ where: { role: 'USER' }, select: { id: true, firstName: true, lastName: true, email: true, createdAt: true } });
      const messagesAll = await prisma.message.findMany({ select: { id: true, content: true, sender: true, userId: true, createdAt: true }, orderBy: { createdAt: 'asc' } });
      for (const user of users) {
        try {
          const userMsgs = messagesAll.filter(m => m.userId === user.id);
          if (userMsgs.length === 0) continue;
          const lastMsg = userMsgs[userMsgs.length - 1];
          const lastAdmin = userMsgs.filter(m => m.sender === 'ADMIN').pop() || null;
          const lastUserTime = new Date(lastMsg.createdAt);
          const now = new Date();
          if (lastMsg.sender === 'USER' && (!lastAdmin || new Date(lastAdmin.createdAt) < lastUserTime)) {
            // Threshold comes from settings with default of 1 day (current behaviour preserved)
            const unreadDays = await getThreshold('unreadAlertAfterDays', 1);
            const ageDays = Math.round((now - lastUserTime) / 86400000);
            if (ageDays >= unreadDays) {
              const year = new Date(user.createdAt).getFullYear();
              const caseRef = `VIA-${year}-${String(user.id).padStart(4, '0')}`;
              results.push({ id: `unanswered-${user.id}`, type: 'unanswered', severity: 'red', title: `${user.firstName || ''} ${user.lastName || ''}`.trim() + ` — message waiting ${ageDays} days`, description: `Nobody in the agency has replied to this conversation. Reference ${caseRef}.`, userId: user.id, dossierId: null, caseRef, createdAt: lastMsg.createdAt, group: now.toDateString() === lastUserTime.toDateString() ? 'today' : 'earlier' });
            }
          }
        } catch (e) { console.error('alerts unanswered per-user:', e.message); }
      }
    } catch (e) { console.error('alerts unanswered block:', e.message); }

    // abandoned (Dossier has NO updatedAt — use createdAt only)
    try {
      const forgottenDays = await getThreshold('forgottenAfterDays', 14);
      const dossiers = await prisma.dossier.findMany({ select: { id: true, title: true, status: true, userId: true, createdAt: true } });
      for (const d of dossiers) {
        try {
          const diffMs = new Date() - new Date(d.createdAt);
          const days = Math.round(diffMs / 86400000);
          if (days > forgottenDays) {
            const userMap = {};
            // build minimal user map from existing query above not available; do separate minimal query if needed, but avoid extra cost by not requiring full users
            // For simplicity, get user from user list already fetched or do a quick lookup
          }
        } catch (e) { console.error('alerts abandoned per-dossier:', e.message); }
      }
    } catch (e) { console.error('alerts abandoned block:', e.message); }

    // task_done
    try {
      const tasks = await prisma.message.findMany({ where: { sender: 'USER' }, select: { id: true, userId: true, content: true, createdAt: true }, orderBy: { createdAt: 'asc' } });
      for (const t of tasks) {
        try {
          const completedAt = t.createdAt;
          const diffMs = new Date() - new Date(completedAt);
          if (diffMs <= 30 * 86400000 && diffMs >= 0) {
            const user = await prisma.user.findUnique({ where: { id: t.userId }, select: { id: true, firstName: true, lastName: true, createdAt: true } }).catch(() => null);
            const year = user ? new Date(user.createdAt).getFullYear() : 2024;
            const caseRef = `VIA-${year}-${String(t.userId || t.id).padStart(4, '0')}`;
            results.push({ id: `taskdone-${t.id}`, type: 'task_done', severity: 'green', title: `${user ? (user.firstName || '') + ' ' + (user.lastName || '') : 'Student'} completed a task`, description: t.content ? t.content.slice(0, 120) : '', userId: t.userId, dossierId: null, caseRef, createdAt: completedAt, group: new Date().toDateString() === new Date(completedAt).toDateString() ? 'today' : 'earlier' });
          }
        } catch (e) { console.error('alerts task_done per-task:', e.message); }
      }
    } catch (e) { console.error('alerts task_done block:', e.message); }

    // new_message
    try {
      const messagesAll = await prisma.message.findMany({ select: { id: true, content: true, sender: true, userId: true, createdAt: true }, orderBy: { createdAt: 'asc' } });
      const recentMessages = messagesAll.filter(m => m.sender === 'USER');
      const groupedByUser = {};
      for (const m of recentMessages) {
        if (!groupedByUser[m.userId] || new Date(m.createdAt) > new Date(groupedByUser[m.userId].createdAt)) groupedByUser[m.userId] = m;
      }
      for (const userIdStr in groupedByUser) {
        try {
          const msg = groupedByUser[userIdStr];
          const diffMs = new Date() - new Date(msg.createdAt);
          if (diffMs <= 7 * 86400000 && diffMs >= 0) {
            const alreadyUnanswered = results.find(r => r.type === 'unanswered' && r.userId === msg.userId);
            if (alreadyUnanswered) continue;
            const user = await prisma.user.findUnique({ where: { id: msg.userId }, select: { id: true, firstName: true, lastName: true, createdAt: true } }).catch(() => null);
            const year = user ? new Date(user.createdAt).getFullYear() : 2024;
            const caseRef = `VIA-${year}-${String(msg.userId).padStart(4, '0')}`;
            results.push({ id: `newmsg-${msg.userId}-${msg.id}`, type: 'new_message', severity: 'blue', title: `${user ? (user.firstName || '') + ' ' + (user.lastName || '') : 'Student'} sent you a message`, description: msg.content ? msg.content.slice(0, 120) : '', userId: msg.userId, dossierId: null, caseRef, createdAt: msg.createdAt, group: new Date().toDateString() === new Date(msg.createdAt).toDateString() ? 'today' : 'earlier' });
          }
        } catch (e) { console.error('alerts new_message per-msg:', e.message); }
      }
    } catch (e) { console.error('alerts new_message block:', e.message); }

    // abandoned simplified: use createdAt only, get users minimally if needed
    try {
      const usersMinimal = await prisma.user.findMany({ where: { role: 'USER' }, select: { id: true, firstName: true, lastName: true, createdAt: true } });
      const userMap = {}; usersMinimal.forEach(u => userMap[u.id] = u);
      const dossiers = await prisma.dossier.findMany({ select: { id: true, title: true, status: true, userId: true, createdAt: true } });
      for (const d of dossiers) {
        try {
          const diffMs = new Date() - new Date(d.createdAt);
          const days = Math.round(diffMs / 86400000);
          if (days > forgottenDays) {
            const user = userMap[d.userId] || null;
            if (!user || user.role !== 'USER' || (!user.firstName && !user.lastName)) {
              // skip: no matching user account or name missing
              continue;
            }
            const year = new Date(user.createdAt).getFullYear();
            const caseRef = `VIA-${year}-${String(d.userId || d.id).padStart(4, '0')}`;
            results.push({ id: `abandoned-${d.id}`, type: 'abandoned', severity: 'red', title: `${user ? (user.firstName || '') + ' ' + (user.lastName || '') : 'Unknown'} — case untouched for ${days} days`, description: `No case activity since ${new Date(d.createdAt).toISOString().split('T')[0]}. Reference ${caseRef}.`, userId: d.userId, dossierId: d.id, caseRef, createdAt: d.createdAt, group: new Date().toDateString() === new Date(d.createdAt).toDateString() ? 'today' : 'earlier' });
          }
        } catch (e) { console.error('alerts abandoned per-dossier:', e.message); }
      }
    } catch (e) { console.error('alerts abandoned block:', e.message); }

    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json({ success: true, data: results.slice(0, 100) });
  } catch (e) {
    console.error('alerts global error:', e.message);
    return res.status(500).json({ success: false, message: e.message || 'Failed to compute alerts' });
  }
});

module.exports = router;
