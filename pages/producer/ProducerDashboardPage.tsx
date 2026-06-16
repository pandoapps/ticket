import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ComposedChart, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTranslation } from 'react-i18next';
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

interface OriginRow { origin: string; orders: number; revenue: number; platform_fee: number; net: number; }

interface ReportData {
  from: string; to: string; granularity: string; event_id: number | null;
  totals: { revenue: number; platform_fee: number; net: number; orders: number; paid_orders: number; pending_orders: number; conversion_percent: number; tickets_issued: number; tickets_redeemed: number; by_origin: OriginRow[]; };
  series: Array<{ bucket: string; revenue: string; platform_fee: string; orders: number }>;
}

export function ProducerDashboardPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [report, setReport] = useState<ReportData | null>(null);
  const [events, setEvents] = useState<EventModel[]>([]);
  const [granularity, setGranularity] = useState<Granularity>('day');
  const [eventId, setEventId] = useState<string>('');

  useEffect(() => {
    producerEventService.list().then((r) => setEvents(r.data)).catch((err: ApiError) => toast.error(err.message));
  }, [toast]);

  useEffect(() => {
    producerService.report({ granularity, event_id: eventId ? Number(eventId) : undefined })
      .then((r) => setReport(r.data))
      .catch((err: ApiError) => toast.error(err.message));
  }, [granularity, eventId, toast]);

  const chartData = useMemo(() => {
    let cumulative = 0;
    return report?.series.map((row) => {
      const revenue = parseFloat(row.revenue);
      const platform_fee = parseFloat(row.platform_fee);
      cumulative += revenue;
      return { bucket: row.bucket, revenue, platform_fee, net: revenue - platform_fee, orders: row.orders, cumulative };
    }) ?? [];
  }, [report]);

  const conversionData = useMemo(
    () => report ? [
      { name: t('producer.paid'), value: report.totals.paid_orders, color: '#2541f5' },
      { name: t('producer.unpaid'), value: Math.max(0, report.totals.orders - report.totals.paid_orders), color: '#e0e7ff' },
    ] : [],
    [report, t],
  );

  const selectedEvent = events.find((e) => String(e.id) === eventId);

  return (
    <AppLayout title={t('producer.panel')} nav={producerNav}>
      <PageHeader
        title={t('producer.dashboardTitle')}
        description={selectedEvent ? t('producer.dashboardEventDesc', { name: selectedEvent.name }) : t('producer.dashboardDesc')}
        action={
          <div className="flex flex-wrap gap-2">
            <select value={eventId} onChange={(e) => setEventId(e.target.value)} className="input max-w-[16rem]">
              <option value="">{t('producer.allEvents')}</option>
              {events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}
            </select>
            <select value={granularity} onChange={(e) => setGranularity(e.target.value as Granularity)} className="input max-w-[10rem]">
              <option value="day">{t('producer.daily')}</option>
              <option value="week">{t('producer.weekly')}</option>
              <option value="month">{t('producer.monthly')}</option>
            </select>
          </div>
        }
      />

      {report && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label={t('producer.grossRevenue')} value={formatBRL(report.totals.revenue)} icon={<Icons.chart className="h-5 w-5" />} gradient="from-brand-500 to-brand-700" />
            <StatCard label={t('producer.platformFee')} value={formatBRL(report.totals.platform_fee)} icon={<Icons.sparkles className="h-5 w-5" />} gradient="from-amber-500 to-orange-600" />
            <StatCard label={t('producer.net')} value={formatBRL(report.totals.net)} icon={<Icons.bag className="h-5 w-5" />} gradient="from-emerald-500 to-teal-600" />
            <StatCard label={t('producer.conversion')} value={`${report.totals.conversion_percent.toFixed(1)}%`} icon={<Icons.sparkles className="h-5 w-5" />} gradient="from-accent-500 to-rose-500" />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label={t('producer.paidOrders')} value={String(report.totals.paid_orders)} icon={<Icons.bag className="h-5 w-5" />} gradient="from-emerald-500 to-teal-600" />
            <StatCard label={t('producer.pendingOrders')} value={String(report.totals.pending_orders)} icon={<Icons.clock className="h-5 w-5" />} gradient="from-amber-500 to-orange-600" hot={report.totals.pending_orders > 0} />
            <StatCard label={t('producer.ticketsIssued')} value={String(report.totals.tickets_issued)} icon={<Icons.ticket className="h-5 w-5" />} gradient="from-fuchsia-500 to-violet-600" />
            <StatCard label={t('producer.ticketsValidated')} value={`${report.totals.tickets_redeemed}/${report.totals.tickets_issued}`} icon={<Icons.shield className="h-5 w-5" />} gradient="from-sky-500 to-indigo-600" />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="glass-card p-6 lg:col-span-2">
              <div className="mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600">{t('producer.revenueOverTime')}</p>
                <h3 className="text-lg font-semibold text-slate-900">{t('producer.salesByPeriod')}</h3>
              </div>
              <div className="mb-3 flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-sm bg-brand-500 opacity-80" />{t('producer.grossRevenue')}</span>
                <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-5 bg-fuchsia-500" />{t('producer.cumulativeRevenue')}</span>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer>
                  <ComposedChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="producerBarFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b61ff" /><stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="bucket" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${Math.round(v)}`} />
                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${Math.round(v)}`} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(59,97,255,0.06)' }} />
                    <Bar yAxisId="left" dataKey="revenue" name={t('producer.grossRevenue')} radius={[4, 4, 0, 0]} fill="url(#producerBarFill)" opacity={0.85} />
                    <Line yAxisId="right" type="monotone" dataKey="cumulative" name={t('producer.cumulativeRevenue')} stroke="#c026d3" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="glass-card p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600">{t('producer.conversionTitle')}</p>
              <h3 className="text-lg font-semibold text-slate-900">{t('producer.paidVsUnpaid')}</h3>
              <div className="mt-4 flex h-56 items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<ChartTooltip />} />
                    <Pie data={conversionData} innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                      {conversionData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-3xl font-bold text-slate-900">{report.totals.conversion_percent.toFixed(1)}%</p>
              <p className="text-center text-xs text-slate-500">{report.totals.paid_orders} {t('producer.orders').toLowerCase()} {t('producer.paid').toLowerCase()} / {report.totals.orders}</p>
            </div>
          </div>

          <div className="mt-6 glass-card p-6">
            <div className="mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600">{t('producer.volume')}</p>
              <h3 className="text-lg font-semibold text-slate-900">{t('producer.ordersByPeriod')}</h3>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b61ff" /><stop offset="100%" stopColor="#c026d3" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="bucket" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(59,97,255,0.06)' }} />
                  <Bar dataKey="orders" name={t('producer.orders')} radius={[8, 8, 0, 0]} fill="url(#barFill)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-white/50 bg-white/60 shadow-glass backdrop-blur-xl">
            <table className="min-w-full divide-y divide-white/60 text-sm">
              <thead className="bg-white/40">
                <tr>
                  <Th>{t('producer.period')}</Th>
                  <Th>{t('producer.orders')}</Th>
                  <Th>{t('producer.fee')}</Th>
                  <Th>{t('producer.net')}</Th>
                  <Th>{t('producer.grossRevenue')}</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/60">
                {chartData.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">{t('producer.noPeriodData')}</td></tr>
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

          {report.totals.by_origin && report.totals.by_origin.length > 0 && (
            <OriginBreakdown rows={report.totals.by_origin} t={t} />
          )}
        </>
      )}
    </AppLayout>
  );
}

const ORIGIN_COLOR: Record<string, string> = {
  website: 'bg-blue-100 text-blue-700',
  widget: 'bg-violet-100 text-violet-700',
  api: 'bg-cyan-100 text-cyan-700',
  admin: 'bg-orange-100 text-orange-700',
  pos: 'bg-teal-100 text-teal-700',
  unknown: 'bg-slate-100 text-slate-600',
};

function OriginBreakdown({ rows, t }: { rows: OriginRow[]; t: (k: string) => string }) {
  const ORIGIN_LABEL: Record<string, string> = {
    website: t('producer.originWebsite'),
    widget: t('producer.originWidget'),
    api: t('producer.originApi'),
    admin: t('producer.originAdmin'),
    pos: t('producer.originPos'),
    unknown: t('producer.originUnknown'),
  };

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-white/50 bg-white/60 shadow-glass backdrop-blur-xl">
      <div className="px-6 py-4 bg-white/40 border-b border-white/60">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600">{t('producer.byOrigin')}</p>
        <h3 className="text-base font-semibold text-slate-900">{t('producer.revenueByOrigin')}</h3>
      </div>
      <table className="min-w-full divide-y divide-white/60 text-sm">
        <thead className="bg-white/40">
          <tr>
            <Th>{t('producer.originCol')}</Th>
            <Th>{t('producer.orders')}</Th>
            <Th>{t('producer.fee')}</Th>
            <Th>{t('producer.net')}</Th>
            <Th>{t('producer.grossRevenue')}</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/60">
          {rows.map((row) => (
            <tr key={row.origin} className="transition hover:bg-white/50">
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ORIGIN_COLOR[row.origin] ?? 'bg-slate-100 text-slate-600'}`}>
                  {ORIGIN_LABEL[row.origin] ?? row.origin}
                </span>
              </td>
              <td className="px-4 py-3">{row.orders}</td>
              <td className="px-4 py-3">{formatBRL(row.platform_fee)}</td>
              <td className="px-4 py-3">{formatBRL(row.net)}</td>
              <td className="px-4 py-3 font-medium">{formatBRL(row.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({ label, value, icon, gradient, hot }: { label: string; value: string; icon: React.ReactNode; gradient: string; hot?: boolean }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 shadow-glass backdrop-blur-xl animate-fade-up ${hot ? 'border-amber-300 bg-amber-50/70' : 'border-white/50 bg-white/60'}`}>
      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${gradient} opacity-25 blur-2xl`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
        </div>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg shadow-black/10`}>{icon}</span>
      </div>
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">{children}</th>;
}

interface TooltipPayload { name: string; value: number; color: string; }
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/60 bg-white/90 px-3 py-2 text-xs shadow-glass backdrop-blur-xl">
      {label && <p className="mb-1 font-semibold text-slate-900">{label}</p>}
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-slate-600">{entry.name}:</span>
          <span className="font-semibold text-slate-900">{typeof entry.value === 'number' && entry.name.toLowerCase().includes('order') ? entry.value : formatBRL(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}
