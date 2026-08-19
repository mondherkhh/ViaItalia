const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send email notification
const sendEmailNotification = async (contactData) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'viaitaliaagency@gmail.com', // Your email
      subject: `Nouveau message de contact - ${contactData.fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(90deg, #00c853, #00e676); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Nouveau Message de Contact</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <div style="margin-bottom: 20px;">
              <h3 style="color: #333; margin: 0 0 10px 0; border-bottom: 2px solid #00c853; padding-bottom: 5px;">Informations du Contact</h3>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #555;">Nom complet:</strong>
              <span style="color: #333; margin-left: 10px;">${contactData.fullName}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #555;">Email:</strong>
              <span style="color: #333; margin-left: 10px;">${contactData.email}</span>
            </div>
            
            ${contactData.phone ? `
            <div style="margin-bottom: 15px;">
              <strong style="color: #555;">Téléphone:</strong>
              <span style="color: #333; margin-left: 10px;">${contactData.phone}</span>
            </div>
            ` : ''}
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #555;">Message:</strong>
              <div style="background: white; padding: 15px; border-radius: 5px; margin-top: 10px; border-left: 4px solid #00c853;">
                <p style="color: #333; margin: 0; line-height: 1.6;">${contactData.message.replace(/\n/g, '<br>')}</p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #666; font-size: 12px; margin: 0;">
                Envoyé le ${new Date(contactData.createdAt).toLocaleString('fr-FR')}
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 20px; background: #f1f3f4; border-radius: 10px;">
            <p style="color: #666; margin: 0; font-size: 14px;">
              Cet email a été envoyé depuis le formulaire de contact de Via Italia
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Email notification sent successfully');
  } catch (error) {
    console.error('Error sending email notification:', error);
    // Don't throw error here, just log it - we still want to save the message
  }
};

// Create a new contact message
const createContactMessage = async (req, res) => {
  try {
    const { fullName, email, phone, message } = req.body;

    // Validation
    if (!fullName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez remplir tous les champs obligatoires'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez entrer une adresse email valide'
      });
    }

    // Create contact message
    const contactMessage = await prisma.contactMessage.create({
      data: {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        message: message.trim()
      }
    });

    // Send email notification
    await sendEmailNotification(contactMessage);

    res.status(201).json({
      success: true,
      message: 'Message envoyé avec succès!',
      data: contactMessage
    });

  } catch (error) {
    console.error('Error creating contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'envoi du message'
    });
  }
};

// Get all contact messages (for admin)
const getAllContactMessages = async (req, res) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      data: messages
    });

  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des messages'
    });
  }
};

// Get single contact message
const getContactMessageById = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await prisma.contactMessage.findUnique({
      where: { id: parseInt(id) }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: message
    });

  } catch (error) {
    console.error('Error fetching contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du message'
    });
  }
};

// Mark message as read
const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await prisma.contactMessage.update({
      where: { id: parseInt(id) },
      data: { isRead: true }
    });

    res.status(200).json({
      success: true,
      message: 'Message marqué comme lu',
      data: message
    });

  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du message'
    });
  }
};

// Delete contact message
const deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.contactMessage.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      message: 'Message supprimé avec succès'
    });

  } catch (error) {
    console.error('Error deleting contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du message'
    });
  }
};

module.exports = {
  createContactMessage,
  getAllContactMessages,
  getContactMessageById,
  markMessageAsRead,
  deleteContactMessage
};
