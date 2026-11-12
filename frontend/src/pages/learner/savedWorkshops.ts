import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError, useSyncRefresh } from '../../api/client';
import workshopImage from '../../assets/featured-desk-clean.jpg';

export interface SavedWorkshop {
  id: string;
  title: string;
  image: string;
  duration: string;
  tag: string;
  href: string;
}

export function savedWorkshopsKey(userId?: string) {
  return 'learner-saved-workshops:' + (userId || 'guest');
}

export function readSavedWorkshops(key: string): SavedWorkshop[] {
  try {
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(data) ? data.filter(item => typeof item?.id === 'string' && typeof item.href === 'string' && item.href.startsWith('/workshops')) : [];
  } catch { return []; }
}

export function useWorkshopBookmarks(userId?: string) {
  const [saved, setSaved] = useState<SavedWorkshop[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const generation = useRef(0);

  const load = useCallback(async () => {
    if (!userId) return;
    const request = ++generation.current;
    try {
      const workshops = await api.getWorkshopBookmarks();
      if (request !== generation.current) return;
      setSaved(workshops.map(workshop => ({
        id: workshop.id, title: workshop.title, tag: workshop.category,
        image: workshopImage, duration: `${workshop.duration_hours} hours`, href: `/workshops/${workshop.id}`,
      })));
    } catch {
      if (request === generation.current) setError('Unable to load saved workshops.');
    }
  }, [userId]);

  useEffect(() => {
    setSaved([]);
    setError('');
    void load();
    if (userId) {
      const key = savedWorkshopsKey(userId);
      const previous = readSavedWorkshops(key);
      if (previous.length) {
        void Promise.allSettled(previous.map(item => api.setWorkshopBookmark(item.id, true))).then(results => {
          if (results.every(result => result.status === 'fulfilled' || (result.reason instanceof ApiError && result.reason.status === 404))) {
            try { localStorage.removeItem(key); } catch { /* Browser storage may be unavailable. */ }
          }
        });
      }
    }
    return () => { generation.current += 1; };
  }, [load, userId]);
  useSyncRefresh(['bookmarks'], load);

  async function toggle(id: string) {
    if (busy || !userId) return;
    setBusy(true);
    setError('');
    try {
      await api.setWorkshopBookmark(id, !saved.some(workshop => workshop.id === id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update this bookmark.');
    } finally {
      setBusy(false);
    }
  }

  return { saved, busy, error, toggle };
}
