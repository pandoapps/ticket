import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@components/AppLayout';
import { PageHeader } from '@components/PageHeader';
import { Empty } from '@components/Empty';
import { useToast } from '@components/Toast';
import { producerNav } from './nav';
import { producerService } from '@services/producerService';
import { formatDateTime } from '@utils/format';
import type { ApiError } from '@services/api';

type EmailLog = {
  id: number; to_email: string; to_name: string | null; subject: string;
  type: string; status: 'sent' | 'failed'; error: string | null;
  order_id: number | null; created_at: string;
};

const STATUS_COLOR = {
  sent: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-rose-100 text-rose-700',
};

const TYPE_LABEL: Record<string, string> = {
  payment_link: 'Link de pagamento',
  generic: 'Genérico',
};

export function ProducerEmailLogsPage() {
  const { t } = useTranslation();
  const toast = useToast();

  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q), 250);
    return () => clearTimeout(id);
  }, [q]);

  useEffect(() => { setPage(1); }, [status, debouncedQ]);

  useEffect(() => {
    producerService.listEmailLogs({ status: status || undefined, q: debouncedQ || undefined, page })
      .then((r) => {
        setLogs(r.data);
        setTotal(r.meta.total);
        setLastPage(r.meta.last_page);
      })
      .catch((err: ApiError) => toast.error(err.message));
  }, [status, debouncedQ, page, toast]);

  return (
    <AppLayout title={t('producer.panel')} nav={producerNav}>
      <PageHeader
        title={t('producer.emailLogsPage')}
        description={t('producer.emailLogsDesc')}
        action={
          <div className="flex gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar destinatário..."
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
            >
              <option value="">{t('admin.allEmailStatuses')}</option>
              <option value="sent">{t('admin.emailStatus_sent')}</option>
              <option value="failed">{t('admin.emailStatus_failed')}</option>
            </select>
          </div>
        }
      />

      {logs.length === 0 ? (
        <Empty title={t('producer.noEmailLogs')} />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Destinatário</th>
                  <th className="px-4 py-3 text-left">Assunto</th>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Enviado em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{log.to_name ?? '—'}</p>
                      <p className="text-xs text-slate-500">{log.to_email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <p className="max-w-xs truncate">{log.subject}</p>
                      {log.order_id && (
                        <p className="text-xs text-slate-400">Pedido #{log.order_id}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                        {TYPE_LABEL[log.type] ?? log.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[log.status]}`}>
                        {log.status === 'sent' ? t('admin.emailStatus_sent') : t('admin.emailStatus_failed')}
                      </span>
                      {log.error && (
                        <p className="mt-0.5 max-w-xs truncate text-xs text-rose-500" title={log.error}>
                          {log.error}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDateTime(log.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
            <span>{total} e-mail(s)</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-40"
              >← Anterior</button>
              <span className="px-2 py-1.5 text-sm">{page} / {lastPage}</span>
              <button
                disabled={page >= lastPage}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-40"
              >Próxima →</button>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}
