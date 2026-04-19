import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@components/Toast';
import { useAuth } from '@hooks/useAuth';
import { producerService } from '@services/producerService';
import type { ApiError } from '@services/api';

export function ProducerRegisterPage() {
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
      toast.success('Cadastro enviado para aprovação.');
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
        <h1 className="mb-1 text-2xl font-semibold text-slate-900">Cadastro de produtor</h1>
        <p className="mb-6 text-sm text-slate-500">
          Olá, {user?.name}. Complete o cadastro para começar a vender.
        </p>

        <label className="mb-3 block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Razão social / Nome fantasia</span>
          <input
            value={form.company_name}
            onChange={(e) => setForm({ ...form, company_name: e.target.value })}
            required
            className="input"
          />
        </label>

        <label className="mb-3 block">
          <span className="mb-1 block text-sm font-medium text-slate-700">CPF ou CNPJ</span>
          <input
            value={form.document}
            onChange={(e) => setForm({ ...form, document: e.target.value })}
            required
            className="input"
          />
        </label>

        <label className="mb-5 block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Telefone</span>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="input"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? 'Enviando...' : 'Enviar cadastro'}
        </button>

        <p className="mt-4 text-xs text-slate-500">
          Após cadastrado, um administrador precisa aprovar sua conta antes que você possa criar eventos.
        </p>
      </form>
    </div>
  );
}
