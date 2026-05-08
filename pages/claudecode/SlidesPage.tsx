import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { courseModules } from '@data/courseData';
import { slidesData, type Slide } from '@data/slidesData';

export function SlidesPage() {
  const { id } = useParams<{ id: string }>();
  const moduleId = Number(id);
  const module = useMemo(
    () => courseModules.find((m) => m.id === moduleId),
    [moduleId],
  );
  const slides = module ? slidesData[module.id] ?? [] : [];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        setIndex((i) => Math.min(i + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Home') {
        setIndex(0);
      } else if (e.key === 'End') {
        setIndex(slides.length - 1);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [slides.length]);

  if (!module) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Aula não encontrada.</p>
          <Link to="/claudecode" className="btn btn-secondary mt-4">
            Voltar
          </Link>
        </div>
      </div>
    );
  }

  const current = slides[index];
  const total = slides.length;

  return (
    <div
      className="flex h-screen flex-col"
      style={{ background: `linear-gradient(135deg, ${module.color}11, #0f172a)` }}
    >
      <header className="flex items-center justify-between border-b border-white/10 bg-slate-950/70 px-4 py-2 text-white backdrop-blur md:px-8">
        <div className="flex items-center gap-3">
          <Link to="/claudecode" className="text-sm text-white/70 hover:text-white">
            ← Voltar
          </Link>
          <span className="text-sm font-semibold">
            Aula {String(module.id).padStart(2, '0')} — {module.title}
          </span>
        </div>
        <span className="text-xs text-white/60">
          {index + 1} / {total}
        </span>
      </header>

      <main className="flex flex-1 items-stretch justify-center overflow-hidden px-3 py-3 md:px-6 md:py-4">
        {current && (
          <div key={index} className="flex w-full animate-slide-fade items-stretch justify-center">
            <SlideRenderer slide={current} />
          </div>
        )}
      </main>

      <footer className="flex items-center justify-between border-t border-white/10 bg-slate-950/70 px-4 py-2 text-white backdrop-blur md:px-8">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setIndex((i) => Math.max(i - 1, 0))}
          disabled={index === 0}
        >
          ← Anterior
        </button>
        <div className="flex items-center gap-1">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ir para slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition ${i === index ? 'w-6 bg-white' : 'w-3 bg-white/30 hover:bg-white/50'}`}
            />
          ))}
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setIndex((i) => Math.min(i + 1, total - 1))}
          disabled={index === total - 1}
        >
          Próximo →
        </button>
      </footer>
    </div>
  );
}

function SlideRenderer({ slide }: { slide: Slide }) {
  switch (slide.type) {
    case 'cover':
      return (
        <SlideCard color={slide.color}>
          <p className="text-base font-semibold uppercase tracking-[0.3em] md:text-xl" style={{ color: slide.color }}>
            {slide.aula} · {slide.date}
          </p>
          <h1 className="mt-6 text-5xl font-bold leading-tight text-slate-900 md:text-8xl">{slide.title}</h1>
          <p className="mt-6 text-2xl text-slate-600 md:text-4xl">{slide.subtitle}</p>
          <span aria-hidden className="mt-10 block text-7xl md:text-9xl">
            {slide.icon}
          </span>
        </SlideCard>
      );

    case 'presenter':
      return (
        <SlideCard color={slide.color}>
          <div className="flex flex-col items-center gap-8 md:flex-row md:items-center md:gap-12 md:text-left">
            {slide.photoUrl && (
              <div
                className="relative h-44 w-44 shrink-0 overflow-hidden rounded-3xl shadow-xl md:h-72 md:w-72"
                style={{ boxShadow: `0 20px 50px -20px ${slide.color}aa` }}
              >
                <img src={slide.photoUrl} alt={slide.name} className="h-full w-full object-cover" />
              </div>
            )}
            <div className="flex-1">
              <p className="text-base font-semibold uppercase tracking-[0.3em] md:text-xl" style={{ color: slide.color }}>
                Quem está com vocês
              </p>
              <h2 className="mt-3 text-4xl font-bold text-slate-900 md:text-7xl">{slide.name}</h2>
              <p className="mt-3 text-lg text-slate-600 md:text-2xl">{slide.role}</p>
              <ul className="mt-8 space-y-3 text-left">
                {slide.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-3 text-lg text-slate-700 md:text-2xl">
                    <span className="mt-2 inline-block h-2 w-2 shrink-0 rounded-full md:h-3 md:w-3" style={{ background: slide.color }} />
                    {b}
                  </li>
                ))}
              </ul>
              <p className="mt-8 inline-block rounded-full bg-slate-900 px-6 py-3 text-base text-white md:text-xl">{slide.cta}</p>
            </div>
          </div>
        </SlideCard>
      );

    case 'story':
      return (
        <SlideCard color={slide.color}>
          <h2 className="text-5xl font-bold text-slate-900 md:text-8xl">{slide.title}</h2>
          <p className="mt-8 text-xl italic text-slate-500 md:text-3xl">{slide.hint}</p>
        </SlideCard>
      );

    case 'agenda':
      return (
        <SlideCard color={slide.color}>
          <p className="text-base font-semibold uppercase tracking-[0.3em] md:text-xl" style={{ color: slide.color }}>
            Agenda
          </p>
          <h2 className="mt-3 text-4xl font-bold text-slate-900 md:text-7xl">{slide.title}</h2>
          <ol className="mt-10 space-y-3 text-left">
            {slide.items.map((it, i) => (
              <li key={i} className="rounded-xl bg-slate-50 px-6 py-4 text-lg text-slate-700 md:text-2xl">
                {it}
              </li>
            ))}
          </ol>
        </SlideCard>
      );

    case 'content':
      return (
        <SlideCard color={slide.color}>
          <p className="text-base font-semibold uppercase tracking-[0.3em] md:text-xl" style={{ color: slide.color }}>
            {slide.badge}
          </p>
          <h2 className="mt-3 text-4xl font-bold text-slate-900 md:text-7xl">{slide.title}</h2>
          {slide.subtitle && <p className="mt-3 text-lg text-slate-600 md:text-2xl">{slide.subtitle}</p>}
          <div className="mt-10 grid grid-cols-1 gap-5 text-left md:grid-cols-2">
            {slide.blocks.map((b, i) => {
              const inner = (
                <>
                  <div className="flex items-center gap-4">
                    <span aria-hidden className="text-4xl md:text-5xl">
                      {b.icon}
                    </span>
                    <p className="text-xl font-semibold text-slate-900 md:text-2xl">{b.label}</p>
                    {b.url && (
                      <span aria-hidden className="ml-auto text-base text-slate-400 md:text-lg">
                        ↗
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-base text-slate-600 md:text-xl">{b.text}</p>
                  {b.url && (
                    <p className="mt-2 break-all text-sm font-medium md:text-base" style={{ color: slide.color }}>
                      {b.url}
                    </p>
                  )}
                  {b.commands && (
                    <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 px-4 py-3 text-left font-mono text-xs leading-relaxed text-slate-100 md:text-sm">
                      {b.commands.map((cmd) => `$ ${cmd}`).join('\n')}
                    </pre>
                  )}
                </>
              );
              const baseClass = 'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8';
              return b.url ? (
                <a
                  key={i}
                  href={b.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`${baseClass} block transition hover:-translate-y-0.5 hover:shadow-md`}
                >
                  {inner}
                </a>
              ) : (
                <div key={i} className={baseClass}>
                  {inner}
                </div>
              );
            })}
          </div>
        </SlideCard>
      );

    case 'list':
      return (
        <SlideCard color={slide.color}>
          <p className="text-base font-semibold uppercase tracking-[0.3em] md:text-xl" style={{ color: slide.color }}>
            {slide.badge}
          </p>
          <h2 className="mt-3 text-4xl font-bold text-slate-900 md:text-7xl">{slide.title}</h2>
          {slide.subtitle && <p className="mt-3 text-lg text-slate-600 md:text-2xl">{slide.subtitle}</p>}
          <ul className="mt-10 space-y-4 text-left">
            {slide.items.map((it, i) => (
              <li key={i} className="flex items-start gap-4 text-lg text-slate-700 md:text-2xl">
                <span
                  className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base font-bold text-white md:h-11 md:w-11 md:text-lg"
                  style={{ background: slide.color }}
                >
                  {i + 1}
                </span>
                {it}
              </li>
            ))}
          </ul>
        </SlideCard>
      );

    case 'highlight':
      return (
        <SlideCard color={slide.color}>
          <p className="text-base font-semibold uppercase tracking-[0.3em] md:text-xl" style={{ color: slide.color }}>
            {slide.badge}
          </p>
          <h2 className="mt-3 text-4xl font-bold text-slate-900 md:text-7xl">{slide.title}</h2>
          <blockquote
            className="mt-8 border-l-4 pl-6 text-2xl italic text-slate-700 md:text-4xl"
            style={{ borderColor: slide.color }}
          >
            "{slide.quote}"
          </blockquote>
          <div className="mt-10 grid grid-cols-1 gap-4 text-left md:grid-cols-2">
            {slide.steps.map((s, i) => (
              <div key={i} className="flex items-start gap-4 rounded-xl bg-slate-50 p-5 md:p-6">
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white md:h-14 md:w-14 md:text-2xl"
                  style={{ background: slide.color }}
                >
                  {s.num}
                </span>
                <div>
                  <p className="text-lg font-semibold text-slate-900 md:text-2xl">{s.label}</p>
                  <p className="text-base text-slate-600 md:text-xl">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </SlideCard>
      );

    case 'deliverables':
      return (
        <SlideCard color={slide.color}>
          <span aria-hidden className="text-6xl md:text-8xl">
            {slide.icon}
          </span>
          <h2 className="mt-4 text-4xl font-bold text-slate-900 md:text-7xl">{slide.title}</h2>
          <ul className="mt-10 space-y-4 text-left">
            {slide.items.map((it, i) => (
              <li key={i} className="flex items-start gap-4 text-lg text-slate-700 md:text-2xl">
                <span aria-hidden className="mt-0.5 text-2xl md:text-3xl" style={{ color: slide.color }}>
                  ✓
                </span>
                {it}
              </li>
            ))}
          </ul>
        </SlideCard>
      );

    case 'closing':
      return (
        <SlideCard color={slide.color}>
          <p className="text-base font-semibold uppercase tracking-[0.3em] md:text-xl" style={{ color: slide.color }}>
            {slide.title} · {slide.date}
          </p>
          <h2 className="mt-4 text-4xl font-bold text-slate-900 md:text-8xl">{slide.next}</h2>
          <p className="mt-6 text-xl text-slate-600 md:text-3xl">{slide.nextDesc}</p>
          <span aria-hidden className="mt-10 block text-7xl md:text-9xl">
            {slide.icon}
          </span>
        </SlideCard>
      );

    case 'layers':
      return (
        <SlideCard color={slide.color}>
          <p className="text-base font-semibold uppercase tracking-[0.3em] md:text-xl" style={{ color: slide.color }}>
            {slide.badge}
          </p>
          <h2 className="mt-3 text-4xl font-bold text-slate-900 md:text-7xl">{slide.title}</h2>
          <div className="mt-10 space-y-4 text-left">
            {slide.layers.map((l, i) => (
              <div
                key={i}
                className="flex items-start gap-5 rounded-2xl border-l-4 bg-white p-5 shadow-sm md:p-6"
                style={{ borderColor: l.color }}
              >
                <span aria-hidden className="text-4xl md:text-5xl">
                  {l.icon}
                </span>
                <div>
                  <p className="text-xl font-semibold text-slate-900 md:text-3xl">{l.label}</p>
                  <p className="text-base text-slate-600 md:text-xl">{l.text}</p>
                </div>
              </div>
            ))}
          </div>
        </SlideCard>
      );

    case 'glossary':
      return (
        <SlideCard color={slide.color}>
          <p className="text-base font-semibold uppercase tracking-[0.3em] md:text-xl" style={{ color: slide.color }}>
            {slide.badge}
          </p>
          <h2 className="mt-3 text-4xl font-bold text-slate-900 md:text-7xl">{slide.title}</h2>
          <dl className="mt-10 grid grid-cols-1 gap-4 text-left md:grid-cols-2">
            {slide.terms.map((t, i) => (
              <div key={i} className="rounded-xl bg-slate-50 p-5 md:p-6">
                <dt className="text-xl font-semibold text-slate-900 md:text-2xl">{t.term}</dt>
                <dd className="mt-2 text-base text-slate-600 md:text-xl">{t.def}</dd>
              </div>
            ))}
          </dl>
        </SlideCard>
      );

    case 'final':
      return (
        <SlideCard color={slide.color}>
          <span aria-hidden className="text-8xl md:text-[10rem]">
            {slide.icon}
          </span>
          <h2 className="mt-6 text-5xl font-bold text-slate-900 md:text-8xl">{slide.title}</h2>
          <p className="mt-4 text-xl text-slate-600 md:text-3xl">{slide.subtitle}</p>
          <p className="mt-8 max-w-4xl text-lg text-slate-700 md:text-2xl">{slide.message}</p>
        </SlideCard>
      );
  }
}

function SlideCard({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <article
      className="flex h-full w-full flex-col items-center justify-center overflow-y-auto rounded-3xl bg-white px-8 py-10 text-center shadow-2xl md:px-20 md:py-16"
      style={{ boxShadow: `0 30px 80px -30px ${color}88` }}
    >
      <div className="flex w-full max-w-[1600px] flex-col items-center">{children}</div>
    </article>
  );
}
