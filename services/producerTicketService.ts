import { api } from './api';

export interface ProducerTicket {
  id: number;
  code: string;
  used_at: string | null;
  created_at: string;
  customer: { id: number; name: string; email: string };
  lot: { id: number; name: string; price: number };
  event: {
    id: number;
    name: string;
    starts_at: string;
    venue_name: string | null;
  };
}

export interface TicketListResponse {
  data: ProducerTicket[];
  meta: {
    total: number;
    page: number;
    last_page: number;
    stats: { total: number; used: number; unused: number };
  };
}

export interface TicketQrData {
  id: number;
  code: string;
  qr_code: string;
  used_at: string | null;
}

export const producerTicketService = {
  list: (params: { status?: 'used' | 'unused'; event_id?: number; q?: string; page?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.status) qs.set('status', params.status);
    if (params.event_id) qs.set('event_id', String(params.event_id));
    if (params.q) qs.set('q', params.q);
    if (params.page) qs.set('page', String(params.page));
    const tail = qs.toString() ? `?${qs}` : '';
    return api.get<TicketListResponse>(`/producer/tickets${tail}`);
  },
  show: (id: number) => api.get<{ data: TicketQrData }>(`/producer/tickets/${id}`),
};
