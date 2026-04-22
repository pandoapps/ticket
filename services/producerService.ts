import { api } from './api';

export interface Producer {
  id: number;
  user_id: number;
  company_name: string;
  document: string;
  phone: string | null;
  status: 'pending' | 'approved' | 'blocked';
  approved_at: string | null;
  blocked_at: string | null;
  blocked_reason: string | null;
  has_valid_credentials: boolean;
  user?: { id: number; name: string; email: string; role: string };
}

export type AbacateEnvironment = 'sandbox' | 'production';

export interface Credentials {
  has_secret: boolean;
  has_webhook_secret: boolean;
  environment: AbacateEnvironment;
  validated_at: string | null;
  validation_error: string | null;
}

export interface ProducerCustomer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  orders_count: number;
  paid_orders_count: number;
  total_spent: number;
  last_order_at: string | null;
  last_paid_at: string | null;
  created_at: string | null;
}

export interface ProducerCustomerListResponse {
  data: ProducerCustomer[];
  meta: { total: number; page: number; last_page: number; per_page: number };
}

export type ProducerCustomerSort = 'last_order' | 'name' | 'total' | 'orders';

export const producerService = {
  profile: () => api.get<{ data: Producer | null }>('/producer/profile'),
  register: (payload: { company_name: string; document: string; phone?: string }) =>
    api.post<{ data: Producer }>('/producer/profile', payload),
  credentials: () => api.get<{ data: Credentials }>('/producer/credentials'),
  saveCredentials: (payload: {
    secret_key?: string;
    webhook_secret?: string;
    environment: AbacateEnvironment;
  }) => api.put<{ data: Credentials }>('/producer/credentials', payload),
  sales: (status?: string) =>
    api.get<{ data: unknown[]; meta: { total: number; page: number } }>(
      `/producer/sales${status ? `?status=${status}` : ''}`,
    ),
  customers: (params: { q?: string; sort?: ProducerCustomerSort; page?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set('q', params.q);
    if (params.sort) qs.set('sort', params.sort);
    if (params.page) qs.set('page', String(params.page));
    const tail = qs.toString() ? `?${qs}` : '';
    return api.get<ProducerCustomerListResponse>(`/producer/customers${tail}`);
  },
  salesSummary: () =>
    api.get<{ data: { paid_total: number; paid_count: number; pending_count: number; tickets_sold: number } }>(
      '/producer/sales/summary',
    ),
  report: (params: { from?: string; to?: string; granularity?: 'day' | 'week' | 'month'; event_id?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.from) qs.set('from', params.from);
    if (params.to) qs.set('to', params.to);
    if (params.granularity) qs.set('granularity', params.granularity);
    if (params.event_id) qs.set('event_id', String(params.event_id));
    const tail = qs.toString() ? `?${qs}` : '';
    return api.get<{
      data: {
        from: string;
        to: string;
        granularity: string;
        event_id: number | null;
        totals: {
          revenue: number;
          platform_fee: number;
          net: number;
          orders: number;
          paid_orders: number;
          pending_orders: number;
          conversion_percent: number;
          tickets_issued: number;
          tickets_redeemed: number;
        };
        series: Array<{ bucket: string; revenue: string; platform_fee: string; orders: number }>;
      };
    }>(`/producer/reports${tail}`);
  },
};
