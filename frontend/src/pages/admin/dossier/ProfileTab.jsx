import React from "react";
import { FiMail, FiPhone, FiMapPin, FiFileText, FiCreditCard } from "react-icons/fi";
import { FaIdCard, FaLandmark, FaGraduationCap, FaCheck } from "react-icons/fa";
import { C } from "./tokens";

const BORDER = "#E2E8E2";
const MUTED = (C && C.muted) || "#6B7A6F";
const TEXT = (C && C.text) || "#1B2B22";
const GREEN = (C && C.green) || "#047857";
const CARD = (C && C.card) || "#F4F6F3";

const labelStyle = {
  fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em",
  color: MUTED, fontWeight: 700, marginBottom: 4, whiteSpace: "nowrap",
};
const valueStyle = { fontSize: 15, color: TEXT, fontWeight: 500, minWidth: 0, overflowWrap: "anywhere" };

const toDateInput = (v) => {
  if (!v) return "";
  const d = new Date(v);
  return isNaN(d) ? "" : d.toISOString().slice(0, 10);
};
const show = (v) => (v === undefined || v === null || v === "" ? "-" : v);
const fmt = (done, total) =>
  done === undefined || total === undefined || done === null || total === null ? "-" : `${done}/${total}`;

function Field({ label, children }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle}>{children}</div>
    </div>
  );
}

function DateValue({ value, danger }) {
  const v = toDateInput(value);
  if (!v) return "-";
  return (
    <input
      type="date" value={v} readOnly
      style={{ border: "none", background: "transparent", font: "inherit", padding: 0, width: "100%",
        color: danger ? "#DC2626" : TEXT, outline: "none" }}
    />
  );
}

function Card({ icon, title, subtitle, children }) {
  return (
    <div className="pf-card" style={{ position: "relative", boxSizing: "border-box", width: "100%",
      background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20,
      boxShadow: "0 1px 2px rgba(0,0,0,.04)", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#E3F1E8", color: GREEN,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: TEXT, whiteSpace: "nowrap" }}>{title}</div>
          <div style={{ fontSize: 13, color: MUTED }}>{subtitle}</div>
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${BORDER}`, margin: "14px 0" }} />
      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  );
}

function LangChip({ code, checked }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, border: `1px solid ${BORDER}`,
      borderRadius: 999, padding: "3px 10px", fontSize: 13, background: "#fff", color: TEXT }}>
      <span style={{ width: 16, height: 16, borderRadius: 4, border: `1px solid ${checked ? GREEN : "#C9D2C9"}`,
        background: checked ? GREEN : "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        {checked ? <FaCheck size={9} color="#fff" /> : null}
      </span>
      {code}
    </span>
  );
}

export default function ProfileTab({
  userObj = {}, stageName, targetLevel, fieldOfStudy, payments = [], dossier,
  academicYear, tags = [], foldersDone, foldersTotal, applicationsCount, tasksDone, tasksTotal,
}) {
  const initials = (((userObj.firstName || "")[0] || "") + ((userObj.lastName || "")[0] || "")).toUpperCase() || "ST";
  const fullName = `${userObj.firstName || ""} ${userObj.lastName || ""}`.trim() || "Student";
  const hasStage = stageName && stageName !== "—";
  const levelLine = [targetLevel, fieldOfStudy].filter((x) => x && x !== "—").join(" - ");

  const collected = (payments || []).filter((p) => p.status === "PAID").reduce((a, b) => a + (b.amount || 0), 0);
  const totalFee = dossier && dossier.fee ? dossier.fee : null;
  const remaining = totalFee != null ? Math.max(0, totalFee - collected) : 0;

  const rawLang = userObj.languages;
  const langs = (Array.isArray(rawLang) ? rawLang : String(rawLang || "").split(/[,/;]/))
    .map((s) => String(s).trim().toUpperCase()).filter(Boolean);

  const exp = userObj.passportExpires ? new Date(userObj.passportExpires) : null;
  const sixMonths = new Date(); sixMonths.setMonth(sixMonths.getMonth() + 6);
  const expDanger = exp && !isNaN(exp) && exp < sixMonths;

  const contactLines = [
    [FiMail, userObj.email],
    [FiPhone, userObj.phoneNumber],
    [FiMapPin, [userObj.address, userObj.city].filter(Boolean).join(", ")],
    [FiFileText, userObj.passport],
  ].filter(([, v]) => v);

  const statBox = { background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.18)",
    borderRadius: 12, padding: "10px 4px", textAlign: "center" };
  const pill = { fontSize: 12, padding: "3px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,.25)",
    background: "rgba(255,255,255,.08)", color: "#fff", whiteSpace: "nowrap" };

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap", width: "100%", minWidth: 0, boxSizing: "border-box" }}>
      <style>{`
        .pf-card { display: block !important; float: none !important; position: relative !important; }
        .pf-card::before, .pf-card::after { content: none !important; display: none !important; }
        .pf-card > * { max-width: 100% !important; box-sizing: border-box !important; }
      `}</style>

      {/* LEFT */}
      <div style={{ flex: "1 1 320px", minWidth: 0 }}>
        <div className="pf-card" style={{ position: "relative", borderRadius: 20, padding: 24, color: "#fff", overflow: "hidden",
          backgroundColor: "#07201F",
          backgroundImage:
            "radial-gradient(circle at 20% 15%, rgba(20,90,80,.45), transparent 55%)," +
            "radial-gradient(circle at 85% 40%, rgba(30,110,95,.30), transparent 50%)," +
            "radial-gradient(circle at 40% 95%, rgba(15,70,62,.40), transparent 55%)" }}>
          <div style={{ width: 96, height: 96, borderRadius: "50%", margin: "0 auto 12px",
            background: "rgba(255,255,255,.10)", border: "1px solid rgba(255,255,255,.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32, fontWeight: 800, color: "#fff" }}>{initials}</div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{ fontWeight: 800, fontSize: 22, color: "#fff" }}>{fullName}</div>
            {hasStage ? (
              <span style={{ background: "#fff", color: GREEN, fontWeight: 800, fontSize: 12,
                padding: "2px 10px", borderRadius: 999, whiteSpace: "nowrap" }}>{stageName}</span>
            ) : null}
          </div>

          {levelLine ? <div style={{ textAlign: "center", marginTop: 6, color: "rgba(255,255,255,.85)" }}>{levelLine}</div> : null}
          {academicYear ? <div style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,.6)" }}>Academic year {academicYear}</div> : null}

          {tags.length ? (
            <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginTop: 12 }}>
              {tags.map((t) => <span key={t} style={pill}>{t}</span>)}
            </div>
          ) : null}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 16 }}>
            <div style={statBox}><div style={{ fontWeight: 800, fontSize: 20, color: "#fff" }}>{fmt(foldersDone, foldersTotal)}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.7)", whiteSpace: "nowrap" }}>Folders done</div></div>
            <div style={statBox}><div style={{ fontWeight: 800, fontSize: 20, color: "#fff" }}>{show(applicationsCount)}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.7)", whiteSpace: "nowrap" }}>Applications</div></div>
            <div style={statBox}><div style={{ fontWeight: 800, fontSize: 20, color: "#fff" }}>{fmt(tasksDone, tasksTotal)}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.7)", whiteSpace: "nowrap" }}>Tasks done</div></div>
          </div>

          {contactLines.length ? (
            <div style={{ borderTop: "1px solid rgba(255,255,255,.15)", marginTop: 16, paddingTop: 14,
              display: "flex", flexDirection: "column", gap: 10 }}>
              {contactLines.map(([Icon, v], i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14,
                  color: "rgba(255,255,255,.92)", minWidth: 0, overflowWrap: "anywhere" }}>
                  <Icon size={15} style={{ flexShrink: 0 }} /> {v}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="pf-card" style={{ boxSizing: "border-box", width: "100%", background: CARD, border: `1px solid ${BORDER}`,
          borderRadius: 16, padding: 20, boxShadow: "0 1px 2px rgba(0,0,0,.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: GREEN, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><FiCreditCard size={18} /></div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: TEXT }}>Agency fee</div>
              <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.35 }}>
                {totalFee != null
                  ? remaining > 0
                    ? `${collected.toLocaleString("en-US")} TND of ${totalFee.toLocaleString("en-US")} TND collected - ${remaining.toLocaleString("en-US")} TND to go`
                    : <span style={{ color: GREEN, fontWeight: 700 }}>Fully paid</span>
                  : `${collected.toLocaleString("en-US")} TND collected - no fee set yet`}
              </div>
            </div>
          </div>
          {totalFee != null ? (
            <div style={{ marginTop: 12, height: 6, background: "#E4E9E4", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, (collected / totalFee) * 100)}%`, height: "100%", background: GREEN }} />
            </div>
          ) : null}
        </div>
      </div>

      {/* RIGHT */}
      <div style={{ flex: "2 1 480px", minWidth: 0, width: "100%" }}>
        <Card icon={<FaIdCard size={16} />} title="Legal identity" subtitle="Spelled exactly as on the passport">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px 20px" }}>
            <Field label="Legal first name">{show(userObj.firstName)}</Field>
            <Field label="Legal last name">{show(userObj.lastName)}</Field>
            <Field label="Date of birth"><DateValue value={userObj.dob} /></Field>
            <Field label="Birth place">{show(userObj.birthPlace)}</Field>
            <Field label="Nationality">{show(userObj.nationality)}</Field>
            <Field label="Gender">{show(userObj.gender)}</Field>
          </div>
        </Card>

        <Card icon={<FaLandmark size={16} />} title="Passport" subtitle="Must stay valid past the departure date">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px 20px" }}>
            <Field label="Passport number">{show(userObj.passport)}</Field>
            <Field label="Issuing authority">{show(userObj.passportAuthority)}</Field>
            <Field label="Issued"><DateValue value={userObj.passportIssued} /></Field>
            <Field label="Expires"><DateValue value={userObj.passportExpires} danger={expDanger} /></Field>
          </div>
        </Card>

        <Card icon={<FaGraduationCap size={17} />} title="Study plan" subtitle="What we are applying for">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px 20px" }}>
            <Field label="Completed education">{show(userObj.completedEducation || userObj.completedCourses)}</Field>
            <Field label="Target level">{show(targetLevel && targetLevel !== "—" ? targetLevel : null)}</Field>
            <Field label="Field of study">{show(fieldOfStudy && fieldOfStudy !== "—" ? fieldOfStudy : userObj.fieldOfStudy)}</Field>
            <Field label="Study languages">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <LangChip code="ENG" checked={langs.includes("ENG")} />
                <LangChip code="ITA" checked={langs.includes("ITA")} />
              </div>
            </Field>
            <Field label="Preferred cities">{show(userObj.cities)}</Field>
            <Field label="Target university">{show(userObj.university)}</Field>
          </div>
        </Card>
      </div>
    </div>
  );
}