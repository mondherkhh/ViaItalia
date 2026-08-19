const prisma = require("../config/prisma");

// In-memory store for time slots (mock database)
let mockTimeSlots = [
  {
    id: 1,
    date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    startTime: '09:00',
    endTime: '10:00',
    maxBookings: 3,
    currentBookings: 2, // Almost full
    isAvailable: true
  },
  {
    id: 2,
    date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    startTime: '10:00',
    endTime: '11:00',
    maxBookings: 2,
    currentBookings: 2, // Full
    isAvailable: false
  },
  {
    id: 3,
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
    startTime: '14:00',
    endTime: '15:00',
    maxBookings: 1,
    currentBookings: 0, // Available
    isAvailable: true
  },
  {
    id: 4,
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    startTime: '16:00',
    endTime: '17:00',
    maxBookings: 5,
    currentBookings: 0, // Available
    isAvailable: true
  }
];

// Create appointment
const createAppointment = async (req, res) => {
  try {
    console.log('=== CREATE APPOINTMENT DEBUG ===');
    console.log('Request body:', req.body);
    
    const { type, date, status, etat, slotId } = req.body;

    // Ownership: a non-admin user can only create an appointment for themselves.
    const userId = req.user.role === 'ADMIN' ? req.body.userId : req.user.userId;

    // Handle time slot booking
    let appointmentDate = date;
    if (slotId) {
      // This is a time slot booking
      console.log('=== TIME SLOT BOOKING ===');
      console.log('Slot ID:', slotId);
      
      // Find the slot in the database
      const slot = await prisma.timeSlot.findUnique({
        where: { id: parseInt(slotId) }
      });
      
      if (!slot) {
        return res.status(404).json({
          success: false,
          message: 'Créneau horaire non trouvé',
          error: 'Time slot not found'
        });
      }
      
      console.log('Found slot:', slot);
      
      // Check if slot is still available
      if (!slot.isAvailable || slot.currentBookings >= slot.maxBookings) {
        return res.status(400).json({
          success: false,
          message: 'Ce créneau horaire n\'est plus disponible',
          error: 'Slot is no longer available'
        });
      }
      
      // Update the slot booking count
      const updatedSlot = await prisma.timeSlot.update({
        where: { id: parseInt(slotId) },
        data: {
          currentBookings: slot.currentBookings + 1,
          isAvailable: (slot.currentBookings + 1) < slot.maxBookings
        }
      });
      
      console.log('Updated slot:', updatedSlot);
      
      appointmentDate = slot.date; // Use the slot's date
    }
    
    // Validate required fields
    if (!type || !appointmentDate || !userId) {
      console.log('Missing required fields:', { type, date: appointmentDate, userId });
      return res.status(400).json({
        success: false,
        message: 'Champs requis manquants: type, date, userId',
        error: 'Validation failed'
      });
    }

    // Validate userId is a number
    const parsedUserId = parseInt(userId);
    if (isNaN(parsedUserId)) {
      console.log('Invalid userId format:', userId);
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur invalide',
        error: 'Invalid userId format'
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: parsedUserId },
      select: { id: true, firstName: true, lastName: true, email: true }
    });

    if (!existingUser) {
      console.log('User not found with ID:', parsedUserId);
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
        error: 'User does not exist'
      });
    }

    console.log('Found user:', existingUser);

    const appointmentData = {
      type,
      date: new Date(appointmentDate),
      status: status || 'PENDING',
      etat: etat || 'PRESENTIEL',
      userId: parsedUserId,
      ...(slotId && { slotId: parseInt(slotId) })
    };
    
    console.log('Appointment data to create:', appointmentData);

    const appointment = await prisma.appointment.create({
      data: appointmentData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    console.log('Appointment created successfully:', appointment);

    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('=== CREATE APPOINTMENT ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du rendez-vous',
      error: error.message
    });
  }
};

// Get all appointments
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des rendez-vous',
      error: error.message
    });
  }
};

// Get appointment by ID
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Rendez-vous non trouvé'
      });
    }

    // Ownership: a non-admin user can only read their own appointment.
    if (req.user.role !== 'ADMIN' && appointment.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - Ce rendez-vous ne vous appartient pas'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du rendez-vous',
      error: error.message
    });
  }
};

// Get appointments by user ID
const getAppointmentsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const appointments = await prisma.appointment.findMany({
      where: {
        userId: parseInt(userId)
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des rendez-vous de l\'utilisateur',
      error: error.message
    });
  }
};

// Update appointment
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, date, status, etat } = req.body;

    // Get the current appointment before updating
    const currentAppointment = await prisma.appointment.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!currentAppointment) {
      return res.status(404).json({
        success: false,
        message: 'Rendez-vous non trouvé'
      });
    }

    // Ownership: a non-admin user can only update their own appointment.
    if (req.user.role !== 'ADMIN' && currentAppointment.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - Ce rendez-vous ne vous appartient pas'
      });
    }

    // Update the appointment
    const appointment = await prisma.appointment.update({
      where: {
        id: parseInt(id)
      },
      data: {
        type,
        date: date ? new Date(date) : undefined,
        status,
        etat
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Send email notification if status or etat changed
    if (status && currentAppointment.status !== status) {
      const emailService = require('../services/emailService');
      try {
        await emailService.sendAppointmentStatusUpdateEmail(
          appointment.user.email,
          `${appointment.user.firstName} ${appointment.user.lastName}`,
          appointment.type,
          appointment.date,
          status,
          appointment.etat,
          'Administrateur Via Italia'
        );
        console.log('✅ Appointment status update email sent to:', appointment.user.email);
      } catch (emailError) {
        console.error('❌ Error sending appointment status update email:', emailError);
        // Don't fail the update if email fails
      }

      // Create notification for user
      try {
        const statusText = status === 'CONFIRMED' ? 'confirmé' : status === 'CANCELLED' ? 'annulé' : 'mis à jour';
        const notificationContent = `📅 Votre rendez-vous "${appointment.type}" a été ${statusText}`;
        
        await prisma.notification.create({
          data: {
            userId: appointment.user.id,
            content: notificationContent
          }
        });
        
        console.log('✅ Appointment status notification created for user:', appointment.user.id);
      } catch (notificationError) {
        console.error('❌ Error creating appointment status notification:', notificationError);
        // Don't fail the update if notification fails
      }
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du rendez-vous',
      error: error.message
    });
  }
};

// Delete appointment
const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('=== DELETE APPOINTMENT DEBUG ===');
    console.log('Appointment ID to delete:', id);

    // First, get the appointment details to check if it has a slotId
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Rendez-vous non trouvé'
      });
    }

    // Ownership: a non-admin user can only delete their own appointment.
    if (req.user.role !== 'ADMIN' && appointment.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - Ce rendez-vous ne vous appartient pas'
      });
    }

    if (appointment && appointment.slotId) {
      console.log('=== RELEASING TIME SLOT ===');
      console.log('Slot ID to release:', appointment.slotId);
      
      // Find the slot in the database
      const slot = await prisma.timeSlot.findUnique({
        where: { id: appointment.slotId }
      });
      
      if (slot) {
        // Decrease the booking count
        const updatedSlot = await prisma.timeSlot.update({
          where: { id: appointment.slotId },
          data: {
            currentBookings: Math.max(0, slot.currentBookings - 1),
            isAvailable: (slot.currentBookings - 1) < slot.maxBookings
          }
        });
        
        console.log('Updated slot after cancellation:', updatedSlot);
      }
    }

    await prisma.appointment.delete({
      where: {
        id: parseInt(id)
      }
    });

    res.status(200).json({
      success: true,
      message: 'Rendez-vous supprimé avec succès'
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du rendez-vous',
      error: error.message
    });
  }
};

// Time slot management functions (simplified for now)
// Create time slot
const createTimeSlot = async (req, res) => {
  try {
    console.log('=== CREATE TIME SLOT DEBUG ===');
    console.log('Request body:', req.body);
    
    const { date, startTime, endTime, maxBookings } = req.body;
    
    // Validate required fields
    if (!date || !startTime || !endTime || !maxBookings) {
      return res.status(400).json({
        success: false,
        message: 'Champs requis manquants: date, startTime, endTime, maxBookings',
        error: 'Validation failed'
      });
    }

    // Validate maxBookings
    const parsedMaxBookings = parseInt(maxBookings);
    if (isNaN(parsedMaxBookings) || parsedMaxBookings < 1 || parsedMaxBookings > 20) {
      return res.status(400).json({
        success: false,
        message: 'Le nombre maximum de réservations doit être entre 1 et 20',
        error: 'Invalid maxBookings'
      });
    }

    // Create time slot in database
    const timeSlotData = {
      date: new Date(date),
      startTime,
      endTime,
      maxBookings: parsedMaxBookings,
      currentBookings: 0,
      isAvailable: true
    };

    console.log('Creating time slot in database:', timeSlotData);

    const newSlot = await prisma.timeSlot.create({
      data: timeSlotData
    });

    console.log('Time slot created successfully:', newSlot);

    res.status(201).json({
      success: true,
      data: newSlot,
      message: 'Créneau horaire créé avec succès'
    });
  } catch (error) {
    console.error('Error creating time slot:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du créneau horaire',
      error: error.message
    });
  }
};

// Get available time slots
const getAvailableSlots = async (req, res) => {
  try {
    console.log('=== GET AVAILABLE SLOTS ===');
    
    const timeSlots = await prisma.timeSlot.findMany({
      where: {
        isAvailable: true,
        date: {
          gte: new Date()
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    console.log('Found time slots in database:', timeSlots);

    res.status(200).json({
      success: true,
      data: timeSlots
    });
  } catch (error) {
    console.error('Error fetching time slots:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des créneaux horaires',
      error: error.message
    });
  }
};

// Delete time slot
const deleteTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Deleting time slot with ID:', id);

    // Check if slot exists
    const existingSlot = await prisma.timeSlot.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingSlot) {
      return res.status(404).json({
        success: false,
        message: 'Créneau horaire non trouvé',
        error: 'Time slot does not exist'
      });
    }

    await prisma.timeSlot.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      message: 'Créneau horaire supprimé avec succès'
    });
  } catch (error) {
    console.error('Error deleting time slot:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du créneau horaire',
      error: error.message
    });
  }
};

// Get time slots by date
const getSlotsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    
    // Return mock slots for the requested date
    const mockSlots = [
      {
        id: 1,
        date: new Date(date),
        startTime: '09:00',
        endTime: '10:00',
        maxBookings: 3,
        currentBookings: 0,
        isAvailable: true
      }
    ];

    res.status(200).json({
      success: true,
      data: mockSlots
    });
  } catch (error) {
    console.error('Error fetching time slots by date:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des créneaux horaires',
      error: error.message
    });
  }
};

module.exports = {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  getAppointmentsByUserId,
  updateAppointment,
  deleteAppointment,
  createTimeSlot,
  getAvailableSlots,
  deleteTimeSlot,
  getSlotsByDate
};
