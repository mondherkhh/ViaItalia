import styled, { keyframes, css } from 'styled-components';

/**
 * ============================================
 * KEYFRAME ANIMATIONS
 * ============================================
 */

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(34, 197, 94, 0.6);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: calc(200% + 0px) 0;
  }
`;

const progressFill = keyframes`
  from {
    width: 0;
  }
  to {
    width: var(--progress-width, 0%);
  }
`;

/**
 * ============================================
 * MAIN CONTAINER & LAYOUT
 * ============================================
 */

export const DossierOverviewContainer = styled.div`
  backdrop-filter: blur(10px);  padding: 2rem 2rem 2rem 0.5rem;
  overflow: visible;
  animation: ${css`${fadeIn} 0.6s ease-out`};

  @media (max-width: 768px) {
    padding: 1rem 2.5rem 1rem 0.25rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem 0.75rem 0.75rem 0.125rem;
  }
`;

export const DossierContainer = styled.div`
  padding: 2rem 2rem 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
  overflow: visible;
  animation: ${css`${slideUp} 0.8s ease-out`};

  @media (max-width: 768px) {
    padding: 1.5rem 1.5rem 1.5rem 0.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem 1rem 1rem 0.25rem;
  }
`;

/**
 * ============================================
 * HEADER SECTION
 * ============================================
 */

export const HeaderSection = styled.div`
  margin-bottom: 3rem;
  animation: ${css`${slideDown} 0.7s ease-out`};

  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 1.5rem;
  }
`;

export const DossierTitle = styled.h1`
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
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
    margin-bottom: 0.375rem;
    letter-spacing: -0.25px;
  }
`;

/**
 * ============================================
 * MAIN CARD COMPONENTS
 * ============================================
 */

export const MainCard = styled.div`
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 3rem 2.5rem;
  margin-bottom: 2.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: visible;
  animation: ${css`${slideUp} 0.8s ease-out 0.1s both`};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: rgba(255, 255, 255, 0.25);
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
  }

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    border-radius: 16px;
    margin-bottom: 2rem;
  }
  
  @media (max-width: 480px) {
    padding: 1.5rem 1rem;
    border-radius: 12px;
    margin-bottom: 1.5rem;
    
    &:hover {
      transform: translateY(-2px);
    }
  }
`;

export const DossierDetailsCard = styled(MainCard)`
  overflow: visible;
  animation: ${css`${slideUp} 0.8s ease-out 0.2s both`};

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

/**
 * ============================================
 * STEPS GRID & STEP CIRCLE
 * ============================================
 */

export const StepsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

export const StepCircle = styled.div`
  width: 100px;
  height: 100px;
  margin: 0 auto;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  ${props => {
    switch (props.status) {
      case 'success':
        return css`
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          box-shadow: 0 15px 40px rgba(16, 185, 129, 0.4);
          animation: ${glow} 2s ease-in-out infinite;
          
          &:hover {
            transform: translateY(-4px) scale(1.05);
            box-shadow: 0 20px 50px rgba(16, 185, 129, 0.5);
          }
        `;
      case 'warning':
        return css`
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          box-shadow: 0 15px 40px rgba(59, 130, 246, 0.3);
          animation: ${pulse} 2s ease-in-out infinite;
          
          &:hover {
            transform: translateY(-4px) scale(1.05);
            box-shadow: 0 20px 50px rgba(59, 130, 246, 0.4);
          }
        `;
      default:
        return css`
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
          opacity: ${props.locked ? '0.5' : '1'};
          cursor: ${props.locked ? 'not-allowed' : 'default'};
          box-shadow: 0 15px 40px rgba(107, 114, 128, 0.2);
          
          &:hover {
            ${!props.locked ? css`
              transform: translateY(-4px) scale(1.05);
              box-shadow: 0 20px 50px rgba(107, 114, 128, 0.3);
            ` : ''}
          }
        `;
    }
  }}

  @media (max-width: 768px) {
    width: 90px;
    height: 90px;
    font-size: 2.25rem;
  }

  @media (max-width: 480px) {
    width: 70px;
    height: 70px;
    font-size: 1.75rem;
    
    &:hover {
      transform: translateY(-2px) scale(1.02);
    }
  }
`;

/**
 * ============================================
 * PROGRESS COMPONENTS
 * ============================================
 */

export const DossierProgress = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  margin-top: 2rem;
  animation: ${css`${slideUp} 0.8s ease-out 0.3s both`};
  transition: all 0.4s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.08);
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    margin-top: 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
    margin-top: 1rem;
    border-radius: 12px;
  }
`;

export const ProgressText = styled.div`
  color: #e5e7eb;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  font-size: 0.875rem;
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
    letter-spacing: 0.2px;
  }
`;

export const ProgressBar = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  height: 16px;
  overflow: hidden;
  margin: 1rem 0;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    animation: ${css`${shimmer} 2s infinite`};
  }
  
  @media (max-width: 480px) {
    height: 12px;
    margin: 0.75rem 0;
    border-radius: 8px;
  }
`;

export const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
  border-radius: 12px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
  width: ${props => props.percentage || 0}%;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: ${css`${shimmer} 1.5s infinite`};
  }
`;

/**
 * ============================================
 * STEP STATUS & DETAILS
 * ============================================
 */

export const StepStatus = styled.span`
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  transition: all 0.3s ease;

  ${props => {
    switch (props.status) {
      case 'success':
        return `
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          border: 1.5px solid rgba(16, 185, 129, 0.4);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);

          &:hover {
            border-color: rgba(16, 185, 129, 0.6);
            box-shadow: 0 6px 16px rgba(16, 185, 129, 0.25);
          }
        `;
      case 'warning':
        return `
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
          border: 1.5px solid rgba(59, 130, 246, 0.4);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);

          &:hover {
            border-color: rgba(59, 130, 246, 0.6);
            box-shadow: 0 6px 16px rgba(59, 130, 246, 0.25);
          }
        `;
      default:
        return `
          background: rgba(107, 114, 128, 0.2);
          color: #9ca3af;
          border: 1.5px solid rgba(107, 114, 128, 0.3);
          box-shadow: 0 4px 12px rgba(107, 114, 128, 0.1);

          &:hover {
            border-color: rgba(107, 114, 128, 0.5);
            box-shadow: 0 6px 16px rgba(107, 114, 128, 0.2);
          }
        `;
    }
  }}
  
  @media (max-width: 480px) {
    padding: 0.375rem 0.75rem;
    font-size: 0.7rem;
    letter-spacing: 0.2px;
  }
`;

export const DossierDetailRow = styled.div`
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.12);
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem;
    border-radius: 8px;
  }
`;

export const DossierDetailLabel = styled.p`
  color: #9ca3af;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
    margin-bottom: 0.375rem;
    letter-spacing: 0.2px;
  }
`;

export const DossierDetailValue = styled.p`
  color: #f3f4f6;
  font-size: 1.125rem;
  font-weight: 600;
  transition: color 0.3s ease;

  ${DossierDetailRow}:hover & {
    color: #ffffff;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

/**
 * ============================================
 * LOADING & EMPTY STATES
 * ============================================
 */

export const LoadingSpinner = styled.svg`
  animation: spin 2s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  animation: ${css`${fadeIn} 0.8s ease-out`};
  
  @media (max-width: 768px) {
    padding: 3rem 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 2rem 1rem;
  }
`;

export const EmptyStateIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 1.5rem;
  opacity: 0.6;
  animation: ${css`${pulse} 3s ease-in-out infinite`};
  
  @media (max-width: 768px) {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 3rem;
    margin-bottom: 0.75rem;
  }
`;

export const EmptyStateText = styled.div`
  h3 {
    color: #f3f4f6;
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    
    @media (max-width: 480px) {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
    }
  }

  p {
    color: #9ca3af;
    font-size: 1.125rem;
    line-height: 1.6;
    
    @media (max-width: 480px) {
      font-size: 1rem;
      line-height: 1.5;
    }
  }
`;

/**
 * ============================================
 * DEPRECATED (Kept for compatibility)
 * ============================================
 */

export const StepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const StepCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  cursor: ${props => props.locked ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  animation: ${css`${slideUp} 0.6s ease-out`};
  animation-delay: ${props => props.delay || 0}s;
  animation-fill-mode: both;
  
  ${props => {
    if (props.locked) {
      return css`
        opacity: 0.6;
        border-color: rgba(251, 191, 36, 0.3);
      `;
    }
    
    switch (props.status) {
      case 'success':
        return css`
          border-color: rgba(34, 197, 94, 0.3);
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(34, 197, 94, 0.2);
          }
        `;
      case 'warning':
        return css`
          border-color: rgba(251, 191, 36, 0.3);
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(251, 191, 36, 0.2);
          }
        `;
      default:
        return css`
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(255, 255, 255, 0.1);
          }
        `;
    }
  }}
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem;
    border-radius: 12px;
    
    &:hover {
      transform: translateY(-1px);
    }
  }
`;

export const StepIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 0.75rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
  }
`;

export const StepContent = styled.div`
  flex: 1;
`;

export const StepTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  
  @media (max-width: 480px) {
    font-size: 1rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
`;

export const StepDescription = styled.p`
  color: #a0a0a0;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
  line-height: 1.5;
  
  @media (max-width: 480px) {
    font-size: 0.875rem;
    margin-bottom: 0.375rem;
  }
`;

export const StepTime = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
    margin-bottom: 0.75rem;
  }
`;

export const StepActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }
`;

export const StepButton = styled.button`
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          
          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
          }
        `;
      case 'secondary':
        return `
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
          
          &:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.15);
            transform: translateY(-2px);
          }
        `;
      case 'success':
        return `
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.3);
        `;
      default:
        return `
          background: rgba(107, 114, 128, 0.2);
          color: #6b7280;
          border: 1px solid rgba(107, 114, 128, 0.3);
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    padding: 0.375rem 1.25rem;
    font-size: 0.8rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
    font-size: 0.75rem;
    width: 100%;
    
    &:hover:not(:disabled) {
      transform: translateY(-1px);
    }
  }
`;

export const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  text-align: center;
  animation: ${css`${slideDown} 0.4s ease-out`};
  
  @media (max-width: 768px) {
    padding: 0.75rem;
    margin-bottom: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
    margin-bottom: 0.75rem;
    font-size: 0.875rem;
  }
`;