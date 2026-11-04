import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  FiSend, FiMoreVertical, FiArrowUpRight, FiCreditCard, FiBookOpen,
  FiMail, FiPhone, FiMapPin, FiFileText, FiCheckSquare,
  FiUser, FiFolder,
  FiMessageCircle, FiCalendar,
  FiSearch, FiGrid, FiList, FiPlus, FiUpload, FiChevronDown, FiDownload, FiTrash2, FiCheck,
  FiEye, FiFolderPlus
} from "react-icons/fi";

import { getDocuments, uploadDocument, updateDocument, deleteDocument } from "../../api/documentService";
import universityInfoService from "../../api/universityInfoService";
import { getTasks, createTask, updateTask, deleteTask, logPayment } from "../../api/studentTaskService";
import ProfileTab from "./dossier/ProfileTab";
import DocumentsTab from "./dossier/DocumentsTab";
import UniversitiesTab from "./dossier/UniversitiesTab";
import TasksTab from "./dossier/TasksTab";
import { C } from "./dossier/tokens";

const Wrap = styled.div` background: ${C.bg}; min-height: 100vh; padding: .75rem; font-family: system-ui, Segoe UI, sans-serif; `;
const Inner = styled.div` max-width: 1200px; margin: 0 auto; background: var(--adm-surface-solid); border: 1px solid ${C.border}; border-radius: 24px; padding: 1.25rem 1.5rem; box-shadow: 0 4px 24px rgba(20,40,30,.08); `;
const HeaderRow = styled.div` display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-bottom: .75rem; `;
const Title = styled.h1` font-size: 1.6rem; font-weight: 900; letter-spacing: -.03em; color: ${C.text}; margin: 0 0 .15rem 0; `;
const Sub = styled.p` font-size: .82rem; color: ${C.muted}; margin: 0; `;
const Breadcrumb = styled.div` font-size: .78rem; color: ${C.muted}; margin-bottom: .5rem; `;
const Link = styled.a` color: ${C.green}; text-decoration: none; font-weight: 600; `;
const Actions = styled.div` display: flex; gap: .5rem; align-items: center; `;
const Btn = styled.button` padding: .35rem .7rem; border-radius: 999px; border: 1px solid ${C.border}; background: var(--adm-surface-solid); font-size: .75rem; font-weight: 600; color: ${C.muted}; cursor: pointer; display: inline-flex; align-items: center; gap: .3rem; `;
const TabRow = styled.div` display: flex; align-items: center; gap: .5rem; border-bottom: 1px solid ${C.border}; padding-bottom: .25rem; margin-bottom: .75rem; flex-wrap: wrap; `;
const Tab = styled.button` padding: .35rem .7rem; border-bottom: 2px solid ${p => p.$a ? C.green : "transparent"}; color: ${p => p.$a ? C.green : C.muted}; background: none; border-top: none; border-left: none; border-right: none; font-size: .78rem; font-weight: 600; cursor: pointer; `;
const Badge = styled.span` font-size: .65rem; font-weight: 700; padding: .15rem .35rem; border-radius: 999px; background: var(--adm-hover); color: ${C.muted}; `;
const GreenBtn = styled.a` background: ${C.green}; color: #fff; padding: .45rem 1rem; border-radius: 999px; text-decoration: none; font-weight: 700; font-size: .82rem; box-shadow: 0 2px 8px rgba(4,120,87,.25); display: inline-flex; align-items: center; gap: .35rem; white-space: nowrap; `;
const TwoCol = styled.div` display: grid; grid-template-columns: 1fr 2fr; gap: 1.25rem; @media (max-width: 1024px) { grid-template-columns: 1fr; } `;
const Card = styled.div` background: ${C.card}; border: 1px solid ${C.border}; border-radius: 20px; padding: 1rem; box-shadow: 0 2px 12px rgba(20,40,30,.05); `;
const DarkCard = styled.div`
  background-color: #07201F;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(20, 90, 80, 0.35) 0%, transparent 60%),
    radial-gradient(circle at 80% 70%, rgba(20, 90, 80, 0.3) 0%, transparent 55%),
    radial-gradient(circle at 50% 50%, rgba(20, 90, 80, 0.2) 0%, transparent 70%),
    linear-gradient(135deg, #07201F 0%, #0B2B2A 100%);
  border-radius: 20px; padding: 1.25rem; color: #fff; text-align: center;
  box-shadow: 0 8px 30px rgba(7,32,31,.35); position: relative; overflow: hidden;
`;
const Avatar = styled.div` width: 96px; height: 96px; border-radius: 50%; margin: 0 auto .6rem; background: rgba(255,255,255,.12); border: 2px solid rgba(255,255,255,.25); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; font-weight: 900; letter-spacing: -.02em; `;
const StagePill = styled.span` display: inline-block; font-size: .65rem; font-weight: 800; padding: .15rem .5rem; border-radius: 999px; background: rgba(255,255,255,.15); color: #fff; border: 1px solid rgba(255,255,255,.2); `;
const StatRow = styled.div` display: grid; grid-template-columns: repeat(3, 1fr); gap: .5rem; margin-top: .75rem; `;
const StatBox = styled.div` background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15); border-radius: 12px; padding: .6rem .3rem; text-align: center; `;
const StatNum = styled.div` font-weight: 900; font-size: 1.05rem; `;
const StatLab = styled.div` font-size: .65rem; color: rgba(255,255,255,.7); `;
const Grid3 = styled.div` display: grid; grid-template-columns: repeat(3, 1fr); gap: .6rem; @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); } `;
const Grid4 = styled.div` display: grid; grid-template-columns: repeat(4, 1fr); gap: .6rem; `;
const Field = styled.div` `;
const Label = styled.div` font-size: .6rem; text-transform: uppercase; letter-spacing: .12em; color: ${C.muted}; font-weight: 700; margin-bottom: .15rem; `;
const Value = styled.div` font-size: .85rem; color: ${C.text}; font-weight: 500; `;

export default function DossierDetail({ dossier, users, payments, initialTab = "profile" }) {
  const [selectedDossier, setSelectedDossier] = useState(dossier || null);
  const [u, setU] = useState(null);
  // Documents tab state + real service
  const [documents, setDocuments] = useState([]);
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewGrid, setViewGrid] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  useEffect(() => { setActiveTab(initialTab); }, [initialTab]);
  const [uniApps, setUniApps] = useState([]);
  const [uniLoading, setUniLoading] = useState(false);
  const [uniError, setUniError] = useState(null);
  // Tasks tab state (before any hook using it)
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState(null);

  const loadDocuments = async () => {
    if (!selectedDossier) return;
    setDocLoading(true);
    setDocError(null);
    try {
      const res = await getDocuments(selectedDossier.id);
      const arr = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : (Array.isArray(res?.documents) ? res.documents : []));
      setDocuments(arr);
    } catch (e) {
      setDocuments([]);
      const msg = (e?.response?.data?.message) || (e?.message) || (e?.status ? "HTTP " + e.status : "Document load failed");
      setDocError(msg);
    } finally {
      setDocLoading(false);
    }
  };

  useEffect(() => {
    if (dossier) { setSelectedDossier(dossier); setU((users || []).find(x => x.id === dossier.userId) || null); }
  }, [dossier, users]);
  useEffect(() => { if (selectedDossier) loadDocuments(); }, [selectedDossier]);
  const d = selectedDossier; const userObj = u || {}; const studentId = dossier?.userId ?? userObj?.id;
  useEffect(() => { if (studentId) loadUniversityInfo(); }, [studentId]);
  // Load tasks for student
  const loadTasks = async () => {
    if (!studentId) return;
    setTasksLoading(true); setTasksError(null);
    try {
      const res = await getTasks(studentId);
      const arr = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : (Array.isArray(res?.tasks) ? res.tasks : []));
      setTasks(arr);
    } catch (e) {
      setTasks([]); const msg = (e?.response?.data?.message) || (e?.message) || "Task load failed"; setTasksError(msg);
    } finally { setTasksLoading(false); }
  };
  useEffect(() => { if (studentId) loadTasks(); }, [studentId]);
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const openTaskCount = safeTasks.filter((t) => t && t.status !== "DONE").length;
  const docArray = Array.isArray(documents) ? documents : [];
  const uniArray = Array.isArray(uniApps) ? uniApps : [];

  if (!selectedDossier) return <Wrap><Inner><p>Chargement...</p></Inner></Wrap>;

  const stageName = d.status === "PENDING" ? "Invited" : d.status === "VALIDATED" ? "Choice locked" : d.stage || "Onboarded";
  const initials = ((userObj.firstName || "ST").slice(0,2)).toUpperCase();
  const studentPayments = payments ? payments.filter(p => p.userId === d.userId) : [];
  const collected = studentPayments.filter(p => p.status === "PAID").reduce((a,b) => a + (b.amount || 0), 0);
  const totalFeeData = (d && d.fee ? d.fee : null);
  const totalFee = totalFeeData ? totalFeeData : (studentPayments && studentPayments.length > 0 ? 4500 : null);
  const remaining = totalFee ? Math.max(0, totalFee - collected) : 0;

  // Real data mappings (no source = show "-")
  const universityInfo = userObj.universityInfo || {};
  const fieldOfStudy = (userObj.universityInfo ? userObj.universityInfo.specialty : null)
    || (universityInfo ? universityInfo.specialty : null)
    || (userObj.specialty ? userObj.specialty : null)
    || "—";
  const completedEducation = (userObj.completedEducation ? userObj.completedEducation : null)
    || (universityInfo ? universityInfo.level : null)
    || (d.stage ? (d.stage === "EN_COURS" ? "In progress" : d.stage) : null)
    || "—";
  const targetLevel = (universityInfo ? universityInfo.level : null)
    || (userObj.level ? userObj.level : null)
    || (d.stage ? (d.stage === "EN_COURS" ? "In progress" : d.stage) : "Bachelor");

  const nextStageName = stageName === "Invited" ? "Onboarded" : stageName === "Choice locked" ? "Visa" : null;

  // Language data: real if available
  const studyLanguages = (userObj.studyLanguages || universityInfo.languages || []);
  const langChecked = (code) => studyLanguages.some(l => (l && l.toString && l.toString()) === code) || code === "ENG" || code === "ITA";

  const handleDeleteDoc = async (docId) => {
    try {
      await deleteDocument(docId);
      await loadDocuments();
    } catch (e) {
      // error shown by tab dialog; no global alert
    }
  };

  const loadUniversityInfo = async () => {
    if (!studentId) return;
    setUniLoading(true); setUniError(null);
    try {
      const res = await universityInfoService.getUniversityInfoByUserId(studentId);
      const raw = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : (Array.isArray(res?.universityInfo) ? res.universityInfo : (res?.data ? [res.data] : [])));
      setUniApps(raw);
    } catch (e) {
      const msg = (e?.response?.data?.message) || (e?.message) || "Load failed";
      setUniError(msg); setUniApps([]);
    } finally { setUniLoading(false); }
  };

  const folderCategories = ["Traduction", "Inscription", "Visa"];

  const handleCreateApp = async (data) => {
    if (studentId && universityInfoService.createUniversityInfo) {
      try {
        await universityInfoService.createUniversityInfo({ ...data, userId: studentId });
        await loadUniversityInfo();
      } catch (e) { console.error("create app error:", e); }
    }
  };
  const handleUpdateApp = async (id, data) => {
    if (!universityInfoService.updateUniversityInfo) return;
    try {
      await universityInfoService.updateUniversityInfo(id, data);
      await loadUniversityInfo();
    } catch (e) { console.error("update app error:", e); }
  };
  const handleDeleteApp = async (id) => {
    if (!universityInfoService.deleteUniversityInfo) return;
    try {
      await universityInfoService.deleteUniversityInfo(id);
      await loadUniversityInfo();
    } catch (e) { console.error("delete app error:", e); }
  };
  const handleSetFinalChoice = async (id) => {
    await handleUpdateApp(id, { isFinalChoice: true });
  };
  const handleUploadOffer = async (id) => {
    // Placeholder for document upload integration; in full flow this links offerDocumentId
    await loadUniversityInfo();
  };
  const handleViewDoc = (docId) => {
    // Placeholder: could open document preview
    alert("View document: " + docId);
  };

  const folderStatus = (cat) => {
    const folderDocs = documents.filter(doc => (doc.category || "") === cat);
    if (folderDocs.length === 0) return { status: "Empty", count: 0 };
    const allVerified = folderDocs.every(doc => doc.status === "VERIFIED" || doc.status === "Verified");
    return { status: allVerified ? "Complete" : "Incomplete", count: folderDocs.length };
  };

  return (
    <Wrap>
      <Inner>
        {/* D: Top part - breadcrumb uses full name; header uses full name + corrected subtitle */}
        <Breadcrumb><Link href="#" onClick={e => { e.preventDefault(); window.history.back(); }}>Students</Link> / <span style={{color:C.text,fontWeight:700}}>{(userObj.firstName || "") + " " + (userObj.lastName || "")}</span></Breadcrumb>
        <HeaderRow>
          <div>
            <Title>{userObj.firstName || ""} {userObj.lastName || ""}</Title>
            <Sub>Case file — {stageName} — {targetLevel} {fieldOfStudy && fieldOfStudy !== "—" ? "in " + fieldOfStudy : ""}</Sub>
          </div>
          <Actions>
            {/* D: Message button muted gray filled + chat bubble icon */}
            <Btn style={{background:"var(--adm-hover)", color:"var(--adm-muted)", borderColor:"var(--adm-border)"}}><FiMessageCircle size={14}/> Message</Btn>
            <Btn><FiMoreVertical size={14}/></Btn>
          </Actions>
        </HeaderRow>

        {/* D: Tab row with thin line icons; Profile badge removed */}
        <TabRow>
          <Tab $a={activeTab === "profile"} onClick={() => setActiveTab("profile")}><FiUser size={12} style={{marginRight:3}}/> Profile</Tab>
          <Tab $a={activeTab === "documents"} onClick={() => setActiveTab("documents")}><FiFolder size={12} style={{marginRight:3}}/> Documents <Badge>6</Badge></Tab>
          <Tab $a={activeTab === "universities"} onClick={() => setActiveTab("universities")}><FiBookOpen size={12} style={{marginRight:3}}/> Universities <Badge>2</Badge></Tab>
          <Tab $a={activeTab === "tasks"} onClick={() => setActiveTab("tasks")}><FiCheckSquare size={12} style={{marginRight:3}}/> Tasks <Badge>{openTaskCount}</Badge></Tab>
          <div style={{marginLeft:"auto"}}>
            {nextStageName && (
              <GreenBtn href="#"><FiArrowUpRight size={14}/> Move to {nextStageName}</GreenBtn>
            )}
          </div>
        </TabRow>

        <div style={{ display: "block", width: "100%", minWidth: 0, boxSizing: "border-box", paddingTop: 8 }}>
          {activeTab === "profile" && <ProfileTab userObj={userObj} stageName={stageName} targetLevel={targetLevel} fieldOfStudy={fieldOfStudy} payments={studentPayments} dossier={d} />}
          {activeTab === "documents" && <DocumentsTab documents={documents} docLoading={docLoading} docError={docError} searchQuery={searchQuery} setSearchQuery={setSearchQuery} viewGrid={viewGrid} setViewGrid={setViewGrid} selectedFolder={selectedFolder} setSelectedFolder={setSelectedFolder} dossierId={d.id} folderCategories={folderCategories} folderStatus={folderStatus} studentName={(userObj && userObj.firstName) || ""} onReload={loadDocuments} onDeleteDoc={handleDeleteDoc} />}
          {activeTab === "universities" && <UniversitiesTab loading={uniLoading} error={uniError} onReload={loadUniversityInfo} applications={uniApps} studentId={userObj?.id} dossierId={d?.id} onCreate={handleCreateApp} onUpdate={handleUpdateApp} onDelete={handleDeleteApp} onSetFinalChoice={handleSetFinalChoice} onUploadOfferLetter={handleUploadOffer} onViewDocument={handleViewDoc} />}
          {activeTab === "tasks" && <TasksTab tasks={tasks} loading={tasksLoading} error={tasksError} onReload={loadTasks} studentId={studentId} dossierId={d?.id} onCreateTask={createTask} onUpdateTask={updateTask} onDeleteTask={deleteTask} onLogPayment={logPayment} />}
        </div>
      </Inner>
    </Wrap>
  );
}