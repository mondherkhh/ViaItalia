import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { gsap } from "gsap";
import styled from "styled-components";
import { useTheme } from "../contexts/ThemeContext";
import {
  FiArchive,
  FiBell,
  FiBookOpen,
  FiCalendar,
  FiCreditCard,
  FiEdit3,
  FiFileText,
  FiFolder,
  FiMessageSquare,
  FiMoon,
  FiStar,
  FiSun,
  FiUsers,
  FiX,
  FiMenu,
} from "react-icons/fi";
import axios from "axios";
import messageService from "../api/messageService";
import contractService from "../api/contractService";
import announcementService from "../api/announcementService";
import appointmentService from "../api/appointmentService";
import universityInfoService from '../api/universityInfoService';
import authService from "../api/authService";
import dossierService from "../api/dossierService";
import DossierKanban from "../components/DossierKanban";
import AdminReceipts from "./AdminReceipts";
import UniversityPrograms from "./UniversityPrograms";
import AdminReviews from "./AdminReviews";

// Register GSAP
gsap.registerPlugin();

// Logo SVG
const logoSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 80'%3E%3Ctext x='10' y='50' font-family='Arial, sans-serif' font-size='24' font-weight='bold' fill='white'%3EVia Italia%3C/text%3E%3C/svg%3E";

// Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  background: #061321;
  display: flex;
  overflow-x: hidden;
  color: #e8eef7;
  transition: background 220ms ease, color 220ms ease;

  body.theme-light & {
    background: #f1f3f2;
    color: #111827;

    [class*="text-white"] { color: #111827 !important; }
    [class*="text-gray-"] { color: #475569 !important; }
    [class*="text-green-"] { color: #138a5b !important; }
    [class*="bg-gray-"] { background-color: #ffffff !important; }
    [class*="bg-black"] { background-color: rgba(15, 23, 42, 0.38) !important; }
    [class*="border-gray-"] { border-color: rgba(15, 23, 42, 0.14) !important; }
    [class*="placeholder-gray-"]::placeholder { color: #64748b !important; }
    [class*="bg-green-"][class*="text-white"],
    [class*="bg-blue-"][class*="text-white"],
    [class*="bg-red-"][class*="text-white"],
    [class*="bg-purple-"][class*="text-white"] { color: #ffffff !important; }

    table { color: #111827; }
  }

  body.theme-dark & {
    background:
      radial-gradient(circle at 0% 0%, rgba(19, 138, 91, 0.12), transparent 34%),
      radial-gradient(circle at 100% 0%, rgba(201, 52, 62, 0.1), transparent 34%),
      #3b3f43;
    color: #f8fafc;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Sidebar = styled.div`
 width: 202px;
  background: #071523;
  border-right: 1px solid #13283d;
  padding: 1.25rem 0;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  color: var(--white);

  body.theme-light & {
    background: #ffffff;
    border-right-color: #dbe4ea;
    color: #111827;
  }

  @media (max-width: 768px) {
    display: none !important;
    width: 0;
    padding: 0;
    border: none;
    position: absolute;
    left: -100%;
    visibility: hidden;
  }
`;

const SidebarControls = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
`;

const SidebarButton = styled.button`
  background: rgba(0, 255, 51, 0.2);
  border: 1px solid rgba(0, 255, 51, 0.3);
  color: var(--green);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 255, 51, 0.3);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const SidebarItem = styled.div`
  padding: 0.75rem 1rem;
  margin: 0.18rem 0.75rem;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: #b7c4d3;
  font-weight: 500;

  body.theme-light & {
    color: #334155;
  }

  &:hover {
    background: rgba(25, 180, 91, .12);
    color: #35d47d;
    transform: translateX(2px);
  }

  &.active {
    background: linear-gradient(90deg, rgba(25, 180, 91, .28), rgba(25, 180, 91, .06));
    color: #35d47d;
    border-left: 3px solid #20c875;
  }

  body.theme-light &.active {
    background: linear-gradient(90deg, rgba(19, 138, 91, .14), rgba(19, 138, 91, .04));
    color: #087443;
    border-left-color: #138a5b;
  }

  .icon {
    font-size: 1.2rem;
    width: 1.2rem;
    height: 1.2rem;
    flex-shrink: 0;
  }

  .text {
    font-size: 0.95rem;
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.header`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 76px;
  padding: 0 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 5;
  background: #071321;
  border-bottom: 1px solid #13283d;

  body.theme-light & {
    background: rgba(255, 255, 255, 0.94);
    border-bottom-color: #dbe4ea;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    padding-left: 3.1rem;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const LogoutButton = styled.button`
  background-color: var(--green);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  color: var(--white);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    transform: scale(1.04);
  }
  &:focus {
    transform: scale(0.98);
  }
`;

const ThemeToggle = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 38px;
  padding: 0.5rem 0.8rem;
  border-radius: 10px;
  border: 1px solid rgba(19, 138, 91, 0.35);
  background: rgba(19, 138, 91, 0.1);
  color: var(--text);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;

  &:hover {
    background: rgba(19, 138, 91, 0.18);
    border-color: rgba(19, 138, 91, 0.6);
    transform: translateY(-1px);
  }

  svg { width: 16px; height: 16px; }
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 28px 34px 40px;
  overflow-y: auto;
  background: #061321;

  body.theme-light & {
    background: #f1f3f2;
  }
  
  @media (max-width: 768px) {
    padding-bottom: 5rem;
  }
`;

const ContentCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  opacity: 0;
  transform: translateY(30px);

  body.theme-light & {
    background: rgba(255, 255, 255, 0.88);
    border-color: rgba(15, 23, 42, 0.1);
    box-shadow: 0 10px 28px rgba(15, 23, 42, 0.05);
  }
`;

const UserList = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  max-height: 400px;
  overflow-y: auto;

  body.theme-light & {
    background: rgba(255, 255, 255, 0.78);
    border-color: rgba(15, 23, 42, 0.1);
  }
`;

const UserItem = styled.div`
  padding: 1rem;
  margin: 0.5rem 0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.05);

  body.theme-light & {
    color: #334155;
    background: rgba(248, 250, 252, 0.9);

    .user-name { color: #111827; }
    .user-email { color: #64748b; }
  }

  &:hover {
    background: rgba(0, 255, 51, 0.1);
    transform: translateX(5px);
  }

  &.active {
    background: rgba(0, 255, 51, 0.2);
    border-left: 3px solid var(--green);
  }

  .user-info {
    flex: 1;
  }

  .user-name {
    font-weight: 600;
    color: white;
  }

  .user-email {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .message-count {
    background: var(--green);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 10px;
    font-size: 0.75rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    svg { width: 14px; height: 14px; }
  }
`;

const HamburgerButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;

  body.theme-light & { color: #111827; }
  
`;

const MobileOverlay = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: ${props => props.$isOpen ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
`;

const MobileSideToggle = styled.button`
  display: none;

  @media (max-width: 768px) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    left: 0.75rem;
    top: 0.85rem;
    transform: none;
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: #138a5b;
    color: #ffffff;
    border: 1px solid #69e6b0;
    box-shadow: 0 8px 24px rgba(19, 138, 91, 0.42);
    z-index: 1001;
    cursor: pointer;
  }

  body.theme-light & {
    background: #ffffff;
    color: #111827;
    border-color: #dbe4ea;
  }

  svg { width: 21px; height: 21px; }
`;

const BottomNav = styled.nav`
  display: none;

  @media (max-width: 768px) {
    display: ${props => props.$isOpen ? 'flex' : 'none'};
    flex-direction: column;
    align-items: stretch;
    position: fixed;
    top: 4.35rem;
    left: 0.75rem;
    transform: none;
    width: min(230px, 78vw);
    max-height: calc(100vh - 5rem);
    overflow-y: auto;
    background: rgba(28, 28, 35, 0.97);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-left: none;
    border-radius: 0 16px 16px 0;
    padding: 0.65rem 0.45rem;
    z-index: 1000;
  }

  body.theme-light & {
    background: rgba(255, 255, 255, 0.97);
    border-color: #dbe4ea;
  }
`;

const BottomNavItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.7rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.7);

  body.theme-light & { color: #475569; }
  
  &:hover {
    color: var(--green);
    transform: translateX(2px);
  }
  
  &.active {
    color: var(--green);
    background: rgba(19, 138, 91, 0.12);
    .icon { transform: scale(1.1); }
  }
  
  .icon {
    font-size: 1.2rem;
    width: 1.2rem;
    height: 1.2rem;
    flex-shrink: 0;
    transition: all 0.3s ease;
  }
  
  span {
    font-size: 0.78rem;
    font-weight: 500;
  }
`;

function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  
  const [activeMenu, setActiveMenu] = useState('messagerie');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  // Create user state
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'USER'
  });

  // Search users state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Announcement management state
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);

  // Announcement state
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    type: 'INFO',
    link: '',
    selectedUsers: [] // Add selected users array
  });
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [isCreatingAnnouncement, setIsCreatingAnnouncement] = useState(false);

  // Appointment state
  const [appointments, setAppointments] = useState([]);

  // Time slot management state
  const [timeSlots, setTimeSlots] = useState([]);
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '',
    endTime: '',
    maxBookings: 1
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Study forms state
  const [studyForms, setStudyForms] = useState([]);
  const [selectedStudyForm, setSelectedStudyForm] = useState(null);
  const [studyFormSearchQuery, setStudyFormSearchQuery] = useState('');
  const [studyFormSearchResults, setStudyFormSearchResults] = useState([]);
  const [isSearchingStudyForms, setIsSearchingStudyForms] = useState(false);

  // Payment state
  const [payments, setPayments] = useState([]);
  const [paymentStats, setPaymentStats] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [addPaymentAmount, setAddPaymentAmount] = useState('');
  const [showCreatePaymentModal, setShowCreatePaymentModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    userId: '',
    prixTotal: '',
    prixPaye: '0',
    status: 'PENDING'
  });

  // Dossier state
  const [dossiers, setDossiers] = useState([]);
  const [dossierStats, setDossierStats] = useState(null);
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [showCreateDossierModal, setShowCreateDossierModal] = useState(false);
  const [newDossier, setNewDossier] = useState({
    title: '',
    userId: '',
    status: 'PENDING'
  });

  // Message templates state
  const [messageTemplates, setMessageTemplates] = useState([
    {
      id: 1,
      title: 'Bienvenue',
      content: 'Bonjour et bienvenue sur Via Italia ! Nous sommes ravis de vous accompagner dans votre projet d\'études en Italie. Comment puis-je vous aider ?'
    },
    {
      id: 2,
      title: 'Demande de documents',
      content: 'Pour continuer votre dossier, merci de nous fournir les documents suivants : passeport, relevés de notes, diplômes, et un justificatif de domicile. Puis-je vous aider pour autre chose ?'
    },
    {
      id: 3,
      title: 'Information universitaire',
      content: 'J\'ai bien reçu votre demande concernant les universités italiennes. Je vais préparer une liste d\'établissements correspondant à votre profil. Je reviens vers vous rapidement !'
    },
    {
      id: 4,
      title: 'Rendez-vous',
      content: 'Votre rendez-vous est confirmé ! N\'oubliez pas d\'apporter vos documents originaux. À très bientôt !'
    },
    {
      id: 5,
      title: 'Paiement',
      content: 'Concernant le paiement de nos services, vous pouvez régler par virement bancaire ou carte bancaire. Voici nos coordonnées bancaires si besoin : [IBAN]. Avez-vous d\'autres questions ?'
    },
    {
      id: 6,
      title: 'Suivi dossier',
      content: 'Votre dossier est en cours de traitement. Tout se déroule bien et nous vous tiendrons informé de chaque avancée. Merci pour votre confiance !'
    },
    {
      id: 7,
      title: 'Rappel',
      content: 'Petit rappel : n\'oubliez pas votre rendez-vous prévu pour [date]. Pensez à préparer tous les documents nécessaires. Belle journée !'
    },
    {
      id: 8,
      title: 'Appel',
      content: 'Je vous appelle dans la journée pour discuter de votre projet. Préparez vos questions si vous en avez ! À tout à l\'heure.'
    }
  ]);
  const [showTemplates, setShowTemplates] = useState(false);

  const sidebarRef = useRef(null);
  const headerRef = useRef(null);
  const contentRef = useRef(null);

  // Announcement management functions
  const fetchAnnouncements = async () => {
    try {
      const response = await announcementService.getAllAnnouncements();
      if (response.success) {
        setAnnouncements(response.data || []);
        console.log('Announcements loaded:', response.data);
      } else {
        console.error('Error fetching announcements:', response.error);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setAnnouncements([]);
    }
  };

  const createAnnouncement = async () => {
    console.log('=== CREATE ANNOUNCEMENT FUNCTION CALLED ===');
    
    if (!newAnnouncement.title || !newAnnouncement.content) {
      alert('Veuillez remplir le titre et le contenu de l\'annonce');
      return;
    }

    try {
      console.log('=== SETTING LOADING STATE ===');
      setIsCreatingAnnouncement(true);
      
      console.log('=== ABOUT TO CREATE ANNOUNCEMENT ===');
      // Create the announcement
      const response = await announcementService.createAnnouncement(newAnnouncement);
      console.log('=== CREATE ANNOUNCEMENT RESPONSE ===', response);
      
      // Simple test to verify code execution reaches email section
      console.log('=== CODE REACHES EMAIL SECTION ===');
      
      // Send email notification to all users
      console.log('=== ABOUT TO SEND EMAIL NOTIFICATION ===');
      try {
        const announcementId = response.data?.id || response.data?.data?.id || response.id;
        console.log('=== ANNOUNCEMENT ID FOR EMAIL ===', announcementId);
        
        if (announcementId) {
          console.log('=== CALLING EMAIL NOTIFICATION ===');
          try {
            await announcementService.sendAnnouncementNotification(announcementId);
            console.log('Email notification sent to all users');
          } catch (emailError) {
            console.error('=== EMAIL NOTIFICATION ERROR ===', emailError);
            console.error('Error sending email notification:', emailError);
            // Don't fail the announcement creation if email fails
          }
        } else {
          console.error('No announcement ID found in response:', response);
        }
      } catch (error) {
        console.error('Error sending email notification:', error);
      }
      
      console.log('=== EMAIL NOTIFICATION SECTION COMPLETED ===');
      
      // Reset form
      console.log('=== RESETTING FORM ===');
      setNewAnnouncement({
        title: '',
        content: '',
        type: 'INFO',
        link: '',
        selectedUsers: []
      });
      
      // Refresh announcements list
      console.log('=== ABOUT TO REFRESH ANNOUNCEMENTS ===');
      await fetchAnnouncements();
      console.log('=== ANNOUNCEMENTS REFRESHED ===');
      
    } catch (error) {
      console.error('=== CREATE ANNOUNCEMENT ERROR ===', error);
      console.error('Error creating announcement:', error);
    } finally {
      console.log('=== RESETTING LOADING STATE ===');
      setIsCreatingAnnouncement(false);
    }
    
    console.log('=== CREATE ANNOUNCEMENT FUNCTION END ===');
  };

  const updateAnnouncement = async (announcement) => {
    setEditingAnnouncement(announcement);
  };

  const saveAnnouncement = async () => {
    if (!editingAnnouncement) return;
    
    try {
      const response = await announcementService.updateAnnouncement(editingAnnouncement.id, {
        title: editingAnnouncement.title,
        content: editingAnnouncement.content,
        type: editingAnnouncement.type,
        link: editingAnnouncement.link
      });
      
      if (response.success) {
        setAnnouncements(announcements.map(ann => 
          ann.id === editingAnnouncement.id ? response.data : ann
        ));
        setEditingAnnouncement(null);
        console.log('Announcement updated:', response.data);
      } else {
        console.error('Error updating announcement:', response.error);
      }
    } catch (error) {
      console.error('Error updating announcement:', error);
    }
  };

  const deleteAnnouncement = async (announcementId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return;
    
    try {
      const response = await announcementService.deleteAnnouncement(announcementId);
      if (response.success) {
        setAnnouncements(announcements.filter(ann => ann.id !== announcementId));
        console.log('Announcement deleted:', announcementId);
      } else {
        console.error('Error deleting announcement:', response.error);
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const toggleAnnouncementStatus = async (announcementId) => {
    try {
      const announcement = announcements.find(ann => ann.id === announcementId);
      if (!announcement) return;
      
      const response = await announcementService.updateAnnouncement(announcementId, {
        isActive: !announcement.isActive
      });
      
      if (response.success) {
        setAnnouncements(announcements.map(ann => 
          ann.id === announcementId ? response.data : ann
        ));
        console.log('Announcement status toggled:', announcementId);
      } else {
        console.error('Error toggling announcement status:', response.error);
      }
    } catch (error) {
      console.error('Error toggling announcement status:', error);
    }
  };
  useEffect(() => {
    fetchUsers();
    fetchAllUsers();
    fetchMessages(); // Fetch all messages
    fetchContracts(); // Fetch contracts
    fetchAnnouncements(); // Fetch announcements
    fetchAppointments(); // Fetch appointments
    fetchTimeSlots(); // Fetch time slots
    fetchStudyForms(); // Fetch study forms
    fetchPayments(); // Fetch payments
    fetchPaymentStats(); // Fetch payment stats
    fetchDossiers(); // Fetch dossiers
    fetchDossierStats(); // Fetch dossier stats
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Users API Response:', response.data);
      
      // Handle different response structures
      let usersData = [];
      if (response.data && response.data.data) {
        usersData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        usersData = response.data;
      }
      
      setUsers(usersData.filter(u => u.role === 'USER'));
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('All Users API Response:', response.data);
      
      // Handle different response structures
      let usersData = [];
      if (response.data && response.data.data) {
        usersData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        usersData = response.data;
      }
      
      setAllUsers(usersData);
    } catch (error) {
      console.error('Error fetching all users:', error);
      setAllUsers([]);
    }
  };

  const addToRefs = (el) => {
    if (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(40px)';
      setTimeout(() => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out"
        });
      }, 100);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await messageService.getAllMessages();
      
      if (response.success && response.data) {
        // Sort messages by createdAt (oldest first for proper chat flow)
        const sortedMessages = response.data.sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        );
        setMessages(sortedMessages);
        console.log('Admin messages loaded:', sortedMessages.length);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    
    setIsSendingMessage(true);
    
    try {
      const response = await messageService.createMessage({
        content: newMessage.trim(),
        sender: 'ADMIN',
        userId: parseInt(selectedUser.id)
      });
      
      if (response.success && response.data) {
        setMessages([...messages, response.data]);
        setNewMessage('');
        console.log('Message sent successfully:', response.data);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error notification
      const errorText = 'Erreur lors de l\'envoi: ' + (error.response?.data?.message || error.message);
      
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
      errorDiv.innerHTML = `
        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>${errorText}</span>
      `;
      document.body.appendChild(errorDiv);
      
      gsap.fromTo(errorDiv, {
        scale: 0, opacity: 0, rotation: 180, x: 100
      }, {
        scale: 1, opacity: 1, rotation: 0, x: 0, duration: 0.6, ease: "back.out(1.7)",
        onComplete: () => {
          gsap.to(errorDiv, {
            scale: 0, opacity: 0, x: 100, duration: 0.3, delay: 3, ease: "power2.in"
          });
          setTimeout(() => {
            document.body.removeChild(errorDiv);
          }, 3300);
        }
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Template functions
  const toggleTemplates = () => {
    setShowTemplates(!showTemplates);
  };

  const useTemplate = (template) => {
    setNewMessage(template);
  };

  // Contract functions
  const fetchContracts = async () => {
    try {
      const response = await contractService.getAllContracts();
      if (response.success && response.data) {
        setContracts(response.data);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
    }
  };

  const updateContractStatus = async (contractId, status) => {
    try {
      const response = await contractService.updateContractStatus(contractId, status);
      if (response.success) {
        // Update contracts list
        setContracts(contracts.map(contract => 
          contract.id === contractId 
            ? { ...contract, status }
            : contract
        ));
        
        // Show success notification
        const successText = status === 'CONFIRMED' ? 'Contrat confirmé!' : 'Contrat rejeté!';
        
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
        successDiv.innerHTML = `
          <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2m0 0l2-2m-2 2l-2-2" />
          </svg>
          <span>${successText}</span>
        `;
        document.body.appendChild(successDiv);
        
        gsap.fromTo(successDiv, {
          scale: 0, opacity: 0, rotation: -180, x: -100
        }, {
          scale: 1, opacity: 1, rotation: 0, x: 0, duration: 0.6, ease: "back.out(1.7)",
          onComplete: () => {
            gsap.to(successDiv, {
              scale: 0, opacity: 0, x: -100, duration: 0.3, delay: 2, ease: "power2.in"
            });
            setTimeout(() => {
              document.body.removeChild(successDiv);
            }, 2300);
          }
        });
      }
    } catch (error) {
      console.error('Error updating contract status:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const downloadContract = async (contractId, fileName) => {
    try {
      const response = await contractService.downloadContract(contractId);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading contract:', error);
      alert('Erreur lors du téléchargement');
    }
  };

  const deleteContract = async (contractId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce contrat?')) return;
    
    try {
      const response = await contractService.deleteContract(contractId);
      if (response.success) {
        // Remove contract from list
        setContracts(contracts.filter(contract => contract.id !== contractId));
        
        // Show success notification
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
        successDiv.innerHTML = `
          <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Contrat supprimé!</span>
        `;
        document.body.appendChild(successDiv);
        
        gsap.fromTo(successDiv, {
          scale: 0, opacity: 0, rotation: -180, x: -100
        }, {
          scale: 1, opacity: 1, rotation: 0, x: 0, duration: 0.6, ease: "back.out(1.7)",
          onComplete: () => {
            gsap.to(successDiv, {
              scale: 0, opacity: 0, x: -100, duration: 0.3, delay: 2, ease: "power2.in"
            });
            setTimeout(() => {
              document.body.removeChild(successDiv);
            }, 2300);
          }
        });
      }
    } catch (error) {
      console.error('Error deleting contract:', error);
      alert('Erreur lors de la suppression');
    }
  };

  // Appointment functions
  const fetchAppointments = async () => {
    try {
      const response = await appointmentService.getAllAppointments();
      if (response.success && response.data) {
        setAppointments(response.data);
        console.log('Appointments loaded:', response.data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    }
  };

  const updateAppointmentStatus = async (appointmentId, status, etat) => {
    try {
      const response = await appointmentService.updateAppointment(appointmentId, { status, etat });
      if (response.success && response.data) {
        // Update appointments list
        setAppointments(appointments.map(appointment => 
          appointment.id === appointmentId 
            ? { ...appointment, status, etat }
            : appointment
        ));
        
        // Show success notification
        const successText = `Rendez-vous ${status === 'CONFIRMED' ? 'confirmé' : status === 'CANCELLED' ? 'annulé' : 'mis à jour'}!`;
        
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
        successDiv.innerHTML = `
          <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2m0 0l2-2m-2 2l-2-2" />
          </svg>
          <span>${successText}</span>
        `;
        document.body.appendChild(successDiv);
        
        gsap.fromTo(successDiv, {
          scale: 0, opacity: 0, rotation: -180, x: -100
        }, {
          scale: 1, opacity: 1, rotation: 0, x: 0, duration: 0.6, ease: "back.out(1.7)",
          onComplete: () => {
            gsap.to(successDiv, {
              scale: 0, opacity: 0, x: -100, duration: 0.3, delay: 2, ease: "power2.in"
            });
            setTimeout(() => {
              document.body.removeChild(successDiv);
            }, 2300);
          }
        });
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const deleteAppointment = async (appointmentId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous?')) return;
    
    try {
      const response = await appointmentService.deleteAppointment(appointmentId);
      if (response.success) {
        // Remove appointment from list
        setAppointments(appointments.filter(appointment => appointment.id !== appointmentId));
        
        // Show success notification
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
        successDiv.innerHTML = `
          <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Rendez-vous supprimé!</span>
        `;
        document.body.appendChild(successDiv);
        
        gsap.fromTo(successDiv, {
          scale: 0, opacity: 0, rotation: -180, x: -100
        }, {
          scale: 1, opacity: 1, rotation: 0, x: 0, duration: 0.6, ease: "back.out(1.7)",
          onComplete: () => {
            gsap.to(successDiv, {
              scale: 0, opacity: 0, x: -100, duration: 0.3, delay: 2, ease: "power2.in"
            });
            setTimeout(() => {
              document.body.removeChild(successDiv);
            }, 2300);
          }
        });
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Erreur lors de la suppression');
    }
  };

  // Time Slot Management Functions
  const fetchTimeSlots = async () => {
    try {
      const response = await appointmentService.getAvailableSlots();
      if (response.success && response.data) {
        setTimeSlots(response.data);
        console.log('Time slots loaded:', response.data);
      } else {
        setTimeSlots([]);
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setTimeSlots([]);
    }
  };

  const handleCreateSlot = async () => {
    if (!newSlot.date || !newSlot.startTime || !newSlot.endTime) {
      alert('Veuillez remplir tous les champs du créneau horaire');
      return;
    }

    try {
      const response = await appointmentService.createTimeSlot(newSlot);
      if (response.success) {
        // Reset form
        setNewSlot({
          date: '',
          startTime: '',
          endTime: '',
          maxBookings: 1
        });
        setShowSlotForm(false);
        
        // Refresh time slots
        fetchTimeSlots();
        
        // Show success notification
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
        successDiv.innerHTML = `
          <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Créneau horaire créé!</span>
        `;
        document.body.appendChild(successDiv);
        
        gsap.fromTo(successDiv, {
          scale: 0, opacity: 0, rotation: -180, x: -100
        }, {
          scale: 1, opacity: 1, rotation: 0, x: 0, duration: 0.6, ease: "back.out(1.7)",
          onComplete: () => {
            gsap.to(successDiv, {
              scale: 0, opacity: 0, x: -100, duration: 0.3, delay: 2, ease: "power2.in"
            });
            setTimeout(() => {
              if (document.body.contains(successDiv)) {
                document.body.removeChild(successDiv);
              }
            }, 2300);
          }
        });
      }
    } catch (error) {
      console.error('Error creating time slot:', error);
      alert('Erreur lors de la création du créneau horaire');
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce créneau horaire?')) return;
    
    try {
      const response = await appointmentService.deleteTimeSlot(slotId);
      if (response.success) {
        // Remove slot from list
        setTimeSlots(timeSlots.filter(slot => slot.id !== slotId));
        
        // Show success notification
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
        successDiv.innerHTML = `
          <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Créneau horaire supprimé!</span>
        `;
        document.body.appendChild(successDiv);
        
        gsap.fromTo(successDiv, {
          scale: 0, opacity: 0, rotation: -180, x: -100
        }, {
          scale: 1, opacity: 1, rotation: 0, x: 0, duration: 0.6, ease: "back.out(1.7)",
          onComplete: () => {
            gsap.to(successDiv, {
              scale: 0, opacity: 0, x: -100, duration: 0.3, delay: 2, ease: "power2.in"
            });
            setTimeout(() => {
              if (document.body.contains(successDiv)) {
                document.body.removeChild(successDiv);
              }
            }, 2300);
          }
        });
      }
    } catch (error) {
      console.error('Error deleting time slot:', error);
      alert('Erreur lors de la suppression du créneau horaire');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const toggleMobileSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMobileMenuClick = (menuId) => {
    setActiveMenu(menuId);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Create user function
  const handleCreateUser = async () => {
    // Only ADMIN can create users
    if (user.role !== 'ADMIN') {
      alert('Accès refusé. Seul un administrateur peut créer des utilisateurs.');
      return;
    }

    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.password) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      const response = await authService.createUser(newUser);
      
      if (response.success) {
        // Reset form
        setNewUser({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          role: 'USER'
        });
        setShowCreateUserForm(false);
        
        // Refresh users list
        fetchAllUsers();
        
        // Show success notification
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
        successDiv.innerHTML = `
          <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2m0 0l2-2m-2 2l-2-2" />
          </svg>
          <span>Utilisateur créé avec succès!</span>
        `;
        document.body.appendChild(successDiv);
        
        gsap.fromTo(successDiv, {
          scale: 0, opacity: 0, rotation: -180, x: -100
        }, {
          scale: 1, opacity: 1, rotation: 0, x: 0, duration: 0.6, ease: "back.out(1.7)",
          onComplete: () => {
            gsap.to(successDiv, {
              scale: 0, opacity: 0, x: -100, duration: 0.3, delay: 2, ease: "power2.in"
            });
            setTimeout(() => {
              document.body.removeChild(successDiv);
            }, 2300);
          }
        });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Erreur lors de la création de l\'utilisateur');
    }
  };

  // Search users function
  const handleSearchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await authService.searchUsers(query);
      if (response.success) {
        setSearchResults(response.data);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        handleSearchUsers(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Animate search results when they change
  useEffect(() => {
    if (searchResults.length > 0) {
      // Animate search results rows
      gsap.fromTo('.search-result-row', {
        y: 20,
        opacity: 0,
        scale: 0.95
      }, {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: "back.out(1.7)",
        stagger: 0.05
      });
    }
  }, [searchResults]);

  // Study forms API functions
  const fetchStudyForms = async () => {
    try {
      const response = await axios.get('/api/study-forms');
      if (response.data.success) {
        setStudyForms(response.data.data || []);
        console.log('Study forms loaded:', response.data.data);
      } else {
        console.error('Error fetching study forms:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching study forms:', error);
      setStudyForms([]);
    }
  };

  const searchStudyForms = async (query) => {
    if (!query.trim()) {
      setStudyFormSearchResults([]);
      return;
    }

    setIsSearchingStudyForms(true);
    try {
      const response = await axios.get(`/api/study-forms/search?name=${encodeURIComponent(query)}`);
      if (response.data.success) {
        setStudyFormSearchResults(response.data.data || []);
      } else {
        console.error('Error searching study forms:', response.data.message);
        setStudyFormSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching study forms:', error);
      setStudyFormSearchResults([]);
    } finally {
      setIsSearchingStudyForms(false);
    }
  };

  // Debounced search for study forms
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (studyFormSearchQuery) {
        searchStudyForms(studyFormSearchQuery);
      } else {
        setStudyFormSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [studyFormSearchQuery]);

  // Payment API functions
  const fetchPayments = async () => {
    try {
      const response = await axios.get('/api/payments');
      if (response.data.success) {
        setPayments(response.data.data || []);
        console.log('Payments loaded:', response.data.data);
      } else {
        console.error('Error fetching payments:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    }
  };

  const fetchPaymentStats = async () => {
    try {
      const response = await axios.get('/api/payments/stats');
      if (response.data.success) {
        setPaymentStats(response.data.data);
        console.log('Payment stats loaded:', response.data.data);
      } else {
        console.error('Error fetching payment stats:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      setPaymentStats(null);
    }
  };

  const handleAddPayment = async () => {
    if (!selectedPayment || !addPaymentAmount || parseFloat(addPaymentAmount) <= 0) {
      alert('Veuillez entrer un montant valide');
      return;
    }

    try {
      const response = await axios.post(`/api/payments/${selectedPayment.id}/add-payment`, {
        amount: parseFloat(addPaymentAmount)
      });

      if (response.data.success) {
        // Update payments list
        setPayments(payments.map(payment => 
          payment.id === selectedPayment.id ? response.data.data : payment
        ));
        
        // Update selected payment
        setSelectedPayment(response.data.data);
        
        // Reset modal
        setShowAddPaymentModal(false);
        setAddPaymentAmount('');
        
        // Refresh stats
        fetchPaymentStats();
        
        // Show success notification
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
        successDiv.innerHTML = `
          <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2m0 0l2-2m-2 2l-2-2" />
          </svg>
          <span>Paiement ajouté avec succès!</span>
        `;
        document.body.appendChild(successDiv);
        
        gsap.fromTo(successDiv, {
          scale: 0, opacity: 0, rotation: -180, x: -100
        }, {
          scale: 1, opacity: 1, rotation: 0, x: 0, duration: 0.6, ease: "back.out(1.7)",
          onComplete: () => {
            gsap.to(successDiv, {
              scale: 0, opacity: 0, x: -100, duration: 0.3, delay: 2, ease: "power2.in"
            });
            setTimeout(() => {
              document.body.removeChild(successDiv);
            }, 2300);
          }
        });
      }
    } catch (error) {
      console.error('Error adding payment:', error);
      alert('Erreur lors de l\'ajout du paiement');
    }
  };

  const handleCreatePayment = async () => {
    if (!newPayment.userId || !newPayment.prixTotal) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      const response = await axios.post('/api/payments', {
        userId: parseInt(newPayment.userId),
        amount: parseFloat(newPayment.prixTotal), // Add amount field
        prixTotal: parseFloat(newPayment.prixTotal),
        prixPaye: parseFloat(newPayment.prixPaye),
        status: newPayment.status
      });

      if (response.data.success) {
        // Add new payment to list
        setPayments([...payments, response.data.data]);
        
        // Reset modal
        setShowCreatePaymentModal(false);
        setNewPayment({
          userId: '',
          prixTotal: '',
          prixPaye: '0',
          status: 'PENDING'
        });
        
        // Refresh stats
        fetchPaymentStats();
        
        // Show success notification
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
        successDiv.innerHTML = `
          <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2m0 0l2-2m-2 2l-2-2" />
          </svg>
          <span>Paiement créé avec succès!</span>
        `;
        document.body.appendChild(successDiv);
        
        gsap.fromTo(successDiv, {
          scale: 0, opacity: 0, rotation: -180, x: -100
        }, {
          scale: 1, opacity: 1, rotation: 0, x: 0, duration: 0.6, ease: "back.out(1.7)",
          onComplete: () => {
            gsap.to(successDiv, {
              scale: 0, opacity: 0, x: -100, duration: 0.3, delay: 2, ease: "power2.in"
            });
            setTimeout(() => {
              document.body.removeChild(successDiv);
            }, 2300);
          }
        });
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Erreur lors de la création du paiement: ' + (error.response?.data?.message || error.message));
    }
  };

  // Delete user function
  const handleDeleteUser = async (userId, userName) => {
    // Only ADMIN can delete users
    if (user.role !== 'ADMIN') {
      alert('Accès refusé. Seul un administrateur peut supprimer des utilisateurs.');
      return;
    }

    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${userName} ?\n\nCette action supprimera également toutes les données associées (rendez-vous, contrats, messages, etc.).`)) {
      return;
    }

    try {
      const response = await authService.deleteUser(userId);
      
      if (response.success) {
        // Refresh users list
        fetchAllUsers();
        
        // Clear search results if needed
        if (searchQuery) {
          handleSearchUsers(searchQuery);
        }
        
        // Show success notification
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
        successDiv.innerHTML = `
          <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>${userName} supprimé avec succès!</span>
        `;
        document.body.appendChild(successDiv);
        
        gsap.fromTo(successDiv, {
          scale: 0, opacity: 0, rotation: -180, x: -100
        }, {
          scale: 1, opacity: 1, rotation: 0, x: 0, duration: 0.6, ease: "back.out(1.7)",
          onComplete: () => {
            gsap.to(successDiv, {
              scale: 0, opacity: 0, x: -100, duration: 0.3, delay: 2, ease: "power2.in"
            });
            setTimeout(() => {
              document.body.removeChild(successDiv);
            }, 2300);
          }
        });
      }
    } catch (error) {
      alert('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  // Dossier API functions
  const fetchDossiers = async () => {
    try {
      const response = await dossierService.getAllDossiers();
      if (response.success && response.data) {
        setDossiers(response.data);
        console.log('Dossiers loaded:', response.data);
      } else {
        console.error('Error fetching dossiers:', response.error);
        setDossiers([]);
      }
    } catch (error) {
      console.error('Error fetching dossiers:', error);
      setDossiers([]);
    }
  };

  const fetchDossierStats = async () => {
    try {
      const response = await dossierService.getDossierStats();
      if (response.success && response.data) {
        setDossierStats(response.data);
        console.log('Dossier stats loaded:', response.data);
      } else {
        console.error('Error fetching dossier stats:', response.error);
        setDossierStats(null);
      }
    } catch (error) {
      console.error('Error fetching dossier stats:', error);
      setDossierStats(null);
    }
  };

  const handleCreateDossier = async () => {
    if (!newDossier.title || !newDossier.userId) {
      alert('Veuillez remplir le titre et sélectionner un utilisateur');
      return;
    }

    try {
      const response = await dossierService.createDossier(newDossier);
      
      if (response.success && response.data) {
        // Add new dossier to list
        setDossiers([...dossiers, response.data]);
        
        // Reset modal
        setShowCreateDossierModal(false);
        setNewDossier({
          title: '',
          userId: '',
          status: 'PENDING'
        });
        
        // Refresh stats
        fetchDossierStats();
        
        // Show success notification
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
        successDiv.innerHTML = `
          <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2m0 0l2-2m-2 2l-2-2" />
          </svg>
          <span>Dossier créé avec succès!</span>
        `;
        document.body.appendChild(successDiv);
        
        gsap.fromTo(successDiv, {
          scale: 0, opacity: 0, rotation: -180, x: -100
        }, {
          scale: 1, opacity: 1, rotation: 0, x: 0, duration: 0.6, ease: "back.out(1.7)",
          onComplete: () => {
            gsap.to(successDiv, {
              scale: 0, opacity: 0, x: -100, duration: 0.3, delay: 2, ease: "power2.in"
            });
            setTimeout(() => {
              document.body.removeChild(successDiv);
            }, 2300);
          }
        });
      }
    } catch (error) {
      console.error('Error creating dossier:', error);
      alert('Erreur lors de la création du dossier: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateDossier = async (dossierId, updateData) => {
    try {
      const response = await dossierService.updateDossier(dossierId, updateData);
      
      if (response.success && response.data) {
        // Update dossiers list
        setDossiers(dossiers.map(dossier => 
          dossier.id === dossierId ? response.data : dossier
        ));
        
        // Update selected dossier if it's the one being updated
        if (selectedDossier && selectedDossier.id === dossierId) {
          setSelectedDossier(response.data);
        }
        
        // Refresh stats
        fetchDossierStats();
        
        // Show success notification
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
        successDiv.innerHTML = `
          <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2m0 0l2-2m-2 2l-2-2" />
          </svg>
          <span>Dossier mis à jour avec succès!</span>
        `;
        document.body.appendChild(successDiv);
        
        gsap.fromTo(successDiv, {
          scale: 0, opacity: 0, rotation: -180, x: -100
        }, {
          scale: 1, opacity: 1, rotation: 0, x: 0, duration: 0.6, ease: "back.out(1.7)",
          onComplete: () => {
            gsap.to(successDiv, {
              scale: 0, opacity: 0, x: -100, duration: 0.3, delay: 2, ease: "power2.in"
            });
            setTimeout(() => {
              document.body.removeChild(successDiv);
            }, 2300);
          }
        });
      }
    } catch (error) {
      console.error('Error updating dossier:', error);
      alert('Erreur lors de la mise à jour du dossier');
    }
  };

  const handleDeleteDossier = async (dossierId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce dossier?')) return;
    
    try {
      const response = await dossierService.deleteDossier(dossierId);
      if (response.success) {
        // Remove dossier from list
        setDossiers(dossiers.filter(dossier => dossier.id !== dossierId));
        
        // Clear selected dossier if it was the one deleted
        if (selectedDossier && selectedDossier.id === dossierId) {
          setSelectedDossier(null);
        }
        
        // Refresh stats
        fetchDossierStats();
        
        // Show success notification
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
        successDiv.innerHTML = `
          <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-7 7-7-7-7 7 7 7 7-7 7 7" />
          </svg>
          <span>Dossier supprimé avec succès!</span>
        `;
        document.body.appendChild(successDiv);
        
        gsap.fromTo(successDiv, {
          scale: 0, opacity: 0, rotation: -180, x: -100
        }, {
          scale: 1, opacity: 1, rotation: 0, x: 0, duration: 0.6, ease: "back.out(1.7)",
          onComplete: () => {
            gsap.to(successDiv, {
              scale: 0, opacity: 0, x: -100, duration: 0.3, delay: 2, ease: "power2.in"
            });
            setTimeout(() => {
              document.body.removeChild(successDiv);
            }, 2300);
          }
        });
      }
    } catch (error) {
      console.error('Error deleting dossier:', error);
      alert('Erreur lors de la suppression du dossier');
    }
  };

  const handleCreateMissingDossiers = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir créer des dossiers pour tous les utilisateurs qui n\'en ont pas?')) return;
    
    try {
      const response = await dossierService.createMissingDossiers();
      
      if (response.success) {
        // Refresh dossiers list and stats
        await fetchDossiers();
        await fetchDossierStats();
        
        // Show success notification
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
        successDiv.innerHTML = `
          <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2m0 0l2-2m-2 2l-2-2" />
          </svg>
          <span>${response.data.message}</span>
        `;
        document.body.appendChild(successDiv);
        
        gsap.fromTo(successDiv, {
          scale: 0, opacity: 0, rotation: -180, x: -100
        }, {
          scale: 1, opacity: 1, rotation: 0, x: 0, duration: 0.6, ease: "back.out(1.7)",
          onComplete: () => {
            gsap.to(successDiv, {
              scale: 0, opacity: 0, x: -100, duration: 0.3, delay: 2, ease: "power2.in"
            });
            setTimeout(() => {
              document.body.removeChild(successDiv);
            }, 2300);
          }
        });
      }
    } catch (error) {
      console.error('Error creating missing dossiers:', error);
      alert('Erreur lors de la création des dossiers manquants');
    }
  };

const menuItems = [
  { id: 'messagerie', icon: FiMessageSquare, text: 'Messagerie' },
  { id: 'annonces', icon: FiBell, text: 'Annonces' },
  { id: 'users', icon: FiUsers, text: 'Utilisateurs' },
  { id: 'appointments', icon: FiCalendar, text: 'Rendez-vous' },
  { id: 'contracts', icon: FiFileText, text: 'Contrats' },
  { id: 'dossiers', icon: FiFolder, text: 'Dossiers' },
  { id: 'studyForms', icon: FiEdit3, text: 'Formulaires d\'étude' },
  { id: 'payments', icon: FiCreditCard, text: 'Paiements' },
  { id: 'receipts', icon: FiArchive, text: 'Invoices' },
  { id: 'university-programs', icon: FiBookOpen, text: 'University Programs' },
  { id: 'reviews', icon: FiStar, text: 'Avis clients' }
];

  const renderContent = () => {
    switch(activeMenu) {
      case 'receipts':
        return <AdminReceipts />;
      case 'university-programs':
        return <UniversityPrograms />;
      case 'reviews':
        return <AdminReviews />;
      case 'messagerie':
        return (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* User List */}
              <div className="lg:col-span-1">
                <ContentCard className="content-card">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <FiUsers aria-hidden="true" /> Utilisateurs
                  </h2>
                  <UserList>
                    {users.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-400">
                          Aucun utilisateur trouvé
                        </p>
                      </div>
                    ) : (
                      users.map((user) => (
                        <UserItem
                          key={user.id}
                          className={selectedUser?.id === user.id ? 'active' : ''}
                          onClick={() => setSelectedUser(user)}
                        >
                          <div className="user-info">
                            <div className="user-name">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="user-email">
                              {user.email}
                            </div>
                          </div>
                          <div className="message-count">
                            <FiMessageSquare aria-hidden="true" />
                          </div>
                        </UserItem>
                      ))
                    )}
                  </UserList>
                </ContentCard>
              </div>

              {/* Chat Interface */}
              <div className="lg:col-span-2">
                <ContentCard className="content-card">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <FiMessageSquare aria-hidden="true" /> Messagerie
                    {selectedUser && (
                      <span className="text-lg font-normal text-gray-400 ml-2">
                        - {selectedUser.firstName} {selectedUser.lastName}
                      </span>
                    )}
                  </h2>
                  
                  {selectedUser ? (
                    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 h-[500px] flex flex-col">
                      {/* Messages Container */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.length === 0 ? (
                          <div className="text-center py-12">
                            <p className="text-gray-400 text-lg flex items-center justify-center gap-2">
                              <FiMessageSquare aria-hidden="true" /> Aucun message avec cet utilisateur
                            </p>
                            <p className="text-gray-500 text-sm mt-2">
                              Envoyez votre premier message pour commencer la conversation
                            </p>
                          </div>
                        ) : (
                          messages
                            .filter(message => message.userId === selectedUser.id)
                            .map((message) => (
                              <div
                                key={message.id}
                                className={`flex ${message.sender === 'ADMIN' ? 'justify-end' : 'justify-start'} admin-message-item`}
                              >
                                <div
                                  className={`max-w-xs px-4 py-2 rounded-lg ${
                                    message.sender === 'ADMIN'
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-600 text-white'
                                  }`}
                                >
                                  <p className="text-sm">{message.content}</p>
                                  <p className={`text-xs mt-1 ${
                                    message.sender === 'ADMIN' ? 'text-blue-200' : 'text-gray-300'
                                  }`}>
                                    {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                      
                      {/* Message Input */}
                      <div className="border-t border-gray-700/50 p-4">
                        {/* Template Selector */}
                        <div className="mb-3">
                          <button
                            onClick={toggleTemplates}
                            className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                          >
                            <FiEdit3 aria-hidden="true" /> Messages prédéfinis
                            <svg 
                              className={`w-4 h-4 transition-transform ${showTemplates ? 'rotate-180' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          
                          {showTemplates && (
                            <div className="mt-2 bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 max-h-48 overflow-y-auto">
                              <div className="grid grid-cols-1 gap-2">
                                {messageTemplates.map((template) => (
                                  <button
                                    key={template.id}
                                    onClick={() => {
                                      setNewMessage(template.content);
                                      setShowTemplates(false);
                                    }}
                                    className="text-left px-3 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors group"
                                  >
                                    <div className="font-medium text-white text-sm group-hover:text-purple-400">
                                      {template.title}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                                      {template.content}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder={`Message à ${selectedUser.firstName}...`}
                            className="flex-1 px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                            disabled={isSendingMessage}
                          />
                          <button
                            onClick={sendMessage}
                            disabled={isSendingMessage || !newMessage.trim()}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            {isSendingMessage ? (
                              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9 2zm0 0v-8" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-12 text-center">
                      <p className="text-gray-400 text-lg flex items-center justify-center gap-2">
                        <FiUsers aria-hidden="true" /> Sélectionnez un utilisateur pour commencer à discuter
                      </p>
                    </div>
                  )}
                </ContentCard>
              </div>
            </div>
          </>
        );
      case 'annonces':
        return (
          <ContentCard className="content-card">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FiBell aria-hidden="true" /> Gestion des Annonces
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Create New Announcement Form */}
              <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  ✨ Créer une nouvelle annonce
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Titre de l'annonce
                    </label>
                    <input
                      type="text"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                      placeholder="Entrez le titre..."
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Contenu de l'annonce
                    </label>
                    <textarea
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                      placeholder="Entrez le contenu de l'annonce..."
                      rows={4}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400 resize-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Type d'annonce
                    </label>
                    <select 
                      value={newAnnouncement.type}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, type: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                    >
                      <option value="INFO"> Information</option>
                      <option value="SUCCESS"> Succès</option>
                      <option value="WARNING"> Avertissement</option>
                      <option value="URGENT"> Urgent</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Destinataires (utilisateurs)
                    </label>
                    <div className="space-y-2">
                      <div className="max-h-32 overflow-y-auto border border-gray-600/50 rounded-lg bg-gray-700/50 p-2">
                        {allUsers.filter(u => u.role === 'USER').map((user) => (
                          <label key={user.id} className="flex items-center space-x-2 text-white hover:bg-gray-600/50 p-2 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newAnnouncement.selectedUsers.includes(user.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewAnnouncement({
                                    ...newAnnouncement,
                                    selectedUsers: [...newAnnouncement.selectedUsers, user.id]
                                  });
                                } else {
                                  setNewAnnouncement({
                                    ...newAnnouncement,
                                    selectedUsers: newAnnouncement.selectedUsers.filter(id => id !== user.id)
                                  });
                                }
                              }}
                              className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500 focus:ring-2"
                            />
                            <span className="flex-1">{user.firstName} {user.lastName}</span>
                            <span className="text-xs text-gray-400">{user.email}</span>
                          </label>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>{newAnnouncement.selectedUsers.length} utilisateur(s) sélectionné(s)</span>
                        <button
                          type="button"
                          onClick={() => setNewAnnouncement({
                            ...newAnnouncement,
                            selectedUsers: allUsers.filter(u => u.role === 'USER').map(u => u.id)
                          })}
                          className="text-purple-400 hover:text-purple-300 text-xs underline"
                        >
                          Tout sélectionner
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Lien (optionnel)
                    </label>
                    <input
                      type="url"
                      value={newAnnouncement.link}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, link: e.target.value})}
                      placeholder="https://example.com"
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400"
                    />
                  </div>
                </div>
                
                <button 
                  onClick={createAnnouncement}
                  disabled={isCreatingAnnouncement}
                  className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  {isCreatingAnnouncement ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Publication en cours...
                    </>
                  ) : (
                    <>
                      <FiBell aria-hidden="true" /> Publier l'annonce
                    </>
                  )}
                </button>
              </div>
              
              {/* Existing Announcements */}
              <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                   Annonces existantes
                </h3>
                
                {/* Edit Modal */}
                {editingAnnouncement && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4">
                      <h3 className="text-lg font-semibold text-white mb-4">
                         Modifier l'annonce
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Titre de l'annonce
                          </label>
                          <input
                            type="text"
                            value={editingAnnouncement.title}
                            onChange={(e) => setEditingAnnouncement({...editingAnnouncement, title: e.target.value})}
                            className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Contenu de l'annonce
                          </label>
                          <textarea
                            value={editingAnnouncement.content}
                            onChange={(e) => setEditingAnnouncement({...editingAnnouncement, content: e.target.value})}
                            rows={4}
                            className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400 resize-none"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Type d'annonce
                          </label>
                          <select 
                            value={editingAnnouncement.type}
                            onChange={(e) => setEditingAnnouncement({...editingAnnouncement, type: e.target.value})}
                            className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                          >
                            <option value="INFO"> Information</option>
                            <option value="SUCCESS"> Succès</option>
                            <option value="WARNING"> Avertissement</option>
                            <option value="URGENT"> Urgent</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Lien (optionnel)
                          </label>
                          <input
                            type="url"
                            value={editingAnnouncement.link}
                            onChange={(e) => setEditingAnnouncement({...editingAnnouncement, link: e.target.value})}
                            placeholder="https://example.com"
                            className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={saveAnnouncement}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                        >
                           Enregistrer
                        </button>
                        <button
                          onClick={() => setEditingAnnouncement(null)}
                          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                           Annuler
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  {announcements.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="inline-flex items-center gap-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-8">
                        <span className="text-6xl text-gray-400 mb-3"></span>
                        <span className="text-xl font-medium text-gray-600">Aucune annonce pour le moment</span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {announcements.map((announcement, index) => (
                        <div 
                          key={announcement.id}
                          className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-green-500"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <span className="text-green-400"></span>
                                <span className="text-white">{announcement.title}</span>
                              </h3>
                              <p className="text-gray-300 text-sm mb-4 leading-relaxed">{announcement.content}</p>
                              {announcement.link && (
                                <a 
                                  href={announcement.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-400 hover:text-green-300 transition-colors inline-flex items-center gap-2 mt-2"
                                >
                                   {announcement.link}
                                </a>
                              )}
                            </div>
                            <div className="flex gap-2 mt-4">
                              <button
                                onClick={() => updateAnnouncement(announcement)}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105"
                              >
                                 Modifier
                              </button>
                              <button
                                onClick={() => deleteAnnouncement(announcement.id)}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105"
                              >
                                 Supprimer
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ContentCard>
        );
      
      case 'users':
        return (
          <ContentCard className="content-card">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FiUsers aria-hidden="true" /> Tous les Utilisateurs
            </h2>
            
            {/* Search Bar and Create User Button */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder=" Rechercher des utilisateurs..."
                    className="w-full px-4 py-2 pl-10 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    {isSearching ? (
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
              
              {/* Create User Button for ADMIN */}
              {user.role === 'ADMIN' && (
                <button
                  onClick={() => setShowCreateUserForm(!showCreateUserForm)}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 whitespace-nowrap"
                >
                  ➕ Créer un Utilisateur
                </button>
              )}
            </div>

            {/* Search Results */}
            {searchQuery && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                   Résultats de recherche ({searchResults.length})
                </h3>
                {searchResults.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-white">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left p-4">Nom</th>
                          <th className="text-left p-4">Email</th>
                          <th className="text-left p-4">Rôle</th>
                          <th className="text-left p-4">Date d'inscription</th>
                          <th className="text-left p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {searchResults.map((user) => (
                          <tr key={user.id} className="border-b border-white/10 hover:bg-white/5">
                            <td className="p-4">{user.firstName} {user.lastName}</td>
                            <td className="p-4">{user.email}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs ${
                                user.role === 'USER' 
                                  ? 'bg-red-500 text-white' 
                                  : 'bg-green-500 text-white'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="p-4">
                              {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="p-4">
                              {user.role === 'USER' && (
                                <button
                                  onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors duration-200 transform hover:scale-105"
                                >
                                   Supprimer
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">
                       Aucun utilisateur trouvé pour "{searchQuery}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* All Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left p-4">Nom</th>
                    <th className="text-left p-4">Email</th>
                    <th className="text-left p-4">Rôle</th>
                    <th className="text-left p-4">Date d'inscription</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((user) => (
                    <tr key={user.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="p-4">{user.firstName} {user.lastName}</td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.role === 'USER' 
                            ? 'bg-red-500 text-white' 
                            : 'bg-green-500 text-white'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-4">
                        {user.role === 'USER' && (
                          <button
                            onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors duration-200 transform hover:scale-105"
                          >
                             Supprimer
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Create User Form Modal */}
            {showCreateUserForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    ✨ Créer un Nouvel Utilisateur
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Prénom
                      </label>
                      <input
                        type="text"
                        value={newUser.firstName}
                        onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400"
                        placeholder="Entrez le prénom"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nom
                      </label>
                      <input
                        type="text"
                        value={newUser.lastName}
                        onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400"
                        placeholder="Entrez le nom"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400"
                        placeholder="Entrez l'email"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Mot de passe
                      </label>
                      <input
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400"
                        placeholder="Entrez le mot de passe"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleCreateUser}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      <FiUsers aria-hidden="true" /> Créer l'Utilisateur
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateUserForm(false);
                        setNewUser({
                          firstName: '',
                          lastName: '',
                          email: '',
                          password: '',
                          role: 'USER'
                        });
                      }}
                      className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                       Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}
          </ContentCard>
        );
      
      case 'appointments':
        return (
          <ContentCard className="content-card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FiCalendar aria-hidden="true" /> Gestion des Créneaux Horaires
              </h2>
              <button
                onClick={() => setShowSlotForm(!showSlotForm)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                ➕ Ajouter un Créneau
              </button>
            </div>

            {/* Time Slot Creation Form */}
            {showSlotForm && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">Créer un Nouveau Créneau Horaire</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                    <input
                      type="date"
                      value={newSlot.date}
                      onChange={(e) => setNewSlot({...newSlot, date: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                      min={new Date().toISOString().split('T')[0]}
                      placeholder="mm/dd/yyyy"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Heure de Début</label>
                    <input
                      type="time"
                      value={newSlot.startTime}
                      onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Heure de Fin</label>
                    <input
                      type="time"
                      value={newSlot.endTime}
                      onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Max Réservations</label>
                    <input
                      type="number"
                      value={newSlot.maxBookings}
                      onChange={(e) => setNewSlot({...newSlot, maxBookings: parseInt(e.target.value) || 1})}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                      min="1"
                      max="20"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleCreateSlot}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    <FiCalendar aria-hidden="true" /> Créer le Créneau
                  </button>
                  <button
                    onClick={() => {
                      setShowSlotForm(false);
                      setNewSlot({
                        date: '',
                        startTime: '',
                        endTime: '',
                        maxBookings: 1
                      });
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                     Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Existing Appointments */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Rendez-vous Confirmés</h3>
              {appointments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-lg flex items-center justify-center gap-2">
                    <FiCalendar aria-hidden="true" /> Aucun rendez-vous trouvé
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-white">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left p-4">Étudiant</th>
                        <th className="text-left p-4">Type</th>
                        <th className="text-left p-4">Date</th>
                        <th className="text-left p-4">Statut</th>
                        <th className="text-left p-4">Mode</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appointment) => (
                        <tr key={appointment.id} className="border-b border-white/10 hover:bg-white/5">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">
                                {appointment.user?.firstName} {appointment.user?.lastName}
                              </p>
                              <p className="text-sm text-gray-400">
                                {appointment.user?.email}
                              </p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-sm">
                              {appointment.type}
                            </span>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="text-sm">
                                {new Date(appointment.date).toLocaleDateString('fr-FR')}
                              </p>
                              <p className="text-xs text-gray-400">
                                {new Date(appointment.date).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </td>
                          <td className="p-4">
                            <select
                              value={appointment.status}
                              onChange={(e) => updateAppointmentStatus(appointment.id, e.target.value, appointment.etat)}
                              className={`px-3 py-1 rounded text-sm font-medium ${
                                appointment.status === 'CONFIRMED' 
                                  ? 'bg-green-600/20 text-green-400' 
                                  : appointment.status === 'CANCELLED'
                                  ? 'bg-red-600/20 text-red-400'
                                  : 'bg-yellow-600/20 text-yellow-400'
                              }`}
                            >
                              <option value="PENDING">En Attente</option>
                              <option value="CONFIRMED"> Confirmé</option>
                              <option value="VALIDATED"> Validé</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <select
                              value={appointment.etat}
                              onChange={(e) => updateAppointmentStatus(appointment.id, appointment.status, e.target.value)}
                              className={`px-3 py-1 rounded text-sm font-medium ${
                                appointment.etat === 'PRESENTIEL' 
                                  ? 'bg-green-600/20 text-green-400' 
                                  : 'bg-blue-600/20 text-blue-400'
                              }`}
                            >
                              <option value="PRESENTIEL"> Présentiel</option>
                              <option value="EN_LIGNE"> En Ligne</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => deleteAppointment(appointment.id)}
                              className="px-3 py-1 bg-red-600/20 text-red-400 rounded text-sm hover:bg-red-600/30 transition-colors"
                            >
                               Supprimer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Available Time Slots */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Créneaux Disponibles</h3>
              {timeSlots.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-lg">
                     Aucun créneau horaire disponible
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {timeSlots.map((slot) => (
                    <div key={slot.id} className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 hover:border-green-500/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-white font-medium">
                            {new Date(slot.date).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          <p className="text-gray-300 text-sm">
                            {slot.startTime} - {slot.endTime}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">
                          Max: {slot.maxBookings} réservation{slot.maxBookings > 1 ? 's' : ''}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          slot.isAvailable 
                            ? 'bg-green-600/20 text-green-400' 
                            : 'bg-red-600/20 text-red-400'
                        }`}>
                          {slot.isAvailable ? ' Disponible' : ' Complet'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ContentCard>
        );
      
      case 'contracts':
        return (
          <ContentCard className="content-card">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FiFileText aria-hidden="true" /> Gestion des Contrats
            </h2>
            
            {contracts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg flex items-center justify-center gap-2">
                  <FiFileText aria-hidden="true" /> Aucun contrat trouvé
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-white">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left p-4">Étudiant</th>
                      <th className="text-left p-4">Fichier</th>
                      <th className="text-left p-4">Statut</th>
                      <th className="text-left p-4">Date</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.map((contract) => (
                      <tr key={contract.id} className="border-b border-white/10 hover:bg-white/5">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">
                              {contract.user?.firstName} {contract.user?.lastName}
                            </p>
                            <p className="text-sm text-gray-400">
                              {contract.user?.email}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <span className="text-2xl mr-2"></span>
                            <div>
                              <p className="font-medium">{contract.fileName}</p>
                              <p className="text-sm text-gray-400">
                                {(contract.fileSize / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            contract.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                            contract.status === 'UPLOADED' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            contract.status === 'REJECTED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                          }`}>
                            {contract.status === 'CONFIRMED' ? ' Confirmé' :
                             contract.status === 'UPLOADED' ? ' Téléversé' :
                             contract.status === 'REJECTED' ? ' Rejeté' : ' En attente'}
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">
                            {new Date(contract.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(contract.createdAt).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            {/* Download button */}
                            <button
                              onClick={() => downloadContract(contract.id, contract.fileName)}
                              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
                              title="Télécharger"
                            >
                              
                            </button>
                            
                            {/* Status update buttons */}
                            {contract.status === 'UPLOADED' && (
                              <>
                                <button
                                  onClick={() => updateContractStatus(contract.id, 'CONFIRMED')}
                                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors"
                                  title="Confirmer"
                                >
                                  
                                </button>
                                <button
                                  onClick={() => updateContractStatus(contract.id, 'REJECTED')}
                                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
                                  title="Rejeter"
                                >
                                  
                                </button>
                              </>
                            )}
                            
                            {/* Delete button */}
                            <button
                              onClick={() => deleteContract(contract.id)}
                              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
                              title="Supprimer"
                            >
                              
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Contract Statistics */}
            <div className="mt-8 grid grid-cols-4 gap-4">
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2"></div>
                <div className="text-2xl font-bold text-white">{contracts.length}</div>
                <div className="text-sm text-gray-400">Total</div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2"></div>
                <div className="text-2xl font-bold text-blue-400">
                  {contracts.filter(c => c.status === 'UPLOADED').length}
                </div>
                <div className="text-sm text-gray-400">Téléversés</div>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2"></div>
                <div className="text-2xl font-bold text-green-400">
                  {contracts.filter(c => c.status === 'CONFIRMED').length}
                </div>
                <div className="text-sm text-gray-400">Confirmés</div>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2"></div>
                <div className="text-2xl font-bold text-red-400">
                  {contracts.filter(c => c.status === 'REJECTED').length}
                </div>
                <div className="text-sm text-gray-400">Rejetés</div>
              </div>
            </div>
          </ContentCard>
        );
      
      case 'university':
        return (
          <ContentCard className="content-card">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FiBookOpen aria-hidden="true" /> Informations Universitaires
            </h2>
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                 Consultation des informations universitaires coming soon
              </p>
            </div>
          </ContentCard>
        );
      
      case 'studyForms':
        return (
          <ContentCard className="content-card">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FiEdit3 aria-hidden="true" /> Formulaires d'Étude en Italie
            </h2>
            
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={studyFormSearchQuery}
                  onChange={(e) => setStudyFormSearchQuery(e.target.value)}
                  placeholder=" Rechercher par nom..."
                  className="w-full px-4 py-3 pl-12 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400"
                />
                <div className="absolute left-4 top-3.5 text-gray-400">
                  
                </div>
                {isSearchingStudyForms && (
                  <div className="absolute right-4 top-3.5">
                    <svg className="animate-spin h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Study Forms List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Forms List */}
              <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                   Liste des Demandes
                </h3>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {studyFormSearchResults.length > 0 ? (
                    studyFormSearchResults.map((form) => (
                      <div
                        key={form.id}
                        onClick={() => setSelectedStudyForm(form)}
                        className={`p-4 rounded-lg cursor-pointer transition-all ${
                          selectedStudyForm?.id === form.id
                            ? 'bg-green-500/20 border border-green-500'
                            : 'bg-gray-700/50 border border-gray-600/50 hover:bg-gray-700/70'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-white">
                              {form.fullName}
                            </h4>
                            <p className="text-sm text-gray-400">
                               {form.email}
                            </p>
                            <p className="text-sm text-gray-400">
                               {form.phoneNumber}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                              {form.selectedPack === 'essential' ? 'Pack Essentiel' : 
                               form.selectedPack === 'advanced' ? 'Pack Avancé' : 'Pack Premium'}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(form.submissionDate).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : studyForms.length > 0 ? (
                    studyForms.map((form) => (
                      <div
                        key={form.id}
                        onClick={() => setSelectedStudyForm(form)}
                        className={`p-4 rounded-lg cursor-pointer transition-all ${
                          selectedStudyForm?.id === form.id
                            ? 'bg-green-500/20 border border-green-500'
                            : 'bg-gray-700/50 border border-gray-600/50 hover:bg-gray-700/70'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-white">
                              {form.fullName}
                            </h4>
                            <p className="text-sm text-gray-400">
                               {form.email}
                            </p>
                            <p className="text-sm text-gray-400">
                               {form.phoneNumber}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                              {form.selectedPack === 'essential' ? 'Pack Essentiel' : 
                               form.selectedPack === 'advanced' ? 'Pack Avancé' : 'Pack Premium'}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(form.submissionDate).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">
                        <FiEdit3 aria-hidden="true" /> Aucune demande d'étude trouvée
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Details */}
              <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FiFileText aria-hidden="true" /> Détails de la Demande
                </h3>
                
                {selectedStudyForm ? (
                  <div className="space-y-4">
                    {/* Personal Information */}
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <h4 className="font-semibold text-green-400 mb-3">
                         Informations Personnelles
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-400">Nom:</span>
                          <p className="text-white font-medium">{selectedStudyForm.fullName}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Email:</span>
                          <p className="text-white font-medium">{selectedStudyForm.email}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Téléphone:</span>
                          <p className="text-white font-medium">{selectedStudyForm.phoneNumber}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Ville:</span>
                          <p className="text-white font-medium">{selectedStudyForm.city}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Âge:</span>
                          <p className="text-white font-medium">{selectedStudyForm.age} ans</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Passeport:</span>
                          <p className="text-white font-medium">{selectedStudyForm.passportStatus}</p>
                        </div>
                      </div>
                    </div>

                    {/* Academic Information */}
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <h4 className="font-semibold text-green-400 mb-3">
                        <FiBookOpen aria-hidden="true" /> Informations Académiques
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-400">Niveau Actuel:</span>
                          <p className="text-white font-medium">{selectedStudyForm.currentLevel}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Niveau Désiré:</span>
                          <p className="text-white font-medium">{selectedStudyForm.desiredLevel}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Langue d'Étude:</span>
                          <p className="text-white font-medium">{selectedStudyForm.studyLanguage}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Spécialité:</span>
                          <p className="text-white font-medium">{selectedStudyForm.desiredSpecialty}</p>
                        </div>
                      </div>
                    </div>

                    {/* Pack Information */}
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <h4 className="font-semibold text-green-400 mb-3">
                         Pack Sélectionné
                      </h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium text-lg">
                            {selectedStudyForm.selectedPack === 'essential' ? 'Pack Essentiel' : 
                             selectedStudyForm.selectedPack === 'advanced' ? 'Pack Avancé' : 'Pack Premium'}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {selectedStudyForm.selectedPack === 'essential' ? '1999 DT' : 
                             selectedStudyForm.selectedPack === 'advanced' ? '2999 DT' : '3999 DT'}
                          </p>
                        </div>
                        <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg font-medium">
                          Sélectionné
                        </div>
                      </div>
                    </div>

                    {/* Submission Date */}
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <h4 className="font-semibold text-green-400 mb-3">
                        <FiCalendar aria-hidden="true" /> Date de Soumission
                      </h4>
                      <p className="text-white">
                        {new Date(selectedStudyForm.submissionDate).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400">
                       Sélectionnez une demande pour voir les détails
                    </p>
                  </div>
                )}
              </div>
            </div>
          </ContentCard>
        );
      
      case 'payments':
        return (
          <ContentCard className="content-card">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FiCreditCard aria-hidden="true" /> Gestion des Paiements
            </h2>
            
            {/* Payment Statistics */}
            {paymentStats && (
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2"></div>
                  <div className="text-2xl font-bold text-white">{paymentStats.totalPayments}</div>
                  <div className="text-sm text-gray-400">Total Paiements</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2"></div>
                  <div className="text-2xl font-bold text-green-400">{paymentStats.paidPayments}</div>
                  <div className="text-sm text-gray-400">Payés</div>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2"></div>
                  <div className="text-2xl font-bold text-yellow-400">{paymentStats.pendingPayments}</div>
                  <div className="text-sm text-gray-400">En Attente</div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2"></div>
                  <div className="text-2xl font-bold text-blue-400">{paymentStats.totalRemaining.toFixed(2)} DT</div>
                  <div className="text-sm text-gray-400">Reste à Payer</div>
                </div>
              </div>
            )}

            {/* Create Payment Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowCreatePaymentModal(true)}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-2"
              >
                ➕ Créer un Paiement
              </button>
            </div>

            {/* Payments Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left p-4">Client</th>
                    <th className="text-left p-4">Total</th>
                    <th className="text-left p-4">Payé</th>
                    <th className="text-left p-4">Reste</th>
                    <th className="text-left p-4">Statut</th>
                    <th className="text-left p-4">Date</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">
                            {payment.user?.firstName} {payment.user?.lastName}
                          </p>
                          <p className="text-sm text-gray-400">
                            {payment.user?.email}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-white font-medium">{payment.prixTotal} DT</span>
                      </td>
                      <td className="p-4">
                        <span className="text-green-400 font-medium">{payment.prixPaye} DT</span>
                      </td>
                      <td className="p-4">
                        <span className={`font-medium ${payment.prixReste > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {payment.prixReste} DT
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'PAID' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {payment.status === 'PAID' ? ' Payé' : ' En Attente'}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-sm">
                          {new Date(payment.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(payment.createdAt).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          {payment.status === 'PENDING' && (
                            <button
                              onClick={() => {
                                setSelectedPayment(payment);
                                setShowAddPaymentModal(true);
                              }}
                              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
                              title="Ajouter un paiement"
                            >
                              <FiCreditCard aria-hidden="true" />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedPayment(payment)}
                            className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                            title="Voir les détails"
                          >
                            
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {payments.length === 0 && (
                <div className="text-center py-12">
<p className="text-gray-400 text-lg flex items-center justify-center gap-2">
                  <FiCreditCard aria-hidden="true" /> Aucun paiement trouvé
                </p>
                </div>
              )}
            </div>

            {/* Add Payment Modal */}
            {showAddPaymentModal && selectedPayment && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-96">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FiCreditCard aria-hidden="true" /> Ajouter un Paiement
                  </h3>
                  
                  <div className="mb-4">
                    <p className="text-gray-400 text-sm">
                      Client: {selectedPayment.user?.firstName} {selectedPayment.user?.lastName}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Total: {selectedPayment.prixTotal} DT
                    </p>
                    <p className="text-gray-400 text-sm">
                      Déjà payé: {selectedPayment.prixPaye} DT
                    </p>
                    <p className="text-yellow-400 text-sm font-medium">
                      Reste à payer: {selectedPayment.prixReste} DT
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Montant à ajouter (DT)
                    </label>
                    <input
                      type="number"
                      value={addPaymentAmount}
                      onChange={(e) => setAddPaymentAmount(e.target.value)}
                      placeholder="Entrez le montant..."
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                      min="0"
                      max={selectedPayment.prixReste}
                      step="0.01"
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={handleAddPayment}
                      disabled={!addPaymentAmount || parseFloat(addPaymentAmount) <= 0}
                      className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                      Ajouter
                    </button>
                    <button
                      onClick={() => {
                        setShowAddPaymentModal(false);
                        setAddPaymentAmount('');
                        setSelectedPayment(null);
                      }}
                      className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Details Modal */}
            {selectedPayment && !showAddPaymentModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-96">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FiCreditCard aria-hidden="true" /> Détails du Paiement
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-400">Client:</span>
                      <p className="text-white font-medium">
                        {selectedPayment.user?.firstName} {selectedPayment.user?.lastName}
                      </p>
                      <p className="text-sm text-gray-400">{selectedPayment.user?.email}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-400">Total:</span>
                        <p className="text-white font-medium">{selectedPayment.prixTotal} DT</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Payé:</span>
                        <p className="text-green-400 font-medium">{selectedPayment.prixPaye} DT</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Reste:</span>
                        <p className={`font-medium ${selectedPayment.prixReste > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {selectedPayment.prixReste} DT
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">Statut:</span>
                        <p className={`font-medium ${selectedPayment.status === 'PAID' ? 'text-green-400' : 'text-yellow-400'}`}>
                          {selectedPayment.status === 'PAID' ? 'Payé' : 'En Attente'}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-400">Date de création:</span>
                      <p className="text-white">
                        {new Date(selectedPayment.createdAt).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      onClick={() => setSelectedPayment(null)}
                      className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Create Payment Modal */}
            {showCreatePaymentModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-96">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FiCreditCard aria-hidden="true" /> Créer un Paiement
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Client
                      </label>
                      <select
                        value={newPayment.userId}
                        onChange={(e) => setNewPayment({...newPayment, userId: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                      >
                        <option value="">Sélectionner un client</option>
                        {allUsers.filter(u => u.role === 'USER').map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.firstName} {user.lastName} - {user.email}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Total (DT)
                      </label>
                      <input
                        type="number"
                        value={newPayment.prixTotal}
                        onChange={(e) => setNewPayment({...newPayment, prixTotal: e.target.value})}
                        placeholder="Entrez le montant total..."
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Montant payé (DT)
                      </label>
                      <input
                        type="number"
                        value={newPayment.prixPaye}
                        onChange={(e) => setNewPayment({...newPayment, prixPaye: e.target.value})}
                        placeholder="Entrez le montant payé..."
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Statut
                      </label>
                      <select
                        value={newPayment.status}
                        onChange={(e) => setNewPayment({...newPayment, status: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                      >
                        <option value="PENDING">En Attente</option>
                        <option value="PAID">Payé</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={handleCreatePayment}
                      disabled={!newPayment.userId || !newPayment.prixTotal}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                      Créer
                    </button>
                    <button
                      onClick={() => {
                        setShowCreatePaymentModal(false);
                        setNewPayment({
                          userId: '',
                          prixTotal: '',
                          prixPaye: '0',
                          status: 'PENDING'
                        });
                      }}
                      className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}
          </ContentCard>
        );
      
      case 'dossiers':
        return (
          <ContentCard className="content-card">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FiFolder aria-hidden="true" /> Gestion des Dossiers
            </h2>
            <DossierKanban 
              dossiers={dossiers} 
              onDossierUpdate={(updatedDossier) => {
                setDossiers(dossiers.map(dossier => 
                  dossier.id === updatedDossier.id ? updatedDossier : dossier
                ));
                fetchDossierStats();
              }}
            />
          </ContentCard>
        );
      
      default:
        return null;
    }
  };

  useEffect(() => {
    // Animate sidebar
    gsap.fromTo(sidebarRef.current, {
      x: -100,
      opacity: 0
    }, {
      x: 0,
      opacity: 1,
      duration: 1,
      ease: "power3.out",
      delay: 0.2
    });

    // Animate header
    gsap.fromTo(headerRef.current, {
      y: -50,
      opacity: 0
    }, {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: "power3.out",
      delay: 0.4
    });

    // Animate content cards
    gsap.fromTo('.content-card', {
      y: 30,
      opacity: 0
    }, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.2,
      delay: 0.6
    });

    // Animate messaging interface
    if (activeMenu === 'messagerie') {
      // Animate user list
      gsap.fromTo('.user-item', {
        x: -30,
        opacity: 0,
        scale: 0.8
      }, {
        x: 0,
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: "back.out(1.7)",
        stagger: 0.1,
        delay: 1.0
      });

      // Animate message container
      gsap.fromTo('#admin-messages-container', {
        y: 30,
        opacity: 0,
        scale: 0.9
      }, {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: "back.out(1.7)",
        delay: 1.2
      });

      // Animate message items
      gsap.fromTo('.admin-message-item', {
        y: 20,
        opacity: 0,
        scale: 0.8
      }, {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: "back.out(1.7)",
        stagger: 0.1,
        delay: 1.4
      });
    }
  }, [activeMenu]);

  return (
    <DashboardContainer>
      {/* Mobile Overlay */}
      <MobileOverlay $isOpen={sidebarOpen} onClick={toggleMobileSidebar} />
      
      {/* Sidebar */}
      <Sidebar ref={sidebarRef} className="sidebar">
        {/* Mobile Controls */}
        <SidebarControls>
          <SidebarButton onClick={() => setSidebarOpen(false)}>
            <FiX aria-hidden="true" /> Hide
          </SidebarButton>
          <SidebarButton onClick={() => setSidebarOpen(true)}>
            <FiMenu aria-hidden="true" /> Show
          </SidebarButton>
        </SidebarControls>
        
        <div className="px-4 mb-8">
          <h3 className="text-white font-bold text-lg mb-2">
            Via Italia Admin
          </h3>
          <p className="text-gray-400 text-sm">
            Panneau d'administration
          </p>
        </div>
        
        {menuItems.map((item) => (
          <SidebarItem
            key={item.id}
            className={activeMenu === item.id ? 'active' : ''}
            onClick={() => handleMobileMenuClick(item.id)}
          >
            <item.icon className="icon" aria-hidden="true" focusable="false" />
            <span className="text">{item.text}</span>
          </SidebarItem>
        ))}
      </Sidebar>

      <MainContent>
        <Header ref={headerRef}>
          <HeaderLeft>
            {/* Hamburger Menu - Mobile Only */}
            <HamburgerButton onClick={toggleMobileSidebar} aria-label="Ouvrir le menu">
              <FiMenu aria-hidden="true" />
            </HamburgerButton>
            <h1 className="text-2xl font-bold text-white">
              {activeMenu === 'receipts' ? 'Receipts' : 'Tableau de Bord Administrateur'}
            </h1>
          </HeaderLeft>
          
          <HeaderRight>
            <ThemeToggle
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
              title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            >
              {theme === 'dark' ? <FiSun aria-hidden="true" /> : <FiMoon aria-hidden="true" />}
              <span>{theme === 'dark' ? 'Mode clair' : 'Mode sombre'}</span>
            </ThemeToggle>
            <LogoutButton onClick={handleLogout}>
              Déconnexion
            </LogoutButton>
          </HeaderRight>
        </Header>

        <ContentArea ref={contentRef}>
          {renderContent()}
        </ContentArea>
      </MainContent>
      
      {/* Side navigation - Mobile Only */}
      <MobileSideToggle onClick={toggleMobileSidebar} aria-label={sidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}>
        {sidebarOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
      </MobileSideToggle>
      <BottomNav $isOpen={sidebarOpen}>
        {menuItems.map((item) => (
          <BottomNavItem
            key={item.id}
            className={activeMenu === item.id ? "active" : ""}
            onClick={() => handleMobileMenuClick(item.id)}
          >
            <item.icon className="icon" aria-hidden="true" focusable="false" />
            <span>{item.text}</span>
          </BottomNavItem>
        ))}
      </BottomNav>
    </DashboardContainer>
  );
};

export default AdminDashboard;

