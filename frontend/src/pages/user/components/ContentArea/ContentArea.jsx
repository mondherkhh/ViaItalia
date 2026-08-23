import React, { useEffect, useRef, useState } from 'react';
import { animateContentArea, animateContentCards } from '../../utils/animations';
import {
  ContentAreaWrapper,
  ContentContainer,
  ContentBackground,
  ContentHeader,
  ContentTitle,
  ContentSubtitle,
  ContentBody,
  ContentSection,
  ContentGrid,
  ContentFlex,
  ContentLoading,
  ContentLoadingSpinner,
  ContentLoadingText,
  ContentError,
  ContentErrorIcon,
  ContentErrorMessage,
  ContentErrorSubMessage,
  ContentEmpty,
  ContentEmptyIcon,
  ContentEmptyMessage,
  ContentEmptySubMessage,
  ContentTransition,
  ContentFadeIn,
  ContentSlideIn,
  ContentStagger
} from './ContentArea.styles';

const ContentArea = ({ 
  activeMenu, 
  children, 
  title, 
  subtitle, 
  isLoading = false, 
  error = null, 
  isEmpty = false,
  emptyMessage = 'Aucune donnée disponible',
  emptySubMessage = 'Commencez par ajouter des éléments',
  loadingMessage = 'Chargement...',
  errorMessage = 'Une erreur est survenue',
  errorSubMessage = 'Veuillez réessayer plus tard',
  className = '',
  animationDelay = 0
}) => {
  const contentRef = useRef(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Animate content area on mount and when active menu changes
  useEffect(() => {
    if (contentRef.current) {
      animateContentArea(contentRef.current);
    }
  }, [activeMenu]);

  // Handle transition when switching content
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [activeMenu]);

  // Animate child cards when content is ready
  useEffect(() => {
    if (!isLoading && !error && !isEmpty && contentRef.current) {
      const cards = contentRef.current.querySelectorAll('[data-content-card]');
      if (cards.length > 0) {
        animateContentCards(cards);
      }
    }
  }, [isLoading, error, isEmpty, activeMenu]);

  const renderLoading = () => (
    <ContentLoading>
      <ContentLoadingSpinner />
      <ContentLoadingText>{loadingMessage}</ContentLoadingText>
    </ContentLoading>
  );

  const renderError = () => (
    <ContentError>
      <ContentErrorIcon>❌</ContentErrorIcon>
      <ContentErrorMessage>{errorMessage}</ContentErrorMessage>
      <ContentErrorSubMessage>{errorSubMessage}</ContentErrorSubMessage>
    </ContentError>
  );

  const renderEmpty = () => (
    <ContentEmpty>
      <ContentEmptyIcon>📋</ContentEmptyIcon>
      <ContentEmptyMessage>{emptyMessage}</ContentEmptyMessage>
      <ContentEmptySubMessage>{emptySubMessage}</ContentEmptySubMessage>
    </ContentEmpty>
  );

  const renderContent = () => {
    if (isLoading) return renderLoading();
    if (error) return renderError();
    if (isEmpty) return renderEmpty();
    return children;
  };

  return (
    <ContentAreaWrapper className={className} ref={contentRef}>
      <ContentContainer>
        <ContentBackground />
        
        {(title || subtitle) && (
          <ContentHeader>
            {title && <ContentTitle>{title}</ContentTitle>}
            {subtitle && <ContentSubtitle>{subtitle}</ContentSubtitle>}
          </ContentHeader>
        )}
        
        <ContentBody>
          <ContentTransition isTransitioning={isTransitioning}>
            {renderContent()}
          </ContentTransition>
        </ContentBody>
      </ContentContainer>
    </ContentAreaWrapper>
  );
};

// Content section components for easier composition
ContentArea.Section = ContentSection;
ContentArea.Grid = ContentGrid;
ContentArea.Flex = ContentFlex;
ContentArea.FadeIn = ContentFadeIn;
ContentArea.SlideIn = ContentSlideIn;
ContentArea.Stagger = ContentStagger;

// Loading state component
ContentArea.Loading = ({ message = 'Chargement...' }) => (
  <ContentLoading>
    <ContentLoadingSpinner />
    <ContentLoadingText>{message}</ContentLoadingText>
  </ContentLoading>
);

// Error state component
ContentArea.Error = ({ 
  message = 'Une erreur est survenue', 
  subMessage = 'Veuillez réessayer plus tard',
  icon = '❌' 
}) => (
  <ContentError>
    <ContentErrorIcon>{icon}</ContentErrorIcon>
    <ContentErrorMessage>{message}</ContentErrorMessage>
    <ContentErrorSubMessage>{subMessage}</ContentErrorSubMessage>
  </ContentError>
);

// Empty state component
ContentArea.Empty = ({ 
  message = 'Aucune donnée disponible', 
  subMessage = 'Commencez par ajouter des éléments',
  icon = '📋' 
}) => (
  <ContentEmpty>
    <ContentEmptyIcon>{icon}</ContentEmptyIcon>
    <ContentEmptyMessage>{message}</ContentEmptyMessage>
    <ContentEmptySubMessage>{subMessage}</ContentEmptySubMessage>
  </ContentEmpty>
);

export default ContentArea;
