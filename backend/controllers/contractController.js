const prisma = require('../config/prisma');

// Upload contract (authenticated users)
const uploadContract = async (req, res) => {
  try {
    console.log('=== CONTRACT UPLOAD DEBUG ===');
    console.log('req.user:', req.user);
    console.log('req.file:', req.file);
    
    const { userId } = req.user;
    
    if (!req.file) {
      console.log('No file received');
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un fichier PDF'
      });
    }

    const { originalname: fileName, path: filePath } = req.file;
    console.log('File details:', { fileName, filePath });

    // Check if user already has a contract
    const existingContract = await prisma.contract.findFirst({
      where: { userId: parseInt(userId) }
    });

    if (existingContract) {
      console.log('User already has a contract');
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà téléversé un contrat'
      });
    }

    // Create new contract
    const contract = await prisma.contract.create({
      data: {
        fileName,
        filePath,
        status: 'UPLOADED',
        userId: parseInt(userId)
      }
    });

    console.log('Contract created successfully:', contract);

    res.status(201).json({
      success: true,
      data: contract,
      message: 'Contrat téléversé avec succès'
    });
  } catch (error) {
    console.error('Error uploading contract:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléversement du contrat'
    });
  }
};

// Get contract by user ID (authenticated users)
const getContractByUserId = async (req, res) => {
  try {
    const { userId } = req.user;
    const contract = await prisma.contract.findFirst({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'desc' }
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Aucun contrat trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: contract
    });
  } catch (error) {
    console.error('Error fetching contract:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du contrat'
    });
  }
};

// Get contract by user ID (admin only)
const getContractByUserIdAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const contract = await prisma.contract.findFirst({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'desc' }
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Aucun contrat trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: contract
    });
  } catch (error) {
    console.error('Error fetching contract:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du contrat'
    });
  }
};

// Get all contracts (admin only)
const getAllContracts = async (req, res) => {
  try {
    const contracts = await prisma.contract.findMany({
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
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: contracts
    });
  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des contrats'
    });
  }
};

// Update contract status (admin only)
const updateContractStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'UPLOADED', 'CONFIRMED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }

    // Get contract with user info before updating
    const existingContract = await prisma.contract.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!existingContract) {
      return res.status(404).json({
        success: false,
        message: 'Contrat non trouvé'
      });
    }

    const contract = await prisma.contract.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    // Send email notification to user
    try {
      const emailService = require('../services/emailService');
      const adminName = req.user?.name || 'Administrateur Via Italia';
      const userFullName = `${existingContract.user.firstName} ${existingContract.user.lastName}`.trim();
      
      await emailService.sendContractStatusUpdateEmail(
        existingContract.user.email,
        userFullName || 'Utilisateur',
        existingContract.fileName,
        status,
        adminName
      );
      
      console.log(`Email notification sent to ${existingContract.user.email} for contract status update to ${status}`);
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Continue with response even if email fails
    }

    // Create notification for user
    try {
      const statusText = status === 'CONFIRMED' ? 'approuvé' : status === 'REJECTED' ? 'rejeté' : 'mis à jour';
      const notificationContent = `📄 Votre contrat "${existingContract.fileName}" a été ${statusText}`;
      
      // Get user ID for notification
      const userContract = await prisma.contract.findUnique({
        where: { id: parseInt(id) },
        select: { userId: true }
      });
      
      if (userContract) {
        await prisma.notification.create({
          data: {
            userId: userContract.userId,
            content: notificationContent
          }
        });
        
        console.log(`✅ Contract status notification created for user: ${userContract.userId}`);
      }
    } catch (notificationError) {
      console.error('❌ Error creating contract status notification:', notificationError);
      // Continue with response even if notification fails
    }

    res.status(200).json({
      success: true,
      data: contract,
      message: 'Statut du contrat mis à jour et notification envoyée'
    });
  } catch (error) {
    console.error('Error updating contract status:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut'
    });
  }
};

// Download contract (admin only)
const downloadContract = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await prisma.contract.findUnique({
      where: { id: parseInt(id) }
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contrat non trouvé'
      });
    }

    const filePath = contract.filePath;
    const fs = require('fs');
    
    res.download(filePath, contract.fileName);
  } catch (error) {
    console.error('Error downloading contract:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement'
    });
  }
};

// Delete contract (admin only)
const deleteContract = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await prisma.contract.findUnique({
      where: { id: parseInt(id) }
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contrat non trouvé'
      });
    }

    await prisma.contract.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      message: 'Contrat supprimé avec succès'
    });
  } catch (error) {
    console.error('Error deleting contract:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression'
    });
  }
};

// Get contract status (authenticated users)
const getContractStatus = async (req, res) => {
  try {
    const { userId } = req.user;
    const contract = await prisma.contract.findFirst({
      where: { userId: parseInt(userId) },
      select: { status: true }
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Aucun contrat trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: { status: contract.status }
    });
  } catch (error) {
    console.error('Error fetching contract status:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du statut'
    });
  }
};

module.exports = {
  uploadContract,
  getContractByUserId,
  getContractByUserIdAdmin,
  getAllContracts,
  updateContractStatus,
  downloadContract,
  deleteContract,
  getContractStatus
};
