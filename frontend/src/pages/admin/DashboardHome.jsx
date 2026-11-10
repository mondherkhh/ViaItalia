import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { getOffices } from "../../api/officeService";
import styled from "styled-components";
import { FiUsers, FiFolder, FiCreditCard, FiCalendar, FiMessageSquare, FiMenu, FiSearch, FiBell, FiMoon, FiSun, FiAlertCircle, FiChevronDown, FiHome } from "react-icons/fi";

/* Spec redesign — content only (AdminDashboard.jsx keeps shell/sidebar/header) */
const G = {
  bg: "var(--adm-bg)",
  card: "var(--adm-panel)",
  border: "var(--adm-border)",
  text: "var(--adm-text)",
  muted: "var(--adm-muted)",
  green: "var(--adm-accent)",
  greenDark: "#052E1A",
  blue: "var(--adm-chip-blue-text)",
  purple: "var(--adm-purple)",
  orange: "#EA580C",
  red: "var(--adm-danger)",
};

/* ─── Banner hero ─── */
const Hero = styled.div`
  border-radius: 24px; padding: 2.2rem 2.2rem; color: #fff; position: relative; overflow: hidden;
  background: linear-gradient(135deg, #052E1A 0%, #0B7A43 60%, var(--adm-accent) 100%);
  box-shadow: 0 12px 40px rgba(5,46,26,.35); margin-bottom: 1.25rem;
  &:before { content: ""; position: absolute; top: -15%; right: -10%; width: 320px; height: 320px; border-radius: 50%; background: rgba(255,255,255,.08); filter: blur(40px); pointer-events: none; }
  &:after { content: ""; position: absolute; bottom: -30%; left: -5%; width: 260px; height: 260px; border-radius: 50%; background: rgba(255,255,255,.06); filter: blur(30px); pointer-events: none; }
`;
const HeroLeft = styled.div`
  position: relative; z-index: 1; display: flex; align-items: center; gap: 1rem; min-width: 0;
  @media (max-width: 640px) {
    align-items: flex-start;
  }
`;
const IconSquare = styled.div` width: 56px; height: 56px; border-radius: 14px; background: rgba(255,255,255,.12); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,.15); `;
const HeroTitle = styled.h2` font-size: 1.6rem; font-weight: 900; margin: 0; letter-spacing: -.03em; `;
const HeroSub = styled.p` font-size: .92rem; opacity: .8; margin: .35rem 0 0 0; `;
const HeroActions = styled.div`
  position: relative; z-index: 1; margin-left: auto; display: flex; align-items: center; gap: .75rem;
  @media (max-width: 640px) {
    width: 100%; margin-left: 0; justify-content: space-between;
  }
`;

/* ─── 4 KPI cards ─── */
const StatsRow = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1.25rem;
  @media (max-width: 520px) {
    grid-template-columns: 1fr;
    gap: .75rem;
  }
`;
const StatCard = styled.div`
  background: ${G.card}; border: 1px solid ${G.border}; border-radius: 20px; padding: 1.1rem 1.2rem;
  box-shadow: 0 4px 18px rgba(20,30,20,.06); display: flex; flex-direction: column; gap: .35rem;
`;
const StatTop = styled.div` display: flex; justify-content: space-between; align-items: flex-start; `;
const IconSq = styled.div`
  width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  background: ${p => p.$bg || "var(--adm-chip-green-bg)"}; color: ${p => p.$fg || G.green};
`;
const StatLabel = styled.div` font-size: .7rem; color: ${G.muted}; text-transform: uppercase; letter-spacing: .1em; font-weight: 700; `;
const StatBig = styled.div` font-size: 1.55rem; font-weight: 900; color: ${G.text}; letter-spacing: -.03em; line-height: 1.1; `;
const StatCaption = styled.div` font-size: .78rem; color: ${G.muted}; `;

/* ─── Forgotten card ─── */
const Forgot = styled.div`
  background: var(--adm-chip-red-bg); border: 1px solid var(--adm-chip-red-text); border-radius: 20px; padding: 1.1rem 1.25rem; margin-bottom: 1.25rem;
  display: flex; gap: .9rem; align-items: flex-start; min-width: 0;
  @media (max-width: 640px) {
    padding: .9rem; gap: .65rem;
  }
`;
const ForgotIcon = styled.div` width: 40px; height: 40px; border-radius: 10px; background: var(--adm-chip-red-bg); color: ${G.red}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; `;

/* ─── Section title ─── */
const SectionTitle = styled.h3` font-size: .7rem; text-transform: uppercase; letter-spacing: .15em; color: ${G.muted}; font-weight: 800; margin: 0 0 .6rem 0; `;

/* ─── Work queue card (left) ─── */
const TwoCol = styled.div`
  display: grid; grid-template-columns: 58% 1fr; gap: 1rem; min-width: 0;
  @media (max-width: 800px) {
    grid-template-columns: 1fr;
    gap: .75rem;
  }
`;
const Card = styled.div`
  background: ${G.card}; border: 1px solid ${G.border}; border-radius: 20px; padding: 1.1rem; box-shadow: 0 4px 18px rgba(20,30,20,.06); min-width: 0;
  @media (max-width: 640px) {
    padding: .9rem;
  }
`;
const TabRow = styled.div` display: flex; gap: .35rem; flex-wrap: wrap; margin-bottom: .75rem; `;
const TabBtn = styled.button`
  padding: .35rem .7rem; border-radius: 999px; border: 1px solid ${p => p.$a ? "var(--adm-accent)" : G.border};
  background: ${p => p.$a ? "var(--adm-surface-solid)" : G.card}; color: ${p => p.$a ? G.green : G.muted}; font-size: .72rem; font-weight: 600; cursor: pointer;
`;
const WTable = styled.div` width: 100%; `;
const WHead = styled.div`
  display: flex; gap: 1rem; padding: .3rem 0; font-size: .6rem; text-transform: uppercase; letter-spacing: .12em; color: ${G.muted}; font-weight: 700; border-bottom: 1px solid ${G.border};
  @media (max-width: 640px) {
    display: grid; grid-template-columns: minmax(92px, 1.2fr) minmax(86px, 1fr) 38px 54px; gap: .4rem;
  }
`;
const WRow = styled.div`
  display: flex; gap: 1rem; align-items: center; padding: .65rem 0; border-bottom: 1px solid ${G.border};
  @media (max-width: 640px) {
    display: grid; grid-template-columns: minmax(92px, 1.2fr) minmax(86px, 1fr) 38px 54px; gap: .4rem; align-items: center;
    & > span, & > a { width: auto !important; min-width: 0; }
    & > span:nth-child(1) { gap: .35rem !important; }
    & > span:nth-child(2) { font-size: .68rem !important; line-height: 1.15; }
    & > span:nth-child(3) { font-size: .75rem !important; }
    & > a { text-align: center; padding: .2rem .25rem !important; }
  }
`;
const Avatar = styled.div` width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, var(--adm-accent), #0B7A43); color: #fff; display: flex; align-items: center; justify-content: center; font-size: .65rem; font-weight: 800; flex-shrink: 0; `;

/* ─── Pipeline card (right) ─── */
const BarRow = styled.div` display: flex; align-items: center; gap: .6rem; margin-bottom: .45rem; `;
const BarName = styled.span` width: 110px; font-size: .78rem; color: ${G.text}; font-weight: 600; `;
const BarTrack = styled.div` flex: 1; height: 18px; background: #D12B3A; border-radius: 999px; overflow: hidden; `;
const BarFill = styled.div` height: 100%; width: ${p => p.$w}%; border-radius: 999px; background: linear-gradient(90deg, var(--adm-accent), #0B7A43); display: flex; align-items: center; justify-content: flex-end; padding-right: .35rem; color: #fff; font-size: .65rem; font-weight: 800; `;

/* ─── Float chat ─── */
const FloatBtn = styled.button`
  position: fixed; bottom: 1.5rem; right: 1.5rem; width: 56px; height: 56px; border-radius: 50%;
  background: ${G.green}; color: #fff; border: none; box-shadow: 0 8px 28px rgba(4,120,87,.35); cursor: pointer; z-index: 50; display: flex; align-items: center; justify-content: center;
`;
const BadgeRed = styled.span` position: absolute; top: 6px; right: 6px; width: 14px; height: 14px; border-radius: 50%; background: ${G.red}; color: #fff; font-size: .55rem; font-weight: 800; border: 2px solid #fff; display: flex; align-items: center; justify-content: center; `;

export default function DashboardHome({ users = [], dossiers = [], payments = [], appointments = [] }) {
  // Real counts from props
  const students = users.length;
  const dossiersP = dossiers.length;
  const paid = payments.filter(p => p.status === "PAID").reduce((sum, p) => sum + (Number(p.amount || 0)), 0);
  const appointmentsN = appointments.length;

  const workItems = dossiers.filter(d => d.status === "PENDING").slice(0, 6);
  const forgotten = dossiers.filter(d => {
    const last = new Date(d.updatedAt || d.createdAt || Date.now());
    return (new Date() - last) / (1000 * 60 * 60 * 24) > 30;
  }).slice(0, 3);

  // Pipeline from existing dossier statuses
  const pipeline = [
    { name: "Invited", count: dossiers.filter(d => d.status === "PENDING").length },
    { name: "Onboarded", count: 0 },
    { name: "Documents", count: 0 },
    { name: "Applications", count: dossiers.filter(d => d.stage === "EN_COURS").length },
    { name: "Acceptance", count: dossiers.filter(d => d.status === "VALIDATED").length },
    { name: "Choice", count: 0 },
    { name: "Visa", count: 0 },
  ];

  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const [menuOpen, setMenuOpen] = useState(false);
  const [offices, setOffices] = useState([]);
  const [selectedOfficeId, setSelectedOfficeId] = useState(null);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  // Load + revalidate offices (same endpoint as Settings)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await getOffices();
        let list = Array.isArray(res?.data) ? res.data : (res?.data ? res.data : []);
        list = (list || []).filter(o => o && o.active !== false && o.isActive !== false && o.status !== "DEACTIVATED" && o.deactivated !== true);
        if (active) setOffices(list);
      } catch (e) { console.error("offices load", e); }
    })();
    return () => { active = false; };
  }, []);

  // Re-fetch on Settings update — expose via window event or route mount only (simplified here)
  useEffect(() => {
    const reload = async () => {
      try {
        const res = await getOffices();
        let list = Array.isArray(res?.data) ? res.data : (res?.data ? res.data : []);
        list = (list || []).filter(o => o && o.active !== false && o.isActive !== false && o.status !== "DEACTIVATED" && o.deactivated !== true);
        setOffices(list);
      } catch (e) {}
    };
    window.addEventListener("office-changed", reload);
    return () => window.removeEventListener("office-changed", reload);
  }, []);

  useEffect(() => {
    const onClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target) && btnRef.current && !btnRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const btn = btnRef.current;
    if (!btn || !menuRef.current) return;
    const compute = () => {
      const r = btn.getBoundingClientRect();
      const m = menuRef.current.getBoundingClientRect();
      let top = r.bottom + 6;
      // If menu would overflow bottom of screen, render above button instead
      const menuHeight = m.height || 300;
      if (top + menuHeight > window.innerHeight - 12 && menuHeight > r.height / 2) {
        top = r.top - menuHeight - 6;
      }
      setMenuPos({ top, left: r.left });
    };
    compute();
    window.addEventListener("scroll", compute, true);
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute, true);
      window.removeEventListener("resize", compute);
    };
  }, [menuOpen]);

  return (
    <>
      {/* Hero banner */}
      <Hero>
        <HeroLeft>
          <IconSquare><FiHome size={24} color="#fff" /></IconSquare>
          <div>
            <HeroTitle>ViaItalia Agency</HeroTitle>
            <HeroSub>Votre console d'administration centrale — suivi des admissions.</HeroSub>
          </div>
        </HeroLeft>
        <HeroActions>
          <span style={{ fontSize: ".75rem", opacity: .7, fontWeight: 600 }}>Intake</span>
          <button
            ref={btnRef}
            aria-expanded={menuOpen}
            aria-controls="intake-menu"
            role="combobox"
            onClick={() => setMenuOpen(v => !v)}
            onKeyDown={(e) => { if (e.key === 'Escape') setMenuOpen(false); if (e.key === 'Enter') setMenuOpen(true); }}
            style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 999, padding: ".35rem .9rem", color: "#fff", fontSize: ".82rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: ".35rem" }}
          >{selectedOfficeId ? `2026 intake · ${offices.find(o => o.id === selectedOfficeId)?.name || ''}` : '2026 intake'} <FiChevronDown size={14} /></button>
        </HeroActions>
      </Hero>

      {/* Menu porté au body pour franchir overflow:hidden de la bannière */}
      {menuOpen && (
        <>
          {createPortal(
            <div
              ref={menuRef}
              role="listbox"
              aria-label="Bureaux"
              style={{
                position: "fixed", top: menuPos.top || "auto", left: menuPos.left || "auto",
                minWidth: 240, maxWidth: "calc(100vw - 24px)",
                maxHeight: "60vh", overflowY: "auto", overflowX: "hidden",
                background: "var(--adm-panel)", border: "1px solid var(--adm-border)",
                borderRadius: 14, boxShadow: "0 12px 40px rgba(0,0,0,.25)", padding: 10,
                zIndex: 9999,
              }}
            >
              <button onClick={() => { setSelectedOfficeId(null); setMenuOpen(false); }} role="option" aria-selected={selectedOfficeId === null ? "true" : "false"} style={{ display: "block", width: "100%", textAlign: "left", padding: "7px 10px", borderRadius: 8, fontSize: ".82rem", fontWeight: 600, color: "var(--adm-text)", cursor: "pointer", background: selectedOfficeId === null ? "var(--adm-surface-solid)" : "transparent", border: "none", marginBottom: 2 }}>Tous les bureaux {selectedOfficeId === null ? "✓" : ""}</button>
              {offices.length === 0 ? (
                <div style={{ padding: "7px 10px", fontSize: ".78rem", color: "var(--adm-muted)" }}>Aucun bureau — en créer un dans <a href="#/settings" style={{ color: "var(--adm-accent)", textDecoration: "underline" }}>Paramètres</a></div>
              ) : (
                offices.map(o => (
                  <button key={o.id} onClick={() => { setSelectedOfficeId(o.id === selectedOfficeId ? null : o.id); setMenuOpen(false); }} role="option" aria-selected={selectedOfficeId === o.id ? "true" : "false"} style={{ display: "block", width: "100%", textAlign: "left", padding: "7px 10px", borderRadius: 8, fontSize: ".82rem", color: "var(--adm-text)", cursor: "pointer", background: selectedOfficeId === o.id ? "var(--adm-surface-solid)" : "transparent", border: "none", marginBottom: 2 }}>
                    <span style={{ fontWeight: 700 }}>{o.name}</span> <span style={{ color: "var(--adm-muted)", fontWeight: 400 }}>{o.city ? `· ${o.city}` : ''}</span> {selectedOfficeId === o.id ? "✓" : ""}
                  </button>
                ))
              )}
            </div>,
            document.body
          )}
        </>
      )}

      {/* 4 stat cards */}
      <StatsRow>
        {[
          { label: "Students", value: students, sub: `${students} students`, bg: "var(--adm-chip-blue-bg)", fg: G.blue, badge: null },
          { label: "Reached visa", value: dossiers.filter(d => d.status === "VALIDATED").length, sub: `${dossiers.filter(d => d.status === "VALIDATED").length} validated of ${users.length || 0} users`, bg: "var(--adm-info-soft)", fg: G.purple, badge: null },
          { label: "Collected", value: `${paid} TND`, sub: "Confirmed payments logged in the ledger", bg: "var(--adm-chip-green-bg)", fg: G.green, badge: null, bBg: "var(--adm-chip-red-bg)", bFg: G.red },
          { label: "Expected", value: `${payments.filter(p => p.status === "PENDING").reduce((sum, p) => sum + (Number(p.amount || 0)), 0)} TND`, sub: `Still owed across ${users.length || 0} students`, bg: "var(--adm-chip-amber-bg)", fg: G.orange, badge: null, bBg: "var(--adm-hover)", bFg: G.muted },
        ].map(s => (
          <StatCard key={s.label}>
            <StatTop>
              <IconSq $bg={s.bg} $fg={s.fg}>{s.label === "Students" ? <FiUsers size={18} /> : s.label === "Reached visa" ? <FiFolder size={18} /> : s.label === "Collected" ? <FiCreditCard size={18} /> : <FiCalendar size={18} />}</IconSq>
              {s.badge && <span style={{ fontSize: ".65rem", fontWeight: 800, padding: ".15rem .4rem", borderRadius: 999, background: s.bBg, color: s.bFg }}>{s.badge}</span>}
            </StatTop>
            <StatLabel>{s.label}</StatLabel>
            <StatBig>{s.value}</StatBig>
            <StatCaption>{s.sub}</StatCaption>
          </StatCard>
        ))}
      </StatsRow>

      {/* Forgotten dossiers */}
      {forgotten.length > 0 && (
        <Forgot>
          <ForgotIcon><FiAlertCircle size={18} /></ForgotIcon>
          <div>
            <div style={{ fontWeight: 800, fontSize: ".92rem", color: G.text, marginBottom: ".15rem" }}>Forgotten dossiers</div>
            <div style={{ fontSize: ".78rem", color: G.muted }}>{forgotten.length} case{forgotten.length > 1 ? "s" : ""} have had no activity for weeks — reach out or close them.</div>
            <div style={{ display: "flex", gap: ".5rem", marginTop: ".6rem", flexWrap: "wrap" }}>
              {forgotten.map(d => (
                <span key={d.id} style={{ display: "flex", alignItems: "center", gap: ".35rem", background: "var(--adm-panel)", border: "1px solid var(--adm-chip-red-text)", borderRadius: 999, padding: ".25rem .6rem", fontSize: ".7rem", fontWeight: 600, color: G.text }}>
                  <span style={{ width: 18, height: 18, borderRadius: "50%", background: "linear-gradient(135deg, var(--adm-accent), #0B7A43)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".6rem", fontWeight: 800 }}>{(d.title || `#${d.id}`).slice(0, 2).toUpperCase()}</span>
                  {d.title || `Dossier #${d.id}`} <span style={{ color: G.red, fontWeight: 700 }}>41d silent</span>
                </span>
              ))}
            </div>
          </div>
        </Forgot>
      )}

      {/* Two columns */}
      <TwoCol>
        {/* Left — Work queue */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: ".5rem" }}>
            <div>
              <SectionTitle style={{ margin: 0 }}>Work queue</SectionTitle>
              <div style={{ fontSize: ".78rem", color: G.muted }}>{workItems.length} cases need you — longest wait first</div>
            </div>
          </div>
          <TabRow>
            {["All", "Claims", "Documents", "Fees", "Decisions", "Stalled"].map((t, i) => (
              <TabBtn key={t} $a={i === 0}>{t} <span style={{ fontSize: ".7rem", color: G.muted }}>{i === 0 ? workItems.length : 0}</span></TabBtn>
            ))}
          </TabRow>
          <WTable>
            <WHead>
              <span style={{ width: 180 }}>STUDENT</span>
              <span style={{ width: 120 }}>BLOCKED ON</span>
              <span style={{ width: 80 }}>WAITING</span>
              <span style={{ width: 70 }} />
            </WHead>
            {workItems.length === 0 ? (
              <WRow><span style={{ color: G.muted, fontSize: ".82rem" }}>Aucun dossier en attente</span></WRow>
            ) : workItems.map(w => (
              <WRow key={w.id}>
                <span style={{ display: "flex", alignItems: "center", gap: ".6rem", width: 180 }}>
                  <Avatar>{(users.find(u => u.id === w.userId)?.firstName || "ST").slice(0,2).toUpperCase()}</Avatar>
                  <span style={{ fontWeight: 600, fontSize: ".82rem", color: G.text }}>
                    {users.find(u => u.id === w.userId)?.firstName || `Dossier #${w.id}`}
                    <span style={{ display: "block", fontSize: ".65rem", color: G.muted, fontWeight: 400 }}>Stage {w.stage || "PENDING"}</span>
                  </span>
                </span>
                <span style={{ width: 120, fontSize: ".78rem", color: G.red, fontWeight: 700, display: "flex", alignItems: "center", gap: ".25rem" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: G.red, flexShrink: 0 }} /> No activity for 41 days
                </span>
                <span style={{ width: 80, fontWeight: 800, color: G.red, fontSize: ".85rem" }}>41d</span>
                <a href="#" style={{ width: 70, fontSize: ".75rem", fontWeight: 700, textDecoration: "none", color: G.green, border: "1px solid var(--adm-border)", padding: ".2rem .5rem", borderRadius: 999, background: "var(--adm-panel)" }}>Open</a>
              </WRow>
            ))}
          </WTable>
        </Card>

        {/* Right — Pipeline */}
        <Card>
          <div style={{ marginBottom: ".25rem" }}>
            <SectionTitle style={{ margin: 0 }}>Pipeline</SectionTitle>
            <div style={{ fontSize: ".75rem", color: G.muted }}>every student sits in exactly one stage — click a bar to filter</div>
          </div>
          {pipeline.map(p => (
            <BarRow key={p.name}>
              <BarName>{p.name}</BarName>
              <BarTrack>
                <BarFill $w={Math.max(8, Math.min(100, (p.count / Math.max(1, dossiers.length || 1)) * 100))}>{p.count > 0 ? p.count : ""}</BarFill>
              </BarTrack>
            </BarRow>
          ))}
        </Card>
      </TwoCol>

      {/* Float chat */}
      <FloatBtn aria-label="Chat" title="Chat"><FiMessageSquare size={20} /><BadgeRed>2</BadgeRed></FloatBtn>
    </>
  );
}
