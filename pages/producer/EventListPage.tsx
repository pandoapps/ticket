import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '@components/AppLayout';
import { PageHeader } from '@components/PageHeader';
import { Empty } from '@components/Empty';
import { useToast } from '@components/Toast';
import { useConfirm } from '@components/ConfirmDialog';
import { ActionIconButton } from '@components/ActionIconButton';
import { Icons } from '@components/Icon';
import { producerNav } from './nav';
import { producerEventService, type EventModel } from '@services/eventService';
import { formatDateTime } from '@utils/format';
import type { ApiError } from '@services/api';

const STATUS_LABEL: Record<string, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  cancelled: 'Cancelado',
};

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  published: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-700',
};

export function EventListPage() {
  const [events, setEvents] = useState<EventModel[]>([]);
  const toast = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();

  async function load() {
    try {
      const res = await producerEventService.list();
      setEvents(res.data);
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handlePublish(event: EventModel) {
    try {
      await producerEventService.publish(event.id);
      toast.success('Evento publicado.');
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  async function handleUnpublish(event: EventModel) {
    try {
      await producerEventService.unpublish(event.id);
      toast.info('Evento despublicado.');
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  async function handleDelete(event: EventModel) {
    const ok = await confirm({
      title: `Excluir ${event.name}?`,
      description: 'Esta ação remove o evento e os ingressos vinculados. Vendas já realizadas não serão desfeitas.',
      confirmText: 'Excluir',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await producerEventService.destroy(event.id);
      toast.success('Evento excluído.');
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  return (
    <AppLayout title="Produtor" nav={producerNav}>
      <PageHeader
        title="Meus eventos"
        description="Crie, edite e publique seus eventos."
        action={
          <button onClick={() => navigate('/produtor/eventos/novo')} className="btn btn-primary">
            Novo evento
          </button>
        }
      />

      {events.length === 0 ? (
        <Empty title="Você ainda não criou eventos." description="Clique em 'Novo evento' para começar." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/50 bg-white/60 shadow-glass backdrop-blur-xl">
          <table className="min-w-full divide-y divide-white/60 text-sm">
            <thead className="bg-white/40">
              <tr>
                <Th>Evento</Th>
                <Th>Início</Th>
                <Th>Status</Th>
                <Th>Ingressos</Th>
                <Th className="text-right">Ações</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/60">
              {events.map((event) => (
                <tr key={event.id} className="transition hover:bg-white/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link to={`/produtor/eventos/${event.id}`} className="font-medium text-slate-900 hover:text-brand-700">
                        {event.name}
                      </Link>
                      {event.is_featured && (
                        <span className="chip bg-gradient-to-r from-brand-600 to-accent-600 text-white">⭐ Destaque</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{event.venue_name ?? 'Online'}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDateTime(event.starts_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[event.status]}`}>
                      {STATUS_LABEL[event.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{event.lots?.length ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {event.status === 'published' ? (
                        <button onClick={() => handleUnpublish(event)} className="text-sm text-slate-600 hover:text-rose-600">
                          Despublicar
                        </button>
                      ) : (
                        <button onClick={() => handlePublish(event)} className="text-sm text-brand-600 hover:text-brand-700">
                          Publicar
                        </button>
                      )}
                      <ActionIconButton
                        onClick={() => navigate(`/produtor/eventos/${event.id}/editar`)}
                        tone="brand"
                        label="Editar"
                        icon={<Icons.pencil className="h-4 w-4" />}
                      />
                      <ActionIconButton
                        onClick={() => handleDelete(event)}
                        tone="danger"
                        label="Excluir"
                        icon={<Icons.trash className="h-4 w-4" />}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}

function Th({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 ${className}`}>
      {children}
    </th>
  );
}
