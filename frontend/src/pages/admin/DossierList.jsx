import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { FiUsers, FiFolder, FiCreditCard, FiCalendar, FiSearch, FiChevronDown } from "react-icons/fi";
import { fetchAllUsers } from "../../api/userService";

const C = { bg: "var(--adm-bg)", card: "var(--adm-panel)", border: "var(--adm-border)", text: "var(--adm-text)", muted: "var(--adm-muted)", green: "var(--adm-accent)", greenSoft: "var(--adm-accent-soft)", orange: "var(--adm-chip-amber-text)", orangeSoft: "var(--adm-chip-amber-bg)", gray: "var(--adm-subtle)" };
const Wrap = styled.div` padding: 1rem; `;
const SectionTitle = styled.h2` font-size: .75rem; text-transform: uppercase; letter-spacing: .12em; color: ${C.muted}; font-weight: 800; margin: 0 0 .6rem 0; `;
const KPI = styled.div` display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: .75rem; margin-bottom: 1.25rem; `;
const KPICard = styled.div` background: ${C.card}; border: 1px solid ${C.border}; border-radius: 16px; padding: .9rem 1rem; display: flex; align-items: flex-start; gap: .75rem; box-shadow: 0 2px 14px rgba(20,40,30,.06); `;
const Dot = styled.div` width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; background: ${p => p.$c || C.green}; `;
const KPILabel = styled.div` font-size: .65rem; text-transform: uppercase; letter-spacing: .1em; color: ${C.muted}; font-weight: 700; `;
const KPINum = styled.div` font-size: 1.4rem; font-weight: 900; color: ${C.text}; letter-spacing: -.02em; `;
const KPICap = styled.div` font-size: .75rem; color: ${C.muted}; `;
const FilterRow = styled.div` display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; background: var(--adm-surface-solid); border: 1px solid ${C.border}; border-radius: 14px; padding: .6rem .8rem; margin-bottom: .75rem; box-shadow: 0 2px 8px rgba(20,40,30,.04); `;
const SearchBox = styled.div` position: relative; flex: 1; min-width: 220px; `;
const SearchInput = styled.input` width: 100%; padding: .45rem .9rem .45rem 2.2rem; border: 1px solid ${C.border}; border-radius: 999px; background: ${C.bg}; font-size: .82rem; outline: none; `;
const Select = styled.select` padding: .45rem .6rem; border: 1px solid ${C.border}; border-radius: 999px; background: var(--adm-surface-solid); font-size: .78rem; color: ${C.text}; `;
const ResetBtn = styled.button` padding: .45rem .7rem; border-radius: 999px; border: 1px solid ${C.border}; background: var(--adm-surface-solid); font-size: .78rem; font-weight: 600; color: ${C.muted}; cursor: pointer; `;
const Chips = styled.div` display: flex; gap: .4rem; flex-wrap: wrap; margin-bottom: .75rem; `;
const Chip = styled.button` padding: .3rem .75rem; border-radius: 999px; border: 1px solid ${p => p.$a ? C.green : C.border}; background: ${p => p.$a ? "var(--adm-surface-solid)" : C.card}; color: ${p => p.$a ? C.green : C.muted}; font-size: .72rem; font-weight: 600; cursor: pointer; `;
const TableWrap = styled.div` background: var(--adm-surface-solid); border: 1px solid ${C.border}; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 14px rgba(20,40,30,.06); `;
const TH = styled.div` display: flex; gap: 1rem; padding: .55rem .9rem; font-size: .6rem; text-transform: uppercase; letter-spacing: .12em; color: ${C.muted}; font-weight: 700; border-bottom: 1px solid ${C.border}; background: var(--adm-panel); `;
const TD = styled.div` display: flex; gap: 1rem; align-items: center; padding: .65rem .9rem; border-bottom: 1px solid ${C.border}; `;
const Cell = styled.div` font-size: .82rem; color: ${C.text}; `;
const Badge = styled.span` display: inline-block; font-size: .65rem; font-weight: 700; padding: .15rem .4rem; border-radius: 999px; `;
const OpenBtn = styled.a` font-size: .75rem; font-weight: 600; color: ${C.green}; text-decoration: none; border: 1px solid ${C.green}; padding: .2rem .5rem; border-radius: 999px; background: var(--adm-accent-soft); `;

export default function DossierList({ users = [], onOpen }) {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("All stages");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [localUsers, setLocalUsers] = useState([]);

  const stages = ["All stages", "Invited", "Onboarded", "Documents", "Applications", "Acceptance", "Choice locked", "Visa"];

  const allData = users && users.length > 0 ? users : localUsers;
  const safeData = Array.isArray(allData) ? allData : [];

  const studentRows = useMemo(() => {
    return safeData
      .filter(u => u && (u.role === "USER" || u.role === undefined || !u.role || u.role === "user"))
      .map(u => {
        const approved = u.isApproved === true || u.isApproved === "true" || u.status === "APPROVED";
        const stage = (u.dossier && (u.dossier.status || u.dossier.stage))
          ? (u.dossier.status === "VALIDATED" ? "Choice locked" : u.dossier.status === "PENDING" ? "Invited" : u.dossier.stage === "EN_COURS" ? "Onboarded" : "Invited")
          : (approved ? "Onboarded" : "Invited");
        return { ...u, stage, approved };
      });
  }, [safeData]);

  const filtered = studentRows.filter(r => {
    const s = r.stage || "Invited";
    const matchStage = stageFilter === "All stages" || stageFilter === s;
    const matchSearch = !search || (r.firstName && r.firstName.toLowerCase().includes(search.toLowerCase())) || (r.lastName && r.lastName.toLowerCase().includes(search.toLowerCase())) || (r.email && r.email.toLowerCase().includes(search.toLowerCase())) || (String(r.id).includes(search));
    return matchStage && matchSearch;
  });

  const stats = [
    { label: "TOTAL STUDENTS", value: filtered.length, dot: C.green, cap: "all statuses" },
    { label: "ACTIVE CASES", value: filtered.filter(r => r.approved && r.stage !== "Invited" && r.stage !== "Choice locked" && r.stage !== "Visa").length, dot: C.green, cap: "from onboarding to departure" },
    { label: "DOCS INCOMPLETE", value: filtered.filter(r => r.stage === "Onboarded").length, dot: C.orange, cap: "at least one bundle unfinished" },
    { label: "IN VISA STAGE", value: filtered.filter(r => r.stage === "Visa").length, dot: C.green, cap: "consulate step in progress" },
    { label: "NEW LEADS", value: filtered.filter(r => r.stage === "Invited" || !r.approved).length, dot: C.gray, cap: "invited, not yet onboarded" },
  ];

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = page > pageCount ? pageCount : page;
  const pageOf = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    if (users && users.length > 0) { setLocalUsers([]); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    fetchAllUsers().then(data => {
      if (cancelled) return;
      setLocalUsers(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(e => {
      if (cancelled) return;
      setError((e?.message) || "Failed to load students");
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [users]);

  return (
    <Wrap>
      {loading && !error && <div style={{ padding: ".5rem 0", color: C.muted, fontSize: ".85rem" }}>Loading students...</div>}
      {error && !loading && <div style={{ padding: ".5rem 0", color: "#C62828", fontSize: ".78rem", marginBottom: ".5rem", display: "flex", alignItems: "center", gap: ".5rem" }}>
        <span style={{ fontWeight: 700 }}>Error loading students:</span> {error} <button onClick={() => { setError(null); setPage(1); }} style={{ marginLeft: ".5rem", padding: ".15rem .5rem", border: "1px solid #C62828", background: "var(--adm-panel)", borderRadius: 6, cursor: "pointer", fontSize: ".75rem" }}>Retry</button>
      </div>}
      <SectionTitle>Students</SectionTitle>
      <div style={{ fontSize: ".85rem", color: C.muted, marginBottom: ".8rem" }}>Every case your agency is handling, from lead to departure.</div>
      <KPI>{stats.map(s => (<KPICard key={s.label}><Dot $c={s.dot} /><div><KPILabel>{s.label}</KPILabel><KPINum style={{ color: s.dot === C.orange ? C.orange : C.text }}>{s.value}</KPINum><KPICap>{s.cap}</KPICap></div></KPICard>))}</KPI>
      <FilterRow>
        <SearchBox><FiSearch size={14} style={{ position: "absolute", left: ".7rem", top: "50%", transform: "translateY(-50%)", color: C.muted }} /><SearchInput placeholder="Name, email, phone or case ref..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></SearchBox>
        <Select value={stageFilter} onChange={e => { setStageFilter(e.target.value); setPage(1); }}><option>All stages</option><option>Invited</option><option>Onboarded</option><option>Documents</option><option>Applications</option><option>Acceptance</option><option>Choice locked</option><option>Visa</option></Select>
        <Select><option>All levels</option><option>Bachelor</option><option>Master</option></Select>
        <Select><option>All languages</option><option>ENG</option><option>ITA</option></Select>
        <ResetBtn onClick={() => { setSearch(""); setStageFilter("All stages"); setPage(1); }}>Reset</ResetBtn>
      </FilterRow>
      <Chips>{stages.map(s => (<Chip key={s} $a={stageFilter === s} onClick={() => { setStageFilter(s); setPage(1); }}>{s} {filtered.filter(r => r.stage === s || (s === "All stages" && true)).length}</Chip>))}</Chips>
      <TableWrap>
        <TH><span style={{ width: 160 }}>STUDENT</span><span style={{ width: 100 }}>JOURNEY STAGE</span><span style={{ width: 100 }}>DOCUMENTS</span><span style={{ width: 90 }}>TARGET</span><span style={{ width: 70 }}>LANG</span><span style={{ width: 90 }}>PHONE</span><span style={{ flex: 1 }}>NOTES</span><span style={{ width: 60 }} /></TH>
        {pageOf.map(r => (
          <TD key={r.id} style={{ cursor: "pointer" }} onClick={() => onOpen && onOpen(r.id)}>
            <Cell style={{ width: 160 }}>
              <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,var(--adm-accent),#0B7A43)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".65rem", fontWeight: 800 }}>{(r.firstName || "ST").slice(0,2).toUpperCase()}</div>
                <div><div style={{ fontWeight: 600, fontSize: ".82rem" }}>{r.firstName || "—"} {r.lastName || ""}</div><div style={{ fontSize: ".7rem", color: C.muted }}>{r.email || "—"}</div></div>
              </div>
            </Cell>
            <Cell style={{ width: 100 }}><Badge style={{ background: r.stage === "Choice locked" ? "var(--adm-accent-soft)" : r.stage === "Invited" ? "var(--adm-hover)" : r.stage === "Onboarded" ? "var(--adm-chip-amber-bg)" : "var(--adm-hover)", color: r.stage === "Choice locked" ? C.green : r.stage === "Invited" ? C.muted : r.stage === "Onboarded" ? C.orange : C.muted }}>{r.stage || "Invited"}</Badge></Cell>
            <Cell style={{ width: 100 }}><div style={{ width: 60, height: 8, background: "#D12B3A", borderRadius: 999, position: "relative", overflow: "hidden" }}><div style={{ width: "60%", height: "100%", background: C.green, borderRadius: 999 }} /></div><div style={{ fontSize: ".65rem", color: C.muted }}>{(r.documentsCount || 2)} of 4 folders</div></Cell>
            <Cell style={{ width: 90 }}><span style={{ fontWeight: 600 }}>{(r.universityInfo && r.universityInfo.specialty) || "Bachelor"}</span></Cell>
            <Cell style={{ width: 70 }}><span style={{ fontSize: ".7rem", fontFamily: "monospace", color: C.muted, background: "var(--adm-hover)", padding: ".15rem .4rem", borderRadius: 999 }}>{(r.studyLanguages && r.studyLanguages[0]) || "ENG"}</span></Cell>
            <Cell style={{ width: 90 }}><span style={{ fontFamily: "monospace", fontSize: ".82rem" }}>{r.phoneNumber || "—"}</span></Cell>
            <Cell style={{ flex: 1 }}><button style={{ fontSize: ".75rem", border: "1px solid var(--adm-border)", borderRadius: 999, padding: ".2rem .5rem", background: "var(--adm-panel)", cursor: "pointer", color: C.muted }}>Notes ▾</button></Cell>
            <Cell style={{ width: 60 }}><OpenBtn href="#" onClick={e => { e.preventDefault(); onOpen && onOpen(r.id); }}>Open</OpenBtn></Cell>
          </TD>
        ))}
        {!loading && pageOf.length === 0 && filtered.length > 0 && <div style={{ padding: 2, color: C.muted, fontSize: .78 }}>No results match the current filters.</div>}
        {!loading && !error && filtered.length === 0 && <div style={{ padding: "2rem 1rem", color: C.muted, fontSize: ".9rem", textAlign: "center" }}>No students found.</div>}
      </TableWrap>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: ".75rem", fontSize: ".78rem", color: C.muted }}>
        <span>Showing {filtered.length > 0 ? Math.min(filtered.length, (currentPage - 1) * PAGE_SIZE + 1) : 0}-{Math.min(filtered.length, currentPage * PAGE_SIZE)} of {filtered.length} students</span>
        <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
          <span>6 / page</span>
          {pageCount > 1 && (
            <>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1} style={{ border: "1px solid var(--adm-border)", borderRadius: 6, padding: ".2rem .5rem", background: currentPage <= 1 ? "var(--adm-surface-2)" : "var(--adm-surface-solid)", cursor: currentPage <= 1 ? "not-allowed" : "pointer" }}>Prev</button>
              {[1, 2, 3].filter(p => p <= pageCount).map(p => <button key={p} onClick={() => setPage(p)} style={{ width: 28, height: 28, borderRadius: "50%", background: currentPage === p ? C.green : "var(--adm-surface-solid)", color: currentPage === p ? "#fff" : C.muted, border: currentPage === p ? "none" : "1px solid var(--adm-border)", fontWeight: currentPage === p ? 800 : 600, fontSize: ".75rem", cursor: "pointer" }}>{p}</button>)}
              <button onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={currentPage >= pageCount} style={{ border: "1px solid var(--adm-border)", borderRadius: 6, padding: ".2rem .5rem", background: currentPage >= pageCount ? "var(--adm-surface-2)" : "var(--adm-surface-solid)", cursor: currentPage >= pageCount ? "not-allowed" : "pointer" }}>Next</button>
            </>
          )}
        </div>
      </div>
    </Wrap>
  );
}
