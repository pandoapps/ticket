import { useEffect, useState } from 'react';
import { AppLayout } from '@components/AppLayout';
import { PageHeader } from '@components/PageHeader';
import { Empty } from '@components/Empty';
import { useToast } from '@components/Toast';
import { adminNav } from './nav';
import { adminService, type AuditLogEntry } from '@services/adminService';
import { formatDateTime } from '@utils/format';
import type { ApiError } from '@services/api';

export function AuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filter, setFilter] = useState('');
  const toast = useToast();

  useEffect(() => {
    const id = setTimeout(() => {
      adminService
        .listAuditLogs({ action: filter || undefined })
        .then((r) => setLogs(r.data))
        .catch((err: ApiError) => toast.error(err.message));
    }, 200);
    return () => clearTimeout(id);
  }, [filter, toast]);

  return (
    <AppLayout title="Admin" nav={adminNav}>
      <PageHeader
        title="Logs de auditoria"
        description="Rastreia ações sensíveis executadas por usuários autenticados."
        action={
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filtrar por ação..."
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          />
        }
      />

      {logs.length === 0 ? (
        <Empty title="Nenhum log encontrado." />
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xs text-brand-600">{log.action}</p>
                  <p className="mt-1 text-sm text-slate-900">
                    {log.user ? `${log.user.name} (${log.user.email})` : 'Sistema'}
                  </p>
                  {log.subject_type && (
                    <p className="mt-1 text-xs text-slate-500">
                      {log.subject_type.split('\\').pop()}#{log.subject_id}
                    </p>
                  )}
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>{formatDateTime(log.created_at)}</p>
                  <p>{log.ip_address}</p>
                </div>
              </div>
              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <pre className="mt-2 overflow-x-auto rounded bg-slate-50 p-2 text-xs text-slate-600">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
