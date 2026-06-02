import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@components/AppLayout';
import { PageHeader } from '@components/PageHeader';
import { Empty } from '@components/Empty';
import { useToast } from '@components/Toast';
import { useConfirm } from '@components/ConfirmDialog';
import { ActionIconButton } from '@components/ActionIconButton';
import { Icons } from '@components/Icon';
import { CouponFormModal } from '@components/CouponFormModal';
import { producerNav } from './nav';
import { producerCouponService, type Coupon, type CouponPayload } from '@services/couponService';
import { producerEventService, type EventModel } from '@services/eventService';
import { formatDateTime } from '@utils/format';
import type { ApiError } from '@services/api';

export function CouponsPage() {
  const { t } = useTranslation();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [events, setEvents] = useState<EventModel[]>([]);
  const [filterEventId, setFilterEventId] = useState<number | ''>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();

  const load = useCallback(async () => {
    try {
      const res = await producerCouponService.list(filterEventId === '' ? undefined : { event_id: filterEventId });
      setCoupons(res.data);
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }, [filterEventId, toast]);

  useEffect(() => {
    producerEventService.list().then((r) => setEvents(r.data)).catch((err: ApiError) => toast.error(err.message));
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(payload: CouponPayload) {
    setSubmitting(true);
    try {
      if (editing) {
        await producerCouponService.update(editing.id, payload);
        toast.success(t('producer.couponUpdated'));
      } else {
        await producerCouponService.create(payload);
        toast.success(t('producer.couponCreated'));
      }
      setModalOpen(false);
      load();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(coupon: Coupon) {
    const ok = await confirm({
      title: t('producer.deleteCouponTitle', { code: coupon.code }),
      description: t('producer.deleteCouponDesc'),
      confirmText: t('common.delete'),
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await producerCouponService.destroy(coupon.id);
      toast.success(t('producer.couponDeleted'));
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  return (
    <AppLayout title={t('producer.panel')} nav={producerNav}>
      <PageHeader
        title={t('producer.couponsPage')}
        description={t('producer.couponsDesc2')}
        action={
          <button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn btn-primary" disabled={events.length === 0}>
            {t('producer.newCoupon')}
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="block text-sm text-slate-600">
          <span className="mr-2">{t('coupon_modal.event')}</span>
          <select value={filterEventId} onChange={(e) => setFilterEventId(e.target.value === '' ? '' : Number(e.target.value))} className="input w-auto">
            <option value="">{t('common.all')}</option>
            {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
          </select>
        </label>
      </div>

      {coupons.length === 0 ? (
        <Empty
          title={t('producer.noCoupons')}
          description={events.length === 0 ? t('producer.noCouponsNoEvent') : t('producer.noCouponsCreate')}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/50 bg-white/60 shadow-glass backdrop-blur-xl">
          <table className="min-w-full divide-y divide-white/60 text-sm">
            <thead className="bg-white/40">
              <tr>
                <Th>{t('producer.codeCol')}</Th>
                <Th>{t('coupon_modal.event')}</Th>
                <Th>{t('producer.discountCol')}</Th>
                <Th>{t('producer.usageCol')}</Th>
                <Th>{t('producer.couponValidity')}</Th>
                <Th>{t('admin.statusCol')}</Th>
                <Th className="text-right">{t('producer.actions')}</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/60">
              {coupons.map((c) => (
                <tr key={c.id} className="transition hover:bg-white/50">
                  <td className="px-4 py-3 font-mono font-semibold text-slate-900">{c.code}</td>
                  <td className="px-4 py-3 text-slate-600">{c.event?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{c.discount_percent}%</td>
                  <td className="px-4 py-3 text-slate-600">{c.used_count}{c.max_uses !== null ? ` / ${c.max_uses}` : ` ${t('producer.unlimited')}`}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    <div>{c.starts_at ? `${t('producer.fromDate')} ${formatDateTime(c.starts_at)}` : t('producer.noStart')}</div>
                    <div>{c.ends_at ? `${t('producer.untilDate')} ${formatDateTime(c.ends_at)}` : t('producer.noEnd')}</div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge coupon={c} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <ActionIconButton onClick={() => { setEditing(c); setModalOpen(true); }} tone="brand" label={t('common.edit')} icon={<Icons.pencil className="h-4 w-4" />} />
                      <ActionIconButton onClick={() => handleDelete(c)} tone="danger" label={t('common.delete')} icon={<Icons.trash className="h-4 w-4" />} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CouponFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} coupon={editing} events={events.map((ev) => ({ id: ev.id, name: ev.name }))} submitting={submitting} />
    </AppLayout>
  );
}

function StatusBadge({ coupon }: { coupon: Coupon }) {
  const { t } = useTranslation();
  const label = coupon.is_usable ? t('producer.couponAvailable') : coupon.is_active ? t('producer.couponUnavailable') : t('producer.couponInactive');
  const cls = coupon.is_usable ? 'bg-emerald-100 text-emerald-700' : coupon.is_active ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>;
}

function Th({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 ${className}`}>{children}</th>;
}
