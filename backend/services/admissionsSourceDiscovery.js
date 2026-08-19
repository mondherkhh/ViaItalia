'use strict';

const { discoverOfficialProgramUrl } = require('./admissionsSyncWorker');
const { enrichProgram } = require('./officialAdmissionsEnricher');
const { getDirectSource, upsertDirectSource } = require('./admissionSourceMap');
const sources = require('./universitySources');

function universitySource(program, officialUrl) {
  const university = String(program.university || '').toLowerCase();
  const mapped = sources.find(item => [item.name, ...(item.aliases || [])]
    .some(alias => university.includes(String(alias).toLowerCase()))) || {};
  return {
    ...mapped,
    admissionsUrls: [...new Set([...(mapped.admissionsUrls || []), officialUrl].filter(Boolean))]
  };
}

async function discoverAdmissionSources(program) {
  const existing = getDirectSource(program);
  if (existing) {
    return { status: 'already_discovered', program, source: existing, enrichment: null };
  }

  const officialUrl = await discoverOfficialProgramUrl(program);
  if (!officialUrl) {
    return { status: 'official_program_url_not_found', program, source: null, enrichment: null };
  }

  const enrichment = await enrichProgram({
    programName: program.programName,
    universityName: program.university,
    programUrl: officialUrl,
    source: universitySource(program, officialUrl)
  });
  const saved = upsertDirectSource(program, enrichment);
  return {
    status: saved ? 'discovered' : 'no_verified_admission_source',
    program,
    officialUrl,
    source: getDirectSource(program),
    enrichment
  };
}

module.exports = { discoverAdmissionSources };
