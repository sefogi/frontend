import { api, getStoredToken, setStoredToken } from './api';

export type AuthUser = {
  id: string;
  email: string;
  role: 'CENTER_ADMIN' | 'SUPER_ADMIN';
};

const AUTH_USER_KEY = 'red_de_ayuda_user';

function notifyAuthChange() {
  window.dispatchEvent(new Event('auth:change'));
}

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

function writeStoredUser(user: AuthUser | null) {
  if (!user) {
    localStorage.removeItem(AUTH_USER_KEY);
    return;
  }

  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export const authService = {
  async login(email: string, password: string) {
    const response = await api.auth.login({ email, password }) as { token: string; user: AuthUser };
    const token = response.token;
    const user = response.user;

    setStoredToken(token);
    writeStoredUser(user);
    notifyAuthChange();

    return user;
  },

  async register(email: string, password: string, role: AuthUser['role'] = 'CENTER_ADMIN') {
    const response = await api.auth.register({ email, password, role }) as AuthUser;
    return response;
  },

  logout() {
    setStoredToken(null);
    writeStoredUser(null);
    notifyAuthChange();
  },

  getCurrentUser(): AuthUser | null {
    return readStoredUser();
  },

  isAuthenticated() {
    return !!getStoredToken() && !!readStoredUser();
  }
};
