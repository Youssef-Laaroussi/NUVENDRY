import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, Video, Users, Database, Layers, Zap, Search, LayoutGrid, List, Pencil, Copy, MoreHorizontal, Settings, ChevronDown, Plus, Archive, Trash2, Check, Circle } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import './Workshops.css';

type Workshop = {
  id: string; title: string; description: string; category: string; difficulty: string;
  scheduled_at: string; duration_hours: number; total_seats: number; remaining_seats: number;
  price_cents: number; currency: string; is_published: boolean; image_url?: string | null;
};
type Item = Workshop & { topic: string; date: string; time: string; status: string; capacity: number; booked: number; image: string };
const dateKey = (date: Date) => [date.getFullYear(), String(date.getMonth()+1).padStart(2,'0'), String(date.getDate()).padStart(2,'0')].join('-');
const timeKey = (date: Date) => [date.getHours(), date.getMinutes()].map(n=>String(n).padStart(2,'0')).join(':');
const covers: Record<string,string> = {
  mlops: new URL('../../assets/workshop-studio-0.webp',import.meta.url).href,
  geoai: new URL('../../assets/workshop-studio-1.webp',import.meta.url).href,
  langgraph: new URL('../../assets/workshop-studio-2.webp',import.meta.url).href,
};
const defaultCover = new URL('../../assets/workshop-studio-3.webp',import.meta.url).href;
const shortDate=(s:string)=>new Date(s+'T12:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
const clock=(s:string)=>new Date('2000-01-01T'+s).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
const dateLabel=(date:string)=>date?new Date(date+'T12:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'}):'No date scheduled';
const fill=(w:Item)=>Math.round(100*w.booked/w.capacity);
const tabs=['All Workshops','Upcoming','Live','Draft'];
const inTab=(w:Item,tab:string)=>tab===tabs[0] || (tab==='Upcoming'?w.status==='Published'&&w.date>=dateKey(new Date()):w.status===tab);

export function MerchantWorkshops(){
  const [params] = useSearchParams();
  const { user } = useAuth();
  const [workshops,setWorkshops] = useState<Workshop[]>([]);
  const [payments,setPayments] = useState<{workshop_id:string; amount_cents:number; currency:string; paypal_capture_id:string | null}[] | null>(null);
  const [message,setMessage] = useState('Loading workshops…');
  useEffect(() => {
    let active = true;
    api.getMerchantWorkshops().then(rows => {
      if (active) { setWorkshops(rows); setMessage(''); }
    }).catch(() => { if (active) setMessage('Could not load workshops.'); });
    api.getPaymentTransactions().then(rows => { if (active) setPayments(rows); }).catch(() => {});
    return () => { active = false; };
  }, [user?.id]);
  const now = new Date();
  const today = dateKey(now);
  const items: Item[] = workshops.map(w => {
    const start = new Date(w.scheduled_at);
    const live = start <= now && now.getTime() < start.getTime() + w.duration_hours * 3600000;
    return { ...w, topic:w.category, date:dateKey(start), time:timeKey(start),
      status:w.is_published?(live?'Live':'Published'):'Draft', capacity:w.total_seats,
      booked:w.total_seats-w.remaining_seats, image:(w.is_published && w.image_url) || covers[w.category.trim().toLowerCase()] || defaultCover };
  });
  function paymentTotal(workshopId?: string) {
    if (!payments) return '—';
    const totals = new Map<string, number>();
    for (const payment of payments) {
      if (payment.paypal_capture_id && (!workshopId || payment.workshop_id===workshopId)) {
        totals.set(payment.currency,(totals.get(payment.currency)??0)+payment.amount_cents);
      }
    }
    return [...totals].map(([currency, cents]) => (cents/100).toLocaleString('en-US',{style:'currency',currency})).join(' / ') || '$0.00';
  }
  const [more,setMore]=useState<Item|null>(null);
  const [bulk,setBulk]=useState(false);
  const [invPage,setInvPage]=useState(0);
  const [query,setQuery]=useState('');
  const [status,setStatus]=useState(params.has('draft')?'Draft':params.has('published')?'Published':'');
  const [topic,setTopic]=useState('');
  const [month,setMonth]=useState('');
  const [list,setList]=useState(false);
  const [tab,setTab]=useState(tabs[0]);
  const [checked,setChecked]=useState<string[]>([]);
  const [edit,setEdit]=useState<Item|null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const editingId = edit?.id;
  const hasCover = Boolean(edit?.image_url);

  useEffect(() => {
    setCoverFile(null);
  }, [editingId]);

  useEffect(() => {
    const controller = new AbortController();
    let preview = '';
    setCoverPreview('');
    const showPreview = (blob: Blob) => {
      if (controller.signal.aborted) return;
      preview = URL.createObjectURL(blob);
      setCoverPreview(preview);
    };
    if (editingId && coverFile) {
      showPreview(coverFile);
    } else if (editingId && hasCover) {
      api.getMerchantWorkshopImage(editingId, controller.signal).then(showPreview).catch(error => {
        if (!controller.signal.aborted) setMessage(error.message);
      });
    }
    return () => {
      controller.abort();
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [editingId, hasCover, coverFile]);

  const [calendar,setCalendar]=useState(() => new Date(now.getFullYear(),now.getMonth(),1));
  const [day,setDay]=useState('');
  const matches=items.filter(w=>(w.title+' '+w.topic).toLowerCase().includes(query.toLowerCase())&&(!status||w.status===status||(status==='Published'&&w.is_published))&&(!topic||topic===w.topic)&&(!month||w.date.startsWith(month)));
  const inventory=matches.filter(w=>inTab(w,tab));
  const offset=(calendar.getDay()+6)%7;
  const days=new Date(calendar.getFullYear(),calendar.getMonth()+1,0).getDate();
  const allSessions=items.filter(w=>w.is_published).map(w=>({
    workshop:w,date:w.date,time:w.time,end:timeKey(new Date(Date.parse(w.scheduled_at)+w.duration_hours*3600000)),
  }));
  const sessions=allSessions.filter(s=>day?s.date===day:Date.parse(s.workshop.scheduled_at)+s.workshop.duration_hours*3600000>now.getTime())
    .sort((a,b)=>Date.parse(a.workshop.scheduled_at)-Date.parse(b.workshop.scheduled_at));
  const period=calendar.getFullYear()+'-'+String(calendar.getMonth()+1).padStart(2,'0');
  const page=Math.min(invPage,Math.max(0,Math.ceil(inventory.length/5)-1));
  const visible=inventory.slice(page*5,page*5+5);
  const inventoryLink=()=>document.getElementById('workshop-inventory')?.scrollIntoView({behavior:'smooth'});
  async function save(w: Item) {
    setSaving(true);
    setMessage('');
    try {
      const imageData = coverFile ? await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Could not read the workshop cover.'));
        reader.readAsDataURL(coverFile);
      }) : undefined;
      const updated = await api.updateWorkshop(w.id, {
        image_data: imageData, title:w.title, scheduled_at:new Date(w.date+'T'+w.time).toISOString(),
        ...(w.status==='Draft'?{is_published:false}:{}),
      });
      setWorkshops(rows=>rows.map(row=>row.id===w.id?updated:row));
      if (w.status!=='Draft'&&!updated.is_published) {
        const published = await api.publishWorkshop(w.id);
        setWorkshops(rows=>rows.map(row=>row.id===w.id?published:row));
      }
      setEdit(null);
      setMessage('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save the workshop.');
    } finally {
      setSaving(false);
    }
  }
  async function removeWorkshop(workshop: Item) {
    if (!window.confirm(`Permanently delete “${workshop.title}”?`)) return;
    setDeleting(true);
    setMessage('');
    try {
      await api.deleteWorkshop(workshop.id);
      setWorkshops(rows => rows.filter(row => row.id !== workshop.id));
      setChecked(ids => ids.filter(id => id !== workshop.id));
      setMore(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not delete the workshop.');
    } finally {
      setDeleting(false);
    }
  }
  async function duplicate(w:Item){
    try {
      const copy = await api.createWorkshop({
        title:w.title+' (copy)', description:w.description, category:w.category, difficulty:w.difficulty,
        price_cents:w.price_cents, currency:w.currency, total_seats:w.total_seats,
        scheduled_at:w.scheduled_at, duration_hours:w.duration_hours,
      });
      setWorkshops(rows=>[copy,...rows]);
      setMore(null);
      setMessage('');
    } catch { setMessage('Could not duplicate the workshop.'); }
  }
  async function unpublish(ids: string[]) {
    setMessage('');
    const results = await Promise.allSettled(ids.map(id=>api.updateWorkshop(id,{is_published:false})));
    const updated = results.flatMap(result=>result.status==='fulfilled'?[result.value]:[]);
    setWorkshops(rows=>rows.map(row=>updated.find(workshop=>workshop.id===row.id)??row));
    if (updated.length!==ids.length) setMessage('Could not unpublish all selected workshops.');
    setMore(null);
    setChecked([]);
    setBulk(false);
  }
  const badge=(w:Item)=>{
    const Icon=w.status==='Live'?Circle:w.status==='Draft'?Pencil:w.status==='Archived'?Archive:Check;
    return <b className={'ws-badge '+w.status}><Icon/>{w.status}</b>;
  };
  function dropdown(label:string,value:string,options:string[],change:(v:string)=>void){return <select aria-label={label} value={value} onChange={e=>change(e.target.value)}><option value="">{label}</option>{options.map(o=><option key={o}>{o}</option>)}</select>}
  return <div className="ws-layout"><main className="ws-main"><header className="studio-hero"><h1>Workshops <Calendar/></h1><p>Create, publish, and manage your workshops, live sessions, and schedules, track performance, and grow your learning impact with NUVENDRY.</p></header>
  {message&&<p role="status">{message}</p>}<div className="studio-kpis">{['Published Workshops','Live Sessions','Average Fill Rate','Revenue'].map((label,i)=>{const Icon=[Calendar,Video,Users,Database][i];return <section key={label}><span><Icon/>{label}</span><div><strong>{[items.filter(w=>w.is_published).length,items.filter(w=>w.status==='Live').length,items.length?Math.round(items.reduce((total,w)=>total+fill(w),0)/items.length)+'%':'—',paymentTotal()][i]}</strong></div></section>})}</div>
  <div className="ws-box ws-toolbar"><label><Search/><input aria-label="Search workshops" placeholder="Search workshops, topics, or keywords…" value={query} onChange={e=>setQuery(e.target.value)}/></label>{dropdown('All Statuses',status,['Live','Published','Draft'],setStatus)}{dropdown('All Topics',topic,[...new Set(items.map(w=>w.topic))],setTopic)}<select aria-label="Workshop format"><option>All Formats</option><option>Live Workshop</option></select>{dropdown('All Dates',month,[...new Set(items.map(w=>w.date.slice(0,7)).filter(Boolean))].sort(),setMonth)}<div>{[false,true].map(v=><button key={String(v)} aria-pressed={list===v} onClick={()=>setList(v)}>{v?<List/>:<LayoutGrid/>}{v?'List':'Grid'}</button>)}</div></div>
  <div className={'ws-cards'+(list?' ws-list':'')}>{(list?matches:matches.slice(0,6)).map(w=><article className="ws-box ws-card" key={w.id}><div className="ws-cover"><img src={w.image} alt="" className={w.is_published && w.image_url ? "ws-uploaded-cover" : undefined}/>{badge(w)}<button aria-label={'Manage '+w.title} onClick={()=>setMore(w)}><MoreHorizontal/></button></div><div className="ws-body"><h3>{w.title}</h3><p>{w.description}</p><div className="ws-person"><div><b>{user?.full_name}</b><small>Instructor</small></div></div><div className="ws-meta"><Calendar/>{dateLabel(w.date)}<span><Users/> {w.booked} / {w.capacity} ({fill(w)}%)</span></div><progress max={100} value={fill(w)}/></div></article>)}</div>{!matches.length&&<p>No workshops match these filters.</p>}
</main>
  <aside className="ws-side"><section className="ws-box"><h2><Calendar/>Upcoming Sessions</h2><header><button aria-label="Previous month" onClick={()=>setCalendar(new Date(calendar.getFullYear(),calendar.getMonth()-1,1))}>‹</button><b>{calendar.toLocaleDateString('en-US',{month:'long',year:'numeric'})}</b><button aria-label="Next month" onClick={()=>setCalendar(new Date(calendar.getFullYear(),calendar.getMonth()+1,1))}>›</button></header><div className="ws-calendar">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=><b key={d}>{d}</b>)}{Array.from({length:Math.ceil((offset+days)/7)*7},(_,i)=>{const d=new Date(calendar.getFullYear(),calendar.getMonth(),i-offset+1,12);const key=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');return <button key={key} className={d.getMonth()!==calendar.getMonth()?'outside':allSessions.some(s=>s.date===key)?'session':''} aria-current={key===today?'date':undefined} aria-pressed={day===key} onClick={()=>setDay(day===key?'':key)}>{d.getDate()}</button>})}</div><div className="ws-legend"><span>My workshop sessions ({allSessions.filter(s=>s.date.startsWith(period)).length})</span></div></section>
  <section className="ws-box"><h2><Calendar/>{day?dateLabel(day):'Next Sessions'}</h2>{sessions.slice(0,3).map(({workshop:w,date,time,end})=><button className="ws-next" key={w.id+date} onClick={()=>setEdit(w)}><img src={w.image} alt="" className={w.is_published && w.image_url ? "ws-uploaded-cover" : undefined}/><span><b>{w.title}</b><small><Calendar/>{dateLabel(date)} · {clock(time)} – {clock(end)}</small><small><Users/>{w.booked} / {w.capacity} seats {w.status==='Live'?' · Live':''}</small></span>{badge(w)}</button>)}{!sessions.length&&<p>No sessions scheduled.</p>}</section>
<section className="ws-box ws-quick-actions"><h2><Zap/>Quick Actions</h2><div className="ws-quick"><Link to="/merchant/offer-studio"><Plus/> Create Workshop</Link><button disabled={!items.length} onClick={()=>setEdit(items[0])}><Calendar/> Schedule Session</button><button onClick={inventoryLink}><Layers/> Manage Inventory</button><button aria-expanded={bulk} onClick={()=>setBulk(!bulk)}><Settings/> Bulk Actions <ChevronDown/></button>{bulk&&<div className="ws-bulk"><p>{checked.length?checked.length+' workshops selected':'Select workshops in the inventory.'}</p><button disabled={!checked.length} onClick={()=>unpublish(checked)}><Archive/>Unpublish selected</button></div>}</div></section>
  </aside>
  <section className="ws-box ws-inventory" id="workshop-inventory"><header><h2><Layers/>Workshop Inventory &amp; Schedule Management</h2><nav>{tabs.map(t=><button key={t} aria-pressed={t===tab} onClick={()=>{setTab(t);setInvPage(0)}}>{t} ({matches.filter(w=>inTab(w,t)).length})</button>)}</nav><Link to="/merchant/offer-studio">+ Create Workshop</Link></header><div className="studio-table"><table><thead><tr><th><input aria-label="Select visible workshops" type="checkbox" checked={!!visible.length&&visible.every(w=>checked.includes(w.id))} onChange={e=>setChecked(e.target.checked?[...new Set([...checked,...visible.map(w=>w.id)])]:checked.filter(id=>!visible.some(w=>w.id===id)))}/></th>{['Workshop Title','Topic','Format','Next Session','Seats','Fill Rate','Revenue','Status','Actions'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{visible.map(w=><tr key={w.id}><td><input type="checkbox" aria-label={'Select '+w.title} checked={checked.includes(w.id)} onChange={()=>setChecked(checked.includes(w.id)?checked.filter(id=>id!==w.id):[...checked,w.id])}/></td><td>{w.title}</td><td><b className="ws-topic">{w.topic}</b></td><td><span className="ws-format"><Video/>Live Workshop</span></td><td>{w.date?shortDate(w.date)+', '+clock(w.time):'—'}</td><td>{w.booked}/{w.capacity}</td><td><span className="ws-fill"><progress max={100} value={fill(w)}/>{fill(w)}%</span></td><td>{paymentTotal(w.id)}</td><td><div className="ws-actions"><button title="Edit workshop" aria-label={'Edit '+w.title} onClick={()=>setEdit(w)}><Pencil/></button><button title="Duplicate workshop" aria-label={'Duplicate '+w.title} onClick={()=>duplicate(w)}><Copy/></button><button title="More actions" aria-label={'More actions for '+w.title} onClick={()=>setMore(w)}><MoreHorizontal/></button></div></td></tr>)}</tbody></table></div>{inventory.length>5&&<div className="ws-pages"><button disabled={!page} onClick={()=>setInvPage(page-1)}>‹</button>{page+1} / {Math.ceil(inventory.length/5)}<button disabled={(page+1)*5>=inventory.length} onClick={()=>setInvPage(page+1)}>›</button></div>}</section>
  {more&&<dialog ref={el=>{if(el&&!el.open)el.showModal()}} className="ws-box ws-dialog" onClose={()=>setMore(null)}><h2>{more.title}</h2>{message&&<p role="status">{message}</p>}<div className="ws-options"><button onClick={()=>{setEdit(more);setMore(null)}}><Pencil/>Edit workshop</button><button onClick={()=>duplicate(more)}><Copy/>Duplicate as draft</button><button disabled={!more.is_published} onClick={()=>unpublish([more.id])}><Archive/>Unpublish workshop</button><button disabled={deleting} onClick={()=>void removeWorkshop(more)}><Trash2/>{deleting ? 'Deleting…' : 'Delete workshop'}</button><button disabled={deleting} onClick={()=>setMore(null)}>Close</button></div></dialog>}
  {edit&&<dialog ref={el=>{if(el&&!el.open)el.showModal()}} className="ws-box ws-dialog" onClose={()=>setEdit(null)}><form onSubmit={e=>{e.preventDefault();void save(edit)}}><h2>Edit workshop</h2>{message&&<p role="status">{message}</p>}<label>Title<input required value={edit.title} onChange={e=>setEdit({...edit,title:e.target.value})}/></label><label>Session date<input type="date" required value={edit.date} onChange={e=>setEdit({...edit,date:e.target.value})}/></label><label>Start time<input type="time" required={!!edit.date} value={edit.time} onChange={e=>setEdit({...edit,time:e.target.value})}/></label><label>Status<select value={edit.status==='Live'?'Published':edit.status} onChange={e=>setEdit({...edit,status:e.target.value})}>{['Published','Draft'].map(s=><option key={s}>{s}</option>)}</select></label><label>
    Workshop cover <small>Optional · JPG, PNG or WebP · 2 MB max</small>
    {coverPreview && <img src={coverPreview} alt="Workshop cover preview" className="w-full max-h-32 object-contain rounded-lg" />}
    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => {
      const file = event.currentTarget.files?.[0] ?? null;
      if (file && (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024)) {
        event.currentTarget.value = '';
        setCoverFile(null);
        setMessage('Choose a JPEG, PNG, or WebP image up to 2 MB.');
        return;
      }
      setCoverFile(file);
      setMessage('');
    }} />
  </label><button disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button> <button type="button" onClick={()=>setEdit(null)}>Cancel</button></form></dialog>}</div>;
}
