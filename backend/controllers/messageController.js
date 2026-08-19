const prisma = require("../config/prisma");
const emailService = require("../services/emailService");

// Create message
const createMessage = async (req, res) => {
  try {
    console.log('=== CREATE MESSAGE DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    
    const { content, sender, userId } = req.body;
    
    // Validate required fields (sender and userId always required)
    if (!sender || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Champs requis manquants',
        error: 'Sender and userId are required'
      });
    }

    // Validate that we have either content or file (or both)
    if (!content && !req.file && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Message ou fichier requis',
        error: 'Content or file is required'
      });
    }

    // Validate sender
    if (sender !== 'USER' && sender !== 'ADMIN') {
      return res.status(400).json({
        success: false,
        message: 'Expéditeur invalide',
        error: 'Sender must be USER or ADMIN'
      });
    }

    // Parse and validate userId
    const parsedUserId = parseInt(userId);
    if (isNaN(parsedUserId)) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur invalide',
        error: 'UserId must be a valid integer'
      });
    }

    // Ownership: a non-admin user can only post in their own thread and cannot
    // impersonate an ADMIN sender.
    if (req.user.role !== 'ADMIN') {
      if (parsedUserId !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé - Vous ne pouvez écrire que dans votre propre messagerie'
        });
      }
      if (sender === 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: "Accès refusé - Vous ne pouvez pas envoyer un message en tant qu'administrateur"
        });
      }
    }

    // Handle file attachment
    let fileData = {};
    console.log('File object:', req.file);
    console.log('Files object:', req.files);
    
    // Check for file in req.files array (from upload.any()) or req.file (fallback)
    let uploadedFile = null;
    
    console.log('File detection - req.files type:', typeof req.files);
    console.log('File detection - req.files isArray:', Array.isArray(req.files));
    console.log('File detection - req.files length:', req.files?.length);
    
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      console.log('Checking req.files array with', req.files.length, 'items');
      // Find file with fieldname 'file' in the array
      uploadedFile = req.files.find(f => f.fieldname === 'file');
      console.log('Found file in req.files array:', uploadedFile ? uploadedFile.originalname : 'Not found');
      if (!uploadedFile) {
        console.log('Available fieldnames:', req.files.map(f => f.fieldname));
      }
    } else if (req.files && req.files.file) {
      // Handle case where req.files.file exists (not array)
      uploadedFile = req.files.file;
      console.log('Found file in req.files.file:', uploadedFile.originalname);
    } else if (req.file) {
      // Fallback to req.file
      uploadedFile = req.file;
      console.log('Found file in req.file:', uploadedFile.originalname);
    } else {
      console.log('No file found in any location');
      console.log('req.files keys:', req.files ? Object.keys(req.files) : 'undefined');
    }
    
    if (uploadedFile) {
      // Handle case where uploadedFile is an array (multiple files)
      const file = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile;
      
      console.log('Uploaded file details:', {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path
      });
      
      fileData = {
        fileName: file.originalname,
        filePath: file.path,
        fileType: file.mimetype,
        fileSize: file.size
      };
      console.log('File attached:', fileData);
    } else if (req.body && req.body.fileName) {
      // Handle case where file info is sent in request body (fallback)
      fileData = {
        fileName: req.body.fileName,
        filePath: req.body.filePath || null,
        fileType: req.body.fileType || null,
        fileSize: req.body.fileSize ? parseInt(req.body.fileSize) : null
      };
      console.log('File data from body:', fileData);
    } else {
      console.log('No file attached - text-only message');
    }

    // Generate default content for file-only messages
    let finalContent;
    if (content && content.trim()) {
      // Use provided content
      finalContent = content.trim();
    } else if (fileData.fileName) {
      // Generate default content for file-only messages
      finalContent = `📎 ${fileData.fileName}`;
    } else {
      finalContent = null;
    }
    
    const messageData = {
      content: finalContent,
      sender,
      userId: parsedUserId,
      ...fileData
    };
    
    console.log('Creating message with data:', messageData);

    // Create message with proper user relation
    const message = await prisma.message.create({
      data: {
        content: finalContent,
        sender,
        fileName: fileData.fileName || null,
        filePath: fileData.filePath || null,
        fileType: fileData.fileType || null,
        fileSize: fileData.fileSize || null,
        user: {
          connect: {
            id: parsedUserId
          }
        }
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

    console.log('Message created successfully:', message);

    // Send email notification if admin sent the message
    if (sender === 'ADMIN') {
      console.log('Admin sent message, sending email notification...');
      
      try {
        const emailResult = await emailService.sendMessageNotification(
          message.user.email,
          `${message.user.firstName} ${message.user.lastName}`,
          'Équipe Via Italia',
          content
        );
        
        if (emailResult.success) {
          console.log('Email notification sent successfully:', emailResult.messageId);
        } else {
          console.error('Failed to send email notification:', emailResult.error);
        }
      } catch (emailError) {
        console.error('Email notification error:', emailError);
        // Don't fail the message creation if email fails
      }

      // Create notification for user
      try {
        const notificationContent = `💬 Nouveau message de l'administrateur: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`;
        
        await prisma.notification.create({
          data: {
            userId: message.user.id,
            content: notificationContent
          }
        });
        
        console.log('✅ Message notification created for user:', message.user.id);
      } catch (notificationError) {
        console.error('❌ Error creating message notification:', notificationError);
        // Don't fail the message creation if notification fails
      }
    }

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('=== CREATE MESSAGE ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du message',
      error: error.message
    });
  }
};

// Get all messages
const getAllMessages = async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
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
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages',
      error: error.message
    });
  }
};

// Get message by ID
const getMessageById = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await prisma.message.findUnique({
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

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }

    // Ownership: a non-admin user can only read their own message.
    if (req.user.role !== 'ADMIN' && message.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - Ce message ne vous appartient pas'
      });
    }

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du message',
      error: error.message
    });
  }
};

// Get messages by user ID
const getMessagesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await prisma.message.findMany({
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
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages',
      error: error.message
    });
  }
};

// Get messages by sender
const getMessagesBySender = async (req, res) => {
  try {
    const { sender } = req.params;

    const messages = await prisma.message.findMany({
      where: {
        sender: sender
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
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages',
      error: error.message
    });
  }
};

// Update message
const updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, sender } = req.body;

    // Ownership: a non-admin user can only update their own message.
    const existingMessage = await prisma.message.findUnique({
      where: { id: parseInt(id) }
    });
    if (!existingMessage) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }
    if (req.user.role !== 'ADMIN' && existingMessage.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - Ce message ne vous appartient pas'
      });
    }

    const messageData = {};
    if (content !== undefined) messageData.content = content;
    if (sender !== undefined) {
      if (!['USER', 'ADMIN'].includes(sender)) {
        return res.status(400).json({
          success: false,
          message: 'Sender doit être USER ou ADMIN',
          error: 'Invalid sender'
        });
      }
      messageData.sender = sender;
    }

    const message = await prisma.message.update({
      where: {
        id: parseInt(id)
      },
      data: messageData,
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
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du message',
      error: error.message
    });
  }
};

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    // Ownership: a non-admin user can only delete their own message.
    const existingMessage = await prisma.message.findUnique({
      where: { id: parseInt(id) }
    });
    if (!existingMessage) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }
    if (req.user.role !== 'ADMIN' && existingMessage.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - Ce message ne vous appartient pas'
      });
    }

    await prisma.message.delete({
      where: {
        id: parseInt(id)
      }
    });

    res.status(200).json({
      success: true,
      message: 'Message supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du message',
      error: error.message
    });
  }
};

module.exports = {
  createMessage,
  getAllMessages,
  getMessageById,
  getMessagesByUserId,
  getMessagesBySender,
  updateMessage,
  deleteMessage
};
