import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
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

export function ProducersPage() {
  const { t } = useTranslation();
  const [producers, setProducers] = useState<Producer[]>([]);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Producer | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const toast = useToast();
  const confirm = useConfirm();
  const prompt = usePrompt();

  const STATUS: Record<string, { label: string; color: string }> = {
    pending: { label: t('admin.pendingFilter'), color: 'bg-amber-100 text-amber-700' },
    approved: { label: t('admin.approvedFilter'), color: 'bg-emerald-100 text-emerald-700' },
    blocked: { label: t('admin.blockedFilter'), color: 'bg-rose-100 text-rose-700' },
  };

  const allSelected = producers.length > 0 && producers.every((p) => selectedIds.has(p.id));
  const someSelected = selectedIds.size > 0;

  function toggleAll() {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(producers.map((p) => p.id)));
  }

  function toggleOne(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function load() {
    try {
      const res = await adminService.listProducers({ status: status || undefined, q: q || undefined });
      setProducers(res.data);
      setSelectedIds(new Set());
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
      title: t('admin.approveProducerTitle'),
      description: t('admin.approveProducerDesc', { name: producer.company_name }),
      confirmText: t('admin.approveBtn'),
      variant: 'success',
    });
    if (!ok) return;
    try {
      await adminService.approveProducer(producer.id);
      toast.success(t('admin.producerApproved', { name: producer.company_name }));
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  async function block(producer: Producer) {
    const reason = await prompt({
      title: t('admin.blockProducerTitle', { name: producer.company_name }),
      description: t('admin.blockReasonPrompt'),
      placeholder: t('admin.blockReasonPlaceholder'),
      confirmText: t('admin.blockBtn'),
      variant: 'danger',
      inputType: 'textarea',
      required: true,
    });
    if (reason === null) return;
    try {
      await adminService.blockProducer(producer.id, reason);
      toast.info(t('admin.producerBlocked', { name: producer.company_name }));
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  async function handleDelete(producer: Producer) {
    const ok = await confirm({
      title: t('admin.deleteProducerTitle', { name: producer.company_name }),
      description: t('admin.deleteProducerDesc'),
      confirmText: t('common.delete'),
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await adminService.deleteProducer(producer.id);
      toast.success(t('admin.producerDeleted'));
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  async function handleBulkDelete() {
    const count = selectedIds.size;
    const ok = await confirm({
      title: t('admin.deleteSelectedProducersTitle', { count }),
      description: t('admin.deleteSelectedProducersDesc'),
      confirmText: t('common.delete'),
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await Promise.all([...selectedIds].map((id) => adminService.deleteProducer(id)));
      toast.success(t('admin.producersDeleted', { count }));
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  return (
    <AppLayout title={t('admin.panel')} nav={adminNav}>
      <PageHeader
        title={t('admin.producersPage')}
        description={t('admin.producersDesc')}
        action={
          <div className="flex gap-2">
            {someSelected && (
              <button onClick={handleBulkDelete} className="btn btn-danger text-sm">
                {t('admin.deleteSelected', { count: selectedIds.size })}
              </button>
            )}
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('admin.search')} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
              <option value="">{t('admin.allStatuses')}</option>
              <option value="pending">{t('admin.pendingFilter')}</option>
              <option value="approved">{t('admin.approvedFilter')}</option>
              <option value="blocked">{t('admin.blockedFilter')}</option>
            </select>
          </div>
        }
      />

      {producers.length === 0 ? (
        <Empty title={t('admin.noProducers')} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                </th>
                <Th>{t('admin.company')}</Th>
                <Th>{t('admin.responsible')}</Th>
                <Th>{t('admin.document')}</Th>
                <Th>{t('admin.status')}</Th>
                <Th>{t('admin.credentials')}</Th>
                <Th>{t('admin.registration')}</Th>
                <Th className="text-right">{t('admin.actions')}</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {producers.map((p) => {
                const meta = STATUS[p.status];
                const isSelected = selectedIds.has(p.id);
                return (
                  <tr key={p.id} className={isSelected ? 'bg-brand-50' : ''}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={isSelected} onChange={() => toggleOne(p.id)} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                    </td>
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
                      {p.has_valid_credentials ? <span className="text-emerald-600">OK</span> : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDateTime(p.approved_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <ActionIconButton onClick={() => setEditing(p)} tone="brand" label={t('common.edit')} icon={<Icons.pencil className="h-4 w-4" />} />
                        {p.status !== 'approved' && (
                          <ActionIconButton onClick={() => approve(p)} tone="success" label={t('admin.approve')} icon={<Icons.check className="h-4 w-4" />} />
                        )}
                        {p.status !== 'blocked' && (
                          <ActionIconButton onClick={() => block(p)} tone="warning" label={t('admin.block')} icon={<Icons.ban className="h-4 w-4" />} />
                        )}
                        <ActionIconButton onClick={() => handleDelete(p)} tone="danger" label={t('common.delete')} icon={<Icons.trash className="h-4 w-4" />} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <EditProducerModal producer={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />
    </AppLayout>
  );
}

interface EditProducerModalProps { producer: Producer | null; onClose: () => void; onSaved: () => void; }

function EditProducerModal({ producer, onClose, onSaved }: EditProducerModalProps) {
  const { t } = useTranslation();
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
      toast.success(t('admin.producerUpdated'));
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
    <Modal open={producer !== null} onClose={onClose} title={t('admin.editProducer')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.company')}</span>
          <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className={`input ${fieldError('company_name') ? 'border-rose-400' : ''}`} />
          {fieldError('company_name') && <p className="mt-1 text-xs text-rose-600">{fieldError('company_name')}</p>}
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.document')} (CPF/CNPJ)</span>
            <input value={document} onChange={(e) => setDocument(e.target.value)} required className={`input ${fieldError('document') ? 'border-rose-400' : ''}`} />
            {fieldError('document') && <p className="mt-1 text-xs text-rose-600">{fieldError('document')}</p>}
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.phone')}</span>
            <input value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="(11) 99999-9999" inputMode="numeric" maxLength={15} className={`input ${fieldError('phone') ? 'border-rose-400' : ''}`} />
            {fieldError('phone') && <p className="mt-1 text-xs text-rose-600">{fieldError('phone')}</p>}
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.status')}</span>
          <select value={producerStatus} onChange={(e) => setProducerStatus(e.target.value as Producer['status'])} className={`input ${fieldError('status') ? 'border-rose-400' : ''}`}>
            <option value="pending">{t('admin.pendingFilter')}</option>
            <option value="approved">{t('admin.approvedFilter')}</option>
            <option value="blocked">{t('admin.blockedFilter')}</option>
          </select>
        </label>
        {producerStatus === 'blocked' && (
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.blockReasonLabel')}</span>
            <textarea value={blockedReason} onChange={(e) => setBlockedReason(e.target.value)} rows={3} className={`input ${fieldError('blocked_reason') ? 'border-rose-400' : ''}`} />
            {fieldError('blocked_reason') && <p className="mt-1 text-xs text-rose-600">{fieldError('blocked_reason')}</p>}
          </label>
        )}
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
