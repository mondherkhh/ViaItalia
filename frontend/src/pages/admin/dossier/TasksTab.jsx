import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import {
  FiPlus, FiCheck, FiTrash2, FiCreditCard, FiCheckSquare,
  FiFolder, FiBookOpen, FiGrid, FiEdit2
} from "react-icons/fi";
import { format, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";

const Wrap = styled.div` font-family: system-ui, Segoe UI, sans-serif; `;
const PillsRow = styled.div` display: flex; align-items: center; justify-content: space-between; gap: .75rem; flex-wrap: wrap; margin-bottom: .75rem; `;
const Pills = styled.div` display: flex; gap: .5rem; `;
const Pill = styled.div` display: inline-flex; align-items: center; gap: .45rem; padding: .25rem .75rem; border-radius: 999px; border: 1px solid #DDE2D9; background: rgba(255,255,255,.58); font-size: .8rem; font-weight: 600; color: #6B746E; `;
const Dot = styled.span` width: 7px; height: 7px; border-radius: 50%; display: inline-block; `;
const Count = styled.span` font-weight: 800; color: #12231B; `;
const NewBtn = styled.button` display: inline-flex; align-items: center; gap: .4rem; padding: .45rem .9rem; border-radius: 999px; background: #0B7A3E; color: #fff; border: none; font-weight: 700; font-size: .82rem; cursor: pointer; box-shadow: 0 4px 12px rgba(11,122,62,.3); `;
const CardList = styled.div` display: flex; flex-direction: column; gap: .75rem; margin-top: 1rem; `;
const Card = styled.div` display: flex; align-items: flex-start; gap: .85rem; padding: 1rem 1.1rem; border-radius: 14px; border: 1px solid #DDE2D9; background: rgba(235,238,231,.55); transition: border-color .15s; `;
const CheckBox = styled.button` flex-shrink: 0; width: 20px; height: 20px; border-radius: 6px; border: 1.5px solid #CBD1C6; background: transparent; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; `;
const CardBody = styled.div` flex: 1; min-width: 0; `;
const Row = styled.div` display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; `;
const TypeChip = styled.span` font-size: .65rem; font-weight: 800; padding: .15rem .45rem; border-radius: 6px; letter-spacing: .03em; text-transform: uppercase; `;
const Title = styled.div` font-size: .95rem; font-weight: 700; color: #12231B; `;
const Desc = styled.div` font-size: .82rem; color: #3F4A43; margin-top: .3rem; `;
const Meta = styled.div` font-size: .72rem; color: #9AA39C; margin-top: .45rem; `;
const ActionsRight = styled.div` display: flex; align-items: center; gap: .35rem; flex-shrink: 0; `;
const LinkBtn = styled.button` background: none; border: none; color: #0B7A3E; font-weight: 700; font-size: .78rem; cursor: pointer; display: inline-flex; align-items: center; gap: .25rem; `;
const IconBtn = styled.button` width: 30px; height: 30px; border-radius: 8px; border: 1px solid #DDE2D9; background: #fff; display: inline-flex; align-items: center; justify-content: center; color: #6B746E; cursor: pointer; `;
const ConfirmOverlay = styled.div` position: fixed; inset: 0; background: rgba(20,35,27,.35); display: flex; align-items: center; justify-content: center; z-index: 50; `;
const ConfirmCard = styled.div` background: #fff; border-radius: 16px; padding: 1.25rem 1.25rem; max-width: 360px; width: 90%; box-shadow: 0 20px 60px rgba(20,35,27,.25); `;
const ConfirmTitle = styled.div` font-weight: 800; color: #12231B; margin-bottom: .15rem; `;
const ConfirmSub = styled.div` font-size: .82rem; color: #6B746E; margin-bottom: 1rem; `;
const ConfirmRow = styled.div` display: flex; gap: .5rem; justify-content: flex-end; `;
const ConfirmBtn = styled.button` padding: .4rem .7rem; border-radius: 8px; border: 1px solid #DDE2D9; background: #fff; font-size: .8rem; font-weight: 700; cursor: pointer; color: #3F4A43; `;
const ConfirmDel = styled.button` padding: .4rem .7rem; border-radius: 8px; border: none; background: #C62828; color: #fff; font-size: .8rem; font-weight: 700; cursor: pointer; `;

export default function TasksTab({ tasks = [], loading = false, error = null, onReload, studentId, dossierId, onCreateTask, onUpdateTask, onDeleteTask, onLogPayment }) {
  const [openMenuKey, setOpenMenuKey] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ type: "GENERAL", title: "", description: "", amount: "", currency: "TND", folder: "" });
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [logConfirm, setLogConfirm] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") { setOpenMenuKey(null); setDeleteConfirm(null); setLogConfirm(null); } }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuKey(null);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const openCount = (tasks || []).filter(t => t.status === "OPEN").length;
  const doneCount = (tasks || []).filter(t => t.status === "DONE").length;

  const handleToggle = async (t) => {
    const next = t.status === "OPEN" ? "DONE" : "OPEN";
    try {
      await (onUpdateTask || (id => Promise.resolve()))(t.id, { status: next });
      if (onReload) onReload();
    } catch (e) { console.error("toggle error:", e); }
  };

  const handleCreate = async () => {
    setFormErr(null);
    const title = (form.title || "").trim();
    if (!title) { setFormErr("Title required"); return; }
    if (title.length > 80) { setFormErr("Title max 80 chars"); return; }
    if (form.type === "PAYMENTS" && (!form.amount || parseFloat(form.amount) <= 0)) { setFormErr("Payments requires amount > 0"); return; }
    setSaving(true);
    try {
      const payload = {
        userId: studentId,
        dossierId: dossierId || undefined,
        type: form.type,
        title,
        description: form.description ? form.description.trim() : null,
        amount: form.type === "PAYMENTS" ? parseFloat(form.amount || 0) : null,
        currency: form.currency || "TND",
        folder: form.folder ? form.folder.trim() : null,
      };
      await (onCreateTask || (() => Promise.resolve()))(payload);
      setForm({ type: "GENERAL", title: "", description: "", amount: "", currency: "TND", folder: "" });
      setShowCreate(false);
      if (onReload) onReload();
    } catch (e) { setFormErr((e?.message) || "Create failed"); } finally { setSaving(false); }
  };

  const typeColors = {
    PAYMENTS: { bg: "#FBE9C8", text: "#B7791F" },
    DOCUMENTS: { bg: "#DDF1E4", text: "#0B7A3E" },
    UNIVERSITIES: { bg: "#DCE9FB", text: "#2B5FB4" },
    GENERAL: { bg: "#E3E7DF", text: "#6B746E" },
  };

  return (
    <Wrap>
      <PillsRow>
        <Pills>
          <Pill><Dot style={{ background: "#C0902F" }} /><Count>{openCount}</Count> Open</Pill>
          <Pill><Dot style={{ background: "#0B7A3E" }} /><Count>{doneCount}</Count> Done</Pill>
        </Pills>
        <NewBtn onClick={() => setShowCreate(true)}><FiPlus size={14} /> New task</NewBtn>
      </PillsRow>

      {loading && <CardList>{[1,2].map(i => <Card key={i} style={{ opacity: .35 }}><div style={{ width: 20, height: 20, borderRadius: 6, border: "1.5px solid #CBD1C6" }} /><div style={{ flex: 1, height: 50, background: "#E3E7DF", borderRadius: 8 }} /></Card>)}</CardList>}

      {error && <div style={{ color: "#C62828", fontSize: ".85rem", marginTop: ".5rem" }}>{String(error)} <button onClick={() => onReload && onReload()} style={{ marginLeft: ".5rem", background: "#0B7A3E", color: "#fff", border: "none", borderRadius: 6, padding: ".2rem .5rem", fontSize: ".75rem" }}>Retry</button></div>}

      {!loading && !error && (tasks || []).length === 0 && (
        <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "#9AA39C", fontSize: ".9rem" }}>
          No tasks yet.
        </div>
      )}

      {!loading && (tasks || []).length > 0 && (
        <CardList>
          {(Array.isArray(tasks) ? tasks : []).map(t => {
            const isDone = t.status === "DONE";
            const chip = typeColors[t.type] || typeColors.GENERAL;
            const folderLabel = t.folder ? t.folder : null;
            const folderEmpty = t.folderEmpty;
            return (
              <Card key={t.id} style={{ opacity: isDone ? .75 : 1, borderColor: isDone ? "#CBD1C6" : "#DDE2D9" }}>
                <CheckBox onClick={() => handleToggle(t)} aria-label={isDone ? "Reopen" : "Mark done"} style={{ background: isDone ? "#0B7A3E" : "transparent" }}>
                  {isDone ? <FiCheck size={13} color="#fff" /> : null}
                </CheckBox>
                <CardBody>
                  <Row>
                    <TypeChip style={{ background: chip.bg, color: chip.text }}>{t.type === "PAYMENTS" ? "Payments" : t.type === "DOCUMENTS" ? "Documents" : t.type === "UNIVERSITIES" ? "Universities" : "General"}</TypeChip>
                    <Title style={{ textDecoration: isDone ? "line-through" : "none" }}>
                      {t.type === "PAYMENTS" && t.amount ? `${t.amount} ${t.currency || "TND"}` : (t.title || "—")}
                    </Title>
                    {t.type === "DOCUMENTS" && folderEmpty === true && (
                      <TypeChip style={{ background: "#E3E7DF", color: "#6B746E", fontSize: ".65rem" }}>Folder empty</TypeChip>
                    )}
                  </Row>
                  {t.description && <Desc>{t.description}</Desc>}
                  <Meta>
                    {isDone ? `Completed ${format(parseISO(String(t.completedAt || t.assignedAt)), "d MMM yyyy", { locale: enUS })}` : `Assigned ${format(parseISO(String(t.assignedAt || new Date())), "d MMM yyyy", { locale: enUS })} · waiting on the student`}
                  </Meta>
                </CardBody>
                <ActionsRight ref={menuRef}>
                  <LinkBtn onClick={() => setOpenMenuKey(openMenuKey === t.id ? null : t.id)} aria-label="Menu">●●●</LinkBtn>
                  {openMenuKey === t.id && (
                    <div style={{ position: "absolute", right: 0, top: "100%", marginTop: 4, background: "#fff", border: "1px solid #DDE2D9", borderRadius: 8, boxShadow: "0 6px 20px rgba(20,35,27,.12)", minWidth: 140, padding: ".25rem", zIndex: 10 }}>
                      {!isDone && t.type === "PAYMENTS" && (
                        <button onClick={() => { setOpenMenuKey(null); setLogConfirm({ id: t.id, amount: t.amount, currency: t.currency }); }} style={{ width: "100%", textAlign: "left", padding: ".35rem .55rem", border: "none", background: "none", fontSize: ".8rem", cursor: "pointer", color: "#12231B", fontWeight: 600 }}>
                          Log payment
                        </button>
                      )}
                      {!isDone && t.type !== "PAYMENTS" && (
                        <button onClick={() => { handleToggle(t); setOpenMenuKey(null); }} style={{ width: "100%", textAlign: "left", padding: ".35rem .55rem", border: "none", background: "none", fontSize: ".8rem", cursor: "pointer", color: "#12231B", fontWeight: 600 }}>
                          Mark done
                        </button>
                      )}
                      {isDone && (
                        <button onClick={() => { handleToggle(t); setOpenMenuKey(null); }} style={{ width: "100%", textAlign: "left", padding: ".35rem .55rem", border: "none", background: "none", fontSize: ".8rem", cursor: "pointer", color: "#6B746E", fontWeight: 600 }}>
                          Reopen
                        </button>
                      )}
                      <button onClick={() => { setOpenMenuKey(null); setDeleteConfirm({ id: t.id, title: t.title }); }} style={{ width: "100%", textAlign: "left", padding: ".35rem .55rem", border: "none", background: "#fff", borderTop: "1px solid #E3E7DF", fontSize: ".8rem", cursor: "pointer", color: "#C62828", fontWeight: 700 }}>
                        Delete
                      </button>
                    </div>
                  )}
                  <IconBtn onClick={() => { setDeleteConfirm({ id: t.id, title: t.title }); setOpenMenuKey(null); }} aria-label="Delete" style={{ color: "#C62828" }}><FiTrash2 size={13} /></IconBtn>
                </ActionsRight>
              </Card>
            );
          })}
        </CardList>
      )}

      {/* Create modal */}
      {showCreate && (
        <ConfirmOverlay onClick={() => { setShowCreate(false); setFormErr(null); }}>
          <ConfirmCard onClick={e => e.stopPropagation()}>
            <ConfirmTitle>Create task</ConfirmTitle>
            <div style={{ marginBottom: ".75rem" }}>
              <label style={{ fontSize: ".72rem", fontWeight: 700, color: "#6B746E", textTransform: "uppercase", letterSpacing: ".06em" }}>Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value, folder: e.target.value === "DOCUMENTS" ? form.folder || "Personal" : form.folder })} style={{ width: "100%", padding: ".45rem .6rem", borderRadius: 8, border: "1px solid #DDE2D9", fontSize: ".85rem", marginTop: ".25rem" }}>
                <option value="PAYMENTS">Payments</option>
                <option value="DOCUMENTS">Documents</option>
                <option value="UNIVERSITIES">Universities</option>
                <option value="GENERAL">General</option>
              </select>
            </div>
            {form.type === "DOCUMENTS" && (
              <div style={{ marginBottom: ".75rem" }}>
                <label style={{ fontSize: ".72rem", fontWeight: 700, color: "#6B746E", textTransform: "uppercase", letterSpacing: ".06em" }}>Folder (quick select)</label>
                <select value={form.folder || ""} onChange={e => setForm({ ...form, folder: e.target.value || "", title: e.target.value ? e.target.value : form.title })} style={{ width: "100%", padding: ".45rem .6rem", borderRadius: 8, border: "1px solid #DDE2D9", fontSize: ".85rem", marginTop: ".25rem" }}>
                  <option value="">Select...</option>
                  <option>Personal</option>
                  <option>Academic journey</option>
                  <option>Visa documents</option>
                  <option>Translations</option>
                  <option>Admissions</option>
                </select>
              </div>
            )}
            <div style={{ marginBottom: ".75rem" }}>
              <label style={{ fontSize: ".72rem", fontWeight: 700, color: "#6B746E", textTransform: "uppercase", letterSpacing: ".06em" }}>Title</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ width: "100%", padding: ".45rem .6rem", borderRadius: 8, border: "1px solid #DDE2D9", fontSize: ".85rem", marginTop: ".25rem" }} maxLength={80} />
            </div>
            <div style={{ marginBottom: ".75rem" }}>
              <label style={{ fontSize: ".72rem", fontWeight: 700, color: "#6B746E", textTransform: "uppercase", letterSpacing: ".06em" }}>Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ width: "100%", padding: ".45rem .6rem", borderRadius: 8, border: "1px solid #DDE2D9", fontSize: ".85rem", marginTop: ".25rem", minHeight: 60, resize: "vertical" }} maxLength={300} />
            </div>
            {form.type === "PAYMENTS" && (
              <div style={{ display: "flex", gap: ".5rem", marginBottom: ".75rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: ".72rem", fontWeight: 700, color: "#6B746E", textTransform: "uppercase", letterSpacing: ".06em" }}>Amount</label>
                  <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} style={{ width: "100%", padding: ".45rem .6rem", borderRadius: 8, border: "1px solid #DDE2D9", fontSize: ".85rem", marginTop: ".25rem" }} />
                </div>
                <div style={{ width: 90 }}>
                  <label style={{ fontSize: ".72rem", fontWeight: 700, color: "#6B746E", textTransform: "uppercase", letterSpacing: ".06em" }}>Currency</label>
                  <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} style={{ width: "100%", padding: ".45rem .6rem", borderRadius: 8, border: "1px solid #DDE2D9", fontSize: ".85rem", marginTop: ".25rem" }}>
                    <option>TND</option><option>EUR</option><option>USD</option>
                  </select>
                </div>
              </div>
            )}
            {formErr && <div style={{ color: "#C62828", fontSize: ".78rem", marginBottom: ".5rem" }}>{formErr}</div>}
            <ConfirmRow>
              <ConfirmBtn onClick={() => { setShowCreate(false); setFormErr(null); }}>Cancel</ConfirmBtn>
              <ConfirmBtn onClick={handleCreate} disabled={saving} style={{ background: "#0B7A3E", color: "#fff", border: "none" }}>{saving ? "Creating..." : "Create"}</ConfirmBtn>
            </ConfirmRow>
          </ConfirmCard>
        </ConfirmOverlay>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <ConfirmOverlay onClick={() => setDeleteConfirm(null)}>
          <ConfirmCard onClick={e => e.stopPropagation()}>
            <ConfirmTitle>Delete this task?</ConfirmTitle>
            <ConfirmSub>"{deleteConfirm.title}" — this cannot be undone.</ConfirmSub>
            <ConfirmRow>
              <ConfirmBtn onClick={() => setDeleteConfirm(null)}>Cancel</ConfirmBtn>
              <ConfirmDel onClick={async () => { try { await (onDeleteTask || (() => Promise.resolve()))(deleteConfirm.id); setDeleteConfirm(null); if (onReload) onReload(); } catch (e) { console.error("delete error:", e); } }}>Delete</ConfirmDel>
            </ConfirmRow>
          </ConfirmCard>
        </ConfirmOverlay>
      )}

      {/* Log payment confirm */}
      {logConfirm && (
        <ConfirmOverlay onClick={() => setLogConfirm(null)}>
          <ConfirmCard onClick={e => e.stopPropagation()}>
            <ConfirmTitle>Record payment?</ConfirmTitle>
            <ConfirmSub>Record a payment of {logConfirm.amount} {logConfirm.currency || "TND"}?</ConfirmSub>
            <ConfirmRow>
              <ConfirmBtn onClick={() => setLogConfirm(null)}>Cancel</ConfirmBtn>
              <ConfirmBtn onClick={async () => { try { await (onLogPayment || (() => Promise.resolve()))(logConfirm.id); setLogConfirm(null); if (onReload) onReload(); } catch (e) { console.error("log payment error:", e); } }} style={{ background: "#0B7A3E", color: "#fff", border: "none" }}>Confirm</ConfirmBtn>
            </ConfirmRow>
          </ConfirmCard>
        </ConfirmOverlay>
      )}
    </Wrap>
  );
}
