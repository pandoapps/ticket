import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { courseModules } from '@data/courseData';
import { generatorData } from '@data/generatorData';
import { SlideRenderer } from '@pages/claudecode/SlidesPage';

export function GeneratorPage() {
  const { id } = useParams<{ id: string }>();
  const moduleId = Number(id);
  const module = useMemo(
    () => courseModules.find((m) => m.id === moduleId),
    [moduleId],
  );
  const slides = useMemo(() => generatorData[moduleId] ?? [], [moduleId]);

  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(0);

  function handleReset() {
    const toRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith('pb-')) toRemove.push(key);
    }
    toRemove.forEach((k) => sessionStorage.removeItem(k));
    setIndex(1);
  }

  useEffect(() => {
    setStep(0);
  }, [index]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) {
        return;
      }
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
  }, [slides, index]);

  if (!module || slides.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Gerador não encontrado.</p>
          <Link to="/claudecode" className="btn btn-secondary mt-4">
            Voltar
          </Link>
        </div>
      </div>
    );
  }

  const current = slides[index];
  const total = slides.length;
  const canRetreat = index > 0;
  const canAdvance = index < total - 1;

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
            Aula {String(module.id).padStart(2, '0')} — Gerador de Projetos
          </span>
        </div>
        <span className="text-xs text-white/60">
          {index + 1} / {total}
        </span>
      </header>

      <main className="flex flex-1 items-stretch justify-center overflow-hidden px-3 py-3 md:px-6 md:py-4">
        {current && (
          <div key={index} className="flex w-full animate-slide-fade items-stretch justify-center">
            <SlideRenderer slide={current} step={step} onReset={handleReset} />
          </div>
        )}
      </main>

      <footer className="flex items-center justify-between border-t border-white/10 bg-slate-950/70 px-4 py-2 text-white backdrop-blur md:px-8">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setIndex((i) => Math.max(i - 1, 0))}
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
          onClick={() => setIndex((i) => Math.min(i + 1, total - 1))}
          disabled={!canAdvance}
        >
          Próximo →
        </button>
      </footer>
    </div>
  );
}
