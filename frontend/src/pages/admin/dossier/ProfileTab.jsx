import React from "react";
import { FiMail, FiPhone, FiMapPin, FiFileText, FiCreditCard } from "react-icons/fi";
import { FaIdCard, FaLandmark, FaGraduationCap, FaCheck } from "react-icons/fa";
import { C } from "./tokens";

const BORDER = "#E2E8E2";
const MUTED = (C && C.muted) || "#6B7A6F";
const TEXT = (C && C.text) || "#1B2B22";
const GREEN = (C && C.green) || "#047857";
const CARD = (C && C.card) || "#F4F6F3";

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
    <div className="pf-field">
      <div className="pf-label">{label}</div>
      <div className="pf-value">{children}</div>
    </div>
  );
}

function DateValue({ value, danger }) {
  const v = toDateInput(value);
  if (!v) return "-";
  return (
    <input
      type="date" value={v} readOnly
      style={{ border: "none", background: "transparent", font: "inherit", padding: 0,
        width: "100%", minWidth: 0, color: danger ? "#DC2626" : TEXT, outline: "none" }}
    />
  );
}

function Card({ icon, title, subtitle, children }) {
  return (
    <section className="pf-card pf-panel">
      <div className="pf-head">
        <div className="pf-icon" style={{ background: "#E3F1E8", color: GREEN }}>{icon}</div>
        <div style={{ minWidth: 0 }}>
          <div className="pf-title">{title}</div>
          <div className="pf-sub">{subtitle}</div>
        </div>
      </div>
      <div className="pf-sep" />
      {children}
    </section>
  );
}

function LangChip({ code, checked }) {
  return (
    <span className="pf-chip">
      <span style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0,
        border: `1px solid ${checked ? GREEN : "#C9D2C9"}`, background: checked ? GREEN : "#fff",
        display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
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

  return (
    <div className="pf-wrap">
      <style>{`
        /* Le composant s'adapte à la largeur de SON conteneur (pas à l'écran) */
        .pf-wrap { container-type: inline-size; container-name: pf; width: 100%; min-width: 0; box-sizing: border-box; }
        .pf-wrap *, .pf-wrap *::before, .pf-wrap *::after { box-sizing: border-box; }

        .pf-root { display: grid; gap: clamp(12px, 3cqi, 20px); grid-template-columns: minmax(0, 1fr); align-items: start; }
        @container pf (min-width: 760px) {
          .pf-root { grid-template-columns: minmax(280px, 1fr) minmax(0, 2fr); }
        }
        .pf-col { display: flex; flex-direction: column; gap: clamp(12px, 3cqi, 16px); min-width: 0; }

        /* Grilles automatiques : le nombre de colonnes dépend de la place disponible */
        .pf-grid { display: grid; gap: 14px 18px;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr)); }

        .pf-panel { width: 100%; background: ${CARD}; border: 1px solid ${BORDER}; border-radius: 16px;
          padding: clamp(14px, 4cqi, 20px); box-shadow: 0 1px 2px rgba(0,0,0,.04); min-width: 0; overflow: hidden; }
        .pf-head { display: flex; align-items: center; gap: 12px; }
        .pf-icon { width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; }
        .pf-title { font-weight: 700; font-size: clamp(14px, 4cqi, 16px); color: ${TEXT}; overflow-wrap: anywhere; }
        .pf-sub { font-size: clamp(12px, 3.4cqi, 13px); color: ${MUTED}; line-height: 1.35; }
        .pf-sep { border-top: 1px solid ${BORDER}; margin: 14px 0; }

        .pf-field { min-width: 0; }
        .pf-label { font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: ${MUTED};
          font-weight: 700; margin-bottom: 4px; overflow-wrap: anywhere; }
        .pf-value { font-size: clamp(14px, 4cqi, 15px); color: ${TEXT}; font-weight: 500; min-width: 0; overflow-wrap: anywhere; }

        .pf-chip { display: inline-flex; align-items: center; gap: 6px; border: 1px solid ${BORDER};
          border-radius: 999px; padding: 3px 10px; font-size: 13px; background: #fff; color: ${TEXT}; }

        .pf-hero { border-radius: 20px; padding: clamp(16px, 5cqi, 24px); color: #fff; overflow: hidden;
          width: 100%; background-color: #07201F;
          background-image:
            radial-gradient(circle at 20% 15%, rgba(20,90,80,.45), transparent 55%),
            radial-gradient(circle at 85% 40%, rgba(30,110,95,.30), transparent 50%),
            radial-gradient(circle at 40% 95%, rgba(15,70,62,.40), transparent 55%); }
        .pf-avatar { width: clamp(72px, 22cqi, 96px); aspect-ratio: 1; border-radius: 50%; margin: 0 auto 12px;
          background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.25);
          display: flex; align-items: center; justify-content: center;
          font-size: clamp(24px, 8cqi, 32px); font-weight: 800; }
        .pf-name-row { display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; text-align: center; }
        .pf-name { font-weight: 800; font-size: clamp(18px, 6cqi, 22px); overflow-wrap: anywhere; }
        .pf-stage { background: #fff; color: ${GREEN}; font-weight: 800; font-size: 12px;
          padding: 2px 10px; border-radius: 999px; white-space: nowrap; }
        .pf-center { text-align: center; }
        .pf-pill { font-size: 12px; padding: 3px 10px; border-radius: 999px; border: 1px solid rgba(255,255,255,.25);
          background: rgba(255,255,255,.08); color: #fff; }

        .pf-stats { display: grid; gap: 8px; margin-top: 16px;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 88px), 1fr)); }
        .pf-stat { background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.18);
          border-radius: 12px; padding: 10px 6px; text-align: center; min-width: 0; }
        .pf-stat-v { font-weight: 800; font-size: clamp(16px, 5cqi, 20px); }
        .pf-stat-l { font-size: 11px; color: rgba(255,255,255,.7); line-height: 1.2; overflow-wrap: anywhere; }

        .pf-contacts { border-top: 1px solid rgba(255,255,255,.15); margin-top: 16px; padding-top: 14px;
          display: flex; flex-direction: column; gap: 10px; }
        .pf-contact { display: flex; align-items: flex-start; gap: 10px; font-size: clamp(13px, 3.8cqi, 14px);
          color: rgba(255,255,255,.92); min-width: 0; overflow-wrap: anywhere; }
        .pf-contact svg { flex-shrink: 0; margin-top: 2px; }

        .pf-bar { margin-top: 12px; height: 6px; background: #E4E9E4; border-radius: 999px; overflow: hidden; }
      `}</style>

      <div className="pf-root">
        {/* GAUCHE */}
        <div className="pf-col">
          <div className="pf-hero">
            <div className="pf-avatar">{initials}</div>

            <div className="pf-name-row">
              <div className="pf-name">{fullName}</div>
              {hasStage ? <span className="pf-stage">{stageName}</span> : null}
            </div>

            {levelLine ? <div className="pf-center" style={{ marginTop: 6, color: "rgba(255,255,255,.85)" }}>{levelLine}</div> : null}
            {academicYear ? <div className="pf-center" style={{ fontSize: 13, color: "rgba(255,255,255,.6)" }}>Academic year {academicYear}</div> : null}

            {tags.length ? (
              <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginTop: 12 }}>
                {tags.map((t) => <span key={t} className="pf-pill">{t}</span>)}
              </div>
            ) : null}

            <div className="pf-stats">
              <div className="pf-stat"><div className="pf-stat-v">{fmt(foldersDone, foldersTotal)}</div><div className="pf-stat-l">Folders done</div></div>
              <div className="pf-stat"><div className="pf-stat-v">{show(applicationsCount)}</div><div className="pf-stat-l">Applications</div></div>
              <div className="pf-stat"><div className="pf-stat-v">{fmt(tasksDone, tasksTotal)}</div><div className="pf-stat-l">Tasks done</div></div>
            </div>

            {contactLines.length ? (
              <div className="pf-contacts">
                {contactLines.map(([Icon, v], i) => (
                  <div key={i} className="pf-contact"><Icon size={15} /><span style={{ minWidth: 0 }}>{v}</span></div>
                ))}
              </div>
            ) : null}
          </div>

          <section className="pf-card pf-panel">
            <div className="pf-head">
              <div className="pf-icon" style={{ background: GREEN, color: "#fff" }}><FiCreditCard size={18} /></div>
              <div style={{ minWidth: 0 }}>
                <div className="pf-title">Agency fee</div>
                <div className="pf-sub">
                  {totalFee != null
                    ? remaining > 0
                      ? `${collected.toLocaleString("en-US")} TND of ${totalFee.toLocaleString("en-US")} TND collected - ${remaining.toLocaleString("en-US")} TND to go`
                      : <span style={{ color: GREEN, fontWeight: 700 }}>Fully paid</span>
                    : `${collected.toLocaleString("en-US")} TND collected - no fee set yet`}
                </div>
              </div>
            </div>
            {totalFee != null ? (
              <div className="pf-bar">
                <div style={{ width: `${Math.min(100, (collected / totalFee) * 100)}%`, height: "100%", background: GREEN }} />
              </div>
            ) : null}
          </section>
        </div>

        {/* DROITE */}
        <div className="pf-col">
          <Card icon={<FaIdCard size={16} />} title="Legal identity" subtitle="Spelled exactly as on the passport">
            <div className="pf-grid">
              <Field label="Legal first name">{show(userObj.firstName)}</Field>
              <Field label="Legal last name">{show(userObj.lastName)}</Field>
              <Field label="Date of birth"><DateValue value={userObj.dob} /></Field>
              <Field label="Birth place">{show(userObj.birthPlace)}</Field>
              <Field label="Nationality">{show(userObj.nationality)}</Field>
              <Field label="Gender">{show(userObj.gender)}</Field>
            </div>
          </Card>

          <Card icon={<FaLandmark size={16} />} title="Passport" subtitle="Must stay valid past the departure date">
            <div className="pf-grid">
              <Field label="Passport number">{show(userObj.passport)}</Field>
              <Field label="Issuing authority">{show(userObj.passportAuthority)}</Field>
              <Field label="Issued"><DateValue value={userObj.passportIssued} /></Field>
              <Field label="Expires"><DateValue value={userObj.passportExpires} danger={expDanger} /></Field>
            </div>
          </Card>

          <Card icon={<FaGraduationCap size={17} />} title="Study plan" subtitle="What we are applying for">
            <div className="pf-grid">
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
    </div>
  );
}