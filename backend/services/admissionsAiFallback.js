const axios = require('axios');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');
const execFileAsync = promisify(execFile);

let playwright = null;
let tesseract = null;

function optionalRequire(name) {
  try { return require(name); } catch (_) { return null; }
}

function loadPlaywright() {
  if (playwright === null) playwright = optionalRequire('playwright');
  return playwright;
}

function loadTesseract() {
  if (tesseract === null) tesseract = optionalRequire('tesseract.js');
  return tesseract;
}

function envBool(name, fallback = false) {
  const value = process.env[name];
  return value == null ? fallback : String(value).toLowerCase() === 'true';
}

function trimText(value, max = 50000) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

async function renderDynamicPage(url, options = {}) {
  if (!envBool('ADMISSIONS_PLAYWRIGHT_ENABLED', true)) return null;
  const pw = loadPlaywright();
  if (!pw) return null;

  const browser = await pw.chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage({
      userAgent: process.env.ADMISSIONS_USER_AGENT || 'ViaItaliaAdmissionsBot/4.0'
    });
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: Number(process.env.ADMISSIONS_PLAYWRIGHT_TIMEOUT || 30000)
    });
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(Number(process.env.ADMISSIONS_PLAYWRIGHT_WAIT_MS || 1500));

    await page.evaluate(() => {
      const selectors = [
        'button[aria-expanded="false"]',
        '[role="button"][aria-expanded="false"]',
        'details:not([open]) > summary',
        '.accordion-header',
        '.accordion-button.collapsed',
        '[data-toggle="collapse"]',
        '[data-bs-toggle="collapse"]'
      ];
      const nodes = Array.from(document.querySelectorAll(selectors.join(',')));
      for (const node of nodes) {
        const label = `${node.innerText || ''} ${node.getAttribute('aria-label') || ''}`.toLowerCase();
        if (/admission|application|enrol|enrollment|registration|immatricol|iscrizion|candidatur|domand|tass|fee|contribut|faq|frequent|session|séance/.test(label) || nodes.length <= 40) {
          try { node.click(); } catch (_) {}
          if (node.parentElement?.tagName === 'DETAILS') node.parentElement.open = true;
        }
      }
    }).catch(() => {});
    await page.waitForTimeout(500);
    const readPage = () => page.evaluate(() => ({
      title: document.title || '',
      text: document.body ? document.body.innerText : '',
      links: Array.from(document.querySelectorAll('a[href], iframe[src], embed[src], object[data]')).map(node => ({
        href: node.href || node.src || node.data || '',
        label: (node.innerText || node.getAttribute('title') || node.getAttribute('aria-label') || '').trim()
      })).filter(item => item.href)
    }));

    let result;
    try {
      result = await readPage();
    } catch (_) {
      // Some official pages redirect after the initial load (for example Cloudflare or locale redirects).
      // Wait for the new document and retry once instead of dropping the assigned source.
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(1200);
      result = await readPage().catch(() => ({ title: '', text: '', links: [] }));
    }

    return {
      url,
      title: result.title,
      text: trimText(result.text, options.maxText || 100000),
      links: result.links
    };
  } finally {
    await browser.close().catch(() => {});
  }
}

async function ocrPdfBuffer(buffer, options = {}) {
  if (!envBool('ADMISSIONS_OCR_ENABLED', true) || !buffer) return null;
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'viaitalia-ocr-'));
  const pdfPath = path.join(tempDir, 'source.pdf');
  const prefix = path.join(tempDir, 'page');
  const pdftoppm = process.env.PDFTOPPM_PATH || 'pdftoppm';
  fs.writeFileSync(pdfPath, buffer);
  try {
    await execFileAsync(pdftoppm, ['-f', '1', '-l', String(Number(process.env.ADMISSIONS_OCR_MAX_PAGES || 8)), '-r', '160', '-png', pdfPath, prefix], { timeout: 120000 });
    const images = fs.readdirSync(tempDir).filter(name => /^page-\d+\.png$/i.test(name)).sort();
    const texts = [];
    for (const name of images) {
      const imageText = await ocrImageBuffer(fs.readFileSync(path.join(tempDir, name)), options);
      if (imageText) texts.push(imageText);
    }
    return texts.join(' ').trim() || null;
  } catch (_) {
    return null;
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

async function ocrImageBuffer(buffer, options = {}) {
  if (!envBool('ADMISSIONS_OCR_ENABLED', true)) return null;
  const api = loadTesseract();
  if (!api || !buffer) return null;

  const language = process.env.ADMISSIONS_OCR_LANG || 'ita+eng';
  const worker = await api.createWorker(language);
  try {
    const result = await worker.recognize(buffer);
    return trimText(result?.data?.text, options.maxText || 100000) || null;
  } finally {
    await worker.terminate().catch(() => {});
  }
}

function hasRejectedContext(text) {
  return /english\s*test|language\s*test|test\s+di\s+inglese|test\s+linguistico|esame\s+di\s+inglese|scholarship|borsa\s+di\s+studio|research|ricerca|assegno\s+di\s+ricerca|tassa\s+regionale|imposta\s+di\s+bollo|riserva\s+del\s+posto|prenotazione\s+del\s+posto|conferma\s+del\s+posto|caparra|deposito/i.test(String(text || ''));
}

function hasAdmissionContext(text) {
  return /admission|application|apply|enrol|enrollment|registration|candidatur|domand|iscrizion|immatricol|ammission|bando|tassa\s+di\s+ammissione|tassa\s+di\s+iscrizione|application\s+fee/i.test(String(text || ''));
}

function validateAiCandidate(candidate, source) {
  if (!candidate || typeof candidate !== 'object') return null;
  const matchedText = trimText(candidate.matchedText, 2000);
  if (!matchedText || !hasAdmissionContext(matchedText)) return null;
  if (candidate.field === 'fee' && hasRejectedContext(matchedText)) return null;
  if (!['opening', 'closing', 'fee', 'tuition'].includes(candidate.field)) return null;
  if (candidate.value == null || String(candidate.value).trim() === '') return null;
  return {
    field: candidate.field,
    value: String(candidate.value).trim(),
    matchedText,
    sourceUrl: source.url,
    pageNumber: candidate.pageNumber || source.pageNumber || null,
    sourceIsPdf: Boolean(source.isPdf),
    extractionMethod: 'llm',
    confidence: 0
  };
}

async function extractWithLlm({ programName, universityName, source, text }) {
  if (!envBool('ADMISSIONS_LLM_ENABLED', false)) return [];
  if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_API_BASE) return [];

  const model = process.env.ADMISSIONS_AI_MODEL || 'gpt-5-mini';
  const input = trimText(text, Number(process.env.ADMISSIONS_LLM_MAX_INPUT || 45000));
  if (!input || !hasAdmissionContext(input)) return [];

  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      candidates: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            field: { type: 'string', enum: ['opening', 'closing', 'fee', 'tuition'] },
            value: { type: ['string', 'null'] },
            matchedText: { type: 'string' },
            pageNumber: { type: ['integer', 'null'] }
          },
          required: ['field', 'value', 'matchedText', 'pageNumber']
        }
      }
    },
    required: ['candidates']
  };

  const response = await axios.post(`${process.env.OPENAI_API_BASE.replace(/\/$/, '')}/chat/completions`, {
    model,
    messages: [
      {
        role: 'system',
        content: 'Extract only explicit admission facts from the provided official source. Never infer or guess. A fee is valid only when the exact snippet clearly identifies an application, admission, registration or enrolment fee for the programme. Reject English tests, exams, scholarships, research, regional taxes, stamp duty, tuition, first instalments and seat-reservation deposits. Return JSON only.'
      },
      {
        role: 'user',
        content: JSON.stringify({ programName, universityName, sourceUrl: source.url, text: input })
      }
    ],
    response_format: { type: 'json_schema', json_schema: { name: 'admission_candidates', strict: true, schema } },
    max_completion_tokens: 2500
  }, {
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    timeout: Number(process.env.ADMISSIONS_LLM_TIMEOUT || 45000)
  });

  let parsed;
  try {
    parsed = JSON.parse(response?.data?.choices?.[0]?.message?.content || '{}');
  } catch (_) {
    return [];
  }

  return (Array.isArray(parsed.candidates) ? parsed.candidates : [])
    .map(item => validateAiCandidate(item, source))
    .filter(Boolean);
}

module.exports = {
  renderDynamicPage,
  ocrImageBuffer,
  ocrPdfBuffer,
  extractWithLlm,
  hasRejectedContext,
  hasAdmissionContext
};

