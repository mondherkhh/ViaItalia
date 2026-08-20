const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const DATA_DIR = path.join(__dirname, 'data');
const BATCH_PATH = path.join(DATA_DIR, 'admission-source-map.json');
const ACTIVE_MAP_PATH = path.join(DATA_DIR, 'admission-source-map.json');

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function cityFor(university) {
  const name = normalize(university);
  if (name.includes('torino')) return 'Torino';
  if (name.includes('siena')) return 'Siena';
  if (name.includes('vergata') || name.includes('roma')) return 'Roma';
  if (name.includes('trento')) return 'Trento';
  if (name.includes('ferrara')) return 'Ferrara';
  if (name.includes('bologna')) return 'Bologna';
  return null;
}

function levelFor(programName) {
  const name = normalize(programName);
  return name.includes('bachelor') || name.startsWith('b ') ? 'Bachelor' : 'Master';
}

function sourceEntryFor(entry, id) {
  return {
    programId: id,
    manual: true,
    university: entry.university,
    programName: entry.programName,
    programUrls: entry.programUrls || [],
    admissionsUrls: entry.admissionsUrls || [],
    feesUrls: entry.feesUrls || [],
    verifiedAcademicYear: '2026/27',
    sourceOnly: true,
    doNotUseManualDates: true,
    notes: 'Official source URLs only. Dates and fees must be extracted during sync; no manual dates or fees are stored.'
  };
}

async function main() {
  const batch = JSON.parse(fs.readFileSync(BATCH_PATH, 'utf8'));
  const activeMap = JSON.parse(fs.readFileSync(ACTIVE_MAP_PATH, 'utf8'));
  if (!Array.isArray(activeMap)) throw new Error('admission-source-map.json must contain an array');
  if (!Array.isArray(batch.entries)) throw new Error('Batch source map must contain entries[]');

  const now = new Date();
  let created = 0;
  let updated = 0;
  let mapped = 0;

  for (const entry of batch.entries) {
    const sourceUrl = (entry.admissionsUrls || [])[0] || (entry.programUrls || [])[0];
    if (!sourceUrl) throw new Error(`No official URL for ${entry.university} / ${entry.programName}`);

    const data = {
      university: entry.university,
      city: cityFor(entry.university),
      programName: entry.programName,
      level: levelFor(entry.programName),
      language: 'English',
      field: entry.programName,
      sourceName: `Official ${entry.university} admission source`,
      sourceUrl,
      lastVerifiedAt: now,
      verificationStatus: 'NEEDS_REVIEW',
      confidence: 0
    };

    const existing = await prisma.universityProgram.findFirst({
      where: { university: data.university, programName: data.programName }
    });

    const row = existing
      ? await prisma.universityProgram.update({ where: { id: existing.id }, data })
      : await prisma.universityProgram.create({ data });

    if (existing) updated += 1; else created += 1;

    const found = activeMap.find(item =>
      normalize(item.university) === normalize(data.university) &&
      normalize(item.programName) === normalize(data.programName)
    );
    const mappedEntry = sourceEntryFor(entry, row.id);
    if (found) Object.assign(found, mappedEntry);
    else activeMap.push(mappedEntry);
    mapped += 1;

    console.log(`${existing ? 'Updated' : 'Created'} #${row.id}: ${data.university} — ${data.programName}`);
  }

  const temp = `${ACTIVE_MAP_PATH}.tmp`;
  fs.writeFileSync(temp, `${JSON.stringify(activeMap, null, 2)}\n`, 'utf8');
  fs.renameSync(temp, ACTIVE_MAP_PATH);
  console.log(JSON.stringify({ created, updated, mapped, batchEntries: batch.entries.length }, null, 2));
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
