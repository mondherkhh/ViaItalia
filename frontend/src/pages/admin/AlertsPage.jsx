import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { FiAlertTriangle, FiCheck, FiMessageCircle, FiExternalLink, FiFolder, FiCreditCard, FiCheckCircle } from "react-icons/fi";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { getAlerts } from "../../api/alertService";

const C = { bg: "#F5F6F2", card: "#EBEEE7", border: "#DDE2D9", text: "#12231B", muted: "#7C877F", green: "#0B7A3E", greenSoft: "#E3EFE6", darkText: "#12231B", red: "#C62828", blue: "#2B5FB4" };

const GroupHeader = styled.div` display: flex; align-items: center; justify-content: space-between; margin: 18px 0 10px; `;
const GroupTitle = styled.div` font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #9AA39C; text-transform: uppercase; `;
const GroupCount = styled.div` font-size: 11px; color: #9AA39C; `;

const Card = styled.div` display: flex; gap: 14px; border-radius: 14px; border: 1px solid #DDE2D9; background: #EBEEE7; padding: 16px 20px 16px 18px; position: relative; opacity: ${p => p.dim ? 0.55 : 1}; transition: opacity .2s ease; `;
const ColorBar = styled.div` position: absolute; left: 0; top: 14px; bottom: 14px; width: 3px; border-radius: 999px; background: ${p => p.color || C.green}; `;
const IconCircle = styled.div` width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: ${p => p.bg || "#FBE3E3"}; color: ${p => p.fg || C.red}; `;
const RightArea = styled.div` flex: 1; `;
const TitleRow = styled.div` display: flex; align-items: center; gap: 8px; `;
const Chip = styled.span` font-size: 11px; font-weight: 700; padding: 2px 9px; border-radius: 6px; background: ${p => p.bg}; color: ${p => p.fg}; `;
const TitleText = styled.div` font-weight: 700; font-size: 14px; color: ${C.darkText}; `;
const UnreadDot = styled.span` width: 7px; height: 7px; border-radius: 50%; background: ${p => p.color || C.red}; display: inline-block; `;
const Desc = styled.div` font-size: 13px; color: #3F4A43; margin-top: 6px; `;
const TimeRow = styled.div` font-size: 11.5px; color: #9AA39C; margin-top: 8px; `;
const BtnRow = styled.div` display: flex; gap: 10px; align-items: center; flex-wrap: wrap; `;
const PrimaryBtn = styled.button` height: 34px; border-radius: 10px; background: #0B7A3E; color: #fff; font-weight: 700; font-size: 12.5px; border: none; padding: 0 16px; cursor: pointer; `;
const ReadBtn = styled.button` height: 34px; border-radius: 10px; border: 1px solid #D5DAD0; background: #fff; color: #12231B; font-weight: 600; font-size: 12.5px; display: flex; align-items: center; gap: 6px; padding: 0 14px; cursor: pointer; `;

export default function AlertsPage({ openDossier, openConversation }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [readIds, setReadIds] = useState(new Set());

  const loadRead = () => {
    try {
      const raw = localStorage.getItem("alerts_read_v1");
      if (raw) return new Set(JSON.parse(raw));
    } catch (e) { return new Set(); }
    return new Set();
  };

  useEffect(() => {
    setReadIds(loadRead());
    setLoading(true);
    getAlerts()
      .then(data => { setAlerts(Array.isArray(data) ? data : []); setError(""); })
      .catch(e => setError((e?.message || "Failed to load alerts") + ". Retry."))
      .finally(() => setLoading(false));
  }, []);

  const updateRead = useCallback((id) => {
    const next = new Set(readIds); next.add(id); setReadIds(next);
    try { localStorage.setItem("alerts_read_v1", JSON.stringify(Array.from(next))); } catch (e) {}
  }, [readIds]);

  const unreadCount = alerts.filter(a => !readIds.has(a.id)).length;
  const today = new Date().toDateString();
  const todayAlerts = alerts.filter(a => new Date(a.createdAt).toDateString() === today && !readIds.has(a.id));
  const earlierAlerts = alerts.filter(a => new Date(a.createdAt).toDateString() !== today && !readIds.has(a.id));

  const groups = [];
  if (unreadCount > 0 && todayAlerts.length > 0) groups.push({ label: "TODAY", items: todayAlerts });
  if (unreadCount > 0 && earlierAlerts.length > 0) groups.push({ label: "EARLIER", items: earlierAlerts });

  const chipConfig = (type) => {
    if (type === "unanswered" || type === "abandoned") return { bg: "#FBE3E3", fg: C.red, color: C.red, icon: type === "abandoned" ? FiAlertTriangle : FiMessageCircle };
    if (type === "task_done") return { bg: "#DDF1E4", fg: C.green, color: C.green, icon: FiCheck };
    return { bg: "#DCE9FB", fg: C.blue, color: C.blue, icon: FiMessageCircle };
  };

  const label = (type) => {
    if (type === "unanswered") return "Unanswered";
    if (type === "abandoned") return "Abandoned";
    if (type === "task_done") return "Task done";
    return "New message";
  };

  const btnAction = (item) => {
    if (item.type === "unanswered" || item.type === "new_message") {
      if (openConversation) {
        openConversation(item.userId);
      }
    } else if (item.type === "abandoned") {
      if (openDossier) {
        openDossier(item.userId || item.dossierId, "profile");
      }
    } else {
      if (openDossier) {
        openDossier(item.userId || item.dossierId, "tasks");
      }
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <h2 style={{ fontWeight: 900, fontSize: "1.6rem", letterSpacing: "-.03em", marginBottom: 6 }}>Alerts</h2>
        <p style={{ fontSize: ".85rem", color: C.muted, marginBottom: 20 }}>What changed while you were away, and what needs you now.</p>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: 100, background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, marginBottom: 10, opacity: 0.5 }} />
        ))}
      </div>
    );
  }

  if (error) {
    return <div style={{ padding: 24, color: C.red }}>{error} <button onClick={() => window.location.reload()} style={{ marginLeft: 8, padding: "4px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.green, color: "#fff", cursor: "pointer", fontWeight: 700 }}>Retry</button></div>;
  }

  if (alerts.length === 0 || unreadCount === 0) {
    return (
      <div style={{ padding: 24 }}>
        <h2 style={{ fontWeight: 900, fontSize: "1.6rem", letterSpacing: "-.03em", marginBottom: 6 }}>Alerts</h2>
        <p style={{ fontSize: ".85rem", color: C.muted, marginBottom: 20 }}>What changed while you were away, and what needs you now.</p>
        <div style={{ textAlign: "center", padding: 60, color: C.muted }}>
          <FiCheckCircle size={48} style={{ marginBottom: 12 }} />
          <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>You're all caught up</div>
          <div style={{ fontSize: ".85rem" }}>No new alerts to review.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {groups.map(g => (
        <div key={g.label}>
          <GroupHeader>
            <GroupTitle>{g.label}</GroupTitle>
            <GroupCount>{g.items.length} alert{g.items.length > 1 ? "s" : ""}</GroupCount>
          </GroupHeader>
          {g.items.map(item => {
            const cfg = chipConfig(item.type);
            const Icon = cfg.icon;
            const isRead = readIds.has(item.id);
            return (
              <Card key={item.id} dim={isRead} style={{ marginBottom: 12 }}>
                <ColorBar color={cfg.color} />
                <IconCircle fg={cfg.fg} bg={cfg.bg}>
                  <Icon size={16} />
                </IconCircle>
                <RightArea>
                  <TitleRow>
                    <Chip bg={cfg.bg} fg={cfg.fg}>{label(item.type)}</Chip>
                    <TitleText>{item.title || item.description || "—"}</TitleText>
                    {!isRead && <UnreadDot color={cfg.color} />}
                  </TitleRow>
                  <Desc>{item.description}</Desc>
                  <TimeRow>{new Date(item.createdAt).toDateString() === new Date().toDateString() ? "Today · " + format(new Date(item.createdAt), "hh:mm a", { locale: enUS }) : format(new Date(item.createdAt), "MMM d · hh:mm a", { locale: enUS })}</TimeRow>
                </RightArea>
                <BtnRow style={{ alignSelf: "center" }}>
                  <PrimaryBtn onClick={() => btnAction(item)}>{item.type === "unanswered" || item.type === "new_message" ? "Open the conversation" : item.type === "abandoned" ? "Open case" : "Review"}</PrimaryBtn>
                  {!isRead ? (
                    <ReadBtn onClick={() => updateRead(item.id)}><FiCheck size={14} /> Mark read</ReadBtn>
                  ) : (
                    <ReadBtn disabled style={{ opacity: 0.5, cursor: "not-allowed" }}><FiCheck size={14} /> Read</ReadBtn>
                  )}
                </BtnRow>
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );
}
