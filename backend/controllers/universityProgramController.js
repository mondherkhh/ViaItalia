const axios = require('axios');
const prisma = require('../config/prisma');
const { getDirectSource } = require('../services/admissionSourceMap');

const UNIVERSITALY_API = process.env.UNIVERSITALY_API_URL || 'https://universitaly-backend.cineca.it';
const DEFAULT_MAX_PAGES = Number(process.env.UNIVERSITY_SYNC_MAX_PAGES || 600);
const PAGE_CONCURRENCY = Number(process.env.UNIVERSITY_SYNC_CONCURRENCY || 5);
const REQUEST_TIMEOUT = Number(process.env.UNIVERSITY_SYNC_TIMEOUT_MS || 20000);
const ENRICH_OFFICIAL_PAGES = String(process.env.UNIVERSITY_ENRICH_OFFICIAL_PAGES || 'false').toLowerCase() === 'true';

const CUN_AREAS = {
  '01': 'Scienze matematiche e informatiche', '02': 'Scienze fisiche', '03': 'Scienze chimiche',
  '04': 'Scienze della terra', '05': 'Scienze biologiche', '06': 'Scienze mediche',
  '07': 'Scienze agrarie e veterinarie', '08': 'Ingegneria civile, architettura e design',
  '09': 'Ingegneria industriale e dell’informazione', '10': 'Scienze dell’antichità, filologico-letterarie e storico-artistiche',
  '11': 'Scienze storiche, filosofiche, pedagogiche e psicologiche', '12': 'Scienze giuridiche',
  '13': 'Scienze economiche e statistiche', '14': 'Scienze politiche e sociali', '15': 'Musica'
};

const asText = value => {
  if (value === undefined || value === null) return null;
  if (typeof value === 'object') return value.descrizioneEn || value.descrizione || value.label || value.value || null;
  const text = String(value).trim();
  return text || null;
};

const normaliseLanguage = value => {
  const code = String(value || '').toUpperCase();
  if (code === 'EN' || code.includes('INGLESE') || code.includes('ENGLISH')) return 'English';
  if (code === 'IT' || code.includes('ITALIANO') || code.includes('ITALIAN')) return 'Italian';
  if (code === 'FR' || code.includes('FRANCESE') || code.includes('FRENCH')) return 'French';
  return value ? String(value) : null;
};

const getCity = value => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value.nome || value.nomeSede || value.comune || value.city || value.descrizione || null;
};

const parseDate = value => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const parseFee = value => {
  if (value === undefined || value === null || value === '') return 'À vérifier';
  if (typeof value === 'number') return `${value} EUR`;
  return String(value).trim() || 'À vérifier';
};

const getField = course => {
  const className = asText(course.classe);
  if (className) return className;
  const areaCode = String(course.area || course.classe?.areaCun || '').padStart(2, '0');
  return CUN_AREAS[areaCode] || asText(course.areaCun) || 'Autre';
};

const getSourceUrl = course => {
  if (course.url) return String(course.url);
  const programName = course.nomeCorsoEn || course.nomeCorso || course.programName || '';
  return `https://www.universitaly.it/cerca-corsi?searchText=${encodeURIComponent(programName)}`;
};

const normaliseCourse = (course, verifiedAt = new Date()) => ({
  university: String(course.nomeStruttura || course.university || '').trim(),
  city: getCity(course.sede),
  programName: String(course.nomeCorsoEn || course.nomeCorso || course.programName || '').trim(),
  level: asText(course.tipoLaurea) || course.level || null,
  language: normaliseLanguage(course.lingua),
  field: getField(course),
  openingDate: parseDate(course.openingDate || course.applicationOpen || course.dataApertura),
  closingDate: parseDate(course.closingDate || course.applicationDeadline || course.dataChiusura),
  applicationFee: parseFee(course.applicationFee || course.applicationCost),
  tuition: parseFee(course.tuition || course.tuitionFee),
  sourceName: course.url ? 'Universitaly / official programme page' : 'Universitaly',
  sourceUrl: getSourceUrl(course),
  lastVerifiedAt: verifiedAt
});

const cleanParams = input => Object.fromEntries(Object.entries(input).filter(([, value]) => {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && value !== '';
}));

async function fetchPage(page, filters = {}) {
  const response = await axios.get(`${UNIVERSITALY_API}/api/offerta-formativa/cerca-corsi`, {
    timeout: REQUEST_TIMEOUT,
    params: cleanParams({ searchType: filters.searchType || 'u', page, ...filters, order: filters.order || 'ASC' })
  });
  return response.data || {};
}

async function fetchAllCourses(filters = {}, maxPages = DEFAULT_MAX_PAGES) {
  const first = await fetchPage(1, filters);
  const totalPages = Math.max(1, Number(first.totalPages || 1));
  const pagesToFetch = Math.min(totalPages, Math.max(1, Number(maxPages)));
  const allCourses = Array.isArray(first.corsi) ? [...first.corsi] : [];

  for (let start = 2; start <= pagesToFetch; start += PAGE_CONCURRENCY) {
    const pages = Array.from({ length: Math.min(PAGE_CONCURRENCY, pagesToFetch - start + 1) }, (_, i) => start + i);
    const responses = await Promise.all(pages.map(page => fetchPage(page, filters)));
    responses.forEach(page => { if (Array.isArray(page.corsi)) allCourses.push(...page.corsi); });
  }

  const unique = new Map();
  allCourses.forEach(course => {
    const record = normaliseCourse(course);
    if (!record.university || !record.programName) return;
    const key = `${record.university.toLowerCase()}|${record.programName.toLowerCase()}|${record.sourceUrl}`;
    if (!unique.has(key)) unique.set(key, record);
  });

  return { records: [...unique.values()], totalResults: Number(first.totalResults || allCourses.length), totalPages, pagesFetched: pagesToFetch };
}

async function listPrograms(req, res) {
  try {
    const { search, field, level, language, university } = req.query;
    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize || 50)));
    const where = {};
    if (search) where.OR = [{ university: { contains: search } }, { programName: { contains: search } }, { field: { contains: search } }, { city: { contains: search } }];
    if (field && field !== 'ALL') where.field = field;
    if (level && level !== 'ALL') where.level = level;
    if (language && language !== 'ALL') where.language = language;
    if (university) where.university = { contains: university };

    // Manual-only catalogue: the UI no longer displays the full Universitaly import.
    const catalogue = await prisma.universityProgram.findMany({
      where,
      include: {
        admissionWindows: {
          orderBy: [{ openingDate: 'asc' }, { closingDate: 'asc' }, { id: 'asc' }]
        }
      },
      orderBy: [{ closingDate: 'asc' }, { university: 'asc' }, { programName: 'asc' }]
    });
    const manualPrograms = catalogue.filter(program => Boolean(getDirectSource(program, { manualOnly: true })));
    const total = manualPrograms.length;
    const data = manualPrograms.slice((page - 1) * pageSize, page * pageSize);
    const facetFields = [...new Set(manualPrograms.map(row => row.field).filter(Boolean))].sort();
    const facetLevels = [...new Set(manualPrograms.map(row => row.level).filter(Boolean))].sort();
    const facetLanguages = [...new Set(manualPrograms.map(row => row.language).filter(Boolean))].sort();
    const universities = [...new Set(manualPrograms.map(row => row.university).filter(Boolean))];
    const english = manualPrograms.filter(row => row.language === 'English').length;
    const open = manualPrograms.filter(row => {
      const windows = Array.isArray(row.admissionWindows) && row.admissionWindows.length ? row.admissionWindows : [row];
      return windows.some(window => window.closingDate && new Date(window.closingDate) >= new Date());
    }).length;

    return res.json({ success: true, data, meta: {
      total, page, pageSize, pages: Math.ceil(total / pageSize), universities: universities.length, english, open,
      fields: facetFields, levels: facetLevels, languages: facetLanguages
    } });
  } catch (error) {
    console.error('University programs list:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors du chargement des programmes.' });
  }
}

async function saveRecords(records) {
  let created = 0; let updated = 0;
  for (let start = 0; start < records.length; start += 25) {
    const results = await Promise.all(records.slice(start, start + 25).map(async data => {
      const existing = await prisma.universityProgram.findFirst({ where: { university: data.university, programName: data.programName, sourceUrl: data.sourceUrl }, select: { id: true } });
      if (existing) { await prisma.universityProgram.update({ where: { id: existing.id }, data }); updated += 1; return; }
      await prisma.universityProgram.create({ data }); created += 1;
    }));
    void results;
  }
  return { created, updated };
}

async function syncPrograms(req, res) {
  if (String(process.env.MANUAL_PROGRAMS_ONLY || 'true').toLowerCase() === 'true') {
    return res.status(410).json({
      success: false,
      code: 'UNIVERSITALY_IMPORT_DISABLED',
      message: 'استيراد Universitaly معطّل. أضف البرامج يدوياً مع الجامعة والدomaine واللغة والروابط المباشرة.'
    });
  }
  try {
    const filters = { ...(req.query || {}), ...(req.body || {}) };
    const maxPages = Math.min(DEFAULT_MAX_PAGES, Math.max(1, Number(filters.maxPages || DEFAULT_MAX_PAGES)));
    const result = await fetchAllCourses(filters, maxPages);
    const counts = await saveRecords(result.records);
    return res.json({ success: true, message: `${result.records.length} programmes importés depuis Universitaly (${counts.created} nouveaux, ${counts.updated} mis à jour).`, data: result.records, meta: { fetched: result.records.length, totalResults: result.totalResults, totalPages: result.totalPages, pagesFetched: result.pagesFetched, universities: new Set(result.records.map(r => r.university)).size, fields: new Set(result.records.map(r => r.field)).size, officialPagesEnrichment: ENRICH_OFFICIAL_PAGES }, syncedAt: new Date() });
  } catch (error) {
    console.error('University programs sync:', error.response?.data || error.message || error);
    return res.status(502).json({ success: false, message: 'La synchronisation Universitaly a échoué. Vérifiez la connexion au service officiel.' });
  }
}

async function createProgram(req, res) {
  try {
    const data = normaliseCourse(req.body);
    if (!data.university || !data.programName || !data.field || !data.sourceUrl) return res.status(400).json({ success: false, message: 'Université, programme, domaine et source sont obligatoires.' });
    const program = await prisma.universityProgram.create({ data });
    return res.status(201).json({ success: true, data: program });
  } catch (error) {
    console.error('University program create:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de la création du programme.' });
  }
}

module.exports = { listPrograms, syncPrograms, createProgram };
