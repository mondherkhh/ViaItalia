import React, { useState, useMemo, useEffect, useRef } from "react";
import styled from "styled-components";
import { FiPlus, FiX, FiMoreVertical, FiCheck, FiFileText, FiUpload, FiTrash2, FiExternalLink, FiPaperclip } from "react-icons/fi";
import { format, parseISO } from "date-fns";
import universityInfoService from "../../../api/universityInfoService";

// Tokens matching DossierDetail / design system
const C = {
  bg: "#EEF2EE", card: "#F6F8F6", border: "#DDE2D9", text: "#12201A", muted: "#6B7B71",
  green: "#0B7A3E", dark: "#07201F", amber: "#C0902F", red: "#C62828"
};

const Wrap = styled.div` background: ${C.bg}; padding: .75rem; font-family: system-ui, Segoe UI, sans-serif; `;
const Inner = styled.div` max-width: 1200px; margin: 0 auto; `;

// A) Summary row
const SummaryRow = styled.div` display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; padding: .75rem 0; `;
const Pills = styled.div` display: flex; gap: .55rem; flex-wrap: wrap; align-items: center; `;
const Dot = styled.span` width: 7px; height: 7px; border-radius: 50%; display: inline-block; `;
const Pill = styled.span` display: inline-flex; align-items: center; gap: .35rem; font-size: 12.5px; font-weight: 600; color: ${C.muted}; `;
const NewBtn = styled.button` height: 38px; border-radius: 12px; background: #0B7A3E; color: #fff; border: none; font-size: 13px; font-weight: 600; padding: 0 14px; box-shadow: 0 4px 12px rgba(11,122,62,.3); cursor: pointer; display: inline-flex; align-items: center; gap: .4rem; `;

// B) Final choice banner
const BannerGreen = styled.div` background: #E3EFE6; border-radius: 14px; padding: .75rem 1rem; border: 1px solid #C8E4CE; display: flex; align-items: center; gap: .6rem; margin-bottom: .75rem; `;
const BannerDot = styled.span` width: 8px; height: 8px; border-radius: 50%; background: #0B7A3E; flex-shrink: 0; `;
const BannerText = styled.div` font-size: .82rem; color: ${C.text}; `;

// C) Cards
const CardList = styled.div` display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; @media (max-width: 768px) { grid-template-columns: 1fr; } `;
const Card = styled.div` background: #fff; border: 1px solid #DDE2D9; border-radius: 16px; padding: 18px 20px; `;
const CardFinal = styled(Card)` border: 1.5px solid #0B7A3E; `;
const CardHead = styled.div` display: flex; align-items: flex-start; justify-content: space-between; gap: .5rem; `;
const CardTitleRow = styled.div` display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; `;
const UniName = styled.div` font-weight: 800; font-size: 15px; color: ${C.text}; letter-spacing: -.01em; `;
const StatusPill = styled.span` display: inline-flex; align-items: center; padding: .15rem .45rem; border-radius: 999px; font-size: 11px; font-weight: 700; `;
const MetaRow = styled.div` display: flex; align-items: center; gap: .45rem; flex-wrap: wrap; font-size: 12.5px; color: ${C.muted}; margin-top: 6px; `;
const DividerDot = styled.span` width: 3px; height: 3px; border-radius: 50%; background: #DDE2D9; `;
const DateLine = styled.div` font-size: 12px; color: ${C.muted}; margin-top: 6px; `;

// Kebab
const KebabWrap = styled.div` position: relative; `;
const KebabBtn = styled.button` background: none; border: none; cursor: pointer; color: ${C.muted}; padding: .2rem; `;
const Menu = styled.div` position: absolute; right: 0; top: 28px; background: #fff; border: 1px solid ${C.border}; border-radius: 10px; box-shadow: 0 8px 24px rgba(7,32,31,.12); min-width: 160px; z-index: 50; `;
const MenuItem = styled.button` width: 100%; text-align: left; background: none; border: none; padding: .55rem .75rem; font-size: 13px; font-weight: 500; color: ${C.text}; cursor: pointer; border-bottom: 1px solid #F0F2F0; &:hover { background: #F6F8F6; } `;

// Document strip for final choice
const DocStrip = styled.div` margin-top: 14px; padding: .75rem; background: #F6F8F6; border-radius: 10px; border: 1px solid ${C.border}; `;
const DocRow = styled.div` display: flex; align-items: center; justify-content: space-between; gap: .5rem; flex-wrap: wrap; `;
const Badge = styled.span` font-size: 11px; font-weight: 700; padding: .15rem .4rem; border-radius: 999px; background: #E8F3EA; color: #0B7A3E; `;
const ActionBtn = styled.button` font-size: 12px; font-weight: 600; padding: .3rem .7rem; border-radius: 999px; border: 1px solid #DDE2D9; background: #fff; color: ${C.text}; cursor: pointer; display: inline-flex; align-items: center; gap: .25rem; &:hover { background: #F6F8F6; } `;
const PrimarySmall = styled.button` font-size: 12px; font-weight: 600; padding: .3rem .7rem; border-radius: 999px; border: none; background: #0B7A3E; color: #fff; cursor: pointer; `;

// Empty / loading / error
const EmptyState = styled.div` text-align: center; padding: 2rem 1rem; color: ${C.muted}; `;
const RetryBtn = styled.button` margin-top: .5rem; background: #0B7A3E; color: #fff; border: none; border-radius: 999px; padding: .35rem .8rem; font-weight: 600; cursor: pointer; `;
const SkeletonDot = styled.div` background: #EAECEF; border-radius: 999px; animation: pulse 1.4s infinite; `;

// Modal
const Overlay = styled.div` position: fixed; inset: 0; background: rgba(7,32,31,.35); z-index: 100; display: flex; align-items: center; justify-content: center; `;
const ModalCard = styled.div` background: #fff; border-radius: 16px; width: 92%; max-width: 480px; padding: 1.25rem 1.5rem; box-shadow: 0 12px 40px rgba(7,32,31,.25); `;
const ModalTitle = styled.h2` font-size: 1.05rem; font-weight: 800; margin: 0 0 .75rem; color: ${C.text}; `;
const Field = styled.div` margin-bottom: .6rem; `;
const Label = styled.label` font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: ${C.muted}; display: block; margin-bottom: .2rem; `;
const Input = styled.input` width: 100%; padding: .45rem .65rem; border: 1px solid ${C.border}; border-radius: 8px; font-size: 13px; font-family: inherit; box-sizing: border-box; `;
const Select = styled.select` width: 100%; padding: .45rem .65rem; border: 1px solid ${C.border}; border-radius: 8px; font-size: 13px; font-family: inherit; background: #fff; `;
const ModalActions = styled.div` display: flex; gap: .5rem; justify-content: flex-end; margin-top: .75rem; `;
const ModalBtn = styled.button` padding: .35rem .8rem; border-radius: 999px; font-weight: 600; font-size: 13px; cursor: pointer; border: 1px solid ${C.border}; background: #fff; color: ${C.text}; &:disabled { opacity: .55; cursor: not-allowed; } `;
const ModalBtnPrimary = styled(ModalBtn)` background: #0B7A3E; color: #fff; border-color: #0B7A3E; `;
const ErrorText = styled.div` font-size: 12px; color: #C62828; margin-top: .25rem; `;

function initials(name) {
  if (!name) return "—";
  const parts = String(name).split(/\s+/).filter(Boolean);
  const skip = new Set(["of", "the", "di", "de"]);
  const cleaned = parts.filter(p => !skip.has(p.toLowerCase()));
  const words = cleaned.length ? cleaned : parts;
  return (words[0]?.slice(0, 1) + (words[1]?.slice(0, 1) || "")).toUpperCase();
}

export default function UniversitiesTab({ loading = false, error = null, onReload = () => {}, applications = [], studentId = null, dossierId = null, onCreate = null, onUpdate = null, onDelete = null, onSetFinalChoice = null, onUploadOfferLetter = null, onViewDocument = null }) {
  const [openMenuKey, setOpenMenuKey] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ university: "", city: "", specialty: "", level: "Bachelor", language: "ENG", status: "APPLIED" });
  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);
  const menuRef = useRef(null);

  // Normalize applications with array guard
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

  const counts = useMemo(() => {
    return {
      total: apps.length,
      awaiting: apps.filter(a => a.status === "AWAITING_PAYMENT").length,
      applied: apps.filter(a => a.status === "APPLIED").length,
      accepted: apps.filter(a => a.status === "ACCEPTED").length,
      rejected: apps.filter(a => a.status === "REJECTED").length,
      final: apps.filter(a => a.isFinalChoice).length,
    };
  }, [apps]);

  // Outside/Escape close for kebab
  useEffect(() => {
    function onClick(e) { if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuKey(null); }
    function onKey(e) { if (e.key === "Escape") setOpenMenuKey(null); }
    document.addEventListener("mousedown", onClick); document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onClick); document.removeEventListener("keydown", onKey); };
  }, []);

  const openEdit = (a) => { setForm({ university: a.university, city: a.city, specialty: a.specialty, level: a.level || "Bachelor", language: a.language || "ENG", status: a.status }); setModalOpen(true); setSaveError(null); };
  const openNew = async () => {
    setForm({ university: "", city: "", specialty: "", level: "Bachelor", language: "ENG", status: "APPLIED" });
    setModalOpen(true); setSaveError(null);
  };
  const saveApp = async () => {
    if (!studentId) { setSaveError("Student ID missing"); return; }
    setSaving(true); setSaveError(null);
    try {
      if (form.university && form.specialty && form.level) {
        const payload = { userId: studentId, university: form.university, city: form.city, specialty: form.specialty, level: form.level, language: form.language, status: form.status || "APPLIED" };
        if (onCreate) {
          await onCreate(payload);
        } else {
          await universityInfoService.createUniversityInfo(payload);
        }
      }
      setModalOpen(false); if (onReload) await onReload();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed";
      setSaveError(msg);
    } finally { setSaving(false); }
  };

  const finalApp = apps.find(a => a.isFinalChoice);

  const statusStyle = (s) => {
    if (s === "APPLIED") return { bg: "#FBE9C8", text: "#B7791F" };
    if (s === "AWAITING_PAYMENT") return { bg: "#EAECEF", text: "#6B7B71" };
    if (s === "ACCEPTED") return { bg: "#E3EFE6", text: "#0B7A3E" };
    if (s === "REJECTED") return { bg: "#FCEAEA", text: "#C62828" };
    return { bg: "#EAECEF", text: "#6B7B71" };
  };

  return (
    <Wrap>
      <Inner>
        {/* A) Summary row */}
        <SummaryRow>
          <Pills>
            <Pill><Dot style={{ background: "#B0BEC5" }} />{counts.awaiting} Awaiting payment</Pill>
            <Pill><Dot style={{ background: "#C0902F" }} />{counts.applied} Applied</Pill>
            <Pill><Dot style={{ background: "#0B7A3E" }} />{counts.accepted} Accepted</Pill>
            <Pill><Dot style={{ background: "#B0BEC5" }} />{counts.rejected} Rejected</Pill>
          </Pills>
          <NewBtn onClick={openNew}><FiPlus size={16}/> New application</NewBtn>
        </SummaryRow>

        {/* B) Final choice banner */}
        {finalApp && (
          <BannerGreen>
            <BannerDot />
            <BannerText><strong>Final choice locked — {finalApp.university}</strong>. The student sees this as their confirmed university.</BannerText>
          </BannerGreen>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1,2].map(i => (
              <div key={i} style={{ background: "#fff", border: "1px solid #DDE2D9", borderRadius: 16, padding: 18, boxShadow: "0 2px 8px rgba(20,40,30,.03)" }}>
                <SkeletonDot style={{ width: 140, height: 16, marginBottom: 8 }} />
                <SkeletonDot style={{ width: 220, height: 12, marginBottom: 6 }} />
                <SkeletonDot style={{ width: 180, height: 12 }} />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <EmptyState>
            <div style={{ color: "#C62828", fontWeight: 700 }}>{error}</div>
            <RetryBtn onClick={onReload}>Retry</RetryBtn>
          </EmptyState>
        )}

        {/* Cards */}
        {!loading && !error && apps.length > 0 && (
          <CardList>
            {apps.map((a) => {
              const s = statusStyle(a.status);
              const key = String(a.id || (a.university + a.specialty));
              const isFinal = a.isFinalChoice;
              return (
                <Card key={key} as={isFinal ? CardFinal : Card}>
                  <CardHead>
                    <CardTitleRow>
                      <UniName>{a.university}</UniName>
                      {isFinal && <span style={{ fontSize: 11, fontWeight: 700, color: "#0B7A3E", background: "#E3EFE6", padding: ".15rem .45rem", borderRadius: 999 }}>Final choice</span>}
                      <StatusPill style={{ background: s.bg, color: s.text }}>{a.status === "APPLIED" ? "Applied" : a.status === "ACCEPTED" ? "Accepted" : a.status === "REJECTED" ? "Rejected" : a.status === "AWAITING_PAYMENT" ? "Awaiting payment" : a.status}</StatusPill>
                    </CardTitleRow>
                    <KebabWrap ref={key === String(openMenuKey) ? menuRef : undefined}>
                      <KebabBtn onClick={() => setOpenMenuKey(openMenuKey === key ? null : key)} aria-label="Menu"><FiMoreVertical size={16}/></KebabBtn>
                      {openMenuKey === key && (
                        <Menu>
                          <MenuItem onClick={() => { setOpenMenuKey(null); if (onSetFinalChoice) onSetFinalChoice(a.id); else if (a.isFinalChoice && onUpdate) onUpdate(a.id, { isFinalChoice: false }); }}>{a.isFinalChoice ? "Unlock final choice" : "Mark as final choice"}</MenuItem>
                          <MenuItem onClick={() => { setOpenMenuKey(null); openEdit(a); }}>Edit</MenuItem>
                          <MenuItem onClick={() => { setOpenMenuKey(null); if (onUpdate && a.status === "APPLIED") onUpdate(a.id, { status: "REJECTED" }); }}>{a.status === "APPLIED" ? "Change status to Rejected" : "Change status"}</MenuItem>
                          <MenuItem onClick={() => { setOpenMenuKey(null); if (onDelete) onDelete(a.id); }}>{"Delete"}</MenuItem>
                        </Menu>
                      )}
                    </KebabWrap>
                  </CardHead>

                  <MetaRow>
                    <span><strong>{a.city}</strong></span><DividerDot />
                    <span>{a.specialty}</span><DividerDot />
                    <span>{a.level}</span><DividerDot />
                    <span style={{ background: "#F0F1F0", padding: ".1rem .35rem", borderRadius: 999, fontWeight: 600, fontSize: 11 }}>{a.language || "ENG"}</span>
                  </MetaRow>

                  <DateLine>
                    {a.appliedAt ? `Applied ${format(a.appliedAt, "d MMM yyyy")}` : "—"}
                    {a.decidedAt ? ` · Decision ${format(a.decidedAt, "d MMM yyyy")}` : "· awaiting the university"}
                  </DateLine>

                  {isFinal && (
                    <DocStrip>
                      <DocRow>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>Pre-enrolment letter</div>
                          <div style={{ fontSize: 11, color: C.muted }}>Visible to the student in their portal</div>
                        </div>
                        <Badge>PDF</Badge>
                      </DocRow>
                      <DocRow style={{ marginTop: 8 }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          {a.offerDocumentId ? (
                            <>
                              <PrimarySmall onClick={() => onViewDocument ? onViewDocument(a.offerDocumentId) : alert("View document " + a.offerDocumentId)}><FiFileText size={12}/> View document</PrimarySmall>
                              <ActionBtn onClick={() => onUploadOfferLetter ? onUploadOfferLetter(a.id) : alert("Replace offer letter for " + a.university)}><FiUpload size={12}/> Replace</ActionBtn>
                            </>
                          ) : (
                            <>
                              <div style={{ fontSize: 12, color: C.muted }}>No pre-enrolment letter yet</div>
                              <PrimarySmall onClick={() => alert("Upload letter for " + a.university)}><FiUpload size={12}/> Upload letter</PrimarySmall>
                            </>
                          )}
                        </div>
                      </DocRow>
                    </DocStrip>
                  )}

                  {!isFinal && a.status === "APPLIED" && (
                    <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <ActionBtn style={{ background: "#0B7A3E", color: "#fff", borderColor: "#0B7A3E" }} onClick={() => { if (onUpdate) onUpdate(a.id, { status: "ACCEPTED" }); }}>Accepted</ActionBtn>
                      <ActionBtn style={{ color: "#C62828", borderColor: "#FCEAEA", background: "#FCEAEA" }} onClick={() => { if (onUpdate) onUpdate(a.id, { status: "REJECTED" }); }}>Rejected</ActionBtn>
                    </div>
                  )}
                </Card>
              );
            })}
          </CardList>
        )}

        {/* Empty state */}
        {!loading && !error && apps.length === 0 && (
          <EmptyState>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>No applications yet</div>
            <div style={{ fontSize: 14, color: C.muted, marginBottom: 10 }}>Start tracking university applications.</div>
            <NewBtn onClick={openNew}><FiPlus size={16}/> New application</NewBtn>
          </EmptyState>
        )}

        {/* Modal */}
        {modalOpen && (
          <Overlay onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
            <ModalCard>
              <ModalTitle>New application</ModalTitle>
              <Field>
                <Label>University</Label>
                <Input value={form.university} onChange={e => setForm({ ...form, university: e.target.value })} placeholder="University name" />
              </Field>
              <Field>
                <Label>City</Label>
                <Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="City" />
              </Field>
              <Field>
                <Label>Program / Specialty</Label>
                <Input value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })} placeholder="Specialty" />
              </Field>
              <Field>
                <Label>Level</Label>
                <Select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                  <option>Bachelor</option><option>Master</option><option>PhD</option>
                </Select>
              </Field>
              <Field>
                <Label>Language</Label>
                <Select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}>
                  <option>ENG</option><option>ITA</option><option>FRA</option><option>Other</option>
                </Select>
              </Field>
              <Field>
                <Label>Status</Label>
                <Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option>APPLIED</option><option>ACCEPTED</option><option>REJECTED</option><option>AWAITING_PAYMENT</option>
                </Select>
              </Field>
              {saveError && <ErrorText>{saveError}</ErrorText>}
              <ModalActions>
                <ModalBtn onClick={() => setModalOpen(false)} disabled={saving}>Cancel</ModalBtn>
                <ModalBtnPrimary onClick={saveApp} disabled={saving || !form.university || !form.specialty || !form.level}>{saving ? "Saving…" : "Create"}</ModalBtnPrimary>
              </ModalActions>
            </ModalCard>
          </Overlay>
        )}
      </Inner>
    </Wrap>
  );
}
