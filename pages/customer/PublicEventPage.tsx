import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PublicLayout } from '@components/PublicLayout';
import { Modal } from '@components/Modal';
import { useToast } from '@components/Toast';
import { Icons } from '@components/Icon';
import { publicEventService, type EventModel, type TicketLot } from '@services/eventService';
import { orderService, type PaymentMethod } from '@services/orderService';
import { formatBRL, formatCPF, formatDateTime, formatPhone } from '@utils/format';
import { useAuth } from '@hooks/useAuth';
import type { ApiError } from '@services/api';

const cartKey = (slug: string) => `ticketeira:pendingCart:${slug}`;

export function PublicEventPage() {
  const { slug } = useParams();
  const [event, setEvent] = useState<EventModel | null>(null);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const toast = useToast();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  useEffect(() => {
    if (!slug) return;
    publicEventService
      .show(slug)
      .then((r) => {
        setEvent(r.data);
        const initial: Record<number, number> = {};
        r.data.lots?.forEach((lot) => (initial[lot.id] = 0));

        const saved = sessionStorage.getItem(cartKey(slug));
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as Record<number, number>;
            r.data.lots?.forEach((lot) => {
              const qty = Number(parsed[lot.id]);
              if (Number.isFinite(qty) && qty > 0) {
                initial[lot.id] = Math.min(qty, lot.available);
              }
            });
          } catch {
            // ignore corrupted cart
          }
        }

        setQuantities(initial);
      })
      .catch((err: ApiError) => toast.error(err.message));
  }, [slug, toast]);

  useEffect(() => {
    if (!event) return;
    if (!event.accepts_pix && event.accepts_card) {
      setPaymentMethod('card');
    } else if (event.accepts_pix && !event.accepts_card) {
      setPaymentMethod('pix');
    }
  }, [event]);

  useEffect(() => {
    if (!slug || !event) return;
    const hasItems = Object.values(quantities).some((q) => q > 0);
    if (hasItems) {
      sessionStorage.setItem(cartKey(slug), JSON.stringify(quantities));
    } else {
      sessionStorage.removeItem(cartKey(slug));
    }
  }, [slug, event, quantities]);

  function setQty(lotId: number, qty: number) {
    setQuantities((prev) => ({ ...prev, [lotId]: Math.max(0, qty) }));
  }

  const total = event?.lots?.reduce((sum, lot) => sum + lot.price * (quantities[lot.id] ?? 0), 0) ?? 0;
  const totalTickets = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);

  async function createOrder(extra?: { phone?: string; cpf?: string }) {
    if (!event) return;
    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => ({ ticket_lot_id: Number(id), quantity: qty }));

    setFormErrors({});
    setLoading(true);
    try {
      const res = await orderService.create({ event_id: event.id, payment_method: paymentMethod, items, ...extra });
      if (user && extra?.phone && extra?.cpf) {
        setUser({ ...user, phone: extra.phone, cpf: extra.cpf });
      }
      sessionStorage.removeItem(cartKey(event.slug));
      setContactOpen(false);
      toast.success('Pedido criado.');
      navigate(`/meus-pedidos/${res.data.id}`);
    } catch (err) {
      const apiErr = err as ApiError;
      const fieldErrors = apiErr.errors ?? {};
      setFormErrors(fieldErrors);
      const messages = Object.values(fieldErrors).flat();
      const summary = messages.length > 0 ? messages[0] : apiErr.message;
      const hint = messages.length > 1 ? ` (+${messages.length - 1})` : '';
      toast.error(`${summary}${hint}`);
    } finally {
      setLoading(false);
    }
  }

  function handleCheckout() {
    if (!event || totalTickets === 0) {
      toast.error('Selecione ao menos um ingresso.');
      return;
    }
    if (!user) {
      navigate('/cadastro', { state: { from: { pathname: `/eventos/${event.slug}` } } });
      return;
    }
    if (!user.phone || !user.cpf) {
      setContactOpen(true);
      return;
    }
    void createOrder();
  }

  if (!event) {
    return (
      <PublicLayout>
        <p className="text-slate-500">Carregando...</p>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout wide>
      <section className="relative w-full overflow-hidden">
        <div className="relative aspect-[21/9] w-full">
          {event.header_url || event.banner_url ? (
            <img src={event.header_url ?? event.banner_url ?? ''} alt={event.name} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-accent-600" />
          )}
          <div className="absolute inset-0 bg-hero-fade" />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
            <h1 className="max-w-3xl text-3xl font-bold text-white md:text-5xl">{event.name}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="chip border border-white/30 bg-white/15 text-white backdrop-blur">
                <Icons.calendar className="mr-1 h-3 w-3" />
                {formatDateTime(event.starts_at)}
              </span>
              <span className="chip border border-white/30 bg-white/15 text-white backdrop-blur">
                <Icons.mapPin className="mr-1 h-3 w-3" />
                {event.venue_type === 'online' ? 'Online' : event.venue_name ?? '—'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3 md:px-8">
        <div className="md:col-span-2">
          {event.description && (
            <div className="glass-card mb-6 p-6 text-sm leading-relaxed text-slate-700 animate-fade-up">
              {event.description}
            </div>
          )}

          <div className="glass-card p-6 animate-fade-up">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Detalhes</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Detail icon={<Icons.calendar className="h-4 w-4" />} label="Data" value={formatDateTime(event.starts_at)} />
              <Detail
                icon={<Icons.mapPin className="h-4 w-4" />}
                label="Local"
                value={event.venue_type === 'online' ? 'Online' : event.venue_name ?? '—'}
              />
              {event.venue_address && (
                <Detail icon={<Icons.mapPin className="h-4 w-4" />} label="Endereço" value={event.venue_address} />
              )}
              {event.online_url && (
                <Detail icon={<Icons.sparkles className="h-4 w-4" />} label="Acesso" value={event.online_url} />
              )}
            </div>
          </div>
        </div>

        <aside className="md:col-span-1">
          <div className="glass-card sticky top-24 p-6 animate-fade-up">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Ingressos</h3>
            <div className="mt-4 space-y-3">
              {event.lots?.map((lot) => (
                <LotRow key={lot.id} lot={lot} quantity={quantities[lot.id] ?? 0} onChange={(qty) => setQty(lot.id, qty)} />
              ))}
            </div>

            {totalTickets > 0 && (
              <div className="mt-5 border-t border-white/60 pt-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-slate-500">{totalTickets} ingresso(s)</p>
                    <p className="text-2xl font-semibold text-slate-900">{formatBRL(total)}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Forma de pagamento</p>
                  <div className={`grid gap-2 ${event.accepts_pix && event.accepts_card ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {event.accepts_pix && (
                      <PaymentMethodOption
                        active={paymentMethod === 'pix'}
                        label="PIX"
                        hint="Aprovação imediata"
                        onClick={() => setPaymentMethod('pix')}
                      />
                    )}
                    {event.accepts_card && (
                      <PaymentMethodOption
                        active={paymentMethod === 'card'}
                        label="Cartão"
                        hint="Em até 4x*"
                        onClick={() => setPaymentMethod('card')}
                      />
                    )}
                  </div>
                  {paymentMethod === 'card' && event.accepts_card && (
                    <p className="mt-2 text-[10px] text-slate-500">
                      *Parcelamento com juros definidos pela operadora do cartão, aplicados no checkout.
                    </p>
                  )}
                </div>

                <button onClick={handleCheckout} disabled={loading} className="btn btn-primary mt-4 w-full">
                  {loading ? 'Processando...' : 'Comprar ingressos'}
                </button>
                <p className="mt-2 text-center text-[10px] text-slate-400">
                  Taxa calculada no checkout • Pagamento via Abacate Pay
                </p>
              </div>
            )}
          </div>
        </aside>
      </section>

      <ContactModal
        open={contactOpen}
        onClose={() => {
          setContactOpen(false);
          setFormErrors({});
        }}
        onSubmit={(phone, cpf) => createOrder({ phone, cpf })}
        loading={loading}
        errors={formErrors}
      />
    </PublicLayout>
  );
}

function ContactModal({
  open,
  onClose,
  onSubmit,
  loading,
  errors,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (phone: string, cpf: string) => void;
  loading: boolean;
  errors: Record<string, string[]>;
}) {
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');

  useEffect(() => {
    if (!open) {
      setPhone('');
      setCpf('');
    }
  }, [open]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(phone, cpf);
  }

  const phoneError = errors.phone?.[0];
  const cpfError = errors.cpf?.[0];
  const generalErrors = Object.entries(errors)
    .filter(([key]) => key !== 'phone' && key !== 'cpf')
    .flatMap(([, messages]) => messages);

  return (
    <Modal open={open} onClose={onClose} title="Dados para o pagamento">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-600">
          O Abacate Pay exige telefone e CPF para processar o pagamento. Eles ficam salvos no seu perfil para as próximas compras.
        </p>

        {generalErrors.length > 0 && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            <p className="font-medium">Não foi possível concluir a compra:</p>
            <ul className="mt-1 list-disc pl-5 text-xs">
              {generalErrors.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Telefone</span>
          <input
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="(11) 99999-9999"
            autoComplete="tel"
            inputMode="numeric"
            maxLength={15}
            required
            className={`input ${phoneError ? 'border-rose-400 focus:border-rose-500' : ''}`}
            aria-invalid={!!phoneError}
          />
          {phoneError && <p className="mt-1 text-xs text-rose-600">{phoneError}</p>}
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">CPF</span>
          <input
            value={cpf}
            onChange={(e) => setCpf(formatCPF(e.target.value))}
            placeholder="000.000.000-00"
            inputMode="numeric"
            maxLength={14}
            required
            className={`input ${cpfError ? 'border-rose-400 focus:border-rose-500' : ''}`}
            aria-invalid={!!cpfError}
          />
          {cpfError && <p className="mt-1 text-xs text-rose-600">{cpfError}</p>}
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn btn-ghost" disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Processando...' : 'Confirmar e pagar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function PaymentMethodOption({
  active,
  label,
  hint,
  onClick,
}: {
  active: boolean;
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-xl border px-3 py-2 text-left transition ${
        active
          ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200'
          : 'border-slate-200 bg-white/70 hover:border-brand-300'
      }`}
    >
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      <p className="text-[10px] text-slate-500">{hint}</p>
    </button>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
        <span className="text-brand-500">{icon}</span>
        {label}
      </p>
      <p className="mt-1 text-sm text-slate-800">{value}</p>
    </div>
  );
}

function LotRow({ lot, quantity, onChange }: { lot: TicketLot; quantity: number; onChange: (qty: number) => void }) {
  const unavailable = !lot.on_sale;
  return (
    <div
      className={`flex items-center justify-between rounded-xl border p-4 ${
        unavailable ? 'border-white/40 bg-white/30 opacity-60' : 'border-white/60 bg-white/70'
      }`}
    >
      <div>
        <p className="flex items-center gap-2 font-medium text-slate-900">
          {lot.name}
          {lot.is_half_price && <span className="chip bg-amber-100 text-amber-800">meia</span>}
        </p>
        <p className="text-sm font-semibold text-slate-900">{formatBRL(lot.price)}</p>
        <p className="text-[11px] text-slate-500">{lot.available} disponíveis</p>
      </div>
      {unavailable ? (
        <span className="text-xs text-slate-500">Esgotado</span>
      ) : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange(quantity - 1)}
            disabled={quantity <= 0}
            className="h-8 w-8 rounded-full border border-slate-300 bg-white/80 text-lg text-slate-600 transition hover:bg-white disabled:opacity-40"
          >
            −
          </button>
          <span className="w-6 text-center text-sm font-semibold">{quantity}</span>
          <button
            type="button"
            onClick={() => onChange(quantity + 1)}
            disabled={quantity >= lot.available}
            className="h-8 w-8 rounded-full border border-slate-300 bg-white/80 text-lg text-slate-600 transition hover:bg-white disabled:opacity-40"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
