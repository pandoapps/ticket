import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@components/AppLayout';
import { PageHeader } from '@components/PageHeader';
import { Empty } from '@components/Empty';
import { useToast } from '@components/Toast';
import { customerNav } from './nav';
import { orderService, type Order } from '@services/orderService';
import { formatBRL, formatDateTime } from '@utils/format';
import type { ApiError } from '@services/api';

export function OrdersPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const toast = useToast();

  const STATUS: Record<string, { label: string; color: string }> = {
    paid: { label: t('orders.paid'), color: 'bg-emerald-100 text-emerald-700' },
    pending: { label: t('orders.pending'), color: 'bg-amber-100 text-amber-700' },
    cancelled: { label: t('orders.cancelled'), color: 'bg-rose-100 text-rose-700' },
    expired: { label: t('orders.expired'), color: 'bg-slate-100 text-slate-700' },
  };

  useEffect(() => {
    orderService
      .list()
      .then((r) => setOrders(r.data))
      .catch((err: ApiError) => toast.error(err.message));
  }, [toast]);

  return (
    <AppLayout title="Ticketeira" nav={customerNav}>
      <PageHeader title={t('orders.title')} />

      {orders.length === 0 ? (
        <Empty title={t('orders.noOrders')} />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const meta = STATUS[order.status] ?? { label: order.status, color: '' };
            return (
              <Link
                key={order.id}
                to={`/meus-pedidos/${order.id}`}
                className="block glass-card p-5 transition hover:-translate-y-0.5 hover:shadow-glass-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-slate-500">{t('orders.orderLabel', { id: order.id })}</p>
                    <p className="truncate text-lg font-semibold text-slate-900">{order.event?.name}</p>
                    <p className="text-sm text-slate-500">{formatDateTime(order.created_at)}</p>
                  </div>
                  <span className={`chip ${meta.color}`}>{meta.label}</span>
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div className="text-sm text-slate-600">
                    {order.items?.map((i) => (
                      <p key={i.id}>{i.quantity}× {i.lot?.name}</p>
                    ))}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">{t('orders.total')}</p>
                    <p className="text-xl font-semibold">{formatBRL(order.total)}</p>
                    {order.status === 'pending' && <p className="mt-1 text-xs text-brand-600">{t('orders.viewQrCode')}</p>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
