import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import dashboardService from '../../../../../api/dashboardService';
import reviewService from '../../../../../api/reviewService';

const money = value => `${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DT`;

const styles = {
  page: { color: '#f4f5f0', minHeight: 'calc(100vh - 100px)', padding: '0 0 2rem' },
  grid: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: 18, marginBottom: 20 },
  card: { background: 'linear-gradient(135deg, rgba(18, 82, 66, .54), rgba(82, 35, 36, .62))', border: '1px solid rgba(255,255,255,.16)', borderRadius: 18, boxShadow: '0 12px 32px rgba(0,0,0,.20)', overflow: 'hidden' },
  cardHeader: { padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,.13)', display: 'flex', alignItems: 'center', gap: 12 },
  icon: { width: 34, height: 34, borderRadius: 9, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,.15)', fontSize: 19 },
  title: { fontSize: 16, fontWeight: 700, margin: 0 },
  body: { padding: 22, minHeight: 72 },
  muted: { color: 'rgba(235,239,230,.54)', fontSize: 13, fontStyle: 'italic' },
  item: { display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,.10)' },
};

const Panel = ({ icon, title, children, style = {} }) => (
  <section style={{ ...styles.card, ...style }}>
    <div style={styles.cardHeader}><span style={styles.icon}>{icon}</span><h2 style={styles.title}>{title}</h2></div>
    {children}
  </section>
);

const DashboardSection = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ payment: null, payments: [], dossier: null, announcements: [], messages: [] });
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, content: '' });
  const [reviewStatus, setReviewStatus] = useState(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!user?.id) return;
      setLoading(true);
      const [paymentRes, dossierRes, announcementRes, messageRes] = await Promise.all([
        dashboardService.getPaymentInfo(user.id).catch(() => ({ data: [] })),
        dashboardService.getDossierInfo(user.id).catch(() => ({ data: null })),
        dashboardService.getLatestAnnouncements(3).catch(() => ({ data: [] })),
        dashboardService.getLatestMessages(user.id, 5).catch(() => ({ data: [] })),
      ]);
      if (!active) return;
      const payments = paymentRes?.data || [];
      setData({
        payment: [...payments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null,
        payments,
        dossier: dossierRes?.data || null,
        announcements: announcementRes?.data || [],
        messages: messageRes?.data || [],
      });
      setLoading(false);
    };
    load();
    return () => { active = false; };
  }, [user?.id]);

  const totals = useMemo(() => {
    const totalDue = data.payments.reduce((sum, p) => sum + Number(p.prixTotal || 0), 0);
    const paid = data.payments.reduce((sum, p) => sum + Number(p.prixPaye || 0), 0);
    return { totalDue, paid, remaining: Math.max(0, totalDue - paid) };
  }, [data.payments]);

  const progress = data.dossier ? [data.dossier.traductionStatus, data.dossier.inscriptionStatus, data.dossier.visaStatus].filter(s => s === 'VALIDE').length : 0;
  const progressPercent = Math.round(progress * 33.33);

  const submitReview = async event => {
    event.preventDefault();
    setReviewSubmitting(true);
    setReviewStatus(null);
    try {
      const response = await reviewService.create(reviewForm);
      setReviewStatus({ type: 'success', text: response.data?.message || 'Votre avis a été envoyé.' });
      setReviewForm({ rating: 5, content: '' });
    } catch (error) {
      setReviewStatus({ type: 'error', text: error.response?.data?.message || 'Impossible d’envoyer votre avis.' });
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) return <div style={{ color: '#d3d8cf', padding: 32 }}>Chargement du tableau de bord...</div>;

  return (
    <div style={styles.page}>
      <h1 style={{ fontSize: 25, margin: 0, fontWeight: 700 }}>Tableau de bord</h1>
      <div style={{ color: 'rgba(235,239,230,.52)', fontSize: 13, margin: '5px 0 24px' }}>Dashboard <span style={{ padding: '0 8px' }}>›</span> Vue d’ensemble</div>

      <div className="client-dashboard-top" style={styles.grid}>
        <Panel icon="📢" title="Annonces">
          {data.announcements.length ? data.announcements.map(item => <div style={styles.item} key={item.id}><span>📣</span><div><strong>{item.title || 'Annonce'}</strong><div style={styles.muted}>{item.content || item.message || ''}</div></div></div>) : <div style={{ ...styles.body, ...styles.muted }}>Aucune annonce disponible</div>}
        </Panel>
        <Panel icon="💳" title="Paiement">
          <div style={{ ...styles.body, minHeight: 164 }}>
            {data.payment ? <><div style={{ fontSize: 27, fontWeight: 700, color: '#f7c53a' }}>{money(data.payment.prixPaye)}</div><div style={styles.muted}>Dernier paiement enregistré</div><div style={{ marginTop: 22, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span>Total payé</span><b style={{ color: '#45d899' }}>{money(totals.paid)}</b></div></> : <div style={styles.muted}>Aucun paiement trouvé</div>}
          </div>
        </Panel>
      </div>

      <div className="client-dashboard-middle" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 20 }}>
        <Panel icon="💬" title="Messages"><div style={{ minHeight: 92 }}>{data.messages.length ? data.messages.slice(0, 3).map(item => <div style={styles.item} key={item.id}><span>💬</span><div><strong>{item.subject || item.title || 'Message'}</strong><div style={styles.muted}>{item.content || item.message || ''}</div></div></div>) : <div style={{ ...styles.body, ...styles.muted }}>Aucun message reçu</div>}</div></Panel>
        <Panel icon="📄" title="Contrat"><div style={{ ...styles.body, minHeight: 92 }}>{data.dossier ? <><strong>Contrat disponible</strong><div style={{ ...styles.muted, marginTop: 8 }}>Consultez votre dossier pour plus de détails.</div></> : <span style={styles.muted}>Aucun contrat disponible</span>}</div></Panel>
      </div>

      <Panel icon="📈" title="Progression générale" style={{ marginBottom: 20 }}>
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(11, 77, 59, .32)', borderRadius: 10, padding: '14px 16px', marginBottom: 22 }}><div><div style={{ fontSize: 29, fontWeight: 800, color: '#28d28b' }}>{progressPercent}%</div><div style={styles.muted}>Complété</div></div><span style={{ background: '#19bd7b', borderRadius: 6, padding: '7px 13px', fontSize: 12, fontWeight: 700 }}>STATUT: ACTIF</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e9eee6', fontSize: 13, marginBottom: 9 }}><span>Étapes complétées: <b>{progress} / 3</b></span></div>
          <div style={{ position: 'relative', height: 4, background: 'rgba(255,255,255,.20)', margin: '0 8px 17px' }}><div style={{ width: `${progressPercent}%`, height: '100%', background: '#25cf8b' }} />{[0, 1, 2].map(step => <span key={step} style={{ position: 'absolute', left: `${step * 50}%`, top: -9, width: 22, height: 22, borderRadius: '50%', background: step < progress ? '#21ca88' : '#708176', color: '#fff', textAlign: 'center', lineHeight: '22px', fontSize: 12 }}>{step + 1}</span>)}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e8ede4', fontSize: 12 }}><span>INSCRIPTION<br /><small style={styles.muted}>Étape 1</small></span><span style={{ textAlign: 'center' }}>VALIDATION<br /><small style={styles.muted}>Étape 2</small></span><span style={{ textAlign: 'right' }}>FINALISATION<br /><small style={styles.muted}>Étape 3</small></span></div>
        </div>
      </Panel>

      <section style={{ ...styles.card, padding: 20 }}>
        <div style={{ marginBottom: 14 }}><h2 style={{ ...styles.title, marginBottom: 5 }}>Laisser un avis</h2><p style={styles.muted}>Votre avis sera visible sur la page d’accueil après validation par notre équipe.</p></div>
        <form onSubmit={submitReview} style={{ display: 'grid', gap: 12, maxWidth: 720 }}><div style={{ display: 'flex', gap: 5 }} aria-label="Note sur cinq">{[1, 2, 3, 4, 5].map(star => <button key={star} type="button" onClick={() => setReviewForm(form => ({ ...form, rating: star }))} style={{ border: 0, background: 'transparent', color: star <= reviewForm.rating ? '#f6b91a' : '#718071', fontSize: 25, cursor: 'pointer', padding: 0 }}>★</button>)}</div><textarea required minLength={10} maxLength={1000} value={reviewForm.content} onChange={event => setReviewForm(form => ({ ...form, content: event.target.value }))} placeholder="Écrivez votre expérience avec Via Italia..." style={{ minHeight: 100, resize: 'vertical', background: 'rgba(8,20,18,.55)', border: '1px solid rgba(255,255,255,.18)', color: '#fff', borderRadius: 8, padding: 12, outline: 'none' }} /><button type="submit" disabled={reviewSubmitting} style={{ width: 'fit-content', background: '#16bd62', color: '#fff', border: 0, borderRadius: 7, padding: '10px 18px', fontWeight: 700, cursor: 'pointer', opacity: reviewSubmitting ? .6 : 1 }}>{reviewSubmitting ? 'Envoi…' : 'Envoyer mon avis'}</button>{reviewStatus && <p style={{ color: reviewStatus.type === 'success' ? '#4ade80' : '#fb7185', fontSize: 12, margin: 0 }}>{reviewStatus.text}</p>}</form>
      </section>
      <style>{`@media (max-width:900px){.client-dashboard-top{grid-template-columns:1fr!important}.client-dashboard-middle{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
};

export default DashboardSection;
