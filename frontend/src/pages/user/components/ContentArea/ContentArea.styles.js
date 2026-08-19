import styled from 'styled-components';

export const ContentAreaWrapper = styled.main`
  flex: 1;
  padding: 2rem;        /* ❌ نحّينا الفراغ */
  margin-left: 2rem;    /* ❌ نحّينا sidebar offset */
  margin-top: 6rem;     /* ❌ نحّينا header space */
  margin-right: -15rem;
  height: 100vh;     /* ✅ full height */
  width: 100%;
`;
export const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
`;

export const ContentBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  pointer-events: none;
  z-index: -1;
`;

export const ContentHeader = styled.div`
  margin-bottom: 2rem;
  animation: fadeInDown 0.6s ease;
  
  @keyframes fadeInDown {
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
    margin-bottom: 1.5rem;
  }
`;

export const ContentTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.75rem;
  }
`;

export const ContentSubtitle = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

export const ContentBody = styled.div`
  animation: fadeInUp 0.6s ease 0.2s both;
  
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
`;

export const ContentSection = styled.section`
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

export const ContentGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

export const ContentFlex = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: ${props => props.align || 'stretch'};
  flex-direction: ${props => props.direction || 'row'};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

export const ContentLoading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  flex-direction: column;
  gap: 1rem;
`;

export const ContentLoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const ContentLoadingText = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
`;

export const ContentError = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  flex-direction: column;
  gap: 1rem;
  text-align: center;
  padding: 2rem;
`;

export const ContentErrorIcon = styled.div`
  font-size: 4rem;
  opacity: 0.6;
`;

export const ContentErrorMessage = styled.div`
  color: #ff6b6b;
  font-size: 1.1rem;
  font-weight: 500;
`;

export const ContentErrorSubMessage = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

export const ContentEmpty = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  flex-direction: column;
  gap: 1rem;
  text-align: center;
  padding: 2rem;
`;

export const ContentEmptyIcon = styled.div`
  font-size: 3rem;
  opacity: 0.5;
`;

export const ContentEmptyMessage = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
`;

export const ContentEmptySubMessage = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

export const ContentTransition = styled.div`
  opacity: ${props => props.isTransitioning ? 0 : 1};
  transform: ${props => props.isTransitioning ? 'translateY(20px)' : 'translateY(0)'};
  transition: all 0.3s ease;
`;

export const ContentFadeIn = styled.div`
  animation: fadeIn 0.5s ease forwards;
  animation-delay: ${props => props.delay || '0s'};
  opacity: 0;
  
  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }
`;

export const ContentSlideIn = styled.div`
  animation: slideIn 0.5s ease forwards;
  animation-delay: ${props => props.delay || '0s'};
  transform: translateX(-20px);
  opacity: 0;
  
  @keyframes slideIn {
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

export const ContentStagger = styled.div`
  > * {
    animation: staggerIn 0.5s ease forwards;
    opacity: 0;
    transform: translateY(20px);
  }
  
  > *:nth-child(1) { animation-delay: 0.1s; }
  > *:nth-child(2) { animation-delay: 0.2s; }
  > *:nth-child(3) { animation-delay: 0.3s; }
  > *:nth-child(4) { animation-delay: 0.4s; }
  > *:nth-child(5) { animation-delay: 0.5s; }
  
  @keyframes staggerIn {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const ContentWithSidebar = styled(ContentAreaWrapper)`
  display: flex;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

export const ContentMain = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ContentSidebar = styled.aside`
  width: 300px;
  flex-shrink: 0;
  
  @media (max-width: 1024px) {
    width: 100%;
  }
`;

export const ContentFullWidth = styled(ContentAreaWrapper)`
  margin-left: 0;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;
