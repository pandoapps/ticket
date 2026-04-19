import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@components/AppLayout';
import { PageHeader } from '@components/PageHeader';
import { Empty } from '@components/Empty';
import { useToast } from '@components/Toast';
import { customerNav } from './nav';
import { orderService, type Order } from '@services/orderService';
import { formatBRL, formatDateTime } from '@utils/format';
import type { ApiError } from '@services/api';

const STATUS: Record<string, { label: string; color: string }> = {
  paid: { label: 'Pago', color: 'bg-emerald-100 text-emerald-700' },
  pending: { label: 'Aguardando PIX', color: 'bg-amber-100 text-amber-700' },
  cancelled: { label: 'Cancelado', color: 'bg-rose-100 text-rose-700' },
  expired: { label: 'Expirado', color: 'bg-slate-100 text-slate-700' },
};

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const toast = useToast();

  useEffect(() => {
    orderService
      .list()
      .then((r) => setOrders(r.data))
      .catch((err: ApiError) => toast.error(err.message));
  }, [toast]);

  return (
    <AppLayout title="Ticketeira" nav={customerNav}>
      <PageHeader title="Meus pedidos" />

      {orders.length === 0 ? (
        <Empty title="Você ainda não fez pedidos." />
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
                    <p className="font-mono text-xs text-slate-500">Pedido #{order.id}</p>
                    <p className="truncate text-lg font-semibold text-slate-900">{order.event?.name}</p>
                    <p className="text-sm text-slate-500">{formatDateTime(order.created_at)}</p>
                  </div>
                  <span className={`chip ${meta.color}`}>{meta.label}</span>
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div className="text-sm text-slate-600">
                    {order.items?.map((i) => (
                      <p key={i.id}>
                        {i.quantity}× {i.lot?.name}
                      </p>
                    ))}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Total</p>
                    <p className="text-xl font-semibold">{formatBRL(order.total)}</p>
                    {order.status === 'pending' && <p className="mt-1 text-xs text-brand-600">Ver QR Code →</p>}
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
