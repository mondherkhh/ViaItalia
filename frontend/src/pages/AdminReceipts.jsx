import React, { useEffect, useMemo, useState } from 'react';
import authService from '../api/authService';
import receiptService from '../api/receiptService';
import ReceiptPreview from '../components/ReceiptPreview';
import './receiptsDashboard.css';
const formatDate = value => new Date(value).toLocaleDateString('fr-FR');
const money = value => `${Number(value || 0).toFixed(2)} DT`;
export default function AdminReceipts() {
  const [users, setUsers] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [stats, setStats] = useState({ totalPaid: 0, numberOfReceipts: 0 });
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ paymentMethod: '', from: '', to: '' });
  const [form, setForm] = useState({ userId: '', amount: '', paymentMethod: 'ESPECE', paymentDate: new Date().toISOString().slice(0, 10), note: '' });
  const [formError, setFormError] = useState('');
  const [sending, setSending] = useState(false);

  const load = () => receiptService.getReceipts({ ...filters, ...(search && { search }) }).then(({ data }) => {
    setReceipts(data.data || []); setStats(data.stats || { totalPaid: 0, numberOfReceipts: 0 });
  }).catch(console.error);
  useEffect(() => { authService.getAllUsers().then(data => setUsers(data.data || data || [])).catch(console.error); }, []);
  useEffect(() => { load(); }, [search, filters]);

  const paymentSummary = useMemo(() => receipts.reduce((result, item) => {
    result[item.paymentMethod] = (result[item.paymentMethod] || 0) + Number(item.amount); return result;
  }, {}), [receipts]);

  const submit = event => {
    event.preventDefault();
    setFormError(''); setSending(true);
    if (!Number.isInteger(Number(form.userId)) || Number(form.amount) <= 0 || !['ESPECE', 'VIREMENT'].includes(form.paymentMethod)) {
      setFormError('Client, montant et méthode sont obligatoires.'); setSending(false); return;
    }
    receiptService.createReceipt({
      userId: Number(form.userId),
      amount: Number(form.amount),
      paymentMethod: form.paymentMethod,
      paymentDate: form.paymentDate,
      note: form.note
    }).then(({ data }) => {
      setReceipts(current => [data.data, ...current]);
      setStats(current => ({ totalPaid: current.totalPaid + Number(data.data.amount), numberOfReceipts: current.numberOfReceipts + 1 }));
      setShow(false);
      setForm({ userId: '', amount: '', paymentMethod: 'ESPECE', paymentDate: new Date().toISOString().slice(0, 10), note: '' });
      setSending(false);
      setFormError('');
    }).catch(error => {
      const msg = error.response?.data?.message;
      if (msg && msg.includes('prisma')) setFormError('Impossible de créer le reçu.');
      else setFormError(msg || 'Impossible de créer le reçu.');
      setSending(false);
    });
  };

  return <div className="vi-page">
    <div className="vi-page-header"><div><h1 className="vi-page-title">Invoices</h1><p className="vi-page-subtitle">Manage client payment receipts / invoices</p></div><button className="vi-primary-btn" onClick={() => setShow(true)}>＋ Add Receipt</button></div>
    <div className="vi-stat-grid">
      <div className="vi-stat-card"><div className="vi-stat-icon green">▤</div><div><div className="vi-stat-label">Total Receipts</div><div className="vi-stat-value">{stats.numberOfReceipts}</div><div className="vi-stat-trend">Live account data ↗</div></div></div>
      <div className="vi-stat-card"><div className="vi-stat-icon purple">▧</div><div><div className="vi-stat-label">Total Amount Paid</div><div className="vi-stat-value">{money(stats.totalPaid)}</div><div className="vi-stat-trend">All recorded receipts ↗</div></div></div>
      <div className="vi-stat-card"><div className="vi-stat-icon blue">◫</div><div><div className="vi-stat-label">This Month</div><div className="vi-stat-value">{money(receipts.filter(r => new Date(r.paymentDate).getMonth() === new Date().getMonth()).reduce((s, r) => s + Number(r.amount), 0))}</div><div className="vi-stat-trend">Current period ↗</div></div></div>
      <div className="vi-stat-card"><div className="vi-stat-icon yellow">◎</div><div><div className="vi-stat-label">Average Receipt</div><div className="vi-stat-value">{money(stats.numberOfReceipts ? stats.totalPaid / stats.numberOfReceipts : 0)}</div><div className="vi-stat-trend">Based on receipts ↗</div></div></div>
    </div>
    <div className="vi-content-grid"><div className="vi-panel"><div className="vi-toolbar"><input className="vi-input" placeholder="Search by client name or receipt ID..." value={search} onChange={e => setSearch(e.target.value)} /><select className="vi-select" value={filters.paymentMethod} onChange={e => setFilters({ ...filters, paymentMethod: e.target.value })}><option value="">All Methods</option><option value="ESPECE">Cash</option><option value="VIREMENT">Bank Transfer</option></select><input className="vi-date" type="date" value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })} /><input className="vi-date" type="date" value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })} /><button className="vi-select" onClick={load}>↗ Filters</button></div><div className="vi-table-wrap"><table className="vi-table"><thead><tr><th>Receipt ID</th><th>Client</th><th>Amount</th><th>Payment Method</th><th>Payment Date</th><th>Actions</th></tr></thead><tbody>{receipts.map(receipt => <tr key={receipt.id}><td className="vi-id">▧ {receipt.receiptNumber}</td><td>{receipt.user?.firstName} {receipt.user?.lastName}<div className="vi-muted">CL-{receipt.userId}</div></td><td>{money(receipt.amount)}</td><td><span className={`vi-method ${receipt.paymentMethod === 'ESPECE' ? 'cash' : 'transfer'}`}>{receipt.paymentMethod === 'ESPECE' ? '▣ Cash' : '⇄ Bank Transfer'}</span></td><td>{formatDate(receipt.paymentDate)}</td><td><button className="vi-select" onClick={() => setSelected(receipt)}>◉</button></td></tr>)}</tbody></table>{!receipts.length && <div className="vi-panel-body vi-muted">No receipts found.</div>}</div></div><aside><div className="vi-panel" style={{ marginBottom: 16 }}><div className="vi-panel-heading">Payment Summary</div><div className="vi-panel-body"><div className="vi-total">{money(stats.totalPaid)}</div><p className="vi-muted">Total recorded</p><div className="vi-side-list"><div className="vi-side-row"><span>● Cash</span><b>{money(paymentSummary.ESPECE)}</b></div><div className="vi-side-row"><span>● Bank Transfer</span><b>{money(paymentSummary.VIREMENT)}</b></div></div></div></div><div className="vi-panel"><div className="vi-panel-heading">Recent Activity</div><div className="vi-panel-body"><div className="vi-side-list">{receipts.slice(0, 4).map(receipt => <div className="vi-side-row" key={receipt.id}><span><b className="vi-id">▧ Invoice created</b><br /><small className="vi-muted">{receipt.receiptNumber}</small></span><small className="vi-muted">{formatDate(receipt.createdAt)}</small></div>)}</div></div></div></aside></div>
    {show && <div className="vi-receipt-modal" onClick={() => setShow(false)}><form className="vi-receipt-card" onClick={e => e.stopPropagation()} onSubmit={submit}><h2>Add Receipt</h2>{formError && <div className="form-error" style={{ color: '#d33', marginBottom: 10 }}>{formError}</div>}<label>Client<select required className="vi-select" style={{ width: '100%', margin: '7px 0 15px' }} value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })}><option value="">Select client</option>{users.filter(u => u.role !== 'ADMIN').map(user => <option key={user.id} value={user.id}>{user.firstName} {user.lastName} — {user.email}</option>)}</select></label><label>Amount (DT)<input required min="0.01" step="0.01" type="number" className="vi-input" style={{ width: '100%', margin: '7px 0 15px', boxSizing: 'border-box' }} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="10.00" /></label><label>Payment Method<select required className="vi-select" style={{ width: '100%', margin: '7px 0 15px' }} value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}><option value="ESPECE">Cash / Espèce</option><option value="VIREMENT">Bank Transfer / Virement</option></select></label><label>Payment Date<input required type="date" className="vi-date" style={{ width: '100%', margin: '7px 0 20px', boxSizing: 'border-box' }} value={form.paymentDate} onChange={e => setForm({ ...form, paymentDate: e.target.value })} /></label><label>Note (optional)<textarea className="vi-input" style={{ width: '100%', margin: '7px 0 20px', boxSizing: 'border-box', minHeight: 60 }} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Optional description or reference" /></label><button className="vi-primary-btn" type="submit" disabled={sending} style={{ opacity: sending ? 0.6 : 1, color: '#fff', backgroundColor: '#0d6e4a' }}>{sending ? 'Creating...' : 'Create Receipt'}</button><button type="button" className="vi-close" onClick={() => setShow(false)}>Cancel</button></form></div>}
    {selected && <ReceiptPreview receipt={selected} onClose={() => setSelected(null)} />}
  </div>;
}
