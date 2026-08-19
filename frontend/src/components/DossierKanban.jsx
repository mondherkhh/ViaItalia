import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import dossierService from '../api/dossierService';

const KanbanContainer = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  overflow-x: auto;
  min-height: 600px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 15px;
`;

const StatusColumn = styled.div`
  flex: 1;
  min-width: 300px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
`;

const ColumnHeader = styled.div`
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  color: white;
  font-size: 1.1rem;
`;

const DossierCount = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
  margin-top: 0.25rem;
`;

const DossierList = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
  min-height: 400px;
`;

const DossierCard = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  padding: 1rem;
  cursor: grab;
  transition: all 0.3s ease;
  color: white;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &.dragging {
    opacity: 0.5;
    cursor: grabbing;
    transform: rotate(5deg);
  }

  &.drag-over {
    border: 2px dashed #00ff33;
    background: rgba(0, 255, 51, 0.1);
  }
`;

const DossierTitle = styled.div`
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 1rem;
`;

const DossierUser = styled.div`
  font-size: 0.85rem;
  opacity: 0.8;
  margin-bottom: 0.25rem;
`;

const DossierDate = styled.div`
  font-size: 0.75rem;
  opacity: 0.6;
`;

const StatusIndicator = styled.div`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 0.5rem;
`;

const ViewModeToggle = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0 1rem;
`;

const ModeButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${props => props.active ? 'rgba(0, 255, 51, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 255, 51, 0.3);
  }
`;

const statusColors = {
  PENDING: '#ff6b6b',
  VALIDATED: '#51cf66',
  REJECTED: '#ff6b6b',
  EN_COURS: '#339af0',
  VALIDE: '#51cf66'
};

const statusTranslations = {
  PENDING: 'En attente',
  VALIDATED: 'Validé',
  REJECTED: 'Rejeté',
  EN_COURS: 'En cours',
  VALIDE: 'Validé'
};

const DossierKanban = ({ dossiers, onDossierUpdate }) => {
  const [viewMode, setViewMode] = useState('traduction'); // Start with traduction instead of status
  const [draggedDossier, setDraggedDossier] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);
  const [editingTitle, setEditingTitle] = useState(null);
  const [titleInput, setTitleInput] = useState('');

  const getStatusColumns = () => {
    switch (viewMode) {
      case 'traduction':
        return ['EN_COURS', 'VALIDE'];
      case 'inscription':
        return ['EN_COURS', 'VALIDE'];
      case 'visa':
        return ['EN_COURS', 'VALIDE'];
      default:
        return ['EN_COURS', 'VALIDE'];
    }
  };

  const getDossiersByStatus = (status) => {
    return dossiers.filter(dossier => {
      switch (viewMode) {
        case 'traduction':
          return dossier.traductionStatus === status;
        case 'inscription':
          return dossier.inscriptionStatus === status;
        case 'visa':
          return dossier.visaStatus === status;
        default:
          return dossier.traductionStatus === status; // Default to traduction
      }
    });
  };

  const handleDragStart = (e, dossier) => {
    console.log('Drag started:', dossier);
    setDraggedDossier(dossier);
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = (e) => {
    console.log('Drag ended');
    e.target.classList.remove('dragging');
    setDraggedDossier(null);
    setDragOverStatus(null);
  };

  const handleDragOver = (e, status) => {
    console.log('Drag over:', status);
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStatus(status);
  };

  const handleDragLeave = () => {
    console.log('Drag leave');
    setDragOverStatus(null);
  };

  const handleMainStatusUpdate = async (dossier, newStatus) => {
    try {
      const response = await dossierService.updateDossier(dossier.id, {
        status: newStatus
      });
      
      if (response.success) {
        onDossierUpdate && onDossierUpdate(response.data);
        showNotification('Statut principal mis à jour avec succès!');
      }
    } catch (error) {
      console.error('Error updating main status:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de la mise à jour';
      showNotification(errorMessage, 'error');
    }
  };

  const checkAndUpdateMainStatus = async (dossier) => {
    // Check if all sub-statuses are VALIDE
    if (dossier.traductionStatus === 'VALIDE' && 
        dossier.inscriptionStatus === 'VALIDE' && 
        dossier.visaStatus === 'VALIDE') {
      
      // Only update if main status is not already VALIDATED
      if (dossier.status !== 'VALIDATED') {
        try {
          const response = await dossierService.updateDossier(dossier.id, {
            status: 'VALIDATED'
          });
          
          if (response.success) {
            onDossierUpdate && onDossierUpdate(response.data);
            showNotification('Statut principal automatiquement mis à jour: VALIDÉ!');
          }
        } catch (error) {
          console.error('Error auto-updating main status:', error);
        }
      }
    }
  };

  const updateDossierTitleWithStatus = async (dossier, newStatus, viewType, customBaseTitle = null) => {
    try {
      let newTitle = customBaseTitle || dossier.title || 'Dossier';
      
      // Extract base title (remove existing status suffix if present)
      const baseTitleMatch = newTitle.match(/^(.+?)(?:\s*-\s*[📝📋🛂]\s*[^:]+:.*)?$/);
      if (baseTitleMatch) {
        newTitle = baseTitleMatch[1].trim();
      }
      
      // Add new status suffix based on current view mode
      let statusText = '';
      switch (viewType) {
        case 'traduction':
          statusText = (newStatus || dossier.traductionStatus) === 'VALIDE' ? 'Validé' : 
                      (newStatus || dossier.traductionStatus) === 'EN_COURS' ? 'En cours' : 'En attente';
          newTitle = `${newTitle} - 📝 Traduction: ${statusText}`;
          break;
        case 'inscription':
          statusText = (newStatus || dossier.inscriptionStatus) === 'VALIDE' ? 'Validé' : 
                      (newStatus || dossier.inscriptionStatus) === 'EN_COURS' ? 'En cours' : 'En attente';
          newTitle = `${newTitle} - 📋 Inscription: ${statusText}`;
          break;
        case 'visa':
          statusText = (newStatus || dossier.visaStatus) === 'VALIDE' ? 'Validé' : 
                      (newStatus || dossier.visaStatus) === 'EN_COURS' ? 'En cours' : 'En attente';
          newTitle = `${newTitle} - 🛂 Dossier Visa: ${statusText}`;
          break;
      }
      
      const response = await dossierService.updateDossier(dossier.id, {
        title: newTitle
      });
      
      if (response.success) {
        onDossierUpdate && onDossierUpdate(response.data);
      }
    } catch (error) {
      console.error('Error updating title with status:', error);
    }
  };

  const updateDossierTitle = async (dossierId, newTitle) => {
    try {
      const response = await dossierService.updateDossier(dossierId, {
        title: newTitle
      });
      
      if (response.success) {
        onDossierUpdate && onDossierUpdate(response.data);
        showNotification('Titre mis à jour avec succès!');
      }
    } catch (error) {
      console.error('Error updating title:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de la mise à jour du titre';
      showNotification(errorMessage, 'error');
    }
  };

  const getAutoTitle = (dossier, viewMode) => {
    const baseTitle = dossier.title || 'Dossier';
    let statusText = '';
    
    switch (viewMode) {
      case 'traduction':
        statusText = dossier.traductionStatus === 'VALIDE' ? 'Validé' : 
                    dossier.traductionStatus === 'EN_COURS' ? 'En cours' : 'En attente';
        return `${baseTitle} - 📝 Traduction: ${statusText}`;
      case 'inscription':
        statusText = dossier.inscriptionStatus === 'VALIDE' ? 'Validé' : 
                    dossier.inscriptionStatus === 'EN_COURS' ? 'En cours' : 'En attente';
        return `${baseTitle} - 📋 Inscription: ${statusText}`;
      case 'visa':
        statusText = dossier.visaStatus === 'VALIDE' ? 'Validé' : 
                    dossier.visaStatus === 'EN_COURS' ? 'En cours' : 'En attente';
        return `${baseTitle} - 🛂 Dossier Visa: ${statusText}`;
      default:
        return baseTitle;
    }
  };

  const handleTitleEdit = (dossier) => {
    // Extract base title (remove status suffix if present)
    let baseTitle = dossier.title || 'Dossier';
    const baseTitleMatch = baseTitle.match(/^(.+?)(?:\s*-\s*[📝📋🛂]\s*[^:]+:.*)?$/);
    if (baseTitleMatch) {
      baseTitle = baseTitleMatch[1].trim();
    }
    
    setEditingTitle(dossier.id);
    setTitleInput(baseTitle);
  };

  const handleTitleSave = async (dossierId) => {
    if (titleInput.trim()) {
      // Find the dossier to get current status
      const dossier = dossiers.find(d => d.id === dossierId);
      if (dossier) {
        await updateDossierTitleWithStatus(dossier, null, viewMode, titleInput.trim());
      }
    }
    setEditingTitle(null);
    setTitleInput('');
  };

  const handleTitleCancel = () => {
    setEditingTitle(null);
    setTitleInput('');
  };

  const handleTitleKeyPress = (e, dossierId) => {
    if (e.key === 'Enter') {
      handleTitleSave(dossierId);
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  };

  const checkStatusDependencies = (dossier, targetStatus, viewType) => {
    // Check if the update is allowed based on current statuses
    switch (viewType) {
      case 'inscription':
        if (dossier.traductionStatus !== 'VALIDE') {
          return {
            allowed: false,
            message: 'Impossible de mettre à jour l\'inscription tant que la traduction n\'est pas VALIDÉE'
          };
        }
        break;
      case 'visa':
        if (dossier.inscriptionStatus !== 'VALIDE') {
          return {
            allowed: false,
            message: 'Impossible de mettre à jour le visa tant que l\'inscription n\'est pas VALIDÉE'
          };
        }
        break;
      case 'traduction':
        if (dossier.visaStatus === 'VALIDE') {
          return {
            allowed: false,
            message: 'Impossible de mettre à jour la traduction quand le visa est déjà VALIDÉ'
          };
        }
        break;
      default:
        return { allowed: true };
    }
    return { allowed: true };
  };

  const showNotification = (message, type = 'success') => {
    const notificationDiv = document.createElement('div');
    notificationDiv.className = `fixed top-4 right-4 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center`;
    notificationDiv.innerHTML = `
      <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        ${type === 'success' 
          ? '<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2m0 0l2-2m-2 2l-2-2" />'
          : '<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />'
        }
      </svg>
      <span>${message}</span>
    `;
    document.body.appendChild(notificationDiv);
    
    setTimeout(() => {
      if (document.body.contains(notificationDiv)) {
        document.body.removeChild(notificationDiv);
      }
    }, 3000);
  };

  const handleDrop = async (e, newStatus) => {
    console.log('Drop triggered:', newStatus, draggedDossier);
    e.preventDefault();
    setDragOverStatus(null);

    if (!draggedDossier) {
      console.log('No dragged dossier');
      return;
    }

    // Check status dependencies before proceeding
    const dependencyCheck = checkStatusDependencies(draggedDossier, newStatus, viewMode);
    if (!dependencyCheck.allowed) {
      showNotification(dependencyCheck.message, 'error');
      return;
    }

    try {
      let updateData = {};
      
      switch (viewMode) {
        case 'status':
          updateData.status = newStatus;
          break;
        case 'traduction':
          updateData.traductionStatus = newStatus;
          break;
        case 'inscription':
          updateData.inscriptionStatus = newStatus;
          break;
        case 'visa':
          updateData.visaStatus = newStatus;
          break;
        default:
          updateData.status = newStatus;
      }

      const response = await dossierService.updateDossier(draggedDossier.id, updateData);
      
      if (response.success) {
        // Update title with new status
        await updateDossierTitleWithStatus(response.data, newStatus, viewMode);
        
        // Check if all sub-statuses are validated and auto-update main status
        await checkAndUpdateMainStatus(response.data);
        
        // Show success notification
        showNotification('Dossier mis à jour avec succès!');
      }
    } catch (error) {
      console.error('Error updating dossier:', error);
      
      // Show error notification
      const errorMessage = error.response?.data?.message || 'Erreur lors de la mise à jour';
      showNotification(errorMessage, 'error');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const getColumnHeaderColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'linear-gradient(135deg, #ff6b6b, #ff8787)';
      case 'VALIDATED':
        return 'linear-gradient(135deg, #51cf66, #69db7c)';
      case 'REJECTED':
        return 'linear-gradient(135deg, #ff6b6b, #ff8787)';
      case 'EN_COURS':
        return 'linear-gradient(135deg, #339af0, #5c7cfa)';
      case 'VALIDE':
        return 'linear-gradient(135deg, #51cf66, #69db7c)';
      default:
        return 'linear-gradient(135deg, #868e96, #adb5bd)';
    }
  };

  const handleRestartStatus = async (dossierId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir redémarrer le statut de ce dossier? Cela réinitialisera tous les statuts (principal, traduction, inscription, visa) à leur état initial. Cette action est irréversible.')) return;
    
    try {
      const response = await dossierService.updateDossier(dossierId, {
        status: 'PENDING',
        traductionStatus: 'EN_COURS',
        inscriptionStatus: 'EN_COURS',
        visaStatus: 'EN_COURS'
      });
      
      if (response.success) {
        // Show success notification
        showNotification('Statuts du dossier redémarrés avec succès!', 'success');
        
        // Trigger refresh of parent component
        if (onDossierUpdate) {
          onDossierUpdate(response.data);
        }
      }
    } catch (error) {
      console.error('Error restarting dossier status:', error);
      showNotification('Erreur lors du redémarrage du statut du dossier', 'error');
    }
  };

  return (
    <div>
      {/* Comprehensive Dossier Table */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        padding: '1rem',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h3 style={{
          color: 'white',
          marginBottom: '1rem',
          fontSize: '1.2rem',
          fontWeight: '600',
          textAlign: 'center'
        }}>
          📋 Tous les Dossiers
        </h3>
        
        <div style={{
          overflowX: 'auto',
          maxHeight: '600px'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            color: 'white'
          }}>
            <thead>
              <tr style={{
                background: 'rgba(255, 255, 255, 0.1)'
              }}>
                <th style={{
                  padding: '0.75rem',
                  textAlign: 'left',
                  borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}>ID</th>
                <th style={{
                  padding: '0.75rem',
                  textAlign: 'left',
                  borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}>Titre</th>
                <th style={{
                  padding: '0.75rem',
                  textAlign: 'left',
                  borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}>Utilisateur</th>
                <th style={{
                  padding: '0.75rem',
                  textAlign: 'left',
                  borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}>Email</th>
                <th style={{
                  padding: '0.75rem',
                  textAlign: 'left',
                  borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}>Statut Principal</th>
                <th style={{
                  padding: '0.75rem',
                  textAlign: 'left',
                  borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}>Traduction</th>
                <th style={{
                  padding: '0.75rem',
                  textAlign: 'left',
                  borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}>Inscription</th>
                <th style={{
                  padding: '0.75rem',
                  textAlign: 'left',
                  borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}>Dossier Visa</th>
                <th style={{
                  padding: '0.75rem',
                  textAlign: 'left',
                  borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}>Créé le</th>
              </tr>
            </thead>
            <tbody>
              {dossiers.map(dossier => (
                <tr 
                  key={dossier.id}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
             
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                >
                  <td style={{
                    padding: '0.75rem',
                    fontSize: '0.85rem'
                  }}>{dossier.id}</td>
                  <td style={{
                    padding: '0.75rem',
                    fontWeight: '500',
                    fontSize: '0.9rem'
                  }}>{dossier.title}</td>
                  <td style={{
                    padding: '0.75rem',
                    fontSize: '0.85rem'
                  }}>
                    {dossier.user?.firstName} {dossier.user?.lastName}
                  </td>
                  <td style={{
                    padding: '0.75rem',
                    fontSize: '0.85rem',
                    opacity: '0.8'
                  }}>{dossier.user?.email}</td>
                  <td style={{
                    padding: '0.75rem',
                    textAlign: 'center'
                  }}>
                    <span style={{
                      background: getColumnHeaderColor(dossier.status),
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      {statusTranslations[dossier.status] || dossier.status}
                    </span>
                  </td>
                  <td style={{
                    padding: '0.75rem',
                    textAlign: 'center'
                  }}>
                    <span style={{
                      background: getColumnHeaderColor(dossier.traductionStatus),
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      {statusTranslations[dossier.traductionStatus] || dossier.traductionStatus}
                    </span>
                  </td>
                  <td style={{
                    padding: '0.75rem',
                    textAlign: 'center'
                  }}>
                    <span style={{
                      background: getColumnHeaderColor(dossier.inscriptionStatus),
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      {statusTranslations[dossier.inscriptionStatus] || dossier.inscriptionStatus}
                    </span>
                  </td>
                  <td style={{
                    padding: '0.75rem',
                    textAlign: 'center'
                  }}>
                    <span style={{
                      background: getColumnHeaderColor(dossier.visaStatus),
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      {statusTranslations[dossier.visaStatus] || dossier.visaStatus}
                    </span>
                  </td>
                  <td style={{
                    padding: '0.75rem',
                    fontSize: '0.85rem',
                    opacity: '0.7'
                  }}>{formatDate(dossier.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '10px',
        marginBottom: '1rem',
        textAlign: 'center',
        fontSize: '1.1rem',
        fontWeight: '600'
      }}>
        📊 Statut Principal géré automatiquement
      </div>

      <ViewModeToggle>
        <ModeButton 
          active={viewMode === 'traduction'} 
          onClick={() => setViewMode('traduction')}
        >
          📝 Traduction
        </ModeButton>
        <ModeButton 
          active={viewMode === 'inscription'} 
          onClick={() => setViewMode('inscription')}
        >
          📋 Inscription
        </ModeButton>
        <ModeButton 
          active={viewMode === 'visa'} 
          onClick={() => setViewMode('visa')}
        >
          🛂 Dossier Visa
        </ModeButton>
      </ViewModeToggle>

      {/* Restart Status Section */}
      <div style={{
        background: 'rgba(255, 107, 107, 0.1)',
        border: '1px solid rgba(255, 107, 107, 0.3)',
        borderRadius: '10px',
        padding: '1rem',
        marginBottom: '1rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#ff6b6b',
            fontWeight: '600'
          }}>
            🔄 Redémarrer Statut de Dossier
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <select
              id="restartDossierSelect"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '6px',
                padding: '0.5rem',
                color: 'white',
                fontSize: '0.9rem',
                outline: 'none',
                minWidth: '200px'
              }}
            >
              <option value="" style={{
                background: '#2c3e50',
                color: 'white'
              }}>Sélectionner un dossier...</option>
              {dossiers.map(dossier => (
                <option key={dossier.id} value={dossier.id} style={{
                  background: '#2c3e50',
                  color: 'white'
                }}>
                  {dossier.title} - {dossier.user?.firstName} {dossier.user?.lastName}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                const select = document.getElementById('restartDossierSelect');
                const dossierId = select.value;
                if (dossierId) {
                  handleRestartStatus(dossierId);
                } else {
                  showNotification('Veuillez sélectionner un dossier à redémarrer', 'error');
                }
              }}
              style={{
                background: 'linear-gradient(135deg, #ff6b6b, #ff8787)',
                border: 'none',
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(255, 107, 107, 0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              🔄 Redémarrer
            </button>
          </div>
        </div>
        <div style={{
          fontSize: '0.8rem',
          color: 'rgba(255, 107, 107, 0.8)',
          marginTop: '0.5rem'
        }}>
          Réinitialise tous les statuts (principal, traduction, inscription, visa) à leur état initial
        </div>
      </div>

      <KanbanContainer>
        {getStatusColumns().map(status => {
          const dossiersInStatus = getDossiersByStatus(status);
          
          return (
            <StatusColumn key={status}>
              <ColumnHeader style={{ background: getColumnHeaderColor(status) }}>
                <div>
                  <StatusIndicator 
                    style={{ backgroundColor: statusColors[status] }}
                  />
                  {statusTranslations[status] || status}
                </div>
                <DossierCount>{dossiersInStatus.length} dossier{dossiersInStatus.length !== 1 ? 's' : ''}</DossierCount>
              </ColumnHeader>
              
              <DossierList
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  overflowY: 'auto',
                  minHeight: '400px',
                  border: dragOverStatus === status ? '2px dashed #00ff33' : 'none',
                  background: dragOverStatus === status ? 'rgba(0, 255, 51, 0.1)' : 'transparent'
                }}
                onDragOver={(e) => handleDragOver(e, status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, status)}
              >
                {dossiersInStatus.map(dossier => (
                  <DossierCard
                    key={dossier.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, dossier)}
                    onDragEnd={handleDragEnd}
                  >
                    {editingTitle === dossier.id ? (
                      <div style={{ marginBottom: '0.5rem' }}>
                        <input
                          type="text"
                          value={titleInput}
                          onChange={(e) => setTitleInput(e.target.value)}
                          onKeyDown={(e) => handleTitleKeyPress(e, dossier.id)}
                          onBlur={() => handleTitleSave(dossier.id)}
                          style={{
                            width: '100%',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '4px',
                            padding: '0.25rem 0.5rem',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: '600',
                            outline: 'none'
                          }}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <div 
                        onClick={() => handleTitleEdit(dossier)}
                        style={{ 
                          cursor: 'pointer',
                          fontWeight: '600',
                          marginBottom: '0.5rem',
                          fontSize: '1rem',
                          color: 'white'
                        }}
                      >
                        {dossier.title}
                      </div>
                    )}
                    <DossierUser>
                      {dossier.user?.firstName} {dossier.user?.lastName}
                    </DossierUser>
                    <DossierUser style={{ fontSize: '0.75rem', opacity: '0.6' }}>
                      {dossier.user?.email}
                    </DossierUser>
                    <DossierDate>
                      Créé le {formatDate(dossier.createdAt)}
                    </DossierDate>
                  </DossierCard>
                ))}
              </DossierList>
            </StatusColumn>
          );
        })}
      </KanbanContainer>
    </div>
  );
};

export default DossierKanban;
