import { api } from './api';

export type UserRole = 'admin' | 'producer' | 'customer';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  role: UserRole;
  created_at: string;
}

interface AuthPayload {
  user: User;
  token: string;
}

export const authService = {
  login(email: string, password: string) {
    return api.post<{ data: AuthPayload }>('/auth/login', { email, password });
  },
  register(input: { name: string; email: string; password: string; password_confirmation: string; role?: UserRole }) {
    return api.post<{ data: AuthPayload }>('/auth/register', input);
  },
  me() {
    return api.get<{ data: User }>('/auth/me');
  },
  logout() {
    return api.post<void>('/auth/logout');
  },
};
