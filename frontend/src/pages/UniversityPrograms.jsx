import React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import universityProgramService from '../api/universityProgramService';
import admissionsSyncService from '../api/admissionsSyncService';

const Page = styled.div`
  min-height: 100%;
  padding: 1.5rem;
  background: #10121b;
  color: #f7fbff;

  @media (max-width: 650px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.35rem;

  h1 {
    margin: 0;
    color: #f7fbff;
    font-size: clamp(1.45rem, 2.5vw, 2rem);
    font-weight: 800;
  }

  p {
    margin: .35rem 0 0;
    color: #9eb1c6;
    font-size: .9rem;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: .65rem;
  align-items: center;
  flex-wrap: wrap;
`;

const Button = styled.button`
  border: 1px solid transparent;
  border-radius: 10px;
  padding: .7rem 1rem;
  background: #16bd62;
  color: #f7fbff;
  font-weight: 800;
  cursor: pointer;
  transition: .2s ease;

  &:hover { background: #109c52; transform: translateY(-1px); }
  &:disabled { opacity: .55; cursor: wait; transform: none; }
`;

const Secondary = styled(Button)`
  background: white;
  color: #73e6a4;
  border-color: rgba(255,255,255,.13);

  &:hover { background: rgba(19,184,92,.15); color: #0b6848; }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: .85rem;
  margin-bottom: 1rem;

  @media (max-width: 850px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;

const StatCard = styled.div`
  min-height: 92px;
  padding: 1rem 1.1rem;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 15px;
  background: rgba(7,18,31,.76);
  box-shadow: 0 7px 22px rgba(29, 52, 75, .05);

  span { display: block; color: #9eb1c6; font-size: .78rem; font-weight: 700; }
  strong { display: block; margin-top: .35rem; color: #f7fbff; font-size: 1.65rem; }
`;

const FilterPanel = styled.div`
  margin-bottom: 1.25rem;
  padding: 1rem;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 16px;
  background: rgba(7,18,31,.76);
  box-shadow: 0 7px 22px rgba(29, 52, 75, .05);
`;

const Filters = styled.div`
  display: grid;
  grid-template-columns: minmax(240px, 2fr) repeat(3, minmax(130px, 1fr)) auto;
  gap: .7rem;
  align-items: end;

  @media (max-width: 1050px) { grid-template-columns: 2fr 1fr 1fr; }
  @media (max-width: 650px) { grid-template-columns: 1fr; }
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: .38rem;
  color: #9eb1c6;
  font-size: .7rem;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: .04em;
`;

const Input = styled.input`
  width: 100%;
  min-height: 43px;
  box-sizing: border-box;
  background: rgba(7,18,31,.76);
  color: #f7fbff;
  border: 1px solid rgba(255,255,255,.16);
  border-radius: 10px;
  padding: .72rem .85rem;
  outline: none;
  font-size: .88rem;

  &:focus { border-color: #20c978; box-shadow: 0 0 0 3px rgba(22,163,107,.12); }
`;

const Select = styled.select`
  width: 100%;
  min-height: 43px;
  box-sizing: border-box;
  appearance: none;
  background: rgba(7,18,31,.76);
  color: #f7fbff;
  border: 1px solid rgba(255,255,255,.16);
  border-radius: 10px;
  padding: .72rem 2rem .72rem .85rem;
  outline: none;
  cursor: pointer;
  font: inherit;
  background-image: linear-gradient(45deg, transparent 50%, #9eb1c6 50%), linear-gradient(135deg, #9eb1c6 50%, transparent 50%);
  background-position: calc(100% - 15px) 18px, calc(100% - 10px) 18px;
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;

  &:focus { border-color: #20c978; box-shadow: 0 0 0 3px rgba(22,163,107,.12); }
  option { background: rgba(7,18,31,.76); color: #f7fbff; }
`;

const ProgramsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 1180px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 700px) { grid-template-columns: 1fr; }
`;

const ProgramCard = styled.article`
  min-width: 0;
  padding: 1.35rem;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 18px;
  background: rgba(7,18,31,.76);
  box-shadow: 0 9px 25px rgba(29, 52, 75, .06);
  transition: transform .2s ease, box-shadow .2s ease;

  &:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(29, 52, 75, .10); }
`;

const CardTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: .7rem;
  align-items: flex-start;
`;

const University = styled.h2`
  margin: 0;
  color: #f7fbff;
  font-size: 1.12rem;
  line-height: 1.3;
`;

const ProgramName = styled.p`
  margin: .35rem 0 0;
  color: #9eb1c6;
  font-size: .82rem;
  line-height: 1.45;
`;

const Status = styled.span`
  flex: 0 0 auto;
  padding: .42rem .65rem;
  border: 1px solid #d9e7df;
  border-radius: 999px;
  background: rgba(255,255,255,.04);
  color: #73e6a4;
  font-size: .72rem;
  font-weight: 800;
`;

const Meta = styled.div`
  display: grid;
  gap: .42rem;
  margin-top: 1rem;
  color: #9eb1c6;
  font-size: .84rem;

  strong { color: #27384d; }
`;

const DateLine = styled.div`
  display: flex;
  gap: .45rem;
  align-items: center;
  margin-top: 1rem;
  padding-top: .9rem;
  border-top: 1px solid rgba(255,255,255,.07);
  color: #f7fbff;
  font-size: .88rem;
  font-weight: 700;

  &::before { content: '▣'; color: #16bd62; font-size: 1rem; }
`;

const WindowList = styled.div`
  display: grid;
  gap: .7rem;
  margin-top: .95rem;
`;

const WindowBox = styled.div`
  padding: .78rem;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 11px;
  background: rgba(255,255,255,.035);
  color: #9eb1c6;
  font-size: .78rem;
  line-height: 1.55;

  strong { color: #f7fbff; }
  a { color: #0e8a5a; }
`;

const Badge = styled.span`
  display: inline-block;
  margin: .1rem;
  padding: .2rem .48rem;
  border-radius: 999px;
  background: ${p => p.$blue ? 'rgba(40,136,255,.16)' : 'rgba(19,184,92,.15)'};
  color: ${p => p.$blue ? '#75b9ff' : '#73e6a4'};
  font-size: .72rem;
  font-weight: 700;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: .6rem;
  margin-top: 1rem;
  padding-top: .85rem;
  border-top: 1px solid rgba(255,255,255,.07);

  a { color: #0e8a5a; font-size: .8rem; font-weight: 800; }
`;

const TableWrap = styled.div`padding: 1.2rem; border: 1px solid rgba(255,255,255,.1); border-radius: 16px; background: rgba(7,18,31,.76); box-shadow: 0 7px 22px rgba(29, 52, 75, .05);`;
const ModalOverlay = styled.div`position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:1rem;background:rgba(15,23,42,.48);`;
const ModalCard = styled.div`width:min(720px,100%);max-height:86vh;overflow-y:auto;padding:1.35rem;border-radius:16px;background:rgba(7,18,31,.76);border:1px solid rgba(255,255,255,.1);color:#f7fbff;box-shadow:0 24px 70px rgba(15,23,42,.22);`;
const Quote = styled.blockquote`margin:1rem 0;padding:.9rem 1rem;border-left:3px solid #20c978;background:rgba(255,255,255,.04);line-height:1.65;color:#9eb1c6;`;

const date = v => v ? new Date(v).toLocaleDateString('fr-FR') : 'À vérifier';
const href = e => { if (!e?.sourceUrl) return null; if (e.sourceIsPdf && e.pageNumber) return `${e.sourceUrl}#page=${e.pageNumber}`; const t = String(e.matchedText || '').replace(/\s+/g, ' ').trim().slice(0, 140); return t ? `${e.sourceUrl}#:~:text=${encodeURIComponent(t)}` : e.sourceUrl; };
const windowsOf = p => Array.isArray(p.admissionWindows) && p.admissionWindows.length ? p.admissionWindows : (p.openingDate || p.closingDate || p.applicationFee) ? [{ label: 'Fenêtre sélectionnée', openingDate: p.openingDate, closingDate: p.closingDate, applicationFee: p.applicationFee, openingEvidence: p.openingEvidence, closingEvidence: p.closingEvidence, feeEvidence: p.feeEvidence, sourceUrl: p.sourceUrl }] : [];

function EvidenceModal({ e, onClose }) {
  if (!e) return null;
  return <ModalOverlay onClick={onClose}><ModalCard onClick={x => x.stopPropagation()}><div style={{display:'flex',justifyContent:'space-between',gap:'1rem',alignItems:'center'}}><h2 style={{marginTop:0}}>Preuve officielle</h2><Button onClick={onClose}>Fermer</Button></div><p><strong>Champ :</strong> {e.field || '—'}</p><p><strong>Valeur :</strong> {e.value || '—'}</p><p><strong>Confiance :</strong> {Math.round((Number(e.confidence) || 0) * 100)}%</p><Quote>{e.matchedText || 'Aucun extrait enregistré.'}</Quote>{href(e) && <a href={href(e)} target="_blank" rel="noreferrer">Ouvrir la source officielle au texte exact</a>}</ModalCard></ModalOverlay>;
}

function EvidenceAction({ e, onOpen }) {
  if (!e) return <span>Preuve indisponible</span>;
  return <span><button type="button" onClick={() => onOpen(e)} style={{background:'rgba(19,184,92,.15)',color:'#73e6a4',border:'1px solid #bfe1cf',borderRadius:7,padding:'.3rem .45rem',cursor:'pointer'}}>Voir preuve · {Math.round((Number(e.confidence) || 0) * 100)}%</button>{href(e) && <><br/><a href={href(e)} target="_blank" rel="noreferrer" style={{fontSize:'.72rem'}}>Ouvrir source</a></>}</span>;
}

export default function UniversityPrograms() {
  const [programs, setPrograms] = useState([]), [facets, setFacets] = useState({fields: [], levels: [], languages: []}), [search, setSearch] = useState(''), [field, setField] = useState('ALL'), [level, setLevel] = useState('ALL'), [language, setLanguage] = useState('ALL'), [loading, setLoading] = useState(false), [syncing, setSyncing] = useState(false), [progress, setProgress] = useState(null), [message, setMessage] = useState(''), [selected, setSelected] = useState(null);
  const timer = useRef(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [r, facetResponse] = await Promise.all([
        universityProgramService.list({search, field, level, language, page: 1, pageSize: 100}),
        universityProgramService.list({search: '', field: 'ALL', level: 'ALL', language: 'ALL', page: 1, pageSize: 100})
      ]);
      setPrograms(Array.isArray(r.data?.data) ? r.data.data : []);
      const meta = facetResponse.data?.meta || {};
      setFacets({fields: Array.isArray(meta.fields) ? meta.fields : [], levels: Array.isArray(meta.levels) ? meta.levels : [], languages: Array.isArray(meta.languages) ? meta.languages : []});
    } catch (e) {
      setMessage(e.response?.data?.message || 'Impossible de charger les programmes.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [search, field, level, language]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => () => timer.current && clearInterval(timer.current), []);

  const sync = async () => {
    if (timer.current) clearInterval(timer.current);
    setSyncing(true);
    setMessage('Synchronisation depuis les liens officiels directs…');
    try {
      const r = await admissionsSyncService.start(field === 'ALL' ? 'ALL' : field);
      const id = r.data?.data?.id;
      if (!id) throw new Error('Identifiant de synchronisation manquant.');
      const poll = async () => {
        const s = await admissionsSyncService.status(id);
        const j = s.data?.data || {};
        setProgress(j);
        if (['completed', 'failed', 'cancelled'].includes(j.status)) {
          clearInterval(timer.current); timer.current = null; setSyncing(false);
          setMessage(`${j.updated || 0} programmes enrichis. ${j.skipped || 0} sans information officielle.`);
          await load(true);
        }
      };
      await poll();
      timer.current = setInterval(() => poll().catch(() => { clearInterval(timer.current); timer.current = null; setSyncing(false); setMessage('Impossible de lire la progression.'); }), 2000);
    } catch (e) {
      setSyncing(false);
      setMessage(e.response?.data?.message || e.message || 'Échec de la synchronisation.');
    }
  };

  const stats = useMemo(() => ({
    p: programs.length,
    u: new Set(programs.map(x => x.university)).size,
    w: programs.reduce((n, p) => n + windowsOf(p).length, 0),
    o: programs.filter(p => windowsOf(p).some(w => w.closingDate && new Date(w.closingDate) >= new Date())).length
  }), [programs]);

  const fields = facets.fields, levels = facets.levels, languages = facets.languages;

  return <Page>
    <EvidenceModal e={selected} onClose={() => setSelected(null)} />
    <Header>
      <div><h1>University Programs</h1><p>Toutes les fenêtres d’admission 2026/27 avec preuves officielles directes.</p></div>
      <Actions><Secondary onClick={() => load()} disabled={loading}>Rechercher</Secondary><Button onClick={sync} disabled={syncing}>{syncing ? 'Synchronisation…' : '＋ Rechercher dates et frais'}</Button></Actions>
    </Header>

    <StatsGrid>
      <StatCard><span>Programmes</span><strong>{stats.p}</strong></StatCard>
      <StatCard><span>Universités</span><strong>{stats.u}</strong></StatCard>
      <StatCard><span>Fenêtres trouvées</span><strong>{stats.w}</strong></StatCard>
      <StatCard><span>Fenêtres ouvertes</span><strong>{stats.o}</strong></StatCard>
    </StatsGrid>

    <FilterPanel>
      <Filters>
        <Field>Recherche<Input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} placeholder="Domaine, université ou programme…" /></Field>
        <Field>Domaine<Select value={field} onChange={e => setField(e.target.value)}><option value="ALL">Tous</option>{fields.map(x => <option key={x} value={x}>{x}</option>)}</Select></Field>
        <Field>Niveau<Select value={level} onChange={e => setLevel(e.target.value)}><option value="ALL">Tous</option>{levels.map(x => <option key={x} value={x}>{x}</option>)}</Select></Field>
        <Field>Langue<Select value={language} onChange={e => setLanguage(e.target.value)}><option value="ALL">Toutes</option>{languages.map(x => <option key={x} value={x}>{x}</option>)}</Select></Field>
        <Button onClick={() => { setSearch(''); setField('ALL'); setLevel('ALL'); setLanguage('ALL'); }}>Réinitialiser</Button>
      </Filters>
      {progress && <div style={{color:'#73e6a4',marginTop:'1rem'}}>{progress.currentUniversity || 'Recherche officielle…'} — {progress.progress || 0}%<div style={{height:8,background:'#1b2935',borderRadius:20,overflow:'hidden'}}><div style={{height:'100%',width:`${progress.progress || 0}%`,background:'#20c978'}} /></div></div>}
      {message && <p style={{marginTop:'1rem',color: message.includes('Échec') || message.includes('Impossible') ? '#c24141' : '#73e6a4'}}>{message}</p>}
    </FilterPanel>

    <TableWrap>
      {loading ? <p style={{padding:'2rem',color:'#9eb1c6'}}>Chargement…</p> : <ProgramsGrid>
        {programs.map(p => {
          const windows = windowsOf(p);
          const selectedWindow = windows[0];
          return <ProgramCard key={p.id}>
            <CardTop><div><University>{p.university}</University><ProgramName>{p.programName}</ProgramName></div><Status>{selectedWindow?.closingDate && new Date(selectedWindow.closingDate) >= new Date() ? 'Fenêtre ouverte' : 'À vérifier'}</Status></CardTop>
            <Meta><div><strong>Ville :</strong> {p.city || '—'}</div><div><strong>Domaine :</strong> {p.field || '—'}</div><div><strong>Niveau :</strong> {p.level || '—'} {p.language && <Badge $blue>{p.language}</Badge>}</div></Meta>
            {windows.length ? <WindowList>{windows.map((w, i) => <WindowBox key={`${w.id || i}-${w.openingDate}`}><strong>{w.label || `Call ${i + 1}`}</strong>{w.placesType && <Badge>{w.placesType}</Badge>}{w.callNumber && <Badge $blue>Call {w.callNumber}</Badge>}<DateLine>{date(w.openingDate)} → {date(w.closingDate)}</DateLine><div>Frais de candidature : <strong>{w.applicationFee || 'À vérifier'}</strong></div><div style={{display:'flex',gap:'.45rem',flexWrap:'wrap',alignItems:'center',marginTop:'.4rem'}}>Ouverture <EvidenceAction e={w.openingEvidence} onOpen={setSelected} /> Fermeture <EvidenceAction e={w.closingEvidence} onOpen={setSelected} /> Frais <EvidenceAction e={w.feeEvidence} onOpen={setSelected} /></div></WindowBox>)}</WindowList> : <p style={{marginTop:'1rem',color:'#9eb1c6',fontSize:'.82rem'}}>Aucune preuve officielle 2026/27.</p>}
            {p.additionalEnrollmentFee && <p style={{marginTop:'.7rem',color:'#9eb1c6',fontSize:'.8rem'}}>Frais d’inscription additionnels : <strong>{p.additionalEnrollmentFee}</strong></p>}
            <CardFooter>{p.sourceUrl ? <a href={p.sourceUrl} target="_blank" rel="noreferrer">Lien officiel direct ↗</a> : <span style={{color:'#9eb1c6',fontSize:'.8rem'}}>Source à vérifier</span>}</CardFooter>
          </ProgramCard>;
        })}
      </ProgramsGrid>}
    </TableWrap>
  </Page>;
}
