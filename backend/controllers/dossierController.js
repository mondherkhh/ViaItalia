const { PrismaClient } = require('@prisma/client');
const emailService = require('../services/emailService');
const prisma = new PrismaClient();

// Create a new dossier
const createDossier = async (req, res) => {
  try {
    const { 
      title, 
      userId, 
      status = 'PENDING',
      traductionStatus = 'EN_COURS',
      inscriptionStatus = 'EN_COURS', 
      visaStatus = 'EN_COURS'
    } = req.body;
    
    // Get user information to generate automatic title if no title provided
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { firstName: true, lastName: true, email: true }
    });
    
    let finalTitle = title;
    if (!title || title.trim() === '') {
      // Generate automatic title from user information
      const userName = user ? `${user.firstName} ${user.lastName}` : 'Utilisateur';
      finalTitle = `Dossier de ${userName}`;
    }
    
    const dossier = await prisma.dossier.create({
      data: {
        title: finalTitle,
        userId: parseInt(userId),
        status,
        traductionStatus,
        inscriptionStatus,
        visaStatus
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

    res.status(201).json({
      success: true,
      message: "Dossier created successfully",
      data: dossier
    });
  } catch (error) {
    console.error("Error creating dossier:", error);
    res.status(500).json({
      success: false,
      message: "Error creating dossier",
      error: error.message
    });
  }
};

// Create missing dossiers for existing users (admin function)
const createMissingDossiers = async (req, res) => {
  try {
    // Get all users who don't have a dossier
    const usersWithoutDossiers = await prisma.user.findMany({
      where: {
        role: 'USER',
        dossiers: {
          none: {}
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    });

    let createdCount = 0;
    const errors = [];

    // Create dossier for each user without one
    for (const user of usersWithoutDossiers) {
      try {
        // Generate automatic title from user information
        const userName = `${user.firstName} ${user.lastName}`;
        const dossierTitle = `Dossier de ${userName}`;
        
        await prisma.dossier.create({
          data: {
            title: dossierTitle,
            status: 'PENDING',
            userId: user.id
          }
        });
        createdCount++;
        console.log(`Created dossier for user: ${user.firstName} ${user.lastName} (${user.email}) with title: ${dossierTitle}`);
      } catch (error) {
        console.error(`Error creating dossier for user ${user.id}:`, error);
        errors.push({
          userId: user.id,
          email: user.email,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Created ${createdCount} dossiers for existing users`,
      data: {
        usersProcessed: usersWithoutDossiers.length,
        dossiersCreated: createdCount,
        errors: errors.length > 0 ? errors : null
      }
    });
  } catch (error) {
    console.error("Error creating missing dossiers:", error);
    res.status(500).json({
      success: false,
      message: "Error creating missing dossiers",
      error: error.message
    });
  }
};

// Get all dossiers
const getAllDossiers = async (req, res) => {
  try {
    const dossiers = await prisma.dossier.findMany({
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
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      data: dossiers
    });
  } catch (error) {
    console.error("Error fetching dossiers:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dossiers",
      error: error.message
    });
  }
};

// Get dossier by ID
const getDossierById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate id parameter
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Dossier ID is required"
      });
    }
    
    const dossierId = parseInt(id);
    if (isNaN(dossierId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid dossier ID format"
      });
    }
    
    const dossier = await prisma.dossier.findUnique({
      where: {
        id: dossierId
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

    if (!dossier) {
      return res.status(404).json({
        success: false,
        message: "Dossier not found"
      });
    }

    res.status(200).json({
      success: true,
      data: dossier
    });
  } catch (error) {
    console.error("Error fetching dossier:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dossier",
      error: error.message
    });
  }
};

// Update dossier
const updateDossier = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, status, traductionStatus, inscriptionStatus, visaStatus } = req.body;
    
    // Get current dossier to check existing statuses
    const currentDossier = await prisma.dossier.findUnique({
      where: { id: parseInt(id) }
    });

    if (!currentDossier) {
      return res.status(404).json({
        success: false,
        message: "Dossier not found"
      });
    }

    // Check if this is a restart operation (all statuses being set to initial values)
    const isRestartOperation = (
      status === 'PENDING' &&
      traductionStatus === 'EN_COURS' && 
      inscriptionStatus === 'EN_COURS' && 
      visaStatus === 'EN_COURS'
    );

    // Validation: Step-by-step progression required (skip for restart operations)
    if (!isRestartOperation) {
      // Cannot update inscription status unless traduction status is VALIDE
      if (inscriptionStatus && currentDossier.traductionStatus !== 'VALIDE') {
        return res.status(400).json({
          success: false,
          message: "Cannot update inscription status until traduction status is VALIDE"
        });
      }

      // Cannot update visa status unless inscription status is VALIDE
      if (visaStatus && currentDossier.inscriptionStatus !== 'VALIDE') {
        return res.status(400).json({
          success: false,
          message: "Cannot update visa status until inscription status is VALIDE"
        });
      }

      // Cannot update traduction status if visa status is VALIDE (to prevent going backwards)
      if (traductionStatus && currentDossier.visaStatus === 'VALIDE') {
        return res.status(400).json({
          success: false,
          message: "Cannot update traduction status when visa status is already VALIDE"
        });
      }
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (status !== undefined) updateData.status = status;
    if (traductionStatus !== undefined) updateData.traductionStatus = traductionStatus;
    if (inscriptionStatus !== undefined) updateData.inscriptionStatus = inscriptionStatus;
    if (visaStatus !== undefined) updateData.visaStatus = visaStatus;

    const dossier = await prisma.dossier.update({
      where: {
        id: parseInt(id)
      },
      data: updateData,
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

    // Send email notifications for status changes
    try {
      const { user } = dossier;
      
      // Check for traduction status change
      if (traductionStatus && traductionStatus !== currentDossier.traductionStatus) {
        await emailService.sendDossierStatusUpdateEmail(
          user.email,
          `${user.firstName} ${user.lastName}`,
          dossier.title,
          'traduction',
          traductionStatus,
          currentDossier.traductionStatus
        );
      }
      
      // Check for inscription status change
      if (inscriptionStatus && inscriptionStatus !== currentDossier.inscriptionStatus) {
        await emailService.sendDossierStatusUpdateEmail(
          user.email,
          `${user.firstName} ${user.lastName}`,
          dossier.title,
          'inscription',
          inscriptionStatus,
          currentDossier.inscriptionStatus
        );
      }
      
      // Check for visa status change
      if (visaStatus && visaStatus !== currentDossier.visaStatus) {
        await emailService.sendDossierStatusUpdateEmail(
          user.email,
          `${user.firstName} ${user.lastName}`,
          dossier.title,
          'visa',
          visaStatus,
          currentDossier.visaStatus
        );
      }
      
      console.log('Email notifications sent for dossier status updates');
    } catch (emailError) {
      console.error('Error sending email notifications:', emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: "Dossier updated successfully",
      data: dossier
    });
  } catch (error) {
    console.error("Error updating dossier:", error);
    res.status(500).json({
      success: false,
      message: "Error updating dossier",
      error: error.message
    });
  }
};

// Delete dossier
const deleteDossier = async (req, res) => {
  try {
    const { id } = req.params;
    
    const dossier = await prisma.dossier.delete({
      where: {
        id: parseInt(id)
      }
    });

    res.status(200).json({
      success: true,
      message: "Dossier deleted successfully",
      data: dossier
    });
  } catch (error) {
    console.error("Error deleting dossier:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting dossier",
      error: error.message
    });
  }
};

// Get dossiers by user ID
const getDossiersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const dossiers = await prisma.dossier.findMany({
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
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      data: dossiers
    });
  } catch (error) {
    console.error("Error fetching user dossiers:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user dossiers",
      error: error.message
    });
  }
};

// Get single dossier by user ID
const getDossierByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const dossier = await prisma.dossier.findFirst({
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
        createdAt: 'desc'
      }
    });

    if (!dossier) {
      return res.status(404).json({
        success: false,
        message: "Dossier not found for this user"
      });
    }

    res.status(200).json({
      success: true,
      data: dossier
    });
  } catch (error) {
    console.error("Error fetching user dossier:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user dossier",
      error: error.message
    });
  }
};

// Get dossier statistics
const getDossierStats = async (req, res) => {
  try {
    const totalDossiers = await prisma.dossier.count();
    const pendingDossiers = await prisma.dossier.count({
      where: { status: 'PENDING' }
    });
    const approvedDossiers = await prisma.dossier.count({
      where: { status: 'VALIDATED' }
    });
    const rejectedDossiers = await prisma.dossier.count({
      where: { status: 'REJECTED' }
    });

    res.status(200).json({
      success: true,
      data: {
        totalDossiers,
        pendingDossiers,
        approvedDossiers,
        rejectedDossiers
      }
    });
  } catch (error) {
    console.error("Error fetching dossier stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dossier stats",
      error: error.message
    });
  }
};

module.exports = {
  createDossier,
  createMissingDossiers,
  getAllDossiers,
  getDossierById,
  updateDossier,
  deleteDossier,
  getDossiersByUserId,
  getDossierByUserId,
  getDossierStats
};
