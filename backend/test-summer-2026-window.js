const targetYear = 2026;
const verifiedWindows = [
  { openingDate: '2026-03-02', closingDate: '2026-05-02', label: 'Call Two' },
  { openingDate: '2026-06-02', closingDate: '2026-08-05', label: 'Call Three' }
];

function belongsToRequestedCycle(window) {
  const openingYear = Number(window.openingDate.slice(0, 4));
  const closingYear = Number(window.closingDate.slice(0, 4));
  return openingYear === targetYear && closingYear === targetYear;
}

if (!verifiedWindows.every(belongsToRequestedCycle)) {
  throw new Error('A valid 2026/27 summer window was rejected');
}

console.log('PASS: 02/06/2026 -> 05/08/2026 is accepted as a verified 2026/27 window');
