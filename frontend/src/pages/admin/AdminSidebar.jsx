import React, { useState, useLayoutEffect, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { FiLayout, FiUsers, FiMessageSquare, FiBell, FiCreditCard, FiArchive, FiBookOpen, FiStar, FiCalendar, FiSettings, FiLogOut } from "react-icons/fi";

const Panel = styled.div`
  width: 250px; margin: 1.25rem; background: #FAFBF8; border: 1px solid #E2E8E2;
  border-radius: 24px; padding: 1.25rem .75rem; box-shadow: 0 12px 40px rgba(20,40,30,.08), 0 2px 8px rgba(20,40,30,.04);
  color: #12201A; flex-shrink: 0; display: flex; flex-direction: column; gap: .25rem;
  body[data-theme="dark"] & { background: #111915; border-color: rgba(255,255,255,.08); box-shadow: 0 12px 40px rgba(0,0,0,.35); color: #E8F1EB; }

  /* ===== TELEPHONE : carte FIXE à l'écran, sous l'en-tête ===== */
  @media (max-width: 768px) {
    position: fixed;
    top: var(--adm-top, 72px); left: 8px; right: auto; bottom: auto; margin: 0;
    width: min(78vw, 290px);
    max-height: calc(100dvh - var(--adm-top, 72px) - 16px);
    overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
    background: #fff; border: 1px solid #E2E8E2;
    border-radius: 22px; padding: .5rem; gap: .15rem;
    box-shadow: 0 18px 50px rgba(10,20,15,.22);
    z-index: 1000;
    opacity: 0; visibility: hidden; pointer-events: none;
    transform: translateY(-8px) scale(.98); transform-origin: top left;
    transition: opacity .18s ease, transform .18s ease, visibility .18s;
    &.open { opacity: 1; visibility: visible; pointer-events: auto; transform: none; }
    body[data-theme="dark"] & { background: #111915; }
  }
`;

const Backdrop = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: block; position: fixed;
    top: var(--adm-top, 72px); left: 0; right: 0; bottom: 0; z-index: 999;
    background: rgba(10, 20, 15, .3);
    opacity: 0; visibility: hidden; transition: opacity .18s ease, visibility .18s;
    &.open { opacity: 1; visibility: visible; }
  }
`;

const Brand = styled.div`
  padding: 0 .75rem 1rem; border-bottom: 1px solid #E2E8E2; margin-bottom: .75rem;
  @media (max-width: 768px) { display: none; }
`;
const BrandTitle = styled.div` font-weight: 900; font-size: 1.15rem; letter-spacing: -.02em; color: #12201A; body[data-theme="dark"] & { color: #E8F1EB; } `;
const BrandSub = styled.div` font-size: .65rem; text-transform: uppercase; letter-spacing: .18em; color: #7A8780; margin-top: .25rem; `;

const GroupTitle = styled.div`
  font-size: .6rem; text-transform: uppercase; letter-spacing: .16em; color: #7A8780; padding: .5rem .75rem .25rem; font-weight: 600;
  @media (max-width: 768px) { display: none; }
`;

const Item = styled.button`
  width: 100%; text-align: left; display: flex; align-items: center; gap: .6rem; padding: .65rem .75rem; border-radius: 10px; border: none; background: transparent; color: #6B7B71; cursor: pointer; font-size: .85rem; font-weight: 500; transition: all .15s ease;
  &:hover { background: #F0F2EE; color: #12201A; }
  &.active { background: #E3F2E9; color: #047857; font-weight: 600; }
  .icon { font-size: 1.05rem; width: 1.05rem; height: 1.05rem; flex-shrink: 0; }
  .label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .badge { margin-left: auto; font-size: .7rem; font-weight: 700; background: #F3F4F6; color: #6B7B71; border-radius: 999px; padding: .15rem .45rem; flex-shrink: 0; }
  .badge-red { background: #FBE9EB; color: #D12B3A; }
  body[data-theme="dark"] &:hover { background: rgba(255,255,255,.06); color: #E8F1EB; }
  body[data-theme="dark"] &.active { background: rgba(74,222,128,.14); color: #4ADE80; }

  @media (max-width: 768px) {
    min-height: 44px; padding: .6rem .75rem; gap: .9rem; font-size: .88rem; border-radius: 12px;
    color: #12201A; font-weight: 500;
    .icon { font-size: 1.2rem; width: 1.2rem; height: 1.2rem; }
    .badge { font-size: .65rem; padding: .1rem .4rem; }
    &.active { background: #E0F0E8; color: #12201A; font-weight: 600; }
    body[data-theme="dark"] & { color: #E8F1EB; }
    body[data-theme="dark"] &.active { color: #4ADE80; }
  }
`;

const ProfileCard = styled.div`
  margin-top: auto; padding: .75rem; border-top: 1px solid #E2E8E2; display: flex; align-items: center; gap: .6rem;
  @media (max-width: 768px) { margin-top: .1rem; padding: .2rem 0 0; border-top: none; }
`;
const Avatar = styled.div`
  width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #047857, #0B7A43); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: .85rem; flex-shrink: 0; position: relative;
  &:after { content: ''; position: absolute; bottom: 2px; right: 2px; width: 10px; height: 10px; border-radius: 50%; background: #3DDC84; border: 2px solid #FAFBF8; }
  @media (max-width: 768px) { display: none; }
`;
const ProfileInfo = styled.div`
  min-width: 0; flex: 1;
  @media (max-width: 768px) { display: none; }
`;
const ProfileName = styled.div` font-weight: 700; font-size: .82rem; color: #12201A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; body[data-theme="dark"] & { color: #E8F1EB; } `;
const ProfileEmail = styled.div` font-size: .7rem; color: #7A8780; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; `;
const LogoutBtn = styled.button`
  background: none; border: none; color: #7A8780; cursor: pointer; font-size: .8rem; text-decoration: underline; white-space: nowrap; flex-shrink: 0; padding: .4rem;
  display: inline-flex; align-items: center; gap: .5rem;
  .lo-icon { display: none; }
  @media (max-width: 768px) {
    width: 100%; min-height: 44px; text-decoration: none; font-size: .88rem; font-weight: 500; color: #C62828;
    padding: .6rem .75rem; gap: .9rem; border-radius: 12px; text-align: left;
    .lo-icon { display: block; width: 1.2rem; height: 1.2rem; flex-shrink: 0; }
    &:hover { background: #FBE9EB; }
  }
`;
const Version = styled.div`
  font-size: .6rem; color: #7A8780; padding: 0 .75rem .5rem; text-align: center;
  @media (max-width: 768px) { display: none; }
`;

const MOBILE_QUERY = "(max-width: 768px)";

export default function AdminSidebar({ activeMenu, onSelect, user, onLogout, open, onClose = () => {}, counts }) {
  const panelRef = useRef(null);
  const [menuTop, setMenuTop] = useState(72);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.matchMedia ? window.matchMedia(MOBILE_QUERY).matches : false
  );

  /* Prévient l'en-tête que le menu est ouvert (pour afficher la croix ✕) */
  useEffect(() => {
    document.body.setAttribute("data-adm-sidebar-open", open ? "1" : "0");
    return () => document.body.removeAttribute("data-adm-sidebar-open");
  }, [open]);

  /* Détecte téléphone / ordinateur */
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia(MOBILE_QUERY);
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  /* Mesure le bas de l'en-tête pour placer le menu juste en dessous */
  useLayoutEffect(() => {
    if (!isMobile || !open) return;
    const h = document.querySelector("[data-adm-header]");
    if (h) setMenuTop(Math.max(0, Math.round(h.getBoundingClientRect().bottom)) + 8);
  }, [isMobile, open]);

  /* Ferme le menu quand on touche en dehors (page, fond sombre…) */
  useEffect(() => {
    if (!isMobile || !open) return;
    const onOutside = (e) => {
      if (panelRef.current && panelRef.current.contains(e.target)) return; // dans le menu : on ignore
      if (e.target.closest && e.target.closest("[data-adm-header]")) return; // l'en-tête (bouton ☰/✕) gère lui-même
      onClose();
    };
    document.addEventListener("pointerdown", onOutside, true);
    return () => document.removeEventListener("pointerdown", onOutside, true);
  }, [isMobile, open, onClose]);

  const allowed = (user?.allowedSections || []);
  const isAgent = user?.isAgent === true || user?.role === "AGENT";
  const sidebarToSection = {
    dashboard: "dashboard", dossiers: "students", messagerie: "messages",
    annonces: "alerts", anonces: "alerts",
    users: "users", payments: "payments", receipts: "invoices", "university-programs": "programs",
    universityPrograms: "programs", reviews: "reviews", calendar: "calendar", settings: "settings"
  };
  const visible = (id) => {
    if (!isAgent) return true;
    const sec = sidebarToSection[id] || id;
    if (sec === "settings") return false;
    return allowed.includes(sec);
  };
  const groups = [
    { title: "WORKSPACE", items: [
      { id: "dashboard", icon: FiLayout, label: "Dashboard", badge: null },
      { id: "dossiers", icon: FiUsers, label: "Students", badge: null },
      { id: "messagerie", icon: FiMessageSquare, label: "Messages", badge: counts?.messagerie ?? 3, badgeRed: true },
      { id: "annonces", icon: FiBell, label: "Alerts", badge: counts?.annonces ?? 1, badgeRed: true },
      { id: "users", icon: FiUsers, label: "Utilisateurs", badge: null },
    ]},
    { title: "FINANCE", items: [
      { id: "payments", icon: FiCreditCard, label: "Payments", badge: null },
      { id: "receipts", icon: FiArchive, label: "Invoices", badge: null },
    ]},
    { title: "CONTENT", items: [
      { id: "university-programs", icon: FiBookOpen, label: "University Programs", badge: null },
      { id: "reviews", icon: FiStar, label: "Avis clients", badge: null },
    ]},
    { title: "INTERNAL", items: [
      { id: "calendar", icon: FiCalendar, label: "Calendar", badge: (counts?.calendarOverdue ? counts.calendarOverdue : 0) > 0 ? counts.calendarOverdue : null, disabled: false },
      { id: "settings", icon: FiSettings, label: "Settings", badge: null, disabled: false },
    ]},
  ];

  const content = (
    <>
      <Backdrop
        className={open ? "open" : ""}
        style={{ "--adm-top": `${menuTop - 8}px` }}
        onClick={onClose}
        aria-hidden="true"
      />
      <Panel
        ref={panelRef}
        className={open ? "open" : ""}
        style={{ "--adm-top": `${menuTop}px` }}
        role="navigation"
        aria-label="Menu principal"
      >
        <Brand>
          <BrandTitle>Via Italia</BrandTitle>
          <BrandSub>AGENCY CONSOLE</BrandSub>
        </Brand>
        {groups.map((g) => {
          const visibleItems = g.items.filter((it) => visible(it.id));
          if (visibleItems.length === 0) return null;
          return (
            <React.Fragment key={g.title}>
              <GroupTitle>{g.title}</GroupTitle>
              {visibleItems.map((it) => (
                <Item
                  key={it.id}
                  className={activeMenu === it.id ? "active" : ""}
                  onClick={() => { if (!it.disabled) { onSelect(it.id); onClose(); } }}
                  style={it.disabled ? { opacity: 0.55, pointerEvents: "none" } : {}}
                >
                  <it.icon className="icon" />
                  <span className="label">{it.label}</span>
                  {it.badge ? (
                    <span className={`badge ${it.badgeRed ? "badge-red" : ""}`}>{it.badge}</span>
                  ) : null}
                </Item>
              ))}
            </React.Fragment>
          );
        })}
        <Version>v2.4.0</Version>
        <ProfileCard>
          <Avatar>{user?.firstName?.[0] || "A"}{user?.lastName?.[0] || "D"}</Avatar>
          <ProfileInfo>
            <ProfileName>{user?.firstName} {user?.lastName}{isAgent ? <span style={{ fontSize: "0.65rem", color: "#047857", marginLeft: 4, fontWeight: 600 }}>Agent</span> : null}</ProfileName>
            <ProfileEmail>{user?.email}</ProfileEmail>
          </ProfileInfo>
          <LogoutBtn onClick={onLogout} aria-label="Déconnexion">
            <FiLogOut className="lo-icon" />
            Déconnexion
          </LogoutBtn>
        </ProfileCard>
      </Panel>
    </>
  );

  /* Téléphone : le menu est rendu dans <body> en position fixe.
     Ordinateur : reste dans la mise en page normale. */
  if (isMobile) {
    return createPortal(content, document.body);
  }
  return content;
}