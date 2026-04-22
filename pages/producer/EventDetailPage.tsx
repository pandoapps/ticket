import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@components/AppLayout';
import { PageHeader } from '@components/PageHeader';
import { Modal } from '@components/Modal';
import { MoneyInput } from '@components/MoneyInput';
import { Empty } from '@components/Empty';
import { useToast } from '@components/Toast';
import { useConfirm } from '@components/ConfirmDialog';
import { ActionIconButton } from '@components/ActionIconButton';
import { Icons } from '@components/Icon';
import { producerNav } from './nav';
import { producerEventService, type EventModel, type LotPayload, type TicketLot } from '@services/eventService';
import { formatBRL, formatDateTime } from '@utils/format';
import type { ApiError } from '@services/api';

const EMPTY_LOT: LotPayload = {
  name: '',
  price: 0,
  quantity: 1,
  is_half_price: false,
  is_active: true,
};

export function EventDetailPage() {
  const { id } = useParams();
  const eventId = Number(id);
  const toast = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventModel | null>(null);
  const [lotOpen, setLotOpen] = useState(false);
  const [lotForm, setLotForm] = useState<LotPayload>(EMPTY_LOT);
  const [editingLotId, setEditingLotId] = useState<number | null>(null);
  const [syncingLotId, setSyncingLotId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await producerEventService.show(eventId);
      setEvent(res.data);
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }, [eventId, toast]);

  useEffect(() => {
    load();
  }, [load]);

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
      sales_start_at: toLocalInput(lot.sales_start_at),
      sales_end_at: toLocalInput(lot.sales_end_at),
      is_half_price: lot.is_half_price,
      is_active: lot.is_active,
    });
    setEditingLotId(lot.id);
    setLotOpen(true);
  }

  async function handleSaveLot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload: LotPayload = {
      ...lotForm,
      sales_start_at: lotForm.sales_start_at ? new Date(lotForm.sales_start_at).toISOString() : null,
      sales_end_at: lotForm.sales_end_at ? new Date(lotForm.sales_end_at).toISOString() : null,
    };
    try {
      if (editingLotId !== null) {
        await producerEventService.updateLot(editingLotId, payload);
      } else {
        await producerEventService.createLot(eventId, payload);
      }
      setLotOpen(false);
      toast.success('Ingresso salvo.');
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  async function handleSyncLot(lot: TicketLot) {
    setSyncingLotId(lot.id);
    try {
      await producerEventService.syncLot(lot.id);
      toast.success('Ingresso sincronizado com o Abacate Pay.');
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    } finally {
      setSyncingLotId(null);
    }
  }

  async function handleToggleActive(lot: TicketLot) {
    try {
      await producerEventService.toggleLotActive(lot.id);
      toast.success(lot.is_active ? 'Ingresso desativado.' : 'Ingresso ativado.');
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  async function handleDeleteLot(lot: TicketLot) {
    const ok = await confirm({
      title: 'Excluir ingresso?',
      description: `O ingresso "${lot.name}" será removido permanentemente. Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await producerEventService.destroyLot(lot.id);
      toast.success('Ingresso excluído.');
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  async function handlePublish() {
    if (!event) return;
    try {
      await (event.status === 'published' ? producerEventService.unpublish(event.id) : producerEventService.publish(event.id));
      toast.success(event.status === 'published' ? 'Evento despublicado.' : 'Evento publicado.');
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  if (!event) {
    return (
      <AppLayout title="Produtor" nav={producerNav}>
        <p className="text-slate-500">Carregando...</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Produtor" nav={producerNav}>
      <PageHeader
        title={event.name}
        description={`${formatDateTime(event.starts_at)} • ${event.venue_name ?? 'Online'}`}
        action={
          <div className="flex gap-2">
            <button onClick={() => navigate(`/produtor/eventos/${event.id}/editar`)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100">
              Editar
            </button>
            <button onClick={handlePublish} className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700">
              {event.status === 'published' ? 'Despublicar' : 'Publicar'}
            </button>
          </div>
        }
      />

      {event.status === 'published' && (
        <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
          URL pública:{' '}
          <Link to={`/eventos/${event.slug}`} className="underline">
            /eventos/{event.slug}
          </Link>
        </p>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Ingressos</h3>
        <button onClick={openNewLot} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100">
          + Novo ingresso
        </button>
      </div>

      {(event.lots?.length ?? 0) === 0 ? (
        <Empty title="Nenhum ingresso cadastrado." description="Adicione pelo menos um ingresso antes de publicar o evento." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <Th>Nome</Th>
                <Th>Preço</Th>
                <Th>Qtd</Th>
                <Th>Vendidos</Th>
                <Th>Vigência</Th>
                <Th>Abacate Pay</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {event.lots?.map((lot) => (
                <tr key={lot.id} className={lot.is_active ? undefined : 'bg-slate-50 text-slate-400'}>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    <span className={lot.is_active ? undefined : 'text-slate-500 line-through'}>{lot.name}</span>
                    {lot.is_half_price && <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">meia</span>}
                    {!lot.is_active && <span className="ml-1 rounded bg-slate-200 px-1.5 py-0.5 text-xs text-slate-600">desativado</span>}
                  </td>
                  <td className="px-4 py-3">{formatBRL(lot.price)}</td>
                  <td className="px-4 py-3">{lot.quantity}</td>
                  <td className="px-4 py-3">{lot.sold}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {lot.sales_start_at ? formatDateTime(lot.sales_start_at) : '—'}
                    {' → '}
                    {lot.sales_end_at ? formatDateTime(lot.sales_end_at) : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {lot.abacate_product_id ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 font-mono text-[11px] text-emerald-700" title={lot.abacate_product_id}>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {lot.abacate_product_id.slice(0, 12)}…
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSyncLot(lot)}
                        disabled={syncingLotId === lot.id}
                        className="rounded-lg border border-brand-300 bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {syncingLotId === lot.id ? 'Sincronizando...' : 'Sincronizar'}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <ActionIconButton
                        onClick={() => openEditLot(lot)}
                        tone="brand"
                        label="Editar"
                        icon={<Icons.pencil className="h-4 w-4" />}
                      />
                      <ActionIconButton
                        onClick={() => handleToggleActive(lot)}
                        tone={lot.is_active ? 'danger' : 'brand'}
                        label={lot.is_active ? 'Desativar' : 'Ativar'}
                        icon={lot.is_active ? <Icons.ban className="h-4 w-4" /> : <Icons.check className="h-4 w-4" />}
                      />
                      <ActionIconButton
                        onClick={() => handleDeleteLot(lot)}
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

      <Modal
        open={lotOpen}
        onClose={() => setLotOpen(false)}
        title={editingLotId !== null ? 'Editar ingresso' : 'Novo ingresso'}
      >
        <form onSubmit={handleSaveLot} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Nome</span>
            <input
              value={lotForm.name}
              onChange={(e) => setLotForm({ ...lotForm, name: e.target.value })}
              required
              className="input"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Preço</span>
              <MoneyInput
                value={lotForm.price}
                onValueChange={(v) => setLotForm({ ...lotForm, price: v })}
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Quantidade</span>
              <input
                type="number"
                min="1"
                value={lotForm.quantity}
                onChange={(e) => setLotForm({ ...lotForm, quantity: parseInt(e.target.value) || 0 })}
                required
                className="input"
              />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Venda inicia em</span>
              <input
                type="datetime-local"
                value={lotForm.sales_start_at ?? ''}
                onChange={(e) => setLotForm({ ...lotForm, sales_start_at: e.target.value })}
                className="input"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Venda termina em</span>
              <input
                type="datetime-local"
                value={lotForm.sales_end_at ?? ''}
                onChange={(e) => setLotForm({ ...lotForm, sales_end_at: e.target.value })}
                className="input"
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={lotForm.is_half_price ?? false}
                onChange={(e) => setLotForm({ ...lotForm, is_half_price: e.target.checked })}
              />
              Meia entrada
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={lotForm.is_active ?? true}
                onChange={(e) => setLotForm({ ...lotForm, is_active: e.target.checked })}
              />
              Ativo
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setLotOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
              Cancelar
            </button>
            <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
              Salvar
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{children}</th>;
}

function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
