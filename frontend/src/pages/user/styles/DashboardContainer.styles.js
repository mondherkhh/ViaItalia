import styled from 'styled-components';

export const DashboardContainer = styled.div`
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  color: #e8eef7;
  background: #071321;
  background-image: radial-gradient(circle at 85% 5%, rgba(24, 92, 135, .12), transparent 32%), linear-gradient(180deg, #071321 0%, #091727 100%);

  /* star / particle effect */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(4, 12, 22, .2), transparent 35%, rgba(10, 27, 44, .16));
    pointer-events: none;
  }
`;

export const MainContent = styled.div`
  display: flex;
  min-height: 100vh;
  position: relative;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const ContentArea = styled.div`
  flex: 1;
  padding: 28px 34px 40px;
  margin-left: 280px;
  margin-top: 96px;
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    margin-left: 0;
    margin-top: 70px;
    padding: 1rem;
    padding-bottom: 80px; // Space for bottom nav
  }
  
  @media (max-width: 1024px) {
    margin-left: 240px;
  }
`;

export const ContentAreaWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

// Responsive utilities
export const DesktopOnly = styled.div`
  display: block;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

export const MobileOnly = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

export const TabletOnly = styled.div`
  display: none;
  
  @media (min-width: 769px) and (max-width: 1024px) {
    display: block;
  }
`;

// Grid layouts
export const Grid = styled.div`
  display: grid;
  gap: ${props => props.gap || '1rem'};
  grid-template-columns: ${props => props.columns || 'repeat(auto-fit, minmax(300px, 1fr))'};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${props => props.mobileGap || '0.75rem'};
  }
`;

export const Flex = styled.div`
  display: flex;
  align-items: ${props => props.align || 'stretch'};
  justify-content: ${props => props.justify || 'flex-start'};
  gap: ${props => props.gap || '1rem'};
  flex-direction: ${props => props.direction || 'row'};
  flex-wrap: ${props => props.wrap || 'nowrap'};
  
  @media (max-width: 768px) {
    flex-direction: ${props => props.mobileDirection || props.direction || 'column'};
    gap: ${props => props.mobileGap || '0.5rem'};
  }
`;

// Spacing utilities
export const Spacer = styled.div`
  height: ${props => props.height || '1rem'};
  width: ${props => props.width || '100%'};
  
  @media (max-width: 768px) {
    height: ${props => props.mobileHeight || props.height || '0.75rem'};
  }
`;

export const Section = styled.section`
  margin-bottom: ${props => props.marginBottom || '2rem'};
  padding: ${props => props.padding || '0'};
  
  @media (max-width: 768px) {
    margin-bottom: ${props => props.mobileMarginBottom || '1.5rem'};
    padding: ${props => props.mobilePadding || props.padding || '0'};
  }
`;

// Container utilities
export const Container = styled.div`
  max-width: ${props => props.maxWidth || '1200px'};
  margin: 0 auto;
  padding: ${props => props.padding || '0 1rem'};
  
  @media (max-width: 768px) {
    padding: ${props => props.mobilePadding || '0 0.75rem'};
  }
`;

export const FullWidthContainer = styled.div`
  width: 100%;
  max-width: 100%;
  padding: ${props => props.padding || '0'};
`;

// Animation utilities
export const AnimatedContainer = styled.div`
  transition: all 0.3s ease;
  
  &:hover {
    transform: ${props => props.hoverTransform || 'translateY(-2px)'};
  }
`;

export const FadeIn = styled.div`
  opacity: 0;
  animation: fadeIn 0.5s ease forwards;
  animation-delay: ${props => props.delay || '0s'};
  
  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }
`;

export const SlideIn = styled.div`
  transform: translateX(${props => props.fromX || '-20px'});
  opacity: 0;
  animation: slideIn 0.5s ease forwards;
  animation-delay: ${props => props.delay || '0s'};
  
  @keyframes slideIn {
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

// Loading states
export const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: ${props => props.minHeight || '200px'};
  padding: 2rem;
`;

export const LoadingSpinner = styled.div`
  width: ${props => props.size || '40px'};
  height: ${props => props.size || '40px'};
  border: ${props => props.borderWidth || '4px'} solid ${props => props.color || 'rgba(255, 255, 255, 0.3)'};
  border-top: ${props => props.borderWidth || '4px'} solid ${props => props.spinColor || '#ffffff'};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Error states
export const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: ${props => props.minHeight || '200px'};
  padding: 2rem;
  text-align: center;
  color: #ffffff;
`;

export const ErrorMessage = styled.div`
  font-size: ${props => props.fontSize || '1.1rem'};
  margin-bottom: 1rem;
  opacity: 0.9;
`;

// Empty states
export const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: ${props => props.minHeight || '200px'};
  padding: 2rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
`;

export const EmptyMessage = styled.div`
  font-size: ${props => props.fontSize || '1.1rem'};
  margin-bottom: 0.5rem;
`;

export const EmptySubMessage = styled.div`
  font-size: ${props => props.fontSize || '0.9rem'};
  opacity: 0.8;
`;

// Card utilities
export const CardContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: ${props => props.borderRadius || '16px'};
  padding: ${props => props.padding || '1.5rem'};
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
  
  @media (max-width: 768px) {
    padding: ${props => props.mobilePadding || '1rem'};
    border-radius: ${props => props.mobileBorderRadius || '12px'};
  }
`;

// Overlay utilities
export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  z-index: ${props => props.zIndex || '1000'};
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.opacity || '1'};
  visibility: ${props => props.visible !== false ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

// Modal utilities
export const ModalContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: ${props => props.borderRadius || '20px'};
  padding: ${props => props.padding || '2rem'};
  max-width: ${props => props.maxWidth || '500px'};
  width: ${props => props.width || '90%'};
  max-height: ${props => props.maxHeight || '90vh'};
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  transform: scale(${props => props.scale || '1'});
  opacity: ${props => props.opacity || '1'};
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    width: 95%;
    padding: ${props => props.mobilePadding || '1.5rem'};
    border-radius: ${props => props.mobileBorderRadius || '16px'};
  }
`;

// Responsive text utilities
export const ResponsiveText = styled.span`
  font-size: ${props => props.fontSize || '1rem'};
  
  @media (max-width: 768px) {
    font-size: ${props => props.mobileFontSize || props.fontSize || '0.9rem'};
  }
  
  @media (max-width: 480px) {
    font-size: ${props => props.smallMobileFontSize || props.mobileFontSize || props.fontSize || '0.85rem'};
  }
`;

export const ResponsiveTitle = styled.h1`
  font-size: ${props => props.fontSize || '2rem'};
  font-weight: ${props => props.fontWeight || '700'};
  margin-bottom: ${props => props.marginBottom || '1rem'};
  
  @media (max-width: 768px) {
    font-size: ${props => props.mobileFontSize || '1.5rem'};
    margin-bottom: ${props => props.mobileMarginBottom || '0.75rem'};
  }
`;

export const ResponsiveSubtitle = styled.h2`
  font-size: ${props => props.fontSize || '1.5rem'};
  font-weight: ${props => props.fontWeight || '600'};
  margin-bottom: ${props => props.marginBottom || '0.75rem'};
  
  @media (max-width: 768px) {
    font-size: ${props => props.mobileFontSize || '1.25rem'};
    margin-bottom: ${props => props.mobileMarginBottom || '0.5rem'};
  }
`;
