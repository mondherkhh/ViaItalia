import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import {
  FiSearch,
  FiSend,
  FiMail,
  FiInfo,
  FiFolder,
  FiExternalLink,
  FiCreditCard,
} from "react-icons/fi";
import messageService from "../../api/messageService";
import { format } from "date-fns";

const C = {
  bg: "var(--adm-bg)",
  card: "var(--adm-panel)",
  border: "var(--adm-border)",
  text: "var(--adm-text)",
  muted: "var(--adm-muted)",
  green: "var(--adm-accent)",
  greenSoft: "var(--adm-accent-soft)",
  darkText: "var(--adm-text)",
  lightBubble: "var(--adm-bg)",
};

const Wrap = styled.div`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  font-family: system-ui, Segoe UI, sans-serif;
  background: ${C.bg};
  min-height: 100vh;
  padding: 0.75rem;

  @media (max-width: 640px) {
    padding: 0.5rem;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 28% minmax(0, 1fr) 24%;
  gap: 16px;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  min-height: min(76vh, 700px);

  @media (max-width: 1100px) {
    grid-template-columns: 30% minmax(0, 1fr);
  }

  @media (max-width: 800px) {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: auto;
  }
`;

const Card = styled.div`
  min-width: 0;
  background: ${C.card};
  border: 1px solid ${C.border};
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 14px rgba(18, 35, 27, 0.06);
  display: flex;
  flex-direction: column;

  @media (max-width: 800px) {
    width: 100%;
    min-height: auto;
  }
`;

const ConversationList = styled.div`
  overflow-y: auto;
  flex: 1;
  min-height: 0;

  @media (max-width: 800px) {
    max-height: 280px;
  }
`;

const ConversationButton = styled.button`
  width: 100%;
  min-width: 0;
  text-align: left;
  padding: 12px 14px;
  border: none;
  background: ${(p) => (p.selected ? C.greenSoft : "transparent")};
  border-bottom: 1px solid ${C.border};
  cursor: pointer;

  &:hover {
    background: ${C.greenSoft};
  }
`;

const ChatCard = styled(Card)`
  min-height: min(76vh, 700px);

  @media (max-width: 800px) {
    min-height: 520px;
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 18px;
  background: var(--adm-bg);

  @media (max-width: 640px) {
    padding: 12px 10px;
  }
`;

const MessageBubbleRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-end;
  margin-bottom: 10px;
  flex-direction: ${(p) => (p.admin ? "row-reverse" : "row")};
`;

const MessageBubble = styled.div`
  max-width: 70%;
  min-width: 0;
  overflow-wrap: anywhere;
  padding: 10px 14px;
  border-radius: 14px;
  background: ${(p) => (p.admin ? C.green : C.lightBubble)};
  border: ${(p) => (p.admin ? "none" : `1px solid ${C.border}`)};
  color: ${(p) => (p.admin ? "#fff" : C.darkText)};

  @media (max-width: 640px) {
    max-width: 86%;
    padding: 9px 11px;
  }
`;

const Composer = styled.div`
  padding: 14px;
  border-top: 1px solid ${C.border};
  display: flex;
  gap: 10px;
  align-items: center;

  @media (max-width: 640px) {
    padding: 10px;
    gap: 8px;
  }
`;

const MessageInput = styled.input`
  flex: 1;
  min-width: 0;
  height: 44px;
  border-radius: 22px;
  border: 1.5px solid ${(p) => (p.active ? C.green : C.border)};
  padding: 0 18px;
  font-size: 0.85rem;
  outline: none;
  background: var(--adm-panel);
  color: var(--adm-text);

  @media (max-width: 640px) {
    height: 40px;
    padding: 0 13px;
    font-size: 0.8rem;
  }
`;

const SendButton = styled.button`
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  border-radius: 50%;
  border: none;
  background: ${(p) =>
    p.disabled ? "var(--adm-accent-soft)" : C.green};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${(p) => (p.disabled ? "not-allowed" : "pointer")};

  @media (max-width: 640px) {
    width: 40px;
    height: 40px;
    flex-basis: 40px;
  }
`;

const StudentActions = styled.div`
  padding: 14px;
  display: flex;
  gap: 10px;

  @media (max-width: 640px) {
    flex-direction: column;
    padding: 12px;
  }
`;

const StudentAction = styled.a`
  flex: 1;
  min-width: 0;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid ${C.border};
  background: ${C.card};
  text-decoration: none;
  color: ${C.text};
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-wrap: anywhere;

  @media (max-width: 640px) {
    flex: none;
    width: 100%;
  }
`;

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

  const selectedConv = useMemo(
    () =>
      conversations.find((c) => c.userId === selectedId) || null,
    [conversations, selectedId]
  );

  const studentName = selectedConv
    ? `${selectedConv.firstName || ""} ${
        selectedConv.lastName || ""
      }`.trim() ||
      selectedConv.email ||
      "Student"
    : "";

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

    messageService
      .getConversations()
      .then((res) => {
        const arr = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
            ? res.data
            : [];

        setConversations(arr);
      })
      .catch(() => setConversations([]))
      .finally(() => setLoadingConv(false));
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    setLoadingMsg(true);

    messageService
      .getConversation(selectedId)
      .then((res) => {
        if (cancelled) return;

        const data = res?.data?.data || res?.data || res || {};
        const msgs = Array.isArray(data.messages)
          ? data.messages
          : [];

        setMessages(msgs);
      })
      .catch(() => setMessages([]))
      .finally(() => {
        if (!cancelled) setLoadingMsg(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const send = async () => {
    if (!newMsg.trim() || !selectedId || sending) return;

    setSending(true);

    try {
      const res = await messageService.sendMessage(
        selectedId,
        newMsg.trim()
      );

      const msg = res?.data?.data || res?.data || {};

      setMessages((prev) => [...prev, msg]);
      setNewMsg("");
    } catch (e) {
      console.error("send error:", {
        status: e.response?.status,
        message: e.response?.data?.message,
        detail: e.message,
      });

      alert(
        `Erreur ${e.response?.status || "réseau"}: ${
          e.response?.data?.message ||
          e.message ||
          "inconnue"
        }`
      );
    } finally {
      setSending(false);
    }
  };

  const initials = studentName
    ? studentName
        .split(" ")
        .map((s) => s[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "ST";

  const filteredConversations = conversations.filter((c) => {
    const q = search.toLowerCase();

    return (
      !q ||
      (c.firstName || "").toLowerCase().includes(q) ||
      (c.lastName || "").toLowerCase().includes(q)
    );
  });

  return (
    <Wrap>
      <Grid>
        {/* Conversations */}
        <Card>
          <div style={{ padding: 14 }}>
            <div style={{ position: "relative" }}>
              <FiSearch
                size={14}
                style={{
                  position: "absolute",
                  left: ".7rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: C.muted,
                }}
              />

              <input
                style={{
                  width: "100%",
                  height: 40,
                  padding: "0 .9rem 0 2.2rem",
                  boxSizing: "border-box",
                  borderRadius: 12,
                  border: "1px solid var(--adm-input-bg)",
                  background: "var(--adm-input-bg)",
                  fontSize: ".85rem",
                  outline: "none",
                }}
                placeholder="Search discussions…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div
            style={{
              padding: "0 14px 10px",
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              gap: 18,
            }}
          >
            <button
              style={{
                background: "none",
                border: "none",
                fontWeight: tab === "All" ? 700 : 600,
                color: tab === "All" ? C.green : C.muted,
                cursor: "pointer",
                fontSize: "12.5px",
              }}
              onClick={() => setTab("All")}
            >
              All
            </button>

            <button
              style={{
                background: "none",
                border: "none",
                fontWeight: tab === "Unread" ? 700 : 600,
                color: tab === "Unread" ? C.green : C.muted,
                cursor: "pointer",
                fontSize: "12.5px",
              }}
              onClick={() => setTab("Unread")}
            >
              Unread
            </button>
          </div>

          <ConversationList>
            {!loadingConv &&
              filteredConversations.map((c) => (
                <ConversationButton
                  key={c.userId}
                  selected={selectedId === c.userId}
                  onClick={() => setSelectedId(c.userId)}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "var(--adm-surface-2)",
                        color: "var(--adm-muted)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "13px",
                        fontWeight: 900,
                        flexShrink: 0,
                      }}
                    >
                      {(c.firstName || "").slice(0, 1) +
                        (c.lastName || "").slice(0, 1) || "ST"}
                    </div>

                    <div
                      style={{
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          fontSize: "13.5px",
                          fontWeight: 700,
                          color: C.text,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {c.firstName || "—"} {c.lastName || ""}
                      </div>

                      <div
                        style={{
                          fontSize: "12px",
                          color: C.muted,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {c.lastMessage
                          ? (c.lastMessage.sender === "ADMIN"
                              ? "You: "
                              : "") +
                            (c.lastMessage.content
                              ? c.lastMessage.content.slice(0, 50)
                              : "No messages")
                          : "No messages yet"}
                      </div>

                      <div
                        style={{
                          fontSize: "10.5px",
                          color: "var(--adm-subtle)",
                          marginTop: 2,
                        }}
                      >
                        {caseRefStr(c)}
                      </div>
                    </div>
                  </div>
                </ConversationButton>
              ))}
          </ConversationList>

          <div
            style={{
              padding: 14,
              fontSize: ".75rem",
              color: C.muted,
              borderTop: `1px solid ${C.border}`,
            }}
          >
            Conversations with your students
          </div>
        </Card>

        {/* Conversation */}
        <ChatCard>
          {!selectedId ? (
            <div
              style={{
                flex: 1,
                minHeight: 300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: C.muted,
                flexDirection: "column",
                gap: 8,
                padding: 20,
                textAlign: "center",
              }}
            >
              <div style={{ fontWeight: 700, color: C.text }}>
                Select a conversation
              </div>

              <div>No messages yet. Say hello.</div>
            </div>
          ) : (
            <>
              <div
                style={{
                  padding: "14px 18px",
                  borderBottom: `1px solid ${C.border}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "var(--adm-surface-2)",
                    color: "var(--adm-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    fontWeight: 900,
                    flexShrink: 0,
                  }}
                >
                  {initials}
                </div>

                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "13.5px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {studentName || "—"}
                  </div>

                  <div
                    style={{
                      fontSize: "10.5px",
                      color: "var(--adm-subtle)",
                    }}
                  >
                    {caseRefStr(selectedConv)}
                  </div>
                </div>

                <button
                  aria-label="Info"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 6,
                    color: C.muted,
                  }}
                >
                  <FiInfo size={16} />
                </button>
              </div>

              <ChatMessages>
                {loadingMsg && (
                  <div
                    style={{
                      color: C.muted,
                      textAlign: "center",
                      padding: 20,
                    }}
                  >
                    Loading messages...
                  </div>
                )}

                {!loadingMsg && messages.length === 0 && (
                  <div
                    style={{
                      color: C.muted,
                      textAlign: "center",
                      padding: 20,
                    }}
                  >
                    No messages yet. Say hello.
                  </div>
                )}

                {(() => {
                  const list = (messages || [])
                    .filter(
                      (m) =>
                        m &&
                        typeof m === "object" &&
                        m.id != null
                    )
                    .sort(
                      (a, b) =>
                        new Date(a.createdAt || 0) -
                        new Date(b.createdAt || 0)
                    );

                  return list.map((m, i) => {
                    const isAdmin = m.sender === "ADMIN";
                    const dateStr = m.createdAt
                      ? new Date(m.createdAt)
                      : new Date();

                    const prevMsg = list[i - 1];

                    const showDay =
                      i === 0 ||
                      !prevMsg ||
                      new Date(
                        prevMsg.createdAt || 0
                      ).toDateString() !== dateStr.toDateString();

                    return (
                      <div key={m.id || i}>
                        {showDay && (
                          <div
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              color: C.muted,
                              letterSpacing: ".02em",
                              margin: "10px 0",
                              textTransform: "uppercase",
                            }}
                          >
                            {format(
                              dateStr,
                              "EEEE, MMMM do"
                            ).toUpperCase()}
                          </div>
                        )}

                        <MessageBubbleRow admin={isAdmin}>
                          {!isAdmin && (
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                background: "var(--adm-surface-2)",
                                color: "var(--adm-muted)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "11px",
                                fontWeight: 900,
                                flexShrink: 0,
                              }}
                            >
                              {initials}
                            </div>
                          )}

                          <MessageBubble admin={isAdmin}>
                            {!isAdmin && (
                              <div
                                style={{
                                  fontWeight: 700,
                                  fontSize: "11px",
                                  marginBottom: 2,
                                }}
                              >
                                {studentName || "Student"}
                              </div>
                            )}

                            <div
                              style={{
                                fontSize: ".85rem",
                                lineHeight: 1.4,
                              }}
                            >
                              {m.content}
                            </div>

                            <div
                              style={{
                                fontSize: "11px",
                                color: isAdmin
                                  ? "rgba(255,255,255,.7)"
                                  : C.muted,
                                marginTop: 4,
                              }}
                            >
                              {m.createdAt
                                ? format(
                                    new Date(m.createdAt),
                                    "h:mm a"
                                  )
                                : ""}
                            </div>
                          </MessageBubble>
                        </MessageBubbleRow>
                      </div>
                    );
                  });
                })()}
              </ChatMessages>

              <Composer>
                <MessageInput
                  active={!!newMsg.trim()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") send();
                  }}
                  placeholder="Type a message…"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                />

                <SendButton
                  onClick={send}
                  disabled={!newMsg.trim() || sending}
                  aria-label="Send message"
                >
                  <FiSend size={16} />
                </SendButton>
              </Composer>
            </>
          )}
        </ChatCard>

        {/* Student details */}
        <Card>
          <div
            style={{
              padding: "14px 18px",
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontWeight: 700,
            }}
          >
            Student

            <button
              aria-label="Info"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 6,
                color: C.muted,
              }}
            >
              <FiInfo size={16} />
            </button>
          </div>

          {!selectedId ? (
            <div
              style={{
                padding: 18,
                textAlign: "center",
                color: C.muted,
              }}
            >
              Select a conversation to see the student
            </div>
          ) : (
            <>
              <div
                style={{
                  padding: 18,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: "var(--adm-surface-2)",
                    color: "var(--adm-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.3rem",
                    fontWeight: 900,
                    margin: "0 auto .6rem",
                  }}
                >
                  {initials}
                </div>

                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "14px",
                  }}
                >
                  {studentName || "—"}
                </div>

                <div
                  style={{
                    fontSize: "10.5px",
                    color: "var(--adm-subtle)",
                    marginTop: 2,
                  }}
                >
                  {caseRefStr(selectedConv)}
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    color: C.green,
                    fontWeight: 700,
                    marginTop: 4,
                  }}
                >
                  {stageFromConv(selectedConv, null)}
                </div>
              </div>

              <div
                style={{
                  padding: "0 18px 12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <FiMail size={14} color={C.muted} />
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: ".82rem",
                    }}
                  >
                    Email
                  </span>
                </div>

                <div style={{ fontSize: ".82rem" }}>—</div>
              </div>

              <div
                style={{
                  height: 1,
                  background: C.border,
                  margin: "0 18px",
                }}
              />

              <div
                style={{
                  padding: "12px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    fontSize: ".82rem",
                    color: C.muted,
                  }}
                >
                  Field
                </span>

                <span
                  style={{
                    fontSize: ".82rem",
                    fontWeight: 700,
                  }}
                >
                  —
                </span>
              </div>

              <div
                style={{
                  padding: "0 18px 12px",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    fontSize: ".82rem",
                    color: C.muted,
                  }}
                >
                  Intake
                </span>

                <span
                  style={{
                    fontSize: ".82rem",
                    fontWeight: 700,
                  }}
                >
                  —
                </span>
              </div>

              <div
                style={{
                  height: 1,
                  background: C.border,
                  margin: "0 18px",
                }}
              />

              <StudentActions>
                <StudentAction
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    openDossier &&
                      openDossier(
                        selectedConv?.userId || selectedId,
                        "profile"
                      );
                  }}
                >
                  <FiExternalLink size={14} />
                  Open the case file
                </StudentAction>

                <StudentAction
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    openDossier &&
                      openDossier(
                        selectedConv?.userId || selectedId,
                        "documents"
                      );
                  }}
                >
                  <FiFolder size={14} />
                  Open documents
                </StudentAction>
              </StudentActions>

              <div
                style={{
                  padding: "0 14px 14px",
                }}
              >
                <StudentAction
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    openPayments && openPayments();
                  }}
                >
                  <FiCreditCard size={14} />
                  Open payments
                </StudentAction>
              </div>
            </>
          )}
        </Card>
      </Grid>
    </Wrap>
  );
}
