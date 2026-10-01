import { useState, useEffect } from 'react';
import appointmentService from '../../../api/appointmentService';

export const useAppointments = (userId) => {
  const [appointments, setAppointments] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    date: '',
    time: '',
    type: '',
    etat: 'EN_LIGNE',
    notes: ''
  });
  const [error, setError] = useState(null);

  const fetchAppointments = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await appointmentService.getAppointmentsByUserId(userId);
      if (response.success && response.data) {
        setAppointments(response.data);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Erreur lors de la récupération des rendez-vous');
    } finally {
      setIsLoading(false);
    }
  };

  const createAppointment = async (appointmentData) => {
    if (!userId) return;
    
    setIsCreating(true);
    setError(null);
    
    try {
      const response = await appointmentService.createAppointment({
        ...appointmentData,
        userId
      });
      
      if (response.success && response.data) {
        setAppointments(prev => [...prev, response.data]);
        return response.data;
      }
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError('Erreur lors de la création du rendez-vous');
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  const deleteAppointment = async (appointmentId) => {
    try {
      const response = await appointmentService.deleteAppointment(appointmentId);
      if (response.success) {
        setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
      }
    } catch (err) {
      console.error('Error deleting appointment:', err);
      setError('Erreur lors de la suppression du rendez-vous');
      throw err;
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      const response = await appointmentService.updateAppointmentStatus(appointmentId, status);
      if (response.success && response.data) {
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId ? { ...apt, status: response.data.status } : apt
          )
        );
      }
    } catch (err) {
      console.error('Error updating appointment status:', err);
      setError('Erreur lors de la mise à jour du statut');
      throw err;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAppointment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetNewAppointment = () => {
    setNewAppointment({
      date: '',
      time: '',
      type: '',
      etat: 'EN_LIGNE',
      notes: ''
    });
  };

  // Time slot functions
  const fetchTimeSlots = async () => {
    try {
      const response = await appointmentService.getAvailableSlots();
      if (response.success && response.data) {
        setTimeSlots(response.data);
      }
    } catch (err) {
      console.error('Error fetching time slots:', err);
      setError('Erreur lors de la récupération des créneaux horaires');
    }
  };

  const bookTimeSlot = async (slotId) => {
    if (!userId) return;
    
    setIsCreating(true);
    setError(null);
    
    try {
      // Find the slot to get its date
      const slotsResponse = await appointmentService.getAvailableSlots();
      let slotDate = new Date();
      
      console.log('=== BOOKING TIME SLOT DEBUG ===');
      console.log('Slot ID:', slotId);
      console.log('Slots response:', slotsResponse);
      
      if (slotsResponse.success && slotsResponse.data) {
        const slot = slotsResponse.data.find(s => s.id === slotId);
        console.log('Found slot:', slot);
        if (slot) {
          slotDate = new Date(slot.date);
          console.log('Slot date:', slotDate);
        } else {
          console.error('Slot not found with ID:', slotId);
          setError('Créneau horaire non trouvé');
          return;
        }
      } else {
        console.error('Failed to fetch slots');
        setError('Impossible de récupérer les créneaux horaires');
        return;
      }
      
      console.log('Creating appointment with date:', slotDate.toISOString());
      
      const response = await appointmentService.createAppointment({
        slotId,
        userId,
        type: 'CONSULTATION',
        etat: 'EN_LIGNE',
        date: slotDate.toISOString() // Add the date from the slot
      });
      
      if (response.success && response.data) {
        setAppointments(prev => [...prev, response.data]);
        // Refresh time slots to update availability
        fetchTimeSlots();
        return response.data;
      }
    } catch (err) {
      console.error('Error booking time slot:', err);
      setError('Erreur lors de la réservation du créneau horaire');
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchTimeSlots();
  }, [userId]);

  return {
    appointments,
    timeSlots,
    isLoading,
    isCreating,
    newAppointment,
    error,
    createAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    handleInputChange,
    resetNewAppointment,
    fetchTimeSlots,
    bookTimeSlot
  };
};
