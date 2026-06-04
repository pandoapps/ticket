import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@components/AppLayout';
import { PageHeader } from '@components/PageHeader';
import { useToast } from '@components/Toast';
import { Icons } from '@components/Icon';
import { customerNav } from './nav';
import { orderService, type Order } from '@services/orderService';
import { paymentPageService } from '@services/paymentPageService';
import { formatBRL, formatDateTime } from '@utils/format';
import type { ApiError } from '@services/api';

export function CustomerOrderDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const orderId = Number(id);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const prevStatusRef = useRef<string | null>(null);
  const chargeAttemptedRef = useRef(false);
  const toast = useToast();

  const [charging, setCharging] = useState(false);
  const [chargeError, setChargeError] = useState('');
  const [needsPixForm, setNeedsPixForm] = useState(false);
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');

  const STATUS: Record<string, { label: string; color: string }> = {
    paid: { label: t('orders.paid'), color: 'bg-emerald-100 text-emerald-700' },
    pending: { label: t('order_detail.paymentPix'), color: 'bg-amber-100 text-amber-700' },
    cancelled: { label: t('orders.cancelled'), color: 'bg-rose-100 text-rose-700' },
    expired: { label: t('orders.expired'), color: 'bg-slate-100 text-slate-700' },
  };

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

  // Auto-generate charge for pending orders that have no payment data yet (POS orders)
  useEffect(() => {
    if (!order || order.status !== 'pending' || chargeAttemptedRef.current) return;
    const token = order.payment_token;
    if (!token) return;

    if (order.payment_method === 'card' && !order.checkout_url) {
      chargeAttemptedRef.current = true;
      setCharging(true);
      paymentPageService
        .charge(token, { method: 'card' })
        .then(() => orderService.show(orderId).then((r) => setOrder(r.data)))
        .catch((err: ApiError) => setChargeError(err.message))
        .finally(() => setCharging(false));
      return;
    }

    if (order.payment_method === 'pix' && !order.pix_qr_code) {
      const custPhone = order.customer?.phone ?? '';
      const custCpf = order.customer?.cpf ?? '';
      if (custPhone && custCpf) {
        chargeAttemptedRef.current = true;
        setCharging(true);
        paymentPageService
          .charge(token, { method: 'pix', phone: custPhone, cpf: custCpf })
          .then(() => orderService.show(orderId).then((r) => setOrder(r.data)))
          .catch((err: ApiError) => {
            setPhone(custPhone);
            setCpf(custCpf);
            setChargeError(err.message);
            setNeedsPixForm(true);
          })
          .finally(() => setCharging(false));
      } else {
        setPhone(custPhone);
        setCpf(custCpf);
        setNeedsPixForm(true);
      }
    }
  }, [order, orderId]);

  useEffect(() => {
    if (!orderId || order?.status !== 'pending') return;
    const handle = setInterval(() => {
      orderService.show(orderId).then((r) => setOrder(r.data)).catch(() => undefined);
    }, 5000);
    return () => clearInterval(handle);
  }, [orderId, order?.status]);

  useEffect(() => {
    const current = order?.status ?? null;
    if (prevStatusRef.current === 'pending' && current === 'paid') playPaymentChime();
    prevStatusRef.current = current;
  }, [order?.status]);

  function handleCopy() {
    if (!order?.pix_code) return;
    navigator.clipboard.writeText(order.pix_code);
    setCopied(true);
    toast.success(t('order_detail.pixCopied'));
    setTimeout(() => setCopied(false), 2500);
  }

  async function handlePixFormSubmit() {
    if (!order?.payment_token) return;
    chargeAttemptedRef.current = true;
    setCharging(true);
    setChargeError('');
    try {
      await paymentPageService.charge(order.payment_token, { method: 'pix', phone, cpf });
      const r = await orderService.show(orderId);
      setOrder(r.data);
      setNeedsPixForm(false);
    } catch (err) {
      setChargeError((err as ApiError).message);
    } finally {
      setCharging(false);
    }
  }

  if (loading) {
    return (
      <AppLayout title="Ticketeira" nav={customerNav}>
        <p className="text-slate-500">{t('order_detail.loading')}</p>
      </AppLayout>
    );
  }

  if (error || !order) {
    const notFound = error?.status === 404 || error?.status === 403;
    return (
      <AppLayout title="Ticketeira" nav={customerNav}>
        <PageHeader title={t('order_detail.unavailable')} description={`Order #${orderId}`} />
        <div className="glass-card flex flex-col items-center gap-3 p-8 text-center animate-fade-up">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <Icons.x className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            {notFound ? t('order_detail.notFound') : t('order_detail.loadError')}
          </h3>
          <p className="max-w-md text-sm text-slate-500">
            {notFound ? t('order_detail.notFoundDesc') : error?.message ?? t('order_detail.retryIn')}
          </p>
          <Link to="/meus-pedidos" className="btn btn-primary mt-2">
            {t('order_detail.viewMyOrders')}
          </Link>
        </div>
      </AppLayout>
    );
  }

  const statusMeta = STATUS[order.status] ?? { label: order.status, color: '' };

  return (
    <AppLayout title="Ticketeira" nav={customerNav}>
      <PageHeader
        title={order.event?.name ?? `Order #${order.id}`}
        description={t('order_detail.description', { id: order.id, date: formatDateTime(order.created_at) })}
        action={<span className={`chip ${statusMeta.color}`}>{statusMeta.label}</span>}
      />

      {/* ── Card payment ─────────────────────────────────────────────────── */}
      {order.status === 'pending' && order.payment_method === 'card' && (
        <div className="mb-6 glass-card p-6 animate-fade-up">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600">{t('order_detail.paymentCard')}</p>

          {charging && !order.checkout_url ? (
            <div className="mt-4 flex items-center gap-3 text-sm text-slate-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
              <span>{t('order_detail.generatingCard')}</span>
            </div>
          ) : chargeError && !order.checkout_url ? (
            <p className="mt-3 text-sm text-rose-600">{chargeError}</p>
          ) : (
            <>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">{t('order_detail.finishCheckout')}</h3>
              <p className="mt-1 text-sm text-slate-500">{t('order_detail.checkoutDesc')}</p>
              {order.checkout_url && (
                <a href={order.checkout_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-4 w-full sm:w-auto">
                  {t('order_detail.payWithCard')}
                </a>
              )}
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                <Icons.clock className="h-4 w-4 flex-shrink-0" />
                <span>
                  {t('order_detail.awaitingConfirmation')}{' '}
                  <Link to="/meus-ingressos" className="font-semibold underline">{t('order_detail.myTickets')}</Link>.
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── PIX payment ──────────────────────────────────────────────────── */}
      {order.status === 'pending' && order.payment_method === 'pix' && (
        <>
          {/* Generating spinner */}
          {charging && !order.pix_qr_code && (
            <div className="mb-6 glass-card p-6 animate-fade-up">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600">{t('order_detail.paymentPix')}</p>
              <div className="mt-4 flex items-center gap-3 text-sm text-slate-500">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
                <span>{t('order_detail.generatingPix')}</span>
              </div>
            </div>
          )}

          {/* PIX form — customer missing phone/CPF */}
          {needsPixForm && !order.pix_qr_code && !charging && (
            <div className="mb-6 glass-card p-6 animate-fade-up">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600">{t('order_detail.paymentPix')}</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">{t('order_detail.pixFormTitle')}</h3>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">{t('order_detail.pixPhone')}</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">{t('order_detail.pixCpf')}</label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="input w-full"
                  />
                </div>
                {chargeError && <p className="text-xs text-rose-600">{chargeError}</p>}
                <button
                  onClick={handlePixFormSubmit}
                  disabled={!phone.trim() || !cpf.trim()}
                  className="btn btn-primary w-full"
                >
                  {t('order_detail.pixGenerate')}
                </button>
              </div>
            </div>
          )}

          {/* QR Code */}
          {order.pix_qr_code && (
            <div className="mb-6 grid gap-4 lg:grid-cols-2">
              <div className="glass-card p-6 animate-fade-up">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600">{t('order_detail.paymentPix')}</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">{t('order_detail.scanQrCode')}</h3>
                <p className="text-sm text-slate-500">{t('order_detail.scanQrDesc')}</p>
                <div className="mt-4 flex items-center justify-center rounded-xl bg-white p-4 shadow-inner">
                  <img
                    src={order.pix_qr_code.startsWith('data:') ? order.pix_qr_code : `data:image/png;base64,${order.pix_qr_code}`}
                    alt="QR Code PIX"
                    className="h-64 w-64 object-contain"
                  />
                </div>
              </div>

              <div className="glass-card p-6 animate-fade-up">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600">{t('order_detail.copyCode')}</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">{t('order_detail.pixCopyPaste')}</h3>
                <div className="mt-4 max-h-40 overflow-y-auto break-all rounded-xl border border-white/60 bg-white/70 p-4 font-mono text-xs text-slate-700">
                  {order.pix_code}
                </div>
                <button onClick={handleCopy} className="btn btn-primary mt-3 w-full">
                  {copied ? t('order_detail.copied') : t('order_detail.copyPixCode')}
                </button>
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                  <Icons.clock className="h-4 w-4 flex-shrink-0" />
                  <span>
                    {t('order_detail.awaitingPixConfirmation')}{' '}
                    <Link to="/meus-ingressos" className="font-semibold underline">{t('order_detail.myTickets')}</Link>.
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Paid ─────────────────────────────────────────────────────────── */}
      {order.status === 'paid' && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-glass animate-fade-up">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">✓</div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{t('order_detail.paymentConfirmed')}</h3>
              <p className="text-sm text-slate-600">
                {t('order_detail.ticketsIssued')}{' '}
                <Link to="/meus-ingressos" className="font-semibold text-brand-700 underline">{t('order_detail.myTickets')}</Link>.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">{t('order_detail.summary')}</h3>
        <div className="space-y-2">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-slate-700">{item.quantity}× {item.lot?.name}</span>
              <span className="font-medium">{formatBRL(item.subtotal)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1 border-t border-white/60 pt-4 text-sm">
          <Row label={t('order_detail.subtotal')} value={formatBRL(order.subtotal)} />
          {order.coupon_code && order.discount_amount > 0 && (
            <Row
              label={t('order_detail.discount', { percent: order.discount_percent ?? 0, code: order.coupon_code })}
              value={`− ${formatBRL(order.discount_amount)}`}
            />
          )}
          <Row label={t('order_detail.platformFee')} value={formatBRL(order.platform_fee)} />
          <Row label={t('order_detail.total')} value={formatBRL(order.total)} big />
        </div>
      </div>
    </AppLayout>
  );
}

function playPaymentChime() {
  try {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
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
  } catch { /* noop */ }
}

function Row({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={big ? 'text-xl font-semibold text-slate-900' : 'font-medium text-slate-900'}>{value}</span>
    </div>
  );
}
