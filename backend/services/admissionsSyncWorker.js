'use strict';

const { getDirectSource } = require('./admissionSourceMap');
const { enrichProgram } = require('./officialAdmissionsEnricher');

const jobs = new Map();
const CONCURRENCY = Math.max(1, Number(process.env.ADMISSIONS_SYNC_CONCURRENCY || 3));

function createJob(programs) {
  const id = `admissions-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const job = {
    id,
    status: 'queued',
    cancelRequested: false,
    total: programs.length,
    completed: 0,
    updated: 0,
    cleared: 0,
    skipped: 0,
    failed: 0,
    currentUniversity: null,
    currentProgram: null,
    startedAt: null,
    finishedAt: null,
    errors: []
  };
  jobs.set(id, job);
  return job;
}

function getJob(id) {
  return jobs.get(id) || null;
}

function cancelJob(id) {
  const job = jobs.get(id);
  if (!job || ['completed', 'failed', 'cancelled'].includes(job.status)) return job || null;
  job.cancelRequested = true;
  if (job.status === 'queued') job.status = 'cancelled';
  return job;
}

function uniqueUrls(values) {
  return [...new Set((Array.isArray(values) ? values : [])
    .filter(value => typeof value === 'string' && /^https?:\/\//i.test(value.trim()))
    .map(value => value.trim()))];
}

function directSourceFor(program) {
  const source = getDirectSource(program, { manualOnly: true });
  if (!source) return null;
  const admissionsUrls = uniqueUrls(source.admissionsUrls);
  const feesUrls = uniqueUrls(source.feesUrls);
  const sourceUrls = uniqueUrls([...admissionsUrls, ...feesUrls]);
  if (!sourceUrls.length) return null;
  return {
    ...source,
    admissionsUrls,
    feesUrls,
    sourceUrls,
    programUrls: uniqueUrls(source.programUrls)
  };
}

async function runPool(items, handler) {
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      await handler(items[index], index);
    }
  }
  const count = Math.min(CONCURRENCY, Math.max(items.length, 1));
  await Promise.all(Array.from({ length: count }, worker));
}

async function runJob({ id, programs, saveEnriched }) {
  const job = jobs.get(id);
  if (!job) return;
  job.status = 'running';
  job.startedAt = new Date();

  await runPool(programs, async program => {
    if (job.cancelRequested) return;
    job.currentUniversity = program.university || null;
    job.currentProgram = program.programName || null;

    try {
      const source = directSourceFor(program);
      if (!source) {
        const result = await saveEnriched(program, {
          syncFailed: false,
          verificationStatus: 'NEEDS_REVIEW',
          openingDate: null,
          closingDate: null,
          applicationFee: null,
          evidence: [],
          sourceUrl: '',
          sourceName: ''
        });
        if (result === 'cleared') job.cleared += 1;
        else job.skipped += 1;
        return;
      }

      const officialDataUrls = source.sourceUrls;
      const metadataProgramUrl = source.programUrls[0] || officialDataUrls[0];

      console.log(`[Admissions DIRECT] ${program.university} — ${program.programName}`);
      console.log(`[Admissions DIRECT] data URLs: ${officialDataUrls.join(', ')}`);

      const enrichment = await enrichProgram({
        programName: program.programName,
        universityName: program.university,
        programUrl: metadataProgramUrl,
        source: {
          ...source,
          // The enricher must only visit these exact data URLs.
          sourceUrls: officialDataUrls,
          admissionsUrls: source.admissionsUrls,
          feesUrls: source.feesUrls,
          programUrls: []
        }
      });

      if (job.cancelRequested) return;

      // Manual source maps are authoritative. Never auto-write them during a sync.
      const mappedAdditionalFee = Array.isArray(source.verifiedAdditionalEnrollmentFees)
        ? source.verifiedAdditionalEnrollmentFees[0]
        : null;
      const parsedAdditionalFee = enrichment.additionalEnrollmentFee && enrichment.additionalEnrollmentFeeEvidence
        ? {
            amount: enrichment.additionalEnrollmentFee,
            currency: enrichment.additionalEnrollmentFeeEvidence.currency || 'EUR',
            label: 'additional enrolment fee',
            text: enrichment.additionalEnrollmentFeeEvidence.matchedText,
            sourceUrl: enrichment.additionalEnrollmentFeeEvidence.sourceUrl,
            period: null
          }
        : null;
      const additionalFee = mappedAdditionalFee || parsedAdditionalFee;
      const result = await saveEnriched(program, {
        ...enrichment,
        additionalEnrollmentFee: additionalFee?.amount != null
          ? `${additionalFee.amount} ${additionalFee.currency || 'EUR'}`
          : null,
        additionalEnrollmentFeeEvidence: additionalFee
          ? {
              value: additionalFee.amount,
              currency: additionalFee.currency || 'EUR',
              label: additionalFee.label || 'additional enrolment fee',
              matchedText: additionalFee.text || null,
              url: additionalFee.sourceUrl || officialDataUrls[0],
              period: additionalFee.period || null,
              confidence: 1
            }
          : null,
        sourceUrl: enrichment.sourceUrl || officialDataUrls[0],
        sourceName: enrichment.sourceName || 'Official direct admissions source'
      });
      if (result === 'updated') job.updated += 1;
      else if (result === 'cleared') job.cleared += 1;
      else job.skipped += 1;
    } catch (error) {
      job.failed += 1;
      const message = error?.message || 'Erreur inconnue';
      if (job.errors.length < 100) {
        job.errors.push({
          program: program.programName,
          university: program.university,
          message
        });
      }
      try {
        const result = await saveEnriched(program, {
          syncFailed: true,
          syncError: message,
          verificationStatus: 'STALE',
          openingDate: null,
          closingDate: null,
          applicationFee: null,
          evidence: []
        });
        if (result === 'cleared') job.cleared += 1;
      } catch (saveError) {
        if (job.errors.length < 100) {
          job.errors.push({
            program: program.programName,
            university: program.university,
            message: `Échec du nettoyage après erreur: ${saveError.message}`
          });
        }
      }
    } finally {
      job.completed += 1;
    }
  });

  job.currentUniversity = null;
  job.currentProgram = null;
  job.status = job.cancelRequested ? 'cancelled' : 'completed';
  job.finishedAt = new Date();
}

function startJob({ programs, saveEnriched }) {
  const safePrograms = Array.isArray(programs) ? programs : [];
  const job = createJob(safePrograms);
  setImmediate(() => runJob({ id: job.id, programs: safePrograms, saveEnriched }).catch(error => {
    const failed = jobs.get(job.id);
    if (!failed) return;
    failed.status = 'failed';
    failed.finishedAt = new Date();
    failed.errors.push({ message: error?.message || 'Erreur inconnue' });
  }));
  return job;
}

// Kept for backwards compatibility. The new workflow never discovers URLs.
async function discoverOfficialProgramUrl() {
  return null;
}

module.exports = {
  startJob,
  getJob,
  cancelJob,
  discoverOfficialProgramUrl
};

