import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@components/AppLayout';
import { PageHeader } from '@components/PageHeader';
import { useToast } from '@components/Toast';
import { Icons } from '@components/Icon';
import { producerNav } from '@pages/producer/nav';
import { adminNav } from '@pages/admin/nav';
import { useAuth } from '@hooks/useAuth';
import { SearchableSelect } from '@components/SearchableSelect';
import { posService, type PosCustomer, type PosOrderItem, type PosOrderResult } from '@services/posService';
import { formatBRL, formatDate } from '@utils/format';
import type { EventModel, TicketLot } from '@services/eventService';
import type { ApiError } from '@services/api';

type PaymentMode = 'link' | 'manual';

export function PosPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const nav = isAdmin ? adminNav : producerNav;

  // Events
  const [events, setEvents] = useState<EventModel[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventModel | null>(null);

  // Lots
  const [lots, setLots] = useState<TicketLot[]>([]);
  const [loadingLots, setLoadingLots] = useState(false);
  const [lotQtys, setLotQtys] = useState<Record<number, number>>({});
  const [couponCode, setCouponCode] = useState('');

  // Customer
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customer, setCustomer] = useState<PosCustomer | null>(null);
  const [customerFound, setCustomerFound] = useState<boolean | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const lastLookedUp = useRef('');

  // Payment
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('manual');

  // Submit
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<PosOrderResult | null>(null);

  useEffect(() => {
    const fetch = isAdmin ? posService.listAllEvents() : posService.listEvents();
    fetch
      .then((r) => setEvents(r.data.filter((e) => e.status === 'published')))
      .catch((err: ApiError) => toast.error(err.message))
      .finally(() => setLoadingEvents(false));
  }, [isAdmin, toast]);

  function handleSelectEvent(id: string) {
    const event = events.find((e) => String(e.id) === id) ?? null;
    setSelectedEvent(event);
    setLots([]);
    setLotQtys({});
    if (!event) return;
    setLoadingLots(true);
    posService.listLots(event.id)
      .then((r) => setLots(r.data))
      .catch((err: ApiError) => toast.error(err.message))
      .finally(() => setLoadingLots(false));
  }

  async function lookupCustomer(email: string) {
    const normalized = email.trim().toLowerCase();
    if (!normalized || normalized === lastLookedUp.current) return;
    lastLookedUp.current = normalized;
    setLookingUp(true);
    setCustomer(null);
    setCustomerFound(null);
    try {
      const result = await posService.lookupCustomer(normalized);
      if (result.found && result.data) {
        setCustomer(result.data);
        setCustomerFound(true);
        if (!customerName) setCustomerName(result.data.name);
      } else {
        setCustomerFound(false);
      }
    } catch {
      setCustomerFound(null);
    } finally {
      setLookingUp(false);
    }
  }

  const selectedItems: PosOrderItem[] = lots
    .filter((l) => (lotQtys[l.id] ?? 0) > 0)
    .map((l) => ({ ticket_lot_id: l.id, quantity: lotQtys[l.id] }));

  const subtotal = lots.reduce((sum, lot) => sum + lot.price * (lotQtys[lot.id] ?? 0), 0);

  async function handleSubmit() {
    if (!selectedEvent) { toast.error(t('pos.selectEventFirst')); return; }
    if (selectedItems.length === 0) { toast.error(t('pos.selectAtLeastOne')); return; }
    if (paymentMode === 'link' && !customerEmail.trim() && !customer) {
      toast.error(t('pos.emailRequiredForLink')); return;
    }

    setSubmitting(true);
    try {
      const payload = {
        event_id: selectedEvent.id,
        ...(customer
          ? { customer_id: customer.id }
          : {
              ...(customerEmail.trim() ? { customer_email: customerEmail.trim() } : {}),
              ...(customerName.trim() ? { customer_name: customerName.trim() } : {}),
            }),
        payment_mode: paymentMode,
        items: selectedItems,
        ...(couponCode.trim() ? { coupon_code: couponCode.trim().toUpperCase() } : {}),
      };
      const res = await posService.createOrder(payload);
      setOrder(res.data);
    } catch (err) {
      toast.error((err as ApiError).message);
    } finally {
      setSubmitting(false);
    }
  }

  function resetAll() {
    setSelectedEvent(null);
    setLots([]);
    setLotQtys({});
    setCouponCode('');
    setCustomerEmail('');
    setCustomerName('');
    setCustomer(null);
    setCustomerFound(null);
    lastLookedUp.current = '';
    setPaymentMode('manual');
    setOrder(null);
  }

  // ── Success screen ──────────────────────────────────────────────────────────

  if (order) {
    const isManual = order.status === 'paid';
    const email = order.customer?.email ?? '';
    const isAnon = email.includes('@noreply.internal');
    return (
      <AppLayout title={t('producer.panel')} nav={nav}>
        <PageHeader title={t('pos.page')} description={t('pos.desc')} />
        <div className="mx-auto max-w-md py-10 text-center">
          <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Icons.checkCircle className="h-8 w-8 text-emerald-600" />
          </span>
          <h2 className="text-xl font-semibold text-slate-800">{t('pos.successTitle')}</h2>
          <p className="mt-2 text-slate-500">
            {isManual
              ? t('pos.successManual')
              : t('pos.successLink', { email: isAnon ? '—' : email })}
          </p>
          <p className="mt-1 text-sm text-slate-400">{t('pos.orderId', { id: order.id })}</p>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left text-sm">
            <p className="mb-2 font-medium text-slate-700">{order.event?.name}</p>
            {order.items?.map((item, i) => (
              <div key={i} className="flex justify-between py-0.5 text-slate-600">
                <span>{item.lot?.name} × {item.quantity}</span>
                <span>{formatBRL(item.subtotal)}</span>
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 font-semibold text-slate-800">
              <span>{t('pos.total')}</span>
              <span>{formatBRL(order.total)}</span>
            </div>
          </div>

          <button
            onClick={resetAll}
            className="mt-6 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            {t('pos.newSale')}
          </button>
        </div>
      </AppLayout>
    );
  }

  // ── Main layout ─────────────────────────────────────────────────────────────

  return (
    <AppLayout title={t('producer.panel')} nav={nav}>
      <PageHeader title={t('pos.page')} description={t('pos.desc')} />

      {/* Event selector */}
      <div className="mb-5">
        <SearchableSelect
          loading={loadingEvents}
          options={events.map((e) => ({
            value: String(e.id),
            label: e.name,
            sublabel: [
              e.venue_name,
              formatDate(e.starts_at),
            ].filter(Boolean).join(' · '),
          }))}
          value={selectedEvent ? String(selectedEvent.id) : ''}
          onChange={handleSelectEvent}
          placeholder={t('pos.selectEvent')}
        />
      </div>

      {selectedEvent && (
        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">

          {/* ── LEFT: Tickets ─────────────────────────────────────────────── */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t('pos.ticketsSection')}
            </h3>

            {loadingLots ? (
              <div className="space-y-2">
                {[1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />)}
              </div>
            ) : lots.length === 0 ? (
              <p className="text-sm text-slate-500">{t('pos.noLots')}</p>
            ) : (
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
                {lots.map((lot) => {
                  const qty = lotQtys[lot.id] ?? 0;
                  const avail = lot.is_active && lot.on_sale && lot.available > 0;
                  return (
                    <div key={lot.id} className="flex items-center justify-between px-4 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{lot.name}</p>
                        <p className="text-xs text-slate-500">
                          {formatBRL(lot.price)}
                          {avail ? ` · ${lot.available} ${t('pos.available')}` : ` · ${t('pos.soldOut')}`}
                        </p>
                      </div>
                      {avail ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setLotQtys((p) => ({ ...p, [lot.id]: Math.max(0, (p[lot.id] ?? 0) - 1) }))}
                            disabled={qty === 0}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-30"
                          >−</button>
                          <span className="w-5 text-center text-sm font-semibold text-slate-800">{qty}</span>
                          <button
                            onClick={() => setLotQtys((p) => ({ ...p, [lot.id]: Math.min(lot.available, (p[lot.id] ?? 0) + 1) }))}
                            disabled={qty >= lot.available}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-30"
                          >+</button>
                        </div>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">{t('pos.soldOut')}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Coupon */}
            <div>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder={t('pos.couponCode')}
                className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Subtotal */}
            {subtotal > 0 && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <div className="flex justify-between font-medium text-slate-700">
                  <span>{t('pos.subtotal')}</span>
                  <span>{formatBRL(subtotal)}</span>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Customer + Payment ──────────────────────────────────── */}
          <div className="space-y-5">

            {/* Customer */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-baseline gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t('pos.customerSection')}
                </h3>
                {paymentMode === 'manual' && (
                  <span className="text-xs text-slate-400">({t('pos.customerOptional')})</span>
                )}
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={t('pos.customerName')}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <div className="relative">
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => { setCustomerEmail(e.target.value); setCustomer(null); setCustomerFound(null); lastLookedUp.current = ''; }}
                    onBlur={(e) => lookupCustomer(e.target.value)}
                    placeholder={t('pos.customerEmail')}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  {lookingUp && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">…</span>
                  )}
                </div>
              </div>

              {customerFound === true && customer && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600">
                  <Icons.checkCircle className="h-3.5 w-3.5" />
                  {t('pos.customerFound')}: {customer.name}
                </div>
              )}
              {customerFound === false && customerEmail && (
                <p className="mt-2 text-xs text-amber-600">{t('pos.customerNotFound')}</p>
              )}
            </div>

            {/* Payment */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t('pos.paymentSection')}
              </h3>

              <div className="space-y-2">
                {(['manual', 'link'] as PaymentMode[]).map((mode) => (
                  <label key={mode} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition
                    ${paymentMode === mode ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <input
                      type="radio"
                      name="paymentMode"
                      checked={paymentMode === mode}
                      onChange={() => setPaymentMode(mode)}
                      className="mt-0.5 accent-emerald-600"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {mode === 'manual' ? t('pos.markPaid') : t('pos.sendLink')}
                      </p>
                      <p className="text-xs text-slate-500">
                        {mode === 'manual' ? t('pos.markPaidDesc') : t('pos.sendLinkDesc')}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              {paymentMode === 'link' && (
                <p className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-600">
                  O cliente receberá um link e escolherá PIX ou Cartão na hora do pagamento.
                </p>
              )}
            </div>

            {/* Confirm */}
            <button
              onClick={handleSubmit}
              disabled={submitting || selectedItems.length === 0}
              className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-40"
            >
              {submitting ? t('pos.processing') : t('pos.confirm')}
            </button>
          </div>
        </div>
      )}

      {!selectedEvent && !loadingEvents && events.length > 0 && (
        <p className="mt-4 text-sm text-slate-400">{t('pos.selectEventFirst')}</p>
      )}
    </AppLayout>
  );
}
