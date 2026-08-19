import styled from 'styled-components';

export const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 96px;
  background: #071321;
  border-bottom: 1px solid #13263a;
  border-radius: 0;
  z-index: 1000;
  box-shadow: 0 8px 24px rgba(0, 0, 0, .14);

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 24px;
  animation: slideDown 0.6s ease-in-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    height: 70px;
    padding: 0 1.5rem;
    top: 8px;
    left: 8px;
    right: 8px;
    border-radius: 16px;
  }
  
  @media (max-width: 480px) {
    height: 65px;
    padding: 0 1rem;
    top: 5px;
    left: 5px;
    right: 5px;
    border-radius: 12px;
  }
`;

export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.02);
  }
`;

export const Logo = styled.img`
  width: 156px;
  height: 64px;
  object-fit: contain;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
  
  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
  }
  
  @media (max-width: 480px) {
    width: 60px;
    height: 55px;
  }
`;

export const LogoText = styled.span`
  font-size: 1.6rem;
  font-weight: 800;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
  transition: all 0.3s ease;

  &:hover {
    filter: brightness(1.1);
  }

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

export const NotificationContainer = styled.div`
  position: relative;
`;

export const NotificationButton = styled.button`
  position: relative;
  width: 48px;
  height: 48px;
  background: ${props => props.hasUnread ? 'rgba(23, 155, 92, .18)' : '#0d1c2d'};
  border: 1px solid #21364c;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  font-size: 1.3rem;
  box-shadow: ${props => props.hasUnread 
    ? '0 4px 20px rgba(167, 139, 233, 0.3)' 
    : 'none'
  };
  
  &:hover {
    background: ${props => props.hasUnread 
      ? 'linear-gradient(135deg, #a78bfa 0%, #ec4899 50%, #f472b6 100%)' 
      : 'rgba(255, 255, 255, 0.15)'
    };
    transform: translateY(-2px);
    box-shadow: ${props => props.hasUnread 
      ? '0 8px 30px rgba(167, 139, 233, 0.4)' 
      : '0 8px 25px rgba(0, 0, 0, 0.15)'
    };
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    width: 42px;
    height: 42px;
    font-size: 1.1rem;
  }
  
  @media (max-width: 480px) {
    width: 38px;
    height: 38px;
    font-size: 1rem;
  }
`;

export const NotificationBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.4rem;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 0.6rem;
    min-width: 18px;
    padding: 0.15rem 0.35rem;
  }
`;

export const NotificationDropdown = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 350px;
  max-height: 400px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.3s ease;
  z-index: 1001;
  
  @media (max-width: 768px) {
    width: 300px;
    max-height: 350px;
    right: -50px;
  }
`;

export const NotificationHeader = styled.div`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(102, 126, 234, 0.1);
`;

export const NotificationTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

export const NotificationActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const NotificationAction = styled.button`
  background: none;
  border: none;
  color: #667eea;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(102, 126, 234, 0.1);
  }
`;

export const NotificationList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(102, 126, 234, 0.3);
    border-radius: 3px;
  }
`;

export const NotificationItem = styled.div`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  
  &:hover {
    background: rgba(102, 126, 234, 0.05);
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  ${props => props.isUnread && `
    background: rgba(102, 126, 234, 0.05);
    border-left: 3px solid #667eea;
  `}
`;

export const NotificationIcon = styled.div`
  width: 36px;
  height: 36px;
  background: ${props => {
    if (props.isUnread) {
      if (props.type === 'success') return 'linear-gradient(135deg, #00b09b, #00d4aa)';
      if (props.type === 'warning') return 'linear-gradient(135deg, #f093fb, #f5576c)';
      if (props.type === 'error') return 'linear-gradient(135deg, #ff6b6b, #ee5a24)';
      return 'linear-gradient(135deg, #60a5fa, #a78bfa)';
    } else {
      if (props.type === 'success') return 'rgba(0, 176, 155, 0.1)';
      if (props.type === 'warning') return 'rgba(240, 147, 251, 0.1)';
      if (props.type === 'error') return 'rgba(255, 107, 107, 0.1)';
      return 'rgba(102, 126, 234, 0.1)';
    }
  }};
  color: ${props => {
    if (props.isUnread) {
      if (props.type === 'success') return '#ffffff';
      if (props.type === 'warning') return '#ffffff';
      if (props.type === 'error') return '#ffffff';
      return '#ffffff';
    } else {
      if (props.type === 'success') return '#00b09b';
      if (props.type === 'warning') return '#f093fb';
      if (props.type === 'error') return '#ff6b6b';
      return '#667eea';
    }
  }};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
  box-shadow: ${props => props.isUnread 
    ? '0 4px 15px rgba(96, 165, 250, 0.3)' 
    : 'none'
  };
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: ${props => props.isUnread 
      ? '0 6px 20px rgba(96, 165, 250, 0.4)' 
      : '0 2px 8px rgba(0, 0, 0, 0.1)'
    };
  }
`;

export const NotificationContent = styled.div`
  flex: 1;
  min-width: 0;
`;

export const NotificationMessage = styled.div`
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 0.25rem;
  line-height: 1.4;
  
  ${props => props.isUnread && `
    font-weight: 600;
  `}
`;

export const NotificationTime = styled.div`
  font-size: 0.75rem;
  color: #666;
`;

export const NotificationEmpty = styled.div`
  padding: 3rem 1.5rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  
  &::before {
    content: "📭";
    font-size: 2.5rem;
    opacity: 0.6;
  }
  
  @media (max-width: 768px) {
    padding: 2rem 1rem;
    font-size: 0.9rem;
    
    &::before {
      font-size: 2rem;
    }
  }
`;

export const NotificationLoading = styled.div`
  padding: 2rem 1.25rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
`;

export const NotificationSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-top: 2px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const LogoutButton = styled.button`
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border: none;
  color: white;
  padding: 0.875rem 1.5rem;
  border-radius: 14px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem 1.25rem;
    font-size: 0.85rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.625rem 1rem;
    font-size: 0.8rem;
  }
`;

export const UserAvatar = styled.div`
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  border: 2px solid rgba(245, 158, 11, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: scale(1.05);
    border-color: rgba(245, 158, 11, 0.5);
    box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4);
  }
  
  @media (max-width: 768px) {
    width: 38px;
    height: 38px;
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    width: 34px;
    height: 34px;
    font-size: 0.8rem;
  }
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

export const UserDropdown = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 200px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.3s ease;
  z-index: 1001;
  
  @media (max-width: 768px) {
    width: 180px;
    right: -10px;
  }
`;

export const UserInfoHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(96, 165, 250, 0.1);
`;

export const UserInfoName = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  text-align: center;
  word-break: break-word;
`;

export const UserMenuItems = styled.div`
  display: flex;
  flex-direction: column;
`;

export const UserMenuItem = styled.button`
  background: none;
  border: none;
  padding: 0.75rem 1rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-align: left;
  width: 100%;
  
  &:hover {
    background: rgba(96, 165, 250, 0.2);
    color: rgba(255, 255, 255, 1);
  }
  
  &:active {
    background: rgba(96, 165, 250, 0.3);
    color: rgba(255, 255, 255, 1);
  }
`;

export const UserMenuItemIcon = styled.span`
  font-size: 1rem;
  width: 20px;
  text-align: center;
`;

export const MobileMenuButton = styled.button`
  display: none;
  background: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  width: 30px;
  height: 24px;
  margin: 0;
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  span {
    display: ${props => props.isMobileMenuOpen ? "none" : "block"};
    background: white;
    height: 3px;
    width: 100%;
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    transition: all 0.3s ease;
  }
  
  span::before,
  span::after {
    content: "";
    background: white;
    width: 100%;
    height: 3px;
    position: absolute;
    left: 0;
    transition: all 0.3s ease;
  }
  
  span::before {
    top: ${props => props.isMobileMenuOpen ? "0" : "-8px"};
    transform: ${props => props.isMobileMenuOpen ? "rotate(45deg)" : "rotate(0)"};
  }
  
  span::after {
    top: ${props => props.isMobileMenuOpen ? "0" : "8px"};
    transform: ${props => props.isMobileMenuOpen ? "rotate(-45deg)" : "rotate(0)"};
  }
  
  /* X icon when menu is open */
  &::before,
  &::after {
    content: "";
    background: white;
    width: 100%;
    height: 3px;
    position: absolute;
    left: 0;
    transition: all 0.3s ease;
    opacity: ${props => props.isMobileMenuOpen ? "1" : "0"};
    transform: ${props => props.isMobileMenuOpen ? "translateY(-50%) rotate(45deg)" : "translateY(-50%) rotate(0)"};
  }
  
  &::before {
    top: 50%;
  }
  
  &::after {
    top: 50%;
    transform: ${props => props.isMobileMenuOpen ? "translateY(-50%) rotate(-45deg)" : "translateY(-50%) rotate(0)"};
  }
`;

export const MobileMenu = styled.div`
  display: none;
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(30, 30, 40, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  margin: 0.5rem;
  padding: 1.5rem;
  opacity: ${props => props.isVisible ? 1 : 0};
  visibility: ${props => props.isVisible ? 'visible' : 'hidden'};
  transform: translateX(-50%) translateY(${props => props.isVisible ? '0' : '-20px'});
  transition: all 0.3s ease;
  z-index: 999;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  min-width: 280px;
  max-width: 90vw;
  
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow-x: hidden;
  }
  
  @media (max-width: 480px) {
    min-width: 250px;
    padding: 1rem;
  }
`;

export const MobileMenuItem = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  width: 100%;
  text-align: left;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
  
  &.active {
    background: rgba(96, 165, 250, 0.2);
    color: white;
  }
  
  span {
    font-size: 1.2rem;
    width: 24px;
    text-align: center;
  }
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
    padding: 0.5rem 0.75rem;
    gap: 0.5rem;
    
    span {
      font-size: 1rem;
      width: 20px;
    }
  }
`;

export const NavMenuContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const NavMenuButton = styled.button`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.9);
  padding: 0.75rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.25);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
  
  @media (max-width: 768px) {
    padding: 0.625rem 1rem;
    font-size: 0.8rem;
  }
`;

export const NavMenuDropdown = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  width: 220px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.3s ease;
  z-index: 1001;
  max-height: 400px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
  
  @media (max-width: 768px) {
    width: 200px;
  }
`;

export const NavMenuItem = styled.div`
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

export const NavMenuItemLink = styled.button`
  background: none;
  border: none;
  padding: 1rem;
  color: ${props => props.isActive ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.8)'};
  font-size: 0.9rem;
  font-weight: ${props => props.isActive ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-align: left;
  width: 100%;
  position: relative;
  
  ${props => props.isActive && `
    background: rgba(96, 165, 250, 0.2);
    border-left: 3px solid #60a5fa;
  `}
  
  &:hover {
    background: rgba(96, 165, 250, 0.1);
    color: white;
  }
  
  span {
    font-size: 1.1rem;
    width: 24px;
    text-align: center;
  }
`;