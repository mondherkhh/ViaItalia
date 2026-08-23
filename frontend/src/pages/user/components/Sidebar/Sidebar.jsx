import React, { useEffect, useRef } from 'react';
import { animateSidebarSlide, animateSidebarItem } from '../../utils/animations';

import {
  SidebarContainer,
  SidebarList,
  SidebarItem,
  SidebarButton,
  SidebarIcon,
  SidebarText,
  SidebarBadge,
  SidebarSection,
  SidebarSectionTitle,
  SidebarDivider,
  SidebarBackdrop
} from './Sidebar.styles';

const Sidebar = ({ activeMenu, menuItems, onMenuClick, isCollapsed = false }) => {
  const sidebarRef = useRef(null);
  const itemRefs = useRef([]);

  // Animate sidebar on mount
  useEffect(() => {
    if (sidebarRef.current) {
      animateSidebarSlide(sidebarRef.current);
      
      // Animate individual items with stagger
      itemRefs.current.forEach((ref, index) => {
        if (ref) {
          animateSidebarItem(ref, index * 0.1);
        }
      });
    }
  }, []);

  const handleMenuClick = (menuId) => {
    if (onMenuClick) {
      onMenuClick(menuId);
    }
  };

  const getBadgeCount = (menuId) => {
    // You can implement badge logic here based on your data
    // For example, unread messages count, pending appointments, etc.
    switch (menuId) {
      case 'messagerie':
        return 0; // Would come from messaging hook
      case 'rendezvous':
        return 0; // Would come from appointments hook
      case 'dossier':
        return 0; // Would come from dossier hook
      default:
        return 0;
    }
  };

  const renderMenuItem = (item, index) => {
    const isActive = activeMenu === item.id;
    const badgeCount = getBadgeCount(item.id);

    return (
      <SidebarItem key={item.id}>
        <SidebarButton
          ref={el => itemRefs.current[index] = el}
          isActive={isActive}
          onClick={() => handleMenuClick(item.id)}
        >
          <SidebarIcon>{item.icon}</SidebarIcon>
          <SidebarText>{item.text}</SidebarText>
          {badgeCount > 0 && <SidebarBadge>{badgeCount}</SidebarBadge>}
        </SidebarButton>
      </SidebarItem>
    );
  };

  const mainMenuItems = menuItems.filter(item => 
    ['dashboard', 'rendezvous', 'messagerie', 'profile', 'universite', 'parcours', 'dossier'].includes(item.id)
  );

  const secondaryMenuItems = menuItems.filter(item => 
    !['dashboard', 'rendezvous', 'messagerie', 'profile', 'universite', 'parcours', 'dossier'].includes(item.id)
  );

  return (
    <SidebarContainer ref={sidebarRef}>
      <SidebarSection>
        <SidebarList>
          {mainMenuItems.map((item, index) => renderMenuItem(item, index))}
        </SidebarList>
      </SidebarSection>

      {secondaryMenuItems.length > 0 && (
        <>
          <SidebarDivider />
          <SidebarSection>
            <SidebarSectionTitle>Autres</SidebarSectionTitle>
            <SidebarList>
              {secondaryMenuItems.map((item, index) => 
                renderMenuItem(item, mainMenuItems.length + index)
              )}
            </SidebarList>
          </SidebarSection>
        </>
      )}

    </SidebarContainer>
  );
};

export default Sidebar;
