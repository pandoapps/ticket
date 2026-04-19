import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AppLayout } from '@components/AppLayout';
import { PageHeader } from '@components/PageHeader';
import { Icons } from '@components/Icon';
import { useToast } from '@components/Toast';
import { producerNav } from './nav';
import { producerService } from '@services/producerService';
import { producerEventService, type EventModel } from '@services/eventService';
import { formatBRL } from '@utils/format';
import type { ApiError } from '@services/api';

type Granularity = 'day' | 'week' | 'month';

interface ReportData {
  from: string;
  to: string;
  granularity: string;
  event_id: number | null;
  totals: {
    revenue: number;
    platform_fee: number;
    net: number;
    orders: number;
    paid_orders: number;
    pending_orders: number;
    conversion_percent: number;
    tickets_issued: number;
    tickets_redeemed: number;
  };
  series: Array<{ bucket: string; revenue: string; platform_fee: string; orders: number }>;
}

export function ProducerDashboardPage() {
  const toast = useToast();
  const [report, setReport] = useState<ReportData | null>(null);
  const [events, setEvents] = useState<EventModel[]>([]);
  const [granularity, setGranularity] = useState<Granularity>('day');
  const [eventId, setEventId] = useState<string>('');

  useEffect(() => {
    producerEventService
      .list()
      .then((r) => setEvents(r.data))
      .catch((err: ApiError) => toast.error(err.message));
  }, [toast]);

  useEffect(() => {
    producerService
      .report({
        granularity,
        event_id: eventId ? Number(eventId) : undefined,
      })
      .then((r) => setReport(r.data))
      .catch((err: ApiError) => toast.error(err.message));
  }, [granularity, eventId, toast]);

  const chartData = useMemo(
    () =>
      report?.series.map((row) => ({
        bucket: row.bucket,
        revenue: parseFloat(row.revenue),
        platform_fee: parseFloat(row.platform_fee),
        net: parseFloat(row.revenue) - parseFloat(row.platform_fee),
        orders: row.orders,
      })) ?? [],
    [report],
  );

  const conversionData = useMemo(
    () =>
      report
        ? [
            { name: 'Pagos', value: report.totals.paid_orders, color: '#2541f5' },
            {
              name: 'Não pagos',
              value: Math.max(0, report.totals.orders - report.totals.paid_orders),
              color: '#e0e7ff',
            },
          ]
        : [],
    [report],
  );

  const selectedEvent = events.find((e) => String(e.id) === eventId);

  return (
    <AppLayout title="Produtor" nav={producerNav}>
      <PageHeader
        title="Dashboard"
        description={
          selectedEvent
            ? `Visão geral do evento “${selectedEvent.name}”.`
            : 'Visão geral de todos os seus eventos nos últimos 30 dias.'
        }
        action={
          <div className="flex flex-wrap gap-2">
            <select value={eventId} onChange={(e) => setEventId(e.target.value)} className="input max-w-[16rem]">
              <option value="">Todos os eventos</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
            <select
              value={granularity}
              onChange={(e) => setGranularity(e.target.value as Granularity)}
              className="input max-w-[10rem]"
            >
              <option value="day">Diário</option>
              <option value="week">Semanal</option>
              <option value="month">Mensal</option>
            </select>
          </div>
        }
      />

      {report && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Receita bruta"
              value={formatBRL(report.totals.revenue)}
              icon={<Icons.chart className="h-5 w-5" />}
              gradient="from-brand-500 to-brand-700"
            />
            <StatCard
              label="Taxa plataforma"
              value={formatBRL(report.totals.platform_fee)}
              icon={<Icons.sparkles className="h-5 w-5" />}
              gradient="from-amber-500 to-orange-600"
            />
            <StatCard
              label="Líquido"
              value={formatBRL(report.totals.net)}
              icon={<Icons.bag className="h-5 w-5" />}
              gradient="from-emerald-500 to-teal-600"
            />
            <StatCard
              label="Conversão"
              value={`${report.totals.conversion_percent.toFixed(1)}%`}
              icon={<Icons.sparkles className="h-5 w-5" />}
              gradient="from-accent-500 to-rose-500"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Pedidos pagos"
              value={String(report.totals.paid_orders)}
              icon={<Icons.bag className="h-5 w-5" />}
              gradient="from-emerald-500 to-teal-600"
            />
            <StatCard
              label="Pedidos pendentes"
              value={String(report.totals.pending_orders)}
              icon={<Icons.clock className="h-5 w-5" />}
              gradient="from-amber-500 to-orange-600"
              hot={report.totals.pending_orders > 0}
            />
            <StatCard
              label="Ingressos emitidos"
              value={String(report.totals.tickets_issued)}
              icon={<Icons.ticket className="h-5 w-5" />}
              gradient="from-fuchsia-500 to-violet-600"
            />
            <StatCard
              label="Ingressos validados"
              value={`${report.totals.tickets_redeemed}/${report.totals.tickets_issued}`}
              icon={<Icons.shield className="h-5 w-5" />}
              gradient="from-sky-500 to-indigo-600"
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="glass-card p-6 lg:col-span-2">
              <div className="mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600">
                  Receita ao longo do tempo
                </p>
                <h3 className="text-lg font-semibold text-slate-900">Vendas por período</h3>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b61ff" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#3b61ff" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="fillFee" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#d946ef" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#d946ef" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="bucket" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `R$${Math.round(v)}`}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Receita"
                      stroke="#2541f5"
                      fill="url(#fillRevenue)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="platform_fee"
                      name="Taxa"
                      stroke="#c026d3"
                      fill="url(#fillFee)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600">Conversão</p>
              <h3 className="text-lg font-semibold text-slate-900">Pagos vs não pagos</h3>
              <div className="mt-4 flex h-56 items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<ChartTooltip />} />
                    <Pie
                      data={conversionData}
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {conversionData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-3xl font-bold text-slate-900">
                {report.totals.conversion_percent.toFixed(1)}%
              </p>
              <p className="text-center text-xs text-slate-500">
                {report.totals.paid_orders} de {report.totals.orders} pedidos pagos
              </p>
            </div>
          </div>

          <div className="mt-6 glass-card p-6">
            <div className="mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600">Volume</p>
              <h3 className="text-lg font-semibold text-slate-900">Pedidos por período</h3>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b61ff" />
                      <stop offset="100%" stopColor="#c026d3" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="bucket" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(59,97,255,0.06)' }} />
                  <Bar dataKey="orders" name="Pedidos" radius={[8, 8, 0, 0]} fill="url(#barFill)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-white/50 bg-white/60 shadow-glass backdrop-blur-xl">
            <table className="min-w-full divide-y divide-white/60 text-sm">
              <thead className="bg-white/40">
                <tr>
                  <Th>Período</Th>
                  <Th>Pedidos</Th>
                  <Th>Taxa</Th>
                  <Th>Líquido</Th>
                  <Th>Receita</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/60">
                {chartData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      Sem dados no período.
                    </td>
                  </tr>
                ) : (
                  chartData.map((row) => (
                    <tr key={row.bucket} className="transition hover:bg-white/50">
                      <td className="px-4 py-3 font-mono text-xs">{row.bucket}</td>
                      <td className="px-4 py-3">{row.orders}</td>
                      <td className="px-4 py-3">{formatBRL(row.platform_fee)}</td>
                      <td className="px-4 py-3">{formatBRL(row.net)}</td>
                      <td className="px-4 py-3 font-medium">{formatBRL(row.revenue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
      {children}
    </th>
  );
}

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/60 bg-white/90 px-3 py-2 text-xs shadow-glass backdrop-blur-xl">
      {label && <p className="mb-1 font-semibold text-slate-900">{label}</p>}
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-slate-600">{entry.name}:</span>
          <span className="font-semibold text-slate-900">
            {entry.name === 'Pedidos' ? entry.value : formatBRL(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
