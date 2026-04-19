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
import { adminService } from '@services/adminService';
import type { User, UserRole } from '@services/authService';
import { formatDateTime, formatCPF, formatPhone } from '@utils/format';
import type { ApiError } from '@services/api';

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin',
  producer: 'Produtor',
  customer: 'Cliente',
};

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [role, setRole] = useState('');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<User | null>(null);
  const toast = useToast();
  const confirm = useConfirm();

  async function load() {
    try {
      const res = await adminService.listUsers({ role: role || undefined, q: q || undefined });
      setUsers(res.data);
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
      title: `Excluir ${user.name}?`,
      description: 'Esta ação é irreversível e remove o usuário da plataforma.',
      confirmText: 'Excluir',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await adminService.deleteUser(user.id);
      toast.success('Usuário excluído.');
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  return (
    <AppLayout title="Admin" nav={adminNav}>
      <PageHeader
        title="Usuários"
        action={
          <div className="flex gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar..."
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
            />
            <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
              <option value="">Todos os perfis</option>
              <option value="admin">Admins</option>
              <option value="producer">Produtores</option>
              <option value="customer">Clientes</option>
            </select>
          </div>
        }
      />

      {users.length === 0 ? (
        <Empty title="Nenhum usuário encontrado." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <Th>Nome</Th>
                <Th>E-mail</Th>
                <Th>Perfil</Th>
                <Th>Cadastro</Th>
                <Th className="text-right">Ações</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">{ROLE_LABEL[u.role] ?? u.role}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{formatDateTime(u.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <ActionIconButton
                        onClick={() => setEditing(u)}
                        tone="brand"
                        label="Editar"
                        icon={<Icons.pencil className="h-4 w-4" />}
                      />
                      <ActionIconButton
                        onClick={() => handleDelete(u)}
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

      <EditUserModal
        user={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          load();
        }}
      />
    </AppLayout>
  );
}

interface EditUserModalProps {
  user: User | null;
  onClose: () => void;
  onSaved: () => void;
}

function EditUserModal({ user, onClose, onSaved }: EditUserModalProps) {
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
      await adminService.updateUser(user.id, {
        name,
        email,
        phone: phone || null,
        cpf: cpf || null,
        role,
        ...(password ? { password } : {}),
      });
      toast.success('Usuário atualizado.');
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
    <Modal open={user !== null} onClose={onClose} title="Editar usuário">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Nome</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={`input ${fieldError('name') ? 'border-rose-400' : ''}`}
          />
          {fieldError('name') && <p className="mt-1 text-xs text-rose-600">{fieldError('name')}</p>}
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={`input ${fieldError('email') ? 'border-rose-400' : ''}`}
          />
          {fieldError('email') && <p className="mt-1 text-xs text-rose-600">{fieldError('email')}</p>}
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
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

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">CPF</span>
            <input
              value={cpf}
              onChange={(e) => setCpf(formatCPF(e.target.value))}
              placeholder="000.000.000-00"
              inputMode="numeric"
              maxLength={14}
              className={`input ${fieldError('cpf') ? 'border-rose-400' : ''}`}
            />
            {fieldError('cpf') && <p className="mt-1 text-xs text-rose-600">{fieldError('cpf')}</p>}
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Perfil</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className={`input ${fieldError('role') ? 'border-rose-400' : ''}`}
          >
            <option value="admin">Admin</option>
            <option value="producer">Produtor</option>
            <option value="customer">Cliente</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Nova senha (opcional)</span>
          <input
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Deixe em branco para manter"
            className={`input ${fieldError('password') ? 'border-rose-400' : ''}`}
            autoComplete="new-password"
          />
          {fieldError('password') && <p className="mt-1 text-xs text-rose-600">{fieldError('password')}</p>}
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
