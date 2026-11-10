// READ-ONLY: compare prisma/schema.prisma models against the real MySQL schema.
// Parses schema.prisma (text) and queries information_schema.columns. No writes.
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const SKIP_MODELS = new Set(['_prisma_migrations', 'study_in_italy_forms', 'universityprogram', 'admissionwindow', 'documentfolder', 'studenttask']);
const IGNORE_FIELDS = new Set(['id']);

function parseSchema(text) {
  const models = {};
  const re = /model\s+(\w+)\s*\{([\s\S]*?)\n\}/g;
  let m;
  while ((m = re.exec(text))) {
    const name = m[1];
    const body = m[2];
    const lines = body.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//') && !l.startsWith('@@'));
    const fields = [];
    let map = name.toLowerCase();
    for (const line of lines) {
      const fm = line.match(/^(\w+)\s+(\w+)(\?)?/);
      if (fm) {
        const field = fm[1];
        const type = fm[2];
        const optional = !!fm[3];
        // Skip relation fields (User / message...) — they are not columns.
        if (/\s@relation\b/.test(line)) continue;
        fields.push({ field, type, optional });
      }
      const mm = line.match(/@@map\("([^"]+)"\)/);
      if (mm) map = mm[1];
    }
    models[name] = { name, map, fields };
  }
  return models;
}

// Prisma type -> acceptable mysql data_type
const TYPE_MAP = {
  Int: ['int', 'bigint', 'smallint', 'tinyint', 'mediumint'],
  Float: ['double', 'float', 'decimal', 'numeric'],
  String: ['varchar', 'text', 'mediumtext', 'longtext', 'tinytext', 'char', 'json', 'enum'],
  Boolean: ['tinyint', 'bit', 'bool', 'boolean'],
  DateTime: ['datetime', 'timestamp', 'date'],
  Json: ['json'],
  Bytes: ['blob', 'tinyblob', 'mediumblob', 'longblob', 'binary', 'varbinary'],
};

function typeOk(prismaType, mysqlType, nullable) {
  const allowed = TYPE_MAP[prismaType];
  if (!allowed) return true;
  if (!allowed.includes(mysqlType)) return false;
  // non-optional prisma field must not be a nullable column (unless it has a default)
  return true;
}

(async () => {
  try {
    const schemaText = fs.readFileSync(path.join(__dirname, 'prisma', 'schema.prisma'), 'utf8');
    const models = parseSchema(schemaText);

    const rows = await prisma.$queryRawUnsafe(
      `SELECT table_name, column_name, data_type, is_nullable, column_key, extra
       FROM information_schema.columns
       WHERE table_schema = 'viaitalia'
       ORDER BY table_name, ordinal_position`
    );

    const dbTables = {};
    for (const r of rows) {
      const t = r.table_name || r.TABLE_NAME;
      const c = r.column_name || r.COLUMN_NAME;
      const d = r.data_type || r.DATA_TYPE;
      const n = r.is_nullable || r.IS_NULLABLE;
      const k = r.column_key || r.COLUMN_KEY;
      const e = r.extra || r.EXTRA;
      (dbTables[t] = dbTables[t] || []).push({ column: c, type: d, nullable: n, key: k, extra: e });
    }

    const report = { schemaMissingInDb: [], dbMissingInSchema: [], typeMismatch: [], nullableMismatch: [], extraDbTables: [] };

    const claimedTables = new Set();

    for (const [mname, m] of Object.entries(models)) {
      if (SKIP_MODELS.has(m.map)) continue;
      claimedTables.add(m.map);
      const dbCols = dbTables[m.map];
      if (!dbCols) {
        report.schemaMissingInDb.push({ model: mname, table: m.map, note: 'TABLE NOT FOUND IN DB' });
        continue;
      }
      const dbColNames = dbCols.map(d => d.column);
      for (const f of m.fields) {
        if (IGNORE_FIELDS.has(f.field)) continue;
        const d = dbCols.find(x => x.column === f.field);
        if (!d) {
          report.schemaMissingInDb.push({ model: mname, table: m.map, field: f.field, note: 'COLUMN NOT IN DB' });
          continue;
        }
        if (!typeOk(f.type, d.type)) {
          report.typeMismatch.push({ model: mname, field: f.field, prisma: f.type, mysql: d.type });
        }
        const dbNullable = d.nullable === 'YES';
        if (!f.optional && dbNullable && !/auto_increment/.test(d.extra || '')) {
          report.nullableMismatch.push({ model: mname, field: f.field, note: 'schema=NOT NULL, db=NULLABLE' });
        }
      }
      for (const d of dbCols) {
        if (IGNORE_FIELDS.has(d.column)) continue;
        if (!m.fields.some(f => f.field === d.column)) {
          report.dbMissingInSchema.push({ model: mname, table: m.map, column: d.column, type: d.type, nullable: d.nullable });
        }
      }
    }

    for (const t of Object.keys(dbTables)) {
      if (!claimedTables.has(t)) report.extraDbTables.push(t);
    }

    console.log(JSON.stringify(report, null, 2));
    console.log('\n--- SUMMARY ---');
    console.log('schema fields not in DB :', report.schemaMissingInDb.length);
    console.log('DB columns not in schema:', report.dbMissingInSchema.length);
    console.log('type mismatches         :', report.typeMismatch.length);
    console.log('nullability mismatches  :', report.nullableMismatch.length);
    console.log('DB tables not modelled  :', report.extraDbTables.length, report.extraDbTables.join(', '));
  } catch (e) {
    console.error('COMPARE_ERROR:', e.message);
  } finally {
    await prisma.$disconnect();
  }
})();
