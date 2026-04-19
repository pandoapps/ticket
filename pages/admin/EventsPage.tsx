import { useEffect, useState, type FormEvent } from 'react';
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
  const [events, setEvents] = useState<EventModel[]>([]);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<EventModel | null>(null);
  const toast = useToast();
  const confirm = useConfirm();

  async function load() {
    try {
      const res = await adminService.listEvents({ status: status || undefined, q: q || undefined });
      setEvents(res.data);
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
      title: `Excluir ${event.name}?`,
      description: 'Esta ação remove o evento e os ingressos vinculados. Vendas já realizadas não serão desfeitas.',
      confirmText: 'Excluir',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await adminService.deleteEvent(event.id);
      toast.success('Evento excluído.');
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  return (
    <AppLayout title="Admin" nav={adminNav}>
      <PageHeader
        title="Eventos globais"
        action={
          <div className="flex gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar..."
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
              <option value="">Todos</option>
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        }
      />

      {events.length === 0 ? (
        <Empty title="Nenhum evento encontrado." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <Th>Evento</Th>
                <Th>Produtor</Th>
                <Th>Início</Th>
                <Th>Status</Th>
                <Th>Ingressos</Th>
                <Th className="text-right">Ações</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {events.map((event) => (
                <tr key={event.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{event.name}</td>
                  <td className="px-4 py-3 text-slate-600">{event.producer?.company_name ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{formatDateTime(event.starts_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[event.status]}`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{event.lots?.length ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <ActionIconButton
                        onClick={() => setEditing(event)}
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

      <EditEventModal
        event={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          load();
        }}
      />
    </AppLayout>
  );
}

interface EditEventModalProps {
  event: EventModel | null;
  onClose: () => void;
  onSaved: () => void;
}

function EditEventModal({ event, onClose, onSaved }: EditEventModalProps) {
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
  const [isFeatured, setIsFeatured] = useState(false);
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
    setIsFeatured(event.is_featured);
    setErrors({});
  }, [event]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!event) return;
    setErrors({});
    setLoading(true);
    try {
      await adminService.updateEvent(event.id, {
        name,
        description: description || null,
        starts_at: fromLocalInput(startsAt) ?? event.starts_at,
        ends_at: fromLocalInput(endsAt),
        status: eventStatus,
        venue_type: venueType,
        venue_name: venueName || null,
        venue_address: venueAddress || null,
        online_url: onlineUrl || null,
        banner_url: bannerUrl || null,
        is_featured: isFeatured,
      });
      toast.success('Evento atualizado.');
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
    <Modal open={event !== null} onClose={onClose} title="Editar evento">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Nome</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={`input ${fieldError('name') ? 'border-rose-400' : ''}`}
          />
          {fieldError('name') && <p className="mt-1 text-xs text-rose-600">{fieldError('name')}</p>}
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Descrição</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`input ${fieldError('description') ? 'border-rose-400' : ''}`}
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Início</span>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              required
              className={`input ${fieldError('starts_at') ? 'border-rose-400' : ''}`}
            />
            {fieldError('starts_at') && <p className="mt-1 text-xs text-rose-600">{fieldError('starts_at')}</p>}
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Término</span>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className={`input ${fieldError('ends_at') ? 'border-rose-400' : ''}`}
            />
            {fieldError('ends_at') && <p className="mt-1 text-xs text-rose-600">{fieldError('ends_at')}</p>}
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Status</span>
            <select
              value={eventStatus}
              onChange={(e) => setEventStatus(e.target.value as EventStatus)}
              className="input"
            >
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Tipo de local</span>
            <select
              value={venueType}
              onChange={(e) => setVenueType(e.target.value as VenueType)}
              className="input"
            >
              <option value="physical">Presencial</option>
              <option value="online">Online</option>
            </select>
          </label>
        </div>

        {venueType === 'physical' ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Nome do local</span>
              <input
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                className={`input ${fieldError('venue_name') ? 'border-rose-400' : ''}`}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Endereço</span>
              <input
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                className={`input ${fieldError('venue_address') ? 'border-rose-400' : ''}`}
              />
            </label>
          </div>
        ) : (
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">URL do evento online</span>
            <input
              type="url"
              value={onlineUrl}
              onChange={(e) => setOnlineUrl(e.target.value)}
              placeholder="https://..."
              className={`input ${fieldError('online_url') ? 'border-rose-400' : ''}`}
            />
            {fieldError('online_url') && <p className="mt-1 text-xs text-rose-600">{fieldError('online_url')}</p>}
          </label>
        )}

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">URL do banner</span>
          <input
            type="url"
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            placeholder="https://..."
            className={`input ${fieldError('banner_url') ? 'border-rose-400' : ''}`}
          />
          {fieldError('banner_url') && <p className="mt-1 text-xs text-rose-600">{fieldError('banner_url')}</p>}
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          Evento em destaque
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Th({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 ${className}`}>
      {children}
    </th>
  );
}
