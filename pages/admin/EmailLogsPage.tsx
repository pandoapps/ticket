import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@components/AppLayout';
import { PageHeader } from '@components/PageHeader';
import { Empty } from '@components/Empty';
import { useToast } from '@components/Toast';
import { adminNav } from './nav';
import { adminService, type EmailLogEntry } from '@services/adminService';
import { formatDateTime } from '@utils/format';
import type { ApiError } from '@services/api';

const STATUS_COLOR = {
  sent: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-rose-100 text-rose-700',
};

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <button
      onClick={copy}
      title="Copiar"
      className="ml-1.5 shrink-0 rounded p-0.5 text-slate-400 hover:text-slate-600"
    >
      {copied ? (
        <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      )}
    </button>
  );
}

function DetailRow({ label, value, copiable }: { label: string; value: string | null | undefined; copiable?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>
      <div className="flex items-start gap-1">
        <span className="break-all text-sm text-slate-800">{value}</span>
        {copiable && <CopyButton value={value} />}
      </div>
    </div>
  );
}

function EmailDetailModal({ log, onClose, onResent }: { log: EmailLogEntry; onClose: () => void; onResent: () => void }) {
  const { t } = useTranslation();
  const toast = useToast();
  const [resending, setResending] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !log.body) return;
    const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(log.body);
    doc.close();
  }, [log.body]);

  async function handleResend() {
    setResending(true);
    try {
      await adminService.resendEmailLog(log.id);
      toast.success('E-mail reenviado com sucesso.');
      onResent();
      onClose();
    } catch (err) {
      toast.error((err as ApiError).message);
    } finally {
      setResending(false);
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
    >
      <div className="flex w-full max-w-2xl flex-col rounded-t-2xl bg-white shadow-xl sm:max-h-[90vh] sm:rounded-2xl">
        {/* header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-800">Detalhes do e-mail</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-slate-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* metadata */}
          <div className="grid grid-cols-2 gap-4">
            <DetailRow label="E-mail" value={log.to_email} copiable />
            <DetailRow label="Destinatário" value={log.to_name} />
            <div className="col-span-2">
              <DetailRow label="Assunto" value={log.subject} copiable />
            </div>
            <DetailRow label="Tipo" value={t(`admin.emailType_${log.type}` as never, { defaultValue: log.type })} />
            {log.order_id && <DetailRow label="Pedido" value={`#${log.order_id}`} />}
            {log.producer && <DetailRow label="Produtor" value={log.producer.company_name} />}
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Status</span>
              <span className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[log.status]}`}>
                {t(`admin.emailStatus_${log.status}` as never)}
              </span>
            </div>
            <DetailRow label="Enviado em" value={formatDateTime(log.created_at)} />
          </div>

          {log.error && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Erro</span>
              <div className="flex items-start gap-1">
                <span className="break-all text-sm text-rose-600">{log.error}</span>
                <CopyButton value={log.error} />
              </div>
            </div>
          )}

          {/* email body preview */}
          {log.body ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Corpo do e-mail</span>
                <button
                  onClick={() => {
                    const blob = new Blob([log.body!], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    window.open(url, '_blank');
                    setTimeout(() => URL.revokeObjectURL(url), 30_000);
                  }}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Abrir em nova aba
                </button>
              </div>
              <iframe
                ref={iframeRef}
                sandbox="allow-same-origin"
                className="h-96 w-full rounded-lg border border-slate-200 bg-white"
                title="Corpo do e-mail"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Corpo do e-mail</span>
              <p className="text-sm text-slate-400">Não disponível — e-mail enviado antes do registro de corpo ser habilitado.</p>
            </div>
          )}
        </div>

        {/* footer */}
        <div className="flex shrink-0 justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
            Fechar
          </button>
          {log.type === 'payment_link' && (
            <button
              onClick={handleResend}
              disabled={resending}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {resending ? 'Reenviando…' : 'Reenviar e-mail'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminEmailLogsPage() {
  const { t } = useTranslation();
  const toast = useToast();

  const [logs, setLogs] = useState<EmailLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [selected, setSelected] = useState<EmailLogEntry | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q), 250);
    return () => clearTimeout(id);
  }, [q]);

  useEffect(() => { setPage(1); }, [status, debouncedQ]);

  useEffect(() => {
    adminService.listEmailLogs({ status: status || undefined, q: debouncedQ || undefined, page })
      .then((r) => {
        setLogs(r.data);
        setTotal(r.meta.total);
        setLastPage(r.meta.last_page);
      })
      .catch((err: ApiError) => toast.error(err.message));
  }, [status, debouncedQ, page, toast, tick]);

  return (
    <AppLayout title={t('admin.panel')} nav={adminNav}>
      <PageHeader
        title={t('admin.emailLogsPage')}
        description={t('admin.emailLogsDesc')}
        action={
          <div className="flex gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar e-mail ou destinatário..."
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
        <Empty title={t('admin.noEmailLogs')} />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Destinatário</th>
                  <th className="px-4 py-3 text-left">Assunto</th>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-left">Produtor</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Enviado em</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelected(log)}
                    className="cursor-pointer hover:bg-slate-50"
                  >
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
                        {t(`admin.emailType_${log.type}` as never, { defaultValue: log.type })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {log.producer?.company_name ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[log.status]}`}>
                        {t(`admin.emailStatus_${log.status}` as never)}
                      </span>
                      {log.error && (
                        <p className="mt-0.5 max-w-xs truncate text-xs text-rose-500" title={log.error}>
                          {log.error}
                        </p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelected(log); }}
                        className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
            <span>{total} registro(s)</span>
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

      {selected && (
        <EmailDetailModal
          log={selected}
          onClose={() => setSelected(null)}
          onResent={() => setTick((t) => t + 1)}
        />
      )}
    </AppLayout>
  );
}
