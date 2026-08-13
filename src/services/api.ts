const API_BASE_URL = (import.meta as any).env?.VITE_API_URL ?? '/api';
const AUTH_TOKEN_KEY = 'red_de_ayuda_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    return;
  }
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const token = getStoredToken();

  const headers: Record<string, string> = {};

  if (options.headers instanceof Headers) {
    options.headers.forEach((value, key) => {
      headers[key] = value;
    });
  } else if (Array.isArray(options.headers)) {
    for (const [key, value] of options.headers) {
      headers[key] = value;
    }
  } else if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      headers[key] = String(value);
    });
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const text = await response.text();

  if (!response.ok) {
    const trimmed = text.trim();
    let parsed: any = null;

    if (trimmed) {
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        parsed = { error: trimmed };
      }
    }

    throw new Error(parsed?.error || parsed?.message || trimmed || 'An unexpected error occurred');
  }

  if (!text.trim()) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export const api = {
  auth: {
    login: (data: any) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    register: (data: any) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  },
  centers: {
    list: () => apiRequest('/centers'),
    get: (id: string) => apiRequest(`/centers/${id}`),
    create: (data: any) => apiRequest('/centers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiRequest(`/centers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => apiRequest(`/centers/${id}`, { method: 'DELETE' }),
  },
  reports: {
    listMissing: () => apiRequest('/reports/missing'),
    listFound: () => apiRequest('/reports/found'),
    get: (id: string) => apiRequest(`/reports/${id}`),
    submit: (data: any) => apiRequest('/reports/submit', { method: 'POST', body: data instanceof FormData ? data : JSON.stringify(data) }),
    verify: (id: string, status: string) => apiRequest(`/reports/${id}/verify`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },
  donations: {
    listNeeds: () => apiRequest('/donations/needs'),
    listCritical: () => apiRequest('/donations/needs/critical'),
    createNeed: (data: any) => apiRequest('/donations/needs', { method: 'POST', body: JSON.stringify(data) }),
    updateNeed: (id: string, quantity: number) => apiRequest(`/donations/needs/${id}`, { method: 'PATCH', body: JSON.stringify({ quantityReceived: quantity }) }),
    listAvailable: () => apiRequest('/donations/available'),
    listDonationInfo: (centerId: string) => apiRequest(`/donations/centers/${centerId}/info`),
    saveDonationInfo: (centerId: string, data: any[]) => apiRequest(`/donations/centers/${centerId}/info`, { method: 'PUT', body: JSON.stringify({ cards: data }) }),
    deleteDonationInfo: (centerId: string, cardIndex: number) => apiRequest(`/donations/centers/${centerId}/info/${cardIndex}`, { method: 'DELETE' }),
  },
  announcements: {
    list: () => apiRequest('/announcements'),
    create: (data: any) => apiRequest('/announcements', { method: 'POST', body: JSON.stringify(data) }),
    verify: (id: string, status: string) => apiRequest(`/announcements/${id}/verify`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    listCitizenSubmissions: () => apiRequest('/announcements/citizen-submissions'),
    submitCitizen: (data: any) => apiRequest('/announcements/citizen-submissions', { method: 'POST', body: JSON.stringify(data) }),
    verifyCitizen: (id: string, status: string) => apiRequest(`/announcements/citizen-submissions/${id}/verify`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },
};
