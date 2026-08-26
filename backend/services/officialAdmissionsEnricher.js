const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');
const fs = require('fs');
const os = require('os');
const path = require('path'); 
const { execFile } = require('child_process');
const { promisify } = require('util');
const execFileAsync = promisify(execFile);
const {
  renderDynamicPage,
  ocrPdfBuffer,
  extractWithLlm
} = require('./admissionsAiFallback');

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

const MAX_HTML_PAGES = Math.max(20, Number(process.env.ADMISSIONS_MAX_HTML_PAGES || 300));
const MAX_PDFS = Math.max(5, Number(process.env.ADMISSIONS_MAX_PDFS || 30));
const MAX_PDF_BYTES = 12 * 1024 * 1024;
const USER_AGENT = process.env.ADMISSIONS_USER_AGENT || 'ViaItaliaAdmissionsBot/4.0 (+admin-controlled official-source sync)';
const NON_OFFICIAL_HOSTS = /facebook|instagram|linkedin|youtube|twitter|tiktok|x\.com/i;
const ASSET_EXTENSIONS = /\.(zip|rar|7z|mp3|mp4|jpg|jpeg|png|gif|svg|webp|css|js)(?:[?#].*)?$/i;
const ADMISSION_LINK_WORDS = /admission|application|apply|enrol|enroll|candidatur|domand|iscrizion|immatricol|scadenz|deadline|fee|fees|tuition|tassa|contributo|bando|bandi|call|notice|manifesto|documenti|registration|cost|pagamento|versare|ammissione|selezione|graduatoria/i;
const ADMISSION_WINDOW_WORDS = /application|admission|apply|candidatur\w*|domand\w*|iscrizion\w*|immatricolazion\w*|enrol\w*|registration|candidatures?\s+en\s+ligne|demande\s+d['’]?admission|inscriptions?\s+en\s+ligne|p[ée]riode\s+d['’]?inscription|p[ée]riode\s+de\s+candidature|session|s[ée]ance|date\s+limite|du\s+.+\s+au\s+|presentazione della domanda|presentare la domanda|invio della domanda|termine per la domanda|scadenz\w*|deadline|entro il|fino al|au plus tard|apertura delle candidature|chiusura delle candidature|bando di ammissione|bando di valutazione iniziale|requisiti di ammissione|modalità di accesso|accesso libero|TOLC/i;
const ADMISSION_DOCUMENT_TERMS = /bando\s+(?:di\s+)?(?:ammissione|valutazione\s+iniziale)|call\s+for\s+applications?|requisiti\s+di\s+ammissione|modalit(?:à|a)\s+di\s+accesso|corso\s+(?:di\s+laurea\s+)?ad\s+accesso\s+libero|immatricolazion\w*|domanda\s+di\s+ammissione|application\s+(?:call|procedure)|candidatures?\s+en\s+ligne|demande\s+d['’]?admission|admission\s+et\s+inscription|p[ée]riode\s+de\s+candidature/i;
const TARGET_ACADEMIC_YEAR = String(process.env.ADMISSIONS_ACADEMIC_YEAR || '2026/27').trim();
const TARGET_YEAR_ALIASES = (() => {
  const m = TARGET_ACADEMIC_YEAR.match(/(20\d{2})\s*[\/\-]\s*(\d{2,4})/);
  if (!m) return [];
  const next = m[2].length === 2 ? `20${m[2]}` : m[2];
  return [TARGET_ACADEMIC_YEAR, `${m[1]}-${m[2]}`, `${m[1]}-${next}`, `${m[1]}/${m[2]}`, `${m[1]}/${next}`];
})();
const PROGRAM_GENERIC_TOKENS = new Set(['science','sciences','study','studies','course','degree','program','programme','master','bachelor','laurea','corso','studi','management','international','technology','technologies']);
const NON_ADMISSION_DATE_WORDS = /TOLC|CISIA|iscrizione\s+al\s+test|quota\s+di\s+iscrizione\s+al\s+test|test\s+di\s+ammissione|prova\s+di\s+ammissione|calendario\s+delle\s+prove|data\s+della\s+prova|anno accademico|academic year|inizio delle lezioni|inizio lezioni|fine delle lezioni|fine anno|termine del semestre|semester|semestre|calendario didattico|lezioni|esami|sessione d[’']esame|graduation|laurea|evento|event|infopoint|open day|webinar|convegno|notizia|residence permit|permit|permesso di soggiorno|soggiorno|health insurance|assicurazione sanitaria|national health service|\bssn\b|renewal|rinnovo|expiry|scadenza del permesso|first installment|prima rata|seconda rata|pagare|payment|pagamento|tasse|tuition|contribuzione|pre[- ]?enrolment|pre[- ]?immatricolazione|pre[- ]?iscrizione|documentazione richiesta|documenti richiesti|documenti studenti|titolo di studio estero|titolo estero|integrazione dei documenti|integrazione documenti|riconoscimento del titolo|upload documenti|trasmissione dei documenti|permesso|Universitaly|universitaly/i;
const STRICT_ADMISSION_TERMS = /application|admission|apply|candidate|candidatur\w*|domand\w*|iscrizion\w*|immatricolazion\w*|enrol\w*|registration|candidatures?\s+en\s+ligne|demande\s+d['’]?admission|p[ée]riode\s+de\s+candidature|ammissione|bando di ammissione|presentazione della domanda|presentare la domanda|invio della domanda/i;
const ADMISSION_RANGE_LABEL = /application|admission|intake|round|call\s+(?:one|two|three|four|1|2|3|4)|session|scadenza|deadline|candidatur\w*|domand\w*|iscrizion\w*|immatricolazion\w*|enrol\w*|registration|ammissione|presentazione della domanda/i;

const EXPLICIT_OPENING_PHRASE = /application(?:s)?\s+(?:are\s+)?open|applications?\s+open|opening\s+date|apertura\s+(?:delle\s+)?(?:candidature|iscrizioni|domande)|iscrizioni?\s+aperte|(?:iscrizioni?|immatricolazioni?|domande|candidature)\s+(?:sono\s+)?aperte\s+dal|candidatures?\s+en\s+ligne\s*[:\-]?\s*(?:du|from|dal)|demande\s+d['’]?admission\s+.*(?:du|from)|p[ée]riode\s+de\s+candidature\s+.*(?:du|from)|iscrizione\s+al\s+concorso\s+dal|domande\s+(?:di\s+ammissione\s+)?(?:aperte\s+)?dal|presentazione\s+della\s+domanda\s+dal|domande\s+presentabili\s+dal|finestra\s+(?:di\s+)?(?:iscrizione|candidatura)\w*\s+dal|a\s+partire\s+(?:dal|da)|a\s+decorrere\s+dal|starting\s+from|from\s+date/i;
const EXPLICIT_CLOSING_PHRASE = /application(?:s)?\s+(?:deadline|closing\s+date|close)|admission\s+deadline|deadline\s+for\s+(?:the\s+)?application|last\s+day\s+to\s+(?:apply|submit)|candidatures?\s+en\s+ligne[^.!?\n]{0,100}(?:au|to|al)|termine\s+(?:ultimo|per\s+la\s+presentazione)|scadenza\s+(?:della\s+domanda|per\s+(?:la\s+)?presentazione|iscrizione\s+al\s+concorso)|chiusura\s+(?:delle\s+)?(?:candidature|iscrizioni)|(?:iscrizioni?|immatricolazioni?|domande|candidature)\s+(?:sono\s+)?aperte\s+fino\s+al|domande\s+(?:presentabili|accettate)\s+fino\s+al|entro\s+il[^.]{0,100}(?:domanda|candidatura|iscrizione)|fino\s+al[^.]{0,100}(?:domanda|candidatura|iscrizione)|scade\s+il|termine\s+di\s+presentazione/i;

function hasStrictAdmissionContext(context) {
  const value = String(context || '');
  return STRICT_ADMISSION_TERMS.test(value) && !NON_ADMISSION_DATE_WORDS.test(value) && !NON_REGISTRATION_CONTEXT.test(value);
}

const MONTHS = {
  january: 1, jan: 1, february: 2, feb: 2, march: 3, mar: 3, april: 4, apr: 4, may: 5, june: 6, jun: 6,
  july: 7, jul: 7, august: 8, aug: 8, september: 9, sep: 9, sept: 9, october: 10, oct: 10, november: 11, nov: 11, december: 12, dec: 12,
  gennaio: 1, gen: 1, febbraio: 2, feb: 2, marzo: 3, mar: 3, aprile: 4, apr: 4, maggio: 5, mag: 5, giugno: 6, giu: 6,
  luglio: 7, lug: 7, agosto: 8, ago: 8, settembre: 9, set: 9, ottobre: 10, ott: 10, novembre: 11, nov: 11, dicembre: 12, dic: 12,
  janvier: 1, janv: 1, février: 2, fevrier: 2, févr: 2, fevr: 2, mars: 3, avril: 4, avr: 4, mai: 5, juin: 6,
  juillet: 7, juil: 7, août: 8, aout: 8, septembre: 9, sept: 9, octobre: 10, oct: 10, novembre: 11, nov: 11,
  décembre: 12, decembre: 12, déc: 12, dec: 12
};

const MONTH_NAME_TOKEN = '(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec|gennaio|gen|febbraio|marzo|mar|aprile|apr|maggio|mag|giugno|giu|luglio|lug|agosto|ago|settembre|set|ottobre|ott|novembre|nov|dicembre|dic|janvier|janv|février|fevrier|févr|fevr|mars|avril|avr|mai|juin|juillet|juil|août|aout|septembre|octobre|novembre|décembre|decembre|déc|dec)';
const DATE_TOKEN = `(?:[0-9]{4}[\\/.\\-][0-9]{1,2}[\\/.\\-][0-9]{1,2}|[0-9]{1,2}[\\/.\\-][0-9]{1,2}[\\/.\\-][0-9]{2,4}|[0-9]{1,2}\\s+${MONTH_NAME_TOKEN}\\s+[0-9]{4}|${MONTH_NAME_TOKEN}\\s*,?\\s*[0-9]{1,2}(?:st|nd|rd|th|er)?(?:,|\\s)+[0-9]{4})`;

const OPENING_PATTERNS = [
  new RegExp(`(?:candidatures?\\s+en\\s+ligne|applications?|demandes?\\s+d['’]?admission|p[ée]riode\\s+de\\s+candidature|application|admission|enrol(?:ment|lment)?|candidatur\\w*|domand\\w*|iscrizion\\w*|apertur\\w*|open\\w*|ammissione|immatricolazion\\w*)[^.!?\\n]{0,220}?(?:du|from|dal)?\\s*(${DATE_TOKEN})`, 'giu'),
  new RegExp(`(?:candidatures?\\s+en\\s+ligne|p[ée]riode\\s+de\\s+candidature|application|admission|candidatur\\w*|domand\\w*)[^.!?\\n]{0,100}?(?:du|from|dal)\\s*(${DATE_TOKEN})[^.!?\\n]{0,80}?(?:au|to|al)\\s*${DATE_TOKEN}`, 'giu'),
  new RegExp(`(${DATE_TOKEN})[^.!?\\n]{0,150}?(?:application|admission|enrol|candidatur|domand|iscrizion|apertur|open|ammissione|immatricolazion)`, 'giu'),
  new RegExp(`(?:from|dal|dalle|starting|a partire dal|available from|aprono il|dal giorno)\\s*[:\\-]?\\s*(${DATE_TOKEN})`, 'giu')
];

const LABELLED_APPLICATION_RANGE_PATTERN = new RegExp(`(?:online\\s+application\\s+period|application\\s+period|period\\s+of\\s+online\\s+application)\\s*[:\\-]?\\s*[\\s\\S]{0,120}?(${DATE_TOKEN}|${MONTH_NAME_TOKEN}\\s*,?\\s*\\d{1,2}(?:st|nd|rd|th|er)?)\\s*(?:-|–|—|to|until)\\s*(${DATE_TOKEN}|${MONTH_NAME_TOKEN}\\s*,?\\s*\\d{1,2}(?:st|nd|rd|th|er)?)(?:[, ]+(20\\d{2}))?`, 'giu');

const CLOSING_PATTERNS = [
  new RegExp(`(?:candidatures?\\s+en\\s+ligne|p[ée]riode\\s+de\\s+candidature|applications?|demandes?\\s+d['’]?admission|application|admission|candidatur\\w*|domand\\w*)[^.!?\\n]{0,100}?(?:du|from|dal)\\s*${DATE_TOKEN}[^.!?\\n]{0,80}?(?:au|to|al)\\s*(${DATE_TOKEN})`, 'giu'),
  new RegExp(`(?:deadline|closing|close|closed|scadenz\\w*|chiusur\\w*|termine ultimo|entro il|fino al|until|by|scade il)\\s*[:\\-]?\\s*(${DATE_TOKEN})`, 'giu'),
  new RegExp(`(?:application|admission|enrol|candidatur\\w*|domand\\w*|iscrizion\\w*|ammissione)[^.!?\\n]{0,220}?(?:until|by|entro|fino al|scade il|deadline|scadenz\\w*)[^.!?\\n]{0,100}?(${DATE_TOKEN})`, 'giu'),
  new RegExp(`(${DATE_TOKEN})[^.!?\\n]{0,120}?(?:deadline|closing|scadenz\\w*|chiusur\\w*|termine ultimo|scade)`, 'giu')
];

const FEE_PATTERNS = [
  /(?:application fee|admission fee|fee for applying|application costs?|costs? of (?:the )?application|application charge|registration fee|enrolment fee|pre[- ]?enrolment fee|pre[- ]?application fee|administrative fee|selection fee|entrance fee)[\\s\\S]{0,100}?(?:of|is|amounts? to)\\s*((?:€|EUR|euro)\\s*[0-9]{1,3}(?:[ .][0-9]{3})*(?:[.,][0-9]{1,2})?|[0-9]{1,3}(?:[ .][0-9]{3})*(?:[.,][0-9]{1,2})?\\s*(?:€|EUR|euro))/giu,
  /(?:application fee|admission fee|fee for applying|application costs?|costs? of (?:the )?application|application charge|registration fee|enrolment fee|pre[- ]?enrolment fee|pre[- ]?application fee|administrative fee|selection fee|entrance fee|tassa di iscrizione|tassa di ammissione|tassa di partecipazione|contributo di partecipazione|contributo di iscrizione|contributo amministrativo|costo della domanda|quota di iscrizione|diritti di segreteria)[^.!?\n]{0,220}?((?:€|EUR|euro)\s*[0-9]{1,3}(?:[ .][0-9]{3})*(?:[.,][0-9]{1,2})?|[0-9]{1,3}(?:[ .][0-9]{3})*(?:[.,][0-9]{1,2})?\s*(?:€|EUR|euro))/giu,
  /((?:€|EUR|euro)\s*[0-9]{1,3}(?:[ .][0-9]{3})*(?:[.,][0-9]{1,2})?|[0-9]{1,3}(?:[ .][0-9]{3})*(?:[.,][0-9]{1,2})?\s*(?:€|EUR|euro))[^.!?\n]{0,160}?(?:application|admission|registration|enrolment|pre[- ]?enrol|iscrizion|immatricol|candidatur|contributo di iscrizione|tassa di iscrizione|tassa di ammissione)/giu
];

const MONEY_PATTERN = /(?:€|EUR|euros?)\s*[0-9]{1,3}(?:[ .][0-9]{3})*(?:[.,][0-9]{1,2})?|[0-9]{1,3}(?:[ .][0-9]{3})*(?:[.,][0-9]{1,2})?\s*(?:€|EUR|euros?)/giu;
const ADDITIONAL_ENROLLMENT_FEE_PATTERN = /(?:additional|extra|supplementary)[^.!?\n]{0,100}?(?:enrol(?:l)?ment|registration|inscription)[^.!?\n]{0,100}?((?:€|EUR|euro)\s*[0-9]{1,3}(?:[ .][0-9]{3})*(?:[.,][0-9]{1,2})?|[0-9]{1,3}(?:[ .][0-9]{3})*(?:[.,][0-9]{1,2})?\s*(?:€|EUR|euro))/giu;
const REGISTRATION_CONTEXT = /application fee|admission fee|application costs?|costs? of (?:the )?application|registration fee|enrolment fee|pre[- ]?enrolment fee|pre[- ]?application fee|tassa di iscrizione|tassa di ammissione|contributo di iscrizione|contributo amministrativo|contributo per l['’]ammissione(?: al concorso)?|quota di iscrizione|costo della domanda|diritti di segreteria|pagamento del contributo di ammissione|contributo per la domanda|application fee required/i;
const NON_REGISTRATION_CONTEXT = /ricerca|ricercator|research|researcher|assegno di ricerca|research grant|progetto|project|starter[- ]?kit|cofinanziamento|finanziamento|funding|borsa|scholarship|stipend|fellowship|laboratorio|annualità|phd|dottorato|gross|companies contribution|tassa regionale|imposta di bollo|prima rata|seconda rata|contribuzione universitaria|annual amount|english test|language test|test di inglese|test linguistico|prova di lingua|lingua inglese|language proficiency|english language|esame di inglese|esame linguistico|test d[’']inglese|prova d[’']inglese|contributo di partecipazione al test|contributo per il test|pagamento del contributo.*(?:test|esame|prova)|test.*(?:contributo|pagamento|50)|esame.*(?:contributo|pagamento)|pagopa.*(?:test|esame|prova)|(?:test|esame|prova).{0,100}pagopa|esoner\w*|esenti|handicap|riserva\s+del\s+posto|riservazione\s+del\s+posto|prenotazione\s+del\s+posto|conferma\s+del\s+posto|atto\s+della\s+riserva|pagamento\s+.*(?:riserva|posto)|versamento\s+.*(?:riserva|posto)|caparra|deposito\s+.*posto|quota\s+di\s+riserva|contributo\s+per\s+la\s+riserva|diritti\s+di\s+segreteria|foglio\s+di\s+congedo|congedo|trasferimento|passaggio\s+(?:da|ad|di)\s+altro\s+ateneo|altro\s+ateneo|ripresa\s+della\s+carriera|ripresa\s+carriera/i;
const NON_ADMISSION_URL_WORDS = /calendario|academic[-_]?calendar|calendario[-_]?didattico|appelli[-_]?esame|exam|esam[ei]|lezion[ei]|taught[-_]?courses|insegnamenti|english[-_]?test|language[-_]?test|test[-_]?di[-_]?inglese|test[-_]?linguistico|prova[-_]?di[-_]?lingua|rinnovo|renewal|graduation|laurea|scholarship|borsa[-_]?di[-_]?studio|research|ricerca|bandi[-_]?di[-_]?concorso|calls?[-_]?competitions|catalogo|catalog|archiv|timeview|residence[-_]?permit|permesso[-_]?di[-_]?soggiorno|tax[-_]?code|codice[-_]?fiscale|recognition[-_]?of[-_]?credits|translation[-_]?authenticity|\/dipartimento(?:\/|$)|\/department(?:\/|$)|\/docenti(?:\/|$)|\/didattica\/incarichi|(?:^|\/)ateneo\/bandi-e-concorsi(?:$|[?#])|(?:^|\/)cerca(?:\.html)?(?:[/?#]|$)|(?:^|\/)search(?:[/?#]|$)|[?&](?:query|searchaction|parsedQuery|ruolotype|searchMacro)=|bando[-_]?bip|graduatoria[-_]?finale|elezion[ei]|concorso(?!.*ammissione)/i;
// Pages that may contain dates but are not admission evidence. They are
// rejected even when their text contains words such as iscrizione or scadenza.
const GENERIC_ADMIN_URL_WORDS = /(?:^|[\/_-])(news|notizia|notizie|event|eventi|evento|ianua|studenti-scadenze|scadenziario|calendario-studenti|open-day|webinar)(?:[\/_?.#-]|$)/i;
const NON_PROGRAMME_DEADLINE_CONTEXT = /(?:collaborazion\w*|part[- ]?time|tutorato|orientamento\s+in\s+ingresso|assegn\w*\s+(?:di\s+)?incaric|incaric\w*|selezion\w*\s+(?:pubblic|personale|collaborator)|bando\s+per\s+\d+\s+collaborazion|contratt\w*\s+di\s+lavoro|reclutamento|assunzion\w*|concorso\s+pubblic|albo\s+ufficiale|official\s+bulletin|job\s+application|employment|vacanc(?:y|ies)|staff\s+position)/i;

// هذا آخر أجل للإتمام الإداري بعد القبول، وليس closing متاع candidature.
const NON_APPLICATION_CLOSING_CONTEXT = /(?:iscrizion\w*|immatricolazion\w*|enrol\w*|registration)\s+(?:online|on[- ]?line)[^.!?\n]{0,420}(?:al\s+pi[ùu]\s+tardi|entro|no\s+later\s+than|latest|au\s+plus\s+tard)/i;
const NON_HTML_DOWNLOAD_URL = /\.(?:rtf|doc|docx|xls|xlsx|odt|zip|jpg|jpeg|png|gif|mp4|mp3)(?:[?#].*)?$/i;
const PROGRAM_SERVICE_EXCLUSION = /scuola\s+dell['’]?infanzia|servizio\s+della\s+scuola|nido\s+d['’]?infanzia|nursery|scuola\s+materna|erasmus|mobilit[àa]\s+studentesca|dottorato|phd|assegno\s+di\s+ricerca|ricerca\s+scientifica/i;

function normaliseIdentity(value) {
  return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

const PROGRAM_PHRASE_ALIASES = [
  ['lingue e culture orientali e africane', 'eastern and african languages and cultures', 'oriental and african languages and cultures', 'afr'],
  ['mediazione linguistica e culturale', 'linguistic and cultural mediation', 'linguistic-cultural mediation', 'mcr'],
  ['lingue e culture comparate', 'comparative languages and cultures', 'comparative languages', 'cpr'],
  ['lingue letterature e culture dell europa e delle americhe', 'languages literatures and cultures of europe and the americas', 'languages literatures and cultures of europe and the americas', 'ear'],
  ['scienze politiche e relazioni internazionali', 'political science and international relations', 'political sciences and international relations', 'prr'],
  ['culture antiche e archeologia asia africa e mediterraneo', 'ancient cultures and archaeology asia africa and the mediterranean', 'ancient cultures and archaeology', 'am']
];

const PROGRAM_ALIAS_GROUPS = [
  ['geography', 'geographical', 'geografia', 'geografica', 'geografico'],
  ['environment', 'environmental', 'ambiente', 'ambientale'],
  ['territory', 'territorial', 'territorio', 'territoriale'],
  ['science', 'sciences', 'scienza', 'scienze'],
  ['culture', 'cultural', 'cultura', 'culturale'],
  ['education', 'educational', 'educazione', 'educativo', 'pedagogical', 'pedagogico'],
  ['tourism', 'tourist', 'turismo', 'turistica', 'turistico'],
  ['nursing', 'infermieristica', 'infermieristico'],
  ['engineering', 'ingegneria', 'engineer', 'ingegnere']
];

function expandProgramToken(token) {
  const group = PROGRAM_ALIAS_GROUPS.find(values => values.includes(token));
  return group ? group : [token];
}

function extractProgrammeCodes(value) {
  const source = String(value || '');
  const codes = new Set();
  for (const match of source.matchAll(/(?:^|[^A-Za-z0-9])((?:LMG|LM|LMCU|L|LM-)[-_ ]?\d{2,4}|\d{3,6})(?:[^A-Za-z0-9]|$)/gi)) {
    codes.add(match[1].replace(/[\s_-]/g, '').toUpperCase());
  }
  return [...codes];
}

function configuredProgramAliases(programName) {
  try {
    const raw = process.env.ADMISSIONS_PROGRAM_ALIASES_JSON;
    if (!raw) return [];
    const map = JSON.parse(raw);
    const key = normaliseIdentity(programName);
    const aliases = map[key] || map[programName] || [];
    return Array.isArray(aliases) ? aliases.filter(Boolean).map(String) : [];
  } catch (_) {
    return [];
  }
}

function phraseAliasMatch(text, programName) {
  const normalizedProgram = normaliseIdentity(programName);
  const normalizedText = normaliseIdentity(text);
  for (const group of PROGRAM_PHRASE_ALIASES) {
    const targetInGroup = group.some(phrase => normalizedProgram.includes(normaliseIdentity(phrase)));
    if (!targetInGroup) continue;
    const matched = group.find(phrase => normalizedText.includes(normaliseIdentity(phrase)));
    if (matched) return matched;
  }
  return null;
}

function extractCourseIds(value) {
  return [...new Set(String(value || '').match(/(?:^|[\\/._-])(?:corsi|courses|course)[\\/._-](\d{3,8})(?:[\\/._-]|$)/ig)?.map(match => {
    const found = match.match(/(\d{3,8})(?:[^0-9]|$)/);
    return found ? found[1] : null;
  }).filter(Boolean) || [])];
}

function sameOfficialCourse(documentUrl, programUrl) {
  const sourceIds = extractCourseIds(programUrl);
  const documentIds = extractCourseIds(documentUrl);
  return sourceIds.length > 0 && documentIds.some(id => sourceIds.includes(id));
}

function isCourseAdmissionsPage(url) {
  return /(?:futuri[-_]?studenti|prospective[-_]?students|future[-_]?students|ammissione|admission|enrol|enrolment|iscrizion|scadenz|application|candidatur|bando)/i.test(String(url || ''));
}

function documentMatchesProgram(document, programName, universityName, programUrl = '') {
  const rawText = String(document?.text || '');
  const text = normaliseIdentity(rawText);
  const program = normaliseIdentity(programName);
  if (!program) return false;

  // A course URL returned by Universitaly is a strong identity anchor. University
  // websites often render the official Italian/English title only in JavaScript,
  // navigation, or a linked page, so requiring the database title in every child
  // page incorrectly rejects the real admissions page. Accept same-course
  // admissions pages, but never generic university pages.
  if (sameOfficialCourse(document?.url, programUrl)
    && (document?.isProgramPage || isCourseAdmissionsPage(document?.url))) {
    return true;
  }

  // A URL explicitly supplied by Universitaly as the university's official
  // admissions page is already an authoritative programme seed. Such pages
  // often contain the dates but omit the full programme title from visible
  // text, so identity matching must not reject them.
  if (document?.isSeedAdmissionPage && isCourseAdmissionsPage(document?.url)) return true;

  // A service, nursery, research, Erasmus or PhD notice is never evidence for
  // a normal degree programme, even when it contains generic words such as
  // "educazione", "iscrizione" or "scadenza".
  const identityHeader = text.slice(0, 2200);
  if (PROGRAM_SERVICE_EXCLUSION.test(identityHeader)) return false;

  // If the Universitaly URL contains a programme code (for example 2396),
  // linked evidence must repeat that code or identify the programme by a
  // strong name match. Generic token overlap is not sufficient.
  const programmeCodes = extractProgrammeCodes(programUrl);
  const hasProgrammeCode = programmeCodes.some(code => new RegExp(`(?:^|[^A-Za-z0-9])${code}(?:[^A-Za-z0-9]|$)`, 'i').test(rawText));

  // Configured aliases are useful when the university uses a different Italian
  // title or an official class code than the English database title.
  const aliases = configuredProgramAliases(programName);
  if (aliases.some(alias => phraseAliasMatch(rawText, alias) || normaliseIdentity(rawText).includes(normaliseIdentity(alias)))) return true;

  // Official programme-code/name aliases are stronger than loose token overlap.
  // This handles Italian BANDO PDFs when the database name is English.
  if (phraseAliasMatch(rawText, programName)) return true;
  const stopWords = new Set(['corso', 'course', 'degree', 'laurea', 'bachelor', 'master', 'of', 'in', 'and', 'the', 'di', 'del', 'della', 'e', 'for', 'per']);
  const tokens = [...new Set(program.split(/\s+/).filter(token => token.length >= 4 && !stopWords.has(token)))];
  if (!tokens.length) return false;
  const distinctiveTokens = tokens.filter(token => !PROGRAM_GENERIC_TOKENS.has(token));
  if (!distinctiveTokens.length) return false;

  // Reject documents whose distinctive subject is clearly another programme.
  const targetHasTourism = tokens.some(token => expandProgramToken(token).includes('tourism'));
  const targetHasGeography = tokens.some(token => expandProgramToken(token).includes('geography'));
  // Check conflicts only in the title/header area. A university page may mention
  // other courses in navigation or footer; that must not invalidate this program.
  if (!targetHasTourism && /\b(?:tourism|tourist|turismo|turistica|turistico)\b/.test(identityHeader)) return false;
  if (!targetHasGeography && /\b(?:nido|nursery|infanzia|socio pedagogiche|socio pedagogica)\b/.test(identityHeader)) return false;

  const matchedGroups = new Set();
  for (const token of tokens) {
    const aliases = expandProgramToken(token);
    if (aliases.some(alias => text.includes(alias))) matchedGroups.add(aliases[0]);
  }
  const distinctiveMatched = distinctiveTokens.filter(token => expandProgramToken(token).some(alias => text.includes(alias)));
  const exactProgramPhrase = normaliseIdentity(programName).length >= 10 && text.includes(normaliseIdentity(programName));
  if (exactProgramPhrase || hasProgrammeCode) return true;
  if (distinctiveMatched.length >= Math.min(3, distinctiveTokens.length)
    && !PROGRAM_SERVICE_EXCLUSION.test(identityHeader)) return true;

  // A generic bando is accepted only when it explicitly identifies the programme page.
  const university = normaliseIdentity(universityName);
  const universityTokens = [...new Set(university.split(/\s+/).filter(token => token.length >= 5))];
  const universityMatch = universityTokens.length && universityTokens.some(token => text.includes(token));
  return Boolean(universityMatch && document?.isProgramPage && distinctiveMatched.length >= 1 && ADMISSION_WINDOW_WORDS.test(rawText));
}

function isAdmissionDocument(document) {
  if (!document) return false;

  const url = String(document.url || '').toLowerCase();
  const text = String(document.text || '');

  // A PDF explicitly supplied as an admission source is authoritative. Check
  // this before generic URL exclusions such as `calendario`, because official
  // admission calendars often contain that word in their filename.
  if (document.isPdf && document.isSeedAdmissionPage) return true;

  // News, events and generic student calendars are never proof of an
  // admission deadline. This prevents values such as IANUA 03/09/2026 from
  // being saved as the closing date of an unrelated degree programme.
  if (NON_ADMISSION_URL_WORDS.test(url) || GENERIC_ADMIN_URL_WORDS.test(url)) return false;

  // An official admissions URL supplied by Universitaly is authoritative. Do
  // not reject the whole page because a distant FAQ/navigation block mentions
  // employment, research, or another administrative context.
  if (!document.isPdf && document.isSeedAdmissionPage && isCourseAdmissionsPage(url)) return true;
  // A URL explicitly mapped as the programme/admission source is authoritative
  // when its own text contains an admission-window label such as
  // "Application deadline". Do not let unrelated words like "employment" in
  // the course description erase that direct official deadline.
  if (!document.isPdf && (document.isSeedAdmissionPage || document.isProgramPage) && ADMISSION_WINDOW_WORDS.test(text)) return true;
  if (NON_PROGRAMME_DEADLINE_CONTEXT.test(`${url} ${text}`)) return false;

  if (document.isPdf) {
    // A PDF explicitly supplied in the direct admission source map is
    // authoritative even when its table heading uses only `scadenza`.
    if (document.isSeedAdmissionPage) return true;
    const hasAdmissionPhrase = ADMISSION_DOCUMENT_TERMS.test(text)
      || EXPLICIT_OPENING_PHRASE.test(text)
      || EXPLICIT_CLOSING_PHRASE.test(text);
    const hasOnlyAdministrativeContext = /calendario\s+didattico|appelli?\s+d[’']esame|lezioni\s+dal|sessione\s+d[’']esame|studenti\s+iscritti|rinnovo|permesso\s+di\s+soggiorno/i.test(text);
    return hasAdmissionPhrase && !hasOnlyAdministrativeContext;
  }

  // A programme page may be used as a navigation seed, even if it does not
  // contain dates itself. An admissions URL explicitly supplied by Universitaly
  // is equally authoritative; its visible text may be generic or rendered
  // without the programme title.
  if (document.isProgramPage) return true;
  if (document.isSeedAdmissionPage && isCourseAdmissionsPage(url)) return true;
  return ADMISSION_DOCUMENT_TERMS.test(text)
    || EXPLICIT_OPENING_PHRASE.test(text)
    || EXPLICIT_CLOSING_PHRASE.test(text);
}

function hasTargetAcademicYear(text, document = {}) {
  if (!TARGET_YEAR_ALIASES.length) return true;

  // Normalize normal text and OCR variants such as:
  // 2026/27, 2026-27, 2026 / 2027, 202 6-27, 202 6 / 202 7.
  const raw = String(text || '').toLowerCase();
  const value = raw
    .replace(/20\s+(\d{2})/g, '20$1')
    .replace(/(20\d{2})\s*([\/-])\s*(\d{2,4})/g, '$1$2$3')
    .replace(/\s+/g, ' ');

  const compactValue = value.replace(/\s+/g, '').replace(/(20\d{2})[\/-](20)?(\d{2})/g, '$1/$3');
  const compactAliases = TARGET_YEAR_ALIASES.map(alias =>
    String(alias).toLowerCase().replace(/\s+/g, '').replace(/(20\d{2})[\/-](20)?(\d{2})/g, '$1/$3')
  );

  if (compactAliases.some(alias => compactValue.includes(alias))) return true;

  // Some official programme pages label the catalogue as 2025/2026 while
  // publishing the actual admission windows for the 2026 intake. Accept only
  // when the evidence itself contains an explicit 2026 date and an admission
  // schedule phrase; never accept a page based on an old year alone.
  const has2026Date = /(?:^|[^0-9])2026(?:[^0-9]|$)/i.test(value);
  const hasAdmissionSchedule = /candidatures?\s+en\s+ligne|demandes?\s+d['’]?admission|p[ée]riode\s+de\s+candidature|application|admission|session|s[ée]ance|date\s+limite|iscrizion\w*|immatricolazion\w*/i.test(value);
  if (has2026Date && hasAdmissionSchedule && !document.isPdf) return true;

  const hasAnyAcademicYear =
    /(?:a\.a\.?|a\.s\.?|academic year|anno accademico)[^0-9]{0,30}20\d{2}\s*[\/-]\s*20?\d{2}/i.test(value);

  // HTML programme pages may omit the academic year and link to a BANDO.
  if (!hasAnyAcademicYear) return !document.isPdf;
  return false;
}

function hasSingleVerifiedValue(item, field) {
  const values = field === 'opening' ? item?.openingDates : field === 'closing' ? item?.closingDates : item?.fees;
  return Array.isArray(values) && values.length === 1;
}

function normaliseText(html) {
  const $ = cheerio.load(html);
  $('script, style, noscript, template, svg, iframe').remove();
  return $('body').text().replace(/\s+/g, ' ').trim();
}

function isProgramRelatedLink(label, href, programName, programUrl = '') {
  const linkText = normaliseIdentity(`${label} ${href}`);
  const target = normaliseIdentity(programName);
  const stopWords = new Set(['corso', 'course', 'degree', 'laurea', 'bachelor', 'master', 'of', 'in', 'and', 'the', 'di', 'del', 'della', 'e', 'for', 'per']);
  const tokens = [...new Set(target.split(/\s+/).filter(token => token.length >= 4 && !stopWords.has(token) && !PROGRAM_GENERIC_TOKENS.has(token)))];
  if (!tokens.length) return href === programUrl;
  const matched = tokens.filter(token => expandProgramToken(token).some(alias => linkText.includes(alias)));
  if (href === programUrl) return true;
  return matched.length >= Math.min(2, tokens.length);
}

function absoluteUrl(href, base) {
  try {
    const raw = String(href || '').trim();
    if (!raw || /^(?:mailto:|tel:|javascript:|data:|#)/i.test(raw)) return null;
    if (/[()@]/.test(raw)) return null;
    const url = new URL(raw, base);
    if (/^(?:mailto:|tel:|javascript:|data:)/i.test(url.protocol)) return null;
    if (/adisurc\.it$/i.test(url.hostname)) return null;
    url.hash = "";
    return url.toString();
  } catch (_) { return null; }
}

function isHttp(url) {
  return /^https?:\/\//i.test(url || '');
}

function hostOf(url) {
  try { return new URL(url).hostname.toLowerCase().replace(/^www\./, ''); } catch (_) { return null; }
}

function sameHost(urlA, urlB) {
  const a = hostOf(urlA);
  const b = hostOf(urlB);
  return Boolean(a && b && a === b);
}

function registrableDomain(url) {
  const host = hostOf(url);
  if (!host) return null;
  const parts = host.split('.').filter(Boolean);
  if (parts.length < 2) return host;
  // Good fit for Italian university domains such as
  // suatp.cdl.unimi.it -> unimi.it and www.unimi.it -> unimi.it.
  return parts.slice(-2).join('.');
}

function sameOfficialUniversityFamily(urlA, urlB) {
  const a = registrableDomain(urlA);
  const b = registrableDomain(urlB);
  return Boolean(a && b && a === b);
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

function isDocumentLikeLink(url, label = '') {
  const value = `${url || ''} ${label || ''}`.toLowerCase();
  // A page named "documenti" or "manifesto" is an HTML hub, not a PDF.
  // Only queue it as a PDF when the URL/content clearly identifies a file.
  return isPdf(url) || /\.(?:docx?|xlsx?|odt|zip)(?:[?#].*)?$/i.test(url || '') || /file[-_]?download|media[-_]?file/i.test(value);
}

function isUniversitalyHost(url) {
  return /universitaly\.it/i.test(hostOf(url) || '');
}

function isLikelyOfficialAcademicHost(url) {
  const host = hostOf(url);
  if (!host || NON_OFFICIAL_HOSTS.test(host)) return false;
  return /\.(it|edu)$/i.test(host) || /\.ac\.uk$/i.test(host);
}

function parseDate(value, sharedYear = null) {
  if (!value) return null;
  const raw = String(value).trim().toLowerCase().replace(/\s+/g, ' ');
  const named = raw.match(/^(\d{1,2})\s+([a-zà-ÿ]+)(?:\s+(\d{4}))?$/i);
  if (named && MONTHS[named[2]]) {
    const year = named[3] || sharedYear;
    if (year) return validDate(Number(year), MONTHS[named[2]], Number(named[1]));
  }
  const monthFirst = raw.match(/^([a-zà-ÿ]+)\s*,?\s*(\d{1,2})(?:st|nd|rd|th|er)?\s*,?\s*(\d{4})?$/i);
  if (monthFirst && MONTHS[monthFirst[1]]) {
    const year = monthFirst[3] || sharedYear;
    if (year) return validDate(Number(year), MONTHS[monthFirst[1]], Number(monthFirst[2]));
  }
  const iso = raw.match(/^(\d{4})[\/\.\-](\d{1,2})[\/\.\-](\d{1,2})$/);
  if (iso) return validDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  const numeric = raw.match(/^(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{2,4})$/);
  if (!numeric) return null;
  const day = Number(numeric[1]);
  const month = Number(numeric[2]);
  const yearToken = numeric[3];
  if (yearToken.length === 4 && !/^(?:19|20)\d{2}$/.test(yearToken)) return null;
  const year = Number(yearToken.length === 2 ? `20${yearToken}` : yearToken);
  return validDate(year, month, day);
}

function validDate(year, month, day) {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(date.getTime()) || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date.toISOString().slice(0, 10);
}

async function fetchHtml(url) {
  const options = requestOptions({
    timeout: 20000,
    maxContentLength: 5 * 1024 * 1024,
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.8,it;q=0.7'
    },
    validateStatus: status => status >= 200 && status < 500
  });
  let response = await axios.get(url, options);
  // Some Italian university hosts reject plain HTTP with 405 although HTTPS works.
  if (response.status === 405 && /^http:\/\//i.test(url)) {
    const secureUrl = url.replace(/^http:\/\//i, 'https://');
    response = await axios.get(secureUrl, options);
  }
  if (response.status >= 400) throw new Error(`HTTP ${response.status}`);
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

function extractOfficialLinksFromPdfText(text, baseUrl, allowedDomains = []) {
  const source = String(text || '')
    .replace(/https?:\/\/\s+/gi, 'https://')
    .replace(/www\.\s+/gi, 'www.');
  const rawUrls = source.match(/(?:https?:\/\/|www\.)[^\s<>"'`]+/gi) || [];
  const links = [];
  for (let raw of rawUrls) {
    raw = raw.replace(/[),.;:!?\]}]+$/g, '');
    if (/^www\./i.test(raw)) raw = `https://${raw}`;
    try {
      const parsed = new URL(raw, baseUrl);
      parsed.hash = '';
      const href = parsed.toString();
      if (!isHttp(href) || isUniversitalyHost(href) || NON_OFFICIAL_HOSTS.test(href)) continue;
      const allowed = isOfficialCandidate(href, allowedDomains, false)
        || allowedDomains.some(domain => sameOfficialUniversityFamily(href, `https://${domain}`))
        || isLikelyOfficialAcademicHost(href);
      if (allowed && !links.includes(href)) links.push(href);
    } catch (_) {}
  }
  return links;
}

async function extractPdfTextWithPdftotext(buffer) {
  const configured = process.env.PDFTOTEXT_PATH
    || (process.env.PDFTOPPM_PATH ? path.join(path.dirname(process.env.PDFTOPPM_PATH), process.platform === 'win32' ? 'pdftotext.exe' : 'pdftotext') : null);
  const defaults = process.platform === 'win32' ? ['pdftotext.exe'] : ['pdftotext'];
  const candidates = [...new Set([configured, ...defaults].filter(Boolean))]
    .filter(candidate => process.platform === 'win32' || !/^[A-Za-z]:[\\/]/.test(candidate));
  const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'viatalia-pdf-'));
  const inputPath = path.join(tempDir, 'source.pdf');
  try {
    await fs.promises.writeFile(inputPath, buffer);
    for (const binary of candidates) {
      try {
        const result = await execFileAsync(binary, ['-layout', inputPath, '-'], {
          timeout: 25000,
          maxBuffer: 8 * 1024 * 1024,
          windowsHide: true
        });
        const text = String(result.stdout || '').trim();
        if (text) return text;
      } catch (_) {
        // Try the next configured/system binary.
      }
    }
    return null;
  } finally {
    await fs.promises.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

async function fetchPdfText(url) {
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

  const parserText = pdfParserModule ? await parsePdfBuffer(buffer).catch(() => null) : null;
  const cliText = await extractPdfTextWithPdftotext(buffer);
  const normalText = [parserText, cliText]
    .filter(Boolean)
    .join('\n')
    .replace(/\s+/g, ' ')
    .trim();
  let text = normalText;
  if (normalText.length < Number(process.env.ADMISSIONS_OCR_MIN_TEXT || 120)) {
    const ocrText = await ocrPdfBuffer(buffer).catch(() => null);
    text = [normalText, ocrText].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  }
  return { text: text || null, links: extractOfficialLinksFromPdfText(parserText || cliText || text, url) };
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

function dateHasExamContext(text, value) {
  const source = String(text || '');
  const datePattern = new RegExp(`\\b(${DATE_TOKEN})\\b`, 'giu');
  let match;
  while ((match = datePattern.exec(source)) !== null) {
    if (parseDate(match[1]) !== value) continue;
    const before = source.slice(Math.max(0, match.index - 120), match.index);
    const after = source.slice(match.index + match[0].length, Math.min(source.length, match.index + match[0].length + 45));
    if (/(?:data\s+)?prova(?:\s+di\s+\w+){0,4}\s*$/i.test(before)) return true;
    if (/esame(?:\s+di|\s+del|\s+il)?\s*$/i.test(before)) return true;
    if (/^\s*(?:del\s+)?(?:esame|prova)\b/i.test(after)) return true;
  }
  return false;
}

function hasGenericApplicationRangeContext(text, value, field) {
  const source = String(text || '');
  const pattern = new RegExp(`(?:application(?:s)?|admission|candidatur\\w*|domand\\w*|iscrizion\\w*|immatricolazion\\w*|enrol(?:lment|ment)?|registration)[^.!?\\n]{0,120}?(?:from|dal|du)\\s+(${DATE_TOKEN})[^.!?\\n]{0,45}?(?:to|al|au|-|–|—)\\s+(${DATE_TOKEN})(?:[,\\s]+(20[0-9]{2}))?`, 'giu');
  let match;
  while ((match = pattern.exec(source)) !== null) {
    const year = match[3] || (String(match[2]).match(/20[0-9]{2}/) || [])[0] || (String(match[1]).match(/20[0-9]{2}/) || [])[0];
    if (!year) continue;
    const first = parseDate(String(match[1]).match(/20[0-9]{2}/) ? match[1] : `${match[1]} ${year}`);
    const second = parseDate(String(match[2]).match(/20[0-9]{2}/) ? match[2] : `${match[2]} ${year}`);
    if ((field === 'opening' && first === value) || (field === 'closing' && second === value)) return true;
  }
  return false;
}

function hasSharedApplicationRangeContext(text, value, field) {
  const source = String(text || '');
  const shared = new RegExp(`(?:online\\s+application|application\\s+online|candidatures?\\s+en\\s+ligne|domande?\\s+online|domande?\\s+on[- ]?line|presentazione\\s+della\\s+domanda)[^.!?\\n]{0,80}?(?:from|dal|du)\\s+(${MONTH_NAME_TOKEN}\\s+[0-9]{1,2}(?:st|nd|rd|th|er)?)[^.!?\\n]{0,35}?(?:to|al|au)\\s+(${MONTH_NAME_TOKEN}\\s+[0-9]{1,2}(?:st|nd|rd|th|er)?)[,\\s]+(20[0-9]{2})`, 'giu');
  let match;
  while ((match = shared.exec(source)) !== null) {
    const year = Number(match[3]);
    const first = parseDate(`${match[1]} ${year}`);
    const second = parseDate(`${match[2]} ${year}`);
    if (field === 'opening' && first === value) return true;
    if (field === 'closing' && second === value) return true;
  }
  return false;
}

function hasItalianApplicationRangeContext(text, value, field) {
  const source = String(text || '');
  const pattern = new RegExp(`(?:domande?\\s+di\\s+ammissione|presentazione\\s+delle?\\s+domande?\\s+di\\s+ammissione|scadenza\\s+domanda\\s+selezione)[^.!?\\n]{0,260}?dal\\s+([0-9]{1,2}\\s+${MONTH_NAME_TOKEN}\\s+20[0-9]{2})[^.!?\\n]{0,35}?al\\s+([0-9]{1,2}\\s+${MONTH_NAME_TOKEN}\\s+20[0-9]{2})`, 'giu');
  let match;
  while ((match = pattern.exec(source)) !== null) {
    const opening = parseDate(match[1]);
    const closing = parseDate(match[2]);
    if ((field === 'opening' && opening === value) || (field === 'closing' && closing === value)) return true;
  }
  return false;
}

function hasNamedCallRangeContext(text, value, field) {
  const source = String(text || '');
  const pattern = /(?:call|round|session|appello)\s*(?:one|two|three|four|1|2|3|4)?\s*[:\-]?\s*([A-Za-zà-ÿ]+\s+\d{1,2}(?:st|nd|rd|th|er)?)\s*(?:-|–|—|to|until)\s*([A-Za-zà-ÿ]+\s+\d{1,2}(?:st|nd|rd|th|er)?)[,\s]+(20\d{2})/giu;
  let match;
  while ((match = pattern.exec(source)) !== null) {
    const opening = parseDate(`${match[1]} ${match[3]}`);
    const closing = parseDate(`${match[2]} ${match[3]}`);
    if ((field === 'opening' && opening === value) || (field === 'closing' && closing === value)) return true;
  }
  return false;
}

function dateHasClosingContext(text, value) {
  if (hasItalianApplicationRangeContext(text, value, 'closing')) return true;
  if (hasGenericApplicationRangeContext(text, value, 'closing')) return true;
  if (hasSharedApplicationRangeContext(text, value, 'closing')) return true;
  if (hasNamedCallRangeContext(text, value, 'closing')) return true;

  const source = String(text || '');
  const datePattern = new RegExp(`\\b(${DATE_TOKEN})\\b`, 'giu');
  let match;
  while ((match = datePattern.exec(source)) !== null) {
    if (parseDate(match[1]) !== value || dateHasExamContext(source, value)) continue;
    const before = source.slice(Math.max(0, match.index - 260), match.index);
    const after = source.slice(match.index + match[0].length, Math.min(source.length, match.index + match[0].length + 260));
    const sentenceStart = Math.max(0, source.lastIndexOf('.', match.index), source.lastIndexOf('!', match.index), source.lastIndexOf('?', match.index), source.lastIndexOf('\n', match.index)) + 1;
    const sentenceEndCandidates = ['.', '!', '?', '\n'].map(mark => {
      const index = source.indexOf(mark, match.index + match[0].length);
      return index < 0 ? source.length : index;
    });
    const sentenceEnd = Math.min(...sentenceEndCandidates);
    const context = `${source.slice(sentenceStart, sentenceEnd)} ${before} ${after}`;
    if (NON_APPLICATION_CLOSING_CONTEXT.test(context) || /(?:iscrizion\w*|immatricolazion\w*|enrol\w*|registration)\s+(?:online|on[- ]?line)/i.test(context) && /(?:al\s+pi[ùu]\s+tardi|entro|no\s+later\s+than|latest|au\s+plus\s+tard)/i.test(context)) continue;
    // Une date n’est acceptée que si le même extrait parle explicitement de
    // candidature/inscription. Une deadline isolée ne suffit pas.
    if (!hasStrictAdmissionContext(context)) continue;
    if (EXPLICIT_CLOSING_PHRASE.test(context)) return true;
  }
  return false;
}

function dateHasOpeningContext(text, value) {
  if (hasItalianApplicationRangeContext(text, value, 'opening')) return true;
  if (hasGenericApplicationRangeContext(text, value, 'opening')) return true;
  if (hasSharedApplicationRangeContext(text, value, 'opening')) return true;
  if (hasNamedCallRangeContext(text, value, 'opening')) return true;
  const source = String(text || '');
  const datePattern = new RegExp(`\\b(${DATE_TOKEN})\\b`, 'giu');
  let match;
  while ((match = datePattern.exec(source)) !== null) {
    if (parseDate(match[1]) !== value || dateHasExamContext(source, value) || dateHasClosingContext(source, value)) continue;
    const before = source.slice(Math.max(0, match.index - 85), match.index);
    const after = source.slice(match.index + match[0].length, Math.min(source.length, match.index + match[0].length + 45));
    const context = `${before} ${after}`;
    if (!hasStrictAdmissionContext(context)) continue;
    if (EXPLICIT_OPENING_PHRASE.test(context)) return true;
  }
  return false;
}

function dateHasAdmissionContext(text, value) {
  const source = String(text || '');
  const datePattern = new RegExp(`\\b(${DATE_TOKEN})\\b`, 'giu');
  let match;
  while ((match = datePattern.exec(source)) !== null) {
    if (parseDate(match[1]) !== value) continue;
    const context = source.slice(Math.max(0, match.index - 120), Math.min(source.length, match.index + match[0].length + 120));
    const nearbyBefore = source.slice(Math.max(0, match.index - 70), match.index);
    const nearbyAfter = source.slice(match.index + match[0].length, Math.min(source.length, match.index + match[0].length + 70));
    const nearby = `${nearbyBefore} ${nearbyAfter}`;
    if (NON_ADMISSION_DATE_WORDS.test(context) || NON_REGISTRATION_CONTEXT.test(context)) continue;
    if (NON_ADMISSION_DATE_WORDS.test(nearby) || NON_REGISTRATION_CONTEXT.test(nearby)) continue;
    if (NON_PROGRAMME_DEADLINE_CONTEXT.test(context) || NON_PROGRAMME_DEADLINE_CONTEXT.test(nearby)) continue;
    if (ADMISSION_WINDOW_WORDS.test(nearby)) return true;
    if (match.index === datePattern.lastIndex) datePattern.lastIndex += 1;
  }
  return false;
}

function normaliseFee(value) {
  if (!value) return null;
  const raw = String(value).replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
  const number = raw.match(/[0-9]{1,3}(?:[ .][0-9]{3})*(?:[.,][0-9]{1,2})?/);
  if (!number) return null;
  const cleaned = number[0].replace(/[ .](?=\d{3}(?:[.,]|$))/g, '').replace(',', '.');
  const numeric = Number(cleaned);
  return Number.isFinite(numeric) ? String(numeric) : cleaned;
}

function extractAdmissionRowDates(text) {
  const source = String(text || '').replace(/\[\[PDF_PAGE:\d+\]\]/g, ' ');
  const rowMatch = source.match(/iscrizione\s+al\s+concorso\s+e\s+pagamento\s+(?:del\s+)?contributo\s+di\s+ammissione([\s\S]{0,240}?)(?=pubblicazione\s+graduatoria|immatricolazione|passaggio|trasferimento|$)/iu);
  if (!rowMatch) return [];
  const rowDates = [];
  const datePattern = new RegExp(`\\b(${DATE_TOKEN})\\b`, 'giu');
  let match;
  while ((match = datePattern.exec(rowMatch[1])) !== null) {
    const value = parseDate(match[1]);
    if (value) rowDates.push(value);
    if (match.index === datePattern.lastIndex) datePattern.lastIndex += 1;
  }
  return unique(rowDates);
}

function extractAdditionalEnrollmentFees(text) {
  const source = String(text || '').replace(/\s+/g, ' ').trim();
  const results = [];
  const patterns = [
    ADDITIONAL_ENROLLMENT_FEE_PATTERN,
    // Ca' Foscari صيغة: "additional enrolment period ... payment of an additional 50,00 Euros fee".
    /(?:additional|extra|supplementary)[^.!?\n]{0,260}?(?:additional\s+)?((?:€|EUR|euro)\s*[0-9]{1,3}(?:[ .][0-9]{3})*(?:[.,][0-9]{1,2})?|[0-9]{1,3}(?:[ .][0-9]{3})*(?:[.,][0-9]{1,2})?\s*(?:€|EUR|euros?))\s+fees?/giu
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(source)) !== null) {
      const amount = normaliseFee(match[1]);
      if (amount) {
        results.push({
          amount,
          currency: 'EUR',
          matchedText: source.slice(Math.max(0, match.index - 120), Math.min(source.length, match.index + match[0].length + 120)).trim()
        });
      }
      if (match.index === pattern.lastIndex) pattern.lastIndex += 1;
    }
    pattern.lastIndex = 0;
  }
  return results.filter((item, index, list) => list.findIndex(candidate => candidate.amount === item.amount) === index);
}

function extractRegistrationFees(text) {
  const source = String(text || '');
  const fees = [];
  // Tuition/annual-tax amounts must never become an application fee merely
  // because the same page also contains the words "application fee".
  const NON_APPLICATION_FEE_CONTEXT = /annual\s+(?:university\s+)?tax(?:es)?|annual\s+tuition|tuition\s+fee|tuition|university\s+tax(?:es)?|contribuzione\s+universitaria|tasse\s+universitarie|quota\s+annuale/i;
  // English official calls commonly use: "application fee of 30 euros".
  // Keep this explicit application-fee proof ahead of broader context filters.
  const explicitApplicationFeePatterns = [
    // English: "application fee of 30 euros" / "application fee: 30 EUR".
    /application\s+fee[^.!?\n]{0,100}?([0-9]{1,3}(?:[.,][0-9]{1,2})?)\s*(?:€|EUR|euros?)/giu,
    // English portals also use: "Application fee €20 one-time".
    /application\s+fee[^.!?\n]{0,40}?((?:€|EUR|euros?)\s*[0-9]{1,3}(?:[.,][0-9]{1,2})?)/giu
  ];
  for (const explicitApplicationFeePattern of explicitApplicationFeePatterns) {
    let explicitFeeMatch;
    while ((explicitFeeMatch = explicitApplicationFeePattern.exec(source)) !== null) {
      const fee = normaliseFee(explicitFeeMatch[1]);
      if (fee) fees.push(fee);
      if (explicitFeeMatch.index === explicitApplicationFeePattern.lastIndex) explicitApplicationFeePattern.lastIndex += 1;
    }
  }
  let match;
  while ((match = MONEY_PATTERN.exec(source)) !== null) {
    const context = source.slice(Math.max(0, match.index - 220), Math.min(source.length, match.index + match[0].length + 220));
    if (NON_REGISTRATION_CONTEXT.test(context)) continue;
    if (NON_APPLICATION_FEE_CONTEXT.test(context)) continue;
    if (NON_PROGRAMME_DEADLINE_CONTEXT.test(context)) continue;
    const explicitCycle = context.match(/(?:a\.?\s*y\.?|a\.?\s*a\.?|academic\s+year|anno\s+accademico)[^0-9]{0,24}20\d{2}\s*[\/-]\s*(?:20)?\d{2}/i);
    if (explicitCycle && !hasTargetAcademicYear(context, { isPdf: true })) continue;
    if (!REGISTRATION_CONTEXT.test(context)) continue;
    // Un simple « application/admission/iscrizione » dans la page ne suffit
    // pas: le montant doit être attaché à une expression de frais explicite.
    if (!/(?:€|EUR|euro)/i.test(match[0])) continue;
    const fee = normaliseFee(match[0]);
    if (fee) fees.push(fee);
    if (match.index === MONEY_PATTERN.lastIndex) MONEY_PATTERN.lastIndex += 1;
  }
    MONEY_PATTERN.lastIndex = 0;

  // Italian competition pages often state the application fee as:
  // `Contributo per l'ammissione al concorso: 50,00 euro`.
  // This is an application/competition fee, not an enrolment or renewal fee.
  const italianAdmissionFeePattern = /contributo\s+(?:per\s+)?l['’]ammissione(?:\s+al\s+concorso)?[\s:=-]{0,18}([0-9]{1,3}(?:[.,][0-9]{1,2})?)\s*(?:€|EUR|euro)\b/giu;
  let italianFeeMatch;
  while ((italianFeeMatch = italianAdmissionFeePattern.exec(source)) !== null) {
    const fee = normaliseFee(italianFeeMatch[1]);
    if (fee) fees.push(fee);
    if (italianFeeMatch.index === italianAdmissionFeePattern.lastIndex) italianAdmissionFeePattern.lastIndex += 1;
  }
  return unique(fees);
}
function extractValues(text) {
  const source = String(text || '');
  const admissionRanges = [];
  const tableOpeningDates = [];
  const tableClosingDates = [];
  // Official Italian admission calendars often place the admission label
  // in a table row and write the interval as `dal DD/MM/YYYY al DD/MM/YYYY`.
  // The label and the dates can be separated by line breaks/cells, so the
  // generic sentence parser must not be the only parser for this format.
  const italianDeadlineRow = new RegExp(`(?:prima|seconda|terza|quarta|quinta)(?:\\s+scadenza)?[\\s\\S]{0,220}?\\bdal\\s+(${DATE_TOKEN})\\s+al\\s+(${DATE_TOKEN})`, 'giu');
  let italianRow;
  while ((italianRow = italianDeadlineRow.exec(source)) !== null) {
    const opening = parseDate(italianRow[1]);
    const closing = parseDate(italianRow[2]);
    if (opening && closing && hasTargetAcademicYear(source, { isPdf: true })) {
      tableOpeningDates.push(opening);
      tableClosingDates.push(closing);
    }
    if (italianRow.index === italianDeadlineRow.lastIndex) italianDeadlineRow.lastIndex += 1;
  }
  const sharedRangeDatePart = `(?:${MONTH_NAME_TOKEN}\\s*,?\\s*\\d{1,2}(?:st|nd|rd|th|er)?|\\d{1,2}\\s+${MONTH_NAME_TOKEN})`;
  const sharedRangePattern = new RegExp(`(${sharedRangeDatePart})\\s*(?:-|–|—|to|until|du|au|al|dal)\\s*(${sharedRangeDatePart})[, ]+(20\\d{2})`, 'giu');
  // Support full date ranges where each endpoint carries its own year,
  // for example: "10 November 2025 - 17 December 2025". This is common
  // in official intake schedules and must not be reduced to the closing date.
  const fullDateRangePattern = new RegExp(`(${DATE_TOKEN})\\s*(?:-|–|—|to|until|du|au|al|dal)\\s*(${DATE_TOKEN})`, 'giu');
  const fullRangeOpeningDates = [];
  const fullRangeClosingDates = [];

  // Some official pages put the timezone/time between the endpoints:
  // `From November 24, 2025 (00:01 am CET) + To December 22, 2025
  // (11:59 pm CET)`. Capture the two dates while ignoring the time metadata.
  const fromToTimedRangePattern = new RegExp(`\\bfrom\\s+(${DATE_TOKEN})(?:\\s*\\([^)]{0,120}\\))?\\s*(?:\\+\\s*)?to\\s+(${DATE_TOKEN})`, 'giu');
  let fromToTimedRangeMatch;
  while ((fromToTimedRangeMatch = fromToTimedRangePattern.exec(source)) !== null) {
    const context = source.slice(Math.max(0, fromToTimedRangeMatch.index - 180), Math.min(source.length, fromToTimedRangeMatch.index + fromToTimedRangeMatch[0].length + 180));
    const opening = parseDate(fromToTimedRangeMatch[1]);
    const closing = parseDate(fromToTimedRangeMatch[2]);
    if (opening && closing && opening <= closing && (ADMISSION_RANGE_LABEL.test(context) || hasStrictAdmissionContext(context))) {
      fullRangeOpeningDates.push(opening);
      fullRangeClosingDates.push(closing);
    }
    if (fromToTimedRangeMatch.index === fromToTimedRangePattern.lastIndex) fromToTimedRangePattern.lastIndex += 1;
  }

  // Fallback for CMS output that removes the whitespace before `To` or
  // inserts timezone metadata in a different form. The bounded gap prevents
  // crossing into the next Call while accepting the official Timeframe block.
  const looseFromToPattern = new RegExp(`\\bfrom\\s+(${DATE_TOKEN})[\\s\\S]{0,100}?\\bto\\s+(${DATE_TOKEN})`, 'giu');
  let looseFromToMatch;
  while ((looseFromToMatch = looseFromToPattern.exec(source)) !== null) {
    const context = source.slice(Math.max(0, looseFromToMatch.index - 180), Math.min(source.length, looseFromToMatch.index + looseFromToMatch[0].length + 180));
    const opening = parseDate(looseFromToMatch[1]);
    const closing = parseDate(looseFromToMatch[2]);
    if (opening && closing && opening <= closing && (ADMISSION_RANGE_LABEL.test(context) || /timeframe|application\\s+calls?/i.test(context))) {
      fullRangeOpeningDates.push(opening);
      fullRangeClosingDates.push(closing);
    }
    if (looseFromToMatch.index === looseFromToPattern.lastIndex) looseFromToPattern.lastIndex += 1;
  }

  let fullRangeMatch;
  while ((fullRangeMatch = fullDateRangePattern.exec(source)) !== null) {
    const before = source.slice(Math.max(0, fullRangeMatch.index - 220), fullRangeMatch.index);
    const after = source.slice(fullRangeMatch.index + fullRangeMatch[0].length, Math.min(source.length, fullRangeMatch.index + fullRangeMatch[0].length + 120));
    const context = `${before} ${fullRangeMatch[0]} ${after}`;
    const lowerBefore = before.toLowerCase();
    const lastApplicationLabel = Math.max(lowerBefore.lastIndexOf('online application'), lowerBefore.lastIndexOf('application period'), lowerBefore.lastIndexOf('application'));
    const lastResultsLabel = Math.max(lowerBefore.lastIndexOf('results publishing'), lowerBefore.lastIndexOf('publication of results'), lowerBefore.lastIndexOf('result date'));
    if (lastResultsLabel > lastApplicationLabel) continue;
    if (!hasStrictAdmissionContext(context) && !ADMISSION_RANGE_LABEL.test(context)) continue;
    const opening = parseDate(fullRangeMatch[1]);
    const closing = parseDate(fullRangeMatch[2]);
    if (opening && closing && opening <= closing) {
      fullRangeOpeningDates.push(opening);
      fullRangeClosingDates.push(closing);
    }
    if (fullRangeMatch.index === fullDateRangePattern.lastIndex) fullDateRangePattern.lastIndex += 1;
  }

  const sharedOpeningDates = [];
  const sharedClosingDates = [];
  let sharedRangeMatch;
  while ((sharedRangeMatch = sharedRangePattern.exec(source)) !== null) {
    const before = source.slice(Math.max(0, sharedRangeMatch.index - 220), sharedRangeMatch.index);
    const after = source.slice(sharedRangeMatch.index + sharedRangeMatch[0].length, Math.min(source.length, sharedRangeMatch.index + sharedRangeMatch[0].length + 120));
    const context = `${before} ${sharedRangeMatch[0]} ${after}`;
    // The results date follows valid application ranges in the same sentence.
    // Only reject when the results label appears before the range itself.
    const lowerBefore = before.toLowerCase();
    const lastApplicationLabel = Math.max(lowerBefore.lastIndexOf('online application'), lowerBefore.lastIndexOf('application'));
    const lastResultsLabel = Math.max(lowerBefore.lastIndexOf('results publishing'), lowerBefore.lastIndexOf('publication of results'), lowerBefore.lastIndexOf('result date'));
    const isResultsRange = lastResultsLabel > lastApplicationLabel;
    if (!isResultsRange && (lastApplicationLabel >= 0 || ADMISSION_RANGE_LABEL.test(before))) {
      const opening = parseDate(sharedRangeMatch[1], sharedRangeMatch[3]);
      const closing = parseDate(sharedRangeMatch[2], sharedRangeMatch[3]);
      if (opening && closing) {
        sharedOpeningDates.push(opening);
        sharedClosingDates.push(closing);
      }
    }
    if (sharedRangeMatch.index === sharedRangePattern.lastIndex) sharedRangePattern.lastIndex += 1;
  }
  const rangeOpeningValues = new Set([...tableOpeningDates, ...sharedOpeningDates, ...fullRangeOpeningDates]);
  const rangeClosingValues = new Set([...tableClosingDates, ...sharedClosingDates, ...fullRangeClosingDates]);
  let openingDates = unique(allMatches(source, OPENING_PATTERNS))
    .map(parseDate)
    .filter(Boolean)
    .filter(value => dateHasOpeningContext(source, value));
  // Full endpoint ranges are already validated against admission context above;
  // include both endpoints in the evidence candidates used by pairing and saving.
  openingDates.push(...fullRangeOpeningDates);
  let closingDates = unique(allMatches(source, CLOSING_PATTERNS))
    .map(parseDate)
    .filter(Boolean)
    .filter(value => dateHasClosingContext(source, value));
  closingDates.push(...fullRangeClosingDates);

  // Some official course portals render the deadline as a labelled field:
  // "Application deadline 14 Sep 2026, 23:59:59". The time is intentionally
  // ignored; the calendar date remains the authoritative admission deadline.
  const labelledDeadlinePattern = new RegExp(`(?:application|admission)\\s+deadline\\s*[:\\-]?\\s*(${DATE_TOKEN})`, 'giu');
  let labelledDeadlineMatch;
  while ((labelledDeadlineMatch = labelledDeadlinePattern.exec(source)) !== null) {
    const deadline = parseDate(labelledDeadlineMatch[1]);
    if (deadline) {
      closingDates.push(deadline);
      rangeClosingValues.add(deadline);
    }
    if (labelledDeadlineMatch.index === labelledDeadlinePattern.lastIndex) labelledDeadlinePattern.lastIndex += 1;
  }

  const tableAdmissionDates = extractAdmissionRowDates(source);
  if (tableAdmissionDates.length) {
    // Dans un bando structuré, la ligne « Iscrizione al concorso... » est prioritaire.
    // Les dates de « Data prova di ammissione » sont des examens et jamais des deadlines.
    openingDates = openingDates
      .filter(value => !tableAdmissionDates.includes(value))
      .filter(value => !dateHasExamContext(source, value));
    // Il tableau officiel est prioritaire: ses dates de la ligne d'inscription
    // remplacent les dates génériques extraites d'autres lignes de la page/PDF.
    closingDates = [...tableAdmissionDates];
  }
    const fees = extractRegistrationFees(source);
  const additionalEnrollmentFees = extractAdditionalEnrollmentFees(source);
  const tuition = extractTuitionCandidates(source);

  // General admission ranges: official pages frequently use `from X to Y`
  // and may put a comma after the month (`March, 4 2026`) or omit the year
  // from the opening date when it is written once at the end of the range.
  const explicitApplicationRangePattern = new RegExp(`(?:from|dal|du)\\s*(${DATE_TOKEN})\\s*(?:to|al|au)\\s*(${DATE_TOKEN})`, 'giu');
  let explicitApplicationRange;
  while ((explicitApplicationRange = explicitApplicationRangePattern.exec(source)) !== null) {
    const opening = parseDate(explicitApplicationRange[1]);
    const closing = parseDate(explicitApplicationRange[2]);
    if (opening && closing && dateHasAdmissionContext(source, opening) && dateHasAdmissionContext(source, closing)) {
      rangeOpeningValues.add(opening);
      rangeClosingValues.add(closing);
      openingDates.push(opening);
      closingDates.push(closing);
    }
    if (explicitApplicationRange.index === explicitApplicationRangePattern.lastIndex) explicitApplicationRangePattern.lastIndex += 1;
  }

  const sharedApplicationRangePattern = new RegExp(`(?:from|dal|du)\\s*(${sharedRangeDatePart})\\s*(?:to|al|au)\\s*(${sharedRangeDatePart})[, ]+(20\\d{2})`, 'giu');
  let sharedApplicationRange;
  while ((sharedApplicationRange = sharedApplicationRangePattern.exec(source)) !== null) {
    const opening = parseDate(sharedApplicationRange[1], sharedApplicationRange[3]);
    const closing = parseDate(sharedApplicationRange[2], sharedApplicationRange[3]);
    if (opening && closing && dateHasAdmissionContext(source, opening) && dateHasAdmissionContext(source, closing)) {
      rangeOpeningValues.add(opening);
      rangeClosingValues.add(closing);
      openingDates.push(opening);
      closingDates.push(closing);
    }
    if (sharedApplicationRange.index === sharedApplicationRangePattern.lastIndex) sharedApplicationRangePattern.lastIndex += 1;
  }

  // Dates dans une seule ligne de tableau: 2026-05-12 - 2026-07-31.
  let labelledApplicationRange;
  while ((labelledApplicationRange = LABELLED_APPLICATION_RANGE_PATTERN.exec(source)) !== null) {
    const sharedYear = labelledApplicationRange[3] || null;
    const opening = parseDate(labelledApplicationRange[1], sharedYear);
    const closing = parseDate(labelledApplicationRange[2], sharedYear);
    if (opening && closing) {
      rangeOpeningValues.add(opening);
      rangeClosingValues.add(closing);
      openingDates.push(opening);
      closingDates.push(closing);
    }
    if (labelledApplicationRange.index === LABELLED_APPLICATION_RANGE_PATTERN.lastIndex) LABELLED_APPLICATION_RANGE_PATTERN.lastIndex += 1;
  }

  const rangePattern = new RegExp(`(${DATE_TOKEN})\\s*(?:-|–|—|to|until|au|al|fino al|entro il)\\s*(${DATE_TOKEN})`, 'giu');
  let rangeMatch;
  while ((rangeMatch = rangePattern.exec(source)) !== null) {
    const opening = parseDate(rangeMatch[1]);
    const closing = parseDate(rangeMatch[2]);
const before = source.slice(Math.max(0, rangeMatch.index - 220), rangeMatch.index);
    const after = source.slice(rangeMatch.index + rangeMatch[0].length, Math.min(source.length, rangeMatch.index + rangeMatch[0].length + 120));
    const rangeContext = `${before} ${rangeMatch[0]} ${after}`;
    const resultsContext = /result|outcome|publication|pubblicazione|esit[io]/i.test(before);
    const strongAdmissionRange = /application|admission|intake|round|call\s+(?:one|two|three|four|1|2|3|4)|scadenza|deadline|candidatur\w*|domand\w*|ammissione/i.test(rangeContext);
    const unrelatedRange = /TOLC|CISIA|test|esame|exam|lezion|tuition|payment|pagamento|prima\s+rata|seconda\s+rata/i.test(rangeContext);
    const explicitAdmissionRange = ADMISSION_RANGE_LABEL.test(rangeContext) && strongAdmissionRange && !unrelatedRange && !resultsContext;
    if (opening && closing && (explicitAdmissionRange || (dateHasOpeningContext(source, opening) && dateHasClosingContext(source, closing)))) {
      rangeOpeningValues.add(opening);
      rangeClosingValues.add(closing);
      openingDates.push(opening);
      closingDates.push(closing);
    }
    if (rangeMatch.index === rangePattern.lastIndex) rangePattern.lastIndex += 1;
  }

  // In an explicit admission range, the first date is opening and the second is closing.
  // Generic deadline patterns may also classify the first date as a closing candidate;
  // remove that duplicate before chronological pairing.
  if (rangeOpeningValues.size) {
    closingDates = closingDates.filter(value => !rangeOpeningValues.has(value));
  }
  if (rangeClosingValues.size) {
    openingDates = openingDates.filter(value => !rangeClosingValues.has(value));
  }

  // Fallback pour les tableaux où les mots admission/deadline sont séparés
  // des cellules de date.
  if (ADMISSION_LINK_WORDS.test(source)) {
    const genericDatePattern = new RegExp(`\\b(${DATE_TOKEN})\\b`, 'giu');
    let dateMatch;
    while ((dateMatch = genericDatePattern.exec(source)) !== null) {
      const value = parseDate(dateMatch[1]);
      if (!value) continue;
const context = source.slice(Math.max(0, dateMatch.index - 85), dateMatch.index + dateMatch[0].length + 45).toLowerCase();
      const escapedDate = String(dateMatch[1]).replace(/[.*+?^${}()|[\\]\\]/g, '\\\\$&');
      const rangeStart = new RegExp(`${escapedDate}\\s*(?:-|–|—|to|until|du|dal|al|au)\\s*${DATE_TOKEN}`, 'iu').test(
        source.slice(dateMatch.index, dateMatch.index + 220)
      );
      if (rangeStart) {
        openingDates.push(value);
        continue;
      }
      const openingContext = dateHasOpeningContext(source, value);
      const closingContext = dateHasClosingContext(source, value) || /deadline|scadenz|closing|chiusur|termine|entro|fino al|until|by/.test(context);
      if (openingContext) openingDates.push(value);
      else if (closingContext) closingDates.push(value);
      if (dateMatch.index === genericDatePattern.lastIndex) genericDatePattern.lastIndex += 1;
    }
  }

  // Support official tables written as `1 July 2026 – 20 November 2026`.
  // The previous shared-range parser only accepted `July 1 – November 20 2026`,
  // which caused Messina's direct page to yield closing candidates but no opening.
  const dayFirstRangePattern = new RegExp(`([0-9]{1,2}\\s+${MONTH_NAME_TOKEN}\\s+20\\d{2})\\s*(?:-|–|—|to|until|du|au)\\s*([0-9]{1,2}\\s+${MONTH_NAME_TOKEN}\\s+20\\d{2})`, 'giu');
  let dayFirstRangeMatch;
  while ((dayFirstRangeMatch = dayFirstRangePattern.exec(source)) !== null) {
    const before = source.slice(Math.max(0, dayFirstRangeMatch.index - 220), dayFirstRangeMatch.index);
    const after = source.slice(dayFirstRangeMatch.index + dayFirstRangeMatch[0].length, Math.min(source.length, dayFirstRangeMatch.index + dayFirstRangeMatch[0].length + 120));
    const context = `${before} ${dayFirstRangeMatch[0]} ${after}`;
    if (!hasStrictAdmissionContext(context)) continue;
    const opening = parseDate(dayFirstRangeMatch[1]);
    const closing = parseDate(dayFirstRangeMatch[2]);
    if (opening && closing) {
      sharedOpeningDates.push(opening);
      sharedClosingDates.push(closing);
    }
    if (dayFirstRangeMatch.index === dayFirstRangePattern.lastIndex) dayFirstRangePattern.lastIndex += 1;
  }

    openingDates.push(...sharedOpeningDates, ...tableOpeningDates);
  closingDates.push(...sharedClosingDates, ...tableClosingDates);

  // Preserve the original range and its nearby Call/group label. Sorting two
  // independent date lists is ambiguous when Padova has unlimited and limited
  // calls whose windows overlap. This generic pass works for all official pages
  // using a date range and never invents a value: both dates must parse from the
  // same source span.
  const admissionRangePattern = new RegExp(`(${DATE_TOKEN})\\s*(?:-|–|—|to|until|du|au)\\s*(${DATE_TOKEN})(?:[,\\s]+(20\\d{2}))?`, 'giu');
  let admissionRangeMatch;
  while ((admissionRangeMatch = admissionRangePattern.exec(source)) !== null) {
    const year = admissionRangeMatch[3] || null;
    const opening = parseDate(admissionRangeMatch[1], year);
    const closing = parseDate(admissionRangeMatch[2], year);
    if (!opening || !closing || opening > closing) continue;
    const before = source.slice(Math.max(0, admissionRangeMatch.index - 220), admissionRangeMatch.index);
    const context = `${before} ${admissionRangeMatch[0]}`;
    if (!hasStrictAdmissionContext(context) && !ADMISSION_WINDOW_WORDS.test(context)) continue;
    const call = context.match(/call\\s+(one|two|three|four|five|six|1st|2nd|3rd|4th|5th|6th)/i);
    const group = context.match(/(unlimited|limited)\\s+(?:number\\s+of\\s+)?places?/i);
    admissionRanges.push({
      openingDate: opening,
      closingDate: closing,
      label: call ? `Call ${call[1]}` : '',
      group: group ? group[1].toLowerCase() : '',
      sourceIndex: admissionRangeMatch.index
    });
    if (admissionRangeMatch.index === admissionRangePattern.lastIndex) admissionRangePattern.lastIndex += 1;
  }
  // Named Call blocks are parsed separately because Padova writes the year
  // once at the end of a range and repeats Call One in two different groups.
  const callBlockPattern = /(?:^|[\n.])\s*[*_]{0,3}(call|session|round)\s+(one|two|three|four|five|six|1st|2nd|3rd|4th|5th|6th)[*_]{0,3}[^\n]{0,220}?[:\-]([\s\S]*?)(?=(?:[\n.]\s*[*_]{0,3}(?:call|session|round)\s+(?:one|two|three|four|five|six|1st|2nd|3rd|4th|5th|6th)\b)|$)/giu;
  let callBlockMatch;
  while ((callBlockMatch = callBlockPattern.exec(source)) !== null) {
    const block = callBlockMatch[3] || '';
    const blockRangePattern = new RegExp(`(${MONTH_NAME_TOKEN}\\s+\\d{1,2}(?:st|nd|rd|th|er)?(?:,\\s*20\\d{2})?)\\s*(?:-|–|—|to|until)\\s*(${MONTH_NAME_TOKEN}\\s+\\d{1,2}(?:st|nd|rd|th|er)?(?:,\\s*20\\d{2})?)`, 'iu');
    const blockRange = block.match(blockRangePattern);
    if (!blockRange) continue;
    const closingYear = String(blockRange[2]).match(/20\\d{2}/)?.[0] || String(block).match(/20\\d{2}/)?.[0] || null;
    const opening = parseDate(blockRange[1], closingYear);
    const closing = parseDate(blockRange[2], closingYear);
    if (!opening || !closing || opening > closing) continue;
    const surrounding = source.slice(Math.max(0, callBlockMatch.index - 260), callBlockMatch.index + callBlockMatch[0].length);
    const group = surrounding.match(/(unlimited|limited)\\s+(?:number\\s+of\\s+)?places?/i);
    admissionRanges.push({
      openingDate: opening,
      closingDate: closing,
      label: `Call ${callBlockMatch[2]}`,
      group: group ? group[1].toLowerCase() : '',
      sourceIndex: callBlockMatch.index
    });
  }
  const uniqueRanges = admissionRanges.filter((range, index, list) => list.findIndex(item => item.openingDate === range.openingDate && item.closingDate === range.closingDate) === index);
  return {
    openingDates: unique(openingDates),
    closingDates: unique(closingDates),
    admissionRanges: uniqueRanges,
    fees: unique(fees),
    additionalEnrollmentFees,
    tuition: unique(tuition)
  };
}

const TUITION_CONTEXT = /premier\s+versement|first\s+installment|frais\s+(?:de\s+)?scolarit|droits?\s+d['’]?inscription|university\s+fees|tuition\s+fees?|contribuzione\s+universitaria|contributi\s+universitari|prima\s+rata|rata\s+universitaria|immatricolazione/i;
const FEE_PAGE_LINK_WORDS = /student|studenti|etudiant|étudiant|frais|fees|tuition|scolarit|contribuzion|impost|pagament|payment|pagopa|versament|modalit|tass[ae]|registration|enrolment|immatricol/i;

function extractTuitionCandidates(text) {
  const source = String(text || '').replace(/\s+/g, ' ').trim();
  if (!source || !TUITION_CONTEXT.test(source)) return [];
  const money = /(?:€|EUR|euro)\\s*[0-9]{1,3}(?:[ .][0-9]{3})*(?:[.,][0-9]{1,2})?|[0-9]{1,3}(?:[ .][0-9]{3})*(?:[.,][0-9]{1,2})?\\s*(?:€|EUR|euro)/giu;
  const results = [];
  let match;
  while ((match = money.exec(source)) !== null) {
    const context = source.slice(Math.max(0, match.index - 260), Math.min(source.length, match.index + match[0].length + 260));
if (!TUITION_CONTEXT.test(context)) continue;
    if (NON_REGISTRATION_CONTEXT.test(context) || NON_ADMISSION_DATE_WORDS.test(context)) continue;
    if (NON_PROGRAMME_DEADLINE_CONTEXT.test(context)) continue;
    const explicitCycle = context.match(/(?:a\.?\s*y\.?|a\.?\s*a\.?|academic\s+year|anno\s+accademico)[^0-9]{0,24}20\d{2}\s*[\/-]\s*(?:20)?\d{2}/i);
    if (explicitCycle && !hasTargetAcademicYear(context, { isPdf: true })) continue;
    const value = match[0].replace(/\s+/g, ' ').trim();
    if (!results.some(item => normaliseFee(item) === normaliseFee(value))) results.push(value);
    if (match.index === money.lastIndex) money.lastIndex += 1;
  }
  return results;
}

function makeFeeSnippet(text, expectedFee) {
  const source = String(text || '').replace(/\s+/g, ' ').trim();
  const wanted = normaliseFee(expectedFee);
  if (!source || !wanted) return null;
  const feePattern = /(?:€|EUR|euro)\s*[0-9]{1,3}(?:[ .][0-9]{3})*(?:[.,][0-9]{1,2})?|[0-9]{1,3}(?:[ .][0-9]{3})*(?:[.,][0-9]{1,2})?\s*(?:€|EUR|euro)/giu;
  let match;
  while ((match = feePattern.exec(source)) !== null) {
    if (normaliseFee(match[0]) !== wanted) continue;
    const context = source.slice(Math.max(0, match.index - 240), Math.min(source.length, match.index + match[0].length + 240));
    if (NON_REGISTRATION_CONTEXT.test(context)) continue;
    if (!REGISTRATION_CONTEXT.test(context)) continue;
    return context.trim();
  }
  return null;
}

function hasSharedApplicationRangeContext(text, value, field) {
  const source = String(text || '');
  const pattern = new RegExp(`(${MONTH_NAME_TOKEN}\\s*,?\\s*\\d{1,2}(?:st|nd|rd|th|er)?)\\s*(?:-|–|—|to|until|du|au)\\s*(${MONTH_NAME_TOKEN}\\s*,?\\s*\\d{1,2}(?:st|nd|rd|th|er)?)[, ]+(20\\d{2})`, 'giu');
  let match;
  while ((match = pattern.exec(source)) !== null) {
    const opening = parseDate(match[1], match[3]);
    const closing = parseDate(match[2], match[3]);
    if ((field === 'opening' && opening !== value) || (field === 'closing' && closing !== value)) continue;
    const before = source.slice(Math.max(0, match.index - 220), match.index);
    const after = source.slice(match.index + match[0].length, Math.min(source.length, match.index + match[0].length + 120));
    const context = `${before} ${match[0]} ${after}`;
    const lowerBefore = before.toLowerCase();
    const lastApplicationLabel = Math.max(lowerBefore.lastIndexOf('online application'), lowerBefore.lastIndexOf('application'));
    const lastResultsLabel = Math.max(lowerBefore.lastIndexOf('results publishing'), lowerBefore.lastIndexOf('publication of results'), lowerBefore.lastIndexOf('result date'));
    const isResultsRange = lastResultsLabel > lastApplicationLabel;
    if (isResultsRange) continue;
    if (lastApplicationLabel >= 0) return true;
  }
  return false;
}

function makeSnippet(text, values) {
  const source = String(text || '').replace(/\s+/g, ' ').trim();
  const wanted = [
    ...(values?.openingDates || []),
    ...(values?.closingDates || []),
    ...(values?.fees || []),
    ...(values?.tuition || [])
  ].map(String).filter(Boolean);
  const hit = wanted.map(value => source.indexOf(value)).find(index => index >= 0);
  if (hit !== undefined) return source.slice(Math.max(0, hit - 180), Math.min(source.length, hit + 260)).trim();
  const needles = [...(values.openingDates || []), ...(values.closingDates || []), ...(values.fees || []), ...(values.tuition || [])].filter(Boolean);
  for (const needle of needles) {
    const directIndex = source.toLowerCase().indexOf(String(needle).toLowerCase());
    if (directIndex >= 0) return source.slice(Math.max(0, directIndex - 220), Math.min(source.length, directIndex + String(needle).length + 260)).trim();
    const expectedDate = parseDate(needle);
    if (expectedDate) {
      const sharedRangeDatePart = `(?:${MONTH_NAME_TOKEN}\\s*,?\\s*\\d{1,2}(?:st|nd|rd|th|er)?|\\d{1,2}\\s+${MONTH_NAME_TOKEN})`;
  const sharedRangePattern = new RegExp(`(${sharedRangeDatePart})\\s*(?:-|–|—|to|until|du|au|al|dal)\\s*(${sharedRangeDatePart})[, ]+(20\\d{2})`, 'giu');
      let sharedRange;
      while ((sharedRange = sharedRangePattern.exec(source)) !== null) {
        if (parseDate(sharedRange[1], sharedRange[3]) === expectedDate || parseDate(sharedRange[2], sharedRange[3]) === expectedDate) {
          return source.slice(Math.max(0, sharedRange.index - 220), Math.min(source.length, sharedRange.index + sharedRange[0].length + 260)).trim();
        }
      }
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
  const normalise = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const programTokens = normalise(programName).split(/[^a-z0-9]+/i).filter(token => token.length > 3);
  const universityTokens = normalise(universityName).split(/[^a-z0-9]+/i).filter(token => token.length > 3);
  const lower = normalise(text);
  const programScore = programTokens.length ? programTokens.filter(token => lower.includes(token)).length / programTokens.length : 0;
  const universityScore = universityTokens.length ? universityTokens.filter(token => lower.includes(token)).length / universityTokens.length : 0;
  return programScore + (universityScore * 0.25) + (ADMISSION_LINK_WORDS.test(text) ? 0.4 : 0);
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

function targetAcademicCycleBounds() {
  const match = TARGET_ACADEMIC_YEAR.match(/(20\d{2})\s*[\/-]\s*(\d{2,4})/);
  if (!match) return null;
  const startYear = Number(match[1]);
  const endYear = match[2].length === 2 ? Number(`20${match[2]}`) : Number(match[2]);
  return {
    // Admission rounds for an academic year may open during the preceding autumn.
    // For 2026/27 this includes official windows beginning in September-December 2025.
    start: `${startYear - 1}-09-01`,
    end: `${endYear}-12-31`
  };
}

function isInTargetAcademicCycle(value) {
  const bounds = targetAcademicCycleBounds();
  if (!bounds || !value) return false;
  return value >= bounds.start && value <= bounds.end;
}

function chooseDates(openingCandidates, closingCandidates) {
  // Never select dates from another academic cycle, even if the page contains
  // a tempting deadline such as 2011, 2025 or 2031.
  const openings = unique(openingCandidates).filter(value => isInTargetAcademicCycle(value)).sort();
  const closings = unique(closingCandidates).filter(value => isInTargetAcademicCycle(value)).sort();
  for (const opening of openings) {
    for (const closing of closings) {
      if (opening <= closing) return { openingDate: opening, closingDate: closing };
    }
  }
  if (openings.length && !closings.length) return { openingDate: openings[0], closingDate: null };
  if (closings.length && !openings.length) return { openingDate: null, closingDate: closings[0] };
  return { openingDate: null, closingDate: null };
}

// Pair each admission opening with the closing date belonging to its
// chronological window. When another opening follows, use the latest unused
// closing before that next opening. For the final window, use the latest
// remaining closing: official pages such as Messina may also publish an
// external Universitaly deadline earlier than the actual final Call closing.
function pairAdmissionWindows(openingCandidates, closingCandidates, rangeCandidates = []) {
  const directRanges = (Array.isArray(rangeCandidates) ? rangeCandidates : [])
    .filter(range => range?.openingDate && range?.closingDate)
    .filter(range => isInTargetAcademicCycle(range.openingDate) && isInTargetAcademicCycle(range.closingDate))
    .sort((a, b) => Number(a.sourceIndex || 0) - Number(b.sourceIndex || 0));
  if (directRanges.length) {
    return directRanges.filter((range, index, list) => list.findIndex(item => item.openingDate === range.openingDate && item.closingDate === range.closingDate) === index)
      .map(range => ({ openingDate: range.openingDate, closingDate: range.closingDate, label: range.group ? `${range.label} (${range.group})` : range.label }));
  }
  const openings = unique(openingCandidates).filter(value => isInTargetAcademicCycle(value)).sort();
  const closings = unique(closingCandidates).filter(value => isInTargetAcademicCycle(value)).sort();
  const usedClosingIndexes = new Set();
  const pairs = [];
  for (let openingIndex = 0; openingIndex < openings.length; openingIndex += 1) {
    const openingDate = openings[openingIndex];
    const nextOpening = openings[openingIndex + 1] || null;
    const eligible = closings
      .map((closingDate, index) => ({ closingDate, index }))
      .filter(({ closingDate, index }) => !usedClosingIndexes.has(index) && closingDate > openingDate);
    // Calls can overlap: a later call may open before the previous call closes.
    // For non-final calls the earliest unused closing is the safest chronological
    // match; for the final call, prefer the latest closing to avoid selecting an
    // external portal deadline published before the official final-call close.
    let selected = nextOpening ? eligible[0] : eligible[eligible.length - 1];
    if (!selected) continue;
    usedClosingIndexes.add(selected.index);
    pairs.push({ openingDate, closingDate: selected.closingDate, label: '' });
  }
  return pairs;
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
    const expectedFees = new Set([...(values.fees || []), ...(values.tuition || [])].map(normaliseFee).filter(Boolean));
    for (const page of pages) {
      const pageNumber = Number(page[1]);
      const pageText = page[2] || '';
      const extracted = extractValues(pageText);
      if (extracted.openingDates.some(value => expectedDates.has(value)) || extracted.closingDates.some(value => expectedDates.has(value)) || extracted.fees.some(value => expectedFees.has(normaliseFee(value))) || extracted.tuition.some(value => expectedFees.has(normaliseFee(value)))) return pageNumber;
      if (makeSnippet(pageText, values) !== pageText.slice(0, 480).trim()) return pageNumber;
    }
  }
  const needles = [...(values.openingDates || []), ...(values.closingDates || []), ...(values.fees || []), ...(values.tuition || [])].filter(Boolean);
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
    fees: field === 'fee' ? [value] : [],
    tuition: field === 'tuition' ? [value] : []
  };
  const source = String(document.text || '');
  const matchedText = field === 'fee' ? makeFeeSnippet(source, value) : makeSnippet(source, values);
  const pageNumber = document.isPdf ? findPdfPage(source, values) : null;
  const officialAdmissionContext = Boolean(
    document.isSeedAdmissionPage
      || document.isProgramPage
      || ADMISSION_WINDOW_WORDS.test(source)
      || ADMISSION_DOCUMENT_TERMS.test(source)
      || EXPLICIT_OPENING_PHRASE.test(source)
      || EXPLICIT_CLOSING_PHRASE.test(source)
  );
  const directOfficialWindowText = Boolean(
    matchedText
      && (document.isSeedAdmissionPage || document.isProgramPage)
      && (ADMISSION_WINDOW_WORDS.test(matchedText) || /\bcall\b|\bround\b|\bdegree\s+programmes?\b|\bplaces?\b/i.test(matchedText))
  );
  const hasValue = field === 'fee'
    ? Boolean(matchedText && /(?:€|EUR|euro)/i.test(matchedText) && REGISTRATION_CONTEXT.test(matchedText) && !NON_REGISTRATION_CONTEXT.test(matchedText))
    : field === 'tuition'
      ? Boolean(matchedText && /(?:€|EUR|euro)/i.test(matchedText) && TUITION_CONTEXT.test(matchedText) && !NON_REGISTRATION_CONTEXT.test(matchedText))
      : field === 'closing'
        ? Boolean(matchedText && parseDate(value) && officialAdmissionContext && (dateHasClosingContext(source, value) || hasSharedApplicationRangeContext(source, value, 'closing') || document.isSeedAdmissionPage || document.isProgramPage) && (!NON_ADMISSION_DATE_WORDS.test(matchedText) || directOfficialWindowText))
        : Boolean(matchedText && parseDate(value) && officialAdmissionContext && (dateHasOpeningContext(source, value) || hasSharedApplicationRangeContext(source, value, 'opening') || document.isSeedAdmissionPage || document.isProgramPage) && (!NON_ADMISSION_DATE_WORDS.test(matchedText) || directOfficialWindowText));
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
  const tuitionEvidence = values.tuition.map(value => buildValueEvidence(document, 'tuition', value, programName, universityName));
  const all = [...openingEvidence, ...closingEvidence, ...feeEvidence, ...tuitionEvidence];
  return {
    url: document.url,
    isPdf: Boolean(document.isPdf),
    isProgramPage: Boolean(document.isProgramPage),
    openingDates: values.openingDates,
    closingDates: values.closingDates,
    admissionRanges: values.admissionRanges || [],
    fees: values.fees,
    tuition: values.tuition,
    openingText: openingEvidence[0]?.matchedText || null,
    closingText: closingEvidence[0]?.matchedText || null,
    feeText: feeEvidence[0]?.matchedText || null,
    tuitionText: tuitionEvidence[0]?.matchedText || null,
    openingEvidence,
    closingEvidence,
    feeEvidence,
    tuitionEvidence,
    matchedText: all.find(item => item.matchedText)?.matchedText || null,
    pageNumber: document.isPdf ? findPdfPage(document.text, values) : null,
    confidence: Math.max(...all.map(item => item.confidence), 0)
  };
}

async function enrichProgram({ programName, universityName, source, programUrl }) {
  const domains = [...new Set(source?.domains || [])];
  const programHost = hostOf(programUrl);
  const directOnly = source?.sourceMap === 'direct' || process.env.ADMISSIONS_DIRECT_ONLY === 'true';
  const dynamicDomains = new Set(domains);
  // Direct mappings are authoritative: never inspect sitemap, site-wide links,
  // or discovered alternatives. Only the URLs explicitly registered in the map
  // are eligible for extraction.
  const sitemapUrls = directOnly ? [] : await discoverSitemapUrls(domains);

  // On conserve les domaines et les facultés déjà fournis. Le sourceUrl du programme
  // est seulement placé en priorité afin de rechercher les dates dans la bonne faculté.
  // إذا عند البرنامج sourceUrl رسمي، نبدأ منه وحده حتى لا نبحث في
  // مسارات عامة غير موجودة مثل /admissions أو /fees على نفس الدومين.
  // تبقى طريقة جلب البرامج والـfacultés حسب domaine كما هي في الـworker.
  // Le domaine sert seulement à identifier le site officiel. Le crawl réel
  // Manual direct mode: only explicitly mapped admission/fee URLs are data
  // sources. programUrl is retained for programme identity and UI display,
  // but is never fetched for dates or fees.
  const mappedDataUrls = [...new Set([
    ...(source?.admissionsUrls || []),
    ...(source?.feesUrls || [])
  ].filter(Boolean))];
  const normaliseUrl = value => String(value || '').trim().replace(/\/$/, '');
  const mappedUrlSet = new Set(mappedDataUrls.map(normaliseUrl));
  const isExplicitMappedUrl = url => mappedUrlSet.has(normaliseUrl(url));
  const seedUrls = [...new Set((directOnly ? mappedDataUrls : [programUrl, ...mappedDataUrls])
    .filter(Boolean)
    .filter(url => directOnly
      ? isExplicitMappedUrl(url)
      : isOfficialCandidate(url, [...dynamicDomains], false))
    .filter(url => directOnly || !programHost || sameHost(url, programUrl)))] ;

  const debug = {
    enabled: process.env.ADMISSIONS_DEBUG !== 'false',
    program: programName,
    university: universityName,
    input: { programUrl: programUrl || null, domains: [...domains], admissionsUrls: source?.admissionsUrls || [], directOnly },
    seedUrls,
    pagesVisited: [],
    pdfsDiscovered: [],
    documents: [],
    rejected: [],
    candidates: { opening: [], closing: [], fee: [] },
    selected: null,
    errors: [],
    playwright: [],
    ocr: [],
    llm: []
  };

  const queue = seedUrls
    .filter(url => directOnly
      ? isExplicitMappedUrl(url)
      : isOfficialCandidate(url, [...dynamicDomains], true))
    .filter(url => directOnly || !programHost || sameHost(url, programUrl))
    .filter(url => !directOnly || !isPdf(url))
    .map((url, index) => ({ url, priority: index === 0 ? 1000 : linkPriority('', url, programUrl) }))
    .sort((a, b) => b.priority - a.priority);

  const visited = new Set();
  const pages = [];
  const pdfUrls = new Map();
  if (directOnly) {
    for (const seedUrl of seedUrls) {
      if (isPdf(seedUrl)) pdfUrls.set(seedUrl, 1000);
    }
  }

  while (queue.length && pages.length < MAX_HTML_PAGES) {
    queue.sort((a, b) => b.priority - a.priority);
    const item = queue.shift();
    const url = item?.url;
    if (!url || visited.has(url)) continue;
    if (NON_HTML_DOWNLOAD_URL.test(url) && !isPdf(url)) {
      debug.rejected.push({ url, type: 'download', reason: 'unsupported-download-format' });
      continue;
    }
    visited.add(url);
    debug.pagesVisited.push({ url, priority: item.priority });

    try {
      let html;
      try {
        html = await fetchHtml(url);
      } catch (fetchError) {
        const canUseBrowserFallback = directOnly && isExplicitMappedUrl(url)
          && process.env.ADMISSIONS_PLAYWRIGHT_ENABLED !== 'false';
        if (!canUseBrowserFallback || !/HTTP\s+403|Forbidden/i.test(String(fetchError.message || fetchError))) throw fetchError;
        const rendered403 = await renderDynamicPage(url);
        if (!rendered403?.text) throw fetchError;
        html = rendered403.text;
        debug.playwright = debug.playwright || [];
        debug.playwright.push({ url, used: true, reason: 'http-403-fallback', textLength: rendered403.text.length, links: rendered403.links?.length || 0 });
      }
      if (typeof html !== 'string') continue;
      let $ = cheerio.load(html);
            let text = normaliseText(html);
      if (/errore\.html\?code=404|(?:pagina|page)\s+(?:non\s+)?trovata|404\s*[-:]?\s*not\s+found/i.test(`${url} ${text}`)) {
        debug.rejected.push({ url, type: 'html', reason: '404-page' });
        continue;
      }
      const isSeedAdmissionPage = (source?.admissionsUrls || []).some(seed => String(seed).replace(/\/$/, '') === String(url).replace(/\/$/, ''));
      // Do not replace a complete official HTML page with a shorter browser-rendered
      // snapshot merely because it is an admissions page. Several Italian university
      // pages expose the full schedule in server-rendered HTML while the browser
      // snapshot omits sections, which caused valid dates and fees to disappear.
      const needsBrowser = text.length < Number(process.env.ADMISSIONS_PLAYWRIGHT_MIN_TEXT || 500)
        || $('a[href]').length === 0
        || /enable javascript|javascript required|loading\.\.\.|please wait/i.test(text)
        || (isSeedAdmissionPage && isCourseAdmissionsPage(url) && text.length < 3000);
      if (needsBrowser) {
        const rendered = await renderDynamicPage(url).catch(error => {
          debug.errors.push({ stage: 'playwright', url, error: error.message });
          return null;
        });
        if (rendered?.text) {
          text = rendered.text;
          $ = cheerio.load(`<body>${rendered.text}</body>`);
          for (const link of rendered.links || []) {
            if (link.href) $('body').append(`<a href="${String(link.href).replace(/"/g, '&quot;')}">${String(link.label || '')}</a>`);
          }
          debug.playwright = debug.playwright || [];
          debug.playwright.push({ url, used: true, textLength: text.length, links: rendered.links?.length || 0 });
        }
      }
      const sourceScore = scoreText(text, programName, universityName);
      debug.documents.push({ url, type: 'html', textLength: text.length, score: sourceScore, isProgramPage: url === programUrl });

      console.log('[Admissions DEBUG]', {
        program: programName,
        url,
        textLength: text.length,
        hasAdmissionWord: ADMISSION_LINK_WORDS.test(text),
        links: $('a[href]').length
      });

      const score = sourceScore + (url === programUrl ? 0.35 : 0);
      pages.push({
        url,
        text,
        score: score + (url === programUrl ? 3 : 0),
        isProgramPage: url === programUrl,
        isSeedAdmissionPage
      });

      $('a[href]').each((_, node) => {
const href = absoluteUrl($(node).attr('href'), url);
        if (!href || !isHttp(href) || NON_OFFICIAL_HOSTS.test(href) || ASSET_EXTENSIONS.test(href)) return;
        const hrefLower = href.toLowerCase();
        const isGenericSearchUrl = /(?:\/cerca(?:\.html)?|\/search)(?:[/?#]|$)|[?&](?:query|searchaction|parsedQuery|ruolotype|searchMacro)=/i.test(hrefLower);
        const isIrrelevantBando = /bando[-_]?bip|graduatoria[-_]?finale|elezion[ei]/i.test(hrefLower);
        if (isGenericSearchUrl || isIrrelevantBando) return;
        const pageIsUniversitaly = isUniversitalyHost(url);
        const discoveredOfficialHost = pageIsUniversitaly && isLikelyOfficialAcademicHost(href);
        if (pageIsUniversitaly && discoveredOfficialHost) {
          dynamicDomains.add(hostOf(href));
        }
        if (isUniversitalyHost(href)) return;
        const sameUniversityFamily = programUrl && sameOfficialUniversityFamily(href, programUrl);
        const officialAcademicLink = isLikelyOfficialAcademicHost(href) && sameUniversityFamily;
        if (!isOfficialCandidate(href, [...dynamicDomains], false) && !officialAcademicLink && !discoveredOfficialHost) return;
        // In direct-only mode, links found inside an official page are evidence data,
        // not navigation instructions. The mapping is the complete allow-list.
        if (directOnly) return;
        const label = `${$(node).text()} ${$(node).attr('title') || ''} ${$(node).attr('aria-label') || ''} ${href}`;
        const isFeeLink = FEE_PAGE_LINK_WORDS.test(`${label} ${href}`);
        const isProgramLink = isProgramRelatedLink(label, href, programName, programUrl);
        // The user requirement is full discovery: every same-site HTML link
        // is eligible for crawling, regardless of whether its label says
        // "studenti", "servizi" or something else. Programme identity is
        // checked later before any value can become evidence.
        const priority = linkPriority(label, href, programUrl)
          + (isProgramLink ? 2 : 0)
          + (isFeeLink ? 1 : 0);
        const exactHost = !programHost || sameHost(href, programUrl);
        const parentHost = programHost && hostOf(href) && (
          hostOf(programUrl).endsWith(`.${hostOf(href)}`) || hostOf(href).endsWith(`.${hostOf(programUrl)}`)
        );
        // نسمح بالدومين الرئيسي فقط إذا كان الرابط نفسه admission/fee أو PDF.
        // هكذا يمكن الوصول إلى bando الموجود على unibo.it من corsi.unibo.it
        // دون فتح صفحات الإقامة والضرائب والإدارة العامة.
        if (programHost && !exactHost && !(parentHost && (ADMISSION_LINK_WORDS.test(label) || FEE_PAGE_LINK_WORDS.test(`${label} ${href}`) || isPdf(href)))) return;
        const excludedGeneric = NON_ADMISSION_URL_WORDS.test(href) && !isPdf(href);
        if (excludedGeneric) return;

        // Les liens de la faculté restent prioritaires, mais tous les liens
        // internes HTML valides sont conservés dans la queue pour inspection.
        if (isDocumentLikeLink(href, label)) {
          const current = pdfUrls.get(href) || 0;
          pdfUrls.set(href, Math.max(current, priority));
          debug.pdfsDiscovered.push({ url: href, priority, label: label.slice(0, 180), documentLike: true });
        } else if (!visited.has(href) && !isGenericSearchUrl && !isIrrelevantBando) {
          const existing = queue.find(entry => entry.url === href);
          if (existing) existing.priority = Math.max(existing.priority, priority);
          else queue.push({ url: href, priority });
        }
      });
    } catch (error) {
      debug.errors.push({ stage: 'html', url, error: error.message });
      console.warn(`[Admissions] Page skipped: ${url} - ${error.message}`);
    }
  }

  const documents = [...pages];

  // sourceUrl peut être directement un PDF officiel.
  if (programUrl && isPdf(programUrl)) pdfUrls.set(programUrl, 1000);

  const pdfQueue = [...pdfUrls.entries()].sort((a, b) => b[1] - a[1]);
  const processedPdfs = new Set();
  let pdfIndex = 0;
  while (pdfIndex < pdfQueue.length && processedPdfs.size < MAX_PDFS) {
    const [pdfUrl, priority] = pdfQueue[pdfIndex++];
    if (!pdfUrl || processedPdfs.has(pdfUrl)) continue;
    processedPdfs.add(pdfUrl);
    try {
      const result = await fetchPdfText(pdfUrl);
      const text = result?.text || '';
      if (text)       documents.push({
        url: pdfUrl,
        text,
        score: scoreText(text, programName, universityName) + (pdfUrl === programUrl ? 3.2 : 0) + 0.2 + (priority / 1000),
        isPdf: true,
        isProgramPage: pdfUrl === programUrl,
        isSeedAdmissionPage: (source?.admissionsUrls || []).some(sourceUrl => String(sourceUrl).replace(/\/$/, '') === String(pdfUrl).replace(/\/$/, ''))
      });
      const pdfLinks = directOnly ? [] : (result?.links || []);
      for (const linkedUrl of pdfLinks) {
        if (!isOfficialCandidate(linkedUrl, [...dynamicDomains], false)
          && !sameOfficialUniversityFamily(linkedUrl, programUrl)
          && !isLikelyOfficialAcademicHost(linkedUrl)) continue;
        const linkedPriority = linkPriority('', linkedUrl, programUrl) + 15;
        if (isPdf(linkedUrl)) {
          if (!pdfUrls.has(linkedUrl)) {
            pdfUrls.set(linkedUrl, linkedPriority);
            pdfQueue.push([linkedUrl, linkedPriority]);
          }
          debug.pdfsDiscovered.push({ url: linkedUrl, priority: linkedPriority, discoveredFromPdf: pdfUrl });
        } else if (!visited.has(linkedUrl) && !queue.some(item => item.url === linkedUrl)) {
          // Les liens HTML trouvés dans un PDF sont remis dans la queue officielle.
          // Ils seront visités si la limite HTML n'est pas atteinte; on les visite
          // également immédiatement lorsque la première passe HTML est terminée.
          queue.push({ url: linkedUrl, priority: linkedPriority });
          debug.pdfsDiscovered.push({ url: linkedUrl, priority: linkedPriority, discoveredFromPdf: pdfUrl, type: 'html' });
        }
      }
    } catch (error) {
      debug.errors.push({ stage: 'pdf', url: pdfUrl, error: error.message });
      console.warn(`[Admissions] PDF skipped: ${pdfUrl} - ${error.message}`);
    }
  }

  documents.sort((a, b) => b.score - a.score);
  const openingCandidates = [];
  const closingCandidates = [];
  const feeCandidates = [];
  const tuitionCandidates = [];
  const additionalEnrollmentFeeCandidates = [];
  const additionalEnrollmentFeeEvidence = [];
  const evidence = [];

  const isFeeDocument = document => {
    const url = String(document?.url || '');
    const text = String(document?.text || '');
    return FEE_PAGE_LINK_WORDS.test(`${url} ${text}`) || TUITION_CONTEXT.test(text);
  };
  // In direct mode, each mapped URL has a declared responsibility. A date
  // source may provide opening/closing values; a fee source may provide the
  // application fee. The same URL is allowed in both sets.
  const directAdmissionUrls = new Set((source?.admissionsUrls || []).map(url => String(url).replace(/\/$/, '')));
  const directFeeUrls = new Set((source?.feesUrls || []).map(url => String(url).replace(/\/$/, '')));
  const isDirectAdmissionSource = document => !directOnly || !directAdmissionUrls.size || directAdmissionUrls.has(String(document?.url || '').replace(/\/$/, ''));
  const isDirectFeeSource = document => !directOnly || !directFeeUrls.size || directFeeUrls.has(String(document?.url || '').replace(/\/$/, ''));

  for (const document of documents) {
    // A fees/student/payment page can provide tuition, but it cannot provide
    // programme opening or closing dates unless it is also an admission page.
    const admissionDocument = isAdmissionDocument(document);
    const feeDocument = isFeeDocument(document);
    if (!admissionDocument && !feeDocument) {
      debug.rejected.push({ url: document.url, type: document.isPdf ? 'pdf' : 'html', reason: 'non-admission-url-or-document', textSample: String(document.text || '').slice(0, 240) });
      continue;
    }
    if (!hasTargetAcademicYear(document.text, document)) {
      debug.rejected.push({ url: document.url, type: document.isPdf ? 'pdf' : 'html', reason: 'academic-year-mismatch', textSample: String(document.text || '').slice(0, 300) });
      continue;
    }
    if (!documentMatchesProgram(document, programName, universityName, programUrl)) {
      debug.rejected.push({
        url: document.url,
        type: document.isPdf ? 'pdf' : 'html',
        reason: 'program-identity-mismatch',
        textSample: String(document.text || '').slice(0, 300)
      });
      continue;
    }

    const values = extractValues(document.text);
    if (!admissionDocument || !isDirectAdmissionSource(document)) {
      values.openingDates = [];
      values.closingDates = [];
    }
    if (!isFeeDocument && !isDirectFeeSource(document)) {
      values.fees = [];
    }
    if (!isDirectFeeSource(document)) {
      values.fees = [];
    }
    if (process.env.ADMISSIONS_LLM_ENABLED === 'true' && (!values.openingDates.length || !values.closingDates.length || !values.fees.length || !values.tuition.length)) {
      const aiCandidates = await extractWithLlm({
        programName,
        universityName,
        source: { url: document.url, isPdf: document.isPdf, pageNumber: null },
        text: document.text
      }).catch(error => {
        debug.errors.push({ stage: 'llm', url: document.url, error: error.message });
        return [];
      });
      debug.llm.push({ url: document.url, candidates: aiCandidates });
      // LLM is suggestion-only: its output is logged for review but can never
      // create a verified value without an exact parser-backed official snippet.
      debug.rejected.push({ url: document.url, type: document.isPdf ? 'pdf' : 'html', reason: 'llm-suggestion-not-persisted', suggestions: aiCandidates });
    }
    const record = {
      url: document.url,
      type: document.isPdf ? 'pdf' : 'html',
      score: document.score,
      opening: values.openingDates,
      closing: values.closingDates,
      fees: values.fees,
      additionalEnrollmentFees: values.additionalEnrollmentFees,
      tuition: values.tuition
    };
    debug.documents.push(record);
    openingCandidates.push(...values.openingDates);
    closingCandidates.push(...values.closingDates);
    feeCandidates.push(...values.fees);
    additionalEnrollmentFeeCandidates.push(...(values.additionalEnrollmentFees || []));
    additionalEnrollmentFeeEvidence.push(...(values.additionalEnrollmentFees || []).map(value => ({ ...value, sourceUrl: document.url, sourceIsPdf: Boolean(document.isPdf), pageNumber: document.pageNumber || null, confidence: 1 })));
    tuitionCandidates.push(...values.tuition);
    debug.candidates.opening.push(...values.openingDates.map(value => ({ value, url: document.url, acceptedContext: true })));
    debug.candidates.closing.push(...values.closingDates.map(value => ({ value, url: document.url, acceptedContext: true })));
        debug.candidates.fee.push(...values.fees.map(value => ({ value, url: document.url, acceptedContext: true })));
    if (!debug.candidates.additionalEnrollmentFee) debug.candidates.additionalEnrollmentFee = [];
    debug.candidates.additionalEnrollmentFee.push(...(values.additionalEnrollmentFees || []).map(value => ({ value: value.amount, url: document.url, matchedText: value.matchedText, acceptedContext: true })));
    if (!debug.candidates.tuition) debug.candidates.tuition = [];
    debug.candidates.tuition.push(...values.tuition.map(value => ({ value, url: document.url, acceptedContext: true })));
    if (values.openingDates.length || values.closingDates.length || values.fees.length || values.tuition.length) {
      evidence.push(buildEvidence(document, values, programName, universityName));
    } else {
      debug.rejected.push({ url: document.url, type: document.isPdf ? 'pdf' : 'html', reason: 'no-strict-admission-values', admissionDocument, isSeedAdmissionPage: Boolean(document.isSeedAdmissionPage), isProgramPage: Boolean(document.isProgramPage), extracted: { opening: values.openingDates, closing: values.closingDates, fees: values.fees, tuition: values.tuition } });
    }
  }

const currentOpening = value => isInTargetAcademicCycle(value);
  const currentClosing = value => isInTargetAcademicCycle(value);
  // Chaque champ est vérifié indépendamment: l’ouverture et la fermeture
  // peuvent provenir de pages ou de PDF différents, à condition que chaque
  // preuve soit officielle, liée au même programme et issue d’un contexte
  // explicite de candidature/inscription.
  // لا يشترط أن يكون opening وclosing في نفس الجملة أو نفس الوثيقة.
  // إذا كان في نفس الدليل أكثر من مرشح لنفس الحقل، لا نختار أول تاريخ عشوائياً.
  // بعد الاختيار، نتحقق فقط من أن opening لا يأتي بعد closing.
  const hasVerifiedDate = (item, field, predicate) => {
    const dates = field === 'opening' ? item.openingDates : item.closingDates;
    const proofs = field === 'opening' ? item.openingEvidence : item.closingEvidence;
    return dates.some(value => predicate(value) && proofs?.some(proof => String(proof.value) === String(value) && proof.matchedText));
  };
  const firstWithOpening = evidence.find(item => hasVerifiedDate(item, 'opening', currentOpening)) || null;
  const firstWithClosing = evidence.find(item => hasVerifiedDate(item, 'closing', currentClosing)) || null;
  // A document may contain both the application fee and a separate entrance-test
  // fee. Select the individual proof, not the whole document, and never store a
  // CEnT-S/exam/test amount as applicationFee.
  const TEST_FEE_CONTEXT = /CEnT[-\s]?S|entrance\s+(?:exam|test)|admission\s+test|test\s+fee|exam\s+fee|fee\s+for\s+(?:the\s+)?test|prova\s+(?:di\s+)?ammissione|contributo\s+(?:per\s+la\s+)?prova/i;
  const isTestFeeProof = proof => {
    const text = String(proof?.matchedText || '');
    if (!text) return true;
    const rawValue = String(proof?.value || '').trim();
    const numericValue = rawValue.replace(/[^0-9.,]/g, '').replace(',', '.');
    const amountPattern = numericValue
      ? new RegExp(`(?:€\\s*${numericValue}|${numericValue}\\s*(?:€|EUR|euro))`, 'i')
      : null;
    const match = amountPattern ? amountPattern.exec(text) : null;
    // Inspect only the context near this particular amount. A page may contain
    // €60 application fee and €55 CEnT-S fee in the same paragraph.
    const context = match
      ? text.slice(Math.max(0, match.index - 180), Math.min(text.length, match.index + match[0].length + 180))
      : text;
    // A nearby exam date must not invalidate an explicitly labelled
    // application/competition fee in the same official paragraph.
    const EXPLICIT_APPLICATION_FEE_CONTEXT = /contributo\s+(?:per\s+)?l['’]ammissione(?:\s+al\s+concorso)?|application\s+fee|fee\s+for\s+(?:the\s+)?application/i;
    if (EXPLICIT_APPLICATION_FEE_CONTEXT.test(context)) return false;
    return TEST_FEE_CONTEXT.test(context);
  };
  const verifiedApplicationFees = new Set(
    (Array.isArray(source?.verifiedFees) ? source.verifiedFees : [])
      .filter(fee => String(fee?.label || '').toLowerCase().includes('application'))
      .map(fee => normaliseFee(fee?.amount))
      .filter(Boolean)
  );
  const feeProofCandidates = evidence.flatMap(item => (item.feeEvidence || [])
    .filter(proof => proof?.matchedText)
    .filter(proof => !verifiedApplicationFees.size || verifiedApplicationFees.has(normaliseFee(proof.value)))
    .filter(proof => /(?:€|EUR|euro)/i.test(proof.matchedText))
    .filter(proof => !NON_REGISTRATION_CONTEXT.test(proof.matchedText))
    .filter(proof => !isTestFeeProof(proof))
    .map(proof => ({ item, proof })));
  const applicationFeeLabel = /application\s+fee|application\s+cost|fee\s+for\s+(?:the\s+)?application|admission\s+fee|contributo\s+(?:per\s+)?l['’]ammissione|iscrizione\s+fee/i;
  const tuitionOnlyLabel = /tuition\s+fee|annual\s+tuition|per\s+year|family\s+income|tasse\s+universitarie|quota\s+annuale/i;
  const feeProofRank = ({ proof }) => {
    const text = String(proof?.matchedText || '');
    return (applicationFeeLabel.test(text) ? 100 : 0)
      - (tuitionOnlyLabel.test(text) && !applicationFeeLabel.test(text) ? 100 : 0)
      + (Number(proof?.confidence) || 0);
  };
  feeProofCandidates.sort((left, right) => feeProofRank(right) - feeProofRank(left));
  const firstFeeProof = feeProofCandidates[0] || null;
  const firstWithFee = firstFeeProof?.item || null;
  // Manual source maps may contain verified windows. They are an allow-list for
  // selecting among several official rounds, never a replacement for evidence:
  // every selected value must still have an exact official snippet above.
  const toIsoDate = value => {
    const parsed = parseDate(value);
    if (!parsed) return null;
    if (typeof parsed === 'string') {
      const match = parsed.match(/^(\d{4}-\d{2}-\d{2})/);
      return match ? match[1] : null;
    }
    if (parsed instanceof Date && !Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
    return null;
  };
  const verifiedWindows = Array.isArray(source?.verifiedWindows)
    ? source.verifiedWindows
      .map(window => ({
        ...window,
        openingDate: toIsoDate(window?.openingDate),
        closingDate: toIsoDate(window?.closingDate)
      }))
      .filter(window => window.openingDate && window.closingDate)
    : [];
  const verifiedOpeningDates = new Set(verifiedWindows.map(window => window.openingDate));
  const verifiedClosingDates = new Set(verifiedWindows.map(window => window.closingDate));
  const dateSnippetFromDocument = (document, value) => {
    const raw = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!raw || !document?.text) return null;
    const [, year, month, day] = raw;
    const sourceText = /<[a-z][\s\S]*>/i.test(String(document.text))
      ? normaliseText(String(document.text))
      : String(document.text);
    const monthNumber = Number(month);
    const dayNumber = Number(day);
    const englishMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const italianMonths = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
    const frenchMonths = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    const monthNames = [englishMonths[monthNumber - 1], italianMonths[monthNumber - 1], frenchMonths[monthNumber - 1]]
      .filter(Boolean)
      .join('|');
    const variants = [
      `${year}[-/.]${month}[-/.]${day}`,
      `${day}[-/.]${month}[-/.]${year}`,
      `${String(dayNumber).padStart(2, '0')}[-/.]${String(monthNumber).padStart(2, '0')}[-/.]${year}`,
      `${day}\\s+(?:${monthNames})\\s+${year}`,
      `(?:${monthNames})\\s+${dayNumber}(?:st|nd|rd|th|er)?(?:,)?\\s+${year}`
    ];
    const pattern = new RegExp(variants.join('|'), 'i');
    const match = pattern.exec(sourceText);
    if (!match) return null;
    return sourceText.slice(Math.max(0, match.index - 180), Math.min(sourceText.length, match.index + match[0].length + 220)).trim();
  };

  const hasExactDateEvidence = (item, field, value) => {
    const proofs = field === 'opening' ? item.openingEvidence : item.closingEvidence;
    if (proofs?.some(proof => String(proof.value) === String(value) && proof.matchedText)) return true;
    const document = documents.find(candidate => String(candidate.url) === String(item.url));
    if (!document) return false;
    const snippet = dateSnippetFromDocument(document, value) || makeSnippet(document.text, {
      openingDates: field === 'opening' ? [value] : [],
      closingDates: field === 'closing' ? [value] : [],
      fees: [],
      tuition: []
    });
    if (snippet) return true;
    // Some official pages write the year once at the end of a range. Re-run
    // the generalized extractor on the exact document text so a verified
    // source-map window is not dropped merely because its date has no isolated
    // textual occurrence.
    const reparsed = extractValues(document.text);
    const parsedValues = field === 'opening' ? reparsed.openingDates : reparsed.closingDates;
    return parsedValues.includes(value);
  };
  const validOpenings = unique(evidence.flatMap(item => (item.openingDates || [])
    .filter(value => verifiedWindows.length ? verifiedOpeningDates.has(value) : currentOpening(value))
    .filter(value => hasExactDateEvidence(item, 'opening', value)))).sort();
  const validClosings = unique(evidence.flatMap(item => (item.closingDates || [])
    .filter(value => verifiedWindows.length ? verifiedClosingDates.has(value) : currentClosing(value))
    .filter(value => hasExactDateEvidence(item, 'closing', value)))).sort();
  // Pair dates chronologically. The previous implementation selected the first
  // opening and first closing independently; with three sessions this could
  // pair 1 October with 4 June and null both values.
  let selectedOpening = null;
  let selectedClosing = null;
  for (const opening of validOpenings) {
    // Prefer a closing date found in the same official document as the opening.
    // This prevents a PDF exam/decree date (for example 04/08) from replacing
    // the HTML admission range closing date (24/08).
    const sameDocumentClosings = unique(evidence
      .filter(item => Array.isArray(item.openingDates)
        && item.openingDates.some(value => String(value) === String(opening))
        && Array.isArray(item.closingDates))
      .sort((a, b) => Number(Boolean(a.isPdf)) - Number(Boolean(b.isPdf)))
      .flatMap(item => item.closingDates || []))
      .filter(value => value > opening);
    const closing = sameDocumentClosings[0] || validClosings.find(value => value > opening);
    if (closing) {
      selectedOpening = opening;
      selectedClosing = closing;
      break;
    }
  }
  // A direct official course page may expose only a closing deadline (for
  // example a fixed-quota call with an opening date defined by the portal).
  // Preserve that verified closing value instead of turning the whole result
  // into "À vérifier".
  if (!selectedOpening && !selectedClosing && validClosings.length) {
    selectedClosing = validClosings[0];
  }
  if (!selectedOpening && !selectedClosing && validOpenings.length) {
    selectedOpening = validOpenings[0];
  }
  const candidateFor = (field, value) => {
    if (!value) return null;
    const list = [...evidence].sort((a, b) => Number(Boolean(a.isPdf)) - Number(Boolean(b.isPdf)));
    for (const item of list) {
      const proofs = field === 'opening' ? item.openingEvidence : item.closingEvidence;
      const proof = (proofs || []).find(candidate => String(candidate.value) === String(value) && candidate.matchedText);
      if (proof) return { item, proof };
      const document = documents.find(candidate => String(candidate.url) === String(item.url));
      let snippet = document ? (dateSnippetFromDocument(document, value) || makeSnippet(document.text, {
        openingDates: field === 'opening' ? [value] : [],
        closingDates: field === 'closing' ? [value] : [],
        fees: [],
        tuition: []
      })) : null;
      if (!snippet && document) {
        const reparsed = extractValues(document.text);
        const parsedValues = field === 'opening' ? reparsed.openingDates : reparsed.closingDates;
        if (parsedValues.includes(value)) snippet = String(document.text).slice(0, 520).trim();
      }
      if (snippet) {
        return { item, proof: { field, value: String(value), url: item.url, matchedText: snippet, pageNumber: null, isPdf: Boolean(document?.isPdf), confidence: 1 } };
      }
    }
    return null;
  };

  const verifiedRangePairs = evidence
    .flatMap(item => item.admissionRanges || [])
    .filter(range => currentOpening(range.openingDate) && currentClosing(range.closingDate)
      && validOpenings.includes(range.openingDate) && validClosings.includes(range.closingDate));
  const windowPairs = pairAdmissionWindows(validOpenings, validClosings, verifiedRangePairs);
  const dates = { openingDate: selectedOpening, closingDate: selectedClosing };
  const fee = firstFeeProof?.proof?.value || null;
  const firstAdditionalEnrollmentFee = additionalEnrollmentFeeEvidence[0] || null;
  const additionalEnrollmentFee = firstAdditionalEnrollmentFee?.amount || null;
  const additionalEnrollmentFeeEvidenceValue = firstAdditionalEnrollmentFee
    ? {
        field: 'additionalEnrollmentFee',
        value: additionalEnrollmentFee,
        currency: firstAdditionalEnrollmentFee.currency || 'EUR',
        sourceUrl: firstAdditionalEnrollmentFee.sourceUrl,
        matchedText: firstAdditionalEnrollmentFee.matchedText,
        pageNumber: firstAdditionalEnrollmentFee.pageNumber,
        sourceIsPdf: firstAdditionalEnrollmentFee.sourceIsPdf,
        confidence: firstAdditionalEnrollmentFee.confidence
      }
    : null;

  const makeWindowEvidence = (field, candidate, value) => {
    const proof = candidate?.proof;
    if (!proof || !value || !proof.matchedText) return null;
    return {
      field,
      value,
      sourceUrl: proof.url || candidate.item?.url || null,
      matchedText: proof.matchedText,
      pageNumber: proof.pageNumber || null,
      sourceIsPdf: Boolean(proof.isPdf),
      confidence: Number(proof.confidence) || Number(candidate.item?.confidence) || 0
    };
  };

  // Keep every verified round. The legacy selected pair remains populated for
  // backwards compatibility, while this list is authoritative for the UI.
  const admissionWindows = (verifiedWindows.length ? verifiedWindows : windowPairs)
    .map((pair, index) => {
      const opening = candidateFor('opening', pair.openingDate);
      const closing = candidateFor('closing', pair.closingDate);
      if (!opening || !closing) return null;
      const label = String(pair.label || '').trim() || `Call ${index + 1}`;
            const callNumberWords = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
      const callMatch = label.match(/(?:call|round|session|intake|appell?)\s*(?:one|two|three|four|five|six|1|2|3|4|5|6)/i);
      const ordinalMatch = label.match(/\b(one|two|three|four|five|six|1|2|3|4|5|6)(?:st|nd|rd|th)?\b/i);
      const callNumber = callMatch
        ? Number(callMatch[0].match(/\d+/)?.[0]) || callNumberWords[String(callMatch[0].match(/one|two|three|four|five|six/i)?.[0] || '').toLowerCase()] || null
        : ordinalMatch
          ? Number(ordinalMatch[1]) || callNumberWords[String(ordinalMatch[1]).toLowerCase()] || null
          : null;

      const placesType = /unlimited/i.test(label) ? 'Unlimited' : /limited/i.test(label) ? 'Limited' : null;
      const openingEvidence = makeWindowEvidence('opening', opening, pair.openingDate);
      const closingEvidence = makeWindowEvidence('closing', closing, pair.closingDate);
      if (!openingEvidence || !closingEvidence) return null;
      const confidence = Math.max(Number(openingEvidence.confidence) || 0, Number(closingEvidence.confidence) || 0, Number(firstFeeProof?.proof?.confidence) || 0);
      return {
        label,
        callNumber,
        placesType,
        openingDate: pair.openingDate,
        closingDate: pair.closingDate,
        applicationFee: fee,
        sourceUrl: openingEvidence.sourceUrl || closingEvidence.sourceUrl || firstFeeProof?.proof?.url || null,
        sourceName: openingEvidence.sourceIsPdf || closingEvidence.sourceIsPdf ? 'Official faculty page / PDF' : 'Official faculty admissions page',
        openingEvidence,
        closingEvidence,
        feeEvidence: firstFeeProof?.proof ? { field: 'fee', value: fee, sourceUrl: firstFeeProof.proof.url, matchedText: firstFeeProof.proof.matchedText, pageNumber: firstFeeProof.proof.pageNumber || null, sourceIsPdf: Boolean(firstFeeProof.proof.isPdf), confidence: Number(firstFeeProof.proof.confidence) || 0 } : null,
        confidence
      };
    })
    .filter(Boolean)
    .filter((window, index, list) => list.findIndex(item => item.openingDate === window.openingDate && item.closingDate === window.closingDate && item.label === window.label) === index);
  const firstWithTuition = evidence.find(item => item.tuition?.length && item.tuitionEvidence?.some(value => value.matchedText && !NON_REGISTRATION_CONTEXT.test(value.matchedText)));
  const tuition = firstWithTuition?.tuition?.[0] || null;
  const rejectedHistoricalDates = unique([
...openingCandidates.filter(value => !isInTargetAcademicCycle(value)),
    ...closingCandidates.filter(value => !isInTargetAcademicCycle(value))
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
    additionalEnrollmentFeeCandidates,
    sourceUrl: programUrl
  });

  debug.selected = {
    openingDate: dates.openingDate,
    closingDate: dates.closingDate,
    applicationFee: fee,
    tuition,
    openingSource: firstWithOpening?.url || null,
    closingSource: firstWithClosing?.url || null,
    feeSource: firstWithFee?.url || null,
    reason: dates.openingDate || dates.closingDate || fee ? 'strict-evidence-selected' : 'no-strict-evidence'
  };
  console.log('[Admissions DEBUG SUMMARY]', JSON.stringify(debug, null, 2));

  return {
    openingDate: dates.openingDate,
    closingDate: dates.closingDate,
    applicationFee: fee,
    additionalEnrollmentFee,
    additionalEnrollmentFeeEvidence: additionalEnrollmentFeeEvidenceValue,
    admissionWindows,
    tuition,
    tuitionEvidence: firstWithTuition?.tuitionEvidence?.find(item => String(item.value) === String(tuition)) || null,
    sourceUrl: firstWithOpening?.url || firstWithClosing?.url || firstWithFee?.url || null,
    sourceIsPdf: Boolean((firstWithOpening || firstWithClosing || firstWithFee)?.isPdf),
    openingEvidence: firstWithOpening && selectedOpening ? (() => { const item = firstWithOpening.openingEvidence?.find(value => String(value.value) === String(selectedOpening)); return item ? { field: 'opening', value: selectedOpening, sourceUrl: item.url, matchedText: item.matchedText, pageNumber: item.pageNumber, sourceIsPdf: item.isPdf, confidence: item.confidence } : null; })() : null,
    closingEvidence: firstWithClosing && selectedClosing ? (() => { const item = firstWithClosing.closingEvidence?.find(value => String(value.value) === String(selectedClosing)); return item ? { field: 'closing', value: selectedClosing, sourceUrl: item.url, matchedText: item.matchedText, pageNumber: item.pageNumber, sourceIsPdf: item.isPdf, confidence: item.confidence } : null; })() : null,
    feeEvidence: firstFeeProof?.proof ? { field: 'fee', value: fee, sourceUrl: firstFeeProof.proof.url, matchedText: firstFeeProof.proof.matchedText, pageNumber: firstFeeProof.proof.pageNumber, sourceIsPdf: firstFeeProof.proof.isPdf, confidence: firstFeeProof.proof.confidence } : null,
    additionalEnrollmentFeeEvidence: additionalEnrollmentFeeEvidenceValue,
    evidence,
    debug,
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
  pairAdmissionWindows,
  isCurrentOrFutureDate
};
