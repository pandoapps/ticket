import { useEffect, useState, type FormEvent } from 'react';
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
  const [eventId, setEventId] = useState<number | ''>('');
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
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
      setDiscountPercent(String(coupon.discount_percent));
      setMaxUses(coupon.max_uses !== null ? String(coupon.max_uses) : '');
      setStartsAt(toInputDateTime(coupon.starts_at));
      setEndsAt(toInputDateTime(coupon.ends_at));
      setIsActive(coupon.is_active);
    } else {
      setEventId(events[0]?.id ?? '');
      setCode('');
      setDiscountPercent('');
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
      setErrors({ event_id: ['Selecione um evento.'] });
      return;
    }

    const payload: CouponPayload = {
      event_id: Number(eventId),
      code: code.trim().toUpperCase(),
      discount_percent: Number(discountPercent),
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
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar cupom' : 'Novo cupom'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Evento" error={errors.event_id?.[0]}>
          <select
            value={eventId}
            onChange={(e) => setEventId(e.target.value === '' ? '' : Number(e.target.value))}
            disabled={isEdit || events.length === 0}
            required
            className="input"
          >
            {!isEdit && events.length === 0 && <option value="">Nenhum evento disponível</option>}
            {!isEdit && events.length > 0 && <option value="">Selecione...</option>}
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name}
              </option>
            ))}
          </select>
          {isEdit && (
            <p className="mt-1 text-[11px] text-slate-500">O evento de um cupom não pode ser alterado.</p>
          )}
        </Field>

        <Field label="Código" error={errors.code?.[0]}>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
            maxLength={50}
            placeholder="PROMO15"
            required
            className="input uppercase tracking-wider"
          />
          <p className="mt-1 text-[11px] text-slate-500">Letras maiúsculas, números, hífen e sublinhado.</p>
        </Field>

        <Field label="Desconto (%)" error={errors.discount_percent?.[0]}>
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

        <Field label="Limite de uso" error={errors.max_uses?.[0]}>
          <input
            type="number"
            min={1}
            step={1}
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            className="input"
            placeholder="Ilimitado"
          />
          <p className="mt-1 text-[11px] text-slate-500">Deixe em branco para uso ilimitado.</p>
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Início (opcional)" error={errors.starts_at?.[0]}>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Término (opcional)" error={errors.ends_at?.[0]}>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="input"
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          Cupom ativo
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn btn-ghost" disabled={submitting}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar cupom'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
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
