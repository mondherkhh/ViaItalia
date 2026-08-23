const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Create announcement
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, type, link, selectedUsers = [], isActive = true } = req.body;
    
    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Champs requis manquants',
        error: 'Title and content are required'
      });
    }

    // Validate type if provided
    const validTypes = ['INFO', 'SUCCESS', 'WARNING', 'URGENT'];
    if (type && !validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type d\'annonce invalide',
        error: 'Type must be INFO, SUCCESS, WARNING, or URGENT'
      });
    }

    // Create announcement
    const announcementData = {
      title,
      content,
      type: type || 'INFO',
      link: link || null,
      isActive: true
    };
    
    console.log('Creating announcement with data:', announcementData);
    
    const announcement = await prisma.announcement.create({
      data: announcementData
    });

    console.log('Announcement created successfully:', announcement);

    // Send email notification to selected users and create database records
    console.log('=== SENDING ANNOUNCEMENT EMAIL NOTIFICATION ===');
    console.log('=== SELECTED USERS ===', selectedUsers);
    
    try {
      // Get users based on selection
      let users;
      if (selectedUsers.length > 0) {
        // Get only selected users
        users = await prisma.user.findMany({
          where: {
            id: {
              in: selectedUsers
            },
            email: {
              not: ''
            },
            role: 'USER'
          }
        });
        console.log(`Found ${users.length} selected users to notify`);
      } else {
        // If no users selected, get all users (fallback behavior)
        users = await prisma.user.findMany({
          where: {
            email: {
              not: ''
            },
            role: 'USER'
          }
        });
        console.log(`No users selected, notifying all ${users.length} users`);
      }

      // Create UserAnnouncement records for all users
      const userAnnouncementData = users.map(user => ({
        userId: user.id,
        announcementId: announcement.id
      }));

      await prisma.userAnnouncement.createMany({
        data: userAnnouncementData
      });

      console.log(`Created ${userAnnouncementData.length} user-announcement records`);

      // Create notifications for all users
      const notificationContent = `📢 Nouvelle annonce: ${announcement.title}`;
      const notificationData = users.map(user => ({
        userId: user.id,
        content: notificationContent
      }));

      await prisma.notification.createMany({
        data: notificationData
      });

      console.log(`Created ${notificationData.length} notifications`);

      // Send email notifications
      const emailService = require('../services/emailService');
      const emailResult = await emailService.sendAnnouncementNotification(
        announcement.title,
        announcement.content,
        announcement.type,
        announcement.link,
        selectedUsers
      );
      
      if (emailResult.success) {
        console.log('Announcement email notifications sent successfully:', emailResult);
      } else {
        console.error('Failed to send announcement email notifications:', emailResult.error);
      }
    } catch (emailError) {
      console.error('Email notification error:', emailError);
      // Don't fail the announcement creation if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Annonce créée avec succès',
      data: announcement
    });

  } catch (error) {
    console.error('=== CREATE ANNOUNCEMENT ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'annonce',
      error: error.message
    });
  }
};

// Get all announcements
const getAllAnnouncements = async (req, res) => {
  try {
    console.log('=== GET ALL ANNOUNCEMENTS DEBUG ===');
    
    const announcements = await prisma.announcement.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${announcements.length} announcements`);

    res.status(200).json({
      success: true,
      message: 'Annonces récupérées avec succès',
      data: announcements
    });

  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des annonces',
      error: error.message
    });
  }
};

// Get active announcements only (for users)
const getActiveAnnouncements = async (req, res) => {
  try {
    console.log('=== GET ACTIVE ANNOUNCEMENTS DEBUG ===');
    
    const announcements = await prisma.announcement.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${announcements.length} active announcements`);

    res.status(200).json({
      success: true,
      message: 'Annonces actives récupérées avec succès',
      data: announcements
    });

  } catch (error) {
    console.error('Error fetching active announcements:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des annonces actives',
      error: error.message
    });
  }
};

// Get announcement by ID
const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const announcementId = parseInt(id);
    if (isNaN(announcementId)) {
      return res.status(400).json({
        success: false,
        message: 'ID d\'annonce invalide',
        error: 'ID must be a valid integer'
      });
    }

    const announcement = await prisma.announcement.findUnique({
      where: {
        id: announcementId
      }
    });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée',
        error: 'Announcement not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Annonce récupérée avec succès',
      data: announcement
    });

  } catch (error) {
    console.error('Error fetching announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'annonce',
      error: error.message
    });
  }
};

// Update announcement
const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, link, isActive } = req.body;
    
    const announcementId = parseInt(id);
    if (isNaN(announcementId)) {
      return res.status(400).json({
        success: false,
        message: 'ID d\'annonce invalide',
        error: 'ID must be a valid integer'
      });
    }

    // Check if announcement exists
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: {
        id: announcementId
      }
    });

    if (!existingAnnouncement) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée',
        error: 'Announcement not found'
      });
    }

    // Validate type if provided
    if (type) {
      const validTypes = ['INFO', 'SUCCESS', 'WARNING', 'URGENT'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Type d\'annonce invalide',
          error: 'Type must be INFO, SUCCESS, WARNING, or URGENT'
        });
      }
    }

    const announcementData = {
      title: title ? title.trim() : existingAnnouncement.title,
      content: content ? content.trim() : existingAnnouncement.content,
      type: type || existingAnnouncement.type,
      link: link || existingAnnouncement.link,
      isActive: isActive !== undefined ? isActive : existingAnnouncement.isActive
    };

    const announcement = await prisma.announcement.update({
      where: {
        id: announcementId
      },
      data: announcementData
    });

    console.log('Announcement updated successfully:', announcement);

    res.status(200).json({
      success: true,
      message: 'Annonce mise à jour avec succès',
      data: announcement
    });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'annonce',
      error: error.message
    });
  }
};

// Delete announcement
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    // ...
    const announcementId = parseInt(id);
    if (isNaN(announcementId)) {
      return res.status(400).json({
        success: false,
        message: 'ID d\'annonce invalide',
        error: 'ID must be a valid integer'
      });
    }

    // Check if announcement exists
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: {
        id: announcementId
      }
    });

    if (!existingAnnouncement) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée',
        error: 'Announcement not found'
      });
    }

    await prisma.announcement.delete({
      where: {
        id: announcementId
      }
    });

    console.log('Announcement deleted successfully:', announcementId);

    res.status(200).json({
      success: true,
      message: 'Annonce supprimée avec succès'
    });

  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'annonce',
      error: error.message
    });
  }
};

// Toggle announcement active status
const toggleAnnouncementStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const announcementId = parseInt(id);
    if (isNaN(announcementId)) {
      return res.status(400).json({
        success: false,
        message: 'ID d\'annonce invalide',
        error: 'ID must be a valid integer'
      });
    }

    // Check if announcement exists
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: {
        id: announcementId
      }
    });

    if (!existingAnnouncement) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée',
        error: 'Announcement not found'
      });
    }

    const announcement = await prisma.announcement.update({
      where: {
        id: announcementId
      },
      data: {
        isActive: !existingAnnouncement.isActive
      }
    });

    console.log('Announcement status toggled successfully:', announcement);

    res.status(200).json({
      success: true,
      message: `Annonce ${announcement.isActive ? 'activée' : 'désactivée'} avec succès`,
      data: announcement
    });

  } catch (error) {
    console.error('Error toggling announcement status:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du statut de l\'annonce',
      error: error.message
    });
  }
};

module.exports = {
  createAnnouncement,
  getAllAnnouncements,
  getActiveAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementStatus
};
