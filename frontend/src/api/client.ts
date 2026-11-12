import type { AdvisorTurn } from '../types';
import { useEffect, useRef } from 'react';

const API_BASE = '/api/v1';

export type SyncDomain =
  | 'demands'
  | 'clusters'
  | 'workshops'
  | 'bookmarks'
  | 'reservations'
  | 'rewards'
  | 'analytics'
  | 'payments'
  | 'evaluations'
  | 'notifications'
  | 'user'
  | 'admin';

type SyncListener = () => void;
const syncListeners = new Map<SyncDomain, Set<SyncListener>>();
let syncChannel: BroadcastChannel | null = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    syncChannel = new BroadcastChannel('nuvendry_state_sync');
    syncChannel.onmessage = (event) => {
      const domains = event.data?.domains as SyncDomain[] | undefined;
      if (Array.isArray(domains)) {
        notifyLocalListeners(domains);
      }
    };
  } catch {
    syncChannel = null;
  }
}

function notifyLocalListeners(domains: SyncDomain[]) {
  const triggered = new Set<SyncListener>();
  for (const domain of domains) {
    const set = syncListeners.get(domain);
    if (set) {
      set.forEach((cb) => triggered.add(cb));
    }
  }
  triggered.forEach((cb) => {
    try {
      cb();
    } catch {
      // Ignore listener errors to protect other subscribers
    }
  });
}

export function emitSync(domains: SyncDomain[]) {
  notifyLocalListeners(domains);
  if (syncChannel) {
    try {
      syncChannel.postMessage({ domains, ts: Date.now() });
    } catch {
      // Ignore broadcast errors
    }
  }
}

export function subscribeSync(domains: SyncDomain[], listener: SyncListener): () => void {
  for (const domain of domains) {
    if (!syncListeners.has(domain)) {
      syncListeners.set(domain, new Set());
    }
    syncListeners.get(domain)!.add(listener);
  }
  return () => {
    for (const domain of domains) {
      syncListeners.get(domain)?.delete(listener);
    }
  };
}

export function useSyncRefresh(domains: SyncDomain[], onRefresh: () => void) {
  const callbackRef = useRef(onRefresh);
  callbackRef.current = onRefresh;
  const domainKey = domains.join(',');

  useEffect(() => {
    const domainList = domainKey.split(',').filter(Boolean) as SyncDomain[];
    return subscribeSync(domainList, () => {
      callbackRef.current();
    });
  }, [domainKey]);
}

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const inFlightMutations = new Map<string, Promise<any>>();

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const isMutation = method !== 'GET' && method !== 'HEAD';
  const mutationKey = isMutation ? `${method}:${url}:${typeof options.body === 'string' ? options.body : ''}` : '';

  if (isMutation && inFlightMutations.has(mutationKey)) {
    return inFlightMutations.get(mutationKey) as Promise<T>;
  }

  const execute = async (): Promise<T> => {
    const token = localStorage.getItem('nuvendry_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const detail = data?.detail;
      const errorMsg =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail) && detail[0]?.msg
            ? detail[0].msg
            : `API Request Failed with status ${response.status}`;
      throw new ApiError(errorMsg, response.status, data);
    }

    return data as T;
  };

  if (!isMutation) {
    return execute();
  }

  const promise = execute().finally(() => {
    inFlightMutations.delete(mutationKey);
  });
  inFlightMutations.set(mutationKey, promise);
  return promise;
}

export const api = {
  // Auth & Profile
  register: async (payload: any) => {
    const res = await apiRequest<any>('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
    emitSync(['user', 'admin']);
    return res;
  },
  login: (payload: any) => apiRequest<any>('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => apiRequest<any>('/auth/me'),
  updateProfile: async (payload: any) => {
    const res = await apiRequest<any>('/auth/me', { method: 'PATCH', body: JSON.stringify(payload) });
    emitSync(['user']);
    return res;
  },
  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest<void>('/auth/password', {
      method: 'POST',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    }),
  getWorkspaceSettings: () => apiRequest<Record<string, any>>('/auth/settings'),
  updateLearnerSettings: (payload: { full_name?: string; location?: string; photo?: string; preferences?: Partial<{ format: string; level: string; time: string; interests: string[] }> }) =>
    apiRequest('/auth/settings/learner', { method: 'PATCH', body: JSON.stringify(payload) }),
  saveWorkspaceSettings: (payload: Record<string, any>) => apiRequest<Record<string, any>>('/auth/settings', {method:'PUT', body:JSON.stringify(payload)}),
  getNotifications: () => apiRequest<any[]>('/auth/notifications'),
  markNotificationRead: async (notificationId: string) => {
    const res = await apiRequest<any>(`/auth/notifications/${notificationId}/read`, { method: 'POST' });
    emitSync(['notifications']);
    return res;
  },
  logout: () => {
    localStorage.removeItem('nuvendry_token');
    return apiRequest<any>('/auth/logout', { method: 'POST' });
  },

  // Demands
  createDemand: async (payload: any) => {
    const res = await apiRequest<any>('/demands', { method: 'POST', body: JSON.stringify(payload) });
    emitSync(['demands', 'clusters', 'analytics']);
    return res;
  },
  getDemands: (params: { mine_only?: boolean; topic?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.mine_only) query.set('mine_only', 'true');
    if (params.topic) query.set('topic', params.topic);
    return apiRequest<any[]>(`/demands?${query.toString()}`);
  },
  getDemand: (id: string) => apiRequest<any>(`/demands/${id}`),
  updateDemand: async (id: string, payload: any) => {
    const res = await apiRequest<any>(`/demands/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
    emitSync(['demands', 'clusters', 'analytics']);
    return res;
  },
  deleteDemand: async (id: string) => {
    await apiRequest<void>(`/demands/${id}`, { method: 'DELETE' });
    emitSync(['demands', 'clusters', 'analytics']);
  },

  // AI & Clusters
  extractDemand: (raw_prompt: string) => apiRequest<any>(`/ai/extract-demand?raw_prompt=${encodeURIComponent(raw_prompt)}`, { method: 'POST' }),
  getClusters: () => apiRequest<any[]>('/ai/clusters'),
  getCluster: (id: string) => apiRequest<any>(`/ai/clusters/${id}`),
  matchDemands: async () => {
    const res = await apiRequest<any[]>('/ai/match-demands', { method: 'POST' });
    emitSync(['clusters', 'demands', 'analytics']);
    return res;
  },
  generateOffer: async (cluster_id: string) => {
    const res = await apiRequest<any>(`/ai/generate-offer?cluster_id=${encodeURIComponent(cluster_id)}`, { method: 'POST' });
    emitSync(['clusters']);
    return res;
  },
  getRecommendations: () => apiRequest<any[]>('/ai/recommendations'),
  getAdvisorHistory: () => apiRequest<AdvisorTurn[]>('/ai/advisor'),
  resetAdvisorHistory: () => apiRequest<void>('/ai/advisor', { method: 'DELETE' }),
  askAdvisor: (question: string) => apiRequest<AdvisorTurn>('/ai/advisor', { method: 'POST', body: JSON.stringify({ question }) }),

  // Workshops
  getWorkshopBookmarks: () => apiRequest<{ id: string; title: string; category: string; duration_hours: number }[]>('/workshops/bookmarks'),
  setWorkshopBookmark: async (id: string, saved: boolean) => {
    await apiRequest<void>(`/workshops/${id}/bookmark`, { method: saved ? 'PUT' : 'DELETE' });
    emitSync(['bookmarks']);
  },
  getWorkshops: (params: { category?: string; difficulty?: string; search?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.set('category', params.category);
    if (params.difficulty) query.set('difficulty', params.difficulty);
    if (params.search) query.set('search', params.search);
    return apiRequest<any[]>(`/workshops?${query.toString()}`);
  },
  getWorkshop: (id: string) => apiRequest<any>(`/workshops/${id}`),
  getWorkshopMaterials: (id: string) => apiRequest<any>(`/workshops/${id}/materials`),

  // Merchant
  createWorkshop: async (payload: any) => {
    const res = await apiRequest<any>('/merchant/workshops', { method: 'POST', body: JSON.stringify(payload) });
    emitSync(['workshops', 'analytics']);
    return res;
  },
  updateWorkshop: async (id: string, payload: any) => {
    const res = await apiRequest<any>(`/merchant/workshops/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
    emitSync(['workshops', 'analytics']);
    return res;
  },
  deleteWorkshop: async (id: string) => {
    await apiRequest<void>(`/merchant/workshops/${id}`, { method: 'DELETE' });
    emitSync(['workshops', 'analytics']);
  },
  getMerchantWorkshopImage: async (id: string, signal: AbortSignal) => {
    const response = await fetch(`${API_BASE}/merchant/workshops/${id}/image`, {
      signal,
      headers: { Authorization: `Bearer ${localStorage.getItem('nuvendry_token')}` },
    });
    if (!response.ok) throw new Error('Could not load the workshop cover.');
    return response.blob();
  },
  publishWorkshop: async (id: string) => {
    const res = await apiRequest<any>(`/merchant/workshops/${id}/publish`, { method: 'POST' });
    emitSync(['workshops', 'analytics', 'clusters']);
    return res;
  },
  getMerchantWorkshops: () => apiRequest<any[]>('/merchant/workshops'),
  getMerchantReservations: () => apiRequest<any[]>('/merchant/reservations'),
  markAttendance: async (reservation_id: string, attended: boolean) => {
    const res = await apiRequest<any>(`/merchant/reservations/${reservation_id}/attendance?attended=${attended}`, { method: 'POST' });
    emitSync(['reservations', 'rewards', 'analytics']);
    return res;
  },
  getMerchantRewards: () => apiRequest<any[]>('/merchant/rewards'),
  createMerchantReward: async (payload: any) => {
    const res = await apiRequest<any>('/merchant/rewards', { method: 'POST', body: JSON.stringify(payload) });
    emitSync(['rewards', 'analytics']);
    return res;
  },
  updateMerchantReward: async (id: string, payload: any) => {
    const res = await apiRequest<any>(`/merchant/rewards/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
    emitSync(['rewards', 'analytics']);
    return res;
  },

  // Reservations & PayPal
  getQuote: (payload: any) => apiRequest<any>('/reservations/quote', { method: 'POST', body: JSON.stringify(payload) }),
  createReservation: async (payload: any) => {
    const res = await apiRequest<any>('/reservations', { method: 'POST', body: JSON.stringify(payload) });
    emitSync(['reservations', 'workshops', 'analytics']);
    return res;
  },
  cancelReservation: async (reservation_id: string) => {
    const res = await apiRequest<any>(`/reservations/${reservation_id}/cancel`, { method: 'POST' });
    emitSync(['reservations', 'workshops', 'analytics']);
    return res;
  },
  createAlternateSession: (workshopId: string, scheduledAt: string) =>
    apiRequest<{ id: string; scheduled_at: string }>(`/merchant/workshops/${workshopId}/alternate-sessions`, {
      method: 'POST', body: JSON.stringify({ scheduled_at: scheduledAt }),
    }),
  decideReschedule: async (reservationId: string, decision: 'approved' | 'rejected') => {
    const response = await apiRequest(`/merchant/reservations/${reservationId}/reschedule`, {
      method: 'PATCH', body: JSON.stringify({ decision }),
    });
    emitSync(['reservations', 'notifications']);
    return response;
  },
  getRescheduleOptions: (id: string) =>
    apiRequest<{ id: string; scheduled_at: string }[]>(`/reservations/${id}/reschedule-options`),
  requestReschedule: async (id: string, sessionId: string) => {
    const response = await apiRequest(`/reservations/${id}/reschedule-requests`, {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    });
    emitSync(['reservations', 'notifications']);
    return response;
  },
  getMyReservations: () => apiRequest<any[]>('/reservations/me'),
  getPayPalConfig: () => apiRequest<any>('/paypal/config'),
  createPayPalOrder: (reservation_id: string) => apiRequest<any>('/paypal/orders', { method: 'POST', body: JSON.stringify({ reservation_id }) }),
  capturePayPalOrder: async (order_id: string) => {
    const res = await apiRequest<any>(`/paypal/orders/${order_id}/capture`, { method: 'POST' });
    emitSync(['reservations', 'workshops', 'rewards', 'payments', 'analytics', 'notifications', 'admin']);
    return res;
  },

  // Rewards & Referrals
  getMyRewards: () => apiRequest<any>('/rewards/me'),
  getMyReferrals: () => apiRequest<any>('/rewards/referrals/me'),

  // Analytics & Research
  getAnalyticsOverview: () => apiRequest<any>('/analytics/overview'),
  getDemandTrends: () => apiRequest<any[]>('/analytics/demands'),
  getPaymentTransactions: (includeUncaptured = false) => apiRequest<any[]>(includeUncaptured ? '/analytics/payments?include_uncaptured=true' : '/analytics/payments'),
  getEvaluations: () => apiRequest<any[]>('/research/evaluations'),
  runEvaluation: async (payload: any) => {
    const res = await apiRequest<any[]>('/research/evaluations', { method: 'POST', body: JSON.stringify(payload) });
    emitSync(['evaluations']);
    return res;
  },

  // Admin
  getAdminUsers: () => apiRequest<any[]>('/admin/users'),
  getAdminAudit: () => apiRequest<any[]>('/admin/audit'),
};
