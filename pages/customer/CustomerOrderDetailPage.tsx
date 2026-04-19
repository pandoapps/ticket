import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AppLayout } from '@components/AppLayout';
import { PageHeader } from '@components/PageHeader';
import { useToast } from '@components/Toast';
import { Icons } from '@components/Icon';
import { customerNav } from './nav';
import { orderService, type Order } from '@services/orderService';
import { formatBRL, formatDateTime } from '@utils/format';
import type { ApiError } from '@services/api';

const STATUS: Record<string, { label: string; color: string }> = {
  paid: { label: 'Pago', color: 'bg-emerald-100 text-emerald-700' },
  pending: { label: 'Aguardando pagamento', color: 'bg-amber-100 text-amber-700' },
  cancelled: { label: 'Cancelado', color: 'bg-rose-100 text-rose-700' },
  expired: { label: 'Expirado', color: 'bg-slate-100 text-slate-700' },
};

export function CustomerOrderDetailPage() {
  const { id } = useParams();
  const orderId = Number(id);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const prevStatusRef = useRef<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    orderService
      .show(orderId)
      .then((r) => setOrder(r.data))
      .catch((err: ApiError) => setError(err))
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => {
    if (!orderId || order?.status !== 'pending') return;
    const handle = setInterval(() => {
      orderService
        .show(orderId)
        .then((r) => setOrder(r.data))
        .catch(() => undefined);
    }, 5000);
    return () => clearInterval(handle);
  }, [orderId, order?.status]);

  useEffect(() => {
    const current = order?.status ?? null;
    if (prevStatusRef.current === 'pending' && current === 'paid') {
      playPaymentChime();
    }
    prevStatusRef.current = current;
  }, [order?.status]);

  function handleCopy() {
    if (!order?.pix_code) return;
    navigator.clipboard.writeText(order.pix_code);
    setCopied(true);
    toast.success('Código PIX copiado!');
    setTimeout(() => setCopied(false), 2500);
  }

  if (loading) {
    return (
      <AppLayout title="Ticketeira" nav={customerNav}>
        <p className="text-slate-500">Carregando...</p>
      </AppLayout>
    );
  }

  if (error || !order) {
    const notFound = error?.status === 404 || error?.status === 403;
    return (
      <AppLayout title="Ticketeira" nav={customerNav}>
        <PageHeader title="Pedido indisponível" description={`Pedido #${orderId}`} />
        <div className="glass-card flex flex-col items-center gap-3 p-8 text-center animate-fade-up">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <Icons.x className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            {notFound ? 'Pedido não encontrado' : 'Não foi possível carregar este pedido'}
          </h3>
          <p className="max-w-md text-sm text-slate-500">
            {notFound
              ? 'Esse pedido não existe ou pertence a outro usuário.'
              : error?.message ?? 'Tente novamente em instantes.'}
          </p>
          <Link to="/meus-pedidos" className="btn btn-primary mt-2">
            Ver meus pedidos
          </Link>
        </div>
      </AppLayout>
    );
  }

  const statusMeta = STATUS[order.status] ?? { label: order.status, color: '' };

  return (
    <AppLayout title="Ticketeira" nav={customerNav}>
      <PageHeader
        title={order.event?.name ?? `Pedido #${order.id}`}
        description={`Pedido #${order.id} • ${formatDateTime(order.created_at)}`}
        action={<span className={`chip ${statusMeta.color}`}>{statusMeta.label}</span>}
      />

      {order.status === 'pending' && order.payment_method === 'card' && order.checkout_url && (
        <div className="mb-6 glass-card p-6 animate-fade-up">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600">Pagamento via Cartão</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">Finalize no checkout da Abacate Pay</h3>
          <p className="mt-1 text-sm text-slate-500">
            Você será direcionado para o ambiente seguro da Abacate Pay, onde escolhe a bandeira, o número de parcelas e conclui o
            pagamento. O valor das parcelas e eventuais juros são definidos pela operadora do seu cartão.
          </p>
          <a href={order.checkout_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-4 w-full sm:w-auto">
            Pagar com cartão
          </a>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
            <Icons.clock className="h-4 w-4 flex-shrink-0" />
            <span>
              Aguardando confirmação. Após aprovação, seus ingressos aparecem em{' '}
              <Link to="/meus-ingressos" className="font-semibold underline">
                Meus ingressos
              </Link>
              .
            </span>
          </div>
        </div>
      )}

      {order.status === 'pending' && order.payment_method === 'pix' && order.pix_qr_code && (
        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          <div className="glass-card p-6 animate-fade-up">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600">Pagamento via PIX</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">Escaneie o QR Code</h3>
            <p className="text-sm text-slate-500">Abra o app do seu banco e use a câmera para escanear.</p>
            <div className="mt-4 flex items-center justify-center rounded-xl bg-white p-4 shadow-inner">
              <img
                src={order.pix_qr_code.startsWith('data:') ? order.pix_qr_code : `data:image/png;base64,${order.pix_qr_code}`}
                alt="QR Code PIX"
                className="h-64 w-64 object-contain"
              />
            </div>
          </div>

          <div className="glass-card p-6 animate-fade-up">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600">Ou copie o código</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">PIX copia e cola</h3>
            <div className="mt-4 max-h-40 overflow-y-auto break-all rounded-xl border border-white/60 bg-white/70 p-4 font-mono text-xs text-slate-700">
              {order.pix_code}
            </div>
            <button onClick={handleCopy} className="btn btn-primary mt-3 w-full">
              {copied ? 'Copiado ✓' : 'Copiar código PIX'}
            </button>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              <Icons.clock className="h-4 w-4 flex-shrink-0" />
              <span>
                Pagamento aguardando confirmação. Após o pagamento, seus ingressos ficam disponíveis em{' '}
                <Link to="/meus-ingressos" className="font-semibold underline">
                  Meus ingressos
                </Link>
                .
              </span>
            </div>
          </div>
        </div>
      )}

      {order.status === 'paid' && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-glass animate-fade-up">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">✓</div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Pagamento confirmado!</h3>
              <p className="text-sm text-slate-600">
                Seus ingressos foram emitidos. Veja em{' '}
                <Link to="/meus-ingressos" className="font-semibold text-brand-700 underline">
                  Meus ingressos
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Resumo</h3>
        <div className="space-y-2">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-slate-700">
                {item.quantity}× {item.lot?.name}
              </span>
              <span className="font-medium">{formatBRL(item.subtotal)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1 border-t border-white/60 pt-4 text-sm">
          <Row label="Subtotal" value={formatBRL(order.subtotal)} />
          <Row label="Taxa plataforma" value={formatBRL(order.platform_fee)} />
          <Row label="Total" value={formatBRL(order.total)} big />
        </div>
      </div>
    </AppLayout>
  );
}

function playPaymentChime() {
  try {
    const AudioCtx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, start: 0, duration: 0.18 },
      { freq: 659.25, start: 0.14, duration: 0.18 },
      { freq: 783.99, start: 0.28, duration: 0.32 },
    ];
    notes.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = now + start;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + duration);
    });
    setTimeout(() => ctx.close(), 800);
  } catch {
    /* noop */
  }
}

function Row({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={big ? 'text-xl font-semibold text-slate-900' : 'font-medium text-slate-900'}>{value}</span>
    </div>
  );
}
