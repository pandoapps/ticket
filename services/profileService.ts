import { api } from './api';
import type { User } from './authService';

export interface UpdateProfilePayload {
  name: string;
  email: string;
  phone?: string | null;
  cpf?: string | null;
  current_password?: string;
  password?: string;
  password_confirmation?: string;
}

export const profileService = {
  update: (payload: UpdateProfilePayload) => api.put<{ data: User }>('/auth/me', payload),
};
