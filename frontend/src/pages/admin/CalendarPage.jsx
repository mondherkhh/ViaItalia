import React, { useState, useEffect, useCallback, useRef } from "react";
import ReactDOM from "react-dom";
import styled, { createGlobalStyle } from "styled-components";
import { FiChevronLeft, FiChevronRight, FiChevronDown, FiPlus, FiCalendar, FiRepeat, FiCheck, FiMapPin, FiUser, FiMoreVertical, FiTrash2, FiEdit2 } from "react-icons/fi";
import { format, parseISO, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isBefore } from "date-fns";
import { enUS } from "date-fns/locale";
import { getEvents, createEvent, updateEvent, deleteEvent, getSummary } from "../../api/calendarService";

/* ── Design tokens (light values are the spec values; dark overrides keep the page readable) ── */
const Container = styled.div`
  --cal-card: #EBEEE7;
  --cal-card-2: #F0F1EE;
  --cal-border: #DDE2D9;
  --cal-line: #D5DAD0;
  --cal-text: #12231B;
  --cal-muted: #7C877F;
  --cal-faint: #9AA39C;
  --cal-green: #0B7A3E;
  --cal-red: #C62828;
  --cal-red-soft: #FBE3E3;
  --cal-blue: #2B5FB4;
  --cal-blue-soft: #DCE9FB;
  --cal-amber: #C0902F;
  --cal-amber-soft: #FBE9C8;
  --cal-white: #FFFFFF;

  body[data-theme="dark"] & {
    --cal-card: #16201B;
    --cal-card-2: #111915;
    --cal-border: rgba(255,255,255,.10);
    --cal-line: rgba(255,255,255,.16);
    --cal-text: #E8F1EB;
    --cal-muted: #8A9A90;
    --cal-faint: #6F7E75;
    --cal-green: #2DBA6A;
    --cal-red: #E8697A;
    --cal-red-soft: rgba(200,40,48,.16);
    --cal-blue: #6FA0E0;
    --cal-blue-soft: rgba(43,95,180,.18);
    --cal-amber: #D9A94A;
    --cal-amber-soft: rgba(192,144,47,.18);
    --cal-white: #16201B;
  }

  padding: 0 0 24px;
`;

const Toolbar = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; min-height: 36px;
`;
const ToolbarSide = styled.div` display: flex; align-items: center; gap: 10px; flex-wrap: wrap; `;
const NavBtn = styled.button`
  width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--cal-line); background: transparent;
  display: inline-flex; align-items: center; justify-content: center; cursor: pointer; color: var(--cal-text);
`;
const Title = styled.div` font-size: 18px; font-weight: 500; color: var(--cal-text); `;
const SmallBtn = styled.button`
  font-size: 13px; font-weight: 600; background: transparent; border: none; color: var(--cal-green);
  cursor: pointer; padding: 0 4px;
`;
const OverduePill = styled.button`
  height: 36px; border-radius: 999px; padding: 0 14px; font-size: 12px; font-weight: 700;
  background: var(--cal-red-soft); color: var(--cal-red); border: none; cursor: pointer;
`;
const Segment = styled.div`
  display: inline-flex; border: 1px solid var(--cal-line); border-radius: 999px; padding: 3px; background: transparent;
`;
const SegBtn = styled.button`
  padding: 5px 13px; font-size: 12.5px; font-weight: 600; border: none; border-radius: 999px;
  background: ${p => (p.$active ? "#0B7A3E" : "transparent")};
  color: ${p => (p.$active ? "#fff" : "var(--cal-muted)")};
  cursor: pointer;
`;
const SelectWrap = styled.div` position: relative; display: inline-flex; align-items: center; `;
const OwnerSelect = styled.select`
  height: 36px; border-radius: 10px; border: 1px solid var(--cal-line); background: transparent;
  font-size: 12.5px; padding: 0 28px 0 12px; appearance: none; -webkit-appearance: none;
  cursor: pointer; color: var(--cal-text);
`;
const SelectIcon = styled.span`
  position: absolute; right: 9px; pointer-events: none; display: inline-flex; color: var(--cal-muted);
`;
const AddBtn = styled.button`
  height: 36px; border-radius: 10px; background: #0B7A3E; color: #fff; font-weight: 700; font-size: 12.5px;
  border: none; padding: 0 16px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
  box-shadow: 0 4px 12px rgba(11,122,62,.3);
`;
const GridCard = styled.div`
  border-radius: 14px; border: 1px solid var(--cal-border); background: var(--cal-card);
  margin-top: 16px; padding: 16px 20px;
`;
const DayHeader = styled.div`
  font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: var(--cal-faint);
  font-weight: 700; margin: 18px 0 8px;
`;
const OccCard = styled.div`
  display: flex; align-items: center; gap: 14px; padding: 14px 18px;
  border: 1px solid var(--cal-border); border-radius: 14px; background: var(--cal-card);
  margin-bottom: 8px; cursor: pointer; text-align: left; width: 100%;
`;
const Dot = styled.div` width: 7px; height: 28px; border-radius: 4px; flex-shrink: 0; `;
const TimeCol = styled.div` width: 70px; font-size: 13px; color: var(--cal-muted); flex-shrink: 0; `;
const OccBody = styled.div` flex: 1; min-width: 0; `;
const OccTitle = styled.div` font-weight: 500; font-size: 14px; color: var(--cal-text); `;
const MetaLine = styled.div`
  font-size: 12px; color: var(--cal-muted); margin-top: 4px; display: flex; gap: 14px;
  flex-wrap: wrap; align-items: center;
`;
const MetaItem = styled.span` display: inline-flex; align-items: center; gap: 5px; `;
const StudentLink = styled.a` color: var(--cal-green); font-weight: 600; text-decoration: none; `;
const MarkDoneBtn = styled.button`
  height: 34px; border-radius: 10px; border: 1px solid var(--cal-line); background: transparent;
  color: var(--cal-text); font-size: 12.5px; font-weight: 600; padding: 0 12px; cursor: pointer;
  display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0;
`;
const KebabWrap = styled.div` position: relative; margin-left: auto; flex-shrink: 0; display: inline-flex; `;
const KebabBtn = styled.button`
  width: 30px; height: 30px; border-radius: 8px; border: 1px solid var(--cal-border);
  background: transparent; color: var(--cal-muted); cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
`;
const Menu = styled.div`
  min-width: 150px;
  border-radius: 12px; border: 1px solid var(--cal-border); background: var(--cal-card);
  box-shadow: 0 10px 28px rgba(16,32,24,.16); padding: 6px;
`;
/* Portal root: carries its own token set because it is rendered outside the page Container */
const MenuShell = styled.div`
  position: fixed; z-index: 1000; min-width: 150px;
  --cal-card: #EBEEE7; --cal-card-2: #F0F1EE; --cal-border: #DDE2D9; --cal-line: #D5DAD0;
  --cal-text: #12231B; --cal-muted: #7C877F; --cal-faint: #9AA39C; --cal-green: #0B7A3E;
  --cal-red: #C62828; --cal-red-soft: #FBE3E3; --cal-blue: #2B5FB4; --cal-blue-soft: #DCE9FB;
  --cal-amber: #C0902F; --cal-amber-soft: #FBE9C8; --cal-white: #FFFFFF;
  body[data-theme="dark"] & {
    --cal-card: #16201B; --cal-card-2: #111915; --cal-border: rgba(255,255,255,.10);
    --cal-line: rgba(255,255,255,.16); --cal-text: #E8F1EB; --cal-muted: #8A9A90;
    --cal-faint: #6F7E75; --cal-green: #2DBA6A; --cal-red: #E8697A;
    --cal-red-soft: rgba(200,40,48,.16); --cal-blue: #6FA0E0; --cal-blue-soft: rgba(43,95,180,.18);
    --cal-amber: #D9A94A; --cal-amber-soft: rgba(192,144,47,.18); --cal-white: #16201B;
  }
  position: fixed; z-index: 1000; min-width: 150px;
`;
const MenuItem = styled.button`
  display: flex; align-items: center; gap: 8px; width: 100%; border: none; background: transparent;
  border-radius: 8px; padding: 8px 10px; font-size: 12.5px; font-weight: 600; cursor: pointer;
  color: ${p => (p.$danger ? "var(--cal-red)" : "var(--cal-text)")};
  text-align: left;
  &:hover { background: ${p => (p.$danger ? "var(--cal-red-soft)" : "var(--cal-card-2)")}; }
`;
const EmptyNote = styled.p` color: var(--cal-muted); margin-top: 12px; font-size: 13px; `;
const ErrorBox = styled.div`
  margin-top: 14px; padding: 14px 16px; border-radius: 12px; border: 1px solid var(--cal-red);
  background: var(--cal-red-soft); color: var(--cal-red); font-size: 13px;
  display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
`;
const Skeleton = styled.div`
  height: 62px; border-radius: 14px; background: var(--cal-card-2); margin-bottom: 8px;
  animation: cal-pulse 1.4s ease-in-out infinite;
  @keyframes cal-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .45; } }
`;
const GlobalCal = createGlobalStyle`
  @media (max-width: 900px) {
    .calendar-cell { min-height: 70px !important; }
  }
`;

const DOT_EVENT = "var(--cal-blue)";
const DOT_DEADLINE = "var(--cal-amber)";
const DOT_OVERDUE = "var(--cal-red)";
const DOT_DONE = "var(--cal-faint)";

const fullName = u => `${(u && (u.firstName || u.lastName)) ? `${u.firstName || ""} ${u.lastName || ""}`.trim() : ""}`;

/* Dropdown placement: right-aligned under the kebab, flipped above when it would
   leave the viewport. Height ≈ 80px (2 items + padding). */
const menuPosition = rect => {
  if (!rect) return null;
  const MENU_H = 80;
  const MENU_W = 150;
  const below = rect.bottom + 4;
  const top = below + MENU_H > window.innerHeight ? Math.max(8, rect.top - MENU_H - 4) : below;
  const left = Math.max(8, Math.min(rect.right - MENU_W, window.innerWidth - MENU_W - 8));
  return { left, top };
};

export default function CalendarPage({ openDossier }) {
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [summary, setSummary] = useState({ overdueDeadlines: 0, upcoming7: 0 });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ kind: "EVENT", title: "", notes: "", allDay: false, startsAt: "", endsAt: "", location: "", studentId: "", ownerId: "", remindMinutes: "", repeatRule: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [people, setPeople] = useState({});
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [openMenuKey, setOpenMenuKey] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [menuRect, setMenuRect] = useState(null);

  /* Recurring events are expanded on the client: one occurrence per day it happens in the window.
     The master record is never rendered on its own once expanded. */
  const expandOccurrences = (list, from, to) => {
    const fromD = parseISO(from);
    const toD = parseISO(to);
    const out = [];
    list.forEach(ev => {
      const raw = ev.startsAt || ev.date;
      if (!raw) return;
      const start = new Date(raw);
      if (Number.isNaN(start.getTime())) return;
      const rule = (ev.repeatRule || "").toUpperCase();
      if (!rule) {
        if (start >= fromD && start <= toD) out.push({ ...ev, startsAt: start.toISOString() });
        return;
      }
      let cur = new Date(start);
      let guard = 0;
      while (cur <= toD && guard < 500) {
        guard += 1;
        if (cur >= fromD) out.push({ ...ev, id: `${ev.id}#${cur.getTime()}`, startsAt: cur.toISOString() });
        if (rule === "DAILY") cur = addDays(cur, 1);
        else if (rule === "WEEKLY") cur = addDays(cur, 7);
        else cur = addMonths(cur, 1);
      }
    });
    return out;
  };

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const today = new Date();
      const isAgenda = view === "agenda";
      /* Window shown to the user */
      const winFrom = isAgenda ? format(today, "yyyy-MM-dd") : format(startOfWeek(startOfMonth(date), { weekStartsOn: 1 }), "yyyy-MM-dd");
      const winTo = isAgenda ? format(addDays(today, 30), "yyyy-MM-dd") : format(endOfWeek(endOfMonth(date), { weekStartsOn: 1 }), "yyyy-MM-dd");
      /* Wider fetch window so recurring masters started earlier are still expanded */
      const fetchFrom = format(subMonths(parseISO(winFrom), 12), "yyyy-MM-dd");
      const fetchTo = winTo;

      const s = await getSummary();
      setSummary(s.data || s);

      const list = await getEvents(fetchFrom, fetchTo, ownerFilter);
      const raw = Array.isArray(list) ? list : (list?.data || list?.items || []);
      setEvents(expandOccurrences(raw, winFrom, winTo));
    } catch (e) {
      console.error(e);
      setLoadError(e?.response?.data?.message || e?.message || "Could not load the calendar.");
    } finally {
      setLoading(false);
    }
  }, [date, view, ownerFilter]);

  useEffect(() => { load(); }, [load]);

  /* Close the kebab menu on outside click or Escape */
  useEffect(() => {
    if (!openMenuKey) return undefined;
    const onDocClick = e => { if (!e.target.closest || (!e.target.closest("[data-cal-menu]") && !e.target.closest("[aria-label='Event actions']"))) setOpenMenuKey(null); };
    const onKey = e => { if (e.key === "Escape") setOpenMenuKey(null); };
    const onScroll = () => setOpenMenuKey(null);
    const onResize = () => setOpenMenuKey(null);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [openMenuKey]);

  useEffect(() => {
    (async () => {
      try {
        const mod = await import("../../api/userService");
        const arr = mod.fetchAllUsers ? await mod.fetchAllUsers() : [];
        const normalized = Array.isArray(arr) ? arr : (arr?.data ? arr.data : (arr?.users ? arr.users : []));
        const byName = (a, b) => fullName(a).localeCompare(fullName(b));
        setUsers(normalized.filter(u => u && u.role === "USER").sort(byName));
        setAdmins(normalized.filter(u => u && u.role === "ADMIN").sort(byName));
        const map = {};
        normalized.forEach(u => { if (u && u.id != null) map[u.id] = fullName(u) || u.email; });
        setPeople(map);
      } catch (e) {
        console.error(e);
        setUsers([]); setAdmins([]); setPeople({});
      }
    })();
  }, []);

  const handleCreate = async () => {
    setFormError("");
    if (!form.title || form.title.length < 1 || form.title.length > 120) { setFormError("Title must be 1-120 chars"); return; }
    if (!form.startsAt) { setFormError("Start date is required"); return; }
    if (form.endsAt && new Date(form.endsAt) < new Date(form.startsAt)) { setFormError("End must be after start"); return; }
    setSaving(true);
    try {
      await createEvent({ ...form, studentId: form.studentId ? parseInt(form.studentId) : null, ownerId: form.ownerId ? parseInt(form.ownerId) || 1 : 1, remindMinutes: form.remindMinutes ? parseInt(form.remindMinutes) : null });
      setShowModal(false);
      setForm({ kind: "EVENT", title: "", notes: "", allDay: false, startsAt: "", endsAt: "", location: "", studentId: "", ownerId: "", remindMinutes: "", repeatRule: "" });
      load();
    } catch (e) { setFormError(e?.response?.data?.message || (e?.message ? e.message.split(/\r?\n/).pop().trim() : "Failed")); } finally { setSaving(false); }
  };

  const openNew = (prefill = {}) => { setForm({ ...form, ...prefill }); setShowModal(true); };

  const daysInMonth = () => {
    const startDate = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
    const endDate = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });
    const rows = [];
    let current = startDate;
    while (current <= endDate) {
      const week = [];
      for (let d = 0; d < 7; d++) { week.push(current); current = addDays(current, 1); }
      rows.push(week);
    }
    return rows;
  };

  const dayGroups = () => {
    const groups = {};
    events.forEach(ev => {
      const d = new Date(ev.startsAt || ev.date || ev.createdAt);
      if (Number.isNaN(d.getTime())) return;
      const key = format(d, "yyyy-MM-dd");
      if (!groups[key]) groups[key] = [];
      groups[key].push(ev);
    });
    return Object.entries(groups)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([dayKey, list]) => ({
        dayKey,
        day: parseISO(`${dayKey}T00:00:00`),
        list: list.slice().sort((a, b) => {
          const ad = new Date(a.startsAt).getTime();
          const bd = new Date(b.startsAt).getTime();
          return ad - bd;
        }),
      }));
  };

  return (
    <Container>
      <GlobalCal />

      <Toolbar>
        {view === "month" ? (
          <ToolbarSide>
            <NavBtn onClick={() => setDate(subMonths(date, 1))} aria-label="Previous month"><FiChevronLeft size={16} /></NavBtn>
            <Title>{format(date, "MMMM yyyy", { locale: enUS })}</Title>
            <NavBtn onClick={() => setDate(addMonths(date, 1))} aria-label="Next month"><FiChevronRight size={16} /></NavBtn>
            <SmallBtn onClick={() => setDate(new Date())}>Today</SmallBtn>
          </ToolbarSide>
        ) : (
          <Title>Next 30 days</Title>
        )}

        <ToolbarSide style={{ justifyContent: "flex-end" }}>
          {summary.overdueDeadlines > 0 && (
            <OverduePill onClick={() => { setView("month"); setDate(new Date()); }}>
              {summary.overdueDeadlines} overdue deadline{summary.overdueDeadlines > 1 ? "s" : ""}
            </OverduePill>
          )}
          <Segment>
            <SegBtn $active={view === "month"} onClick={() => setView("month")}>Month</SegBtn>
            <SegBtn $active={view === "agenda"} onClick={() => setView("agenda")}>Agenda</SegBtn>
          </Segment>
          <SelectWrap>
            <OwnerSelect
              value={ownerFilter}
              onChange={e => setOwnerFilter(e.target.value)}
            >
              <option value="all">Everyone</option>
              <option value="me">Me</option>
              {admins.map(a => <option key={`a${a.id}`} value={String(a.id)}>{fullName(a)}</option>)}
              {users.map(u => <option key={`u${u.id}`} value={String(u.id)}>{fullName(u)}</option>)}
            </OwnerSelect>
            <SelectIcon><FiChevronDown size={14} /></SelectIcon>
          </SelectWrap>
          <AddBtn onClick={() => openNew({ startsAt: format(new Date(), "yyyy-MM-dd'T'HH:mm") })}>
            <FiPlus size={16} /> New event
          </AddBtn>
        </ToolbarSide>
      </Toolbar>

      {loadError && (
        <ErrorBox>
          <span>{loadError}</span>
          <button onClick={load} style={{ background: "transparent", border: "1px solid currentColor", borderRadius: 8, padding: "6px 12px", fontWeight: 700, cursor: "pointer", color: "inherit" }}>Retry</button>
        </ErrorBox>
      )}

      {view === "month" ? (
        <GridCard>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
            {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "var(--cal-muted)", fontWeight: 700 }}>{d}</div>
            ))}
          </div>
          {daysInMonth().map((week, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, borderTop: "1px solid var(--cal-border)" }}>
              {week.map(day => {
                const dayEvents = events.filter(ev => isSameDay(new Date(ev.startsAt || ev.date || ev.createdAt), day));
                const outside = !isSameMonth(day, date);
                const isToday = isSameDay(day, new Date());
                return (
                  <div
                    key={day.toISOString()}
                    className="calendar-cell"
                    onClick={() => openNew({ startsAt: format(day, "yyyy-MM-dd") })}
                    style={{
                      minHeight: 110, padding: 8, border: "1px solid var(--cal-border)",
                      background: outside ? "var(--cal-card-2)" : "transparent", textAlign: "left",
                      cursor: "pointer", borderRadius: 6,
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: isToday ? 800 : 600, color: outside ? "var(--cal-muted)" : "var(--cal-text)" }}>
                      {isToday ? (
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: "50%", background: "#0B7A3E", color: "#fff" }}>{format(day, "d")}</span>
                      ) : format(day, "d")}
                    </div>
                    {dayEvents.slice(0, 2).map(ev => {
                      const overdue = ev.kind === "DEADLINE" && !ev.done && isBefore(new Date(ev.startsAt), new Date());
                      const bg = ev.kind === "DEADLINE" ? (ev.done ? "transparent" : (overdue ? "var(--cal-red-soft)" : "var(--cal-amber-soft)")) : "var(--cal-blue-soft)";
                      const fg = ev.kind === "DEADLINE" ? (ev.done ? "var(--cal-faint)" : (overdue ? "var(--cal-red)" : "var(--cal-amber)")) : "var(--cal-blue)";
                      const mKey = `m${ev.id}|${ev.startsAt}`;
                      return (
                        <div
                          key={ev.id}
                          data-cal-menu
                          onClick={e => e.stopPropagation()}
                          style={{ fontSize: 11, padding: "3px 6px", borderRadius: 6, background: bg, color: fg, marginTop: 3, whiteSpace: "nowrap", textOverflow: "ellipsis", textDecoration: ev.done ? "line-through" : "none", overflow: "visible" }} role="button" tabIndex={0} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openNew({...ev,startsAt:ev.startsAt});}}}
                        >
                          <span style={{ display: "block", overflow: "visible", textOverflow: "ellipsis" }}>{ev.title}</span>
                          <button
                            aria-label="Event actions"
                            aria-haspopup="menu"
                            aria-expanded={openMenuKey === mKey}
                            onClick={e => {
                              e.stopPropagation();
                              if (openMenuKey === mKey) { setOpenMenuKey(null); setMenuRect(null); return; }
                              const r = e.currentTarget.getBoundingClientRect();
                              setMenuRect({ right: r.right, bottom: r.bottom, top: r.top, left: r.left, width: r.width, height: r.height });
                              setOpenMenuKey(mKey);
                            }}
                            style={{
                              position: "absolute", top: 2, right: 2, width: 20, height: 20, borderRadius: 6,
                              border: "none", background: "transparent", color: "inherit", cursor: "pointer",
                              display: "inline-flex", alignItems: "center", justifyContent: "center", opacity: .75,
                            }}
                          >
                            <FiMoreVertical size={12} />
                          </button>
                        {openMenuKey === mKey && menuRect && (
                          ReactDOM.createPortal(
                            <MenuShell
                              style={{
                                ...menuPosition(menuRect),
                              }}
                            >
                              <Menu role="menu" data-cal-menu>
                                <MenuItem role="menuitem" onClick={() => { setOpenMenuKey(null); setMenuRect(null); openNew({ ...ev, startsAt: ev.startsAt }); }}>
                                  <FiEdit2 size={14} /> Edit
                                </MenuItem>
                                <MenuItem
                                  role="menuitem"
                                  $danger
                                  onClick={() => {
                                    setOpenMenuKey(null); setMenuRect(null);
                                    setDeleteError("");
                                    setConfirmDelete({ id: String(ev.id).split("#")[0], title: ev.title, kind: ev.kind || "EVENT", recurring: !!ev.repeatRule });
                                  }}
                                >
                                  <FiTrash2 size={14} /> Delete
                                </MenuItem>
                              </Menu>
                            </MenuShell>,
                            document.body
                          )
                        )}
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && <div style={{ fontSize: 10, color: "var(--cal-muted)", marginTop: 2 }}>+{dayEvents.length - 2} more</div>}
                  </div>
                );
              })}
            </div>
          ))}
        </GridCard>
      ) : (
        <div>
          {loading ? (
            <>
              <Skeleton /><Skeleton /><Skeleton />
            </>
          ) : (
            <>
              {dayGroups().map(({ dayKey, day, list }) => (
                <div key={dayKey}>
                  <DayHeader>{format(day, "EEEE d MMMM", { locale: enUS }).toUpperCase()}</DayHeader>
                  {list.map(ev => {
                    const timeStr = ev.allDay ? "All day" : format(new Date(ev.startsAt), "HH:mm", { locale: enUS });
                    const overdue = ev.kind === "DEADLINE" && !ev.done && isBefore(new Date(ev.startsAt), new Date());
                    const dotColor = ev.done ? DOT_DONE : (ev.kind === "DEADLINE" ? (overdue ? DOT_OVERDUE : DOT_DEADLINE) : DOT_EVENT);
                    const ownerName = ev.ownerName || people[ev.ownerId];
                    const studentName = ev.studentName || people[ev.studentId];
                    const menuKey = `${ev.id}|${ev.startsAt}`;
                    return (
                      <OccCard
                        key={ev.id}
                        onClick={() => openNew({ ...ev, startsAt: ev.startsAt })}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openNew({ ...ev, startsAt: ev.startsAt }); } }}
                      >
                        <Dot style={{ background: dotColor }} />
                        <TimeCol>{timeStr}</TimeCol>
                        <OccBody>
                          <OccTitle>{ev.title}</OccTitle>
                          <MetaLine>
                            <MetaItem><FiCalendar size={13} /> {ev.kind === "EVENT" ? "Event" : "Deadline"}</MetaItem>
                            {ev.repeatRule && <MetaItem><FiRepeat size={13} /> Every {ev.repeatRule.toLowerCase()}</MetaItem>}
                            {ownerName && <MetaItem><FiUser size={13} /> {ownerName}</MetaItem>}
                            {ev.location && <MetaItem><FiMapPin size={13} /> {ev.location}</MetaItem>}
                            {studentName && (
                              <StudentLink
                                href="#"
                                onClick={e => { e.preventDefault(); e.stopPropagation(); if (openDossier) openDossier(ev.studentId || ev.student?.id); }}
                              >
                                {studentName}
                              </StudentLink>
                            )}
                          </MetaLine>
                        </OccBody>
                        {!ev.done && ev.kind === "DEADLINE" && (
                          <MarkDoneBtn
                            onClick={e => {
                              e.stopPropagation();
                              const rawId = String(ev.id).split("#")[0];
                              updateEvent(rawId, { done: true }).then(load).catch(err => { console.error(err); setLoadError("Failed to mark the deadline as done."); });
                            }}
                          >
                            <FiCheck size={14} /> Mark done
                          </MarkDoneBtn>
                        )}
                        <KebabWrap data-cal-menu>
                          <KebabBtn
                            aria-label="Event actions"
                            aria-haspopup="menu"
                            aria-expanded={openMenuKey === menuKey}
                            onClick={e => {
                              e.stopPropagation();
                              if (openMenuKey === menuKey) { setOpenMenuKey(null); setMenuRect(null); return; }
                              const r = e.currentTarget.getBoundingClientRect();
                              setMenuRect({ right: r.right, bottom: r.bottom, left: r.left, top: r.top, width: r.width, height: r.height });
                              setOpenMenuKey(menuKey);
                            }}
                          >
                            <FiMoreVertical size={16} />
                          </KebabBtn>
                          {openMenuKey === menuKey && menuRect && (
                            ReactDOM.createPortal(
                              <MenuShell
                                style={{
                                  ...menuPosition(menuRect),
                                }}
                              >
                                <Menu role="menu" data-cal-menu>
                                  <MenuItem role="menuitem" onClick={() => { setOpenMenuKey(null); setMenuRect(null); openNew({ ...ev, startsAt: ev.startsAt }); }}>
                                    <FiEdit2 size={14} /> Edit
                                  </MenuItem>
                                  <MenuItem
                                    role="menuitem"
                                    $danger
                                    onClick={() => {
                                      setOpenMenuKey(null); setMenuRect(null);
                                      setDeleteError("");
                                      setConfirmDelete({ id: String(ev.id).split("#")[0], title: ev.title, kind: ev.kind || "EVENT", recurring: !!ev.repeatRule });
                                    }}
                                  >
                                    <FiTrash2 size={14} /> Delete
                                  </MenuItem>
                                </Menu>
                              </MenuShell>,
                              document.body
                            )
                          )}
                        </KebabWrap>
                      </OccCard>
                    );
                  })}
                </div>
              ))}
              {!loading && events.length === 0 && <EmptyNote>Nothing planned in the next 30 days.</EmptyNote>}
            </>
          )}
        </div>
      )}

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(6,19,33,.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }} onClick={() => setShowModal(false)}>
          <div style={{ background: "var(--cal-card)", border: "1px solid var(--cal-border)", borderRadius: 18, padding: 24, width: 620, maxWidth: "92vw" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 800, color: "var(--cal-text)" }}>New event</h3>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <button onClick={() => setForm(f => ({ ...f, kind: "EVENT" }))} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--cal-border)", background: form.kind === "EVENT" ? "var(--cal-blue-soft)" : "var(--cal-white)", color: form.kind === "EVENT" ? "var(--cal-blue)" : "var(--cal-text)", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Event</button>
              <button onClick={() => setForm(f => ({ ...f, kind: "DEADLINE" }))} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--cal-border)", background: form.kind === "DEADLINE" ? "var(--cal-amber-soft)" : "var(--cal-white)", color: form.kind === "DEADLINE" ? "var(--cal-amber)" : "var(--cal-text)", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Deadline</button>
            </div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--cal-text)" }}>Title</label>
            <input style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--cal-border)", fontSize: 14, marginBottom: 12, background: "var(--cal-white)", color: "var(--cal-text)" }} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Meeting with student" maxLength={120} />
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--cal-text)" }}>Notes <span style={{ color: "var(--cal-muted)" }}>(optional)</span></label>
            <textarea style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--cal-border)", fontSize: 13, height: 80, marginBottom: 12, background: "var(--cal-white)", color: "var(--cal-text)" }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, marginBottom: 12, cursor: "pointer", color: "var(--cal-text)" }}>
              <input type="checkbox" checked={form.allDay} onChange={e => setForm(f => ({ ...f, allDay: e.target.checked }))} style={{ width: 18, height: 18 }} /> All day
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--cal-text)" }}>Starts</label>
                <input type={form.allDay ? "date" : "datetime-local"} value={form.startsAt} onChange={e => setForm(f => ({ ...f, startsAt: e.target.value }))} style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid var(--cal-border)", background: "var(--cal-white)", color: "var(--cal-text)" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--cal-text)" }}>Ends <span style={{ color: "var(--cal-muted)" }}>(optional)</span></label>
                <input type={form.allDay ? "date" : "datetime-local"} value={form.endsAt} onChange={e => setForm(f => ({ ...f, endsAt: e.target.value }))} style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid var(--cal-border)", background: "var(--cal-white)", color: "var(--cal-text)" }} />
              </div>
            </div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--cal-text)" }}>Where <span style={{ color: "var(--cal-muted)" }}>(optional)</span></label>
            <input style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid var(--cal-border)", fontSize: 13, marginBottom: 12, background: "var(--cal-white)", color: "var(--cal-text)" }} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Location" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--cal-text)" }}>For</label>
                <select style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid var(--cal-border)", fontSize: 13, background: "var(--cal-white)", color: "var(--cal-text)" }} value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}>
                  <option value="">No student</option>
                  {users.map(u => <option key={u.id} value={u.id}>{fullName(u)}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--cal-text)" }}>Remind</label>
                <select style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid var(--cal-border)", fontSize: 13, background: "var(--cal-white)", color: "var(--cal-text)" }} value={form.remindMinutes} onChange={e => setForm(f => ({ ...f, remindMinutes: e.target.value }))}>
                  <option value="">None</option>
                  <option value="0">At time</option>
                  <option value="15">15 min before</option>
                  <option value="60">1 hour before</option>
                  <option value="1440">1 day before</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--cal-text)" }}>Repeats</label>
                <select style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid var(--cal-border)", fontSize: 13, background: "var(--cal-white)", color: "var(--cal-text)" }} value={form.repeatRule} onChange={e => setForm(f => ({ ...f, repeatRule: e.target.value }))}>
                  <option value="">Does not repeat</option>
                  <option value="DAILY">Every day</option>
                  <option value="WEEKLY">Every week</option>
                  <option value="MONTHLY">Every month</option>
                </select>
              </div>
            </div>
            {formError && <div style={{ color: "var(--cal-red)", fontSize: 12, marginBottom: 10 }}>{formError}</div>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
              <button onClick={() => setShowModal(false)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--cal-border)", background: "var(--cal-white)", color: "var(--cal-text)", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <AddBtn onClick={handleCreate} disabled={saving}>{saving ? "Saving..." : "Create"}</AddBtn>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(6,19,33,.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60 }} onClick={() => setConfirmDelete(null)}>
          <div style={{ background: "var(--cal-card)", border: "1px solid var(--cal-border)", borderRadius: 14, padding: 22, width: 360, maxWidth: "94vw" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 800, color: "var(--cal-text)" }}>
              Delete this {confirmDelete.kind === "DEADLINE" ? "deadline" : "event"}?
            </h3>
            <p style={{ fontSize: 13, color: "var(--cal-text)", fontWeight: 600, margin: "4px 0 4px" }}>{confirmDelete.title}</p>
            <p style={{ fontSize: 13, color: "var(--cal-muted)", margin: "0 0 16px" }}>
              {confirmDelete.recurring ? "This removes the whole series." : "This cannot be undone."}
            </p>
            {deleteError && <p style={{ fontSize: 12, color: "var(--cal-red)", margin: "0 0 10px" }}>{deleteError}</p>}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => { setConfirmDelete(null); setDeleteError(""); }} style={{ background: "var(--cal-white)", border: "1px solid var(--cal-border)", borderRadius: 8, padding: "8px 14px", color: "var(--cal-text)", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => {
                setDeleteBusy(true); setDeleteError("");
                deleteEvent(confirmDelete.id)
                  .then(() => { setConfirmDelete(null); setDeleteBusy(false); load(); })
                  .catch(err => { setDeleteError(err?.response?.data?.message || err?.message || "Failed to delete"); setDeleteBusy(false); });
              }} disabled={deleteBusy} style={{ background: "#C62828", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontWeight: 700, cursor: deleteBusy ? "not-allowed" : "pointer", opacity: deleteBusy ? 0.6 : 1 }}>
                {deleteBusy ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
