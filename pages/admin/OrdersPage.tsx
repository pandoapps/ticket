import { useEffect, useState, type FormEvent } from 'react';
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
import { adminService, type AdminOrder } from '@services/adminService';
import { formatBRL, formatDateTime } from '@utils/format';
import type { ApiError } from '@services/api';

export function OrdersPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<AdminOrder | null>(null);
  const toast = useToast();
  const confirm = useConfirm();

  const STATUS: Record<string, { label: string; color: string }> = {
    paid: { label: t('orders.paid'), color: 'bg-emerald-100 text-emerald-700' },
    pending: { label: t('orders.pending'), color: 'bg-amber-100 text-amber-700' },
    cancelled: { label: t('orders.cancelled'), color: 'bg-rose-100 text-rose-700' },
    expired: { label: t('orders.expired'), color: 'bg-slate-100 text-slate-700' },
  };

  async function load() {
    try {
      const res = await adminService.listOrders({ status: status || undefined, q: q || undefined });
      setOrders(res.data);
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  useEffect(() => {
    const id = setTimeout(load, 200);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, q]);

  async function handleDelete(order: AdminOrder) {
    const ok = await confirm({
      title: t('admin.deleteSaleTitle', { id: order.id }),
      description: t('admin.deleteSaleDesc'),
      confirmText: t('admin.deleteSaleBtn'),
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await adminService.deleteOrder(order.id);
      toast.success(t('admin.saleDeleted'));
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  return (
    <AppLayout title={t('admin.panel')} nav={adminNav}>
      <PageHeader
        title={t('admin.globalSales')}
        action={
          <div className="flex gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('admin.search')} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
              <option value="">{t('admin.allStatuses')}</option>
              <option value="paid">{t('admin.paidFilter')}</option>
              <option value="pending">{t('orders.pending')}</option>
              <option value="cancelled">{t('admin.cancelledFilter')}</option>
              <option value="expired">{t('admin.expiredFilter')}</option>
            </select>
          </div>
        }
      />

      {orders.length === 0 ? (
        <Empty title={t('admin.noSales')} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <Th>#</Th>
                <Th>{t('admin.customerCol')}</Th>
                <Th>{t('admin.eventCol')}</Th>
                <Th>{t('admin.totalCol')}</Th>
                <Th>{t('admin.feeCol')}</Th>
                <Th>{t('admin.status')}</Th>
                <Th>{t('admin.dateCol')}</Th>
                <Th className="text-right">{t('admin.actions')}</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {orders.map((order) => {
                const meta = STATUS[order.status] ?? { label: order.status, color: '' };
                return (
                  <tr key={order.id}>
                    <td className="px-4 py-3 font-mono text-xs">#{order.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{order.customer?.name}</p>
                      <p className="text-xs text-slate-500">{order.customer?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{order.event?.name}</td>
                    <td className="px-4 py-3">{formatBRL(order.total)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatBRL(order.platform_fee)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${meta.color}`}>{meta.label}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDateTime(order.paid_at ?? order.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <ActionIconButton onClick={() => setEditing(order)} tone="brand" label={t('common.edit')} icon={<Icons.pencil className="h-4 w-4" />} />
                        <ActionIconButton onClick={() => handleDelete(order)} tone="danger" label={t('common.delete')} icon={<Icons.trash className="h-4 w-4" />} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <EditOrderModal order={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />
    </AppLayout>
  );
}

function EditOrderModal({ order, onClose, onSaved }: { order: AdminOrder | null; onClose: () => void; onSaved: () => void }) {
  const { t } = useTranslation();
  const [orderStatus, setOrderStatus] = useState<AdminOrder['status']>('pending');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const toast = useToast();

  useEffect(() => {
    if (!order) return;
    setOrderStatus(order.status);
    setErrors({});
  }, [order]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!order) return;
    setErrors({});
    setLoading(true);
    try {
      await adminService.updateOrder(order.id, { status: orderStatus });
      toast.success(t('admin.saleUpdated'));
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
    <Modal open={order !== null} onClose={onClose} title={order ? t('admin.saleTitle', { id: order.id }) : ''}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {order && (
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
            <p><span className="text-slate-500">{t('admin.clientLabel')}</span> <span className="font-medium">{order.customer?.name}</span></p>
            <p><span className="text-slate-500">{t('admin.eventLabel')}</span> <span className="font-medium">{order.event?.name}</span></p>
            <p><span className="text-slate-500">{t('admin.totalLabel')}</span> <span className="font-medium">{formatBRL(order.total)}</span></p>
          </div>
        )}
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.status')}</span>
          <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value as AdminOrder['status'])} className={`input ${fieldError('status') ? 'border-rose-400' : ''}`}>
            <option value="pending">{t('orders.pending')}</option>
            <option value="paid">{t('orders.paid')}</option>
            <option value="cancelled">{t('orders.cancelled')}</option>
            <option value="expired">{t('orders.expired')}</option>
          </select>
          {fieldError('status') && <p className="mt-1 text-xs text-rose-600">{fieldError('status')}</p>}
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
