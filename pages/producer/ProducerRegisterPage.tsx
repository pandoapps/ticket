import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '@components/Toast';
import { useAuth } from '@hooks/useAuth';
import { producerService } from '@services/producerService';
import type { ApiError } from '@services/api';

export function ProducerRegisterPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ company_name: '', document: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      await producerService.register(form);
      toast.success(t('producer.registrationSent'));
      navigate('/produtor', { replace: true });
    } catch (err) {
      toast.error((err as ApiError).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-2xl font-semibold text-slate-900">{t('producer.registerTitle')}</h1>
        <p className="mb-6 text-sm text-slate-500">{t('producer.registerSubtitle', { name: user?.name })}</p>

        <label className="mb-3 block">
          <span className="mb-1 block text-sm font-medium text-slate-700">{t('producer.companyName')}</span>
          <input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} required className="input" />
        </label>

        <label className="mb-3 block">
          <span className="mb-1 block text-sm font-medium text-slate-700">{t('producer.documentField')}</span>
          <input value={form.document} onChange={(e) => setForm({ ...form, document: e.target.value })} required className="input" />
        </label>

        <label className="mb-5 block">
          <span className="mb-1 block text-sm font-medium text-slate-700">{t('producer.phone')}</span>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
        </label>

        <button type="submit" disabled={loading} className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
          {loading ? t('producer.sending') : t('producer.sendRegistration')}
        </button>

        <p className="mt-4 text-xs text-slate-500">{t('producer.registerApprovalNote')}</p>
      </form>
    </div>
  );
}
