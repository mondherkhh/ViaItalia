const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const DATA_DIR = path.join(__dirname, 'data');
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
  if (name.includes('firenze')) return 'Firenze';
  if (name.includes('messina')) return 'Messina';
  if (name.includes('napoli')) return 'Napoli';
  if (name.includes('padova')) return 'Padova';
  if (name.includes('bologna')) return 'Bologna';
  if (name.includes('venezia')) return 'Venezia';
  if (name.includes('verona')) return 'Verona';
  return null;
}

function levelFor(programName) {
  const name = normalize(programName);
  return name.includes('bachelor') || name.startsWith('b ') ? 'Bachelor' : 'Master';
}

function sourceUrlFor(entry) {
  return (entry.admissionsUrls || [])[0] || (entry.programUrls || [])[0] || null;
}

async function main() {
  if (!fs.existsSync(ACTIVE_MAP_PATH)) {
    throw new Error(`Missing data file: ${ACTIVE_MAP_PATH}`);
  }

  const entries = JSON.parse(fs.readFileSync(ACTIVE_MAP_PATH, 'utf8'));
  if (!Array.isArray(entries)) {
    throw new Error('admission-source-map.json must contain an array');
  }

  const now = new Date();
  let created = 0;
  let updated = 0;

  for (const entry of entries) {
    if (!entry.university || !entry.programName) {
      console.warn('Skipped incomplete entry:', entry);
      continue;
    }

    const sourceUrl = sourceUrlFor(entry);
    const data = {
      university: entry.university,
      city: cityFor(entry.university),
      programName: entry.programName,
      level: levelFor(entry.programName),
      language: entry.language || 'English',
      field: entry.field || entry.programName,
      sourceName: entry.sourceName || `Official ${entry.university} admission source`,
      sourceUrl,
      lastVerifiedAt: now,
      verificationStatus: entry.verificationStatus || 'NEEDS_REVIEW',
      confidence: entry.confidence ?? 0,
    };

    const existing = await prisma.universityProgram.findFirst({
      where: {
        university: data.university,
        programName: data.programName,
      },
    });

    if (existing) {
      await prisma.universityProgram.update({
        where: { id: existing.id },
        data,
      });
      updated += 1;
      console.log(`Updated #${existing.id}: ${data.university} — ${data.programName}`);
    } else {
      const row = await prisma.universityProgram.create({ data });
      created += 1;
      console.log(`Created #${row.id}: ${data.university} — ${data.programName}`);
    }
  }

  console.log(JSON.stringify({
    created,
    updated,
    mapEntries: entries.length,
    note: 'This script upserts map entries and does not delete existing database records.',
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
