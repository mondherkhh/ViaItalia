require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const programs = await prisma.universityProgram.findMany({
    where: { id: { in: [5862, 5863, 5864] } },
    select: { id: true, university: true, programName: true },
    orderBy: { id: 'asc' },
  });

  console.log(JSON.stringify(programs, null, 2));
  console.log(`Found ${programs.length} program(s).`);
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
