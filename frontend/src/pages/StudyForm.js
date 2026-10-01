import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { gsap } from "gsap";

const StudyForm = () => {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const titleRef = useRef(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    city: "",
    passportStatus: "",
    currentLevel: "",
    desiredLevel: "",
    studyLanguage: "",
    desiredSpecialty: "",
    age: "",
    selectedPack: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const packs = [
    {
      id: "essential",
      name: "Pack Essentiel",
      price: "1999 DT",
      description: "Ce pack est destiné aux étudiants qui souhaitent être accompagnés dans les premières démarches pour étudier en Italie, notamment la préparation du dossier académique et la première inscription universitaire.",
      services: [
        "Traduction et apostille des documents académiques",
        "Analyse du profil académique",
        "Sélection des universités compatibles avec votre parcours",
        "Préinscription dans 1 université italienne",
        "Préparation et dépôt de la demande de bourse régionale",
        "Demande de logement universitaire (foyer étudiant)",
        "Suivi administratif pendant la procédure",
        "Jusqu'à 5 rendez-vous de suivi personnalisés"
      ]
    },
    {
      id: "advanced",
      name: "Pack Avancé",
      price: "2999 DT",
      description: "Ce pack est conçu pour les étudiants souhaitant un accompagnement plus complet incluant plusieurs candidatures universitaires et la préparation du dossier de visa.",
      services: [
        "Tous les services du Pack Essentiel",
        "Préinscription dans 2 universités italiennes",
        "Inscription et accompagnement pour le test de langue italienne en ligne",
        "Préparation du dossier de visa étudiant",
        "Vérification complète des documents nécessaires pour le visa",
        "Rendez-vous de suivi illimités"
      ]
    },
    {
      id: "premium",
      name: "Pack Premium",
      price: "3999 DT",
      description: "Le Pack Premium offre un accompagnement complet pour les étudiants qui souhaitent maximiser leurs chances d'admission et préparer l'ensemble de leur dossier administratif et financier.",
      services: [
        "Tous les services du Pack Avancé",
        "Préinscription dans 5 universités italiennes",
        "Préparation complète du dossier financier exigé pour le visa étudiant",
        "Suivi administratif avancé du dossier",
        "Rendez-vous de suivi illimités"
      ]
    }
  ];

  // GSAP animations on component mount and step change
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        // Animate title
        if (titleRef.current) {
          gsap.from(titleRef.current, {
            duration: 1,
            y: -20,
            opacity: 0,
            ease: "power3.out",
            clearProps: true
          });
        }

        // Animate form container
        if (formRef.current) {
          gsap.from(formRef.current, {
            duration: 1.2,
            scale: 0.8,
            opacity: 0,
            ease: "back.out(1.7)",
            clearProps: true
          });

          // Animate form fields with stagger
          const inputs = formRef.current.querySelectorAll('input, select, .pack-card');
          if (inputs && inputs.length > 0) {
            gsap.from(inputs, {
              duration: 0.8,
              y: 20,
              opacity: 0,
              stagger: 0.1,
              ease: "power2.out",
              clearProps: true
            });
          }

          // Animate button
          const button = formRef.current.querySelector('button');
          if (button) {
            gsap.from(button, {
              duration: 0.8,
              scale: 0.8,
              opacity: 0,
              ease: "elastic.out(1, 0.5)",
              clearProps: true
            });
          }
        }
      } catch (error) {
        console.log('GSAP Animation Error:', error);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [currentStep]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Le nom complet est requis";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Le numéro de téléphone est requis";
    } else if (!/^\+?\d{10,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = "Format de numéro de téléphone invalide";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (!formData.city.trim()) {
      newErrors.city = "La ville est requise";
    }

    if (!formData.passportStatus) {
      newErrors.passportStatus = "Le statut du passeport est requis";
    }

    if (!formData.currentLevel) {
      newErrors.currentLevel = "Le niveau académique actuel est requis";
    }

    if (!formData.desiredLevel) {
      newErrors.desiredLevel = "Le niveau d'études désiré est requis";
    }

    if (!formData.studyLanguage) {
      newErrors.studyLanguage = "La langue d'étude est requise";
    }

    if (!formData.desiredSpecialty.trim()) {
      newErrors.desiredSpecialty = "La spécialité désirée est requise";
    }

    if (!formData.age) {
      newErrors.age = "L'âge est requis";
    } else if (isNaN(formData.age) || formData.age < 16 || formData.age > 50) {
      newErrors.age = "L'âge doit être compris entre 16 et 50 ans";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    if (!formData.selectedPack) {
      setMessage("Veuillez sélectionner un pack");
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !validateStep1()) {
      return;
    }
    if (currentStep === 2 && !validateStep2()) {
      return;
    }
    setCurrentStep(currentStep + 1);
    setMessage("");
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
    setMessage("");
  };

  const handlePackSelect = (packId) => {
    setFormData((prev) => ({ ...prev, selectedPack: packId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    // Only submit if we're on step 3
    if (currentStep < 3) {
      setIsSubmitting(false);
      return;
    }

    if (!validateStep1()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axiosInstance.post("/study-forms/submit", {
        ...formData,
        age: parseInt(formData.age)
      });

      if (response.data.success) {
        setMessage("Votre demande a été soumise avec succès! Nous vous contacterons bientôt.");
        // Reset form
        setFormData({
          fullName: "",
          phoneNumber: "",
          email: "",
          city: "",
          passportStatus: "",
          currentLevel: "",
          desiredLevel: "",
          studyLanguage: "",
          desiredSpecialty: "",
          age: "",
          selectedPack: ""
        });
        
        // Redirect after 3 seconds
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        setMessage(response.data.message || "Une erreur est survenue");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-green-400 mb-4">Étape 1: Informations Personnelles et Académiques</h3>
      
      {/* Personal Information Section */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-300 mb-3">Informations Personnelles</h4>
        
        <div>
          <label className="block text-gray-400 mb-1">Nom Complet *</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Entrez votre nom complet"
            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 outline-none ${
              errors.fullName ? "border-red-500" : "border-gray-700"
            }`}
            required
          />
          {errors.fullName && <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>}
        </div>

        <div>
          <label className="block text-gray-400 mb-1">Numéro de Téléphone *</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="+33 6 12 34 56 78"
            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 outline-none ${
              errors.phoneNumber ? "border-red-500" : "border-gray-700"
            }`}
            required
          />
          {errors.phoneNumber && <p className="text-red-400 text-sm mt-1">{errors.phoneNumber}</p>}
        </div>

        <div>
          <label className="block text-gray-400 mb-1">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="votre.email@example.com"
            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 outline-none ${
              errors.email ? "border-red-500" : "border-gray-700"
            }`}
            required
          />
          {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-gray-400 mb-1">Ville *</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Votre ville"
            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 outline-none ${
              errors.city ? "border-red-500" : "border-gray-700"
            }`}
            required
          />
          {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
        </div>

        <div>
          <label className="block text-gray-400 mb-1">Statut du Passeport *</label>
          <select
            name="passportStatus"
            value={formData.passportStatus}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white focus:ring-2 focus:ring-green-500 outline-none ${
              errors.passportStatus ? "border-red-500" : "border-gray-700"
            }`}
            required
          >
            <option value="">Sélectionnez une option</option>
            <option value="Oui">Oui</option>
            <option value="Non">Non</option>
            <option value="En cours">En cours</option>
          </select>
          {errors.passportStatus && <p className="text-red-400 text-sm mt-1">{errors.passportStatus}</p>}
        </div>
      </div>

      {/* Academic Information Section */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-300 mb-3">Informations Académiques</h4>
        
        <div>
          <label className="block text-gray-400 mb-1">Niveau Académique Actuel *</label>
          <select
            name="currentLevel"
            value={formData.currentLevel}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white focus:ring-2 focus:ring-green-500 outline-none ${
              errors.currentLevel ? "border-red-500" : "border-gray-700"
            }`}
            required
          >
            <option value="">Sélectionnez votre niveau</option>
            <option value="Baccalauréat Obtenu">Baccalauréat Obtenu</option>
            <option value="Baccalauréat en cours">Baccalauréat en cours</option>
            <option value="Licence Obtenu">Licence Obtenu</option>
            <option value="Licence en cours">Licence en cours</option>
            <option value="Master Obtenu">Master Obtenu</option>
            <option value="Master en cours">Master en cours</option>
          </select>
          {errors.currentLevel && <p className="text-red-400 text-sm mt-1">{errors.currentLevel}</p>}
        </div>

        <div>
          <label className="block text-gray-400 mb-1">Niveau d'Études Désiré *</label>
          <select
            name="desiredLevel"
            value={formData.desiredLevel}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white focus:ring-2 focus:ring-green-500 outline-none ${
              errors.desiredLevel ? "border-red-500" : "border-gray-700"
            }`}
            required
          >
            <option value="">Sélectionnez le niveau désiré</option>
            <option value="Licence">Licence</option>
            <option value="Master">Master</option>
            <option value="2ème Master">2ème Master</option>
          </select>
          {errors.desiredLevel && <p className="text-red-400 text-sm mt-1">{errors.desiredLevel}</p>}
        </div>

        <div>
          <label className="block text-gray-400 mb-1">Langue d'Étude *</label>
          <select
            name="studyLanguage"
            value={formData.studyLanguage}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white focus:ring-2 focus:ring-green-500 outline-none ${
              errors.studyLanguage ? "border-red-500" : "border-gray-700"
            }`}
            required
          >
            <option value="">Sélectionnez la langue</option>
            <option value="Italien">Italien</option>
            <option value="Anglais">Anglais</option>
          </select>
          {errors.studyLanguage && <p className="text-red-400 text-sm mt-1">{errors.studyLanguage}</p>}
        </div>

        <div>
          <label className="block text-gray-400 mb-1">Spécialité Désirée *</label>
          <input
            type="text"
            name="desiredSpecialty"
            value={formData.desiredSpecialty}
            onChange={handleChange}
            placeholder="Ex: Médecine, Ingénierie, Design..."
            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 outline-none ${
              errors.desiredSpecialty ? "border-red-500" : "border-gray-700"
            }`}
            required
          />
          {errors.desiredSpecialty && <p className="text-red-400 text-sm mt-1">{errors.desiredSpecialty}</p>}
        </div>

        <div>
          <label className="block text-gray-400 mb-1">Âge *</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            placeholder="18"
            min="16"
            max="50"
            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 outline-none ${
              errors.age ? "border-red-500" : "border-gray-700"
            }`}
            required
          />
          {errors.age && <p className="text-red-400 text-sm mt-1">{errors.age}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-green-400 mb-4">Étape 2: Choisissez Votre Pack</h3>
      
      <div className="grid gap-6">
        {packs.map((pack) => (
          <div
            key={pack.id}
            className={`pack-card border rounded-lg p-6 cursor-pointer transition-all ${
              formData.selectedPack === pack.id
                ? "border-green-500 bg-green-500/10"
                : "border-gray-700 bg-gray-800 hover:border-gray-600"
            }`}
            onClick={() => handlePackSelect(pack.id)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-xl font-bold text-white mb-2">{pack.name}</h4>
                <p className="text-2xl font-bold text-green-400">{pack.price}</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 ${
                formData.selectedPack === pack.id
                  ? "border-green-500 bg-green-500"
                  : "border-gray-600"
              }`}>
                {formData.selectedPack === pack.id && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-gray-300 mb-4">{pack.description}</p>
            
            <div className="space-y-2">
              <h5 className="text-sm font-semibold text-gray-400">Services inclus:</h5>
              <ul className="space-y-1">
                {pack.services.map((service, index) => (
                  <li key={index} className="text-sm text-gray-300 flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    {service}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-green-400 mb-4">Étape 3: Paiement</h3>
      
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h4 className="text-xl font-bold text-white mb-4">Informations de Paiement</h4>
        
        <div className="space-y-4">
          <div>
            <h5 className="text-lg font-semibold text-gray-300 mb-2">Pack Sélectionné:</h5>
            <p className="text-white">
              {packs.find(p => p.id === formData.selectedPack)?.name} -{" "}
              {packs.find(p => p.id === formData.selectedPack)?.price}
            </p>
          </div>
          
          <div className="border-t border-gray-700 pt-4">
            <h5 className="text-lg font-semibold text-gray-300 mb-3">Options de Paiement:</h5>
            
            <div className="space-y-3">
              <div className="bg-gray-900 rounded p-4">
                <h6 className="font-medium text-white mb-2">Virement Bancaire</h6>
                <p className="text-gray-300 text-sm">
                  BANQUE: <span className="text-white">D-17</span><br/>
                  RIB: <span className="text-white">12345678901234567890</span><br/>
                  Bénéficiaire: <span className="text-white">Via Italia Agency</span>
                </p>
              </div>
              
              <div className="bg-gray-900 rounded p-4">
                <h6 className="font-medium text-white mb-2">RIPoste (D17)</h6>
                <p className="text-gray-300 text-sm">
                  Envoyez le paiement via RIPoste<br/>
                  Code: <span className="text-white">D17</span><br/>
                  Bénéficiaire: <span className="text-white">Via Italia Agency</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-4">
            <h5 className="text-lg font-semibold text-gray-300 mb-2">Contact de l'Agence:</h5>
            <div className="space-y-2 text-gray-300">
              <p><span className="text-white">Téléphone:</span> +216 XX XXX XXX</p>
              <p><span className="text-white">Email:</span> contact@viaitalia.tn</p>
              <p><span className="text-white">Adresse:</span> Tunis, Tunisie</p>
            </div>
          </div>
          
          <div className="bg-yellow-500/20 border border-yellow-500 rounded p-4">
            <p className="text-yellow-400 text-sm">
              <strong>Important:</strong> Après avoir effectué le paiement, veuillez nous contacter avec le reçu de paiement pour finaliser votre inscription.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-900 via-indigo-950 to-black py-8 px-4">
      <div className="bg-gray-900 text-gray-100 rounded-2xl shadow-2xl w-full max-w-4xl p-8 border border-gray-800">
        <div className="text-center mb-8">
          <h1 ref={titleRef} className="text-3xl font-bold text-white mb-2">
            <span style={{ color: 'var(--red)' }}>Via</span>{" "}
            <span style={{ color: 'var(--green)' }}>Italia</span>
          </h1>
          <p className="text-gray-400">Formulaire d'études en Italie</p>
          
          {/* Step Progress */}
          <div className="flex justify-center items-center mt-6 space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= step ? "bg-green-500" : "bg-gray-700"
                }`}>
                  {currentStep > step ? (
                    <span className="text-white text-sm">✓</span>
                  ) : (
                    <span className="text-white text-sm">{step}</span>
                  )}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-1 ${
                    currentStep > step ? "bg-green-500" : "bg-gray-700"
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2 space-x-8 text-xs">
            <span className={currentStep >= 1 ? "text-green-400" : "text-gray-500"}>Inscription</span>
            <span className={currentStep >= 2 ? "text-green-400" : "text-gray-500"}>Pack</span>
            <span className={currentStep >= 3 ? "text-green-400" : "text-gray-500"}>Paiement</span>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg text-center ${
            message.includes("succès") 
              ? "bg-green-600/20 border border-green-600 text-green-400" 
              : "bg-red-600/20 border border-red-600 text-red-400"
          }`}>
            {message}
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Précédent
              </button>
            )}
            
            <div className="flex space-x-4">
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-red-600 hover:from-green-500 hover:to-red-500 text-white rounded-lg transition-all"
                >
                  Suivant
                </button>
              ) : (
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`px-6 py-3 rounded-lg font-semibold text-white transition-all ${
                    isSubmitting 
                      ? "bg-gray-600 cursor-not-allowed" 
                      : "bg-gradient-to-r from-green-600 to-red-600 hover:from-green-500 hover:to-red-500"
                  }`}
                >
                  {isSubmitting ? "Soumission en cours..." : "Soumettre la Demande"}
                </button>
              )}
            </div>
          </div>
        </form>

        <p className="text-center text-gray-400 mt-6 text-sm">
          <span
            className="text-green-400 font-medium hover:underline cursor-pointer"
            onClick={() => navigate("/")}
          >
            Retour à l'accueil
          </span>
        </p>
      </div>
    </div>
  );
};

export default StudyForm;
