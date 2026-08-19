import React, { useEffect, useState } from 'react';
import reviewService from '../api/reviewService';
import authService from '../api/authService';

const colors = { bg: '#0b1827', panel: '#102238', border: '#1c3852', green: '#19c875', muted: '#8294a9' };

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [users, setUsers] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ userId: '', rating: 5, content: '' });
  const load = async () => {
    setLoading(true);
    try { const response = await reviewService.listAdmin(status); setReviews(response.data?.data || []); }
    catch (error) { console.error(error); setReviews([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [status]);
  useEffect(() => { authService.getAllUsers().then(response => setUsers((response.data || response || []).filter(user => user.role !== 'ADMIN'))).catch(console.error); }, []);
  const createReview = async event => {
    event.preventDefault();
    setBusy('create');
    try {
      await reviewService.createAdmin({ userId: Number(form.userId), rating: Number(form.rating), content: form.content.trim() });
      setShowCreate(false);
      setForm({ userId: '', rating: 5, content: '' });
      setStatus('APPROVED');
      alert('Avis ajouté et publié sur la page Home.');
    } catch (error) { alert(error.response?.data?.message || 'Impossible de créer l’avis.'); }
    finally { setBusy(null); }
  };
  const moderate = async (id, nextStatus) => {
    setBusy(id);
    try { await reviewService.moderate(id, { status: nextStatus }); await load(); }
    catch (error) { alert(error.response?.data?.message || 'Erreur de modération.'); }
    finally { setBusy(null); }
  };
  return <div style={{ color: '#e8eef7', padding: '12px 0 40px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 15, marginBottom: 20, flexWrap: 'wrap' }}>
      <div><h1 style={{ margin: 0, fontSize: 25 }}>Avis clients</h1><p style={{ color: colors.muted, margin: '6px 0 0' }}>Valider les témoignages avant leur publication sur Home.</p></div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}><select value={status} onChange={event => setStatus(event.target.value)} style={{ background: colors.panel, color: '#fff', border: `1px solid ${colors.border}`, borderRadius: 6, padding: '10px 14px' }}><option value="PENDING">En attente</option><option value="APPROVED">Acceptés</option><option value="REJECTED">Refusés</option></select><button onClick={() => setShowCreate(true)} style={{ border: 0, borderRadius: 6, padding: '10px 14px', background: colors.green, color: '#03160d', fontWeight: 700, cursor: 'pointer' }}>＋ Ajouter un avis</button></div>
    </div>
    <div style={{ display: 'grid', gap: 12 }}>{loading ? <div style={{ color: colors.muted }}>Chargement…</div> : reviews.length === 0 ? <div style={{ background: colors.panel, border: `1px solid ${colors.border}`, padding: 25, borderRadius: 8, color: colors.muted }}>Aucun avis dans cette catégorie.</div> : reviews.map(review => {
      const name = `${review.user?.firstName || ''} ${review.user?.lastName || ''}`.trim() || 'Client';
      return <article key={review.id} style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 8, padding: 18 }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><div><strong>{name}</strong><div style={{ color: '#f6b91a', marginTop: 6 }}>{'★'.repeat(review.rating)}<span style={{ color: '#42536a' }}>{'★'.repeat(5 - review.rating)}</span></div></div><small style={{ color: colors.muted }}>{new Date(review.createdAt).toLocaleDateString('fr-FR')}</small></div><p style={{ color: '#d5dfeb', lineHeight: 1.6, margin: '15px 0' }}>{review.content}</p>{status === 'PENDING' && <div style={{ display: 'flex', gap: 10 }}><button disabled={busy === review.id} onClick={() => moderate(review.id, 'APPROVED')} style={{ border: 0, borderRadius: 5, padding: '9px 15px', background: colors.green, color: '#03160d', fontWeight: 700, cursor: 'pointer' }}>✓ Accepter</button><button disabled={busy === review.id} onClick={() => moderate(review.id, 'REJECTED')} style={{ border: 0, borderRadius: 5, padding: '9px 15px', background: '#5b2430', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>✕ Refuser</button></div>}</article>;
    })}</div>
    {showCreate && <div onClick={() => setShowCreate(false)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,.72)', display: 'grid', placeItems: 'center', padding: 20 }}><form onSubmit={createReview} onClick={event => event.stopPropagation()} style={{ width: 'min(560px, 96vw)', background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 24 }}><h2 style={{ marginTop: 0 }}>Ajouter un avis</h2><label>Client<select required value={form.userId} onChange={event => setForm({ ...form, userId: event.target.value })} style={{ width: '100%', marginTop: 6, padding: 10, background: '#0b1827', color: '#fff', border: `1px solid ${colors.border}`, borderRadius: 6 }}><option value="">Sélectionner un client</option>{users.map(user => <option key={user.id} value={user.id}>{user.firstName} {user.lastName} — {user.email}</option>)}</select></label><label style={{ display: 'block', marginTop: 15 }}>Note<select value={form.rating} onChange={event => setForm({ ...form, rating: event.target.value })} style={{ width: '100%', marginTop: 6, padding: 10, background: '#0b1827', color: '#fff', border: `1px solid ${colors.border}`, borderRadius: 6 }}><option value="5">★★★★★ — 5/5</option><option value="4">★★★★☆ — 4/5</option><option value="3">★★★☆☆ — 3/5</option><option value="2">★★☆☆☆ — 2/5</option><option value="1">★☆☆☆☆ — 1/5</option></select></label><label style={{ display: 'block', marginTop: 15 }}>Avis<textarea required minLength={10} maxLength={1000} rows={6} value={form.content} onChange={event => setForm({ ...form, content: event.target.value })} style={{ width: '100%', marginTop: 6, padding: 10, boxSizing: 'border-box', background: '#0b1827', color: '#fff', border: `1px solid ${colors.border}`, borderRadius: 6, resize: 'vertical' }} /></label><div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}><button type="button" onClick={() => setShowCreate(false)}>Annuler</button><button disabled={busy === 'create'} type="submit">{busy === 'create' ? 'Enregistrement…' : 'Ajouter et publier'}</button></div></form></div>}
  </div>;
}
