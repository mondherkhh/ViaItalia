const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedTimeSlots() {
  try {
    console.log('=== SEEDING TIME SLOTS ===');
    
    // Create some initial time slots for the next few days
    const timeSlots = [
      {
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        startTime: '09:00',
        endTime: '10:00',
        maxBookings: 3,
        currentBookings: 0,
        isAvailable: true
      },
      {
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        startTime: '10:00',
        endTime: '11:00',
        maxBookings: 2,
        currentBookings: 0,
        isAvailable: true
      },
      {
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        startTime: '14:00',
        endTime: '15:00',
        maxBookings: 1,
        currentBookings: 0,
        isAvailable: true
      },
      {
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        startTime: '16:00',
        endTime: '17:00',
        maxBookings: 5,
        currentBookings: 0,
        isAvailable: true
      }
    ];

    // Insert all time slots
    for (const slot of timeSlots) {
      await prisma.timeSlot.create({
        data: slot
      });
      console.log(`Created time slot: ${slot.startTime}-${slot.endTime} on ${slot.date.toDateString()}`);
    }

    console.log(`Successfully created ${timeSlots.length} time slots!`);
    
  } catch (error) {
    console.error('Error seeding time slots:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTimeSlots();
