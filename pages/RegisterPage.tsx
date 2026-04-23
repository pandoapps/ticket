import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useToast } from '@components/Toast';
import { authService } from '@services/authService';
import { setToken } from '@utils/token';
import type { ApiError } from '@services/api';

export function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  const fromState = (location.state as { from?: { pathname?: string } } | null)?.from;
  const redirectTo = fromState?.pathname ?? '/';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await authService.register({ ...form, role: 'customer' });
      setToken(res.data.token);
      setUser(res.data.user);
      toast.success('Cadastro realizado!');
      navigate(redirectTo, { replace: true });
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
            <p className="text-sm font-semibold text-slate-900">Let's make it happen</p>
          </div>
        </Link>

        <form onSubmit={handleSubmit} className="glass-card p-8">
          <h1 className="text-2xl font-semibold text-slate-900">Criar conta de cliente</h1>
          <p className="mb-6 mt-1 text-sm text-slate-500">Compre ingressos e acompanhe seus pedidos.</p>

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
            <Link to="/login" state={fromState ? { from: fromState } : undefined} className="font-medium text-brand-600 hover:text-brand-700">
              Entrar
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-slate-500">
            Quer vender ingressos?{' '}
            <Link to="/cadastro/produtor" className="font-medium text-brand-600 hover:text-brand-700">
              Cadastre-se como produtor
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
