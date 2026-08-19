import { formatDate, formatTime, formatRelativeTime, getStatusLabel, getStatusColor, getStatusIcon } from './helpers';

// Appointment formatters
export const formatAppointment = (appointment) => {
  return {
    ...appointment,
    formattedDate: formatDate(appointment.date),
    formattedTime: formatTime(appointment.date),
    formattedDateTime: formatDate(appointment.date, { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) + ' à ' + formatTime(appointment.date),
    statusLabel: getStatusLabel(appointment.status),
    statusColor: getStatusColor(appointment.status),
    statusIcon: getStatusIcon(appointment.status),
    etatLabel: appointment.etat === 'PRESENTIEL' ? 'Présentiel' : 'En ligne',
    etatIcon: appointment.etat === 'PRESENTIEL' ? '🏢' : '💻'
  };
};

export const formatAppointmentList = (appointments) => {
  return appointments.map(formatAppointment);
};

export const formatAppointmentForCalendar = (appointment) => {
  return {
    id: appointment.id,
    title: appointment.type,
    start: new Date(appointment.date),
    end: new Date(new Date(appointment.date).getTime() + 60 * 60 * 1000), // Add 1 hour
    backgroundColor: getStatusColor(appointment.status),
    borderColor: getStatusColor(appointment.status),
    extendedProps: {
      ...appointment,
      status: appointment.status,
      type: appointment.type
    }
  };
};

// Message formatters
export const formatMessage = (message) => {
  return {
    ...message,
    formattedTime: formatTime(message.createdAt),
    formattedDate: formatDate(message.createdAt),
    formattedRelativeTime: formatRelativeTime(message.createdAt),
    isOwn: message.sender === 'USER',
    senderLabel: message.sender === 'USER' ? 'Vous' : 'Support',
    senderColor: message.sender === 'USER' ? 'green' : 'blue'
  };
};

export const formatMessageList = (messages) => {
  return messages.map(formatMessage);
};

export const formatMessageForDisplay = (message) => {
  const formatted = formatMessage(message);
  return {
    ...formatted,
    position: formatted.isOwn ? 'right' : 'left',
    bgColor: formatted.isOwn ? 'bg-green-600' : 'bg-gray-600',
    textColor: 'text-white',
    timestampColor: formatted.isOwn ? 'text-green-200' : 'text-gray-300'
  };
};

// University formatters
export const formatUniversitySelection = (universityInfo) => {
  return {
    ...universityInfo,
    hasSelection: universityInfo.university && universityInfo.specialty && universityInfo.level,
    selectionSummary: universityInfo.university && universityInfo.specialty && universityInfo.level
      ? `${universityInfo.university} - ${universityInfo.specialty} - ${universityInfo.level}`
      : 'Sélection incomplète',
    completionPercentage: [
      universityInfo.university,
      universityInfo.specialty,
      universityInfo.level
    ].filter(Boolean).length / 3 * 100
  };
};

export const formatUniversityOptions = (universities) => {
  return universities.map(university => ({
    value: university,
    label: university,
    searchTerms: university.toLowerCase()
  }));
};

export const formatSpecialtyOptions = (specialties) => {
  return specialties.map(specialty => ({
    value: specialty,
    label: specialty,
    searchTerms: specialty.toLowerCase()
  }));
};

export const formatLevelOptions = (levels) => {
  return levels.map(level => ({
    value: level,
    label: level,
    searchTerms: level.toLowerCase()
  }));
};

// Contract formatters
export const formatContract = (contract) => {
  return {
    ...contract,
    statusLabel: getStatusLabel(contract.status),
    statusColor: getStatusColor(contract.status),
    statusIcon: getStatusIcon(contract.status),
    formattedUploadDate: contract.uploadedAt ? formatDate(contract.uploadedAt) : null,
    canUpload: contract.status === 'PENDING',
    canDownload: contract.status !== 'PENDING',
    isUploaded: contract.status !== 'PENDING',
    progressPercentage: contract.status === 'PENDING' ? 0 : 
                       contract.status === 'UPLOADED' ? 50 : 
                       contract.status === 'CONFIRMED' ? 100 : 0
  };
};

export const formatContractList = (contracts) => {
  return contracts.map(formatContract);
};

// Dossier formatters
export const formatDossier = (dossier) => {
  const steps = [
    { key: 'traduction', status: dossier.traductionStatus },
    { key: 'inscription', status: dossier.inscriptionStatus },
    { key: 'visa', status: dossier.visaStatus }
  ];
  
  const completedSteps = steps.filter(step => step.status === 'COMPLETED').length;
  const progressPercentage = (completedSteps / steps.length) * 100;
  
  return {
    ...dossier,
    steps: steps.map(step => ({
      ...step,
      label: getStepLabel(step.key),
      icon: getStepIcon(step.key),
      statusLabel: getStatusLabel(step.status),
      statusColor: getStatusColor(step.status),
      statusIcon: getStatusIcon(step.status),
      isLocked: isStepLocked(step.key, steps),
      canProceed: step.status === 'COMPLETED'
    })),
    progressPercentage,
    completedSteps,
    totalSteps: steps.length,
    formattedCreatedAt: dossier.createdAt ? formatDate(dossier.createdAt) : null,
    statusLabel: getDossierStatusLabel(progressPercentage),
    statusColor: getDossierStatusColor(progressPercentage)
  };
};

const getStepLabel = (step) => {
  const labels = {
    traduction: 'Traduction des Documents',
    inscription: 'Inscription Universitaire',
    visa: 'Demande de Visa'
  };
  return labels[step] || step;
};

const getStepIcon = (step) => {
  const icons = {
    traduction: '📄',
    inscription: '🎓',
    visa: '🛂'
  };
  return icons[step] || '📋';
};

const isStepLocked = (currentStep, allSteps) => {
  const stepOrder = ['traduction', 'inscription', 'visa'];
  const currentIndex = stepOrder.indexOf(currentStep);
  
  for (let i = 0; i < currentIndex; i++) {
    const prevStep = allSteps.find(s => s.key === stepOrder[i]);
    if (prevStep && prevStep.status !== 'COMPLETED') {
      return true;
    }
  }
  
  return false;
};

const getDossierStatusLabel = (progress) => {
  if (progress === 0) return 'Non commencé';
  if (progress < 33) return 'Traduction en cours';
  if (progress < 66) return 'Inscription en cours';
  if (progress < 100) return 'Demande de visa en cours';
  return 'Terminé';
};

const getDossierStatusColor = (progress) => {
  if (progress === 0) return 'gray';
  if (progress < 33) return 'yellow';
  if (progress < 66) return 'blue';
  if (progress < 100) return 'purple';
  return 'green';
};

// Announcement formatters
export const formatAnnouncement = (announcement) => {
  return {
    ...announcement,
    formattedDate: formatDate(announcement.createdAt),
    formattedRelativeTime: formatRelativeTime(announcement.createdAt),
    typeLabel: getAnnouncementTypeLabel(announcement.type),
    typeColor: getAnnouncementTypeColor(announcement.type),
    typeIcon: getAnnouncementTypeIcon(announcement.type),
    priority: getAnnouncementPriority(announcement.type)
  };
};

export const formatAnnouncementList = (announcements) => {
  return announcements
    .map(formatAnnouncement)
    .sort((a, b) => b.priority - a.priority);
};

const getAnnouncementTypeLabel = (type) => {
  const labels = {
    'INFO': 'Information',
    'SUCCESS': 'Succès',
    'WARNING': 'Attention',
    'ERROR': 'Erreur',
    'UPDATE': 'Mise à jour'
  };
  return labels[type] || 'Information';
};

const getAnnouncementTypeColor = (type) => {
  const colors = {
    'INFO': 'blue',
    'SUCCESS': 'green',
    'WARNING': 'yellow',
    'ERROR': 'red',
    'UPDATE': 'purple'
  };
  return colors[type] || 'blue';
};

const getAnnouncementTypeIcon = (type) => {
  const icons = {
    'INFO': 'ℹ️',
    'SUCCESS': '✅',
    'WARNING': '⚠️',
    'ERROR': '❌',
    'UPDATE': '🔄'
  };
  return icons[type] || '📢';
};

const getAnnouncementPriority = (type) => {
  const priorities = {
    'ERROR': 5,
    'WARNING': 4,
    'UPDATE': 3,
    'SUCCESS': 2,
    'INFO': 1
  };
  return priorities[type] || 1;
};

// Notification formatters
export const formatNotification = (notification) => {
  return {
    ...notification,
    formattedTime: formatRelativeTime(notification.createdAt),
    typeLabel: getNotificationTypeLabel(notification.type),
    typeIcon: getNotificationTypeIcon(notification.type),
    isUnread: !notification.isRead,
    urgency: getNotificationUrgency(notification.type)
  };
};

export const formatNotificationList = (notifications) => {
  return notifications
    .map(formatNotification)
    .sort((a, b) => b.urgency - a.urgency);
};

const getNotificationTypeLabel = (type) => {
  const labels = {
    'APPOINTMENT': 'Rendez-vous',
    'MESSAGE': 'Message',
    'CONTRACT': 'Contrat',
    'DOSSIER': 'Dossier',
    'ANNOUNCEMENT': 'Annonce',
    'SYSTEM': 'Système',
    'SUCCESS': 'Succès',
    'WARNING': 'Attention',
    'ERROR': 'Erreur'
  };
  return labels[type] || 'Notification';
};

const getNotificationTypeIcon = (type) => {
  const icons = {
    'APPOINTMENT': '📅',
    'MESSAGE': '💬',
    'CONTRACT': '📄',
    'DOSSIER': '📁',
    'ANNOUNCEMENT': '📢',
    'SYSTEM': '⚙️',
    'SUCCESS': '✅',
    'WARNING': '⚠️',
    'ERROR': '❌'
  };
  return icons[type] || '🔔';
};

const getNotificationUrgency = (type) => {
  const urgencies = {
    'ERROR': 5,
    'WARNING': 4,
    'APPOINTMENT': 3,
    'MESSAGE': 2,
    'CONTRACT': 2,
    'DOSSIER': 2,
    'SYSTEM': 1,
    'ANNOUNCEMENT': 1,
    'SUCCESS': 1
  };
  return urgencies[type] || 1;
};

// Dashboard summary formatters
export const formatDashboardSummary = (data) => {
  const {
    appointments,
    messages,
    universityInfo,
    contract,
    dossier,
    announcements,
    notifications
  } = data;
  
  return {
    appointments: {
      total: appointments.length,
      upcoming: appointments.filter(apt => new Date(apt.date) >= new Date()).length,
      pending: appointments.filter(apt => apt.status === 'PENDING').length,
      confirmed: appointments.filter(apt => apt.status === 'CONFIRMED').length
    },
    messages: {
      total: messages.length,
      unread: messages.filter(msg => !msg.isRead).length,
      latest: messages.length > 0 ? messages[messages.length - 1] : null
    },
    university: {
      isComplete: !!(universityInfo.university && universityInfo.specialty && universityInfo.level),
      completionPercentage: [
        universityInfo.university,
        universityInfo.specialty,
        universityInfo.level
      ].filter(Boolean).length / 3 * 100
    },
    contract: {
      status: contract.status,
      canUpload: contract.status === 'PENDING',
      isUploaded: contract.status !== 'PENDING'
    },
    dossier: {
      progress: calculateDossierProgress(dossier),
      currentStep: getCurrentDossierStep(dossier),
      isComplete: dossier.traductionStatus === 'COMPLETED' && 
                 dossier.inscriptionStatus === 'COMPLETED' && 
                 dossier.visaStatus === 'COMPLETED'
    },
    notifications: {
      unread: notifications.filter(n => !n.isRead).length,
      total: notifications.length
    },
    announcements: {
      total: announcements.length,
      latest: announcements.length > 0 ? announcements[0] : null
    }
  };
};

const calculateDossierProgress = (dossier) => {
  const steps = [dossier.traductionStatus, dossier.inscriptionStatus, dossier.visaStatus];
  const completedSteps = steps.filter(status => status === 'COMPLETED').length;
  return (completedSteps / steps.length) * 100;
};

const getCurrentDossierStep = (dossier) => {
  if (dossier.traductionStatus !== 'COMPLETED') return 'traduction';
  if (dossier.inscriptionStatus !== 'COMPLETED') return 'inscription';
  if (dossier.visaStatus !== 'COMPLETED') return 'visa';
  return 'completed';
};
