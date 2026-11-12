import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Clock } from 'lucide-react';
import type { Workshop } from '../types';
import './UpcomingWorkshops.css';

const eventDate = new Intl.DateTimeFormat('en-US', {
  weekday: 'short', month: 'short', day: 'numeric',
  hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
});

export function UpcomingWorkshops({ workshops, loading, failed, retry }: {
  workshops: Workshop[];
  loading: boolean;
  failed: boolean;
  retry: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const now = Date.now();
  const events = workshops
    .filter(workshop => workshop.is_published && Date.parse(workshop.scheduled_at) > now)
    .sort((a, b) => Date.parse(a.scheduled_at) - Date.parse(b.scheduled_at))
    .slice(0, 3);

  return (
    <section aria-labelledby="upcoming-workshops-title" className="bg-[#F1F7F2] border-y border-[#DCE8DE] px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="upcoming-workshops-title" className="flex items-center gap-3 font-serif text-3xl font-bold text-[#143B2E]">
              <CalendarDays aria-hidden="true" className="h-6 w-6 text-[#165C45]" />
              Upcoming Events
            </h2>
            <p className="mt-2 text-sm text-[#42564A]">Pick a date, meet other learners, and build something together.</p>
          </div>
          <Link to="/workshops" className="inline-flex items-center gap-2 text-sm font-semibold text-[#165C45] hover:underline">
            Explore all workshops <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>
        {events.length > 0 ? (
          <ul className="mt-6 grid gap-3 md:grid-cols-3">
            {events.map((workshop, index) => (
              <motion.li
                key={workshop.id}
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: reduceMotion ? 0 : 0.42, delay: reduceMotion ? 0 : index * 0.14 }}
              >
                <Link to={`/workshops/${workshop.id}`} className="landing-event-card group flex h-full flex-col gap-2 rounded-2xl border border-[#DCE8DE] bg-white p-5 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#165C45]">
                  <time dateTime={workshop.scheduled_at} className="text-xs font-semibold text-[#165C45]">{eventDate.format(new Date(workshop.scheduled_at))}</time>
                  <h3 className="font-serif text-lg font-bold text-[#143B2E]">{workshop.title}</h3>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-xs text-[#42564A]">
                    <span className="inline-flex items-center gap-1"><Clock aria-hidden="true" size={14} /> {workshop.duration_hours} h</span>
                    <span>{workshop.remaining_seats > 0 ? `${workshop.remaining_seats} seats left` : 'Sold out'}</span>
                    <ArrowRight aria-hidden="true" size={16} className="landing-event-arrow text-[#165C45]" />
                  </div>
                </Link>
              </motion.li>
            ))}
          </ul>
        ) : (
          <p role="status" className="mt-5 text-sm text-[#42564A]">
            {loading ? 'Loading upcoming events…' : failed ? <>Upcoming events are unavailable. <button type="button" onClick={retry} className="font-semibold underline">Retry</button></> : 'No upcoming workshops are scheduled yet.'}
          </p>
        )}
      </div>
    </section>
  );
}
