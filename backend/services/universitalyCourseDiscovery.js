'use strict';

const axios = require('axios');

const UNIVERSITALY_API = String(
  process.env.UNIVERSITALY_API_URL || 'https://universitaly-backend.cineca.it'
).replace(/\/$/, '');
const REQUEST_TIMEOUT = Math.max(5000, Number(process.env.UNIVERSITY_SYNC_TIMEOUT_MS || 20000));
const PAGE_CONCURRENCY = Math.max(1, Number(process.env.UNIVERSITY_SYNC_CONCURRENCY || 5));
const DEFAULT_MAX_PAGES = Math.max(1, Number(process.env.UNIVERSITY_SYNC_MAX_PAGES || 600));

const CUN_AREAS = {
  '01': 'Scienze matematiche e informatiche',
  '02': 'Scienze fisiche',
  '03': 'Scienze chimiche',
  '04': 'Scienze della terra',
  '05': 'Scienze biologiche',
  '06': 'Scienze mediche',
  '07': 'Scienze agrarie e veterinarie',
  '08': 'Ingegneria civile, architettura e design',
  '09': 'Ingegneria industriale e dell’informazione',
  '10': 'Scienze dell’antichità, filologico-letterarie e storico-artistiche',
  '11': 'Scienze storiche, filosofiche, pedagogiche e psicologiche',
  '12': 'Scienze giuridiche',
  '13': 'Scienze economiche e statistiche',
  '14': 'Scienze politiche e sociali',
  '15': 'Musica'
};

function asText(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === 'object') {
    return value.descrizioneEn || value.descrizione || value.label || value.value || null;
  }
  const text = String(value).trim();
  return text || null;
}

function getCity(value) {
  if (!value) return null;
  if (typeof value === 'string') return value.trim() || null;
  return value.nome || value.nomeSede || value.comune || value.city || value.descrizione || null;
}

function normaliseLanguage(value) {
  const code = String(value || '').toUpperCase();
  if (code === 'EN' || code.includes('INGLESE') || code.includes('ENGLISH')) return 'English';
  if (code === 'IT' || code.includes('ITALIANO') || code.includes('ITALIAN')) return 'Italian';
  if (code === 'FR' || code.includes('FRANCESE') || code.includes('FRENCH')) return 'French';
  return value ? String(value).trim() : null;
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseMoney(value) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'number') return `${value} EUR`;
  return String(value).trim() || null;
}

function normaliseCourse(course, fetchedAt = new Date()) {
  const areaCode = String(course.area || course.classe?.areaCun || '').padStart(2, '0');
  const programName = String(course.nomeCorsoEn || course.nomeCorso || course.programName || '').trim();
  const university = String(course.nomeStruttura || course.university || '').trim();
  if (!programName || !university) return null;

  const sourceUrl = course.url
    ? String(course.url)
    : `https://www.universitaly.it/cerca-corsi?searchText=${encodeURIComponent(programName)}`;

  return {
    externalId: course.id || course.idCorso || null,
    institutionId: course.idStrutture || course.idStruttura || null,
    institutionCode: course.codeUn || null,
    university,
    city: getCity(course.sede),
    programName,
    level: asText(course.tipoLaurea) || course.level || null,
    language: normaliseLanguage(course.lingua),
    field: asText(course.classe) || CUN_AREAS[areaCode] || asText(course.areaCun) || 'Autre',
    openingDate: parseDate(course.openingDate || course.applicationOpen || course.dataApertura),
    closingDate: parseDate(course.closingDate || course.applicationDeadline || course.dataChiusura),
    applicationFee: parseMoney(course.applicationFee || course.applicationCost),
    tuition: parseMoney(course.tuition || course.tuitionFee),
    sourceName: course.url ? 'Universitaly / official programme page' : 'Universitaly',
    sourceUrl,
    lastVerifiedAt: fetchedAt,
    verificationStatus: 'NEEDS_REVIEW'
  };
}

function cleanParams(input) {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== '';
  }));
}

async function fetchPage(page, filters = {}) {
  const response = await axios.get(`${UNIVERSITALY_API}/api/offerta-formativa/cerca-corsi`, {
    timeout: REQUEST_TIMEOUT,
    headers: { Accept: 'application/json' },
    params: cleanParams({ searchType: filters.searchType || 'u', page, ...filters, order: filters.order || 'ASC' })
  });
  return response.data || {};
}

async function fetchAllCourses(filters = {}, maxPages = DEFAULT_MAX_PAGES) {
  const fetchedAt = new Date();
  const first = await fetchPage(1, filters);
  const totalPages = Math.max(1, Number(first.totalPages || 1));
  const pagesFetched = Math.min(totalPages, Math.max(1, Number(maxPages)));
  const rawCourses = Array.isArray(first.corsi) ? [...first.corsi] : [];

  for (let start = 2; start <= pagesFetched; start += PAGE_CONCURRENCY) {
    const pageNumbers = Array.from(
      { length: Math.min(PAGE_CONCURRENCY, pagesFetched - start + 1) },
      (_, index) => start + index
    );
    const responses = await Promise.all(pageNumbers.map(page => fetchPage(page, filters)));
    responses.forEach(page => {
      if (Array.isArray(page.corsi)) rawCourses.push(...page.corsi);
    });
  }

  const unique = new Map();
  for (const raw of rawCourses) {
    const course = normaliseCourse(raw, fetchedAt);
    if (!course) continue;
    const key = course.externalId
      ? `id:${course.externalId}`
      : `${course.university.toLowerCase()}|${course.programName.toLowerCase()}|${course.sourceUrl}`;
    if (!unique.has(key)) unique.set(key, course);
  }

  const records = [...unique.values()];
  return {
    records,
    totalResults: Number(first.totalResults || records.length),
    totalPages,
    pagesFetched,
    institutions: new Set(records.map(item => item.institutionId || item.university)).size,
    fetchedAt
  };
}

function groupCoursesByInstitution(records) {
  const groups = new Map();
  for (const record of Array.isArray(records) ? records : []) {
    const key = record.institutionId || record.university;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(record);
  }
  return Object.fromEntries([...groups.entries()].map(([key, courses]) => [String(key), courses]));
}

module.exports = {
  fetchAllCourses,
  groupCoursesByInstitution,
  normaliseCourse
};
