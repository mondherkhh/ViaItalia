require('dotenv').config();
const { safeEvidence } = require('./controllers/admissionsSyncController');

const cases = [
  {
    field: 'opening',
    value: '2026-03-02',
    matchedText: 'Applications are open from March 2, 2026 to May 2, 2026.'
  },
  {
    field: 'opening',
    value: '2026-04-07',
    matchedText: 'Online application: April 7th, 2026.'
  },
  {
    field: 'opening',
    value: '2026-03-02',
    matchedText: 'Applications open from 2nd March 2026.'
  },
  {
    field: 'closing',
    value: '2026-05-02',
    matchedText: 'Applications are open from March 2, 2026 to May 2, 2026.'
  },
  {
    field: 'fee',
    value: '60',
    matchedText: 'The application fee is EUR 60.'
  }
].map(value => ({
  ...value,
  sourceUrl: 'https://official.example/admission'
}));

const results = cases.map(value => ({
  value: value.value,
  accepted: Boolean(safeEvidence(value))
}));

console.log(JSON.stringify(results, null, 2));
if (results.some(item => !item.accepted)) process.exitCode = 1;
