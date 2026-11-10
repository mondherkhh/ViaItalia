import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FiMoon, FiSun, FiLogOut, FiSearch
} from 'react-icons/fi';
import { useAuth } from '../../../../context/AuthContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { animateHeaderFadeDown } from '../../utils/animations';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  HeaderCard, HeaderLeft, HeaderText, HeaderTitle, HeaderSubtitle,
  SearchWrapper, SearchInput, HeaderActionsList,
  UserInfo, UserAvatar, UserDropdown, UserInfoHeader, UserInfoName,
  UserMenuItems, UserMenuItem, UserMenuItemIcon,
  ThemeToggle
} from './Header.styles';

const Header = ({ onLogout, activeMenu, menuItems = [], onMenuClick, mobileMenuButton = null }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language } = useLanguage();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 8 });
  const avatarBtnRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => { gsap.registerPlugin(ScrollTrigger); }, []);
  useEffect(() => {
    if (headerRef.current) animateHeaderFadeDown(headerRef.current);
  }, []);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (avatarBtnRef.current && !avatarBtnRef.current.contains(e.target) && !(e.target.closest && e.target.closest('.user-dropdown-portal'))) setIsUserDropdownOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(open => {
      const next = !open;
      if (next && avatarBtnRef.current) {
        const rect = avatarBtnRef.current.getBoundingClientRect();
        setDropdownPos({ top: rect.bottom + 8, right: 8 + (window.innerWidth - rect.right) });
      }
      return next;
    });
  };
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (onLogout) await onLogout();
    } catch (e) {
      console.error('Logout failed:', e);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getTitle = () => {
    switch (activeMenu) {
      case 'messagerie': return 'Messagerie';
      case 'annonces': return 'Annonces';
      case 'users': return 'Utilisateurs';
      case 'appointments': return 'Rendez-vous';
      case 'contracts': return 'Contrats';
      case 'dossiers': return 'Dossiers';
      case 'studyForms': return "Formulaires d'étude";
      case 'payments': return 'Paiements';
      case 'receipts': return 'Invoices';
      case 'university-programs': return 'University Programs';
      case 'reviews': return 'Avis clients';
      default: return 'Tableau de Bord';
    }
  };

  return (
    <HeaderCard ref={headerRef}>
      <HeaderLeft>
        {mobileMenuButton}
        <HeaderText>
          <HeaderTitle>{getTitle()}</HeaderTitle>
          <HeaderSubtitle>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </HeaderSubtitle>
        </HeaderText>
      </HeaderLeft>

      <SearchWrapper>
        <FiSearch size={16} aria-hidden="true" style={{ color: 'var(--adm-muted)', flexShrink: 0 }} />
        <SearchInput type="text" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder="Rechercher..." />
      </SearchWrapper>

      <HeaderActionsList>
        <ThemeToggle type="button" onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
          title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}>
          {theme === 'dark' ? <FiSun aria-hidden="true" /> : <FiMoon aria-hidden="true" />}
          <span>{theme === 'dark' ? 'Mode clair' : 'Mode sombre'}</span>
        </ThemeToggle>

        <UserInfo>
          <UserAvatar ref={avatarBtnRef} onClick={toggleUserDropdown}>{user?.firstName?.[0] || user?.email?.[0] || 'U'}</UserAvatar>
        </UserInfo>
        {isUserDropdownOpen && createPortal(
          <div className="user-dropdown-portal" style={{ position: 'fixed', top: dropdownPos.top, right: dropdownPos.right, zIndex: 9999 }}>
            <UserDropdown $isOpen={true} $pos={dropdownPos}>
              <UserInfoHeader>
                <UserInfoName>
                  {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || 'Utilisateur'}
                </UserInfoName>
              </UserInfoHeader>
              <UserMenuItems>
                {isLoggingOut ? (
                  <UserMenuItem disabled>
                    <UserMenuItemIcon><FiLogOut aria-hidden="true" /></UserMenuItemIcon>Déconnexion...
                  </UserMenuItem>
                ) : (
                  <UserMenuItem onClick={handleLogout}>
                    <UserMenuItemIcon><FiLogOut aria-hidden="true" /></UserMenuItemIcon>Déconnexion
                  </UserMenuItem>
                )}
              </UserMenuItems>
            </UserDropdown>
          </div>,
          document.body
        )}
      </HeaderActionsList>
    </HeaderCard>
  );
};
export default Header;