import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@components/AppLayout';
import { useToast } from '@components/Toast';
import { Modal } from '@components/Modal';
import { MoneyInput } from '@components/MoneyInput';
import { Icons } from '@components/Icon';
import { useConfirm } from '@components/ConfirmDialog';
import { adminNav } from './nav';
import { adminService } from '@services/adminService';
import type { EventModel, EventStatus, VenueType, TicketLot, LotPayload } from '@services/eventService';
import type { ApiError } from '@services/api';
import { formatBRL, formatDateTime } from '@utils/format';

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  published: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-700',
};

function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function fromLocalInput(value: string): string | null {
  if (!value) return null;
  return new Date(value).toISOString();
}

const EMPTY_LOT: LotPayload = { name: '', price: 0, quantity: 1, is_half_price: false, is_active: true };

export function AdminEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const toast = useToast();
  const confirm = useConfirm();

  const [event, setEvent] = useState<EventModel | null>(null);
  const [editing, setEditing] = useState(false);
  const [lotOpen, setLotOpen] = useState(false);
  const [lotForm, setLotForm] = useState<LotPayload>(EMPTY_LOT);
  const [editingLotId, setEditingLotId] = useState<number | null>(null);
  const [savingLot, setSavingLot] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await adminService.getEvent(Number(id));
      setEvent(res.data);
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }, [id, toast]);

  useEffect(() => { load(); }, [load]);

  function openNewLot() {
    setLotForm(EMPTY_LOT);
    setEditingLotId(null);
    setLotOpen(true);
  }

  function openEditLot(lot: TicketLot) {
    setLotForm({
      name: lot.name,
      price: lot.price,
      quantity: lot.quantity,
      sales_start_at: lot.sales_start_at ? toLocalInput(lot.sales_start_at) : undefined,
      sales_end_at: lot.sales_end_at ? toLocalInput(lot.sales_end_at) : undefined,
      is_half_price: lot.is_half_price,
      is_active: lot.is_active,
    });
    setEditingLotId(lot.id);
    setLotOpen(true);
  }

  async function handleSaveLot(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!event) return;
    setSavingLot(true);
    const payload: LotPayload = {
      ...lotForm,
      sales_start_at: lotForm.sales_start_at ? new Date(lotForm.sales_start_at).toISOString() : undefined,
      sales_end_at: lotForm.sales_end_at ? new Date(lotForm.sales_end_at).toISOString() : undefined,
    };
    try {
      if (editingLotId !== null) {
        await adminService.updateLot(editingLotId, payload);
      } else {
        await adminService.createLot(event.id, payload);
      }
      setLotOpen(false);
      toast.success(t('admin.lotSaved'));
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    } finally {
      setSavingLot(false);
    }
  }

  async function handleDeleteLot(lot: TicketLot) {
    const ok = await confirm({
      title: t('admin.deleteLotTitle', { name: lot.name }),
      description: lot.sold > 0 ? t('admin.deleteLotHasSalesDesc') : t('admin.deleteLotNoSalesDesc'),
      confirmText: t('common.delete'),
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await adminService.deleteLot(lot.id);
      toast.success(t('admin.lotDeleted'));
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  if (!event) {
    return (
      <AppLayout title={t('admin.panel')} nav={adminNav}>
        <div className="py-24 text-center text-sm text-slate-400">{t('common.loading')}</div>
      </AppLayout>
    );
  }

  const totalQuantity = event.lots?.reduce((s, l) => s + l.quantity, 0) ?? 0;
  const totalSold = event.lots?.reduce((s, l) => s + l.sold, 0) ?? 0;
  const totalAvailable = event.lots?.reduce((s, l) => s + l.available, 0) ?? 0;

  return (
    <AppLayout title={t('admin.panel')} nav={adminNav}>
      {/* breadcrumb + header */}
      <div className="mb-6">
        <Link to="/admin/eventos" className="mb-3 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <Icons.chevronLeft className="h-4 w-4" />
          {t('nav.events')}
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-slate-900">{event.name}</h1>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[event.status]}`}>
                {t(`admin.${event.status}`)}
              </span>
            </div>
            {event.producer && (
              <p className="mt-0.5 text-sm text-slate-500">
                {t('admin.producerLabel')}: <span className="font-medium text-slate-700">{event.producer.company_name}</span>
              </p>
            )}
          </div>
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Icons.pencil className="h-4 w-4" />
            {t('admin.editEvent')}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: t('admin.totalTickets'), value: totalQuantity },
            { label: t('admin.sold'), value: totalSold },
            { label: t('admin.available'), value: totalAvailable },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="mt-0.5 text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* event info */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">{t('admin.eventInfo')}</h2>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 text-sm">
            <InfoRow label={t('admin.start')} value={formatDateTime(event.starts_at)} />
            <InfoRow label={t('admin.end')} value={event.ends_at ? formatDateTime(event.ends_at) : '—'} />
            <InfoRow label={t('admin.venueType')} value={t(`admin.${event.venue_type}`)} />
            {event.venue_type === 'physical' ? (
              <>
                <InfoRow label={t('admin.venueName')} value={event.venue_name ?? '—'} />
                <InfoRow label={t('admin.address')} value={event.venue_address ?? '—'} />
              </>
            ) : (
              <InfoRow label={t('admin.onlineLink')} value={event.online_url ?? '—'} />
            )}
            <InfoRow label={t('admin.acceptedPayments')} value={[event.accepts_pix && 'PIX', event.accepts_card && t('admin.card')].filter(Boolean).join(', ') || '—'} />
            <InfoRow label={t('admin.featured')} value={event.is_featured ? t('common.yes') : t('common.no')} />
            <InfoRow label={t('admin.activeEvent')} value={event.is_active ? t('common.yes') : t('common.no')} />
            {event.description && (
              <div className="sm:col-span-2">
                <dt className="font-medium text-slate-500">{t('admin.description')}</dt>
                <dd className="mt-0.5 whitespace-pre-line text-slate-700">{event.description}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* lots */}
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-700">{t('admin.lots')}</h2>
            <button
              onClick={openNewLot}
              className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
            >
              <Icons.plus className="h-3.5 w-3.5" />
              {t('admin.newLot')}
            </button>
          </div>
          {!event.lots || event.lots.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-400">{t('admin.noLots')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead className="bg-slate-50 text-xs font-medium text-slate-500">
                  <tr>
                    <Th>{t('admin.name')}</Th>
                    <Th>{t('admin.price')}</Th>
                    <Th>{t('admin.quantity')}</Th>
                    <Th>{t('admin.sold')}</Th>
                    <Th>{t('admin.available')}</Th>
                    <Th>{t('admin.salePeriod')}</Th>
                    <Th>{t('admin.status')}</Th>
                    <Th className="text-right">{t('admin.actions')}</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {event.lots.map((lot) => (
                    <tr key={lot.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {lot.name}
                        {lot.is_half_price && (
                          <span className="ml-1.5 rounded-full bg-violet-100 px-1.5 py-0.5 text-xs text-violet-700">{t('admin.halfPriceBadge')}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{formatBRL(lot.price)}</td>
                      <td className="px-4 py-3 text-slate-600">{lot.quantity}</td>
                      <td className="px-4 py-3 text-slate-600">{lot.sold}</td>
                      <td className="px-4 py-3">
                        <span className={lot.available === 0 ? 'text-rose-600' : 'text-slate-600'}>
                          {lot.available}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {lot.sales_start_at || lot.sales_end_at ? (
                          <>
                            {lot.sales_start_at ? formatDateTime(lot.sales_start_at) : '—'}
                            {' → '}
                            {lot.sales_end_at ? formatDateTime(lot.sales_end_at) : '—'}
                          </>
                        ) : (
                          t('admin.always')
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${lot.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {lot.is_active ? t('admin.active') : t('admin.inactive')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditLot(lot)}
                            title={t('common.edit')}
                            className="rounded p-1 text-slate-400 hover:text-brand-600"
                          >
                            <Icons.pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLot(lot)}
                            title={t('common.delete')}
                            className="rounded p-1 text-slate-400 hover:text-rose-600 disabled:opacity-40"
                            disabled={lot.sold > 0}
                          >
                            <Icons.trash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* banner */}
        {event.banner_url && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">{t('admin.banner')}</h2>
            <img src={event.banner_url} alt={t('admin.banner')} className="max-h-48 rounded-lg object-cover" />
          </div>
        )}
      </div>

      <LotModal
        open={lotOpen}
        form={lotForm}
        isEditing={editingLotId !== null}
        saving={savingLot}
        onChange={setLotForm}
        onClose={() => setLotOpen(false)}
        onSubmit={handleSaveLot}
      />

      <EditEventModal
        event={editing ? event : null}
        onClose={() => setEditing(false)}
        onSaved={() => { setEditing(false); load(); }}
      />
    </AppLayout>
  );
}

function LotModal({ open, form, isEditing, saving, onChange, onClose, onSubmit }: {
  open: boolean;
  form: LotPayload;
  isEditing: boolean;
  saving: boolean;
  onChange: (f: LotPayload) => void;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) {
  const { t } = useTranslation();
  return (
    <Modal open={open} onClose={onClose} title={isEditing ? t('admin.editLot') : t('admin.newLot')}>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.name')}</span>
          <input
            value={form.name}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
            required
            className="input"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.price')}</span>
            <MoneyInput value={form.price} onValueChange={(v) => onChange({ ...form, price: v })} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.quantity')}</span>
            <input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) => onChange({ ...form, quantity: Number(e.target.value) })}
              required
              className="input"
            />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.salesStart')}</span>
            <input
              type="datetime-local"
              value={form.sales_start_at ?? ''}
              onChange={(e) => onChange({ ...form, sales_start_at: e.target.value || undefined })}
              className="input"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.salesEnd')}</span>
            <input
              type="datetime-local"
              value={form.sales_end_at ?? ''}
              onChange={(e) => onChange({ ...form, sales_end_at: e.target.value || undefined })}
              className="input"
            />
          </label>
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.is_half_price}
              onChange={(e) => onChange({ ...form, is_half_price: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300"
            />
            {t('admin.halfPrice')}
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => onChange({ ...form, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300"
            />
            {t('admin.active')}
          </label>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn btn-secondary">{t('common.cancel')}</button>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? t('common.saving') : isEditing ? t('common.save') : t('admin.createLot')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-medium text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-700">{value}</dd>
    </div>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-left ${className}`}>{children}</th>;
}

// ── Edit modal (same as EventsPage) ──────────────────────────────────────────

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
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="input" />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.start')}</span>
            <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required className={`input ${fieldError('starts_at') ? 'border-rose-400' : ''}`} />
            {fieldError('starts_at') && <p className="mt-1 text-xs text-rose-600">{fieldError('starts_at')}</p>}
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.end')}</span>
            <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className="input" />
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
              <input value={venueName} onChange={(e) => setVenueName(e.target.value)} className="input" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.address')}</span>
              <input value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)} className="input" />
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
          <input type="url" value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} placeholder="https://..." className="input" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.headerUrl')}</span>
          <input type="url" value={headerUrl} onChange={(e) => setHeaderUrl(e.target.value)} placeholder="https://..." className="input" />
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
