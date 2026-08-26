require('dotenv').config();
const { getDirectSource } = require('./services/admissionSourceMap');

const programs = [
  { id: 0, university: 'Università degli Studi di Messina', programName: 'International Bachelor and Master programmes', field: 'International programmes', language: 'English' },
  { id: 0, university: 'Università degli Studi di Padova', programName: 'English-taught degree programmes', field: 'English-taught degree programmes', language: 'English' },
  { id: 0, university: 'Università degli Studi di Torino', programName: 'International degree-seeking programmes', field: 'International degree-seeking programmes', language: 'English' },
];

for (const program of programs) {
  const source = getDirectSource(program, { manualOnly: true });
  if (!source) throw new Error(`No direct source for ${program.university}`);
  if (!source.sourceUrls.length) throw new Error(`No source URL for ${program.university}`);
  console.log(`${program.university}: ${source.sourceUrls.join(', ')}`);
}
console.log('Manual source map test passed.');
