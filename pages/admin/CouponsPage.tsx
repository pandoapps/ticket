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
import { adminNav } from './nav';
import { adminCouponService, type Coupon, type CouponPayload } from '@services/couponService';
import { adminService } from '@services/adminService';
import type { EventModel } from '@services/eventService';
import { formatDateTime, formatBRL } from '@utils/format';
import type { ApiError } from '@services/api';

export function CouponsPage() {
  const { t } = useTranslation();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [events, setEvents] = useState<EventModel[]>([]);
  const [filterEventId, setFilterEventId] = useState<number | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const toast = useToast();
  const confirm = useConfirm();

  const allSelected = coupons.length > 0 && coupons.every((c) => selectedIds.has(c.id));
  const someSelected = selectedIds.size > 0;

  function toggleAll() {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(coupons.map((c) => c.id)));
  }

  function toggleOne(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const load = useCallback(async () => {
    try {
      const params: { event_id?: number; q?: string } = {};
      if (filterEventId !== '') params.event_id = filterEventId;
      if (searchTerm.trim()) params.q = searchTerm.trim();
      const res = await adminCouponService.list(params);
      setCoupons(res.data);
      setSelectedIds(new Set());
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }, [filterEventId, searchTerm, toast]);

  useEffect(() => {
    adminService.listEvents().then((r) => setEvents(r.data)).catch((err: ApiError) => toast.error(err.message));
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(payload: CouponPayload) {
    setSubmitting(true);
    try {
      if (editing) {
        await adminCouponService.update(editing.id, payload);
        toast.success(t('admin.couponUpdated'));
      } else {
        await adminCouponService.create(payload);
        toast.success(t('admin.couponCreated'));
      }
      setModalOpen(false);
      load();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(coupon: Coupon) {
    const ok = await confirm({
      title: `${t('admin.noCoupons').split('.')[0]} ${coupon.code}?`,
      description: t('producer.deleteCouponDesc'),
      confirmText: t('common.delete'),
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await adminCouponService.destroy(coupon.id);
      toast.success(t('admin.couponDeleted'));
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  async function handleBulkDelete() {
    const count = selectedIds.size;
    const ok = await confirm({
      title: t('admin.deleteSelectedCouponsTitle', { count }),
      description: t('admin.deleteSelectedCouponsDesc'),
      confirmText: t('common.delete'),
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await Promise.all([...selectedIds].map((id) => adminCouponService.destroy(id)));
      toast.success(t('admin.couponsDeleted', { count }));
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  return (
    <AppLayout title={t('admin.panel')} nav={adminNav}>
      <PageHeader
        title={t('admin.couponsPage')}
        description={t('admin.couponsDesc')}
        action={
          <div className="flex gap-2">
            {someSelected && (
              <button onClick={handleBulkDelete} className="btn btn-danger text-sm">
                {t('admin.deleteSelected', { count: selectedIds.size })}
              </button>
            )}
            <button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn btn-primary" disabled={events.length === 0}>
              {t('admin.newCoupon')}
            </button>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="block text-sm text-slate-600">
          <span className="mr-2">{t('admin.eventFilter')}</span>
          <select value={filterEventId} onChange={(e) => setFilterEventId(e.target.value === '' ? '' : Number(e.target.value))} className="input w-auto">
            <option value="">{t('common.all')}</option>
            {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
          </select>
        </label>
        <label className="block text-sm text-slate-600">
          <span className="mr-2">{t('admin.codeFilter')}</span>
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t('common.search')} className="input w-auto" />
        </label>
      </div>

      {coupons.length === 0 ? (
        <Empty title={t('admin.noCoupons')} description={t('admin.createFirstCoupon')} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/50 bg-white/60 shadow-glass backdrop-blur-xl">
          <table className="min-w-full divide-y divide-white/60 text-sm">
            <thead className="bg-white/40">
              <tr>
                <th className="px-4 py-3">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                </th>
                <Th>{t('admin.codeFilter')}</Th>
                <Th>{t('admin.eventCol')}</Th>
                <Th>{t('admin.producerCol')}</Th>
                <Th>{t('admin.discountCol')}</Th>
                <Th>{t('admin.usageCol')}</Th>
                <Th>{t('admin.validityCol')}</Th>
                <Th>{t('admin.statusCol')}</Th>
                <Th className="text-right">{t('admin.actions')}</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/60">
              {coupons.map((c) => {
                const isSelected = selectedIds.has(c.id);
                return (
                  <tr key={c.id} className={`transition ${isSelected ? 'bg-brand-50' : 'hover:bg-white/50'}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={isSelected} onChange={() => toggleOne(c.id)} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-900">{c.code}</td>
                    <td className="px-4 py-3 text-slate-600">{c.event?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{c.event?.producer?.company_name ?? c.event?.producer?.user?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{c.discount_type === 'fixed' ? formatBRL(c.discount_fixed ?? 0) : `${c.discount_percent}%`}</td>
                    <td className="px-4 py-3 text-slate-600">{c.used_count}{c.max_uses !== null ? ` / ${c.max_uses}` : ` (${t('admin.unlimited')})`}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      <div>{c.starts_at ? `${t('admin.fromDate')} ${formatDateTime(c.starts_at)}` : t('admin.noStart')}</div>
                      <div>{c.ends_at ? `${t('admin.untilDate')} ${formatDateTime(c.ends_at)}` : t('admin.noEnd')}</div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge coupon={c} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <ActionIconButton onClick={() => { setEditing(c); setModalOpen(true); }} tone="brand" label={t('common.edit')} icon={<Icons.pencil className="h-4 w-4" />} />
                        <ActionIconButton onClick={() => handleDelete(c)} tone="danger" label={t('common.delete')} icon={<Icons.trash className="h-4 w-4" />} />
                      </div>
                    </td>
                  </tr>
                );
              })}
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
  const label = coupon.is_usable ? t('admin.available') : coupon.is_active ? t('admin.unavailable') : t('admin.inactive');
  const cls = coupon.is_usable ? 'bg-emerald-100 text-emerald-700' : coupon.is_active ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>;
}

function Th({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 ${className}`}>{children}</th>;
}
