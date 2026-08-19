'use strict';

const fs = require('fs');
const path = require('path');

const MAP_PATH = process.env.ADMISSIONS_SOURCE_MAP_PATH
  ? path.resolve(process.env.ADMISSIONS_SOURCE_MAP_PATH)
  : path.join(__dirname, '..', 'data', 'admission-source-map.json');

let cache = null;
let cacheMtime = 0;

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function tokens(value) {
  return normalize(value).split(/\s+/).filter(token => token.length >= 4);
}

function readMap() {
  try {
    const stat = fs.statSync(MAP_PATH);
    if (cache && stat.mtimeMs === cacheMtime) return cache;
    const parsed = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
    cache = Array.isArray(parsed) ? parsed : [];
    cacheMtime = stat.mtimeMs;
    return cache;
  } catch (_) {
    cache = [];
    cacheMtime = 0;
    return cache;
  }
}

function cleanUrls(value) {
  const values = Array.isArray(value) ? value : [value];
  return [...new Set(values.filter(url => typeof url === 'string' && /^https?:\/\//i.test(url.trim())).map(url => url.trim()))];
}

function scoreEntry(entry, program) {
  if (entry.manual !== true && entry.manual !== 'true') return -1;
  if (entry.programId != null && Number(entry.programId) > 0 && Number(program.id) > 0 && Number(entry.programId) === Number(program.id)) return 1000;
  const university = normalize(program.university);
  const entryUniversity = normalize(entry.university);
  const name = normalize(program.programName);
  const entryName = normalize(entry.programName);
  if (entryUniversity && university && entryUniversity !== university && !university.includes(entryUniversity) && !entryUniversity.includes(university)) return -1;
  if (entryName && name && entryName !== name && !name.includes(entryName) && !entryName.includes(name)) return -1;
  const uTokens = tokens(entryUniversity);
  const pTokens = tokens(entryName);
  const uRatio = uTokens.length ? uTokens.filter(t => university.includes(t)).length / uTokens.length : 0;
  const pRatio = pTokens.length ? pTokens.filter(t => name.includes(t)).length / pTokens.length : 0;
  const field = normalize(program.field);
  const entryField = normalize(entry.field);
  const language = normalize(program.language);
  const entryLanguage = normalize(entry.language);
  if (entryField && field && entryField !== field && !field.includes(entryField) && !entryField.includes(field)) return -1;
  if (entryLanguage && language && entryLanguage !== language && !language.includes(entryLanguage) && !entryLanguage.includes(language)) return -1;
  const fieldScore = entryField && field ? 100 : 0;
  const languageScore = entryLanguage && language ? 50 : 0;
  return Math.round(uRatio * 300 + pRatio * 500 + fieldScore + languageScore);
}

function upsertDirectSource(program, enrichment) {
  const evidence = Array.isArray(enrichment?.evidence) ? enrichment.evidence : [];
  const urls = cleanUrls(evidence.flatMap(item => [item?.url, ...(item?.openingEvidence || []).map(x => x?.url), ...(item?.closingEvidence || []).map(x => x?.url), ...(item?.feeEvidence || []).map(x => x?.url)]));
  if (!urls.length) return false;
  const entries = readMap().slice();
  const identity = entry => entry.programId != null && Number(entry.programId) > 0
    ? `id:${Number(entry.programId)}`
    : `name:${normalize(entry.university)}|${normalize(entry.programName)}`;
  const key = identity(program);
  const index = entries.findIndex(entry => identity(entry) === key);
  const next = {
    ...(index >= 0 ? entries[index] : {}),
    programId: Number(program.id) > 0 ? Number(program.id) : (index >= 0 ? entries[index].programId : 0),
    university: program.university,
    programName: program.programName,
    admissionsUrls: urls,
    lastDiscoveredAt: new Date().toISOString(),
    discovery: 'evidence'
  };
  if (index >= 0) entries[index] = next; else entries.push(next);
  try {
    fs.mkdirSync(path.dirname(MAP_PATH), { recursive: true });
    const temp = `${MAP_PATH}.tmp`;
    fs.writeFileSync(temp, `${JSON.stringify(entries, null, 2)}\n`, 'utf8');
    fs.renameSync(temp, MAP_PATH);
    cache = entries;
    cacheMtime = fs.statSync(MAP_PATH).mtimeMs;
    return true;
  } catch (error) {
    console.warn(`[Admissions] direct source map write failed: ${error.message}`);
    return false;
  }
}

function getDirectSource(program, options = {}) {
  const manualOnly = options.manualOnly !== false;
  const best = readMap()
    .filter(entry => !manualOnly || entry.manual === true || entry.manual === 'true')
    .map(entry => ({ entry, score: scoreEntry(entry, program) }))
    .filter(item => item.score >= 700)
    .sort((a, b) => b.score - a.score)[0];
  if (!best) return null;
  const entry = best.entry;
  const programUrls = cleanUrls(entry.programUrls || entry.programUrl);
  const admissionsUrls = cleanUrls(entry.admissionsUrls || entry.urls || entry.admissionUrl);
  const feesUrls = cleanUrls(entry.feesUrls || entry.feeUrl || entry.tuitionUrls);
  const sourceUrls = [...new Set([...admissionsUrls, ...feesUrls])];
  if (!sourceUrls.length) return null;
  return {
    ...entry,
    programUrls,
    admissionsUrls,
    feesUrls,
    sourceUrls,
    sourceMap: 'direct',
    sourceMapScore: best.score
  };
}

module.exports = { MAP_PATH, getDirectSource, upsertDirectSource, normalize };
