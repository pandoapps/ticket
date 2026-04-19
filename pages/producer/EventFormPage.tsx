import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@components/AppLayout';
import { PageHeader } from '@components/PageHeader';
import { useToast } from '@components/Toast';
import { producerNav } from './nav';
import { producerEventService, type EventPayload, type VenueType } from '@services/eventService';
import type { ApiError } from '@services/api';

const EMPTY: EventPayload = {
  name: '',
  description: '',
  starts_at: '',
  ends_at: '',
  venue_type: 'physical',
  venue_name: '',
  venue_address: '',
  online_url: '',
  banner_url: '',
  is_featured: false,
};

export function EventFormPage() {
  const { id } = useParams();
  const editing = id !== undefined && id !== 'novo';
  const eventId = editing ? Number(id) : null;
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState<EventPayload>(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (eventId === null) return;
    producerEventService
      .show(eventId)
      .then((r) => {
        const e = r.data;
        setForm({
          name: e.name,
          description: e.description ?? '',
          starts_at: toLocalInput(e.starts_at),
          ends_at: toLocalInput(e.ends_at),
          venue_type: e.venue_type,
          venue_name: e.venue_name ?? '',
          venue_address: e.venue_address ?? '',
          online_url: e.online_url ?? '',
          banner_url: e.banner_url ?? '',
          is_featured: e.is_featured,
        });
      })
      .catch((err: ApiError) => toast.error(err.message));
  }, [eventId, toast]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const payload: EventPayload = {
      ...form,
      starts_at: new Date(form.starts_at).toISOString(),
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
    };
    try {
      if (eventId === null) {
        const res = await producerEventService.create(payload);
        toast.success('Evento criado.');
        navigate(`/produtor/eventos/${res.data.id}`, { replace: true });
      } else {
        await producerEventService.update(eventId, payload);
        toast.success('Evento atualizado.');
      }
    } catch (err) {
      toast.error((err as ApiError).message);
    } finally {
      setLoading(false);
    }
  }

  function setField<K extends keyof EventPayload>(key: K, value: EventPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <AppLayout title="Produtor" nav={producerNav}>
      <PageHeader title={editing ? 'Editar evento' : 'Novo evento'} />
      <form onSubmit={handleSubmit} className="max-w-3xl space-y-4 glass-card p-6 animate-fade-up">
        <Field label="Nome" required>
          <input
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            required
            className="input"
          />
        </Field>

        <Field label="Descrição">
          <textarea
            value={form.description ?? ''}
            onChange={(e) => setField('description', e.target.value)}
            rows={4}
            className="input"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Início" required>
            <input
              type="datetime-local"
              value={form.starts_at}
              onChange={(e) => setField('starts_at', e.target.value)}
              required
              className="input"
            />
          </Field>
          <Field label="Término">
            <input
              type="datetime-local"
              value={form.ends_at ?? ''}
              onChange={(e) => setField('ends_at', e.target.value)}
              className="input"
            />
          </Field>
        </div>

        <Field label="Tipo de local">
          <select
            value={form.venue_type}
            onChange={(e) => setField('venue_type', e.target.value as VenueType)}
            className="input"
          >
            <option value="physical">Presencial</option>
            <option value="online">Online</option>
          </select>
        </Field>

        {form.venue_type === 'physical' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome do local">
              <input
                value={form.venue_name ?? ''}
                onChange={(e) => setField('venue_name', e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Endereço">
              <input
                value={form.venue_address ?? ''}
                onChange={(e) => setField('venue_address', e.target.value)}
                className="input"
              />
            </Field>
          </div>
        ) : (
          <Field label="URL de acesso online">
            <input
              value={form.online_url ?? ''}
              onChange={(e) => setField('online_url', e.target.value)}
              className="input"
            />
          </Field>
        )}

        <Field label="URL do banner">
          <input
            value={form.banner_url ?? ''}
            onChange={(e) => setField('banner_url', e.target.value)}
            className="input"
          />
        </Field>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/60 bg-gradient-to-br from-amber-50 to-accent-50/60 p-4 transition hover:from-amber-100">
          <input
            type="checkbox"
            checked={form.is_featured ?? false}
            onChange={(e) => setField('is_featured', e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-brand-600"
          />
          <div>
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              Destacar este evento na home
              <span className="chip bg-gradient-to-r from-brand-600 to-accent-600 text-white">
                ⭐ Destaque
              </span>
            </span>
            <span className="mt-0.5 block text-xs text-slate-500">
              Eventos em destaque aparecem no banner principal da página inicial.
            </span>
          </div>
        </label>

        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </AppLayout>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
