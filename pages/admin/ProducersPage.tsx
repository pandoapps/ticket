import { useEffect, useState, type FormEvent } from 'react';
import { AppLayout } from '@components/AppLayout';
import { PageHeader } from '@components/PageHeader';
import { Empty } from '@components/Empty';
import { Modal } from '@components/Modal';
import { useToast } from '@components/Toast';
import { useConfirm, usePrompt } from '@components/ConfirmDialog';
import { ActionIconButton } from '@components/ActionIconButton';
import { Icons } from '@components/Icon';
import { adminNav } from './nav';
import { adminService } from '@services/adminService';
import type { Producer } from '@services/producerService';
import { formatDateTime, formatPhone } from '@utils/format';
import type { ApiError } from '@services/api';

const STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Aprovado', color: 'bg-emerald-100 text-emerald-700' },
  blocked: { label: 'Bloqueado', color: 'bg-rose-100 text-rose-700' },
};

export function ProducersPage() {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Producer | null>(null);
  const toast = useToast();
  const confirm = useConfirm();
  const prompt = usePrompt();

  async function load() {
    try {
      const res = await adminService.listProducers({ status: status || undefined, q: q || undefined });
      setProducers(res.data);
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  useEffect(() => {
    const id = setTimeout(load, 200);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, q]);

  async function approve(producer: Producer) {
    const ok = await confirm({
      title: 'Aprovar produtor?',
      description: `${producer.company_name} poderá criar e publicar eventos imediatamente.`,
      confirmText: 'Aprovar',
      variant: 'success',
    });
    if (!ok) return;
    try {
      await adminService.approveProducer(producer.id);
      toast.success(`${producer.company_name} aprovado.`);
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  async function block(producer: Producer) {
    const reason = await prompt({
      title: `Bloquear ${producer.company_name}?`,
      description: 'Informe o motivo do bloqueio (visível no histórico).',
      placeholder: 'Ex.: descumprimento dos termos de uso',
      confirmText: 'Bloquear',
      variant: 'danger',
      inputType: 'textarea',
      required: true,
    });
    if (reason === null) return;
    try {
      await adminService.blockProducer(producer.id, reason);
      toast.info(`${producer.company_name} bloqueado.`);
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  async function handleDelete(producer: Producer) {
    const ok = await confirm({
      title: `Excluir ${producer.company_name}?`,
      description: 'Esta ação remove o produtor da plataforma. Eventos e vendas vinculados podem ficar órfãos.',
      confirmText: 'Excluir',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await adminService.deleteProducer(producer.id);
      toast.success('Produtor excluído.');
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  return (
    <AppLayout title="Admin" nav={adminNav}>
      <PageHeader
        title="Produtores"
        description="Aprove, bloqueie e monitore produtores da plataforma."
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
              <option value="pending">Pendentes</option>
              <option value="approved">Aprovados</option>
              <option value="blocked">Bloqueados</option>
            </select>
          </div>
        }
      />

      {producers.length === 0 ? (
        <Empty title="Nenhum produtor encontrado." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <Th>Empresa</Th>
                <Th>Responsável</Th>
                <Th>Documento</Th>
                <Th>Status</Th>
                <Th>Credenciais</Th>
                <Th>Cadastro</Th>
                <Th className="text-right">Ações</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {producers.map((p) => {
                const meta = STATUS[p.status];
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{p.company_name}</td>
                    <td className="px-4 py-3">
                      <p className="text-slate-900">{p.user?.name}</p>
                      <p className="text-xs text-slate-500">{p.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{p.document}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${meta.color}`}>{meta.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      {p.has_valid_credentials ? (
                        <span className="text-emerald-600">OK</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDateTime(p.approved_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <ActionIconButton
                          onClick={() => setEditing(p)}
                          tone="brand"
                          label="Editar"
                          icon={<Icons.pencil className="h-4 w-4" />}
                        />
                        {p.status !== 'approved' && (
                          <ActionIconButton
                            onClick={() => approve(p)}
                            tone="success"
                            label="Aprovar"
                            icon={<Icons.check className="h-4 w-4" />}
                          />
                        )}
                        {p.status !== 'blocked' && (
                          <ActionIconButton
                            onClick={() => block(p)}
                            tone="warning"
                            label="Bloquear"
                            icon={<Icons.ban className="h-4 w-4" />}
                          />
                        )}
                        <ActionIconButton
                          onClick={() => handleDelete(p)}
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

      <EditProducerModal
        producer={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          load();
        }}
      />
    </AppLayout>
  );
}

interface EditProducerModalProps {
  producer: Producer | null;
  onClose: () => void;
  onSaved: () => void;
}

function EditProducerModal({ producer, onClose, onSaved }: EditProducerModalProps) {
  const [companyName, setCompanyName] = useState('');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');
  const [producerStatus, setProducerStatus] = useState<Producer['status']>('pending');
  const [blockedReason, setBlockedReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const toast = useToast();

  useEffect(() => {
    if (!producer) return;
    setCompanyName(producer.company_name);
    setDocument(producer.document);
    setPhone(formatPhone(producer.phone ?? ''));
    setProducerStatus(producer.status);
    setBlockedReason(producer.blocked_reason ?? '');
    setErrors({});
  }, [producer]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!producer) return;
    setErrors({});
    setLoading(true);
    try {
      await adminService.updateProducer(producer.id, {
        company_name: companyName,
        document,
        phone: phone || null,
        status: producerStatus,
        blocked_reason: producerStatus === 'blocked' ? (blockedReason || null) : null,
      });
      toast.success('Produtor atualizado.');
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
    <Modal open={producer !== null} onClose={onClose} title="Editar produtor">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Empresa</span>
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            className={`input ${fieldError('company_name') ? 'border-rose-400' : ''}`}
          />
          {fieldError('company_name') && <p className="mt-1 text-xs text-rose-600">{fieldError('company_name')}</p>}
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Documento (CPF/CNPJ)</span>
            <input
              value={document}
              onChange={(e) => setDocument(e.target.value)}
              required
              className={`input ${fieldError('document') ? 'border-rose-400' : ''}`}
            />
            {fieldError('document') && <p className="mt-1 text-xs text-rose-600">{fieldError('document')}</p>}
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Telefone</span>
            <input
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="(11) 99999-9999"
              inputMode="numeric"
              maxLength={15}
              className={`input ${fieldError('phone') ? 'border-rose-400' : ''}`}
            />
            {fieldError('phone') && <p className="mt-1 text-xs text-rose-600">{fieldError('phone')}</p>}
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Status</span>
          <select
            value={producerStatus}
            onChange={(e) => setProducerStatus(e.target.value as Producer['status'])}
            className={`input ${fieldError('status') ? 'border-rose-400' : ''}`}
          >
            <option value="pending">Pendente</option>
            <option value="approved">Aprovado</option>
            <option value="blocked">Bloqueado</option>
          </select>
        </label>

        {producerStatus === 'blocked' && (
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Motivo do bloqueio</span>
            <textarea
              value={blockedReason}
              onChange={(e) => setBlockedReason(e.target.value)}
              rows={3}
              className={`input ${fieldError('blocked_reason') ? 'border-rose-400' : ''}`}
            />
            {fieldError('blocked_reason') && (
              <p className="mt-1 text-xs text-rose-600">{fieldError('blocked_reason')}</p>
            )}
          </label>
        )}

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
