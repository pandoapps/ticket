import { useEffect, useState } from 'react';
import { AppLayout } from '@components/AppLayout';
import { PageHeader } from '@components/PageHeader';
import { Empty } from '@components/Empty';
import { Modal } from '@components/Modal';
import { useToast } from '@components/Toast';
import { customerNav } from './nav';
import { ticketService, type TicketListItem } from '@services/ticketService';
import { formatDateTime } from '@utils/format';
import type { ApiError } from '@services/api';

export function TicketsPage() {
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [focused, setFocused] = useState<TicketListItem | null>(null);
  const toast = useToast();

  useEffect(() => {
    ticketService
      .list()
      .then((r) => setTickets(r.data))
      .catch((err: ApiError) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [toast]);

  return (
    <AppLayout title="Ticketeira" nav={customerNav}>
      <PageHeader
        title="Meus ingressos"
        description="Clique no QR Code para ampliar e apresentar na entrada do evento."
      />

      {loading ? (
        <p className="text-slate-500">Carregando...</p>
      ) : tickets.length === 0 ? (
        <Empty title="Você ainda não possui ingressos." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} onFocus={() => setFocused(ticket)} />
          ))}
        </div>
      )}

      <Modal open={focused !== null} onClose={() => setFocused(null)} title={focused?.event.name}>
        {focused && <FocusedTicket ticket={focused} />}
      </Modal>
    </AppLayout>
  );
}

function TicketCard({ ticket, onFocus }: { ticket: TicketListItem; onFocus: () => void }) {
  const used = ticket.used_at !== null;

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
        used ? 'border-slate-200 opacity-75' : 'border-slate-200 hover:shadow-md'
      }`}
    >
      {ticket.event.banner_url && (
        <img src={ticket.event.banner_url} className="h-32 w-full object-cover" alt="" />
      )}

      <div className="flex flex-col gap-3 p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-brand-600">
            {formatDateTime(ticket.event.starts_at)}
          </p>
          <h3 className="mt-1 font-semibold text-slate-900">{ticket.event.name}</h3>
          <p className="mt-0.5 text-sm text-slate-500">
            {ticket.lot.name} — {ticket.event.venue_name ?? 'Online'}
          </p>
        </div>

        <button
          type="button"
          onClick={onFocus}
          aria-label={`Ampliar QR Code do ingresso ${ticket.code}`}
          className="group relative flex items-center justify-center rounded-xl bg-slate-50 p-3 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
        >
          <img
            src={ticket.qr_code}
            alt={`QR Code do ingresso ${ticket.code}`}
            className="h-48 w-48"
          />
          {used && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70">
              <span className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow">
                Utilizado
              </span>
            </div>
          )}
          <span className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-slate-900/70 px-2 py-0.5 text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100">
            Ampliar
          </span>
        </button>

        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-slate-600">{ticket.code}</span>
          {used ? (
            <span className="text-rose-600">Usado em {formatDateTime(ticket.used_at!)}</span>
          ) : (
            <span className="font-medium text-emerald-600">Válido</span>
          )}
        </div>
      </div>
    </article>
  );
}

function FocusedTicket({ ticket }: { ticket: TicketListItem }) {
  const used = ticket.used_at !== null;

  return (
    <div className="flex flex-col items-center gap-4">
      <div>
        <p className="text-center text-xs font-medium uppercase tracking-wider text-brand-600">
          {formatDateTime(ticket.event.starts_at)}
        </p>
        <p className="mt-1 text-center text-sm text-slate-500">
          {ticket.lot.name}
          {ticket.event.venue_name ? ` — ${ticket.event.venue_name}` : ''}
        </p>
      </div>

      <div className="relative flex items-center justify-center rounded-2xl bg-slate-50 p-4">
        <img
          src={ticket.qr_code}
          alt={`QR Code do ingresso ${ticket.code}`}
          className="h-72 w-72 sm:h-80 sm:w-80"
        />
        {used && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80">
            <span className="rounded-full bg-rose-600 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-white shadow">
              Utilizado
            </span>
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="font-mono text-sm text-slate-700">{ticket.code}</p>
        {used ? (
          <p className="mt-1 text-xs text-rose-600">
            Ingresso utilizado em {formatDateTime(ticket.used_at!)}
          </p>
        ) : (
          <p className="mt-1 text-xs font-medium text-emerald-600">
            Apresente este QR Code na entrada
          </p>
        )}
      </div>
    </div>
  );
}
