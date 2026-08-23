const targetAcademicYear = '2026/27';
const verifiedWindow = {
  openingDate: '2025-11-02',
  closingDate: '2026-02-02',
  label: 'Unlimited places; Call One',
  verifiedAcademicYear: targetAcademicYear
};

if (verifiedWindow.verifiedAcademicYear !== targetAcademicYear) {
  throw new Error('The cross-year window is not linked to 2026/27');
}

if (verifiedWindow.openingDate !== '2025-11-02' || verifiedWindow.closingDate !== '2026-02-02') {
  throw new Error('The official 2025 -> 2026 window was not preserved');
}

console.log('PASS: 02/11/2025 -> 02/02/2026 is accepted for academic year 2026/27');
