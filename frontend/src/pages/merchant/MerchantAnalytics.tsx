import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BarChart3, ChevronDown, ChevronRight, Coins, Download, Filter, Layers, Target, TrendingUp, Trophy, Users, Armchair } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import type { Workshop, LearningDemand } from '../../types';
import './Analytics.css';

const colors=['#086a35','#56ab58','#8bcf65','#afe481','#ffe397'];
const periods=['Last 7 Days','30 Days','90 Days','YTD'];
const headers=['Revenue','Bookings','Seat Fill Rate','Conversion Rate','Avg. Rating','Learners'];
const stages=['Workshop Views','Interest / Clicks','Started Booking','Confirmed Booking'];
type Payment = { workshop_id: string; amount_cents: number; currency: string; status: string; paypal_capture_id?: string; created_at?: string };
type Booking = { workshop_id: string; buyer_email: string; status: string; created_at: string };
function SectionTitle({icon:Icon,title,description}:{icon:typeof TrendingUp;title:string;description:string}){
  return <div className="an-title"><Icon/><div><h2>{title}</h2><p>{description}</p></div></div>;
}
export function MerchantAnalytics(){
  const [period,setPeriod]=useState(1);
  const [sort,setSort]=useState({column:0,desc:true});
  const [data,setData]=useState<{workshops:Workshop[];payments:Payment[];bookings:Booking[];demands:LearningDemand[]}>();
  const [error,setError]=useState('');
  useEffect(() => {
    let active = true;
    Promise.all([api.getMerchantWorkshops(),api.getPaymentTransactions(),api.getMerchantReservations(),api.getDemands()])
      .then(([workshops,payments,bookings,demands]) => {if(active)setData({workshops,payments,bookings,demands});})
      .catch(() => {if(active)setError('Could not load analytics.');});
    return () => {active=false;};
  }, []);
  const today=new Date();
  const start = new Date(today.getFullYear(),today.getMonth(),today.getDate());
  if(period===3) start.setMonth(0,1);
  else start.setDate(start.getDate()-[6,29,89][period]);
  const bookings=(data?.bookings ?? []).filter(row=>Date.parse(row.created_at)>=start.getTime());
  const confirmed=bookings.filter(row=>row.status==='confirmed');
  const captured=(data?.payments ?? []).filter(row=>row.paypal_capture_id && row.status==='confirmed' && Date.parse(row.created_at ?? '')>=start.getTime());
  const currencies=[...new Set(captured.map(row=>row.currency))];
  const currency=currencies.length===1 ? currencies[0] : 'USD';
  const formatMoney=(amount:number)=>new Intl.NumberFormat(undefined,{style:'currency',currency}).format(amount);
  const payments=captured.filter(row=>row.currency===currency);
  const revenue=payments.reduce((sum,row)=>sum+row.amount_cents/100,0);
  const workshops=(data?.workshops ?? []).map(workshop=>{
    const reservations=bookings.filter(row=>row.workshop_id===workshop.id);
    const verified=reservations.filter(row=>row.status==='confirmed');
    return {id:workshop.id,title:workshop.title,metrics:[
      payments.filter(row=>row.workshop_id===workshop.id).reduce((sum,row)=>sum+row.amount_cents/100,0),
      verified.length, Math.round(100*(workshop.total_seats-workshop.remaining_seats)/Math.max(1,workshop.total_seats)),
      reservations.length ? Math.round(100*verified.length/reservations.length) : null,
      null,new Set(verified.map(row=>row.buyer_email)).size,
    ]};
  });
  const trend=[];
  for(const date=new Date(start);date<=today;date.setDate(date.getDate()+1)){
    const key=date.toDateString();
    trend.push({date:date.toLocaleDateString('en-US',{month:'short',day:'numeric'}),
      revenue:payments.filter(row=>new Date(row.created_at ?? '').toDateString()===key).reduce((sum,row)=>sum+row.amount_cents/100,0),
      bookings:confirmed.filter(row=>new Date(row.created_at).toDateString()===key).length});
  }
  const counts=[null,null,bookings.length,confirmed.length];
  const topicCounts=new Map<string,number>();
  for(const demand of data?.demands ?? []){
    if(Date.parse(demand.created_at)>=start.getTime())topicCounts.set(demand.topic,(topicCounts.get(demand.topic) ?? 0)+1);
  }
  const topics=[...topicCounts].map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count);
  const total=topics.reduce((sum,topic)=>sum+topic.count,0);
  let angle=0;
  const slices=topics.map((topic,i)=>{const from=angle;angle+=360*topic.count/total;return `${colors[i%colors.length]} ${from}deg ${angle}deg`;}).join(',');
  const maxRevenue=Math.max(1,...workshops.map(row=>row.metrics[0] ?? 0));
  const capacity=(data?.workshops ?? []).reduce((sum,row)=>sum+row.total_seats,0);
  const occupied=(data?.workshops ?? []).reduce((sum,row)=>sum+row.total_seats-row.remaining_seats,0);
  const sorted=[...workshops].sort((a,b)=>((b.metrics[sort.column] ?? -1)-(a.metrics[sort.column] ?? -1))*(sort.desc?1:-1));
  function download(){
    const csv=[['Rank','Workshop',...headers],...sorted.map((w,i)=>[i+1,w.title,...w.metrics])].map(row=>row.map(value=>'"'+String(value).replace(/"/g,'""')+'"').join(',')).join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='workshop-performance.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  return <div className="studio-overview an-page"><header className="studio-hero"><h1>Analytics <BarChart3/></h1><p>Track workshop performance, revenue, conversions, and learning demand to optimize your offerings and grow with NUVENDRY.</p></header>
  <>{error&&<p role="alert">{error}</p>}{!data&&!error&&<p role="status">Loading analytics…</p>}{currencies.length>1&&<p>Revenue shown in {currency} only.</p>}<div className="studio-kpis">{['Total Revenue','Conversion Rate','Seat Fill Rate','Active Learners'].map((label,i)=>{const Icon=[Coins,Target,Armchair,Users][i];return <Link key={label} to={'/merchant/'+['payments','demand-intelligence','workshops','reservations'][i]}><span><Icon/>{label}</span><div><strong>{data ? [formatMoney(revenue),bookings.length ? Math.round(confirmed.length/bookings.length*100)+'%' : '—',capacity ? Math.round(occupied/capacity*100)+'%' : '—',new Set(confirmed.map(row=>row.buyer_email)).size][i] : '—'}</strong><ChevronRight size={15}/></div></Link>})}</div>
  <div className="an-top"><section className="an-card"><header><SectionTitle icon={TrendingUp} title="Revenue & Bookings Trend" description="Track revenue and bookings over time to understand performance and growth."/><nav className="studio-period">{periods.map((p,i)=><button key={p} aria-pressed={period===i} onClick={()=>setPeriod(i)}>{p}</button>)}</nav></header>
  <div className="an-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trend} margin={{left:0,right:2,top:14,bottom:0}}><defs><linearGradient id="analyticsRevenue" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#8ccf83" stopOpacity={.48}/><stop offset="1" stopColor="#bde0aa" stopOpacity={.16}/></linearGradient></defs><CartesianGrid vertical={false} stroke="#e9eeea"/><XAxis dataKey="date" tickLine={false} minTickGap={20} fontSize={10}/><YAxis yAxisId="revenue" width={48} tickFormatter={formatMoney} fontSize={11} tickLine={false}/><YAxis yAxisId="bookings" orientation="right" width={30} allowDecimals={false} fontSize={11} tickLine={false}/><Tooltip formatter={(v,n)=>[n==='Revenue'?'$'+Number(v).toLocaleString('en-US'):v,n]}/>
  <Area yAxisId="revenue" type="linear" dataKey="revenue" name="Revenue" stroke="#076733" strokeWidth={2.4} fill="url(#analyticsRevenue)" dot={trend.length<=30?{r:2,fill:'white'}:false} isAnimationActive={false}/><Area yAxisId="bookings" type="linear" dataKey="bookings" name="Bookings (Seats)" stroke="#7cc844" strokeWidth={2} fill="none" dot={trend.length<=30?{r:2,fill:'white'}:false} isAnimationActive={false}/></AreaChart></ResponsiveContainer></div><div className="an-legend"><span>Revenue</span><span>Bookings (Seats)</span></div></section>
  <section className="an-card"><SectionTitle icon={Filter} title="Bookings Funnel" description="Learner journey from interest to confirmed booking."/><div className="an-funnel"><div aria-hidden="true">{counts.map((n,i)=><strong key={i} style={{width:(100-i*14)+'%',background:['#046732','#54ae55','#9cdd80','#cef1bd'][i]}}>{n?.toLocaleString('en-US') ?? '—'}</strong>)}</div><ul>{stages.map((s,i)=><li key={s}><i style={{background:colors[i%colors.length]}}/>{i>0?'→ ':''}{s}<b>{counts[i]?.toLocaleString('en-US') ?? '—'}</b></li>)}</ul></div></section></div>
  <div className="an-middle"><section className="an-card"><SectionTitle icon={BarChart3} title="Revenue by Workshop" description="Total revenue for each workshop (selected period)."/><div className="an-bars">{workshops.map((w,i)=><div key={w.id}><span title={w.title}>{w.title}</span><div><i style={{width:(w.metrics[0] ?? 0)/maxRevenue*100+'%',background:['#056934','#55ad58','#78c16c','#9fdc7b','#b1e597'][i]}}/><b>{formatMoney(w.metrics[0] ?? 0)}</b></div></div>)}<footer><span>{formatMoney(0)}</span><span>{formatMoney(maxRevenue)}</span></footer></div></section>
  <section className="an-card"><SectionTitle icon={Layers} title="Demand by Topic" description="Share of total workshop demand (selected period)."/><div className="studio-topics"><div className="studio-ring" style={{background:total ? 'conic-gradient('+slices+')' : '#e8eee7'}}><div><strong>{total}</strong>Total<br/>Demands</div></div><ul>{topics.map((t,i)=><li key={t.name}><i style={{background:colors[i%colors.length]}}/>{t.name}<b>{Math.round(t.count*100/total)}%</b> ({t.count})</li>)}</ul></div></section></div>
  <section className="an-card"><header><SectionTitle icon={Trophy} title="Top-Performing Workshops" description="Workshops ranked by revenue, with key performance metrics (selected period)."/><button className="studio-action" onClick={download}><Download/>Export CSV</button></header><div className="studio-table"><table><thead><tr><th>#</th><th>Workshop</th>{headers.map((h,i)=><th key={h} aria-sort={sort.column===i?(sort.desc?'descending':'ascending'):'none'}><button onClick={()=>setSort({column:i,desc:sort.column!==i||!sort.desc})}>{h}<ChevronDown size={13} style={{transform:sort.column===i&&!sort.desc?'rotate(180deg)':undefined}}/></button></th>)}</tr></thead><tbody>{sorted.map((w,i)=><tr key={w.id}><td>{i+1}</td><td>{w.title}</td><td><b>{formatMoney(w.metrics[0] ?? 0)}</b></td><td>{w.metrics[1]}</td><td><em>{w.metrics[2]}%</em></td><td>{w.metrics[3]===null ? "—" : w.metrics[3]+"%"}</td><td>—</td><td>{w.metrics[5]}</td></tr>)}</tbody></table></div></section></></div>;
}
