import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { animateNotification, animateHeaderFadeDown } from '../../utils/animations';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import logo from '../../../../assets/logo.svg';
import {
  HeaderContainer,
  LogoContainer,
  Logo,
  LogoText,
  HeaderActions,
  NotificationContainer,
  NotificationButton,
  NotificationBadge,
  NotificationDropdown,
  NotificationHeader,
  NotificationTitle,
  NotificationActions,
  NotificationAction,
  NotificationList,
  NotificationItem,
  NotificationIcon,
  NotificationContent,
  NotificationMessage,
  NotificationTime,
  NotificationEmpty,
  NotificationLoading,
  NotificationSpinner,
  UserDropdown,
  UserInfoHeader,
  UserInfoName,
  UserMenuItems,
  UserMenuItem,
  UserMenuItemIcon,
  UserAvatar,
  UserInfo,
  MobileMenuButton,
  MobileMenu,
  MobileMenuItem,
} from './Header.styles';

const Header = ({ onLogout, activeMenu, menuItems = [], onMenuClick }) => {
  const { user } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAllAsRead, 
    markAsRead, 
    deleteNotification,
    getNotificationIcon,
    getNotificationTypeLabel,
    formatNotificationTime
  } = useNotifications(user?.id);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const headerRef = useRef(null);

  // Register GSAP plugins
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
  }, []);

  // Animate header on scroll
  useEffect(() => {
    const element = headerRef.current;
    
    if (element) {
      ScrollTrigger.create({
        trigger: element,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: self => {
          const progress = self.progress;
          if (progress > 0.1) {
            gsap.to(element, {
              background: `rgba(255, 255, 255, ${0.08 + (progress * 0.12)})`,
              backdropFilter: `blur(${25 + (progress * 10)}px)`,
            });
          }
        }
      });
    }
  }, []);

  // Animate header on mount
  useEffect(() => {
    if (headerRef.current) {
      animateHeaderFadeDown(headerRef.current);
    }
  }, []);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Animate header on mount
  useEffect(() => {
    if (headerRef.current) {
      animateHeaderFadeDown(headerRef.current);
    }
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await markAsRead(notification.id);
      }
      // You can add navigation logic here based on notification type
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const getNotificationType = (notification) => {
    if (notification.type === 'ERROR' || notification.type === 'error') return 'error';
    if (notification.type === 'WARNING' || notification.type === 'warning') return 'warning';
    if (notification.type === 'SUCCESS' || notification.type === 'success') return 'success';
    return 'info';
  };

  return (
    <HeaderContainer ref={headerRef}>
      <LogoContainer>
        <Logo src={logo} alt="ViaItalia Logo" />
      </LogoContainer>

      {/* Mobile Menu Button */}
      <MobileMenuButton 
        onClick={toggleMobileMenu}
        isMobileMenuOpen={isMobileMenuOpen}
      >
        <span></span>
      </MobileMenuButton>

      {/* Mobile Menu */}
      <MobileMenu isVisible={isMobileMenuOpen}>
        {menuItems.map((item) => (
          <MobileMenuItem 
            key={item.id}
            onClick={() => {
              if (onMenuClick) {
                onMenuClick(item.id);
              }
              setIsMobileMenuOpen(false);
            }}
            isActive={activeMenu === item.id}
          >
            <span>{item.icon}</span>
            {item.text}
          </MobileMenuItem>
        ))}
      </MobileMenu>

      <HeaderActions>
        <NotificationContainer ref={dropdownRef}>
          <NotificationButton onClick={toggleDropdown} hasUnread={unreadCount > 0}>
            🔔
            {unreadCount > 0 && (
              <NotificationBadge>
                {unreadCount > 99 ? '99+' : unreadCount}
              </NotificationBadge>
            )}
          </NotificationButton>

          <NotificationDropdown isOpen={isDropdownOpen}>
            <NotificationHeader>
              <NotificationTitle>Notifications</NotificationTitle>
              <NotificationActions>
                {unreadCount > 0 && (
                  <NotificationAction onClick={handleMarkAllAsRead}>
                    Tout marquer comme lu
                  </NotificationAction>
                )}
              </NotificationActions>
            </NotificationHeader>

            {isLoading ? (
              <NotificationLoading>
                <NotificationSpinner />
                Chargement...
              </NotificationLoading>
            ) : notifications.length === 0 ? (
              <NotificationEmpty>
                Aucune notification
              </NotificationEmpty>
            ) : (
              <NotificationList>
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    isUnread={!notification.isRead}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <NotificationIcon type={getNotificationType(notification)} isUnread={!notification.isRead}>
                      {getNotificationIcon(notification.type)}
                    </NotificationIcon>
                    <NotificationContent>
                      <NotificationMessage isUnread={!notification.isRead}>
                        {notification.message || 
                         notification.title || 
                         notification.content || 
                         getNotificationTypeLabel(notification.type)}
                      </NotificationMessage>
                      <NotificationTime>
                        {formatNotificationTime(notification.createdAt)}
                      </NotificationTime>
                    </NotificationContent>
                  </NotificationItem>
                ))}
              </NotificationList>
            )}
          </NotificationDropdown>
        </NotificationContainer>

        <UserInfo ref={userDropdownRef}>
          <UserAvatar onClick={toggleUserDropdown}>
            {user?.firstName?.[0] || user?.email?.[0] || 'U'}
          </UserAvatar>
          
          <UserDropdown isOpen={isUserDropdownOpen}>
            <UserInfoHeader>
              <UserInfoName>
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email || 'Utilisateur'
                }
              </UserInfoName>
            </UserInfoHeader>
            
            <UserMenuItems>
              <UserMenuItem onClick={handleLogout}>
                <UserMenuItemIcon>🚪</UserMenuItemIcon>
                Déconnexion
              </UserMenuItem>
            </UserMenuItems>
          </UserDropdown>
        </UserInfo>
      </HeaderActions>
    </HeaderContainer>
  );
};

export default Header;
