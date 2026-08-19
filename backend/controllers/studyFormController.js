const prisma = require("../config/prisma");
const emailService = require("../services/emailService");

// Submit Study in Italy Form
const submitStudyForm = async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      email,
      city,
      passportStatus,
      currentLevel,
      desiredLevel,
      studyLanguage,
      desiredSpecialty,
      age,
      selectedPack
    } = req.body;

    // Validate required fields
    if (!fullName || !phoneNumber || !email || !city || !passportStatus || 
        !currentLevel || !desiredLevel || !studyLanguage || !desiredSpecialty || !age || !selectedPack) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs sont requis"
      });
    }

    // Validate age
    if (isNaN(age) || age < 16 || age > 50) {
      return res.status(400).json({
        success: false,
        message: "L'âge doit être compris entre 16 et 50 ans"
      });
    }

    // Validate passport status
    const validPassportStatus = ["Oui", "Non", "En cours"];
    if (!validPassportStatus.includes(passportStatus)) {
      return res.status(400).json({
        success: false,
        message: "Statut de passeport invalide"
      });
    }

    // Validate current level
    const validCurrentLevels = [
      "Baccalauréat Obtenu",
      "Baccalauréat en cours",
      "Licence Obtenu",
      "Licence en cours",
      "Master Obtenu",
      "Master en cours"
    ];
    if (!validCurrentLevels.includes(currentLevel)) {
      return res.status(400).json({
        success: false,
        message: "Niveau académique actuel invalide"
      });
    }

    // Validate desired level
    const validDesiredLevels = ["Licence", "Master", "2ème Master"];
    if (!validDesiredLevels.includes(desiredLevel)) {
      return res.status(400).json({
        success: false,
        message: "Niveau d'études désiré invalide"
      });
    }

    // Validate study language
    const validStudyLanguages = ["Italien", "Anglais"];
    if (!validStudyLanguages.includes(studyLanguage)) {
      return res.status(400).json({
        success: false,
        message: "Langue d'étude invalide"
      });
    }

    // Validate selected pack
    const validPacks = ["essential", "advanced", "premium"];
    if (!validPacks.includes(selectedPack)) {
      return res.status(400).json({
        success: false,
        message: "Pack sélectionné invalide"
      });
    }

    // Check if email already exists
    const existingForm = await prisma.studyInItalyForm.findFirst({
      where: { email }
    });

    if (existingForm) {
      return res.status(400).json({
        success: false,
        message: "Une demande avec cet email existe déjà"
      });
    }

    // Create the study form submission
    const studyForm = await prisma.studyInItalyForm.create({
      data: {
        fullName,
        phoneNumber,
        email,
        city,
        passportStatus,
        currentLevel,
        desiredLevel,
        studyLanguage,
        desiredSpecialty,
        age: parseInt(age),
        selectedPack
      }
    });

    // Send confirmation email
    try {
      const emailResult = await emailService.sendStudyFormConfirmationEmail({
        fullName,
        phoneNumber,
        email,
        city,
        passportStatus,
        currentLevel,
        desiredLevel,
        studyLanguage,
        desiredSpecialty,
        age: parseInt(age),
        selectedPack
      });
      
      if (emailResult.success) {
        console.log('Study form confirmation email sent successfully');
      } else {
        console.error('Failed to send study form confirmation email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('Error sending study form confirmation email:', emailError);
      // Don't fail the request if email fails, but log it
    }

    res.status(201).json({
      success: true,
      message: "Demande d'études en Italie soumise avec succès",
      data: studyForm
    });

  } catch (error) {
    console.error("Error submitting study form:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la soumission de la demande",
      error: error.message
    });
  }
};

// Get all Study Forms (for admin)
const getAllStudyForms = async (req, res) => {
  try {
    const forms = await prisma.studyInItalyForm.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      message: "Formulaires d'études récupérés avec succès",
      data: forms
    });

  } catch (error) {
    console.error("Error fetching study forms:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des formulaires",
      error: error.message
    });
  }
};

// Get Study Form by ID
const getStudyFormById = async (req, res) => {
  try {
    const { id } = req.params;

    const formId = parseInt(id);
    if (isNaN(formId)) {
      return res.status(400).json({
        success: false,
        message: "ID de formulaire invalide"
      });
    }

    const form = await prisma.studyInItalyForm.findUnique({
      where: { id: formId }
    });

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Formulaire non trouvé"
      });
    }

    res.status(200).json({
      success: true,
      message: "Formulaire récupéré avec succès",
      data: form
    });

  } catch (error) {
    console.error("Error fetching study form:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du formulaire",
      error: error.message
    });
  }
};

// Delete Study Form (for admin)
const deleteStudyForm = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if form exists
    const existingForm = await prisma.studyInItalyForm.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingForm) {
      return res.status(404).json({
        success: false,
        message: "Formulaire non trouvé"
      });
    }

    // Delete the form
    await prisma.studyInItalyForm.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      message: "Formulaire supprimé avec succès"
    });

  } catch (error) {
    console.error("Error deleting study form:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression du formulaire",
      error: error.message
    });
  }
};

// Update Study Form (for admin)
const updateStudyForm = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if form exists
    const existingForm = await prisma.studyInItalyForm.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingForm) {
      return res.status(404).json({
        success: false,
        message: "Formulaire non trouvé"
      });
    }

    // Update the form
    const updatedForm = await prisma.studyInItalyForm.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: "Formulaire mis à jour avec succès",
      data: updatedForm
    });

  } catch (error) {
    console.error("Error updating study form:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du formulaire",
      error: error.message
    });
  }
};

// Search Study Forms by name (for admin)
const searchStudyForms = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Le paramètre de recherche 'name' est requis"
      });
    }

    // Search by fullName (case-insensitive partial match)
    const forms = await prisma.studyInItalyForm.findMany({
      where: {
        fullName: {
          contains: name
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      message: "Formulaires trouvés avec succès",
      data: forms,
      count: forms.length
    });

  } catch (error) {
    console.error("Error searching study forms:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la recherche des formulaires",
      error: error.message
    });
  }
};

module.exports = {
  submitStudyForm,
  getAllStudyForms,
  getStudyFormById,
  deleteStudyForm,
  updateStudyForm,
  searchStudyForms
};
