import React from "react";
import styled from "styled-components";
import { FiSearch, FiSun, FiMoon, FiBell, FiMenu, FiUserPlus } from "react-icons/fi";

const HeaderPanel = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  background: var(--adm-panel);
  border: 1px solid var(--adm-border);
  border-radius: 20px;
  padding: .85rem 1.25rem;
  box-shadow: 0 8px 30px rgba(0,0,0,0.05);
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
`;

const Left = styled.div` display: flex; align-items: center; gap: 1rem; `;
const TitleArea = styled.div` `;
const Title = styled.h1` font-size: 1.25rem; font-weight: 800; color: var(--adm-text); margin: 0; line-height: 1.2; `;
const Subtitle = styled.div` font-size: .78rem; color: var(--adm-muted); margin-top: .15rem; `;

const Right = styled.div` display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; `;
const SearchBox = styled.div` position: relative; `;
const SearchInput = styled.input` width: 260px; padding: .45rem .8rem .45rem 2.2rem; border-radius: 999px; border: 1px solid var(--adm-border); background: var(--adm-surface); color: var(--adm-text); font-size: .82rem; outline: none; transition: all .2s ease; &:focus { border-color: var(--adm-accent); box-shadow: 0 0 0 3px var(--adm-accent-soft); } `;
const SearchIcon = styled.span` position: absolute; left: .75rem; top: 50%; transform: translateY(-50%); color: var(--adm-muted); pointer-events: none; `;

const IconBtn = styled.button` width: 38px; height: 38px; border-radius: 10px; border: 1px solid var(--adm-border); background: var(--adm-surface); color: var(--adm-text); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .2s ease; &:hover { background: var(--adm-accent-soft); color: var(--adm-accent); border-color: var(--adm-accent-soft); } `;

const InviteBtn = styled.button`
  background: #0B7A3E; color: #fff; font-weight: 700; font-size: 13px;
  padding: 0 16px; height: 38px; border-radius: 12px;
  border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(11,122,62,.3);
  transition: all .2s ease; white-space: nowrap;
  display: inline-flex; align-items: center; justify-content: center; gap: .4rem;
  &:hover:not(:disabled) { background: #095f30; }
  &:disabled { opacity: .55; cursor: not-allowed; }
  @media (max-width: 700px) { padding: 0 11px; width: 38px; }
`;

const InviteLabel = styled.span`
  @media (max-width: 700px) { display: none; }
`;

const subtitles = {
    dashboard: "Tableau de Bord Administrateur",
    messagerie: "Every conversation with your students, in one place.",
    annonces: "What changed while you were away, and what needs you now.",
    users: "Gérer les utilisateurs du système",
    appointments: "Planifier et suivre les rendez-vous",
    contracts: "Contrats et accords",
    dossiers: "Suivi des dossiers étudiants",
    studyForms: "Formulaires d'étude",
    payments: "Fees, payments and outstanding balances.",
    calendar: "Your agency's events and deadlines. Students never see this.",
    receipts: "Reçus et factures",
    "university-programs": "Programmes universitaires",
    reviews: "Avis et retours clients",
    settings: "Agency profile, team and services.",
  };

export default function AdminHeaderCard({ activeMenu, theme, toggleTheme, sidebarOpen, onToggleSidebar, notifications = 0, onInvite = () => {} }) {
  const titles = {
    dashboard: "Tableau de Bord",
    messagerie: "Messages",
    annonces: "Alerts",
    users: "Utilisateurs",
    appointments: "Rendez-vous",
    contracts: "Contrats",
    dossiers: "Dossiers",
    studyForms: "Formulaires d'étude",
    payments: "Payments",
    calendar: "Calendar",
    receipts: "Invoices",
    "university-programs": "University Programs",
    reviews: "Avis clients",
    settings: "Settings",
  };
  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  return (
    <HeaderPanel>
      <Left>
        <IconBtn onClick={onToggleSidebar} aria-label="Menu">
          <FiMenu />
        </IconBtn>
        <TitleArea>
          <Title>{titles[activeMenu] || "Tableau de Bord Administrateur"}</Title>
          <Subtitle>{subtitles[activeMenu] || "Tableau de Bord Administrateur"}</Subtitle>
        </TitleArea>
      </Left>
      <Right>
        <SearchBox>
          <SearchIcon><FiSearch size={16} /></SearchIcon>
          <SearchInput placeholder="Rechercher..." disabled />
        </SearchBox>
        <IconBtn onClick={toggleTheme} aria-label="Thème">
          {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
        </IconBtn>
        <IconBtn aria-label="Notifications" style={{ position: "relative" }}>
          <FiBell size={18} />
          {notifications > 0 && (
            <span style={{ position: "absolute", top: 4, right: 4, width: 10, height: 10, borderRadius: "50%", background: "#C62F3A", border: "2px solid var(--adm-panel)", display: "block" }} />
          )}
        </IconBtn>
        <InviteBtn onClick={onInvite} aria-label="Invite student" title="Invite student">
          <FiUserPlus size={16} />
          <InviteLabel>Invite student</InviteLabel>
        </InviteBtn>
      </Right>
    </HeaderPanel>
  );
}
