const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const DATA_PATH = path.join(__dirname, 'data', 'admission-source-map.json');

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
  if (name.includes('venezia')) return 'Venezia';
  if (name.includes('firenze')) return 'Firenze';
  if (name.includes('napoli')) return 'Napoli';
  if (name.includes('padova')) return 'Padova';
  if (name.includes('messina')) return 'Messina';
  if (name.includes('verona')) return 'Verona';
  if (name.includes('milano')) return 'Milano';
  return null;
}

function levelFor(programName) {
  const name = normalize(programName);
  if (
    name.includes('bachelor') ||
    name.includes('undergraduate') ||
    name.startsWith('b ')
  ) {
    return 'Bachelor';
  }
  return 'Master';
}

function firstUrl(entry) {
  return (
    entry.sourceUrl ||
    (Array.isArray(entry.admissionsUrls) && entry.admissionsUrls[0]) ||
    (Array.isArray(entry.programUrls) && entry.programUrls[0]) ||
    (Array.isArray(entry.feesUrls) && entry.feesUrls[0]) ||
    null
  );
}

async function main() {
  if (!fs.existsSync(DATA_PATH)) {
    throw new Error(`Data file not found: ${DATA_PATH}`);
  }

  const entries = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  if (!Array.isArray(entries)) {
    throw new Error('admission-source-map.json must contain a JSON array');
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  console.log(`Found ${entries.length} admission source entries.`);

  for (const entry of entries) {
    const university = String(entry.university || '').trim();
    const programName = String(entry.programName || '').trim();
    const sourceUrl = firstUrl(entry);

    if (!university || !programName || !sourceUrl) {
      skipped += 1;
      console.warn(`Skipped incomplete entry: ${university || 'unknown university'} — ${programName || 'unknown program'}`);
      continue;
    }

    const data = {
      university,
      city: cityFor(university),
      programName,
      level: levelFor(programName),
      language: 'English',
      field: programName,
      sourceName: `Official ${university} admission source`,
      sourceUrl,
      lastVerifiedAt: new Date(),
      verificationStatus: 'NEEDS_REVIEW',
      confidence: 0
    };

    const existing = await prisma.universityProgram.findFirst({
      where: { university, programName }
    });

    if (existing) {
      await prisma.universityProgram.update({
        where: { id: existing.id },
        data
      });
      updated += 1;
      console.log(`Updated #${existing.id}: ${university} — ${programName}`);
    } else {
      const row = await prisma.universityProgram.create({ data });
      created += 1;
      console.log(`Created #${row.id}: ${university} — ${programName}`);
    }
  }

  console.log(JSON.stringify({
    sourceEntries: entries.length,
    created,
    updated,
    skipped
  }, null, 2));
}

main()
  .catch((error) => {
    console.error('Manual admissions seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
