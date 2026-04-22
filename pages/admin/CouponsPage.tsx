import { useCallback, useEffect, useState } from 'react';
import { AppLayout } from '@components/AppLayout';
import { PageHeader } from '@components/PageHeader';
import { Empty } from '@components/Empty';
import { useToast } from '@components/Toast';
import { useConfirm } from '@components/ConfirmDialog';
import { ActionIconButton } from '@components/ActionIconButton';
import { Icons } from '@components/Icon';
import { CouponFormModal } from '@components/CouponFormModal';
import { adminNav } from './nav';
import {
  adminCouponService,
  type Coupon,
  type CouponPayload,
} from '@services/couponService';
import { adminService } from '@services/adminService';
import type { EventModel } from '@services/eventService';
import { formatDateTime } from '@utils/format';
import type { ApiError } from '@services/api';

export function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [events, setEvents] = useState<EventModel[]>([]);
  const [filterEventId, setFilterEventId] = useState<number | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();

  const load = useCallback(async () => {
    try {
      const params: { event_id?: number; q?: string } = {};
      if (filterEventId !== '') params.event_id = filterEventId;
      if (searchTerm.trim()) params.q = searchTerm.trim();
      const res = await adminCouponService.list(params);
      setCoupons(res.data);
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }, [filterEventId, searchTerm, toast]);

  useEffect(() => {
    adminService
      .listEvents()
      .then((r) => setEvents(r.data))
      .catch((err: ApiError) => toast.error(err.message));
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(coupon: Coupon) {
    setEditing(coupon);
    setModalOpen(true);
  }

  async function handleSubmit(payload: CouponPayload) {
    setSubmitting(true);
    try {
      if (editing) {
        await adminCouponService.update(editing.id, payload);
        toast.success('Cupom atualizado.');
      } else {
        await adminCouponService.create(payload);
        toast.success('Cupom criado.');
      }
      setModalOpen(false);
      load();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(coupon: Coupon) {
    const ok = await confirm({
      title: `Excluir cupom ${coupon.code}?`,
      description: 'Pedidos já realizados com este cupom continuam válidos.',
      confirmText: 'Excluir',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await adminCouponService.destroy(coupon.id);
      toast.success('Cupom excluído.');
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  return (
    <AppLayout title="Admin" nav={adminNav}>
      <PageHeader
        title="Cupons"
        description="Gerencie todos os cupons da plataforma. Desconto aplicado antes da taxa do pagamento."
        action={
          <button onClick={openCreate} className="btn btn-primary" disabled={events.length === 0}>
            Novo cupom
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="block text-sm text-slate-600">
          <span className="mr-2">Evento</span>
          <select
            value={filterEventId}
            onChange={(e) => setFilterEventId(e.target.value === '' ? '' : Number(e.target.value))}
            className="input w-auto"
          >
            <option value="">Todos</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-slate-600">
          <span className="mr-2">Código</span>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar..."
            className="input w-auto"
          />
        </label>
      </div>

      {coupons.length === 0 ? (
        <Empty title="Nenhum cupom encontrado." description="Crie o primeiro cupom pelo botão acima." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/50 bg-white/60 shadow-glass backdrop-blur-xl">
          <table className="min-w-full divide-y divide-white/60 text-sm">
            <thead className="bg-white/40">
              <tr>
                <Th>Código</Th>
                <Th>Evento</Th>
                <Th>Produtor</Th>
                <Th>Desconto</Th>
                <Th>Uso</Th>
                <Th>Validade</Th>
                <Th>Status</Th>
                <Th className="text-right">Ações</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/60">
              {coupons.map((c) => (
                <tr key={c.id} className="transition hover:bg-white/50">
                  <td className="px-4 py-3 font-mono font-semibold text-slate-900">{c.code}</td>
                  <td className="px-4 py-3 text-slate-600">{c.event?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {c.event?.producer?.company_name ?? c.event?.producer?.user?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{c.discount_percent}%</td>
                  <td className="px-4 py-3 text-slate-600">
                    {c.used_count}
                    {c.max_uses !== null ? ` / ${c.max_uses}` : ' (ilimitado)'}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    <div>{c.starts_at ? `De: ${formatDateTime(c.starts_at)}` : 'Sem início'}</div>
                    <div>{c.ends_at ? `Até: ${formatDateTime(c.ends_at)}` : 'Sem término'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge coupon={c} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <ActionIconButton
                        onClick={() => openEdit(c)}
                        tone="brand"
                        label="Editar"
                        icon={<Icons.pencil className="h-4 w-4" />}
                      />
                      <ActionIconButton
                        onClick={() => handleDelete(c)}
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

      <CouponFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        coupon={editing}
        events={events.map((ev) => ({ id: ev.id, name: ev.name }))}
        submitting={submitting}
      />
    </AppLayout>
  );
}

function StatusBadge({ coupon }: { coupon: Coupon }) {
  const label = coupon.is_usable ? 'Disponível' : coupon.is_active ? 'Indisponível' : 'Inativo';
  const cls = coupon.is_usable
    ? 'bg-emerald-100 text-emerald-700'
    : coupon.is_active
      ? 'bg-amber-100 text-amber-700'
      : 'bg-slate-100 text-slate-600';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>;
}

function Th({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 ${className}`}>
      {children}
    </th>
  );
}
