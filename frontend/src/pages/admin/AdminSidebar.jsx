import React from "react";
import styled from "styled-components";
import { FiLayout, FiUsers, FiMessageSquare, FiBell, FiCreditCard, FiArchive, FiBookOpen, FiStar, FiCalendar, FiSettings, FiSearch } from "react-icons/fi";

const Panel = styled.div`
  width: 250px; margin: 1.25rem; background: #FAFBF8; border: 1px solid #E2E8E2;
  border-radius: 24px; padding: 1.25rem .75rem; box-shadow: 0 12px 40px rgba(20,40,30,.08), 0 2px 8px rgba(20,40,30,.04);
  color: #12201A; flex-shrink: 0; display: flex; flex-direction: column; gap: .25rem;
  body[data-theme="dark"] & { background: #111915; border-color: rgba(255,255,255,.08); box-shadow: 0 12px 40px rgba(0,0,0,.35); color: #E8F1EB; }
  @media (max-width: 768px) { width: 80vw; max-width: 300px; margin: 1rem; position: fixed; top: 0; left: 0; bottom: 0; z-index: 1000; border-radius: 0 24px 24px 0; transform: translateX(-100%); transition: transform .25s ease; &.open { transform: translateX(0); } }
`;

const Brand = styled.div` padding: 0 .75rem 1rem; border-bottom: 1px solid #E2E8E2; margin-bottom: .75rem; `;
const BrandTitle = styled.div` font-weight: 900; font-size: 1.15rem; letter-spacing: -.02em; color: #12201A; body[data-theme="dark"] & { color: #E8F1EB; } `;
const BrandSub = styled.div` font-size: .65rem; text-transform: uppercase; letter-spacing: .18em; color: #7A8780; margin-top: .25rem; `;

const GroupTitle = styled.div` font-size: .6rem; text-transform: uppercase; letter-spacing: .16em; color: #7A8780; padding: .5rem .75rem .25rem; font-weight: 600; `;

const Item = styled.button`
  width: 100%; text-align: left; display: flex; align-items: center; gap: .6rem; padding: .65rem .75rem; border-radius: 10px; border: none; background: transparent; color: #6B7B71; cursor: pointer; font-size: .85rem; font-weight: 500; transition: all .15s ease;
  &:hover { background: #F0F2EE; color: #12201A; }
  &.active { background: #E3F2E9; color: #047857; font-weight: 600; }
  .icon { font-size: 1.05rem; width: 1.05rem; height: 1.05rem; flex-shrink: 0; }
  .badge { margin-left: auto; font-size: .7rem; font-weight: 700; background: #F3F4F6; color: #6B7B71; border-radius: 999px; padding: .15rem .45rem; }
  .badge-red { background: #FBE9EB; color: #D12B3A; }
`;

const ProfileCard = styled.div` margin-top: auto; padding: .75rem; border-top: 1px solid #E2E8E2; display: flex; align-items: center; gap: .6rem; `;
const Avatar = styled.div` width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #047857, #0B7A43); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: .85rem; flex-shrink: 0; position: relative; &:after { content: ''; position: absolute; bottom: 2px; right: 2px; width: 10px; height: 10px; border-radius: 50%; background: #3DDC84; border: 2px solid #FAFBF8; } `;
const ProfileInfo = styled.div` min-width: 0; flex: 1; `;
const ProfileName = styled.div` font-weight: 700; font-size: .82rem; color: #12201A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; `;
const ProfileEmail = styled.div` font-size: .7rem; color: #7A8780; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; `;
const Version = styled.div` font-size: .6rem; color: #7A8780; padding: 0 .75rem .5rem; text-align: center; `;

export default function AdminSidebar({ activeMenu, onSelect, user, onLogout, open, counts }) {
  const allowed = (user?.allowedSections || []);
  const isAgent = user?.isAgent === true || user?.role === "AGENT";
  const sidebarToSection = {
    dashboard: "dashboard", dossiers: "students", messagerie: "messages", anonces: "alerts",
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
      { id: "dashboard", icon: FiLayout, label: "Dashboard", badge: null, active: true },
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
      { id: "calendar", icon: FiCalendar, label: "Calendar", badge: (counts?.calendarOverdue ? counts.calendarOverdue : 0) > 0 ? counts.calendarOverdue : null, disabled: false, soon: false },
      { id: "settings", icon: FiSettings, label: "Settings", badge: null, disabled: false, soon: false },
    ]},
  ];

  return (
    <Panel className={open ? "open" : ""}>
      <Brand>
        <BrandTitle>Via Italia</BrandTitle>
        <BrandSub>AGENCY CONSOLE</BrandSub>
      </Brand>
      {groups.map(g => {
        const visibleItems = g.items.filter(it => visible(it.id));
        if (visibleItems.length === 0) return null;
        return (<React.Fragment key={g.title}>
          <GroupTitle>{g.title}</GroupTitle>
          {visibleItems.map(it => (
            <Item
              key={it.id}
              className={activeMenu === it.id ? "active" : ""}
              onClick={() => !it.disabled && onSelect(it.id)}
              style={it.disabled ? { opacity: 0.55, pointerEvents: "none" } : {}}
            >
              <it.icon className="icon" />
              <span>{it.label}</span>
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
          <ProfileName>{user?.firstName} {user?.lastName}{isAgent ? <span style={{fontSize:"0.65rem",color:"#047857",marginLeft:4,fontWeight:600}}>Agent</span> : null}</ProfileName>
          <ProfileEmail>{user?.email}</ProfileEmail>
        </ProfileInfo>
        <button onClick={onLogout} style={{ background: "none", border: "none", color: "#7A8780", cursor: "pointer", fontSize: ".8rem", textDecoration: "underline", whiteSpace: "nowrap", flexShrink: 0 }} aria-label="Déconnexion">Déconnexion</button>
      </ProfileCard>
    </Panel>
  );
}
