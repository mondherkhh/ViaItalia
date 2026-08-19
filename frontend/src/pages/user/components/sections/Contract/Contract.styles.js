import styled, { keyframes, css } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const ContractContainer = styled.div`
  min-height: 100vh;
  padding: 2rem;

  position: relative;
  
  @media (max-width: 768px) {
    min-height: 100vh;

  }
  
  @media (max-width: 1024px) {
    padding-left: 10px;
    padding-right: 60px;

  }
`;

export const ContractHeader = styled.div`
  margin-bottom: 2rem;
`;

export const ContractTitle = styled.h1`
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
  }
`;

export const ContractCard = styled.div`
  padding: 2rem;
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.6s ease-out;
`;

export const ContractIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

export const ContractStatus = styled.div`
  margin-bottom: 1.5rem;
  
  p {
    color: #a0a0a0;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }
`;

export const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1rem;
  border: none;
  
  ${props => {
    switch (props.status) {
      case 'success':
        return `
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
          border: none;
        `;
      case 'warning':
        return `
          background: rgba(251, 191, 36, 0.2);
          color: #fbbf24;
          border: none;
        `;
      case 'error':
        return `
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border: none;
        `;
      case 'info':
        return `
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
          border: none;
        `;
      default:
        return `
          background: rgba(107, 114, 128, 0.2);
          color: #6b7280;
          border: none;
        `;
    }
  }}
`;

export const ContractActions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.variant === 'primary' ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }
  ` : `
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    &:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-2px);
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const UploadArea = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: none;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    border: none;
    background: rgba(255, 255, 255, 0.08);
  }
  
  ${props => props.dragActive && `
    border: none;
    background: rgba(102, 126, 234, 0.1);
  `}
`;

export const UploadIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #667eea;
  
  svg {
    width: 64px;
    height: 64px;
  }
`;

export const UploadText = styled.div`
  color: #ffffff;
  margin-bottom: 1.5rem;
  
  p {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }
  
  small {
    color: #a0a0a0;
    font-size: 0.875rem;
  }
`;

export const UploadButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const FileInput = styled.input`
  display: none;
`;

export const LoadingSpinner = styled.svg`
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
`;

export const EmptyStateIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.7;
`;

export const EmptyStateText = styled.div`
  h3 {
    color: #ffffff;
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #a0a0a0;
    font-size: 1rem;
  }
`;

export const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: none;
  color: #ef4444;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  text-align: center;
`;

export const SuccessMessage = styled.div`
  background: rgba(34, 197, 94, 0.1);
  border: none;
  color: #22c55e;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  text-align: center;
  animation: ${fadeIn} 0.3s ease-out;
`;

export const ProgressIndicator = styled.div`
  margin-top: 1.5rem;
`;

export const ProgressText = styled.div`
  color: #ffffff;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`;

export const ProgressBar = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  height: 8px;
  overflow: hidden;
`;

export const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  transition: width 0.3s ease;
  width: ${props => props.percentage || 0}%;
`;
