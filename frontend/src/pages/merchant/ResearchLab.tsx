import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowRight, BarChart3, Check, Database, FlaskConical, History, Layers, Network, Play, Settings, Target, TrendingUp } from 'lucide-react';
import { api } from '../../api/client';
import type { ResearchExperiment } from '../../types';
import './ResearchLab.css';

const methodology=[
 {icon:FlaskConical,label:'Approach',text:'Constraint-aware representation learning with pairwise constraints (must-link / cannot-link) and aggregation for robust clustering.'},
 {icon:Database,label:'Dataset',text:'The benchmark generates synthetic learner requests. The dataset size is recorded with each run.'},
 {icon:Settings,label:'Evaluation',text:'Constraint Violation Rate (CVR), Cluster Purity, Adjusted Rand Index (ARI), Normalized Mutual Information (NMI).'},
 {icon:BarChart3,label:'Protocol',text:'Execute both methods on the same dataset and compare their recorded scores.'},
];
function PurityChart({ runs }: { runs: ResearchExperiment[] }){
 const chartMethods = runs.slice(0, 5).map(run => ({name:run.baseline_name,purity:run.metric_purity * 100,cvr:run.metric_constraint_violation_rate * 100}));
 const y=(n:number)=>218-n/100*170;
 const cy=(n:number)=>218-n/100*170;
 return <svg className="lab-plot" viewBox="0 0 520 269" role="img" aria-label="Cluster purity and constraint violation rate comparison across benchmark methods">
 <defs><linearGradient id="lab-bar" x2="0" y2="1"><stop stopColor="#d0f1c4"/><stop offset="1" stopColor="#b9e8a9"/></linearGradient><linearGradient id="lab-best" x2="0" y2="1"><stop stopColor="#16823c"/><stop offset="1" stopColor="#005c26"/></linearGradient></defs>
 <rect x="112" y="16" width="13" height="13" fill="#4ba817"/><text x="130" y="26">Cluster Purity (left)</text><path d="M252 23h21" stroke="#065b23" strokeWidth="2"/><circle cx="262" cy="23" r="4" fill="white" stroke="#065b23" strokeWidth="2"/><text x="278" y="26">Constraint Violation Rate (right)</text>
 {Array.from({length:9},(_,i)=>{const yy=218-i*21.25;return <g key={i}><path d={`M46 ${yy}H482`} stroke="#edf0ef"/><text x="34" y={yy+4} textAnchor="end" className="lab-axis">{i*12.5}%</text></g>})}
 {Array.from({length:8},(_,i)=><text key={i} x="494" y={222-i*170/7} className="lab-axis">{Math.round(i*100/7)}%</text>)}
 <path d="M46 48V218H482V48" fill="none" stroke="#c8d0db"/>
 {chartMethods.map((m,i)=>{const x=58+i*86;const yy=y(m.purity);return <g key={m.name}><rect x={x} y={yy} width="63" height={218-yy} rx="1" fill={i===4?'url(#lab-best)':'url(#lab-bar)'} stroke="#a9dea0" strokeWidth=".6"/><text x={x+31} y={yy+20} textAnchor="middle" className="lab-value" style={{fill:i===4?'white':'#082811'}}>{m.purity.toFixed(1)}%</text><text x={x+31} y={237} textAnchor="middle" className="lab-xlabel">{i+1}. {m.name.slice(0,10)}</text></g>})}
 <polyline points={chartMethods.map((m,i)=>`${89+i*86},${cy(m.cvr)}`).join(' ')} stroke="#005923" strokeWidth="2" fill="none"/>
 {chartMethods.map((m,i)=><circle key={m.name} cx={89+i*86} cy={cy(m.cvr)} r="4" fill={i===4?'#e4f3c7':'white'} stroke="#005923" strokeWidth="2"/>)}
 </svg>;
}
export function ResearchLab(){
 const [tab,setTab]=useState('Methodology');
 const [running,setRunning]=useState(false);
 const [error,setError]=useState('');
 const [runs,setRuns]=useState<ResearchExperiment[]>([]);
 const [showAll,setShowAll]=useState(false);
 useEffect(() => {
   let active = true;
   api.getEvaluations().then(rows => { if (active) setRuns(rows); })
     .catch(() => { if (active) setError('Could not load benchmark runs.'); });
   return () => { active = false; };
 }, []);
 const latest = runs[0];
 const methods = [...new Map([...runs].reverse().map(run => [run.baseline_name, run])).values()];
 const percent = (value: number) => (value * 100).toFixed(2) + '%';
 async function executeBenchmark(){
  if(running)return;
  setRunning(true);setError('');
  try{await api.runEvaluation({baseline:'all',dataset_size:60});setRuns(await api.getEvaluations());}
  catch(err){setError(err instanceof Error?err.message:'Benchmark execution failed. Please try again.');}
  finally{setRunning(false);}
 }
 return <div className="lab-page">
 <header className="studio-hero lab-hero"><h1>Academic Research Lab <FlaskConical/></h1><p>Design, run, and evaluate experiments on learning, clustering, and retrieval methods.<br/>Benchmark algorithms, test hypotheses, and generate publication-ready results with NUVENDRY.</p></header>
 {error&&<p className="lab-error" role="alert">{error}</p>}<>
 <div className="lab-kpis">{[{icon:AlertTriangle,label:'Constraint Violation Rate',value:latest ? percent(latest.metric_constraint_violation_rate) : '—'},{icon:Layers,label:'Cluster Purity',value:latest ? percent(latest.metric_purity) : '—'},{icon:Network,label:'ARI Score',value:latest?.metric_ari.toFixed(3) ?? '—'},{icon:Database,label:'Run Count',value:runs.length}].map(({icon:Icon,label,value})=><section key={label}><h2><Icon/>{label}</h2><div><strong>{value}</strong></div></section>)}<button className="lab-execute" disabled={running} onClick={executeBenchmark}><Play/>{running?'Running Benchmark…':'Execute Benchmark Run'}</button></div>
 <div className="lab-upper"><section className="lab-card lab-comparison"><div className="lab-title"><Layers/><div><h2>Experiment Comparison</h2><p>Performance of clustering and representation methods on the NUVENDRY workshop dataset.</p></div></div><div className="lab-scroll"><table><thead><tr><th>Method</th><th>Constraint Violation Rate ↓</th><th>Cluster Purity ↑</th><th>ARI Score ↑</th><th>NMI ↑</th><th>Δ Purity</th></tr></thead><tbody>{methods.map(run=><tr key={run.id}><td>{run.baseline_name}</td><td>{percent(run.metric_constraint_violation_rate)}</td><td>{percent(run.metric_purity)}</td><td>{run.metric_ari.toFixed(3)}</td><td>—</td><td>—</td></tr>)}</tbody></table></div></section>
 <section className="lab-card lab-methodology"><div className="lab-title"><Target/><h2>Methodology &amp; Hypotheses</h2></div><div className="lab-tabs" role="tablist" aria-label="Research methodology">{['Methodology','Hypotheses','Experimental Setup'].map(t=><button key={t} role="tab" aria-selected={tab===t} aria-controls="lab-tab-panel" id={'lab-tab-'+t.replace(/ /g,'-')} onClick={()=>setTab(t)}>{t}</button>)}</div><div id="lab-tab-panel" role="tabpanel" aria-labelledby={'lab-tab-'+tab.replace(/ /g,'-')}>
 {tab==='Methodology'?methodology.map(({icon:Icon,label,text})=><div className="lab-method-row" key={label}><Icon/><strong>{label}</strong><p>{text}</p></div>):tab==='Hypotheses'?<div className="lab-tab-copy"><h3>Research hypotheses</h3><p>H1: Pairwise constraints reduce incompatible assignments compared with unconstrained baselines.</p><p>H2: Constraint-aware aggregation improves cluster purity while preserving semantic coherence.</p><p>H3: Improvements remain consistent across repeated runs.</p></div>:<div className="lab-tab-copy"><h3>Experimental setup</h3><p>Compare methods using the same benchmark dataset and constraints.</p><p>Compare the recorded scores from each run.</p><p>Execute a benchmark to record results in the table below.</p></div>}
 </div></section></div>
 <div className="lab-lower"><section className="lab-card lab-chart"><div className="lab-title"><TrendingUp/><div><h2>Purity vs. Constraint Violations</h2><p>Latest recorded scores for each benchmark method.</p></div></div>{methods.length ? <PurityChart runs={methods}/> : <p>No benchmark runs yet.</p>}</section>
 <section className="lab-card lab-runs"><header><div className="lab-title"><History/><div><h2>Recent Benchmark Runs</h2><p>Latest benchmark executions, configurations, and results.</p></div></div><button onClick={()=>setShowAll(value=>!value)}>{showAll?'Show Recent Runs':'View All Runs'} <ArrowRight size={14}/></button></header><div className="lab-scroll"><table><thead><tr>{['Run ID','Method','Dataset / Config','Purity','CVR','ARI','Status','Completed'].map(t=><th key={t}>{t}</th>)}</tr></thead><tbody>{runs.slice(0,showAll ? undefined : 5).map(run=><tr key={run.id}><td>{run.id.slice(0,8)}</td><td>{run.baseline_name}</td><td>N={run.dataset_size}</td><td>{percent(run.metric_purity)}</td><td>{percent(run.metric_constraint_violation_rate)}</td><td>{run.metric_ari.toFixed(3)}</td><td>{run.status}</td><td>{new Date(run.created_at).toLocaleString()}</td></tr>)}</tbody></table></div></section></div>
 </>
 </div>;
}
