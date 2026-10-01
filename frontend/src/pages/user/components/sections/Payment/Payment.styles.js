import styled from 'styled-components';

// Animation constants
const fadeInUp = `
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const PaymentContainer = styled.div`
  min-height: 100vh;
  padding: 2rem 2rem 2rem 1rem;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 1rem 4rem 5rem 0.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem 0.75rem 4rem 0.25rem;
  }
`;

export const PaymentHeader = styled.header`
  text-align: center;
  margin-bottom: 3rem;
  animation: ${fadeInUp} 0.6s ease-in-out;
  
  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 1.5rem;
  }
`;

export const PaymentTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;

  &:hover {
    filter: brightness(1.1);
  }

  svg {
    background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #ec4899 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 1.2em;
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    font-size: 1.875rem;
    margin-bottom: 0.375rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
    gap: 0.75rem;
    
    svg {
      font-size: 1em;
    }
  }
`;

export const PaymentSubtitle = styled.p`
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  color: #9ca3af;
  margin: 0;
  line-height: 1.6;
  
  @media (max-width: 480px) {
    font-size: clamp(0.875rem, 3vw, 1rem);
    line-height: 1.5;
  }
`;

export const PaymentStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  animation: ${fadeInUp} 0.8s ease-in-out 0.2s both;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

export const StatCard = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
    border-radius: 0.75rem;
    
    &:hover {
      transform: translateY(-2px);
    }
  }
`;

export const StatIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
  }
  
  @media (max-width: 480px) {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
`;

export const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
  }
`;

export const StatLabel = styled.div`
  font-size: 1rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
    letter-spacing: 0.02em;
  }
`;

export const PaymentCard = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  animation: ${fadeInUp} 0.8s ease-in-out 0.4s both;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 0.75rem;
    
    &:hover {
      transform: translateY(-2px);
    }
  }
`;

export const PaymentIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1.5rem;
  text-align: center;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 2rem;
    margin-bottom: 0.75rem;
  }
`;

export const PaymentStatus = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, ${props => props.status} 0%, ${props => props.status}dd 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
    gap: 0.25rem;
  }
`;

export const PaymentAmount = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.125rem;
  }
`;

export const PaymentDetails = styled.div`
  flex: 1;
`;

export const PaymentProgress = styled.div`
  margin-top: 1.5rem;
  
  @media (max-width: 480px) {
    margin-top: 1rem;
  }
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 480px) {
    height: 6px;
  }
`;

export const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  border-radius: 4px;
  transition: width 0.6s ease;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
  width: ${props => props.percentage}%;
`;

export const PaymentActions = styled.div`
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
  
  @media (max-width: 480px) {
    margin-top: 1rem;
    flex-direction: column;
    gap: 0.75rem;
  }
`;

export const PaymentButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: 0.625rem 1.25rem;
    font-size: 0.875rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem;
    font-size: 0.8rem;
    width: 100%;
    
    &:hover {
      transform: translateY(-1px);
    }
  }
`;

export const PaymentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  animation: ${fadeInUp} 0.8s ease-in-out 0.6s both;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

export const LoadingSpinner = styled.svg`
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  animation: ${fadeInUp} 0.8s ease-in-out;
  
  @media (max-width: 768px) {
    padding: 3rem 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 2rem 1rem;
  }
`;

export const EmptyStateIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.5;
  
  @media (max-width: 768px) {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
  }
`;

export const EmptyStateText = styled.div`
  h3 {
    color: #ffffff;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    
    @media (max-width: 480px) {
      font-size: 1.25rem;
      margin-bottom: 0.375rem;
    }
  }
  
  p {
    color: #9ca3af;
    font-size: 1rem;
    margin: 0;
    
    @media (max-width: 480px) {
      font-size: 0.875rem;
    }
  }
`;
