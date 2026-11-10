require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkExists(query) {
  try {
    const result = await prisma.$queryRawUnsafe(query);
    return Array.isArray(result) && result.length > 0 ? result[0] : result;
  } catch (e) {
    return null;
  }
}

async function run() {
  console.log('=== START COUNTS ===');
  const userCount = await prisma.$queryRawUnsafe('SELECT COUNT(*) as c FROM User');
  const msgCount  = await prisma.$queryRawUnsafe('SELECT COUNT(*) as c FROM Message');
  const docCount  = await prisma.$queryRawUnsafe('SELECT COUNT(*) as c FROM Document');
  const uniCount  = await prisma.$queryRawUnsafe('SELECT COUNT(*) as c FROM UniversityInfo');
  console.log('Users:', userCount[0].c, '| Messages:', msgCount[0].c, '| Documents:', docCount[0].c, '| UniversityInfo:', uniCount[0].c);

  // a. StudentTask table
  const stTable = await checkExists("SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'StudentTask'");
  if (!stTable) {
    try {
      await prisma.$executeRawUnsafe(`CREATE TABLE \`StudentTask\` (\`id\` int NOT NULL AUTO_INCREMENT, \`userId\` int NOT NULL, \`dossierId\` int, \`type\` enum('PAYMENTS','DOCUMENTS','UNIVERSITIES','GENERAL') NOT NULL DEFAULT 'GENERAL', \`title\` varchar(191) NOT NULL, \`description\` longtext, \`amount\` decimal(10,2), \`currency\` varchar(191) DEFAULT 'TND', \`folder\` varchar(191), \`status\` enum('OPEN','DONE') NOT NULL DEFAULT 'OPEN', \`assignedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), \`completedAt\` datetime(3), \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), \`updatedAt\` datetime(3) NOT NULL, PRIMARY KEY (\`id\`), INDEX \`StudentTask_userId_idx\` (\`userId\`), CONSTRAINT \`StudentTask_userId_fkey\` FOREIGN KEY (\`userId\`) REFERENCES \`User\` (\`id\`) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
      console.log('created StudentTask');
    } catch (e) { console.log('StudentTask error:', e.message); }
  } else { console.log('StudentTask: already exists'); }

  // b. DocumentFolder table
  const dfTable = await checkExists("SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'DocumentFolder'");
  if (!dfTable) {
    try {
      await prisma.$executeRawUnsafe(`CREATE TABLE \`DocumentFolder\` (\`id\` int NOT NULL AUTO_INCREMENT, \`dossierId\` int NOT NULL, \`name\` varchar(191) NOT NULL, \`status\` varchar(191) NOT NULL DEFAULT 'INCOMPLETE', \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), \`updatedAt\` datetime(3) NOT NULL, PRIMARY KEY (\`id\`), INDEX \`DocumentFolder_dossierId_fkey\` (\`dossierId\`), CONSTRAINT \`DocumentFolder_dossierId_fkey\` FOREIGN KEY (\`dossierId\`) REFERENCES \`Dossier\` (\`id\`) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
      console.log('created DocumentFolder');
    } catch (e) { console.log('DocumentFolder error:', e.message); }
  } else { console.log('DocumentFolder: already exists'); }

  const cols = [
    { table: 'UniversityInfo', col: 'status', sql: "ALTER TABLE \`UniversityInfo\` ADD COLUMN \`status\` ENUM('AWAITING_PAYMENT','APPLIED','ACCEPTED','REJECTED') NOT NULL DEFAULT 'APPLIED';" },
    { table: 'UniversityInfo', col: 'city', sql: "ALTER TABLE \`UniversityInfo\` ADD COLUMN \`city\` VARCHAR(191) NULL;" },
    { table: 'UniversityInfo', col: 'language', sql: "ALTER TABLE \`UniversityInfo\` ADD COLUMN \`language\` VARCHAR(191) NULL;" },
    { table: 'UniversityInfo', col: 'appliedAt', sql: "ALTER TABLE \`UniversityInfo\` ADD COLUMN \`appliedAt\` DATETIME(3) NULL;" },
    { table: 'UniversityInfo', col: 'decidedAt', sql: "ALTER TABLE \`UniversityInfo\` ADD COLUMN \`decidedAt\` DATETIME(3) NULL;" },
    { table: 'UniversityInfo', col: 'isFinalChoice', sql: "ALTER TABLE \`UniversityInfo\` ADD COLUMN \`isFinalChoice\` TINYINT(1) NOT NULL DEFAULT 0;" },
    { table: 'UniversityInfo', col: 'offerDocumentId', sql: "ALTER TABLE \`UniversityInfo\` ADD COLUMN \`offerDocumentId\` INT NULL;" },
    { table: 'Message', col: 'readAt', sql: "ALTER TABLE \`Message\` ADD COLUMN \`readAt\` DATETIME(3) NULL;" },
    { table: 'Document', col: 'storedPath', sql: "ALTER TABLE \`Document\` ADD COLUMN \`storedPath\` VARCHAR(191) NULL;" },
    { table: 'Document', col: 'mimeType', sql: "ALTER TABLE \`Document\` ADD COLUMN \`mimeType\` VARCHAR(191) NULL;" },
    { table: 'Document', col: 'uploadedById', sql: "ALTER TABLE \`Document\` ADD COLUMN \`uploadedById\` INT NULL;" },
  ];

  for (const item of cols) {
    const colCheck = await checkExists(`SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '${item.table}' AND COLUMN_NAME = '${item.col}'`);
    if (!colCheck) {
      try {
        await prisma.$executeRawUnsafe(item.sql);
        console.log('created column:', item.table + '.' + item.col);
      } catch (e) { console.log('error ' + item.table + '.' + item.col + ':', e.message); }
    } else { console.log('already exists:', item.table + '.' + item.col); }
  }

  console.log('=== END COUNTS ===');
  const userCount2 = await prisma.$queryRawUnsafe('SELECT COUNT(*) as c FROM User');
  const msgCount2  = await prisma.$queryRawUnsafe('SELECT COUNT(*) as c FROM Message');
  const docCount2  = await prisma.$queryRawUnsafe('SELECT COUNT(*) as c FROM Document');
  const uniCount2  = await prisma.$queryRawUnsafe('SELECT COUNT(*) as c FROM UniversityInfo');
  console.log('Users:', userCount2[0].c, '| Messages:', msgCount2[0].c, '| Documents:', docCount2[0].c, '| UniversityInfo:', uniCount2[0].c);
}

run().catch((e) => console.error('FATAL:', e.message)).finally(async () => { await prisma.$disconnect(); });
