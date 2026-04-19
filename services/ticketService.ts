import { api } from './api';

export interface TicketListItem {
  id: number;
  code: string;
  qr_code: string;
  used_at: string | null;
  lot: { id: number; name: string; price: number };
  event: {
    id: number;
    name: string;
    starts_at: string;
    venue_name: string | null;
    banner_url: string | null;
  };
}

export type TicketDetail = TicketListItem;

export const ticketService = {
  list: () => api.get<{ data: TicketListItem[] }>('/customer/tickets'),
  show: (id: number) => api.get<{ data: TicketDetail }>(`/customer/tickets/${id}`),
};
