import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@components/AppLayout';
import { PageHeader } from '@components/PageHeader';
import { Empty } from '@components/Empty';
import { useToast } from '@components/Toast';
import { ActionIconButton } from '@components/ActionIconButton';
import { Icons } from '@components/Icon';
import { adminNav } from './nav';
import { adminService, type AdminTicket, type AdminTicketMeta } from '@services/adminService';
import { formatDateTime } from '@utils/format';
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
  const toast = useToast();

  async function load(p = page) {
    setLoading(true);
    try {
      const res = await adminService.listTickets({ status: status || undefined, q: q || undefined, page: p });
      setTickets(res.data);
      setMeta(res.meta);
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

  return (
    <AppLayout title={t('admin.panel')} nav={adminNav}>
      <PageHeader
        title={t('admin.ticketsPage')}
        action={
          <div className="flex gap-2">
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
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
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
                      {ticket.used_at ? (
                        <ActionIconButton
                          onClick={() => handleToggle(ticket)}
                          tone="brand"
                          label={t('admin.markUnused')}
                          icon={<Icons.check className="h-4 w-4" />}
                        />
                      ) : (
                        <ActionIconButton
                          onClick={() => handleToggle(ticket)}
                          tone="danger"
                          label={t('admin.markUsed')}
                          icon={<Icons.check className="h-4 w-4" />}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
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
    </AppLayout>
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
