const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { getDirectSource } = require('./services/admissionSourceMap');

const prisma = new PrismaClient();

async function main() {
  const catalogue = await prisma.universityProgram.findMany({
    include: {
      admissionWindows: {
        orderBy: [{ openingDate: 'asc' }, { closingDate: 'asc' }, { id: 'asc' }],
      },
    },
    orderBy: [{ closingDate: 'asc' }, { university: 'asc' }, { programName: 'asc' }],
  });

  // This is the exact filter used by universityProgramController.listPrograms.
  const manualPrograms = catalogue.filter((program) =>
    Boolean(getDirectSource(program, { manualOnly: true }))
  );

  const output = {
    exportedAt: new Date().toISOString(),
    programs: manualPrograms,
    meta: {
      programs: manualPrograms.length,
      universities: new Set(manualPrograms.map((row) => row.university)).size,
      admissionWindows: manualPrograms.reduce(
        (total, row) => total + (Array.isArray(row.admissionWindows) ? row.admissionWindows.length : 0),
        0
      ),
    },
  };

  fs.writeFileSync(
    'local-manual-programs.json',
    JSON.stringify(output, null, 2),
    'utf8'
  );

  console.log('PROGRAMS=' + output.meta.programs);
  console.log('UNIVERSITIES=' + output.meta.universities);
  console.log('ADMISSION_WINDOWS=' + output.meta.admissionWindows);
  console.log('FILE=local-manual-programs.json');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
