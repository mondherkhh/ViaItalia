import React, { useState, useEffect } from "react";
import { C } from "./dossier/tokens";
import { FiCheck, FiX, FiUser } from "react-icons/fi";

// Détecte l'écran mobile (styles inline = pas de media queries)
function useIsMobile(breakpoint = 768) {
  const get = () =>
    typeof window !== "undefined" && window.matchMedia(`(max-width: ${breakpoint}px)`).matches;
  const [isMobile, setIsMobile] = useState(get);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener ? mq.addEventListener("change", handler) : mq.addListener(handler);
    return () => {
      mq.removeEventListener ? mq.removeEventListener("change", handler) : mq.removeListener(handler);
    };
  }, [breakpoint]);
  return isMobile;
}

export default function AdminUsers({ users = [], onApprove = () => {}, onRevoke = () => {} }) {
  const isMobile = useIsMobile();
  const clientCount = users?.filter((u) => u.role === "USER")?.length ?? 0;

  const border = C.border || "#E2E8E2";
  const muted = C.muted || "#6B7B71";
  const text = C.text || "#12201A";

  const isApproved = (u) =>
    u.isApproved === true || u.isApproved === "true" || u.status === "APPROVED";
  const fullName = (u) => `${u.firstName || ""} ${u.lastName || ""}`.trim() || "-";

  const StatusBadge = ({ approved }) => (
    <span
      style={{
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        background: approved ? "#E8F5E9" : "#FFF8E1",
        color: approved ? "#047857" : "#C0902F",
        whiteSpace: "nowrap",
      }}
    >
      {approved ? "Approuvé" : "En attente"}
    </span>
  );

  const ActionButton = ({ u, approved, fullWidth }) => {
    const base = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      padding: fullWidth ? "10px 14px" : "6px 14px",
      borderRadius: 999,
      border: "none",
      color: "#fff",
      fontWeight: 700,
      fontSize: fullWidth ? 13 : 11,
      cursor: "pointer",
      whiteSpace: "nowrap",
      width: fullWidth ? "100%" : "auto",
    };
    return approved ? (
      <button
        onClick={() => onRevoke(u.id)}
        style={{ ...base, background: "#dc2626", boxShadow: "0 2px 6px rgba(220,38,38,.25)" }}
      >
        <FiX size={13} /> Retirer accès
      </button>
    ) : (
      <button
        onClick={() => onApprove(u.id)}
        style={{ ...base, background: C.green || "#047857", boxShadow: "0 2px 6px rgba(4,120,87,.25)" }}
      >
        <FiCheck size={13} /> Donner accès
      </button>
    );
  };

  return (
    <div
      style={{
        padding: isMobile ? 12 : 24,
        background: C.bg || "#EEF2EE",
        minHeight: "100vh",
        boxSizing: "border-box",
        width: "100%",
        overflowX: "hidden",
      }}
    >
      {/* En-tête */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: isMobile ? 16 : 24,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: C.dark || "#07201F",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <FiUser size={16} />
        </div>
        <h2
          style={{
            fontWeight: 800,
            fontSize: isMobile ? 20 : 22,
            color: text,
            margin: 0,
            letterSpacing: "-.03em",
          }}
        >
          Utilisateurs
        </h2>
        <span style={{ fontSize: 12, color: muted, fontWeight: 600 }}>
          {clientCount} compte{clientCount > 1 ? "s" : ""}
        </span>
      </div>

      {/* MOBILE : cartes */}
      {isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {(users || []).length === 0 && (
            <div style={{ textAlign: "center", color: muted, fontSize: 13, padding: 24 }}>
              Aucun utilisateur
            </div>
          )}
          {(users || []).map((u) => {
            const approved = isApproved(u);
            return (
              <div
                key={u.id || u.email}
                style={{
                  borderRadius: 16,
                  background: C.card || "var(--adm-panel)",
                  border: `1px solid ${border}`,
                  padding: 14,
                  boxShadow: "0 2px 12px rgba(20,40,30,.05)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: text, wordBreak: "break-word" }}>
                      {fullName(u)}
                    </div>
                    <div style={{ fontSize: 12, color: muted, marginTop: 2, wordBreak: "break-all" }}>
                      {u.email || "-"}
                    </div>
                  </div>
                  <StatusBadge approved={approved} />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: muted }}>
                  <span style={{ textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700 }}>Rôle</span>
                  <span style={{ color: text, fontWeight: 600, fontSize: 12 }}>{u.role || "-"}</span>
                </div>

                <ActionButton u={u} approved={approved} fullWidth />
              </div>
            );
          })}
        </div>
      ) : (
        /* PC : tableau */
        <div
          style={{
            borderRadius: 16,
            background: C.card || "var(--adm-panel)",
            border: `1px solid ${border}`,
            padding: 16,
            boxShadow: "0 2px 12px rgba(20,40,30,.05)",
            overflowX: "auto",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, color: text }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${border}` }}>
                {["Nom", "Email", "Rôle", "Statut", "Action"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "10px 8px",
                      fontSize: 10,
                      color: muted,
                      textTransform: "uppercase",
                      letterSpacing: ".08em",
                      fontWeight: 700,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(users || []).map((u) => {
                const approved = isApproved(u);
                return (
                  <tr key={u.id || u.email} style={{ borderBottom: `1px solid ${border}`, height: 56 }}>
                    <td style={{ padding: "10px 8px", fontWeight: 600 }}>{fullName(u)}</td>
                    <td style={{ padding: "10px 8px", color: muted, fontSize: 12 }}>{u.email || "-"}</td>
                    <td style={{ padding: "10px 8px", fontSize: 12 }}>{u.role || "-"}</td>
                    <td style={{ padding: "10px 8px", fontSize: 12 }}>
                      <StatusBadge approved={approved} />
                    </td>
                    <td style={{ padding: "10px 8px" }}>
                      <ActionButton u={u} approved={approved} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}