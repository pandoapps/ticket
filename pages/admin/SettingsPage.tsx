import { useEffect, useState, type FormEvent } from 'react';
import { AppLayout } from '@components/AppLayout';
import { PageHeader } from '@components/PageHeader';
import { useToast } from '@components/Toast';
import { adminNav } from './nav';
import { adminService } from '@services/adminService';
import type { ApiError } from '@services/api';

export function SettingsPage() {
  const [commission, setCommission] = useState('10.00');
  const [fixedFee, setFixedFee] = useState('0');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    adminService
      .getSettings()
      .then((r) => {
        setCommission(r.data.commission_percent);
        setFixedFee(r.data.fixed_fee_cents);
      })
      .catch((err: ApiError) => toast.error(err.message));
  }, [toast]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      await adminService.updateSettings({
        commission_percent: parseFloat(commission),
        fixed_fee_cents: parseFloat(fixedFee),
      });
      toast.success('Configurações atualizadas.');
    } catch (err) {
      toast.error((err as ApiError).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout title="Admin" nav={adminNav}>
      <PageHeader title="Configurações da plataforma" description="Taxas cobradas em cada venda." />

      <form onSubmit={handleSubmit} className="max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Comissão (%)</span>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={commission}
            onChange={(e) => setCommission(e.target.value)}
            required
            className="input"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Taxa fixa (R$)</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={fixedFee}
            onChange={(e) => setFixedFee(e.target.value)}
            required
            className="input"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </AppLayout>
  );
}
