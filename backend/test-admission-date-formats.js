require('dotenv').config();
const { extractValues } = require('./services/officialAdmissionsEnricher');

const cases = [
  {
    name: 'Firenze intake',
    text: '2026/2027 Academic Year Intake Rounds. First intake: from December 10, 2025 to February 6, 2026. Second intake: from February 16 to April 17, 2026. Third intake: from June 15 to August 31, 2026.'
  },
  {
    name: 'Napoli Italian PDF table',
    text: 'A.A. 2026-2027 Calendario ammissioni laurea magistrale. Prima scadenza dal 01/07/2026 al 31/08/2026. Seconda scadenza dal 01/09/2026 al 27/09/2026. Terza scadenza dal 28/09/2026 al 31/10/2026.'
  },
  {
    name: 'Padova named call',
    text: 'Timeline Degree programmes. Call Two: March 2 - May 2, 2026.'
  },
  {
    name: 'Ca Foscari sessions',
    text: 'There are three evaluation sessions. 1st session online application: April 7th - June 4th, 2026. 2nd session online application: July 6th - August 20th, 2026. 3rd session online application: October 1st - November 17th, 2026.'
  }
];

for (const item of cases) {
  const result = extractValues(item.text);
  console.log(JSON.stringify({ name: item.name, openingDates: result.openingDates, closingDates: result.closingDates }, null, 2));
}
