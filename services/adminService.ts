import { api } from './api';
import type { User, UserRole } from './authService';
import type { EventModel, EventStatus, VenueType, TicketLot, LotPayload } from './eventService';
import type { Producer } from './producerService';

export interface Dashboard {
  gmv: number;
  platform_fee_total: number;
  orders_paid: number;
  tickets_sold: number;
  events_published: number;
  events_total: number;
  producers_total: number;
  producers_pending: number;
  customers_total: number;
  gmv_series: Array<{ bucket: string; revenue: string; platform_fee: string }>;
}

export interface AdminOrder {
  id: number;
  total: number;
  subtotal: number;
  platform_fee: number;
  status: string;
  created_at: string;
  paid_at: string | null;
  customer?: { id: number; name: string; email: string };
  event?: { id: number; name: string; slug: string };
}

export interface PlatformSettings {
  id: number;
  pix_commission_percent: string;
  pix_fixed_fee_cents: string;
  card_commission_percent: string;
  card_fixed_fee_cents: string;
  active_gateway: 'abacate_pay' | 'stripe';
  abacatepay_public_key: string | null;
  abacatepay_secret_key_set: boolean;
  stripe_public_key: string | null;
  stripe_secret_key_set: boolean;
  mailgun_domain: string | null;
  mailgun_secret_set: boolean;
  mailgun_endpoint: string | null;
  mail_from_address: string | null;
  mail_from_name: string | null;
}

export interface UpdateEmailPayload {
  mailgun_domain?: string | null;
  mailgun_secret?: string;
  mailgun_endpoint?: string;
  mail_from_address?: string | null;
  mail_from_name?: string | null;
}

export interface UpdateSettingsPayload {
  pix_commission_percent: number;
  pix_fixed_fee_cents: number;
  card_commission_percent: number;
  card_fixed_fee_cents: number;
}

export interface UpdateGatewayPayload {
  active_gateway: 'abacate_pay' | 'stripe';
  abacatepay_public_key?: string | null;
  abacatepay_secret_key?: string;
  stripe_public_key?: string | null;
  stripe_secret_key?: string;
}

export interface EmailLogEntry {
  id: number;
  to_email: string;
  to_name: string | null;
  subject: string;
  type: string;
  status: 'sent' | 'failed';
  error: string | null;
  body: string | null;
  order_id: number | null;
  producer: { id: number; company_name: string } | null;
  created_at: string;
}

export interface AuditLogEntry {
  id: number;
  action: string;
  subject_type: string | null;
  subject_id: number | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  user: { id: number; name: string; email: string } | null;
  created_at: string;
}

export interface UpdateUserPayload {
  name: string;
  email: string;
  phone?: string | null;
  cpf?: string | null;
  role: UserRole;
  password?: string;
}

export interface ConvertToProducerPayload {
  company_name: string;
  document: string;
  phone?: string | null;
}

export interface UpdateProducerPayload {
  company_name: string;
  document: string;
  phone?: string | null;
  status: Producer['status'];
  blocked_reason?: string | null;
}

export interface UpdateEventPayload {
  name: string;
  description?: string | null;
  starts_at: string;
  ends_at?: string | null;
  status: EventStatus;
  venue_type: VenueType;
  venue_name?: string | null;
  venue_address?: string | null;
  online_url?: string | null;
  banner_url?: string | null;
  header_url?: string | null;
  is_featured?: boolean;
  is_active?: boolean;
  accepts_pix?: boolean;
  accepts_card?: boolean;
}

export interface AdminTicket {
  id: number;
  code: string;
  used_at: string | null;
  created_at: string;
  customer: { id: number; name: string; email: string } | null;
  lot: { id: number; name: string; price: number } | null;
  event: { id: number; name: string } | null;
}

export interface AdminTicketMeta {
  total: number;
  page: number;
  last_page: number;
  stats: { total: number; used: number; unused: number };
}

export interface UpdateOrderPayload {
  status: AdminOrder['status'];
}

export const adminService = {
  dashboard: () => api.get<{ data: Dashboard }>('/admin/dashboard'),
  listUsers: (params: { role?: string; q?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.role) qs.set('role', params.role);
    if (params.q) qs.set('q', params.q);
    const tail = qs.toString() ? `?${qs}` : '';
    return api.get<{ data: User[]; meta: { total: number; page: number } }>(`/admin/users${tail}`);
  },
  updateUser: (id: number, payload: UpdateUserPayload) =>
    api.put<{ data: User }>(`/admin/users/${id}`, payload),
  deleteUser: (id: number) => api.delete<void>(`/admin/users/${id}`),
  convertToProducer: (id: number, payload: ConvertToProducerPayload) =>
    api.post<{ data: Producer }>(`/admin/users/${id}/convert-to-producer`, payload),
  listProducers: (params: { status?: string; q?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.status) qs.set('status', params.status);
    if (params.q) qs.set('q', params.q);
    const tail = qs.toString() ? `?${qs}` : '';
    return api.get<{ data: Producer[]; meta: { total: number; page: number } }>(`/admin/producers${tail}`);
  },
  updateProducer: (id: number, payload: UpdateProducerPayload) =>
    api.put<{ data: Producer }>(`/admin/producers/${id}`, payload),
  deleteProducer: (id: number) => api.delete<void>(`/admin/producers/${id}`),
  approveProducer: (id: number) => api.post<{ data: Producer }>(`/admin/producers/${id}/approve`),
  blockProducer: (id: number, reason?: string) =>
    api.post<{ data: Producer }>(`/admin/producers/${id}/block`, { reason }),
  getEvent: (id: number) => api.get<{ data: EventModel }>(`/admin/events/${id}`),
  createLot: (eventId: number, payload: LotPayload) =>
    api.post<{ data: TicketLot }>(`/admin/events/${eventId}/lots`, payload),
  updateLot: (lotId: number, payload: LotPayload) =>
    api.put<{ data: TicketLot }>(`/admin/lots/${lotId}`, payload),
  deleteLot: (lotId: number) => api.delete<void>(`/admin/lots/${lotId}`),
  listEvents: (params: { status?: string; q?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.status) qs.set('status', params.status);
    if (params.q) qs.set('q', params.q);
    const tail = qs.toString() ? `?${qs}` : '';
    return api.get<{ data: EventModel[]; meta: { total: number; page: number } }>(`/admin/events${tail}`);
  },
  updateEvent: (id: number, payload: UpdateEventPayload) =>
    api.put<{ data: EventModel }>(`/admin/events/${id}`, payload),
  deleteEvent: (id: number) => api.delete<void>(`/admin/events/${id}`),
  listOrders: (params: { status?: string; q?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.status) qs.set('status', params.status);
    if (params.q) qs.set('q', params.q);
    const tail = qs.toString() ? `?${qs}` : '';
    return api.get<{ data: AdminOrder[]; meta: { total: number; page: number } }>(`/admin/orders${tail}`);
  },
  updateOrder: (id: number, payload: UpdateOrderPayload) =>
    api.put<{ data: AdminOrder }>(`/admin/orders/${id}`, payload),
  deleteOrder: (id: number) => api.delete<void>(`/admin/orders/${id}`),
  getSettings: () => api.get<{ data: PlatformSettings }>('/admin/settings'),
  updateSettings: (payload: UpdateSettingsPayload) =>
    api.put<{ data: PlatformSettings }>('/admin/settings', payload),
  updateGateway: (payload: UpdateGatewayPayload) =>
    api.put<{ data: PlatformSettings }>('/admin/settings/gateway', payload),
  updateEmail: (payload: UpdateEmailPayload) =>
    api.put<{ data: PlatformSettings }>('/admin/settings/email', payload),
  listAuditLogs: (params: { action?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.action) qs.set('action', params.action);
    const tail = qs.toString() ? `?${qs}` : '';
    return api.get<{ data: AuditLogEntry[]; meta: { total: number; page: number } }>(`/admin/audit-logs${tail}`);
  },
  listEmailLogs: (params: { status?: string; type?: string; q?: string; page?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.status) qs.set('status', params.status);
    if (params.type) qs.set('type', params.type);
    if (params.q) qs.set('q', params.q);
    if (params.page && params.page > 1) qs.set('page', String(params.page));
    const tail = qs.toString() ? `?${qs}` : '';
    return api.get<{ data: EmailLogEntry[]; meta: { total: number; page: number; last_page: number } }>(`/admin/email-logs${tail}`);
  },
  resendEmailLog: (id: number) => api.post<{ message: string }>(`/admin/email-logs/${id}/resend`, {}),
  listTickets: (params: { status?: string; event_id?: number; q?: string; page?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.status) qs.set('status', params.status);
    if (params.event_id) qs.set('event_id', String(params.event_id));
    if (params.q) qs.set('q', params.q);
    if (params.page && params.page > 1) qs.set('page', String(params.page));
    const tail = qs.toString() ? `?${qs}` : '';
    return api.get<{ data: AdminTicket[]; meta: AdminTicketMeta }>(`/admin/tickets${tail}`);
  },
  toggleTicketUsed: (id: number) =>
    api.post<{ data: Pick<AdminTicket, 'id' | 'used_at'> }>(`/admin/tickets/${id}/toggle-used`, {}),
  deleteTicket: (id: number) => api.delete<void>(`/admin/tickets/${id}`),
};
