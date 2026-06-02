import { api } from './api';
import type { EventModel, TicketLot } from './eventService';

export interface PosCustomer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
}

export interface PosOrderItem {
  ticket_lot_id: number;
  quantity: number;
}

export interface PosOrderPayload {
  event_id: number;
  customer_id?: number;
  customer_email?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_cpf?: string;
  payment_mode: 'link' | 'manual';
  payment_method?: 'pix' | 'card';
  items: PosOrderItem[];
  coupon_code?: string;
}

export interface PosOrderResult {
  id: number;
  event: { name: string };
  customer: { name: string; email: string };
  items: Array<{ lot: { name: string }; quantity: number; subtotal: number }>;
  subtotal: number;
  discount_amount: number;
  platform_fee: number;
  total: number;
  payment_method: string | null;
  status: string;
  pix_code: string | null;
  pix_qr_code: string | null;
  checkout_url: string | null;
  paid_at: string | null;
  created_at: string;
}

export const posService = {
  lookupCustomer: (email: string) =>
    api.get<{ found: boolean; data?: PosCustomer }>(`/producer/customers/lookup?email=${encodeURIComponent(email)}`),

  listEvents: () =>
    api.get<{ data: EventModel[] }>('/producer/events'),

  listAllEvents: () =>
    api.get<{ data: EventModel[] }>('/admin/events?status=published&per_page=100'),

  listLots: (eventId: number) =>
    api.get<{ data: TicketLot[] }>(`/producer/events/${eventId}/lots`),

  createOrder: (payload: PosOrderPayload) =>
    api.post<{ data: PosOrderResult }>('/producer/pos/orders', payload),
};
