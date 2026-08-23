import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { useAppointments } from '../../../hooks/useAppointments';
import { animateAppointmentCard, animateBookingForm } from '../../../utils/animations';
import {
  AppointmentsContainer,
  AppointmentsHeader,
  AppointmentsTitle,
  ToggleButton,
  BookingForm,
  FormGrid,
  FormGroup,
  FormLabel,
  FormInput,
  FormSelect,
  FormTextarea,
  SubmitButton,
  LoadingSpinner,
  AppointmentsList,
  AppointmentsListHeader,
  AppointmentCard,
  AppointmentHeader,
  AppointmentContent,
  AppointmentActions,
  StatusBadge,
  AppointmentTitle,
  AppointmentDetails,
  AppointmentDetail,
  DetailIcon,
  CancelButton,
  StatusText,
  EmptyState,
  EmptyStateIcon,
  EmptyStateText,
  NotificationMessage,
  AppointmentsTitle as MainTitle,
  AppointmentsHeader as MainHeader,
} from './Appointments.styles';

const AppointmentsSection = () => {
  const { user } = useAuth();
  const {
    appointments,
    timeSlots,
    isLoading,
    isCreating,
    newAppointment,
    createAppointment,
    deleteAppointment,
    updateAppointmentStatus,
    handleInputChange,
    resetNewAppointment,
    bookTimeSlot
  } = useAppointments(user?.id);

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [notification, setNotification] = useState(null);

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

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleToggleForm = () => {
    setShowBookingForm(!showBookingForm);
    if (!showBookingForm) {
      resetNewAppointment();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await createAppointment(newAppointment);
      setShowBookingForm(false);
      resetNewAppointment();
      showNotification('Rendez-vous créé avec succès!', 'success');
    } catch (error) {
      console.error('Error creating appointment:', error);
      showNotification('Erreur lors de la création du rendez-vous', 'error');
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await updateAppointmentStatus(appointmentId, 'CANCELLED');
      showNotification('Rendez-vous annulé', 'success');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      showNotification('Erreur lors de l\'annulation', 'error');
    }
  };

  const handleBookTimeSlot = async (slotId) => {
    try {
      await bookTimeSlot(slotId);
      showNotification('Créneau horaire réservé avec succès!', 'success');
    } catch (error) {
      console.error('Error booking time slot:', error);
      showNotification('Erreur lors de la réservation du créneau', 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
  };

  const formatAppointmentDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAppointmentTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmé';
      case 'CANCELLED':
        return 'Annulé';
      case 'PENDING':
      default:
        return 'En attente';
    }
  };

  const renderAppointmentCard = (appointment, index) => (
    <AppointmentCard
      key={appointment.id}
      ref={(el) => {
        if (el) {
          animateAppointmentCard(el, index * 0.1);
        }
      }}
    >
      <AppointmentHeader>
        <AppointmentContent>
          <StatusBadge status={appointment.status}>
            {getStatusLabel(appointment.status)}
          </StatusBadge>
          <AppointmentTitle>{appointment.type}</AppointmentTitle>
          <AppointmentDetails>
            <AppointmentDetail>
              <DetailIcon>📅</DetailIcon>
              {formatAppointmentDate(appointment.date)}
            </AppointmentDetail>
            <AppointmentDetail>
              <DetailIcon>🕐</DetailIcon>
              {formatAppointmentTime(appointment.date)}
            </AppointmentDetail>
            <AppointmentDetail>
              <DetailIcon>📍</DetailIcon>
              {appointment.etat === 'PRESENTIEL' ? 'Présentiel' : 'En ligne'}
            </AppointmentDetail>
            {appointment.notes && (
              <AppointmentDetail>
                <DetailIcon>📝</DetailIcon>
                {appointment.notes}
              </AppointmentDetail>
            )}
          </AppointmentDetails>
        </AppointmentContent>
        <AppointmentActions>
          {appointment.status === 'PENDING' && (
            <CancelButton onClick={() => handleCancelAppointment(appointment.id)}>
              Annuler
            </CancelButton>
          )}
          {appointment.status === 'CONFIRMED' && (
            <StatusText status={appointment.status}>Confirmé</StatusText>
          )}
          {appointment.status === 'CANCELLED' && (
            <StatusText status={appointment.status}>Annulé</StatusText>
          )}
        </AppointmentActions>
      </AppointmentHeader>
    </AppointmentCard>
  );


  const renderEmptyState = () => (
    <EmptyState>
      <EmptyStateIcon>📅</EmptyStateIcon>
      <EmptyStateText>Vous n'avez pas encore de rendez-vous.</EmptyStateText>
    </EmptyState>
  );

  return (
    <AppointmentsContainer>
      <MainHeader>
        <MainTitle>
           Mes Rendez-vous
        </MainTitle>
      </MainHeader>
      
      {notification && (
        <NotificationMessage type={notification.type}>
          {notification.message}
        </NotificationMessage>
      )}
      
      {/* Available Time Slots */}
      <AppointmentsList>
        <AppointmentsListHeader>Créneaux Disponibles</AppointmentsListHeader>
        
        {isLoading ? (
          <EmptyState>
            <LoadingSpinner viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.3" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </LoadingSpinner>
            <EmptyStateText>Chargement...</EmptyStateText>
          </EmptyState>
        ) : timeSlots.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon>🕐</EmptyStateIcon>
            <EmptyStateText>
              <h3>Aucun créneau disponible</h3>
              <p>Revenez plus tard pour voir les nouveaux créneaux horaires</p>
            </EmptyStateText>
          </EmptyState>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {timeSlots.map((slot) => (
              <AppointmentCard key={slot.id}>
                <AppointmentHeader>
                  <AppointmentContent>
                    <AppointmentTitle>
                      {new Date(slot.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </AppointmentTitle>
                    <AppointmentDetails>
                      <AppointmentDetail>
                        <DetailIcon>🕐</DetailIcon>
                        {slot.startTime} - {slot.endTime}
                      </AppointmentDetail>
                      <AppointmentDetail>
                        <DetailIcon>👥</DetailIcon>
                        {slot.currentBookings || 0}/{slot.maxBookings} réservations
                      </AppointmentDetail>
                    </AppointmentDetails>
                  </AppointmentContent>
                  <AppointmentActions>
                    <StatusBadge 
                      style={{
                        backgroundColor: slot.isAvailable ? '#10b981' : '#ef4444',
                        color: 'white'
                      }}
                    >
                      {slot.isAvailable ? '✅ Disponible' : '❌ Complet'}
                    </StatusBadge>
                  </AppointmentActions>
                </AppointmentHeader>
                <AppointmentActions style={{ marginTop: '1rem' }}>
                  {slot.isAvailable ? (
                    <button
                      onClick={() => handleBookTimeSlot(slot.id)}
                      disabled={isCreating}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: isCreating ? 'not-allowed' : 'pointer',
                        opacity: isCreating ? 0.6 : 1,
                        transition: 'all 0.2s'
                      }}
                    >
                      {isCreating ? 'Réservation...' : 'Réserver ce créneau'}
                    </button>
                  ) : (
                    <span style={{ 
                      color: '#9ca3af', 
                      fontSize: '0.875rem',
                      fontStyle: 'italic'
                    }}>
                      Ce créneau est complet
                    </span>
                  )}
                </AppointmentActions>
              </AppointmentCard>
            ))}
          </div>
        )}
      </AppointmentsList>

      {/* My Appointments */}
      <AppointmentsList style={{ marginTop: '2rem' }}>
        <AppointmentsListHeader>Mes Rendez-vous</AppointmentsListHeader>
        
        {appointments.length === 0 ? (
          renderEmptyState()
        ) : (
          appointments.map(renderAppointmentCard)
        )}
      </AppointmentsList>
    </AppointmentsContainer>
  );
};

export default AppointmentsSection;
