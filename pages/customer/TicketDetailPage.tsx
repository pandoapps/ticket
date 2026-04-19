import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '@components/AppLayout';
import { useToast } from '@components/Toast';
import { customerNav } from './nav';
import { ticketService, type TicketDetail } from '@services/ticketService';
import { formatDateTime } from '@utils/format';
import type { ApiError } from '@services/api';

export function TicketDetailPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (!id) return;
    ticketService
      .show(Number(id))
      .then((r) => setTicket(r.data))
      .catch((err: ApiError) => toast.error(err.message));
  }, [id, toast]);

  if (!ticket) {
    return (
      <AppLayout title="Ticketeira" nav={customerNav}>
        <p className="text-slate-500">Carregando...</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Ticketeira" nav={customerNav}>
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wider text-brand-600">
          {formatDateTime(ticket.event.starts_at)}
        </p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900">{ticket.event.name}</h2>
        <p className="text-sm text-slate-500">{ticket.lot.name}</p>

        <div className="my-6 flex items-center justify-center rounded-xl bg-slate-50 p-4">
          <img src={ticket.qr_code} alt="QR Code" className="h-64 w-64" />
        </div>

        <p className="text-center font-mono text-xs text-slate-600">{ticket.code}</p>
        {ticket.used_at && (
          <p className="mt-2 text-center text-xs text-rose-600">Ingresso já utilizado em {formatDateTime(ticket.used_at)}</p>
        )}
      </div>
    </AppLayout>
  );
}
