import styled, { css, keyframes } from 'styled-components';

// Global styles to hide scrollbars
export const GlobalScrollbarStyles = css`
  /* Hide scrollbars globally */
  html, body {
    overflow-x: hidden;
    overflow-y: auto;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  html::-webkit-scrollbar,
  body::-webkit-scrollbar {
    display: none;
  }

  /* Also hide scrollbars on scrollable elements */
  * {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  *::-webkit-scrollbar {
    display: none;
  }
`;

// Design System Constants
const DESIGN_TOKENS = {
  colors: {
    primary: '#4CAF50',
    primaryDark: '#45a049',
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

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

// Mixins
const glassEffect = css`
  background: ${DESIGN_TOKENS.colors.background.glass};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid ${DESIGN_TOKENS.colors.border.glass};
`;

// Main Container
export const AnnouncementsContainer = styled.div`
  padding: ${DESIGN_TOKENS.spacing.xxl} ${DESIGN_TOKENS.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
  animation: ${fadeIn} 0.5s ease-in-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (max-width: 768px) {
    padding: ${DESIGN_TOKENS.spacing.lg} ${DESIGN_TOKENS.spacing.md};
  }
  
  @media (max-width: 480px) {
    padding: ${DESIGN_TOKENS.spacing.md} ${DESIGN_TOKENS.spacing.sm};
  }
`;

// Header
export const AnnouncementsHeader = styled.header`
  text-align: center;
  margin-bottom: ${DESIGN_TOKENS.spacing.xxl};
  animation: ${slideDown} 0.6s ease-in-out;
  
  @media (max-width: 768px) {
    margin-bottom: ${DESIGN_TOKENS.spacing.lg};
    padding-right: 3rem;
  }
  
  @media (max-width: 480px) {
    padding-right: 3rem;
  }
`;

export const AnnouncementsTitle = styled.h1`
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
  gap: ${DESIGN_TOKENS.spacing.sm};

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
  }
  
  @media (max-width: 480px) {
    gap: ${DESIGN_TOKENS.spacing.xs};
    padding: ${DESIGN_TOKENS.spacing.sm} 0;
    
    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

export const AnnouncementsSubtitle = styled.p`
  font-size: clamp(0.8rem, 1.5vw, 0.95rem);
  color: ${DESIGN_TOKENS.colors.text.secondary};
  margin: 0;
  padding: ${DESIGN_TOKENS.spacing.sm} 0;
  line-height: ${DESIGN_TOKENS.typography.lineHeight.normal};
  font-weight: ${DESIGN_TOKENS.typography.fontWeight.normal};
`;

// Filter Container - Desktop: all filters visible, Mobile: dropdown
export const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${DESIGN_TOKENS.spacing.md};
  justify-content: center;
  margin-bottom: ${DESIGN_TOKENS.spacing.xxl};
  padding: ${DESIGN_TOKENS.spacing.lg};
  position: relative;
  
  /* Desktop: show all filters, hide mobile dropdown */
  .desktop-filters {
    display: flex;
    flex-wrap: wrap;
    gap: ${DESIGN_TOKENS.spacing.md};
    justify-content: center;
  }
  
  .mobile-dropdown {
    display: none;
  }
  
  /* Mobile: show dropdown, hide desktop filters */
  @media (max-width: 768px) {
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
    padding: ${DESIGN_TOKENS.spacing.md};
    margin-bottom: ${DESIGN_TOKENS.spacing.lg};
    padding-right: 3rem;
    
    .desktop-filters {
      display: none;
    }
    
    .mobile-dropdown {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
    }
  }
    
  @media (max-width: 480px) {
    padding: ${DESIGN_TOKENS.spacing.sm};
    padding-right: 3rem;
  }
`;

export const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${DESIGN_TOKENS.spacing.sm};
  padding: ${DESIGN_TOKENS.spacing.sm} ${DESIGN_TOKENS.spacing.lg};
  background: ${props => props.active 
    ? 'linear-gradient(135deg, #4CAF50, #45a049)' 
    : DESIGN_TOKENS.colors.background.glass
  };
  color: ${props => props.active 
    ? DESIGN_TOKENS.colors.text.primary 
    : DESIGN_TOKENS.colors.text.secondary
  };
  border: 1px solid ${props => props.active 
    ? DESIGN_TOKENS.colors.primary 
    : DESIGN_TOKENS.colors.border.glass
  };
  border-radius: ${DESIGN_TOKENS.borderRadius.lg};
  font-size: ${DESIGN_TOKENS.typography.fontSize.sm};
  font-weight: ${DESIGN_TOKENS.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${DESIGN_TOKENS.transitions.normal};
  white-space: nowrap;
  position: relative;
  
  /* Dropdown toggle arrow */
  .dropdown-arrow {
    margin-left: ${DESIGN_TOKENS.spacing.xs};
    font-size: 0.7em;
    opacity: 0.8;
  }
  
  .icon {
    font-size: 1.2em;
  }
  
  .label {
    font-weight: ${DESIGN_TOKENS.typography.fontWeight.semibold};
  }
  
  .count {
    background: ${props => props.active 
      ? 'rgba(255, 255, 255, 0.2)' 
      : DESIGN_TOKENS.colors.background.glassHover
    };
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 0.75rem;
    font-weight: ${DESIGN_TOKENS.typography.fontWeight.bold};
    min-width: 20px;
    text-align: center;
  }

  &:hover {
    background: ${props => props.active 
      ? 'linear-gradient(135deg, #45a049, #4CAF50)' 
      : DESIGN_TOKENS.colors.background.glassHover
    };
    border-color: ${DESIGN_TOKENS.colors.primary};
    color: ${DESIGN_TOKENS.colors.text.primary};
    transform: translateY(-2px);
    box-shadow: ${DESIGN_TOKENS.shadows.sm};
  }

  &:active {
    transform: translateY(0);
  }
  
  /* Dropdown item specific styles - MOBILE ONLY */
  ${props => props.isDropdownItem && css`
    background: ${DESIGN_TOKENS.colors.background.glass};
    border-color: ${DESIGN_TOKENS.colors.border.glass};
    width: 100%;
    max-width: 300px;
    justify-content: center;
    
    &:hover {
      background: ${DESIGN_TOKENS.colors.background.glassHover};
      border-color: ${DESIGN_TOKENS.colors.primary};
      color: ${DESIGN_TOKENS.colors.text.primary};
      transform: none;
    }
    
    @media (max-width: 480px) {
      max-width: 260px;
    }
  `}
  
  /* Dropdown toggle specific styles - MOBILE ONLY */
  ${props => props.isDropdownToggle && css`
    display: none;
    
    @media (max-width: 768px) {
      display: flex;
      min-width: 180px;
      justify-content: center;
    }
    
    @media (max-width: 480px) {
      min-width: 160px;
    }
  `}
  
  @media (max-width: 768px) {
    padding: ${DESIGN_TOKENS.spacing.sm} ${DESIGN_TOKENS.spacing.md};
    font-size: ${DESIGN_TOKENS.typography.fontSize.sm};
    width: 100%;
    max-width: 300px;
    justify-content: center;
    
    .label {
      font-size: ${DESIGN_TOKENS.typography.fontSize.sm};
    }
    
    .icon {
      font-size: 1.1em;
    }
    
    .count {
      padding: 2px 6px;
      font-size: 0.75rem;
      min-width: 20px;
    }
  }
  
  @media (max-width: 480px) {
    padding: ${DESIGN_TOKENS.spacing.xs} ${DESIGN_TOKENS.spacing.md};
    max-width: 260px;
    
    .label {
      max-width: none;
    }
  }
`;

// Dropdown container for filter options
export const FilterDropdown = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${DESIGN_TOKENS.spacing.xs};
  margin-top: ${DESIGN_TOKENS.spacing.xs};
  padding: ${DESIGN_TOKENS.spacing.sm};
  ${glassEffect}
  border-radius: ${DESIGN_TOKENS.borderRadius.lg};
  width: 100%;
  max-width: 300px;
  animation: ${slideDown} 0.2s ease-in-out;
  
  @media (max-width: 768px) {
    max-width: 300px;
  }
  
  @media (max-width: 480px) {
    max-width: 260px;
  }
`;

// Grid Layout
export const AnnouncementsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: ${DESIGN_TOKENS.spacing.xl};
  margin-bottom: ${DESIGN_TOKENS.spacing.xxl};
  width: 100%;
  
  /* CHANGED: Ensure no horizontal overflow */
  overflow-x: hidden;
  
  /* CHANGED: Tablet - single column with adjusted minmax */
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${DESIGN_TOKENS.spacing.lg};
    min-width: 0;
    padding-right: 3rem;
  }
  
  /* CHANGED: Mobile - tighter gaps + shift left */
  @media (max-width: 480px) {
    gap: ${DESIGN_TOKENS.spacing.md};
    min-width: 0;
    padding-right:3rem;
  }
`;

// Loading State
export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${DESIGN_TOKENS.spacing.xxl};
  color: ${DESIGN_TOKENS.colors.text.secondary};
  text-align: center;
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.2);
    border-top-color: ${DESIGN_TOKENS.colors.primary};
    border-radius: 50%;
    animation: ${spin} 0.8s linear infinite;
    margin-bottom: ${DESIGN_TOKENS.spacing.lg};
  }
  
  p {
    font-size: ${DESIGN_TOKENS.typography.fontSize.lg};
    margin: 0;
  }
`;

// Empty State
export const EmptyState = styled.div`
  text-align: center;
  padding: ${DESIGN_TOKENS.spacing.xxl};
  color: ${DESIGN_TOKENS.colors.text.secondary};
  
  .icon {
    font-size: 4rem;
    margin-bottom: ${DESIGN_TOKENS.spacing.lg};
    opacity: 0.5;
  }
  
  h3 {
    font-size: ${DESIGN_TOKENS.typography.fontSize['2xl']};
    font-weight: ${DESIGN_TOKENS.typography.fontWeight.semibold};
    color: ${DESIGN_TOKENS.colors.text.primary};
    margin: 0 0 ${DESIGN_TOKENS.spacing.md} 0;
  }
  
  p {
    font-size: ${DESIGN_TOKENS.typography.fontSize.base};
    line-height: ${DESIGN_TOKENS.typography.lineHeight.normal};
    margin: 0;
    max-width: 500px;
    margin: 0 auto;
  }
  
  @media (max-width: 480px) {
    padding: ${DESIGN_TOKENS.spacing.lg};
    
    .icon {
      font-size: 3rem;
    }
    
    h3 {
      font-size: ${DESIGN_TOKENS.typography.fontSize.xl};
    }
    
    p {
      font-size: ${DESIGN_TOKENS.typography.fontSize.sm};
    }
  }
`;

// Error Message
export const ErrorMessage = styled.div`
  ${glassEffect}
  border-radius: ${DESIGN_TOKENS.borderRadius.md};
  padding: ${DESIGN_TOKENS.spacing.md} ${DESIGN_TOKENS.spacing.lg};
  margin-bottom: ${DESIGN_TOKENS.spacing.lg};
  font-weight: ${DESIGN_TOKENS.typography.fontWeight.medium};
  display: flex;
  align-items: center;
  gap: ${DESIGN_TOKENS.spacing.md};
  background: rgba(244, 67, 54, 0.15);
  color: ${DESIGN_TOKENS.colors.error};
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-left: 4px solid ${DESIGN_TOKENS.colors.error};
  animation: ${slideDown} 0.3s ease-in-out;
  
  svg {
    font-size: 1.3em;
    flex-shrink: 0;
  }
`;
