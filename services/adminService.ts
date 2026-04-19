import { api } from './api';
import type { User, UserRole } from './authService';
import type { EventModel, EventStatus, VenueType } from './eventService';
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
  commission_percent: string;
  fixed_fee_cents: string;
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
  is_featured?: boolean;
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
  updateSettings: (payload: { commission_percent: number; fixed_fee_cents: number }) =>
    api.put<{ data: PlatformSettings }>('/admin/settings', payload),
  listAuditLogs: (params: { action?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.action) qs.set('action', params.action);
    const tail = qs.toString() ? `?${qs}` : '';
    return api.get<{ data: AuditLogEntry[]; meta: { total: number; page: number } }>(`/admin/audit-logs${tail}`);
  },
};
