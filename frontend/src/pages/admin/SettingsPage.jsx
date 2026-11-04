import React, { useState, useEffect, useCallback, useContext } from "react";
import styled from "styled-components";
import { FiShield, FiDownload, FiTrash2, FiX, FiPlus } from "react-icons/fi";
import { getSettings, updateSetting, downloadStudentsCsv } from "../../api/settingsService";
import { AuthContext } from "../../context/AuthContext";
import * as officeService from "../../api/officeService";
import * as agentService from "../../api/agentService";

/* Token block — required because this component lives inside AdminDashboard's
   Container (CSS variables scoped there); portals to document.body need their own. */
const Shell = styled.div`
  --s-bg: #EBEEE7; --s-card: #F4F6F3; --s-border: #DDE2D9; --s-line: #D5DAD0;
  --s-text: #12231B; --s-muted: #7C877F; --s-faint: #9AA39C;
  --s-green: #0B7A3E; --s-green-soft: #E4EFE6;
  --s-red: #C62828; --s-red-soft: #FBE3E3;
  --s-blue: #2B5FB4;
  --s-amber: #C0902F; --s-amber-soft: #FBE9C8;
  @media (max-width: 600px) {
    & > div { display: flex; flex-direction: column !important; align-items: stretch !important; }
    & > div > div { margin-bottom: 0; }
    .settings-title-row button { align-self: center; margin-top: 6px; }
  }
  body[data-theme="dark"] & {
    --s-bg: #161E1A; --s-card: #1A231D; --s-border: rgba(255,255,255,.10);
    --s-line: rgba(255,255,255,.14); --s-text: #E8F1EB; --s-muted: #8A9A90;
    --s-faint: #6F7E75; --s-green: #2DBA6A; --s-green-soft: rgba(45,186,106,.15);
    --s-red: #E8697A; --s-red-soft: rgba(200,40,48,.18); --s-amber: #D9A94A;
  }
`;

const Page = styled.div`
  max-width: 720px; margin: 0 auto; padding: 16px 0 48px;
  display: flex; flex-direction: column; gap: 16px;
`;

const SectionCard = styled.div`
  border-radius: 14px; border: 1px solid var(--s-border); background: var(--s-card);
  padding: 16px 20px;
`;

const SectionTitle = styled.div`
  font-size: 14px; font-weight: 600; color: var(--s-text); margin-bottom: 4px;
`;

const SectionSub = styled.div`
  font-size: 12px; color: var(--s-muted); line-height: 1.35; margin-bottom: 14px;
`;

const Row = styled.div`
  display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
  padding: 12px 0; border-bottom: 1px solid var(--s-line);
  &:last-child { border-bottom: none; }
`;

const RowTitle = styled.div`
  font-size: 13px; font-weight: 600; color: var(--s-text); line-height: 1.35;
`;

const RowDesc = styled.div`
  font-size: 12px; color: var(--s-faint); line-height: 1.35; max-width: 340px;
`;

const ToggleWrap = styled.button`
  flex-shrink: 0; width: 44px; height: 24px; border-radius: 999px; border: none;
  background: ${p => p.$on ? "var(--s-green)" : "#CBD1C6"}; position: relative; cursor: pointer;
  &:focus-visible { outline: 2px solid var(--s-green); outline-offset: 2px; }
`;

const ToggleKnob = styled.span`
  position: absolute; top: 2px; left: ${p => p.$on ? "22px" : "2px"};
  width: 20px; height: 20px; border-radius: 50%; background: #fff;
  box-shadow: 0 1px 3px rgba(18,35,27,.18); transition: left .18s ease;
`;

const PillRow = styled.div`
  display: flex; gap: 3px; padding: 3px; border-radius: 999px; border: 1px solid var(--s-line);
  background: var(--s-card-2, var(--s-card));
`;

const Pill = styled.button`
  padding: 5px 10px; border-radius: 999px; border: none; background: ${p => p.$a ? "#F4F6EB" : "transparent"};
  color: ${p => p.$a ? "var(--s-text)" : "var(--s-muted)"}; font-size: 12.5px; font-weight: 600; cursor: pointer;
  &:focus-visible { outline: 2px solid var(--s-green); outline-offset: 1px; }
`;

const Input = styled.input`
  width: 100%; max-width: 320px; height: 36px; border-radius: 10px; border: 1px solid var(--s-border);
  padding: 0 10px; font-size: 13px; color: var(--s-text); background: var(--s-card);
  &:focus-visible { outline: 2px solid var(--s-green); outline-offset: 2px; }
`;

const ChipRow = styled.div`
  display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px;
`;

const Chip = styled.span`
  display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 999px;
  border: 1px solid var(--s-line); background: var(--s-card-2, var(--s-card));
  font-size: 12px; font-weight: 600; color: var(--s-text);
`;

const ChipRemove = styled.button`
  background: none; border: none; color: var(--s-muted); cursor: pointer; padding: 0; font-size: 12px;
  &:hover { color: var(--s-red); }
`;

const DangerCard = styled.div`
  border-radius: 14px; border: 1px solid #F5D0D0; background: #FCECEC; padding: 16px 20px;
  body[data-theme="dark"] & { background: rgba(200,40,48,.08); border-color: rgba(200,40,48,.30); }
`;

const DangerTitle = styled.div`
  display: flex; align-items: center; gap: 8px; font-weight: 700; color: #C62828; font-size: 14px; margin-bottom: 4px;
`;

const DangerSub = styled.div`
  font-size: 12px; color: var(--s-muted); margin-bottom: 12px;
`;

const OutlinedBtn = styled.button`
  padding: 8px 14px; border-radius: 8px; border: 1px solid var(--s-border); background: transparent;
  color: var(--s-text); font-size: 12.5px; font-weight: 600; cursor: pointer;
  &:hover { background: var(--s-card-2, var(--s-card)); border-color: var(--s-line); }
`;

const SolidRedBtn = styled.button`
  padding: 8px 14px; border-radius: 8px; border: none; background: #C62828; color: #fff;
  font-size: 12.5px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
  &:hover { background: #A81E1E; }
`;

const Toast = styled.div`
  position: fixed; top: 14px; right: 14px; z-index: 60; padding: 10px 14px; border-radius: 10px;
  background: var(--s-card); border: 1px solid var(--s-border); box-shadow: 0 12px 30px rgba(18,35,27,.18);
  font-size: 12.5px; color: var(--s-text); max-width: 320px;
  animation: slideIn .18s ease;
  @keyframes slideIn { from { opacity: 0; transform: translateY(-8px);} to { opacity: 1; transform: translateY(0);} }
`;

const SkeletonLine = styled.div`
  height: 14px; border-radius: 6px; background: linear-gradient(90deg, #EAECEA, #F0F2F0, #EAECEA); background-size: 200% auto;
  animation: shimmer 1.2s infinite linear;
  @keyframes shimmer { to { background-position: 200% center; } }
`;

/* ─── Component ─── */
export default function SettingsPage() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [folders, setFolders] = useState([]);
  const [folderInput, setFolderInput] = useState("");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [offices, setOffices] = useState([]);
  const [agents, setAgents] = useState([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [agentsError, setAgentsError] = useState(null);
  const [officeName, setOfficeName] = useState('');
  const [officeCity, setOfficeCity] = useState('');
  const [addAgentOpen, setAddAgentOpen] = useState(false);
  const [agentForm, setAgentForm] = useState({ officeId: '', firstName: '', lastName: '', email: '', phoneNumber: '', address: '', allowedSections: ['dashboard','students','messages','alerts'] });
  const [editingAgentId, setEditingAgentId] = useState(null);
  const [tempPassword, setTempPassword] = useState('');
  const [saveBusy, setSaveBusy] = useState(false);
  const [addOfficeOpen, setAddOfficeOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [manageTab, setManageTab] = useState('offices');
  const [resetBusy, setResetBusy] = useState(false);

  const sectionOptions = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'students', label: 'Students' },
    { id: 'messages', label: 'Messages' },
    { id: 'alerts', label: 'Alerts' },
    { id: 'payments', label: 'Payments' },
    { id: 'receipts', label: 'Invoices' },
    { id: 'university-programs', label: 'University Programs' },
    { id: 'reviews', label: 'Avis clients' },
    { id: 'calendar', label: 'Calendar' },
  ];

  const toggleSection = (id) => {
    setAgentForm(f => {
      const s = Array.isArray(f.allowedSections) ? [...f.allowedSections] : [];
      const idx = s.indexOf(id);
      if (idx >= 0) s.splice(idx, 1); else s.push(id);
      return { ...f, allowedSections: s };
    });
  };

  const openEditAgent = (a) => {
    setAgentForm({
      officeId: a.officeId || a.office?.id || '',
      firstName: a.firstName || '',
      lastName: a.lastName || '',
      email: a.email || '',
      phoneNumber: a.phoneNumber || '',
      address: a.address || '',
      allowedSections: Array.isArray(a.allowedSections) ? [...a.allowedSections] : (typeof a.allowedSections === 'string' ? a.allowedSections.split(',').map(x=>x.trim()).filter(Boolean) : ['dashboard','students','messages','alerts'])
    });
    setEditingAgentId(a.id);
    setAddAgentOpen(true);
    setTempPassword('');
  };

  const updateOfficeStatus = async (id, active) => {
    try { const r = await officeService.updateOffice(id, { isActive: active }); if (r.success) loadOffices(); } catch (e) {}
  };
  const deleteOfficeLocal = async (id) => {
    try { await officeService.deleteOffice(id); loadOffices(); } catch (e) {}
  };

  const loadOffices = useCallback(async () => {
    try { const r = await officeService.getOffices(); setOffices(Array.isArray(r.data) ? r.data : []); } catch (e) {}
  }, []);
  const loadAgents = useCallback(async () => {
    setAgentsLoading(true); setAgentsError(null);
    try {
      const r = await agentService.getAgents();
      const raw = (r && r.data) ? r.data : (r ? r : []);
      const arr = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
      setAgents(arr);
    } catch (e) {
      setAgentsError(e?.message || 'Failed to load agents');
    } finally { setAgentsLoading(false); }
  }, []);

  const deleteAgentLocal = useCallback(async (id) => {
    try { await agentService.deleteAgent(id); loadAgents(); } catch (e) {}
  }, [loadAgents]);

  const showToast = useCallback((msg, kind = "ok") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const s = await getSettings();
      setData(s || {});
      const extra = (s && s.extraDefaultFolders) ? String(s.extraDefaultFolders).split(",").map(x => x.trim()).filter(Boolean) : [];
      setFolders(extra);
    } catch (e) {
      setError(e && e.message ? e.message : "Failed to load settings");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload agents when Agents tab opens / after mutations
  useEffect(() => { load(); loadOffices(); }, [load, loadOffices]);
  useEffect(() => { if (manageOpen && manageTab === 'agents') loadAgents(); }, [manageOpen, manageTab, loadAgents]);

  const save = useCallback(async (key, value) => {
    try {
      const res = await updateSetting(key, value);
      // Read backend's returned message; if it carries success, use data; else show message
      if (res && res.success === false && res.message) {
        throw new Error(res.message);
      }
      setData(res && res.data ? res.data : res);
      showToast(`Saved ${key}`);
    } catch (e) {
      showToast(`Failed to save ${key}: ${e && e.message ? e.message : String(e)}`, "bad");
    }
  }, [showToast]);

  const addFolder = () => {
    const v = folderInput.trim();
    if (!v) return;
    if (folders.some(f => f.toLowerCase() === v.toLowerCase())) { showToast("Folder already exists", "bad"); return; }
    const NEXT = folders.concat(v); const joined = NEXT.join(", ");
    setFolders(NEXT); setFolderInput(""); save("extraDefaultFolders", joined);
  };

  const removeFolder = (name) => {
    const NEXT = folders.filter(f => f !== name); const joined = NEXT.join(", ");
    setFolders(NEXT); save("extraDefaultFolders", joined);
  };

  if (user?.isAgent) {
    return (
      <Shell><Page>
        <div style={{color:"var(--s-red)", fontWeight:600}}>You do not have access to this section.</div>
      </Page></Shell>
    );
  }

  if (loading && !data) {
    return (
      <Shell><Page>
        <SkeletonLine style={{height:20, width:260}} />
        <SkeletonLine style={{height:14, width:400}} />
        <SkeletonLine style={{height:14, width:320}} />
        <SkeletonLine style={{height:14, width:360}} />
        <SkeletonLine style={{height:14, width:200}} />
      </Page></Shell>
    );
  }

  if (error && !data) {
    return (
      <Shell><Page>
        <div style={{color:"var(--s-red)", fontWeight:600}}>{error}</div>
        <OutlinedBtn onClick={load}>Retry</OutlinedBtn>
      </Page></Shell>
    );
  }

  const d = data || {};
  const getVal = (k, def) => (d[k] !== undefined && d[k] !== null) ? d[k] : def;

  return (
    <Shell>
      <Page>
        {toast && <Toast style={{border: toast.kind === "bad" ? "1px solid #FBE3E3" : "1px solid #E4EFE6", color: toast.kind === "bad" ? "#C62828" : "var(--s-text)"}}>{toast.msg}</Toast>}

        <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12}}>
          <div>
            <h1 style={{fontSize:20, fontWeight:800, margin:0, color:"var(--s-text)", letterSpacing:"-.01em"}}>Settings</h1>
            <p style={{fontSize:13, color:"var(--s-muted)", margin:"4px 0 0"}}>Agency profile, team and services.</p>
          </div>
          {user?.isAgent ? null : (
            <div style={{display:"flex", gap:10, flexWrap:"wrap", justifyContent:"flex-end"}}>
              <button style={{
                display:"inline-flex", alignItems:"center", justifyContent:"center",
                height:36, borderRadius:10, background:"#0B7A3E", color:"#fff",
                fontSize:12.5, fontWeight:800, padding:"0 16px", gap:6,
                whiteSpace:"nowrap", boxShadow:"0 4px 12px rgba(11,122,62,.3)",
                border:"none", cursor:"pointer"
              }} onClick={() => { setOfficeName(''); setOfficeCity(''); setAddOfficeOpen(true); }} aria-label="Add office">
                <FiPlus size={14} /> Add office
              </button>
              <button style={{
                display:"inline-flex", alignItems:"center", justifyContent:"center",
                height:36, borderRadius:10, background:"#0B7A3E", color:"#fff",
                fontSize:12.5, fontWeight:800, padding:"0 16px", gap:6,
                whiteSpace:"nowrap", boxShadow:"0 4px 12px rgba(11,122,62,.3)",
                border:"none", cursor:"pointer"
              }} onClick={() => { setAgentForm({ officeId: '', firstName: '', lastName: '', email: '', phoneNumber: '', address: '', allowedSections: ['dashboard','students','messages','alerts'] }); setEditingAgentId(null); setTempPassword(''); setAddAgentOpen(true); }} aria-label="Add agent">
                <FiPlus size={14} /> Add agent
              </button>
              <button style={{
                display:"inline-flex", alignItems:"center", justifyContent:"center",
                height:36, borderRadius:10, background:"transparent", color:"var(--s-text)",
                fontSize:12.5, fontWeight:600, padding:"0 16px", gap:6,
                whiteSpace:"nowrap", border:"1px solid var(--s-border)", cursor:"pointer"
              }} onClick={() => setManageOpen(true)} aria-label="Offices & agents">Offices & agents</button>
            </div>
          )}
        </div>

        {/* 1 Access */}
        <SectionCard>
          <SectionTitle>Access</SectionTitle>
          <SectionSub>What agents can see inside the agency</SectionSub>
          <Row>
            <div>
              <RowTitle>Restrict payment access</RowTitle>
              <RowDesc>When enabled, payments are available to the owner, full-access agents and viewers explicitly granted the Payments section. Turn it off to let every agent view payments; viewers remain read-only.</RowDesc>
            </div>
            <ToggleWrap $on={!!getVal("restrictPaymentAccess", true)} onClick={() => save("restrictPaymentAccess", !getVal("restrictPaymentAccess", true))} aria-label="Restrict payment access"><ToggleKnob $on={!!getVal("restrictPaymentAccess", true)} /></ToggleWrap>
          </Row>
        </SectionCard>

        {/* 2 Expense ledger */}
        <SectionCard>
          <SectionTitle>Expense ledger</SectionTitle>
          <SectionSub>Control how agency expenses affect the reported income</SectionSub>
          <Row>
            <div>
              <RowTitle>Deduct expenses from total income</RowTitle>
              <RowDesc>Shows total income as collected student payments minus agency expenses. Gross collections always remain visible separately.</RowDesc>
            </div>
            <ToggleWrap $on={!!getVal("deductExpenses", false)} onClick={() => save("deductExpenses", !getVal("deductExpenses", false))} aria-label="Deduct expenses"><ToggleKnob $on={!!getVal("deductExpenses", false)} /></ToggleWrap>
          </Row>
        </SectionCard>

        {/* 3 Student portal rules */}
        <SectionCard>
          <SectionTitle>Student portal rules</SectionTitle>
          <SectionSub>What students can do from their side of the app</SectionSub>

          <Row>
            <div>
              <RowTitle>Students can edit their profile</RowTitle>
              <RowDesc>After onboarding, students may update their identity, passport and study details themselves. When off, only your agents can.</RowDesc>
            </div>
            <ToggleWrap $on={!!getVal("studentsEditProfile", true)} onClick={() => save("studentsEditProfile", !getVal("studentsEditProfile", true))} aria-label="Edit profile"><ToggleKnob $on={!!getVal("studentsEditProfile", true)} /></ToggleWrap>
          </Row>
          <Row>
            <div>
              <RowTitle>Students can claim cash payments</RowTitle>
              <RowDesc>When off, students must claim by bank transfer with a receipt — cash is logged only by your agents.</RowDesc>
            </div>
            <ToggleWrap $on={!!getVal("studentsClaimCash", true)} onClick={() => save("studentsClaimCash", !getVal("studentsClaimCash", true))} aria-label="Claim cash"><ToggleKnob $on={!!getVal("studentsClaimCash", true)} /></ToggleWrap>
          </Row>
          <Row>
            <div>
              <RowTitle>Students receive email notifications</RowTitle>
              <RowDesc>Task assignments, payment confirmations and application updates are also emailed to students. In-app notifications are always kept.</RowDesc>
            </div>
            <ToggleWrap $on={!!getVal("studentsEmailNotifications", true)} onClick={() => save("studentsEmailNotifications", !getVal("studentsEmailNotifications", true))} aria-label="Email notifications"><ToggleKnob $on={!!getVal("studentsEmailNotifications", true)} /></ToggleWrap>
          </Row>

          <Row>
            <div>
              <RowTitle>Where students can upload</RowTitle>
              <RowDesc>Any open folder, or only folders where you assigned them a document task.</RowDesc>
            </div>
            <PillRow>
              <Pill $a={getVal("studentUploadScope", "any") === "any"} onClick={() => save("studentUploadScope", "any")} aria-label="Any open folder">Any open folder</Pill>
              <Pill $a={getVal("studentUploadScope", "any") === "tasked"} onClick={() => save("studentUploadScope", "tasked")} aria-label="Tasked folders only">Tasked folders only</Pill>
            </PillRow>
          </Row>
        </SectionCard>

        {/* 4 Workflow defaults */}
        <SectionCard>
          <SectionTitle>Workflow defaults</SectionTitle>
          <SectionSub>How cases move and what new cases start with</SectionSub>

          <Row>
            <div>
              <RowTitle>Visa stage starts at choice lock</RowTitle>
              <RowDesc>Locking the final university moves the case straight to Visa. When off, it parks at Choice locked until an agent moves it.</RowDesc>
            </div>
            <ToggleWrap $on={!!getVal("visaStartsAtChoiceLock", true)} onClick={() => save("visaStartsAtChoiceLock", !getVal("visaStartsAtChoiceLock", true))} aria-label="Visa at choice"><ToggleKnob $on={!!getVal("visaStartsAtChoiceLock", true)} /></ToggleWrap>
          </Row>

          <Row>
            <div><RowTitle>A case counts as forgotten after</RowTitle><RowDesc>Drives the Forgotten dossiers card, the Stalled queue and abandoned alerts.</RowDesc></div>
            <PillRow>
              {[7, 14, 21, 30].map(n => <Pill key={n} $a={getVal("forgottenAfterDays", 21) == n} onClick={() => save("forgottenAfterDays", n)} aria-label={`${n} days`}>{n} days</Pill>)}
            </PillRow>
          </Row>

          <Row>
            <div><RowTitle>Alert us about unread messages after</RowTitle><RowDesc>A conversation nobody in the agency opened this long shows up as an Unanswered alert.</RowDesc></div>
            <PillRow>
              {[3, 7, 14, 30].map(n => <Pill key={n} $a={getVal("unreadAlertAfterDays", 7) == n} onClick={() => save("unreadAlertAfterDays", n)} aria-label={`${n} days`}>{n} days</Pill>)}
            </PillRow>
          </Row>

          <Row>
            <div>
              <RowTitle>Completing a folder closes its tasks</RowTitle>
              <RowDesc>Marking a folder complete automatically closes the open document tasks pointing at it.</RowDesc>
            </div>
            <ToggleWrap $on={!!getVal("folderCompleteClosesTasks", true)} onClick={() => save("folderCompleteClosesTasks", !getVal("folderCompleteClosesTasks", true))} aria-label="Close tasks"><ToggleKnob $on={!!getVal("folderCompleteClosesTasks", true)} /></ToggleWrap>
          </Row>

          <Row>
            <div>
              <RowTitle>Extra default folders</RowTitle>
              <RowDesc>Created on every new case, alongside the standard and service folders.</RowDesc>
            </div>
            <div style={{flex:1, maxWidth:320}}>
              <div style={{display:"flex", gap:8}}>
                <Input value={folderInput} onChange={e => setFolderInput(e.target.value)} placeholder="e.g. Translations" aria-label="Folder name" onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addFolder(); } }} />
                <OutlinedBtn onClick={addFolder} aria-label="Add folder"><FiPlus size={14} /></OutlinedBtn>
              </div>
              {folders.length > 0 && <ChipRow>{folders.map(f => <Chip key={f}>{f}<ChipRemove onClick={() => removeFolder(f)} aria-label={`Remove ${f}`}><FiX size={10} /></ChipRemove></Chip>)}</ChipRow>}
            </div>
          </Row>
        </SectionCard>


        {/* Manage modal */}
        {manageOpen && (
          <div style={{position:"fixed", inset:0, background:"rgba(18,35,27,.55)", zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:20}} onClick={() => setManageOpen(false)}>
            <div style={{background:"var(--s-card)", border:"1px solid var(--s-border)", borderRadius:14, padding:24, maxWidth:640, width:"100%", boxShadow:"0 24px 60px rgba(0,0,0,.25)"}} onClick={e => e.stopPropagation()}>
              <div style={{display:"flex", gap:8, marginBottom:12, borderBottom:"1px solid var(--s-line)", paddingBottom:8}}>
                <button onClick={() => setManageTab('offices')} style={{padding:"6px 12px", borderRadius:8, border:"none", background: manageTab==='offices' ? "var(--s-green)" : "transparent", color: manageTab==='offices' ? "#fff" : "var(--s-text)", fontWeight:600, cursor:"pointer"}}>Offices</button>
                <button onClick={() => setManageTab('agents')} style={{padding:"6px 12px", borderRadius:8, border:"none", background: manageTab==='agents' ? "var(--s-green)" : "transparent", color: manageTab==='agents' ? "#fff" : "var(--s-text)", fontWeight:600, cursor:"pointer"}}>Agents</button>
              </div>
              {manageTab === 'offices' && (
                <div>
                  {!offices.length && <div style={{padding:12, textAlign:"center", color:"var(--s-muted)", fontSize:13}}>No offices yet</div>}
                  {offices.map(o => (
                    <Row key={o.id} style={{borderBottom:"1px solid var(--s-line)", padding:"8px 0"}}>
                      <div><RowTitle>{o.name}</RowTitle><RowDesc>{o.city || '—'} · {o.isActive ? 'Active' : 'Inactive'}</RowDesc></div>
                      <div style={{display:"flex", gap:6}}>
                        <OutlinedBtn onClick={() => { if (window.confirm('Rename office?')) { /* placeholder */ loadOffices(); } }} aria-label="Rename">Rename</OutlinedBtn>
                        <OutlinedBtn onClick={() => { if (window.confirm('Delete this office? If in use you will see: Office is in use')) deleteOfficeLocal(o.id); }} aria-label="Delete">Delete</OutlinedBtn>
                        <button onClick={() => updateOfficeStatus(o.id, !o.isActive)} style={{padding:"6px 10px", borderRadius:6, border:"1px solid var(--s-border)", background:"transparent", fontSize:12, cursor:"pointer"}} aria-label="Toggle">{o.isActive ? 'Deactivate' : 'Activate'}</button>
                      </div>
                    </Row>
                  ))}
                </div>
              )}
              {manageTab === 'agents' && (
                <div>
                  {agentsLoading && <div style={{fontSize:13, color:"var(--s-muted)", padding:8}}>Loading agents…</div>}
                  {agentsError && (
                    <div style={{background:"#FBE3E3", border:"1px solid #F5D0D0", borderRadius:10, padding:10, marginBottom:8}}>
                      <div style={{fontSize:13, fontWeight:600, color:"#C62828"}}>{agentsError}</div>
                      <button onClick={() => loadAgents()} style={{marginTop:6, padding:"4px 10px", borderRadius:6, border:"1px solid var(--s-border)", background:"transparent", fontSize:12, cursor:"pointer"}}>Retry</button>
                    </div>
                  )}
                  {!agentsLoading && !agentsError && agents.length === 0 && (
                    <div style={{padding:16, textAlign:"center", color:"var(--s-muted)", fontSize:13}}>
                      <div style={{fontWeight:600, marginBottom:4}}>No agents yet</div>
                      <button onClick={() => { setAgentForm({ officeId: '', firstName: '', lastName: '', email: '', phoneNumber: '', address: '', allowedSections: ['dashboard','students','messages','alerts'] }); setEditingAgentId(null); setTempPassword(''); setAddAgentOpen(true); }} style={{padding:"6px 14px", borderRadius:8, border:"none", background:"#0B7A3E", color:"#fff", fontWeight:600, cursor:"pointer"}}>Add agent</button>
                    </div>
                  )}
                  {!agentsLoading && !agentsError && agents.length > 0 && agents.map(a => (
                    <Row key={a.id} style={{borderBottom:"1px solid var(--s-line)", padding:"8px 0"}}>
                      <div>
                        <RowTitle>{a.firstName || ''} {a.lastName || ''}</RowTitle>
                        <RowDesc>{a.email || '—'} · Phone: {a.phoneNumber || '—'} · Office: {a.officeName || '—'} · Sections: {Array.isArray(a.allowedSections) ? a.allowedSections.length : (a.allowedSections ? String(a.allowedSections).split(',').filter(Boolean).length : 0)}</RowDesc>
                      </div>
                      <div style={{display:"flex", gap:6}}>
                        <OutlinedBtn onClick={() => openEditAgent(a)} aria-label="Edit">Edit</OutlinedBtn>
                        <OutlinedBtn onClick={() => { if (window.confirm('Delete agent?')) deleteAgentLocal(a.id); }} aria-label="Delete">Delete</OutlinedBtn>
                      </div>
                    </Row>
                  ))}
                </div>
              )}
              <div style={{marginTop:12, display:"flex", justifyContent:"flex-end"}}>
                <OutlinedBtn onClick={() => setManageOpen(false)}>Close</OutlinedBtn>
              </div>
            </div>
          </div>
        )}

        {/* Add office modal */}
        {addOfficeOpen && (
          <div style={{position:"fixed", inset:0, background:"rgba(18,35,27,.55)", zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:20}} onClick={() => setAddOfficeOpen(false)}>
            <div style={{background:"var(--s-card)", border:"1px solid var(--s-border)", borderRadius:14, padding:24, maxWidth:420, width:"100%", boxShadow:"0 24px 60px rgba(0,0,0,.25)"}} onClick={e => e.stopPropagation()}>
              <h3 style={{margin:"0 0 12px", fontSize:18, fontWeight:800, color:"var(--s-text)"}}>Add office</h3>
              <div style={{display:"flex", flexDirection:"column", gap:10}}>
                <Input value={officeName} onChange={e => setOfficeName(e.target.value)} placeholder="Name (required)" aria-label="Office name" />
                <Input value={officeCity} onChange={e => setOfficeCity(e.target.value)} placeholder="City (optional)" aria-label="City" />
              </div>
              <div style={{marginTop:14, display:"flex", gap:8, justifyContent:"flex-end"}}>
                <OutlinedBtn onClick={() => { setAddOfficeOpen(false); setOfficeName(''); setOfficeCity(''); }}>Cancel</OutlinedBtn>
                <button onClick={async () => {
                  if (!officeName.trim()) return;
                  setSaveBusy(true);
                  try {
                    const r = await officeService.createOffice({ name: officeName.trim(), city: officeCity.trim() || null });
                    if (r.success || r.data) {
                      setOfficeName(''); setOfficeCity(''); setAddOfficeOpen(false); loadOffices();
                    } else {
                      alert(r.message || 'Failed');
                    }
                  } catch (e) {
                    if (e && e.message && e.message.includes('409')) alert('Office is in use');
                    else alert('Failed');
                  } finally { setSaveBusy(false); }
                }} disabled={saveBusy || !officeName.trim()} style={{padding:"8px 14px", borderRadius:8, border:"none", background:"#0B7A3E", color:"#fff", fontWeight:600, cursor:"pointer"}} aria-label="Create office">Create</button>
              </div>
            </div>
          </div>
        )}

        {addAgentOpen && (
          <div style={{position:"fixed", inset:0, background:"rgba(18,35,27,.55)", zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:20}} onClick={() => setAddAgentOpen(false)}>
            <div style={{background:"var(--s-card)", border:"1px solid var(--s-border)", borderRadius:14, padding:24, maxWidth:520, width:"100%", boxShadow:"0 24px 60px rgba(0,0,0,.25)", display:"flex", flexDirection:"column", gap:12}} onClick={e => e.stopPropagation()}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <h3 style={{margin:0, fontSize:18, fontWeight:800, color:"var(--s-text)"}}>{editingAgentId ? 'Edit agent' : 'Add agent'}</h3>
                <button onClick={() => setAddAgentOpen(false)} style={{background:"none", border:"none", cursor:"pointer", color:"var(--s-muted)", fontSize:18}} aria-label="Close">×</button>
              </div>

              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
                <Input value={agentForm.firstName} onChange={e => setAgentForm(f => ({...f, firstName: e.target.value}))} placeholder="First name" aria-label="First name" />
                <Input value={agentForm.lastName} onChange={e => setAgentForm(f => ({...f, lastName: e.target.value}))} placeholder="Last name" aria-label="Last name" />
              </div>
              <Input value={agentForm.email} onChange={e => setAgentForm(f => ({...f, email: e.target.value}))} placeholder="Email" aria-label="Email" />
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
                <Input value={agentForm.phoneNumber} onChange={e => setAgentForm(f => ({...f, phoneNumber: e.target.value}))} placeholder="Phone" aria-label="Phone" />
                <Input value={agentForm.address} onChange={e => setAgentForm(f => ({...f, address: e.target.value}))} placeholder="Address" aria-label="Address" />
              </div>
              {!editingAgentId && (
                <Input value={agentForm.password || ''} onChange={e => setAgentForm(f => ({...f, password: e.target.value}))} placeholder="Password (optional)" aria-label="Password" type="password" />
              )}
              {editingAgentId && (
                <div style={{display:"flex", gap:8, alignItems:"center"}}>
                  <button onClick={async () => {
                    try { setResetBusy(true); const r = await agentService.resetAgentPassword(editingAgentId); if (r.temporaryPassword) { setTempPassword(r.temporaryPassword); showToast('Password reset'); } else showToast('Reset failed', 'bad'); } catch (e) { showToast('Reset failed', 'bad'); } finally { setResetBusy(false); }
                  }} disabled={resetBusy} style={{padding:"6px 12px", borderRadius:8, border:"1px solid var(--s-border)", background:"transparent", fontSize:12, fontWeight:600, cursor:"pointer"}} aria-label="Reset password">Reset password</button>
                  <button onClick={() => { navigator.clipboard?.writeText(tempPassword); showToast('Copied'); }} disabled={!tempPassword} style={{padding:"6px 12px", borderRadius:8, border:"1px solid var(--s-border)", background:"transparent", fontSize:12, fontWeight:600, cursor:"pointer", opacity: tempPassword ? 1 : .4}} aria-label="Copy">Copy</button>
                </div>
              )}

              <div>
                <div style={{fontSize:12, fontWeight:600, color:"var(--s-text)", marginBottom:6}}>Office</div>
                <select value={agentForm.officeId} onChange={e => setAgentForm(f => ({...f, officeId: e.target.value}))} style={{width:"100%", height:36, borderRadius:10, border:"1px solid var(--s-border)", padding:"0 10px", fontSize:13, background:"var(--s-card)", color:"var(--s-text)"}} aria-label="Office">
                  <option value="">— Select office —</option>
                  {offices.map(o => <option key={o.id} value={o.id}>{o.name}{o.city ? ` (${o.city})` : ''}</option>)}
                </select>
              </div>

              <div>
                <div style={{fontSize:12, fontWeight:600, color:"var(--s-text)", marginBottom:6}}>Allowed sections</div>
                <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
                  {sectionOptions.map(s => (
                    <button key={s.id} onClick={() => toggleSection(s.id)} style={{padding:"4px 10px", borderRadius:999, border:"1px solid", borderColor: (agentForm.allowedSections||[]).includes(s.id) ? "var(--s-green)" : "var(--s-line)", background: (agentForm.allowedSections||[]).includes(s.id) ? "var(--s-green-soft)" : "transparent", color: (agentForm.allowedSections||[]).includes(s.id) ? "var(--s-green)" : "var(--s-muted)", fontSize:12, fontWeight:600, cursor:"pointer"}} aria-label={s.label}>{s.label}</button>
                  ))}
                </div>
              </div>

              <div style={{display:"flex", gap:8, marginTop:4}}>
                <OutlinedBtn onClick={async () => {
                  try {
                    const payload = { ...agentForm, allowedSections: agentForm.allowedSections || ['dashboard','students','messages','alerts'] };
                    if (editingAgentId) { await agentService.updateAgent(editingAgentId, payload); } else { const res = await agentService.createAgent(payload); if (res.temporaryPassword) setTempPassword(res.temporaryPassword); }
                    setAddAgentOpen(false); setTempPassword(''); setEditingAgentId(null); loadAgents();
                  } catch (e) { showToast('Failed to save agent', 'bad'); }
                }} disabled={saveBusy || !agentForm.firstName.trim() || !agentForm.email.trim()}>Save</OutlinedBtn>
                <OutlinedBtn onClick={() => { setAddAgentOpen(false); setEditingAgentId(null); setTempPassword(''); }} aria-label="Cancel">Cancel</OutlinedBtn>
              </div>

              {tempPassword && (
                <div style={{background:"var(--s-green-soft)", border:"1px solid var(--s-green)", borderRadius:10, padding:10}}>
                  <div style={{fontSize:12, fontWeight:600, color:"var(--s-green)", marginBottom:4}}>Temporary password (copy once)</div>
                  <div style={{display:"flex", gap:6, alignItems:"center"}}>
                    <code style={{fontSize:13, wordBreak:"break-all", color:"var(--s-text)", background:"var(--s-card)", padding:"4px 8px", borderRadius:6, flex:1}}>{tempPassword}</code>
                    <OutlinedBtn onClick={() => { navigator.clipboard?.writeText(tempPassword); showToast('Copied'); }} aria-label="Copy">Copy</OutlinedBtn>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5 Danger zone */}
        <DangerCard>
          <DangerTitle><span style={{width:28,height:28,borderRadius:"50%",background:"#FDEAEA",color:"#C62828",display:"inline-flex",alignItems:"center",justifyContent:"center"}}><FiShield size={14} /></span> Danger zone</DangerTitle>
          <DangerSub>Owner-only actions that affect the whole agency</DangerSub>

          <Row style={{borderBottom:"none", paddingBottom:8}}>
            <div>
              <RowTitle>Export students</RowTitle>
              <RowDesc>Download every case as a CSV — profile, stage, intake and money figures.</RowDesc>
            </div>
            <OutlinedBtn onClick={downloadStudentsCsv}><FiDownload size={14} /> Download CSV</OutlinedBtn>
          </Row>

          <Row style={{borderBottom:"none", paddingTop:8}}>
            <div>
              <RowTitle>Delete this agency</RowTitle>
              <RowDesc>Permanently removes the agency, every case, every document record and every account — yours included.</RowDesc>
            </div>
            <SolidRedBtn onClick={() => setDeleteDialog(true)}><FiTrash2 size={14} /> Delete agency</SolidRedBtn>
          </Row>
        </DangerCard>

        {deleteDialog && (
          <div style={{position:"fixed", inset:0, background:"rgba(18,35,27,.55)", zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:20}} onClick={() => setDeleteDialog(false)}>
            <div style={{background:"var(--s-card)", border:"1px solid var(--s-border)", borderRadius:14, padding:24, maxWidth:420, width:"100%", boxShadow:"0 24px 60px rgba(0,0,0,.25)"}} onClick={e => e.stopPropagation()}>
              <h3 style={{margin:"0 0 6px", fontSize:18, fontWeight:800, color:"var(--s-red)"}}>Delete agency</h3>
              <p style={{margin:0, fontSize:12.5, color:"var(--s-muted)", lineHeight:1.5}}>This action is disabled in this version. To delete the agency, contact the platform owner with a written request.</p>
              <div style={{marginTop:16, display:"flex", justifyContent:"flex-end", gap:8}}>
                <OutlinedBtn onClick={() => setDeleteDialog(false)}>Close</OutlinedBtn>
              </div>
            </div>
          </div>
        )}
      </Page>
    </Shell>
  );
}
