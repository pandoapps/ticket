import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@components/AppLayout';
import { PageHeader } from '@components/PageHeader';
import { Empty } from '@components/Empty';
import { Modal } from '@components/Modal';
import { useToast } from '@components/Toast';
import { useConfirm } from '@components/ConfirmDialog';
import { ActionIconButton } from '@components/ActionIconButton';
import { Icons } from '@components/Icon';
import { adminNav } from './nav';
import { adminService } from '@services/adminService';
import type { EventModel, EventStatus, VenueType } from '@services/eventService';
import { formatDateTime } from '@utils/format';
import type { ApiError } from '@services/api';

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  published: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-700',
};

function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function fromLocalInput(value: string): string | null {
  if (!value) return null;
  return new Date(value).toISOString();
}

export function EventsPage() {
  const { t } = useTranslation();
  const [events, setEvents] = useState<EventModel[]>([]);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<EventModel | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const toast = useToast();
  const confirm = useConfirm();

  const allSelected = events.length > 0 && events.every((e) => selectedIds.has(e.id));
  const someSelected = selectedIds.size > 0;

  function toggleAll() {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(events.map((e) => e.id)));
  }

  function toggleOne(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function load() {
    try {
      const res = await adminService.listEvents({ status: status || undefined, q: q || undefined });
      setEvents(res.data);
      setSelectedIds(new Set());
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  useEffect(() => {
    const id = setTimeout(load, 200);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, q]);

  async function handleDelete(event: EventModel) {
    const ok = await confirm({
      title: t('admin.deleteEventTitle', { name: event.name }),
      description: t('admin.deleteEventDesc'),
      confirmText: t('common.delete'),
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await adminService.deleteEvent(event.id);
      toast.success(t('admin.eventDeleted'));
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  async function handleBulkDelete() {
    const count = selectedIds.size;
    const ok = await confirm({
      title: t('admin.deleteSelectedEventsTitle', { count }),
      description: t('admin.deleteSelectedEventsDesc'),
      confirmText: t('common.delete'),
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await Promise.all([...selectedIds].map((id) => adminService.deleteEvent(id)));
      toast.success(t('admin.eventsDeleted', { count }));
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  return (
    <AppLayout title={t('admin.panel')} nav={adminNav}>
      <PageHeader
        title={t('admin.globalEvents')}
        action={
          <div className="flex gap-2">
            {someSelected && (
              <button onClick={handleBulkDelete} className="btn btn-danger text-sm">
                {t('admin.deleteSelected', { count: selectedIds.size })}
              </button>
            )}
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('admin.search')} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
              <option value="">{t('admin.allStatuses')}</option>
              <option value="draft">{t('admin.draft')}</option>
              <option value="published">{t('admin.published')}</option>
              <option value="cancelled">{t('admin.cancelled')}</option>
            </select>
          </div>
        }
      />

      {events.length === 0 ? (
        <Empty title={t('admin.noEvents')} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                </th>
                <Th>{t('admin.eventCol')}</Th>
                <Th>{t('admin.producerCol')}</Th>
                <Th>{t('admin.startCol')}</Th>
                <Th>{t('admin.status')}</Th>
                <Th>{t('admin.ticketsCol')}</Th>
                <Th className="text-right">{t('admin.actions')}</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {events.map((event) => {
                const isSelected = selectedIds.has(event.id);
                return (
                  <tr key={event.id} className={isSelected ? 'bg-brand-50' : ''}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={isSelected} onChange={() => toggleOne(event.id)} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <Link to={`/admin/eventos/${event.id}`} className="hover:text-brand-600 hover:underline">
                        {event.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{event.producer?.company_name ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDateTime(event.starts_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[event.status]}`}>{event.status}</span>
                    </td>
                    <td className="px-4 py-3">{event.lots?.length ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <ActionIconButton onClick={() => setEditing(event)} tone="brand" label={t('common.edit')} icon={<Icons.pencil className="h-4 w-4" />} />
                        <ActionIconButton onClick={() => handleDelete(event)} tone="danger" label={t('common.delete')} icon={<Icons.trash className="h-4 w-4" />} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <EditEventModal event={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />
    </AppLayout>
  );
}

function EditEventModal({ event, onClose, onSaved }: { event: EventModel | null; onClose: () => void; onSaved: () => void }) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [eventStatus, setEventStatus] = useState<EventStatus>('draft');
  const [venueType, setVenueType] = useState<VenueType>('physical');
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [onlineUrl, setOnlineUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [headerUrl, setHeaderUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [acceptsPix, setAcceptsPix] = useState(true);
  const [acceptsCard, setAcceptsCard] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const toast = useToast();

  useEffect(() => {
    if (!event) return;
    setName(event.name);
    setDescription(event.description ?? '');
    setStartsAt(toLocalInput(event.starts_at));
    setEndsAt(toLocalInput(event.ends_at));
    setEventStatus(event.status);
    setVenueType(event.venue_type);
    setVenueName(event.venue_name ?? '');
    setVenueAddress(event.venue_address ?? '');
    setOnlineUrl(event.online_url ?? '');
    setBannerUrl(event.banner_url ?? '');
    setHeaderUrl(event.header_url ?? '');
    setIsFeatured(event.is_featured);
    setIsActive(event.is_active);
    setAcceptsPix(event.accepts_pix);
    setAcceptsCard(event.accepts_card);
    setErrors({});
  }, [event]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!event) return;
    setErrors({});
    setLoading(true);
    try {
      await adminService.updateEvent(event.id, { name, description: description || null, starts_at: fromLocalInput(startsAt) ?? event.starts_at, ends_at: fromLocalInput(endsAt), status: eventStatus, venue_type: venueType, venue_name: venueName || null, venue_address: venueAddress || null, online_url: onlineUrl || null, banner_url: bannerUrl || null, header_url: headerUrl || null, is_featured: isFeatured, is_active: isActive, accepts_pix: acceptsPix, accepts_card: acceptsCard });
      toast.success(t('admin.eventUpdated'));
      onSaved();
    } catch (err) {
      const apiErr = err as ApiError;
      setErrors(apiErr.errors ?? {});
      const first = Object.values(apiErr.errors ?? {}).flat()[0];
      toast.error(first ?? apiErr.message);
    } finally {
      setLoading(false);
    }
  }

  const fieldError = (key: string) => errors[key]?.[0];

  return (
    <Modal open={event !== null} onClose={onClose} title={t('admin.editEvent')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.name')}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required className={`input ${fieldError('name') ? 'border-rose-400' : ''}`} />
          {fieldError('name') && <p className="mt-1 text-xs text-rose-600">{fieldError('name')}</p>}
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.description')}</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={`input ${fieldError('description') ? 'border-rose-400' : ''}`} />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.start')}</span>
            <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required className={`input ${fieldError('starts_at') ? 'border-rose-400' : ''}`} />
            {fieldError('starts_at') && <p className="mt-1 text-xs text-rose-600">{fieldError('starts_at')}</p>}
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.end')}</span>
            <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className={`input ${fieldError('ends_at') ? 'border-rose-400' : ''}`} />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.status')}</span>
            <select value={eventStatus} onChange={(e) => setEventStatus(e.target.value as EventStatus)} className="input">
              <option value="draft">{t('admin.draft')}</option>
              <option value="published">{t('admin.published')}</option>
              <option value="cancelled">{t('admin.cancelled')}</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.venueType')}</span>
            <select value={venueType} onChange={(e) => setVenueType(e.target.value as VenueType)} className="input">
              <option value="physical">{t('admin.physical')}</option>
              <option value="online">{t('admin.online')}</option>
            </select>
          </label>
        </div>
        {venueType === 'physical' ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.venueName')}</span>
              <input value={venueName} onChange={(e) => setVenueName(e.target.value)} className={`input ${fieldError('venue_name') ? 'border-rose-400' : ''}`} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.address')}</span>
              <input value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)} className={`input ${fieldError('venue_address') ? 'border-rose-400' : ''}`} />
            </label>
          </div>
        ) : (
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.onlineUrl')}</span>
            <input type="url" value={onlineUrl} onChange={(e) => setOnlineUrl(e.target.value)} placeholder="https://..." className={`input ${fieldError('online_url') ? 'border-rose-400' : ''}`} />
            {fieldError('online_url') && <p className="mt-1 text-xs text-rose-600">{fieldError('online_url')}</p>}
          </label>
        )}
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.bannerUrl')}</span>
          <input type="url" value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} placeholder="https://..." className={`input ${fieldError('banner_url') ? 'border-rose-400' : ''}`} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.headerUrl')}</span>
          <input type="url" value={headerUrl} onChange={(e) => setHeaderUrl(e.target.value)} placeholder="https://..." className={`input ${fieldError('header_url') ? 'border-rose-400' : ''}`} />
        </label>
        <fieldset className="space-y-2 rounded-lg border border-slate-200 p-3">
          <legend className="px-2 text-sm font-semibold text-slate-700">{t('admin.acceptedPayments')}</legend>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={acceptsPix} onChange={(e) => setAcceptsPix(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
            PIX
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={acceptsCard} onChange={(e) => setAcceptsCard(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
            {t('admin.card')}
          </label>
        </fieldset>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
          {t('admin.featuredEvent')}
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
          {t('admin.activeEvent')}
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn btn-secondary">{t('common.cancel')}</button>
          <button type="submit" disabled={loading} className="btn btn-primary">{loading ? t('common.saving') : t('common.save')}</button>
        </div>
      </form>
    </Modal>
  );
}

function Th({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 ${className}`}>{children}</th>;
}
