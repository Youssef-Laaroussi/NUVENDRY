import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { Activity, ArrowRight, BarChart3, Calendar, Check, ChevronRight, CreditCard, Gift, Layers, Target, TrendingUp, Users } from 'lucide-react';
import { api, useSyncRefresh } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { AnalyticsOverview, LearningDemand, NotificationItem } from '../../types';
import { previewPayments } from './instructorPreview';

const periods = ['7D','30D','90D','YTD'] as const;
const colors = ['#086938','#409f56','#89ce65','#bdeba2','#ffe49a'];
const money = (cents:number, currency='USD') => (cents/100).toLocaleString('en-US',{style:'currency',currency,minimumFractionDigits:0,maximumFractionDigits:2});
const dateLabel = (date:Date) => date.toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'});
type Payment = typeof previewPayments[number];
const day = 86400000;

export function MerchantOverview(){
  const {user} = useAuth();
  const [metrics,setMetrics] = useState<AnalyticsOverview|null>(null);
  const [payments,setPayments] = useState<Payment[]>([]);
  const [demands,setDemands] = useState<LearningDemand[]>([]);
  const [notices,setNotices] = useState<NotificationItem[]>([]);
  const [failed,setFailed] = useState(false);
  const generation = useRef(0);
  const [period,setPeriod] = useState<typeof periods[number]>('30D');
  const [expanded,setExpanded] = useState(false);
  const {hash} = useLocation();
  useEffect(()=>{if(hash==='#activity') document.getElementById('activity')?.scrollIntoView();},[hash]);
  const load = useCallback(async()=>{
    const request = ++generation.current;
    if(!user) return;
    const results = await Promise.allSettled([api.getAnalyticsOverview(),api.getPaymentTransactions(),api.getDemands(),api.getNotifications()] as const);
    if(request!==generation.current) return;
    const [overview,orders,requests,notifications]=results;
    if(overview.status==='fulfilled') setMetrics(overview.value);
    if(orders.status==='fulfilled') setPayments(orders.value);
    if(requests.status==='fulfilled') setDemands(requests.value);
    if(notifications.status==='fulfilled') setNotices(notifications.value);
    setFailed(results.some(result=>result.status==='rejected'));
  },[user]);
  useEffect(() => {
    void load();
    window.addEventListener('focus', load);
    return () => {
      generation.current++;
      window.removeEventListener('focus', load);
    };
  }, [load]);
  useSyncRefresh(['analytics','workshops','reservations','clusters','rewards','payments','demands','notifications'],load);
  const orders=payments;
  const end=Date.parse(new Date().toISOString().slice(0,10));
  const days=period==='YTD'?1+Math.round((end-Date.UTC(new Date(end).getUTCFullYear(),0,1))/day):parseInt(period);
  const start=end-(days-1)*day;
  const daily=Array.from({length:days},(_,i)=>({
    date:dateLabel(new Date(start+i*day)),
    requests:0,
    bookings:0
  }));
  const topicsMap=new Map<string,number>();
  for(const demand of demands){
    const index=Math.floor((Date.parse(demand.created_at)-start)/day);
    if(daily[index]) daily[index].requests++;
    const time=Date.parse(demand.created_at);
    if(time>=end-29*day && time<end+day) topicsMap.set(demand.topic,(topicsMap.get(demand.topic)||0)+1);
  }
  for(const order of payments){
    const index=Math.floor((Date.parse(order.created_at)-start)/day);
    if(daily[index]) daily[index].bookings++;
  }
  const ranked=Array.from(topicsMap,([name,count])=>({name,count})).sort((a,b)=>b.count-a.count);
  const topics=ranked.length<=5?ranked:[...ranked.slice(0,4),{name:'Other Topics',count:ranked.slice(4).reduce((sum,t)=>sum+t.count,0)}];
  const total=topics.reduce((sum,t)=>sum+t.count,0);
  let angle=0;
  const gradient=topics.map((t,i)=>{const from=angle;angle+=t.count/total*360;return colors[i]+' '+from+'deg '+angle+'deg'}).join(',');
  const cards=[
    {label:'Confirmed Volume',value:metrics&&money(metrics.total_revenue_cents),path:'payments',icon:Calendar},
    {label:'Verified Bookings',value:metrics?.confirmed_reservations,path:'reservations',icon:Users},
    {label:'Published Workshops',value:metrics?.published_workshops,path:'workshops',icon:Layers},
    {label:'Demand Opportunities',value:metrics?.active_clusters,path:'demand-intelligence',icon:Target},
    {label:'Rewards Redeemed',value:metrics&&money(metrics.total_rewards_redeemed_cents),path:'reward-studio',icon:Gift}
  ];
  const activities=notices.map(n=>[n.title,n.message,dateLabel(new Date(n.created_at))]);
  return <div className="studio-overview">
    <header className="studio-hero"><h1>Overview <BarChart3/></h1><p>Your instructor command center to run workshops, understand demand,<br className="hidden xl:block"/> track performance, and grow your learning impact with NUVENDRY.</p></header>
    {failed&&<div role="status">Some instructor data could not be loaded. <button onClick={load}>Retry</button></div>}
    <div className="studio-kpis">{cards.map(({label,value,path,icon:Icon})=><Link key={path} to={'/merchant/'+path}><span><Icon/>{label}</span><div><strong>{value??'—'}</strong><ChevronRight size={14}/></div></Link>)}<section><span><CreditCard/>Sandbox Status</span><b><Check size={16}/> {'Orders v2'}</b></section></div>
    <div className="studio-panels">
      <section><header><TrendingUp/><div><h2>Demand Trends</h2><p>Workshop demand (requests) and verified bookings over time.</p></div><div className="studio-period">{periods.map(p=><button key={p} aria-pressed={p===period} onClick={()=>setPeriod(p)}>{p}</button>)}</div></header>
        <div className="studio-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={daily} margin={{left:-25,right:12,top:22,bottom:0}}>
          <defs><linearGradient id="studio-trend" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#79bc86" stopOpacity={0.45}/><stop offset="1" stopColor="#eff8eb" stopOpacity={0.15}/></linearGradient></defs>
          <CartesianGrid vertical={false} stroke="#edf0ee"/><XAxis dataKey="date" tickLine={false} minTickGap={22} fontSize={11}/><YAxis allowDecimals={false} tickLine={false} fontSize={11}/><Tooltip/>
          <Area isAnimationActive={false} type="monotone" dataKey="requests" name="Demand (Requests)" stroke="#076731" strokeWidth={2.3} fill="url(#studio-trend)" dot={days<=30?{r:2,fill:'white'}:false}/>
          <Area isAnimationActive={false} type="monotone" dataKey="bookings" name="Verified Bookings" stroke="#82ca4c" strokeWidth={2} fill="transparent" dot={days<=30?{r:2,fill:'white'}:false}/>
        {(['requests','bookings'] as const).map(key => {
            const last = daily[daily.length-1];
            const fill = key==='requests' ? '#086938' : '#92d65e';
            if (!last[key] || (key==='bookings' && last.requests===last.bookings)) return null;
            return <ReferenceDot key={key} x={last.date} y={last[key]} r={3} fill={fill} stroke="white"
              label={({viewBox}) => <g transform={`translate(${viewBox.x},${viewBox.y-24})`}>
                <rect x={-12} width={25} height={18} rx={5} fill={fill}/>
                <text x={1} y={13} textAnchor="middle" fontSize={11} fontWeight={700} fill={key==='requests'?'white':'#15391b'}>{last[key]}</text>
              </g>}/>;
          })}
        </AreaChart></ResponsiveContainer></div><div className="studio-legend"><span>●　Demand (Requests)</span><span>●　Verified Bookings</span></div>
      </section>
      <section><header><Layers/><div><h2>Demands by Topic</h2><p>Request volume by learning topic (last 30 days).</p></div></header><div className="studio-topics"><div className="studio-ring" style={{background:total?'conic-gradient('+gradient+')':'#e8ece9'}}><div><strong>{total}</strong>Total<br/>Demands</div></div><ul>{topics.map((t,i)=><li key={i}><i style={{background:colors[i]}}/>{t.name}<b>{Math.round(100*t.count/total)}%</b> ({t.count})</li>)}{!total&&<li>No requests this month.</li>}</ul></div></section>
      <section className="studio-orders"><header><CreditCard/><div><h2>Recent Verified Sandbox Transactions</h2><p>Recent workshop payments confirmed via PayPal Sandbox.</p></div><Link className="studio-action" to="/merchant/payments">View All Transactions <ArrowRight/></Link></header>
        <div className="studio-table"><table><thead><tr>{['Order ID','Workshop','Buyer (Sandbox)','Amount','Status','Date & Time'].map(t=><th key={t}>{t}</th>)}</tr></thead><tbody>{orders.slice(0,5).map(o=><tr key={o.id}><td>{o.paypal_order_id||o.id}</td><td>{o.workshop_title}</td><td>{o.buyer_name}</td><td>{(o.amount_cents/100).toLocaleString('en-US',{style:'currency',currency:o.currency})}</td><td><em>{o.status==='confirmed'?'✓ Verified':o.status}</em></td><td>{o.created_at ? new Date(o.created_at).toLocaleString('en-US',{dateStyle:'medium',timeStyle:'short'}) : '—'}</td></tr>)}</tbody></table>{!orders.length&&<p>No confirmed transactions to display.</p>}</div></section>
      <section id="activity"><header><Activity/><div><h2>Recent Activity</h2><p>Key updates from your instructor workspace.</p></div>{activities.length>4&&<button className="studio-action" onClick={()=>setExpanded(!expanded)}>{expanded?'Show Less':'View All Activity'} <ArrowRight/></button>}</header>
      {activities.slice(0,expanded?undefined:4).map(([title,message,time],i)=>{const Icon=[Calendar,Layers,Target,Gift][i%4];return <div className="studio-event" key={i}><i><Icon/></i><div><b>{title}</b><p>{message}</p></div><small>{time}</small></div>})}{!activities.length&&<p>No recent activity.</p>}</section>
    </div>
  </div>;
}
