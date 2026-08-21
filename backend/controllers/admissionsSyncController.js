const prisma = require('../config/prisma');

const admissionsWorker = require('../services/admissionsSyncWorker');
const { getDirectSource } = require('../services/admissionSourceMap');
const startJob = typeof admissionsWorker === 'function'
  ? admissionsWorker
  : admissionsWorker && admissionsWorker.startJob;
const getJob = admissionsWorker && admissionsWorker.getJob;
const cancelJob = admissionsWorker && admissionsWorker.cancelJob;

if (typeof startJob !== 'function' || typeof getJob !== 'function' || typeof cancelJob !== 'function') {
  throw new TypeError(
    'admissionsSyncWorker يجب أن يصدّر startJob و getJob و cancelJob. تحقق من module.exports في services/admissionsSyncWorker.js.'
  );
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function buildValidatedDates(enrichment) {
  const openingDate = parseDate(enrichment.openingDate);
  const closingDate = parseDate(enrichment.closingDate);

  if (openingDate && closingDate && openingDate > closingDate) {
    return { openingDate: null, closingDate: null, invalidRange: true };
  }

  return { openingDate, closingDate, invalidRange: false };
}

function buildValidatedWindows(enrichment) {
  const windows = Array.isArray(enrichment.admissionWindows) ? enrichment.admissionWindows : [];
  return windows.map((window, index) => {
    const openingDate = parseDate(window?.openingDate);
    const closingDate = parseDate(window?.closingDate);
    if (!openingDate || !closingDate || openingDate > closingDate) return null;

    // The enricher may provide per-window evidence, or only document-level
    // evidence. Both are official evidence; never invent a snippet or URL.
    const openingEvidence = chooseEvidence(
      enrichment,
      {
        ...(window.openingEvidence || {}),
        field: 'opening',
        value: window.openingDate,
        sourceUrl: window.openingEvidence?.sourceUrl || window.openingEvidence?.url || window.sourceUrl,
        matchedText: window.openingEvidence?.matchedText || window.openingEvidence?.textSnippet || window.openingEvidence?.text
      },
      'opening',
      window.openingDate
    );
    const closingEvidence = chooseEvidence(
      enrichment,
      {
        ...(window.closingEvidence || {}),
        field: 'closing',
        value: window.closingDate,
        sourceUrl: window.closingEvidence?.sourceUrl || window.closingEvidence?.url || window.sourceUrl,
        matchedText: window.closingEvidence?.matchedText || window.closingEvidence?.textSnippet || window.closingEvidence?.text
      },
      'closing',
      window.closingDate
    );
    if (!openingEvidence || !closingEvidence) return null;

    const feeEvidence = window.applicationFee != null
      ? chooseEvidence(
          enrichment,
          {
            ...(window.feeEvidence || {}),
            field: 'fee',
            value: window.applicationFee,
            sourceUrl: window.feeEvidence?.sourceUrl || window.feeEvidence?.url || window.sourceUrl,
            matchedText: window.feeEvidence?.matchedText || window.feeEvidence?.textSnippet || window.feeEvidence?.text
          },
          'fee',
          window.applicationFee
        )
      : null;

    return {
      label: window.label || `Call ${index + 1}`,
      callNumber: Number.isInteger(Number(window.callNumber)) ? Number(window.callNumber) : null,
      placesType: window.placesType || null,
      openingDate,
      closingDate,
      applicationFee: feeEvidence && window.applicationFee != null ? String(window.applicationFee).trim() : null,
      sourceName: window.sourceName || 'Official faculty admissions page',
      sourceUrl: window.sourceUrl || openingEvidence.sourceUrl || closingEvidence.sourceUrl,
      openingEvidence,
      closingEvidence,
      feeEvidence,
      verificationStatus: 'VERIFIED',
      confidence: Number(window.confidence) || Math.max(openingEvidence.confidence, closingEvidence.confidence, feeEvidence?.confidence || 0)
    };
  }).filter(Boolean);
}

function evidenceContainsValue(text, value, field) {
  const source = String(text || '').toLowerCase();
  if (!source || value === null || value === undefined) return false;
  const raw = String(value).trim().toLowerCase();
  if (source.includes(raw)) return true;

  // القيمة المخزنة ISO، أما النص الرسمي قد يكون 15 gennaio 2027 أو 15/01/2027.
  if (field === 'opening' || field === 'closing') {
    const iso = raw.match(/^(20\d{2})-(\d{2})-(\d{2})$/);
    if (iso) {
      const [, year, month, day] = iso;
      const dayNumber = String(Number(day));
      const monthNumber = String(Number(month));
      const paddedDay = String(day).padStart(2, '0');
      const paddedMonth = String(month).padStart(2, '0');
      const dateForms = [
        `${dayNumber}/${monthNumber}/${year}`,
        `${paddedDay}/${paddedMonth}/${year}`,
        `${dayNumber}.${monthNumber}.${year}`,
        `${paddedDay}.${paddedMonth}.${year}`,
        `${dayNumber}-${monthNumber}-${year}`,
        `${paddedDay}-${paddedMonth}-${year}`,
        `${dayNumber} ${year}`,
        `${paddedDay} ${year}`
      ];
      if (dateForms.some(form => source.includes(form))) return true;
      const monthNames = {
        en: ['january','february','march','april','may','june','july','august','september','october','november','december'],
        it: ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'],
        fr: ['janvier','février','fevrier','mars','avril','mai','juin','juillet','août','aout','septembre','octobre','novembre','décembre','decembre'],
        aliases: {
          1: ['jan','gen','janv'], 2: ['feb','févr','fevr'], 3: ['mar'], 4: ['apr','avr'],
          5: ['mag'], 6: ['jun','giu'], 7: ['jul','lug','juil'], 8: ['aug','ago'],
          9: ['sep','sept','set'], 10: ['oct','ott'], 11: ['nov'], 12: ['dec','dic','déc']
        }
      };
      const monthNumberValue = Number(month);
      const monthNamesForDate = [
        monthNames.en[monthNumberValue - 1],
        monthNames.it[monthNumberValue - 1],
        monthNames.fr[monthNumberValue - 1],
        ...(monthNames.aliases[monthNumberValue] || []),
        ...(monthNumberValue === 2 ? ['février', 'fevrier'] : []),
        ...(monthNumberValue === 8 ? ['août', 'aout'] : []),
        ...(monthNumberValue === 12 ? ['décembre', 'decembre'] : [])
      ].filter(Boolean);
      const monthName = monthNames.en[monthNumberValue - 1];

        // Le texte officiel peut être italien/français et ne pas être recopié
        // dans openingText/closingText. On valide alors directement la date
        // dans le document original, y compris lorsque l'année n'apparaît
        // qu'une seule fois à la fin d'une plage (« 7 aprile - 4 giugno 2026 »).
        const monthDateForms = monthNamesForDate.flatMap(name => [
          `${dayNumber} ${name} ${year}`,
          `${paddedDay} ${name} ${year}`,
          `${name} ${dayNumber} ${year}`,
          `${name} ${paddedDay} ${year}`,
          `${dayNumber} ${name}, ${year}`,
          `${name} ${dayNumber}, ${year}`
        ]);
        if (monthDateForms.some(form => source.includes(form))) return true;
        const anyLocalDate = `[a-zà-ÿ]+\\s+\\d{1,2}(?:st|nd|rd|th|er)?`;
        const localOpeningRange = new RegExp(
          `(?:${monthNamesForDate.join('|')})\\s+${dayNumber}(?:st|nd|rd|th|er)?\\s*(?:-|–|—|to|until|du|au|al|dal)\\s*${anyLocalDate}[,\\s]+${year}`,
          'i'
        );
        const localClosingRange = new RegExp(
          `${anyLocalDate}\\s*(?:-|–|—|to|until|du|au|al|dal)\\s*(?:${monthNamesForDate.join('|')})\\s+${dayNumber}(?:st|nd|rd|th|er)?[,\\s]+${year}`,
          'i'
        );
        if (localOpeningRange.test(source) || localClosingRange.test(source)) return true;

      if (monthName) {
        // Pages officielles utilisent parfois 2nd March 2026, March 2nd, 2026,
        // des virgules ou des espaces insécables. On normalise uniquement la
        // représentation du texte, sans accepter une valeur non datée.
        const normalizedSource = source
          .replace(/(\d{1,2})(st|nd|rd|th)\b/g, '$1')
          .replace(/[;,]/g, ' ')
          .replace(/\u00a0/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        const normalizedMonthForms = monthNamesForDate.flatMap(name => [
          `${dayNumber} ${name} ${year}`,
          `${paddedDay} ${name} ${year}`,
          `${name} ${dayNumber} ${year}`,
          `${name} ${paddedDay} ${year}`
        ]);
        if (normalizedMonthForms.some(form => normalizedSource.includes(form))) return true;

        // English official pages often put the year only once at the end of
        // a range, for example: "April 7th - June 4th, 2026". The opening
        // date therefore does not appear as "April 7th 2026" in isolation.
        const ordinalDay = `${dayNumber}(?:st|nd|rd|th)?`;
        const anyEnglishDate = `[a-z]+\\s+\\d{1,2}(?:st|nd|rd|th)?`;
        const openingSharedYearRange = new RegExp(
          `${monthName}\\s+${ordinalDay}\\s*[-–—]\\s*${anyEnglishDate}[,\\s]+${year}`,
          'i'
        );
        const closingSharedYearRange = new RegExp(
          `${anyEnglishDate}\\s*[-–—]\\s*${monthName}\\s+${ordinalDay}[,\\s]+${year}`,
          'i'
        );
        if (openingSharedYearRange.test(normalizedSource) || closingSharedYearRange.test(normalizedSource)) return true;

        const monthForms = [
          `${dayNumber} ${monthName} ${year}`,
          `${paddedDay} ${monthName} ${year}`,
          `${monthName} ${dayNumber}, ${year}`,
          `${monthName} ${paddedDay}, ${year}`,
          `${monthName} ${dayNumber} ${year}`,
          `${monthName} ${paddedDay} ${year}`,
          `${monthName} ${dayNumber}st, ${year}`,
          `${monthName} ${dayNumber}nd, ${year}`,
          `${monthName} ${dayNumber}rd, ${year}`,
          `${monthName} ${dayNumber}th, ${year}`,
          `${monthName} ${paddedDay}st, ${year}`,
          `${monthName} ${paddedDay}nd, ${year}`,
          `${monthName} ${paddedDay}rd, ${year}`,
          `${monthName} ${paddedDay}th, ${year}`
        ];
        if (monthForms.some(form => source.includes(form))) return true;
      }
    }
  }

  if (field === 'fee' || field === 'tuition' || field === 'additionalEnrollmentFee') {
    const numeric = raw.replace(/[^0-9,.]/g, '').replace(/\.(?=\d{3}(?:[,.]|$))/g, '').replace(',', '.');
    const compact = source.replace(/\s+/g, '');
    return Boolean(numeric && (compact.includes(numeric.replace('.', ',')) || compact.includes(numeric)));
  }
  return false;
}

function safeEvidence(value) {
  if (!value || typeof value !== 'object') return null;

  const field = value.field || null;
  const extractedValue = value.value ?? null;
  const sourceUrl = value.sourceUrl || value.url || null;
  const matchedText = value.matchedText || value.textSnippet || value.text || null;

  // Une preuve exploitable doit identifier le champ, la valeur, l'URL officielle
  // et le texte exact trouvé dans la page ou le PDF.
    if (!field || extractedValue === null || !sourceUrl || !matchedText) return null;
  if (!evidenceContainsValue(matchedText, extractedValue, field)) return null;

  const pageNumber = Number(value.pageNumber);

  return {
    field,
    value: extractedValue === null || extractedValue === undefined
      ? null
      : String(extractedValue),
    sourceUrl,
    sourceIsPdf: Boolean(value.sourceIsPdf || value.isPdf),
    pageNumber: Number.isInteger(pageNumber) && pageNumber > 0 ? pageNumber : null,
    matchedText: matchedText ? String(matchedText).trim() : null,
    confidence: Math.max(
      0,
      Math.min(
        1,
        Number.isFinite(Number(value.confidence)) ? Number(value.confidence) : 0
      )
    ),
    extractedAt: value.extractedAt || new Date().toISOString()
  };
}

function evidenceFor(enrichment, field, value) {
  if (value === undefined || value === null || value === '') return null;

  const documents = Array.isArray(enrichment.evidence) ? enrichment.evidence : [];
  const document = documents.find(item => {
    if (!item || typeof item !== 'object') return false;
    const values = field === 'opening'
      ? item.openingDates
      : field === 'closing'
        ? item.closingDates
        : item.fees;
    const listed = Array.isArray(values)
      && values.some(candidate => String(candidate) === String(value));
    if (listed) return true;

    // Fallback document-level validation: some parser paths retain the exact
    // page text but omit the per-field candidate arrays. We may still use that
    // official text as evidence, but only after validating the expected value
    // against the original snippet; no date or URL is fabricated.
    return Boolean(item.text && evidenceContainsValue(item.text, value, field));
  });

  if (!document) return null;

  const values = field === 'opening'
    ? document.openingDates
    : field === 'closing'
      ? document.closingDates
      : document.fees;

  // لا نصنعش evidence اصطناعية. إذا ما عندناش النص الأصلي، نرجع null.
  const fieldText = field === 'opening'
    ? document.openingText
      || document.openingEvidence?.find(item => String(item?.value) === String(value))?.matchedText
    : field === 'closing'
      ? document.closingText
        || document.closingEvidence?.find(item => String(item?.value) === String(value))?.matchedText
      : field === 'fee'
        ? document.feeText
          || document.feeEvidence?.find(item => String(item?.value) === String(value))?.matchedText
        : document.tuitionText
          || document.tuitionEvidence?.find(item => String(item?.value) === String(value))?.matchedText;
  const matchedText = fieldText || document.matchedText || document.textSnippet
    || (document.text && evidenceContainsValue(document.text, value, field) ? document.text : null);

  return safeEvidence({
    field,
    value,
    sourceUrl: document.url || document.sourceUrl || enrichment.sourceUrl || null,
    sourceIsPdf: document.isPdf || document.sourceIsPdf,
    pageNumber: document.pageNumber,
    matchedText,
    confidence: document.confidence ?? enrichment.confidence ?? 0.5,
    extractedAt: new Date().toISOString(),
    values
  });
}

function chooseEvidence(enrichment, directEvidence, field, value) {
  // L’enricher renvoie parfois sourceUrl/matchedText sans field/value.
  // On complète donc l’évidence directe avant de la sauvegarder.
  const direct = safeEvidence({
    ...(directEvidence || {}),
    field: directEvidence?.field || field,
    value: directEvidence?.value ?? value,
    sourceUrl: directEvidence?.sourceUrl || directEvidence?.url || enrichment.sourceUrl || null,
    matchedText: directEvidence?.matchedText || directEvidence?.textSnippet || directEvidence?.text || null
  });

  // Si l’évidence directe est incomplète, on la reconstruit depuis le document
  // exact qui contient la valeur extraite.
  return direct || evidenceFor(enrichment, field, value);
}

async function startAdmissionsSync(req, res) {
  try {
    const requestedField = String(req.body?.field || '').trim();

    const where = requestedField && requestedField !== 'ALL'
      ? { field: requestedField }
      : {};

    const cataloguePrograms = await prisma.universityProgram.findMany({
      where,
      select: {
        id: true,
        university: true,
        programName: true,
        field: true,
        language: true,
        sourceUrl: true,
        sourceName: true
      },
      orderBy: [{ university: 'asc' }, { programName: 'asc' }]
    });

    // Manual-only: لا نعالج catalogue Universitaly العام؛ نعالج فقط البرامج
    // التي عندها entry manual=true وروابط direct في admission-source-map.json.
    const programs = cataloguePrograms.filter(program => Boolean(getDirectSource(program, { manualOnly: true })));

    if (programs.length === 0) {
      return res.status(404).json({
        success: false,
        message: requestedField && requestedField !== 'ALL'
          ? `Aucun programme trouvé pour le domaine « ${requestedField} ».`
          : 'Aucun programme trouvé dans la base de données.'
      });
    }

    const job = startJob({
      programs,
      saveEnriched: async (program, enrichment = {}) => {
        const dates = buildValidatedDates(enrichment);
        const admissionWindows = buildValidatedWindows(enrichment);
        const openingEvidence = chooseEvidence(
          enrichment,
          enrichment.openingEvidence,
          'opening',
          enrichment.openingDate
        );
        const closingEvidence = chooseEvidence(
          enrichment,
          enrichment.closingEvidence,
          'closing',
          enrichment.closingDate
        );
        const feeEvidence = chooseEvidence(
          enrichment,
          enrichment.feeEvidence,
          'fee',
          enrichment.applicationFee
        );
        const additionalEnrollmentFeeEvidence = enrichment.additionalEnrollmentFeeEvidence
          ? safeEvidence({
              ...enrichment.additionalEnrollmentFeeEvidence,
              field: 'additionalEnrollmentFee',
              value: String(enrichment.additionalEnrollmentFee || '').replace(/[^0-9.,]/g, ''),
              sourceUrl: enrichment.additionalEnrollmentFeeEvidence.sourceUrl || enrichment.additionalEnrollmentFeeEvidence.url || enrichment.sourceUrl,
              matchedText: enrichment.additionalEnrollmentFeeEvidence.matchedText || enrichment.additionalEnrollmentFeeEvidence.text
            })
          : null;

        const hasFee = Boolean(enrichment.applicationFee && feeEvidence);
        const hasOpening = Boolean(dates.openingDate && openingEvidence);
        const hasClosing = Boolean(dates.closingDate && closingEvidence);
        const verified = !enrichment.syncFailed
          && !dates.invalidRange
          && (admissionWindows.length > 0 || hasFee || hasOpening || hasClosing);

        const evidenceItems = [openingEvidence, closingEvidence, feeEvidence].filter(Boolean);
        const bestConfidence = evidenceItems.length
          ? Math.max(...evidenceItems.map(item => Number(item.confidence) || 0))
          : 0;

        // Ne pas utiliser de propriétés conditionnelles ici. Chaque champ est
        // envoyé explicitement avec null pour supprimer les anciennes données.
        const data = {
          openingDate: hasOpening ? dates.openingDate : null,
          closingDate: hasClosing ? dates.closingDate : null,
          applicationFee: hasFee ? String(enrichment.applicationFee).trim() : null,
          additionalEnrollmentFee: additionalEnrollmentFeeEvidence && enrichment.additionalEnrollmentFee
            ? String(enrichment.additionalEnrollmentFee).trim()
            : null,
          // Tuition لا يدخل في admissions evidence؛ نمسحه حتى لا تبقى قيمة قديمة.
          tuition: null,
          openingEvidence: hasOpening ? openingEvidence : null,
          closingEvidence: hasClosing ? closingEvidence : null,
          feeEvidence: hasFee ? feeEvidence : null,
          additionalEnrollmentFeeEvidence,
          sourceName: verified
            ? (enrichment.sourceIsPdf
              ? 'Official faculty page / PDF'
              : 'Official faculty admissions page')
            : '',
          sourceUrl: verified ? (enrichment.sourceUrl || '') : '',
          // Ce champ est obligatoire dans Prisma. Il représente la dernière
          // tentative de vérification; le statut indique si elle a réussi.
          lastVerifiedAt: new Date(),
          verificationStatus: enrichment.syncFailed
            ? 'STALE'
            : (verified ? 'VERIFIED' : 'NEEDS_REVIEW'),
          confidence: verified
            ? (Number.isFinite(Number(enrichment.confidence))
              ? Number(enrichment.confidence)
              : bestConfidence)
            : 0,
          admissionWindows: {
            deleteMany: {},
            create: admissionWindows
          }
        };

        console.log('[Admissions SAVE]', {
          id: program.id,
          program: program.programName,
          selected: {
            openingDate: enrichment.openingDate || null,
            closingDate: enrichment.closingDate || null,
            applicationFee: enrichment.applicationFee || null
          },
          accepted: { hasOpening, hasClosing, hasFee },
          verified,
          evidence: {
            opening: Boolean(openingEvidence),
            closing: Boolean(closingEvidence),
            fee: Boolean(feeEvidence)
          }
        });

        const saved = await prisma.universityProgram.update({
          where: { id: program.id },
          data,
          select: {
            id: true,
            openingDate: true,
            closingDate: true,
            applicationFee: true,
            additionalEnrollmentFee: true,
            additionalEnrollmentFeeEvidence: true,
            openingEvidence: true,
            closingEvidence: true,
            feeEvidence: true,
            admissionWindows: true,
            verificationStatus: true
          }
        });

        console.log('[Admissions SAVED]', {
          id: saved.id,
          openingDate: saved.openingDate,
          closingDate: saved.closingDate,
            applicationFee: saved.applicationFee,
            additionalEnrollmentFee: saved.additionalEnrollmentFee,
            verificationStatus: saved.verificationStatus,
          evidence: {
            opening: Boolean(saved.openingEvidence),
            closing: Boolean(saved.closingEvidence),
            fee: Boolean(saved.feeEvidence)
          }
        });

        if (dates.invalidRange) {
          console.warn(`[Admissions] Dates incohérentes effacées pour ${program.university} - ${program.programName}`);
        }
        if (enrichment.syncFailed) {
          console.warn(`[Admissions] Échec de synchronisation; anciennes données effacées pour ${program.university} - ${program.programName}: ${enrichment.syncError || 'erreur inconnue'}`);
        }

        return verified ? 'updated' : 'cleared';
      }
    });

    return res.status(202).json({
      success: true,
      data: { ...job, field: requestedField, total: programs.length }
    });
  } catch (error) {
    console.error('Admissions sync start:', error);
    return res.status(500).json({
      success: false,
      message: 'Impossible de démarrer la synchronisation admissions.'
    });
  }
}

function getAdmissionsSyncStatus(req, res) {
  const job = getJob(req.params.jobId);
  if (!job) {
    return res.status(404).json({ success: false, message: 'Job introuvable.' });
  }

  return res.json({
    success: true,
    data: {
      ...job,
      progress: job.total ? Math.round((job.completed / job.total) * 100) : 100
    }
  });
}

function cancelAdmissionsSync(req, res) {
  const job = cancelJob(req.params.jobId);
  if (!job) {
    return res.status(404).json({ success: false, message: 'Job introuvable.' });
  }

  return res.json({
    success: true,
    data: job,
    message: 'Arrêt demandé. Le programme actuellement en cours peut terminer.'
  });
}

module.exports = {
  startAdmissionsSync,
  getAdmissionsSyncStatus,
  cancelAdmissionsSync,
  buildValidatedDates,
  buildValidatedWindows,
  safeEvidence,
  evidenceFor,
  chooseEvidence
};


