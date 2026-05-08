import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PublicLayout } from '@components/PublicLayout';
import { courseModules } from '@data/courseData';
import { ebookContent } from '@data/ebookContent';

export function EbookPage() {
  const { id } = useParams<{ id: string }>();
  const moduleId = Number(id);
  const module = useMemo(
    () => courseModules.find((m) => m.id === moduleId),
    [moduleId],
  );
  const markdown = module ? ebookContent[module.id] : undefined;

  if (!module || !markdown) {
    return (
      <PublicLayout>
        <div className="py-20 text-center">
          <p className="text-slate-600">Aula não encontrada.</p>
          <Link to="/claudecode" className="btn btn-secondary mt-4">
            Voltar
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout wide>
      <header
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${module.color}, ${module.color}aa)` }}
      >
        <div className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
          <Link to="/claudecode" className="text-sm text-white/80 hover:text-white">
            ← Voltar ao curso
          </Link>
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/80">
            Aula {String(module.id).padStart(2, '0')} · {module.date}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">{module.title}</h1>
          <p className="mt-2 text-base text-white/85 md:text-lg">{module.subtitle}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to={`/claudecode/aulas/${module.id}/slides`}
              className="btn bg-white/20 text-white backdrop-blur hover:bg-white/30"
            >
              Ver apresentação
            </Link>
          </div>
        </div>
      </header>

      <article className="ebook-prose mx-auto max-w-3xl px-4 py-12 md:px-8">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </article>
    </PublicLayout>
  );
}
