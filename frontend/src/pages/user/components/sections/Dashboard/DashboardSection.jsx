import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { useTheme } from '../../../../../contexts/ThemeContext';
import dashboardService from '../../../../../api/dashboardService';
import reviewService from '../../../../../api/reviewService';
import { getFinanceSummary } from '../../../../../services/financeService';
import { FiCreditCard, FiMessageSquare, FiFileText, FiTrendingUp } from 'react-icons/fi';

const money = value => `${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TND`;

// Couleurs par thème (appliquées comme variables CSS sur la racine de la page)
// En mode clair : couleurs plus foncées (lisibles sur fond blanc) + fonds teintés.
const THEME_VARS = {
  dark: {
    '--dash-card': '#111f2e',
    '--dash-border': 'rgba(255,255,255,.08)',
    '--dash-text': '#e8eef7',
    '--dash-muted': '#9fb3c8',
    '--dash-divider': 'rgba(255,255,255,.07)',
    '--dash-icon-bg': 'rgba(52,211,153,.14)',
    '--dash-accent': '#34d399',
    '--dash-soft': 'rgba(40,210,139,.10)',
    '--dash-shadow': '0 2px 12px rgba(0,0,0,.28)',
    '--dash-hover-shadow': '0 14px 32px rgba(0,0,0,.38)',

    '--green': '#28d28b',  '--green-soft': 'rgba(40,210,139,.14)',
    '--amber': '#f7c53a',  '--amber-soft': 'rgba(247,197,58,.14)',
    '--teal': '#45d899',   '--teal-soft': 'rgba(69,216,153,.14)',
    '--blue': '#60a5fa',   '--blue-soft': 'rgba(96,165,250,.14)',
    '--purple': '#a78bfa', '--purple-soft': 'rgba(167,139,250,.14)',
    '--red': '#fb7185',
    '--link': '#47a8ff',
  },
  light: {
    '--dash-card': '#ffffff',
    '--dash-border': '#e3e9e5',
    '--dash-text': '#111827',
    '--dash-muted': '#5b6873',
    '--dash-divider': 'rgba(17,24,39,.07)',
    '--dash-icon-bg': 'rgba(76,175,80,.12)',
    '--dash-accent': '#2e7d32',
    '--dash-soft': 'rgba(22,163,74,.10)',
    '--dash-shadow': '0 1px 3px rgba(16,24,40,.06), 0 8px 24px rgba(16,24,40,.05)',
    '--dash-hover-shadow': '0 14px 30px rgba(16,24,40,.12)',

    '--green': '#15803d',  '--green-soft': 'rgba(22,163,74,.14)',
    '--amber': '#b45309',  '--amber-soft': 'rgba(245,158,11,.18)',
    '--teal': '#0f766e',   '--teal-soft': 'rgba(20,184,166,.16)',
    '--blue': '#2563eb',   '--blue-soft': 'rgba(59,130,246,.14)',
    '--purple': '#7c3aed', '--purple-soft': 'rgba(139,92,246,.14)',
    '--red': '#dc2626',
    '--link': '#2563eb',
  },
};

const styles = {
  page: { color: 'var(--dash-text)', minHeight: 'calc(100vh - 100px)', padding: '0 0 2rem' },
  grid: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 16, marginBottom: 16 },
  card: {
    background: 'var(--dash-card)',
    color: 'var(--dash-text)',
    border: '1px solid var(--dash-border)',
    borderRadius: 16,
    boxShadow: 'var(--dash-shadow)',
    overflow: 'hidden',
    transition: 'transform .25s ease, box-shadow .25s ease',
  },
  cardHeader: { padding: '14px 18px', borderBottom: '1px solid var(--dash-divider)', display: 'flex', alignItems: 'center', gap: 10 },
  icon: { width: 32, height: 32, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'var(--acc-soft, var(--dash-icon-bg))', color: 'var(--acc, var(--dash-accent))', fontSize: 17, flexShrink: 0 },
  title: { fontSize: 12.5, fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--dash-muted)' },
  body: { padding: '18px 20px', minHeight: 64 },
  muted: { color: 'var(--dash-muted)', fontSize: 13, fontStyle: 'normal' },
  item: { display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 18px', borderBottom: '1px solid var(--dash-divider)' },
};

const stat = { fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 2 };

// accent : 'green' | 'amber' | 'teal' | 'blue' | 'purple'
const Panel = ({ icon, title, children, style = {}, accent = 'green' }) => {
  const { theme } = useTheme();
  const light = theme === 'light';
  return (
    <section
      className="dash-panel"
      style={{
        ...styles.card,
        '--acc': `var(--${accent})`,
        '--acc-soft': `var(--${accent}-soft)`,
        // Mode clair : bandeau de couleur en haut de la carte
        ...(light ? { borderTop: '3px solid var(--acc)' } : {}),
        ...style,
      }}
    >
      <div
        style={{
          ...styles.cardHeader,
          // Mode clair : léger fond teinté dans l'en-tête
          ...(light ? { background: 'linear-gradient(180deg, var(--acc-soft) 0%, transparent 100%)' } : {}),
        }}
      >
        <span style={styles.icon}>{icon}</span>
        <h2 style={styles.title}>{title}</h2>
      </div>
      {children}
    </section>
  );
};

const DashboardSection = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const themeVars = THEME_VARS[theme === 'light' ? 'light' : 'dark'];
  const [data, setData] = useState({ payment: null, payments: [], agreedFees: 0, dossier: null, messages: [] });
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

        // Frais convenus : même notion que côté admin (agreedFees).
        const agreedFeesRaw =
          payload.agreedFees ??
          payload.dossier?.agreedFees ??
          payload.contract?.agreedFees ??
          payload.user?.agreedFees ??
          user?.agreedFees ??
          0;

        // Si l'API ne renvoie pas agreedFees : total prévu = paiements PAID + PENDING
        const plannedTotal = payments
          .filter(p => p.status === 'PAID' || p.status === 'PENDING')
          .reduce((s, p) => s + (Number(p.amount) || 0), 0);

        const agreedFees = Number(agreedFeesRaw) || plannedTotal;

        setData({
          // Dernier paiement réellement encaissé (PAID)
          payment: [...payments]
            .filter(p => p.status === 'PAID')
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null,
          payments,
          agreedFees,
          dossier: payload.dossier || null,
          contract: payload.contract || null,
          pipelineStage: payload.pipelineStage || (payload.dossier ? (payload.dossier.status === 'VALIDATED' ? 'Choice locked' : payload.dossier.status === 'PENDING' ? 'Invited' : 'Onboarded') : 'Invited'),
          documentsValidated: payload.documentsValidated ?? (payload.counts?.documents || 0),
          documentsMissing: payload.documentsMissing ?? 0,
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

  // Même règle que l'admin : source unique getFinanceSummary
  const totals = useMemo(() => {
    const summary = getFinanceSummary(data.payments, data.agreedFees);
    return {
      totalDue: summary.agreedFees,
      paid: summary.collected,
      remaining: summary.outstanding,
    };
  }, [data.payments, data.agreedFees]);

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

  if (loading) return <div style={{ ...themeVars, color: 'var(--dash-muted)', padding: 32 }}>Chargement du tableau de bord...</div>;
  if (error) return (
    <div style={{ color: '#fb7185', padding: 32, background: 'rgba(251,113,133,.08)', border: '1px solid rgba(251,113,133,.25)', borderRadius: 12 }}>
      <div style={{ marginBottom: 12 }}>{error}</div>
      <button onClick={handleRetry} style={{ background: '#16bd62', color: '#fff', border: 0, borderRadius: 7, padding: '10px 18px', fontWeight: 700, cursor: 'pointer' }}>Réessayer</button>
    </div>
  );

  return (
    <div style={{ ...styles.page, ...themeVars }}>
      <h1 style={{ fontSize: 26, margin: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>Tableau de bord</h1>
      <div style={{ color: 'var(--dash-muted)', fontSize: 13, margin: '4px 0 20px' }}>Tableau de bord <span style={{ padding: '0 8px', opacity: 0.5 }}>›</span> Vue d'ensemble</div>

      <div className="client-dashboard-keys" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 16 }}>
        <Panel accent="green" icon={<FiTrendingUp aria-hidden="true" />} title="Étape actuelle">
          <div style={styles.body}>
            <div style={{ ...stat, color: 'var(--green)' }}>{data.pipelineStage || '—'}</div>
            <div style={styles.muted}>{data.dossier ? `Statut du dossier` : 'Aucun dossier'}</div>
          </div>
        </Panel>
        <Panel accent="amber" icon={<FiFileText aria-hidden="true" />} title="À faire">
          <div style={styles.body}>
            <div style={{ ...stat, color: 'var(--amber)' }}>{data.documentsMissing ?? 0}</div>
            <div style={styles.muted}>Document(s) manquant(s)</div>
            <div style={{ marginTop: 10 }}>
              <a href="#" style={{ color: 'var(--link)', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>Voir mon dossier →</a>
            </div>
          </div>
        </Panel>
        <Panel accent="teal" icon={<FiCreditCard aria-hidden="true" />} title="Payé / Restant">
          <div style={styles.body}>
            <div style={{ ...stat, color: 'var(--teal)' }}>{money(totals.paid)}</div>
            <div style={styles.muted}>Restant dû : <b style={{ color: 'var(--red)' }}>{money(totals.remaining)}</b></div>
          </div>
        </Panel>
        <Panel accent="blue" icon={<FiMessageSquare aria-hidden="true" />} title="Messages">
          <div style={styles.body}>
            <div style={{ ...stat, color: 'var(--blue)' }}>{data.unreadMessages ?? 0}</div>
            <div style={styles.muted}>Non lus de l'équipe</div>
          </div>
        </Panel>
      </div>

      <div className="client-dashboard-top" style={styles.grid}>
        <Panel accent="amber" icon={<FiCreditCard aria-hidden="true" />} title="Paiement">
          <div style={{ ...styles.body, minHeight: 120 }}>
            {data.payment ? <><div style={{ ...stat, fontSize: 30, color: 'var(--amber)' }}>{money(data.payment.amount ?? data.payment.prixPaye)}</div><div style={styles.muted}>Dernier paiement enregistré</div><div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--dash-divider)', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span>Total payé</span><b style={{ color: 'var(--teal)' }}>{money(totals.paid)}</b></div></> : <div style={styles.muted}>Aucun paiement trouvé</div>}
          </div>
        </Panel>
      </div>

      <div className="client-dashboard-middle" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Panel accent="blue" icon={<FiMessageSquare aria-hidden="true" />} title="Messages"><div style={{ minHeight: 72 }}>{data.messages.length ? data.messages.slice(0, 3).map(item => <div style={styles.item} key={item.id}><span aria-hidden="true" style={{ color: 'var(--blue)' }}><FiMessageSquare /></span><div><strong>{item.sender === 'ADMIN' ? "L'équipe" : (item.sender === 'USER' ? 'Vous' : '—')}</strong> <span style={{fontSize:10,color:'var(--dash-muted)'}}>{(item.content || item.message || '').slice(0,60)}{(item.content || item.message || '').length>60?'...':''}</span><div style={{marginTop:2}}><span style={{fontSize:11,color:'var(--dash-muted)'}}>{item.createdAt ? new Date(item.createdAt).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) : '-'}</span></div></div></div>) : <div style={{ ...styles.body, ...styles.muted }}>Aucun message reçu</div>}<div style={{padding:'6px 18px 12px'}}><a href="#" style={{fontSize:11,color:'var(--link)',fontWeight:600}}>Voir la messagerie →</a></div></div></Panel>
        <Panel accent="purple" icon={<FiFileText aria-hidden="true" />} title="Contrat">
          <div style={styles.body}>
            {data.contract ? (
              <>
                <strong>Contrat disponible</strong>
                <div style={{ ...styles.muted, marginTop: 8 }}>Statut : {data.contract.status || 'En cours'}</div>
                <a href="#" style={{ display: 'inline-block', marginTop: 10, color: 'var(--link)', fontWeight: 600, fontSize: 13 }}>Accéder au contrat →</a>
              </>
            ) : (
              <div style={{ ...styles.muted }}>Aucun contrat enregistré</div>
            )}
          </div>
        </Panel>
      </div>

      <Panel accent="green" icon={<FiTrendingUp aria-hidden="true" />} title="Mon parcours" style={{ marginBottom: 16 }}>
        <div style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--dash-soft)', border: '1px solid var(--dash-border)', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--green)' }}>{stageLabels[data.pipelineStage] || data.pipelineStage || '—'}</div>
              <div style={styles.muted}>Étape actuelle</div>
            </div>
            <span style={{ background: '#19bd7b', borderRadius: 999, padding: '6px 14px', fontSize: 12, fontWeight: 700, color: '#fff' }}>{data.pipelineStage ? 'Active' : 'En attente'}</span>
          </div>
          {stages.map((stage, idx) => {
            const completed = idx < stageIndex;
            const current = idx === stageIndex;
            return (
              <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 0', opacity: current ? 1 : (completed ? 0.6 : 0.35) }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: current ? 'var(--green)' : completed ? '#21ca88' : '#708176', color: '#fff', textAlign: 'center', lineHeight: '24px', fontSize: 12, fontWeight: 700, flexShrink: 0, boxShadow: current ? '0 0 0 4px var(--green-soft)' : 'none' }}>{completed ? '✓' : idx + 1}</span>
                <div>
                  <div style={{ fontWeight: 600, color: current ? 'var(--dash-text)' : 'var(--dash-muted)', fontSize: 14 }}>{(stageLabels[stage] || stage) + (current ? ' (actuelle)' : '')}</div>
                  <div style={{ fontSize: 12, color: 'var(--dash-muted)' }}>{stageLabels[stage] || stage}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <style>{`@media (max-width:900px){.client-dashboard-top{grid-template-columns:1fr!important}.client-dashboard-middle{grid-template-columns:1fr!important}}.dash-panel:hover{transform:translateY(-2px);box-shadow:var(--dash-hover-shadow)}@media (prefers-reduced-motion:reduce){.dash-panel{transition:none!important}.dash-panel:hover{transform:none}}`}</style>
    </div>
  );
};

export default DashboardSection;