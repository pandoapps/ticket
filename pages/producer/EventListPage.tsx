import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  published: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-700',
};

export function EventListPage() {
  const { t } = useTranslation();
  const [events, setEvents] = useState<EventModel[]>([]);
  const toast = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();

  const STATUS_LABEL: Record<string, string> = {
    draft: t('admin.draft'),
    published: t('admin.published'),
    cancelled: t('admin.cancelled'),
  };

  const load = useCallback(async () => {
    try {
      const res = await producerEventService.list();
      setEvents(res.data);
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  async function handlePublish(event: EventModel) {
    try {
      await producerEventService.publish(event.id);
      toast.success(t('producer.eventPublished'));
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  async function handleUnpublish(event: EventModel) {
    try {
      await producerEventService.unpublish(event.id);
      toast.info(t('producer.eventUnpublished'));
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  async function handleDelete(event: EventModel) {
    const ok = await confirm({
      title: t('producer.deleteEventTitle', { name: event.name }),
      description: t('producer.deleteEventDesc'),
      confirmText: t('common.delete'),
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await producerEventService.destroy(event.id);
      toast.success(t('producer.eventDeleted'));
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  return (
    <AppLayout title={t('producer.panel')} nav={producerNav}>
      <PageHeader
        title={t('producer.eventsPage')}
        description={t('producer.eventsDesc')}
        action={
          <button onClick={() => navigate('/produtor/eventos/novo')} className="btn btn-primary">
            {t('producer.newEvent')}
          </button>
        }
      />

      {events.length === 0 ? (
        <Empty title={t('producer.noEvents')} description={t('producer.noEventsDesc')} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/50 bg-white/60 shadow-glass backdrop-blur-xl">
          <table className="min-w-full divide-y divide-white/60 text-sm">
            <thead className="bg-white/40">
              <tr>
                <Th>{t('producer.event')}</Th>
                <Th>{t('producer.start')}</Th>
                <Th>{t('producer.status')}</Th>
                <Th>{t('producer.ticketsCol')}</Th>
                <Th className="text-right">{t('producer.actions')}</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/60">
              {events.map((event) => (
                <tr key={event.id} className="transition hover:bg-white/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link to={`/produtor/eventos/${event.id}`} className="font-medium text-slate-900 hover:text-brand-700">{event.name}</Link>
                      {event.is_featured && <span className="chip bg-gradient-to-r from-brand-600 to-accent-600 text-white">{t('producer.featuredChip')}</span>}
                    </div>
                    <p className="text-xs text-slate-500">{event.venue_name ?? t('browse.online')}</p>
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
                        <button onClick={() => handleUnpublish(event)} className="text-sm text-slate-600 hover:text-rose-600">{t('producer.unpublish')}</button>
                      ) : (
                        <button onClick={() => handlePublish(event)} className="text-sm text-brand-600 hover:text-brand-700">{t('producer.publish')}</button>
                      )}
                      <ActionIconButton onClick={() => navigate(`/produtor/eventos/${event.id}/editar`)} tone="brand" label={t('common.edit')} icon={<Icons.pencil className="h-4 w-4" />} />
                      <ActionIconButton onClick={() => handleDelete(event)} tone="danger" label={t('common.delete')} icon={<Icons.trash className="h-4 w-4" />} />
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
  return <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 ${className}`}>{children}</th>;
}
