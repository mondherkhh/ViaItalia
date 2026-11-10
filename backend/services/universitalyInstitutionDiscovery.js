'use strict';

const axios = require('axios');

const UNIVERSITALY_API = String(
  process.env.UNIVERSITALY_API_URL || 'https://universitaly-backend.cineca.it'
).replace(/\/$/, '');

const REQUEST_TIMEOUT = Math.max(
  5000,
  Number(process.env.UNIVERSITALY_INSTITUTIONS_TIMEOUT_MS || 20000)
);

const USER_AGENT = process.env.ADMISSIONS_USER_AGENT ||
  'ViaItaliaInstitutionDiscovery/1.0 (+admin-controlled official-source sync)';

function asText(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text || null;
}

function normaliseUrl(value) {
  const raw = asText(value);
  if (!raw) return null;
  try {
    const url = new URL(raw.startsWith('//') ? `https:${raw}` : raw);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    url.hash = '';
    return url.toString().replace(/\/$/, '');
  } catch (_) {
    return null;
  }
}

function normaliseName(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/["'’`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function normaliseInstitution(record, type) {
  if (!record || typeof record !== 'object') return null;
  const name = asText(record.nomeEn || record.nome || record.name);
  if (!name) return null;

  const officialUrl = normaliseUrl(record.url || record.website || record.link);
  const id = asText(record.idStrutture || record.id || record.code);
  const code = asText(record.codeUn || record.code);
  const regionCode = asText(record.codeReg || record.regionCode || record.region);
  const address = asText(record.indirizzoEn || record.indirizzo || record.address);

  return {
    externalId: id,
    code,
    name,
    nameOriginal: asText(record.nome),
    officialUrl,
    address,
    regionCode,
    type: type === 'afam' ? 'AFAM' : 'UNIVERSITY',
    normalizedName: normaliseName(name),
    sourceName: 'Universitaly',
    sourceUrl: 'https://www.universitaly.it/en/cerca-istituzioni',
    fetchedAt: new Date()
  };
}

function uniqueInstitutions(records) {
  const unique = new Map();
  for (const record of records) {
    if (!record) continue;
    const key = record.externalId
      ? `${record.type}|id|${record.externalId}`
      : `${record.type}|name|${record.normalizedName}|${record.regionCode || ''}`;
    if (!unique.has(key)) unique.set(key, record);
  }
  return [...unique.values()];
}

async function fetchInstitutionPayload() {
  const response = await axios.get(
    `${UNIVERSITALY_API}/api/usocomune/universita-afam`,
    {
      timeout: REQUEST_TIMEOUT,
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' }
    }
  );
  return response.data || {};
}

async function fetchAllInstitutions() {
  const payload = await fetchInstitutionPayload();
  const universities = Array.isArray(payload.universita) ? payload.universita : [];
  const afam = Array.isArray(payload.afam) ? payload.afam : [];
  const records = uniqueInstitutions([
    ...universities.map(item => normaliseInstitution(item, 'university')),
    ...afam.map(item => normaliseInstitution(item, 'afam'))
  ]);

  return {
    records,
    totals: {
      all: records.length,
      universities: records.filter(item => item.type === 'UNIVERSITY').length,
      afam: records.filter(item => item.type === 'AFAM').length,
      regions: new Set(records.map(item => item.regionCode).filter(Boolean)).size
    },
    source: {
      api: `${UNIVERSITALY_API}/api/usocomune/universita-afam`,
      website: 'https://www.universitaly.it/en/cerca-istituzioni'
    },
    fetchedAt: new Date()
  };
}

function groupByRegion(records) {
  const grouped = new Map();
  for (const record of Array.isArray(records) ? records : []) {
    const key = record.regionCode || 'UNKNOWN';
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(record);
  }
  return Object.fromEntries(
    [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b))
  );
}

function findInstitutionSeeds(records, { type, regionCode, search } = {}) {
  const query = String(search || '').trim().toLowerCase();
  return (Array.isArray(records) ? records : []).filter(record => {
    if (type && record.type !== type) return false;
    if (regionCode && String(record.regionCode) !== String(regionCode)) return false;
    if (query && !`${record.name} ${record.address || ''}`.toLowerCase().includes(query)) return false;
    return true;
  });
}

module.exports = {
  fetchAllInstitutions,
  groupByRegion,
  findInstitutionSeeds,
  normaliseInstitution,
  normaliseUrl,
  normaliseName
};
