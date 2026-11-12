import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {Calendar,Users,CheckCircle, XCircle, ChevronRight, ChevronLeft, Check, Search, Filter, MoreHorizontal, MapPin, Monitor, CreditCard, Clock, Hourglass, Download, Mail, Zap, Tag} from 'lucide-react';
import {api, subscribeSync} from '../../api/client';
import {Workshop} from '../../types';
import {AccountReservations} from './AccountReservations';
import sessionImage from '../../assets/workshop-studio-0.webp';
import './Workshops.css';
import './Reservations.css';

const periods=['Upcoming','Today','Completed'] as const;
type Period=typeof periods[number];
const learners=['Maya Chen','James Ortiz','Priya Nair','Liam Brooks','Sofia Romero','Ethan Wu','Ava Mitchell','Noah Kim','Ella Singh','Daniel Reed','Amir Ali','Grace Lin','Zoe Park','Luca Bell','Nora Patel','Ian Cole','Lily Wang','Leo Torres'];
const portraits=Array.from({length:8},(_,i)=>new URL(`../../assets/attendee-${i}.webp`,import.meta.url).href);
type Row = {
  id: string; order: string; name: string; email: string; photo?: string; workshop: string;
  date: Date; period: Period; reserved: string; attendance: string; time: string; payment: string;
};
const periodFor = (date: Date, today = new Date()): Period =>
  date.toDateString() === today.toDateString() ? 'Today' : date > today ? 'Upcoming' : 'Completed';
const timeLabel = (date: Date) => date.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
function Badge({value}:{value:string}){
  const Icon=value==='Paid'?CreditCard:value==='Confirmed'?Check:value==='Present'?Tag:value==='Waitlisted'?Hourglass:value==='No-Show'?XCircle:Clock;
  return value==='—'?<>—</>:<span className={'ra-badge '+(value==='Waitlisted'||value==='Not Checked In'?'amber':value==='No-Show'?'red':'')}><Icon/>{value}</span>;
}
function Schedule({dates,select}:{dates:Date[];select:(day:Date)=>void}){
  const [month,setMonth]=useState(() => { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), 1); });
  const offset=(month.getDay()+6)%7;
  const count=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
  return <section className="ws-box"><h2><Calendar/>My Schedule</h2><header><button aria-label="Previous month" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))}><ChevronLeft/></button><b>{month.toLocaleDateString('en-US',{month:'long',year:'numeric'})}</b><button aria-label="Next month" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))}><ChevronRight/></button></header>
    <div className="ws-calendar">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=><b key={d}>{d}</b>)}{Array.from({length:Math.ceil((offset+count)/7)*7},(_,i)=>{
      const d=new Date(month.getFullYear(),month.getMonth(),i-offset+1);const num=d.getDate();
      const event=dates.some(date => date.toDateString() === d.toDateString());
      return <button key={i} disabled={!event} aria-label={d.toDateString()} className={d.getMonth()!==month.getMonth()?'outside':event?'session':''} onClick={()=>select(d)}>{num}</button>;
    })}</div><div className="ws-legend"><span>My workshops</span><span>Other events</span></div></section>;
}
export function MerchantReservations(){
  const [account, setAccount] = useState(false);
  const [period,setPeriod]=useState<Period>('Upcoming');
  const [rows,setRows]=useState<Row[]>([]);
  const [workshops,setWorkshops]=useState<Workshop[]>([]);
  const [loadState,setLoadState]=useState('Loading reservations…');
  const [selectedDate,setSelectedDate]=useState<Date | null>(null);
  useEffect(() => {
    let active = true;
    let generation = 0;
    let firstLoad = true;
    const load = async () => {
      const request = ++generation;
      try {
        const [reservations, sessions] = await Promise.all([api.getMerchantReservations(), api.getMerchantWorkshops()]);
        if (!active || request !== generation) return;
        const nextRows: Row[] = reservations.map(r => {
          const date = new Date(r.scheduled_at ?? sessions.find(w => w.id === r.workshop_id)?.scheduled_at);
          const portrait = learners.indexOf(r.buyer_name);
          return {
            id:r.id, order:r.paypal_order_id ?? '—', name:r.buyer_name, email:r.buyer_email,
            photo:portrait >= 0 ? portraits[portrait % portraits.length] : undefined,
            workshop:r.workshop_title, date, period:periodFor(date),
            reserved:r.status === 'confirmed' ? 'Confirmed' : r.status.replaceAll('_',' '),
            attendance:r.attended ? 'Present' : r.attendance_marked_at ? 'No-Show' : 'Not Checked In',
            time:r.attended && r.attendance_marked_at ? timeLabel(new Date(r.attendance_marked_at)) : '—',
            payment:r.status === 'refunded' ? 'Refunded' : r.paypal_capture_id ? 'Paid' : '—',
          };
        });
        if (firstLoad && nextRows.length) {
          setPeriod((['Today','Upcoming','Completed'] as const).find(p => nextRows.some(row => row.period === p)) ?? 'Upcoming');
        }
        firstLoad = false;
        setRows(nextRows);
        setWorkshops(sessions);
        setLoadState('');
      } catch {
        if (active && request === generation) setLoadState('Could not load reservations.');
      }
    };
    void load();
    const unsubscribe = subscribeSync(['reservations','workshops'],load);
    window.addEventListener('focus',load);
    return () => { active = false; unsubscribe(); window.removeEventListener('focus',load); };
  }, []);
  const [query,setQuery]=useState('');
  const [filter,setFilter]=useState('');
  const [filters,setFilters]=useState(false);
  const [page,setPage]=useState(0);
  const [selected,setSelected]=useState<string[]>([]);
  const [menu,setMenu]=useState<Row|null>(null);
  const [notice,setNotice]=useState('');
  const [reminder,setReminder]=useState<string[]|null>(null);
  const [message,setMessage]=useState('');
  const filtered=rows.filter(r=>(query.trim()||r.period===period)&&(!selectedDate||r.date.toDateString()===selectedDate.toDateString())&&(!filter||r.attendance===filter)&&[r.name,r.email,r.workshop,r.order].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
  const index=Math.min(page,Math.max(0,Math.ceil(filtered.length/8)-1));
  const visible=filtered.slice(index*8,index*8+8);
  function switchPeriod(p:Period){setPeriod(p);setSelectedDate(null);setPage(0);setFilter('');setSelected([]);setQuery('');setNotice('')}
  function togglePage(){
    const ids=visible.map(r=>r.id);
    setSelected(ids.every(id=>selected.includes(id))?selected.filter(id=>!ids.includes(id)):[...new Set([...selected,...ids])]);
  }
  async function mark(ids:string[],value='Present'){
    const eligible=rows.filter(r=>ids.includes(r.id)&&r.reserved==='Confirmed');
    if(!eligible.length){setNotice('Select a confirmed reservation first.');return}
    const results = await Promise.allSettled(eligible.map(r => api.markAttendance(r.id,value==='Present')));
    const saved = results.filter(result => result.status === 'fulfilled').length;
    setNotice(saved + ' updated. ' + (eligible.length - saved) + ' failed.');
    setMenu(null);
  }
  function remind(ids:string[]){if(!ids.length){setNotice('Select learners to prepare a reminder.');return}setReminder(ids);setMessage('A reminder about your upcoming workshop. We look forward to seeing you!');setMenu(null)}
  function download(){
    const records=selected.length?rows.filter(r=>selected.includes(r.id)):filtered;
    const csv=[['Learner','Email','Workshop','Order','Reservation','Attendance','Check-in','Payment'],...records.map(r=>[r.name,r.email,r.workshop,r.order,r.reserved,r.attendance,r.time,r.payment])];
    const url=URL.createObjectURL(new Blob([csv.map(row=>row.map(v=>'"'+v.replace(/"/g,'""')+'"').join(',')).join('\r\n')],{type:'text/csv'}));const a=document.createElement('a');a.href=url;a.download='workshop-attendance.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  const checked=visible.length>0&&visible.every(r=>selected.includes(r.id));
  const published = workshops.filter(w => w.is_published);
  const future = published.filter(w => Date.parse(w.scheduled_at) > Date.now())
    .sort((a,b) => Date.parse(a.scheduled_at) - Date.parse(b.scheduled_at));
  const next = future[0];
  const confirmed = rows.filter(r => r.reserved === 'Confirmed');
  const attendance = confirmed.filter(r => r.attendance === 'Present' || r.attendance === 'No-Show');
  const rate = (status: string) => attendance.length ? Math.round(100 * attendance.filter(r => r.attendance === status).length / attendance.length) + '%' : '—';
  return <div className="ra-layout"><div className="ra-main"><header className="studio-hero"><h1>Reservations &amp; Attendance <Calendar/></h1><p>Manage learner reservations, track attendance, and ensure a smooth workshop experience with NUVENDRY.</p></header>
  <div className="studio-kpis">{['Upcoming Sessions','Reserved Seats','Check-In Rate','No-Show Rate'].map((title,i)=>{const Icon=[Calendar,Users,CheckCircle,XCircle][i];return <section key={title}><span><Icon/>{title}</span><div><strong>{[future.length,confirmed.length,rate('Present'),rate('No-Show')][i]}{i===1&&<small> / {workshops.reduce((sum,w) => sum + w.total_seats,0)}</small>}</strong><ChevronRight size={14}/></div></section>})}</div>
  <div className="ra-toolbar"><nav>{periods.map((p,i)=>{const Icon=i===2?Check:Calendar;return <button key={p} aria-pressed={period===p} onClick={()=>switchPeriod(p)}><Icon/>{p} ({rows.filter(row=>row.period===p).length})</button>})}</nav><label><Search/><input aria-label="Search reservations" placeholder="Search learners, workshops, or order #..." value={query} onChange={e=>{setQuery(e.target.value);setPage(0);setSelected([])}}/></label><button aria-label="Filter attendance" aria-expanded={filters} onClick={()=>setFilters(!filters)}><Filter/></button><details><summary aria-label="More roster actions"><MoreHorizontal/></summary><button onClick={download}><Download/>Export Attendance</button></details></div>
  {filters&&<label>Attendance status　<select value={filter} onChange={e=>{setFilter(e.target.value);setSelected([]);setPage(0)}}>{['','Present','Not Checked In','No-Show'].map(x=><option key={x} value={x}>{x||'All statuses'}</option>)}</select></label>}
  <section className="ra-roster ws-box"><header><h2>{period==='Today'?'Today’s':period} Attendee Roster <small>({filtered.length} Reservations)</small></h2></header>{period==='Today'&&<div className="ra-location"><span><Calendar/>{new Date().toLocaleDateString()}</span></div>}
  <div className="ra-scroll"><table><thead><tr><th><input type="checkbox" aria-label="Select page" checked={checked} onChange={togglePage}/></th>{['Learner','Workshop','Reservation Status','Attendance Status','Check-In Time','Payment Status','Actions'].map(t=><th key={t}>{t}</th>)}</tr></thead><tbody>{visible.map(r=><tr key={r.id}><td><input aria-label={'Select '+r.name} type="checkbox" checked={selected.includes(r.id)} onChange={()=>setSelected(selected.includes(r.id)?selected.filter(id=>id!==r.id):[...selected,r.id])}/></td><td><div className="ra-person">{r.photo && <img src={r.photo} alt=""/>}<div><b>{r.name}</b><small>{r.email}</small></div></div></td><td><span className="ra-workshop" title={r.workshop}>{r.workshop}</span></td><td><Badge value={r.reserved}/></td><td><Badge value={r.attendance}/></td><td>{r.time}</td><td><Badge value={r.payment}/></td><td><button className="ra-dots" aria-label={'Actions for '+r.name} onClick={()=>setMenu(r)}><MoreHorizontal/></button></td></tr>)}</tbody></table>{!visible.length&&<p role="status">{loadState || "No matching reservations."}</p>}</div>
  <footer><input aria-label="Toggle visible reservations" type="checkbox" checked={checked} onChange={togglePage}/>{selected.length} selected<button onClick={()=>mark(selected)}><Check/>Mark Present</button><button onClick={()=>remind(selected)}><Mail/>Send Reminder</button><button onClick={download}><Download/>Export Attendance</button><div className="ra-pages">{filtered.length?index*8+1:0} – {Math.min(index*8+8,filtered.length)} of {filtered.length}<button aria-label="Previous page" disabled={!index} onClick={()=>setPage(index-1)}><ChevronLeft/></button><button aria-label="Next page" disabled={(index+1)*8>=filtered.length} onClick={()=>setPage(index+1)}><ChevronRight/></button></div></footer>{notice&&<p role="status">{notice}</p>}</section></div>
  <aside className="ws-side"><Schedule dates={published.map(w=>new Date(w.scheduled_at))} select={date=>{switchPeriod(periodFor(date));setSelectedDate(date)}}/><section className="ws-box ra-next"><h2><Calendar/>Next Session</h2>{next ? <><Link to="/merchant/workshops"><img src={sessionImage} alt=""/><b>{next.title}</b><ChevronRight/></Link><ul><li><Calendar/>{new Date(next.scheduled_at).toLocaleString()}</li><li><Clock/>{next.duration_hours} hours</li><li><Users/>{next.total_seats-next.remaining_seats} / {next.total_seats} seats</li></ul></> : <p>No upcoming sessions.</p>}</section>
  <section className="ws-box"><h2><Zap/>Quick Actions</h2><div className="ws-quick"><button onClick={download}><Download/>Export Attendance</button><button onClick={()=>remind(selected)}><Mail/>Send Reminder</button><button onClick={()=>mark(selected)}><Check/>Mark Present</button><button onClick={()=>setAccount(true)}><Users/>Manage Reservations</button></div></section></aside>
  {account && <dialog className="ws-box ws-dialog ra-manage-dialog" ref={el => { if (el && !el.open) el.showModal(); }} onClose={() => setAccount(false)}>
    <button onClick={() => setAccount(false)}>Close</button>
    <AccountReservations/>
  </dialog>}
  {(menu||reminder)&&<dialog className="ws-box ws-dialog" ref={el=>{if(el&&!el.open)el.showModal()}} onClose={()=>{setMenu(null);setReminder(null)}}>{menu?<><h2>{menu.name}</h2><p>{menu.email} · {menu.order}</p><div className="ws-options">{menu.reserved==='Confirmed'&&<><button onClick={()=>mark([menu.id])}><Check/>Mark Present</button><button onClick={()=>mark([menu.id],'No-Show')}><XCircle/>Mark No-Show</button></>}<button onClick={()=>remind([menu.id])}><Mail/>Send Reminder</button><button onClick={()=>setMenu(null)}>Close</button></div></>:<><h2>Workshop reminder</h2><p>{reminder?.length} recipient(s)</p><textarea aria-label="Reminder message" value={message} onChange={e=>setMessage(e.target.value)}/><button disabled={!message.trim()} onClick={()=>{const recipients=rows.filter(row=>reminder?.includes(row.id)).map(row=>row.email).join(',');window.location.href='mailto:?bcc='+encodeURIComponent(recipients)+'&body='+encodeURIComponent(message);setReminder(null)}}>Open email draft</button><button onClick={()=>setReminder(null)}>Cancel</button></>}</dialog>}</div>;
}
