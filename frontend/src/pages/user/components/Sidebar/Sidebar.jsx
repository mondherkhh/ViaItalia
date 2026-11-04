import React, { useEffect, useRef } from 'react';
import { animateSidebarSlide, animateSidebarItem } from '../../utils/animations';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useAuth } from '../../../../context/AuthContext';
import { getDesktopMenuGroups, isMenuItemVisible } from '../navigation/menuConfig';
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

const Sidebar = ({ activeMenu, menuItems, onMenuClick, isCollapsed = false, onLogout }) => {
  const sidebarRef = useRef(null);
  const itemRefs = useRef([]);
  const { language } = useLanguage();
  const { user, logout } = useAuth();
  const t = (key) => {
    if (language === 'fr') {
      const map = {
        'Messagerie': 'Messagerie',
        'Annonces': 'Annonces',
        'Utilisateurs': 'Utilisateurs',
        'Rendez-vous': 'Rendez-vous',
        'Contrats': 'Contrats',
        'Dossiers': 'Dossiers',
        'Formulaires d\'étude': 'Formulaires d\'étude',
        'Paiements': 'Paiements',
        'Invoices': 'Factures',
        'University Programs': 'Programmes Universitaires',
        'Avis clients': 'Avis clients',
        'other': 'Autre',
      };
      return map[key] || key;
    }
    return key;
  };

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
          $isActive={isActive}
          onClick={() => handleMenuClick(item.id)}
        >
          <SidebarIcon>{item.icon}</SidebarIcon>
          <SidebarText>{t(item.text)}</SidebarText>
          {badgeCount > 0 && (
            <SidebarBadge>{badgeCount}</SidebarBadge>
          )}
        </SidebarButton>
      </SidebarItem>
    );
  };

  // Navigation comes from the shared client menu config so the desktop
  // sidebar and the mobile drawer always expose the exact same links.
  const menuGroups = getDesktopMenuGroups();
  const visibleItems = (menuItems || []).filter(isMenuItemVisible);

  return (
    <SidebarContainer ref={sidebarRef}>
      {/* En-tête sidebar style admin */}
      <div style={{ padding: '0 4px 12px', marginBottom: '0.4rem', borderBottom: '1px solid var(--adm-border)' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--adm-text)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Via Italia</div>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--adm-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '2px' }}>ESPACE ÉTUDIANT</div>
      </div>
      {menuGroups.map(group => (
        <SidebarSection key={group.id}>
          <SidebarSectionTitle>{group.title}</SidebarSectionTitle>
          <SidebarList>
            {group.items.map((item, idx) => renderMenuItem(item, idx))}
          </SidebarList>
        </SidebarSection>
      ))}

      {/* Profile card — label reflects the client, not the admin panel */}
      <div style={{ marginTop: '1.5rem', padding: '0 4px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--adm-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem', padding: '0 4px' }}>
          ViaItalia
        </div>
        <div
          onClick={onLogout}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            borderRadius: '12px',
            background: 'var(--adm-panel)',
            border: '1px solid var(--adm-border)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            marginTop: '8px',
            cursor: onLogout ? 'pointer' : 'default',
            transition: 'all 0.2s ease'
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 600,
              fontSize: '1rem',
              border: '2px solid rgba(245,158,11,0.3)',
              position: 'relative',
              flexShrink: 0
            }}
          >
            {user?.firstName?.[0] || ''}{user?.lastName?.[0] || ''}
            <div
              style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#10b981',
                border: '2px solid var(--adm-panel)'
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, color: 'var(--adm-text)', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.firstName} {user?.lastName}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--adm-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
          </div>
        </div>
      </div>
    </SidebarContainer>
  );
};

export default Sidebar;