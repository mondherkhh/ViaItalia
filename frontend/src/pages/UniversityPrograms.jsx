import React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import universityProgramService from '../api/universityProgramService';
import admissionsSyncService from '../api/admissionsSyncService';

const Page=styled.div`color:#f7fbff;padding:1.35rem 1.5rem 2rem;min-height:100%;background:#10121b;`;
const Header=styled.div`display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap;margin-bottom:1.25rem;`;
const Actions=styled.div`display:flex;gap:.65rem;align-items:center;flex-wrap:wrap;`;
const Button=styled.button`border:0;border-radius:10px;padding:.75rem 1.05rem;background:#16bd62;color:white;font-weight:800;cursor:pointer;&:disabled{opacity:.55;cursor:wait}`;
const Secondary=styled(Button)`background:#182334;border:1px solid rgba(255,255,255,.13);`;
const Panel=styled.div`background:rgba(7,18,31,.76);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:1rem;`;
const Filters=styled.div`display:grid;grid-template-columns:minmax(250px,2fr) repeat(3,1fr) auto;gap:.7rem;align-items:end;margin-bottom:1rem;@media(max-width:900px){grid-template-columns:1fr 1fr}@media(max-width:650px){grid-template-columns:1fr}`;
const Field=styled.label`display:flex;flex-direction:column;gap:.35rem;color:#9eb1c6;font-size:.72rem;text-transform:uppercase;font-weight:700;`;
const Input=styled.input`box-sizing:border-box;background:#111d2d;color:white;border:1px solid rgba(255,255,255,.16);border-radius:9px;padding:.75rem .9rem;outline:none;`;
const Select=styled.select`
  box-sizing: border-box;
  width: 100%;
  min-height: 42px;
  background: #111d2d;
  color: #f7fbff;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 9px;
  padding: 0.75rem 2.35rem 0.75rem 0.9rem;
  outline: none;
  cursor: pointer;
  font: inherit;
  appearance: none;
  color-scheme: dark;
  background-image:
    linear-gradient(45deg, transparent 50%, #9eb1c6 50%),
    linear-gradient(135deg, #9eb1c6 50%, transparent 50%);
  background-position:
    calc(100% - 18px) 18px,
    calc(100% - 13px) 18px;
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    border-color: rgba(32, 201, 120, 0.65);
  }

  &:focus {
    border-color: #20c978;
    box-shadow: 0 0 0 3px rgba(32, 201, 120, 0.14);
  }

  option {
    background: #111d2d;
    color: #f7fbff;
  }
`;

const TableWrap=styled.div`overflow:auto;border:1px solid rgba(255,255,255,.08);border-radius:12px;`;
const Table=styled.table`width:100%;border-collapse:collapse;min-width:1450px;th,td{text-align:left;padding:.9rem .8rem;border-bottom:1px solid rgba(255,255,255,.07);font-size:.84rem;vertical-align:top}th{color:#9eb1c6;font-size:.72rem;text-transform:uppercase;background:rgba(255,255,255,.025)}a{color:#70e69e}.muted{color:#9eb1c6;font-size:.76rem}`;
const WindowBox=styled.div`min-width:390px;padding:.7rem;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08);border-radius:10px;margin-bottom:.5rem;`;
const Badge=styled.span`display:inline-block;border-radius:999px;padding:.22rem .5rem;margin:.1rem;background:${p=>p.$blue?'rgba(40,136,255,.16)':'rgba(19,184,92,.15)'};color:${p=>p.$blue?'#75b9ff':'#73e6a4'};font-size:.75rem;`;
const ModalOverlay=styled.div`position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:1rem;background:rgba(0,0,0,.76);`;
const ModalCard=styled.div`width:min(720px,100%);max-height:86vh;overflow-y:auto;padding:1.35rem;border-radius:16px;background:#101c2b;border:1px solid rgba(255,255,255,.14);color:#f7fbff;`;
const Quote=styled.blockquote`margin:1rem 0;padding:.9rem 1rem;border-left:3px solid #20c978;background:rgba(255,255,255,.04);line-height:1.65;`;
const date=v=>v?new Date(v).toLocaleDateString('fr-FR'):'À vérifier';
const href=e=>{if(!e?.sourceUrl)return null;if(e.sourceIsPdf&&e.pageNumber)return `${e.sourceUrl}#page=${e.pageNumber}`;const t=String(e.matchedText||'').replace(/\s+/g,' ').trim().slice(0,140);return t?`${e.sourceUrl}#:~:text=${encodeURIComponent(t)}`:e.sourceUrl;};
const windowsOf=p=>Array.isArray(p.admissionWindows)&&p.admissionWindows.length?p.admissionWindows:(p.openingDate||p.closingDate||p.applicationFee)?[{label:'Fenêtre sélectionnée',openingDate:p.openingDate,closingDate:p.closingDate,applicationFee:p.applicationFee,openingEvidence:p.openingEvidence,closingEvidence:p.closingEvidence,feeEvidence:p.feeEvidence,sourceUrl:p.sourceUrl}]:[];

function EvidenceModal({e,onClose}){if(!e)return null;return <ModalOverlay onClick={onClose}><ModalCard onClick={x=>x.stopPropagation()}><div style={{display:'flex',justifyContent:'space-between'}}><h2 style={{marginTop:0}}>Preuve officielle</h2><Button onClick={onClose}>Fermer</Button></div><p><strong>Champ :</strong> {e.field||'—'}</p><p><strong>Valeur :</strong> {e.value||'—'}</p><p><strong>Confiance :</strong> {Math.round((Number(e.confidence)||0)*100)}%</p><Quote>{e.matchedText||'Aucun extrait enregistré.'}</Quote>{href(e)&&<a href={href(e)} target="_blank" rel="noreferrer">Ouvrir la source officielle au texte exact</a>}</ModalCard></ModalOverlay>}
function EvidenceAction({e,onOpen}){if(!e)return <span className="muted">Preuve indisponible</span>;return <span><button type="button" onClick={()=>onOpen(e)} style={{background:'rgba(19,184,92,.14)',color:'#8eeab0',border:'1px solid rgba(112,230,158,.5)',borderRadius:7,padding:'.3rem .45rem',cursor:'pointer'}}>Voir preuve · {Math.round((Number(e.confidence)||0)*100)}%</button>{href(e)&&<><br/><a href={href(e)} target="_blank" rel="noreferrer" style={{fontSize:'.72rem'}}>Ouvrir source</a></>}</span>}

export default function UniversityPrograms(){
 const [programs,setPrograms]=useState([]),[facets,setFacets]=useState({fields:[],levels:[],languages:[]}),[search,setSearch]=useState(''),[field,setField]=useState('ALL'),[level,setLevel]=useState('ALL'),[language,setLanguage]=useState('ALL'),[loading,setLoading]=useState(false),[syncing,setSyncing]=useState(false),[progress,setProgress]=useState(null),[message,setMessage]=useState(''),[selected,setSelected]=useState(null); const timer=useRef(null);
 const load=useCallback(async(silent=false)=>{if(!silent)setLoading(true);try{const [r,facetResponse]=await Promise.all([universityProgramService.list({search,field,level,language,page:1,pageSize:100}),universityProgramService.list({search:'',field:'ALL',level:'ALL',language:'ALL',page:1,pageSize:100})]);setPrograms(Array.isArray(r.data?.data)?r.data.data:[]);const meta=facetResponse.data?.meta||{};setFacets({fields:Array.isArray(meta.fields)?meta.fields:[],levels:Array.isArray(meta.levels)?meta.levels:[],languages:Array.isArray(meta.languages)?meta.languages:[]});}catch(e){setMessage(e.response?.data?.message||'Impossible de charger les programmes.');}finally{if(!silent)setLoading(false);}},[search,field,level,language]);
 useEffect(()=>{load();},[load]);useEffect(()=>()=>timer.current&&clearInterval(timer.current),[]);
 const sync=async()=>{if(timer.current)clearInterval(timer.current);setSyncing(true);setMessage('Synchronisation depuis les liens officiels directs…');try{const r=await admissionsSyncService.start(field==='ALL'?'ALL':field),id=r.data?.data?.id;if(!id)throw new Error('Identifiant de synchronisation manquant.');const poll=async()=>{const s=await admissionsSyncService.status(id),j=s.data?.data||{};setProgress(j);if(['completed','failed','cancelled'].includes(j.status)){clearInterval(timer.current);timer.current=null;setSyncing(false);setMessage(`${j.updated||0} programmes enrichis. ${j.skipped||0} sans information officielle.`);await load(true);}};await poll();timer.current=setInterval(()=>poll().catch(()=>{clearInterval(timer.current);timer.current=null;setSyncing(false);setMessage('Impossible de lire la progression.');}),2000);}catch(e){setSyncing(false);setMessage(e.response?.data?.message||e.message||'Échec de la synchronisation.');}};
 const stats=useMemo(()=>({p:programs.length,u:new Set(programs.map(x=>x.university)).size,w:programs.reduce((n,p)=>n+windowsOf(p).length,0),o:programs.filter(p=>windowsOf(p).some(w=>w.closingDate&&new Date(w.closingDate)>=new Date())).length}),[programs]);
 const fields=facets.fields,levels=facets.levels,languages=facets.languages;
 return <Page><EvidenceModal e={selected} onClose={()=>setSelected(null)}/><Header><div><h1>University Programs</h1><p style={{color:'#9eb1c6'}}>Toutes les fenêtres d’admission 2026/27 avec preuves officielles directes.</p></div><Actions><Secondary onClick={()=>load()} disabled={loading}>Rechercher</Secondary><Button onClick={sync} disabled={syncing}>{syncing?'Synchronisation…':'＋ Rechercher dates et frais'}</Button></Actions></Header><div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'.8rem',marginBottom:'1rem'}}><Panel>Programmes<br/><strong>{stats.p}</strong></Panel><Panel>Universités<br/><strong>{stats.u}</strong></Panel><Panel>Fenêtres trouvées<br/><strong>{stats.w}</strong></Panel><Panel>Fenêtres ouvertes<br/><strong>{stats.o}</strong></Panel></div><Panel><Filters><Field>Recherche<Input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&load()} placeholder="Domaine, université ou programme…"/></Field><Field>Domaine<Select value={field} onChange={e=>setField(e.target.value)}><option value="ALL">Tous</option>{fields.map(x=><option key={x} value={x}>{x}</option>)}</Select></Field><Field>Niveau<Select value={level} onChange={e=>setLevel(e.target.value)}><option value="ALL">Tous</option>{levels.map(x=><option key={x} value={x}>{x}</option>)}</Select></Field><Field>Langue<Select value={language} onChange={e=>setLanguage(e.target.value)}><option value="ALL">Toutes</option>{languages.map(x=><option key={x} value={x}>{x}</option>)}</Select></Field><Button onClick={()=>{setSearch('');setField('ALL');setLevel('ALL');setLanguage('ALL');}}>Réinitialiser</Button></Filters>{progress&&<div style={{color:'#8eeab0',marginBottom:'1rem'}}>{progress.currentUniversity||'Recherche officielle…'} — {progress.progress||0}%<div style={{height:8,background:'#1b2935',borderRadius:20,overflow:'hidden'}}><div style={{height:'100%',width:`${progress.progress||0}%`,background:'#20c978'}}/></div></div>}{message&&<p style={{color:message.includes('Échec')||message.includes('Impossible')?'#ff9b9b':'#8eeab0'}}>{message}</p>}<TableWrap>{loading?<p style={{padding:'2rem'}}>Chargement…</p>:<Table><thead><tr><th>Université / programme</th><th>Domaine</th><th>Niveau / langue</th><th>Toutes les fenêtres</th><th>Source programme</th></tr></thead><tbody>{programs.map(p=><tr key={p.id}><td><strong>{p.university}</strong><br/><span className="muted">{p.programName}</span></td><td>{p.field}</td><td>{p.level||'—'}<br/><Badge $blue>{p.language||'—'}</Badge></td><td>{windowsOf(p).length?windowsOf(p).map((w,i)=><WindowBox key={`${w.id||i}-${w.openingDate}`}><strong>{w.label||`Call ${i+1}`}</strong>{w.placesType&&<Badge>{w.placesType}</Badge>}{w.callNumber&&<Badge $blue>Call {w.callNumber}</Badge>}<div>{date(w.openingDate)} → {date(w.closingDate)}</div><div>Frais : <strong>{w.applicationFee||'À vérifier'}</strong></div><div style={{display:'flex',gap:'.45rem',flexWrap:'wrap',alignItems:'center'}}>Ouverture <EvidenceAction e={w.openingEvidence} onOpen={setSelected}/> Fermeture <EvidenceAction e={w.closingEvidence} onOpen={setSelected}/> Frais <EvidenceAction e={w.feeEvidence} onOpen={setSelected}/></div></WindowBox>):<span className="muted">Aucune preuve officielle 2026/27</span>}{p.additionalEnrollmentFee&&<div style={{marginTop:'.55rem',paddingTop:'.45rem',borderTop:'1px solid rgba(255,255,255,.08)'}}>Frais d’inscription additionnels : <strong>{p.additionalEnrollmentFee}</strong>{p.additionalEnrollmentFeeEvidence?.period&&<span className="muted"> · période : {p.additionalEnrollmentFeeEvidence.period}</span>}<br/><EvidenceAction e={p.additionalEnrollmentFeeEvidence} onOpen={setSelected}/></div>}</td><td>{p.sourceUrl?<a href={p.sourceUrl} target="_blank" rel="noreferrer">Lien officiel direct</a>:<span className="muted">À vérifier</span>}</td></tr>)}</tbody></Table>}</TableWrap></Panel></Page>;
}
