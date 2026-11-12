import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Bookmark, Check, CheckCircle, ChevronRight, Clock, Filter, Flame, GraduationCap, Grid, Info, Layers, List, Play, PlayCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api, useSyncRefresh } from '../../api/client';
import type { Reservation } from '../../types';
import { useWorkshopBookmarks } from './savedWorkshops';
import servingLab from '../../assets/learning-serving-lab.webp';
import spatial from '../../assets/workshop-spatial.jpg';
import agents from '../../assets/workshop-langgraph.jpg';
import './MyLearning.css';

const tabs = ['All Courses', 'In Progress', 'Completed', 'Saved'] as const;
type Tab = typeof tabs[number];

export function MyLearning() {
  const { user } = useAuth();
  const { saved, busy, error: bookmarkError, toggle } = useWorkshopBookmarks(user?.id);
  const [active, setActive] = useState<Tab>('All Courses');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [duration, setDuration] = useState('');
  const [sort, setSort] = useState('Recently Enrolled');
  const [list, setList] = useState(false);
  const [enrollments, setEnrollments] = useState<Reservation[]>([]);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    try {
      setEnrollments((await api.getMyReservations()).filter((reservation: Reservation) => reservation.status === 'confirmed'));
      setError('');
    } catch {
      setError('Unable to load your enrolled workshops.');
    }
  }, []);
  useEffect(() => { void load(); }, [load]);
  useSyncRefresh(['reservations', 'workshops'], load);

  const courses = enrollments.map(reservation => {
    const workshop = reservation.workshop;
    const category = workshop?.category ?? 'Workshop';
    const image = /spatial|geo/i.test(category) ? spatial : /llm|agent/i.test(category) ? agents : servingLab;
    return {
      id: reservation.workshop_id, title: reservation.workshop_title ?? 'Workshop',
      description: workshop?.description ?? '', category, image,
      hours: workshop?.duration_hours ?? 0, level: workshop?.difficulty ?? '',
      href: `/workshops/${reservation.workshop_id}`, scheduledAt: workshop?.scheduled_at,
      completed: reservation.attended === true,
    };
  });
  const savedIds = new Set(saved.map(item => item.id));
  const library = [...courses, ...saved.filter(item => !courses.some(course => course.id === item.id)).map(item => ({
    id: item.id, title: item.title, description: '', category: item.tag, image: item.image,
    hours: Number.parseInt(item.duration, 10), level: '', href: item.href, scheduledAt: undefined, completed: false,
  }))];
  const completed = courses.filter(course => course.completed);
  const upcoming = courses.filter(course => !course.completed && course.scheduledAt && Date.parse(course.scheduledAt) > Date.now());
  const current = [...upcoming].sort((a, b) => Date.parse(a.scheduledAt!) - Date.parse(b.scheduledAt!))[0];
  const totalHours = completed.reduce((hours, course) => hours + course.hours, 0);
  const progress = courses.length ? Math.round(completed.length / courses.length * 100) : 0;
  const visible = (active === 'Saved' ? library.filter(course => savedIds.has(course.id)) :
    active === 'Completed' ? completed : active === 'In Progress' ? upcoming : courses)
    .filter(course => (!category || course.category === category) && (!level || course.level === level) && (!duration || course.hours === Number(duration)));
  if (sort === 'Title A–Z') visible.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === 'Most progress') visible.sort((a, b) => Number(b.completed) - Number(a.completed));
  const counts = [courses.length, upcoming.length, completed.length, saved.length];
  const attendedDates = new Set(completed.flatMap(course => course.scheduledAt ? [new Date(course.scheduledAt).toDateString()] : []));
  const date = new Date();
  const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - (date.getDay() + 6) % 7);
  if (!attendedDates.has(date.toDateString())) date.setDate(date.getDate() - 1);
  let streak = 0;
  while (attendedDates.has(date.toDateString())) {
    streak += 1;
    date.setDate(date.getDate() - 1);
  }
  return <div className="learning-board">
    <div className="learning-main">
      {(error || bookmarkError) && <p role="alert" className="text-xs text-red-700">{error || bookmarkError}</p>}
      <header className="learning-hero"><h1>My Learning</h1><p>Your enrolled learning, in one place. Continue, track progress, and<br className="hidden xl:block"/> complete your courses to build new skills with NUVENDRY.</p></header>
      <div className="learning-stats">{[GraduationCap, PlayCircle, CheckCircle, Bookmark, Clock].map((Icon,i) => {
        const content = <><Icon/><span>{['Enrolled Courses','In Progress','Completed','Saved Courses','Total Learning Time'][i]}<strong>{i === 4 ? `${totalHours}h` : counts[i]}</strong></span><ChevronRight size={15}/></>;
        return i === 4 ? <a href="#learning-summary" key={i}>{content}</a> : <button key={i} onClick={() => setActive(tabs[i])}>{content}</button>;
      })}</div>
      <section className="learning-feature learning-panel">
        <Link to={current?.href ?? '/workshops'} className="learning-cover" aria-label={current ? `View ${current.title}` : 'Browse workshops'}><img src={current?.image ?? servingLab} alt=""/><PlayCircle/><small>{current ? 'Upcoming' : 'My Learning'}</small></Link>
        <div className="learning-feature-body"><b><Layers size={17}/> Currently Active Course</b>
          <h2>{current?.title ?? 'No upcoming enrolled workshops'}</h2>
          <p>{current?.description ?? 'Browse workshops to start learning.'}</p>
          <div className="learning-feature-foot">
            {current && <span><Clock/> {current.hours} hours <BarChart3/> {current.level}</span>}
            <Link className="learning-action" to={current?.href ?? '/workshops'}>{current ? 'View Workshop' : 'Browse Workshops'} <ArrowRight/></Link>
          </div>
        </div>
      </section>
      <div className="learning-tabs">{tabs.map((t,i) => <button key={t} aria-pressed={t === active} onClick={() => setActive(t)}>{[<Grid/>,<PlayCircle/>,<CheckCircle/>,<Bookmark/>][i]}{t} ({counts[i]})</button>)}</div>
      <section className="learning-panel learning-library"><div className="learning-filters"><b><Filter/> Filter &amp; Sort</b>
        {[[category,setCategory,'All Categories',[...new Set(library.map(c => c.category))]], [level,setLevel,'All Levels',[...new Set(library.map(c => c.level).filter(Boolean))]], [duration,setDuration,'All Durations',[...new Set(library.map(c => c.hours).filter(Boolean))].sort((a, b) => a - b).map(String)]] .map(entry => {
          const [value,setter,label,options] = entry as [string,(value:string)=>void,string,string[]];
          return <select key={label} aria-label={label} value={value} onChange={e => setter(e.target.value)}><option value="">{label}</option>{options.map(v => <option key={v} value={v}>{label === 'All Durations' ? v+' hours' : v}</option>)}</select>;
        })}
        <select aria-label="Sort courses" value={sort} onChange={e=>setSort(e.target.value)}>{['Recently Enrolled','Most progress','Title A–Z'].map(v=><option key={v} value={v}>Sort by: {v}</option>)}</select>
        <div>{[false,true].map(v=><button key={String(v)} aria-label={v?'List view':'Grid view'} aria-pressed={list===v} onClick={()=>setList(v)}>{v?<List/>:<Grid/>}</button>)}</div></div>
        <div className={'learning-courses' + (list ? ' learning-list' : '')}>
          {visible.map(course => (
            <article key={course.id}>
              <div className="learning-thumb"><img src={course.image} alt=""/><small>{course.completed ? '✓ Completed' : course.scheduledAt ? 'Enrolled' : 'Saved'}</small><small>{course.category}</small></div>
              <div className="learning-details">
                <h3>{course.title}</h3>
                <p><Clock/> {course.hours} hours</p>
                <div className="learning-meter"><progress value={course.completed ? 100 : 0} max={100}/>{course.completed ? 'Attended' : 'Attendance pending'}</div>
                <div className="learning-card-actions">
                  <Link to={course.href}>{course.completed ? 'Review Workshop' : 'View Workshop'} <ArrowRight/></Link>
                  <button disabled={busy} aria-label={'Save ' + course.title} aria-pressed={savedIds.has(course.id)} onClick={() => toggle(course.id)}><Bookmark fill={savedIds.has(course.id) ? 'currentColor' : 'none'}/></button>
                </div>
              </div>
            </article>
          ))}
        </div>
        {!visible.length && <p className="p-4">No courses match these filters.</p>}
      </section>
    </div>
    <aside className="learning-side">
      <section className="learning-panel" id="learning-summary"><h2><Layers/>My Learning Summary</h2><div className="learning-inset">
        <div className="learning-overall"><strong>{progress}%</strong><div><h3>Overall Progress</h3><p>{completed.length} of {courses.length} workshops attended</p>
          {['Completed', 'In Progress', 'Awaiting Attendance'].map((label, index) => <div className="learning-key" key={label}><i>{index === 0 ? <Check size={10}/> : index === 1 ? <Play size={9} fill="currentColor"/> : null}</i>{label}<b>{[completed.length, upcoming.length, courses.length - completed.length - upcoming.length][index]}</b></div>)}
        </div></div>
        <div className="learning-totals"><span><Clock/>Total Learning Time<strong>{totalHours}h</strong></span><span><BarChart3/>Topics in Progress<strong>{new Set(upcoming.map(course => course.category)).size}</strong></span></div>
      </div></section>
      <section className="learning-panel"><h2><PlayCircle/> Next Workshop</h2><div className="learning-inset">
        <div className="learning-next"><img src={current?.image ?? servingLab} alt=""/><div><small>{current?.category ?? 'Schedule'}</small><h3>{current?.title ?? 'No upcoming workshops'}</h3>{current?.scheduledAt && <div className="lesson-meta"><span><Clock size={14}/> {new Date(current.scheduledAt).toLocaleString()}</span></div>}</div></div>
        <Link className="learning-action" to={current?.href ?? '/app/reservations'}>{current ? 'View Workshop' : 'View Reservations'} <ArrowRight/></Link>
      </div></section>
      <section className="learning-panel learning-streak"><h2><Flame/>Learning Streak <span className="streak-info" title="Consecutive days with recorded workshop attendance"><Info size={16}/></span></h2><div className="learning-inset">
        <div className="learning-overall"><strong>{streak}<small>days</small></strong><div><h3>Workshop attendance</h3><p>{streak ? `${streak} consecutive days of attendance` : 'No current streak'}</p></div></div>
        <div className="learning-week">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((label, index) => {
          const day = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + index);
          return <span key={label}><i>{attendedDates.has(day.toDateString()) && <Check size={13}/>}</i>{label}</span>;
        })}</div>
      </div></section>
    </aside>
  </div>;
}
