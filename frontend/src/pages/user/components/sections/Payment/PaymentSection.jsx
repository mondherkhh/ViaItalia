import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { usePayments } from '../../../hooks/usePayments';
import {
  PaymentContainer,
  PaymentHeader,
  PaymentTitle,
  PaymentSubtitle,
  PaymentGrid,
  PaymentCard,
  PaymentIcon,
  PaymentStatus,
  PaymentAmount,
  PaymentDetails,
  PaymentProgress,
  ProgressBar,
  ProgressFill,
  PaymentActions,
  PaymentButton,
  PaymentStats,
  StatCard,
  StatIcon,
  StatValue,
  StatLabel,
  LoadingSpinner,
  EmptyState,
  EmptyStateIcon,
  EmptyStateText
} from './Payment.styles';

/**
 * Status configuration for payments
 */
const PAYMENT_STATUS_CONFIG = {
  PAID: {
    color: '#10b981',
    icon: '✅',
    text: 'Payé',
    bgGradient: 'from-green-500 to-green-600'
  },
  PENDING: {
    color: '#f59e0b',
    icon: '⏳',
    text: 'En attente',
    bgGradient: 'from-yellow-500 to-yellow-600'
  },
  PARTIAL: {
    color: '#3b82f6',
    icon: '💳',
    text: 'Partiel',
    bgGradient: 'from-blue-500 to-blue-600'
  }
};

const PaymentSection = () => {
  const { user } = useAuth();
  const { 
    payments, 
    payment, 
    paymentStats, 
    isLoading, 
    error, 
    fetchPayments, 
    fetchLatestPayment,
    addPayment 
  } = usePayments(user?.id);
  
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [addPaymentAmount, setAddPaymentAmount] = useState('');

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
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const getStatusConfig = (status) => {
    return PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG.PENDING;
  };

  const calculateProgress = (payment) => {
    if (!payment || payment.prixTotal <= 0) return 0;
    return Math.round((payment.prixPaye / payment.prixTotal) * 100);
  };

  const handleAddPayment = async () => {
    if (!payment || !addPaymentAmount || parseFloat(addPaymentAmount) <= 0) {
      alert('Veuillez entrer un montant valide');
      return;
    }

    try {
      await addPayment(payment.id, addPaymentAmount);
      setShowAddPaymentModal(false);
      setAddPaymentAmount('');
      
      // Show success notification
      const successDiv = document.createElement('div');
      successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        z-index: 9999;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      `;
      successDiv.textContent = 'Paiement ajouté avec succès!';
      document.body.appendChild(successDiv);
      
      setTimeout(() => {
        document.body.removeChild(successDiv);
      }, 3000);
    } catch (err) {
      alert('Erreur lors de l\'ajout du paiement');
    }
  };

  if (isLoading) {
    return (
      <PaymentContainer>
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
            Chargement des paiements...
          </p>
        </div>
      </PaymentContainer>
    );
  }

  if (error) {
    return (
      <PaymentContainer>
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: '#ef4444'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            Erreur de chargement
          </h3>
          <p style={{ color: '#9ca3af' }}>{error}</p>
          <button
            onClick={fetchPayments}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            Réessayer
          </button>
        </div>
      </PaymentContainer>
    );
  }

  return (
    <PaymentContainer>
      <PaymentHeader>
        <div style={{ textAlign: 'center' }}>
          <PaymentTitle> Paiements</PaymentTitle>
          <PaymentSubtitle>
            Gérez vos paiements et suivez vos transactions
          </PaymentSubtitle>
        </div>
      </PaymentHeader>

      {/* Payment Statistics */}
      {paymentStats && (
        <PaymentStats>
          <StatCard>
            <StatIcon>💰</StatIcon>
            <StatValue>{paymentStats.totalPayments || 0}</StatValue>
            <StatLabel>Total Paiements</StatLabel>
          </StatCard>
          <StatCard>
            <StatIcon>✅</StatIcon>
            <StatValue>{paymentStats.paidPayments || 0}</StatValue>
            <StatLabel>Payés</StatLabel>
          </StatCard>
          <StatCard>
            <StatIcon>⏳</StatIcon>
            <StatValue>{paymentStats.pendingPayments || 0}</StatValue>
            <StatLabel>En Attente</StatLabel>
          </StatCard>
          <StatCard>
            <StatIcon>💵</StatIcon>
            <StatValue>{paymentStats.totalRemaining?.toFixed(2) || 0} DT</StatValue>
            <StatLabel>Reste à Payer</StatLabel>
          </StatCard>
        </PaymentStats>
      )}

      {/* Current Payment */}
      {payment && (
        <PaymentCard>
          <PaymentIcon>💳</PaymentIcon>
          <PaymentDetails>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff' }}>
                Paiement #{payment.id}
              </h3>
              <PaymentStatus status={getStatusConfig(payment.status).color}>
                {getStatusConfig(payment.status).icon} {getStatusConfig(payment.status).text}
              </PaymentStatus>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Montant Total</p>
                <PaymentAmount>{payment.prixTotal?.toFixed(2)} DT</PaymentAmount>
              </div>
              <div>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Montant Payé</p>
                <PaymentAmount>{payment.prixPaye?.toFixed(2)} DT</PaymentAmount>
              </div>
              <div>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Reste à Payer</p>
                <PaymentAmount>{payment.prixReste?.toFixed(2)} DT</PaymentAmount>
              </div>
              <div>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Date</p>
                <p style={{ color: '#e5e7eb', fontSize: '1rem' }}>
                  {new Date(payment.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>

            {/* Payment Progress */}
            <PaymentProgress>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ color: '#e5e7eb', fontSize: '0.875rem' }}>Progression du paiement</span>
                <span style={{ color: '#ffffff', fontSize: '1.125rem', fontWeight: 'bold' }}>
                  {calculateProgress(payment)}%
                </span>
              </div>
              <ProgressBar>
                <ProgressFill percentage={calculateProgress(payment)} />
              </ProgressBar>
            </PaymentProgress>
          </PaymentDetails>

          {/* Payment Actions */}
          {payment.status !== 'PAID' && payment.prixReste > 0 && (
            <PaymentActions>
              <PaymentButton onClick={() => setShowAddPaymentModal(true)}>
                ➕ Ajouter un Paiement
              </PaymentButton>
            </PaymentActions>
          )}
        </PaymentCard>
      )}

      {/* All Payments List */}
      {payments.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '1rem' }}>
            Historique des Paiements
          </h3>
          <PaymentGrid>
            {payments.map((payment) => (
              <PaymentCard key={payment.id} style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#e5e7eb', fontSize: '0.875rem' }}>Paiement #{payment.id}</span>
                  <PaymentStatus status={getStatusConfig(payment.status).color} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                    {getStatusConfig(payment.status).text}
                  </PaymentStatus>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{payment.prixTotal?.toFixed(2)} DT</span>
                  <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                    {new Date(payment.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </PaymentCard>
            ))}
          </PaymentGrid>
        </div>
      )}

      {/* Empty State */}
      {!payment && payments.length === 0 && (
        <EmptyState>
          <EmptyStateIcon>💳</EmptyStateIcon>
          <EmptyStateText>
            <h3>Aucun paiement trouvé</h3>
            <p>Vous n'avez pas encore de paiements enregistrés</p>
          </EmptyStateText>
        </EmptyState>
      )}

      {/* Add Payment Modal */}
      {showAddPaymentModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1f2937',
            padding: '2rem',
            borderRadius: '0.5rem',
            width: '400px',
            border: '1px solid #374151'
          }}>
            <h3 style={{ color: '#ffffff', marginBottom: '1rem' }}>Ajouter un Paiement</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#9ca3af', display: 'block', marginBottom: '0.5rem' }}>
                Montant à payer (DT)
              </label>
              <input
                type="number"
                value={addPaymentAmount}
                onChange={(e) => setAddPaymentAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#374151',
                  border: '1px solid #4b5563',
                  borderRadius: '0.375rem',
                  color: '#ffffff'
                }}
                placeholder="Entrez le montant"
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowAddPaymentModal(false);
                  setAddPaymentAmount('');
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#6b7280',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleAddPayment}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </PaymentContainer>
  );
};

export default PaymentSection;
