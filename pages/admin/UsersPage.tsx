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
import { adminService } from '@services/adminService';
import type { ConvertToProducerPayload } from '@services/adminService';
import type { User, UserRole } from '@services/authService';
import { formatDateTime, formatCPF, formatPhone } from '@utils/format';
import type { ApiError } from '@services/api';

export function UsersPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [role, setRole] = useState('');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<User | null>(null);
  const [converting, setConverting] = useState<User | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const toast = useToast();
  const confirm = useConfirm();

  const ROLE_LABEL: Record<string, string> = {
    admin: t('roles.admin'),
    producer: t('roles.producer'),
    customer: t('roles.customer'),
  };

  const allSelected = users.length > 0 && users.every((u) => selectedIds.has(u.id));
  const someSelected = selectedIds.size > 0;

  function toggleAll() {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(users.map((u) => u.id)));
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
      const res = await adminService.listUsers({ role: role || undefined, q: q || undefined });
      setUsers(res.data);
      setSelectedIds(new Set());
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  useEffect(() => {
    const id = setTimeout(load, 200);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, q]);

  async function handleDelete(user: User) {
    const ok = await confirm({
      title: t('admin.deleteUserTitle', { name: user.name }),
      description: t('admin.deleteUserDesc'),
      confirmText: t('common.delete'),
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await adminService.deleteUser(user.id);
      toast.success(t('admin.userDeleted'));
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  async function handleBulkDelete() {
    const count = selectedIds.size;
    const ok = await confirm({
      title: t('admin.deleteSelectedUsersTitle', { count }),
      description: t('admin.deleteSelectedUsersDesc'),
      confirmText: t('common.delete'),
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await Promise.all([...selectedIds].map((id) => adminService.deleteUser(id)));
      toast.success(t('admin.usersDeleted', { count }));
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  return (
    <AppLayout title={t('admin.panel')} nav={adminNav}>
      <PageHeader
        title={t('admin.usersPage')}
        action={
          <div className="flex gap-2">
            {someSelected && (
              <button onClick={handleBulkDelete} className="btn btn-danger text-sm">
                {t('admin.deleteSelected', { count: selectedIds.size })}
              </button>
            )}
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('admin.search')} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
            <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
              <option value="">{t('admin.allProfiles')}</option>
              <option value="admin">{t('admin.adminsFilter')}</option>
              <option value="producer">{t('admin.producersFilter')}</option>
              <option value="customer">{t('admin.customersFilter')}</option>
            </select>
          </div>
        }
      />

      {users.length === 0 ? (
        <Empty title={t('admin.noUsers')} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                </th>
                <Th>{t('admin.name')}</Th>
                <Th>{t('admin.email')}</Th>
                <Th>{t('admin.role')}</Th>
                <Th>{t('admin.registration')}</Th>
                <Th className="text-right">{t('admin.actions')}</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((u) => {
                const isSelected = selectedIds.has(u.id);
                return (
                  <tr key={u.id} className={isSelected ? 'bg-brand-50' : ''}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={isSelected} onChange={() => toggleOne(u.id)} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3">{ROLE_LABEL[u.role] ?? u.role}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDateTime(u.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {u.role === 'customer' && (
                          <ActionIconButton onClick={() => setConverting(u)} tone="brand" label={t('admin.convertToProducer')} icon={<Icons.sparkles className="h-4 w-4" />} />
                        )}
                        <ActionIconButton onClick={() => setEditing(u)} tone="brand" label={t('common.edit')} icon={<Icons.pencil className="h-4 w-4" />} />
                        <ActionIconButton onClick={() => handleDelete(u)} tone="danger" label={t('common.delete')} icon={<Icons.trash className="h-4 w-4" />} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <EditUserModal user={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />
      <ConvertToProducerModal user={converting} onClose={() => setConverting(null)} onSaved={() => { setConverting(null); load(); }} />
    </AppLayout>
  );
}

function EditUserModal({ user, onClose, onSaved }: { user: User | null; onClose: () => void; onSaved: () => void }) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const toast = useToast();

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    setPhone(formatPhone(user.phone ?? ''));
    setCpf(formatCPF(user.cpf ?? ''));
    setRole(user.role);
    setPassword('');
    setErrors({});
  }, [user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setErrors({});
    setLoading(true);
    try {
      await adminService.updateUser(user.id, { name, email, phone: phone || null, cpf: cpf || null, role, ...(password ? { password } : {}) });
      toast.success(t('admin.userUpdated'));
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
    <Modal open={user !== null} onClose={onClose} title={t('admin.editUser')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.name')}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required className={`input ${fieldError('name') ? 'border-rose-400' : ''}`} />
          {fieldError('name') && <p className="mt-1 text-xs text-rose-600">{fieldError('name')}</p>}
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.email')}</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={`input ${fieldError('email') ? 'border-rose-400' : ''}`} />
          {fieldError('email') && <p className="mt-1 text-xs text-rose-600">{fieldError('email')}</p>}
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.phone')}</span>
            <input value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="(11) 99999-9999" inputMode="numeric" maxLength={15} className={`input ${fieldError('phone') ? 'border-rose-400' : ''}`} />
            {fieldError('phone') && <p className="mt-1 text-xs text-rose-600">{fieldError('phone')}</p>}
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.cpf')}</span>
            <input value={cpf} onChange={(e) => setCpf(formatCPF(e.target.value))} placeholder="000.000.000-00" inputMode="numeric" maxLength={14} className={`input ${fieldError('cpf') ? 'border-rose-400' : ''}`} />
            {fieldError('cpf') && <p className="mt-1 text-xs text-rose-600">{fieldError('cpf')}</p>}
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.role')}</span>
          <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className={`input ${fieldError('role') ? 'border-rose-400' : ''}`}>
            <option value="admin">{t('roles.admin')}</option>
            <option value="customer">{t('roles.customer')}</option>
            {role === 'producer' && <option value="producer">{t('roles.producer')}</option>}
          </select>
          {role === 'producer' && (
            <p className="mt-1 text-xs text-amber-600">{t('admin.producerRoleReadOnly')}</p>
          )}
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.newPassword')}</span>
          <input type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('admin.passwordPlaceholder')} className={`input ${fieldError('password') ? 'border-rose-400' : ''}`} autoComplete="new-password" />
          {fieldError('password') && <p className="mt-1 text-xs text-rose-600">{fieldError('password')}</p>}
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn btn-secondary">{t('common.cancel')}</button>
          <button type="submit" disabled={loading} className="btn btn-primary">{loading ? t('common.saving') : t('common.save')}</button>
        </div>
      </form>
    </Modal>
  );
}

function ConvertToProducerModal({ user, onClose, onSaved }: { user: User | null; onClose: () => void; onSaved: () => void }) {
  const { t } = useTranslation();
  const [form, setForm] = useState<ConvertToProducerPayload>({ company_name: '', document: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const toast = useToast();

  useEffect(() => {
    if (!user) return;
    setForm({ company_name: '', document: '', phone: '' });
    setErrors({});
  }, [user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setErrors({});
    setLoading(true);
    try {
      await adminService.convertToProducer(user.id, { ...form, phone: form.phone || null });
      toast.success(t('admin.userConvertedToProducer', { name: user.name }));
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
    <Modal open={user !== null} onClose={onClose} title={t('admin.convertToProducer')}>
      <p className="mb-4 text-sm text-slate-600">{t('admin.convertToProducerDesc')}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">{t('producer.companyName')}</span>
          <input value={form.company_name} onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))} required className={`input ${fieldError('company_name') ? 'border-rose-400' : ''}`} />
          {fieldError('company_name') && <p className="mt-1 text-xs text-rose-600">{fieldError('company_name')}</p>}
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">{t('producer.documentField')}</span>
          <input value={form.document} onChange={(e) => setForm((f) => ({ ...f, document: e.target.value }))} required className={`input ${fieldError('document') ? 'border-rose-400' : ''}`} />
          {fieldError('document') && <p className="mt-1 text-xs text-rose-600">{fieldError('document')}</p>}
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.phone')}</span>
          <input value={form.phone ?? ''} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="(11) 99999-9999" inputMode="numeric" className={`input ${fieldError('phone') ? 'border-rose-400' : ''}`} />
          {fieldError('phone') && <p className="mt-1 text-xs text-rose-600">{fieldError('phone')}</p>}
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn btn-secondary">{t('common.cancel')}</button>
          <button type="submit" disabled={loading} className="btn btn-primary">{loading ? t('common.saving') : t('admin.convertToProducer')}</button>
        </div>
      </form>
    </Modal>
  );
}

function Th({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 ${className}`}>{children}</th>;
}
