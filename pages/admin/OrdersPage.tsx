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
import { adminService, type AdminOrder } from '@services/adminService';
import { formatBRL, formatDateTime } from '@utils/format';
import type { ApiError } from '@services/api';

const STATUS: Record<string, { label: string; color: string }> = {
  paid: { label: 'Paga', color: 'bg-emerald-100 text-emerald-700' },
  pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-700' },
  cancelled: { label: 'Cancelada', color: 'bg-rose-100 text-rose-700' },
  expired: { label: 'Expirada', color: 'bg-slate-100 text-slate-700' },
};

export function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<AdminOrder | null>(null);
  const toast = useToast();
  const confirm = useConfirm();

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
      title: `Excluir venda #${order.id}?`,
      description: 'Esta ação é irreversível e remove a venda do histórico.',
      confirmText: 'Excluir',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await adminService.deleteOrder(order.id);
      toast.success('Venda excluída.');
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  return (
    <AppLayout title="Admin" nav={adminNav}>
      <PageHeader
        title="Vendas globais"
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
              <option value="paid">Pagas</option>
              <option value="pending">Pendentes</option>
              <option value="cancelled">Canceladas</option>
              <option value="expired">Expiradas</option>
            </select>
          </div>
        }
      />

      {orders.length === 0 ? (
        <Empty title="Nenhuma venda encontrada." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <Th>#</Th>
                <Th>Cliente</Th>
                <Th>Evento</Th>
                <Th>Total</Th>
                <Th>Taxa</Th>
                <Th>Status</Th>
                <Th>Data</Th>
                <Th className="text-right">Ações</Th>
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
                        <ActionIconButton
                          onClick={() => setEditing(order)}
                          tone="brand"
                          label="Editar"
                          icon={<Icons.pencil className="h-4 w-4" />}
                        />
                        <ActionIconButton
                          onClick={() => handleDelete(order)}
                          tone="danger"
                          label="Excluir"
                          icon={<Icons.trash className="h-4 w-4" />}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <EditOrderModal
        order={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          load();
        }}
      />
    </AppLayout>
  );
}

interface EditOrderModalProps {
  order: AdminOrder | null;
  onClose: () => void;
  onSaved: () => void;
}

function EditOrderModal({ order, onClose, onSaved }: EditOrderModalProps) {
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
      toast.success('Venda atualizada.');
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
    <Modal open={order !== null} onClose={onClose} title={order ? `Venda #${order.id}` : 'Venda'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {order && (
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
            <p><span className="text-slate-500">Cliente:</span> <span className="font-medium">{order.customer?.name}</span></p>
            <p><span className="text-slate-500">Evento:</span> <span className="font-medium">{order.event?.name}</span></p>
            <p><span className="text-slate-500">Total:</span> <span className="font-medium">{formatBRL(order.total)}</span></p>
          </div>
        )}

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Status</span>
          <select
            value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value as AdminOrder['status'])}
            className={`input ${fieldError('status') ? 'border-rose-400' : ''}`}
          >
            <option value="pending">Pendente</option>
            <option value="paid">Paga</option>
            <option value="cancelled">Cancelada</option>
            <option value="expired">Expirada</option>
          </select>
          {fieldError('status') && <p className="mt-1 text-xs text-rose-600">{fieldError('status')}</p>}
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
