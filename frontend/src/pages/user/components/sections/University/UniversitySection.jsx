import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { useUniversityInfo } from '../../../hooks/useUniversityInfo';
import { animateUniversityForm, animateUniversitySummary } from '../../../utils/animations';
import {
  UniversityContainer,
  UniversityForm,
  UniversityCard,
  UniversityIcon,
  UniversityTitle,
  UniversitySelect,
  UniversitySummary,
  SummaryTitle,
  SummaryGrid,
  SummaryItem,
  SummaryIcon,
  SummaryLabel,
  ActionButtons,
  ActionButton,
  LoadingSpinner,
  ModalOverlay,
  ModalContainer,
  ModalContent,
  ModalIcon,
  ModalTitle,
  ModalMessage,
  ModalButtons,
  ModalButton,
  EmptyState,
  EmptyStateIcon,
  EmptyStateText,
  ProgressIndicator,
  ProgressText,
  ProgressBar,
  ProgressFill
} from './University.styles';

const UniversitySection = () => {
  const { user } = useAuth();
  const {
    universityInfo,
    isSaving,
    isConfirmed,
    saveUniversityInfo,
    resetUniversityInfo,
    handleInputChange
  } = useUniversityInfo(user?.id);

  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    // Animate form cards
    const cards = document.querySelectorAll('[data-university-card]');
    cards.forEach((card, index) => {
      if (card) {
        setTimeout(() => {
          animateUniversityForm(card);
        }, index * 100);
      }
    });

    // Animate summary
    const summary = document.querySelector('[data-university-summary]');
    if (summary) {
      setTimeout(() => {
        animateUniversitySummary(summary);
      }, 300);
    }
  }, []);

  const handleSave = async () => {
    try {
      await saveUniversityInfo();
      setShowConfirmation(true);
    } catch (error) {
      console.error('Error saving university info:', error);
    }
  };

  const handleReset = () => {
    resetUniversityInfo();
  };

  const handleConfirm = () => {
    setShowConfirmation(false);
  };

  const handleModify = () => {
    setShowConfirmation(false);
    resetUniversityInfo();
  };

  const getUniversityDisplayName = (value) => {
    const universityNames = {
      'bologna': 'Université de Bologne (Alma Mater Studiorum)',
      'padova': 'Université de Padoue',
      'pavia': 'Université de Pavie',
      'napoli': 'Université de Naples - Federico II',
      'roma1': 'Université Sapienza de Rome',
      'roma2': 'Université de Rome - Tor Vergata',
      'roma3': 'Université de Rome - Roma Tre',
      'milano': 'Université de Milan',
      'milanobocconi': 'Université Bocconi de Milan',
      'milanopolitecnico': 'Université Polytechnique de Milan',
      'torino': 'Université de Turin',
      'torinopolitecnico': 'Université Polytechnique de Turin',
      'genova': 'Université de Gênes',
      'firenze': 'Université de Florence',
      'bari': 'Université de Bari',
      'catania': 'Université de Catane',
      'palermo': 'Université de Palerme',
      'salerno': 'Université de Salerne',
      'perugia': 'Université de Pérouse',
      'pisa': 'Université de Pise',
      'siena': 'Université de Sienne',
      'trieste': 'Université de Trieste',
      'udine': 'Université d\'Udine',
      'verona': 'Université de Vérone',
      'trento': 'Université de Trente',
      'sassari': 'Université de Sassari',
      'cagliari': 'Université de Cagliari',
      'ferrara': 'Université de Ferrare',
      'modena': 'Université de Modène et Reggio d\'Émilie',
      'parma': 'Université de Parme',
      'bergamo': 'Université de Bergame',
      'brescia': 'Université de Brescia',
      'como': 'Université de Côme',
      'varese': 'Université de Varèse',
      'lecce': 'Université de Lecce',
      'messina': 'Université de Messine',
      'potenza': 'Université de la Basilicate',
      'campobasso': 'Université du Molise',
      'aosta': 'Université de la Vallée d\'Aoste'
    };
    return universityNames[value] || 'Non sélectionnée';
  };

  const getLevelDisplayName = (value) => {
    const levelNames = {
      'licence1': 'Licence 1',
      'licence2': 'Licence 2',
      'licence3': 'Licence 3',
      'master1': 'Master 1',
      'master2': 'Master 2',
      'doctorat': 'Doctorat',
      'prepa': 'Prépa',
      'dut': 'DUT',
      'bts': 'BTS',
      'but': 'BUT'
    };
    return levelNames[value] || 'Non sélectionné';
  };

  const getCompletionPercentage = () => {
    const fields = [universityInfo.university, universityInfo.specialty, universityInfo.level];
    const completedFields = fields.filter(Boolean).length;
    return (completedFields / fields.length) * 100;
  };

  const renderUniversityForm = () => (
    <UniversityForm>
      <UniversityCard data-university-card>
        <UniversityIcon>🏫</UniversityIcon>
        <UniversityTitle>Université</UniversityTitle>
        <UniversitySelect
          name="university"
          value={universityInfo.university}
          onChange={handleInputChange}
          disabled={isConfirmed}
        >
          <option value="">Sélectionnez une université italienne</option>
          <option value="bologna">Université de Bologne (Alma Mater Studiorum)</option>
          <option value="padova">Université de Padoue</option>
          <option value="pavia">Université de Pavie</option>
          <option value="napoli">Université de Naples - Federico II</option>
          <option value="roma1">Université Sapienza de Rome</option>
          <option value="roma2">Université de Rome - Tor Vergata</option>
          <option value="roma3">Université de Rome - Roma Tre</option>
          <option value="milano">Université de Milan</option>
          <option value="milanobocconi">Université Bocconi de Milan</option>
          <option value="milanopolitecnico">Université Polytechnique de Milan</option>
          <option value="torino">Université de Turin</option>
          <option value="torinopolitecnico">Université Polytechnique de Turin</option>
          <option value="genova">Université de Gênes</option>
          <option value="firenze">Université de Florence</option>
          <option value="bari">Université de Bari</option>
          <option value="catania">Université de Catane</option>
          <option value="palermo">Université de Palerme</option>
          <option value="salerno">Université de Salerne</option>
          <option value="perugia">Université de Pérouse</option>
          <option value="pisa">Université de Pise</option>
          <option value="siena">Université de Sienne</option>
          <option value="trieste">Université de Trieste</option>
          <option value="udine">Université d\'Udine</option>
          <option value="verona">Université de Vérone</option>
          <option value="trento">Université de Trente</option>
          <option value="sassari">Université de Sassari</option>
          <option value="cagliari">Université de Cagliari</option>
          <option value="ferrara">Université de Ferrare</option>
          <option value="modena">Université de Modène et Reggio d\'Émilie</option>
          <option value="parma">Université de Parme</option>
          <option value="bergamo">Université de Bergame</option>
          <option value="brescia">Université de Brescia</option>
          <option value="como">Université de Côme</option>
          <option value="varese">Université de Varèse</option>
          <option value="lecce">Université de Lecce</option>
          <option value="messina">Université de Messine</option>
          <option value="potenza">Université de la Basilicate</option>
          <option value="campobasso">Université du Molise</option>
          <option value="aosta">Université de la Vallée d\'Aoste</option>
        </UniversitySelect>
      </UniversityCard>

      <UniversityCard data-university-card>
        <UniversityIcon>📚</UniversityIcon>
        <UniversityTitle>Spécialité</UniversityTitle>
        <UniversitySelect
          name="specialty"
          value={universityInfo.specialty}
          onChange={handleInputChange}
          disabled={isConfirmed}
        >
          <option value="">Sélectionnez une spécialité</option>
          <option value="droit">Droit</option>
          <option value="economie">Économie</option>
          <option value="gestion">Gestion</option>
          <option value="marketing">Marketing</option>
          <option value="finance">Finance</option>
          <option value="comptabilite">Comptabilité</option>
          <option value="commerce">Commerce International</option>
          <option value="communication">Communication</option>
          <option value="informatique">Informatique</option>
          <option value="mathematiques">Mathématiques</option>
          <option value="physique">Physique</option>
          <option value="chimie">Chimie</option>
          <option value="biologie">Biologie</option>
          <option value="medecine">Médecine</option>
          <option value="pharmacie">Pharmacie</option>
          <option value="psychologie">Psychologie</option>
          <option value="sociologie">Sociologie</option>
          <option value="histoire">Histoire</option>
          <option value="geographie">Géographie</option>
          <option value="lettres">Lettres Modernes</option>
          <option value="langues">Langues Étrangères</option>
          <option value="philosophie">Philosophie</option>
          <option value="arts">Arts Plastiques</option>
          <option value="musique">Musique</option>
          <option value="theatre">Théâtre</option>
          <option value="cinema">Cinéma</option>
          <option value="journalisme">Journalisme</option>
          <option value="tourisme">Tourisme</option>
          <option value="sport">Sciences du Sport</option>
          <option value="education">Sciences de l'Éducation</option>
          <option value="urbanisme">Urbanisme</option>
          <option value="architecture">Architecture</option>
          <option value="ingenierie">Ingénierie</option>
        </UniversitySelect>
      </UniversityCard>

      <UniversityCard data-university-card>
        <UniversityIcon>🎯</UniversityIcon>
        <UniversityTitle>Niveau d'Étude</UniversityTitle>
        <UniversitySelect
          name="level"
          value={universityInfo.level}
          onChange={handleInputChange}
          disabled={isConfirmed}
        >
          <option value="">Sélectionnez un niveau</option>
          <option value="licence1">Licence 1ère année</option>
          <option value="licence2">Licence 2ème année</option>
          <option value="licence3">Licence 3ème année</option>
          <option value="master1">Master 1ère année</option>
          <option value="master2">Master 2ème année</option>
          <option value="doctorat">Doctorat</option>
          <option value="prepa">Classe Préparatoire</option>
          <option value="dut">DUT</option>
          <option value="bts">BTS</option>
          <option value="but">BUT</option>
        </UniversitySelect>
      </UniversityCard>
    </UniversityForm>
  );

  const renderUniversitySummary = () => (
    <UniversitySummary data-university-summary>
      <SummaryTitle>Résumé de votre parcours</SummaryTitle>
      <SummaryGrid>
        <SummaryItem>
          <SummaryIcon>🏫</SummaryIcon>
          <SummaryLabel>{getUniversityDisplayName(universityInfo.university)}</SummaryLabel>
        </SummaryItem>
        <SummaryItem>
          <SummaryIcon>📚</SummaryIcon>
          <SummaryLabel>{universityInfo.specialty || 'Non sélectionnée'}</SummaryLabel>
        </SummaryItem>
        <SummaryItem>
          <SummaryIcon>🎯</SummaryIcon>
          <SummaryLabel>{getLevelDisplayName(universityInfo.level)}</SummaryLabel>
        </SummaryItem>
      </SummaryGrid>
      
      <ProgressIndicator>
        <ProgressText>Progression: {getCompletionPercentage().toFixed(0)}%</ProgressText>
        <ProgressBar>
          <ProgressFill percentage={getCompletionPercentage()} />
        </ProgressBar>
      </ProgressIndicator>
    </UniversitySummary>
  );

  const renderConfirmationModal = () => (
    <ModalOverlay>
      <ModalContainer>
        <ModalContent>
          <ModalIcon>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 2L9 19l-4-4h6" />
            </svg>
          </ModalIcon>
          <ModalTitle>Informations Enregistrées!</ModalTitle>
          <ModalMessage>
            Vos informations universitaires ont été enregistrées avec succès. Vous pouvez maintenant continuer à explorer d'autres universités ou modifier votre sélection.
          </ModalMessage>
          <ModalButtons>
            <ModalButton variant="primary" onClick={handleConfirm}>
              Continuer
            </ModalButton>
            <ModalButton onClick={handleModify}>
              Modifier
            </ModalButton>
          </ModalButtons>
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );

  return (
    <UniversityContainer>
      {renderUniversityForm()}
      {renderUniversitySummary()}
      
      <ActionButtons>
        {!isConfirmed ? (
          <ActionButton
            variant="primary"
            onClick={handleSave}
            disabled={isSaving || !universityInfo.university || !universityInfo.specialty || !universityInfo.level}
          >
            {isSaving ? (
              <>
                <LoadingSpinner viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.3" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </LoadingSpinner>
                Enregistrement...
              </>
            ) : (
              <>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2m0 0l2-2m-2 2l-2-2" />
                </svg>
                Confirmer mes choix
              </>
            )}
          </ActionButton>
        ) : (
          <ActionButton variant="secondary" onClick={handleReset}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Modifier mes choix
          </ActionButton>
        )}
      </ActionButtons>
      
      {showConfirmation && renderConfirmationModal()}
    </UniversityContainer>
  );
};

export default UniversitySection;
