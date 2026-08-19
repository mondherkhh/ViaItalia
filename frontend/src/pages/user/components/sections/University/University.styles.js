import styled from 'styled-components';

export const UniversityContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const UniversityForm = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
`;

export const UniversityCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
  animation: fadeInUp 0.5s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
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
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export const UniversityIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
  }
`;

export const UniversityTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  margin: 0 0 1rem 0;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }
`;

export const UniversitySelect = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
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
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  option {
    background: #1f2937;
    color: white;
  }
  
  @media (max-width: 768px) {
    padding: 0.625rem 0.875rem;
    font-size: 0.85rem;
  }
`;

export const UniversitySummary = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  animation: slideUp 0.5s ease 0.2s both;
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export const SummaryTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin: 0 0 1.5rem 0;
  
  @media (max-width: 768px) {
    font-size: 1.125rem;
    margin-bottom: 1rem;
  }
`;

export const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

export const SummaryItem = styled.div`
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem;
  }
`;

export const SummaryIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
    margin-bottom: 0.375rem;
  }
`;

export const SummaryLabel = styled.p`
  font-size: 0.9rem;
  color: #10b981;
  font-weight: 500;
  margin: 0;
  text-transform: capitalize;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

export const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    margin-top: 1.5rem;
  }
`;

export const ActionButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  ${props => {
    if (props.variant === 'primary') {
      return `
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        
        &:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
        }
      `;
    } else if (props.variant === 'secondary') {
      return `
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        color: white;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
        }
      `;
    }
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: 0.625rem 1.25rem;
    font-size: 0.9rem;
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

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

export const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: scaleIn 0.3s ease;
  
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    margin: 1rem;
  }
`;

export const ModalContent = styled.div`
  text-align: center;
`;

export const ModalIcon = styled.div`
  width: 48px;
  height: 48px;
  background: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  
  svg {
    width: 24px;
    height: 24px;
    color: white;
  }
`;

export const ModalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
`;

export const ModalMessage = styled.p`
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
`;

export const ModalButtons = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const ModalButton = styled.button`
  flex: 1;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => {
    if (props.variant === 'primary') {
      return `
        background: #10b981;
        color: white;
        
        &:hover {
          background: #059669;
        }
      `;
    } else {
      return `
        background: #d1d5db;
        color: #374151;
        
        &:hover {
          background: #9ca3af;
        }
      `;
    }
  }}
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.6);
`;

export const EmptyStateIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.6;
`;

export const EmptyStateText = styled.p`
  font-size: 1rem;
  margin: 0;
  
  &:not(:last-child) {
    margin-bottom: 0.5rem;
  }
`;

export const ProgressIndicator = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
`;

export const ProgressText = styled.p`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 0.5rem 0;
`;

export const ProgressBar = styled.div`
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
`;

export const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  border-radius: 3px;
  transition: width 0.3s ease;
  width: ${props => props.percentage || 0}%;
`;
