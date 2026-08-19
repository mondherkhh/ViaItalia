import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
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
import AnnouncementsSection from "./user/components/sections/Announcements/AnnouncementsSection";
import ReceiptsSection from "./user/components/sections/Receipts/ReceiptsSection";

const UserDashboard = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const [activeMenu, setActiveMenu] = useState('dashboard');

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

  const menuItems = [
    { id: 'dashboard', icon: '🏠', text: 'Tableau de Bord' },
    { id: 'rendezvous', icon: '📅', text: 'Rendez-vous' },
    { id: 'messagerie', icon: '💬', text: 'Messagerie' },
    { id: 'profile', icon: '👤', text: 'Profil' },
    { id: 'parcours', icon: '📄', text: 'Contrat' },
    { id: 'dossier', icon: '📁', text: 'Dossier' },
    { id: 'paiement', icon: '💳', text: 'Paiement' },
    { id: 'recus', icon: '🧾', text: 'My Receipts' },
    { id: 'annonces', icon: '📢', text: 'Annonces' }
  ];

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
  };

  const handleLogout = () => {
    logoutUser();
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
      
      case 'annonces':
        return <AnnouncementsSection />;
      case 'recus':
        return <ReceiptsSection />;
      
      default:
        return (
          <ContentArea 
            title="Tableau de Bord"
            subtitle="Bienvenue sur votre espace personnel"
          >
            <div className="text-white text-center py-12">
              <div className="text-4xl mb-4">🏠</div>
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
      <Header 
        onLogout={handleLogout}
        activeMenu={activeMenu}
        menuItems={menuItems}
        onMenuClick={handleMenuClick}
      />
      <MainContent>
        <Sidebar 
          activeMenu={activeMenu}
          menuItems={menuItems}
          onMenuClick={handleMenuClick}
        />
        <ContentArea activeMenu={activeMenu}>
          {renderContent()}
        </ContentArea>
      </MainContent>
    </DashboardContainer>
  );
};

export default UserDashboard;
