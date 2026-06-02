import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@components/AppLayout';
import { PageHeader } from '@components/PageHeader';
import { useToast } from '@components/Toast';
import { producerNav } from './nav';
import { producerEventService, type EventPayload, type VenueType } from '@services/eventService';
import { platformService } from '@services/platformService';
import type { ApiError } from '@services/api';

const EMPTY: EventPayload = { name: '', short_description: '', description: '', starts_at: '', ends_at: '', venue_type: 'physical', venue_name: '', venue_address: '', online_url: '', banner_url: '', header_url: '', is_featured: false, is_active: true, accepts_pix: true, accepts_card: true };

export function EventFormPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const editing = id !== undefined && id !== 'novo';
  const eventId = editing ? Number(id) : null;
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState<EventPayload>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [isStripe, setIsStripe] = useState(false);

  useEffect(() => {
    platformService.getConfig()
      .then((r) => setIsStripe(r.data.active_gateway === 'stripe'))
      .catch(() => { /* mantém o padrão */ });
  }, []);

  useEffect(() => {
    if (eventId === null) return;
    producerEventService.show(eventId)
      .then((r) => {
        const e = r.data;
        setForm({ name: e.name, short_description: e.short_description ?? '', description: e.description ?? '', starts_at: toLocalInput(e.starts_at), ends_at: toLocalInput(e.ends_at), venue_type: e.venue_type, venue_name: e.venue_name ?? '', venue_address: e.venue_address ?? '', online_url: e.online_url ?? '', banner_url: e.banner_url ?? '', header_url: e.header_url ?? '', is_featured: e.is_featured, is_active: e.is_active, accepts_pix: e.accepts_pix, accepts_card: e.accepts_card });
      })
      .catch((err: ApiError) => toast.error(err.message));
  }, [eventId, toast]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const payload: EventPayload = { ...form, starts_at: new Date(form.starts_at).toISOString(), ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null };
    try {
      if (eventId === null) {
        const res = await producerEventService.create(payload);
        toast.success(t('producer.eventCreated'));
        navigate(`/produtor/eventos/${res.data.id}`, { replace: true });
      } else {
        await producerEventService.update(eventId, payload);
        toast.success(t('producer.eventUpdated'));
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
    <AppLayout title={t('producer.panel')} nav={producerNav}>
      <PageHeader title={editing ? t('producer.editEventTitle') : t('producer.newEventTitle')} />
      <form onSubmit={handleSubmit} className="max-w-3xl space-y-4 glass-card p-6 animate-fade-up">
        <Field label={t('producer.name')} required>
          <input value={form.name} onChange={(e) => setField('name', e.target.value)} required className="input" />
        </Field>

        <Field label={t('producer.shortDescription')}>
          <input value={form.short_description ?? ''} onChange={(e) => setField('short_description', e.target.value)} maxLength={100} className="input" />
          <span className="mt-1 block text-xs text-slate-500">{t('producer.shortDescriptionHint', { count: (form.short_description ?? '').length })}</span>
        </Field>

        <Field label={t('producer.description')}>
          <textarea value={form.description ?? ''} onChange={(e) => setField('description', e.target.value)} rows={4} className="input" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('producer.startField')} required>
            <input type="datetime-local" value={form.starts_at} onChange={(e) => setField('starts_at', e.target.value)} required className="input" />
          </Field>
          <Field label={t('producer.endField')}>
            <input type="datetime-local" value={form.ends_at ?? ''} onChange={(e) => setField('ends_at', e.target.value)} className="input" />
          </Field>
        </div>

        <Field label={t('producer.venueType')}>
          <select value={form.venue_type} onChange={(e) => setField('venue_type', e.target.value as VenueType)} className="input">
            <option value="physical">{t('producer.physical')}</option>
            <option value="online">{t('producer.online')}</option>
          </select>
        </Field>

        {form.venue_type === 'physical' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('producer.venueName')}><input value={form.venue_name ?? ''} onChange={(e) => setField('venue_name', e.target.value)} className="input" /></Field>
            <Field label={t('producer.address')}><input value={form.venue_address ?? ''} onChange={(e) => setField('venue_address', e.target.value)} className="input" /></Field>
          </div>
        ) : (
          <Field label={t('producer.onlineUrl')}><input value={form.online_url ?? ''} onChange={(e) => setField('online_url', e.target.value)} className="input" /></Field>
        )}

        <Field label={t('producer.bannerUrl')}>
          <input value={form.banner_url ?? ''} onChange={(e) => setField('banner_url', e.target.value)} className="input" />
          <span className="mt-1 block text-xs text-slate-500">{t('producer.bannerUrlHint')}</span>
        </Field>

        <Field label={t('producer.headerUrl')}>
          <input value={form.header_url ?? ''} onChange={(e) => setField('header_url', e.target.value)} className="input" />
          <span className="mt-1 block text-xs text-slate-500">{t('producer.headerUrlHint')}</span>
        </Field>

        <fieldset className="space-y-2 rounded-xl border border-slate-200 bg-white/60 p-4">
          <legend className="px-2 text-sm font-semibold text-slate-700">{t('producer.acceptedPayments')}</legend>
          <label className={`flex items-center gap-2 text-sm ${isStripe ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} text-slate-700`}>
            <input type="checkbox" checked={!isStripe && (form.accepts_pix ?? true)} onChange={(e) => setField('accepts_pix', e.target.checked)} disabled={isStripe} className="h-4 w-4 accent-brand-600" />
            PIX
          </label>
          {isStripe && <p className="text-xs text-amber-600">{t('producer.pixUnavailableStripe')}</p>}
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.accepts_card ?? true} onChange={(e) => setField('accepts_card', e.target.checked)} className="h-4 w-4 accent-brand-600" />
            {t('admin.card')}
          </label>
          {!isStripe && !(form.accepts_pix || form.accepts_card) && <p className="text-xs text-rose-600">{t('producer.selectAtLeastOne')}</p>}
          {isStripe && !form.accepts_card && <p className="text-xs text-rose-600">{t('producer.selectAtLeastOne')}</p>}
        </fieldset>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/60 bg-gradient-to-br from-amber-50 to-accent-50/60 p-4 transition hover:from-amber-100">
          <input type="checkbox" checked={form.is_featured ?? false} onChange={(e) => setField('is_featured', e.target.checked)} className="mt-0.5 h-4 w-4 accent-brand-600" />
          <div>
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              {t('producer.featureEvent')}
              <span className="chip bg-gradient-to-r from-brand-600 to-accent-600 text-white">{t('producer.featuredChip')}</span>
            </span>
            <span className="mt-0.5 block text-xs text-slate-500">{t('producer.featureEventDesc')}</span>
          </div>
        </label>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/60 bg-gradient-to-br from-emerald-50 to-teal-50/60 p-4 transition hover:from-emerald-100">
          <input type="checkbox" checked={form.is_active ?? true} onChange={(e) => setField('is_active', e.target.checked)} className="mt-0.5 h-4 w-4 accent-brand-600" />
          <div>
            <span className="text-sm font-semibold text-slate-900">{t('producer.activeEvent')}</span>
            <span className="mt-0.5 block text-xs text-slate-500">{t('producer.activeEventDesc')}</span>
          </div>
        </label>

        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={loading} className="btn btn-primary">{loading ? t('common.saving') : t('common.save')}</button>
          <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">{t('common.cancel')}</button>
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
