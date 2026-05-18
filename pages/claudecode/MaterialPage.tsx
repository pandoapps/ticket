import { Children, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import { PublicLayout } from '@components/PublicLayout';
import { FlowchartDiagram } from '@components/FlowchartDiagram';
import { courseModules } from '@data/courseData';
import { materialContent } from '@data/materialContent';
import { slidesData, type FlowchartSlide } from '@data/slidesData';

function CodeBlock({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function copy() {
    navigator.clipboard.writeText(children).then(() => {
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="no-print-copy-btn relative">
      <button
        type="button"
        onClick={copy}
        aria-label="Copiar código"
        className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-md border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-300 transition hover:bg-white/20 hover:text-white"
      >
        {copied ? (
          <>
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="2,8 6,12 14,4" />
            </svg>
            Copiado!
          </>
        ) : (
          <>
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="5" y="1" width="9" height="11" rx="1.5" />
              <path d="M2 5h0a1.5 1.5 0 0 0-1.5 1.5v8A1.5 1.5 0 0 0 2 16h7a1.5 1.5 0 0 0 1.5-1.5v0" />
            </svg>
            Copiar
          </>
        )}
      </button>
      <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 pt-10 text-sm leading-relaxed text-slate-100">
        <code>{children}</code>
      </pre>
    </div>
  );
}

function ManosNaMassa({ children }: { children: React.ReactNode }) {
  const items = Children.toArray(children)
    .filter(child => typeof child !== 'string' || child.trim() !== '')
    .slice(1);
  return (
    <div className="my-6 overflow-hidden rounded-2xl border-2 border-orange-200 bg-orange-50">
      <div className="flex items-center gap-2.5 border-b border-orange-200 bg-orange-100 px-5 py-3">
        <span className="text-lg">🛠️</span>
        <span className="text-xs font-bold uppercase tracking-widest text-orange-700">Momento ação — faça você mesmo</span>
      </div>
      <div className="space-y-3 px-5 py-5 text-slate-800 [&>p]:leading-relaxed [&>p:first-child]:mt-0 [&>p]:my-0">
        {items}
      </div>
    </div>
  );
}

function buildMarkdownComponents(moduleId: number): Components {
  const slides = slidesData[moduleId] ?? [];
  const flowchartSlide = slides.find((s): s is FlowchartSlide => s.type === 'flowchart');

  return {
  blockquote({ node, children }) {
    const firstBlock = (node as any)?.children?.find((c: any) => c.type === 'element');
    const firstText = firstBlock?.children?.[0];
    const isManosNaMassa =
      firstText?.type === 'text' && String(firstText.value).startsWith('🛠️');
    if (isManosNaMassa) {
      return <ManosNaMassa>{children}</ManosNaMassa>;
    }
    return (
      <blockquote className="my-5 border-l-4 border-brand-300 bg-brand-50/40 px-4 py-2 italic text-slate-700">
        {children}
      </blockquote>
    );
  },

    pre({ children }) {
      const codeEl = Array.isArray(children) ? children[0] : children;
      if (!codeEl || typeof codeEl !== 'object' || !('props' in codeEl)) {
        return <pre>{children}</pre>;
      }
      const lang: string = codeEl.props?.className ?? '';
      const text = typeof codeEl.props?.children === 'string' ? codeEl.props.children : '';
      if (lang.includes('language-flowchart-revisao-aula01')) {
        if (!flowchartSlide) return null;
        return (
          <div className="my-8 overflow-x-auto rounded-2xl bg-slate-50 p-4 shadow-sm ring-1 ring-slate-200">
            <FlowchartDiagram slide={flowchartSlide} />
          </div>
        );
      }
      if (lang.includes('language-bash')) {
        return <CodeBlock>{text}</CodeBlock>;
      }
      return (
        <pre className="my-5 overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm leading-relaxed text-slate-100">
          <code>{text}</code>
        </pre>
      );
    },
  };
}

export function MaterialPage() {
  const { id } = useParams<{ id: string }>();
  const moduleId = Number(id);
  const module = useMemo(
    () => courseModules.find((m) => m.id === moduleId),
    [moduleId],
  );
  const markdown = module ? materialContent[module.id] : undefined;

  useEffect(() => {
    document.body.classList.add('print-material-page');
    return () => document.body.classList.remove('print-material-page');
  }, []);

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
        className="no-print relative overflow-hidden"
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
          <div className="mt-6 flex items-center gap-2">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              📖 Material Complementar
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to={`/claudecode/aulas/${module.id}/slides`}
              className="btn bg-white/20 text-white backdrop-blur hover:bg-white/30"
            >
              Ver apresentação
            </Link>
            <Link
              to={`/claudecode/aulas/${module.id}/ebook`}
              className="btn bg-white/20 text-white backdrop-blur hover:bg-white/30"
            >
              Ver e-book
            </Link>
          </div>
        </div>
      </header>

      <article className="ebook-prose mx-auto max-w-3xl px-4 py-12 md:px-8">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={buildMarkdownComponents(moduleId)}>
          {markdown}
        </ReactMarkdown>
      </article>
    </PublicLayout>
  );
}
