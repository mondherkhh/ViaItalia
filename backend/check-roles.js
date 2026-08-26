const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserRoles() {
  try {
    console.log('=== CHECKING USER ROLES ===');
    
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true
      }
    });
    
    console.log('All users:');
    allUsers.forEach(user => {
      console.log(`- ID: ${user.id}, Email: "${user.email}", Role: "${user.role}"`);
    });
    
    const userRoleOnly = await prisma.user.findMany({
      where: {
        email: {
          not: ''
        },
        role: 'USER'
      },
      select: {
        id: true,
        email: true,
        role: true
      }
    });
    
    console.log(`\nUsers with USER role only: ${userRoleOnly.length}`);
    userRoleOnly.forEach(user => {
      console.log(`- ID: ${user.id}, Email: "${user.email}", Role: "${user.role}"`);
    });
    
    console.log('=== CHECK COMPLETED ===');
    
  } catch (error) {
    console.error('=== CHECK FAILED ===', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserRoles();
