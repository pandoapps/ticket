import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@components/AppLayout';
import { PageHeader } from '@components/PageHeader';
import { useToast } from '@components/Toast';
import { Empty } from '@components/Empty';
import { producerNav } from './nav';
import { producerService } from '@services/producerService';
import { formatBRL, formatDateTime } from '@utils/format';
import type { ApiError } from '@services/api';

interface Sale {
  id: number; total: number; status: string; created_at: string; paid_at: string | null;
  sale_origin?: string | null;
  customer?: { id: number; name: string; email: string };
  event?: { id: number; name: string };
  items?: Array<{ id: number; quantity: number; lot?: { name: string } }>;
}

const STATUS_COLOR: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-rose-100 text-rose-700',
  expired: 'bg-slate-100 text-slate-700',
};

const ORIGIN_COLOR: Record<string, string> = {
  website: 'bg-blue-100 text-blue-700',
  widget: 'bg-violet-100 text-violet-700',
  api: 'bg-cyan-100 text-cyan-700',
  admin: 'bg-orange-100 text-orange-700',
  pos: 'bg-teal-100 text-teal-700',
};

export function SalesPage() {
  const { t } = useTranslation();
  const [sales, setSales] = useState<Sale[]>([]);
  const [status, setStatus] = useState('');
  const toast = useToast();

  const STATUS_LABEL: Record<string, string> = {
    paid: t('producer.paidStatus'),
    pending: t('producer.pendingStatus'),
    cancelled: t('producer.cancelledStatus'),
    expired: t('producer.expiredStatus'),
  };

  const ORIGIN_LABEL: Record<string, string> = {
    website: t('producer.originWebsite'),
    widget: t('producer.originWidget'),
    api: t('producer.originApi'),
    admin: t('producer.originAdmin'),
    pos: t('producer.originPos'),
  };

  useEffect(() => {
    producerService.sales(status || undefined)
      .then((r) => setSales(r.data as Sale[]))
      .catch((err: ApiError) => toast.error(err.message));
  }, [status, toast]);

  return (
    <AppLayout title={t('producer.panel')} nav={producerNav}>
      <PageHeader
        title={t('producer.salesPage')}
        description={t('producer.salesDesc')}
        action={
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
            <option value="">{t('producer.allStatuses')}</option>
            <option value="paid">{t('producer.paidStatus')}</option>
            <option value="pending">{t('producer.pendingStatus')}</option>
            <option value="cancelled">{t('producer.cancelledStatus')}</option>
            <option value="expired">{t('producer.expiredStatus')}</option>
          </select>
        }
      />

      {sales.length === 0 ? (
        <Empty title={t('producer.noSales')} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <Th>{t('producer.orderCol')}</Th>
                <Th>{t('producer.customerCol')}</Th>
                <Th>{t('producer.eventCol')}</Th>
                <Th>{t('producer.ticketsCol')}</Th>
                <Th>{t('producer.totalCol')}</Th>
                <Th>{t('producer.originCol')}</Th>
                <Th>{t('producer.statusCol')}</Th>
                <Th>{t('producer.dateCol')}</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td className="px-4 py-3 font-mono text-xs">#{sale.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{sale.customer?.name}</p>
                    <p className="text-xs text-slate-500">{sale.customer?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{sale.event?.name}</td>
                  <td className="px-4 py-3 text-slate-600">{sale.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0}</td>
                  <td className="px-4 py-3">{formatBRL(sale.total)}</td>
                  <td className="px-4 py-3">
                    {sale.sale_origin ? (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ORIGIN_COLOR[sale.sale_origin] ?? 'bg-slate-100 text-slate-600'}`}>
                        {ORIGIN_LABEL[sale.sale_origin] ?? sale.sale_origin}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[sale.status] ?? ''}`}>
                      {STATUS_LABEL[sale.status] ?? sale.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{formatDateTime(sale.paid_at ?? sale.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{children}</th>;
}
