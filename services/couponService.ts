import { api } from './api';

export interface Coupon {
  id: number;
  event_id: number;
  producer_id: number;
  code: string;
  discount_percent: number;
  max_uses: number | null;
  used_count: number;
  remaining_uses: number | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  is_usable: boolean;
  created_at: string;
  event?: {
    id: number;
    name: string;
    slug: string;
    producer?: { id: number; company_name: string; user?: { id: number; name: string } };
  };
}

export interface CouponPayload {
  event_id: number;
  code: string;
  discount_percent: number;
  max_uses?: number | null;
  starts_at?: string | null;
  ends_at?: string | null;
  is_active?: boolean;
}

interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number };
}

export const producerCouponService = {
  list: (params?: { event_id?: number }) => {
    const qs = params?.event_id ? `?event_id=${params.event_id}` : '';
    return api.get<Paginated<Coupon>>(`/producer/coupons${qs}`);
  },
  show: (id: number) => api.get<{ data: Coupon }>(`/producer/coupons/${id}`),
  create: (payload: CouponPayload) => api.post<{ data: Coupon }>('/producer/coupons', payload),
  update: (id: number, payload: CouponPayload) =>
    api.put<{ data: Coupon }>(`/producer/coupons/${id}`, payload),
  destroy: (id: number) => api.delete<void>(`/producer/coupons/${id}`),
};

export const adminCouponService = {
  list: (params?: { event_id?: number; producer_id?: number; q?: string }) => {
    const search = new URLSearchParams();
    if (params?.event_id) search.set('event_id', String(params.event_id));
    if (params?.producer_id) search.set('producer_id', String(params.producer_id));
    if (params?.q) search.set('q', params.q);
    const qs = search.toString();
    return api.get<Paginated<Coupon>>(`/admin/coupons${qs ? `?${qs}` : ''}`);
  },
  show: (id: number) => api.get<{ data: Coupon }>(`/admin/coupons/${id}`),
  create: (payload: CouponPayload) => api.post<{ data: Coupon }>('/admin/coupons', payload),
  update: (id: number, payload: CouponPayload) =>
    api.put<{ data: Coupon }>(`/admin/coupons/${id}`, payload),
  destroy: (id: number) => api.delete<void>(`/admin/coupons/${id}`),
};

export const customerCouponService = {
  validate: (payload: { event_id: number; code: string }) =>
    api.post<{ data: { code: string; discount_percent: number } }>(
      '/customer/coupons/validate',
      payload,
    ),
};
