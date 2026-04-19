import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from './Modal';
import { useToast } from './Toast';
import { useAuth } from '@hooks/useAuth';
import { profileService } from '@services/profileService';
import { formatCPF, formatPhone } from '@utils/format';
import type { ApiError } from '@services/api';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(formatPhone(user?.phone ?? ''));
  const [cpf, setCpf] = useState(formatCPF(user?.cpf ?? ''));
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!open) return;
    setName(user?.name ?? '');
    setEmail(user?.email ?? '');
    setPhone(formatPhone(user?.phone ?? ''));
    setCpf(formatCPF(user?.cpf ?? ''));
    setCurrentPassword('');
    setPassword('');
    setPasswordConfirmation('');
    setErrors({});
  }, [open, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const payload: Parameters<typeof profileService.update>[0] = {
        name,
        email,
        phone: phone || null,
        cpf: cpf || null,
        ...(password
          ? { current_password: currentPassword, password, password_confirmation: passwordConfirmation }
          : {}),
      };
      const res = await profileService.update(payload);
      setUser(res.data);
      toast.success('Perfil atualizado.');
      onClose();
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
    <Modal open={open} onClose={onClose} title="Editar perfil">
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
              autoComplete="tel"
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

        <div className="rounded-xl border border-dashed border-slate-200 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Alterar senha (opcional)</p>
          <label className="mb-2 block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Senha atual</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={`input ${fieldError('current_password') ? 'border-rose-400' : ''}`}
              autoComplete="current-password"
            />
            {fieldError('current_password') && (
              <p className="mt-1 text-xs text-rose-600">{fieldError('current_password')}</p>
            )}
          </label>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Nova senha</span>
              <input
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`input ${fieldError('password') ? 'border-rose-400' : ''}`}
                autoComplete="new-password"
              />
              {fieldError('password') && <p className="mt-1 text-xs text-rose-600">{fieldError('password')}</p>}
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Confirmar</span>
              <input
                type="password"
                minLength={8}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="input"
                autoComplete="new-password"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
