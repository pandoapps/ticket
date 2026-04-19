import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '@components/PublicLayout';
import { Empty } from '@components/Empty';
import { useToast } from '@components/Toast';
import { Icons } from '@components/Icon';
import { publicEventService, type EventModel } from '@services/eventService';
import { formatDate, formatDateTime } from '@utils/format';
import type { ApiError } from '@services/api';

export function BrowsePage() {
  const [events, setEvents] = useState<EventModel[]>([]);
  const toast = useToast();

  useEffect(() => {
    publicEventService
      .list()
      .then((r) => setEvents(r.data))
      .catch((err: ApiError) => toast.error(err.message));
  }, [toast]);

  const featured = useMemo(() => {
    const highlights = events.filter((e) => e.is_featured);
    if (highlights.length > 0) return highlights[Math.floor(Math.random() * highlights.length)];
    return events[0];
  }, [events]);

  return (
    <PublicLayout wide>
      {featured && <Hero event={featured} />}

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-600">Próximos eventos</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">Encontre sua próxima experiência</h2>
        </div>

        {events.length === 0 ? (
          <Empty title="Nenhum evento publicado agora." description="Volte em breve, novas experiências chegam toda semana." />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event, idx) => (
              <EventCard key={event.id} event={event} delay={idx * 40} />
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}

function Hero({ event }: { event: EventModel }) {
  const minPrice = event.lots?.reduce((min, lot) => (lot.price < min ? lot.price : min), Infinity);

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative aspect-[16/9] w-full sm:aspect-[21/9] lg:aspect-[32/10]">
        {event.banner_url ? (
          <img src={event.banner_url} alt={event.name} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500 via-brand-700 to-accent-600" />
        )}
        <div className="absolute inset-0 bg-hero-fade" />

        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 md:px-8 md:py-12 lg:py-16">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip border border-white/30 bg-white/15 text-white backdrop-blur">
                <Icons.star className="mr-1 h-3 w-3" /> Destaque
              </span>
              <span className="chip border border-white/30 bg-white/15 text-white backdrop-blur">
                <Icons.calendar className="mr-1 h-3 w-3" />
                {formatDate(event.starts_at)}
              </span>
              {event.venue_name && (
                <span className="chip border border-white/30 bg-white/15 text-white backdrop-blur">
                  <Icons.mapPin className="mr-1 h-3 w-3" />
                  {event.venue_name}
                </span>
              )}
            </div>
            <h1 className="max-w-3xl text-3xl font-bold leading-tight text-white drop-shadow-lg sm:text-4xl md:text-5xl lg:text-6xl">
              {event.name}
            </h1>
            {event.description && (
              <p className="max-w-2xl text-sm text-white/85 md:text-base">{event.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to={`/eventos/${event.slug}`} className="btn btn-primary shadow-xl shadow-black/30">
                Ver detalhes e comprar
              </Link>
              {minPrice !== undefined && Number.isFinite(minPrice) && (
                <p className="text-sm text-white/85">
                  A partir de{' '}
                  <span className="font-semibold text-white">R$ {minPrice.toFixed(2).replace('.', ',')}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EventCard({ event, delay }: { event: EventModel; delay: number }) {
  const minPrice = event.lots?.reduce((min, lot) => (lot.price < min ? lot.price : min), Infinity);

  return (
    <Link
      to={`/eventos/${event.slug}`}
      style={{ animationDelay: `${delay}ms` }}
      className="group overflow-hidden rounded-2xl border border-white/50 bg-white/60 shadow-glass backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-glass-lg animate-fade-up"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        {event.banner_url ? (
          <img
            src={event.banner_url}
            alt={event.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-brand-500 to-accent-600" />
        )}
        {event.is_featured && (
          <span className="chip absolute left-3 top-3 bg-gradient-to-r from-brand-600 to-accent-600 text-white shadow-lg">
            <Icons.star className="mr-1 h-3 w-3" /> Destaque
          </span>
        )}
      </div>
      <div className="p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600">
          {formatDateTime(event.starts_at)}
        </p>
        <h3 className="mt-1 line-clamp-2 text-lg font-semibold text-slate-900 group-hover:text-brand-700">
          {event.name}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          <Icons.mapPin className="h-3 w-3" />
          {event.venue_type === 'online' ? 'Online' : event.venue_name ?? '—'}
        </p>
        {minPrice !== undefined && Number.isFinite(minPrice) && (
          <p className="mt-3 text-sm text-slate-600">
            A partir de <span className="font-semibold text-slate-900">R$ {minPrice.toFixed(2).replace('.', ',')}</span>
          </p>
        )}
      </div>
    </Link>
  );
}
