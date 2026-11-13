import React, { useState, useMemo, useEffect, useRef } from "react";
import styled from "styled-components";
import { FiPlus, FiMoreVertical, FiFileText, FiUpload } from "react-icons/fi";
import { format, parseISO } from "date-fns";
import universityInfoService from "../../../api/universityInfoService";

const C = {
  bg: "#EEF2EE", card: "#F6F8F6", border: "#DDE2D9", text: "#12201A", muted: "#6B7B71",
  green: "#0B7A3E", dark: "#07201F", amber: "#C0902F", red: "#C62828"
};

const D = ':is(body[data-theme="dark"], body.theme-dark)';

const DARK_CSS = `
${D} .uni-root {
  background: transparent !important;
  --u-card: #0F2A24;
  --u-field: #12342C;
  --u-border: #24463B;
  --u-text: #E8F1EC;
  --u-muted: #9DB0A6;
}
${D} .uni-root .uni-pill { color: var(--u-muted) !important; }
${D} .uni-root .uni-banner { background: rgba(74,222,128,.12) !important; border-color: rgba(74,222,128,.30) !important; }
${D} .uni-root .uni-banner-text { color: var(--u-text) !important; }
${D} .uni-root .uni-card { background: var(--u-card) !important; }
${D} .uni-root .uni-card:not(.uni-final) { border-color: var(--u-border) !important; }
${D} .uni-root .uni-name { color: var(--u-text) !important; }
${D} .uni-root .uni-meta,
${D} .uni-root .uni-date { color: var(--u-muted) !important; }
${D} .uni-root .uni-dot { background: var(--u-border) !important; }
${D} .uni-root .uni-lang { background: rgba(255,255,255,.08) !important; color: var(--u-text) !important; }
${D} .uni-root .uni-final-tag { background: rgba(74,222,128,.16) !important; color: #4ADE80 !important; }
${D} .uni-root .st-APPLIED { background: rgba(245,180,60,.18) !important; color: #F5C56B !important; }
${D} .uni-root .st-ACCEPTED { background: rgba(74,222,128,.16) !important; color: #4ADE80 !important; }
${D} .uni-root .st-REJECTED { background: rgba(239,83,80,.16) !important; color: #F28B8B !important; }
${D} .uni-root .st-AWAITING_PAYMENT { background: rgba(255,255,255,.08) !important; color: #B4C2BA !important; }
${D} .uni-root .uni-kebab { color: var(--u-muted) !important; }
${D} .uni-root .uni-menu { background: var(--u-field) !important; border-color: var(--u-border) !important; box-shadow: 0 8px 24px rgba(0,0,0,.45) !important; }
${D} .uni-root .uni-menu-item { color: var(--u-text) !important; border-bottom-color: var(--u-border) !important; }
${D} .uni-root .uni-menu-item:hover { background: rgba(255,255,255,.06) !important; }
${D} .uni-root .uni-docstrip { background: var(--u-field) !important; border-color: var(--u-border) !important; }
${D} .uni-root .uni-doc-title { color: var(--u-text) !important; }
${D} .uni-root .uni-doc-sub { color: var(--u-muted) !important; }
${D} .uni-root .uni-badge { background: rgba(74,222,128,.16) !important; color: #4ADE80 !important; }
${D} .uni-root .uni-action:not(.uni-accept):not(.uni-reject) {
  background: var(--u-field) !important; color: var(--u-text) !important; border-color: var(--u-border) !important;
}
${D} .uni-root .uni-action:not(.uni-accept):not(.uni-reject):hover { background: #1B4A3A !important; }
${D} .uni-root .uni-reject { background: rgba(239,83,80,.16) !important; color: #F28B8B !important; border-color: rgba(239,83,80,.30) !important; }
${D} .uni-root .uni-empty { color: var(--u-muted) !important; }
${D} .uni-root .uni-empty-title { color: var(--u-text) !important; }
${D} .uni-root .uni-empty-sub { color: var(--u-muted) !important; }
${D} .uni-root .uni-skel-card { background: var(--u-card) !important; border-color: var(--u-border) !important; }
${D} .uni-root .uni-skel { background: rgba(255,255,255,.08) !important; }
${D} .uni-overlay { background: rgba(0,0,0,.62) !important; }
${D} .uni-modal { background: #0F2A24 !important; border: 1px solid #24463B; box-shadow: 0 12px 40px rgba(0,0,0,.55) !important; }
${D} .uni-modal-title { color: #E8F1EC !important; }
${D} .uni-label { color: #9DB0A6 !important; }
${D} .uni-input { background: #12342C !important; color: #E8F1EC !important; border-color: #24463B !important; }
${D} .uni-input::placeholder { color: #7F948A; }
${D} .uni-input option { background: #12342C; color: #E8F1EC; }
${D} .uni-modal-btn:not(.uni-primary) { background: #12342C !important; color: #E8F1EC !important; border-color: #24463B !important; }
${D} .uni-error { color: #F28B8B !important; }
`;

/* Racine transparente : plus de cadre gris autour du contenu */
const Root = styled.div` width: 100%; min-width: 0; background: transparent; font-family: system-ui, Segoe UI, sans-serif; &, & * { box-sizing: border-box; } `;

/* Le composant se règle sur la largeur de SON conteneur (pas de l'écran) */
const Wrap = styled.div` container-type: inline-size; container-name: uni; width: 100%; min-width: 0; padding: .25rem 0; `;
const Inner = styled.div` max-width: 1200px; margin: 0 auto; min-width: 0; `;

// A) Résumé
const SummaryRow = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; padding: .5rem 0 .75rem;
  @container uni (max-width: 599px) { flex-direction: column; align-items: stretch; gap: .75rem; }
`;
const Pills = styled.div`
  display: flex; gap: .5rem 1rem; flex-wrap: wrap; align-items: center; min-width: 0;
  @container uni (max-width: 599px) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .6rem .75rem; }
`;
const Dot = styled.span` width: 8px; height: 8px; border-radius: 50%; display: inline-block; flex-shrink: 0; `;
const Pill = styled.span` display: inline-flex; align-items: center; gap: .4rem; font-size: 12.5px; font-weight: 600; color: ${C.muted}; min-width: 0; `;
const NewBtn = styled.button`
  height: 40px; border-radius: 12px; background: #0B7A3E; color: #fff; border: none; font-size: 14px; font-weight: 600;
  padding: 0 16px; box-shadow: 0 4px 12px rgba(11,122,62,.3); cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; gap: .4rem; white-space: nowrap;
  @container uni (max-width: 599px) { width: 100%; height: 44px; }
`;
const EmptyNewBtn = styled(NewBtn)`
  @container uni (max-width: 599px) { display: none; }
`;

// B) Bannière choix final
const BannerGreen = styled.div` background: #E3EFE6; border-radius: 14px; padding: .75rem 1rem; border: 1px solid #C8E4CE; display: flex; align-items: flex-start; gap: .6rem; margin-bottom: .75rem; `;
const BannerDot = styled.span` width: 8px; height: 8px; border-radius: 50%; background: #0B7A3E; flex-shrink: 0; margin-top: 6px; `;
const BannerText = styled.div` font-size: .85rem; color: ${C.text}; min-width: 0; overflow-wrap: anywhere; `;

// C) Cartes : colonnes automatiques selon la place disponible
const CardList = styled.div` display: grid; gap: .75rem; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); `;
const Card = styled.div` background: #fff; border: 1px solid #DDE2D9; border-radius: 16px; padding: clamp(14px, 4cqi, 20px); min-width: 0; `;
const CardFinal = styled(Card)` border: 1.5px solid #0B7A3E; `;
const CardHead = styled.div` display: flex; align-items: flex-start; justify-content: space-between; gap: .5rem; `;
const CardTitleRow = styled.div` display: flex; align-items: center; gap: .4rem .5rem; flex-wrap: wrap; min-width: 0; flex: 1 1 auto; `;
const UniName = styled.div` font-weight: 800; font-size: clamp(14px, 4.2cqi, 15px); color: ${C.text}; letter-spacing: -.01em; overflow-wrap: anywhere; min-width: 0; `;
const StatusPill = styled.span` display: inline-flex; align-items: center; padding: .15rem .5rem; border-radius: 999px; font-size: 11px; font-weight: 700; white-space: nowrap; `;
const MetaRow = styled.div` display: flex; align-items: center; gap: .35rem .45rem; flex-wrap: wrap; font-size: 12.5px; color: ${C.muted}; margin-top: 6px; min-width: 0; overflow-wrap: anywhere; `;
const DividerDot = styled.span` width: 3px; height: 3px; border-radius: 50%; background: #DDE2D9; flex-shrink: 0; `;
const DateLine = styled.div` font-size: 12px; color: ${C.muted}; margin-top: 6px; overflow-wrap: anywhere; `;

// Menu ⋮
const KebabWrap = styled.div` position: relative; flex-shrink: 0; `;
const KebabBtn = styled.button` background: none; border: none; cursor: pointer; color: ${C.muted}; padding: .35rem; margin: -.25rem -.25rem 0 0; `;
const Menu = styled.div` position: absolute; right: 0; top: 30px; background: #fff; border: 1px solid ${C.border}; border-radius: 10px; box-shadow: 0 8px 24px rgba(7,32,31,.12); min-width: 180px; max-width: 80vw; z-index: 50; `;
const MenuItem = styled.button` width: 100%; text-align: left; background: none; border: none; padding: .7rem .85rem; font-size: 13.5px; font-weight: 500; color: ${C.text}; cursor: pointer; border-bottom: 1px solid #F0F2F0; &:hover { background: #F6F8F6; } `;

// Bloc lettre d'admission
const DocStrip = styled.div` margin-top: 14px; padding: .75rem; background: #F6F8F6; border-radius: 10px; border: 1px solid ${C.border}; `;
const DocRow = styled.div` display: flex; align-items: center; justify-content: space-between; gap: .5rem; flex-wrap: wrap; `;
const Badge = styled.span` font-size: 11px; font-weight: 700; padding: .15rem .4rem; border-radius: 999px; background: #E8F3EA; color: #0B7A3E; `;
const ActionBtn = styled.button` font-size: 12.5px; font-weight: 600; padding: .45rem .85rem; border-radius: 999px; border: 1px solid #DDE2D9; background: #fff; color: ${C.text}; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: .3rem; &:hover { background: #F6F8F6; } `;
const PrimarySmall = styled.button` font-size: 12.5px; font-weight: 600; padding: .45rem .85rem; border-radius: 999px; border: none; background: #0B7A3E; color: #fff; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: .3rem; `;

// Vide / chargement / erreur
const EmptyState = styled.div` text-align: center; padding: 2rem 1rem; color: ${C.muted}; `;
const RetryBtn = styled.button` margin-top: .5rem; background: #0B7A3E; color: #fff; border: none; border-radius: 999px; padding: .5rem 1rem; font-weight: 600; cursor: pointer; `;
const SkeletonDot = styled.div` background: #EAECEF; border-radius: 999px; max-width: 100%; animation: uniPulse 1.4s infinite; @keyframes uniPulse { 0%,100% { opacity: 1 } 50% { opacity: .5 } } `;

// Fenêtre (hors du conteneur pour rester plein écran)
const Overlay = styled.div` position: fixed; inset: 0; background: rgba(7,32,31,.35); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 12px; `;
const ModalCard = styled.div` background: #fff; border-radius: 16px; width: 100%; max-width: 480px; max-height: calc(100dvh - 24px); overflow-y: auto; padding: clamp(14px, 4vw, 24px); box-shadow: 0 12px 40px rgba(7,32,31,.25); `;
const ModalTitle = styled.h2` font-size: 1.05rem; font-weight: 800; margin: 0 0 .75rem; color: ${C.text}; `;
const Field = styled.div` margin-bottom: .7rem; `;
const Label = styled.label` font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: ${C.muted}; display: block; margin-bottom: .25rem; `;
/* 16px minimum : évite le zoom automatique sur iPhone */
const Input = styled.input` width: 100%; padding: .6rem .75rem; border: 1px solid ${C.border}; border-radius: 10px; font-size: 16px; font-family: inherit; `;
const Select = styled.select` width: 100%; padding: .6rem .75rem; border: 1px solid ${C.border}; border-radius: 10px; font-size: 16px; font-family: inherit; background: #fff; `;
const ModalActions = styled.div` display: flex; gap: .5rem; justify-content: flex-end; margin-top: .9rem; flex-wrap: wrap; `;
const ModalBtn = styled.button` padding: .6rem 1rem; border-radius: 999px; font-weight: 600; font-size: 14px; cursor: pointer; border: 1px solid ${C.border}; background: #fff; color: ${C.text}; &:disabled { opacity: .55; cursor: not-allowed; } `;
const ModalBtnPrimary = styled(ModalBtn)` background: #0B7A3E; color: #fff; border-color: #0B7A3E; `;
const ErrorText = styled.div` font-size: 12px; color: #C62828; margin-top: .25rem; overflow-wrap: anywhere; `;

export default function UniversitiesTab({ loading = false, error = null, onReload = () => {}, applications = [], studentId = null, dossierId = null, onCreate = null, onUpdate = null, onDelete = null, onSetFinalChoice = null, onUploadOfferLetter = null, onViewDocument = null }) {
  const [openMenuKey, setOpenMenuKey] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ university: "", city: "", specialty: "", level: "Bachelor", language: "ENG", status: "APPLIED" });
  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);
  const menuRef = useRef(null);

  const apps = useMemo(() => {
    const raw = Array.isArray(applications) ? applications : (Array.isArray(applications?.data) ? applications.data : (Array.isArray(applications?.universityInfo) ? applications.universityInfo : []));
    return raw.map((a) => ({
      id: a.id, university: (a.university || "—").toString(), specialty: (a.specialty || a.fieldOfStudy || "—").toString(),
      status: a.status || (a.applicationStatus ? a.applicationStatus : "APPLIED"),
      city: (a.city || "—").toString(), language: (a.language || "—").toString(),
      appliedAt: a.appliedAt ? (typeof a.appliedAt === "string" ? parseISO(a.appliedAt) : a.appliedAt) : null,
      decidedAt: a.decidedAt ? (typeof a.decidedAt === "string" ? parseISO(a.decidedAt) : a.decidedAt) : null,
      isFinalChoice: !!a.isFinalChoice, offerDocumentId: a.offerDocumentId || null,
      level: (a.level || a.targetLevel || "Bachelor").toString(),
    }));
  }, [applications]);

  const counts = useMemo(() => ({
    total: apps.length,
    awaiting: apps.filter((a) => a.status === "AWAITING_PAYMENT").length,
    applied: apps.filter((a) => a.status === "APPLIED").length,
    accepted: apps.filter((a) => a.status === "ACCEPTED").length,
    rejected: apps.filter((a) => a.status === "REJECTED").length,
    final: apps.filter((a) => a.isFinalChoice).length,
  }), [apps]);

  useEffect(() => {
    function onClick(e) { if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuKey(null); }
    function onKey(e) { if (e.key === "Escape") setOpenMenuKey(null); }
    document.addEventListener("mousedown", onClick); document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onClick); document.removeEventListener("keydown", onKey); };
  }, []);

  const openEdit = (a) => { setForm({ university: a.university, city: a.city, specialty: a.specialty, level: a.level || "Bachelor", language: a.language || "ENG", status: a.status }); setModalOpen(true); setSaveError(null); };
  const openNew = () => {
    setForm({ university: "", city: "", specialty: "", level: "Bachelor", language: "ENG", status: "APPLIED" });
    setModalOpen(true); setSaveError(null);
  };
  const saveApp = async () => {
    if (!studentId) { setSaveError("Student ID missing"); return; }
    setSaving(true); setSaveError(null);
    try {
      if (form.university && form.specialty && form.level) {
        const payload = { userId: studentId, university: form.university, city: form.city, specialty: form.specialty, level: form.level, language: form.language, status: form.status || "APPLIED" };
        if (onCreate) await onCreate(payload);
        else await universityInfoService.createUniversityInfo(payload);
      }
      setModalOpen(false); if (onReload) await onReload();
    } catch (e) {
      setSaveError(e?.response?.data?.message || e?.message || "Failed");
    } finally { setSaving(false); }
  };

  const finalApp = apps.find((a) => a.isFinalChoice);

  const statusStyle = (s) => {
    if (s === "APPLIED") return { bg: "#FBE9C8", text: "#B7791F" };
    if (s === "AWAITING_PAYMENT") return { bg: "#EAECEF", text: "#6B7B71" };
    if (s === "ACCEPTED") return { bg: "#E3EFE6", text: "#0B7A3E" };
    if (s === "REJECTED") return { bg: "#FCEAEA", text: "#C62828" };
    return { bg: "#EAECEF", text: "#6B7B71" };
  };

  return (
    <Root className="uni-root">
      <style>{DARK_CSS}</style>
      <Wrap>
        <Inner>
          {/* A) Résumé */}
          <SummaryRow>
            <Pills>
              <Pill className="uni-pill"><Dot style={{ background: "#B0BEC5" }} />{counts.awaiting} Awaiting payment</Pill>
              <Pill className="uni-pill"><Dot style={{ background: "#C0902F" }} />{counts.applied} Applied</Pill>
              <Pill className="uni-pill"><Dot style={{ background: "#0B7A3E" }} />{counts.accepted} Accepted</Pill>
              <Pill className="uni-pill"><Dot style={{ background: "#B0BEC5" }} />{counts.rejected} Rejected</Pill>
            </Pills>
            <NewBtn onClick={openNew}><FiPlus size={16} /> New application</NewBtn>
          </SummaryRow>

          {/* B) Bannière choix final */}
          {finalApp && (
            <BannerGreen className="uni-banner">
              <BannerDot />
              <BannerText className="uni-banner-text"><strong>Final choice locked — {finalApp.university}</strong>. The student sees this as their confirmed university.</BannerText>
            </BannerGreen>
          )}

          {/* Chargement */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2].map((i) => (
                <div key={i} className="uni-skel-card" style={{ background: "#fff", border: "1px solid #DDE2D9", borderRadius: 16, padding: 18 }}>
                  <SkeletonDot className="uni-skel" style={{ width: 140, height: 16, marginBottom: 8 }} />
                  <SkeletonDot className="uni-skel" style={{ width: 220, height: 12, marginBottom: 6 }} />
                  <SkeletonDot className="uni-skel" style={{ width: 180, height: 12 }} />
                </div>
              ))}
            </div>
          )}

          {/* Erreur */}
          {!loading && error && (
            <EmptyState className="uni-empty">
              <div style={{ color: "#C62828", fontWeight: 700, overflowWrap: "anywhere" }}>{String(error?.message || error)}</div>
              <RetryBtn onClick={onReload}>Retry</RetryBtn>
            </EmptyState>
          )}

          {/* Cartes */}
          {!loading && !error && apps.length > 0 && (
            <CardList>
              {apps.map((a) => {
                const s = statusStyle(a.status);
                const key = String(a.id || (a.university + a.specialty));
                const isFinal = a.isFinalChoice;
                return (
                  <Card key={key} as={isFinal ? CardFinal : Card} className={"uni-card" + (isFinal ? " uni-final" : "")}>
                    <CardHead>
                      <CardTitleRow>
                        <UniName className="uni-name">{a.university}</UniName>
                        {isFinal && <span className="uni-final-tag" style={{ fontSize: 11, fontWeight: 700, color: "#0B7A3E", background: "#E3EFE6", padding: ".15rem .5rem", borderRadius: 999, whiteSpace: "nowrap" }}>Final choice</span>}
                        <StatusPill className={"st-" + a.status} style={{ background: s.bg, color: s.text }}>{a.status === "APPLIED" ? "Applied" : a.status === "ACCEPTED" ? "Accepted" : a.status === "REJECTED" ? "Rejected" : a.status === "AWAITING_PAYMENT" ? "Awaiting payment" : a.status}</StatusPill>
                      </CardTitleRow>
                      <KebabWrap ref={key === String(openMenuKey) ? menuRef : undefined}>
                        <KebabBtn className="uni-kebab" onClick={() => setOpenMenuKey(openMenuKey === key ? null : key)} aria-label="Menu"><FiMoreVertical size={18} /></KebabBtn>
                        {openMenuKey === key && (
                          <Menu className="uni-menu">
                            <MenuItem className="uni-menu-item" onClick={() => { setOpenMenuKey(null); if (onSetFinalChoice) onSetFinalChoice(a.id); else if (a.isFinalChoice && onUpdate) onUpdate(a.id, { isFinalChoice: false }); }}>{a.isFinalChoice ? "Unlock final choice" : "Mark as final choice"}</MenuItem>
                            <MenuItem className="uni-menu-item" onClick={() => { setOpenMenuKey(null); openEdit(a); }}>Edit</MenuItem>
                            <MenuItem className="uni-menu-item" onClick={() => { setOpenMenuKey(null); if (onUpdate && a.status === "APPLIED") onUpdate(a.id, { status: "REJECTED" }); }}>{a.status === "APPLIED" ? "Change status to Rejected" : "Change status"}</MenuItem>
                            <MenuItem className="uni-menu-item" onClick={() => { setOpenMenuKey(null); if (onDelete) onDelete(a.id); }}>Delete</MenuItem>
                          </Menu>
                        )}
                      </KebabWrap>
                    </CardHead>

                    <MetaRow className="uni-meta">
                      <span><strong>{a.city}</strong></span><DividerDot className="uni-dot" />
                      <span>{a.specialty}</span><DividerDot className="uni-dot" />
                      <span>{a.level}</span><DividerDot className="uni-dot" />
                      <span className="uni-lang" style={{ background: "#F0F1F0", padding: ".1rem .4rem", borderRadius: 999, fontWeight: 600, fontSize: 11 }}>{a.language || "ENG"}</span>
                    </MetaRow>

                    <DateLine className="uni-date">
                      {a.appliedAt ? `Applied ${format(a.appliedAt, "d MMM yyyy")}` : "—"}
                      {a.decidedAt ? ` · Decision ${format(a.decidedAt, "d MMM yyyy")}` : " · awaiting the university"}
                    </DateLine>

                    {isFinal && (
                      <DocStrip className="uni-docstrip">
                        <DocRow>
                          <div style={{ minWidth: 0 }}>
                            <div className="uni-doc-title" style={{ fontWeight: 700, fontSize: 13, color: C.text }}>Pre-enrolment letter</div>
                            <div className="uni-doc-sub" style={{ fontSize: 11, color: C.muted }}>Visible to the student in their portal</div>
                          </div>
                          <Badge className="uni-badge">PDF</Badge>
                        </DocRow>
                        <DocRow style={{ marginTop: 8 }}>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                            {a.offerDocumentId ? (
                              <>
                                <PrimarySmall onClick={() => onViewDocument ? onViewDocument(a.offerDocumentId) : alert("View document " + a.offerDocumentId)}><FiFileText size={12} /> View document</PrimarySmall>
                                <ActionBtn className="uni-action" onClick={() => onUploadOfferLetter ? onUploadOfferLetter(a.id) : alert("Replace offer letter for " + a.university)}><FiUpload size={12} /> Replace</ActionBtn>
                              </>
                            ) : (
                              <>
                                <div className="uni-doc-sub" style={{ fontSize: 12, color: C.muted }}>No pre-enrolment letter yet</div>
                                <PrimarySmall onClick={() => onUploadOfferLetter ? onUploadOfferLetter(a.id) : alert("Upload letter for " + a.university)}><FiUpload size={12} /> Upload letter</PrimarySmall>
                              </>
                            )}
                          </div>
                        </DocRow>
                      </DocStrip>
                    )}

                    {!isFinal && a.status === "APPLIED" && (
                      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <ActionBtn className="uni-action uni-accept" style={{ background: "#0B7A3E", color: "#fff", borderColor: "#0B7A3E", flex: "1 1 110px" }} onClick={() => { if (onUpdate) onUpdate(a.id, { status: "ACCEPTED" }); }}>Accepted</ActionBtn>
                        <ActionBtn className="uni-action uni-reject" style={{ color: "#C62828", borderColor: "#FCEAEA", background: "#FCEAEA", flex: "1 1 110px" }} onClick={() => { if (onUpdate) onUpdate(a.id, { status: "REJECTED" }); }}>Rejected</ActionBtn>
                      </div>
                    )}
                  </Card>
                );
              })}
            </CardList>
          )}

          {/* Etat vide (le bouton du haut suffit sur téléphone) */}
          {!loading && !error && apps.length === 0 && (
            <EmptyState className="uni-empty">
              <div className="uni-empty-title" style={{ fontSize: "clamp(18px, 6cqi, 22px)", fontWeight: 800, color: C.text, marginBottom: 4 }}>No applications yet</div>
              <div className="uni-empty-sub" style={{ fontSize: 14, color: C.muted, marginBottom: 10 }}>Start tracking university applications.</div>
              <EmptyNewBtn onClick={openNew}><FiPlus size={16} /> New application</EmptyNewBtn>
            </EmptyState>
          )}
        </Inner>
      </Wrap>

      {/* Fenêtre : placée hors du conteneur pour rester en plein écran */}
      {modalOpen && (
        <Overlay className="uni-overlay" onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <ModalCard className="uni-modal">
            <ModalTitle className="uni-modal-title">New application</ModalTitle>
            <Field>
              <Label className="uni-label">University</Label>
              <Input className="uni-input" value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })} placeholder="University name" />
            </Field>
            <Field>
              <Label className="uni-label">City</Label>
              <Input className="uni-input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" />
            </Field>
            <Field>
              <Label className="uni-label">Program / Specialty</Label>
              <Input className="uni-input" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} placeholder="Specialty" />
            </Field>
            <Field>
              <Label className="uni-label">Level</Label>
              <Select className="uni-input" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                <option>Bachelor</option><option>Master</option><option>PhD</option>
              </Select>
            </Field>
            <Field>
              <Label className="uni-label">Language</Label>
              <Select className="uni-input" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                <option>ENG</option><option>ITA</option><option>FRA</option><option>Other</option>
              </Select>
            </Field>
            <Field>
              <Label className="uni-label">Status</Label>
              <Select className="uni-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option>APPLIED</option><option>ACCEPTED</option><option>REJECTED</option><option>AWAITING_PAYMENT</option>
              </Select>
            </Field>
            {saveError && <ErrorText className="uni-error">{saveError}</ErrorText>}
            <ModalActions>
              <ModalBtn className="uni-modal-btn" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</ModalBtn>
              <ModalBtnPrimary className="uni-modal-btn uni-primary" onClick={saveApp} disabled={saving || !form.university || !form.specialty || !form.level}>{saving ? "Saving…" : "Create"}</ModalBtnPrimary>
            </ModalActions>
          </ModalCard>
        </Overlay>
      )}
    </Root>
  );
}