import { useEffect, useState } from 'react';
import { AppLayout } from '@components/AppLayout';
import { PageHeader } from '@components/PageHeader';
import { Empty } from '@components/Empty';
import { useToast } from '@components/Toast';
import { Icons } from '@components/Icon';
import { producerNav } from './nav';
import {
  producerService,
  type ProducerCustomer,
  type ProducerCustomerListResponse,
  type ProducerCustomerSort,
} from '@services/producerService';
import { formatBRL, formatDateTime, formatCPF, formatPhone } from '@utils/format';
import type { ApiError } from '@services/api';

export function CustomersPage() {
  const [response, setResponse] = useState<ProducerCustomerListResponse | null>(null);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<ProducerCustomerSort>('last_order');
  const [page, setPage] = useState(1);
  const toast = useToast();

  useEffect(() => {
    const handle = setTimeout(() => {
      producerService
        .customers({ q: q || undefined, sort, page })
        .then(setResponse)
        .catch((err: ApiError) => toast.error(err.message));
    }, 200);
    return () => clearTimeout(handle);
  }, [q, sort, page, toast]);

  useEffect(() => {
    setPage(1);
  }, [q, sort]);

  const customers = response?.data ?? [];
  const totals = customers.reduce(
    (acc, c) => {
      acc.revenue += c.total_spent;
      acc.orders += c.orders_count;
      return acc;
    },
    { revenue: 0, orders: 0 },
  );

  return (
    <AppLayout title="Produtor" nav={producerNav}>
      <PageHeader
        title="Clientes"
        description="Todas as pessoas que já fizeram pedidos nos seus eventos."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Clientes únicos"
          value={String(response?.meta.total ?? 0)}
          icon={<Icons.users className="h-5 w-5" />}
          gradient="from-brand-500 to-brand-700"
        />
        <StatCard
          label="Pedidos (página)"
          value={String(totals.orders)}
          icon={<Icons.bag className="h-5 w-5" />}
          gradient="from-indigo-500 to-violet-600"
        />
        <StatCard
          label="Receita paga (página)"
          value={formatBRL(totals.revenue)}
          icon={<Icons.sparkles className="h-5 w-5" />}
          gradient="from-emerald-500 to-teal-600"
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, e-mail, CPF ou telefone"
          className="input max-w-sm"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as ProducerCustomerSort)}
          className="input max-w-xs"
        >
          <option value="last_order">Mais recentes</option>
          <option value="total">Maior receita</option>
          <option value="orders">Mais pedidos</option>
          <option value="name">Nome (A–Z)</option>
        </select>
      </div>

      {customers.length === 0 ? (
        <Empty
          title="Nenhum cliente encontrado."
          description="Assim que você receber pedidos, os clientes aparecerão aqui."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/50 bg-white/60 shadow-glass backdrop-blur-xl">
          <table className="min-w-full divide-y divide-white/60 text-sm">
            <thead className="bg-white/40">
              <tr>
                <Th>Cliente</Th>
                <Th>Contato</Th>
                <Th className="text-right">Pedidos</Th>
                <Th className="text-right">Pagos</Th>
                <Th className="text-right">Total gasto</Th>
                <Th>Última compra</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/60">
              {customers.map((c) => (
                <CustomerRow key={c.id} customer={c} />
              ))}
            </tbody>
          </table>

          {response && response.meta.last_page > 1 && (
            <div className="flex items-center justify-between border-t border-white/60 px-4 py-3 text-xs text-slate-500">
              <span>
                Página {response.meta.page} de {response.meta.last_page} — {response.meta.total} clientes
              </span>
              <div className="flex gap-2">
                <button
                  disabled={response.meta.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-white/60 bg-white/70 px-3 py-1 disabled:opacity-40"
                >
                  ← Anterior
                </button>
                <button
                  disabled={response.meta.page >= response.meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-white/60 bg-white/70 px-3 py-1 disabled:opacity-40"
                >
                  Próxima →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}

function CustomerRow({ customer }: { customer: ProducerCustomer }) {
  const phone = customer.phone ? formatPhone(customer.phone) : null;
  const cpf = customer.cpf ? formatCPF(customer.cpf) : null;
  return (
    <tr className="transition hover:bg-white/50">
      <td className="px-4 py-3">
        <p className="font-medium text-slate-900">{customer.name}</p>
        {cpf && <p className="text-xs text-slate-500">CPF {cpf}</p>}
      </td>
      <td className="px-4 py-3">
        <p className="text-slate-700">{customer.email}</p>
        {phone && <p className="text-xs text-slate-500">{phone}</p>}
      </td>
      <td className="px-4 py-3 text-right font-medium text-slate-900">{customer.orders_count}</td>
      <td className="px-4 py-3 text-right text-emerald-700">{customer.paid_orders_count}</td>
      <td className="px-4 py-3 text-right font-medium text-slate-900">{formatBRL(customer.total_spent)}</td>
      <td className="px-4 py-3 text-xs text-slate-500">{formatDateTime(customer.last_order_at)}</td>
    </tr>
  );
}

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 ${className ?? ''}`}>
      {children}
    </th>
  );
}

function StatCard({
  label,
  value,
  icon,
  gradient,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/50 bg-white/60 p-5 shadow-glass backdrop-blur-xl">
      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${gradient} opacity-25 blur-2xl`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
        </div>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg shadow-black/10`}>
          {icon}
        </span>
      </div>
    </div>
  );
}
