import React, { useState, useMemo, useEffect, useRef } from "react";
import { FiSearch, FiGrid, FiList, FiFolderPlus, FiUpload, FiMoreVertical, FiDownload, FiTrash2, FiLock } from "react-icons/fi";
import { C } from "./tokens";
import { uploadDocument, deleteDocument } from "../../../api/documentService";
import axiosInstance from "../../../api/axiosInstance";

const BORDER = "#DDE2D9";
const FOLDER_GREEN = "#17A05D";
const FOLDER_AMBER = "#C0902F";
const FOLDER_GRAY = "#98A39D";
const CARD_BG = "#EBEEE7";
const TEXT_DARK = "#12231B";
const MUTED_DARK = "#7C877F";
const REQUIRED_FILES = { Personal: 2, "Academic journey": 3, "Visa documents": 2, Translations: 2, Admissions: 2 };
const MUTED = C.muted || "#6B7A6F";
const TEXT = C.text || "#1B2B22";
const GREEN = C.green || "#047857";
const CARD = C.card || "#F4F6F3";

const FOLDERS = ["Personal", "Academic journey", "Visa documents", "Translations", "Admissions"];
const LEGACY_MAP = { Traduction: "Translations", Inscription: "Admissions", Visa: "Visa documents" };

function InlineFolderIcon({ status }) {
  const color = status === "Complete" ? FOLDER_GREEN : status === "Incomplete" ? FOLDER_AMBER : FOLDER_GRAY;
  return (
    <svg width="72" height="58" viewBox="0 0 72 58" style={{ display: "block" }}>
      <path d="M4 10a6 6 0 0 1 6-6h16l6 7h30a6 6 0 0 1 6 6v33a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6z" fill={color} />
    </svg>
  );
}

function fileKind(doc) {
  const t = (doc.type || doc.extension || "").toString().toLowerCase().replace(".", "");
  const n = (doc.fileName || "").toLowerCase();
  if (t.includes("pdf") || n.endsWith(".pdf")) return { label: "PDF", bg: "#FBE3E3", color: "#C62828" };
  if (t === "doc" || t === "docx" || n.endsWith(".doc") || n.endsWith(".docx")) return { label: "DOC", bg: "#DCE9FB", color: "#2B5FB4" };
  if (t.includes("jpg") || t.includes("jpeg") || n.endsWith(".jpg") || n.endsWith(".jpeg")) return { label: "JPG", bg: "#DDF1E4", color: "#17A05D" };
  if (t.includes("png") || n.endsWith(".png")) return { label: "PNG", bg: "#DDF1E4", color: "#17A05D" };
  return { label: (t || "PDF").toUpperCase().slice(0, 4), bg: "#F3F4F6", color: MUTED_DARK };
}

export default function DocumentsTab({
  documents = [], docLoading = false, docError = null, searchQuery = "", setSearchQuery = () => {},
  viewGrid = true, setViewGrid = () => {}, selectedFolder = null, setSelectedFolder = () => {},
  dossierId = 1, studentName = "", onReload = () => {}, onDeleteDoc = null,
}) {
  const [filterType, setFilterType] = useState("Any type");
  const [filterOwner, setFilterOwner] = useState("Anyone");
  const [filterState, setFilterState] = useState("Any state");
  const [filterSort, setFilterSort] = useState("Last modified");
  const fileInputRef = useRef(null);
  const [folderAccessState, setFolderAccessState] = useState({});
  const [folderAccessErrMsg, setFolderAccessErrMsg] = useState("");
  const [folderAccessUpdating, setFolderAccessUpdating] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [openMenuKey, setOpenMenuKey] = useState(null);
  const [openFolderMenuKey, setOpenFolderMenuKey] = useState(null);
  const menuRef = useRef(null);
  const folderMenuRef = useRef(null);

  const safeDocs = Array.isArray(documents) ? documents
    : Array.isArray(documents?.data) ? documents.data
    : Array.isArray(documents?.documents) ? documents.documents : [];

  const folders = FOLDERS.map((cat) => {
    const docs = safeDocs.filter((d) => {
      const c = (d.category || d.folder || "").toString();
      const mapped = LEGACY_MAP[c] || c;
      return mapped.toLowerCase() === cat.toLowerCase() || c.toLowerCase() === cat.toLowerCase();
    });
    const count = docs.length;
    const req = REQUIRED_FILES[cat] || 2;
    const status = count === 0 ? "Empty" : count >= req ? "Complete" : "Incomplete";
    return { name: cat, status, count, selected: selectedFolder === cat };
  });

  // Fermer les menus : clic extérieur ou Echap
  useEffect(() => {
    const handleMouse = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuKey(null);
      if (folderMenuRef.current && !folderMenuRef.current.contains(e.target)) setOpenFolderMenuKey(null);
    };
    const handleKey = (e) => {
      if (e.key === "Escape") { setOpenMenuKey(null); setOpenFolderMenuKey(null); }
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
    if (filterSort === "Last modified") rows = [...rows].sort((a, b) => new Date(b.uploadedAt || b.createdAt || 0) - new Date(a.uploadedAt || a.createdAt || 0));
    else if (filterSort === "Oldest first") rows = [...rows].sort((a, b) => new Date(a.uploadedAt || a.createdAt || 0) - new Date(b.uploadedAt || b.createdAt || 0));
    else if (filterSort === "Name A-Z") rows = [...rows].sort((a, b) => (a.title || a.fileName || "").localeCompare(b.title || b.fileName || ""));
    return rows;
  }, [safeDocs, selectedFolder, searchQuery, filterType, filterState, filterSort]);

  const handleToggleFolderAccess = async (folderName) => {
    if (!folderName || folderAccessUpdating === folderName) return;
    const studentId = dossierId || 1;
    if (!studentId || studentId === 1) {
      setFolderAccessErrMsg("Identifiant étudiant manquant (ne modifie pas le n°1)");
      return;
    }
    setFolderAccessUpdating(folderName);
    setFolderAccessErrMsg("");
    try {
      const newAllowed = !folderAccessState[folderName];
      await axiosInstance.put(`/admin/students/${studentId}/folder-access/${folderName}`, { allowed: newAllowed });
      setFolderAccessState((prev) => ({ ...prev, [folderName]: newAllowed }));
    } catch (err) {
      setFolderAccessErrMsg(err?.response?.data?.message || err?.message || "Échec mise à jour");
    } finally {
      setFolderAccessUpdating(null);
      setOpenFolderMenuKey(null);
    }
  };

  // Charger l'accès aux dossiers
  useEffect(() => {
    const studentId = dossierId;
    const lockedAll = () => { const m = {}; FOLDERS.forEach((f) => (m[f] = false)); return m; };
    if (!studentId) {
      setFolderAccessState(lockedAll());
      setFolderAccessErrMsg("Identifiant étudiant manquant");
      return;
    }
    const load = async () => {
      setFolderAccessErrMsg("");
      try {
        const res = await axiosInstance.get(`/admin/students/${studentId}/folder-access`);
        const data = res?.data?.data || res?.data || [];
        const map = {};
        if (Array.isArray(data)) data.forEach((item) => { if (item.folder) map[item.folder] = !!item.allowed; });
        FOLDERS.forEach((f) => { if (map[f] === undefined) map[f] = false; });
        setFolderAccessState(map);
      } catch (e) {
        setFolderAccessErrMsg(e?.response?.data?.message || e.message || "Erreur chargement accès");
        setFolderAccessState(lockedAll());
      }
    };
    load();
  }, [dossierId]);

  const openFilePicker = () => fileInputRef.current && fileInputRef.current.click();

  return (
    <div className="doc-root" style={{ width: "100%", minWidth: 0 }}>
      <style>{`
        .doc-root, .doc-root * { box-sizing: border-box; }
        .doc-root::before, .doc-root::after { content: none !important; display: none !important; }

        /* Le composant s'adapte à la largeur de SON conteneur (pas à l'écran) */
        .doc-wrap { container-type: inline-size; container-name: doc; width: 100%; min-width: 0; }

        /* ---- Barre d'outils ---- */
        .doc-toolbar { display: flex; gap: 12px; align-items: center; justify-content: space-between; flex-wrap: wrap; margin-bottom: 20px; }
        .doc-h1 { font-weight: 700; font-size: clamp(16px, 5cqi, 18px); color: ${TEXT}; }
        .doc-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; min-width: 0; }
        .doc-search { position: relative; flex: 1 1 220px; min-width: 0; max-width: 320px; }
        .doc-search svg { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: ${MUTED_DARK}; pointer-events: none; }
        .doc-search-input { width: 100%; padding: 9px 12px 9px 32px; border-radius: 999px; border: 1px solid ${BORDER};
          background: #fff; font-size: 14px; color: ${TEXT_DARK}; outline: none; min-width: 0; }
        .doc-toggle { display: inline-flex; border: 1px solid ${BORDER}; border-radius: 10px; overflow: hidden; flex-shrink: 0; }
        .doc-toggle button { border: none; padding: 9px 11px; cursor: pointer; display: inline-flex; align-items: center; }
        .doc-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 9px 16px;
          border-radius: 999px; font-weight: 600; font-size: 13px; white-space: nowrap; cursor: pointer; }
        .doc-light-btn { border: 1px solid ${BORDER}; background: #fff; color: ${TEXT_DARK}; }
        .doc-upload-btn { border: none; background: ${GREEN}; color: #fff; box-shadow: 0 2px 8px rgba(4,120,87,.2); }

        /* ---- Grille des dossiers (desktop / tablette) ---- */
        .folder-grid { display: grid; gap: 14px; margin-bottom: 24px; min-width: 0;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 150px), 1fr)); }
        .admin-folder-card { border-radius: 16px; padding: 16px; background: ${CARD_BG}; color: ${TEXT_DARK};
          text-align: center; cursor: pointer; min-height: 180px; display: flex; flex-direction: column;
          align-items: center; justify-content: flex-start; gap: 10px; min-width: 0; position: relative;
          box-shadow: 0 1px 2px rgba(0,0,0,.04); }
        .doc-folder-menu { position: absolute; top: 8px; right: 8px; }
        .admin-mobile-folder-content { display: none; }

        /* ---- Filtres ---- */
        .doc-filters { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
        .doc-select { flex: 1 1 120px; min-width: 0; max-width: 100%; padding: 8px 28px 8px 12px; border-radius: 999px;
          border: 1px solid ${BORDER}; font-size: 13px; background: #fff; color: ${TEXT_DARK}; cursor: pointer; }

        .doc-panel { border-radius: 16px; border: 1px solid ${BORDER}; background: ${CARD};
          padding: clamp(14px, 4cqi, 20px); width: 100%; min-width: 0; }

        /* ---- Tableau (desktop) ---- */
        .doc-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .doc-table th { text-align: left; padding: 8px 10px; font-size: 10px; text-transform: uppercase;
          letter-spacing: .08em; color: ${MUTED}; font-weight: 700; white-space: nowrap; }
        .doc-table td { padding: 10px; color: ${MUTED}; vertical-align: middle; }
        .doc-fname { font-weight: 600; color: ${TEXT}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 260px; }

        .doc-root .doc-light-btn, .doc-root .doc-light-btn svg,
        .doc-root input.doc-search-input, .doc-root select.doc-select { color: #12231B !important; }
        .doc-root .doc-light-btn, .doc-root input.doc-search-input, .doc-root select.doc-select { background: #fff !important; }
        .doc-root .doc-folder-name { color: #12231B !important; }
        .doc-root .doc-upload-btn, .doc-root .doc-upload-btn svg,
        .doc-root .admin-mobile-folder-upload, .doc-root .admin-mobile-folder-upload svg { color: #fff !important; }
        .doc-root .admin-mobile-folder-upload { background: #067D45 !important; }

        /* ================= TELEPHONE : conteneur étroit ================= */
        @container doc (max-width: 599px) {
          .doc-toolbar { flex-direction: column; align-items: stretch; gap: 10px; }
          .doc-actions { width: 100%; }
          .doc-search { flex: 1 1 100%; max-width: none; }
          .doc-btn { flex: 1 1 auto; padding: 10px 12px; }
          .doc-toggle { flex: 0 0 auto; }

          .folder-grid { grid-template-columns: 1fr; gap: 10px; margin-bottom: 18px; }
          .admin-folder-card {
            min-height: 0 !important; padding: 14px 40px 14px 14px !important; display: block !important;
            text-align: left !important; border-radius: 18px !important;
          }
          .admin-folder-card > div:not(.admin-mobile-folder-content):not(.doc-folder-menu) { display: none !important; }
          .admin-folder-card .admin-mobile-folder-content {
            display: grid !important; grid-template-columns: 44px minmax(0, 1fr);
            align-items: center; column-gap: 12px; width: 100%;
          }
          .admin-mobile-folder-icon { width: 44px; height: 38px; display: grid; place-items: center; }
          .admin-mobile-folder-icon svg { width: 44px; height: 38px; }
          .admin-mobile-folder-main { min-width: 0; }
          .admin-mobile-folder-title-row { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; }
          .admin-mobile-folder-title { color: #12231B; font-size: 15px; font-weight: 700; overflow-wrap: anywhere; }
          .admin-mobile-folder-status { padding: 2px 8px; border-radius: 8px; font-size: 11px; font-weight: 700; }
          .admin-mobile-folder-subtitle { color: #7C877F; font-size: 13px; margin-top: 4px; }
          .admin-mobile-folder-upload {
            grid-column: 1 / -1; width: 100%; margin-top: 12px; border: 0; border-radius: 10px;
            padding: 12px 8px; font-size: 14px; font-weight: 700;
            display: inline-flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer;
            box-shadow: 0 6px 14px rgba(6,125,69,.28);
          }
          .doc-folder-menu { top: 10px; right: 8px; }
        }

        /* Tableau -> cartes empilées quand la place manque */
        @container doc (max-width: 759px) {
          .doc-table, .doc-table tbody { display: block; width: 100%; }
          .doc-table thead { display: none; }
          .doc-table tr { display: grid; grid-template-columns: minmax(0, 1fr); gap: 6px; position: relative;
            height: auto !important; padding: 12px 0; border-bottom: 1px solid ${BORDER}; }
          .doc-table td { display: flex; justify-content: space-between; align-items: center; gap: 12px;
            padding: 0 !important; min-width: 0; }
          .doc-table td[data-label]::before { content: attr(data-label); font-size: 11px; font-weight: 700;
            text-transform: uppercase; letter-spacing: .06em; color: ${MUTED}; flex-shrink: 0; }
          .doc-table td.doc-first { padding-right: 32px !important; }
          .doc-table td.doc-menu-cell { position: absolute; top: 10px; right: 0; width: auto; }
          .doc-fname { max-width: 100%; }
        }

        /* ================= MODE SOMBRE ================= */
        :is(body[data-theme="dark"], body.theme-dark) .doc-root {
          --d-card: #0F2A24; --d-field: #12342C; --d-border: #24463B; --d-text: #E8F1EC; --d-muted: #9DB0A6;
        }
        :is(body[data-theme="dark"], body.theme-dark) .doc-root input.doc-search-input,
        :is(body[data-theme="dark"], body.theme-dark) .doc-root select.doc-select,
        :is(body[data-theme="dark"], body.theme-dark) .doc-root .doc-light-btn {
          background: var(--d-field) !important; color: var(--d-text) !important; border-color: var(--d-border) !important;
        }
        :is(body[data-theme="dark"], body.theme-dark) .doc-root .doc-light-btn svg { color: var(--d-text) !important; }
        :is(body[data-theme="dark"], body.theme-dark) .doc-root input.doc-search-input::placeholder { color: var(--d-muted); }
        :is(body[data-theme="dark"], body.theme-dark) .doc-root .doc-toggle { border-color: var(--d-border) !important; }
        :is(body[data-theme="dark"], body.theme-dark) .doc-root .doc-toggle button { background: var(--d-field) !important; }
        :is(body[data-theme="dark"], body.theme-dark) .doc-root .doc-toggle button[aria-pressed="true"] { background: #1B4A3A !important; }
        :is(body[data-theme="dark"], body.theme-dark) .doc-root .admin-folder-card {
          background: var(--d-card) !important; color: var(--d-text) !important; box-shadow: none !important;
        }
        :is(body[data-theme="dark"], body.theme-dark) .doc-root .admin-folder-card[data-selected="false"] { border-color: var(--d-border) !important; }
        :is(body[data-theme="dark"], body.theme-dark) .doc-root .doc-folder-name,
        :is(body[data-theme="dark"], body.theme-dark) .doc-root .admin-mobile-folder-title { color: var(--d-text) !important; }
        :is(body[data-theme="dark"], body.theme-dark) .doc-root .doc-folder-count,
        :is(body[data-theme="dark"], body.theme-dark) .doc-root .admin-mobile-folder-subtitle { color: var(--d-muted) !important; }
        :is(body[data-theme="dark"], body.theme-dark) .doc-root .st-Complete { background: transparent !important; color: #4ADE80 !important; }
        :is(body[data-theme="dark"], body.theme-dark) .doc-root .st-Incomplete { background: rgba(245,180,60,.18) !important; color: #F5C56B !important; }
        :is(body[data-theme="dark"], body.theme-dark) .doc-root .st-Empty { background: rgba(255,255,255,.08) !important; color: #B4C2BA !important; }
        :is(body[data-theme="dark"], body.theme-dark) .doc-root .doc-lock-badge.is-locked { background: rgba(255,255,255,.08) !important; color: #B4C2BA !important; }
        :is(body[data-theme="dark"], body.theme-dark) .doc-root .doc-lock-badge.is-allowed { background: rgba(74,222,128,.16) !important; color: #4ADE80 !important; }
      `}</style>

      <div className="doc-wrap">
        {/* Toolbar */}
        <div className="doc-toolbar">
          <div className="doc-h1">All documents</div>
          <div className="doc-actions">
            <div className="doc-search">
              <FiSearch size={14} />
              <input
                className="doc-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in documents..."
              />
            </div>
            <div className="doc-toggle">
              <button aria-pressed={viewGrid} onClick={() => setViewGrid(true)} style={{ background: viewGrid ? "#E8F1E8" : "#fff" }} aria-label="Grid"><FiGrid size={16} color={viewGrid ? GREEN : MUTED_DARK} /></button>
              <button aria-pressed={!viewGrid} onClick={() => setViewGrid(false)} style={{ background: !viewGrid ? "#E8F1E8" : "#fff" }} aria-label="List"><FiList size={16} color={!viewGrid ? GREEN : MUTED_DARK} /></button>
            </div>
            <button
              className="doc-btn doc-light-btn"
              onClick={async () => {
                const name = prompt("Folder name?"); if (!name) return;
                try {
                  const token = localStorage.getItem("token");
                  const res = await fetch("/api/folders", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token }, body: JSON.stringify({ dossierId: dossierId || 1, name }) });
                  const r = await res.json(); if (r.success) alert("Folder created: " + name); else alert("Failed");
                } catch (e) { alert("Error: " + (e?.message || e)); }
              }}
            >
              <FiFolderPlus size={14} /> New folder
            </button>
            <button className="doc-btn doc-upload-btn" onClick={openFilePicker}>
              <FiUpload size={14} /> Upload
            </button>
            <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={async (e) => {
              const f = e.target.files?.[0]; if (!f) return;
              const form = new FormData(); form.append("file", f); form.append("category", selectedFolder || "Personal");
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

        {folderAccessErrMsg ? (
          <div style={{ color: "#C62828", fontSize: 12, marginBottom: 12, overflowWrap: "anywhere" }}>{folderAccessErrMsg}</div>
        ) : null}

        {/* Folder grid */}
        <div className="folder-grid">
          {folders.map((f) => (
            <div
              key={f.name}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedFolder(f.selected ? null : f.name)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedFolder(f.selected ? null : f.name); } }}
              className="admin-folder-card"
              data-selected={f.selected ? "true" : "false"}
              style={{ border: f.selected ? "1.5px solid #0B7A3E" : `1px solid ${BORDER}` }}
            >
              <div className="doc-folder-menu" ref={openFolderMenuKey === f.name ? folderMenuRef : null}>
                <button type="button" style={{ border: "none", background: "transparent", cursor: "pointer", padding: 6 }} aria-label="Menu" onClick={(e) => { e.stopPropagation(); setOpenFolderMenuKey((prev) => (prev === f.name ? null : f.name)); }}>
                  <FiMoreVertical size={16} color={MUTED_DARK} />
                </button>
                {openFolderMenuKey === f.name && (
                  <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,.12)", padding: 6, minWidth: 170, zIndex: 50 }} role="menu">
                    <button type="button" disabled={folderAccessUpdating === f.name} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", padding: "10px", border: "none", background: "transparent", fontSize: 13, color: folderAccessState[f.name] ? "#B7791F" : "#0B7A3E", fontWeight: 600, cursor: folderAccessUpdating === f.name ? "not-allowed" : "pointer", borderRadius: 8, opacity: folderAccessUpdating === f.name ? 0.6 : 1 }} onClick={(e) => { e.stopPropagation(); handleToggleFolderAccess(f.name); }}>
                      <FiLock size={14} /> {folderAccessState[f.name] ? "Block student upload" : "Allow student upload"}
                    </button>
                    <div style={{ height: 1, background: "#EAEAEA", margin: "2px 0" }} />
                    <button type="button" style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", padding: "10px", border: "none", background: "transparent", fontSize: 13, color: "#C62828", fontWeight: 600, cursor: "pointer", borderRadius: 8 }} onClick={(e) => { e.stopPropagation(); setOpenFolderMenuKey(null); }}>
                      <FiTrash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Desktop / tablette */}
              <div style={{ marginTop: 14 }}><InlineFolderIcon status={f.status} /></div>
              <div className="doc-folder-name" style={{ fontWeight: 600, fontSize: 14, marginTop: 4, overflowWrap: "anywhere" }}>{f.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                <span className={"st-" + f.status} style={{ display: "inline-block", padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: f.status === "Complete" ? "transparent" : f.status === "Incomplete" ? "#FBE9C8" : "#DADEDA", color: f.status === "Complete" ? "#0B7A3E" : f.status === "Incomplete" ? "#B7791F" : "#6B746E", whiteSpace: "nowrap" }}>
                  {f.status}
                </span>
                <span className="doc-folder-count" style={{ fontSize: 12, color: MUTED_DARK }}>{f.count === 0 ? "No files" : f.count === 1 ? "1 file" : `${f.count} files`}</span>
              </div>
              <div style={{ width: "100%", textAlign: "center", marginTop: 2 }}>
                <span className={"doc-lock-badge " + (folderAccessState[f.name] ? "is-allowed" : "is-locked")} style={{ display: "inline-block", padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: folderAccessState[f.name] ? "#E8F5E9" : "#ECEFF1", color: folderAccessState[f.name] ? "#047857" : "#78909C", whiteSpace: "nowrap" }}>
                  <FiLock size={10} style={{ verticalAlign: "middle", marginRight: 2 }} /> {folderAccessState[f.name] ? "Upload allowed" : "Locked"}
                </span>
              </div>

              {/* Téléphone */}
              <div className="admin-mobile-folder-content" aria-label={`Dossier ${f.name}`}>
                <div className="admin-mobile-folder-icon"><InlineFolderIcon status={f.status} /></div>
                <div className="admin-mobile-folder-main">
                  <div className="admin-mobile-folder-title-row">
                    <span className="admin-mobile-folder-title">{f.name}</span>
                    <span
                      className={"admin-mobile-folder-status st-" + f.status}
                      style={{
                        background: f.status === "Complete" ? "transparent" : f.status === "Incomplete" ? "#FBE9C8" : "#E1E5E0",
                        color: f.status === "Complete" ? "#0B7A3E" : f.status === "Incomplete" ? "#B7791F" : "#6B746E",
                      }}
                    >
                      {f.status === "Complete" ? "Complete" : f.status === "Incomplete" ? "Being collected" : "Waiting on documents"}
                    </span>
                  </div>
                  <div className="admin-mobile-folder-subtitle">
                    {f.count === 0
                      ? (f.selected ? "No documents · you can add files here" : "No documents")
                      : `${f.count} document${f.count > 1 ? "s" : ""} · tap to open`}
                  </div>
                  <span className={"doc-lock-badge " + (folderAccessState[f.name] ? "is-allowed" : "is-locked")} style={{ display: "inline-block", marginTop: 6, padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: folderAccessState[f.name] ? "#E8F5E9" : "#ECEFF1", color: folderAccessState[f.name] ? "#047857" : "#78909C", whiteSpace: "nowrap" }}>
                    <FiLock size={10} style={{ verticalAlign: "middle", marginRight: 2 }} /> {folderAccessState[f.name] ? "Upload allowed" : "Locked"}
                  </span>
                </div>
                {f.selected && (
                  <button
                    type="button"
                    className="admin-mobile-folder-upload"
                    onClick={(e) => { e.stopPropagation(); setSelectedFolder(f.name); openFilePicker(); }}
                  >
                    <FiUpload size={16} /> Upload files
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* All documents card */}
        <div className="doc-panel">
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: TEXT }}>All documents</div>
            <div style={{ fontSize: 12, color: MUTED }}>Everything on this case, newest first</div>
          </div>

          <div className="doc-filters">
            <select className="doc-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              {["Any type", "PDF", "DOC", "JPG", "PNG"].map((v) => <option key={v}>{v}</option>)}
            </select>
            <select className="doc-select" value={filterOwner} onChange={(e) => setFilterOwner(e.target.value)}>
              {["Anyone", "Student", "Admin"].map((v) => <option key={v}>{v}</option>)}
            </select>
            <select className="doc-select" value={filterState} onChange={(e) => setFilterState(e.target.value)}>
              {["Any state", "Verified", "Pending", "Rejected"].map((v) => <option key={v}>{v}</option>)}
            </select>
            <select className="doc-select" value={filterSort} onChange={(e) => setFilterSort(e.target.value)}>
              {["Last modified", "Name A-Z", "Oldest first"].map((v) => <option key={v}>{v}</option>)}
            </select>
          </div>

          {docLoading ? (
            <div style={{ padding: 20, textAlign: "center", color: MUTED }}>Loading...</div>
          ) : docError ? (
            <div style={{ padding: 24, textAlign: "center", color: "#C58B2A" }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Document service error</div>
              <div style={{ fontSize: 13, color: MUTED, overflowWrap: "anywhere" }}>Endpoint failed: {docError?.message || String(docError)}. Check backend routes / Prisma client.</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 30, textAlign: "center", color: MUTED }}>
              <div style={{ fontWeight: 600, marginBottom: 10 }}>No documents yet</div>
              <button className="doc-btn doc-upload-btn" onClick={openFilePicker}>
                <FiUpload size={14} /> Upload
              </button>
            </div>
          ) : (
            <table className="doc-table">
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {["Document", "Folder", "Owner", "Uploaded", "Size", "State"].map((h) => <th key={h}>{h}</th>)}
                  <th style={{ width: 36 }} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc, i) => {
                  const kind = fileKind(doc);
                  const ext = (doc.extension || "pdf").toString().replace(".", "");
                  const title = (doc.title || doc.fileName || "-").replace(new RegExp("\\." + ext + "$", "i"), "");
                  const rowKey = doc.id ?? `${doc.fileName}-${i}`;
                  return (
                    <tr key={rowKey} style={{ borderBottom: `1px solid ${BORDER}`, height: 60 }}>
                      <td className="doc-first">
                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: kind.bg, color: kind.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ fontSize: 10, fontWeight: 800 }}>{kind.label}</span>
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div className="doc-fname">{title}</div>
                            <div style={{ fontSize: 11, color: MUTED, fontFamily: "monospace", overflowWrap: "anywhere" }}>{doc.fileName || "-"}</div>
                            {doc.translated ? <span style={{ display: "inline-block", marginTop: 2, padding: "1px 6px", borderRadius: 999, fontSize: 10, background: "#DCE9FB", color: "#2B5FB4", fontWeight: 600 }}>Translated</span> : null}
                          </div>
                        </div>
                      </td>
                      <td data-label="Folder">{doc.category || "-"}</td>
                      <td data-label="Owner">{(doc.owner || "-") + (doc.ownerRole === "USER" ? " · student" : "")}</td>
                      <td data-label="Uploaded" style={{ fontFamily: "monospace" }}>
                        {doc.uploadedAt || doc.createdAt ? new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                      </td>
                      <td data-label="Size" style={{ fontFamily: "monospace" }}>
                        {doc.size ? (doc.size < 1024 ? doc.size + " B" : doc.size < 1024 * 1024 ? (doc.size / 1024).toFixed(1) + " KB" : (doc.size / (1024 * 1024)).toFixed(1) + " MB") : "-"}
                      </td>
                      <td data-label="State">
                        <span style={{ fontWeight: 700, color: doc.status === "Verified" ? "#0B7A3E" : doc.status === "Pending" ? "#B7791F" : doc.status === "Rejected" ? "#C62828" : MUTED }}>{doc.status || "-"}</span>
                      </td>
                      <td className="doc-menu-cell">
                        <div style={{ position: "relative" }} ref={openMenuKey === rowKey ? menuRef : null}>
                          <button type="button" style={{ border: "none", background: "transparent", cursor: "pointer", padding: 6 }} aria-label="Menu" onClick={(e) => { e.stopPropagation(); setOpenMenuKey((prev) => (prev === rowKey ? null : rowKey)); }}>
                            <FiMoreVertical size={16} color={MUTED} />
                          </button>
                          {openMenuKey === rowKey && (
                            <div role="menu" style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,.12)", padding: 6, minWidth: 150, zIndex: 50 }}>
                              <button type="button" style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", padding: "10px", border: "none", background: "transparent", fontSize: 13, color: "#12231B", fontWeight: 600, cursor: "pointer", borderRadius: 8 }} onClick={(e) => { e.stopPropagation(); setOpenMenuKey(null); window.open(`/api/admin/documents/${doc.id}/download`, "_blank"); }}>
                                <FiDownload size={14} /> Download
                              </button>
                              {onDeleteDoc && (
                                <>
                                  <div style={{ height: 1, background: "#EAEAEA", margin: "2px 0" }} />
                                  <button type="button" style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", padding: "10px", border: "none", background: "transparent", fontSize: 13, color: "#C62828", fontWeight: 600, cursor: "pointer", borderRadius: 8 }} onClick={(e) => { e.stopPropagation(); setOpenMenuKey(null); setDeleteDialog({ doc, deleting: false, error: null }); }}>
                                    <FiTrash2 size={14} /> Delete
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog (hors du conteneur pour rester plein écran) */}
      {deleteDialog && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => !deleteDialog.deleting && setDeleteDialog(null)}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 20, maxWidth: 420, width: "100%", boxShadow: "0 20px 40px rgba(0,0,0,.2)" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: TEXT_DARK }}>Delete this document?</h3>
            <div style={{ fontWeight: 600, color: TEXT_DARK, marginBottom: 4, overflowWrap: "anywhere" }}>{deleteDialog.doc?.title || deleteDialog.doc?.fileName || "—"}</div>
            <div style={{ fontSize: 12, color: MUTED_DARK, marginBottom: 16 }}>This cannot be undone.</div>
            {deleteDialog.error && <div style={{ color: "#C62828", fontSize: 12, marginBottom: 12 }}>{deleteDialog.error}</div>}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button disabled={deleteDialog.deleting} onClick={() => setDeleteDialog(null)} style={{ padding: "10px 16px", borderRadius: 999, border: `1px solid ${BORDER}`, background: "#fff", color: TEXT_DARK, fontWeight: 600, fontSize: 13, cursor: deleteDialog.deleting ? "not-allowed" : "pointer", opacity: deleteDialog.deleting ? 0.6 : 1 }}>Cancel</button>
              <button disabled={deleteDialog.deleting} onClick={async () => {
                setDeleteDialog({ ...deleteDialog, deleting: true, error: null });
                try {
                  await deleteDocument(deleteDialog.doc.id);
                  setDeleteDialog(null);
                  if (onReload) await onReload();
                } catch (err) {
                  setDeleteDialog({ ...deleteDialog, deleting: false, error: err?.response?.data?.message || err?.message || "Delete failed" });
                }
              }} style={{ padding: "10px 16px", borderRadius: 999, border: "none", background: "#C62828", color: "#fff", fontWeight: 700, fontSize: 13, cursor: deleteDialog.deleting ? "not-allowed" : "pointer", opacity: deleteDialog.deleting ? 0.7 : 1 }}>{deleteDialog.deleting ? "Deleting…" : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}