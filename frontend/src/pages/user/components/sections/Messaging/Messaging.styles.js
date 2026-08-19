import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
`;

/* MAIN WRAPPER - DASHBOARD INTEGRATION */
export const MessagingContainer = styled.div`
  display: flex;
  height: calc(100vh - 80px); /* Account for header */
  width: 100%;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  margin: 0 auto; /* Center horizontally */
  padding: 20px;
  max-width: calc(100vw - 240px); /* Account for sidebar */
  box-sizing: border-box;
  
  @media (min-width: 1024px) {
    display: grid;
    grid-template-columns: 1fr 320px;
    max-width: calc(100vw - 240px);
  }
  
  @media (max-width: 768px) {
    height: calc(90vh - 100px );
    margin: 10px 0;
    margin-left: -25px;
    margin-right: -10px;
    padding: 10px;
    max-width: calc(100vw - 60px);
  }
`; 

/* CHAT CONTAINER - PROFESSIONAL */
export const ChatContainer = styled.div`
  background: linear-gradient(#1a1f2e);
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  box-shadow: ${props => props.isDarkMode ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.1)'};
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)'};
`;

/* CHAT HEADER */
export const ChatHeader = styled.div`
  padding: 1.5rem;
  background: linear-gradient(135deg, #2d5a3d 50%, #8b0000 100%);
  color: white;
  border-bottom: 1px solid rgba(255,255,255,0.1);
`;

export const ChatTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const ChatSubtitle = styled.p`
  font-size: 0.875rem;
  opacity: 0.9;
  margin: 0.25rem 0 0 0;
`;

/* MESSAGES AREA - DASHBOARD THEME */
export const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: ${props => props.isDarkMode ? 'rgba(45, 45, 45, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
  background-image: ${props => props.isDarkMode 
    ? 'radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.02) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.02) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(102, 126, 234, 0.01) 0%, transparent 50%)'
    : 'radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.05) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(102, 126, 234, 0.03) 0%, transparent 50%)'};
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)'};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.isDarkMode ? 'rgba(102, 126, 234, 0.4)' : 'rgba(102, 126, 234, 0.3)'};
    border-radius: 4px;
    
    &:hover {
      background: ${props => props.isDarkMode ? 'rgba(102, 126, 234, 0.6)' : 'rgba(102, 126, 234, 0.5)'};
    }
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    gap: 0.75rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem 0.75rem;
    gap: 0.5rem;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      border-radius: 3px;
    }
  }
`;

/* MESSAGE ROW */
export const MessageItem = styled.div`
  display: flex;
  justify-content: ${props => props.isOwn ? 'flex-end' : 'flex-start'};
  animation: ${slideIn} 0.3s ease;
  max-width: 80%;
`;

/* MESSAGE BUBBLE */
export const MessageBubble = styled.div`
  padding: 1rem 1.25rem;
  font-size: 0.95rem;
  line-height: 1.5;
  word-wrap: break-word;
  position: relative;
  
  background: ${props => props.isOwn 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    : props.isDarkMode ? '#3a3a3a' : '#ffffff'};
  color: ${props => props.isOwn 
    ? '#ffffff' 
    : props.isDarkMode ? '#ffffff' : '#333333'};
  
  border-radius: ${props => props.isOwn 
    ? '1.25rem 1.25rem 0.25rem 1.25rem' 
    : '1.25rem 1.25rem 1.25rem 0.25rem'};
  
  box-shadow: ${props => props.isDarkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)'};
  border: 1px solid ${props => props.isOwn 
    ? 'rgba(255,255,255,0.1)' 
    : props.isDarkMode ? 'rgba(255,255,255,0.1)' : '#e9ecef'};
`;

/* MESSAGE STATUS */
export const MessageStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  opacity: 0.8;
  justify-content: ${props => props.isOwn ? 'flex-end' : 'flex-start'};
`;

/* INPUT AREA - DASHBOARD THEME */
export const MessageInputContainer = styled.div`
  padding: 1.5rem;
  background: ${props => props.isDarkMode ? 'rgba(45, 45, 45, 0.98)' : 'rgba(255, 255, 255, 0.98)'};
  border-top: 1px solid ${props => props.isDarkMode ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.2)'};
  backdrop-filter: blur(10px);
`;

export const MessageInputForm = styled.form`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  min-height: 60px;
`;

export const MessageInput = styled.input`
  flex: 1;
  padding: 1rem 1.25rem;
  border-radius: 25px;
  border: 2px solid ${props => props.isDarkMode ? 'rgba(102, 126, 234, 0.4)' : 'rgba(102, 126, 234, 0.3)'};
  outline: none;
  background: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)'};
  color: ${props => props.isDarkMode ? '#ffffff' : '#333333'};
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.3s ease;
  box-shadow: ${props => props.isDarkMode ? '0 2px 8px rgba(0, 0, 0, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.1)'};

  &:focus {
    border-color: #667eea;
    background: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 1)'};
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
    transform: translateY(-1px);
  }

  &::placeholder {
    color: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.5)' : '#6c757d'};
    font-style: italic;
  }
`;

/* BUTTONS */
export const SendButton = styled.button`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
  border: 2px solid #4CAF50;
  color: ${props => props.isDarkMode ? '#ffffff' : '#000000'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  position: relative;
  z-index: 999;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);

  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
    border-color: #45a049;
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: #999999;
    border-color: #666666;
  }
`;

export const AttachButton = styled.button`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
  border: 2px solid #4CAF50;
  color: ${props => props.isDarkMode ? '#ffffff' : '#000000'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 5;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);

  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
    border-color: #45a049;
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background: #999999;
    border-color: #666666;
  }
`;

export const DarkModeButton = styled.button`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(102, 126, 234, 0.2)'};
  border: 2px solid ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(102, 126, 234, 0.4)'};
  color: ${props => props.isDarkMode ? '#ffffff' : '#667eea'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-right: 0.5rem;
  position: relative;
  z-index: 5;

  &:hover:not(:disabled) {
    background: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(102, 126, 234, 0.3)'};
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

/* RIGHT SIDEBAR */
export const ContactInfoContainer = styled.div`
  background: rgba(45, 90, 61, 0.95);
  height: 100%;
  overflow-y: auto;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
  margin-left: 20px;
  
  @media (max-width: 1023px) {
    display: none;
  }
`;

export const ContactHeader = styled.div`
  padding: 2rem 1.5rem;
  background: linear-gradient(135deg, #2d5a3d 0%, #8b0000 100%);
  color: white;
  border-radius: 16px 16px 0 0;
`;

export const ContactTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
`;

export const ContactBody = styled.div`
  padding: 2rem 1.5rem;
  color: #ffffff;
`;

export const ContactSection = styled.div`
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const ContactSectionTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #ffffff;
  margin-bottom: 1rem;
`;

export const ContactItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const ContactIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(255,255,255,0.3);
`;

export const ContactContent = styled.div`
  flex: 1;
`;

export const ContactItemLabel = styled.div`
  font-size: 0.875rem;
  color: #ffffff;
  margin-bottom: 0.25rem;
  font-weight: 500;
`;

export const ContactItemValue = styled.div`
  font-size: 1rem;
  color: #ffffff;
  font-weight: 400;
`;

/* EMPTY STATE */
export const EmptyStateContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 1.5rem;
  text-align: center;
`;

export const EmptyStateIcon = styled.div`
  font-size: 4rem;
  opacity: 0.3;
`;

export const EmptyStateTitle = styled.div`
  font-size: 1.25rem;
  color: #6c757d;
  font-weight: 500;
`;

export const EmptyStateSubtitle = styled.div`
  font-size: 0.875rem;
  color: #adb5bd;
  max-width: 300px;
`;

/* ERROR MESSAGE */
export const ErrorMessage = styled.div`
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  border-radius: 12px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.2);
`;

/* FILE ATTACHMENT */
export const FileAttachment = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border-radius: 12px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(79, 172, 254, 0.2);
`;

export const FileAttachmentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const FileAttachmentRemove = styled.button`
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.25rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255,255,255,0.3);
    transform: scale(1.1);
  }
`;

/* LOADING STATE */
export const LoadingContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 1rem;
`;

export const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(102, 126, 234, 0.2);
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

/* MOBILE DARK MODE TOGGLE */
export const MobileDarkModeContainer = styled.div`
  display: none;
  padding: 1rem;
  background: ${props => props.isDarkMode ? 'rgba(45, 45, 45, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
  backdrop-filter: blur(10px);
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: 1023px) {
    display: flex;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem;
  }
`;

export const MobileDarkModeLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.isDarkMode ? '#ffffff' : '#333333'};
  font-size: 0.875rem;
  font-weight: 500;
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
    gap: 0.375rem;
  }
`;

export const MobileDarkModeToggle = styled.button`
  width: 50px;
  height: 26px;
  background: ${props => props.isDarkMode ? '#667eea' : '#ccc'};
  border: none;
  border-radius: 13px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s ease;
  
  &:hover {
    background: ${props => props.isDarkMode ? '#764ba2' : '#999'};
  }
  
  @media (max-width: 480px) {
    width: 40px;
    height: 22px;
    border-radius: 11px;
  }
`;

export const MobileDarkModeToggleThumb = styled.div`
  position: absolute;
  top: 3px;
  left: ${props => props.isDarkMode ? '27px' : '3px'};
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: left 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  
  @media (max-width: 480px) {
    top: 2px;
    left: ${props => props.isDarkMode ? '19px' : '2px'};
    width: 18px;
    height: 18px;
  }
`;
