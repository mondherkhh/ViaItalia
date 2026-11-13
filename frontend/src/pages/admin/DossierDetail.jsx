import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  FiMoreVertical, FiArrowUpRight, FiBookOpen, FiCheckSquare,
  FiUser, FiFolder, FiMessageCircle
} from "react-icons/fi";

import { getDocuments, deleteDocument } from "../../api/documentService";
import universityInfoService from "../../api/universityInfoService";
import { getTasks, createTask, updateTask, deleteTask, logPayment } from "../../api/studentTaskService";
import ProfileTab from "./dossier/ProfileTab";
import DocumentsTab from "./dossier/DocumentsTab";
import UniversitiesTab from "./dossier/UniversitiesTab";
import TasksTab from "./dossier/TasksTab";
import { C } from "./dossier/tokens";

const Wrap = styled.div`
  background: ${C.bg}; min-height: 100vh; padding: .75rem; font-family: system-ui, Segoe UI, sans-serif;
  max-width: 100%; overflow-x: hidden;
  @media (max-width: 640px) { padding: .4rem; }
`;
const Inner = styled.div`
  max-width: 1200px; margin: 0 auto; min-width: 0;
  background: var(--adm-surface-solid); border: 1px solid ${C.border};
  border-radius: clamp(16px, 4vw, 24px);
  padding: clamp(.85rem, 3vw, 1.5rem);
  box-shadow: 0 4px 24px rgba(20,40,30,.08);
`;
const HeaderRow = styled.div`
  display: flex; align-items: flex-start; justify-content: space-between; gap: .75rem;
  flex-wrap: wrap; margin-bottom: .75rem;
`;
const HeaderText = styled.div` min-width: 0; flex: 1 1 220px; `;
const Title = styled.h1`
  font-size: clamp(1.25rem, 6vw, 1.6rem); font-weight: 900; letter-spacing: -.03em;
  color: ${C.text}; margin: 0 0 .15rem 0; word-break: break-word;
`;
const Sub = styled.p` font-size: .82rem; color: ${C.muted}; margin: 0; word-break: break-word; `;
const Breadcrumb = styled.div`
  font-size: .78rem; color: ${C.muted}; margin-bottom: .5rem;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
`;
const Link = styled.a` color: ${C.green}; text-decoration: none; font-weight: 600; `;
const Actions = styled.div` display: flex; gap: .5rem; align-items: center; flex-shrink: 0; `;
const Btn = styled.button`
  padding: .4rem .8rem; border-radius: 999px; border: 1px solid ${C.border};
  background: var(--adm-surface-solid); font-size: .75rem; font-weight: 600; color: ${C.muted};
  cursor: pointer; display: inline-flex; align-items: center; gap: .3rem; white-space: nowrap;
`;

/* Onglets : une seule ligne, défilement horizontal si l'écran est étroit */
const TabRow = styled.div`
  display: flex; align-items: center; gap: .25rem; flex-wrap: nowrap;
  overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none;
  border-bottom: 1px solid ${C.border}; margin-bottom: .75rem;
  &::-webkit-scrollbar { display: none; }
`;
const Tab = styled.button`
  flex: 0 0 auto; white-space: nowrap; display: inline-flex; align-items: center; gap: .3rem;
  padding: .55rem .75rem; margin-bottom: -1px;
  border-bottom: 2px solid ${p => p.$a ? C.green : "transparent"};
  color: ${p => p.$a ? C.green : C.muted};
  background: none; border-top: none; border-left: none; border-right: none;
  font-size: .8rem; font-weight: 600; cursor: pointer;
`;
const Badge = styled.span`
  font-size: .65rem; font-weight: 700; padding: .15rem .4rem; border-radius: 999px;
  background: var(--adm-hover); color: ${C.muted};
`;

/* Bouton "Move to ..." : sa propre ligne, pleine largeur sur téléphone */
const ActionBar = styled.div`
  display: flex; justify-content: flex-end; margin-bottom: .85rem;
  @media (max-width: 640px) { justify-content: stretch; }
`;
const GreenBtn = styled.a`
  background: ${C.green}; color: #fff; padding: .55rem 1.1rem; border-radius: 999px;
  text-decoration: none; font-weight: 700; font-size: .85rem;
  box-shadow: 0 2px 8px rgba(4,120,87,.25);
  display: inline-flex; align-items: center; justify-content: center; gap: .35rem; white-space: nowrap;
  @media (max-width: 640px) { width: 100%; padding: .75rem 1rem; }
`;

export default function DossierDetail({ dossier, users, payments, initialTab = "profile" }) {
  const [selectedDossier, setSelectedDossier] = useState(dossier || null);
  const [u, setU] = useState(null);

  // Documents
  const [documents, setDocuments] = useState([]);
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewGrid, setViewGrid] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState(null);

  // Onglet actif
  const [activeTab, setActiveTab] = useState(initialTab);
  useEffect(() => { setActiveTab(initialTab); }, [initialTab]);

  // Universités
  const [uniApps, setUniApps] = useState([]);
  const [uniLoading, setUniLoading] = useState(false);
  const [uniError, setUniError] = useState(null);

  // Tâches
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState(null);

  const d = selectedDossier;
  const userObj = u || {};
  const studentId = dossier?.userId ?? userObj?.id;

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
      setDocError((e?.response?.data?.message) || (e?.message) || (e?.status ? "HTTP " + e.status : "Document load failed"));
    } finally {
      setDocLoading(false);
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
      setUniError((e?.response?.data?.message) || (e?.message) || "Load failed");
      setUniApps([]);
    } finally { setUniLoading(false); }
  };

  const loadTasks = async () => {
    if (!studentId) return;
    setTasksLoading(true); setTasksError(null);
    try {
      const res = await getTasks(studentId);
      const arr = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : (Array.isArray(res?.tasks) ? res.tasks : []));
      setTasks(arr);
    } catch (e) {
      setTasks([]);
      setTasksError((e?.response?.data?.message) || (e?.message) || "Task load failed");
    } finally { setTasksLoading(false); }
  };

  useEffect(() => {
    if (dossier) { setSelectedDossier(dossier); setU((users || []).find(x => x.id === dossier.userId) || null); }
  }, [dossier, users]);
  useEffect(() => { if (selectedDossier) loadDocuments(); }, [selectedDossier]);
  useEffect(() => { if (studentId) loadUniversityInfo(); }, [studentId]);
  useEffect(() => { if (studentId) loadTasks(); }, [studentId]);

  const openTaskCount = (Array.isArray(tasks) ? tasks : []).filter((t) => t && t.status !== "DONE").length;
  const docCount = Array.isArray(documents) ? documents.length : 0;
  const uniCount = Array.isArray(uniApps) ? uniApps.length : 0;

  if (!selectedDossier) return <Wrap><Inner><p>Chargement...</p></Inner></Wrap>;

  const stageName = d.status === "PENDING" ? "Invited" : d.status === "VALIDATED" ? "Choice locked" : d.stage || "Onboarded";
  const studentPayments = payments ? payments.filter(p => p.userId === d.userId) : [];

  const universityInfo = userObj.universityInfo || {};
  const fieldOfStudy = universityInfo.specialty || userObj.specialty || "—";
  const targetLevel = universityInfo.level
    || userObj.level
    || (d.stage ? (d.stage === "EN_COURS" ? "In progress" : d.stage) : "Bachelor");

  const nextStageName = stageName === "Invited" ? "Onboarded" : stageName === "Choice locked" ? "Visa" : null;

  const handleDeleteDoc = async (docId) => {
    try {
      await deleteDocument(docId);
      await loadDocuments();
    } catch (e) {
      // l'erreur est affichée par la boîte de dialogue de l'onglet
    }
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
  const handleSetFinalChoice = async (id) => { await handleUpdateApp(id, { isFinalChoice: true }); };
  const handleUploadOffer = async () => { await loadUniversityInfo(); };
  const handleViewDoc = (docId) => { alert("View document: " + docId); };

  const folderStatus = (cat) => {
    const folderDocs = documents.filter(doc => (doc.category || "") === cat);
    if (folderDocs.length === 0) return { status: "Empty", count: 0 };
    const allVerified = folderDocs.every(doc => doc.status === "VERIFIED" || doc.status === "Verified");
    return { status: allVerified ? "Complete" : "Incomplete", count: folderDocs.length };
  };

  const fullName = `${userObj.firstName || ""} ${userObj.lastName || ""}`.trim();

  return (
    <Wrap>
      <Inner>
        <Breadcrumb>
          <Link href="#" onClick={e => { e.preventDefault(); window.history.back(); }}>Students</Link>
          {" / "}
          <span style={{ color: C.text, fontWeight: 700 }}>{fullName}</span>
        </Breadcrumb>

        <HeaderRow>
          <HeaderText>
            <Title>{fullName}</Title>
            <Sub>
              Case file — {stageName} — {targetLevel}
              {fieldOfStudy && fieldOfStudy !== "—" ? " in " + fieldOfStudy : ""}
            </Sub>
          </HeaderText>
          <Actions>
            <Btn style={{ background: "var(--adm-hover)", color: "var(--adm-muted)", borderColor: "var(--adm-border)" }}>
              <FiMessageCircle size={14} /> Message
            </Btn>
            <Btn aria-label="Plus"><FiMoreVertical size={14} /></Btn>
          </Actions>
        </HeaderRow>

        <TabRow>
          <Tab $a={activeTab === "profile"} onClick={() => setActiveTab("profile")}>
            <FiUser size={13} /> Profile
          </Tab>
          <Tab $a={activeTab === "documents"} onClick={() => setActiveTab("documents")}>
            <FiFolder size={13} /> Documents <Badge>{docCount}</Badge>
          </Tab>
          <Tab $a={activeTab === "universities"} onClick={() => setActiveTab("universities")}>
            <FiBookOpen size={13} /> Universities <Badge>{uniCount}</Badge>
          </Tab>
          <Tab $a={activeTab === "tasks"} onClick={() => setActiveTab("tasks")}>
            <FiCheckSquare size={13} /> Tasks <Badge>{openTaskCount}</Badge>
          </Tab>
        </TabRow>

        {nextStageName && (
          <ActionBar>
            <GreenBtn href="#" onClick={e => e.preventDefault()}>
              <FiArrowUpRight size={14} /> Move to {nextStageName}
            </GreenBtn>
          </ActionBar>
        )}

        <div style={{ display: "block", width: "100%", minWidth: 0, boxSizing: "border-box", paddingTop: 8 }}>
          {activeTab === "profile" && (
            <ProfileTab userObj={userObj} stageName={stageName} targetLevel={targetLevel} fieldOfStudy={fieldOfStudy} payments={studentPayments} dossier={d} />
          )}
          {activeTab === "documents" && (
            <DocumentsTab
              documents={documents} docLoading={docLoading} docError={docError}
              searchQuery={searchQuery} setSearchQuery={setSearchQuery}
              viewGrid={viewGrid} setViewGrid={setViewGrid}
              selectedFolder={selectedFolder} setSelectedFolder={setSelectedFolder}
              dossierId={d.id} folderCategories={folderCategories} folderStatus={folderStatus}
              studentName={userObj.firstName || ""} onReload={loadDocuments} onDeleteDoc={handleDeleteDoc}
            />
          )}
          {activeTab === "universities" && (
            <UniversitiesTab
              loading={uniLoading} error={uniError} onReload={loadUniversityInfo} applications={uniApps}
              studentId={userObj?.id} dossierId={d?.id}
              onCreate={handleCreateApp} onUpdate={handleUpdateApp} onDelete={handleDeleteApp}
              onSetFinalChoice={handleSetFinalChoice} onUploadOfferLetter={handleUploadOffer} onViewDocument={handleViewDoc}
            />
          )}
          {activeTab === "tasks" && (
            <TasksTab
              tasks={tasks} loading={tasksLoading} error={tasksError} onReload={loadTasks}
              studentId={studentId} dossierId={d?.id}
              onCreateTask={createTask} onUpdateTask={updateTask} onDeleteTask={deleteTask} onLogPayment={logPayment}
            />
          )}
        </div>
      </Inner>
    </Wrap>
  );
}
