import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useToast } from '@components/Toast';
import { authService, type UserRole } from '@services/authService';
import { setToken } from '@utils/token';
import type { ApiError } from '@services/api';

export function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'customer' as UserRole,
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await authService.register(form);
      setToken(res.data.token);
      setUser(res.data.user);
      toast.success('Cadastro realizado!');
      navigate(form.role === 'producer' ? '/produtor/cadastro' : '/', { replace: true });
    } catch (err) {
      toast.error((err as ApiError).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md animate-fade-up">
        <Link to="/" className="mb-6 flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-600 text-white shadow-lg shadow-brand-500/25">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M2 9c1.657 0 3-1.343 3-3h14c0 1.657 1.343 3 3 3v6c-1.657 0-3 1.343-3 3H5c0-1.657-1.343-3-3-3z" />
            </svg>
          </span>
          <div className="leading-tight">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-600">Ticketeira</p>
            <p className="text-sm font-semibold text-slate-900">Ingressos com estilo</p>
          </div>
        </Link>

        <form onSubmit={handleSubmit} className="glass-card p-8">
          <h1 className="text-2xl font-semibold text-slate-900">Criar conta</h1>
          <p className="mb-6 mt-1 text-sm text-slate-500">Cadastre-se como cliente ou produtor.</p>

          <div className="mb-4 grid grid-cols-2 gap-2">
            <RoleOption
              active={form.role === 'customer'}
              onClick={() => setForm({ ...form, role: 'customer' })}
              title="Cliente"
              description="Comprar ingressos"
            />
            <RoleOption
              active={form.role === 'producer'}
              onClick={() => setForm({ ...form, role: 'producer' })}
              title="Produtor"
              description="Vender ingressos"
            />
          </div>

          <label className="mb-3 block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Nome</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="input" />
          </label>

          <label className="mb-3 block">
            <span className="mb-1 block text-sm font-medium text-slate-700">E-mail</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="input"
            />
          </label>

          <div className="mb-5 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Senha</span>
              <input
                type="password"
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="input"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Confirmar</span>
              <input
                type="password"
                minLength={8}
                value={form.password_confirmation}
                onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                required
                className="input"
              />
            </label>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? 'Criando...' : 'Criar conta'}
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">
            Já tem conta?{' '}
            <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function RoleOption({
  active,
  onClick,
  title,
  description,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-3 text-left transition ${
        active
          ? 'border-brand-400 bg-gradient-to-br from-brand-50 to-accent-50/60 shadow-md shadow-brand-500/10'
          : 'border-white/60 bg-white/50 hover:bg-white/70'
      }`}
    >
      <p className={`text-sm font-semibold ${active ? 'text-brand-700' : 'text-slate-900'}`}>{title}</p>
      <p className="text-xs text-slate-500">{description}</p>
    </button>
  );
}
