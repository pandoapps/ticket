import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@components/AppLayout';
import { PageHeader } from '@components/PageHeader';
import { Empty } from '@components/Empty';
import { Modal } from '@components/Modal';
import { useToast } from '@components/Toast';
import { useConfirm } from '@components/ConfirmDialog';
import { ActionIconButton } from '@components/ActionIconButton';
import { Icons } from '@components/Icon';
import { adminNav } from './nav';
import {
  adminService,
  type AdminTicket,
  type AdminTicketMeta,
  type IssueTicketPayload,
} from '@services/adminService';
import { type EventModel, type TicketLot } from '@services/eventService';
import { formatBRL, formatDateTime } from '@utils/format';
import type { ApiError } from '@services/api';

const DEFAULT_META: AdminTicketMeta = { total: 0, page: 1, last_page: 1, stats: { total: 0, used: 0, unused: 0 } };

export function AdminTicketsPage() {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [meta, setMeta] = useState<AdminTicketMeta>(DEFAULT_META);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [issueModal, setIssueModal] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();

  const allSelected = tickets.length > 0 && tickets.every((t) => selectedIds.has(t.id));
  const someSelected = selectedIds.size > 0;

  function toggleAll() {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(tickets.map((t) => t.id)));
  }

  function toggleOne(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function load(p = page) {
    setLoading(true);
    try {
      const res = await adminService.listTickets({ status: status || undefined, q: q || undefined, page: p });
      setTickets(res.data);
      setMeta(res.meta);
      setSelectedIds(new Set());
    } catch (err) {
      toast.error((err as ApiError).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const id = setTimeout(() => { setPage(1); load(1); }, 200);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, q]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function handleToggle(ticket: AdminTicket) {
    try {
      const res = await adminService.toggleTicketUsed(ticket.id);
      setTickets((prev) =>
        prev.map((t) => (t.id === ticket.id ? { ...t, used_at: res.data.used_at } : t)),
      );
      toast.success(res.data.used_at ? t('admin.ticketMarkedUsed') : t('admin.ticketMarkedUnused'));
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  async function handleDelete(ticket: AdminTicket) {
    const ok = await confirm({
      title: t('admin.deleteTicketTitle', { id: ticket.id }),
      description: t('admin.deleteTicketDesc'),
      confirmText: t('admin.deleteTicketBtn'),
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await adminService.deleteTicket(ticket.id);
      toast.success(t('admin.ticketDeleted'));
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  async function handleBulkDelete() {
    const count = selectedIds.size;
    const ok = await confirm({
      title: t('admin.deleteSelectedTicketsTitle', { count }),
      description: t('admin.deleteSelectedTicketsDesc'),
      confirmText: t('admin.deleteSelectedTicketsBtn'),
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await Promise.all([...selectedIds].map((id) => adminService.deleteTicket(id)));
      toast.success(t('admin.ticketsDeleted', { count }));
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  return (
    <AppLayout title={t('admin.panel')} nav={adminNav}>
      <PageHeader
        title={t('admin.ticketsPage')}
        action={
          <div className="flex gap-2">
            {someSelected && (
              <button onClick={handleBulkDelete} className="btn btn-danger text-sm">
                {t('admin.deleteSelected', { count: selectedIds.size })}
              </button>
            )}
            <button onClick={() => setIssueModal(true)} className="btn btn-primary flex items-center gap-2">
              <Icons.plus className="h-4 w-4" />
              {t('admin.issueTicketBtn')}
            </button>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('admin.search')}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
            >
              <option value="">{t('admin.allStatuses')}</option>
              <option value="unused">{t('admin.unusedFilter')}</option>
              <option value="used">{t('admin.usedFilter')}</option>
            </select>
          </div>
        }
      />

      <div className="mb-4 flex gap-4">
        <StatCard label={t('admin.totalTickets')} value={meta.stats.total} />
        <StatCard label={t('admin.unusedFilter')} value={meta.stats.unused} color="text-emerald-600" />
        <StatCard label={t('admin.usedFilter')} value={meta.stats.used} color="text-slate-500" />
      </div>

      {tickets.length === 0 && !loading ? (
        <Empty title={t('admin.noTicketsFound')} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                </th>
                <Th>#</Th>
                <Th>{t('admin.customerCol')}</Th>
                <Th>{t('admin.eventCol')}</Th>
                <Th>{t('admin.lotCol')}</Th>
                <Th>{t('admin.issuedCol')}</Th>
                <Th>{t('admin.statusCol')}</Th>
                <Th className="text-right">{t('admin.actions')}</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tickets.map((ticket) => {
                const isSelected = selectedIds.has(ticket.id);
                return (
                  <tr key={ticket.id} className={isSelected ? 'bg-brand-50' : ''}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(ticket.id)}
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">#{ticket.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{ticket.customer?.name ?? '—'}</p>
                      <p className="text-xs text-slate-500">{ticket.customer?.email ?? ''}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{ticket.event?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{ticket.lot?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDateTime(ticket.created_at)}</td>
                    <td className="px-4 py-3">
                      {ticket.used_at ? (
                        <div>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                            {t('admin.usedStatus')}
                          </span>
                          <p className="mt-0.5 text-xs text-slate-400">{formatDateTime(ticket.used_at)}</p>
                        </div>
                      ) : (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          {t('admin.unusedStatus')}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <ActionIconButton
                          onClick={() => handleToggle(ticket)}
                          tone="brand"
                          label={ticket.used_at ? t('admin.markUnused') : t('admin.markUsed')}
                          icon={<Icons.check className="h-4 w-4" />}
                        />
                        <ActionIconButton
                          onClick={() => handleDelete(ticket)}
                          tone="danger"
                          label={t('common.delete')}
                          icon={<Icons.trash className="h-4 w-4" />}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {meta.last_page > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <span>{t('admin.ticketsPageOf', { current: meta.page, total: meta.last_page, count: meta.total })}</span>
          <div className="flex gap-2">
            <button
              disabled={meta.page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="btn btn-secondary disabled:opacity-40"
            >
              {t('producer.prev')}
            </button>
            <button
              disabled={meta.page >= meta.last_page}
              onClick={() => setPage((p) => p + 1)}
              className="btn btn-secondary disabled:opacity-40"
            >
              {t('producer.next')}
            </button>
          </div>
        </div>
      )}

      <IssueTicketModal
        open={issueModal}
        onClose={() => setIssueModal(false)}
        onIssued={() => { setIssueModal(false); load(1); setPage(1); }}
      />
    </AppLayout>
  );
}

type CustomerState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'found'; id: number; name: string }
  | { status: 'not_found' };

function IssueTicketModal({ open, onClose, onIssued }: { open: boolean; onClose: () => void; onIssued: () => void }) {
  const { t } = useTranslation();
  const [events, setEvents] = useState<EventModel[]>([]);
  const [eventId, setEventId] = useState('');
  const [lots, setLots] = useState<TicketLot[]>([]);
  const [lotId, setLotId] = useState('');
  const [email, setEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customer, setCustomer] = useState<CustomerState>({ status: 'idle' });
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    adminService
      .listEvents({ status: 'published', per_page: 500 })
      .then((res) => setEvents(res.data))
      .catch((err: ApiError) => toast.error(err.message));
  }, [open, toast]);

  useEffect(() => {
    if (!eventId) { setLots([]); setLotId(''); return; }
    const ev = events.find((e) => e.id === Number(eventId));
    setLots(ev?.lots ?? []);
    setLotId('');
  }, [eventId, events]);

  useEffect(() => {
    const trimmed = email.trim();
    if (!trimmed) { setCustomer({ status: 'idle' }); setCustomerName(''); return; }
    setCustomer({ status: 'loading' });
    const timer = setTimeout(async () => {
      try {
        const res = await adminService.lookupCustomer(trimmed);
        if (res.found && res.data) {
          setCustomer({ status: 'found', id: res.data.id, name: res.data.name });
          setCustomerName(res.data.name);
        } else {
          setCustomer({ status: 'not_found' });
          setCustomerName('');
        }
      } catch {
        setCustomer({ status: 'idle' });
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [email]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lotId || !email.trim()) return;
    setSubmitting(true);
    try {
      const payload: IssueTicketPayload = {
        ticket_lot_id: Number(lotId),
        customer_email: email.trim(),
        customer_name: customerName.trim() || undefined,
      };
      const res = await adminService.issueTicket(payload);
      toast.success(t('admin.ticketIssuedFor', { name: res.data.customer.name }));
      onIssued();
      handleClose();
    } catch (err) {
      const apiErr = err as ApiError;
      const first = Object.values(apiErr.errors ?? {}).flat()[0];
      toast.error(first ?? apiErr.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setEventId('');
    setLots([]);
    setLotId('');
    setEmail('');
    setCustomerName('');
    setCustomer({ status: 'idle' });
    onClose();
  }

  const selectedLot = lots.find((l) => l.id === Number(lotId));
  const canSubmit = !!lotId && !!email.trim() && !!customerName.trim() && customer.status !== 'loading';

  return (
    <Modal open={open} onClose={handleClose} title={t('admin.issueTicketTitle')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">{t('admin.eventLabel2')}</label>
          <select
            value={eventId}
            onChange={(e) => { setEventId(e.target.value); setLotId(''); }}
            className="input w-full"
            required
          >
            <option value="">{t('admin.selectEventOption')}</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">{t('admin.lotLabel')}</label>
          <select
            value={lotId}
            onChange={(e) => setLotId(e.target.value)}
            className="input w-full"
            required
            disabled={!eventId || lots.length === 0}
          >
            <option value="">{t('admin.selectLotOption')}</option>
            {lots.map((lot) => (
              <option key={lot.id} value={lot.id}>
                {lot.name} — {lot.price === 0 ? t('admin.freeLot') : formatBRL(lot.price)}
              </option>
            ))}
          </select>
          {eventId && lots.length === 0 && (
            <p className="mt-1 text-xs text-slate-400">{t('admin.noLotsForEvent')}</p>
          )}
          {selectedLot && !selectedLot.is_active && (
            <p className="mt-1 text-xs text-amber-600">{t('admin.lotInactiveWarning')}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">{t('admin.participantEmail')}</label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="participante@email.com"
              className="input w-full pr-8"
              required
            />
            {customer.status === 'loading' && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
              </span>
            )}
          </div>
          {customer.status === 'found' && (
            <p className="mt-1 text-xs text-emerald-600">{t('admin.existingCustomer')}</p>
          )}
          {customer.status === 'not_found' && (
            <p className="mt-1 text-xs text-blue-600">{t('admin.newParticipant')}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">{t('admin.participantName')}</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder={t('admin.participantFullName')}
            className={`input w-full ${customer.status === 'found' ? 'bg-slate-50 text-slate-500' : ''}`}
            disabled={customer.status === 'found' || customer.status === 'loading'}
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={handleClose} className="btn btn-secondary">
            {t('common.cancel')}
          </button>
          <button type="submit" disabled={submitting || !canSubmit} className="btn btn-primary">
            {submitting ? t('admin.issuing') : t('admin.issueTicketSubmit')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Th({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 ${className}`}>
      {children}
    </th>
  );
}

function StatCard({ label, value, color = 'text-slate-900' }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
