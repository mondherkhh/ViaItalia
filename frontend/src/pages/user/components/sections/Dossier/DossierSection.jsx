import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { useTheme } from '../../../../../contexts/ThemeContext';
import { useDossier } from '../../../hooks/useDossier';
import { FiFileText, FiEdit3, FiCheckCircle, FiCreditCard, FiSearch, FiGrid, FiList, FiUpload, FiFolderPlus, FiDownload, FiTrash2, FiMoreVertical, FiChevronRight } from 'react-icons/fi';
import {
  getStudentDocuments, uploadStudentDocument, downloadStudentDocument, deleteStudentDocument, submitStudentDocument
} from '../../../../../api/documentService';
import {
  DossierOverviewContainer,
  DossierContainer,
  HeaderSection,
  DossierTitle,
  MainCard,
  DossierDetailsCard,
  DossierDetailRow,
  DossierDetailLabel,
  DossierDetailValue,
  StepStatus,
  LoadingSpinner,
  EmptyState,
  EmptyStateIcon,
  EmptyStateText,
  StepIcon
} from './Dossier.styles';

const STATUS_CONFIG = {
  VALIDE: { color: 'success', text: 'Terminé', icon: '✓' },
  EN_COURS: { color: 'warning', text: 'En cours', icon: '🔔' },
  EN_ATTENTE: { color: 'default', text: 'En attente', icon: '○' }
};

const STEPS_CONFIG = [
  {
    id: 'traduction',
    title: 'Documents',
    icon: FiFileText,
    description: 'Traduction et validation des documents',
    statusKey: 'traductionStatus',
    canProceed: () => true
  },
  {
    id: 'inscription',
    title: 'Application',
    icon: FiEdit3,
    description: 'Inscription académique et demande d\'admission',
    statusKey: 'inscriptionStatus',
    canProceed: (dossier) => dossier.traductionStatus === 'VALIDE'
  },
  {
    id: 'acceptation',
    title: 'Acceptation',
    icon: FiCheckCircle,
    description: "En attente de réponse de l'institution",
    statusKey: 'acceptationStatus',
    canProceed: (dossier) => dossier.inscriptionStatus === 'VALIDE'
  },
  {
    id: 'visa',
    title: 'Visa',
    icon: FiCreditCard,
    description: 'Demande et approbation du visa',
    statusKey: 'visaStatus',
    canProceed: (dossier) => dossier.acceptationStatus === 'VALIDE'
  }
];

const THEME_VARS = {
  dark: {
    '--d-card': '#111f2e',
    '--d-card2': '#16283a',
    '--d-input': '#0d1c2d',
    '--d-menu': '#17212d',
    '--d-border': 'rgba(255,255,255,.14)',
    '--d-line': 'rgba(255,255,255,.12)',
    '--d-text': '#e8eef7',
    '--d-muted': '#9fb3c8',
    '--d-folder': '#5f7488',
    '--d-active': 'rgba(23,160,93,.22)',
    '--d-warn-bg': 'rgba(224,162,58,.14)',
    '--d-warn-text': '#E8B04F',
    '--d-shadow': '0 2px 14px rgba(0,0,0,.35)',

    '--d-green': '#28d28b',  '--d-green-soft': 'rgba(40,210,139,.14)',
    '--d-blue': '#60a5fa',   '--d-blue-soft': 'rgba(96,165,250,.14)',
    '--d-amber': '#f7c53a',  '--d-amber-soft': 'rgba(247,197,58,.14)',
    '--d-purple': '#a78bfa', '--d-purple-soft': 'rgba(167,139,250,.14)',
  },
  light: {
    '--d-card': '#ffffff',
    '--d-card2': '#F4F6F3',
    '--d-input': '#FAFAFA',
    '--d-menu': '#ffffff',
    '--d-border': '#DDE2D9',
    '--d-line': '#E5E8E4',
    '--d-text': '#12231B',
    '--d-muted': '#6B7872',
    '--d-folder': '#98A39D',
    '--d-active': '#E8F1E8',
    '--d-warn-bg': '#FBF0DC',
    '--d-warn-text': '#8A5A10',
    '--d-shadow': '0 1px 3px rgba(16,24,40,.06), 0 8px 24px rgba(16,24,40,.05)',

    '--d-green': '#16a34a',  '--d-green-soft': 'rgba(22,163,74,.12)',
    '--d-blue': '#2563eb',   '--d-blue-soft': 'rgba(37,99,235,.12)',
    '--d-amber': '#d97706',  '--d-amber-soft': 'rgba(217,119,6,.14)',
    '--d-purple': '#7c3aed', '--d-purple-soft': 'rgba(124,58,237,.12)',
  },
};

const FOLDER_COLORS = {
  'Personal': '#3B82F6',
  'Academic journey': '#8B5CF6',
  'Visa documents': '#F59E0B',
  'Translations': '#14B8A6',
  'Admissions': '#16A34A',
};

const FOLDER_UI = {
  complete: { label: 'Complet', folder: '#0F7A43', badgeBg: 'transparent', badgeColor: '#17A05D' },
  collecting: { label: 'En cours de collecte', folder: '#B97A1E', badgeBg: 'rgba(224,162,58,.18)', badgeColor: '#B97A1E' },
  waiting: { label: 'En attente de documents', folder: 'var(--d-folder)', badgeBg: 'var(--d-line)', badgeColor: 'var(--d-muted)' },
};

const DEFAULT_FOLDERS = ["Personal", "Academic journey", "Visa documents", "Translations", "Admissions"];

const DossierSection = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const light = theme === 'light';
  const themeVars = THEME_VARS[light ? 'light' : 'dark'];
  const accentTop = (c) => (light ? { borderTop: `3px solid var(${c})` } : {});
  const { dossier, isLoading, error } = useDossier(user?.id);
  const fileRef = useRef(null);

  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches);
  const [expandedFolder, setExpandedFolder] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploadErr, setUploadErr] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [openMenuKey, setOpenMenuKey] = useState(null);
  const [downloadingFolder, setDownloadingFolder] = useState(null);
  const [addingFilesFolder, setAddingFilesFolder] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [filterType, setFilterType] = useState('Tous');
  const [filterPerson, setFilterPerson] = useState('Tout le monde');
  const [filterStatus, setFilterStatus] = useState('Tous les états');
  const [filterSort, setFilterSort] = useState('Dernière modification');
  const [selectedFolderFilter, setSelectedFolderFilter] = useState('Tous');
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(null); // { doc, deleting, error }
  const folderMenuRef = useRef(null);
  const [folderAccessAllowed, setFolderAccessAllowed] = useState([]);
  const [folderAccessLoaded, setFolderAccessLoaded] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const onChange = (e) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  useEffect(() => {
    const onClick = () => setOpenMenuKey(null);
    const onKey = (e) => { if (e.key === 'Escape') setOpenMenuKey(null); };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('click', onClick); document.removeEventListener('keydown', onKey); };
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      html, body, * {
        -ms-overflow-style: none !important;
        scrollbar-width: none !important;
      }
      html::-webkit-scrollbar,
      body::-webkit-scrollbar,
      *::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
      ::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) document.head.removeChild(style);
    };
  }, []);

  const calculateProgress = () => {
    if (!dossier) return 0;
    const completedSteps = [
      dossier.traductionStatus === 'VALIDE',
      dossier.inscriptionStatus === 'VALIDE',
      dossier.acceptationStatus === 'VALIDE',
      dossier.visaStatus === 'VALIDE'
    ].filter(Boolean).length;
    return Math.round((completedSteps / 4) * 100);
  };

  const getNextStep = () => {
    if (!dossier) return null;
    if (dossier.traductionStatus !== 'VALIDE') return 'Traduction des documents';
    if (dossier.inscriptionStatus !== 'VALIDE') return 'Inscription académique';
    if (dossier.acceptationStatus !== 'VALIDE') return 'Acceptation de l\'institution';
    if (dossier.visaStatus !== 'VALIDE') return 'Dossier de visa';
    return 'Processus terminé';
  };

  const getStatusConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.EN_ATTENTE;

  const isStepLocked = (step) => !step.canProceed(dossier);

  const progress = calculateProgress();

  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) fetchDocs();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredDocs = useMemo(() => {
    let rows = Array.isArray(docs) ? docs : [];
    if (selectedFolderFilter !== 'Tous') rows = rows.filter((d) => (d.category || '') === selectedFolderFilter);
    if (filterType !== 'Tous') rows = rows.filter((d) => (d.type || d.extension || '').toUpperCase() === filterType.toUpperCase());
    if (filterStatus !== 'Tous les états') {
      const stateMap = { 'En attente': 'PENDING', 'Validé': 'VALIDATED', 'Refusé': 'REJECTED' };
      rows = rows.filter((d) => (d.status || '') === (stateMap[filterStatus] || filterStatus));
    }
    if (filterSort === 'Dernière modification') rows = [...rows].sort((a, b) => (new Date(b.uploadedAt || b.createdAt || 0) - new Date(a.uploadedAt || a.createdAt || 0)));
    else if (filterSort === 'Plus ancien') rows = [...rows].sort((a, b) => (new Date(a.uploadedAt || a.createdAt || 0) - new Date(b.uploadedAt || b.createdAt || 0)));
    else if (filterSort === 'Nom A-Z') rows = [...rows].sort((a, b) => (a.title || a.fileName || '').localeCompare(b.title || b.fileName || ''));
    return rows;
  }, [docs, selectedFolderFilter, filterType, filterStatus, filterSort]);

  useEffect(() => { fetchDocs(); }, []);
  const fetchDocs = async () => {
    setLoadingDocs(true); setUploadErr(null);
    try {
      const arr = await getStudentDocuments();
      setDocs(Array.isArray(arr) ? arr : (arr && Array.isArray(arr.data)) ? arr.data : []);
    } catch (e) { setUploadErr('Erreur chargement documents'); }
    setLoadingDocs(false);
  };

  useEffect(() => {
    const loadAccess = async () => {
      setFolderAccessLoaded(false);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/documents/access", { headers: { Authorization: `Bearer ${token || ""}` } });
        if (res.ok) {
          const json = await res.json();
          const allowed = (json?.data?.allowedFolders || []);
          setFolderAccessAllowed(allowed);
        } else {
          setFolderAccessAllowed([]);
        }
      } catch (e) {
        setFolderAccessAllowed([]);
      } finally {
        setFolderAccessLoaded(true);
      }
    };
    loadAccess();
  }, []);

  if (isLoading) {
    return (
      <DossierOverviewContainer style={themeVars}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh',
          gap: '1.5rem'
        }}>
          <LoadingSpinner viewBox="0 0 50 50" width="80" height="80">
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke={light ? 'rgba(37, 99, 235, 0.7)' : 'rgba(59, 130, 246, 0.6)'}
              strokeWidth="4"
            />
          </LoadingSpinner>
          <p style={{ color: 'var(--d-muted)', fontSize: '1.125rem' }}>
            Chargement de votre dossier...
          </p>
        </div>
      </DossierOverviewContainer>
    );
  }

  if (!dossier) {
    return (
      <DossierOverviewContainer style={themeVars}>
        <EmptyState>
          <EmptyStateIcon>📁</EmptyStateIcon>
          <EmptyStateText>
            <h3 style={{ color: 'var(--d-text)' }}>Aucun dossier trouvé</h3>
            <p style={{ color: 'var(--d-muted)' }}>Vous n'avez pas encore de dossier administratif</p>
          </EmptyStateText>
        </EmptyState>
      </DossierOverviewContainer>
    );
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadErr(null); setUploadSuccess(false); setUploadProgress(0);
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf','jpg','jpeg','png'].includes(ext)) { setUploadErr('Format non accepté (PDF/JPG/PNG uniquement)'); return; }
    if (file.size > 10 * 1024 * 1024) { setUploadErr('Fichier trop volumineux (10 Mo max)'); return; }
    let category = selectedFolder;
    if (!category) { setShowFolderPicker(true); return; }
    const form = new FormData(); form.append('file', file); form.append('category', category);
    try {
      await uploadStudentDocument(form, {
        onUploadProgress: (p) => { const pct = p.total ? Math.round((p.loaded / p.total) * 100) : 0; setUploadProgress(pct); }
      });
      setUploadSuccess(true); setUploadProgress(100); fetchDocs();
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) { setUploadErr(err?.response?.data?.message || 'Échec de l\'envoi — Réessayer'); console.error('UPLOAD ERR:', err?.response?.status, err?.response?.data, err?.message); }
    if (fileRef.current) fileRef.current.value = '';
  };

  const useDownloadDoc = async (id, fileName) => {
    try {
      const res = await downloadStudentDocument(id);
      const blob = res.data || res;
      const url = URL.createObjectURL(blob);
      const name = fileName || 'document';
      const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      alert('Téléchargement réussi');
    } catch (e) { alert('Téléchargement échoué'); }
  };

  const handleRetryUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.pdf,.jpg,.jpeg,.png';
    input.onchange = async (ev) => {
      const file = ev.target.files?.[0]; if (!file) return;
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['pdf','jpg','jpeg','png'].includes(ext)) return;
      const category = selectedFolder || DEFAULT_FOLDERS[0];
      const form = new FormData(); form.append('file', file); form.append('category', category);
      setUploadErr(null); setUploadSuccess(false); setUploadProgress(0);
      try {
        await uploadStudentDocument(form, {
          onUploadProgress: (p) => { const pct = p.total ? Math.round((p.loaded / p.total) * 100) : 0; setUploadProgress(pct); }
        });
        setUploadSuccess(true); setUploadProgress(100); fetchDocs();
        setTimeout(() => setUploadSuccess(false), 3000);
      } catch (err) { setUploadErr('Échec de l\'envoi — Réessayer'); }
    };
    input.click();
  };

  const handleDownload = useDownloadDoc;

  const handleDeleteDoc = async (id) => {
    if (!window.confirm('Supprimer ce document ?')) return;
    try { await deleteStudentDocument(id); fetchDocs(); } catch (e) { alert('Suppression échouée'); }
    setLoadingDocs(false);
  };

  const handleDownloadFolder = async (folder) => {
    const folderDocs = docs.filter(d => d.category === folder);
    if (folderDocs.length === 0) { alert('Aucun fichier à télécharger'); return; }
    setDownloadingFolder(folder);
    try {
      if (folderDocs.length === 1) {
        await handleDownload(folderDocs[0].id, folderDocs[0].fileName);
      } else {
        alert('Archive ZIP : ' + folder + '.zip (plusieurs fichiers — télécharger séparément)');
      }
    } catch (e) { alert('Téléchargement échoué'); }
    setDownloadingFolder(null);
  };
  const handleMenuDownload = (folder, e) => { e.stopPropagation(); handleDownloadFolder(folder); setOpenMenuKey(null); };
  const handleMenuUpload = (folder, e) => { e.stopPropagation(); setSelectedFolder(folder); setOpenMenuKey(null); fileRef.current && fileRef.current.click(); };
  const handleAddFiles = (folder) => {
    setAddingFilesFolder(folder);
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
    input.onchange = async (ev) => {
      const files = Array.from(ev.target.files || []);
      if (!files.length) { setAddingFilesFolder(null); return; }
      for (const file of files) {
        const ext = file.name.split('.').pop().toLowerCase();
        if (!['pdf','doc','docx','jpg','jpeg','png'].includes(ext)) { alert('Format non accepté : ' + file.name); continue; }
        if (file.size > 10 * 1024 * 1024) { alert('Fichier trop volumineux (10 Mo max) : ' + file.name); continue; }
        const form = new FormData(); form.append('file', file); form.append('category', folder);
        try {
          await uploadStudentDocument(form, { onUploadProgress: () => {} });
        } catch (err) { alert('Échec de l\'envoi : ' + file.name); }
      }
      fetchDocs(); setAddingFilesFolder(null);
    };
    input.click();
  };

  const selectStyle = { padding: '6px 28px 6px 10px', borderRadius: 999, border: '1px solid var(--d-border)', fontSize: 12, background: 'var(--d-input)', color: 'var(--d-text)', cursor: 'pointer' };

  const folderState = (cat) => {
    const list = docs.filter(d => d.category === cat);
    const count = list.length;
    const complete = count > 0 && list.every(d => d.status === 'VALIDATED');
    const key = complete ? 'complete' : count > 0 ? 'collecting' : 'waiting';
    return { list, count, key };
  };
  const neededFolders = folderAccessAllowed.filter(f => DEFAULT_FOLDERS.includes(f) && folderState(f).key !== 'complete');

  const inProgColor = light ? '#d97706' : '#17A05D';

  // Contraintes de largeur communes (light + dark) : le contenu ne dépasse jamais de l'écran
  const fitWidth = { width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' };

  return (
    <DossierOverviewContainer
      style={{ ...themeVars, ...(isMobile ? fitWidth : {}), paddingTop: 0, overflowX: isMobile ? 'clip' : undefined }}
    >
      <DossierContainer
        style={{ ...(isMobile ? fitWidth : {}), paddingTop: 0, marginTop: 0 }}
      >
        {/* Header Section */}
        <HeaderSection style={{ margin: 0, padding: '0.5rem 0 0', minHeight: 'auto' }}>
          <div style={{ textAlign: 'center' }}>
            <DossierTitle style={{ marginTop: 0 }}>Mon Dossier Administratif</DossierTitle>
            <p style={{ color: 'var(--d-muted)', fontSize: '1.125rem', marginTop: '0.5rem' }}>
              Suivez l'évolution de votre dossier d'admission
            </p>
          </div>
        </HeaderSection>

        {isMobile ? (
          /* ───────── Affichage téléphone : liste de dossiers ───────── */
          <section style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 12, ...fitWidth }}>
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={handleFileChange} />

            {neededFolders.length > 0 && (
              <div style={{ background: 'var(--d-warn-bg)', borderRadius: 14, padding: '14px 16px', display: 'flex', gap: 10, alignItems: 'flex-start', ...fitWidth }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--d-warn-text)', marginTop: 6, flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--d-warn-text)', lineHeight: 1.35 }}>
                    Votre conseiller a besoin de documents dans {neededFolders.join(', ')}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--d-warn-text)', opacity: 0.85, marginTop: 4, lineHeight: 1.4 }}>
                    Seuls les dossiers indiqués ci-dessous sont ouverts pour vous. Le reste est géré par votre agence.
                  </div>
                </div>
              </div>
            )}

            {DEFAULT_FOLDERS.map(cat => {
              const { list, count, key } = folderState(cat);
              const ui = FOLDER_UI[key];
              const canUpload = folderAccessAllowed.includes(cat);
              const expanded = expandedFolder === cat;
              const fc = FOLDER_COLORS[cat];
              const folderFill = light && key === 'waiting' ? fc : ui.folder;
              const subtitle = count > 0
                ? `${count} document${count > 1 ? 's' : ''} · touchez pour ouvrir`
                : (canUpload ? 'Aucun document · vous pouvez ajouter des fichiers' : 'Aucun document');
              return (
                <div
                  key={cat}
                  style={{
                    background: light ? `${fc}14` : 'var(--d-card2)',
                    border: canUpload ? '1.5px solid #17A05D' : (light ? `1px solid ${fc}40` : '1px solid var(--d-border)'),
                    borderLeft: light ? `4px solid ${fc}` : undefined,
                    borderRadius: 16,
                    padding: '14px 16px',
                    boxShadow: 'var(--d-shadow)',
                    ...fitWidth,
                  }}
                >
                  <div
                    role="button"
                    onClick={() => { if (count > 0) setExpandedFolder(expanded ? null : cat); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: count > 0 ? 'pointer' : 'default' }}
                  >
                    <FiChevronRight size={16} color="var(--d-muted)" style={{ flexShrink: 0, transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform .2s ease' }} />
                    <svg width="38" height="31" viewBox="0 0 72 58" style={{ flexShrink: 0 }}>
                      <path d="M4 10a6 6 0 0 1 6-6h16l6 7h30a6 6 0 0 1 6 6v33a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6z" style={{ fill: folderFill }} />
                    </svg>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--d-text)' }}>{cat}</span>
                        <span style={{ padding: '2px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700, background: ui.badgeBg, color: ui.badgeColor, whiteSpace: 'nowrap' }}>{ui.label}</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--d-muted)', marginTop: 3, lineHeight: 1.35 }}>{subtitle}</div>
                    </div>
                  </div>

                  {expanded && (
                    <div style={{ marginTop: 12, borderTop: '1px solid var(--d-line)' }}>
                      {list.map((doc, i) => {
                        const statusLabel = doc.submittedAt == null ? 'Brouillon' : doc.status === 'VALIDATED' ? 'Validé' : doc.status === 'REJECTED' ? 'Refusé' : 'En attente';
                        const statusColor = doc.status === 'VALIDATED' ? '#17A05D' : doc.status === 'REJECTED' ? '#E5484D' : '#B97A1E';
                        return (
                          <div key={doc.id || i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--d-line)' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--d-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.title || doc.fileName || '-'}</div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: statusColor, marginTop: 2 }}>{statusLabel}</div>
                            </div>
                            <button type="button" aria-label="Télécharger" onClick={() => handleDownload(doc.id, doc.fileName)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--d-text)', padding: 6 }}><FiDownload size={16} /></button>
                            {(doc.status !== 'VALIDATED' && doc.status !== 'Verified') && (
                              <button type="button" aria-label="Supprimer" onClick={() => setDeleteDialog({ doc, deleting: false, error: null })} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#E5484D', padding: 6 }}><FiTrash2 size={16} /></button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {canUpload && (
                    <button
                      type="button"
                      onClick={() => { setSelectedFolder(cat); fileRef.current && fileRef.current.click(); }}
                      style={{ marginTop: 12, width: '100%', border: 0, borderRadius: 12, padding: '13px 16px', background: '#0F7A43', color: '#fff', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', boxShadow: '0 6px 16px rgba(15,122,67,.3)' }}
                    >
                      <FiUpload size={16} /> Téléverser des fichiers
                    </button>
                  )}
                </div>
              );
            })}
          </section>
        ) : (
          <>
            {/* Mes documents — identique admin All docs */}
            <section style={{ marginTop: 8, padding: '20px 24px', background: 'var(--d-card)', borderRadius: 16, border: '1px solid var(--d-border)', ...accentTop('--d-green'), boxShadow: 'var(--d-shadow)' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 12 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--d-text)' }}>Tous les documents</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative' }}><FiSearch size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--d-muted)' }} /><input placeholder="Rechercher..." style={{ padding: '6px 28px 6px 28px', borderRadius: 999, border: '1px solid var(--d-border)', background: 'var(--d-input)', color: 'var(--d-text)', fontSize: 13, width: 220, outline: 'none' }} /></div>
                  <div style={{ display: 'inline-flex', border: '1px solid var(--d-border)', borderRadius: 8, overflow: 'hidden' }}><button aria-label="Grille" style={{ border: 0, background: 'var(--d-active)', padding: 6, cursor: 'pointer' }}><FiGrid size={14} color="#17A05D" /></button><button aria-label="Liste" style={{ border: 0, background: 'var(--d-card)', padding: 6, cursor: 'pointer', borderLeft: '1px solid var(--d-border)' }}><FiList size={14} color="var(--d-muted)" /></button></div>
                  <button disabled={folderAccessAllowed.length === 0} onClick={() => { if (!selectedFolder) { setShowFolderPicker(true); return; } fileRef.current && fileRef.current.click(); }} style={{ border: 0, borderRadius: 999, padding: '6px 12px', cursor: folderAccessAllowed.length === 0 ? 'not-allowed' : 'pointer', background: folderAccessAllowed.length === 0 ? '#5b6873' : 'var(--adm-green, #17A05D)', color: '#fff', fontWeight: 600, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6, opacity: folderAccessAllowed.length === 0 ? 0.7 : 1 }}><FiUpload size={12} /> Téléverser</button>
                  {folderAccessAllowed.length === 0 && folderAccessLoaded && <span style={{ fontSize: 11, color: light ? '#b45309' : '#E0A23A', fontWeight: 600 }}>L'ajout de documents sera activé par votre conseiller</span>}
                <button onClick={() => fetchDocs()} style={{ border: '1px solid var(--d-border)', borderRadius: 999, padding: '6px 10px', cursor: 'pointer', background: 'var(--d-card)', color: 'var(--d-text)', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ fontSize: 11 }}>↻</span> Actualiser</button>
                  <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={handleFileChange} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
                {['Personal','Academic journey','Visa documents','Translations','Admissions'].map(cat => {
                  const fc = FOLDER_COLORS[cat];
                  const count = docs.filter(d => d.category === cat).length;
                  return (
                  <div key={cat} onClick={() => setSelectedFolderFilter(cat === selectedFolderFilter ? 'Tous' : cat)} style={{ background: light ? `${fc}14` : 'var(--d-card2)', border: light ? `1px solid ${fc}40` : '1px solid var(--d-border)', borderRadius: 12, padding: 14, textAlign: 'center', position: 'relative', minHeight: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: 10, cursor: 'pointer', boxShadow: selectedFolderFilter === cat ? '0 0 0 2px var(--adm-green, #17A05D)' : 'var(--d-shadow)' }}>
                    <button aria-label="Menu" onClick={(e) => { e.stopPropagation(); setOpenMenuKey(openMenuKey === cat ? null : cat); }} style={{ position: 'absolute', top: 8, right: 8, border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--d-muted)', zIndex: 10 }}><FiMoreVertical size={14} /></button>
                    {openMenuKey === cat && (
                      <div ref={folderMenuRef} onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 28, right: 6, background: 'var(--d-menu)', border: '1px solid var(--d-border)', borderRadius: 12, padding: '6px 0', minWidth: 150, boxShadow: '0 8px 24px rgba(0,0,0,.25)', zIndex: 100 }}>
                        <button onClick={(e) => { e.stopPropagation(); if (!folderAccessAllowed.includes(cat)) { alert('Dossier verrouillé — accès non autorisé'); return; } handleMenuUpload(cat, e); }} style={{ width: '100%', textAlign: 'left', border: 0, background: folderAccessAllowed.includes(cat) ? 'transparent' : 'var(--d-card2)', padding: '6px 14px', fontSize: 12, color: folderAccessAllowed.includes(cat) ? 'var(--d-text)' : 'var(--d-muted)', cursor: folderAccessAllowed.includes(cat) ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 8 }} disabled={!folderAccessAllowed.includes(cat)}><FiUpload size={14} /> {folderAccessAllowed.includes(cat) ? 'Télécharger' : 'Verrouillé (accès non autorisé)'}</button>
                        <button onClick={(e) => { e.stopPropagation(); setOpenMenuKey(null); setSelectedFolderFilter(cat); }} style={{ width: '100%', textAlign: 'left', border: 0, background: 'transparent', padding: '6px 14px', fontSize: 12, color: 'var(--d-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}><FiSearch size={14} /> Ouvrir</button>
                      </div>
                    )}
                    <div style={{ width: 72, height: 58, marginTop: 14, display: 'block' }}><svg width="72" height="58" viewBox="0 0 72 58" style={{ display: 'block' }}><path d="M4 10a6 6 0 0 1 6-6h16l6 7h30a6 6 0 0 1 6 6v33a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6z" style={{ fill: light ? fc : 'var(--d-folder)' }} /></svg></div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--d-text)', marginTop: 4 }}>{cat}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: count > 0 ? 'var(--d-blue-soft)' : 'var(--d-line)', color: count > 0 ? 'var(--d-blue)' : 'var(--d-muted)', whiteSpace: 'nowrap' }}>{count > 0 ? count + ' fichier(s)' : 'Vide'}</span>
                      <span style={{ fontSize: 12, color: 'var(--d-muted)' }}>{count ? count + ' fichier' + (count > 1 ? 's' : '') : 'Aucun fichier'}</span>
                    </div>
                  </div>
                  );
                })}
              </div>
            </section>

            {/* Bloc bas : liste séparée identique admin DocumentsTab */}
            <section style={{ marginTop: 8, padding: '20px 24px', background: 'var(--d-card)', borderRadius: 16, border: '1px solid var(--d-border)', ...accentTop('--d-blue'), boxShadow: 'var(--d-shadow)' }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--d-text)', marginBottom: 4 }}>Tous les documents</div>
              <div style={{ fontSize: 12, color: 'var(--d-muted)', marginBottom: 12 }}>Tout ce qui figure sur ce dossier, du plus récent au plus ancien</div>

              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={selectStyle}>
                  {['Tous', 'PDF', 'DOC', 'JPG', 'PNG'].map(v => <option key={v}>{v}</option>)}
                </select>
                <select value={filterPerson} onChange={(e) => setFilterPerson(e.target.value)} style={selectStyle}>
                  {['Tout le monde', 'Moi', 'L\'équipe'].map(v => <option key={v}>{v}</option>)}
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={selectStyle}>
                  {['Tous les états', 'En attente', 'Validé', 'Refusé'].map(v => <option key={v}>{v}</option>)}
                </select>
                <select value={filterSort} onChange={(e) => setFilterSort(e.target.value)} style={selectStyle}>
                  {['Dernière modification', 'Plus ancien', 'Nom A-Z'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>

              {filteredDocs.length === 0 ? (
                <div style={{ padding: 30, textAlign: 'center', color: 'var(--d-muted)' }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Aucun document</div>
                  <button onClick={() => fileRef.current && fileRef.current.click()} style={{ padding: '8px 16px', borderRadius: 999, background: 'var(--adm-accent, #0F7A43)', color: '#fff', border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}><FiUpload size={14} /> Télécharger</button>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--d-border)', ...(light ? { background: 'var(--d-card2)' } : {}) }}>
                      {['Document','Dossier','Type','État','Date','Taille','Actions'].map(h => <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--d-muted)', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocs.map((doc, i) => (
                      <tr key={doc.id || i} style={{ borderBottom: '1px solid var(--d-border)', height: 60 }}>
                        <td style={{ padding: '10px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: ((doc.type||'').toLowerCase().replace('.','').includes('pdf')||(doc.fileName||'').toLowerCase().endsWith('.pdf')) ? '#FBE3E3' : (doc.type||'').toUpperCase()==='DOC' ? '#DCE9FB' : ((doc.type||'').toLowerCase().includes('jpg')||(doc.fileName||'').toLowerCase().match(/.(jpg|png)/)) ? '#DDF1E4' : '#F3F4F6', color: ((doc.type||'').toLowerCase().replace('.','').includes('pdf')||((doc.fileName||'').toLowerCase().endsWith('.pdf'))) ? '#C62828' : (doc.type||'').toUpperCase()==='DOC' ? '#2B5FB4' : ((doc.type||'').toLowerCase().includes('jpg')||(doc.fileName||'').toLowerCase().match(/.(jpg|png)/)) ? '#17A05D' : '#7A8780', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11, flexShrink: 0 }}><span style={{fontSize:10,fontWeight:800}}>{((doc.type||'').toLowerCase().replace('.','').includes('pdf')||((doc.fileName||'').toLowerCase().endsWith('.pdf'))) ? 'PDF' : (doc.type||'').toUpperCase()==='DOC' ? 'DOC' : ((doc.fileName||'').toLowerCase().match(/.(jpg|png)/)) ? 'IMG' : (doc.type||'PDF').toUpperCase()}</span></div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--d-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 260 }}>{(doc.title || doc.fileName || '-').replace(new RegExp('.' + (doc.extension || 'pdf') + '$'), '')}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '10px', color: 'var(--d-muted)' }}>{doc.category || '-'}</td>
                        <td style={{ padding: '10px', color: 'var(--d-muted)' }}>{(doc.type || doc.extension || '').toUpperCase()}</td>
                        <td style={{ padding: '10px' }}>
                          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, textTransform: 'capitalize', background: doc.submittedAt == null ? '#FFF3CD' : doc.status === 'PENDING' ? '#FBE9C8' : doc.status === 'VALIDATED' ? '#DCE9D0' : doc.status === 'REJECTED' ? '#F3F0F0' : '#F3F4F6', color: doc.submittedAt == null ? '#B7791F' : doc.status === 'PENDING' ? '#B7791F' : doc.status === 'VALIDATED' ? '#047857' : doc.status === 'REJECTED' ? '#C62828' : '#7A8780' }}>{doc.submittedAt == null ? 'Brouillon' : (doc.status || 'PENDING') === 'PENDING' ? 'En attente' : (doc.status || '') === 'VALIDATED' ? 'Validé' : (doc.status || '') === 'REJECTED' ? 'Refusé' : doc.status}</span>
                          {doc.status === 'REJECTED' && <div style={{ fontSize: 10, color: '#C62828', marginTop: 2 }}>Motif : document incomplet</div>}
                        </td>
                        <td style={{ padding: '10px', color: 'var(--d-muted)', fontFamily: 'monospace' }}>{doc.uploadedAt || doc.createdAt ? new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</td>
                        <td style={{ padding: '10px', color: 'var(--d-muted)', fontFamily: 'monospace' }}>{doc.size ? (doc.size < 1024 ? doc.size + ' B' : doc.size < 1024*1024 ? (doc.size/1024).toFixed(1) + ' KB' : (doc.size/(1024*1024)).toFixed(1) + ' MB') : '-'}</td>
                        <td style={{ padding: '10px', verticalAlign: 'middle' }}>
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <button type="button" onClick={(e) => { e.stopPropagation(); setOpenMenuKey(openMenuKey === doc.id ? null : doc.id); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }} aria-label="Menu"><FiMoreVertical size={14} color="var(--d-muted)" /></button>
                            {openMenuKey === doc.id && (
                              <div role="menu" style={{ position: 'absolute', right: 0, top: 'calc(100% + 4px)', background: 'var(--d-menu)', border: '1px solid var(--d-border)', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,.25)', padding: 6, minWidth: 140, zIndex: 50 }}>
                                <button type="button" onClick={(e) => { e.stopPropagation(); handleDownload(doc.id, doc.fileName); setOpenMenuKey(null); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: '8px 10px', border: 'none', background: 'transparent', fontSize: 12.5, color: 'var(--d-text)', fontWeight: 600, cursor: 'pointer', borderRadius: 8 }}><FiDownload size={14} /> Télécharger</button>
                                {(doc.status !== 'VALIDATED' && doc.status !== 'Verified') && (
                                  <button type="button" onClick={(e) => { e.stopPropagation(); setOpenMenuKey(null); setDeleteDialog({ doc, deleting: false, error: null }); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: '8px 10px', border: 'none', background: 'transparent', fontSize: 12.5, color: '#E5484D', fontWeight: 600, cursor: 'pointer', borderRadius: 8 }}><FiTrash2 size={14} /> Supprimer</button>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </>
        )}

        {/* Delete confirmation dialog */}
        {deleteDialog && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => !deleteDialog.deleting && setDeleteDialog(null)}>
            <div style={{ background: 'var(--d-menu)', border: '1px solid var(--d-border)', borderRadius: 16, padding: 24, maxWidth: 420, width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,.3)', ...themeVars }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: 'var(--d-text)' }}>Supprimer ce document ?</h3>
              <div style={{ fontWeight: 600, color: 'var(--d-text)', marginBottom: 4 }}>{deleteDialog.doc?.title || deleteDialog.doc?.fileName || '—'}</div>
              <div style={{ fontSize: 12, color: 'var(--d-muted)', marginBottom: 16 }}>Cette action ne peut pas être annulée.</div>
              {deleteDialog.error && <div style={{ color: '#E5484D', fontSize: 12, marginBottom: 12 }}>{deleteDialog.error}</div>}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button disabled={deleteDialog.deleting} onClick={() => setDeleteDialog(null)} style={{ padding: '8px 14px', borderRadius: 999, border: '1px solid var(--d-border)', background: 'var(--d-card)', color: 'var(--d-text)', fontWeight: 600, fontSize: 13, cursor: deleteDialog.deleting ? 'not-allowed' : 'pointer', opacity: deleteDialog.deleting ? 0.6 : 1 }}>Annuler</button>
                <button disabled={deleteDialog.deleting} onClick={async () => { setDeleteDialog({ ...deleteDialog, deleting: true, error: null }); try { await deleteStudentDocument(deleteDialog.doc.id); setDeleteDialog(null); fetchDocs(); } catch (err) { setDeleteDialog({ ...deleteDialog, deleting: false, error: err?.response?.data?.message || err?.message || 'Échec de suppression' }); } }} style={{ padding: '8px 14px', borderRadius: 999, border: 'none', background: '#C62828', color: '#fff', fontWeight: 700, fontSize: 13, cursor: deleteDialog.deleting ? 'not-allowed' : 'pointer', opacity: deleteDialog.deleting ? 0.7 : 1 }}>{deleteDialog.deleting ? 'Suppression…' : 'Supprimer'}</button>
              </div>
            </div>
          </div>
        )}

        {showFolderPicker && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setShowFolderPicker(false)}>
            <div style={{ background: 'var(--d-menu)', border: '1px solid var(--d-border)', borderRadius: 16, padding: 20, minWidth: 260, maxWidth: 360, boxShadow: '0 20px 40px rgba(0,0,0,.3)', ...themeVars }} onClick={e => e.stopPropagation()}>
              <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700, color: 'var(--d-text)' }}>Choisir un dossier</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {DEFAULT_FOLDERS.map(cat => (
                  <button key={cat} onClick={() => { setSelectedFolder(cat); setShowFolderPicker(false); fileRef.current && fileRef.current.click(); }} style={{ border: light ? `1px solid ${FOLDER_COLORS[cat]}66` : '1px solid var(--d-border)', borderRadius: 999, padding: '6px 12px', background: light ? `${FOLDER_COLORS[cat]}1A` : 'var(--d-card2)', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--d-text)' }}>{cat}</button>
                ))}
              </div>
              <button onClick={() => setShowFolderPicker(false)} style={{ marginTop: 12, border: 0, background: 'transparent', fontSize: 12, color: 'var(--d-muted)', cursor: 'pointer', textDecoration: 'underline' }}>Annuler</button>
            </div>
          </div>
        )}
        {uploadErr && <div style={{ color: '#E5484D', fontSize: 12, marginTop: 6 }}>{uploadErr}</div>}
        {uploadSuccess && <div style={{ color: light ? '#15803d' : '#28d28b', fontSize: 12, marginTop: 6 }}>Document envoyé</div>}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ height: 6, borderRadius: 999, background: 'var(--d-line)', overflow: 'hidden' }}><div style={{ height: '100%', width: uploadProgress + '%', background: 'var(--adm-green, #17A05D)', borderRadius: 999, transition: 'width 0.2s ease' }} /></div>
            <div style={{ fontSize: 11, color: 'var(--d-muted)', marginTop: 2 }}>{uploadProgress}%</div>
          </div>
        )}

        {/* Progress Card : mobile (light + dark) = pas de double cadre */}
        <MainCard
          style={(light || isMobile)
            ? { background: 'transparent', border: 'none', boxShadow: 'none', backdropFilter: 'none', padding: 0, ...(isMobile ? fitWidth : {}) }
            : undefined}
        >
          <div style={{ padding: isMobile ? '1.25rem 1rem' : '2rem', background: 'var(--d-card)', border: '1px solid var(--d-border)', ...accentTop('--d-amber'), borderRadius: '16px', boxShadow: 'var(--d-shadow)', ...(isMobile ? fitWidth : {}) }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--d-text)', textAlign: 'left', marginBottom: '0.25rem' }}>
              Progression du dossier
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--d-muted)', marginBottom: '2rem' }}>
              Suivi des étapes de votre dossier d'admission
            </p>

            {/* Stepper horizontal */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', position: 'relative', marginBottom: '2rem' }}>
              <div style={{ position: 'absolute', top: '24px', left: '12%', right: '12%', height: '2px', background: 'var(--d-line)', zIndex: 0 }} />
              {STEPS_CONFIG.map((step, index) => {
                const status = dossier[step.statusKey];
                const completed = status === 'VALIDE';
                const inProgress = status === 'EN_COURS';
                const isUpcoming = !completed && !inProgress;
                const StepIconComp = step.icon;
                return (
                  <div key={step.id} style={{ textAlign: 'center', zIndex: 1, flex: 1, minWidth: 0, position: 'relative' }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        margin: '0 auto 0.75rem auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: completed ? '#17A05D' : inProgress ? (light ? 'var(--d-amber-soft)' : 'var(--d-card)') : 'var(--d-card2)',
                        border: completed ? '2px solid #17A05D' : inProgress ? `2px solid ${inProgColor}` : '2px solid var(--d-border)',
                        boxShadow: completed ? '0 2px 6px rgba(23,160,93,0.3)' : inProgress ? (light ? '0 0 0 4px var(--d-amber-soft)' : '0 2px 6px rgba(23,160,93,0.15)') : 'none',
                      }}
                    >
                      {completed ? (
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>✓</span>
                      ) : (
                        <StepIconComp size={20} color={inProgress ? inProgColor : 'var(--d-muted)'} />
                      )}
                    </div>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--d-text)', marginBottom: '0.25rem' }}>{step.title}</h4>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 999,
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      background: completed ? '#E6F5EE' : inProgress ? '#FEF7E6' : 'var(--d-card2)',
                      color: completed ? '#047857' : inProgress ? '#B4881B' : 'var(--d-muted)',
                      marginBottom: '0.25rem',
                    }}>
                      {completed ? 'Terminé' : inProgress ? 'En cours' : 'À venir'}
                    </span>
                    <p style={{ fontSize: '0.7rem', color: 'var(--d-muted)', marginTop: '0.25rem', lineHeight: 1.3 }}>{step.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div style={{ background: 'var(--d-card2)', border: '1px solid var(--d-border)', borderRadius: '12px', padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--d-muted)', fontWeight: 600 }}>Progression générale</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--d-text)' }}>{progress}%</span>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: 'var(--d-line)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: progress + '%', background: light ? 'linear-gradient(90deg, #16a34a, #14b8a6)' : '#17A05D', borderRadius: 999, transition: 'width 0.4s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--d-muted)' }}>
                  Étapes complétées : {[
                    dossier.traductionStatus === 'VALIDE',
                    dossier.inscriptionStatus === 'VALIDE',
                    dossier.acceptationStatus === 'VALIDE',
                    dossier.visaStatus === 'VALIDE'
                  ].filter(Boolean).length} / 4
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '2px 8px', borderRadius: 999, background: '#E6F5EE', color: '#047857', fontSize: '0.7rem', fontWeight: 600 }}>Actif</span>
              </div>
            </div>
          </div>
        </MainCard>

        {/* Dossier Details Card */}
        <DossierDetailsCard style={light ? { background: 'var(--d-card)', border: '1px solid var(--d-border)', borderTop: '3px solid var(--d-purple)', boxShadow: 'var(--d-shadow)', backdropFilter: 'none' } : undefined}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'var(--d-text)',
            marginBottom: '1.5rem'
          }}>
            Informations du Dossier
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            <DossierDetailRow style={light ? { background: 'var(--d-blue-soft)', border: '1px solid var(--d-border)', borderLeft: '4px solid var(--d-blue)' } : undefined}>
              <DossierDetailLabel style={{ color: 'var(--d-muted)' }}>Titre du dossier</DossierDetailLabel>
              <DossierDetailValue style={{ color: 'var(--d-text)' }}>{dossier.title}</DossierDetailValue>
            </DossierDetailRow>

            <DossierDetailRow style={light ? { background: 'var(--d-green-soft)', border: '1px solid var(--d-border)', borderLeft: '4px solid var(--d-green)' } : undefined}>
              <DossierDetailLabel style={{ color: 'var(--d-muted)' }}>Date de création</DossierDetailLabel>
              <DossierDetailValue style={{ color: 'var(--d-text)' }}>
                {new Date(dossier.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </DossierDetailValue>
            </DossierDetailRow>

            <DossierDetailRow style={light ? { background: 'var(--d-amber-soft)', border: '1px solid var(--d-border)', borderLeft: '4px solid var(--d-amber)' } : undefined}>
              <DossierDetailLabel style={{ color: 'var(--d-muted)' }}>Statut actuel</DossierDetailLabel>
              <StepStatus status="warning" style={{ width: 'fit-content', ...(light ? { color: '#1d4ed8' } : {}) }}>
                Actif
              </StepStatus>
            </DossierDetailRow>

            <DossierDetailRow style={light ? { background: 'var(--d-purple-soft)', border: '1px solid var(--d-border)', borderLeft: '4px solid var(--d-purple)' } : undefined}>
              <DossierDetailLabel style={{ color: 'var(--d-muted)' }}>Prochaine étape</DossierDetailLabel>
              <DossierDetailValue style={{ color: 'var(--d-text)' }}>{getNextStep()}</DossierDetailValue>
            </DossierDetailRow>
          </div>
        </DossierDetailsCard>
      </DossierContainer>
    </DossierOverviewContainer>
  );
};

export default DossierSection;