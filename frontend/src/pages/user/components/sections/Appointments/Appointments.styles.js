import styled from 'styled-components';

export const AppointmentsTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;
  transition: all 0.3s ease;

  &:hover {
    filter: brightness(1.1);
  }

  @media (max-width: 768px) {
    font-size: 1.875rem;
    margin-bottom: 0.375rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
  }
`;

export const AppointmentsHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 1.5rem;
  }
`;

export const AppointmentsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    gap: 50px;
    padding-left: -20px;
    margin-right: 40px;
  }
  
  @media (max-width: 480px) {
    gap: 20px;
  }
`;

export const AppointmentsSubHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }
  
  @media (max-width: 480px) {
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
`;

export const AppointmentsSubTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.875rem;
  }
`;

export const ToggleButton = styled.button`
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }
  
  @media (max-width: 768px) {
    padding: 0.625rem 1.25rem;
    font-size: 0.85rem;
    border-radius: 6px;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
    border-radius: 6px;
  }
`;

export const BookingForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 1.5rem;
  animation: slideDown 0.3s ease;
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
    border-radius: 10px;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem;
    gap: 0.5rem;
    margin-bottom: 1rem;
    border-radius: 8px;
  }
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  @media (max-width: 480px) {
    gap: 0.5rem;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  @media (max-width: 480px) {
    gap: 0.375rem;
  }
`;

export const FormLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
  }
`;

export const FormInput = styled.input`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: white;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    border-color: #10b981;
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    padding: 0.625rem 0.875rem;
    font-size: 0.85rem;
    border-radius: 6px;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
    border-radius: 6px;
  }
`;

export const FormSelect = styled.select`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #10b981;
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
  
  option {
    background: #1f2937;
    color: white;
  }
  
  @media (max-width: 768px) {
    padding: 0.625rem 0.875rem;
    font-size: 0.85rem;
    border-radius: 6px;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
    border-radius: 6px;
  }
`;

export const FormTextarea = styled.textarea`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: white;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    border-color: #10b981;
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 0.625rem 0.875rem;
    font-size: 0.85rem;
    min-height: 70px;
    border-radius: 6px;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
    min-height: 60px;
    border-radius: 6px;
  }
`;

export const SubmitButton = styled.button`
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    padding: 0.625rem 1.25rem;
    font-size: 0.9rem;
    border-radius: 10px;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
    border-radius: 8px;
    gap: 0.375rem;
  }
`;

export const LoadingSpinner = styled.svg`
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const AppointmentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  @media (max-width: 768px) {
    gap: 0.75rem;
  }
  
  @media (max-width: 480px) {
    gap: 0.5rem;
  }
`;

export const AppointmentsListHeader = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  margin: 0 0 1rem 0;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }
`;

export const AppointmentCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s ease;
  animation: fadeInUp 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    padding: 0.875rem;
    border-radius: 10px;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem;
    border-radius: 8px;
  }
`;

export const AppointmentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  
  @media (max-width: 768px) {
    gap: 0.75rem;
  }
  
  @media (max-width: 480px) {
    gap: 0.5rem;
    flex-direction: column;
    align-items: stretch;
  }
`;

export const AppointmentContent = styled.div`
  flex: 1;
  
  @media (max-width: 480px) {
    flex: none;
  }
`;

export const AppointmentActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
  
  @media (max-width: 480px) {
    justify-content: flex-end;
    margin-top: 0.5rem;
  }
`;

export const StatusBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  ${props => {
    switch (props.status) {
      case 'CONFIRMED':
        return `
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        `;
      case 'CANCELLED':
        return `
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        `;
      case 'PENDING':
      default:
        return `
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        `;
    }
  }}
`;

export const AppointmentTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.25rem 0;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.875rem;
    margin-bottom: 0.1875rem;
  }
`;

export const AppointmentDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  
  @media (max-width: 480px) {
    gap: 0.1875rem;
  }
`;

export const AppointmentDetail = styled.p`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    gap: 0.375rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
    gap: 0.25rem;
  }
`;

export const DetailIcon = styled.span`
  font-size: 0.875rem;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
  }
`;

export const CancelButton = styled.button`
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border: none;
  border-radius: 6px;
  padding: 0.375rem 0.75rem;
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: 0.3125rem 0.625rem;
    font-size: 0.75rem;
    border-radius: 5px;
  }
  
  @media (max-width: 480px) {
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
    border-radius: 4px;
  }
`;

export const StatusText = styled.span`
  font-size: 0.8rem;
  font-weight: 500;
  
  ${props => {
    switch (props.status) {
      case 'CONFIRMED':
        return `color: #10b981;`;
      case 'CANCELLED':
        return `color: #ef4444;`;
      case 'PENDING':
      default:
        return `color: #f59e0b;`;
    }
  }}
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.7rem;
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.8);
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

export const EmptyStateIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.6;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
  }
  
  @media (max-width: 480px) {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
`;

export const EmptyStateText = styled.p`
  font-size: 1rem;
  margin: 0;
  
  &:not(:last-child) {
    margin-bottom: 0.5rem;
  }
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    
    &:not(:last-child) {
      margin-bottom: 0.375rem;
    }
  }
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
    
    &:not(:last-child) {
      margin-bottom: 0.25rem;
    }
  }
`;

export const NotificationMessage = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: slideInRight 0.3s ease;
  
  ${props => {
    switch (props.type) {
      case 'success':
        return `
          background: linear-gradient(135deg, #10b981, #059669);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        `;
      case 'error':
        return `
          background: linear-gradient(135deg, #ef4444, #dc2626);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        `;
      default:
        return `
          background: linear-gradient(135deg, #6b7280, #4b5563);
          box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
        `;
    }
  }}
  
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @media (max-width: 768px) {
    top: 0.5rem;
    right: 0.5rem;
    left: 0.5rem;
    padding: 0.625rem 1rem;
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    top: 0.25rem;
    right: 0.25rem;
    left: 0.25rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
    gap: 0.375rem;
  }
`;
