import React from 'react';
import {
  FiHome,
  FiCalendar,
  FiMessageSquare,
  FiBell,
  FiUser,
  FiBook,
  FiFileText,
  FiFolder,
  FiCreditCard,
  FiFile,
  FiStar
} from 'react-icons/fi';

export const CLIENT_MENU = [
  { id: 'dashboard',  icon: <FiHome />,        text: 'Tableau de bord', group: 'espace' },
  { id: 'dossier',    icon: <FiFolder />,      text: 'Mon dossier',    group: 'espace' },
  { id: 'messagerie', icon: <FiMessageSquare />, text: 'Messagerie',   group: 'espace' },
  { id: 'notifications', icon: <FiBell />, text: 'Notifications', group: 'espace', badgeRed: true },
  { id: 'paiement',   icon: <FiCreditCard />,  text: 'Paiements',      group: 'finance' },
  { id: 'recus',      icon: <FiFile />,        text: 'Mes reçus',    group: 'finance' },
  { id: 'university', icon: <FiBook />,        text: 'Programmes', group: 'contenu' },
  { id: 'reviews',    icon: <FiStar />,        text: 'Donner mon avis', group: 'contenu' },
  { id: 'rendezvous', icon: <FiCalendar />,    text: 'Rendez-vous',    group: 'compte' },
  { id: 'profile',    icon: <FiUser />,        text: 'Profil',         group: 'compte' }
];

export const MENU_GROUPS = [
  { id: 'espace', title: 'ESPACE' },
  { id: 'finance', title: 'FINANCE' },
  { id: 'contenu', title: 'CONTENU' },
  { id: 'compte', title: 'COMPTE' }
];

export const isMenuItemVisible = item => item.visible !== false;
export const getMobileMenuItems = () => CLIENT_MENU.filter(isMenuItemVisible);
export const getDesktopMenuGroups = () =>
  MENU_GROUPS.map(group => ({
    ...group,
    items: CLIENT_MENU.filter(item => item.group === group.id && isMenuItemVisible(item))
  })).filter(group => group.items.length > 0);

export default CLIENT_MENU;
