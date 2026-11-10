import styled, { css, keyframes } from 'styled-components';

// ─────────────────────────────────────────────────────────────
// Réglage rapide : espace entre le header et "Mon Profil"
// Plus négatif = remonte (ex: -70px), moins négatif = descend (ex: -30px)
// ─────────────────────────────────────────────────────────────
const PAGE_TOP_OFFSET = '-50px';

// Design System Constants
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
      primary: 'var(--client-text, #111111)',
      secondary: 'var(--client-text, #111111)',
      muted: 'var(--client-muted, #5b6873)',
      disabled: 'var(--client-muted, #5b6873)',
    },
    background: {
      // Gris neutre translucide : lisible en mode clair ET sombre
      glass: 'rgba(255, 255, 255, 0.10)',
      glassHover: 'rgba(255, 255, 255, 0.16)',
      glassActive: 'rgba(255, 255, 255, 0.22)',
      field: 'rgba(127, 140, 155, 0.08)',
      fieldHover: 'rgba(127, 140, 155, 0.14)',
      dark: 'rgba(0, 0, 0, 0.3)',
    },
    border: {
      glass: 'rgba(127, 140, 155, 0.22)',
      glassHover: 'rgba(127, 140, 155, 0.35)',
      input: 'rgba(127, 140, 155, 0.30)',
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
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    pill: '999px',
  },
  shadows: {
    glass: '0 10px 40px rgba(15, 23, 42, 0.08)',
    focus: '0 0 0 4px rgba(76, 175, 80, 0.18)',
    hover: '0 10px 24px rgba(76, 175, 80, 0.28)',
    sm: '0 2px 8px rgba(15, 23, 42, 0.08)',
  },
  transitions: {
    fast: '0.15s ease',
    normal: '0.25s ease',
    slow: '0.5s ease',
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
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
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
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  border: 1px solid ${DESIGN_TOKENS.colors.border.glass};
  box-shadow: ${DESIGN_TOKENS.shadows.glass};
`;

const formControlBase = css`
  width: 100%;
  padding: 0.7rem 0.95rem;
  border: 1px solid ${DESIGN_TOKENS.colors.border.input};
  border-radius: ${DESIGN_TOKENS.borderRadius.md};
  font-size: ${DESIGN_TOKENS.typography.fontSize.base};
  font-family: ${DESIGN_TOKENS.typography.fontFamily.body};
  transition: border-color ${DESIGN_TOKENS.transitions.normal},
    box-shadow ${DESIGN_TOKENS.transitions.normal},
    background ${DESIGN_TOKENS.transitions.normal};
  background: ${DESIGN_TOKENS.colors.background.field};
  color: ${DESIGN_TOKENS.colors.text.primary};
  box-sizing: border-box;

  &::placeholder {
    color: ${DESIGN_TOKENS.colors.text.muted};
  }

  &:hover:not(:disabled) {
    background: ${DESIGN_TOKENS.colors.background.fieldHover};
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
    background: ${props => props.dark ? "#071523" : "#fff"};
  }
`;

const buttonBase = css`
  padding: 0.7rem 1.5rem;
  border-radius: ${DESIGN_TOKENS.borderRadius.md};
  font-size: ${DESIGN_TOKENS.typography.fontSize.sm};
  font-weight: ${DESIGN_TOKENS.typography.fontWeight.semibold};
  font-family: ${DESIGN_TOKENS.typography.fontFamily.body};
  cursor: pointer;
  transition: all ${DESIGN_TOKENS.transitions.normal};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${DESIGN_TOKENS.spacing.xs};
  min-width: 120px;
  border: none;
  white-space: nowrap;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
`;

// ─────────────────────────────────────────────────────────────
// Layout
// ─────────────────────────────────────────────────────────────
export const ProfileContainer = styled.div`
  padding: 0 ${DESIGN_TOKENS.spacing.xl} ${DESIGN_TOKENS.spacing.xl};
  max-width: 820px;
  width: 100%;
  margin: ${PAGE_TOP_OFFSET} auto 0;
  min-height: 0;
  box-sizing: border-box;
  animation: ${fadeIn} 0.4s ease;

  @media (max-width: 1024px) {
    padding: 0 ${DESIGN_TOKENS.spacing.lg} ${DESIGN_TOKENS.spacing.lg};
  }

  @media (max-width: 768px) {
    padding: 0 ${DESIGN_TOKENS.spacing.md} ${DESIGN_TOKENS.spacing.lg};
  }

  @media (max-width: 480px) {
    padding: 0 ${DESIGN_TOKENS.spacing.sm} ${DESIGN_TOKENS.spacing.md};
  }
`;

export const ProfileHeader = styled.header`
  text-align: center;
  margin-bottom: ${DESIGN_TOKENS.spacing.lg};
  animation: ${slideDown} 0.5s ease;

  @media (max-width: 480px) {
    margin-bottom: ${DESIGN_TOKENS.spacing.md};
  }
`;

export const ProfileTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  background: none;
  -webkit-background-clip: initial;
  -webkit-text-fill-color: var(--client-text, #111111);
  background-clip: initial;
  color: var(--client-text, #111111);
  margin: 0 0 0.25rem;
  letter-spacing: -0.5px;
  line-height: ${DESIGN_TOKENS.typography.lineHeight.tight};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;

  @media (max-width: 768px) {
    font-size: 1.625rem;
    gap: 0.5rem;
  }

  @media (max-width: 480px) {
    font-size: 1.375rem;
    gap: 0.4rem;
  }

  svg {
    font-size: 1.1em;
    flex-shrink: 0;
    color: ${DESIGN_TOKENS.colors.primary};
  }
`;

export const ProfileSubtitle = styled.p`
  font-size: clamp(0.875rem, 1.6vw, 1rem);
  color: ${DESIGN_TOKENS.colors.text.muted};
  margin: 0;
  line-height: ${DESIGN_TOKENS.typography.lineHeight.normal};
  font-weight: ${DESIGN_TOKENS.typography.fontWeight.normal};
`;

export const ProfileContent = styled.div`
  ${glassEffect}
  border-radius: ${DESIGN_TOKENS.borderRadius.xl};
  padding: 1.25rem 1.5rem 1.5rem;
  animation: ${slideDown} 0.6s ease;

  @media (max-width: 768px) {
    padding: 1rem;
    border-radius: ${DESIGN_TOKENS.borderRadius.lg};
  }

  @media (max-width: 480px) {
    padding: 0.75rem;
    border-radius: ${DESIGN_TOKENS.borderRadius.md};
  }
`;

// ─────────────────────────────────────────────────────────────
// Onglets (style "segmented control")
// ─────────────────────────────────────────────────────────────
export const TabContainer = styled.div`
  display: flex;
  gap: ${DESIGN_TOKENS.spacing.xs};
  padding: 0.3rem;
  margin-bottom: ${DESIGN_TOKENS.spacing.lg};
  background: ${DESIGN_TOKENS.colors.background.field};
  border: 1px solid ${DESIGN_TOKENS.colors.border.glass};
  border-radius: ${DESIGN_TOKENS.borderRadius.md};
  position: relative;

  @media (max-width: 768px) {
    margin-bottom: ${DESIGN_TOKENS.spacing.md};
    overflow-x: auto;
  }

  @media (max-width: 480px) {
    margin-bottom: ${DESIGN_TOKENS.spacing.sm};
  }
`;

export const TabButton = styled.button`
  flex: 1;
  padding: 0.6rem 1rem;
  background: transparent;
  border: none;
  border-radius: ${DESIGN_TOKENS.borderRadius.sm};
  color: ${props => props.isActive ? DESIGN_TOKENS.colors.primaryDark : DESIGN_TOKENS.colors.text.muted};
  font-size: ${DESIGN_TOKENS.typography.fontSize.base};
  font-weight: ${props => props.isActive ? DESIGN_TOKENS.typography.fontWeight.semibold : DESIGN_TOKENS.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${DESIGN_TOKENS.transitions.normal};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${DESIGN_TOKENS.spacing.xs};
  white-space: nowrap;
  flex-shrink: 0;

  ${props => props.isActive && css`
    background: rgba(76, 175, 80, 0.16);
    color: ${DESIGN_TOKENS.colors.primaryDark};
    box-shadow: ${DESIGN_TOKENS.shadows.sm};
  `}

  &:hover {
    color: ${DESIGN_TOKENS.colors.primaryDark};
    background: rgba(76, 175, 80, 0.10);
  }

  svg {
    font-size: 1.1em;
  }

  @media (max-width: 768px) {
    font-size: ${DESIGN_TOKENS.typography.fontSize.sm};
    padding: 0.55rem 0.9rem;
    min-width: fit-content;
  }

  @media (max-width: 480px) {
    font-size: ${DESIGN_TOKENS.typography.fontSize.xs};
    padding: 0.5rem 0.7rem;
    svg {
      font-size: 1em;
    }
  }
`;

export const TabContent = styled.div`
  display: ${props => props.isActive ? 'block' : 'none'};
  animation: ${props => props.isActive ? slideDown : 'none'} 0.25s ease;
`;

// ─────────────────────────────────────────────────────────────
// Formulaires
// ─────────────────────────────────────────────────────────────
export const ProfileForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${DESIGN_TOKENS.spacing.md};

  @media (max-width: 480px) {
    gap: ${DESIGN_TOKENS.spacing.sm};
  }
`;

export const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${DESIGN_TOKENS.spacing.md};

  @media (max-width: 480px) {
    gap: ${DESIGN_TOKENS.spacing.sm};
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${DESIGN_TOKENS.spacing.xs};

  &:last-child {
    margin-bottom: 0;
  }
`;

export const FormLabel = styled.label`
  display: block;
  font-weight: ${DESIGN_TOKENS.typography.fontWeight.semibold};
  color: ${DESIGN_TOKENS.colors.text.primary};
  font-size: ${DESIGN_TOKENS.typography.fontSize.sm};
  letter-spacing: 0.1px;
  margin-bottom: 0.1rem;

  @media (max-width: 480px) {
    font-size: ${DESIGN_TOKENS.typography.fontSize.xs};
  }
`;

export const FormInput = styled.input`
  ${formControlBase}

  @media (max-width: 480px) {
    padding: 0.6rem 0.8rem;
    font-size: ${DESIGN_TOKENS.typography.fontSize.sm};
  }
`;

export const FormSelect = styled.select`
  ${formControlBase}
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3e%3cpath d='M6 9l6 6 6-6'%3e%3c/path%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.8rem center;
  background-size: 1.3em;
  padding-right: 2.5rem;

  option {
    background: Canvas;
    color: CanvasText;
  }

  @media (max-width: 480px) {
    padding: 0.6rem 0.8rem;
    padding-right: 2.25rem;
    font-size: ${DESIGN_TOKENS.typography.fontSize.sm};
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: ${DESIGN_TOKENS.spacing.sm};
  margin-top: ${DESIGN_TOKENS.spacing.md};
  justify-content: flex-start;
  flex-wrap: wrap;

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
  color: #fff;
  border: none;
  box-shadow: 0 4px 14px rgba(76, 175, 80, 0.25);

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: ${DESIGN_TOKENS.shadows.hover};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  @media (max-width: 480px) {
    padding: 0.8rem 1.25rem;
    font-size: ${DESIGN_TOKENS.typography.fontSize.base};
  }
`;

export const CancelButton = styled.button`
  ${buttonBase}
  background: transparent;
  color: ${DESIGN_TOKENS.colors.text.secondary};
  border: 1px solid ${DESIGN_TOKENS.colors.border.input};

  &:hover:not(:disabled) {
    background: ${DESIGN_TOKENS.colors.background.fieldHover};
    border-color: ${DESIGN_TOKENS.colors.border.glassHover};
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  @media (max-width: 480px) {
    padding: 0.8rem 1.25rem;
    font-size: ${DESIGN_TOKENS.typography.fontSize.base};
  }
`;

// ─────────────────────────────────────────────────────────────
// Photo de profil
// ─────────────────────────────────────────────────────────────
export const ImagePreviewContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${DESIGN_TOKENS.spacing.lg};
  padding: ${DESIGN_TOKENS.spacing.md} ${DESIGN_TOKENS.spacing.lg};
  background: ${DESIGN_TOKENS.colors.background.field};
  border-radius: ${DESIGN_TOKENS.borderRadius.lg};
  border: 1px solid ${DESIGN_TOKENS.colors.border.glass};
  margin-bottom: ${DESIGN_TOKENS.spacing.md};

  @media (max-width: 768px) {
    gap: ${DESIGN_TOKENS.spacing.md};
    padding: ${DESIGN_TOKENS.spacing.md};
  }

  @media (max-width: 480px) {
    flex-direction: column;
    text-align: center;
    gap: ${DESIGN_TOKENS.spacing.sm};
    padding: ${DESIGN_TOKENS.spacing.sm};
  }
`;

export const AvatarWrapper = styled.div`
  position: relative;
  width: 84px;
  height: 84px;
  flex-shrink: 0;

  @media (max-width: 480px) {
    width: 72px;
    height: 72px;
  }
`;

export const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid ${DESIGN_TOKENS.colors.primary};
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.2);
  transition: transform ${DESIGN_TOKENS.transitions.normal};

  &:hover {
    animation: ${pulseGlow} 1.6s ease-in-out infinite;
    transform: scale(1.03);
  }

  @media (max-width: 768px) {
    border-width: 2px;
  }
`;

export const AvatarFallback = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.22), rgba(76, 175, 80, 0.08));
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed ${DESIGN_TOKENS.colors.border.input};
  color: ${DESIGN_TOKENS.colors.text.muted};
  box-sizing: border-box;

  svg {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    svg {
      font-size: 1.75rem;
    }
  }
`;

export const ImageUploadLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: ${DESIGN_TOKENS.spacing.xs};
  padding: 0.6rem 1.1rem;
  background: linear-gradient(135deg, ${DESIGN_TOKENS.colors.primary}, ${DESIGN_TOKENS.colors.primaryLight});
  color: #fff;
  border-radius: ${DESIGN_TOKENS.borderRadius.md};
  cursor: pointer;
  font-weight: ${DESIGN_TOKENS.typography.fontWeight.semibold};
  font-size: ${DESIGN_TOKENS.typography.fontSize.sm};
  border: none;
  transition: all ${DESIGN_TOKENS.transitions.normal};
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.22);

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${DESIGN_TOKENS.shadows.hover};
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 480px) {
    font-size: ${DESIGN_TOKENS.typography.fontSize.xs};
  }
`;

// ─────────────────────────────────────────────────────────────
// Sections
// ─────────────────────────────────────────────────────────────
export const PasswordSection = styled.section`
  margin-top: ${DESIGN_TOKENS.spacing.lg};

  @media (max-width: 480px) {
    margin-top: ${DESIGN_TOKENS.spacing.md};
  }
`;

export const SectionTitle = styled.h2`
  font-size: ${DESIGN_TOKENS.typography.fontSize.xl};
  font-weight: ${DESIGN_TOKENS.typography.fontWeight.semibold};
  color: ${DESIGN_TOKENS.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${DESIGN_TOKENS.spacing.sm};

  svg {
    color: ${DESIGN_TOKENS.colors.primary};
    font-size: 1.2em;
  }

  @media (max-width: 480px) {
    font-size: ${DESIGN_TOKENS.typography.fontSize.lg};
  }
`;

export const AccordionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: ${DESIGN_TOKENS.spacing.md};
  margin: -${DESIGN_TOKENS.spacing.md};
  border-radius: ${DESIGN_TOKENS.borderRadius.md};
  transition: background ${DESIGN_TOKENS.transitions.normal};

  &:hover {
    background: ${DESIGN_TOKENS.colors.background.fieldHover};
  }

  svg {
    transition: transform ${DESIGN_TOKENS.transitions.normal};
    transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
    color: ${DESIGN_TOKENS.colors.primary};
  }

  @media (max-width: 480px) {
    padding: ${DESIGN_TOKENS.spacing.sm};
    margin: -${DESIGN_TOKENS.spacing.sm};
  }
`;

export const AccordionContent = styled.div`
  margin-top: ${DESIGN_TOKENS.spacing.lg};
  overflow: hidden;

  @media (max-width: 480px) {
    margin-top: ${DESIGN_TOKENS.spacing.md};
  }
`;

// ─────────────────────────────────────────────────────────────
// Messages
// ─────────────────────────────────────────────────────────────
export const MessageBase = styled.div`
  border-radius: ${DESIGN_TOKENS.borderRadius.md};
  padding: ${DESIGN_TOKENS.spacing.sm} ${DESIGN_TOKENS.spacing.md};
  margin-bottom: ${DESIGN_TOKENS.spacing.md};
  font-size: ${DESIGN_TOKENS.typography.fontSize.sm};
  font-weight: ${DESIGN_TOKENS.typography.fontWeight.medium};
  display: flex;
  align-items: flex-start;
  gap: ${DESIGN_TOKENS.spacing.sm};
  animation: ${slideDown} 0.25s ease;

  svg {
    font-size: 1.2em;
    flex-shrink: 0;
    margin-top: 1px;
  }

  @media (max-width: 480px) {
    padding: ${DESIGN_TOKENS.spacing.sm};
    margin-bottom: ${DESIGN_TOKENS.spacing.sm};
    gap: ${DESIGN_TOKENS.spacing.xs};
  }
`;

export const SuccessMessage = styled(MessageBase)`
  background: rgba(76, 175, 80, 0.12);
  color: ${DESIGN_TOKENS.colors.primaryDark};
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-left: 4px solid ${DESIGN_TOKENS.colors.success};
`;

export const ErrorMessage = styled(MessageBase)`
  background: rgba(244, 67, 54, 0.10);
  color: #c62828;
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-left: 4px solid ${DESIGN_TOKENS.colors.error};
`;

// Loading
export const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(127, 140, 155, 0.25);
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
  margin: ${DESIGN_TOKENS.spacing.lg} 0;

  @media (max-width: 480px) {
    margin: ${DESIGN_TOKENS.spacing.md} 0;
  }
`;

// Grid
export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${DESIGN_TOKENS.spacing.md};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 480px) {
    gap: ${DESIGN_TOKENS.spacing.sm};
  }
`;