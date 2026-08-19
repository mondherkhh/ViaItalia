import React, { useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { useDossier } from '../../../hooks/useDossier';
import {
  DossierOverviewContainer,
  DossierContainer,
  HeaderSection,
  DossierTitle,
  MainCard,
  StepsGrid,
  StepCircle,
  StepStatus,
  DossierProgress,
  ProgressText,
  ProgressBar,
  ProgressFill,
  DossierDetailsCard,
  DossierDetailRow,
  DossierDetailLabel,
  DossierDetailValue,
  LoadingSpinner,
  EmptyState,
  EmptyStateIcon,
  EmptyStateText
} from './Dossier.styles';

/**
 * Status configuration constants
 * Maps status values to colors, icons, and display text
 */
const STATUS_CONFIG = {
  VALIDE: {
    color: 'success',
    icon: '✓',
    text: 'Validé',
    bgGradient: 'from-green-500 to-green-600'
  },
  EN_COURS: {
    color: 'warning',
    icon: '⟳',
    text: 'En cours',
    bgGradient: 'from-blue-500 to-blue-600'
  },
  EN_ATTENTE: {
    color: 'default',
    icon: '○',
    text: 'En attente',
    bgGradient: 'from-gray-500 to-gray-600'
  }
};

/**
 * Step configuration for the dossier progression
 */
const STEPS_CONFIG = [
  {
    id: 'traduction',
    title: 'Documents',
    emoji: '📄',
    description: 'Traduction et validation des documents',
    statusKey: 'traductionStatus',
    canProceed: () => true
  },
  {
    id: 'inscription',
    title: 'Application',
    emoji: '📝',
    description: 'Inscription académique et demande d\'admission',
    statusKey: 'inscriptionStatus',
    canProceed: (dossier) => dossier.traductionStatus === 'VALIDE'
  },
  {
    id: 'acceptation',
    title: 'Acceptation',
    emoji: '✅',
    description: 'Acceptation de l\'institution',
    statusKey: 'visaStatus',
    canProceed: (dossier) => dossier.inscriptionStatus === 'VALIDE'
  },
  {
    id: 'visa',
    title: 'Visa',
    emoji: '🛂',
    description: 'Demande et approbation du visa',
    statusKey: 'visaStatus',
    canProceed: (dossier) => dossier.visaStatus === 'VALIDE'
  }
];

/**
 * DossierSection Component
 * Displays administrative dossier progress with multi-step tracking
 */
const DossierSection = () => {
  const { user } = useAuth();
  const { dossier, isLoading, error } = useDossier(user?.id);

  /**
   * Make scrollbar completely invisible
   */
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
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  /**
   * Calculate overall progress percentage
   */
  const calculateProgress = () => {
    if (!dossier) return 0;
    const completedSteps = [
      dossier.traductionStatus === 'VALIDE',
      dossier.inscriptionStatus === 'VALIDE',
      dossier.visaStatus === 'VALIDE'
    ].filter(Boolean).length;
    return Math.round((completedSteps / 3) * 100);
  };

  /**
   * Get the next required step
   */
  const getNextStep = () => {
    if (!dossier) return null;
    
    if (dossier.traductionStatus !== 'VALIDE') return 'Traduction des documents';
    if (dossier.inscriptionStatus !== 'VALIDE') return 'Inscription académique';
    if (dossier.visaStatus !== 'VALIDE') return 'Dossier de visa';
    return 'Processus terminé';
  };

  /**
   * Get status configuration for a given status value
   */
  const getStatusConfig = (status) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.EN_ATTENTE;
  };

  /**
   * Determine if a step is locked based on dependencies
   */
  const isStepLocked = (step) => {
    return !step.canProceed(dossier);
  };

  if (isLoading) {
    return (
      <DossierOverviewContainer>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh',
          gap: '1.5rem'
        }}>
          <LoadingSpinner viewBox="0 0 50 50" width="80" height="80">
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="rgba(59, 130, 246, 0.6)"
              strokeWidth="4"
            />
          </LoadingSpinner>
          <p style={{ color: '#9ca3af', fontSize: '1.125rem' }}>
            Chargement de votre dossier...
          </p>
        </div>
      </DossierOverviewContainer>
    );
  }

  if (!dossier) {
    return (
      <DossierOverviewContainer>
        <EmptyState>
          <EmptyStateIcon>📁</EmptyStateIcon>
          <EmptyStateText>
            <h3>Aucun dossier trouvé</h3>
            <p>Vous n'avez pas encore de dossier administratif</p>
          </EmptyStateText>
        </EmptyState>
      </DossierOverviewContainer>
    );
  }

  const progress = calculateProgress();

  return (
    <DossierOverviewContainer>
      <DossierContainer>
        {/* Header Section */}
        <HeaderSection>
          <div style={{ textAlign: 'center' }}>
            <DossierTitle>Mon Dossier Administratif</DossierTitle>
            <p style={{ color: '#d1d5db', fontSize: '1.125rem', marginTop: '0.5rem' }}>
              Suivez l'évolution de votre dossier d'admission
            </p>
          </div>
        </HeaderSection>

        {/* Progress Card */}
        <MainCard>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              color: '#ffffff',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              Progression du Dossier
            </h2>

            {/* Steps Grid */}
            <StepsGrid>
              {STEPS_CONFIG.map((step, index) => {
                const status = dossier[step.statusKey];
                const statusConfig = getStatusConfig(status);
                const locked = isStepLocked(step) && step.id !== 'traduction';

                return (
                  <div
                    key={step.id}
                    style={{
                      textAlign: 'center',
                      animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <StepCircle
                      locked={locked}
                      status={statusConfig.color}
                      style={{
                        marginBottom: '1rem'
                      }}
                    >
                      <span style={{ fontSize: '1.875rem' }}>{step.emoji}</span>
                    </StepCircle>
                    <h3 style={{
                      color: '#ffffff',
                      fontWeight: 'bold',
                      fontSize: '1.125rem',
                      marginBottom: '0.5rem'
                    }}>
                      {step.title}
                    </h3>
                    <StepStatus status={statusConfig.color}>
                      {statusConfig.text}
                    </StepStatus>
                  </div>
                );
              })}
            </StepsGrid>
          </div>

          {/* Progress Bar */}
          <DossierProgress>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <ProgressText>Progression générale</ProgressText>
              <span style={{
                color: '#ffffff',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                {progress}%
              </span>
            </div>
            <ProgressBar>
              <ProgressFill percentage={progress} />
            </ProgressBar>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '0.75rem',
              fontSize: '0.875rem',
              color: '#9ca3af'
            }}>
              <span>
                Étapes complétées: {[
                  dossier.traductionStatus === 'VALIDE',
                  dossier.inscriptionStatus === 'VALIDE',
                  dossier.visaStatus === 'VALIDE'
                ].filter(Boolean).length} / 3
              </span>
              <span>Statut: Actif</span>
            </div>
          </DossierProgress>
        </MainCard>

        {/* Dossier Details Card */}
        <DossierDetailsCard>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#ffffff',
            marginBottom: '1.5rem'
          }}>
            Informations du Dossier
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            <DossierDetailRow>
              <DossierDetailLabel>Titre du dossier</DossierDetailLabel>
              <DossierDetailValue>{dossier.title}</DossierDetailValue>
            </DossierDetailRow>

            <DossierDetailRow>
              <DossierDetailLabel>Date de création</DossierDetailLabel>
              <DossierDetailValue>
                {new Date(dossier.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </DossierDetailValue>
            </DossierDetailRow>

            <DossierDetailRow>
              <DossierDetailLabel>Statut actuel</DossierDetailLabel>
              <StepStatus status="warning" style={{ width: 'fit-content' }}>
                Actif
              </StepStatus>
            </DossierDetailRow>

            <DossierDetailRow>
              <DossierDetailLabel>Prochaine étape</DossierDetailLabel>
              <DossierDetailValue>{getNextStep()}</DossierDetailValue>
            </DossierDetailRow>
          </div>
        </DossierDetailsCard>
      </DossierContainer>
    </DossierOverviewContainer>
  );
};

export default DossierSection;