const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addTimeSlotTable() {
  try {
    console.log('Adding TimeSlot table to database...');
    
    // Execute raw SQL to create the table
    const sql = `
      CREATE TABLE IF NOT EXISTS TimeSlot (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date DATETIME NOT NULL,
        startTime VARCHAR(10) NOT NULL,
        endTime VARCHAR(10) NOT NULL,
        maxBookings INT DEFAULT 1,
        currentBookings INT DEFAULT 0,
        isAvailable BOOLEAN DEFAULT TRUE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    await prisma.$executeRawUnsafe(sql);
    console.log('TimeSlot table added successfully!');
    
  } catch (error) {
    console.error('Error adding TimeSlot table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTimeSlotTable();
