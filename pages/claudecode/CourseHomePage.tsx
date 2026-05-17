import { Link } from 'react-router-dom';
import { PublicLayout } from '@components/PublicLayout';
import { courseModules, type CourseModule } from '@data/courseData';

export function CourseHomePage() {
  return (
    <PublicLayout wide>
      <Hero />

      <section className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <div className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-600">Programa</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">4 encontros, 4 entregas concretas</h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {courseModules.map((mod) => (
            <ModuleCard key={mod.id} module={mod} />
          ))}
        </div>
      </section>

    </PublicLayout>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#d97757] via-[#a78bfa] to-[#6ea8fe] opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.35),_transparent_60%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-20 md:px-8 md:py-28">
        <span className="chip border border-white/30 bg-white/15 text-white backdrop-blur">
          Mentoria · 4 sábados · Maio de 2026
        </span>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl">
          Claude Code do zero ao deploy
        </h1>
        <p className="mt-4 max-w-2xl text-base text-white/90 md:text-lg">
          Quatro encontros práticos para instalar, construir, versionar e publicar uma aplicação real
          usando Claude Code como par de programação.
        </p>
      </div>
    </section>
  );
}

function ModuleCard({ module }: { module: CourseModule }) {
  return (
    <article
      className="glass-card flex flex-col gap-4 overflow-hidden p-6"
      style={{ boxShadow: `0 18px 40px -28px ${module.color}` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: module.color }}>
            Aula {String(module.id).padStart(2, '0')} · {module.date}
          </p>
          <h3 className="mt-1 text-xl font-semibold text-slate-900">{module.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{module.subtitle}</p>
        </div>
        <span
          aria-hidden
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
          style={{ background: `${module.color}22`, color: module.color }}
        >
          {module.icon}
        </span>
      </div>

      <p className="text-sm text-slate-700">{module.description}</p>

      <div className="flex flex-wrap gap-1.5">
        {module.tags.map((tag) => (
          <span key={tag} className="chip border border-slate-200 bg-white/70 text-slate-600">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto flex flex-wrap gap-2 pt-2">
        <Link
          to={`/claudecode/aulas/${module.id}/slides`}
          className="btn btn-primary"
          style={{ background: `linear-gradient(135deg, ${module.color}, ${module.color}cc)` }}
        >
          Apresentação
        </Link>
        <Link to={`/claudecode/aulas/${module.id}/ebook`} className="btn btn-secondary">
          Ebook
        </Link>
        <Link to={`/claudecode/aulas/${module.id}/material`} className="btn btn-secondary">
          📖 Material
        </Link>
      </div>
    </article>
  );
}

