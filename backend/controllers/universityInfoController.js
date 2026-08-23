const prisma = require("../config/prisma");

// Create university info
const createUniversityInfo = async (req, res) => {
  try {
    console.log('=== CREATE UNIVERSITY INFO DEBUG ===');
    console.log('Request body:', req.body);
    
    const { university, specialty, level } = req.body;

    // Ownership: a non-admin user can only create info for themselves.
    const userId = req.user.role === 'ADMIN' ? req.body.userId : req.user.userId;

    // Validate required fields
    if (!university || !specialty || !level || !userId) {
      console.log('Missing required fields:', { university, specialty, level, userId });
      return res.status(400).json({
        success: false,
        message: 'Champs requis manquants: university, specialty, level, userId',
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

    const universityInfoData = {
      university,
      specialty,
      level,
      userId: parsedUserId
    };
    
    console.log('University info data to create:', universityInfoData);

    const universityInfo = await prisma.universityInfo.create({
      data: universityInfoData,
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

    console.log('University info created successfully:', universityInfo);

    res.status(201).json({
      success: true,
      data: universityInfo
    });
  } catch (error) {
    console.error('=== CREATE UNIVERSITY INFO ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création des informations universitaires',
      error: error.message
    });
  }
};

// Get all university info
const getAllUniversityInfo = async (req, res) => {
  try {
    const universityInfoList = await prisma.universityInfo.findMany({
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
      data: universityInfoList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des informations universitaires',
      error: error.message
    });
  }
};

// Get university info by ID
const getUniversityInfoById = async (req, res) => {
  try {
    const { id } = req.params;

    const universityInfo = await prisma.universityInfo.findUnique({
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

    if (!universityInfo) {
      return res.status(404).json({
        success: false,
        message: 'Informations universitaires non trouvées'
      });
    }

    // Ownership: a non-admin user can only read their own info.
    if (req.user.role !== 'ADMIN' && universityInfo.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - Ces informations ne vous appartiennent pas'
      });
    }

    res.status(200).json({
      success: true,
      data: universityInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des informations universitaires',
      error: error.message
    });
  }
};

// Get university info by user ID
const getUniversityInfoByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const universityInfoList = await prisma.universityInfo.findMany({
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
      data: universityInfoList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des informations universitaires',
      error: error.message
    });
  }
};

// Update university info
const updateUniversityInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { university, specialty, level } = req.body;

    // Ownership: a non-admin user can only update their own info.
    const existing = await prisma.universityInfo.findUnique({
      where: { id: parseInt(id) }
    });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Informations universitaires non trouvées'
      });
    }
    if (req.user.role !== 'ADMIN' && existing.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - Ces informations ne vous appartiennent pas'
      });
    }

    const universityInfoData = {};
    if (university !== undefined) universityInfoData.university = university;
    if (specialty !== undefined) universityInfoData.specialty = specialty;
    if (level !== undefined) universityInfoData.level = level;

    const universityInfo = await prisma.universityInfo.update({
      where: {
        id: parseInt(id)
      },
      data: universityInfoData,
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

    res.status(200).json({
      success: true,
      data: universityInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des informations universitaires',
      error: error.message
    });
  }
};

// Delete university info
const deleteUniversityInfo = async (req, res) => {
  try {
    const { id } = req.params;

    // Ownership: a non-admin user can only delete their own info.
    const existing = await prisma.universityInfo.findUnique({
      where: { id: parseInt(id) }
    });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Informations universitaires non trouvées'
      });
    }
    if (req.user.role !== 'ADMIN' && existing.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - Ces informations ne vous appartiennent pas'
      });
    }

    await prisma.universityInfo.delete({
      where: {
        id: parseInt(id)
      }
    });

    res.status(200).json({
      success: true,
      message: 'Informations universitaires supprimées avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression des informations universitaires',
      error: error.message
    });
  }
};

module.exports = {
  createUniversityInfo,
  getAllUniversityInfo,
  getUniversityInfoById,
  getUniversityInfoByUserId,
  updateUniversityInfo,
  deleteUniversityInfo
};
