import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { CLIENT_MENU, getMobileMenuItems } from "./user/components/navigation/menuConfig";
import {
  FiHome,
  FiCalendar,
  FiMessageSquare,
  FiUser,
  FiFileText,
  FiBook,
  FiFolder,
  FiCreditCard,
  FiFile,
  FiMenu,
  FiX
} from "react-icons/fi";
import { DashboardContainer, MainContent } from "./user/styles/DashboardContainer.styles";

// Import new components
import { Header } from "./user/components/Header";
import { Sidebar } from "./user/components/Sidebar";
import { ContentArea } from "./user/components/ContentArea";

// Import section components
import { AppointmentsSection } from "./user/components/sections/Appointments";
import { MessagingSection } from "./user/components/sections/Messaging";
import { UniversitySection } from "./user/components/sections/University";
import ContractSection from "./user/components/sections/Contract/ContractSection";
import DossierSection from "./user/components/sections/Dossier/DossierSection";
import ProfileSection from "./user/components/sections/Profile/ProfileSection";
import DashboardSection from "./user/components/sections/Dashboard/DashboardSection";
import { PaymentSection } from "./user/components/sections/Payment";
import ReceiptsSection from "./user/components/sections/Receipts/ReceiptsSection";
import NotificationsPage from "./user/components/sections/Notifications/NotificationsPage";
import ReviewsSection from "./user/components/sections/Reviews/ReviewsSection";

const UserDashboard = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide all scrollbars completely for the entire dashboard
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

      .client-desktop-sidebar {
        display: contents;
      }

      /* One mobile navigation drawer for all breakpoints (769-1024 included) */
      .client-mobile-menu-button,
      .client-mobile-menu,
      .client-mobile-menu-backdrop {
        display: none;
      }

      @media (max-width: 1024px) {
        .client-desktop-sidebar {
          display: none !important;
        }

        .client-mobile-menu-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          position: fixed;
          top: clamp(8rem, 20vh, 11.5rem);
          bottom: auto;
          left: 0.75rem;
          width: 42px;
          height: 42px;
          padding: 0;
          border: 1px solid var(--border, #dbe4ea);
          border-radius: 12px;
          background: var(--surface, #ffffff);
          color: var(--text, #111827);
          box-shadow: 0 8px 22px rgba(0, 0, 0, 0.18);
          z-index: 1201;
          cursor: pointer;
        }

        :root[data-theme="dark"] .client-mobile-menu-button,
        body.theme-dark .client-mobile-menu-button {
          background: #138a5b;
          color: #ffffff;
          border-color: #69e6b0;
          box-shadow: 0 8px 24px rgba(19, 138, 91, 0.42);
        }

        :root[data-theme="dark"] .client-mobile-menu-button:hover,
        body.theme-dark .client-mobile-menu-button:hover {
          background: #20c875;
        }

        .client-mobile-menu-button svg {
          width: 21px;
          height: 21px;
          stroke: currentColor;
        }

        .client-mobile-menu-backdrop {
          display: block;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.35);
          z-index: 1198;
        }

        .client-mobile-menu {
          display: flex;
          flex-direction: column;
          position: fixed;
          top: calc(clamp(8rem, 20vh, 11.5rem) + 3.25rem);
          bottom: auto;
          left: 0.75rem;
          width: min(235px, 78vw);
          max-height: calc(100vh - 5rem);
          overflow-y: auto;
          padding: 0.65rem 0.45rem;
          border: 1px solid var(--border, #dbe4ea);
          border-radius: 0 16px 16px 16px;
          background: var(--surface, #ffffff);
          color: var(--text, #111827);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.2);
          z-index: 1200;
        }

        .client-mobile-menu-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.72rem 0.75rem;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: inherit;
          text-align: left;
          font: inherit;
          cursor: pointer;
        }

        .client-mobile-menu-item.active {
          background: rgba(19, 138, 91, 0.12);
          color: var(--green, #138a5b);
        }

        .client-mobile-menu-item svg {
          width: 19px;
          height: 19px;
          flex-shrink: 0;
        }

        .client-mobile-menu-item span {
          font-size: 0.8rem;
          font-weight: 500;
        }
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
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const menuItems = CLIENT_MENU;

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
  };

  const handleLogout = async () => {
    try {
      if (logoutUser) await logoutUser();
    } catch (e) {
      console.error('Logout API error:', e);
    }
    try {
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("role");
      window.localStorage.removeItem("user");
      window.sessionStorage.clear();
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    } catch (e) {
      console.error('Storage clear error:', e);
    }
    window.location.replace('/login');
  };

  const renderContent = () => {
    switch(activeMenu) {
      case 'dashboard':
        return <DashboardSection />;
      
      case 'rendezvous':
        return (
           
            <AppointmentsSection />
        );
      
      case 'messagerie':
        return (
          
            <MessagingSection />
        );
      
      case 'profile':
        return (
          <ContentArea 
           
          >
            <ProfileSection />
          </ContentArea>
        );
      
   
      case 'notifications':
        return (
          <ContentArea
            title="Notifications"
            subtitle="Reçus, paiements, accès aux documents et messages de votre conseiller"
          >
            <NotificationsPage />
          </ContentArea>
        );

      case 'reviews':
        return (
          <ContentArea title="Donner mon avis" subtitle="Partagez votre expérience avec d'autres étudiants">
            <ReviewsSection />
          </ContentArea>
        );

      case 'university':
        return (
          <ContentArea 
            title="Informations Universitaires"
            subtitle="Sélectionnez votre université et spécialité"
          >
            <UniversitySection />
          </ContentArea>
        );
      
      case 'parcours':
        return <ContractSection />;
      
      case 'dossier':
        return (
        
            <DossierSection />
        );
      
      case 'paiement':
        return <PaymentSection />;
      
      case 'recus':
        return <ReceiptsSection />;
      
      default:
        return (
          <ContentArea 
            title="Tableau de Bord"
            subtitle="Bienvenue sur votre espace personnel"
          >
            <div className="text-white text-center py-12">
              <FiHome className="text-4xl mb-4 mx-auto" aria-hidden="true" />
              <h3 className="text-xl font-semibold mb-2">Bienvenue!</h3>
              <p className="text-gray-400">
                Sélectionnez une section dans le menu pour commencer.
              </p>
            </div>
          </ContentArea>
        );
    }
  };

  return (
    <DashboardContainer>
      <button
        type="button"
        className="client-mobile-menu-button"
        onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
        aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={mobileMenuOpen}
      >
        {mobileMenuOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
      </button>

      {mobileMenuOpen && (
        <div
          className="client-mobile-menu-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {mobileMenuOpen && (
        <nav className="client-mobile-menu" aria-label="Navigation mobile">
          {menuItems.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`client-mobile-menu-item ${activeMenu === item.id ? 'active' : ''}`}
              onClick={() => {
                handleMenuClick(item.id);
                setMobileMenuOpen(false);
              }}
            >
              {item.icon}
              <span>{item.text}</span>
            </button>
          ))}
        </nav>
      )}

      <Header 
        onLogout={handleLogout}
        activeMenu={activeMenu}
        menuItems={menuItems}
        onMenuClick={handleMenuClick}
      />
      <MainContent>
        <div className="client-desktop-sidebar">
          <Sidebar
            activeMenu={activeMenu}
            menuItems={menuItems}
            onMenuClick={handleMenuClick}
            onLogout={handleLogout}
          />
        </div>
        <ContentArea activeMenu={activeMenu}>
          {renderContent()}
        </ContentArea>
      </MainContent>
    </DashboardContainer>
  );
};

export default UserDashboard;
