const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateAppointmentSchema() {
  try {
    console.log('=== UPDATING APPOINTMENT SCHEMA ===');
    
    // Add slotId column to Appointment table if it doesn't exist
    const addColumnSQL = `
      ALTER TABLE Appointment 
      ADD COLUMN slotId INT;
    `;
    
    await prisma.$executeRawUnsafe(addColumnSQL);
    console.log('Added slotId column to Appointment table');
    
  } catch (error) {
    console.error('Error updating appointment schema:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAppointmentSchema();
