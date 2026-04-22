import { api } from './api';

export type EventStatus = 'draft' | 'published' | 'cancelled';
export type VenueType = 'physical' | 'online';

export interface TicketLot {
  id: number;
  event_id: number;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  available: number;
  sales_start_at: string | null;
  sales_end_at: string | null;
  is_half_price: boolean;
  is_active: boolean;
  on_sale: boolean;
  abacate_product_id: string | null;
}

export interface EventModel {
  id: number;
  producer_id: number;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  venue_type: VenueType;
  venue_name: string | null;
  venue_address: string | null;
  online_url: string | null;
  banner_url: string | null;
  header_url: string | null;
  status: EventStatus;
  published_at: string | null;
  is_featured: boolean;
  accepts_pix: boolean;
  accepts_card: boolean;
  producer?: {
    id: number;
    company_name: string;
  };
  lots?: TicketLot[];
}

interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number };
}

export const publicEventService = {
  list: (q?: string) => api.get<Paginated<EventModel>>(`/public/events${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  show: (slug: string) => api.get<{ data: EventModel }>(`/public/events/${slug}`),
};

export interface EventPayload {
  name: string;
  short_description?: string | null;
  description?: string | null;
  is_featured?: boolean;
  starts_at: string;
  ends_at?: string | null;
  venue_type: VenueType;
  venue_name?: string | null;
  venue_address?: string | null;
  online_url?: string | null;
  banner_url?: string | null;
  header_url?: string | null;
  accepts_pix?: boolean;
  accepts_card?: boolean;
}

export interface LotPayload {
  name: string;
  price: number;
  quantity: number;
  sales_start_at?: string | null;
  sales_end_at?: string | null;
  is_half_price?: boolean;
  is_active?: boolean;
}

export const producerEventService = {
  list: () => api.get<Paginated<EventModel>>('/producer/events'),
  show: (id: number) => api.get<{ data: EventModel }>(`/producer/events/${id}`),
  create: (payload: EventPayload) => api.post<{ data: EventModel }>('/producer/events', payload),
  update: (id: number, payload: Partial<EventPayload>) =>
    api.put<{ data: EventModel }>(`/producer/events/${id}`, payload),
  destroy: (id: number) => api.delete<void>(`/producer/events/${id}`),
  publish: (id: number) => api.post<{ data: EventModel }>(`/producer/events/${id}/publish`),
  unpublish: (id: number) => api.post<{ data: EventModel }>(`/producer/events/${id}/unpublish`),
  listLots: (eventId: number) => api.get<{ data: TicketLot[] }>(`/producer/events/${eventId}/lots`),
  createLot: (eventId: number, payload: LotPayload) =>
    api.post<{ data: TicketLot }>(`/producer/events/${eventId}/lots`, payload),
  updateLot: (lotId: number, payload: LotPayload) =>
    api.put<{ data: TicketLot }>(`/producer/lots/${lotId}`, payload),
  syncLot: (lotId: number) => api.post<{ data: TicketLot }>(`/producer/lots/${lotId}/sync`),
  toggleLotActive: (lotId: number) => api.post<{ data: TicketLot }>(`/producer/lots/${lotId}/toggle-active`),
  destroyLot: (lotId: number) => api.delete<void>(`/producer/lots/${lotId}`),
};
