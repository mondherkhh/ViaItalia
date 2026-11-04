import React from "react";
import { C } from "./dossier/tokens";
import { FiCheck, FiX, FiUser } from "react-icons/fi";

export default function AdminUsers({ users = [], onApprove = () => {}, onRevoke = () => {} }) {
  const clientCount = users?.filter(u => u.role === 'USER')?.length ?? 0;
  return (
    <div style={{ padding: 24, background: C.bg || "#EEF2EE", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: C.dark || "#07201F", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><FiUser size={16} /></div>
        <h2 style={{ fontWeight: 800, fontSize: 22, color: C.text || "#12201A", margin: 0, letterSpacing: "-.03em" }}>Utilisateurs</h2>
        <span style={{ marginLeft: 10, fontSize: 12, color: C.muted || "#6B7B71", fontWeight: 600 }}>
          {clientCount} compte{(clientCount > 1 ? 's' : '')}
        </span>
      </div>

      <div style={{ borderRadius: 16, background: C.card || "var(--adm-panel)", border: `1px solid ${C.border || "#E2E8E2"}`, padding: 16, boxShadow: "0 2px 12px rgba(20,40,30,.05)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, color: C.text || "#12201A" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border || "#E2E8E2"}` }}>
              {["Nom", "Email", "Rôle", "Statut", "Action"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 8px", fontSize: 10, color: C.muted || "#6B7B71", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(users || []).map(u => {
              const approved = u.isApproved === true || u.isApproved === "true" || u.status === "APPROVED";
              return (
                <tr key={u.id || u.email} style={{ borderBottom: `1px solid ${C.border || "#E2E8E2"}`, height: 56 }}>
                  <td style={{ padding: "10px 8px", fontWeight: 600 }}>{(u.firstName || "") + " " + (u.lastName || "")}</td>
                  <td style={{ padding: "10px 8px", color: C.muted || "#6B7B71", fontSize: 12 }}>{u.email || "-"}</td>
                  <td style={{ padding: "10px 8px", fontSize: 12 }}>{u.role || "-"}</td>
                  <td style={{ padding: "10px 8px", fontSize: 12 }}>
                    <span style={{ padding: "3px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: approved ? "#E8F5E9" : "#FFF8E1", color: approved ? "#047857" : "#C0902F", whiteSpace: "nowrap" }}>
                      {approved ? "Approuvé" : "En attente"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 8px" }}>
                    {approved ? (
                      <button onClick={() => onRevoke(u.id)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, border: "none", background: "#dc2626", color: "#fff", fontWeight: 700, fontSize: 11, cursor: "pointer", boxShadow: "0 2px 6px rgba(220,38,38,.25)" }}>
                        <FiX size={12} /> Retirer accès
                      </button>
                    ) : (
                      <button onClick={() => onApprove(u.id)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, border: "none", background: C.green || "#047857", color: "#fff", fontWeight: 700, fontSize: 11, cursor: "pointer", boxShadow: "0 2px 6px rgba(4,120,87,.25)" }}>
                        <FiCheck size={12} /> Donner accès
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
