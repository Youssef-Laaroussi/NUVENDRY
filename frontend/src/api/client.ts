const API_BASE = '/api/v1';

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('nuvendry_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.detail || `API Request Failed with status ${response.status}`;
    throw new ApiError(errorMsg, response.status, data);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (payload: any) => apiRequest<any>('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: any) => apiRequest<any>('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => apiRequest<any>('/auth/me'),
  logout: () => {
    localStorage.removeItem('nuvendry_token');
    return apiRequest<any>('/auth/logout', { method: 'POST' });
  },

  // Demands
  createDemand: (payload: any) => apiRequest<any>('/demands', { method: 'POST', body: JSON.stringify(payload) }),
  getDemands: (params: { mine_only?: boolean; topic?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.mine_only) query.set('mine_only', 'true');
    if (params.topic) query.set('topic', params.topic);
    return apiRequest<any[]>(`/demands?${query.toString()}`);
  },
  getDemand: (id: string) => apiRequest<any>(`/demands/${id}`),
  updateDemand: (id: string, payload: any) => apiRequest<any>(`/demands/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteDemand: (id: string) => apiRequest<void>(`/demands/${id}`, { method: 'DELETE' }),

  // AI & Clusters
  extractDemand: (raw_prompt: string) => apiRequest<any>(`/ai/extract-demand?raw_prompt=${encodeURIComponent(raw_prompt)}`, { method: 'POST' }),
  getClusters: () => apiRequest<any[]>('/ai/clusters'),
  getCluster: (id: string) => apiRequest<any>(`/ai/clusters/${id}`),
  matchDemands: () => apiRequest<any[]>('/ai/match-demands', { method: 'POST' }),
  generateOffer: (cluster_id: string) => apiRequest<any>(`/ai/generate-offer?cluster_id=${cluster_id}`, { method: 'POST' }),

  // Workshops
  getWorkshops: (params: { category?: string; search?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    return apiRequest<any[]>(`/workshops?${query.toString()}`);
  },
  getWorkshop: (id: string) => apiRequest<any>(`/workshops/${id}`),

  // Merchant
  createWorkshop: (payload: any) => apiRequest<any>('/merchant/workshops', { method: 'POST', body: JSON.stringify(payload) }),
  updateWorkshop: (id: string, payload: any) => apiRequest<any>(`/merchant/workshops/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  publishWorkshop: (id: string) => apiRequest<any>(`/merchant/workshops/${id}/publish`, { method: 'POST' }),
  getMerchantWorkshops: () => apiRequest<any[]>('/merchant/workshops'),
  getMerchantReservations: () => apiRequest<any[]>('/merchant/reservations'),
  markAttendance: (reservation_id: string, attended: boolean) => 
    apiRequest<any>(`/merchant/reservations/${reservation_id}/attendance?attended=${attended}`, { method: 'POST' }),
  getMerchantRewards: () => apiRequest<any[]>('/merchant/rewards'),
  createMerchantReward: (payload: any) => apiRequest<any>('/merchant/rewards', { method: 'POST', body: JSON.stringify(payload) }),

  // Reservations & PayPal
  getQuote: (payload: any) => apiRequest<any>('/reservations/quote', { method: 'POST', body: JSON.stringify(payload) }),
  createReservation: (payload: any) => apiRequest<any>('/reservations', { method: 'POST', body: JSON.stringify(payload) }),
  getMyReservations: () => apiRequest<any[]>('/reservations/me'),
  getPayPalConfig: () => apiRequest<any>('/paypal/config'),
  createPayPalOrder: (reservation_id: string) => apiRequest<any>('/paypal/orders', { method: 'POST', body: JSON.stringify({ reservation_id }) }),
  capturePayPalOrder: (order_id: string) => apiRequest<any>(`/paypal/orders/${order_id}/capture`, { method: 'POST' }),

  // Rewards & Referrals
  getMyRewards: () => apiRequest<any>('/rewards/me'),
  getMyReferrals: () => apiRequest<any>('/rewards/referrals/me'),

  // Analytics & Research
  getAnalyticsOverview: () => apiRequest<any>('/analytics/overview'),
  getDemandTrends: () => apiRequest<any[]>('/analytics/demands'),
  getPaymentTransactions: () => apiRequest<any[]>('/analytics/payments'),
  getEvaluations: () => apiRequest<any[]>('/research/evaluations'),
  runEvaluation: (payload: any) => apiRequest<any[]>('/research/evaluations', { method: 'POST', body: JSON.stringify(payload) }),

  // Admin
  getAdminUsers: () => apiRequest<any[]>('/admin/users'),
  getAdminAudit: () => apiRequest<any[]>('/admin/audit'),
};
