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

    try {
      const response = await axiosInstance.get(`/my-payments`);
      
      if (response.data.success) {
        const paymentsData = response.data.data || [];
        setPayments(paymentsData);

        if (paymentsData.length === 0) {
          // normal empty state
        }
      } else {
        setError(response.data.message || 'Erreur lors de la récupération des paiements');
      }
    } catch (err) {
      console.error('Error fetching payments: code=', err?.response?.status, 'url=', err?.config?.url, 'msg=', err?.message, 'server=', err?.response?.data?.message);
      const msg = err?.response?.data?.message || err?.message || 'Erreur lors de la récupération des paiements';
      setError(msg);
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch latest payment for a user
  const fetchLatestPayment = async () => {
    if (!userId) return;

    try {
      const response = await axiosInstance.get(`/my-payments`);

      if (response.data.success && response.data.data && response.data.data.length > 0) {
        const latestPayment = response.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        setPayment(latestPayment);
        return latestPayment;
      }
      setPayment(null);
      return null;
    } catch (err) {
      console.error('Error fetching latest payment:', err);
      setPayment(null);
      return null;
    }
  };

  // Fetch payment statistics (only if admin has access; otherwise skip to avoid 403)
  const fetchPaymentStats = async () => {
    // Student read-only: skip admin stats to avoid 403 in console
    setPaymentStats(null);
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

  // Add partial payment — CLIENT READ-ONLY: disabled (admin modifies via admin Payments).
  const addPayment = async () => {
    console.warn('addPayment disabled: client is read-only. Use admin dashboard to modify payments.');
    return Promise.resolve(null);
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
