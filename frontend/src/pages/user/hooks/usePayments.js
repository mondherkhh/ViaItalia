import { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';

export const usePayments = (userId) => {
  const [payments, setPayments] = useState([]);
  const [payment, setPayment] = useState(null);
  const [paymentStats, setPaymentStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all payments for a user
  const fetchPayments = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    console.log('=== FETCHING PAYMENTS FOR USER:', userId);
    
    try {
      const response = await axiosInstance.get(`/payments/users/${userId}/payments`);
      console.log('Payments API response:', response);
      console.log('Response data:', response.data);
      console.log('Response status:', response.status);
      
      if (response.data.success) {
        const paymentsData = response.data.data || [];
        setPayments(paymentsData);
        console.log('✅ Payments fetched successfully:', paymentsData);
        
        // If no payments found, don't set an error - this is normal
        if (paymentsData.length === 0) {
          console.log('ℹ️ No payments found for user:', userId);
        }
      } else {
        console.log('❌ API returned success=false:', response.data.message);
        setError(response.data.message || 'Erreur lors de la récupération des paiements');
      }
    } catch (err) {
      console.error('❌ Error fetching payments:', err);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      console.error('Error config:', err.config);
      setError('Erreur lors de la récupération des paiements');
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch latest payment for a user
  const fetchLatestPayment = async () => {
    if (!userId) return;
    
    console.log('=== FETCHING LATEST PAYMENT FOR USER:', userId);
    
    try {
      const response = await axiosInstance.get(`/payments/users/${userId}/payments`);
      console.log('Latest payment API response:', response);
      console.log('Latest payment response data:', response.data);
      console.log('Latest payment response status:', response.status);
      
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        const latestPayment = response.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        setPayment(latestPayment);
        console.log('✅ Latest payment fetched successfully:', latestPayment);
        return latestPayment;
      }
      console.log('ℹ️ No payments found for user:', userId);
      setPayment(null);
      return null;
    } catch (err) {
      console.error('❌ Error fetching latest payment:', err);
      console.error('Latest payment error status:', err.response?.status);
      console.error('Latest payment error data:', err.response?.data);
      console.error('Latest payment error config:', err.config);
      setPayment(null);
      return null;
    }
  };

  // Fetch payment statistics
  const fetchPaymentStats = async () => {
    try {
      const response = await axiosInstance.get('/payments/stats');
      if (response.data.success) {
        setPaymentStats(response.data.data);
        console.log('Payment stats fetched:', response.data.data);
      }
    } catch (err) {
      console.error('Error fetching payment stats:', err);
      setPaymentStats(null);
    }
  };

  // Create new payment
  const createPayment = async (paymentData) => {
    try {
      const response = await axiosInstance.post('/payments', {
        userId: parseInt(userId),
        prixTotal: parseFloat(paymentData.prixTotal),
        prixPaye: parseFloat(paymentData.prixPaye || 0),
        status: paymentData.status || 'PENDING'
      });

      if (response.data.success) {
        await fetchPayments(); // Refresh payments list
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Erreur lors de la création du paiement');
      }
    } catch (err) {
      console.error('Error creating payment:', err);
      throw err;
    }
  };

  // Add partial payment
  const addPayment = async (paymentId, amount) => {
    try {
      const response = await axiosInstance.post(`/payments/${paymentId}/add-payment`, {
        amount: parseFloat(amount)
      });

      if (response.data.success) {
        await fetchPayments(); // Refresh payments list
        await fetchLatestPayment(); // Refresh latest payment
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Erreur lors de l\'ajout du paiement');
      }
    } catch (err) {
      console.error('Error adding payment:', err);
      throw err;
    }
  };

  // Auto-fetch payments on component mount
  useEffect(() => {
    if (userId) {
      fetchPayments();
      fetchLatestPayment();
      fetchPaymentStats();
    }
  }, [userId]);

  return {
    payments,
    payment,
    paymentStats,
    isLoading,
    error,
    fetchPayments,
    fetchLatestPayment,
    fetchPaymentStats,
    createPayment,
    addPayment,
    setError
  };
};
