import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { FiPlus, FiCheck, FiTrash2 } from "react-icons/fi";
import { format, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";

const D = ':is(body[data-theme="dark"], body.theme-dark)';

const DARK_CSS = `
${D} .tk-root {
  --t-card: #0F2A24;
  --t-field: #12342C;
  --t-border: #24463B;
  --t-text: #E8F1EC;
  --t-body: #C5D3CB;
  --t-muted: #9DB0A6;
}
${D} .tk-root .tk-pill {
  background: rgba(255,255,255,.06) !important;
  border-color: var(--t-border) !important;
  color: var(--t-muted) !important;
}
${D} .tk-root .tk-count { color: var(--t-text) !important; }
${D} .tk-root .tk-card {
  background: var(--t-card) !important;
  border-color: var(--t-border) !important;
}
${D} .tk-root .tk-card.is-done { border-color: #1B3A31 !important; }
${D} .tk-root .tk-title { color: var(--t-text) !important; }
${D} .tk-root .tk-desc { color: var(--t-body) !important; }
${D} .tk-root .tk-meta { color: var(--t-muted) !important; }
${D} .tk-root .tk-check { border-color: #3D6354 !important; }
${D} .tk-root .tk-check.is-done { background: #0B7A3E !important; border-color: #0B7A3E !important; }
${D} .tk-root .tk-chip-PAYMENTS { background: rgba(245,180,60,.18) !important; color: #F5C56B !important; }
${D} .tk-root .tk-chip-DOCUMENTS { background: rgba(74,222,128,.16) !important; color: #4ADE80 !important; }
${D} .tk-root .tk-chip-UNIVERSITIES { background: rgba(96,165,250,.18) !important; color: #7DB5FB !important; }
${D} .tk-root .tk-chip-GENERAL,
${D} .tk-root .tk-chip-EMPTY { background: rgba(255,255,255,.08) !important; color: #B4C2BA !important; }
${D} .tk-root .tk-iconbtn {
  background: var(--t-field) !important;
  border-color: var(--t-border) !important;
}
${D} .tk-root .tk-linkbtn { color: #4ADE80 !important; }
${D} .tk-root .tk-menu {
  background: var(--t-field) !important;
  border-color: var(--t-border) !important;
  box-shadow: 0 8px 24px rgba(0,0,0,.45) !important;
}
${D} .tk-root .tk-menu-item { background: transparent !important; color: var(--t-text) !important; }
${D} .tk-root .tk-menu-item:hover { background: rgba(255,255,255,.06) !important; }
${D} .tk-root .tk-menu-del { color: #F28B8B !important; border-top-color: var(--t-border) !important; }
${D} .tk-root .tk-empty { color: var(--t-muted) !important; }
${D} .tk-root .tk-skel { background: rgba(255,255,255,.08) !important; }
${D} .tk-root .tk-error { color: #F28B8B !important; }
${D} .tk-overlay { background: rgba(0,0,0,.62) !important; }
${D} .tk-modal {
  background: #0F2A24 !important;
  border: 1px solid #24463B;
  box-shadow: 0 20px 60px rgba(0,0,0,.55) !important;
}
${D} .tk-modal-title { color: #E8F1EC !important; }
${D} .tk-modal-sub { color: #9DB0A6 !important; }
${D} .tk-label { color: #9DB0A6 !important; }
${D} .tk-input {
  background: #12342C !important;
  color: #E8F1EC !important;
  border-color: #24463B !important;
}
${D} .tk-input option { background: #12342C; color: #E8F1EC; }
${D} .tk-btn:not(.tk-btn-primary) {
  background: #12342C !important;
  color: #E8F1EC !important;
  border-color: #24463B !important;
}
`;

/* Le composant se règle sur la largeur de SON conteneur (pas de l'écran) */
const Root = styled.div`
  width: 100%; min-width: 0; font-family: system-ui, Segoe UI, sans-serif;
  &, & * { box-sizing: border-box; }
`;
const Wrap = styled.div` container-type: inline-size; container-name: tk; width: 100%; min-width: 0; `;

const PillsRow = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: .75rem; flex-wrap: wrap; margin-bottom: .75rem;
  @container tk (max-width: 479px) { flex-direction: column; align-items: stretch; }
`;
const Pills = styled.div`
  display: flex; gap: .5rem; flex-wrap: wrap;
  @container tk (max-width: 479px) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
`;
const Pill = styled.div`
  display: inline-flex; align-items: center; justify-content: center; gap: .45rem; padding: .4rem .85rem; border-radius: 999px;
  border: 1px solid #DDE2D9; background: rgba(255,255,255,.58); font-size: .85rem; font-weight: 600; color: #6B746E; min-width: 0;
`;
const Dot = styled.span` width: 8px; height: 8px; border-radius: 50%; display: inline-block; flex-shrink: 0; `;
const Count = styled.span` font-weight: 800; color: #12231B; `;
const NewBtn = styled.button`
  display: inline-flex; align-items: center; justify-content: center; gap: .4rem; padding: .6rem 1rem; border-radius: 999px;
  background: #0B7A3E; color: #fff; border: none; font-weight: 700; font-size: .88rem; cursor: pointer;
  box-shadow: 0 4px 12px rgba(11,122,62,.3); white-space: nowrap;
  @container tk (max-width: 479px) { width: 100%; padding: .75rem 1rem; }
`;

const CardList = styled.div` display: flex; flex-direction: column; gap: .75rem; margin-top: 1rem; `;
const Card = styled.div`
  display: flex; align-items: flex-start; gap: .75rem; padding: clamp(12px, 4cqi, 18px); border-radius: 14px;
  border: 1px solid #DDE2D9; background: rgba(235,238,231,.55); transition: border-color .15s; min-width: 0;
`;
const CheckBox = styled.button`
  flex-shrink: 0; width: 24px; height: 24px; border-radius: 7px; border: 1.5px solid #CBD1C6; background: transparent;
  display: inline-flex; align-items: center; justify-content: center; cursor: pointer; padding: 0; margin-top: 1px;
`;
const CardBody = styled.div` flex: 1 1 auto; min-width: 0; `;
const Row = styled.div` display: flex; align-items: center; gap: .4rem .5rem; flex-wrap: wrap; min-width: 0; `;
const TypeChip = styled.span`
  font-size: .65rem; font-weight: 800; padding: .15rem .45rem; border-radius: 6px; letter-spacing: .03em;
  text-transform: uppercase; white-space: nowrap;
`;
const Title = styled.div` font-size: clamp(.9rem, 4cqi, .95rem); font-weight: 700; color: #12231B; overflow-wrap: anywhere; min-width: 0; `;
const Desc = styled.div` font-size: .85rem; color: #3F4A43; margin-top: .3rem; overflow-wrap: anywhere; `;
const Meta = styled.div` font-size: .75rem; color: #7C877F; margin-top: .45rem; overflow-wrap: anywhere; `;

/* Position relative : le menu s'ouvre sous le bouton ●●● */
const ActionsRight = styled.div` position: relative; display: flex; align-items: center; gap: .35rem; flex-shrink: 0; `;
const LinkBtn = styled.button`
  background: none; border: none; color: #0B7A3E; font-weight: 700; font-size: .8rem; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; min-width: 36px; height: 36px; padding: 0 .25rem; letter-spacing: -1px;
`;
const IconBtn = styled.button`
  width: 36px; height: 36px; border-radius: 10px; border: 1px solid #DDE2D9; background: #fff;
  display: inline-flex; align-items: center; justify-content: center; color: #6B746E; cursor: pointer; padding: 0;
`;
const Menu = styled.div`
  position: absolute; right: 0; top: 100%; margin-top: 4px; background: #fff; border: 1px solid #DDE2D9; border-radius: 10px;
  box-shadow: 0 6px 20px rgba(20,35,27,.12); min-width: 160px; max-width: 80vw; padding: .25rem; z-index: 20;
`;

/* Fenêtres : hors du conteneur, plein écran, défilent si l'écran est petit */
const ConfirmOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(20,35,27,.35); display: flex; align-items: center; justify-content: center;
  z-index: 100; padding: 12px;
`;
const ConfirmCard = styled.div`
  background: #fff; border-radius: 16px; padding: clamp(14px, 4vw, 20px); max-width: 420px; width: 100%;
  max-height: calc(100dvh - 24px); overflow-y: auto; box-shadow: 0 20px 60px rgba(20,35,27,.25);
`;
const ConfirmTitle = styled.div` font-weight: 800; color: #12231B; margin-bottom: .15rem; `;
const ConfirmSub = styled.div` font-size: .85rem; color: #6B746E; margin-bottom: 1rem; overflow-wrap: anywhere; `;
const ConfirmRow = styled.div` display: flex; gap: .5rem; justify-content: flex-end; flex-wrap: wrap; `;
const ConfirmBtn = styled.button`
  padding: .6rem .95rem; border-radius: 10px; border: 1px solid #DDE2D9; background: #fff; font-size: .85rem;
  font-weight: 700; cursor: pointer; color: #3F4A43; &:disabled { opacity: .6; cursor: not-allowed; }
`;
const ConfirmDel = styled.button`
  padding: .6rem .95rem; border-radius: 10px; border: none; background: #C62828; color: #fff; font-size: .85rem; font-weight: 700; cursor: pointer;
`;

/* 16px minimum dans les champs : évite le zoom automatique sur iPhone */
const labelStyle = { fontSize: ".72rem", fontWeight: 700, color: "#6B746E", textTransform: "uppercase", letterSpacing: ".06em" };
const fieldStyle = { width: "100%", padding: ".6rem .7rem", borderRadius: 10, border: "1px solid #DDE2D9", fontSize: 16, marginTop: ".25rem", fontFamily: "inherit" };
const menuItemStyle = { width: "100%", textAlign: "left", padding: ".65rem .7rem", border: "none", background: "none", fontSize: ".85rem", cursor: "pointer", color: "#12231B", fontWeight: 600, borderRadius: 8 };

const safeDate = (v) => {
  if (!v) return null;
  try {
    const d = typeof v === "string" ? parseISO(v) : new Date(v);
    return isNaN(d) ? null : d;
  } catch { return null; }
};
const fmtDate = (v) => {
  const d = safeDate(v);
  return d ? format(d, "d MMM yyyy", { locale: enUS }) : "—";
};

export default function TasksTab({ tasks = [], loading = false, error = null, onReload, studentId, dossierId, onCreateTask, onUpdateTask, onDeleteTask, onLogPayment }) {
  const [openMenuKey, setOpenMenuKey] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ type: "GENERAL", title: "", description: "", amount: "", currency: "TND", folder: "" });
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [logConfirm, setLogConfirm] = useState(null);
  const menuRef = useRef(null);

  const list = Array.isArray(tasks) ? tasks : [];

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

  const openCount = list.filter((t) => t.status === "OPEN").length;
  const doneCount = list.filter((t) => t.status === "DONE").length;

  const handleToggle = async (t) => {
    const next = t.status === "OPEN" ? "DONE" : "OPEN";
    try {
      await (onUpdateTask || (() => Promise.resolve()))(t.id, { status: next });
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
    } catch (e) { setFormErr(e?.message || "Create failed"); } finally { setSaving(false); }
  };

  const typeColors = {
    PAYMENTS: { bg: "#FBE9C8", text: "#B7791F" },
    DOCUMENTS: { bg: "#DDF1E4", text: "#0B7A3E" },
    UNIVERSITIES: { bg: "#DCE9FB", text: "#2B5FB4" },
    GENERAL: { bg: "#E3E7DF", text: "#6B746E" },
  };

  return (
    <Root className="tk-root">
      <style>{DARK_CSS}</style>
      <Wrap>
        <PillsRow>
          <Pills>
            <Pill className="tk-pill"><Dot style={{ background: "#C0902F" }} /><Count className="tk-count">{openCount}</Count> Open</Pill>
            <Pill className="tk-pill"><Dot style={{ background: "#0B7A3E" }} /><Count className="tk-count">{doneCount}</Count> Done</Pill>
          </Pills>
          <NewBtn onClick={() => setShowCreate(true)}><FiPlus size={14} /> New task</NewBtn>
        </PillsRow>

        {loading && (
          <CardList>
            {[1, 2].map((i) => (
              <Card key={i} className="tk-card" style={{ opacity: .35 }}>
                <div style={{ width: 24, height: 24, borderRadius: 7, border: "1.5px solid #CBD1C6", flexShrink: 0 }} />
                <div className="tk-skel" style={{ flex: 1, height: 50, background: "#E3E7DF", borderRadius: 8 }} />
              </Card>
            ))}
          </CardList>
        )}

        {error && (
          <div className="tk-error" style={{ color: "#C62828", fontSize: ".85rem", marginTop: ".5rem", overflowWrap: "anywhere" }}>
            {String(error?.message || error)}
            <button onClick={() => onReload && onReload()} style={{ marginLeft: ".5rem", background: "#0B7A3E", color: "#fff", border: "none", borderRadius: 8, padding: ".35rem .7rem", fontSize: ".8rem" }}>Retry</button>
          </div>
        )}

        {!loading && !error && list.length === 0 && (
          <div className="tk-empty" style={{ textAlign: "center", padding: "2.5rem 1rem", color: "#7C877F", fontSize: ".9rem" }}>
            No tasks yet.
          </div>
        )}

        {!loading && list.length > 0 && (
          <CardList>
            {list.map((t) => {
              const isDone = t.status === "DONE";
              const chip = typeColors[t.type] || typeColors.GENERAL;
              const chipKey = typeColors[t.type] ? t.type : "GENERAL";
              const folderEmpty = t.folderEmpty;
              const isOpenMenu = openMenuKey === t.id;
              return (
                <Card key={t.id} className={"tk-card" + (isDone ? " is-done" : "")} style={{ opacity: isDone ? .75 : 1, borderColor: isDone ? "#CBD1C6" : "#DDE2D9" }}>
                  <CheckBox className={"tk-check" + (isDone ? " is-done" : "")} onClick={() => handleToggle(t)} aria-label={isDone ? "Reopen" : "Mark done"} style={{ background: isDone ? "#0B7A3E" : "transparent" }}>
                    {isDone ? <FiCheck size={14} color="#fff" /> : null}
                  </CheckBox>

                  <CardBody>
                    <Row>
                      <TypeChip className={"tk-chip-" + chipKey} style={{ background: chip.bg, color: chip.text }}>
                        {t.type === "PAYMENTS" ? "Payments" : t.type === "DOCUMENTS" ? "Documents" : t.type === "UNIVERSITIES" ? "Universities" : "General"}
                      </TypeChip>
                      {t.type === "DOCUMENTS" && folderEmpty === true && (
                        <TypeChip className="tk-chip-EMPTY" style={{ background: "#E3E7DF", color: "#6B746E" }}>Folder empty</TypeChip>
                      )}
                    </Row>
                    <Title className="tk-title" style={{ textDecoration: isDone ? "line-through" : "none", marginTop: 6 }}>
                      {t.type === "PAYMENTS" && t.amount ? `${t.amount} ${t.currency || "TND"}` : (t.title || "—")}
                    </Title>
                    {t.description && <Desc className="tk-desc">{t.description}</Desc>}
                    <Meta className="tk-meta">
                      {isDone
                        ? `Completed ${fmtDate(t.completedAt || t.assignedAt)}`
                        : `Assigned ${fmtDate(t.assignedAt || new Date())} · waiting on the student`}
                    </Meta>
                  </CardBody>

                  <ActionsRight ref={isOpenMenu ? menuRef : undefined}>
                    <LinkBtn className="tk-linkbtn" onClick={() => setOpenMenuKey(isOpenMenu ? null : t.id)} aria-label="Menu">●●●</LinkBtn>
                    {isOpenMenu && (
                      <Menu className="tk-menu" role="menu">
                        {!isDone && t.type === "PAYMENTS" && (
                          <button className="tk-menu-item" onClick={() => { setOpenMenuKey(null); setLogConfirm({ id: t.id, amount: t.amount, currency: t.currency }); }} style={menuItemStyle}>
                            Log payment
                          </button>
                        )}
                        {!isDone && t.type !== "PAYMENTS" && (
                          <button className="tk-menu-item" onClick={() => { handleToggle(t); setOpenMenuKey(null); }} style={menuItemStyle}>
                            Mark done
                          </button>
                        )}
                        {isDone && (
                          <button className="tk-menu-item" onClick={() => { handleToggle(t); setOpenMenuKey(null); }} style={{ ...menuItemStyle, color: "#6B746E" }}>
                            Reopen
                          </button>
                        )}
                        <button className="tk-menu-item tk-menu-del" onClick={() => { setOpenMenuKey(null); setDeleteConfirm({ id: t.id, title: t.title }); }} style={{ ...menuItemStyle, background: "#fff", borderTop: "1px solid #E3E7DF", borderRadius: 0, color: "#C62828", fontWeight: 700 }}>
                          Delete
                        </button>
                      </Menu>
                    )}
                    <IconBtn className="tk-iconbtn" onClick={() => { setDeleteConfirm({ id: t.id, title: t.title }); setOpenMenuKey(null); }} aria-label="Delete" style={{ color: "#C62828" }}>
                      <FiTrash2 size={14} />
                    </IconBtn>
                  </ActionsRight>
                </Card>
              );
            })}
          </CardList>
        )}
      </Wrap>

      {/* Fenêtre : création */}
      {showCreate && (
        <ConfirmOverlay className="tk-overlay" onClick={() => { setShowCreate(false); setFormErr(null); }}>
          <ConfirmCard className="tk-modal" onClick={(e) => e.stopPropagation()}>
            <ConfirmTitle className="tk-modal-title" style={{ marginBottom: ".75rem" }}>Create task</ConfirmTitle>
            <div style={{ marginBottom: ".75rem" }}>
              <label className="tk-label" style={labelStyle}>Type</label>
              <select className="tk-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, folder: e.target.value === "DOCUMENTS" ? form.folder || "Personal" : form.folder })} style={fieldStyle}>
                <option value="PAYMENTS">Payments</option>
                <option value="DOCUMENTS">Documents</option>
                <option value="UNIVERSITIES">Universities</option>
                <option value="GENERAL">General</option>
              </select>
            </div>
            {form.type === "DOCUMENTS" && (
              <div style={{ marginBottom: ".75rem" }}>
                <label className="tk-label" style={labelStyle}>Folder (quick select)</label>
                <select className="tk-input" value={form.folder || ""} onChange={(e) => setForm({ ...form, folder: e.target.value || "", title: e.target.value ? e.target.value : form.title })} style={fieldStyle}>
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
              <label className="tk-label" style={labelStyle}>Title</label>
              <input className="tk-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={fieldStyle} maxLength={80} />
            </div>
            <div style={{ marginBottom: ".75rem" }}>
              <label className="tk-label" style={labelStyle}>Description</label>
              <textarea className="tk-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ ...fieldStyle, minHeight: 70, resize: "vertical" }} maxLength={300} />
            </div>
            {form.type === "PAYMENTS" && (
              <div style={{ display: "flex", gap: ".5rem", marginBottom: ".75rem", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 120px", minWidth: 0 }}>
                  <label className="tk-label" style={labelStyle}>Amount</label>
                  <input className="tk-input" type="number" inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} style={fieldStyle} />
                </div>
                <div style={{ flex: "0 1 100px", minWidth: 90 }}>
                  <label className="tk-label" style={labelStyle}>Currency</label>
                  <select className="tk-input" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} style={fieldStyle}>
                    <option>TND</option><option>EUR</option><option>USD</option>
                  </select>
                </div>
              </div>
            )}
            {formErr && <div className="tk-error" style={{ color: "#C62828", fontSize: ".8rem", marginBottom: ".5rem" }}>{formErr}</div>}
            <ConfirmRow>
              <ConfirmBtn className="tk-btn" onClick={() => { setShowCreate(false); setFormErr(null); }}>Cancel</ConfirmBtn>
              <ConfirmBtn className="tk-btn tk-btn-primary" onClick={handleCreate} disabled={saving} style={{ background: "#0B7A3E", color: "#fff", border: "none" }}>{saving ? "Creating..." : "Create"}</ConfirmBtn>
            </ConfirmRow>
          </ConfirmCard>
        </ConfirmOverlay>
      )}

      {/* Fenêtre : suppression */}
      {deleteConfirm && (
        <ConfirmOverlay className="tk-overlay" onClick={() => setDeleteConfirm(null)}>
          <ConfirmCard className="tk-modal" onClick={(e) => e.stopPropagation()}>
            <ConfirmTitle className="tk-modal-title">Delete this task?</ConfirmTitle>
            <ConfirmSub className="tk-modal-sub">"{deleteConfirm.title}" — this cannot be undone.</ConfirmSub>
            <ConfirmRow>
              <ConfirmBtn className="tk-btn" onClick={() => setDeleteConfirm(null)}>Cancel</ConfirmBtn>
              <ConfirmDel onClick={async () => { try { await (onDeleteTask || (() => Promise.resolve()))(deleteConfirm.id); setDeleteConfirm(null); if (onReload) onReload(); } catch (e) { console.error("delete error:", e); } }}>Delete</ConfirmDel>
            </ConfirmRow>
          </ConfirmCard>
        </ConfirmOverlay>
      )}

      {/* Fenêtre : paiement */}
      {logConfirm && (
        <ConfirmOverlay className="tk-overlay" onClick={() => setLogConfirm(null)}>
          <ConfirmCard className="tk-modal" onClick={(e) => e.stopPropagation()}>
            <ConfirmTitle className="tk-modal-title">Record payment?</ConfirmTitle>
            <ConfirmSub className="tk-modal-sub">Record a payment of {logConfirm.amount} {logConfirm.currency || "TND"}?</ConfirmSub>
            <ConfirmRow>
              <ConfirmBtn className="tk-btn" onClick={() => setLogConfirm(null)}>Cancel</ConfirmBtn>
              <ConfirmBtn className="tk-btn tk-btn-primary" onClick={async () => { try { await (onLogPayment || (() => Promise.resolve()))(logConfirm.id); setLogConfirm(null); if (onReload) onReload(); } catch (e) { console.error("log payment error:", e); } }} style={{ background: "#0B7A3E", color: "#fff", border: "none" }}>Confirm</ConfirmBtn>
            </ConfirmRow>
          </ConfirmCard>
        </ConfirmOverlay>
      )}
    </Root>
  );
}