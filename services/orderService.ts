import { api } from './api';
import type { EventModel, TicketLot } from './eventService';

export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'expired';

export interface OrderItem {
  id: number;
  ticket_lot_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  lot?: TicketLot;
}

export interface Order {
  id: number;
  subtotal: number;
  platform_fee: number;
  total: number;
  status: OrderStatus;
  checkout_url: string | null;
  pix_code: string | null;
  pix_qr_code: string | null;
  paid_at: string | null;
  cancelled_at: string | null;
  expires_at: string | null;
  created_at: string;
  event?: EventModel;
  items?: OrderItem[];
  customer?: { id: number; name: string; email: string };
}

export const orderService = {
  list: () => api.get<{ data: Order[]; meta: { total: number; page: number } }>('/customer/orders'),
  show: (id: number) => api.get<{ data: Order }>(`/customer/orders/${id}`),
  create: (payload: {
    event_id: number;
    items: Array<{ ticket_lot_id: number; quantity: number }>;
    phone?: string;
    cpf?: string;
  }) => api.post<{ data: Order }>('/customer/orders', payload),
};
