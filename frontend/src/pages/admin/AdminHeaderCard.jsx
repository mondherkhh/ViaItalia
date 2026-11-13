import React from "react";
import styled from "styled-components";
import { FiSearch, FiSun, FiMoon, FiBell, FiMenu, FiX, FiUserPlus } from "react-icons/fi";

const HeaderPanel = styled.div`
  position: relative;
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  background: var(--adm-panel);
  border: 1px solid var(--adm-border);
  border-radius: 20px;
  padding: .85rem 1.25rem;
  box-shadow: 0 8px 30px rgba(0,0,0,0.05);
  margin-bottom: 1.25rem;
<<<<<<< HEAD
  flex-wrap: nowrap;
  min-width: 0;

  /* TELEPHONE : une seule ligne, comme l'image 2 */
  @media (max-width: 700px) {
    flex-wrap: nowrap; flex-direction: row; align-items: center; gap: .5rem;
    padding: .6rem .7rem; border-radius: 18px; margin-bottom: 1rem;
=======
  flex-wrap: wrap;
  min-width: 0;
  @media (max-width: 700px) {
    flex-direction: column; align-items: stretch; gap: .7rem;
    padding: .75rem; border-radius: 16px; margin-bottom: 1rem;
>>>>>>> 2504b50754501d134c6cb9e2cf8b05e4be794ff6
  }
`;

const Left = styled.div`
<<<<<<< HEAD
  display: flex; align-items: center; gap: 1rem; min-width: 0; flex: 1 1 auto;
  @media (max-width: 700px) { gap: .65rem; }
=======
  display: flex; align-items: center; gap: 1rem; min-width: 0;
  @media (max-width: 700px) { gap: .7rem; }
>>>>>>> 2504b50754501d134c6cb9e2cf8b05e4be794ff6
`;
const TitleArea = styled.div` min-width: 0; flex: 1; `;
const Title = styled.h1`
  font-size: clamp(1rem, 4.6vw, 1.25rem); font-weight: 800; color: var(--adm-text);
  margin: 0; line-height: 1.2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
`;
const Subtitle = styled.div`
  font-size: .78rem; color: var(--adm-muted); margin-top: .15rem;
<<<<<<< HEAD
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  @media (max-width: 700px) { font-size: .72rem; }
`;

/* Bloc de droite : toujours sur UNE ligne, collé à droite */
const Right = styled.div`
  display: flex; align-items: center; justify-content: flex-end; gap: .75rem;
  flex-wrap: nowrap; flex: 0 1 auto; min-width: 0; margin-left: auto;
  @media (max-width: 700px) { flex-shrink: 0; gap: .4rem; width: auto; }
`;

/* Recherche : masquée sur téléphone, peut se réduire si la place manque */
const SearchBox = styled.div`
  position: relative; flex: 0 1 260px; width: 260px; min-width: 120px;
  @media (max-width: 700px) { display: none; }
=======
  @media (max-width: 700px) {
    font-size: .72rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
`;

const Right = styled.div`
  display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; min-width: 0;
  @media (max-width: 700px) { flex-wrap: nowrap; gap: .45rem; width: 100%; }
`;
const SearchBox = styled.div`
  position: relative; flex: 0 1 260px; min-width: 0;
  @media (max-width: 700px) { flex: 1 1 0; }
>>>>>>> 2504b50754501d134c6cb9e2cf8b05e4be794ff6
`;
const SearchInput = styled.input`
  width: 100%; padding: .45rem .8rem .45rem 2.2rem; border-radius: 999px;
  border: 1px solid var(--adm-border); background: var(--adm-surface); color: var(--adm-text);
  font-size: .82rem; outline: none; transition: all .2s ease; height: 38px;
  &:focus { border-color: var(--adm-accent); box-shadow: 0 0 0 3px var(--adm-accent-soft); }
`;
const SearchIcon = styled.span` position: absolute; left: .75rem; top: 50%; transform: translateY(-50%); color: var(--adm-muted); pointer-events: none; `;

const IconBtn = styled.button`
  width: 38px; height: 38px; flex-shrink: 0; border-radius: 10px;
  border: 1px solid var(--adm-border); background: var(--adm-surface); color: var(--adm-text);
  display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .2s ease;
  &:hover { background: var(--adm-accent-soft); color: var(--adm-accent); border-color: var(--adm-accent-soft); }
<<<<<<< HEAD
  @media (max-width: 380px) { width: 34px; height: 34px; border-radius: 9px; }
`;

/* Bouton menu : ☰ quand fermé, ✕ quand ouvert (état lu sur <body>, posé par la barre latérale) */
const MenuBtn = styled(IconBtn)`
  .ic-close { display: none; }
  &[aria-expanded="true"] .ic-menu,
  body[data-adm-sidebar-open="1"] & .ic-menu { display: none; }
  &[aria-expanded="true"] .ic-close,
  body[data-adm-sidebar-open="1"] & .ic-close { display: block; }

  @media (max-width: 700px) {
    width: 46px; height: 46px; border-radius: 14px;
    background: var(--adm-panel); box-shadow: 0 2px 8px rgba(0,0,0,.08);
  }
=======
>>>>>>> 2504b50754501d134c6cb9e2cf8b05e4be794ff6
`;

const InviteBtn = styled.button`
  background: #0B7A3E; color: #fff; font-weight: 700; font-size: 13px;
  padding: 0 16px; height: 38px; flex-shrink: 0; border-radius: 12px;
  border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(11,122,62,.3);
  transition: all .2s ease; white-space: nowrap;
  display: inline-flex; align-items: center; justify-content: center; gap: .4rem;
  &:hover:not(:disabled) { background: #095f30; }
  &:disabled { opacity: .55; cursor: not-allowed; }
<<<<<<< HEAD
  @media (max-width: 700px) { padding: 0; width: 38px; border-radius: 10px; }
  @media (max-width: 380px) { width: 34px; height: 34px; }
=======
  @media (max-width: 700px) { padding: 0; width: 38px; }
>>>>>>> 2504b50754501d134c6cb9e2cf8b05e4be794ff6
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

export default function AdminHeaderCard({ activeMenu, theme, toggleTheme, sidebarOpen, onToggleSidebar, notifications = 0, onInvite = () => {} }) {
  return (
    <HeaderPanel data-adm-header>
      <Left>
        <MenuBtn
          onClick={onToggleSidebar}
          aria-label="Menu"
          aria-expanded={sidebarOpen ? "true" : "false"}
        >
          <FiMenu className="ic-menu" size={22} />
          <FiX className="ic-close" size={24} />
        </MenuBtn>
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