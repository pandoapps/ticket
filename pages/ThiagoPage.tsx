import { useState } from 'react';
import { PublicLayout } from '@components/PublicLayout';
import { Icons } from '@components/Icon';

const stats = [
  { value: '4', label: 'Encontros' },
  { value: '4', label: 'Projetos' },
  { value: '16h', label: 'Mentoria' },
];

const projects = [
  {
    title: 'Landing Page Profissional',
    description: 'Crie sua primeira página web completa e responsiva usando IA.',
    icon: Icons.sparkles,
  },
  {
    title: 'Chatbot Inteligente',
    description: 'Desenvolva um assistente virtual com integração de IA.',
    icon: Icons.users,
  },
  {
    title: 'Dashboard Interativo',
    description: 'Construa um painel de controle com dados em tempo real.',
    icon: Icons.chart,
  },
  {
    title: 'Aplicativo Funcional',
    description: 'Lance seu próprio app do zero à publicação.',
    icon: Icons.ticket,
  },
];

const steps = [
  {
    title: 'Ideação',
    description: 'Transforme ideias em especificações claras que a IA entende.',
  },
  {
    title: 'Prompt Engineering',
    description: 'Aprenda a conversar com a IA de forma efetiva para obter resultados.',
  },
  {
    title: 'Desenvolvimento',
    description: 'Construa o projeto com auxílio das ferramentas de IA modernas.',
  },
  {
    title: 'Deploy',
    description: 'Publique seu projeto na internet para o mundo ver.',
  },
];

const includes = [
  '4 projetos completos do zero',
  '16 horas de mentoria presencial',
  'Suporte durante todo o programa',
  'Acesso ao grupo exclusivo de alunos',
];

const faqs = [
  {
    q: 'Preciso levar meu próprio notebook?',
    a: 'Sim. Traga o notebook que você usa no dia a dia — vamos configurar tudo juntos no primeiro encontro.',
  },
  {
    q: 'Preciso saber programar?',
    a: 'Não. O programa é desenhado para quem está começando do zero. Se você sabe usar um navegador, está pronto.',
  },
  {
    q: 'O que é Vibe Coding?',
    a: 'É a prática de construir projetos reais conversando com a IA: você descreve o que quer, a IA ajuda a implementar, e você aprende guiando o processo.',
  },
  {
    q: 'O que vou aprender durante o programa?',
    a: 'Do conceito ao deploy: como idealizar um projeto, escrever prompts efetivos, desenvolver com IA e publicar na internet.',
  },
  {
    q: 'O programa é presencial mesmo?',
    a: 'Sim, 100% presencial em São José dos Campos. A convivência é parte essencial da metodologia.',
  },
  {
    q: 'Qual o tamanho da turma?',
    a: 'Turma reduzida para garantir atenção individual a cada aluno durante os encontros.',
  },
  {
    q: 'Vou conseguir criar projetos sozinho depois?',
    a: 'Sim. A metodologia é construída para te dar autonomia: ao final, você sai com quatro projetos publicados e o caminho claro para criar os próximos.',
  },
  {
    q: 'E se eu não conseguir comparecer a algum encontro?',
    a: 'Você recebe os materiais e um resumo do que foi feito, e pode tirar dúvidas no grupo para não perder o ritmo.',
  },
];

export function ThiagoPage() {
  return (
    <PublicLayout wide>
      <Hero />
      <Projects />
      <Methodology />
      <Mentor />
      <CallToAction />
      <Faq />
      <Contact />
    </PublicLayout>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
        <div className="flex flex-col items-center text-center">
          <span className="chip border border-brand-200 bg-brand-50 text-brand-700">
            <Icons.sparkles className="mr-1.5 h-3 w-3" />
            Turma de Abril — Vagas limitadas
          </span>

          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight text-slate-900 sm:text-5xl md:text-6xl">
            Aprenda a criar{' '}
            <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
              projetos reais
            </span>{' '}
            com Vibe Coding
          </h1>

          <p className="mt-5 max-w-2xl text-base text-slate-600 md:text-lg">
            Programa de mentoria para pessoas comuns que querem começar a programar usando
            inteligência artificial. Sem experiência prévia necessária.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://cursos.pandoapps.com.br/eventos/curso-claudecode"
              className="btn btn-primary px-6 py-3 text-base"
            >
              Comprar agora
            </a>
            <a href="#programa" className="btn btn-secondary px-6 py-3 text-base">
              Ver programa
            </a>
          </div>

          <dl className="mt-12 grid w-full max-w-2xl grid-cols-3 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="glass-card p-5 text-center">
                <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
                  {s.label}
                </dt>
                <dd className="mt-2 text-3xl font-bold text-slate-900">{s.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-600">
            <span className="chip border border-white/60 bg-white/70 backdrop-blur">
              <Icons.mapPin className="mr-1.5 h-3.5 w-3.5" />
              São José dos Campos
            </span>
            <span className="chip border border-white/60 bg-white/70 backdrop-blur">
              <Icons.calendar className="mr-1.5 h-3.5 w-3.5" />
              07, 14, 21 e 28 de Abril
            </span>
            <span className="chip border border-white/60 bg-white/70 backdrop-blur">
              <Icons.clock className="mr-1.5 h-3.5 w-3.5" />
              18h às 22h
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Projects() {
  return (
    <section id="programa" className="mx-auto max-w-6xl px-4 py-16 md:px-8">
      <div className="mb-10 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-600">
          O programa
        </p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
          4 semanas, 4 projetos reais
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600">
          Cada encontro é uma jornada completa: do conceito à execução, você vai construir
          projetos que pode usar no dia a dia.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {projects.map((p, i) => {
          const Icon = p.icon;
          return (
            <div
              key={p.title}
              className="glass-card animate-fade-up p-6"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-600 text-white shadow-lg shadow-brand-500/25">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600">
                    Projeto {i + 1}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">{p.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-600">{p.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Methodology() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
      <div className="mb-10 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-600">
          Metodologia
        </p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Do zero ao deploy</h2>
      </div>

      <ol className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <li key={s.title} className="glass-card relative p-6">
            <span className="absolute -top-3 left-6 inline-flex h-7 items-center rounded-full bg-gradient-to-r from-brand-600 to-accent-600 px-3 text-xs font-semibold text-white shadow-lg shadow-brand-500/25">
              Etapa {i + 1}
            </span>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">{s.title}</h3>
            <p className="mt-1.5 text-sm text-slate-600">{s.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Mentor() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
      <div className="glass-card overflow-hidden">
        <div className="grid grid-cols-1 gap-8 p-6 md:grid-cols-[1fr_2fr] md:p-10">
          <div className="flex flex-col items-center justify-center text-center md:items-start md:text-left">
            <div className="relative h-48 w-48 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 via-brand-700 to-accent-600 shadow-xl shadow-brand-500/30">
              <img
                src="/images/thiago.png"
                alt="Thiago Ferreira"
                className="h-full w-full object-cover"
              />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-brand-600">
              Mentor
            </p>
            <h3 className="mt-1 text-2xl font-bold text-slate-900">Thiago Ferreira</h3>
            <p className="text-sm text-slate-500">Mentor de Vibe Coding</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <span className="chip border border-brand-200 bg-brand-50 text-brand-700">
                20+ anos de dev
              </span>
              <span className="chip border border-brand-200 bg-brand-50 text-brand-700">
                100+ projetos
              </span>
            </div>
          </div>

          <div>
            <p className="text-slate-700">
              Desenvolvedor há mais de uma década, descobri que a verdadeira magia da programação
              não está em decorar sintaxe, mas em transformar ideias em realidade. Chega de lenga
              lenga! Está na hora de você colocar a mão na massa e tirar seus projetos do mundo
              dos sonhos.
            </p>
            <p className="mt-4 text-slate-700">
              Te convido agora mesmo a participar dessa jornada de um mês e aprender como
              materializar aquele projeto que você está enrolando há anos. O Vibe Coding nasceu
              dessa paixão: ajudar pessoas comuns a descobrirem que programar pode ser divertido,
              criativo e muito mais acessível do que imaginam.
            </p>
            <blockquote className="mt-6 rounded-2xl border-l-4 border-brand-500 bg-white/60 p-4 text-slate-800">
              <p className="italic">
                “Não é sobre se tornar um programador profissional. É sobre ter o poder de criar
                suas próprias soluções.”
              </p>
              <footer className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
                Thiago Ferreira
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section id="comprar" className="mx-auto max-w-6xl px-4 py-16 md:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-800 to-accent-600 p-8 text-white shadow-glass-lg md:p-12">
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(600px_circle_at_0%_0%,rgba(255,255,255,0.35),transparent_60%),radial-gradient(600px_circle_at_100%_100%,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-[2fr_1fr] md:items-center">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">Pronto para começar sua jornada?</h2>
            <p className="mt-3 max-w-xl text-white/85">
              Transforme suas ideias em projetos reais. Não é necessário conhecimento prévio de
              programação.
            </p>
            <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {includes.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-white/90">
                  <Icons.checkCircle className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs uppercase tracking-[0.25em] text-white/70">
              Vagas limitadas para garantir atenção individual
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-3">
            <a
              href="https://cursos.pandoapps.com.br/eventos/curso-claudecode"
              className="btn bg-white px-6 py-3 text-base font-semibold text-brand-700 shadow-xl shadow-black/20 hover:brightness-105"
            >
              Comprar agora
            </a>
            <a
              href="#faq"
              className="btn border border-white/40 bg-white/10 px-6 py-3 text-base text-white backdrop-blur hover:bg-white/20"
            >
              Tenho dúvidas
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-16 md:px-8">
      <div className="mb-10 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-600">
          Perguntas frequentes
        </p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
          Tudo o que você precisa saber antes de começar
        </h2>
      </div>

      <ul className="space-y-3">
        {faqs.map((f, i) => {
          const open = openIndex === i;
          return (
            <li key={f.q} className="glass-card overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : i)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left"
                aria-expanded={open}
              >
                <span className="font-semibold text-slate-900">{f.q}</span>
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition ${open ? 'rotate-45' : ''}`}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>
              </button>
              {open && (
                <div className="border-t border-white/60 bg-white/40 p-5 text-sm text-slate-700">
                  {f.a}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Contact() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 text-center md:px-8">
      <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Vamos conversar?</h2>
      <p className="mx-auto mt-3 max-w-xl text-slate-600">
        Ficou com alguma dúvida? Me chama no Instagram. Estou sempre por lá compartilhando
        conteúdo sobre tecnologia, finanças e como criar projetos usando IA.
      </p>
      <a
        href="https://instagram.com/cafecomcifrao"
        target="_blank"
        rel="noreferrer"
        className="btn btn-primary mt-6 px-6 py-3 text-base"
      >
        @cafecomcifrao
      </a>
      <p className="mt-3 text-xs text-slate-500">Respondo todas as mensagens.</p>
    </section>
  );
}
