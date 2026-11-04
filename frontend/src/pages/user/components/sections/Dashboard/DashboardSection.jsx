import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import dashboardService from '../../../../../api/dashboardService';
import reviewService from '../../../../../api/reviewService';
import { FiCreditCard, FiMessageSquare, FiFileText, FiTrendingUp } from 'react-icons/fi';

const money = value => `${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TND`;

const styles = {
  page: { color: 'var(--adm-text, #f4f5f0)', minHeight: 'calc(100vh - 100px)', padding: '0 0 2rem' },
  grid: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: 18, marginBottom: 20 },
  card: {
    background: 'var(--adm-card, #fff)',
    border: '1px solid var(--adm-border)',
    borderRadius: 16,
    boxShadow: '0 2px 14px rgba(0,0,0,.06)',
    overflow: 'hidden',
  },
  cardHeader: { padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,.13)', display: 'flex', alignItems: 'center', gap: 12 },
  icon: { width: 34, height: 34, borderRadius: 9, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,.15)', fontSize: 19 },
  title: { fontSize: 16, fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' },
  body: { padding: 22, minHeight: 72 },
  muted: { color: 'var(--adm-muted, rgba(235,239,230,.54))', fontSize: 13, fontStyle: 'italic' },
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
  const [data, setData] = useState({ payment: null, payments: [], dossier: null, messages: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, content: '' });
  const [reviewStatus, setReviewStatus] = useState(null);
  const [userReview, setUserReview] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!user?.id) {
        if (!active) return;
        setError('Session utilisateur introuvable. Veuillez vous reconnecter.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const payload = await dashboardService.getDashboardData();
        if (!active) return;
        const payments = Array.isArray(payload.payments?.items) ? payload.payments.items : [];
        setData({
          payment: [...payments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null,
          payments,
          dossier: payload.dossier || null,
          contract: payload.contract || null,
          pipelineStage: payload.pipelineStage || (payload.dossier ? (payload.dossier.status === 'VALIDATED' ? 'Choice locked' : payload.dossier.status === 'PENDING' ? 'Invited' : 'Onboarded') : 'Invited'),
          documentsValidated: payload.documentsValidated ?? (payload.counts?.documents || 0),
          documentsMissing: payload.documentsMissing ?? 0,
          remainingDue: payload.remainingDue ?? Math.max(0, (payments.reduce((s,p)=>s+Number(p.prixTotal||p.amount||0),0)) - (payments.reduce((s,p)=>s+Number(p.prixPaye||0),0))),
          unreadMessages: payload.unreadMessages ?? 0,
          messages: Array.isArray(payload.messages) ? payload.messages : [],
        });
      } catch (err) {
        if (!active) return;
        setError('Impossible de charger vos données. Vérifiez votre connexion puis réessayez.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [user?.id, reloadKey]);

  useEffect(() => {
    if (!user?.id) return;
    const tick = () => setReloadKey(k => k + 1);
    const id = setInterval(tick, 30000);
    const onVis = () => { if (document.hidden) clearInterval(id); else setInterval(tick, 30000); };
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVis); };
  }, [user?.id]);

  const handleRetry = () => {
    dashboardService.invalidateCache();
    setReloadKey(key => key + 1);
  };

  const stageLabels = { 'Invited': 'Invitation', 'Onboarded': 'Intégration', 'Documents': 'Pièces à fournir', 'Applications': 'Candidatures', 'Acceptance': 'Acceptation', 'Choice': 'Choix', 'Visa': 'Visa' };
  const stages = ['Invited', 'Onboarded', 'Documents', 'Applications', 'Acceptance', 'Choice', 'Visa'];
  const stageIndex = stages.indexOf(data.pipelineStage || 'Invited');

  const totals = useMemo(() => {
    const totalDue = data.payments.reduce((sum, p) => sum + Number(p.prixTotal || 0), 0);
    const paid = data.payments.reduce((sum, p) => sum + Number(p.prixPaye || 0), 0);
    return { totalDue, paid, remaining: Math.max(0, totalDue - paid) };
  }, [data.payments]);

  const progress = data.dossier ? [data.dossier.traductionStatus, data.dossier.inscriptionStatus, data.dossier.visaStatus].filter(s => s === 'VALIDE').length : 0;
  const progressPercent = Math.round(progress * 33.33);

  const submitReview = async event => {
    event.preventDefault();
    setReviewStatus(null);
    try {
      const response = await reviewService.create(reviewForm);
      setReviewStatus({ type: 'success', text: response.data?.message || 'Votre avis a été envoyé.' });
      setReviewForm({ rating: 5, content: '' });
    } catch (error) {
      setReviewStatus({ type: 'error', text: error.response?.data?.message || 'Impossible d’envoyer votre avis.' });
    }
  };

  if (loading) return <div style={{ color: '#d3d8cf', padding: 32 }}>Chargement du tableau de bord...</div>;
  if (error) return (
    <div style={{ color: '#fb7185', padding: 32, background: 'rgba(251,113,133,.08)', border: '1px solid rgba(251,113,133,.25)', borderRadius: 12 }}>
      <div style={{ marginBottom: 12 }}>{error}</div>
      <button onClick={handleRetry} style={{ background: '#16bd62', color: '#fff', border: 0, borderRadius: 7, padding: '10px 18px', fontWeight: 700, cursor: 'pointer' }}>Réessayer</button>
    </div>
  );

  return (
    <div style={styles.page}>
      <h1 style={{ fontSize: 25, margin: 0, fontWeight: 700 }}>Tableau de bord</h1>
      <div style={{ color: 'rgba(235,239,230,.7)', fontSize: 13, margin: '5px 0 24px' }}>Tableau de bord <span style={{ padding: '0 8px', opacity: 0.5 }}>›</span> Vue d'ensemble</div>

      <div className="client-dashboard-keys" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, marginBottom: 20 }}>
        <Panel icon={<FiTrendingUp aria-hidden="true" />} title="Étape actuelle">
          <div style={{ ...styles.body, minHeight: 72 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#28d28b' }}>{data.pipelineStage || '—'}</div>
            <div style={styles.muted}>{data.dossier ? `Statut du dossier` : 'Aucun dossier'}</div>
          </div>
        </Panel>
        <Panel icon={<FiFileText aria-hidden="true" />} title="À faire">
          <div style={{ ...styles.body, minHeight: 72 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#f7c53a' }}>{data.documentsMissing ?? 0}</div>
            <div style={styles.muted}>Document(s) manquant(s)</div>
            <div style={{ marginTop: 10 }}>
              <a href="#" style={{ color: '#47a8ff', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>Voir mon dossier →</a>
            </div>
          </div>
        </Panel>
        <Panel icon={<FiCreditCard aria-hidden="true" />} title="Payé / Restant">
          <div style={{ ...styles.body, minHeight: 72 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#45d899' }}>{money(totals.paid || 0)}</div>
            <div style={styles.muted}>Restant dû : <b style={{ color: '#fb7185' }}>{money(data.remainingDue ?? totals.remaining ?? 0)}</b></div>
          </div>
        </Panel>
        <Panel icon={<FiMessageSquare aria-hidden="true" />} title="Messages">
          <div style={{ ...styles.body, minHeight: 92 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#60a5fa' }}>{data.unreadMessages ?? 0}</div>
            <div style={styles.muted}>Non lus de l'équipe</div>
          </div>
        </Panel>
      </div>

      <div className="client-dashboard-top" style={styles.grid}>
        <Panel icon={<FiCreditCard aria-hidden="true" />} title="Paiement">
          <div style={{ ...styles.body, minHeight: 164 }}>
            {data.payment ? <><div style={{ fontSize: 27, fontWeight: 700, color: '#f7c53a' }}>{money(data.payment.prixPaye)}</div><div style={styles.muted}>Dernier paiement enregistré</div><div style={{ marginTop: 22, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span>Total payé</span><b style={{ color: '#45d899' }}>{money(totals.paid)}</b></div></> : <div style={styles.muted}>Aucun paiement trouvé</div>}
          </div>
        </Panel>
      </div>

      <div className="client-dashboard-middle" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 20 }}>
        <Panel icon={<FiMessageSquare aria-hidden="true" />} title="Messages"><div style={{ minHeight: 92 }}>{data.messages.length ? data.messages.slice(0, 3).map(item => <div style={styles.item} key={item.id}><span aria-hidden="true"><FiMessageSquare /></span><div><strong>{item.sender === 'ADMIN' ? "L'équipe" : (item.sender === 'USER' ? 'Vous' : '—')}</strong> <span style={{fontSize:10,color:'#777'}}>{(item.content || item.message || '').slice(0,60)}{(item.content || item.message || '').length>60?'...':''}</span><div style={{marginTop:2}}><span style={{fontSize:11,color:'#777'}}>{item.createdAt ? new Date(item.createdAt).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) : '-'}</span></div></div></div>) : <div style={{ ...styles.body, ...styles.muted }}>Aucun message reçu</div>}<div style={{padding:'6px 18px 2px'}}><a href="#" style={{fontSize:11,color:'#47a8ff',fontWeight:600}}>Voir la messagerie →</a></div></div></Panel>
        <Panel icon={<FiFileText aria-hidden="true" />} title="Contrat">
          <div style={{ ...styles.body, minHeight: 92 }}>
            {data.contract ? (
              <>
                <strong>Contrat disponible</strong>
                <div style={{ ...styles.muted, marginTop: 8 }}>Statut : {data.contract.status || 'En cours'}</div>
                <a href="#" style={{ display: 'inline-block', marginTop: 10, color: '#47a8ff', fontWeight: 600, fontSize: 13 }}>Accéder au contrat →</a>
              </>
            ) : (
              <div style={{ ...styles.muted }}>Aucun contrat enregistré</div>
            )}
          </div>
        </Panel>
      </div>

      <Panel icon={<FiTrendingUp aria-hidden="true" />} title="Mon parcours" style={{ marginBottom: 20 }}>
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(11, 77, 59, .32)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 29, fontWeight: 800, color: '#28d28b' }}>{stageLabels[data.pipelineStage] || data.pipelineStage || '—'}</div>
              <div style={styles.muted}>Étape actuelle</div>
            </div>
            <span style={{ background: '#19bd7b', borderRadius: 6, padding: '7px 13px', fontSize: 12, fontWeight: 700, color: '#fff' }}>{data.pipelineStage ? 'Active' : 'En attente'}</span>
          </div>
          {stages.map((stage, idx) => {
            const completed = idx < stageIndex;
            const current = idx === stageIndex;
            return (
              <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', opacity: current ? 1 : (completed ? 0.6 : 0.35) }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: current ? '#28d28b' : completed ? '#21ca88' : '#708176', color: '#fff', textAlign: 'center', lineHeight: '22px', fontSize: 12, flexShrink: 0 }}>{completed ? '✓' : idx + 1}</span>
                <div>
                  <div style={{ fontWeight: 600, color: current ? '#e8ede4' : '#aaa', fontSize: 14 }}>{(stageLabels[stage] || stage) + (current ? ' (actuelle)' : '')}</div>
                  <div style={{ fontSize: 12, color: '#777' }}>{stageLabels[stage] || stage}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <style>{`@media (max-width:900px){.client-dashboard-top{grid-template-columns:1fr!important}.client-dashboard-middle{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
};

export default DashboardSection;
