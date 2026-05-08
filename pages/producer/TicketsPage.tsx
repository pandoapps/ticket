import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  type IssuedTicket,
} from '@services/producerTicketService';
import { producerEventService, type EventModel, type TicketLot } from '@services/eventService';
import { ticketRedemptionService } from '@services/ticketRedemptionService';
import { formatBRL, formatDate, formatDateTime } from '@utils/format';
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
  const [issueModal, setIssueModal] = useState(false);
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

  function handleIssued(_ticket: IssuedTicket) {
    setPage(1);
    producerTicketService
      .list({ status: status === 'all' ? undefined : status, event_id: eventId ? Number(eventId) : undefined, q: q || undefined, page: 1 })
      .then(setResponse)
      .catch((err: ApiError) => toast.error(err.message));
  }

  const tickets = response?.data ?? [];
  const stats = response?.meta.stats;

  return (
    <AppLayout title="Produtor" nav={producerNav}>
      <PageHeader
        title="Ingressos emitidos"
        description="Todos os ingressos gerados por pedidos pagos, com status de validação."
        action={
          <button onClick={() => setIssueModal(true)} className="btn btn-primary flex items-center gap-2">
            <Icons.plus className="h-4 w-4" />
            Emitir ingresso
          </button>
        }
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

      {tickets.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <span className="font-semibold uppercase tracking-[0.15em] text-slate-500">Legenda:</span>
          <span className="inline-flex items-center gap-2">
            <span className="chip bg-emerald-100 text-emerald-700">✓ Válido</span>
            <span className="text-slate-500">ingresso ainda não utilizado</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="chip bg-sky-100 text-sky-700">● Usado</span>
            <span className="text-slate-500">ingresso já validado na entrada</span>
          </span>
        </div>
      )}

      <IssueTicketModal
        open={issueModal}
        onClose={() => setIssueModal(false)}
        events={events}
        onIssued={handleIssued}
      />

      {qrModal && (
        <TicketBadgeModal
          ticket={qrModal.ticket}
          qr={qrModal.qr}
          onClose={() => setQrModal(null)}
        />
      )}
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
          <span className="chip bg-sky-100 text-sky-700">● Usado</span>
        ) : (
          <span className="chip bg-emerald-100 text-emerald-700">✓ Válido</span>
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

function TicketBadgeModal({
  ticket,
  qr,
  onClose,
}: {
  ticket: ProducerTicket;
  qr: TicketQrData | null;
  onClose: () => void;
}) {
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCloseRef.current(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, []);

  const isUsed = ticket.used_at !== null;

  return createPortal(
    <div
      className="print-badge-portal fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="presentation"
    >
      <div
        className="flex min-h-full flex-col items-center justify-center gap-4 p-4"
        onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Crachá */}
        <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl">
          {/* Header gradiente */}
          <div className="relative bg-gradient-to-br from-brand-600 to-accent-600 px-6 pb-8 pt-6 text-white">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
            <div className="absolute -left-4 bottom-0 h-20 w-20 rounded-full bg-white/10" />
            <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              Ingresso
            </p>
            <h2 className="relative mt-1 text-xl font-bold leading-tight">
              {ticket.event.name}
            </h2>
            <div className="relative mt-3 flex flex-wrap gap-3 text-xs text-white/80">
              <span className="flex items-center gap-1">
                <Icons.calendar className="h-3.5 w-3.5" />
                {formatDate(ticket.event.starts_at)}
              </span>
              {ticket.event.venue_name && (
                <span className="flex items-center gap-1">
                  <Icons.mapPin className="h-3.5 w-3.5" />
                  {ticket.event.venue_name}
                </span>
              )}
            </div>
          </div>

          {/* Separador picotado */}
          <div className="relative flex items-center">
            <div className="absolute -left-3 h-6 w-6 rounded-full bg-slate-900/70" />
            <div className="absolute -right-3 h-6 w-6 rounded-full bg-slate-900/70" />
            <div className="mx-3 flex-1 border-t-2 border-dashed border-slate-200" />
          </div>

          {/* Corpo do crachá */}
          <div className="px-6 pb-6 pt-5">
            {/* QR Code */}
            <div className="mb-4 flex justify-center">
              <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                {qr ? (
                  <img src={qr.qr_code} alt="QR Code" className="h-52 w-52 object-contain" />
                ) : (
                  <div className="flex h-52 w-52 items-center justify-center text-sm text-slate-400">
                    <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
                  </div>
                )}
              </div>
            </div>

            {/* Participante */}
            <div className="mb-4 text-center">
              <p className="text-lg font-bold text-slate-900">{ticket.customer.name}</p>
              <p className="text-sm text-slate-500">{ticket.customer.email}</p>
            </div>

            {/* Lote */}
            <div className="mb-4 flex justify-center">
              <span className="rounded-full bg-brand-50 px-4 py-1 text-sm font-semibold text-brand-700 ring-1 ring-brand-200">
                {ticket.lot.name}
              </span>
            </div>

            {/* Código */}
            <p className="mb-4 break-all text-center font-mono text-[11px] text-slate-400">
              {ticket.code}
            </p>

            {/* Status */}
            {isUsed ? (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-medium text-sky-700">
                <Icons.checkCircle className="h-4 w-4" />
                Validado em {formatDateTime(ticket.used_at)}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                <Icons.sparkles className="h-4 w-4" />
                Ingresso válido — aguardando validação
              </div>
            )}
          </div>
        </div>

        {/* Botões — ocultados na impressão */}
        <div className="flex gap-3 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-lg transition hover:bg-slate-50"
          >
            <Icons.printer className="h-4 w-4" />
            Imprimir
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/30"
          >
            <Icons.x className="h-4 w-4" />
            Fechar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

type CustomerState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'found'; id: number; name: string }
  | { status: 'not_found' };

function IssueTicketModal({
  open,
  onClose,
  events,
  onIssued,
}: {
  open: boolean;
  onClose: () => void;
  events: EventModel[];
  onIssued: (ticket: IssuedTicket) => void;
}) {
  const [eventId, setEventId] = useState('');
  const [lots, setLots] = useState<TicketLot[]>([]);
  const [lotId, setLotId] = useState('');
  const [email, setEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customer, setCustomer] = useState<CustomerState>({ status: 'idle' });
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!eventId) { setLots([]); setLotId(''); return; }
    producerEventService
      .listLots(Number(eventId))
      .then((res) => setLots(res.data))
      .catch((err: ApiError) => toast.error(err.message));
  }, [eventId, toast]);

  useEffect(() => {
    const trimmed = email.trim();
    if (!trimmed) {
      setCustomer({ status: 'idle' });
      setCustomerName('');
      return;
    }
    setCustomer({ status: 'loading' });
    const timer = setTimeout(async () => {
      try {
        const res = await producerTicketService.lookupCustomer(trimmed);
        if (res.found && res.data) {
          setCustomer({ status: 'found', id: res.data.id, name: res.data.name });
          setCustomerName(res.data.name);
        } else {
          setCustomer({ status: 'not_found' });
          setCustomerName('');
        }
      } catch {
        setCustomer({ status: 'idle' });
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [email]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lotId || !email.trim()) return;
    setSubmitting(true);
    try {
      const res = await producerTicketService.issue({
        ticket_lot_id: Number(lotId),
        customer_email: email.trim(),
        customer_name: customerName.trim() || undefined,
      });
      toast.success(`Ingresso emitido para ${res.data.customer.name}!`);
      onIssued(res.data);
      handleClose();
    } catch (err) {
      toast.error((err as ApiError).message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setEventId('');
    setLots([]);
    setLotId('');
    setEmail('');
    setCustomerName('');
    setCustomer({ status: 'idle' });
    onClose();
  }

  const canSubmit =
    !!lotId &&
    !!email.trim() &&
    !!customerName.trim() &&
    customer.status !== 'loading';

  return (
    <Modal open={open} onClose={handleClose} title="Emitir ingresso manualmente">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Evento</label>
          <select
            value={eventId}
            onChange={(e) => { setEventId(e.target.value); setLotId(''); }}
            className="input w-full"
            required
          >
            <option value="">Selecione um evento</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Lote / Ingresso</label>
          <select
            value={lotId}
            onChange={(e) => setLotId(e.target.value)}
            className="input w-full"
            required
            disabled={!eventId || lots.length === 0}
          >
            <option value="">Selecione um lote</option>
            {lots.map((lot) => (
              <option key={lot.id} value={lot.id}>
                {lot.name} — {lot.price === 0 ? 'Gratuito' : formatBRL(lot.price)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">E-mail do participante</label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="participante@email.com"
              className="input w-full pr-8"
              required
            />
            {customer.status === 'loading' && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
              </span>
            )}
          </div>
          {customer.status === 'found' && (
            <p className="mt-1 text-xs text-emerald-600">✓ Cliente existente — o ingresso será emitido para este participante.</p>
          )}
          {customer.status === 'not_found' && (
            <p className="mt-1 text-xs text-blue-600">● Novo participante — preencha o nome abaixo.</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Nome do participante</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Nome completo"
            className={`input w-full ${customer.status === 'found' ? 'bg-slate-50 text-slate-600' : ''}`}
            disabled={customer.status === 'found' || customer.status === 'loading'}
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={handleClose} className="btn btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={submitting || !canSubmit} className="btn btn-primary">
            {submitting ? 'Emitindo...' : 'Emitir ingresso'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
