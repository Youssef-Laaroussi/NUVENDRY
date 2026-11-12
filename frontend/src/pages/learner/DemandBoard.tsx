import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Bookmark, Calendar, CheckCircle2, ChevronRight, Flame, Grid, Hourglass, Layers, Lightbulb, List, MessageCircle, Monitor, Clock, Plus, Search, Users } from 'lucide-react';
import type { LearningDemand } from '../../types';
import { useAuth } from '../../context/AuthContext';
import './DemandBoard.css';

const statuses = ['All Demands', 'In Review', 'Approved', 'Converted', 'Not Approved'];
const examples = [
  { title:'MLOps', status:'Converted', note:'Workshop Live', text:'End-to-end MLOps: model lifecycle, deployment, monitoring, and best practices.', tags:['MLOps','Deployment','Monitoring'], interest:126, comments:24 },
  { title:'LangGraph', status:'Approved', note:'Planned · Target: Dec 2026', text:'Build stateful, tool-using AI agents with LangGraph, LangChain, and real use cases.', tags:['Agents','LangGraph','LangChain'], interest:94, comments:17 },
  { title:'Spatial Data Science', status:'In Review', note:'Under Review · Est. 3–5 days', text:'Work with geospatial data, raster/vector analysis, and real-world spatial use cases.', tags:['Geospatial','GIS','Python'], interest:73, comments:12 },
  { title:'AI Security', status:'In Review', note:'Under Review · Est. 3–5 days', text:'Secure and robust AI systems: threats, model risks, guardrails, and best practices.', tags:['AI Safety','Security','Governance'], interest:68, comments:9 },
  { title:'React + FastAPI', status:'Approved', note:'Planned · Target: Nov 2026', text:'Build full-stack AI-enabled applications with React (frontend) and FastAPI (backend).', tags:['React','FastAPI','Full-Stack'], interest:118, comments:26 },
  { title:'Full-Stack AI Apps with React & FastAPI', status:'Converted', note:'Workshop Live', text:'A hands-on build of a production-ready AI app using React and FastAPI.', tags:['React','FastAPI','AI Apps'], interest:142, comments:31 },
];
// Additional requests in the demo account, ordered from newest to oldest.
const demoRequests: [string, number, string][] = [
  ['Model Drift Monitoring',0,'Approved'], ['Geospatial Forecasting',2,'In Review'],
  ['Agent Tool Calling',1,'Converted'], ['FastAPI Authentication',4,'Approved'],
  ['Threat Modeling for AI',3,'In Review'], ['React Query Fundamentals',4,'Converted'],
  ['Model Deployment with Kubernetes',0,'Approved'], ['Satellite Image Analysis',2,'Approved'],
  ['Agent Evaluation',1,'In Review'], ['Secure Inference APIs',3,'Converted'],
  ['React Dashboard Design',4,'Approved'], ['Building a Model Registry',0,'Converted'],
  ['GIS Data Pipelines',2,'Approved'], ['Multi-Agent Scheduling',1,'Not Approved'],
  ['Frontend Testing',4,'Converted'], ['Dataset Governance',3,'Approved'],
  ['Batch Inference',0,'In Review'], ['Spatial SQL',2,'Converted'],
  ['LangGraph Checkpoints',1,'Approved'], ['API Rate Limiting',3,'Approved'],
  ['Advanced UI Animation',5,'Not Approved'], ['Custom Model Hardware',0,'Not Approved'],
];
const demoRows = [
  ...examples.map((example,image) => ({...example,image})),
  ...demoRequests.map(([title,image,status]) => ({
    title,image,status, note:status === 'Converted' ? 'Workshop Live' : status,
    text:'A hands-on workshop on '+title+' with practical exercises and a guided project.',
    tags:examples[image].tags, interest:null, comments:null,
  })),
];
const pictures = Object.values(import.meta.glob('../../assets/demand-topic-*.webp',{eager:true,import:'default'})) as string[];
export function DemandBoard({demands, loading, creating, onCreate, children}: {demands:LearningDemand[]; loading:boolean; creating:boolean; onCreate:()=>void; children:ReactNode}) {
  const {user}=useAuth();
  const key='demand-bookmarks:'+user?.id;
  const [saved,setSaved]=useState<string[]>(()=>{try {const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[];}catch{return [];}});
  const [status,setStatus]=useState(statuses[0]), [topic,setTopic]=useState(''), [query,setQuery]=useState(''), [sort,setSort]=useState('Latest'), [list,setList]=useState(false), [page,setPage]=useState(1);
  const rows=[...demands.map(d=>({id:d.id,title:d.topic||'Learning request',status:d.status==='offered'?'Converted':d.status==='clustered'?'Clustered':'In Review',note:new Date(d.created_at).toLocaleDateString(),text:d.raw_prompt,tags:d.related_skills||[],interest:null as number|null, comments:null as number|null,image:Math.max(0,examples.findIndex(e=>d.topic?.includes(e.title))),date:Date.parse(d.created_at)})),];
  const options=rows.some(r=>r.status==='Clustered')?[...statuses,'Clustered']:statuses;
  const count=(v:string)=>rows.filter(r=>v===statuses[0]||r.status===v).length;
  const filtered=rows.filter(r=>(status===statuses[0]||r.status===status)&&(!topic||r.title===topic)&&[r.title,r.text,...r.tags].join(' ').toLowerCase().includes(query.trim().toLowerCase())).sort((a,b)=>sort==='Title'?a.title.localeCompare(b.title):sort==='Most interest'?(b.interest??0)-(a.interest??0):b.date-a.date);
  const pages=Math.max(1,Math.ceil(filtered.length/6)), current=Math.min(page,pages);
  // Historical conversion cohort from the reference demo, independent of current statuses.
  const rate=71;
  function choose(v:string){setStatus(v);setPage(1);}
  function bookmark(id:string){const next=saved.includes(id)?saved.filter(s=>s!==id):[...saved,id];setSaved(next);try{localStorage.setItem(key,JSON.stringify(next));}catch{}}
  return <div className="demand-board"><div className="demand-main">
    <header className="demand-hero"><Layers/><div><h1>My Demands</h1><p>Request the workshops and learning topics you want. Track their review status, see community interest, and turn popular demands into real workshops.</p></div><button onClick={onCreate}><Plus/>{creating?'Cancel':'Submit New Demand'}</button></header>
    {children}
    <div className="demand-metrics">{[Calendar,Hourglass,CheckCircle2,Layers].map((Icon,i)=><button key={i} onClick={()=>choose(statuses[i])}><span><Icon/>{['Total Demands','In Review','Approved','Converted to Workshop'][i]}</span><strong>{count(statuses[i])}</strong><em className="demand-change" title="Demo change over the previous period">↑ +{[5,2,3,2][i]}</em><ChevronRight/></button>)}</div>
    <div className="demand-tabs">{options.map(s=><button key={s} aria-pressed={s===status} onClick={()=>choose(s)}>{s} ({count(s)})</button>)}</div>
    <div className="demand-tools"><label><Search/><input aria-label="Search my demands" placeholder="Search my demands (e.g., MLOps, React, FastAPI…)" value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}}/></label><select aria-label="Topic" value={topic} onChange={e=>{setTopic(e.target.value);setPage(1);}}><option value="">Topic: All Topics</option>{[...new Set(rows.map(r=>r.title))].map(t=><option key={t}>{t}</option>)}</select><select aria-label="Status" value={status} onChange={e=>choose(e.target.value)}>{options.map(s=><option value={s} key={s}>Status: {s===statuses[0]?'All':s}</option>)}</select><select aria-label="Sort" value={sort} onChange={e=>{setSort(e.target.value);setPage(1);}}>{['Latest','Most interest','Title'].map(s=><option value={s} key={s}>Sort: {s}</option>)}</select><div>{[Grid,List].map((Icon,i)=><button key={i} aria-label={i?'List view':'Grid view'} aria-pressed={list===!!i} onClick={()=>setList(!!i)}><Icon/></button>)}</div></div>
    <div className={'demand-cards'+(list?' is-list':'')}>{filtered.slice((current-1)*6,current*6).map(r=><article key={r.id}><header><img src={pictures[r.image]} alt=""/><div><small>{r.status==='Converted'?<Layers/>:r.status==='Approved'?<CheckCircle2/>:<Hourglass/>}{r.status}</small><h2>{r.title}</h2><span className="demand-note">{r.status==='Converted'?<Monitor/>:r.status==='Approved'?<Calendar/>:<Clock/>}{r.note} {r.status==='Converted'&&<Link to="/workshops">Browse workshops →</Link>}</span></div></header><p>{r.text}</p><div className="demand-tags">{r.tags.map((t,i)=><span key={i}>{t}</span>)}</div><footer>{r.interest!==null && <><Users/>{r.interest} interested <MessageCircle/>{r.comments} comments</>}<button aria-label={'Bookmark '+r.title} aria-pressed={saved.includes(r.id)} onClick={()=>bookmark(r.id)}><Bookmark fill={saved.includes(r.id)?'currentColor':'none'}/></button></footer></article>)}</div>
    {!filtered.length&&<p>No demands match these filters.</p>}
    <footer className="demand-pages"><button disabled={current<=1} onClick={()=>setPage(current-1)}>‹ Previous</button>{Array.from({length:pages},(_,i)=>i+1).map(n => Math.abs(n-current)<=1 || n===1 || n===pages || (current===1 && n===3) ? <button key={n} aria-current={n===current?'page':undefined} onClick={()=>setPage(n)}>{n}</button> : n===pages-1 || n===2 ? <i key={n}>…</i> : null)}<button disabled={current>=pages} onClick={()=>setPage(current+1)}>Next ›</button><span>{loading?'Loading your requests…':filtered.length?'Showing '+((current-1)*6+1)+'–'+Math.min(current*6,filtered.length)+' of '+filtered.length+' demands':'0 demands'}</span></footer>
    </div><aside className="demand-side"><section><h2><BarChart3/>Demand Insights</h2><div className="demand-rate"><strong style={{backgroundImage:`radial-gradient(closest-side,white 74%,transparent 76%),conic-gradient(#067032 ${rate}%,#d3edd7 0)`}}>{rate}%</strong><div><h3>Conversion Rate</h3><p>Demands converted to workshops</p><em className="demand-change">↑　+12 pp</em><small>vs. previous 90 days</small></div></div>{['Total Demands','Approved','Converted to Workshop'].map((v,i)=><div className="demand-line" key={v}>{i===0?<Calendar/>:i===1?<CheckCircle2/>:<Layers/>}{v}<b>{count(statuses[[0,2,3][i]])}</b></div>)}</section>
    <section><h2><Flame/> Top Demanded Topics <small>Last 90 days</small></h2>{[0,4,1,2,3].map((n,i)=><button className="demand-ranking" key={n} onClick={()=>{setTopic(examples[n].title);choose(statuses[0]);setQuery('');}}><b>{i+1}</b><span>{examples[n].title}<progress max={150} value={examples[n].interest}/></span>{examples[n].interest}</button>)}</section>
    <section className="demand-tip"><h2><Lightbulb/>Tip: Make a High-Impact Demand</h2><p>Be specific, describe the learning goals, and share a real use case. Demands with higher interest are more likely to be approved and turned into workshops.</p></section></aside></div>;
}
