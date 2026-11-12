import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Bell, Check, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { api, useSyncRefresh, type AccountNotification } from '../api/client';

export function InstructorNotifications() {
  const [items, setItems] = useState<AccountNotification[]>([]);
  const [status, setStatus] = useState('Loading notifications…');
  const panel = useRef<HTMLDetailsElement>(null);
  const generation = useRef(0);
  const { pathname } = useLocation();

  const load = useCallback(async () => {
    const request = ++generation.current;
    try {
      const notifications = await api.getNotifications();
      if (request !== generation.current) return;
      setItems(notifications);
      setStatus('');
    } catch {
      if (request === generation.current) setStatus('Could not load notifications.');
    }
  }, []);

  useEffect(() => {
    void load();
    window.addEventListener('focus', load);
    return () => {
      generation.current++;
      window.removeEventListener('focus', load);
    };
  }, [load]);
  useSyncRefresh(['notifications'], load);

  function close() {
    if (panel.current) panel.current.open = false;
  }

  useEffect(close, [pathname]);

  function dismiss() {
    close();
    panel.current?.querySelector('summary')?.focus();
  }

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !panel.current?.contains(event.target)) close();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  async function markRead(id: string) {
    try {
      await api.markNotificationRead(id);
      setItems(current => current.map(item => item.id === id ? { ...item, is_read: true } : item));
    } catch {
      setStatus('Could not mark the notification as read.');
    }
  }

  const unread = items.filter(item => !item.is_read).length;
  return (
    <details ref={panel} onToggle={event => { if (event.currentTarget.open) void load(); }}
      onKeyDown={event => {
        if (event.key === 'Escape' && panel.current?.open) {
          event.stopPropagation();
          dismiss();
        }
      }}>
      <summary className="studio-bell relative cursor-pointer"
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}>
        <Bell size={19} />
        {unread > 0 && <span aria-hidden="true" className="absolute -top-1 -right-1 rounded-full bg-forest px-1.5 text-[10px] text-white">{unread}</span>}
      </summary>
      <section aria-label="Instructor notifications"
        className="absolute right-4 top-full z-50 mt-2 flex max-h-[70vh] w-[min(26rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-warmgray bg-white shadow-xl">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-warmgray px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">Notifications</h2>
            {unread > 0 && <span className="rounded-full bg-mint px-2 py-0.5 text-xs font-semibold text-forest">{unread} unread</span>}
          </div>
          <button type="button" aria-label="Close notifications" title="Close notifications" onClick={dismiss}
            className="grid size-9 shrink-0 place-items-center rounded-full text-charcoal/70 hover:bg-ivory hover:text-charcoal focus-visible:ring-2 focus-visible:ring-forest">
            <X size={19} aria-hidden="true" />
          </button>
        </header>
        {status && <p role="status" className="px-4 py-3 text-sm">{status}</p>}
        {!status && !items.length && <div className="grid justify-items-center gap-2 px-4 py-8 text-sm text-charcoal/70">
          <Bell size={22} aria-hidden="true" />
          <p>No notifications yet.</p>
        </div>}
        <ul className="min-h-0 divide-y divide-warmgray overflow-y-auto overscroll-contain">
          {items.map(item => (
            <li key={item.id} className={`flex gap-3 px-4 py-3.5 text-sm ${item.is_read ? '' : 'bg-mint/40'}`}>
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-mint text-forest">
                <Bell size={16} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{item.title}</p>
                  {!item.is_read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-forest">
                    <span className="sr-only">Unread</span>
                  </span>}
                </div>
                <p className="mt-1 wrap-break-word leading-relaxed text-charcoal/80">{item.message}</p>
                <time className="mt-2 block text-xs text-charcoal/70" dateTime={item.created_at}>
                  {new Date(item.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </time>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {item.link && <Link className="inline-flex items-center gap-1 rounded-lg border border-warmgray bg-white px-2.5 py-1.5 font-semibold text-forest hover:bg-ivory" to={item.link}
                    onClick={() => { close(); if (!item.is_read) void markRead(item.id); }}>View details <ArrowUpRight size={13} aria-hidden="true" /></Link>}
                  {!item.is_read && <button type="button" className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-semibold text-forest hover:bg-mint"
                    onClick={() => void markRead(item.id)}><Check size={13} aria-hidden="true" /> Mark as read</button>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </details>
  );
}
