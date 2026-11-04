import React, { useState, useMemo, useEffect, useRef } from "react";
import { FiSearch, FiGrid, FiList, FiFolderPlus, FiUpload, FiMoreVertical, FiDownload, FiCheck, FiX, FiFileText, FiTrash2, FiEye, FiLock } from "react-icons/fi";
import { C } from "./tokens";
import { uploadDocument, getDocuments, deleteDocument } from "../../../api/documentService";
import axiosInstance from "../../../api/axiosInstance";

const BORDER = "#DDE2D9";
const FOLDER_GREEN = "#17A05D";
const FOLDER_AMBER = "#C0902F";
const FOLDER_GRAY = "#98A39D";
const CARD_BG = "#EBEEE7";
const PANEL_BORDER = "#DDE2D9";
const TEXT_DARK = "#12231B";
const MUTED_DARK = "#7C877F";
const REQUIRED_FILES = { Personal: 2, "Academic journey": 3, "Visa documents": 2, Translations: 2, Admissions: 2 };
const MUTED = C.muted || "#6B7A6F";
const TEXT = C.text || "#1B2B22";
const GREEN = C.green || "#047857";
const CARD = C.card || "#F4F6F3";

const FOLDERS = ["Personal", "Academic journey", "Visa documents", "Translations", "Admissions"];

function InlineFolderIcon({ status }) {
  const color = status === "Complete" ? FOLDER_GREEN : status === "Incomplete" ? FOLDER_AMBER : FOLDER_GRAY;
  return (
    <svg width="72" height="58" viewBox="0 0 72 58" style={{ display: "block" }}>
      <path d="M4 10a6 6 0 0 1 6-6h16l6 7h30a6 6 0 0 1 6 6v33a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6z" fill={color} />
    </svg>
  );
}


export default function DocumentsTab({ documents = [], docLoading = false, docError = null, searchQuery = "", setSearchQuery = () => {}, viewGrid = true, setViewGrid = () => {}, selectedFolder = null, setSelectedFolder = () => {}, dossierId = 1, folderCategories = ["Traduction", "Inscription", "Visa"], folderStatus = () => ({}), studentName = "", onOpenToStudent = () => {}, onReload = () => {}, onDeleteDoc = null }) {
  const [filterType, setFilterType] = useState("Any type");
  const [filterOwner, setFilterOwner] = useState("Anyone");
  const [filterState, setFilterState] = useState("Any state");
  const [filterSort, setFilterSort] = useState("Last modified");
  const [uploadFile, setUploadFile] = useState(null);
  const fileInputRef = React.useRef(null);
  const [folderAccessState, setFolderAccessState] = useState({}); // { folderName: true/false }
  const [folderAccessErrMsg, setFolderAccessErrMsg] = useState("");
  const [folderAccessUpdating, setFolderAccessUpdating] = useState(null); // folder name being updated
  const [deleteDialog, setDeleteDialog] = useState(null); // { doc, deleting, error }
  const [openMenuKey, setOpenMenuKey] = useState(null);
  const [openFolderMenuKey, setOpenFolderMenuKey] = useState(null);
  const menuRef = useRef(null);
  const folderMenuRef = useRef(null);

  const safeDocs = Array.isArray(documents) ? documents : Array.isArray(documents?.data) ? documents.data : Array.isArray(documents?.documents) ? documents.documents : [];
  const docsToShow = safeDocs;
  const folderMapLegacy = {"Traduction":"Translations","Inscription":"Admissions","Visa":"Visa documents"};
  const folders = FOLDERS.map((cat) => {
    const docs = safeDocs.filter((d) => {
    const c = (d.category || d.folder || "").toString();
    const map = {"Traduction":"Translations","Inscription":"Admissions","Visa":"Visa documents"};
    const mapped = map[c] || c;
    return mapped.toLowerCase() === cat.toLowerCase() || c.toLowerCase() === cat.toLowerCase();
  });
    const count = docs.length;
    const allVerified = docs.length > 0 && docs.every((d) => d.status === "VERIFIED" || d.status === "Verified");
    const req = REQUIRED_FILES[cat] || 2;
    const status = count === 0 ? "Empty" : count >= req ? "Complete" : "Incomplete";
    return { name: cat, status, count, selected: selectedFolder === cat };
  });

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleMouse = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuKey(null);
      }
    };
    const handleKey = (e) => {
      if (e.key === "Escape") {
        setOpenMenuKey(null);
        setOpenFolderMenuKey(null);
      }
    };
    document.addEventListener("mousedown", handleMouse);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleMouse);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);
  const filtered = useMemo(() => {
    let rows = safeDocs;
    if (selectedFolder) rows = rows.filter((d) => (d.category || "") === selectedFolder);
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((d) => (d.title || d.name || d.fileName || "").toLowerCase().includes(q));
    }
    if (filterType !== "Any type") rows = rows.filter((d) => (d.type || d.extension || "").toUpperCase() === filterType);
    if (filterState !== "Any state") rows = rows.filter((d) => (d.status || "") === filterState);
    if (filterSort === "Last modified") rows = [...rows].sort((a, b) => (new Date(b.uploadedAt || b.createdAt || 0) - new Date(a.uploadedAt || a.createdAt || 0)));
    else if (filterSort === "Oldest first") rows = [...rows].sort((a, b) => (new Date(a.uploadedAt || a.createdAt || 0) - new Date(b.uploadedAt || b.createdAt || 0)));
    return rows;
  }, [safeDocs, selectedFolder, searchQuery, filterType, filterState, filterSort]);

  const filteredLength = filtered?.length || 0;

  const handleToggleFolderAccess = async (folderName) => {
    if (!folderName || folderAccessUpdating === folderName) return;
    // Need actual student userId — try prop or fall back; don't modify student 1 silently
    const studentId = dossierId || 1;
    if (!studentId || studentId === 1) {
      // If no real id available, don't call; show error in UI
      setFolderAccessErrMsg("Identifiant étudiant manquant (ne modifie pas le n°1)");
      return;
    }
    setFolderAccessUpdating(folderName);
    setFolderAccessErrMsg("");
    try {
      const newAllowed = !folderAccessState[folderName];
      const res = await axiosInstance.put(`/admin/students/${studentId}/folder-access/${folderName}`, { allowed: newAllowed });
      setFolderAccessState(prev => ({ ...prev, [folderName]: newAllowed }));
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Échec mise à jour";
      setFolderAccessErrMsg(msg);
    } finally {
      setFolderAccessUpdating(null);
      setOpenFolderMenuKey(null);
    }
  };

  // Load folder access on mount
  useEffect(() => {
    const studentId = dossierId;
    if (!studentId) {
      const defaultLocked = {}; FOLDERS.forEach(f => defaultLocked[f] = false); setFolderAccessState(defaultLocked);
      setFolderAccessErrMsg("Identifiant étudiant manquant");
      return;
    }
    const load = async () => {
      setFolderAccessErrMsg("");
      try {
        const res = await axiosInstance.get(`/admin/students/${studentId}/folder-access`);
        const data = res?.data?.data || res?.data || [];
        const map = {};
        if (Array.isArray(data)) {
          data.forEach(item => { if (item.folder) map[item.folder] = !!item.allowed; });
        }
        FOLDERS.forEach(f => { if (map[f] === undefined) map[f] = false; });
        setFolderAccessState(map);
      } catch (e) {
        setFolderAccessErrMsg(e?.response?.data?.message || e.message || "Erreur chargement accès");
        const defaultLocked = {}; FOLDERS.forEach(f => defaultLocked[f] = false); setFolderAccessState(defaultLocked);
      }
    };
    load();
  }, [dossierId]);

  return (
    <div className="doc-root" style={{ width: "100%", minWidth: 0, boxSizing: "border-box" }}>
      <style>{`
        .doc-root, .doc-root * { box-sizing: border-box; }
        .doc-root::before, .doc-root::after { content: none !important; display: none !important; }
      `}</style>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: TEXT, whiteSpace: "nowrap" }}>All documents</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <FiSearch size={14} style={{ position: "absolute", left: 10, top: 10, color: MUTED }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in documents..."
              style={{ padding: "8px 32px 8px 28px", borderRadius: 999, border: `1px solid ${BORDER}`, background: "#fff", fontSize: 13, width: 250, color: TEXT, outline: "none" }}
            />
          </div>
          <div style={{ display: "inline-flex", border: `1px solid ${BORDER}`, borderRadius: 8, overflow: "hidden" }}>
            <button onClick={() => setViewGrid(true)} style={{ border: "none", background: viewGrid ? "#E8F1E8" : "#fff", padding: 8, cursor: "pointer" }} aria-label="Grid"><FiGrid size={16} color={viewGrid ? GREEN : MUTED} /></button>
            <button onClick={() => setViewGrid(false)} style={{ border: "none", background: !viewGrid ? "#E8F1E8" : "#fff", padding: 8, cursor: "pointer" }} aria-label="List"><FiList size={16} color={!viewGrid ? GREEN : MUTED} /></button>
          </div>
          <button onClick={async () => {
            const name = prompt("Folder name?"); if (!name) return;
            try {
              // Call folder creation endpoint (backend service available via direct axios if needed)
              const token = localStorage.getItem("token");
              const res = await fetch("/api/folders", { method: "POST", headers: { "Content-Type":"application/json", Authorization: "Bearer " + token }, body: JSON.stringify({ dossierId: dossierId || 1, name }) });
              const r = await res.json(); if (r.success) alert("Folder created: " + name); else alert("Failed");
            } catch (e) { alert("Error: " + (e?.message || e)); }
          }} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 999, border: `1px solid ${BORDER}`, background: "#fff", color: TEXT, fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", cursor: "pointer" }}>
            <FiFolderPlus size={14} /> New folder
          </button>
          <button onClick={() => fileInputRef.current && fileInputRef.current.click()} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 999, background: GREEN, color: "#fff", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", border: "none", boxShadow: "0 2px 8px rgba(4,120,87,.2)", cursor: "pointer" }}>
            <FiUpload size={14} /> Upload
          </button>
          <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={async (e) => {
            const f = e.target.files?.[0]; if (!f) return;
            const form = new FormData(); form.append("file", f); form.append("category", "Personal");
            try {
              await uploadDocument(dossierId || 1, form);
              await onReload();
            } catch (err) {
              alert("Upload failed: " + (err?.message || err));
            }
            e.target.value = "";
          }} />
        </div>
      </div>

      {/* Folder grid */}
      <div className="folder-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0,1fr))", gap: 14, marginBottom: 24, minWidth: 0 }}>
        <style>{`@media (max-width: 1100px){.folder-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
        @media (max-width: 800px){.folder-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
        @media (max-width: 500px){.folder-grid{grid-template-columns:repeat(1,minmax(0,1fr))!important}}`}</style>
        {folders.map((f) => (
          <div
            key={f.name}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedFolder(f.selected ? null : f.name)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedFolder(f.selected ? null : f.name); } }}
            style={{
              border: f.selected ? `1.5px solid #0B7A3E` : `1px solid ${BORDER}`,
              borderRadius: 16,
              padding: 16,
              background: CARD_BG,
              color: TEXT,
              textAlign: "center",
              cursor: "pointer",
              height: 180,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 10,
              minWidth: 0,
              position: "relative",
              boxShadow: "0 1px 2px rgba(0,0,0,.04)",
            }}
          >
            <div style={{ position: "absolute", top: 8, right: 8 }} ref={openFolderMenuKey === f.name ? folderMenuRef : null}>
              <button type="button" style={{ border: "none", background: "transparent", cursor: "pointer" }} aria-label="Menu" onClick={(e) => { e.stopPropagation(); setOpenFolderMenuKey(prev => prev === f.name ? null : f.name); }}>
                <FiMoreVertical size={14} color={MUTED} />
              </button>
              {openFolderMenuKey === f.name && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,.12)", padding: 6, minWidth: 160, zIndex: 50 }} role="menu">
                  <button type="button" disabled={folderAccessUpdating === f.name} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", padding: "8px 10px", border: "none", background: "transparent", fontSize: 12.5, color: folderAccessState[f.name] ? "#B7791F" : "#0B7A3E", fontWeight: 600, cursor: folderAccessUpdating === f.name ? "not-allowed" : "pointer", borderRadius: 8, opacity: folderAccessUpdating === f.name ? 0.6 : 1 }} onClick={(e) => { e.stopPropagation(); handleToggleFolderAccess(f.name); }}>
                    <FiLock size={14} /> {folderAccessState[f.name] ? "Block student upload" : "Allow student upload"}
                  </button>
                  <div style={{ height: 1, background: "#EAEAEA", margin: "2px 0" }} />
                  <button type="button" style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", padding: "8px 10px", border: "none", background: "transparent", fontSize: 12.5, color: "#C62828", fontWeight: 600, cursor: "pointer", borderRadius: 8 }} onClick={(e) => { e.stopPropagation(); setOpenFolderMenuKey(null); }}>
                    <FiTrash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
            <div style={{ marginTop: 14 }}><InlineFolderIcon status={f.status} /></div>
            <div style={{ fontWeight: 600, fontSize: 14, marginTop: 4, color: TEXT }}>{f.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
              <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: f.status === "Complete" ? "transparent" : f.status === "Incomplete" ? "#FBE9C8" : "#DADEDA", color: f.status === "Complete" ? "#0B7A3E" : f.status === "Incomplete" ? "#B7791F" : "#6B746E", whiteSpace: "nowrap" }}>
                {f.status}
              </span>
              <span style={{ fontSize: 12, color: "#7C877F" }}>{f.count === 0 ? "Empty / No files" : f.count === 1 ? "1 file" : `${f.count} files`}</span>
            </div>
            <div style={{ width: "100%", textAlign: "center", marginTop: 2 }}>
              <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: folderAccessState[f.name] ? "#E8F5E9" : "#ECEFF1", color: folderAccessState[f.name] ? "#047857" : "#78909C", whiteSpace: "nowrap" }}>
                <FiLock size={10} style={{ verticalAlign: "middle", marginRight: 2 }} /> {folderAccessState[f.name] ? "Upload allowed" : "Locked"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirmation dialog */}
      {deleteDialog && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => !deleteDialog.deleting && setDeleteDialog(null)}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, maxWidth: 420, width: "100%", boxShadow: "0 20px 40px rgba(0,0,0,.2)" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: TEXT }}>Delete this document?</h3>
            <div style={{ fontWeight: 600, color: TEXT, marginBottom: 4 }}>{deleteDialog.doc?.title || deleteDialog.doc?.fileName || "—"}</div>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 16 }}>This cannot be undone.</div>
            {deleteDialog.error && <div style={{ color: "#C62828", fontSize: 12, marginBottom: 12 }}>{deleteDialog.error}</div>}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button disabled={deleteDialog.deleting} onClick={() => setDeleteDialog(null)} style={{ padding: "8px 14px", borderRadius: 999, border: `1px solid ${BORDER}`, background: "#fff", fontWeight: 600, fontSize: 13, cursor: deleteDialog.deleting ? "not-allowed" : "pointer", opacity: deleteDialog.deleting ? 0.6 : 1 }}>Cancel</button>
              <button disabled={deleteDialog.deleting} onClick={async () => { setDeleteDialog({ ...deleteDialog, deleting: true, error: null }); try { await deleteDocument(deleteDialog.doc.id); setDeleteDialog(null); if (onReload) await onReload(); } catch (err) { setDeleteDialog({ ...deleteDialog, deleting: false, error: err?.response?.data?.message || err?.message || "Delete failed" }); } }} style={{ padding: "8px 14px", borderRadius: 999, border: "none", background: "#C62828", color: "#fff", fontWeight: 700, fontSize: 13, cursor: deleteDialog.deleting ? "not-allowed" : "pointer", opacity: deleteDialog.deleting ? 0.7 : 1 }}>{deleteDialog.deleting ? "Deleting…" : "Delete"}</button>
            </div>
          </div>
        </div>
      )}

      {/* All documents card */}
      <div style={{ borderRadius: 16, border: `1px solid ${BORDER}`, background: CARD, padding: 20, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: TEXT }}>All documents</div>
            <div style={{ fontSize: 12, color: MUTED }}>Everything on this case, newest first</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: "6px 28px 6px 10px", borderRadius: 999, border: `1px solid ${BORDER}`, fontSize: 12, background: "#fff", color: TEXT, cursor: "pointer" }}>
            {["Any type", "PDF", "DOC", "JPG", "PNG"].map((v) => <option key={v}>{v}</option>)}
          </select>
          <select value={filterOwner} onChange={(e) => setFilterOwner(e.target.value)} style={{ padding: "6px 28px 6px 10px", borderRadius: 999, border: `1px solid ${BORDER}`, fontSize: 12, background: "#fff", color: TEXT, cursor: "pointer" }}>
            {["Anyone", "Student", "Admin"].map((v) => <option key={v}>{v}</option>)}
          </select>
          <select value={filterState} onChange={(e) => setFilterState(e.target.value)} style={{ padding: "6px 28px 6px 10px", borderRadius: 999, border: `1px solid ${BORDER}`, fontSize: 12, background: "#fff", color: TEXT, cursor: "pointer" }}>
            {["Any state", "Verified", "Pending", "Rejected"].map((v) => <option key={v}>{v}</option>)}
          </select>
          <select value={filterSort} onChange={(e) => setFilterSort(e.target.value)} style={{ padding: "6px 28px 6px 10px", borderRadius: 999, border: `1px solid ${BORDER}`, fontSize: 12, background: "#fff", color: TEXT, cursor: "pointer" }}>
            {["Last modified", "Name A-Z", "Oldest first"].map((v) => <option key={v}>{v}</option>)}
          </select>
        </div>

        {docLoading ? <div style={{ padding: 20, textAlign: "center", color: MUTED }}>Loading...</div> : docError ? (
          <div style={{ padding: 24, textAlign: "center", color: "#C58B2A" }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Document service error</div>
            <div style={{ fontSize: 13, color: MUTED }}>Endpoint failed: {docError?.message || String(docError)}. Check backend routes / Prisma client.</div>
          </div>
        ) : (
          <>
            {filtered.length === 0 ? (
              <div style={{ padding: 30, textAlign: "center", color: MUTED }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>No documents yet</div>
                <button style={{ padding: "8px 16px", borderRadius: 999, background: GREEN, color: "#fff", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                  <FiUpload size={14} style={{ verticalAlign: "middle", marginRight: 6 }} /> Upload
                </button>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                    {["Document", "Folder", "Owner", "Uploaded", "Size", "State"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: 10, textTransform: "uppercase", letterSpacing: ".08em", color: MUTED, fontWeight: 700, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                    <th style={{ width: 36 }} />
                  </tr>
                </thead>
                <tbody>
                  {(filtered || []).map((doc, i) => (
                    <tr key={doc.id || i} style={{ borderBottom: `1px solid ${BORDER}`, height: 60 }}>
                      <td style={{ padding: "10px", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: ((doc.type||"").toLowerCase().replace(".","").includes("pdf")||(doc.extension||"").toLowerCase()==="pdf"||(doc.fileName||"").toLowerCase().endsWith(".pdf")) ? "#FBE3E3" : (doc.type||"").toUpperCase()==="DOC" ? "#DCE9FB" : ((doc.type||"").toLowerCase().includes("jpg")||(doc.type||"").toLowerCase().includes("png")||(doc.extension||"").toLowerCase()==="jpg"||(doc.extension||"").toLowerCase()==="png"||(doc.fileName||"").toLowerCase().match(/.(jpg|png)/)) ? "#DDF1E4" : "#F3F4F6", color: ((doc.type||"").toLowerCase().replace(".","").includes("pdf")||((doc.fileName||"").toLowerCase().endsWith(".pdf"))) ? "#C62828" : (doc.type||"").toUpperCase()==="DOC" ? "#2B5FB4" : ((doc.type||"").toLowerCase().includes("jpg")||(doc.type||"").toLowerCase().includes("png")) ? "#17A05D" : MUTED, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, flexShrink: 0 }}><span style={{fontSize:10,fontWeight:800}}>{((doc.type||"").toLowerCase().replace(".","").includes("pdf")||((doc.fileName||"").toLowerCase().endsWith(".pdf"))) ? "PDF" : (doc.type||"").toUpperCase()==="DOC" ? "DOC" : ((doc.type||"").toLowerCase().includes("jpg")||(doc.fileName||"").toLowerCase().endsWith(".jpg")) ? "JPG" : ((doc.type||"").toLowerCase().includes("png")||(doc.fileName||"").toLowerCase().endsWith(".png")) ? "PNG" : (doc.type||"PDF").toUpperCase()}</span></div>
                          <div>
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: TEXT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 260 }}>{(doc.title || doc.fileName || "-").replace(new RegExp("." + (doc.extension || "pdf") + "$"), "")}</div>
                            <div style={{ fontSize: 11, color: MUTED, fontFamily: "monospace" }}>{doc.fileName || "-"}</div>
                            {(doc.translated) ? <span style={{ display: "inline-block", marginTop: 2, padding: "1px 6px", borderRadius: 999, fontSize: 10, background: "#DCE9FB", color: "#2B5FB4", fontWeight: 600 }}>Translated</span> : null}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "10px", color: MUTED }}>{doc.category || "-"}</td>
                      <td style={{ padding: "10px", color: MUTED }}>{(doc.owner || "-") + (doc.ownerRole === "USER" ? " · student" : "")}</td>
                      <td style={{ padding: "10px", color: MUTED, fontFamily: "monospace" }}>
                        {doc.uploadedAt || doc.createdAt ? new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                      </td>
                      <td style={{ padding: "10px", color: MUTED, fontFamily: "monospace" }}>
                        {doc.size ? (doc.size < 1024 ? doc.size + " B" : doc.size < 1024 * 1024 ? (doc.size / 1024).toFixed(1) + " KB" : (doc.size / (1024 * 1024)).toFixed(1) + " MB") : "-"}
                      </td>
                      <td style={{ padding: "10px" }}>
                        <span style={{ fontWeight: 700, color: doc.status === "Verified" ? "#0B7A3E" : doc.status === "Pending" ? "#B7791F" : doc.status === "Rejected" ? "#C62828" : MUTED }}>{doc.status || "-"}</span>
                      </td>
                      <td style={{ padding: "10px", verticalAlign: "middle" }}>
                        {(() => {
                          const rowKey = doc.id ?? `${doc.fileName}-${i}`;
                          return (
                            <div style={{ position: "relative" }} ref={openMenuKey === rowKey ? menuRef : null}>
                              <button type="button" style={{ border: "none", background: "transparent", cursor: "pointer" }} aria-label="Menu" onClick={(e) => { e.stopPropagation(); setOpenMenuKey(prev => prev === rowKey ? null : rowKey); }}>
                                <FiMoreVertical size={14} color={MUTED} />
                              </button>
                              {openMenuKey === rowKey && (
                                <div role="menu" style={{ position: "absolute", right: 0, top: "auto", bottom: "calc(100% + 4px)", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,.12)", padding: 6, minWidth: 140, zIndex: 50 }}>
                                  <button type="button" style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", padding: "8px 10px", border: "none", background: "transparent", fontSize: 12.5, color: "#12231B", fontWeight: 600, cursor: "pointer", borderRadius: 8 }} onClick={(e) => { e.stopPropagation(); setOpenMenuKey(null); window.open(`/api/admin/documents/${doc.id}/download`, '_blank'); }}>
                                    <FiDownload size={14} /> Download
                                  </button>
                                  <div style={{ height: 1, background: "#EAEAEA", margin: "2px 0" }} />
                                  {onDeleteDoc && (
                                    <button type="button" style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", padding: "8px 10px", border: "none", background: "transparent", fontSize: 12.5, color: "#C62828", fontWeight: 600, cursor: "pointer", borderRadius: 8 }} onClick={(e) => { e.stopPropagation(); setOpenMenuKey(null); setDeleteDialog({ doc, deleting: false, error: null }); }}>
                                      <FiTrash2 size={14} /> Delete
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
}
