import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { courseModules } from '@data/courseData';
import {
  slidesData,
  type FormStudySlide,
  type GameSlide,
  type ImageSlide,
  type PartsSlide,
  type PromptBuilderSlide,
  type Slide,
  type StorySlide,
  type WordCloudSlide,
} from '@data/slidesData';

export function SlidesPage() {
  const { id } = useParams<{ id: string }>();
  const moduleId = Number(id);
  const module = useMemo(
    () => courseModules.find((m) => m.id === moduleId),
    [moduleId],
  );
  const slides = useMemo(
    () => (module ? slidesData[module.id] ?? [] : []),
    [module],
  );

  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [gamePhase, setGamePhase] = useState<GamePhase>('setup');

  useEffect(() => {
    setStep(0);
    setGamePhase('setup');
  }, [index]);

  useEffect(() => {
    const cur = slides[index];
    const partsTotal = cur?.type === 'parts' ? cur.items.length : 0;

    function advance() {
      if (cur?.type === 'parts' && step < partsTotal - 1) {
        setStep((s) => s + 1);
      } else {
        setIndex((i) => Math.min(i + 1, slides.length - 1));
      }
    }
    function retreat() {
      if (cur?.type === 'parts' && step > 0) {
        setStep((s) => s - 1);
      } else {
        setIndex((i) => Math.max(i - 1, 0));
      }
    }

    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) {
        return;
      }
      if (cur?.type === 'game' && gamePhase !== 'setup') return;
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        advance();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        retreat();
      } else if (e.key === 'Home') {
        setIndex(0);
      } else if (e.key === 'End') {
        setIndex(slides.length - 1);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [slides, index, step, gamePhase]);

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
  const partsTotal = current?.type === 'parts' ? current.items.length : 0;
  const navLocked = current?.type === 'game' && gamePhase !== 'setup';
  const canRetreat = !navLocked && (step > 0 || index > 0);
  const canAdvance =
    !navLocked && ((current?.type === 'parts' && step < partsTotal - 1) || index < total - 1);

  function advance() {
    if (current?.type === 'parts' && step < partsTotal - 1) {
      setStep((s) => s + 1);
    } else {
      setIndex((i) => Math.min(i + 1, total - 1));
    }
  }
  function retreat() {
    if (current?.type === 'parts' && step > 0) {
      setStep((s) => s - 1);
    } else {
      setIndex((i) => Math.max(i - 1, 0));
    }
  }

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
            <SlideRenderer slide={current} step={step} onGamePhaseChange={setGamePhase} />
          </div>
        )}
      </main>

      <footer className="flex items-center justify-between border-t border-white/10 bg-slate-950/70 px-4 py-2 text-white backdrop-blur md:px-8">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={retreat}
          disabled={!canRetreat}
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
          onClick={advance}
          disabled={!canAdvance}
        >
          Próximo →
        </button>
      </footer>
    </div>
  );
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return (
        <strong key={i} className="font-bold">
          {p.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{p}</span>;
  });
}

function SlideRenderer({
  slide,
  step,
  onGamePhaseChange,
}: {
  slide: Slide;
  step: number;
  onGamePhaseChange?: (phase: GamePhase) => void;
}) {
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
          {slide.qrUrl && (
            <div className="absolute bottom-6 right-6 flex flex-col items-center gap-1 md:bottom-10 md:right-10">
              <img
                src={slide.qrUrl}
                alt="QR code"
                className="h-48 w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-md md:h-72 md:w-72"
              />
              {slide.qrCaption && (
                <span className="text-xs font-semibold text-slate-500 md:text-sm">{slide.qrCaption}</span>
              )}
            </div>
          )}
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
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                {slide.socials.map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block rounded-full bg-slate-900 px-6 py-3 text-base text-white transition hover:-translate-y-0.5 hover:bg-slate-800 md:text-xl"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </SlideCard>
      );

    case 'story':
      return <StorySlideView slide={slide} />;

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
              <li key={i} className="flex items-center gap-4 text-lg text-slate-700 md:text-2xl">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base font-bold text-white md:h-11 md:w-11 md:text-lg"
                  style={{ background: slide.color }}
                >
                  {i + 1}
                </span>
                <span className="flex flex-1 items-center gap-3">
                  {typeof it !== 'string' && it.url && (
                    <span aria-hidden className="text-xl md:text-2xl">🔗</span>
                  )}
                  {typeof it !== 'string' && it.url ? (
                    <a
                      href={it.url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline-offset-4 hover:underline"
                      style={{ color: slide.color }}
                    >
                      {renderInline(it.text)}
                    </a>
                  ) : (
                    renderInline(typeof it === 'string' ? it : it.text)
                  )}
                </span>
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

    case 'parts':
      return <PartsSlideView slide={slide} step={step} />;

    case 'game':
      return <GameSlideView slide={slide} onPhaseChange={onGamePhaseChange} />;

    case 'image':
      return <ImageSlideView slide={slide} />;

    case 'formStudy':
      return <FormStudySlideView slide={slide} />;

    case 'promptBuilder':
      return <PromptBuilderSlideView slide={slide} />;

    case 'wordCloud':
      return <WordCloudSlideView slide={slide} />;

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

type WanderPos = { x: number; y: number; rot: number };

function initialWanderPositions(count: number): WanderPos[] {
  return Array.from({ length: count }, (_, i) => {
    const half = (count - 1) / 2;
    return { x: (i - half) * 22, y: 0, rot: 0 };
  });
}

function randomWanderPositions(count: number): WanderPos[] {
  return Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * 50,
    y: -Math.random() * 28,
    rot: (Math.random() - 0.5) * 14,
  }));
}

const wordSizeClasses: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
  sm: 'text-base md:text-lg font-medium text-slate-500',
  md: 'text-xl md:text-2xl font-semibold text-slate-700',
  lg: 'text-3xl md:text-5xl font-bold text-slate-900',
  xl: 'text-4xl md:text-7xl font-extrabold',
};

function WordCloudSlideView({ slide }: { slide: WordCloudSlide }) {
  return (
    <SlideCard color={slide.color}>
      {slide.badge && (
        <p className="text-base font-semibold uppercase tracking-[0.3em] md:text-xl" style={{ color: slide.color }}>
          {slide.badge}
        </p>
      )}
      {slide.title && (
        <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-5xl">{slide.title}</h2>
      )}
      {slide.subtitle && (
        <p className="mt-2 text-base text-slate-600 md:text-2xl">{slide.subtitle}</p>
      )}
      <div className="mt-10 flex w-full max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-5 leading-tight">
        {slide.words.map((w, i) => {
          const text = typeof w === 'string' ? w : w.text;
          const size = (typeof w === 'string' ? 'md' : w.size) ?? 'md';
          const isXL = size === 'xl';
          return (
            <span
              key={i}
              className={wordSizeClasses[size]}
              style={isXL ? { color: slide.color } : undefined}
            >
              {text}
            </span>
          );
        })}
      </div>
    </SlideCard>
  );
}

function PromptBuilderSlideView({ slide }: { slide: PromptBuilderSlide }) {
  const storageKey = `pb-${slide.title}|${slide.subtitle ?? ''}`;
  const [values, setValues] = useState<Record<string, string>>(() => {
    try {
      const raw = sessionStorage.getItem(`${storageKey}:values`);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const [generated, setGenerated] = useState<string>(() => {
    try {
      return sessionStorage.getItem(`${storageKey}:generated`) ?? '';
    } catch {
      return '';
    }
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      sessionStorage.setItem(`${storageKey}:values`, JSON.stringify(values));
    } catch {
      /* storage unavailable */
    }
  }, [storageKey, values]);

  useEffect(() => {
    try {
      sessionStorage.setItem(`${storageKey}:generated`, generated);
    } catch {
      /* storage unavailable */
    }
  }, [storageKey, generated]);

  function generate() {
    let prompt = slide.promptTemplate;
    for (const input of slide.inputs) {
      const value = values[input.id] ?? '';
      prompt = prompt.split(`{${input.id}}`).join(value);
    }
    setGenerated(prompt);
    setCopied(false);
  }

  async function copyToClipboard() {
    if (!generated) return;
    try {
      await navigator.clipboard.writeText(generated);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  const fieldClass =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-transparent focus:ring-2 md:text-base';
  const ringStyle = { ['--tw-ring-color' as never]: slide.color };

  return (
    <SlideCard color={slide.color}>
      {slide.badge && (
        <p className="text-base font-semibold uppercase tracking-[0.3em] md:text-xl" style={{ color: slide.color }}>
          {slide.badge}
        </p>
      )}
      <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-5xl">{slide.title}</h2>
      {slide.subtitle && <p className="mt-2 text-base text-slate-600 md:text-2xl">{slide.subtitle}</p>}

      <div className="mt-6 flex w-full flex-col items-stretch gap-4 text-left md:flex-row md:gap-5">
        <div className="flex w-full flex-col gap-3 md:w-[36%]">
          {slide.inputs.map((input) => {
            const id = `pb-${input.id}`;
            return (
              <div key={input.id} className="flex flex-col gap-1">
                <label htmlFor={id} className="text-sm font-semibold text-slate-800 md:text-base">
                  {input.label}
                </label>
                {input.multiline ? (
                  <textarea
                    id={id}
                    rows={input.rows ?? 2}
                    value={values[input.id] ?? ''}
                    onChange={(e) => setValues((v) => ({ ...v, [input.id]: e.target.value }))}
                    className={`${fieldClass} resize-none`}
                    style={ringStyle}
                  />
                ) : (
                  <input
                    id={id}
                    type="text"
                    value={values[input.id] ?? ''}
                    onChange={(e) => setValues((v) => ({ ...v, [input.id]: e.target.value }))}
                    className={fieldClass}
                    style={ringStyle}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center md:w-[14%]">
          <button
            type="button"
            onClick={generate}
            className="w-full rounded-2xl px-4 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition hover:-translate-y-0.5 md:py-6 md:text-base"
            style={{ background: slide.color }}
          >
            {slide.buttonLabel}
          </button>
        </div>

        <div className="flex w-full flex-1 flex-col gap-2 md:w-[50%]">
          <div className="flex items-center justify-between">
            <label htmlFor="pb-output" className="text-sm font-semibold text-slate-800 md:text-base">
              Prompt gerado
            </label>
            <button
              type="button"
              onClick={copyToClipboard}
              disabled={!generated}
              className="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 md:text-sm"
            >
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
          <textarea
            id="pb-output"
            value={generated}
            readOnly
            placeholder="Preencha os campos e clique em Gerar prompt"
            className="min-h-[18rem] w-full flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:ring-2 md:text-sm"
            style={ringStyle}
          />
        </div>
      </div>

      {slide.nextStep && (
        <p className="mt-5 text-sm text-slate-600 md:text-base">
          {slide.nextStep.text}
          {slide.nextStep.linkUrl && (
            <>
              {' '}
              <a
                href={slide.nextStep.linkUrl}
                target="_blank"
                rel="noreferrer"
                className="font-semibold underline-offset-4 hover:underline"
                style={{ color: slide.color }}
              >
                {slide.nextStep.linkLabel ?? slide.nextStep.linkUrl}
              </a>
            </>
          )}
        </p>
      )}
    </SlideCard>
  );
}

function FormStudySlideView({ slide }: { slide: FormStudySlide }) {
  const storageKey = `fs-${slide.title}|${slide.subtitle ?? ''}|${slide.imageUrl}`;
  const [values, setValues] = useState<Record<number, string>>(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(values));
    } catch {
      /* storage unavailable */
    }
  }, [storageKey, values]);

  return (
    <SlideCard color={slide.color}>
      {slide.badge && (
        <p className="text-base font-semibold uppercase tracking-[0.3em] md:text-xl" style={{ color: slide.color }}>
          {slide.badge}
        </p>
      )}
      <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-6xl">{slide.title}</h2>
      {slide.subtitle && <p className="mt-2 text-base text-slate-600 md:text-2xl">{slide.subtitle}</p>}
      <div className="mt-8 flex w-full flex-col gap-8 text-left md:flex-row md:items-stretch md:gap-12">
        <div className="flex w-full shrink-0 items-center justify-center md:w-[42%]">
          <img
            src={slide.imageUrl}
            alt={slide.imageAlt ?? ''}
            className="max-h-[60vh] w-full rounded-2xl object-cover shadow-lg"
          />
        </div>
        <div className="flex w-full flex-1 flex-col gap-5">
          {slide.questions.map((q, i) => {
            const id = `formstudy-q-${i}`;
            const label = typeof q === 'string' ? q : q.label;
            const multiline = typeof q === 'string' ? true : q.multiline !== false;
            const inputClass =
              'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-transparent focus:ring-2 md:text-lg';
            return (
              <div key={i} className="flex flex-col gap-2">
                <label htmlFor={id} className="text-base font-semibold text-slate-800 md:text-xl">
                  {label}
                </label>
                {multiline ? (
                  <textarea
                    id={id}
                    rows={2}
                    value={values[i] ?? ''}
                    onChange={(e) => setValues((v) => ({ ...v, [i]: e.target.value }))}
                    className={`${inputClass} resize-none`}
                    style={{ ['--tw-ring-color' as never]: slide.color }}
                  />
                ) : (
                  <input
                    id={id}
                    type="text"
                    value={values[i] ?? ''}
                    onChange={(e) => setValues((v) => ({ ...v, [i]: e.target.value }))}
                    className={inputClass}
                    style={{ ['--tw-ring-color' as never]: slide.color }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </SlideCard>
  );
}

function ImageSlideView({ slide }: { slide: ImageSlide }) {
  return (
    <SlideCard color={slide.color}>
      {slide.badge && (
        <p className="text-base font-semibold uppercase tracking-[0.3em] md:text-xl" style={{ color: slide.color }}>
          {slide.badge}
        </p>
      )}
      <h2 className="mt-3 text-4xl font-bold text-slate-900 md:text-7xl">{slide.title}</h2>
      {slide.subtitle && <p className="mt-3 text-lg text-slate-600 md:text-2xl">{slide.subtitle}</p>}
      <div className="mt-8 flex w-full flex-1 items-center justify-center">
        <img
          src={slide.imageUrl}
          alt={slide.imageAlt ?? ''}
          className="w-full max-w-5xl rounded-2xl object-contain shadow-lg"
          style={{ maxHeight: slide.imageMaxHeight ?? '60vh' }}
        />
      </div>
      {slide.caption && (
        <p className="mt-4 text-sm text-slate-500 md:text-base">{slide.caption}</p>
      )}
    </SlideCard>
  );
}

type GamePhase = 'setup' | 'playing' | 'gameover';
type Difficulty = 'easy' | 'hard';

interface GameRefState {
  ball: { x: number; y: number; vx: number; vy: number };
  player: { x: number; y: number };
  ai: { y: number };
  keys: { up: boolean; down: boolean; left: boolean; right: boolean };
  speedMultiplier: number;
  paddleHeightPct: number;
  timeSinceStart: number;
  lastDifficultyTick: number;
}

function GameSlideView({
  slide,
  onPhaseChange,
}: {
  slide: GameSlide;
  onPhaseChange?: (phase: GamePhase) => void;
}) {
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [characterId, setCharacterId] = useState<string>(slide.characters[0].id);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [scores, setScores] = useState({ player: 0, ai: 0 });
  const [paddleHeight, setPaddleHeight] = useState(22);
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);

  const ballRef = useRef<HTMLDivElement>(null);
  const playerPaddleRef = useRef<HTMLDivElement>(null);
  const aiPaddleRef = useRef<HTMLDivElement>(null);

  const gameStateRef = useRef<GameRefState>({
    ball: { x: 50, y: 50, vx: 1, vy: 0 },
    player: { x: 5, y: 50 },
    ai: { y: 50 },
    keys: { up: false, down: false, left: false, right: false },
    speedMultiplier: 1,
    paddleHeightPct: 22,
    timeSinceStart: 0,
    lastDifficultyTick: 0,
  });

  useEffect(() => {
    onPhaseChange?.(phase);
  }, [phase, onPhaseChange]);

  useEffect(() => {
    if (!slide.backgroundAudio) return;
    const audio = new Audio(slide.backgroundAudio);
    audio.loop = true;
    audio.volume = 0.6;
    audio.play().catch(() => {});
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [slide.backgroundAudio]);

  useEffect(() => {
    function down(e: KeyboardEvent) {
      const k = e.key;
      if (k === 'ArrowUp' || k === 'w' || k === 'W') {
        gameStateRef.current.keys.up = true;
        e.preventDefault();
      } else if (k === 'ArrowDown' || k === 's' || k === 'S') {
        gameStateRef.current.keys.down = true;
        e.preventDefault();
      } else if (k === 'ArrowLeft' || k === 'a' || k === 'A') {
        gameStateRef.current.keys.left = true;
        e.preventDefault();
      } else if (k === 'ArrowRight' || k === 'd' || k === 'D') {
        gameStateRef.current.keys.right = true;
        e.preventDefault();
      } else if (k === 'Enter') {
        setPhase('setup');
        e.preventDefault();
      }
    }
    function up(e: KeyboardEvent) {
      const k = e.key;
      if (k === 'ArrowUp' || k === 'w' || k === 'W') {
        gameStateRef.current.keys.up = false;
      } else if (k === 'ArrowDown' || k === 's' || k === 'S') {
        gameStateRef.current.keys.down = false;
      } else if (k === 'ArrowLeft' || k === 'a' || k === 'A') {
        gameStateRef.current.keys.left = false;
      } else if (k === 'ArrowRight' || k === 'd' || k === 'D') {
        gameStateRef.current.keys.right = false;
      }
    }
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'playing') return;
    let animId = 0;
    let lastTs = performance.now();

    function frame(ts: number) {
      const dt = Math.min((ts - lastTs) / 1000, 0.05);
      lastTs = ts;
      const s = gameStateRef.current;
      s.timeSinceStart += dt;

      const playerSpeed = 95;
      if (s.keys.up) s.player.y -= playerSpeed * dt;
      if (s.keys.down) s.player.y += playerSpeed * dt;
      if (s.keys.left) s.player.x -= playerSpeed * dt;
      if (s.keys.right) s.player.x += playerSpeed * dt;
      const halfPaddle = s.paddleHeightPct / 2;
      const halfWidth = 4;
      s.player.y = Math.max(halfPaddle, Math.min(100 - halfPaddle, s.player.y));
      s.player.x = Math.max(halfWidth, Math.min(50, s.player.x));

      const aiSpeed = difficulty === 'easy' ? 22 : 95;
      const aiHalf = 10;
      const aiTarget = s.ball.y + (difficulty === 'easy' ? (Math.random() - 0.5) * 10 : 0);
      const aiDiff = aiTarget - s.ai.y;
      const aiMax = aiSpeed * dt;
      if (Math.abs(aiDiff) <= aiMax) s.ai.y = aiTarget;
      else s.ai.y += Math.sign(aiDiff) * aiMax;
      s.ai.y = Math.max(aiHalf, Math.min(100 - aiHalf, s.ai.y));

      const baseSpeed = difficulty === 'easy' ? 38 : 55;
      const speed = baseSpeed * s.speedMultiplier;
      s.ball.x += s.ball.vx * speed * dt;
      s.ball.y += s.ball.vy * speed * dt;

      if (s.ball.y < 1.5) { s.ball.y = 1.5; s.ball.vy = Math.abs(s.ball.vy); }
      if (s.ball.y > 98.5) { s.ball.y = 98.5; s.ball.vy = -Math.abs(s.ball.vy); }

      const playerX = s.player.x;
      const aiX = 95;

      if (s.ball.vx < 0 && s.ball.x <= playerX + 1.5 && s.ball.x >= playerX - 2) {
        if (Math.abs(s.ball.y - s.player.y) <= halfPaddle + 1) {
          s.ball.vx = Math.abs(s.ball.vx);
          const offset = (s.ball.y - s.player.y) / halfPaddle;
          s.ball.vy = offset * 0.85;
          const mag = Math.hypot(s.ball.vx, s.ball.vy);
          s.ball.vx /= mag; s.ball.vy /= mag;
          s.ball.x = playerX + 1.6;
          s.speedMultiplier = Math.min(s.speedMultiplier * 1.1, 4);
        }
      }
      if (s.ball.vx > 0 && s.ball.x >= aiX - 1.5 && s.ball.x <= aiX + 2) {
        if (Math.abs(s.ball.y - s.ai.y) <= aiHalf + 1) {
          s.ball.vx = -Math.abs(s.ball.vx);
          const offset = (s.ball.y - s.ai.y) / aiHalf;
          s.ball.vy = offset * 0.85;
          const mag = Math.hypot(s.ball.vx, s.ball.vy);
          s.ball.vx /= mag; s.ball.vy /= mag;
          s.ball.x = aiX - 1.6;
        }
      }

      if (s.ball.x < -2) {
        setScores((scr) => ({ ...scr, ai: scr.ai + 1 }));
        resetBall(s, 1);
      } else if (s.ball.x > 102) {
        setScores((scr) => ({ ...scr, player: scr.player + 1 }));
        resetBall(s, -1);
      }

      const tickInterval = difficulty === 'hard' ? 3 : 5;
      if (s.timeSinceStart - s.lastDifficultyTick > tickInterval) {
        s.lastDifficultyTick = s.timeSinceStart;
        if (difficulty === 'hard') {
          s.speedMultiplier = Math.min(s.speedMultiplier * 1.18, 4);
          s.paddleHeightPct = Math.max(5, s.paddleHeightPct * 0.9);
          setPaddleHeight(s.paddleHeightPct);
        } else {
          s.speedMultiplier = Math.min(s.speedMultiplier * 1.1, 2.5);
        }
      }

      if (ballRef.current) {
        ballRef.current.style.left = `${s.ball.x}%`;
        ballRef.current.style.top = `${s.ball.y}%`;
      }
      if (playerPaddleRef.current) {
        playerPaddleRef.current.style.left = `${s.player.x}%`;
        playerPaddleRef.current.style.top = `${s.player.y}%`;
      }
      if (aiPaddleRef.current) aiPaddleRef.current.style.top = `${s.ai.y}%`;

      animId = requestAnimationFrame(frame);
    }

    animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, [phase, difficulty]);

  useEffect(() => {
    if (phase !== 'playing') return;
    if (scores.player >= slide.winScore) {
      setWinner('player');
      setPhase('gameover');
    } else if (scores.ai >= slide.winScore) {
      setWinner('ai');
      setPhase('gameover');
    }
  }, [scores, phase, slide.winScore]);

  function resetBall(s: GameRefState, direction: number) {
    s.ball.x = 50;
    s.ball.y = 50;
    const angle = (Math.random() - 0.5) * 0.7;
    s.ball.vx = direction;
    s.ball.vy = angle;
    const mag = Math.hypot(s.ball.vx, s.ball.vy);
    s.ball.vx /= mag;
    s.ball.vy /= mag;
  }

  function startGame() {
    const initialPaddle = difficulty === 'easy' ? 26 : 22;
    setScores({ player: 0, ai: 0 });
    setWinner(null);
    setPaddleHeight(initialPaddle);
    gameStateRef.current = {
      ball: { x: 50, y: 50, vx: Math.random() > 0.5 ? 1 : -1, vy: (Math.random() - 0.5) * 0.6 },
      player: { x: 5, y: 50 },
      ai: { y: 50 },
      keys: { up: false, down: false, left: false, right: false },
      speedMultiplier: 1,
      paddleHeightPct: initialPaddle,
      timeSinceStart: 0,
      lastDifficultyTick: 0,
    };
    const s = gameStateRef.current;
    const mag = Math.hypot(s.ball.vx, s.ball.vy);
    s.ball.vx /= mag;
    s.ball.vy /= mag;
    setPhase('playing');
  }

  const playerCharacter = slide.characters.find((c) => c.id === characterId) ?? slide.characters[0];
  const aiCharacter = slide.characters.find((c) => c.id !== characterId) ?? slide.characters[1];

  return (
    <SlideCard color={slide.color}>
      <div className="flex w-full flex-col items-center">
        <h2 className="text-3xl font-bold text-slate-900 md:text-5xl">{slide.title}</h2>
        {slide.subtitle && phase === 'setup' && (
          <p className="mt-2 text-base text-slate-600 md:text-xl">{slide.subtitle}</p>
        )}

        {phase === 'setup' && (
          <div className="mt-6 flex w-full max-w-3xl flex-col gap-6 text-left">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500 md:text-base">
                Personagem
              </p>
              <div className="mt-3 grid grid-cols-2 gap-4">
                {slide.characters.map((c) => {
                  const selected = c.id === characterId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCharacterId(c.id)}
                      className="flex flex-col items-center gap-2 rounded-2xl border-2 bg-white p-4 transition hover:-translate-y-0.5 md:p-6"
                      style={{
                        borderColor: selected ? slide.color : '#e2e8f0',
                        boxShadow: selected ? `0 10px 30px -10px ${slide.color}66` : 'none',
                      }}
                    >
                      <img src={c.imageUrl} alt={c.label} className="h-24 w-24 object-contain md:h-32 md:w-32" />
                      <span className="text-lg font-semibold text-slate-900 md:text-2xl">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500 md:text-base">
                Dificuldade
              </p>
              <div className="mt-3 grid grid-cols-2 gap-4">
                {(['easy', 'hard'] as Difficulty[]).map((d) => {
                  const selected = d === difficulty;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className="rounded-2xl border-2 bg-white px-6 py-4 text-lg font-semibold transition hover:-translate-y-0.5 md:text-2xl"
                      style={{
                        borderColor: selected ? slide.color : '#e2e8f0',
                        color: selected ? slide.color : '#0f172a',
                        boxShadow: selected ? `0 10px 30px -10px ${slide.color}66` : 'none',
                      }}
                    >
                      {d === 'easy' ? 'Fácil' : 'Super Hard'}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={startGame}
              className="mt-2 rounded-full px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:-translate-y-0.5 md:text-2xl"
              style={{ background: slide.color }}
            >
              Começar partida
            </button>
            <p className="text-center text-xs text-slate-500 md:text-sm">
              Use ↑↓←→ ou WASD para mover seu personagem
            </p>
          </div>
        )}

        {(phase === 'playing' || phase === 'gameover') && (
          <>
            <div className="mt-3 flex items-center gap-6 text-2xl font-bold text-slate-900 md:text-4xl">
              <span className="flex items-center gap-2">
                <img src={playerCharacter.imageUrl} alt="" className="h-8 w-8 object-contain md:h-12 md:w-12" />
                {scores.player}
              </span>
              <span className="text-slate-400">×</span>
              <span className="flex items-center gap-2">
                {scores.ai}
                <img src={aiCharacter.imageUrl} alt="" className="h-8 w-8 object-contain md:h-12 md:w-12" />
              </span>
            </div>

            <div className="relative mt-4 w-full max-w-5xl overflow-hidden rounded-3xl border-4 border-emerald-700 bg-gradient-to-b from-emerald-500 to-emerald-700 shadow-2xl" style={{ aspectRatio: '16 / 9' }}>
              <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-white/40" />
              <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/40 md:h-32 md:w-32" />

              <div
                ref={playerPaddleRef}
                className="absolute"
                style={{
                  left: '5%',
                  top: '50%',
                  height: `${paddleHeight}%`,
                  width: '8%',
                  transform: 'translate(-50%, -50%)',
                  transition: 'height 400ms ease-out',
                }}
              >
                <img src={playerCharacter.imageUrl} alt="" className="h-full w-full object-contain drop-shadow-lg" />
              </div>

              <div
                ref={aiPaddleRef}
                className="absolute"
                style={{
                  left: '95%',
                  top: '50%',
                  height: '20%',
                  width: '8%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <img
                  src={aiCharacter.imageUrl}
                  alt=""
                  className="h-full w-full object-contain drop-shadow-lg"
                  style={{ transform: 'scaleX(-1)' }}
                />
              </div>

              <div
                ref={ballRef}
                className="absolute h-5 w-5 rounded-full bg-white shadow-lg md:h-7 md:w-7"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'radial-gradient(circle at 30% 30%, #fff, #d97757 60%, #7c2d12)',
                }}
              />

              {phase === 'gameover' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                  <p className="text-4xl font-bold text-white md:text-6xl">
                    {winner === 'player' ? 'Você venceu! 🏆' : 'Você perdeu! 💀'}
                  </p>
                  <p className="mt-2 text-lg text-white/80 md:text-2xl">
                    Placar final: {scores.player} × {scores.ai}
                  </p>
                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={startGame}
                      className="rounded-full bg-white px-6 py-3 text-base font-bold text-slate-900 transition hover:-translate-y-0.5 md:text-xl"
                    >
                      Jogar novamente
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhase('setup')}
                      className="rounded-full border-2 border-white px-6 py-3 text-base font-bold text-white transition hover:-translate-y-0.5 md:text-xl"
                    >
                      Trocar configuração
                    </button>
                  </div>
                </div>
              )}
            </div>

            {phase === 'playing' && (
              <p className="mt-2 text-xs text-slate-500 md:text-sm">↑↓←→ ou WASD para mover</p>
            )}
          </>
        )}
      </div>
    </SlideCard>
  );
}

function PartsSlideView({ slide, step }: { slide: PartsSlide; step: number }) {
  return (
    <SlideCard color={slide.color}>
      <div className="flex w-full flex-col gap-8 text-left md:flex-row md:items-stretch md:gap-12">
        <div className="flex w-full shrink-0 flex-col md:w-[38%]">
          {slide.badge && (
            <p
              className="text-base font-semibold uppercase tracking-[0.3em] md:text-xl"
              style={{ color: slide.color }}
            >
              {slide.badge}
            </p>
          )}
          <h2 className="mt-2 text-4xl font-bold text-slate-900 md:text-6xl">{slide.title}</h2>
          <ul className="mt-8 space-y-4">
            {slide.items.map((item, i) => {
              const visible = i <= step;
              const active = i === step;
              return (
                <li
                  key={i}
                  className="flex items-start gap-4 transition-all duration-500"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateX(0)' : 'translateX(-16px)',
                  }}
                >
                  <span
                    aria-hidden
                    className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl transition-all md:h-12 md:w-12 md:text-2xl"
                    style={{
                      background: active ? slide.color : '#e2e8f0',
                      color: active ? '#fff' : '#475569',
                    }}
                  >
                    {item.icon}
                  </span>
                  <div className="flex-1">
                    <p
                      className="text-2xl font-semibold transition-colors md:text-3xl"
                      style={{ color: active ? slide.color : '#0f172a' }}
                    >
                      {item.label}
                    </p>
                    {item.description && (
                      <p className="mt-1 text-base text-slate-600 md:text-lg">{item.description}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-8 text-sm text-slate-400 md:text-base">
            {step + 1} de {slide.items.length}
          </p>
        </div>

        <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 min-h-[18rem] md:min-h-[32rem]">
          {slide.items.map((item, i) => {
            const isActive = i === step;
            return (
              <div
                key={i}
                className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
                style={{ opacity: isActive ? 1 : 0 }}
                aria-hidden={!isActive}
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.label}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-[10rem] md:text-[14rem]">{item.icon}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </SlideCard>
  );
}

function StorySlideView({ slide }: { slide: StorySlide }) {
  const imageCount = slide.delayedImages?.length ?? 0;
  const [showImages, setShowImages] = useState(false);
  const [positions, setPositions] = useState<WanderPos[]>(() => initialWanderPositions(imageCount));
  const delay = slide.delayedImagesMs ?? 5000;

  useEffect(() => {
    setShowImages(false);
    setPositions(initialWanderPositions(imageCount));

    const hasImages = imageCount > 0;
    const hasAudio = !!slide.delayedAudio;
    if (!hasImages && !hasAudio) return;

    const audio = slide.delayedAudio ? new Audio(slide.delayedAudio) : null;
    if (audio) audio.loop = true;

    const showT = window.setTimeout(() => {
      if (hasImages) setShowImages(true);
      if (audio) audio.play().catch(() => {});
    }, delay);

    let wanderInterval: number | undefined;
    const wanderStart = window.setTimeout(() => {
      if (!hasImages) return;
      setPositions(randomWanderPositions(imageCount));
      wanderInterval = window.setInterval(() => {
        setPositions(randomWanderPositions(imageCount));
      }, 3000);
    }, delay + 1000);

    return () => {
      window.clearTimeout(showT);
      window.clearTimeout(wanderStart);
      if (wanderInterval) window.clearInterval(wanderInterval);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [slide, delay, imageCount]);

  return (
    <SlideCard color={slide.color}>
      <h2 className="text-5xl font-bold text-slate-900 md:text-8xl">{slide.title}</h2>
      <p className="mt-8 text-xl italic text-slate-500 md:text-3xl">{slide.hint}</p>
      {slide.delayedImages && slide.delayedImages.length > 0 && (
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-700 ${showImages ? 'opacity-100' : 'opacity-0'}`}
        >
          {slide.delayedImages.map((url, i) => {
            const pos = positions[i] ?? { x: 0, y: 0, rot: 0 };
            return (
              <img
                key={i}
                src={url}
                alt=""
                className="absolute bottom-8 left-1/2 h-44 object-contain drop-shadow-xl md:bottom-12 md:h-80"
                style={{
                  transform: `translate(calc(-50% + ${pos.x}vw), ${pos.y}vh) rotate(${pos.rot}deg)`,
                  transition: 'transform 2800ms ease-in-out',
                }}
              />
            );
          })}
        </div>
      )}
    </SlideCard>
  );
}

function SlideCard({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <article
      className="relative flex h-full w-full flex-col items-center overflow-y-auto rounded-3xl bg-white px-8 py-10 text-center shadow-2xl md:px-20 md:py-16"
      style={{ boxShadow: `0 30px 80px -30px ${color}88` }}
    >
      <div className="my-auto flex w-full max-w-[1600px] flex-col items-center">{children}</div>
    </article>
  );
}
