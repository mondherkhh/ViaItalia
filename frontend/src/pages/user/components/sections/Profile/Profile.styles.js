import styled, { css, keyframes } from 'styled-components';

// Design System Constants - Enhanced
const DESIGN_TOKENS = {
  colors: {
    primary: '#4CAF50',
    primaryDark: '#2E7D32',
    primaryLight: '#66BB6A',
    primaryHover: '#45a049',
    success: '#4CAF50',
    error: '#f44336',
    warning: '#ff9800',
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.85)',
      muted: 'rgba(255, 255, 255, 0.6)',
      disabled: 'rgba(255, 255, 255, 0.4)',
    },
    background: {
      glass: 'rgba(255, 255, 255, 0.08)',
      glassHover: 'rgba(255, 255, 255, 0.12)',
      glassActive: 'rgba(255, 255, 255, 0.15)',
      dark: 'rgba(0, 0, 0, 0.3)',
    },
    border: {
      glass: 'rgba(255, 255, 255, 0.15)',
      glassHover: 'rgba(255, 255, 255, 0.25)',
      input: 'rgba(255, 255, 255, 0.2)',
      active: 'rgba(76, 175, 80, 0.4)',
    }
  },
  spacing: {
    xs: '0.4rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  borderRadius: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '16px',
  },
  shadows: {
    glass: '0 8px 32px rgba(0, 0, 0, 0.25)',
    focus: '0 0 0 3px rgba(76, 175, 80, 0.25)',
    hover: '0 12px 28px rgba(76, 175, 80, 0.25)',
    sm: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  transitions: {
    fast: '0.15s ease-in-out',
    normal: '0.3s ease-in-out',
    slow: '0.5s ease-in-out',
  },
  typography: {
    fontFamily: {
      body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: '"Fira Code", "Courier New", monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    }
  }
};

// Animations
const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const pulseGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.3);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(76, 175, 80, 0);
  }
`;

// Mixins
const glassEffect = css`
  background: ${DESIGN_TOKENS.colors.background.glass};
  backdrop-filter: blur(10px);
  border: 1px solid ${DESIGN_TOKENS.colors.border.glass};
  box-shadow: ${DESIGN_TOKENS.shadows.glass};
`;

const formControlBase = css`
  width: 100%;
  padding: ${DESIGN_TOKENS.spacing.md} ${DESIGN_TOKENS.spacing.lg};
  border: 1px solid ${DESIGN_TOKENS.colors.border.input};
  border-radius: ${DESIGN_TOKENS.borderRadius.md};
  font-size: ${DESIGN_TOKENS.typography.fontSize.base};
  font-family: ${DESIGN_TOKENS.typography.fontFamily.body};
  transition: all ${DESIGN_TOKENS.transitions.normal};
  background: ${DESIGN_TOKENS.colors.background.glass};
  color: ${DESIGN_TOKENS.colors.text.primary};
  box-sizing: border-box;

  &::placeholder {
    color: ${DESIGN_TOKENS.colors.text.muted};
  }

  &:focus {
    outline: none;
    border-color: ${DESIGN_TOKENS.colors.primary};
    box-shadow: ${DESIGN_TOKENS.shadows.focus};
    background: ${DESIGN_TOKENS.colors.background.glassHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: ${DESIGN_TOKENS.colors.background.dark};
  }
`;

const buttonBase = css`
  padding: ${DESIGN_TOKENS.spacing.md} ${DESIGN_TOKENS.spacing.xl};
  border-radius: ${DESIGN_TOKENS.borderRadius.md};
  font-size: ${DESIGN_TOKENS.typography.fontSize.base};
  font-weight: ${DESIGN_TOKENS.typography.fontWeight.semibold};
  font-family: ${DESIGN_TOKENS.typography.fontFamily.body};
  cursor: pointer;
  transition: all ${DESIGN_TOKENS.transitions.normal};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${DESIGN_TOKENS.spacing.sm};
  min-width: 120px;
  border: none;
  white-space: nowrap;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
`;

// Layout Components
export const ProfileContainer = styled.div`
  padding: ${DESIGN_TOKENS.spacing.xxl} ${DESIGN_TOKENS.spacing.xl};
  max-width: 900px;
  margin: 0 auto;
  margin-top: -150px;
  min-height: 100vh;
  animation: ${fadeIn} 0.5s ease-in-out;
  
  @media (max-width: 1024px) {
    padding: ${DESIGN_TOKENS.spacing.xl} ${DESIGN_TOKENS.spacing.lg};
   margin-top: -80px;

  }
  
  @media (max-width: 768px) {

   
    margin-top: -80px;
    margin-left: -120px;
    padding-right: -80px;

  }
  
  @media (max-width: 480px) {
    padding: ${DESIGN_TOKENS.spacing.md} ${DESIGN_TOKENS.spacing.sm};
   margin-top: -80px;
    margin-left: -80px;

  }
`;

export const ProfileHeader = styled.header`
  text-align: center;
  margin-bottom: ${DESIGN_TOKENS.spacing.xxl};
  animation: ${slideDown} 0.6s ease-in-out;
  
  @media (max-width: 768px) {
    margin-bottom: ${DESIGN_TOKENS.spacing.xl};
  }
  
  @media (max-width: 480px) {
    margin-bottom: ${DESIGN_TOKENS.spacing.lg};
  }
`;

export const ProfileTitle = styled.h1`
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

  @media (max-width: 768px) {
    font-size: 1.875rem;
    gap: 0.75rem;
  }

  @media (max-width: 480px) {
    font-size: 1.5rem;
    gap: 0.5rem;
    margin-bottom: 0.375rem;
  }

  svg {
    font-size: 1.3em;
    flex-shrink: 0;
    
    @media (max-width: 480px) {
      font-size: 1.1em;
    }
  }
`;

export const ProfileSubtitle = styled.p`
  font-size: clamp(0.95rem, 2vw, 1.1rem);
  color: ${DESIGN_TOKENS.colors.text.secondary};
  margin: 0;
  line-height: ${DESIGN_TOKENS.typography.lineHeight.normal};
  font-weight: ${DESIGN_TOKENS.typography.fontWeight.normal};
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.875rem;
  }
`;

export const ProfileContent = styled.div`
  ${glassEffect}
  border-radius: ${DESIGN_TOKENS.borderRadius.xl};
  padding: 1.5rem;
  animation: ${slideDown} 0.7s ease-in-out;
  
  @media (max-width: 1024px) {
    padding: 1.25rem;
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
    border-radius: ${DESIGN_TOKENS.borderRadius.lg};
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem;
    border-radius: ${DESIGN_TOKENS.borderRadius.md};
  }
`;

// Tab Components
export const TabContainer = styled.div`
  display: flex;
  margin-bottom: ${DESIGN_TOKENS.spacing.xxl};
  border-bottom: 1px solid ${DESIGN_TOKENS.colors.border.glass};
  gap: ${DESIGN_TOKENS.spacing.xl};
  position: relative;
  
  @media (max-width: 1024px) {
    gap: ${DESIGN_TOKENS.spacing.lg};
  }
  
  @media (max-width: 768px) {
    gap: ${DESIGN_TOKENS.spacing.md};
    margin-bottom: ${DESIGN_TOKENS.spacing.xl};
    margin-left: 0;
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: ${DESIGN_TOKENS.spacing.xs};
  }
  
  @media (max-width: 480px) {
    gap: ${DESIGN_TOKENS.spacing.sm};
    margin-bottom: ${DESIGN_TOKENS.spacing.lg};
    margin-left: 0;
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: ${DESIGN_TOKENS.spacing.xs};
  }
`;

export const TabButton = styled.button`
  padding: ${DESIGN_TOKENS.spacing.md} ${DESIGN_TOKENS.spacing.lg};
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  color: ${props => props.isActive ? DESIGN_TOKENS.colors.primary : DESIGN_TOKENS.colors.text.secondary};
  font-size: ${DESIGN_TOKENS.typography.fontSize.lg};
  font-weight: ${props => props.isActive ? DESIGN_TOKENS.typography.fontWeight.semibold : DESIGN_TOKENS.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${DESIGN_TOKENS.transitions.normal};
  position: relative;
  display: flex;
  align-items: center;
  gap: ${DESIGN_TOKENS.spacing.sm};
  white-space: nowrap;
  flex-shrink: 0;

  ${props => props.isActive && css`
    border-bottom-color: ${DESIGN_TOKENS.colors.primary};
    color: ${DESIGN_TOKENS.colors.primary};
  `}

  &:hover {
    color: ${DESIGN_TOKENS.colors.primary};
  }

  svg {
    font-size: 1.2em;
  }

  @media (max-width: 1024px) {
    padding: ${DESIGN_TOKENS.spacing.sm} ${DESIGN_TOKENS.spacing.md};
  }
  
  @media (max-width: 768px) {
    font-size: ${DESIGN_TOKENS.typography.fontSize.base};
    padding: ${DESIGN_TOKENS.spacing.sm} ${DESIGN_TOKENS.spacing.md};
    min-width: fit-content;
  }
  
  @media (max-width: 480px) {
    font-size: ${DESIGN_TOKENS.typography.fontSize.sm};
    padding: ${DESIGN_TOKENS.spacing.xs} ${DESIGN_TOKENS.spacing.sm};
    gap: ${DESIGN_TOKENS.spacing.xs};
    min-width: fit-content;
    
    svg {
      font-size: 1em;
    }
  }
`;

export const TabContent = styled.div`
  display: ${props => props.isActive ? 'block' : 'none'};
  animation: ${props => props.isActive ? slideDown : 'none'} 0.3s ease-in-out;
`;

// Form Components
export const ProfileForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${DESIGN_TOKENS.spacing.lg};
  
  @media (max-width: 768px) {
    gap: ${DESIGN_TOKENS.spacing.md};
  }
  
  @media (max-width: 480px) {
    gap: ${DESIGN_TOKENS.spacing.sm};
  }
`;

export const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${DESIGN_TOKENS.spacing.lg};
  
  @media (max-width: 768px) {
    gap: ${DESIGN_TOKENS.spacing.md};
  }
  
  @media (max-width: 480px) {
    gap: ${DESIGN_TOKENS.spacing.sm};
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${DESIGN_TOKENS.spacing.sm};

  &:last-child {
    margin-bottom: 0;
  }
  
  @media (max-width: 480px) {
    gap: ${DESIGN_TOKENS.spacing.xs};
  }
`;

export const FormLabel = styled.label`
  display: block;
  font-weight: ${DESIGN_TOKENS.typography.fontWeight.semibold};
  color: ${DESIGN_TOKENS.colors.text.primary};
  font-size: ${DESIGN_TOKENS.typography.fontSize.sm};
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: ${DESIGN_TOKENS.spacing.xs};
  
  @media (max-width: 768px) {
    font-size: ${DESIGN_TOKENS.typography.fontSize.xs};
    margin-bottom: ${DESIGN_TOKENS.spacing.xs};
  }
  
  @media (max-width: 480px) {
    font-size: 0.7rem;
    letter-spacing: 0.5px;
  }
`;

export const FormInput = styled.input`
  ${formControlBase}
  
  @media (max-width: 768px) {
    padding: ${DESIGN_TOKENS.spacing.sm} ${DESIGN_TOKENS.spacing.md};
    font-size: ${DESIGN_TOKENS.typography.fontSize.sm};
  }
  
  @media (max-width: 480px) {
    padding: ${DESIGN_TOKENS.spacing.xs} ${DESIGN_TOKENS.spacing.sm};
    font-size: ${DESIGN_TOKENS.typography.fontSize.xs};
  }
`;

export const FormSelect = styled.select`
  ${formControlBase}
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3e%3cpath d='M6 9l6 6 6-6'%3e%3c/path%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right ${DESIGN_TOKENS.spacing.md} center;
  background-size: 1.5em;
  padding-right: 2.5rem;

  option {
    background: #1e293b;
    color: ${DESIGN_TOKENS.colors.text.primary};
  }
  
  @media (max-width: 768px) {
    padding: ${DESIGN_TOKENS.spacing.sm} ${DESIGN_TOKENS.spacing.md};
    padding-right: 2rem;
    font-size: ${DESIGN_TOKENS.typography.fontSize.sm};
    background-size: 1.2em;
  }
  
  @media (max-width: 480px) {
    padding: ${DESIGN_TOKENS.spacing.xs} ${DESIGN_TOKENS.spacing.sm};
    padding-right: 1.75rem;
    font-size: ${DESIGN_TOKENS.typography.fontSize.xs};
    background-size: 1em;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: ${DESIGN_TOKENS.spacing.md};
  margin-top: ${DESIGN_TOKENS.spacing.lg};
  justify-content: flex-start;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: ${DESIGN_TOKENS.spacing.sm};
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: ${DESIGN_TOKENS.spacing.xs};
    
    button {
      width: 100%;
    }
  }
`;

export const SaveButton = styled.button`
  ${buttonBase}
  background: linear-gradient(135deg, ${DESIGN_TOKENS.colors.primary} 0%, ${DESIGN_TOKENS.colors.primaryDark} 100%);
  color: ${DESIGN_TOKENS.colors.text.primary};
  border: none;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.2);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${DESIGN_TOKENS.shadows.hover};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: ${DESIGN_TOKENS.spacing.sm} ${DESIGN_TOKENS.spacing.lg};
    font-size: ${DESIGN_TOKENS.typography.fontSize.sm};
  }
  
  @media (max-width: 480px) {
    padding: ${DESIGN_TOKENS.spacing.md} ${DESIGN_TOKENS.spacing.lg};
    font-size: ${DESIGN_TOKENS.typography.fontSize.base};
  }
`;

export const CancelButton = styled.button`
  ${buttonBase}
  background: ${DESIGN_TOKENS.colors.background.glass};
  color: ${DESIGN_TOKENS.colors.text.secondary};
  border: 1px solid ${DESIGN_TOKENS.colors.border.input};

  &:hover:not(:disabled) {
    background: ${DESIGN_TOKENS.colors.background.glassHover};
    border-color: ${DESIGN_TOKENS.colors.border.glassHover};
    color: ${DESIGN_TOKENS.colors.text.primary};
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }
  
  @media (max-width: 768px) {
    padding: ${DESIGN_TOKENS.spacing.sm} ${DESIGN_TOKENS.spacing.lg};
    font-size: ${DESIGN_TOKENS.typography.fontSize.sm};
  }
  
  @media (max-width: 480px) {
    padding: ${DESIGN_TOKENS.spacing.md} ${DESIGN_TOKENS.spacing.lg};
    font-size: ${DESIGN_TOKENS.typography.fontSize.base};
  }
`;

// Profile Image Section
export const ImagePreviewContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${DESIGN_TOKENS.spacing.lg};
  padding: ${DESIGN_TOKENS.spacing.lg};
  background: ${DESIGN_TOKENS.colors.background.glassHover};
  border-radius: ${DESIGN_TOKENS.borderRadius.lg};
  border: 1px solid ${DESIGN_TOKENS.colors.border.input};
  margin-bottom: ${DESIGN_TOKENS.spacing.lg};

  @media (max-width: 768px) {
    gap: ${DESIGN_TOKENS.spacing.md};
    padding: ${DESIGN_TOKENS.spacing.md};
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: ${DESIGN_TOKENS.spacing.sm};
    padding: ${DESIGN_TOKENS.spacing.sm};
  }
`;

export const AvatarWrapper = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
  }
  
  @media (max-width: 480px) {
    width: 70px;
    height: 70px;
  }
`;

export const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid ${DESIGN_TOKENS.colors.primary};
  box-shadow: 0 8px 16px rgba(76, 175, 80, 0.2);
  animation: ${pulseGlow} 2s ease-in-out infinite;
  
  @media (max-width: 768px) {
    border-width: 2px;
  }
  
  @media (max-width: 480px) {
    border-width: 2px;
  }
`;

export const AvatarFallback = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(76, 175, 80, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid ${DESIGN_TOKENS.colors.border.input};
  color: ${DESIGN_TOKENS.colors.text.muted};

  svg {
    font-size: 2.5rem;
  }
  
  @media (max-width: 768px) {
    border-width: 2px;
    
    svg {
      font-size: 2rem;
    }
  }
  
  @media (max-width: 480px) {
    border-width: 2px;
    
    svg {
      font-size: 1.75rem;
    }
  }
`;

export const ImageUploadLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: ${DESIGN_TOKENS.spacing.sm};
  padding: ${DESIGN_TOKENS.spacing.md} ${DESIGN_TOKENS.spacing.lg};
  background: linear-gradient(135deg, ${DESIGN_TOKENS.colors.primary}, ${DESIGN_TOKENS.colors.primaryLight});
  color: ${DESIGN_TOKENS.colors.text.primary};
  border-radius: ${DESIGN_TOKENS.borderRadius.md};
  cursor: pointer;
  font-weight: ${DESIGN_TOKENS.typography.fontWeight.medium};
  font-size: ${DESIGN_TOKENS.typography.fontSize.sm};
  border: none;
  transition: all ${DESIGN_TOKENS.transitions.normal};
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${DESIGN_TOKENS.shadows.hover};
  }

  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: ${DESIGN_TOKENS.spacing.sm} ${DESIGN_TOKENS.spacing.md};
    font-size: ${DESIGN_TOKENS.typography.fontSize.xs};
  }
  
  @media (max-width: 480px) {
    padding: ${DESIGN_TOKENS.spacing.sm} ${DESIGN_TOKENS.spacing.md};
    font-size: 0.75rem;
    gap: ${DESIGN_TOKENS.spacing.xs};
  }
`;

// Section Components
export const PasswordSection = styled.section`
  margin-top: ${DESIGN_TOKENS.spacing.xxl};
  
  @media (max-width: 768px) {
    margin-top: ${DESIGN_TOKENS.spacing.xl};
  }
  
  @media (max-width: 480px) {
    margin-top: ${DESIGN_TOKENS.spacing.lg};
  }
`;

export const SectionTitle = styled.h2`
  font-size: ${DESIGN_TOKENS.typography.fontSize['2xl']};
  font-weight: ${DESIGN_TOKENS.typography.fontWeight.semibold};
  color: ${DESIGN_TOKENS.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${DESIGN_TOKENS.spacing.md};
  
  svg {
    color: ${DESIGN_TOKENS.colors.primary};
    font-size: 1.4em;
  }
  
  @media (max-width: 768px) {
    font-size: ${DESIGN_TOKENS.typography.fontSize.xl};
    gap: ${DESIGN_TOKENS.spacing.sm};
    
    svg {
      font-size: 1.2em;
    }
  }
  
  @media (max-width: 480px) {
    font-size: ${DESIGN_TOKENS.typography.fontSize.lg};
    gap: ${DESIGN_TOKENS.spacing.sm};
    
    svg {
      font-size: 1.1em;
    }
  }
`;

export const AccordionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: ${DESIGN_TOKENS.spacing.lg};
  margin: -${DESIGN_TOKENS.spacing.lg};
  border-radius: ${DESIGN_TOKENS.borderRadius.md};
  transition: all ${DESIGN_TOKENS.transitions.normal};

  &:hover {
    background: ${DESIGN_TOKENS.colors.background.glassHover};
  }

  svg {
    transition: transform ${DESIGN_TOKENS.transitions.normal};
    transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
    color: ${DESIGN_TOKENS.colors.primary};
  }
  
  @media (max-width: 768px) {
    padding: ${DESIGN_TOKENS.spacing.md};
    margin: -${DESIGN_TOKENS.spacing.md};
  }
  
  @media (max-width: 480px) {
    padding: ${DESIGN_TOKENS.spacing.sm};
    margin: -${DESIGN_TOKENS.spacing.sm};
  }
`;

export const AccordionContent = styled.div`
  margin-top: ${DESIGN_TOKENS.spacing.lg};
  overflow: hidden;
  
  @media (max-width: 768px) {
    margin-top: ${DESIGN_TOKENS.spacing.md};
  }
  
  @media (max-width: 480px) {
    margin-top: ${DESIGN_TOKENS.spacing.sm};
  }
`;

// Message Components
export const MessageBase = styled.div`
  border-radius: ${DESIGN_TOKENS.borderRadius.md};
  padding: ${DESIGN_TOKENS.spacing.md} ${DESIGN_TOKENS.spacing.lg};
  margin-bottom: ${DESIGN_TOKENS.spacing.lg};
  font-weight: ${DESIGN_TOKENS.typography.fontWeight.medium};
  display: flex;
  align-items: flex-start;
  gap: ${DESIGN_TOKENS.spacing.md};
  animation: ${slideDown} 0.3s ease-in-out;
  
  svg {
    font-size: 1.3em;
    flex-shrink: 0;
    margin-top: 2px;
  }
  
  @media (max-width: 768px) {
    padding: ${DESIGN_TOKENS.spacing.sm} ${DESIGN_TOKENS.spacing.md};
    margin-bottom: ${DESIGN_TOKENS.spacing.md};
    gap: ${DESIGN_TOKENS.spacing.sm};
    
    svg {
      font-size: 1.1em;
    }
  }
  
  @media (max-width: 480px) {
    padding: ${DESIGN_TOKENS.spacing.sm};
    margin-bottom: ${DESIGN_TOKENS.spacing.sm};
    gap: ${DESIGN_TOKENS.spacing.xs};
    
    svg {
      font-size: 1em;
    }
  }
`;

export const SuccessMessage = styled(MessageBase)`
  background: rgba(76, 175, 80, 0.15);
  color: ${DESIGN_TOKENS.colors.success};
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-left: 4px solid ${DESIGN_TOKENS.colors.success};
`;

export const ErrorMessage = styled(MessageBase)`
  background: rgba(244, 67, 54, 0.15);
  color: ${DESIGN_TOKENS.colors.error};
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-left: 4px solid ${DESIGN_TOKENS.colors.error};
`;

// Loading Component
export const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: ${DESIGN_TOKENS.colors.primary};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  @media (max-width: 480px) {
    width: 16px;
    height: 16px;
    border-width: 2px;
  }
`;

// Divider
export const Divider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, transparent, ${DESIGN_TOKENS.colors.border.glass}, transparent);
  margin: ${DESIGN_TOKENS.spacing.xl} 0;
  
  @media (max-width: 768px) {
    margin: ${DESIGN_TOKENS.spacing.lg} 0;
  }
  
  @media (max-width: 480px) {
    margin: ${DESIGN_TOKENS.spacing.md} 0;
  }
`;

// Grid Layout
export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${DESIGN_TOKENS.spacing.lg};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${DESIGN_TOKENS.spacing.md};
  }
  
  @media (max-width: 480px) {
    gap: ${DESIGN_TOKENS.spacing.sm};
  }
`;