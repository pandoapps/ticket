import { useEffect, useState } from 'react';
import { AppLayout } from '@components/AppLayout';
import { PageHeader } from '@components/PageHeader';
import { useToast } from '@components/Toast';
import { Empty } from '@components/Empty';
import { producerNav } from './nav';
import { producerService } from '@services/producerService';
import { formatBRL, formatDateTime } from '@utils/format';
import type { ApiError } from '@services/api';

interface Sale {
  id: number;
  total: number;
  status: string;
  created_at: string;
  paid_at: string | null;
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

const STATUS_LABEL: Record<string, string> = {
  paid: 'Paga',
  pending: 'Pendente',
  cancelled: 'Cancelada',
  expired: 'Expirada',
};

export function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [status, setStatus] = useState('');
  const toast = useToast();

  useEffect(() => {
    producerService
      .sales(status || undefined)
      .then((r) => setSales(r.data as Sale[]))
      .catch((err: ApiError) => toast.error(err.message));
  }, [status, toast]);

  return (
    <AppLayout title="Produtor" nav={producerNav}>
      <PageHeader
        title="Vendas"
        description="Acompanhe em tempo real os pedidos dos seus eventos."
        action={
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          >
            <option value="">Todos os status</option>
            <option value="paid">Pagas</option>
            <option value="pending">Pendentes</option>
            <option value="cancelled">Canceladas</option>
            <option value="expired">Expiradas</option>
          </select>
        }
      />

      {sales.length === 0 ? (
        <Empty title="Nenhuma venda encontrada." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <Th>Pedido</Th>
                <Th>Cliente</Th>
                <Th>Evento</Th>
                <Th>Ingressos</Th>
                <Th>Total</Th>
                <Th>Status</Th>
                <Th>Data</Th>
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
                  <td className="px-4 py-3 text-slate-600">
                    {sale.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0}
                  </td>
                  <td className="px-4 py-3">{formatBRL(sale.total)}</td>
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
