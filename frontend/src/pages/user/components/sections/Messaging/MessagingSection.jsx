import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { useMessaging } from '../../../hooks/useMessaging';
import {
  MessagingContainer,
  ChatContainer,
  MessagesContainer,
  MessageItem,
  MessageBubble,
  MessageStatus,
  MessageInputContainer,
  MessageInputForm,
  MessageInput,
  SendButton,
  AttachButton,
  DarkModeButton,
  ContactInfoContainer,
  ContactHeader,
  ContactBody,
  ContactSection,
  ContactSectionTitle,
  ContactItem,
  ContactIcon,
  ContactContent,
  ContactItemLabel,
  ContactItemValue,
  EmptyStateContainer,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateSubtitle,
  ErrorMessage,
  FileAttachment,
  FileAttachmentInfo,
  FileAttachmentRemove,
  LoadingContainer,
  LoadingSpinner,
  ChatHeader,
  ChatTitle,
  ChatSubtitle,
  MobileDarkModeContainer,
  MobileDarkModeLabel,
  MobileDarkModeToggle,
  MobileDarkModeToggleThumb
} from './Messaging.styles';

const MessagingSection = () => {
  const { user } = useAuth();
  const {
    messages,
    isLoading,
    isSending,
    newMessage,
    attachedFile,
    error,
    sendMessage,
    setNewMessage,
    handleKeyPress,
    handleFileAttach,
    removeAttachedFile
  } = useMessaging(user?.id);

  const [inputValue, setInputValue] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(window.innerWidth <= 1023 ? true : false);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Remove scrollbars completely
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Hide all scrollbars completely */
      html, body, * {
        -ms-overflow-style: none !important;
        scrollbar-width: none !important;
      }
      
      html::-webkit-scrollbar,
      body::-webkit-scrollbar,
      *::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
      
      /* Force hide any remaining scrollbars */
      ::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
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
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.focus();
    }
  }, []);
  
  // Check if user is authenticated
  if (!user) {
    return (
      <MessagingContainer>
        <ChatContainer>
          <ChatHeader>
            <ChatTitle>
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Messagerie
            </ChatTitle>
            <ChatSubtitle>
              Veuillez vous connecter pour accéder à la messagerie
            </ChatSubtitle>
          </ChatHeader>
          <MessagesContainer>
            <EmptyStateContainer>
              <EmptyStateIcon>🔒</EmptyStateIcon>
              <EmptyStateTitle>Non authentifié</EmptyStateTitle>
              <EmptyStateSubtitle>
                Vous devez être connecté pour utiliser la messagerie
              </EmptyStateSubtitle>
            </EmptyStateContainer>
          </MessagesContainer>
        </ChatContainer>
      </MessagingContainer>
    );
  }

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setNewMessage(value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileAttach(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Allow sending if we have content (even just whitespace) OR a file
    if (inputValue || attachedFile) {
      await sendMessage(inputValue || '');
      setInputValue('');
    }
  };

  const renderMessage = (message, index) => {
    const isOwn = message.sender === 'USER';
    
    return (
      <MessageItem key={message.id} isOwn={isOwn}>
        <MessageBubble isOwn={isOwn}>
          {message.content}
          {message.fileName && (
            <div style={{ 
              marginTop: '0.5rem', 
              padding: '0.5rem', 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '8px',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📎 {message.fileName}
              {message.fileSize && (
                <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                  ({(message.fileSize / 1024 / 1024).toFixed(2)} MB)
                </span>
              )}
            </div>
          )}
        </MessageBubble>
        {isOwn && (
          <MessageStatus isOwn={isOwn}>
            {message.seen ? '✓✓' : message.delivered ? '✓' : '⏳'}
          </MessageStatus>
        )}
      </MessageItem>
    );
  };

  const renderEmptyState = () => (
    <EmptyStateContainer>
      <EmptyStateIcon>💬</EmptyStateIcon>
      <EmptyStateTitle>Aucun message pour le moment</EmptyStateTitle>
      <EmptyStateSubtitle>
        Envoyez votre premier message pour commencer la conversation avec notre équipe
      </EmptyStateSubtitle>
    </EmptyStateContainer>
  );

  const renderLoadingState = () => (
    <LoadingContainer>
      <LoadingSpinner />
      <EmptyStateTitle>Chargement des messages...</EmptyStateTitle>
    </LoadingContainer>
  );

  return (
    <MessagingContainer isDarkMode={isDarkMode}>
      <ChatContainer isDarkMode={isDarkMode}>
        <ChatHeader>
          <ChatTitle>
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Messagerie
          </ChatTitle>
          <ChatSubtitle>
            Support client ViaItalia - Nous répondons en quelques minutes
          </ChatSubtitle>
        </ChatHeader>
        
        <MessagesContainer ref={messagesContainerRef} isDarkMode={isDarkMode}>
          {isLoading ? (
            renderLoadingState()
          ) : messages.length === 0 ? (
            renderEmptyState()
          ) : (
            messages.map(renderMessage)
          )}
        </MessagesContainer>
        
        <MessageInputContainer isDarkMode={isDarkMode}>
          {error && (
            <ErrorMessage>
              {error}
            </ErrorMessage>
          )}
          
          {attachedFile && (
            <FileAttachment>
              <FileAttachmentInfo>
                📎 {attachedFile.name}
                {attachedFile.size && (
                  <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                    ({(attachedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                )}
              </FileAttachmentInfo>
              <FileAttachmentRemove onClick={removeAttachedFile}>
                ✕
              </FileAttachmentRemove>
            </FileAttachment>
          )}
          
          <MessageInputForm onSubmit={handleSubmit}>
            <AttachButton
              type="button"
              onClick={triggerFileSelect}
              disabled={isSending}
              aria-label="Joindre un fichier"
              isDarkMode={isDarkMode}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </AttachButton>
            
            <MessageInput
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Tapez votre message..."
              disabled={isSending}
              aria-label="Message"
              isDarkMode={isDarkMode}
            />
            
            <SendButton
              type="submit"
              disabled={isSending}
              aria-label="Envoyer"
              isDarkMode={isDarkMode}
            >
              {isSending ? (
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.3" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </SendButton>
          </MessageInputForm>
          
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept="image/*,.pdf,.doc,.docx,.txt"
            aria-label="Fichier à joindre"
          />
        </MessageInputContainer>
      </ChatContainer>
      
      <ContactInfoContainer>
        <ContactHeader>Disponibilité</ContactHeader>
        
        <ContactBody>
          <ContactSection>
            <ContactSectionTitle>Disponibilité</ContactSectionTitle>
            <ContactItem>
              <ContactIcon>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </ContactIcon>
              <ContactContent>
                <ContactItemLabel>📅 Horaires</ContactItemLabel>
                <ContactItemValue>Lundi – Vendredi</ContactItemValue>
              </ContactContent>
            </ContactItem>
            <ContactItem>
              <ContactIcon>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </ContactIcon>
              <ContactContent>
                <ContactItemLabel>🕘 Heures</ContactItemLabel>
                <ContactItemValue>09:00 – 18:00 (GMT+1)</ContactItemValue>
              </ContactContent>
            </ContactItem>
            <ContactItem>
              <ContactIcon>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </ContactIcon>
              <ContactContent>
                <ContactItemLabel>⏱ Temps de réponse moyen</ContactItemLabel>
                <ContactItemValue>~3 à 10 minutes</ContactItemValue>
              </ContactContent>
            </ContactItem>
          </ContactSection>
          
          <ContactSection>
            <ContactSectionTitle>Préférences</ContactSectionTitle>
            <ContactItem>
              <ContactIcon>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </ContactIcon>
              <ContactContent>
                <ContactItemLabel>Mode sombre</ContactItemLabel>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <DarkModeButton
                    type="button"
                    onClick={toggleDarkMode}
                    isDarkMode={isDarkMode}
                    aria-label="Mode sombre"
                    style={{ 
                      width: '36px', 
                      height: '36px',
                      margin: 0
                    }}
                  >
                    {isDarkMode ? (
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1 1 12 2.21M9 34v8m10-2l2 2m-7-2h4" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                      </svg>
                    )}
                  </DarkModeButton>
                  <span style={{ fontSize: '0.85rem' }}>
                    {isDarkMode ? 'Activé' : 'Désactivé'}
                  </span>
                </div>
              </ContactContent>
            </ContactItem>
          </ContactSection>
          
          <ContactSection>
            <ContactSectionTitle>Statistiques</ContactSectionTitle>
            <ContactItem>
              <ContactIcon>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </ContactIcon>
              <ContactContent>
                <ContactItemLabel>Total messages</ContactItemLabel>
                <ContactItemValue>{messages.length}</ContactItemValue>
              </ContactContent>
            </ContactItem>
            <ContactItem>
              <ContactIcon>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </ContactIcon>
              <ContactContent>
                <ContactItemLabel>Fichiers partagés</ContactItemLabel>
                <ContactItemValue>{messages.filter(m => m.fileName).length}</ContactItemValue>
              </ContactContent>
            </ContactItem>
          </ContactSection>
        </ContactBody>
      </ContactInfoContainer>
    </MessagingContainer>
  );
};

export default MessagingSection;
