import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { FiCopy, FiCheck, FiLink, FiUser, FiRefreshCw, FiArrowLeft } from "react-icons/fi";
import axiosInstance from "../../api/axiosInstance";

/* ───────── OVERLAY ───────── */
const Overlay = styled.div`
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(6, 12, 10, 0.55);
  backdrop-filter: blur(3px);
  display: flex; align-items: center; justify-content: center;
  padding: 1.5rem;
`;

const Card = styled.div`
  width: 100%; max-width: 560px;
  max-height: 88vh; overflow-y: auto;
  background: var(--adm-panel);
  border: 1px solid var(--adm-border);
  border-radius: 20px;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.35);
  padding: 1.75rem;
  color: var(--adm-text);
`;

const Title = styled.h2`
  margin: 0 0 .25rem; font-size: 1.15rem; font-weight: 800; color: var(--adm-text);
`;
const Sub = styled.p`
  margin: 0 0 1.25rem; font-size: .85rem; color: var(--adm-muted); line-height: 1.5;
`;

/* ───────── OPTION CARDS ───────── */
const Options = styled.div` display: grid; gap: .75rem; `;

const OptionCard = styled.button`
  display: flex; align-items: flex-start; gap: .9rem; width: 100%; text-align: left;
  padding: 1rem 1.1rem;
  border-radius: 14px; cursor: pointer;
  border: 1px solid var(--adm-border);
  background: var(--adm-surface);
  transition: all .2s ease;

  &:hover { border-color: var(--adm-accent); background: var(--adm-accent-soft); }
`;

const OptionIcon = styled.span`
  width: 38px; height: 38px; flex: 0 0 38px;
  border-radius: 10px; display: grid; place-items: center;
  background: var(--adm-accent-soft); color: var(--adm-accent); font-size: 18px;
`;
const OptionTitle = styled.div` font-size: .95rem; font-weight: 700; color: var(--adm-text); `;
const OptionDesc = styled.div` font-size: .8rem; color: var(--adm-muted); margin-top: .15rem; line-height: 1.45; `;

/* ───────── FORM ───────── */
const Grid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: .85rem;
  @media (max-width: 560px) { grid-template-columns: 1fr; }
`;
const Field = styled.div` display: flex; flex-direction: column; gap: .3rem; `;
const FullField = styled(Field)` grid-column: 1 / -1; `;
const Label = styled.label` font-size: .78rem; color: var(--adm-muted); font-weight: 600; `;
const Input = styled.input`
  padding: .6rem .75rem; border-radius: 10px;
  border: 1px solid var(--adm-border); background: var(--adm-input-bg); color: var(--adm-text);
  font-size: .87rem; outline: none; transition: all .2s ease;
  &:focus { border-color: var(--adm-accent); box-shadow: 0 0 0 3px var(--adm-accent-soft); }
`;

const LinkRow = styled.div`
  display: flex; gap: .5rem; align-items: stretch;
  input {
    flex: 1; min-width: 0; padding: .65rem .8rem; border-radius: 10px;
    border: 1px solid var(--adm-border); background: var(--adm-input-bg); color: var(--adm-text);
    font-size: .84rem; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }
`;

const Expiry = styled.div` font-size: .8rem; color: var(--adm-muted); margin-top: .6rem; `;

const ErrorBox = styled.div`
  margin-top: .85rem; padding: .65rem .8rem; border-radius: 10px; font-size: .82rem;
  background: var(--adm-danger-soft); color: var(--adm-danger);
  border: 1px solid var(--adm-danger);
`;

const SuccessBox = styled.div`
  margin-top: .85rem; padding: .8rem; border-radius: 12px;
  background: var(--adm-chip-green-bg); color: var(--adm-chip-green-text);
  border: 1px solid var(--adm-border); font-size: .85rem; line-height: 1.55;
`;

/* ───────── BUTTONS ───────── */
const Actions = styled.div` display: flex; gap: .6rem; justify-content: flex-end; margin-top: 1.4rem; flex-wrap: wrap; `;
const Btn = styled.button`
  padding: .6rem 1.1rem; border-radius: 10px; font-size: .85rem; font-weight: 700; cursor: pointer;
  border: 1px solid var(--adm-border); background: var(--adm-surface); color: var(--adm-text);
  transition: all .2s ease; display: inline-flex; align-items: center; gap: .4rem;
  &:hover:not(:disabled) { background: var(--adm-hover); }
  &:disabled { opacity: .55; cursor: not-allowed; }
`;
const PrimaryBtn = styled(Btn)`
  background: var(--adm-accent); color: #fff; border-color: var(--adm-accent);
  &:hover:not(:disabled) { filter: brightness(1.06); background: var(--adm-accent); }
`;

/* ───────── COMPONENT ───────── */
export default function InviteStudentModal({ open, onClose, onStudentCreated }) {
  const [view, setView] = useState("choose"); // choose | link | manual | done
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);
  const [tempPassword, setTempPassword] = useState(null);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phoneNumber: "",
    passport: "", address: "", password: ""
  });

  useEffect(() => {
    if (open) {
      setView("choose"); setLink(""); setCopied(false); setError(""); setSaving(false);
      setCreated(null); setTempPassword(null);
      setForm({ firstName: "", lastName: "", email: "", phoneNumber: "", passport: "", address: "", password: "" });
    }
  }, [open]);

  if (!open) return null;

  const copyText = async (text, onDone) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const el = document.createElement("textarea");
        el.value = text;
        el.style.position = "fixed";
        el.style.opacity = "0";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      onDone();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      setError("Could not copy. Select the text and copy it manually.");
    }
  };

  const createLink = async () => {
    setSaving(true); setError("");
    try {
      const res = await axiosInstance.post("/invites", {});
      if (res.data?.success) {
        setLink(res.data.data.url);
        setView("link");
      } else {
        setError(res.data?.message || "Could not create the invitation link.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not create the invitation link.");
    } finally {
      setSaving(false);
    }
  };

  const generatePassword = () => {
    const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out = "";
    for (let i = 0; i < 12; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
    setForm(f => ({ ...f, password: out }));
  };

  const createManual = async () => {
    setSaving(true); setError("");
    try {
      const res = await axiosInstance.post("/invites/manual", {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        passport: form.passport || undefined,
        address: form.address || undefined,
        password: form.password || undefined
      });
      if (res.data?.success) {
        setCreated(res.data.user);
        setTempPassword(res.data.temporaryPassword || null);
        setView("done");
        if (onStudentCreated) onStudentCreated(res.data.user);
      } else {
        setError(res.data?.message || "Could not create the student.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not create the student.");
    } finally {
      setSaving(false);
    }
  };

  const update = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <Overlay onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <Card role="dialog" aria-modal="true" aria-label="Invite student">
        {view === "choose" && (
          <>
            <Title>Invite a student</Title>
            <Sub>Choose how you want to bring this student on board.</Sub>
            <Options>
              <OptionCard onClick={createLink} disabled={saving}>
                <OptionIcon><FiLink /></OptionIcon>
                <div>
                  <OptionTitle>Send a link</OptionTitle>
                  <OptionDesc>Generate a link and let the student fill in their own details.</OptionDesc>
                </div>
              </OptionCard>
              <OptionCard onClick={() => setView("manual")}>
                <OptionIcon><FiUser /></OptionIcon>
                <div>
                  <OptionTitle>Fill in manually</OptionTitle>
                  <OptionDesc>Enter the student's details yourself.</OptionDesc>
                </div>
              </OptionCard>
            </Options>
            {error && <ErrorBox>{error}</ErrorBox>}
          </>
        )}

        {view === "link" && (
          <>
            <Title>Invitation link</Title>
            <Sub>Share this link with the student. They enter their own details when they sign up.</Sub>
            <LinkRow>
              <input readOnly value={link} onFocus={e => e.target.select()} aria-label="Invitation link" />
              <Btn onClick={() => copyText(link, () => {})} aria-label="Copy link">
                {copied ? <><FiCheck /> Copied</> : <><FiCopy /> Copy link</>}
              </Btn>
            </LinkRow>
            <Expiry>Valid for 7 days.</Expiry>
            {error && <ErrorBox>{error}</ErrorBox>}
            <Actions>
              <Btn onClick={createLink} disabled={saving}><FiRefreshCw /> New link</Btn>
              <PrimaryBtn onClick={() => setView("choose")}><FiArrowLeft /> Back</PrimaryBtn>
            </Actions>
          </>
        )}

        {view === "manual" && (
          <>
            <Title>New student</Title>
            <Sub>The account is created in the Invited stage and awaits approval.</Sub>
            <Grid>
              <Field>
                <Label htmlFor="inv-first">First name</Label>
                <Input id="inv-first" value={form.firstName} onChange={update("firstName")} required maxLength={60} />
              </Field>
              <Field>
                <Label htmlFor="inv-last">Last name</Label>
                <Input id="inv-last" value={form.lastName} onChange={update("lastName")} required maxLength={60} />
              </Field>
              <Field>
                <Label htmlFor="inv-email">Email</Label>
                <Input id="inv-email" type="email" value={form.email} onChange={update("email")} required />
              </Field>
              <Field>
                <Label htmlFor="inv-phone">Phone</Label>
                <Input id="inv-phone" value={form.phoneNumber} onChange={update("phoneNumber")} required />
              </Field>
              <Field>
                <Label htmlFor="inv-passport">Passport (optional)</Label>
                <Input id="inv-passport" value={form.passport} onChange={update("passport")} />
              </Field>
              <Field>
                <Label htmlFor="inv-address">Address (optional)</Label>
                <Input id="inv-address" value={form.address} onChange={update("address")} />
              </Field>
              <FullField>
                <Label htmlFor="inv-pass">Temporary password (optional)</Label>
                <LinkRow>
                  <Input id="inv-pass" value={form.password} onChange={update("password")} placeholder="Generated automatically if left empty" />
                  <Btn type="button" onClick={generatePassword}>Generate</Btn>
                </LinkRow>
              </FullField>
            </Grid>
            {error && <ErrorBox>{error}</ErrorBox>}
            <Actions>
              <Btn onClick={() => setView("choose")}><FiArrowLeft /> Back</Btn>
              <PrimaryBtn onClick={createManual} disabled={saving}>{saving ? "Creating…" : "Create student"}</PrimaryBtn>
            </Actions>
          </>
        )}

        {view === "done" && created && (
          <>
            <Title>Student created</Title>
            <Sub>The account is in the Invited stage and awaits your approval.</Sub>
            <SuccessBox>
              <strong>{created.firstName} {created.lastName}</strong><br />
              {created.email}
            </SuccessBox>
            {tempPassword && (
              <>
                <Expiry>Temporary password — shown once. Share it with the student now.</Expiry>
                <LinkRow>
                  <input readOnly value={tempPassword} onFocus={e => e.target.select()} aria-label="Temporary password" />
                  <Btn onClick={() => copyText(tempPassword, () => {})} aria-label="Copy password">
                    {copied ? <><FiCheck /> Copied</> : <><FiCopy /> Copy</>}
                  </Btn>
                </LinkRow>
              </>
            )}
            {error && <ErrorBox>{error}</ErrorBox>}
            <Actions>
              <Btn onClick={onClose}>Close</Btn>
              <PrimaryBtn onClick={() => { setView("manual"); setCreated(null); setTempPassword(null); setError(""); }}>
                Add another
              </PrimaryBtn>
            </Actions>
          </>
        )}
      </Card>
    </Overlay>
  );
}
