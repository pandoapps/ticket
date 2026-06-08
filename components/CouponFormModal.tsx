import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';
import type { Coupon, CouponPayload } from '@services/couponService';
import type { ApiError } from '@services/api';

interface EventOption {
  id: number;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CouponPayload) => Promise<void>;
  coupon?: Coupon | null;
  events: EventOption[];
  submitting: boolean;
}

export function CouponFormModal({ open, onClose, onSubmit, coupon, events, submitting }: Props) {
  const { t } = useTranslation();
  const [eventId, setEventId] = useState<number | ''>('');
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountPercent, setDiscountPercent] = useState('');
  const [discountFixed, setDiscountFixed] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const isEdit = coupon != null;

  useEffect(() => {
    if (!open) return;
    if (coupon) {
      setEventId(coupon.event_id);
      setCode(coupon.code);
      setDiscountType(coupon.discount_type ?? 'percent');
      setDiscountPercent(coupon.discount_percent !== null ? String(coupon.discount_percent) : '');
      setDiscountFixed(coupon.discount_fixed !== null ? String(coupon.discount_fixed) : '');
      setMaxUses(coupon.max_uses !== null ? String(coupon.max_uses) : '');
      setStartsAt(toInputDateTime(coupon.starts_at));
      setEndsAt(toInputDateTime(coupon.ends_at));
      setIsActive(coupon.is_active);
    } else {
      setEventId(events[0]?.id ?? '');
      setCode('');
      setDiscountType('percent');
      setDiscountPercent('');
      setDiscountFixed('');
      setMaxUses('');
      setStartsAt('');
      setEndsAt('');
      setIsActive(true);
    }
    setErrors({});
  }, [open, coupon, events]);

  async function handleSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setErrors({});
    if (eventId === '') {
      setErrors({ event_id: [t('coupon_modal.selectEventRequired')] });
      return;
    }
    const payload: CouponPayload = {
      event_id: Number(eventId),
      code: code.trim().toUpperCase(),
      discount_type: discountType,
      discount_percent: discountType === 'percent' ? Number(discountPercent) : null,
      discount_fixed: discountType === 'fixed' ? Number(discountFixed) : null,
      max_uses: maxUses.trim() === '' ? null : Number(maxUses),
      starts_at: startsAt ? new Date(startsAt).toISOString() : null,
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      is_active: isActive,
    };
    try {
      await onSubmit(payload);
    } catch (err) {
      const apiErr = err as ApiError;
      setErrors(apiErr.errors ?? {});
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? t('coupon_modal.editTitle') : t('coupon_modal.newTitle')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label={t('coupon_modal.event')} error={errors.event_id?.[0]}>
          <select
            value={eventId}
            onChange={(e) => setEventId(e.target.value === '' ? '' : Number(e.target.value))}
            disabled={isEdit || events.length === 0}
            required
            className="input"
          >
            {!isEdit && events.length === 0 && <option value="">{t('coupon_modal.noEvents')}</option>}
            {!isEdit && events.length > 0 && <option value="">{t('coupon_modal.selectEvent')}</option>}
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.name}</option>
            ))}
          </select>
          {isEdit && (
            <p className="mt-1 text-[11px] text-slate-500">{t('coupon_modal.eventLocked')}</p>
          )}
        </Field>

        <Field label={t('coupon_modal.code')} error={errors.code?.[0]}>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
            maxLength={50}
            placeholder="PROMO15"
            required
            className="input uppercase tracking-wider"
          />
          <p className="mt-1 text-[11px] text-slate-500">{t('coupon_modal.codeHint')}</p>
        </Field>

        <Field label={t('coupon_modal.discountType')} error={errors.discount_type?.[0]}>
          <div className="flex gap-3">
            <label className="flex cursor-pointer items-center gap-1.5 text-sm text-slate-700">
              <input type="radio" name="discountType" value="percent" checked={discountType === 'percent'} onChange={() => setDiscountType('percent')} className="h-4 w-4" />
              {t('coupon_modal.typePercent')}
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-sm text-slate-700">
              <input type="radio" name="discountType" value="fixed" checked={discountType === 'fixed'} onChange={() => setDiscountType('fixed')} className="h-4 w-4" />
              {t('coupon_modal.typeFixed')}
            </label>
          </div>
        </Field>

        {discountType === 'percent' ? (
          <Field label={t('coupon_modal.discountPercent')} error={errors.discount_percent?.[0]}>
            <input
              type="number"
              min={0.01}
              max={100}
              step={0.01}
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              required
              className="input"
              placeholder="15"
            />
          </Field>
        ) : (
          <Field label={t('coupon_modal.discountFixed')} error={errors.discount_fixed?.[0]}>
            <input
              type="number"
              min={0.01}
              step={0.01}
              value={discountFixed}
              onChange={(e) => setDiscountFixed(e.target.value)}
              required
              className="input"
              placeholder="20.00"
            />
          </Field>
        )}

        <Field label={t('coupon_modal.maxUses')} error={errors.max_uses?.[0]}>
          <input
            type="number"
            min={1}
            step={1}
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            className="input"
            placeholder={t('coupon_modal.unlimited')}
          />
          <p className="mt-1 text-[11px] text-slate-500">{t('coupon_modal.maxUsesHint')}</p>
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t('coupon_modal.startOptional')} error={errors.starts_at?.[0]}>
            <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="input" />
          </Field>
          <Field label={t('coupon_modal.endOptional')} error={errors.ends_at?.[0]}>
            <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className="input" />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          {t('coupon_modal.activeCoupon')}
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn btn-ghost" disabled={submitting}>
            {t('common.cancel')}
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? t('coupon_modal.saving') : isEdit ? t('coupon_modal.saveChanges') : t('coupon_modal.createCoupon')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </label>
  );
}

function toInputDateTime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
