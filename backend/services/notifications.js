const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Encapsule la création d'une notification via $executeRaw (pas besoin de generate)
async function createNotification({ userId, type = 'GENERAL', title, message, link }) {
  try {
    const sql = `
      INSERT INTO notification (userId, type, title, message, link, isRead, createdAt, readAt)
      VALUES (?, ?, ?, ?, ?, 0, NOW(), NULL)
    `;
    const result = await prisma.$executeRaw`
      INSERT INTO notification (userId, type, title, message, link, isRead, createdAt, readAt)
      VALUES (${userId}, ${type}, ${title}, ${message}, ${link}, 0, NOW(), NULL)
    `;
    // Récupérer l'ID inséré si nécessaire via $queryRaw
    const [last] = await prisma.$queryRaw`
      SELECT * FROM notification WHERE userId = ${userId} AND createdAt > DATE_SUB(NOW(), INTERVAL 5 SECOND) ORDER BY id DESC LIMIT 1
    `;
    return { success: true, data: last || { userId, type, title, message, link, isRead: false } };
  } catch (e) {
    console.error('Notification create error:', e);
    return { success: false, error: e.message };
  }
}

async function listForUser(userId, limit = 30) {
  try {
    const rows = await prisma.$queryRaw`
      SELECT * FROM notification WHERE userId = ${userId} ORDER BY createdAt DESC LIMIT ${limit}
    `;
    return { success: true, data: rows || [] };
  } catch (e) {
    console.error('Notification list error:', e);
    return { success: false, error: e.message };
  }
}

async function unreadCount(userId) {
  try {
    const [countRow] = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM notification WHERE userId = ${userId} AND isRead = 0
    `;
    return { success: true, data: Number(countRow?.count || 0) };
  } catch (e) {
    console.error('Notification unreadCount error:', e);
    return { success: false, error: e.message };
  }
}

async function markRead(id, userId) {
  try {
    await prisma.$executeRaw`
      UPDATE notification SET isRead = 1, readAt = NOW() WHERE id = ${id} AND userId = ${userId}
    `;
    return { success: true };
  } catch (e) {
    console.error('Notification markRead error:', e);
    return { success: false, error: e.message };
  }
}

async function markAllRead(userId) {
  try {
    await prisma.$executeRaw`
      UPDATE notification SET isRead = 1, readAt = NOW() WHERE userId = ${userId} AND isRead = 0
    `;
    return { success: true };
  } catch (e) {
    console.error('Notification markAllRead error:', e);
    return { success: false, error: e.message };
  }
}

module.exports = { createNotification, listForUser, unreadCount, markRead, markAllRead };
