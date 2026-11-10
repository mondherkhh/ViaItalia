// READ-ONLY: list columns of specific tables
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const TABLES = process.argv.slice(2);

(async () => {
  try {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT table_name, column_name, data_type, is_nullable, column_default, extra
       FROM information_schema.columns
       WHERE table_schema = 'viaitalia'
         AND table_name IN (${TABLES.map(() => '?').join(',')})
       ORDER BY table_name, ordinal_position`,
      ...TABLES
    );
    const byTable = {};
    for (const r of rows) {
      const t = r.table_name || r.TABLE_NAME;
      const c = r.column_name || r.COLUMN_NAME;
      const d = r.data_type || r.DATA_TYPE;
      const n = r.is_nullable || r.IS_NULLABLE;
      const def = r.column_default === undefined ? r.COLUMN_DEFAULT : r.column_default;
      const ex = r.extra || r.EXTRA;
      (byTable[t] = byTable[t] || []).push(`${c} ${d}${n === 'YES' ? ' NULL' : ' NOT NULL'}${def !== null && def !== undefined ? ' DEFAULT ' + def : ''}${ex && ex !== '' ? ' ' + ex : ''}`);
    }
    for (const [t, cols] of Object.entries(byTable)) {
      console.log('\n== ' + t + ' ==');
      cols.forEach(c => console.log('  ' + c));
    }
  } catch (e) {
    console.error('ERR:', e.message);
  } finally {
    await prisma.$disconnect();
  }
})();
