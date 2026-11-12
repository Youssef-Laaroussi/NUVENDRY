import { api, useSyncRefresh } from '../../api/client';
import type { DemandCluster, LearningDemand } from '../../types';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Bookmark, CheckCircle, CircleDollarSign, Download, Layers, MessageCircle, Search, ShieldCheck, Sparkles, Star, TrendingUp, User, Users } from 'lucide-react';
import './DemandIntelligence.css';

const filters=['All Opportunities','3+ Requests','Recent Activity','New','Saved'];
const icons=[Sparkles,Star,TrendingUp,Sparkles,Bookmark];
const colors=['#006632','#43a552','#8bce63','#bfeb9f','#ffe499'];
const money = (cents: number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(cents / 100);
export function DemandIntelligence(){
  const [filter,setFilter]=useState(0);
  const [query,setQuery]=useState('');
  const [page,setPage]=useState(0);
  const [clusters,setClusters]=useState<DemandCluster[]>([]);
  const [requests,setRequests]=useState<LearningDemand[]>([]);
  const [error,setError]=useState('');
  const [matching,setMatching]=useState(false);
  const [selected,setSelected]=useState<DemandCluster>();
  const [saved,setSaved]=useState<string[]>([]);
  const [allRequests,setAllRequests]=useState(false);
  const refresh = useCallback(async () => {
    try {
      const [clusters, requests] = await Promise.all([api.getClusters(),api.getDemands()]);
      setClusters(clusters);
      setRequests(requests);
      setError('');
    } catch {
      setError('Could not load demand data.');
    }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  useSyncRefresh(['demands','clusters'], refresh);
  async function matchDemands() {
    setMatching(true);
    setError('');
    try {
      await api.matchDemands();
      await refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not group learner requests.');
    } finally {
      setMatching(false);
    }
  }
  const recent = Date.now() - 30 * 86400000;
  const lastWeek = Date.now() - 7 * 86400000;
  const activity = new Map<string, number>();
  for (const request of requests.filter(row => Date.parse(row.created_at) >= recent)) {
    activity.set(request.topic, (activity.get(request.topic) ?? 0) + 1);
  }
  const topics = [...activity.entries()].sort((a,b)=>b[1]-a[1]);
  const total = topics.reduce((sum,[,count])=>sum+count,0);
  let angle = 0;
  const slices = topics.map(([,count],i)=>{
    const start = angle;
    angle += count / total * 360;
    return `${colors[i % colors.length]} ${start}deg ${angle}deg`;
  }).join(',');
  const groups=[clusters,clusters.filter(row=>row.member_count>=3),clusters.filter(row=>(activity.get(row.topic) ?? 0)>=2),clusters.filter(row=>Date.parse(row.created_at)>=lastWeek),clusters.filter(row=>saved.includes(row.id))];
  const matches=groups[filter].filter(row=>[row.topic,row.name,row.difficulty].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
  const budgets = new Map<string, {sum:number;count:number}>();
  for (const request of requests) {
    const budget = budgets.get(request.currency) ?? {sum:0,count:0};
    budgets.set(request.currency,{sum:budget.sum+request.max_budget_cents,count:budget.count+1});
  }
  const current=Math.min(page,Math.max(0,Math.ceil(matches.length/5)-1));
  function download(){
    const csv=[['Topic','Requests','Budget','Level','Format','Language','Trend'],...matches.map(r=>[r.topic,r.member_count,money(r.avg_budget_cents,r.currency),r.difficulty,'','',''])];
    const url=URL.createObjectURL(new Blob([csv.map(row=>row.map(value=>'"'+String(value).replace(/"/g,'""')+'"').join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a'); a.href=url;a.download='demand-opportunities.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  return <div className="studio-overview demand-intel">
    <header className="studio-hero"><h1>Demand Intelligence <BarChart3/></h1><p>Aggregate learner demand signals from requests, searches, and interest into validated, actionable opportunities for new and improved workshops.</p>
    </header>
    <>
    {error&&<p role="alert">{error}</p>}
    <div className="studio-kpis">{['Total Requests','Active Clusters','Average Willingness-to-Pay','Opportunities with 2+ Requests'].map((name,i)=>{const Icon=[Users,Layers,CircleDollarSign,CheckCircle][i];return <section key={name}><span><Icon/>{name}</span><div><strong>{[requests.length,clusters.filter(row=>row.status==='active').length,[...budgets].map(([currency,budget])=>money(budget.sum/budget.count,currency)).join(' / ')||'—',clusters.filter(row=>row.member_count>=2).length][i]}</strong></div></section>})}</div>
    <div className="di-toolbar"><div>{filters.map((f,i)=>{const Icon=icons[i];return <button key={f} aria-pressed={filter===i} onClick={()=>{setFilter(i);setPage(0)}}><Icon/>{f} ({groups[i].length})</button>})}</div><label><Search/><input aria-label="Search opportunities" placeholder="Search topics, keywords, or requests..." value={query} onChange={e=>{setQuery(e.target.value);setPage(0)}}/></label></div>
    <div className="di-grid"><div className="di-column"><section className="di-card"><header><Layers/><div><h2>Clustered Demand Opportunities</h2><p>Aggregated and clustered learner requests into actionable workshop opportunities.</p></div><button className="studio-action" onClick={download}><Download/> Export Opportunities</button></header>
    <div className="studio-table"><table><thead><tr>{['Topic','Requests','Budget','Level','Format','Language','Trend','Action'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{matches.slice(current*5,current*5+5).map((row,index)=><tr key={row.id}><td><div className="di-topic"><img alt="" src={thumbs[index]}/>{row.name}</div></td><td>{row.member_count}</td><td>{money(row.avg_budget_cents,row.currency)}</td><td><span className="di-level">{row.difficulty}</span></td><td>—</td><td>—</td><td>{activity.get(row.topic) ?? 0} recent</td><td><button className="studio-action" onClick={()=>setSelected(row)}>View →</button></td></tr>)}</tbody></table></div>
    {!matches.length&&<p>No matching opportunities.</p>}{matches.length>5&&<nav className="di-pager" aria-label="Opportunity pages"><button disabled={!current} onClick={()=>setPage(current-1)}>←</button>{current+1} / {Math.ceil(matches.length/5)}<button disabled={(current+1)*5>=matches.length} onClick={()=>setPage(current+1)}>→</button></nav>}</section>
    <section className="di-card di-insight"><TrendingUp/><h2>Opportunity Insight</h2><p>{clusters.length ? "Select an opportunity to review its learner requests and budget." : "Opportunities appear once matching learner requests are grouped."}</p><button className="studio-action" disabled={matching} onClick={matchDemands}>{matching ? "Grouping requests…" : "Run Demand Matching"}</button></section></div>
    <aside className="di-column"><section className="di-card"><header><Layers/><div><h2>Demand by Topic</h2><p>Share of total learner requests (last 30 days).</p></div></header><div className="studio-topics"><div className="studio-ring di-ring" style={total ? {background:`conic-gradient(${slices})`} : {background:"#e8eee7"}}><div><strong>{total}</strong>Total<br/>Requests</div></div><ul>{topics.map(([topic,count],i)=><li key={topic}><i style={{background:colors[i%colors.length]}}/>{topic}<b>{Math.round(count*100/total)}%</b> ({count})</li>)}</ul></div></section>
    <section className="di-card"><header><MessageCircle/><div><h2>Recent Incoming Requests</h2><p>Latest individual learner requests for new or upcoming workshops.</p></div><button className="studio-action" onClick={()=>setAllRequests(!allRequests)}>{allRequests?'Show Less':'View All Requests'} →</button></header>{requests.slice(0,allRequests?undefined:3).map(row=><div className="di-request" key={row.id}><User/><div>{row.topic}<p>{row.preferred_difficulty} · {row.delivery_format.replace(/_/g,' ')} · {money(row.max_budget_cents,row.currency)}</p></div><small>{new Date(row.created_at).toLocaleDateString()}</small></div>)}{!requests.length&&<p>No learner requests yet.</p>}</section>
    <section className="di-card"><header><ShieldCheck/><div><h2>Quality &amp; Constraint Validation</h2><p>Validate demand quality and check key delivery constraints.</p></div></header><p>Review each opportunity’s summary before creating an offer.</p></section></aside></div>
    {selected&&<dialog open className="di-detail" aria-label="Opportunity details" onKeyDown={e=>{if(e.key==='Escape')setSelected(undefined)}}><h2>{selected.topic}</h2><p>{selected.summary}</p><p>{selected.member_count} requests · {money(selected.avg_budget_cents,selected.currency)} · {selected.difficulty}</p><button className="studio-action" onClick={()=>setSaved(saved.includes(selected.id)?saved.filter(t=>t!==selected.id):[...saved,selected.id])}>{saved.includes(selected.id)?'Remove from saved':'Save opportunity'}</button> <Link className="studio-action" to={`/merchant/offer-studio?cluster_id=${encodeURIComponent(selected.id)}`}>Create Offer</Link> <button autoFocus className="studio-action" onClick={()=>setSelected(undefined)}>Close</button></dialog>}
    </></div>;
}
const thumbs=Array.from({length:5},(_,i)=>new URL(`../../assets/demand-topic-${i}.webp`,import.meta.url).href);
