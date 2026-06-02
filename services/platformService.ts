import { api } from './api';

export interface PlatformConfig {
  active_gateway: 'abacate_pay' | 'stripe';
}

export const platformService = {
  getConfig: () => api.get<{ data: PlatformConfig }>('/public/config'),
};
