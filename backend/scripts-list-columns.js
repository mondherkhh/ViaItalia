// SELECT-only introspection: list every table/column in the `viaitalia` database.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT table_name, column_name, data_type, is_nullable, column_default
       FROM information_schema.columns
       WHERE table_schema = 'viaitalia'
       ORDER BY table_name, ordinal_position`
    );
    const byTable = {};
    for (const r of rows) {
      const t = r.table_name || r.TABLE_NAME;
      const c = r.column_name || r.COLUMN_NAME;
      const d = r.data_type || r.DATA_TYPE;
      const n = r.is_nullable || r.IS_NULLABLE;
      (byTable[t] = byTable[t] || []).push({ column: c, type: d, nullable: n });
    }
    console.log(JSON.stringify(byTable, null, 2));
  } catch (e) {
    console.error('INTROSPECTION_ERROR:', e.message);
  } finally {
    await prisma.$disconnect();
  }
})();
