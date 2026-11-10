import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import {
  FiPlus,
  FiCreditCard,
  FiClock,
  FiFileText,
  FiMinusCircle,
  FiDollarSign,
} from "react-icons/fi";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import {
  getSummary,
  getPayments,
  createPayment,
  deletePayment,
} from "../../api/paymentAdminService";
import { getFinanceSummary, formatMoney } from "../../services/financeService";
import axiosInstance from "../../api/axiosInstance";
import { fetchAllUsers } from "../../api/userService";

const C = {
  bg: "var(--adm-bg)",
  card: "var(--adm-panel)",
  border: "var(--adm-border)",
  text: "var(--adm-text)",
  muted: "var(--adm-muted)",
  green: "var(--adm-accent)",
  red: "#C62828",
  darkText: "var(--adm-text)",
};

const Container = styled.div`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 24px;

  @media (max-width: 640px) {
    padding: 12px;
  }
`;

const IntroRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    align-items: stretch;
    gap: 12px;
  }
`;

const IntroText = styled.p`
  font-size: 13px;
  color: ${C.muted};
  margin: 0;

  @media (max-width: 640px) {
    line-height: 1.5;
  }
`;

const AddBtn = styled.button`
  height: 36px;
  border-radius: 10px;
  background: var(--adm-accent);
  color: #fff;
  font-weight: 700;
  font-size: 12.5px;
  border: none;
  padding: 0 18px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;

  @media (max-width: 640px) {
    width: 100%;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-top: 16px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const StatCard = styled.div`
  min-width: 0;
  border-radius: 14px;
  border: 1px solid var(--adm-border);
  background: var(--adm-panel);
  padding: 14px 16px;

  @media (max-width: 640px) {
    &:nth-child(1) { order: 2; }
    &:nth-child(2) { order: 3; }
    &:nth-child(3) { order: 1; }
    &:nth-child(4), &:nth-child(5) { display: none; }
  }
`;

const StatIconRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatLabel = styled.div`
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
  color: var(--adm-subtle);
  text-transform: uppercase;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 800;
  color: ${(p) => p.color || C.darkText};
  margin-top: 4px;
  overflow-wrap: anywhere;
`;

const StatCaption = styled.div`
  font-size: 11.5px;
  color: var(--adm-muted);
  margin-top: 4px;
`;

const TableCard = styled.div`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  border-radius: 14px;
  border: 1px solid var(--adm-border);
  background: var(--adm-panel);
  margin-top: 16px;
  padding: 16px 20px;

  @media (max-width: 640px) {
    padding: 12px;
    overflow: hidden;
  }
`;

const TableHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
`;

const TableTitle = styled.h3`
  font-size: 14px;
  font-weight: 700;
  margin: 0;
`;

const TableMeta = styled.div`
  font-size: 12px;
  color: var(--adm-subtle);
`;

const TableScroll = styled.div`
  width: 100%;
  overflow-x: auto;
  overflow-y: visible;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
`;

const TableRow = styled.table`
  width: 100%;
  min-width: 850px;
  border-collapse: collapse;
`;

const DesktopOnly = styled.div`
  display: block;
  @media (max-width: 640px) { display: none; }
`;

const MobileOnly = styled.div`
  display: none;
  @media (max-width: 640px) { display: block; }
`;

const MobilePageHeader = styled.div`
  display: none;
  @media (max-width: 640px) {
    display: block;
    margin: -4px 0 12px;
    padding: 14px 4px 2px;
  }
`;

const MobilePageTitle = styled.h1`
  margin: 0;
  color: var(--adm-text);
  font-size: 22px;
  line-height: 1.15;
  font-weight: 800;
`;

const MobilePageSubtitle = styled.p`
  margin: 5px 0 0;
  color: var(--adm-muted);
  font-size: 12px;
  line-height: 1.4;
`;

const MobileHistory = styled.div`
  border: 1px solid var(--adm-border);
  border-radius: 16px;
  background: var(--adm-panel);
  overflow: hidden;
`;

const MobileHistoryHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid var(--adm-border);
`;

const MobileHistoryTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 800;
  color: var(--adm-text);
`;

const MobileHistorySubtitle = styled.div`
  margin-top: 5px;
  font-size: 11.5px;
  line-height: 1.45;
  color: var(--adm-muted);
`;

const MobilePaymentItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--adm-border);
  &:last-child { border-bottom: none; }
`;

const MobilePaymentIcon = styled.div`
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: var(--adm-accent);
  background: var(--adm-accent-soft);
`;

const MobilePaymentBody = styled.div`
  min-width: 0;
  flex: 1;
`;

const MobilePaymentName = styled.div`
  font-size: 13px;
  line-height: 1.35;
  font-weight: 800;
  color: var(--adm-text);
  overflow-wrap: anywhere;
`;

const MobilePaymentMeta = styled.div`
  margin-top: 4px;
  font-size: 11px;
  line-height: 1.35;
  color: var(--adm-muted);
`;

const MobilePaymentAmount = styled.div`
  flex: 0 0 auto;
  padding-left: 6px;
  font-size: 13px;
  font-weight: 800;
  color: var(--adm-text);
  white-space: nowrap;
`;

const Th = styled.th`
  text-align: left;
  font-size: 10.5px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--adm-subtle);
  padding: 8px 6px;
  border-bottom: 1px solid var(--adm-border);
  font-weight: 700;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 10px 6px;
  border-bottom: 1px solid var(--adm-border);
  font-size: 13px;
  color: var(--adm-text);
  white-space: nowrap;
`;

const KebabWrap = styled.div`
  position: relative;
`;

const KebabBtn = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--adm-muted);
  font-size: 16px;
  padding: 2px;
`;

const KebabMenu = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  background: var(--adm-surface-solid);
  border: 1px solid var(--adm-border);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  padding: 6px;
  min-width: 140px;
  z-index: 20;
`;

const KebabItem = styled.button`
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  border: none;
  background: none;
  color: ${(p) => (p.danger ? "#C62828" : "var(--adm-text)")};
  font-size: 13px;
  cursor: pointer;
  border-radius: 6px;
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  justify-content: flex-end;

  @media (max-width: 640px) {
    justify-content: center;
  }
`;

const PageBtn = styled.button`
  padding: 6px 10px;
  border: 1px solid var(--adm-border);
  background: var(--adm-surface-solid);
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  font-weight: 600;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  padding: 12px;
  background: rgba(6, 19, 33, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  overflow-y: auto;
`;

const ModalCard = styled.div`
  background: var(--adm-panel);
  border: 1px solid var(--adm-border);
  border-radius: 14px;
  padding: 22px 24px;
  width: 380px;
  max-width: calc(100vw - 24px);
  box-sizing: border-box;

  @media (max-width: 640px) {
    width: 100%;
    padding: 18px 14px;
  }
`;

const ModalTitle = styled.h3`
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 800;
`;

const FieldRow = styled.div`
  margin-bottom: 12px;
`;

const Label = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--adm-text);
`;

const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px;
  border: 1px solid var(--adm-border);
  border-radius: 8px;
  font-size: 13px;
  background: var(--adm-surface-solid);
  color: var(--adm-text);
`;

const Select = styled.select`
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px;
  border: 1px solid var(--adm-border);
  border-radius: 8px;
  font-size: 13px;
  background: var(--adm-surface-solid);
  color: var(--adm-text);
`;

const ModalBtnRow = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 16px;

  @media (max-width: 640px) {
    justify-content: stretch;

    button {
      flex: 1;
      min-width: 110px;
    }
  }
`;

const ConfirmOverlay = styled.div`
  position: fixed;
  inset: 0;
  padding: 12px;
  background: rgba(6, 19, 33, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 60;
`;

const ConfirmCard = styled.div`
  background: var(--adm-panel);
  border: 1px solid var(--adm-border);
  border-radius: 14px;
  padding: 22px 24px;
  width: 360px;
  max-width: calc(100vw - 24px);
  box-sizing: border-box;
`;

export default function PaymentsPage() {
  const [summary, setSummary] = useState({
    collected: 0,
    outstanding: 0,
    agreedFees: 0,
    expenses: 0,
    totalIncome: 0,
  });

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    userId: "",
    amount: "",
    method: "Cash",
    date: format(new Date(), "yyyy-MM-dd"),
  });

  const [formError, setFormError] = useState("");
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [savingStatusId, setSavingStatusId] = useState(null);
  const [statusError, setStatusError] = useState({});

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const s = await getSummary();
      setSummary(s.data || s);

      const res = await getPayments({ page, q });
      const body = res?.data ?? res;

      const list =
        body?.items ??
        body?.payments ??
        body?.data?.items ??
        body?.data ??
        (Array.isArray(body) ? body : []);

      const totalCount =
        body?.total ??
        body?.pagination?.total ??
        body?.count ??
        list.length;

      setItems(Array.isArray(list) ? list : []);
      setTotal(Number(totalCount) || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, q]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    (async () => {
      setUserLoading(true);
      setUserError("");

      try {
        const arr = await fetchAllUsers();

        const normalized = Array.isArray(arr)
          ? arr
          : arr?.data
            ? arr.data
            : arr?.users
              ? arr.users
              : [];

        const students = normalized
          .filter((u) => u && u.role === "USER")
          .sort((a, b) => {
            const nameA = `${a.firstName || ""} ${a.lastName || ""}`
              .trim()
              .toLowerCase();

            const nameB = `${b.firstName || ""} ${b.lastName || ""}`
              .trim()
              .toLowerCase();

            return nameA.localeCompare(nameB);
          });

        setUsers(students);
      } catch (e) {
        setUserError("Failed to load students");
        setUsers([]);
      } finally {
        setUserLoading(false);
      }
    })();
  }, []);

  const changeStatus = async (id, newStatus) => {
    setSavingStatusId(id);
    setStatusError((prev) => ({ ...prev, [id]: null }));

    try {
      await axiosInstance.patch(`/payments/${id}/status`, {
        status: newStatus,
      });

      await load();
    } catch (e) {
      const msg = e?.response?.data?.message || "Erreur";

      setStatusError((prev) => ({
        ...prev,
        [id]: msg,
      }));
    } finally {
      setSavingStatusId(null);
    }
  };

  const handleCreate = async () => {
    setFormError("");

    if (!form.userId || parseFloat(form.amount) <= 0) {
      setFormError("Select student and enter amount");
      return;
    }

    setSaving(true);

    try {
      await createPayment({
        userId: parseInt(form.userId),
        amount: parseFloat(form.amount),
        method: form.method,
        date: form.date || undefined,
      });

      setShowModal(false);

      setForm({
        userId: "",
        amount: "",
        method: "Cash",
        date: format(new Date(), "yyyy-MM-dd"),
      });

      setFormError("");
      load();
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed";
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;

    try {
      await deletePayment(confirmDelete);
      setConfirmDelete(null);
      load();
    } catch (e) {
      alert("Failed");
    }
  };

  const stats = [
    {
      label: "COLLECTED",
      value: `${(summary?.collected ?? 0).toLocaleString("en-US", {
        minimumFractionDigits: 0,
      })} TND`,
      color: C.green,
      caption: "received across all students",
      icon: FiCreditCard,
    },
    {
      label: "OUTSTANDING",
      value: `${(summary?.outstanding ?? 0).toLocaleString("en-US", {
        minimumFractionDigits: 0,
      })} TND`,
      color: C.darkText,
      caption: "still to be received",
      icon: FiClock,
    },
    {
      label: "AGREED FEES",
      value: `${(summary?.agreedFees ?? 0).toLocaleString("en-US", {
        minimumFractionDigits: 0,
      })} TND`,
      color: C.darkText,
      caption: "total across all active cases",
      icon: FiFileText,
    },
    {
      label: "AGENCY EXPENSES",
      value: "0 TND",
      color: C.red,
      caption: "recorded in the expense ledger",
      icon: FiMinusCircle,
    },
    {
      label: "TOTAL INCOME",
      value: `${(summary?.totalIncome ?? 0).toLocaleString("en-US", {
        minimumFractionDigits: 0,
      })} TND`,
      color: C.green,
      caption: "expense deduction is disabled",
      icon: FiDollarSign,
    },
  ];

  return (
    <Container>
      <MobilePageHeader>
        <MobilePageTitle>Payments</MobilePageTitle>
        <MobilePageSubtitle>Your payment schedule, balances and full history</MobilePageSubtitle>
      </MobilePageHeader>
      <IntroRow>
        <IntroText>
          Log every payment you receive — cash in the office or a bank transfer
          with its receipt.
        </IntroText>

        <AddBtn onClick={() => setShowModal(true)}>
          <FiPlus size={16} />
          Add payment
        </AddBtn>
      </IntroRow>

      <StatsGrid>
        {stats.map((s) => (
          <StatCard key={s.label}>
            <StatIconRow>
              <s.icon size={16} color={s.color} />
              <StatLabel>{s.label}</StatLabel>
            </StatIconRow>

            <StatValue color={s.color}>{s.value}</StatValue>
            <StatCaption>{s.caption}</StatCaption>
          </StatCard>
        ))}
      </StatsGrid>

      <DesktopOnly>
        <TableCard>
        <TableHeaderRow>
          <TableTitle>Latest payments</TableTitle>
          <TableMeta>
            1–{items.length} of {total}
          </TableMeta>
        </TableHeaderRow>

        <TableScroll>
          <TableRow>
            <thead>
              <tr>
                <Th>STUDENT</Th>
                <Th>BADGE</Th>
                <Th>AMOUNT</Th>
                <Th>METHOD</Th>
                <Th>DATE</Th>
                <Th>LOGGED BY</Th>
                <Th>RECEIPT</Th>
                <Th></Th>
              </tr>
            </thead>

            <tbody>
              {items.length === 0 && !loading ? (
                <tr>
                  <Td
                    colSpan={8}
                    style={{ textAlign: "center", padding: 32 }}
                  >
                    No payments yet
                  </Td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <Td style={{ fontWeight: 700 }}>
                      {item.studentName || "—"}
                    </Td>

                    <Td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <select
                          disabled={savingStatusId === item.id}
                          value={item.status}
                          onChange={(e) => {
                            const s = e.target.value;
                            changeStatus(item.id, s);
                          }}
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: 6,
                            border: "1px solid var(--adm-border)",
                            background:
                              item.status === "PAID"
                                ? "rgba(16,185,129,0.1)"
                                : "rgba(245,158,11,0.1)",
                            color:
                              item.status === "PAID"
                                ? "#10b981"
                                : "#f59e0b",
                            cursor: "pointer",
                          }}
                        >
                          <option value="PENDING">En attente</option>
                          <option value="PAID">Payé</option>
                        </select>

                        {statusError[item.id] && (
                          <span
                            style={{
                              fontSize: 10,
                              color: "#C62828",
                            }}
                          >
                            {statusError[item.id]}
                          </span>
                        )}
                      </div>
                    </Td>

                    <Td
                      style={{
                        fontWeight: 700,
                        color:
                          item.status === "PAID" ? C.green : C.muted,
                      }}
                    >
                      {item.status === "PAID" ? "+" : ""}
                      {item.amount
                        ? item.amount.toLocaleString("en-US")
                        : "0"}{" "}
                      TND
                    </Td>

                    <Td>{item.method || "—"}</Td>

                    <Td>
                      {item.date
                        ? format(new Date(item.date), "d MMM yyyy", {
                            locale: enUS,
                          })
                        : "—"}
                    </Td>

                    <Td>{item.loggedBy || "—"}</Td>

                    <Td style={{ color: "var(--adm-muted)" }}>
                      {item.hasReceipt ? "Yes" : "—"}
                    </Td>

                    <Td>
                      <KebabWrap>
                        <KebabBtn
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === item.id ? null : item.id
                            )
                          }
                          aria-label="Menu"
                        >
                          ⋯
                        </KebabBtn>

                        {openMenuId === item.id && (
                          <KebabMenu>
                            <KebabItem
                              danger
                              onClick={() => {
                                setConfirmDelete(item.id);
                                setOpenMenuId(null);
                              }}
                            >
                              Delete
                            </KebabItem>
                          </KebabMenu>
                        )}
                      </KebabWrap>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </TableRow>
        </TableScroll>

        <Pagination>
          <PageBtn
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </PageBtn>

          <span style={{ fontSize: 12 }}>{page}</span>

          <PageBtn onClick={() => setPage((p) => p + 1)}>
            Next
          </PageBtn>
        </Pagination>
        </TableCard>
      </DesktopOnly>

      <MobileOnly>
        <MobileHistory>
          <MobileHistoryHeader>
            <MobileHistoryTitle><FiCreditCard size={16} color={C.green} /> Payment history</MobileHistoryTitle>
            <MobileHistorySubtitle>Every payment, refund, and adjustment recorded by your agency</MobileHistorySubtitle>
          </MobileHistoryHeader>
          {items.length === 0 && !loading ? (
            <div style={{ padding: 24, textAlign: "center", color: C.muted, fontSize: 13 }}>No payments yet</div>
          ) : items.map((item) => {
            const date = item.date ? format(new Date(item.date), "d MMM yyyy", { locale: enUS }) : "Date unavailable";
            const method = item.method || "Payment";
            const name = item.title || item.description || item.paymentName || item.label || (item.method ? `${item.method} payment` : "Payment");
            return (
              <MobilePaymentItem key={`mobile-${item.id}`}>
                <MobilePaymentIcon><FiCreditCard size={15} /></MobilePaymentIcon>
                <MobilePaymentBody>
                  <MobilePaymentName>{name}</MobilePaymentName>
                  <MobilePaymentMeta>{date} · {method}{item.status ? ` · ${item.status === "PAID" ? "Paid" : "Pending"}` : ""}</MobilePaymentMeta>
                </MobilePaymentBody>
                <MobilePaymentAmount>{item.amount ? Number(item.amount).toLocaleString("en-US") : "0"} TND</MobilePaymentAmount>
              </MobilePaymentItem>
            );
          })}
        </MobileHistory>
      </MobileOnly>

      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Add payment</ModalTitle>

            <FieldRow>
              <Label>Student</Label>

              <Select
                value={form.userId}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    userId: e.target.value,
                  }))
                }
                disabled={userLoading || !!userError}
              >
                <option value="">
                  {userLoading
                    ? "Loading students..."
                    : userError
                      ? "Failed to load"
                      : "Select student"}
                </option>

                {userError && (
                  <option disabled>Failed to load students</option>
                )}

                {!userLoading &&
                  users.length === 0 &&
                  !userError && (
                    <option disabled>No students found</option>
                  )}

                {!userLoading &&
                  users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {(u.firstName || "") + " " + (u.lastName || "")}
                    </option>
                  ))}
              </Select>
            </FieldRow>

            <FieldRow>
              <Label>Amount (TND)</Label>

              <Input
                type="number"
                min={1}
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    amount: e.target.value,
                  }))
                }
                placeholder="1500"
              />
            </FieldRow>

            <FieldRow>
              <Label>Method</Label>

              <Select
                value={form.method}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    method: e.target.value,
                  }))
                }
              >
                <option>Cash</option>
                <option>Card</option>
                <option>Bank transfer</option>
              </Select>
            </FieldRow>

            <FieldRow>
              <Label>Date</Label>

              <Input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    date: e.target.value,
                  }))
                }
              />
            </FieldRow>

            <ModalBtnRow>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "var(--adm-panel)",
                  border: "1px solid var(--adm-border)",
                  borderRadius: 8,
                  padding: "8px 14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <AddBtn onClick={handleCreate} disabled={saving}>
                {saving ? "Saving..." : "Add"}
              </AddBtn>

              {formError && (
                <div
                  style={{
                    width: "100%",
                    color: "#C62828",
                    fontSize: 12,
                    marginTop: 6,
                  }}
                >
                  {formError}
                </div>
              )}
            </ModalBtnRow>
          </ModalCard>
        </ModalOverlay>
      )}

      {confirmDelete && (
        <ConfirmOverlay onClick={() => setConfirmDelete(null)}>
          <ConfirmCard onClick={(e) => e.stopPropagation()}>
            <h3
              style={{
                margin: "0 0 6px",
                fontSize: 16,
                fontWeight: 800,
              }}
            >
              Delete this payment?
            </h3>

            <p
              style={{
                fontSize: 13,
                color: "var(--adm-muted)",
                margin: "0 0 16px",
              }}
            >
              This cannot be undone.
            </p>

            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => setConfirmDelete(null)}
                style={{
                  background: "var(--adm-panel)",
                  border: "1px solid var(--adm-border)",
                  borderRadius: 8,
                  padding: "8px 14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                style={{
                  background: "#C62828",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </ConfirmCard>
        </ConfirmOverlay>
      )}
    </Container>
  );
}
