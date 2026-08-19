import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import axiosInstance from '../../../../../api/axiosInstance';
import { gsap } from 'gsap';
import {
  ProfileContainer,
  ProfileHeader,
  ProfileTitle,
  ProfileSubtitle,
  ProfileContent,
  TabContainer,
  TabButton,
  TabContent,
  ProfileForm,
  FormSection,
  FormGroup,
  FormLabel,
  FormInput,
  FormSelect,
  ButtonGroup,
  SaveButton,
  CancelButton,
  ImagePreviewContainer,
  AvatarWrapper,
  AvatarImage,
  AvatarFallback,
  ImageUploadLabel,
  AccordionHeader,
  AccordionContent,
  SuccessMessage,
  ErrorMessage,
  FormGrid,
  Divider
} from './Profile.styles';

const ProfileSection = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    passport: '',
    address: '',
    phoneNumber: '',
    image: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [userDataLoading, setUserDataLoading] = useState(true);
  const contentRef = useRef(null);

  // Remove scrollbars completely
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Hide all scrollbars completely */
      html, body, * {
        -ms-overflow-style: none !important;
        scrollbar-width: none !important;
      }
      
      html::-webkit-scrollbar,
      body::-webkit-scrollbar,
      *::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
      
      /* Force hide any remaining scrollbars */
      ::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      const userImage = user.image || '';
      
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        passport: user.passport || '',
        address: user.address || '',
        phoneNumber: user.phoneNumber || '',
        image: userImage
      });
      
      // Convert base64 to PNG format
      const toPngDataUrl = (base64) => {
        if (!base64) return null;
        const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, "");
        return `data:image/png;base64,${cleanBase64}`;
      };
      
      const imageSrc = userImage ? toPngDataUrl(userImage) : null;
      
      if (imageSrc && userImage.length > 1000) {
        setImagePreview(imageSrc);
      } else {
        setImagePreview('');
      }
      
      setUserDataLoading(false);
    }
  }, [user]);

  // Animate tab content change
  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [activeTab]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    clearMessages();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setErrorMessage('Veuillez sélectionner une image PNG ou JPG uniquement');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }
      
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setErrorMessage('L\'image ne doit pas dépasser 5MB');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }
      
      const reader = new FileReader();
      reader.onloadstart = () => {
        setSuccessMessage('Chargement de l\'image...');
      };
      
      reader.onloadend = () => {
        const result = reader.result;
        if (result && result.startsWith('data:image')) {
          setImagePreview(result);
          setFormData(prev => ({ ...prev, image: result }));
          setSuccessMessage('Image chargée avec succès!');
          setErrorMessage('');
          setTimeout(() => setSuccessMessage(''), 3000);
        } else {
          setErrorMessage('Erreur lors du chargement de l\'image');
          setTimeout(() => setErrorMessage(''), 3000);
        }
      };
      
      reader.onerror = () => {
        setErrorMessage('Erreur lors de la lecture du fichier');
        setTimeout(() => setErrorMessage(''), 3000);
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    clearMessages();
  };

  const clearMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    try {
      const response = await axiosInstance.put('/auth/update', formData);
      
      if (response.data.success) {
        setSuccessMessage('Profil mis à jour avec succès!');
        updateUser(response.data.user);
        
        if (response.data.user && response.data.user.image) {
          setImagePreview(response.data.user.image);
          setFormData(prev => ({
            ...prev,
            image: response.data.user.image
          }));
        }
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || '');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    clearMessages();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('Les nouveaux mots de passe ne correspondent pas');
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setErrorMessage('Le nouveau mot de passe doit contenir au moins 6 caractères');
      setPasswordLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.data.success) {
        setSuccessMessage('Mot de passe changé avec succès!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Erreur lors du changement du mot de passe');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (userDataLoading) {
    return (
      <ProfileContainer>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: '4rem 2rem',
          color: 'rgba(255, 255, 255, 0.85)',
          fontSize: '1.1rem',
          minHeight: '60vh'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(255, 255, 255, 0.2)',
              borderTopColor: '#4CAF50',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 1rem'
            }} />
            Chargement de vos informations...
          </div>
        </div>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <ProfileHeader>
        <ProfileTitle>
          👤 Mon Profil
        </ProfileTitle>
        <ProfileSubtitle>
          Gérez vos informations personnelles et préférences
        </ProfileSubtitle>
      </ProfileHeader>
      
      <ProfileContent>
        {successMessage && (
          <SuccessMessage>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{successMessage}</span>
          </SuccessMessage>
        )}

        {errorMessage && (
          <ErrorMessage>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{errorMessage}</span>
          </ErrorMessage>
        )}

        {/* Tab Navigation */}
        <TabContainer>
          <TabButton 
            isActive={activeTab === 'personal'} 
            onClick={() => setActiveTab('personal')}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Informations personnelles
          </TabButton>
          
          <TabButton 
            isActive={activeTab === 'security'} 
            onClick={() => setActiveTab('security')}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Sécurité
          </TabButton>
        </TabContainer>

        <div ref={contentRef}>
          {/* Personal Information Tab */}
          <TabContent isActive={activeTab === 'personal'}>
            <ProfileForm onSubmit={handleProfileUpdate}>
              <FormSection>
                {/* Profile Image Section */}
                <FormGroup>
                  <FormLabel>Photo de profil</FormLabel>
                  <ImagePreviewContainer>
                    <AvatarWrapper>
                      {imagePreview ? (
                        <AvatarImage
                          src={imagePreview}
                          alt="Profile"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <AvatarFallback>
                          <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </AvatarFallback>
                      )}
                    </AvatarWrapper>
                    
                    <div style={{ flex: 1 }}>
                      <p style={{ 
                        color: 'rgba(255, 255, 255, 0.85)',
                        fontSize: '0.9rem',
                        margin: '0 0 0.75rem 0',
                        lineHeight: '1.5'
                      }}>
                        {imagePreview 
                          ? '✓ Photo mise à jour' 
                          : 'Aucune photo de profil'}
                      </p>
                      
                      <FormInput
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                        id="image-upload"
                      />
                      <ImageUploadLabel htmlFor="image-upload">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                        </svg>
                        {imagePreview ? 'Changer la photo' : 'Ajouter une photo'}
                      </ImageUploadLabel>
                    </div>
                  </ImagePreviewContainer>
                </FormGroup>

                <Divider />

                {/* Personal Information Fields */}
                <FormGrid>
                  <FormGroup>
                    <FormLabel>Prénom</FormLabel>
                    <FormInput
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="ex: Jean"
                    />
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Nom</FormLabel>
                    <FormInput
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="ex: Dupont"
                    />
                  </FormGroup>
                </FormGrid>

                <FormGroup>
                  <FormLabel>Adresse email</FormLabel>
                  <FormInput
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="ex: jean.dupont@example.com"
                  />
                </FormGroup>

                <FormGrid>
                  <FormGroup>
                    <FormLabel>Numéro de passeport</FormLabel>
                    <FormInput
                      type="text"
                      name="passport"
                      value={formData.passport}
                      onChange={handleInputChange}
                      placeholder="ex: AB123456"
                    />
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Numéro de téléphone</FormLabel>
                    <FormInput
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="ex: +216 XX XXX XXX"
                    />
                  </FormGroup>
                </FormGrid>

                <FormGroup>
                  <FormLabel>Adresse</FormLabel>
                  <FormInput
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="ex: 123 Rue de la Paix, Tunis"
                  />
                </FormGroup>
              </FormSection>

              <ButtonGroup>
                <SaveButton type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{ animation: 'spin 0.8s linear infinite' }}>
                        <path fillRule="evenodd" d="M4.293 5.293a1 1 0 011.414 0A8 8 0 1012 2a1 1 0 11-2 0 6 6 0 1-5.414 4.293z" clipRule="evenodd" />
                      </svg>
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                      </svg>
                      Enregistrer les modifications
                    </>
                  )}
                </SaveButton>
              </ButtonGroup>
            </ProfileForm>
          </TabContent>

          {/* Security Tab */}
          <TabContent isActive={activeTab === 'security'}>
            <FormSection>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.95rem',
                margin: '0 0 2rem 0',
                lineHeight: '1.6'
              }}>
                Modifiez votre mot de passe pour sécuriser votre compte. Assurez-vous d'utiliser un mot de passe fort et unique.
              </p>

              <ProfileForm onSubmit={handlePasswordUpdate}>
                <FormGroup>
                  <FormLabel>Mot de passe actuel</FormLabel>
                  <FormInput
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Entrez votre mot de passe actuel"
                  />
                </FormGroup>

                <Divider />

                <FormGroup>
                  <FormLabel>Nouveau mot de passe</FormLabel>
                  <FormInput
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Entrez un nouveau mot de passe"
                  />
                  <p style={{
                    fontSize: '0.85rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    margin: '0.5rem 0 0 0'
                  }}>
                    Minimum 6 caractères
                  </p>
                </FormGroup>

                <FormGroup>
                  <FormLabel>Confirmer le nouveau mot de passe</FormLabel>
                  <FormInput
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirmez votre nouveau mot de passe"
                  />
                </FormGroup>

                <ButtonGroup>
                  <SaveButton type="submit" disabled={passwordLoading}>
                    {passwordLoading ? (
                      <>
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{ animation: 'spin 0.8s linear infinite' }}>
                          <path fillRule="evenodd" d="M4.293 5.293a1 1 0 011.414 0A8 8 0 1012 2a1 1 0 11-2 0 6 6 0 1-5.414 4.293z" clipRule="evenodd" />
                        </svg>
                        Changement...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" />
                        </svg>
                        Changer le mot de passe
                      </>
                    )}
                  </SaveButton>
                </ButtonGroup>
              </ProfileForm>
            </FormSection>
          </TabContent>
        </div>
      </ProfileContent>
    </ProfileContainer>
  );
};

export default ProfileSection;