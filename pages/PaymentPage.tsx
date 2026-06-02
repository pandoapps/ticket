import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PublicLayout } from '@components/PublicLayout';
import { Icons } from '@components/Icon';
import { formatBRL, formatDate } from '@utils/format';
import { paymentPageService, type PaymentPageOrder } from '@services/paymentPageService';
import type { ApiError } from '@services/api';

type Screen = 'loading' | 'error' | 'choose' | 'pix-form' | 'pix-qr' | 'card-redirect' | 'paid' | 'expired';

export function PaymentPage() {
  const { token } = useParams<{ token: string }>();
  const { i18n } = useTranslation();

  const [screen, setScreen] = useState<Screen>('loading');
  const [order, setOrder] = useState<PaymentPageOrder | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // PIX form
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Polling after PIX charge created
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!token) { setScreen('error'); setErrorMsg('Link inválido.'); return; }
    paymentPageService.getOrder(token)
      .then(({ data }) => {
        setOrder(data);
        setScreen(resolveInitialScreen(data));
      })
      .catch((err: ApiError) => { setScreen('error'); setErrorMsg(err.message); });
  }, [token]);

  function resolveInitialScreen(o: PaymentPageOrder): Screen {
    if (o.status === 'paid') return 'paid';
    if (o.status === 'cancelled' || o.status === 'expired') return 'expired';
    if (o.pix_code) return 'pix-qr';
    if (o.checkout_url) return 'card-redirect';
    return 'choose';
  }

  function startPolling() {
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => {
      if (!token) return;
      try {
        const { data } = await paymentPageService.getOrder(token);
        setOrder(data);
        if (data.status === 'paid') {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          setScreen('paid');
        }
      } catch { /* silent */ }
    }, 4000);
  }

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  async function handleChooseCard() {
    if (!token) return;
    setSubmitting(true);
    try {
      const { data } = await paymentPageService.charge(token, { method: 'card' });
      setOrder(data);
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (err) {
      setErrorMsg((err as ApiError).message);
      setScreen('error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleChargePix() {
    if (!token) return;
    setSubmitting(true);
    try {
      const { data } = await paymentPageService.charge(token, { method: 'pix', phone, cpf });
      setOrder(data);
      setScreen('pix-qr');
      startPolling();
    } catch (err) {
      setErrorMsg((err as ApiError).message);
    } finally {
      setSubmitting(false);
    }
  }

  function copyPix() {
    if (order?.pix_code) navigator.clipboard.writeText(order.pix_code);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  const locale = i18n.language === 'en' ? 'en-US' : 'pt-BR';

  function formatEventDate(iso: string) {
    return new Date(iso).toLocaleDateString(locale, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <PublicLayout>
      <div className="mx-auto min-h-screen max-w-md px-4 py-10">

        {/* ── Loading ──────────────────────────────────────────────────────── */}
        {screen === 'loading' && (
          <div className="py-24 text-center text-sm text-slate-400">Carregando...</div>
        )}

        {/* ── Error ────────────────────────────────────────────────────────── */}
        {screen === 'error' && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
            <p className="font-medium text-rose-700">Não foi possível carregar o pedido</p>
            <p className="mt-1 text-sm text-rose-500">{errorMsg}</p>
          </div>
        )}

        {/* ── Expired / Cancelled ──────────────────────────────────────────── */}
        {screen === 'expired' && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
            <Icons.ban className="mx-auto mb-3 h-10 w-10 text-slate-400" />
            <p className="font-medium text-slate-700">Este pedido não está mais disponível</p>
            <p className="mt-1 text-sm text-slate-500">
              {order?.status === 'expired' ? 'O prazo para pagamento expirou.' : 'Este pedido foi cancelado.'}
            </p>
          </div>
        )}

        {/* ── Paid ─────────────────────────────────────────────────────────── */}
        {screen === 'paid' && (
          <div className="text-center">
            <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <Icons.checkCircle className="h-8 w-8 text-emerald-600" />
            </span>
            <h1 className="text-xl font-semibold text-slate-800">Pagamento confirmado!</h1>
            <p className="mt-2 text-slate-500">Seus ingressos foram emitidos. Verifique seu e-mail.</p>
            <OrderSummary order={order} />
          </div>
        )}

        {/* ── Choose method ─────────────────────────────────────────────────── */}
        {(screen === 'choose' || screen === 'pix-form') && order && (
          <div className="space-y-5">
            <OrderSummary order={order} onFormatDate={formatEventDate} />

            <div>
              <h2 className="mb-3 text-sm font-semibold text-slate-700">Como você quer pagar?</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setScreen('pix-form')}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition
                    ${screen === 'pix-form' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                >
                  <span className="text-2xl">📱</span>
                  <span className="text-sm font-medium text-slate-700">PIX</span>
                  <span className="text-xs text-slate-400">Aprovação imediata</span>
                </button>
                <button
                  onClick={handleChooseCard}
                  disabled={submitting}
                  className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                >
                  <span className="text-2xl">💳</span>
                  <span className="text-sm font-medium text-slate-700">Cartão</span>
                  <span className="text-xs text-slate-400">Checkout seguro</span>
                </button>
              </div>
            </div>

            {screen === 'pix-form' && (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-medium text-slate-700">Dados para o PIX</h3>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Telefone (com DDD)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">CPF</label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                {errorMsg && <p className="text-xs text-rose-600">{errorMsg}</p>}
                <button
                  onClick={handleChargePix}
                  disabled={submitting || !phone.trim() || !cpf.trim()}
                  className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-40"
                >
                  {submitting ? 'Gerando PIX...' : 'Gerar QR Code PIX'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── PIX QR ───────────────────────────────────────────────────────── */}
        {screen === 'pix-qr' && order && (
          <div className="space-y-5">
            <OrderSummary order={order} onFormatDate={formatEventDate} />

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
              <h2 className="mb-4 text-center text-sm font-semibold text-emerald-800">Escaneie o QR Code</h2>
              {order.pix_qr_code && (
                <div className="mb-4 flex justify-center">
                  <img
                    src={`data:image/png;base64,${order.pix_qr_code}`}
                    alt="QR Code PIX"
                    className="h-48 w-48 rounded-lg border border-emerald-200"
                  />
                </div>
              )}
              <p className="mb-2 text-center text-xs text-slate-500">Ou copie o código PIX:</p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={order.pix_code ?? ''}
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"
                />
                <button
                  onClick={copyPix}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Copiar
                </button>
              </div>
              <p className="mt-4 text-center text-xs text-slate-400">
                Aguardando confirmação do pagamento...
              </p>
            </div>
          </div>
        )}

      </div>
    </PublicLayout>
  );
}

function OrderSummary({
  order,
  onFormatDate,
}: {
  order: PaymentPageOrder | null;
  onFormatDate?: (iso: string) => string;
}) {
  if (!order) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      {order.event && (
        <div className="mb-3">
          <p className="font-semibold text-slate-800">{order.event.name}</p>
          <p className="text-xs text-slate-500">
            {onFormatDate ? onFormatDate(order.event.starts_at) : formatDate(order.event.starts_at)}
            {order.event.venue_name ? ` · ${order.event.venue_name}` : ''}
          </p>
        </div>
      )}
      <div className="divide-y divide-slate-100">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between py-2 text-sm">
            <span className="text-slate-700">{item.name} × {item.quantity}</span>
            <span className="text-slate-600">{formatBRL(item.subtotal)}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 font-semibold text-slate-800">
        <span>Total</span>
        <span>{formatBRL(order.total)}</span>
      </div>
    </div>
  );
}
