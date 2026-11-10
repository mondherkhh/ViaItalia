const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

prisma.user.findMany({
  select: {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    role: true,
    isApproved: true
  }
})
.then(users => console.table(users))
.catch(console.error)
.finally(() => prisma.$disconnect());
