import React, { useEffect, useState } from 'react';
import reviewService from '../api/reviewService';
import authService from '../api/authService';

const darkColors = {
  panel: '#102238', border: '#1c3852', green: '#19c875', muted: '#8294a9',
  text: '#e8eef7', body: '#d5dfeb', field: '#0b1827', buttonText: '#03160d', emptyStar: '#42536a'
};
const lightColors = {
  panel: '#ffffff', border: '#d6e1db', green: '#087f4d', muted: '#475569',
  text: '#111111', body: '#1f2937', field: '#ffffff', buttonText: '#ffffff', emptyStar: '#cbd5e1'
};

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [users, setUsers] = useState([]);
  const [clientQuery, setClientQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ userId: '', rating: 5, content: '' });
  const [theme, setTheme] = useState(() => document.body.dataset.theme === 'dark' || document.body.classList.contains('theme-dark') ? 'dark' : 'light');
  const palette = theme === 'dark' ? darkColors : lightColors;

  useEffect(() => {
    const syncTheme = () => setTheme(document.body.dataset.theme === 'dark' || document.body.classList.contains('theme-dark') ? 'dark' : 'light');
    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    return () => observer.disconnect();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const response = await reviewService.listAdmin(status);
      setReviews(response.data?.data || []);
    } catch (error) {
      console.error(error);
      setReviews([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [status]);
  useEffect(() => {
    authService.getAllUsers()
      .then(response => setUsers((response.data || response || []).filter(user => user.role !== 'ADMIN')))
      .catch(console.error);
  }, []);

  const matchingUsers = users.filter(user => {
    const label = `${user.firstName || ''} ${user.lastName || ''} ${user.email || ''}`.toLowerCase();
    return label.includes(clientQuery.trim().toLowerCase());
  });

  const resetForm = () => {
    setForm({ userId: '', rating: 5, content: '' });
    setClientQuery('');
  };

  const createReview = async event => {
    event.preventDefault();
    if (!form.userId) return alert('Veuillez sélectionner un client dans les résultats.');
    setBusy('create');
    try {
      await reviewService.createAdmin({ userId: Number(form.userId), rating: Number(form.rating), content: form.content.trim() });
      setShowCreate(false);
      resetForm();
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

  const deleteReview = async id => {
    if (!window.confirm('Voulez-vous vraiment supprimer définitivement cet avis ?')) return;
    setBusy(`delete-${id}`);
    try { await reviewService.remove(id); await load(); }
    catch (error) {
      console.error('[REVIEWS DELETE] frontend failed', { status: error.response?.status, data: error.response?.data, message: error.message });
      alert(error.response?.data?.message || `Impossible de supprimer cet avis${error.response?.status ? ` (HTTP ${error.response.status})` : ' : vérifiez que le serveur est démarré'}.`);
    }
    finally { setBusy(null); }
  };

  const fieldStyle = { width: '100%', marginTop: 6, padding: 10, boxSizing: 'border-box', background: palette.field, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 6 };

  return <div style={{ color: palette.text, padding: '12px 0 40px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 15, marginBottom: 20, flexWrap: 'wrap' }}>
      <div><h1 style={{ margin: 0, fontSize: 25 }}>Avis clients</h1><p style={{ color: palette.muted, margin: '6px 0 0' }}>Valider les témoignages avant leur publication sur Home.</p></div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><select value={status} onChange={event => setStatus(event.target.value)} style={{ background: palette.panel, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 6, padding: '10px 14px' }}><option value="PENDING">En attente</option><option value="APPROVED">Acceptés</option><option value="REJECTED">Refusés</option></select><button onClick={() => setShowCreate(true)} style={{ border: 0, borderRadius: 6, padding: '10px 14px', background: palette.green, color: palette.buttonText, fontWeight: 700, cursor: 'pointer' }}>Ajouter un avis</button></div>
    </div>
    <div style={{ display: 'grid', gap: 12 }}>{loading ? <div style={{ color: palette.muted }}>Chargement…</div> : reviews.length === 0 ? <div style={{ background: palette.panel, border: `1px solid ${palette.border}`, padding: 25, borderRadius: 8, color: palette.muted }}>Aucun avis dans cette catégorie.</div> : reviews.map(review => {
      const name = `${review.user?.firstName || ''} ${review.user?.lastName || ''}`.trim() || 'Client';
      return <article key={review.id} style={{ background: palette.panel, border: `1px solid ${palette.border}`, borderRadius: 8, padding: 18 }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><div><strong>{name}</strong><div style={{ color: '#f6b91a', marginTop: 6 }}>{'★'.repeat(review.rating)}<span style={{ color: palette.emptyStar }}>{'★'.repeat(5 - review.rating)}</span></div></div><small style={{ color: palette.muted }}>{new Date(review.createdAt).toLocaleDateString('fr-FR')}</small></div><p style={{ color: palette.body, lineHeight: 1.6, margin: '15px 0' }}>{review.content}</p><div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{status === 'PENDING' && <><button disabled={busy === review.id} onClick={() => moderate(review.id, 'APPROVED')} style={{ border: 0, borderRadius: 5, padding: '9px 15px', background: palette.green, color: palette.buttonText, fontWeight: 700, cursor: 'pointer' }}>Accepter</button><button disabled={busy === review.id} onClick={() => moderate(review.id, 'REJECTED')} style={{ border: 0, borderRadius: 5, padding: '9px 15px', background: '#5b2430', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Refuser</button></>}<button disabled={busy === `delete-${review.id}`} onClick={() => deleteReview(review.id)} style={{ border: `1px solid ${palette.border}`, borderRadius: 5, padding: '9px 15px', background: 'transparent', color: palette.text, fontWeight: 700, cursor: 'pointer' }}>Supprimer</button></div></article>;
    })}</div>
    {showCreate && <div onClick={() => setShowCreate(false)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,.72)', display: 'grid', placeItems: 'center', padding: 20 }}><form onSubmit={createReview} onClick={event => event.stopPropagation()} style={{ width: 'min(560px, 96vw)', background: palette.panel, border: `1px solid ${palette.border}`, borderRadius: 12, padding: 24 }}><h2 style={{ marginTop: 0 }}>Ajouter un avis</h2><label>Client<input required value={clientQuery} onChange={event => { setClientQuery(event.target.value); setForm({ ...form, userId: '' }); }} placeholder="Écrire le nom ou l’email du client" style={fieldStyle} /><select required value={form.userId} onChange={event => { const selected = users.find(user => String(user.id) === event.target.value); setForm({ ...form, userId: event.target.value }); setClientQuery(selected ? `${selected.firstName || ''} ${selected.lastName || ''}`.trim() : ''); }} style={{ ...fieldStyle, marginTop: 8 }}><option value="">{matchingUsers.length ? 'Sélectionner un résultat' : 'Aucun client trouvé'}</option>{matchingUsers.map(user => <option key={user.id} value={user.id}>{user.firstName} {user.lastName} — {user.email}</option>)}</select></label><label style={{ display: 'block', marginTop: 15 }}>Note<select value={form.rating} onChange={event => setForm({ ...form, rating: event.target.value })} style={fieldStyle}><option value="5">★★★★★ — 5/5</option><option value="4">★★★★☆ — 4/5</option><option value="3">★★★☆☆ — 3/5</option><option value="2">★★☆☆☆ — 2/5</option><option value="1">★☆☆☆☆ — 1/5</option></select></label><label style={{ display: 'block', marginTop: 15 }}>Avis<textarea required minLength={10} maxLength={1000} rows={6} value={form.content} onChange={event => setForm({ ...form, content: event.target.value })} style={{ ...fieldStyle, resize: 'vertical' }} /></label><div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}><button type="button" onClick={() => setShowCreate(false)}>Annuler</button><button disabled={busy === 'create'} type="submit">{busy === 'create' ? 'Enregistrement…' : 'Ajouter et publier'}</button></div></form></div>}
  </div>;
}

