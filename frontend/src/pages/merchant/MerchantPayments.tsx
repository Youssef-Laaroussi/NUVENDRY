import { useEffect, useState } from 'react';
import { Calendar, Check, CheckCircle, ChevronDown, ChevronLeft, ChevronRight, Clock, CreditCard, Download, Landmark, Layers, MoreHorizontal, Search, ShieldCheck, ShoppingCart, Undo2, XCircle } from 'lucide-react';
import { api, subscribeSync } from '../../api/client';
import logo from '../../assets/studio-paypal.webp';
import './Payments.css';

type Order = { id: string; buyer: string; workshop: string; amount: number; currency: string; status: string; capture: string; date: number };
const money = (amount: number, currency = 'USD') => amount.toLocaleString('en-US', { style: 'currency', currency });
const dateText = (date: number) => Number.isFinite(date) ? new Date(date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
const tabs=['All Transactions','Captured','Refunded','Pending','Failed'];
const statusIcons=[Layers,CheckCircle,Undo2,Clock,XCircle];
export function MerchantPayments(){
  const [orders,setOrders]=useState<Order[]>([]);
  const [loadState,setLoadState]=useState('Loading transactions…');
  useEffect(() => {
    let active = true;
    let latestRequest = 0;
    const load = async () => {
      const request = ++latestRequest;
      try {
        const rows = await api.getPaymentTransactions(true);
        if (!active || request !== latestRequest) return;
        setOrders(rows.map(row => ({
          id: row.paypal_order_id || row.id, buyer: row.buyer_name, workshop: row.workshop_title,
          amount: row.amount_cents / 100, currency: row.currency, status: row.status === 'refunded' ? 'Refunded' : row.paypal_capture_id ? 'Captured' : ['failed','cancelled','canceled'].includes(row.status) ? 'Failed' : 'Pending',
          capture: row.paypal_capture_id ?? '—', date: row.created_at ? Date.parse(row.created_at) : NaN,
        })));
        setLoadState('');
      } catch {
        if (active && request === latestRequest) setLoadState('Could not load transactions.');
      }
    };
    void load();
    const unsubscribe = subscribeSync(['payments'], load);
    window.addEventListener('focus', load);
    return () => {
      active = false;
      unsubscribe();
      window.removeEventListener('focus', load);
    };
  }, []);
  const workshops = [...new Set(orders.map(order => order.workshop))];
  const totals = new Map<string, number>();
  const captured = orders.filter(order => order.status === 'Captured');
  const refunds = orders.filter(order => order.status === 'Refunded').length;
  for (const order of captured) totals.set(order.currency, (totals.get(order.currency) ?? 0) + order.amount);
  const gross = [...totals].map(([currency, amount]) => money(amount, currency)).join(' / ');
  const [tab,setTab]=useState(0);
  const [query,setQuery]=useState('');
  const [days,setDays]=useState(0);
  const [workshop,setWorkshop]=useState('');

  const [amount,setAmount]=useState('');
  const [asc,setAsc]=useState(false);
  const [size,setSize]=useState(10);
  const [page,setPage]=useState(0);
  const [modal,setModal]=useState('');
  const [detail,setDetail]=useState<Order|null>(null);
  const filtered=orders.filter(o=>(!tab||o.status===tabs[tab])&&(!days||Date.now()-o.date<days*86400000)&&(!workshop||o.workshop===workshop)&&(!amount||(amount==='Under $15 USD'?o.currency==='USD'&&o.amount<15:o.currency==='USD'&&o.amount>=15))&&[o.id,o.capture,o.buyer,o.workshop].join(' ').toLowerCase().includes(query.trim().toLowerCase())).sort((a,b)=>asc?a.date-b.date:b.date-a.date);
  const pages=Math.ceil(filtered.length/size);
  const current=Math.min(page,Math.max(0,pages-1));
  function exportCsv(){
    const lines=[['Order ID','Buyer','Workshop','Amount','Currency','Status','Capture ID','Payment date'],...filtered.map(o=>[o.id,o.buyer,o.workshop,o.amount.toFixed(2),o.currency,o.status,o.capture,dateText(o.date)])];
    const url=URL.createObjectURL(new Blob([lines.map(row=>row.map(v=>'"'+v.replace(/"/g,'""')+'"').join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='paypal-transactions.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function close(){setModal('');setDetail(null)}
  return <div className="studio-overview pay-page"><header className="studio-hero"><h1>PayPal Transactions <img src={logo} alt=""/></h1><p>Track and manage workshop payments, captures, refunds, and payouts processed through PayPal, including your Sandbox integration.</p></header>
  {loadState&&<p role="status">{loadState}</p>}<div className="studio-kpis">{['Gross Volume','Captured Orders','Refunds','Success Rate'].map((title,i)=>{const Icon=[Layers,ShoppingCart,Undo2,ShieldCheck][i];return <section key={title}><span><Icon/>{title}</span><div><strong>{[loadState?'—':gross||money(0),loadState?'—':captured.length,loadState?'—':refunds,'—'][i]}</strong>{i<2&&<button aria-label={'View '+title} onClick={()=>{setTab(i);setPage(0)}}><ChevronRight/></button>}</div></section>})}</div>
  <div className="pay-grid"><section className="pay-card pay-ledger"><header><CreditCard/><div><h2>Transaction Ledger</h2><p>All PayPal orders for your workshops, with payment status and capture details.</p></div><button className="pay-action" onClick={exportCsv}><Download/>Export CSV</button></header>
  <nav>{tabs.map((label,i)=>{const Icon=statusIcons[i];return <button key={label} aria-pressed={tab===i} onClick={()=>{setTab(i);setPage(0)}}><Icon/>{label} ({i?orders.filter(o=>o.status===label).length:orders.length})</button>})}</nav>
  <div className="pay-search"><label><Search/><input aria-label="Search transactions" placeholder="Search by Order ID, buyer, workshop, or Capture ID..." value={query} onChange={e=>{setQuery(e.target.value);setPage(0)}}/></label><label><Calendar/><select aria-label="Date range" value={days} onChange={e=>{setDays(Number(e.target.value));setPage(0)}}><option value={0}>Date: All time</option>{[7,30,90].map(d=><option key={d} value={d}>Date: Last {d} Days</option>)}</select></label><select aria-label="Workshop" value={workshop} onChange={e=>{setWorkshop(e.target.value);setPage(0)}}><option value="">Workshop: All</option>{workshops.map(w=><option key={w}>{w}</option>)}</select><select aria-label="Amount" value={amount} onChange={e=>{setAmount(e.target.value);setPage(0)}}><option value="">Amount: Any</option><option>Under $15 USD</option><option>$15 USD or more</option></select></div>
  <div className="studio-table"><table><thead><tr>{['Order ID','Buyer','Workshop','Amount','Status','Capture ID'].map(h=><th key={h}>{h}</th>)}<th aria-sort={asc?'ascending':'descending'}><button onClick={()=>{setAsc(!asc);setPage(0)}}>Date <ChevronDown style={{transform:asc?'rotate(180deg)':undefined}}/></button></th><th>Actions</th></tr></thead><tbody>{filtered.slice(current*size,current*size+size).map(o=><tr key={o.id}><td>{o.id}</td><td>{o.buyer}</td><td>{o.workshop}</td><td>{money(o.amount,o.currency)}</td><td><b className={'pay-chip '+o.status}>{o.status==='Refunded'?<Undo2/>:<Check/>}{o.status}</b></td><td>{o.capture}</td><td>{dateText(o.date)}</td><td><button className="pay-more" aria-label={'Details for '+o.id} onClick={()=>{setDetail(o);setModal('Transaction details')}}><MoreHorizontal/></button></td></tr>)}</tbody></table>{!loadState&&!filtered.length&&<p>No matching transactions.</p>}</div>
  <footer><span>Showing {filtered.length?current*size+1:0}–{Math.min((current+1)*size,filtered.length)} of {filtered.length} transactions</span><div><button aria-label="Previous page" disabled={!current} onClick={()=>setPage(current-1)}><ChevronLeft/></button>{Array.from({length:pages},(_,i)=><button key={i} aria-current={current===i?'page':undefined} onClick={()=>setPage(i)}>{i+1}</button>)}<button aria-label="Next page" disabled={current+1>=pages} onClick={()=>setPage(current+1)}><ChevronRight/></button></div><label>Rows per page: <select value={size} onChange={e=>{setSize(Number(e.target.value));setPage(0)}}>{[10,25,50].map(n=><option key={n}>{n}</option>)}</select></label></footer></section>
  <aside><section className="pay-card"><header><Landmark/><h2>Settlement &amp; Payout Status</h2></header><p>Settlement and payout data are unavailable in this workspace.</p></section>
  <section className="pay-card pay-integration"><header><img src={logo} alt=""/><h2>PayPal Sandbox Integration</h2></header><dl><div><dt>Environment</dt><dd>Sandbox</dd></div><div><dt>API</dt><dd>Orders v2</dd></div></dl></section></aside></div>
  {modal&&<dialog className="pay-card pay-dialog" ref={el=>{if(el&&!el.open)el.showModal()}} onClose={close}><h2>{modal}</h2>{detail?<dl>{Object.entries({'Order ID':detail.id,Buyer:detail.buyer,Workshop:detail.workshop,Amount:money(detail.amount,detail.currency),Status:detail.status,'Capture ID':detail.capture,'Payment date':dateText(detail.date)}).map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>:null}<button className="pay-action" onClick={close}>Close</button></dialog>}</div>;
}
