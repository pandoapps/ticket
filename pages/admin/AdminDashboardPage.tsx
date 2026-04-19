import { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AppLayout } from '@components/AppLayout';
import { PageHeader } from '@components/PageHeader';
import { Icons } from '@components/Icon';
import { useToast } from '@components/Toast';
import { adminNav } from './nav';
import { adminService, type Dashboard } from '@services/adminService';
import { formatBRL } from '@utils/format';
import type { ApiError } from '@services/api';

export function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const toast = useToast();

  useEffect(() => {
    adminService
      .dashboard()
      .then((r) => setDashboard(r.data))
      .catch((err: ApiError) => toast.error(err.message));
  }, [toast]);

  const chartData = useMemo(
    () =>
      dashboard?.gmv_series.map((row) => ({
        bucket: row.bucket,
        revenue: parseFloat(row.revenue),
        platform_fee: parseFloat(row.platform_fee),
      })) ?? [],
    [dashboard],
  );

  return (
    <AppLayout title="Admin" subtitle="Painel" nav={adminNav}>
      <PageHeader title="Visão geral da plataforma" description="Indicadores de performance e uso." />

      {dashboard && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="GMV"
              value={formatBRL(dashboard.gmv)}
              icon={<Icons.chart className="h-5 w-5" />}
              gradient="from-brand-500 to-brand-700"
            />
            <StatCard
              label="Taxa plataforma"
              value={formatBRL(dashboard.platform_fee_total)}
              icon={<Icons.sparkles className="h-5 w-5" />}
              gradient="from-accent-500 to-rose-500"
            />
            <StatCard
              label="Pedidos pagos"
              value={String(dashboard.orders_paid)}
              icon={<Icons.bag className="h-5 w-5" />}
              gradient="from-emerald-500 to-teal-600"
            />
            <StatCard
              label="Ingressos emitidos"
              value={String(dashboard.tickets_sold)}
              icon={<Icons.ticket className="h-5 w-5" />}
              gradient="from-fuchsia-500 to-violet-600"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Eventos publicados"
              value={`${dashboard.events_published}/${dashboard.events_total}`}
              icon={<Icons.calendar className="h-5 w-5" />}
              gradient="from-sky-500 to-indigo-600"
            />
            <StatCard
              label="Produtores"
              value={String(dashboard.producers_total)}
              icon={<Icons.users className="h-5 w-5" />}
              gradient="from-purple-500 to-indigo-600"
            />
            <StatCard
              label="Produtores pendentes"
              value={String(dashboard.producers_pending)}
              icon={<Icons.clock className="h-5 w-5" />}
              gradient="from-amber-500 to-orange-600"
              hot={dashboard.producers_pending > 0}
            />
            <StatCard
              label="Clientes"
              value={String(dashboard.customers_total)}
              icon={<Icons.user className="h-5 w-5" />}
              gradient="from-cyan-500 to-teal-500"
            />
          </div>

          <div className="mt-8 glass-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600">GMV</p>
                <h3 className="text-lg font-semibold text-slate-900">Últimos 30 dias</h3>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="adminRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b61ff" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#3b61ff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="adminFee" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d946ef" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#d946ef" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="bucket" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${Math.round(v)}`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="revenue" name="Receita" stroke="#2541f5" fill="url(#adminRevenue)" strokeWidth={2} />
                  <Area type="monotone" dataKey="platform_fee" name="Taxa" stroke="#c026d3" fill="url(#adminFee)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {chartData.length === 0 && (
              <p className="pt-4 text-center text-sm text-slate-500">Sem dados de receita ainda.</p>
            )}
          </div>
        </>
      )}
    </AppLayout>
  );
}

function StatCard({
  label,
  value,
  icon,
  gradient,
  hot,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
  hot?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 shadow-glass backdrop-blur-xl animate-fade-up ${
        hot ? 'border-amber-300 bg-amber-50/70' : 'border-white/50 bg-white/60'
      }`}
    >
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

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/60 bg-white/90 px-3 py-2 text-xs shadow-glass backdrop-blur-xl">
      {label && <p className="mb-1 font-semibold text-slate-900">{label}</p>}
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-slate-600">{entry.name}:</span>
          <span className="font-semibold text-slate-900">{formatBRL(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}
