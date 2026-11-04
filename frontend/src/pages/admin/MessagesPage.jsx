import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { FiSearch, FiSend, FiMail, FiPhone, FiInfo, FiFolder, FiExternalLink, FiCreditCard } from "react-icons/fi";
import messageService from "../../api/messageService";
import { format } from "date-fns";

const C = { bg: "var(--adm-bg)", card: "var(--adm-panel)", border: "var(--adm-border)", text: "var(--adm-text)", muted: "var(--adm-muted)", green: "var(--adm-accent)", greenSoft: "var(--adm-accent-soft)", darkText: "var(--adm-text)", lightBubble: "var(--adm-bg)" };
const Wrap = styled.div`font-family:system-ui,Segoe UI,sans-serif;background:${C.bg};min-height:100vh;padding:.75rem;`;
const Grid = styled.div`display:grid;grid-template-columns:28% 1fr 24%;gap:16px;max-width:1400px;margin:0 auto;min-height:min(76vh,700px);`;
const Card = styled.div`background:${C.card};border:1px solid ${C.border};border-radius:16px;overflow:hidden;box-shadow:0 2px 14px rgba(18,35,27,.06);display:flex;flex-direction:column;`;

export default function MessagesPage({ openDossier, openPayments }) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All");
  const [selectedId, setSelectedId] = useState(null);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loadingConv, setLoadingConv] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(false);

  const selectedConv = useMemo(() => conversations.find(c => c.userId === selectedId) || null, [conversations, selectedId]);
  const studentName = selectedConv ? `${selectedConv.firstName || ""} ${selectedConv.lastName || ""}`.trim() || selectedConv.email || "Student" : "";

  const caseRefStr = (conv) => {
    if (!conv || !conv.createdAt) return "—";
    const year = new Date(conv.createdAt).getFullYear();
    const idPad = String(conv.userId || 0).padStart(4, "0");
    return `VIA-${year}-${idPad}`;
  };
  const stageFromConv = (conv, student) => {
    if (student && student.stage) return student.stage;
    if (conv && conv.stage) return conv.stage;
    return "Invited";
  };

  useEffect(() => {
    setLoadingConv(true);
    messageService.getConversations().then((res) => {
      const arr = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : [];
      setConversations(arr);
    }).catch(() => setConversations([])).finally(() => setLoadingConv(false));
  }, []);

  useEffect(() => {
    if (!selectedId) { setMessages([]); return; }
    let cancelled = false;
    setLoadingMsg(true);
    messageService.getConversation(selectedId).then((res) => {
      if (cancelled) return;
      const data = res?.data?.data || res?.data || res || {};
      const msgs = Array.isArray(data.messages) ? data.messages : [];
      setMessages(msgs);
    }).catch(() => setMessages([])).finally(() => { if (!cancelled) setLoadingMsg(false); });
    return () => { cancelled = true; };
  }, [selectedId]);

  const send = async () => {
    if (!newMsg.trim() || !selectedId || sending) return;
    setSending(true);
    try {
      const res = await messageService.sendMessage(selectedId, newMsg.trim());
      const msg = res?.data?.data || res?.data || {};
      setMessages(prev => [...prev, msg]);
      setNewMsg("");
    } catch (e) {
      console.error("send error:", { status: e.response?.status, message: e.response?.data?.message, detail: e.message });
      alert(`Erreur ${e.response?.status || "réseau"}: ${e.response?.data?.message || e.message || "inconnue"}`);
    } finally {
      setSending(false);
    }
  };
  const initials = studentName ? studentName.split(" ").map(s => s[0]).join("").slice(0, 2).toUpperCase() : "ST";

  return (
    <Wrap>
      <Grid>
        <Card>
          <div style={{ padding: 14 }}>
            <div style={{ position: "relative" }}>
              <FiSearch size={14} style={{ position: "absolute", left: ".7rem", top: "50%", transform: "translateY(-50%)", color: C.muted }} />
              <input style={{ width: "100%", height: 40, padding: "0 .9rem 0 2.2rem", borderRadius: 12, border: "1px solid var(--adm-input-bg)", background: "var(--adm-input-bg)", fontSize: ".85rem", outline: "none" }} placeholder="Search discussions…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div style={{ padding: "0 14px 10px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 18 }}>
            <button style={{ background: "none", border: "none", fontWeight: tab === "All" ? 700 : 600, color: tab === "All" ? C.green : C.muted, cursor: "pointer", fontSize: "12.5px" }} onClick={() => setTab("All")}>All</button>
            <button style={{ background: "none", border: "none", fontWeight: tab === "Unread" ? 700 : 600, color: tab === "Unread" ? C.green : C.muted, cursor: "pointer", fontSize: "12.5px" }} onClick={() => setTab("Unread")}>Unread</button>
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {!loadingConv && conversations.filter(c => { const q = search.toLowerCase(); return !q || (c.firstName || "").toLowerCase().includes(q) || (c.lastName || "").toLowerCase().includes(q); }).map(c => (
              <button key={c.userId} style={{ width: "100%", textAlign: "left", padding: "12px 14px", border: "none", background: selectedId === c.userId ? C.greenSoft : "transparent", borderBottom: `1px solid ${C.border}`, cursor: "pointer" }} onClick={() => setSelectedId(c.userId)}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--adm-surface-2)", color: "var(--adm-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 900, flexShrink: 0 }}>{(c.firstName || "").slice(0, 1) + (c.lastName || "").slice(0, 1) || "ST"}</div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: "13.5px", fontWeight: 700, color: C.text }}>{c.firstName || "—"} {c.lastName || ""}</div>
                    <div style={{ fontSize: "12px", color: C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.lastMessage ? (c.lastMessage.sender === "ADMIN" ? "You: " : "") + (c.lastMessage.content ? c.lastMessage.content.slice(0, 50) : "No messages") : "No messages yet"}</div>
                    <div style={{ fontSize: "10.5px", color: "var(--adm-subtle)", marginTop: 2 }}>{caseRefStr(c)}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div style={{ padding: 14, fontSize: ".75rem", color: C.muted, borderTop: `1px solid ${C.border}` }}>Conversations with your students</div>
        </Card>

        <Card style={{ minHeight: "min(76vh,700px)", position: "relative" }}>
          {!selectedId ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, flexDirection: "column", gap: 8 }}>
              <div style={{ fontWeight: 700, color: C.text }}>Select a conversation</div>
              <div>No messages yet. Say hello.</div>
            </div>
          ) : (
            <>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--adm-surface-2)", color: "var(--adm-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 900 }}>{initials}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "13.5px" }}>{studentName || "—"}</div>
                  <div style={{ fontSize: "10.5px", color: "var(--adm-subtle)" }}>{caseRefStr(selectedConv)}</div>
                </div>
                <button aria-label="Info" style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: C.muted }}><FiInfo size={16} /></button>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: 18, background: "var(--adm-bg)" }}>
                {messages.length === 0 && <div style={{ color: C.muted, textAlign: "center", padding: 20 }}>No messages yet. Say hello.</div>}
                {(() => {
                  const list = (messages || []).filter(m => m && typeof m === 'object' && m.id != null).sort((a,b) => new Date(a.createdAt||0) - new Date(b.createdAt||0));
                  return list.map((m, i) => {
                    const isAdmin = m.sender === "ADMIN";
                    const dateStr = m.createdAt ? new Date(m.createdAt) : new Date();
                    const prevMsg = list[i-1];
                    const showDay = i === 0 || !prevMsg ? true : (new Date(prevMsg.createdAt||0).toDateString() !== dateStr.toDateString());
                    return (<div key={m.id || i}>
                      {showDay && <div style={{ fontSize: "11px", fontWeight: 700, color: C.muted, letterSpacing: ".02em", margin: "10px 0 10px", textTransform: "uppercase" }}>{format(dateStr, "EEEE, MMMM do").toUpperCase()}</div>}
                      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 10, flexDirection: isAdmin ? "row-reverse" : "row" }}>
                        {!isAdmin && <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--adm-surface-2)", color: "var(--adm-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 900, flexShrink: 0 }}>{initials}</div>}
                        <div style={{ maxWidth: "70%", padding: "10px 14px", borderRadius: 14, background: isAdmin ? C.green : C.lightBubble, border: isAdmin ? "none" : `1px solid ${C.border}`, color: isAdmin ? "#fff" : C.darkText }}>
                          {!isAdmin && <div style={{ fontWeight: 700, fontSize: "11px", marginBottom: 2 }}>{studentName || "Student"}</div>}
                          <div style={{ fontSize: ".85rem", lineHeight: 1.4 }}>{m.content}</div>
                          <div style={{ fontSize: "11px", color: isAdmin ? "rgba(255,255,255,.7)" : C.muted, marginTop: 4 }}>{m.createdAt ? format(new Date(m.createdAt), "h:mm a") : ""}</div>
                        </div>
                      </div>
                    </div>);
                  });
                })()}
                {messages.some ? messages.some(m => m && m.sender === "ADMIN") : false && <div style={{ textAlign: "right", fontSize: "11px", color: C.muted, marginTop: 4 }}>Sent</div>}
              </div>
              <div style={{ padding: 14, borderTop: `1px solid ${C.border}`, display: "flex", gap: 10, alignItems: "center" }}>
                <input onKeyDown={e => { if (e.key === "Enter") send(); }} style={{ flex: 1, height: 44, borderRadius: 22, border: `1.5px solid ${newMsg.trim() ? C.green : C.border}`, padding: "0 18px", fontSize: ".85rem", outline: "none" }} placeholder="Type a message…" value={newMsg} onChange={e => setNewMsg(e.target.value)} />
                <button onClick={send} disabled={!newMsg.trim() || sending} style={{ width: 44, height: 44, borderRadius: "50%", border: "none", background: !newMsg.trim() || sending ? "var(--adm-accent-soft)" : C.green, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><FiSend size={16} /></button>
              </div>
            </>
          )}
        </Card>

        <Card>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 700 }}>Student <button aria-label="Info" style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: C.muted }}><FiInfo size={16} /></button></div>
          {!selectedId ? (
            <div style={{ padding: 18, textAlign: "center", color: C.muted }}>Select a conversation to see the student</div>
          ) : (
            <>
              <div style={{ padding: 18, textAlign: "center" }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--adm-surface-2)", color: "var(--adm-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", fontWeight: 900, margin: "0 auto .6rem" }}>{initials}</div>
                <div style={{ fontWeight: 700, fontSize: "14px" }}>{studentName || "—"}</div>
                <div style={{ fontSize: "10.5px", color: "var(--adm-subtle)", marginTop: 2 }}>{caseRefStr(selectedConv)}</div>
                <div style={{ fontSize: "12px", color: C.green, fontWeight: 700, marginTop: 4 }}>{stageFromConv(selectedConv, null)}</div>
              </div>
              <div style={{ padding: "0 18px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><FiMail size={14} color={C.muted} /><span style={{ fontWeight: 700, fontSize: ".82rem" }}>Email</span></div>
                <div style={{ fontSize: ".82rem" }}>—</div>
              </div>
              <div style={{ height: 1, background: C.border, margin: "0 18px" }} />
              <div style={{ padding: "12px 18px", display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: ".82rem", color: C.muted }}>Field</span><span style={{ fontSize: ".82rem", fontWeight: 700 }}>—</span></div>
              <div style={{ padding: "0 18px 12px", display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: ".82rem", color: C.muted }}>Intake</span><span style={{ fontSize: ".82rem", fontWeight: 700 }}>—</span></div>
              <div style={{ height: 1, background: C.border, margin: "0 18px" }} />
              <div style={{ padding: 14, display: "flex", gap: 10 }}>
                <a href="#" onClick={() => openDossier && openDossier(selectedConv?.userId || selectedId, "profile")} style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, textDecoration: "none", color: C.text, fontSize: ".8rem", display: "flex", alignItems: "center", gap: 6 }}><FiExternalLink size={14} /> Open the case file</a>
                <a href="#" onClick={() => openDossier && openDossier(selectedConv?.userId || selectedId, "documents")} style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, textDecoration: "none", color: C.text, fontSize: ".8rem", display: "flex", alignItems: "center", gap: 6 }}><FiFolder size={14} /> Open documents</a>
              </div>
              <div style={{ padding: "0 14px 14px" }}>
                <a href="#" onClick={() => openPayments && openPayments()} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, textDecoration: "none", color: C.text, fontSize: ".8rem" }}><FiCreditCard size={14} /> Open payments</a>
              </div>
            </>
          )}
        </Card>
      </Grid>
    </Wrap>
  );
}
