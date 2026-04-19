import { useEffect, useState } from 'react';
import { AppLayout } from '@components/AppLayout';
import { PageHeader } from '@components/PageHeader';
import { Empty } from '@components/Empty';
import { Modal } from '@components/Modal';
import { useToast } from '@components/Toast';
import { useConfirm } from '@components/ConfirmDialog';
import { Icons } from '@components/Icon';
import { producerNav } from './nav';
import {
  producerTicketService,
  type ProducerTicket,
  type TicketListResponse,
  type TicketQrData,
} from '@services/producerTicketService';
import { producerEventService, type EventModel } from '@services/eventService';
import { ticketRedemptionService } from '@services/ticketRedemptionService';
import { formatDateTime } from '@utils/format';
import type { ApiError } from '@services/api';

type StatusFilter = 'all' | 'used' | 'unused';

export function ProducerTicketsPage() {
  const [response, setResponse] = useState<TicketListResponse | null>(null);
  const [events, setEvents] = useState<EventModel[]>([]);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [eventId, setEventId] = useState<string>('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [qrModal, setQrModal] = useState<{ ticket: ProducerTicket; qr: TicketQrData | null } | null>(null);
  const [redeemingId, setRedeemingId] = useState<number | null>(null);
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    producerEventService
      .list()
      .then((r) => setEvents(r.data))
      .catch((err: ApiError) => toast.error(err.message));
  }, [toast]);

  useEffect(() => {
    const handle = setTimeout(() => {
      producerTicketService
        .list({
          status: status === 'all' ? undefined : status,
          event_id: eventId ? Number(eventId) : undefined,
          q: q || undefined,
          page,
        })
        .then(setResponse)
        .catch((err: ApiError) => toast.error(err.message));
    }, 200);
    return () => clearTimeout(handle);
  }, [status, eventId, q, page, toast]);

  useEffect(() => {
    setPage(1);
  }, [status, eventId, q]);

  async function openQr(ticket: ProducerTicket) {
    setQrModal({ ticket, qr: null });
    try {
      const res = await producerTicketService.show(ticket.id);
      setQrModal({ ticket, qr: res.data });
    } catch (err) {
      toast.error((err as ApiError).message);
      setQrModal(null);
    }
  }

  async function handleRedeem(ticket: ProducerTicket) {
    if (ticket.used_at !== null) return;
    const ok = await confirm({
      title: 'Resgatar ingresso?',
      description: `Validar o ingresso de ${ticket.customer.name} agora. Esta ação não pode ser desfeita.`,
      confirmText: 'Resgatar agora',
      cancelText: 'Cancelar',
      variant: 'success',
    });
    if (!ok) return;
    setRedeemingId(ticket.id);
    try {
      const res = await ticketRedemptionService.redeem(ticket.code);
      if (res.status === 'ok') {
        const usedAt = res.data?.used_at ?? new Date().toISOString();
        setResponse((prev) =>
          prev
            ? {
                ...prev,
                data: prev.data.map((t) => (t.id === ticket.id ? { ...t, used_at: usedAt } : t)),
                meta: {
                  ...prev.meta,
                  stats: {
                    ...prev.meta.stats,
                    used: prev.meta.stats.used + 1,
                    unused: Math.max(0, prev.meta.stats.unused - 1),
                  },
                },
              }
            : prev,
        );
        toast.success('Ingresso validado.');
      } else if (res.status === 'already_used') {
        toast.error('Ingresso já utilizado.');
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error((err as ApiError).message);
    } finally {
      setRedeemingId(null);
    }
  }

  const tickets = response?.data ?? [];
  const stats = response?.meta.stats;

  return (
    <AppLayout title="Produtor" nav={producerNav}>
      <PageHeader
        title="Ingressos emitidos"
        description="Todos os ingressos gerados por pedidos pagos, com status de validação."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total emitidos"
          value={stats?.total ?? 0}
          icon={<Icons.ticket className="h-5 w-5" />}
          gradient="from-brand-500 to-brand-700"
        />
        <StatCard
          label="Validados"
          value={stats?.used ?? 0}
          icon={<Icons.sparkles className="h-5 w-5" />}
          gradient="from-emerald-500 to-teal-600"
        />
        <StatCard
          label="Pendentes"
          value={stats?.unused ?? 0}
          icon={<Icons.clock className="h-5 w-5" />}
          gradient="from-amber-500 to-orange-600"
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-xl border border-white/60 bg-white/60 p-1 backdrop-blur">
          <FilterChip active={status === 'all'} onClick={() => setStatus('all')} label="Todos" />
          <FilterChip active={status === 'unused'} onClick={() => setStatus('unused')} label="Pendentes" />
          <FilterChip active={status === 'used'} onClick={() => setStatus('used')} label="Validados" />
        </div>
        <select value={eventId} onChange={(e) => setEventId(e.target.value)} className="input max-w-xs">
          <option value="">Todos os eventos</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar cliente (nome ou e-mail)"
          className="input max-w-xs"
        />
      </div>

      {tickets.length === 0 ? (
        <Empty title="Nenhum ingresso encontrado." description="Ajuste os filtros ou aguarde novas vendas." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/50 bg-white/60 shadow-glass backdrop-blur-xl">
          <table className="min-w-full divide-y divide-white/60 text-sm">
            <thead className="bg-white/40">
              <tr>
                <Th>Status</Th>
                <Th>Cliente</Th>
                <Th>Evento</Th>
                <Th>Ingresso</Th>
                <Th>Emitido</Th>
                <Th>Validado em</Th>
                <Th className="text-right">Ações</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/60">
              {tickets.map((ticket) => (
                <TicketRow
                  key={ticket.id}
                  ticket={ticket}
                  onOpenQr={() => openQr(ticket)}
                  onRedeem={() => handleRedeem(ticket)}
                  redeeming={redeemingId === ticket.id}
                />
              ))}
            </tbody>
          </table>

          {response && response.meta.last_page > 1 && (
            <div className="flex items-center justify-between border-t border-white/60 px-4 py-3 text-xs text-slate-500">
              <span>
                Página {response.meta.page} de {response.meta.last_page} — {response.meta.total} ingressos
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

      <Modal
        open={qrModal !== null}
        onClose={() => setQrModal(null)}
        title={qrModal ? `Ingresso — ${qrModal.ticket.event.name}` : ''}
      >
        {qrModal && (
          <div className="space-y-4">
            <div className="text-sm">
              <p className="text-slate-500">Cliente</p>
              <p className="font-medium text-slate-900">{qrModal.ticket.customer.name}</p>
              <p className="text-xs text-slate-500">{qrModal.ticket.customer.email}</p>
            </div>
            <div className="text-sm">
              <p className="text-slate-500">Ingresso</p>
              <p className="font-medium text-slate-900">{qrModal.ticket.lot.name}</p>
            </div>

            <div className="flex items-center justify-center rounded-xl bg-white p-4 shadow-inner">
              {qrModal.qr ? (
                <img src={qrModal.qr.qr_code} alt="QR Code" className="h-64 w-64 object-contain" />
              ) : (
                <div className="flex h-64 w-64 items-center justify-center text-sm text-slate-400">
                  Gerando QR...
                </div>
              )}
            </div>

            <p className="break-all text-center font-mono text-[10px] text-slate-500">{qrModal.ticket.code}</p>

            {qrModal.ticket.used_at ? (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-center text-xs text-emerald-700">
                Validado em {formatDateTime(qrModal.ticket.used_at)}
              </p>
            ) : (
              <p className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-center text-xs text-amber-700">
                Ingresso pendente de validação
              </p>
            )}
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}

function TicketRow({
  ticket,
  onOpenQr,
  onRedeem,
  redeeming,
}: {
  ticket: ProducerTicket;
  onOpenQr: () => void;
  onRedeem: () => void;
  redeeming: boolean;
}) {
  const isUsed = ticket.used_at !== null;
  return (
    <tr className="transition hover:bg-white/50">
      <td className="px-4 py-3">
        {isUsed ? (
          <span className="chip bg-emerald-100 text-emerald-700">✓ Validado</span>
        ) : (
          <span className="chip bg-amber-100 text-amber-700">● Pendente</span>
        )}
      </td>
      <td className="px-4 py-3">
        <p className="font-medium text-slate-900">{ticket.customer.name}</p>
        <p className="text-xs text-slate-500">{ticket.customer.email}</p>
      </td>
      <td className="px-4 py-3">
        <p className="text-slate-900">{ticket.event.name}</p>
        <p className="text-xs text-slate-500">{formatDateTime(ticket.event.starts_at)}</p>
      </td>
      <td className="px-4 py-3 text-slate-600">{ticket.lot.name}</td>
      <td className="px-4 py-3 text-xs text-slate-500">{formatDateTime(ticket.created_at)}</td>
      <td className="px-4 py-3 text-xs text-slate-500">{formatDateTime(ticket.used_at)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          {!isUsed && (
            <button
              onClick={onRedeem}
              disabled={redeeming}
              aria-label="Resgatar agora"
              title="Resgatar agora"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm transition hover:bg-gradient-to-br hover:from-emerald-500 hover:to-teal-600 hover:text-white hover:shadow-md disabled:opacity-60"
            >
              {redeeming ? (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Icons.checkCircle className="h-5 w-5" />
              )}
            </button>
          )}
          <button
            onClick={onOpenQr}
            aria-label="Ver QR Code"
            title="Ver QR Code"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/60 bg-white/70 text-slate-600 shadow-sm transition hover:bg-gradient-to-br hover:from-brand-600 hover:to-accent-600 hover:text-white hover:shadow-md"
          >
            <Icons.qrCode className="h-5 w-5" />
          </button>
        </div>
      </td>
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

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
        active ? 'bg-gradient-to-r from-brand-600 to-accent-600 text-white shadow' : 'text-slate-600 hover:bg-white/80'
      }`}
    >
      {label}
    </button>
  );
}

function StatCard({
  label,
  value,
  icon,
  gradient,
}: {
  label: string;
  value: number;
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
