const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');

const ALLOW_INVALID_SSL = process.env.ADMISSIONS_ALLOW_INVALID_SSL === 'true';
const insecureHttpsAgent = new https.Agent({ rejectUnauthorized: false });

function requestOptions(extra = {}) {
  return {
    ...extra,
    ...(ALLOW_INVALID_SSL ? { httpsAgent: insecureHttpsAgent } : {})
  };
}

let pdfParserModule = null;
try {
  pdfParserModule = require('pdf-parse');
} catch (_) {
  pdfParserModule = null;
}

async function parsePdfBuffer(buffer) {
  if (!pdfParserModule) return null;
  const pagerender = pageData => pageData.getTextContent().then(content => {
    const pageNumber = typeof pageData?.pageIndex === 'number' ? pageData.pageIndex + 1 : null;
    const pageText = content.items.map(item => item.str || '').join(' ');
    return `${pageNumber ? `[[PDF_PAGE:${pageNumber}]] ` : ''}${pageText}`;
  });
  if (typeof pdfParserModule === 'function') {
    const result = await pdfParserModule(buffer, { pagerender });
    return result?.text || null;
  }
  if (typeof pdfParserModule.default === 'function') {
    const result = await pdfParserModule.default(buffer, { pagerender });
    return result?.text || null;
  }
  if (typeof pdfParserModule.PDFParse === 'function') {
    const parser = new pdfParserModule.PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return result?.text || null;
    } finally {
      if (typeof parser.destroy === 'function') await parser.destroy();
    }
  }
  throw new TypeError('Version pdf-parse non supportée. Installez pdf-parse@1.1.1.');
}

const MAX_HTML_PAGES = Math.max(10, Number(process.env.ADMISSIONS_MAX_HTML_PAGES || 60));
const MAX_PDFS = Math.max(5, Number(process.env.ADMISSIONS_MAX_PDFS || 30));
const MAX_PDF_BYTES = 12 * 1024 * 1024;
const USER_AGENT = 'ViaItaliaAdmissionsBot/3.1 (+admin-controlled official-source sync)';
const NON_OFFICIAL_HOSTS = /facebook|instagram|linkedin|youtube|twitter|tiktok|x\.com/i;
const ASSET_EXTENSIONS = /\.(zip|rar|7z|mp3|mp4|jpg|jpeg|png|gif|svg|webp|css|js)(?:[?#].*)?$/i;
const ADMISSION_LINK_WORDS = /admission|application|apply|enrol|enroll|candidatur|domand|iscrizion|immatricol|scadenz|deadline|fee|fees|tuition|tassa|contributo|bando|bandi|call|notice|registration|calendar|cost|pagamento|versare|ammissione|selezione|graduatoria/i;

const MONTHS = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  gennaio: 1, febbraio: 2, marzo: 3, aprile: 4, maggio: 5, giugno: 6,
  luglio: 7, agosto: 8, settembre: 9, ottobre: 10, novembre: 11, dicembre: 12
};

const DATE_TOKEN = '(?:[0-9]{4}[\\/.\\-][0-9]{1,2}[\\/.\\-][0-9]{1,2}|[0-9]{1,2}[\\/.\\-][0-9]{1,2}[\\/.\\-][0-9]{2,4}|[0-9]{1,2}\\s+(?:January|February|March|April|May|June|July|August|September|October|November|December|gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\\s+[0-9]{4})';

const OPENING_PATTERNS = [
  new RegExp(`(?:application|admission|enrol(?:ment|lment)?|candidatur\\w*|domand\\w*|iscrizion\\w*|apertur\\w*|open\\w*|ammissione|immatricolazion\\w*)[^.!?\\n]{0,220}?(${DATE_TOKEN})`, 'giu'),
  new RegExp(`(${DATE_TOKEN})[^.!?\\n]{0,150}?(?:application|admission|enrol|candidatur|domand|iscrizion|apertur|open|ammissione|immatricolazion)`, 'giu'),
  new RegExp(`(?:from|dal|dalle|starting|a partire dal|available from|aprono il|dal giorno)\\s*[:\\-]?\\s*(${DATE_TOKEN})`, 'giu')
];

const CLOSING_PATTERNS = [
  new RegExp(`(?:deadline|closing|close|closed|scadenz\\w*|chiusur\\w*|termine ultimo|entro il|fino al|until|by|scade il)\\s*[:\\-]?\\s*(${DATE_TOKEN})`, 'giu'),
  new RegExp(`(?:application|admission|enrol|candidatur\\w*|domand\\w*|iscrizion\\w*|ammissione)[^.!?\\n]{0,220}?(?:until|by|entro|fino al|scade il|deadline|scadenz\\w*)[^.!?\\n]{0,100}?(${DATE_TOKEN})`, 'giu'),
  new RegExp(`(${DATE_TOKEN})[^.!?\\n]{0,120}?(?:deadline|closing|scadenz\\w*|chiusur\\w*|termine ultimo|scade)`, 'giu')
];

const FEE_PATTERNS = [
  /(?:application fee|admission fee|fee for applying|application cost|application charge|registration fee|enrolment fee|pre[- ]?enrolment fee|pre[- ]?application fee|administrative fee|selection fee|entrance fee|tassa di iscrizione|tassa di ammissione|tassa di partecipazione|contributo di partecipazione|contributo di iscrizione|contributo amministrativo|costo della domanda|quota di iscrizione|marca da bollo|diritti di segreteria|bollo)[^.!?\n]{0,220}?((?:€|EUR|euro)\s*[0-9]+(?:[.,][0-9]{1,2})?|[0-9]+(?:[.,][0-9]{1,2})?\s*(?:€|EUR|euro))/giu,
  /((?:€|EUR|euro)\s*[0-9]+(?:[.,][0-9]{1,2})?|[0-9]+(?:[.,][0-9]{1,2})?\s*(?:€|EUR|euro))[^.!?\n]{0,160}?(?:application|admission|registration|enrolment|pre[- ]?enrol|iscrizion|immatricol|candidatur|contributo|tassa|bollo|segret)/giu,
  /(?:fee|cost|importo|amount|pagamento|versare|payable|payment|costo)[^.!?\n]{0,120}?((?:€|EUR|euro)\s*[0-9]+(?:[.,][0-9]{1,2})?|[0-9]+(?:[.,][0-9]{1,2})?\s*(?:€|EUR|euro))/giu
];

function normaliseText(html) {
  return cheerio.load(html)('body').text().replace(/\s+/g, ' ').trim();
}

function absoluteUrl(href, base) {
  try { return new URL(href, base).toString(); } catch (_) { return null; }
}

function isHttp(url) {
  return /^https?:\/\//i.test(url || '');
}

function hostOf(url) {
  try { return new URL(url).hostname.toLowerCase().replace(/^www\./, ''); } catch (_) { return null; }
}

function isOfficialCandidate(url, sourceDomains = [], allowUniversitaly = false) {
  try {
    const host = hostOf(url);
    if (!host || !isHttp(url)) return false;
    if (host.includes('universitaly.it')) return allowUniversitaly;
    if (NON_OFFICIAL_HOSTS.test(host)) return false;
    if (!sourceDomains.length) return true;
    return sourceDomains.some(domain => {
      const clean = String(domain).toLowerCase().replace(/^www\./, '');
      return host === clean || host.endsWith(`.${clean}`);
    });
  } catch (_) {
    return false;
  }
}

function isPdf(url, contentType = '') {
  return /\.pdf(?:[?#].*)?$/i.test(url || '') || /application\/pdf/i.test(contentType || '');
}

function isUniversitalyHost(url) {
  return /universitaly\.it/i.test(hostOf(url) || '');
}

function isLikelyOfficialAcademicHost(url) {
  const host = hostOf(url);
  if (!host || NON_OFFICIAL_HOSTS.test(host)) return false;
  return /\.(it|edu)$/i.test(host) || /\.ac\.uk$/i.test(host);
}

function parseDate(value) {
  if (!value) return null;
  const raw = String(value).trim().toLowerCase().replace(/\s+/g, ' ');
  const named = raw.match(/^(\d{1,2})\s+([a-zà-ÿ]+)\s+(\d{4})$/i);
  if (named && MONTHS[named[2]]) {
    return validDate(Number(named[3]), MONTHS[named[2]], Number(named[1]));
  }
  const iso = raw.match(/^(\d{4})[\/\.\-](\d{1,2})[\/\.\-](\d{1,2})$/);
  if (iso) return validDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  const numeric = raw.match(/^(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{2,4})$/);
  if (!numeric) return null;
  const day = Number(numeric[1]);
  const month = Number(numeric[2]);
  const year = Number(numeric[3].length === 2 ? `20${numeric[3]}` : numeric[3]);
  return validDate(year, month, day);
}

function validDate(year, month, day) {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(date.getTime()) || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date.toISOString().slice(0, 10);
}

async function fetchHtml(url) {
  const response = await axios.get(url, requestOptions({
    timeout: 20000,
    maxContentLength: 5 * 1024 * 1024,
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.8,it;q=0.7'
    },
    validateStatus: status => status >= 200 && status < 400
  }));
  return response.data;
}

async function discoverSitemapUrls(domains) {
  const urls = [];
  for (const domain of domains || []) {
    for (const url of [`https://${domain}/robots.txt`, `https://${domain}/sitemap.xml`]) {
      try {
        const response = await axios.get(url, requestOptions({
          timeout: 12000,
          maxContentLength: 2 * 1024 * 1024,
          headers: { 'User-Agent': USER_AGENT },
          validateStatus: status => status >= 200 && status < 400
        }));
        const matches = [...String(response.data || '').matchAll(/https?:\/\/[^\s<>'"]+/gi)]
          .map(match => match[0].replace(/[),;]+$/, ''));
        urls.push(...matches.filter(candidate => isOfficialCandidate(candidate, domains, false)));
      } catch (_) {}
    }
  }
  return [...new Set(urls)].slice(0, 120);
}

function defaultOfficialSeeds(domains) {
  const paths = [
    '', '/en', '/it', '/en/admissions', '/admissions', '/admission',
    '/en/application', '/application', '/applications', '/apply', '/how-to-apply',
    '/international', '/international-students', '/international/admissions',
    '/students', '/prospective-students', '/enrolment', '/enrollment',
    '/registration', '/iscrizioni', '/immatricolazioni', '/pre-iscrizione',
    '/bando', '/bandi', '/call', '/call-for-applications', '/notice', '/notices',
    '/deadline', '/deadlines', '/calendar', '/academic-calendar',
    '/tuition-fees', '/fees', '/costs', '/contributi', '/tasse',
    '/programmes', '/programs', '/courses', '/degree-programmes',
    '/lauree', '/corsi', '/corsi-di-studio'
  ];
  return (domains || []).flatMap(domain => paths.map(path => `https://${domain}${path}`));
}

async function fetchPdfText(url) {
  if (!pdfParserModule) return null;
  const response = await axios.get(url, requestOptions({
    timeout: 25000,
    responseType: 'arraybuffer',
    maxContentLength: MAX_PDF_BYTES,
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/pdf,application/octet-stream;q=0.9,*/*;q=0.8' },
    validateStatus: status => status >= 200 && status < 400
  }));
  const buffer = Buffer.from(response.data);
  if (buffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
    throw new Error('Réponse ignorée: le serveur n’a pas renvoyé un vrai PDF');
  }
  const text = await parsePdfBuffer(buffer);
  return text ? String(text).replace(/\s+/g, ' ').trim() : null;
}

function allMatches(text, patterns) {
  const values = [];
  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match[1]) values.push(match[1].trim());
      if (match.index === pattern.lastIndex) pattern.lastIndex += 1;
    }
  }
  return values;
}

function unique(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function normaliseFee(value) {
  if (!value) return null;
  return String(value).replace(/\s+/g, ' ').trim().replace(',', '.');
}

function extractValues(text) {
  const source = String(text || '');
  const openingDates = unique(allMatches(source, OPENING_PATTERNS)).map(parseDate).filter(Boolean);
  const closingDates = unique(allMatches(source, CLOSING_PATTERNS)).map(parseDate).filter(Boolean);
  const fees = unique(allMatches(source, FEE_PATTERNS)).map(normaliseFee).filter(Boolean);

  // Dates dans une seule ligne de tableau: 2026-05-12 - 2026-07-31.
  const rangePattern = new RegExp(`(${DATE_TOKEN})\\s*(?:-|–|—|to|until|al|fino al|entro il)\\s*(${DATE_TOKEN})`, 'giu');
  let rangeMatch;
  while ((rangeMatch = rangePattern.exec(source)) !== null) {
    const opening = parseDate(rangeMatch[1]);
    const closing = parseDate(rangeMatch[2]);
    if (opening && closing) {
      openingDates.push(opening);
      closingDates.push(closing);
    }
    if (rangeMatch.index === rangePattern.lastIndex) rangePattern.lastIndex += 1;
  }

  // Fallback pour les tableaux où les mots admission/deadline sont séparés
  // des cellules de date.
  if (ADMISSION_LINK_WORDS.test(source)) {
    const genericDatePattern = new RegExp(`\\b(${DATE_TOKEN})\\b`, 'giu');
    let dateMatch;
    while ((dateMatch = genericDatePattern.exec(source)) !== null) {
      const value = parseDate(dateMatch[1]);
      if (!value) continue;
      const context = source.slice(Math.max(0, dateMatch.index - 100), dateMatch.index + dateMatch[0].length + 100).toLowerCase();
      if (/deadline|scadenz|closing|chiusur|termine|entro|fino al|until|by/.test(context)) closingDates.push(value);
      else if (/open|opening|apertur|from|dal|starting|application|admission|iscrizion|immatricol|candidatur/.test(context)) openingDates.push(value);
      if (dateMatch.index === genericDatePattern.lastIndex) genericDatePattern.lastIndex += 1;
    }
  }

  return {
    openingDates: unique(openingDates),
    closingDates: unique(closingDates),
    fees: unique(fees)
  };
}

function makeSnippet(text, values) {
  const source = String(text || '');
  const needles = [...(values.openingDates || []), ...(values.closingDates || []), ...(values.fees || [])].filter(Boolean);
  for (const needle of needles) {
    const directIndex = source.toLowerCase().indexOf(String(needle).toLowerCase());
    if (directIndex >= 0) return source.slice(Math.max(0, directIndex - 220), Math.min(source.length, directIndex + String(needle).length + 260)).trim();
    const expectedDate = parseDate(needle);
    if (expectedDate) {
      const datePattern = new RegExp(`\\b(${DATE_TOKEN})\\b`, 'giu');
      let match;
      while ((match = datePattern.exec(source)) !== null) {
        if (parseDate(match[1]) === expectedDate) return source.slice(Math.max(0, match.index - 220), Math.min(source.length, match.index + match[0].length + 260)).trim();
        if (match.index === datePattern.lastIndex) datePattern.lastIndex += 1;
      }
    }
    const expectedFee = normaliseFee(needle);
    if (expectedFee) {
      const feePattern = /(?:€|EUR|euro)\s*[0-9]+(?:[.,][0-9]{1,2})?|[0-9]+(?:[.,][0-9]{1,2})?\s*(?:€|EUR|euro)/giu;
      let match;
      while ((match = feePattern.exec(source)) !== null) {
        if (normaliseFee(match[0]) === expectedFee) return source.slice(Math.max(0, match.index - 220), Math.min(source.length, match.index + match[0].length + 260)).trim();
        if (match.index === feePattern.lastIndex) feePattern.lastIndex += 1;
      }
    }
  }
  return source.slice(0, 480).trim();
}

function scoreText(text, programName, universityName) {
  const tokens = `${programName || ''} ${universityName || ''}`.toLowerCase().split(/[^a-zà-ÿ0-9]+/i).filter(token => token.length > 3);
  const lower = text.toLowerCase();
  const programScore = tokens.length ? tokens.filter(token => lower.includes(token)).length / tokens.length : 0;
  return programScore + (ADMISSION_LINK_WORDS.test(text) ? 0.4 : 0);
}

function isCurrentOrFutureDate(value, { allowRecentOpening = false } = {}) {
  if (!value) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const minimumYear = now.getUTCFullYear() - 1;
  const minimumDate = allowRecentOpening ? new Date(today.getTime() - 120 * 24 * 60 * 60 * 1000) : today;
  return date.getUTCFullYear() >= minimumYear && date >= minimumDate;
}

function chooseDates(openingCandidates, closingCandidates) {
  const openings = unique(openingCandidates).filter(value => isCurrentOrFutureDate(value, { allowRecentOpening: true })).sort();
  const closings = unique(closingCandidates).filter(value => isCurrentOrFutureDate(value)).sort();
  for (const opening of openings) {
    for (const closing of closings) {
      if (opening <= closing) return { openingDate: opening, closingDate: closing };
    }
  }
  if (openings.length && !closings.length) return { openingDate: openings[0], closingDate: null };
  if (closings.length && !openings.length) return { openingDate: null, closingDate: closings[0] };
  return { openingDate: null, closingDate: null };
}

function linkPriority(label, href, baseUrl) {
  const value = `${label} ${href}`.toLowerCase();
  let priority = 0;
  if (isPdf(href)) priority += 100;
  if (ADMISSION_LINK_WORDS.test(value)) priority += 60;
  if (baseUrl && hostOf(href) === hostOf(baseUrl)) priority += 20;
  if (/bando|call|deadline|scadenz|admission|application|iscrizion|immatricol|tassa|fee/i.test(value)) priority += 30;
  return priority;
}

function findPdfPage(text, values) {
  if (!text) return null;
  const source = String(text);
  const pages = [...source.matchAll(/(?:^|\s)\[\[PDF_PAGE:(\d+)\]\]([\s\S]*?)(?=\s\[\[PDF_PAGE:\d+\]\]|$)/g)];
  if (pages.length) {
    const expectedDates = new Set([...(values.openingDates || []), ...(values.closingDates || [])].map(parseDate).filter(Boolean));
    const expectedFees = new Set((values.fees || []).map(normaliseFee).filter(Boolean));
    for (const page of pages) {
      const pageNumber = Number(page[1]);
      const pageText = page[2] || '';
      const extracted = extractValues(pageText);
      if (extracted.openingDates.some(value => expectedDates.has(value)) || extracted.closingDates.some(value => expectedDates.has(value)) || extracted.fees.some(value => expectedFees.has(normaliseFee(value)))) return pageNumber;
      if (makeSnippet(pageText, values) !== pageText.slice(0, 480).trim()) return pageNumber;
    }
  }
  const needles = [...(values.openingDates || []), ...(values.closingDates || []), ...(values.fees || [])].filter(Boolean);
  let position = -1;
  for (const needle of needles) {
    const directIndex = source.toLowerCase().indexOf(String(needle).toLowerCase());
    if (directIndex >= 0 && (position < 0 || directIndex < position)) position = directIndex;
  }
  if (position < 0) return null;
  const before = source.slice(0, position);
  const matches = [...before.matchAll(/\[\[PDF_PAGE:(\d+)\]\]/g)];
  return matches.length ? Number(matches[matches.length - 1][1]) : null;
}

function buildValueEvidence(document, field, value, programName, universityName) {
  const values = {
    openingDates: field === 'opening' ? [value] : [],
    closingDates: field === 'closing' ? [value] : [],
    fees: field === 'fee' ? [value] : []
  };
  const source = String(document.text || '');
  const matchedText = makeSnippet(source, values);
  const pageNumber = document.isPdf ? findPdfPage(source, values) : null;
  const hasValue = field === 'fee'
    ? Boolean(matchedText && /(?:€|EUR|euro|fee|tassa|contributo|costo)/i.test(matchedText))
    : Boolean(matchedText && parseDate(value));
  const hasExactText = Boolean(matchedText && matchedText.trim() && hasValue);
  const baseConfidence = Math.max(0, Math.min(1, Number(document.score || 0) / 1.4));
  const hasProgramMatch = scoreText(source, programName, universityName) >= 0.25;
  const confidence = Math.max(0, Math.min(1, baseConfidence + (hasProgramMatch ? 0.08 : 0)));
  return {
    field,
    value: String(value),
    url: document.url,
    isPdf: Boolean(document.isPdf),
    isProgramPage: Boolean(document.isProgramPage),
    matchedText: hasExactText ? matchedText : null,
    pageNumber,
    confidence
  };
}

function buildEvidence(document, values, programName, universityName) {
  const openingEvidence = values.openingDates.map(value => buildValueEvidence(document, 'opening', value, programName, universityName));
  const closingEvidence = values.closingDates.map(value => buildValueEvidence(document, 'closing', value, programName, universityName));
  const feeEvidence = values.fees.map(value => buildValueEvidence(document, 'fee', value, programName, universityName));
  const all = [...openingEvidence, ...closingEvidence, ...feeEvidence];
  return {
    url: document.url,
    isPdf: Boolean(document.isPdf),
    isProgramPage: Boolean(document.isProgramPage),
    openingDates: values.openingDates,
    closingDates: values.closingDates,
    fees: values.fees,
    openingText: openingEvidence[0]?.matchedText || null,
    closingText: closingEvidence[0]?.matchedText || null,
    feeText: feeEvidence[0]?.matchedText || null,
    openingEvidence,
    closingEvidence,
    feeEvidence,
    matchedText: all.find(item => item.matchedText)?.matchedText || null,
    pageNumber: document.isPdf ? findPdfPage(document.text, values) : null,
    confidence: Math.max(...all.map(item => item.confidence), 0)
  };
}

async function enrichProgram({ programName, universityName, source, programUrl }) {
  const domains = [...new Set(source?.domains || [])];
  const dynamicDomains = new Set(domains);
  const sitemapUrls = await discoverSitemapUrls(domains);

  // On conserve les domaines et les facultés déjà fournis. Le sourceUrl du programme
  // est seulement placé en priorité afin de rechercher les dates dans la bonne faculté.
  // إذا عند البرنامج sourceUrl رسمي، نبدأ منه وحده حتى لا نبحث في
  // مسارات عامة غير موجودة مثل /admissions أو /fees على نفس الدومين.
  // تبقى طريقة جلب البرامج والـfacultés حسب domaine كما هي في الـworker.
  const seedUrls = programUrl
    ? [...new Set([programUrl, ...(source?.admissionsUrls || [])].filter(Boolean))]
    : [...new Set([
        ...(source?.admissionsUrls || []),
        ...defaultOfficialSeeds(domains),
        ...sitemapUrls
      ].filter(Boolean))];

  const queue = seedUrls
    .filter(url => isOfficialCandidate(url, [...dynamicDomains], true))
    .map((url, index) => ({ url, priority: index === 0 ? 1000 : linkPriority('', url, programUrl) }))
    .sort((a, b) => b.priority - a.priority);

  const visited = new Set();
  const pages = [];
  const pdfUrls = new Map();

  while (queue.length && pages.length < MAX_HTML_PAGES) {
    queue.sort((a, b) => b.priority - a.priority);
    const item = queue.shift();
    const url = item?.url;
    if (!url || visited.has(url)) continue;
    visited.add(url);

    try {
      const html = await fetchHtml(url);
      if (typeof html !== 'string') continue;
      const $ = cheerio.load(html);
      const text = normaliseText(html);

      console.log('[Admissions DEBUG]', {
        program: programName,
        url,
        textLength: text.length,
        hasAdmissionWord: ADMISSION_LINK_WORDS.test(text),
        links: $('a[href]').length
      });

      const score = scoreText(text, programName, universityName) + (url === programUrl ? 0.35 : 0);
      pages.push({ url, text, score: score + (url === programUrl ? 3 : 0), isProgramPage: url === programUrl });

      $('a[href]').each((_, node) => {
        const href = absoluteUrl($(node).attr('href'), url);
        if (!href || !isHttp(href) || NON_OFFICIAL_HOSTS.test(href) || ASSET_EXTENSIONS.test(href)) return;
        const pageIsUniversitaly = isUniversitalyHost(url);
        const discoveredOfficialHost = pageIsUniversitaly && isLikelyOfficialAcademicHost(href);
        if (pageIsUniversitaly && discoveredOfficialHost) {
          dynamicDomains.add(hostOf(href));
        }
        if (isUniversitalyHost(href)) return;
        if (!isOfficialCandidate(href, [...dynamicDomains], false) && !discoveredOfficialHost) return;

        const label = `${$(node).text()} ${$(node).attr('title') || ''} ${href}`;
        const priority = linkPriority(label, href, programUrl);
        const relevant = ADMISSION_LINK_WORDS.test(label) || isPdf(href);

        // Les liens de la faculté restent prioritaires. Les pages génériques du même
        // domaine sont toujours autorisées, mais elles passent après les liens admission.
        if (isPdf(href)) {
          const current = pdfUrls.get(href) || 0;
          pdfUrls.set(href, Math.max(current, priority));
        } else if (!visited.has(href) && (relevant || pages.length <= 12)) {
          const existing = queue.find(entry => entry.url === href);
          if (existing) existing.priority = Math.max(existing.priority, priority);
          else queue.push({ url: href, priority });
        }
      });
    } catch (error) {
      console.warn(`[Admissions] Page skipped: ${url} - ${error.message}`);
    }
  }

  const documents = [...pages];

  // sourceUrl peut être directement un PDF officiel.
  if (programUrl && isPdf(programUrl)) pdfUrls.set(programUrl, 1000);

  const orderedPdfs = [...pdfUrls.entries()].sort((a, b) => b[1] - a[1]).slice(0, MAX_PDFS);
  for (const [pdfUrl] of orderedPdfs) {
    try {
      const text = await fetchPdfText(pdfUrl);
      if (text) documents.push({
        url: pdfUrl,
        text,
        score: scoreText(text, programName, universityName) + (pdfUrl === programUrl ? 3.2 : 0) + 0.2,
        isPdf: true,
        isProgramPage: pdfUrl === programUrl
      });
    } catch (error) {
      console.warn(`[Admissions] PDF skipped: ${pdfUrl} - ${error.message}`);
    }
  }

  documents.sort((a, b) => b.score - a.score);
  const openingCandidates = [];
  const closingCandidates = [];
  const feeCandidates = [];
  const evidence = [];

  for (const document of documents) {
    const values = extractValues(document.text);
    openingCandidates.push(...values.openingDates);
    closingCandidates.push(...values.closingDates);
    feeCandidates.push(...values.fees);
    if (values.openingDates.length || values.closingDates.length || values.fees.length) {
      evidence.push(buildEvidence(document, values, programName, universityName));
    }
  }

  const currentOpening = value => isCurrentOrFutureDate(value, { allowRecentOpening: true });
  const currentClosing = value => isCurrentOrFutureDate(value);
  const firstWithOpening = evidence.find(item => item.openingDates.some(currentOpening)) || null;
  const firstWithClosing = evidence.find(item => item.closingDates.some(currentClosing)) || null;
  const firstWithFee = evidence.find(item => item.fees.length) || null;
  const selectedOpening = firstWithOpening?.openingDates.find(currentOpening) || null;
  const selectedClosing = firstWithClosing?.closingDates.find(currentClosing) || null;
  const dates = chooseDates(selectedOpening ? [selectedOpening] : [], selectedClosing ? [selectedClosing] : []);
  const fee = firstWithFee?.fees?.[0] || null;
  const rejectedHistoricalDates = unique([
    ...openingCandidates.filter(value => !isCurrentOrFutureDate(value, { allowRecentOpening: true })),
    ...closingCandidates.filter(value => !isCurrentOrFutureDate(value))
  ]);
  const confidenceValues = [firstWithOpening, firstWithClosing, firstWithFee].filter(Boolean).map(item => item.confidence);

  console.log('[Admissions RESULT]', {
    program: programName,
    pages: pages.length,
    pdfs: pdfUrls.size,
    documents: documents.length,
    openingCandidates,
    closingCandidates,
    feeCandidates,
    sourceUrl: programUrl
  });

  return {
    openingDate: dates.openingDate,
    closingDate: dates.closingDate,
    applicationFee: fee,
    sourceUrl: firstWithOpening?.url || firstWithClosing?.url || firstWithFee?.url || null,
    sourceIsPdf: Boolean((firstWithOpening || firstWithClosing || firstWithFee)?.isPdf),
    openingEvidence: firstWithOpening && selectedOpening ? (() => { const item = firstWithOpening.openingEvidence?.find(value => String(value.value) === String(selectedOpening)); return item ? { field: 'opening', value: selectedOpening, sourceUrl: item.url, matchedText: item.matchedText, pageNumber: item.pageNumber, sourceIsPdf: item.isPdf, confidence: item.confidence } : null; })() : null,
    closingEvidence: firstWithClosing && selectedClosing ? (() => { const item = firstWithClosing.closingEvidence?.find(value => String(value.value) === String(selectedClosing)); return item ? { field: 'closing', value: selectedClosing, sourceUrl: item.url, matchedText: item.matchedText, pageNumber: item.pageNumber, sourceIsPdf: item.isPdf, confidence: item.confidence } : null; })() : null,
    feeEvidence: firstWithFee && fee ? (() => { const item = firstWithFee.feeEvidence?.find(value => String(value.value) === String(fee)); return item ? { field: 'fee', value: fee, sourceUrl: item.url, matchedText: item.matchedText, pageNumber: item.pageNumber, sourceIsPdf: item.isPdf, confidence: item.confidence } : null; })() : null,
    evidence,
    confidence: confidenceValues.length ? Math.max(...confidenceValues) : 0,
    rejectedHistoricalDates,
    verificationStatus: dates.openingDate || dates.closingDate || fee ? 'OFFICIAL_SOURCE_MATCH' : 'NEEDS_REVIEW'
  };
}

module.exports = {
  enrichProgram,
  parseDate,
  extractValues,
  chooseDates,
  isCurrentOrFutureDate
};
