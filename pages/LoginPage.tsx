import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@hooks/useAuth';
import { useToast } from '@components/Toast';
import { Icons } from '@components/Icon';
import type { ApiError } from '@services/api';

export function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const fromState = (location.state as { from?: { pathname?: string } } | null)?.from;
  const redirectTo = fromState?.pathname ?? '/';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success(t('auth.welcome'));
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const apiErr = err as ApiError;
      toast.error(apiErr.message ?? t('auth.loginFailed'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
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
          <h1 className="text-2xl font-semibold text-slate-900">{t('auth.enterAccount')}</h1>
          <p className="mb-6 mt-1 text-sm text-slate-500">{t('auth.accessPanel')}</p>

          <label className="mb-4 block">
            <span className="mb-1 block text-sm font-medium text-slate-700">{t('auth.email')}</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </label>

          <label className="mb-6 block">
            <span className="mb-1 block text-sm font-medium text-slate-700">{t('auth.password')}</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </label>

          <button type="submit" disabled={submitting} className="btn btn-primary w-full">
            {submitting ? t('auth.signingIn') : t('auth.signIn')}
            <Icons.sparkles className="h-4 w-4" />
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">
            {t('auth.newHere')}{' '}
            <Link
              to="/cadastro"
              state={fromState ? { from: fromState } : undefined}
              className="font-medium text-brand-600 hover:text-brand-700"
            >
              {t('auth.createAccount')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
