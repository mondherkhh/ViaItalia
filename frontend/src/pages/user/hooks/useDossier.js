import { useState, useEffect } from 'react';
import dossierService from '../../../api/dossierService';

export const useDossier = (userId) => {
  const [dossier, setDossier] = useState({
    title: '',
    traductionStatus: 'PENDING',
    inscriptionStatus: 'PENDING',
    visaStatus: 'PENDING',
    createdAt: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDossier = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await dossierService.getDossierByUserId(userId);
      if (response.success && response.data) {
        setDossier(response.data);
      }
    } catch (err) {
      console.error('Error fetching dossier:', err);
      setError('Erreur lors de la récupération du dossier');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgress = () => {
    const statuses = [
      dossier.traductionStatus,
      dossier.inscriptionStatus,
      dossier.visaStatus
    ];
    
    const completedSteps = statuses.filter(status => status === 'COMPLETED').length;
    return (completedSteps / statuses.length) * 100;
  };

  const getStepStatus = (step) => {
    const stepMap = {
      'traduction': dossier.traductionStatus,
      'inscription': dossier.inscriptionStatus,
      'visa': dossier.visaStatus
    };
    
    return stepMap[step] || 'PENDING';
  };

  const isStepLocked = (step) => {
    const stepOrder = ['traduction', 'inscription', 'visa'];
    const currentIndex = stepOrder.indexOf(step);
    
    // Check if previous steps are completed
    for (let i = 0; i < currentIndex; i++) {
      const prevStep = stepOrder[i];
      if (getStepStatus(prevStep) !== 'COMPLETED') {
        return true;
      }
    }
    
    return false;
  };

  const getStepInfo = (step) => {
    const stepInfo = {
      traduction: {
        title: 'Traduction des Documents',
        description: 'Traduction officielle de vos documents',
        icon: '📄',
        estimatedTime: '5-7 jours'
      },
      inscription: {
        title: 'Inscription Universitaire',
        description: 'Finalisation de votre inscription',
        icon: '🎓',
        estimatedTime: '3-5 jours'
      },
      visa: {
        title: 'Demande de Visa',
        description: 'Préparation et soumission du dossier de visa',
        icon: '🛂',
        estimatedTime: '10-15 jours'
      }
    };
    
    return stepInfo[step] || {};
  };

  useEffect(() => {
    fetchDossier();
  }, [userId]);

  return {
    dossier,
    isLoading,
    error,
    fetchDossier,
    calculateProgress,
    getStepStatus,
    isStepLocked,
    getStepInfo
  };
};
