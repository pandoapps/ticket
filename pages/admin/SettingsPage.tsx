import { useEffect, useState, type FormEvent } from 'react';
import { AppLayout } from '@components/AppLayout';
import { PageHeader } from '@components/PageHeader';
import { useToast } from '@components/Toast';
import { adminNav } from './nav';
import { adminService } from '@services/adminService';
import type { ApiError } from '@services/api';

export function SettingsPage() {
  const [pixCommission, setPixCommission] = useState('10.00');
  const [pixFixed, setPixFixed] = useState('0');
  const [cardCommission, setCardCommission] = useState('10.00');
  const [cardFixed, setCardFixed] = useState('0');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    adminService
      .getSettings()
      .then((r) => {
        setPixCommission(r.data.pix_commission_percent);
        setPixFixed(r.data.pix_fixed_fee_cents);
        setCardCommission(r.data.card_commission_percent);
        setCardFixed(r.data.card_fixed_fee_cents);
      })
      .catch((err: ApiError) => toast.error(err.message));
  }, [toast]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      await adminService.updateSettings({
        pix_commission_percent: parseFloat(pixCommission),
        pix_fixed_fee_cents: parseFloat(pixFixed),
        card_commission_percent: parseFloat(cardCommission),
        card_fixed_fee_cents: parseFloat(cardFixed),
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
      <PageHeader title="Configurações da plataforma" description="Taxas cobradas em cada venda, por método de pagamento." />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <fieldset className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <legend className="px-2 text-sm font-semibold text-slate-700">PIX</legend>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Comissão (%)</span>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={pixCommission}
              onChange={(e) => setPixCommission(e.target.value)}
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
              value={pixFixed}
              onChange={(e) => setPixFixed(e.target.value)}
              required
              className="input"
            />
          </label>
        </fieldset>

        <fieldset className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <legend className="px-2 text-sm font-semibold text-slate-700">Cartão</legend>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Comissão (%)</span>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={cardCommission}
              onChange={(e) => setCardCommission(e.target.value)}
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
              value={cardFixed}
              onChange={(e) => setCardFixed(e.target.value)}
              required
              className="input"
            />
          </label>
        </fieldset>

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
