const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { Prisma } = require('@prisma/client');

const VALID_FOLDERS = ['Personal', 'Academic journey', 'Visa documents', 'Translations', 'Admissions'];

const getAccess = async (userId, folder) => {
  const result = await prisma.$queryRaw(
    Prisma.sql`SELECT * FROM folderaccess WHERE userId = ${parseInt(userId)} AND folder = ${folder}`
  );
  return result.length > 0 ? result[0] : null;
};

const setAccess = async (userId, folder, allowed, updatedById = null) => {
  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO folderaccess (userId, folder, allowed, updatedById, updatedAt)
    VALUES (${parseInt(userId)}, ${folder}, ${allowed ? 1 : 0}, ${updatedById ? parseInt(updatedById) : null}, NOW())
    ON DUPLICATE KEY UPDATE allowed = ${allowed ? 1 : 0}, updatedById = ${updatedById ? parseInt(updatedById) : null}, updatedAt = NOW()
  `);
};

const isAllowed = async (userId, folder) => {
  const result = await prisma.$queryRaw(
    Prisma.sql`SELECT allowed FROM folderaccess WHERE userId = ${parseInt(userId)} AND folder = ${folder}`
  );
  return result.length > 0 ? !!result[0].allowed : false;
};

const getAllForStudent = async (userId) => {
  return await prisma.$queryRaw(
    Prisma.sql`SELECT * FROM folderaccess WHERE userId = ${parseInt(userId)} ORDER BY folder ASC`
  );
};

module.exports = { VALID_FOLDERS, getAccess, setAccess, isAllowed, getAllForStudent };
