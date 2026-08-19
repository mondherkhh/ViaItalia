const nodemailer = require('nodemailer');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS.replace(/\s/g, '') // Remove spaces from app password
  },
  tls: {
    rejectUnauthorized: false // Allow self-signed certificates
  }
});

// Log email configuration (without exposing the full password)
console.log('=== EMAIL SERVICE CONFIGURATION ===');
console.log('Email User:', process.env.EMAIL_USER);
console.log('Email Host:', process.env.EMAIL_HOST);
console.log('Email Port:', process.env.EMAIL_PORT);
console.log('Email Pass (first 4 chars):', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s/g, '').substring(0, 4) + '...' : 'Not set');
console.log('====================================');

const emailService = {
  // Send notification email for new message
  sendMessageNotification: async (userEmail, userName, adminName, messageContent) => {
    try {
      console.log('=== SENDING MESSAGE NOTIFICATION EMAIL ===');
      console.log('To:', userEmail);
      console.log('User:', userName);
      console.log('Admin:', adminName);
      console.log('Message preview:', messageContent.substring(0, 50) + '...');

      const mailOptions = {
        from: process.env.EMAIL_USER || '"Via Italia" <viaitaliaagency@gmail.com<>',
        to: userEmail,
        subject: '📬 Nouveau message de Via Italia',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Nouveau message - Via Italia</title>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f5f5f5;
                margin: 0;
                padding: 20px;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                border-radius: 15px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
              }
              .header {
                background: linear-gradient(135deg, #e74c3c 0%, #27ae60 100%);
                padding: 30px;
                text-align: center;
                color: white;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
              }
              .header p {
                margin: 10px 0 0 0;
                font-size: 16px;
                opacity: 0.9;
              }
              .content {
                padding: 40px 30px;
              }
              .message-preview {
                background: #f8f9fa;
                border-left: 4px solid #00ff33;
                padding: 20px;
                margin: 25px 0;
                border-radius: 8px;
                font-style: italic;
                color: #666;
              }
              .message-preview strong {
                color: #333;
                font-style: normal;
              }
              .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #e74c3c 0%, #27ae60 100%);
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 25px;
                font-weight: 600;
                margin: 20px 0;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
              }
              .cta-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 255, 51, 0.3);
              }
              .footer {
                background: #f8f9fa;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e9ecef;
              }
              .footer p {
                margin: 5px 0;
                color: #666;
                font-size: 14px;
              }
              .contact-info {
                background: linear-gradient(135deg, rgba(0, 255, 51, 0.1) 0%, rgba(239, 68, 68, 0.1) 100%);
                padding: 20px;
                margin: 25px 0;
                border-radius: 8px;
                border: 1px solid rgba(0, 255, 51, 0.2);
              }
              .contact-info h3 {
                color: #00ff33;
                margin: 0 0 15px 0;
                font-size: 18px;
              }
              .contact-info p {
                margin: 8px 0;
                color: #666;
              }
              @media (max-width: 600px) {
                .container {
                  margin: 10px;
                  border-radius: 10px;
                }
                .header {
                  padding: 20px;
                }
                .header h1 {
                  font-size: 24px;
                }
                .content {
                  padding: 30px 20px;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📬 Nouveau Message Reçu</h1>
                <p>Via Italia - Service d'Orientation Universitaire</p>
              </div>
              
              <div class="content">
                <p>Bonjour <strong>${userName}</strong>,</p>
                
                <p>Vous avez reçu un nouveau message de la part de <strong>${adminName}</strong> de l'équipe Via Italia.</p>
                
                <div class="message-preview">
                  <strong>Message :</strong><br>
                  "${messageContent}"
                </div>
                
                <p>Connectez-vous à votre espace personnel pour répondre à ce message et continuer la conversation.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://viaitalia.fr/login" class="cta-button">
                    🚀 Accéder à mon espace
                  </a>
                </div>
                
                <div class="contact-info">
                  <h3>📞 Besoin d'aide ?</h3>
                  <p><strong>Email :</strong> viaitaliaagency@gmail.com<</p>
                  <p><strong>Téléphone :</strong> +216 22 552 722</p>
                  <p><strong>Heures d'ouverture :</strong> Lun-Ven: 9h-18h, Sam: 10h-16h</p>
                </div>
                
                <p>Nous sommes là pour vous accompagner dans votre projet d'études en Italie !</p>
                
                <p>Cordialement,<br>
                <strong>L'équipe Via Italia</strong></p>
              </div>
              
              <div class="footer">
                <p>© 2024 Via Italia - Tous droits réservés</p>
                <p>Service d'orientation universitaire pour les études en Italie</p>
                <p style="font-size: 12px; color: #999;">
                  Si vous ne souhaitez plus recevoir ces notifications, 
                  <a href="https://viaitalia.fr/unsubscribe" style="color: #999;">cliquez ici</a>
                </p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Message notification email sent successfully:', result.messageId);
      
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('=== EMAIL NOTIFICATION ERROR ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Send notification email for contract status update
  sendContractStatusUpdateEmail: async (userEmail, userName, contractFileName, newStatus, adminName) => {
    try {
      console.log('=== SENDING CONTRACT STATUS UPDATE EMAIL ===');
      console.log('To:', userEmail);
      console.log('User:', userName);
      console.log('Contract:', contractFileName);
      console.log('New Status:', newStatus);
      console.log('Admin:', adminName);

      const getStatusText = (status) => {
        switch (status) {
          case 'PENDING': return '⏳ En Attente';
          case 'UPLOADED': return '📤 Téléversé';
          case 'CONFIRMED': return '✅ Confirmé';
          case 'REJECTED': return '❌ Rejeté';
          default: return status;
        }
      };

      const getStatusColor = (status) => {
        switch (status) {
          case 'PENDING': return '#d68910';
          case 'UPLOADED': return '#1d8348';
          case 'CONFIRMED': return '#229954';
          case 'REJECTED': return '#c0392b';
          default: return '#6c757d';
        }
      };

      const getActionMessage = (status) => {
        switch (status) {
          case 'CONFIRMED':
            return `
              <div style="background-color: #d4edda; border-left: 4px solid #229954; padding: 20px; margin: 25px 0; border-radius: 8px;">
                <h3 style="color: #155724; margin: 0 0 10px 0;">🎉 Félicitations!</h3>
                <p style="margin: 0; color: #155724;">Votre contrat a été confirmé avec succès. Vous pouvez maintenant procéder aux étapes suivantes de votre inscription.</p>
              </div>
            `;
          case 'REJECTED':
            return `
              <div style="background-color: #f8d7da; border-left: 4px solid #c0392b; padding: 20px; margin: 25px 0; border-radius: 8px;">
                <h3 style="color: #721c24; margin: 0 0 10px 0;">⚠️ Action requise</h3>
                <p style="margin: 0; color: #721c24;">Votre contrat a été rejeté. Veuillez vérifier les informations fournies et soumettre un nouveau contrat si nécessaire.</p>
              </div>
            `;
          case 'PENDING':
            return `
              <div style="background-color: #fff3cd; border-left: 4px solid #d68910; padding: 20px; margin: 25px 0; border-radius: 8px;">
                <h3 style="color: #856404; margin: 0 0 10px 0;">⏳ En cours de traitement</h3>
                <p style="margin: 0; color: #856404;">Votre contrat est en attente de validation par notre équipe administrative.</p>
              </div>
            `;
          case 'UPLOADED':
            return `
              <div style="background-color: #d1ecf1; border-left: 4px solid #1d8348; padding: 20px; margin: 25px 0; border-radius: 8px;">
                <h3 style="color: #0c5460; margin: 0 0 10px 0;">📤 Document reçu</h3>
                <p style="margin: 0; color: #0c5460;">Votre contrat a bien été reçu et est en cours d'examen.</p>
              </div>
            `;
          default:
            return '';
        }
      };

      const mailOptions = {
        from: process.env.EMAIL_USER || '"Via Italia" <viaitaliaagency@gmail.com>',
        to: userEmail,
        subject: '📄 Mise à jour du statut de votre contrat - Viaitalia',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Mise à jour du contrat - Via Italia</title>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f5f5f5;
                margin: 0;
                padding: 20px;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                border-radius: 15px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
              }
              .header {
                background: linear-gradient(135deg, #e74c3c 0%, #27ae60 100%);
                padding: 30px;
                text-align: center;
                color: white;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
              }
              .header p {
                margin: 10px 0 0 0;
                font-size: 16px;
                opacity: 0.9;
              }
              .content {
                padding: 40px 30px;
              }
              .status-badge {
                display: inline-block;
                padding: 12px 20px;
                border-radius: 25px;
                font-weight: bold;
                text-transform: uppercase;
                font-size: 16px;
                margin: 20px 0;
                background-color: ${getStatusColor(newStatus)};
                color: white;
                text-align: center;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .info-box {
                background-color: #e9ecef;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #e74c3c;
              }
              .info-box h3 {
                margin: 0 0 15px 0;
                color: #e74c3c;
                font-size: 18px;
              }
              .info-box ul {
                margin: 0;
                padding-left: 20px;
              }
              .info-box li {
                margin: 8px 0;
                color: #495057;
              }
              .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #e74c3c 0%, #27ae60 100%);
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 25px;
                font-weight: 600;
                margin: 20px 0;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                box-shadow: 0 4px 6px rgba(0, 255, 51, 0.3);
              }
              .cta-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 12px rgba(0, 255, 51, 0.4);
              }
              .footer {
                background: #f8f9fa;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #dee2e6;
                color: #6c757d;
                font-size: 14px;
              }
              .footer p {
                margin: 5px 0;
              }
              @media (max-width: 600px) {
                .container {
                  margin: 10px;
                  border-radius: 10px;
                }
                .header {
                  padding: 20px;
                }
                .header h1 {
                  font-size: 24px;
                }
                .content {
                  padding: 30px 20px;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📄 Mise à jour de Contrat</h1>
                <p>Via Italia - Service d'Orientation Universitaire</p>
              </div>
              
              <div class="content">
                <p>Bonjour <strong>${userName}</strong>,</p>
                
                <p>Nous vous informons que le statut de votre contrat <strong>"${contractFileName}"</strong> a été mis à jour par notre équipe administrative.</p>
                
                <div style="text-align: center; margin: 25px 0;">
                  <div class="status-badge">
                    ${getStatusText(newStatus)}
                  </div>
                </div>
                
                <div class="info-box">
                  <h3>📋 Détails de la mise à jour:</h3>
                  <ul>
                    <li><strong>Nom du fichier:</strong> ${contractFileName}</li>
                    <li><strong>Nouveau statut:</strong> ${getStatusText(newStatus)}</li>
                    <li><strong>Mis à jour par:</strong> ${adminName}</li>
                    <li><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</li>
                  </ul>
                </div>
                
                ${getActionMessage(newStatus)}
                
                <div style="text-align: center;">
                  <a href="https://viaitalia.fr/login" class="cta-button">
                    🚀 Accéder à mon tableau de bord
                  </a>
                </div>
                
                <p>Nous sommes là pour vous accompagner dans votre projet d'études en Italie!</p>
                
                <p>Cordialement,<br>
                <strong>L'équipe Via Italia</strong></p>
              </div>
              
              <div class="footer">
                <p>© 2024 Via Italia - Tous droits réservés</p>
                <p>Service d'orientation universitaire pour les études en Italie</p>
                <p style="font-size: 12px; color: #999;">
                  Si vous ne souhaitez plus recevoir ces notifications, 
                  <a href="https://viaitalia.fr/unsubscribe" style="color: #999;">cliquez ici</a>
                </p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Contract status update email sent successfully:', result.messageId);
      
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('=== CONTRACT STATUS EMAIL ERROR ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Send confirmation email for study form submission
  sendStudyFormConfirmationEmail: async (formData) => {
    try {
      console.log('=== SENDING STUDY FORM CONFIRMATION EMAIL ===');
      console.log('To:', formData.email);
      console.log('Name:', formData.fullName);
      console.log('Pack:', formData.selectedPack);

      const getPackDisplayName = (packId) => {
        switch(packId) {
          case 'essential': return 'Pack Essentiel';
          case 'advanced': return 'Pack Avancé';
          case 'premium': return 'Pack Premium';
          default: return packId;
        }
      };

      const getPackPrice = (packId) => {
        switch(packId) {
          case 'essential': return '1999 DT';
          case 'advanced': return '2999 DT';
          case 'premium': return '3999 DT';
          default: return '';
        }
      };

      const mailOptions = {
        from: process.env.EMAIL_USER || '"Via Italia" <viaitaliaagency@gmail.com<>',
        to: formData.email,
        subject: '🎓 Confirmation de votre demande d\'études en Italie - Via Italia',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirmation de Demande - Via Italia</title>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f5f5f5;
                margin: 0;
                padding: 20px;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                border-radius: 15px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
              }
              .header {
                background: linear-gradient(135deg, #e74c3c 0%, #27ae60 100%);
                padding: 30px;
                text-align: center;
                color: white;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
              }
              .header p {
                margin: 10px 0 0 0;
                font-size: 16px;
                opacity: 0.9;
              }
              .content {
                padding: 40px 30px;
              }
              .success-box {
                background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
                border-left: 4px solid #28a745;
                padding: 25px;
                margin: 25px 0;
                border-radius: 8px;
                text-align: center;
              }
              .success-box h3 {
                color: #155724;
                margin: 0 0 15px 0;
                font-size: 20px;
              }
              .success-box p {
                color: #155724;
                margin: 0;
                font-size: 16px;
              }
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin: 25px 0;
              }
              .info-item {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                border-left: 3px solid #e74c3c;
              }
              .info-item h4 {
                margin: 0 0 8px 0;
                color: #e74c3c;
                font-size: 14px;
                text-transform: uppercase;
                font-weight: 600;
              }
              .info-item p {
                margin: 0;
                color: #333;
                font-size: 16px;
                font-weight: 500;
              }
              .pack-highlight {
                background: linear-gradient(135deg, rgba(231, 76, 60, 0.1) 0%, rgba(39, 174, 96, 0.1) 100%);
                border: 2px solid #e74c3c;
                padding: 25px;
                margin: 30px 0;
                border-radius: 12px;
                text-align: center;
              }
              .pack-name {
                font-size: 24px;
                font-weight: 700;
                color: #e74c3c;
                margin: 0 0 10px 0;
              }
              .pack-price {
                font-size: 28px;
                font-weight: 800;
                color: #27ae60;
                margin: 0 0 15px 0;
              }
              .payment-info {
                background: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 20px;
                margin: 25px 0;
                border-radius: 8px;
              }
              .payment-info h4 {
                color: #856404;
                margin: 0 0 15px 0;
                font-size: 18px;
              }
              .payment-info p {
                color: #856404;
                margin: 8px 0;
                font-size: 14px;
              }
              .contact-info {
                background: linear-gradient(135deg, rgba(0, 255, 51, 0.1) 0%, rgba(239, 68, 68, 0.1) 100%);
                padding: 20px;
                margin: 25px 0;
                border-radius: 8px;
                border: 1px solid rgba(0, 255, 51, 0.2);
              }
              .contact-info h3 {
                color: #00ff33;
                margin: 0 0 15px 0;
                font-size: 18px;
              }
              .contact-info p {
                margin: 8px 0;
                color: #666;
              }
              .footer {
                background: #f8f9fa;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e9ecef;
              }
              .footer p {
                margin: 5px 0;
                color: #666;
                font-size: 14px;
              }
              @media (max-width: 600px) {
                .info-grid {
                  grid-template-columns: 1fr;
                }
                .container {
                  margin: 10px;
                  border-radius: 10px;
                }
                .header {
                  padding: 20px;
                }
                .header h1 {
                  font-size: 24px;
                }
                .content {
                  padding: 30px 20px;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎓 Demande Confirmée!</h1>
                <p>Via Italia - Service d'Orientation Universitaire</p>
              </div>
              
              <div class="content">
                <p>Bonjour <strong>${formData.fullName}</strong>,</p>
                
                <div class="success-box">
                  <h3>🎉 Votre demande a été soumise avec succès!</h3>
                  <p>Nous avons bien reçu votre demande d'études en Italie et nous vous en remercions.</p>
                </div>
                
                <h3 style="color: #2c3e50; margin: 30px 0 20px 0;">📋 Vos Informations:</h3>
                
                <div class="info-grid">
                  <div class="info-item">
                    <h4>Nom Complet</h4>
                    <p>${formData.fullName}</p>
                  </div>
                  <div class="info-item">
                    <h4>Email</h4>
                    <p>${formData.email}</p>
                  </div>
                  <div class="info-item">
                    <h4>Téléphone</h4>
                    <p>${formData.phoneNumber}</p>
                  </div>
                  <div class="info-item">
                    <h4>Ville</h4>
                    <p>${formData.city}</p>
                  </div>
                  <div class="info-item">
                    <h4>Niveau Actuel</h4>
                    <p>${formData.currentLevel}</p>
                  </div>
                  <div class="info-item">
                    <h4>Niveau Désiré</h4>
                    <p>${formData.desiredLevel}</p>
                  </div>
                  <div class="info-item">
                    <h4>Langue d'Étude</h4>
                    <p>${formData.studyLanguage}</p>
                  </div>
                  <div class="info-item">
                    <h4>Spécialité</h4>
                    <p>${formData.desiredSpecialty}</p>
                  </div>
                </div>
                
                <div class="pack-highlight">
                  <div class="pack-name">${getPackDisplayName(formData.selectedPack)}</div>
                  <div class="pack-price">${getPackPrice(formData.selectedPack)}</div>
                  <p style="margin: 0; color: #666;">Pack sélectionné pour votre projet d'études</p>
                </div>
                
                <div class="payment-info">
                  <h4>💳 Instructions de Paiement:</h4>
                  <p><strong>Virement Bancaire (D-17):</strong> Veuillez effectuer le virement vers notre compte bancaire.</p>
                  <p><strong>RIPoste (D17):</strong> Option de paiement disponible via RIPoste.</p>
                  <p><strong>Important:</strong> Mentionnez votre nom et "Via Italia" dans la référence du paiement.</p>
                </div>
                
                <div class="contact-info">
                  <h3>📞 Contactez-Nous:</h3>
                  <p><strong>Email:</strong> viaitaliaagency@gmail.com<</p>
                  <p><strong>Téléphone:</strong> +216 22 552 722</p>
                  <p><strong>Adresse:</strong> Tunis, Tunisie</p>
                  <p><strong>Heures d'ouverture:</strong> Lun-Ven: 9h-18h, Sam: 10h-16h</p>
                </div>
                
                <p style="margin: 30px 0 10px 0;">Notre équipe vous contactera dans les plus brefs délais pour discuter des prochaines étapes de votre projet d'études en Italie.</p>
                
                <p>Cordialement,<br>
                <strong>L'équipe Via Italia</strong></p>
              </div>
              
              <div class="footer">
                <p>© 2024 Via Italia - Tous droits réservés</p>
                <p>Service d'orientation universitaire pour les études en Italie</p>
                <p style="font-size: 12px; color: #999;">
                  Si vous ne souhaitez plus recevoir ces notifications, 
                  <a href="https://viaitalia.fr/unsubscribe" style="color: #999;">cliquez ici</a>
                </p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Study form confirmation email sent successfully:', result.messageId);
      
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('=== STUDY FORM EMAIL ERROR ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Test email configuration
  testEmailConfig: async () => {
    try {
      console.log('=== TESTING EMAIL CONFIGURATION ===');
      console.log('Email User:', process.env.EMAIL_USER);
      console.log('Email Host:', process.env.EMAIL_HOST);
      console.log('Email Port:', process.env.EMAIL_PORT);
      console.log('Email Pass (first 4 chars):', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.substring(0, 4) + '...' : 'Not set');
      
      await transporter.verify();
      console.log('Email service is ready');
      return { success: true };
    } catch (error) {
      console.error('Email service configuration error:', error);
      return { success: false, error: error.message };
    }
  },

  // Quick test email
  sendTestEmail: async () => {
    try {
      console.log('=== SENDING TEST EMAIL ===');
      
      const mailOptions = {
        from: process.env.EMAIL_USER || '"Via Italia" <noreply@viaitalia.fr>',
        to: process.env.EMAIL_USER, // Send to yourself for testing
        subject: '📧 Test Email - Via Italia Email Service',
        html: `
          <h2>✅ Email Service Working!</h2>
          <p>This is a test email from Via Italia email service.</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>From:</strong> Via Italia Backend</p>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Test email sent successfully:', result.messageId);
      
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('=== TEST EMAIL ERROR ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Send announcement notification to selected users
  sendAnnouncementNotification: async (announcementTitle, announcementContent, announcementType, announcementLink, selectedUserIds = []) => {
    try {
      console.log('=== SENDING ANNOUNCEMENT EMAIL NOTIFICATION ===');
      console.log('=== SELECTED USER IDS ===', selectedUserIds);
      
      // Get specific users from database based on selected IDs
      let users;
      if (selectedUserIds.length > 0) {
        // Get only selected users
        users = await prisma.user.findMany({
          where: {
            id: {
              in: selectedUserIds
            },
            email: {
              not: ''
            },
            role: 'USER'
          }
        });
        console.log('=== FOUND SELECTED USERS FOR ANNOUNCEMENT ===', users.length);
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
        console.log('=== NO USERS SELECTED, SENDING TO ALL USERS ===', users.length);
      }
      
      // Prepare email content for announcement
      const emailContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nouvelle Annonce - Via Italia</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa; line-height: 1.6;">
          
          <div style="max-width: 600px; margin: 20px auto; background: linear-gradient(135deg, #e74c3c 0%, #27ae60 100%); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: rgba(255,255,255,0.1); padding: 30px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.2);">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                📢 Via Italia
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px; font-weight: 300;">
                Communication Officielle
              </p>
            </div>
            
            <!-- Content -->
            <div style="background: #ffffff; padding: 40px 30px;">
              
              <!-- Announcement Title -->
              <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="margin: 0; color: #2c3e50; font-size: 24px; font-weight: 600; padding-bottom: 15px; border-bottom: 3px solid #e74c3c; display: inline-block;">
                  ${announcementTitle}
                </h2>
              </div>
              
              <!-- Announcement Content -->
              <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e74c3c;">
                <p style="margin: 0; color: #34495e; font-size: 16px; line-height: 1.7;">
                  ${announcementContent}
                </p>
              </div>
              
              <!-- Announcement Type Badge -->
              <div style="text-align: center; margin: 25px 0;">
                <span style="
                  display: inline-block;
                  padding: 8px 20px;
                  background: ${announcementType === 'URGENT' ? '#c0392b' : announcementType === 'WARNING' ? '#d68910' : announcementType === 'SUCCESS' ? '#229954' : '#1d8348'};
                  color: white;
                  border-radius: 25px;
                  font-size: 14px;
                  font-weight: 600;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                ">
                  ${announcementType}
                </span>
              </div>
              
              <!-- Announcement Link -->
              ${announcementLink ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${announcementLink}" style="
                  display: inline-block;
                  padding: 15px 35px;
                  background: linear-gradient(135deg, #e74c3c 0%, #27ae60 100%);
                  color: white;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: 600;
                  font-size: 16px;
                  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.4);
                  transition: all 0.3s ease;
                ">
                  📋 Voir l'annonce complète
                </a>
              </div>
              ` : ''}
              
            </div>
            
            <!-- Footer -->
            <div style="background: #2c3e50; padding: 30px; text-align: center;">
              <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #ecf0f1; font-size: 18px; font-weight: 600;">
                  L'Équipe Via Italia
                </h3>
                <p style="margin: 5px 0; color: #bdc3c7; font-size: 14px;">
                  Service d'information et de communication
                </p>
              </div>
              
              <div style="border-top: 1px solid #34495e; padding-top: 20px; margin-top: 20px;">
                <p style="margin: 0; color: #95a5a6; font-size: 12px;">
                  © ${new Date().getFullYear()} Via Italia. Tous droits réservés.
                </p>
                <p style="margin: 5px 0 0 0; color: #95a5a6; font-size: 12px;">
                  Cet email a été envoyé automatiquement. Merci de ne pas répondre.
                </p>
              </div>
            </div>
            
          </div>
          
        </body>
        </html>
      `;
      
      // Send email to each user
      const emailPromises = users.map(async (user) => {
        try {
          console.log('=== SENDING ANNOUNCEMENT EMAIL TO USER ===', user.email);
          
          const mailOptions = {
            from: process.env.EMAIL_USER || '"Via Italia" <noreply@viaitalia.fr>',
            to: user.email,
            subject: '📢 Nouvelle Annonce: ' + announcementTitle,
            html: emailContent
          };
          
          await transporter.sendMail(mailOptions);
          
          console.log('=== EMAIL SENT TO USER ===', user.email);
          return {
            success: true,
            message: `Email sent to ${user.email}`,
            userId: user.id
          };
        } catch (error) {
          console.error('=== ERROR SENDING EMAIL TO USER ===', user.email, error);
          return {
            success: false,
            error: error.message,
            userId: user.id
          };
        }
      });
      
      // Wait for all emails to be sent
      const results = await Promise.all(emailPromises);
      const successfulEmails = results.filter(r => r.success);
      const failedEmails = results.filter(r => !r.success);
      
      console.log('=== ANNOUNCEMENT EMAIL RESULTS ===', {
        total: users.length,
        successful: successfulEmails.length,
        failed: failedEmails.length
      });
      
      return {
        success: true,
        message: `Announcement notification sent to ${successfulEmails.length} users`,
        results: results
      };
      
    } catch (error) {
      console.error('=== ANNOUNCEMENT EMAIL NOTIFICATION ERROR ===', error);
      throw error;
    }
  },

  // Send appointment status update email
  sendAppointmentStatusUpdateEmail: async (userEmail, userName, appointmentType, appointmentDate, newStatus, newEtat, adminName) => {
    try {
      console.log('=== SENDING APPOINTMENT STATUS UPDATE EMAIL ===');
      console.log('To:', userEmail);
      console.log('User:', userName);
      console.log('Appointment Type:', appointmentType);
      console.log('Appointment Date:', appointmentDate);
      console.log('New Status:', newStatus);
      console.log('New Etat:', newEtat);
      console.log('Admin:', adminName);
      
      const getStatusText = (status) => {
        switch(status) {
          case 'CONFIRMED':
            return '✅ Confirmé';
          case 'CANCELLED':
            return '❌ Annulé';
          case 'PENDING':
            return '⏳ En Attente';
          default:
            return '⏳ En Attente';
        }
      };

      const getEtatText = (etat) => {
        switch(etat) {
          case 'PRESENTIEL':
            return '🏢 Présentiel';
          case 'EN_LIGNE':
            return '💻 En Ligne';
          default:
            return '🏢 Présentiel';
        }
      };

      const getActionMessage = (status) => {
        switch(status) {
          case 'CONFIRMED':
            return `
              <div class="info-box">
                <h3>🎉 Votre rendez-vous est confirmé!</h3>
                <p>Nous sommes ravis de vous confirmer votre rendez-vous. Veuillez vous présenter à l'heure et au lieu prévus.</p>
              </div>
            `;
          case 'CANCELLED':
            return `
              <div class="info-box">
                <h3>📝 Votre rendez-vous a été annulé</h3>
                <p>Nous vous informons que votre rendez-vous a été annulé. Si vous avez des questions, n'hésitez pas à nous contacter.</p>
              </div>
            `;
          default:
            return `
              <div class="info-box">
                <h3>📋 Votre rendez-vous est en attente</h3>
                <p>Votre rendez-vous est en attente de confirmation. Nous vous tiendrons informé dès que possible.</p>
              </div>
            `;
        }
      };

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: `📅 Mise à jour de votre rendez-vous - Via Italia`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Mise à jour de Rendez-vous - Via Italia</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa; line-height: 1.6;">
            
            <div style="max-width: 600px; margin: 20px auto; background: linear-gradient(135deg, #e74c3c 0%, #27ae60 100%); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <div style="background: rgba(255,255,255,0.1); padding: 30px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.2);">
                <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                  📅 Via Italia
                </h1>
                <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px; font-weight: 300;">
                  Service de Rendez-vous
                </p>
              </div>
              
              <!-- Content -->
              <div style="background: #ffffff; padding: 40px 30px;">
                
                <!-- Greeting -->
                <p style="margin: 0 0 20px 0; color: #2c3e50; font-size: 16px;">
                  Bonjour <strong>${userName}</strong>,
                </p>
                
                <!-- Main Message -->
                <p style="margin: 0 0 20px 0; color: #34495e; font-size: 16px;">
                  Nous vous informons que le statut de votre rendez-vous <strong>${appointmentType}</strong> a été mis à jour par notre équipe administrative.
                </p>
                
                <!-- Status Badge -->
                <div style="text-align: center; margin: 25px 0;">
                  <div style="
                    display: inline-block;
                    padding: 12px 24px;
                    background: ${newStatus === 'CONFIRMED' ? '#27ae60' : newStatus === 'CANCELLED' ? '#e74c3c' : '#f39c12'};
                    color: white;
                    border-radius: 25px;
                    font-size: 16px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                  ">
                    ${getStatusText(newStatus)}
                  </div>
                </div>
                
                <!-- Etat Badge -->
                <div style="text-align: center; margin: 20px 0;">
                  <div style="
                    display: inline-block;
                    padding: 10px 20px;
                    background: ${newEtat === 'PRESENTIEL' ? '#27ae60' : '#3498db'};
                    color: white;
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: 500;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.1);
                  ">
                    ${getEtatText(newEtat)}
                  </div>
                </div>
                
                <!-- Appointment Details -->
                <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e74c3c;">
                  <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 18px;">📋 Détails du rendez-vous:</h3>
                  <ul style="margin: 0; padding: 0; list-style: none; color: #34495e;">
                    <li style="margin-bottom: 10px;"><strong>Type:</strong> ${appointmentType}</li>
                    <li style="margin-bottom: 10px;"><strong>Date:</strong> ${new Date(appointmentDate).toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric'
                    })}</li>
                    <li style="margin-bottom: 10px;"><strong>Heure:</strong> ${new Date(appointmentDate).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</li>
                    <li style="margin-bottom: 10px;"><strong>Statut:</strong> ${getStatusText(newStatus)}</li>
                    <li style="margin-bottom: 10px;"><strong>Mode:</strong> ${getEtatText(newEtat)}</li>
                    <li style="margin-bottom: 10px;"><strong>Mis à jour par:</strong> ${adminName}</li>
                    <li style="margin-bottom: 0;"><strong>Date de mise à jour:</strong> ${new Date().toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</li>
                  </ul>
                </div>
                
                ${getActionMessage(newStatus)}
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://viaitalia.fr/login" style="
                    display: inline-block;
                    padding: 15px 35px;
                    background: linear-gradient(135deg, #e74c3c 0%, #27ae60 100%);
                    color: white;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 16px;
                    box-shadow: 0 4px 15px rgba(231, 76, 60, 0.4);
                    transition: all 0.3s ease;
                  ">
                    🚀 Accéder à mon tableau de bord
                  </a>
                </div>
                
                <!-- Footer Message -->
                <p style="margin: 30px 0 0 0; color: #34495e; font-size: 16px;">
                  Nous sommes là pour vous accompagner dans votre projet d'études en Italie!
                </p>
                
                <!-- Signature -->
                <p style="margin: 20px 0 0 0; color: #7f8c8d; font-size: 14px;">
                  Cordialement,<br>
                  L'Équipe Via Italia<br>
                  Service d'Orientation Universitaire
                </p>
              </div>
              
              <!-- Footer -->
              <div style="background: #2c3e50; padding: 30px; text-align: center;">
                <div style="border-top: 1px solid #34495e; padding-top: 20px; margin-top: 20px;">
                  <p style="margin: 0; color: #95a5a6; font-size: 12px;">
                    © ${new Date().getFullYear()} Via Italia. Tous droits réservés.
                  </p>
                  <p style="margin: 5px 0 0 0; color: #95a5a6; font-size: 12px;">
                    Cet email a été envoyé automatiquement. Merci de ne pas répondre.
                  </p>
                </div>
              </div>
              
            </div>
            
          </body>
          </html>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Appointment status update email sent successfully to:', userEmail);
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending appointment status update email:', error);
      return { success: false, error: error.message };
    }
  },

  // Test email sending function
  testAnnouncementEmail: async () => {
    console.log('=== TESTING EMAIL SERVICE ===');
    
    try {
      // Test the email service directly
      const testResult = await emailService.sendAnnouncementNotification(
        'Test Announcement',
        'This is a test announcement content',
        'INFO',
        'https://example.com'
      );
      
      console.log('=== TEST EMAIL SERVICE RESULT ===', testResult);
      
      return testResult;
      
    } catch (error) {
      console.error('=== TEST EMAIL SERVICE ERROR ===', error);
      return { success: false, error: error.message };
    }
  },

  // Test nodemailer directly
  testNodemailer: async () => {
    console.log('=== TESTING NODEMAILER ===');
    
    try {
      // Create test email content
      const testEmailContent = `
        <h2>Test Email from Nodemailer</h2>
        <p>This is a test email to verify nodemailer is working correctly.</p>
      `;
      
      // Create test mail options
      const testMailOptions = {
        from: process.env.EMAIL_USER || '"Via Italia" <noreply@viaitalia.fr>',
        to: 'fedy22ka@gmail.com',
        subject: '📧 Test Email from Via Italia',
        html: testEmailContent
      };
      
      // Send test email
      const info = await transporter.sendMail(testMailOptions);
      console.log('=== NODEMAILER TEST RESULT ===', info);
      
      return info;
      
    } catch (error) {
      console.error('=== NODEMAILER TEST ERROR ===', error);
      return { success: false, error: error.message };
    }
  },

  // Send notification email for dossier status update
  sendDossierStatusUpdateEmail: async (userEmail, userName, dossierTitle, statusType, newStatus, oldStatus = null) => {
    try {
      console.log('=== SENDING DOSSIER STATUS UPDATE EMAIL ===');
      console.log('To:', userEmail);
      console.log('User:', userName);
      console.log('Dossier:', dossierTitle);
      console.log('Status Type:', statusType);
      console.log('New Status:', newStatus);
      console.log('Old Status:', oldStatus);

      const getStatusText = (status) => {
        switch (status) {
          case 'PENDING': return '⏳ En attente';
          case 'EN_COURS': return '🔄 En cours';
          case 'VALIDE': return '✅ Validé';
          case 'REJECTED': return '❌ Rejeté';
          default: return status;
        }
      };

      const getStatusColor = (status) => {
        switch (status) {
          case 'PENDING': return '#d68910';
          case 'EN_COURS': return '#3498db';
          case 'VALIDE': return '#27ae60';
          case 'REJECTED': return '#e74c3c';
          default: return '#6c757d';
        }
      };

      const getStatusIcon = (statusType) => {
        switch (statusType) {
          case 'traduction': return '📝';
          case 'inscription': return '📋';
          case 'visa': return '🛂';
          default: return '📁';
        }
      };

      const getStatusTitle = (statusType) => {
        switch (statusType) {
          case 'traduction': return 'Traduction';
          case 'inscription': return 'Inscription';
          case 'visa': return 'Dossier Visa';
          default: return 'Dossier';
        }
      };

      const getProgressMessage = (statusType, newStatus) => {
        if (newStatus === 'VALIDE') {
          switch (statusType) {
            case 'traduction':
              return `
                <div style="background-color: #d4edda; border-left: 4px solid #27ae60; padding: 20px; margin: 25px 0; border-radius: 8px;">
                  <h3 style="color: #155724; margin: 0 0 10px 0;">🎉 Étape validée!</h3>
                  <p style="margin: 0; color: #155724;">Félicitations! Votre traduction a été validée. Vous pouvez maintenant passer à l'étape d'inscription.</p>
                </div>
              `;
            case 'inscription':
              return `
                <div style="background-color: #d4edda; border-left: 4px solid #27ae60; padding: 20px; margin: 25px 0; border-radius: 8px;">
                  <h3 style="color: #155724; margin: 0 0 10px 0;">🎉 Étape validée!</h3>
                  <p style="margin: 0; color: #155724;">Excellent! Votre inscription a été validée. Vous pouvez maintenant procéder à l'étape du dossier visa.</p>
                </div>
              `;
            case 'visa':
              return `
                <div style="background-color: #d4edda; border-left: 4px solid #27ae60; padding: 20px; margin: 25px 0; border-radius: 8px;">
                  <h3 style="color: #155724; margin: 0 0 10px 0;">🎉 Processus terminé!</h3>
                  <p style="margin: 0; color: #155724;">Félicitations! Votre dossier visa a été validé. Votre processus administratif est maintenant complet.</p>
                </div>
              `;
            default:
              return '';
          }
        } else if (newStatus === 'EN_COURS') {
          return `
            <div style="background-color: #d1ecf1; border-left: 4px solid #3498db; padding: 20px; margin: 25px 0; border-radius: 8px;">
              <h3 style="color: #0c5460; margin: 0 0 10px 0;">🔄 En cours de traitement</h3>
              <p style="margin: 0; color: #0c5460;">Votre ${getStatusTitle(statusType).toLowerCase()} est en cours d'examen par notre équipe.</p>
            </div>
          `;
        } else if (newStatus === 'REJECTED') {
          return `
            <div style="background-color: #f8d7da; border-left: 4px solid #e74c3c; padding: 20px; margin: 25px 0; border-radius: 8px;">
              <h3 style="color: #721c24; margin: 0 0 10px 0;">⚠️ Action requise</h3>
              <p style="margin: 0; color: #721c24;">Votre ${getStatusTitle(statusType).toLowerCase()} a été rejeté. Veuillez contacter notre équipe pour plus d'informations.</p>
            </div>
          `;
        }
        return '';
      };

      const mailOptions = {
        from: process.env.EMAIL_USER || '"Via Italia" <noreply@viaitalia.fr>',
        to: userEmail,
        subject: `📁 Mise à jour de votre ${getStatusTitle(statusType)} - Via Italia`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Mise à jour de dossier - Via Italia</title>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f5f5f5;
                margin: 0;
                padding: 20px;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                border-radius: 15px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
              }
              .header {
                background: linear-gradient(135deg, #e74c3c 0%, #27ae60 100%);
                padding: 30px;
                text-align: center;
                color: white;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
              }
              .header p {
                margin: 10px 0 0 0;
                font-size: 16px;
                opacity: 0.9;
              }
              .content {
                padding: 40px 30px;
              }
              .status-badge {
                display: inline-block;
                padding: 12px 20px;
                border-radius: 25px;
                font-weight: bold;
                text-transform: uppercase;
                font-size: 16px;
                margin: 20px 0;
                background-color: ${getStatusColor(newStatus)};
                color: white;
                text-align: center;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .dossier-info {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #e74c3c;
              }
              .dossier-info h3 {
                margin: 0 0 15px 0;
                color: #e74c3c;
                font-size: 18px;
              }
              .dossier-info ul {
                margin: 0;
                padding-left: 20px;
              }
              .dossier-info li {
                margin: 8px 0;
                color: #495057;
              }
              .progress-steps {
                display: flex;
                justify-content: space-between;
                margin: 30px 0;
                position: relative;
              }
              .progress-steps::before {
                content: '';
                position: absolute;
                top: 20px;
                left: 30px;
                right: 30px;
                height: 2px;
                background: #e9ecef;
                z-index: 1;
              }
              .step {
                text-align: center;
                position: relative;
                z-index: 2;
                flex: 1;
              }
              .step-icon {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: #e9ecef;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 10px;
                font-size: 18px;
              }
              .step.active .step-icon {
                background: ${getStatusColor(newStatus)};
              }
              .step.completed .step-icon {
                background: #27ae60;
              }
              .step-label {
                font-size: 12px;
                color: #666;
                font-weight: 600;
              }
              .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #e74c3c 0%, #27ae60 100%);
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 25px;
                font-weight: 600;
                margin: 20px 0;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                box-shadow: 0 4px 6px rgba(0, 255, 51, 0.3);
              }
              .cta-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 12px rgba(0, 255, 51, 0.4);
              }
              .footer {
                background: #f8f9fa;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #dee2e6;
                color: #6c757d;
                font-size: 14px;
              }
              .footer p {
                margin: 5px 0;
              }
              @media (max-width: 600px) {
                .container {
                  margin: 10px;
                  border-radius: 10px;
                }
                .header {
                  padding: 20px;
                }
                .header h1 {
                  font-size: 24px;
                }
                .content {
                  padding: 30px 20px;
                }
                .progress-steps {
                  flex-direction: column;
                  gap: 20px;
                }
                .progress-steps::before {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${getStatusIcon(statusType)} Mise à jour de ${getStatusTitle(statusType)}</h1>
                <p>Via Italia - Service d'Orientation Universitaire</p>
              </div>
              
              <div class="content">
                <p>Bonjour <strong>${userName}</strong>,</p>
                
                <p>Nous vous informons que le statut de votre <strong>${getStatusTitle(statusType).toLowerCase()}</strong> dans le dossier <strong>"${dossierTitle}"</strong> a été mis à jour.</p>
                
                <div style="text-align: center; margin: 25px 0;">
                  <div class="status-badge">
                    ${getStatusText(newStatus)}
                  </div>
                </div>
                
                <div class="dossier-info">
                  <h3>📋 Détails de la mise à jour:</h3>
                  <ul>
                    <li><strong>Dossier:</strong> ${dossierTitle}</li>
                    <li><strong>Étape:</strong> ${getStatusIcon(statusType)} ${getStatusTitle(statusType)}</li>
                    <li><strong>Nouveau statut:</strong> ${getStatusText(newStatus)}</li>
                    ${oldStatus ? `<li><strong>Ancien statut:</strong> ${getStatusText(oldStatus)}</li>` : ''}
                    <li><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</li>
                  </ul>
                </div>
                
                <div class="progress-steps">
                  <div class="step ${statusType === 'traduction' ? 'active' : 'completed'}">
                    <div class="step-icon">📝</div>
                    <div class="step-label">Traduction</div>
                  </div>
                  <div class="step ${statusType === 'inscription' ? 'active' : statusType === 'visa' ? 'completed' : ''}">
                    <div class="step-icon">📋</div>
                    <div class="step-label">Inscription</div>
                  </div>
                  <div class="step ${statusType === 'visa' ? 'active' : ''}">
                    <div class="step-icon">🛂</div>
                    <div class="step-label">Dossier Visa</div>
                  </div>
                </div>
                
                ${getProgressMessage(statusType, newStatus)}
                
                <div style="text-align: center;">
                  <a href="https://viaitalia.fr/login" class="cta-button">
                    🚀 Accéder à mon tableau de bord
                  </a>
                </div>
                
                <p>Nous sommes là pour vous accompagner dans votre projet d'études en Italie!</p>
                
                <p>Cordialement,<br>
                <strong>L'équipe Via Italia</strong></p>
              </div>
              
              <div class="footer">
                <p>© 2024 Via Italia - Tous droits réservés</p>
                <p>Service d'orientation universitaire pour les études en Italie</p>
                <p style="font-size: 12px; color: #999;">
                  Si vous ne souhaitez plus recevoir ces notifications, 
                  <a href="https://viaitalia.fr/unsubscribe" style="color: #999;">cliquez ici</a>
                </p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Dossier status update email sent successfully:', result.messageId);
      
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('=== DOSSIER STATUS EMAIL ERROR ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      
      return {
        success: false,
        error: error.message
      };
    }
  }
};

module.exports = emailService;
