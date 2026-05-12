export interface CoverSlide {
  type: 'cover';
  aula: string;
  date: string;
  title: string;
  subtitle: string;
  color: string;
  icon: string;
  qrUrl?: string;
  qrCaption?: string;
}

export interface PresenterSocial {
  label: string;
  url: string;
}

export interface PresenterSlide {
  type: 'presenter';
  name: string;
  role: string;
  color: string;
  bullets: string[];
  socials: PresenterSocial[];
  photoUrl?: string;
}

export interface StorySlide {
  type: 'story';
  title: string;
  color: string;
  hint: string;
  delayedImages?: string[];
  delayedImagesMs?: number;
  delayedAudio?: string;
}

export interface AgendaSlide {
  type: 'agenda';
  title: string;
  color: string;
  items: string[];
}

export interface ContentBlock {
  icon: string;
  label: string;
  text: string;
  url?: string;
  commands?: string[];
}

export interface ContentSlide {
  type: 'content';
  badge: string;
  title: string;
  subtitle?: string;
  color: string;
  blocks: ContentBlock[];
}

export type ListSlideItem = string | { text: string; url?: string };

export interface ListSlide {
  type: 'list';
  badge: string;
  title: string;
  subtitle?: string;
  color: string;
  items: ListSlideItem[];
}

export interface HighlightStep {
  num: string;
  label: string;
  text: string;
}

export interface HighlightSlide {
  type: 'highlight';
  badge: string;
  title: string;
  color: string;
  quote: string;
  steps: HighlightStep[];
}

export interface DeliverablesSlide {
  type: 'deliverables';
  title: string;
  color: string;
  icon: string;
  items: string[];
}

export interface ClosingSlide {
  type: 'closing';
  title: string;
  date: string;
  next: string;
  nextDesc: string;
  color: string;
  icon: string;
}

export interface Layer {
  icon: string;
  label: string;
  text: string;
  color: string;
}

export interface LayersSlide {
  type: 'layers';
  badge: string;
  title: string;
  color: string;
  layers: Layer[];
}

export interface GlossaryTerm {
  term: string;
  def: string;
}

export interface GlossarySlide {
  type: 'glossary';
  badge: string;
  title: string;
  color: string;
  terms: GlossaryTerm[];
}

export interface FinalSlide {
  type: 'final';
  title: string;
  subtitle: string;
  color: string;
  icon: string;
  message: string;
}

export interface PartsSlideItem {
  label: string;
  description?: string;
  icon: string;
  imageUrl?: string;
}

export interface PartsSlide {
  type: 'parts';
  badge?: string;
  title: string;
  color: string;
  items: PartsSlideItem[];
}

export interface WordCloudWord {
  text: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  emphasis?: boolean;
}

export interface WordCloudSlide {
  type: 'wordCloud';
  badge?: string;
  title?: string;
  subtitle?: string;
  color: string;
  words: (string | WordCloudWord)[];
}

export interface PromptBuilderInput {
  id: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  hint?: string;
}

export interface PromptBuilderSlide {
  type: 'promptBuilder';
  badge?: string;
  title: string;
  subtitle?: string;
  color: string;
  inputs: PromptBuilderInput[];
  buttonLabel: string;
  promptTemplate: string;
  nextStep?: {
    text: string;
    linkLabel?: string;
    linkUrl?: string;
  };
  nextSteps?: {
    title?: string;
    steps: Array<{
      text: string;
      linkLabel?: string;
      linkUrl?: string;
      suffix?: string;
    }>;
  };
}

export type FormStudyQuestion = string | { label: string; multiline?: boolean };

export interface FormStudySlide {
  type: 'formStudy';
  badge?: string;
  title: string;
  subtitle?: string;
  color: string;
  imageUrl: string;
  imageAlt?: string;
  questions: FormStudyQuestion[];
}

export interface ImageSlide {
  type: 'image';
  badge?: string;
  title: string;
  subtitle?: string;
  color: string;
  imageUrl: string;
  imageAlt?: string;
  caption?: string;
  imageMaxHeight?: string;
}

export interface GameCharacter {
  id: string;
  label: string;
  imageUrl: string;
}

export interface GameSlide {
  type: 'game';
  title: string;
  subtitle?: string;
  color: string;
  characters: [GameCharacter, GameCharacter];
  winScore: number;
  backgroundAudio?: string;
}

export type Slide =
  | CoverSlide
  | PresenterSlide
  | StorySlide
  | AgendaSlide
  | ContentSlide
  | ListSlide
  | HighlightSlide
  | DeliverablesSlide
  | ClosingSlide
  | LayersSlide
  | GlossarySlide
  | PartsSlide
  | GameSlide
  | ImageSlide
  | FormStudySlide
  | PromptBuilderSlide
  | WordCloudSlide
  | FinalSlide;

export const slidesData: Record<number, Slide[]> = {
  1: [
    {
      type: 'cover',
      aula: 'Encontro 1',
      date: '09 de Maio de 2026',
      title: 'Projeto Exemplo do Zero',
      subtitle: 'Instalação, configuração e primeiro projeto completo com Claude Code',
      color: '#d97757',
      icon: '🚀',
      qrUrl: '/images/qr-aula-01.png',
    },
    {
      type: 'presenter',
      name: 'Thiago Ferreira',
      role: 'Mentor de Vibe Coding · Fundador da Pandô APPs',
      color: '#d97757',
      photoUrl: '/images/thiago.png',
      bullets: [
        'Desenvolvedor há mais de duas décadas, com mais de 100 projetos publicados',
        'Acredita que programar é transformar ideias em realidade, não decorar sintaxe',
        'Criador do método IED — Inteligência Empresarial Digital',
        'Ajuda pessoas comuns a criar suas próprias soluções com tecnologia',
      ],
      socials: [
        { label: '@cafecomcifrao', url: 'https://www.instagram.com/cafecomcifrao/' },
      ],
    },
    {
      type: 'presenter',
      name: 'Jéfte Pavam',
      role: 'Empresário · Fundador da NECSObr e IT Telecom',
      color: '#d97757',
      photoUrl: '/images/jefte.jpeg',
      bullets: [
        'Cristão, joseense de 41 anos, pai do Felipe (8) e do Salomão (2)',
        'Técnico de Telecomunicações e Bacharel em Direito',
        'Diretor de Crescimento do BNI Leste Paulista; mais de 20 anos empreendendo em SJCampos',
        'Já foi candidato a vereador em 2020 e é aluno da Glider Brasil para piloto de paraglider',
      ],
      socials: [
        { label: '@jeftepavam', url: 'https://www.instagram.com/jeftepavam/' },
      ],
    },
    {
      type: 'story',
      title: 'Minha História',
      color: '#d97757',
      hint: '— espaço para você contar —',
    },
    {
      type: 'story',
      title: 'Quebra Gelo',
      color: '#d97757',
      hint: 'Para que serve a IA?',
      delayedImages: ['/images/thiago-timao.png', '/images/jefte-pumba.png'],
      delayedAudio: '/audio/burper.mp3',
    },
    {
      type: 'parts',
      title: 'Como Usar a IA',
      color: '#d97757',
      items: [
        {
          label: 'Conversacional',
          description: 'Você pergunta, a IA responde — ChatGPT, Claude, Gemini',
          icon: '💬',
          imageUrl: '/images/forms-conversacional.gif',
        },
        {
          label: 'Co-work',
          description: 'IA no seu PC — Copilot, Cursor — Seu assistente pessoal',
          icon: '🤝',
          imageUrl: '/images/forms-cowork.gif',
        },
        {
          label: 'CLI',
          description: 'IA no terminal — Claude Code e agentes que executam tarefas',
          icon: '⌨️',
          imageUrl: '/images/forms-cli.gif',
        },
        {
          label: 'API',
          description: 'Integração programática — IA dentro do seu próprio produto',
          icon: '🔌',
          imageUrl: '/images/forms-api.gif',
        },
      ],
    },
    {
      type: 'game',
      title: 'Timão vs Pumba',
      subtitle: 'Escolha seu personagem e a dificuldade',
      color: '#d97757',
      winScore: 5,
      backgroundAudio: '/audio/duello.mp3',
      characters: [
        { id: 'timao', label: 'Timão', imageUrl: '/images/thiago-timao.png' },
        { id: 'pumba', label: 'Pumba', imageUrl: '/images/jefte-pumba.png' },
      ],
    },
    {
      type: 'wordCloud',
      title: 'O que vocês esperam do curso',
      color: '#d97757',
      words: [
        { text: 'Aprender desenvolver aplicações com IA', size: 'xl' },
        { text: 'Conhecimento e Autonomia', size: 'lg' },
        { text: 'Qualificação Profissional', size: 'lg' },
        { text: 'meu próprio negócio futuro', size: 'lg' },
        { text: 'Criar app para minha empresa', size: 'md' },
        { text: 'Criar um app para clientes de desenvolvimento pessoal', size: 'md' },
        { text: 'aprimorar minhas habilidades no ramo e buscar oportunidades', size: 'md' },
        { text: 'Estar atualizado com as tendências', size: 'md' },
        { text: 'conhecimento', size: 'sm' },
      ],
    },
    {
      type: 'agenda',
      title: 'O que vamos ver hoje',
      color: '#d97757',
      items: [
        '01 — Quando criar um projeto',
        '02 — Escopando um projeto',
        '03 — Criando as interfaces',
        '04 — Instalação e configuração do ambiente',
        '05 — Construção do projeto do zero ao fim',
        '06 — Primeiros comandos e fluxo de trabalho',
        '07 — Boas práticas de prompt',
        '08 — Gerando o documento de requisitos',
        '09 — Gerando prompt para o Claude',
      ],
    },
    {
      type: 'list',
      badge: 'Parte 01',
      title: 'Quando Criar um Projeto',
      subtitle: 'Identificando a oportunidade certa',
      color: '#d97757',
      items: [
        'Quando você consegue descrever em uma frase o que o projeto faz',
        'Quando há uma oportunidade real e validada no mercado',
        'Quando é financeiramente inteligente fazer isso',
        'Quando você sabe quem vai usar e como',
        '**Quando você sabe como distribuir isso!!!!!**',
      ],
    },
    {
      type: 'list',
      badge: 'Cuidado',
      title: 'Exemplos de Projetos Ruins',
      subtitle: 'O que evitar antes de começar',
      color: '#d97757',
      items: [
        '"Odeio mercado livre... vou criar um novo marketplace e deixar taxa 0 para todo mundo!"',
        '"Quero criar uma automação para as lâmpadas de natal dos esquimós"',
        '"Tenho uma padaria e NENHUM sistema serve para mim... vou criar meu próprio"',
      ],
    },
    {
      type: 'image',
      badge: 'Parte 02',
      title: 'Escopando um Projeto',
      subtitle: 'O que pensar antes do projeto começar',
      color: '#d97757',
      imageUrl: '/images/business-model-template.jpg',
      imageAlt: 'Online Startup Business Model Template',
      imageMaxHeight: '40vh',
    },
    {
      type: 'formStudy',
      badge: 'Parte 02',
      title: 'Escopando um Projeto',
      subtitle: 'Estudo de caso',
      color: '#d97757',
      imageUrl: '/images/vo-sonia.jpg',
      imageAlt: 'Vó Sônia',
      questions: [
        { label: 'Qual o nome da plataforma?', multiline: false },
        'Qual o problema que a plataforma quer resolver?',
        'Qual o público alvo da plataforma?',
        'Como você quer ganhar audiência com esse público?',
      ],
    },
    {
      type: 'formStudy',
      badge: 'Parte 02',
      title: 'Escopando um Projeto',
      subtitle: 'Estudo de caso',
      color: '#d97757',
      imageUrl: '/images/palmeiras-mancha-verde.png',
      imageAlt: 'Torcida do Palmeiras com bandeirão da Mancha Verde no Allianz Parque',
      questions: [
        { label: 'Qual o nome da plataforma?', multiline: false },
        'Qual o problema que a plataforma quer resolver?',
        'Qual o público alvo da plataforma?',
        'Como você quer ganhar audiência com esse público?',
      ],
    },
    {
      type: 'list',
      badge: 'Parte 03',
      title: 'Criando as Interfaces',
      subtitle: 'Construindo um prompt inicial',
      color: '#d97757',
      items: [],
    },
    {
      type: 'list',
      badge: 'Parte 03',
      title: 'Criando as Interfaces',
      subtitle: 'Conhecendo o Google AI Studio',
      color: '#d97757',
      items: [
        'Entenda quais são os atores da sua plataforma',
        'Entenda as jornadas de cada ator',
        'Itere com o Claude: peça, veja o resultado, ajuste',
        'Use componentes reutilizáveis para manter o visual consistente',
      ],
    },
    {
      type: 'image',
      badge: 'Parte 03',
      title: 'Criando as Interfaces',
      subtitle: 'Desafio Copa do Mundo',
      color: '#d97757',
      imageUrl: '/images/figurinhas-copa.jpg',
      imageAlt: 'Figurinhas da Copa do Mundo',
      imageMaxHeight: '40vh',
    },
    {
      type: 'promptBuilder',
      badge: 'Parte 03',
      title: 'Criando as Interfaces',
      subtitle: 'Gerando um prompt inicial',
      color: '#d97757',
      buttonLabel: 'Gerar prompt de telas',
      inputs: [
        { id: 'NOME', label: 'Qual o nome da plataforma?' },
        { id: 'OBJETIVO', label: 'Qual objetivo da plataforma?' },
        { id: 'CORES', label: 'Quais as cores principais?' },
        { id: 'ATORES', label: 'Quais atores do sistema e o que cada um pode fazer?', multiline: true },
      ],
      nextSteps: {
        title: 'Instruções:',
        steps: [
          {
            text: 'Envie o prompt gerado nesse quadro para o ',
            linkLabel: 'Claude',
            linkUrl: 'https://claude.ai',
          },
          {
            text: 'Copie a resposta do Claude e envie no ',
            linkLabel: 'Google AI Studio',
            linkUrl: 'https://aistudio.google.com/apps',
          },
        ],
      },
      promptTemplate: `Estou criando as telas da plataforma chamada {NOME}, que terá como cores principais {CORES}

Quero que você crie um prompt que será enviado para o google AI Studio criar as telas do meu sistema. Ele tem como objetivo {OBJETIVO}.

Os principais atores da plataforma são:
{ATORES}

Quero que use glass design e que gere um visual moderno.

Quero que as senhas dos usuários sejam 123456

Quero que tenha um painel administrativo e que seu acesso seja realizado através de um botão no topo superior direito

Quero que tenha uma landing page para o projeto com um botão de login no topo superior direito

Quero que a plataforma seja responsiva

Quero que crie um card abaixo do formulário de login com atalhos para preencher sozinho o login e senha dos usuários`,
    },
    {
      type: 'content',
      badge: 'Parte 04',
      title: 'Instalação e Configuração',
      color: '#d97757',
      blocks: [
        {
          icon: '💻',
          label: 'VS Code',
          text: 'Editor de código com suporte a extensões e integração nativa com Claude Code',
          url: 'https://code.visualstudio.com/download',
        },
        {
          icon: '🐧',
          label: 'WSL',
          text: 'Windows Subsystem for Linux — ambiente Unix dentro do Windows',
          url: 'https://learn.microsoft.com/pt-br/windows/wsl/install',
        },
        {
          icon: '🐳',
          label: 'Docker Desktop',
          text: 'Containerização da aplicação — mesmo ambiente em qualquer máquina',
          url: 'https://www.docker.com/get-started/',
        },
        {
          icon: '🤖',
          label: 'Claude Code',
          text: 'CLI da Anthropic instalada e autenticada com sua conta Claude',
          url: 'https://code.claude.com/docs/en/quickstart',
        },
        {
          icon: '🛠️',
          label: 'Make',
          text: 'Abra o WSL e rode os comandos abaixo para instalar o make',
          commands: [
            'sudo apt update',
            'sudo apt install make -y',
            'make --version',
          ],
        },
      ],
    },
    {
      type: 'highlight',
      badge: 'Parte 05',
      title: 'Construção do Projeto',
      color: '#d97757',
      quote: 'Você não precisa saber escrever o código. Você precisa saber descrever o que quer.',
      steps: [
        { num: '1', label: 'Definir', text: 'O que o projeto faz? Quem usa?' },
        { num: '2', label: 'Estruturar', text: 'Quais telas, funcionalidades e dados?' },
        { num: '3', label: 'Construir', text: 'Prompt a prompt, iterando com Claude' },
        { num: '4', label: 'Revisar', text: 'Testar, ajustar e validar o resultado' },
      ],
    },
    {
      type: 'list',
      badge: 'Parte 06',
      title: 'Primeiros Comandos',
      subtitle: 'Fluxo de Desenvolvimento',
      color: '#d97757',
      items: [
        'Iniciar uma sessão: claude dentro da pasta do projeto',
        'Descrever o que você quer construir em linguagem natural',
        'Revisar o que Claude propõe antes de confirmar',
        'Iterar: corrigir, ajustar, adicionar funcionalidades',
        'Usar /clear para limpar o contexto quando necessário',
        'Salvar prompts que funcionaram para reutilizar',
      ],
    },
    {
      type: 'list',
      badge: 'Parte 07',
      title: 'Boas Práticas de Prompt',
      subtitle: 'Para Desenvolvimento de Software',
      color: '#d97757',
      items: [
        'Seja específico: diga o que quer, não o que não quer',
        'Forneça contexto: tipo de projeto, tecnologia, usuário final',
        'Um pedido por vez: não misture funcionalidades em um único prompt',
        'Confirme antes de grandes mudanças usando /plan',
        'Use CLAUDE.md para guardar regras permanentes do projeto',
        'Releia o código gerado — entender é parte do processo',
      ],
    },
    {
      type: 'promptBuilder',
      badge: 'Parte 08',
      title: 'Gerando o Documento de Requisitos',
      subtitle: 'Mãos à obra!',
      color: '#d97757',
      buttonLabel: 'Gerar prompt de requisitos',
      inputs: [
        {
          id: 'PROMPT',
          label: 'Qual prompt da geração de telas?',
          multiline: true,
          rows: 14,
          hint: 'Qual foi a resposta enviada pelo GPT na Parte 03?',
        },
      ],
      promptTemplate: `Estou criando uma plataforma web e para gerar as telas usei o seguinte prompt: {PROMPT}

Quero que você analise esse prompt e gere o documento de requisitos funcionais do projeto. Não fale nada sobre a Stack, eu decidirei... descreva a lista de todas as funcionalidades e a descrição delas. Lembre-se de solicitar a criação de uma landing page e colocar um botão no topo para a tela de login`,
      nextSteps: {
        title: 'Instruções:',
        steps: [
          {
            text: 'Copie o prompt gerado e envie para o ',
            linkLabel: 'Claude.ai',
            linkUrl: 'https://claude.ai',
            suffix: '. A resposta será o documento de requisitos do projeto.',
          },
        ],
      },
    },
    {
      type: 'promptBuilder',
      badge: 'Parte 09',
      title: 'Gerando Prompt para o Claude',
      subtitle: 'Buildando o app',
      color: '#d97757',
      buttonLabel: 'Gerar prompt para o Claude',
      inputs: [
        {
          id: 'REQUISITOS',
          label: 'Quais requisitos do projeto?',
          multiline: true,
          rows: 14,
          hint: 'Documento de requisitos gerado pelo Claude depois de finalizar a Parte 08',
        },
        {
          id: 'LINK_REPO',
          label: 'Qual o link do repositório no GitHub?',
          hint: 'Link do repositório gerado ao publicar o projeto no GitHub no passo 3',
        },
      ],
      promptTemplate: `🚀 Official Project Standard
Software House – Thiago Ferreira

1️⃣ Purpose of This Standard
This document defines:
Official company stack
Folder structure
Code standards
Git standards
Deployment standards
Mandatory production checklist
Project description


It must be followed in all new projects, unless a justified exception is documented.

2️⃣ Official Stack
🔹 Backend
Laravel 11+
PHP 8.4+
MySQL 8
Laravel Sanctum (API authentication)
MVC architecture
REST JSON API


🔹 Frontend
React 19
TypeScript 5+
Vite
Tailwind CSS
React Router


🔹 Infrastructure
Docker + Docker Compose
Nginx as reverse proxy
Cloudflare (when applicable)
Git
Mandatory Makefile
Db
Sh
Send (asking the comments after sending and pushing after it)
Deploy (pulling and deploying in production environment)
Thinker
Migrate
Install



3️⃣ Official Project Structure
/
├── backend/
├── pages/
├── components/
├── services/
├── hooks/
├── utils/
├── docker/
├── CLAUDE.md
├── README.md
├── Makefile
├── docker-compose.yml
└── package.json


4️⃣ CLAUDE.md (Mandatory)
Every project must include a CLAUDE.md containing:
Rule prohibiting automatic commits
Language standards (proper Portuguese accentuation required)
Technology stack
Folder structure
Make commands
Code conventions
UI standards
Modal, toast, and error handling rules. If the user clicks outside the modal or press ESC, close the modal.
Treat error and send a clear message to the user, avoid simple "Error 500"


This ensures consistency when using AI during development.

5️⃣ Code Standards
🔹 React
Functional components only
Hooks required
Typed props using interfaces
Services isolated in /services
No direct fetch calls inside components


🔹 Laravel
Controllers must return consistent JSON
Use FormRequest for validation
Use API Resources for response transformation
Business logic must live in Services
No heavy logic inside Controllers



6️⃣ Database Standard
Every table must include:
$table->id();
$table->timestamps();
$table->softDeletes();

Relationships:
$table->foreignId('user_id')
      ->constrained()
      ->onDelete('cascade');

Seeders must use:
updateOrCreate()

Admin user and password should be:
admin@admin.com / 123456

Never use static inserts that break idempotency.

7️⃣ Git Standard
Branches
main → Production
develop → Development (optional)
feature/xxx
fix/xxx


Commits
Descriptive messages
Do not mix unrelated features
Choose one language standard per project
Create a gitignore file with the best practices for laravel and react



8️⃣ Makefile Standard (Mandatory)
Minimum required commands:
make up
make up-prod
make down
make migrate
make seed
make fresh
make deploy
make send (ask me the comment after submitting make send and apply lint)
make db
make thinker
make shell

⚠️ Never use php artisan directly outside the Makefile.

9️⃣ Deployment Standard
Production must include:
Docker
Nginx
Isolated frontend build
Proper caching configuration
Gzip enabled
SPA fallback
Migrations running with --force


After deployment:
Test login
Test protected routes
Test logout
Test the main critical flow



🔟 Mandatory Pre-Production Checklist
 ✅ .env configured
 ✅ APP_KEY generated
 ✅ Sanctum working
 ✅ CORS configured
 ✅ Migrations executed
 ✅ Seeders idempotent
 ✅ Login working
 ✅ Protected routes working
 ✅ Logs clean
 ✅ Errors handled with consistent JSON
 ✅ Optimized frontend build
 ✅ Cache enabled
 ✅ Full authentication flow tested

1️⃣1️⃣ Official New Project Flow
Create repository
Upload base template
Configure Docker
Create CLAUDE.md
Create README.md
Initialize Laravel
Configure Sanctum
Initialize React + TypeScript + Vite
Configure Tailwind
Implement base authentication
Create Makefile
Push first structured commit



🧠 Company Strategic Rule
 Structure first. Features second.
 Standardization creates scale.
 Scale creates profit.


Project context

Note: Ignore all the instructions in PROJECT CONTEXT that are divergent of the previous instructions

{REQUISITOS}

Use o seguinte repositório para buscar a interface: {LINK_REPO}. Não se prenda a estrutura desse repositório, use-o apenas para copiar a interface visual`,
    },
    {
      type: 'deliverables',
      title: 'Entregáveis do Encontro',
      color: '#d97757',
      icon: '🚀',
      items: [
        'Ambiente Claude Code instalado e configurado em todas as máquinas',
        'Projeto exemplo funcional, desenvolvido durante o encontro',
        'Guia de referência rápida de comandos e fluxo de trabalho',
      ],
    },
    {
      type: 'closing',
      title: 'Próxima Aula',
      date: '16 de Maio',
      next: 'Stack Completa de um Projeto',
      nextDesc: 'Vamos dissecar o projeto que construímos hoje e entender cada peça da arquitetura.',
      color: '#d97757',
      icon: '🏗️',
    },
  ],

  2: [
    {
      type: 'cover',
      aula: 'Encontro 2',
      date: '16 de Maio de 2026',
      title: 'Stack Completa de um Projeto',
      subtitle: 'Arquitetura, vocabulário técnico e entendimento profundo da aplicação',
      color: '#6ea8fe',
      icon: '🏗️',
    },
    {
      type: 'agenda',
      title: 'O que vamos ver hoje',
      color: '#6ea8fe',
      items: [
        '01 — Estrutura de pastas e decisões de arquitetura',
        '02 — As camadas da aplicação',
        '03 — Leitura de código gerado por IA',
        '04 — Vocabulário técnico essencial',
        '05 — Prompts orientados à stack',
      ],
    },
    {
      type: 'content',
      badge: 'Parte 01',
      title: 'Estrutura de Pastas',
      subtitle: 'Cada arquivo tem um propósito',
      color: '#6ea8fe',
      blocks: [
        {
          icon: '📁',
          label: 'src/',
          text: 'Código-fonte da aplicação — onde a mágica acontece',
        },
        {
          icon: '⚙️',
          label: 'package.json',
          text: 'Lista de dependências e scripts do projeto',
        },
        {
          icon: '🐳',
          label: 'Dockerfile',
          text: 'Receita para empacotar a aplicação em um container',
        },
        {
          icon: '🌿',
          label: '.env',
          text: 'Variáveis de ambiente — configurações sensíveis fora do código',
        },
      ],
    },
    {
      type: 'layers',
      badge: 'Parte 02',
      title: 'As Camadas da Aplicação',
      color: '#6ea8fe',
      layers: [
        { icon: '🖥️', label: 'Frontend', text: 'O que o usuário vê e clica — React, HTML, CSS', color: '#6ea8fe' },
        { icon: '⚡', label: 'Backend / API', text: 'A lógica de negócio — processa pedidos e responde dados', color: '#a78bfa' },
        { icon: '🗄️', label: 'Banco de Dados', text: 'Onde os dados vivem — PostgreSQL, SQLite, MongoDB', color: '#6ee7b7' },
        { icon: '🔗', label: 'Integrações', text: 'Serviços externos — pagamentos, e-mail, IA, mapas', color: '#f472b6' },
      ],
    },
    {
      type: 'list',
      badge: 'Parte 03',
      title: 'Lendo Código Gerado por IA',
      subtitle: 'Você não precisa memorizar — precisa entender',
      color: '#6ea8fe',
      items: [
        'Leia de cima para baixo: importações → definições → lógica',
        'Pergunte ao Claude: "O que faz essa função?"',
        'Use o Claude para explicar partes que não entendeu',
        'Identifique padrões que se repetem — são convenções da stack',
        'Foque em entender o PORQUÊ, não decorar o COMO',
        'Código que você não entende é código que você não controla',
      ],
    },
    {
      type: 'glossary',
      badge: 'Parte 04',
      title: 'Vocabulário Técnico Essencial',
      color: '#6ea8fe',
      terms: [
        { term: 'Componente', def: 'Bloco reutilizável de interface (botão, card, formulário)' },
        { term: 'Rota / Endpoint', def: 'Endereço que o servidor responde — ex: /api/usuarios' },
        { term: 'Estado (State)', def: 'Dados que mudam na tela sem recarregar a página' },
        { term: 'Request / Response', def: 'Pedido do cliente → resposta do servidor' },
        { term: 'CRUD', def: 'Create, Read, Update, Delete — as 4 operações básicas de dados' },
        { term: 'Deploy', def: 'Publicar a aplicação para que outros possam acessar' },
      ],
    },
    {
      type: 'list',
      badge: 'Parte 05',
      title: 'Prompts Orientados à Stack',
      subtitle: 'Fale a língua do seu projeto',
      color: '#6ea8fe',
      items: [
        '"Adicione um endpoint GET /api/produtos que retorna todos os produtos"',
        '"Crie um componente React de card de produto com nome, preço e botão"',
        '"Adicione validação de e-mail no formulário de cadastro"',
        '"Crie uma migration para adicionar coluna status na tabela pedidos"',
        '"Adicione autenticação JWT nas rotas protegidas"',
        '"Documente esta função com um comentário explicativo"',
      ],
    },
    {
      type: 'deliverables',
      title: 'Entregáveis do Encontro',
      color: '#6ea8fe',
      icon: '🏗️',
      items: [
        'Mapa visual da stack do projeto com anotações técnicas',
        'Glossário de vocabulário técnico produzido coletivamente',
        'Documentação básica da arquitetura do projeto exemplo',
        'Conjunto de prompts eficazes catalogados por camada da aplicação',
      ],
    },
    {
      type: 'closing',
      title: 'Próxima Aula',
      date: '23 de Maio',
      next: 'Fluxo de Equipe, Git e Segurança',
      nextDesc: 'Aprender a trabalhar em equipe, versionar código e proteger dados sensíveis.',
      color: '#6ea8fe',
      icon: '🔐',
    },
  ],

  3: [
    {
      type: 'cover',
      aula: 'Encontro 3',
      date: '23 de Maio de 2026',
      title: 'Fluxo de Equipe, Git e Segurança',
      subtitle: 'Colaboração profissional, versionamento e proteção de dados sensíveis',
      color: '#a78bfa',
      icon: '🔐',
    },
    {
      type: 'agenda',
      title: 'O que vamos ver hoje',
      color: '#a78bfa',
      items: [
        '01 — Git e versionamento de código',
        '02 — Organização de projetos com IA',
        '03 — Segurança da informação',
        '04 — Uso correto do .env',
        '05 — Revisão crítica de código gerado por IA',
        '06 — Fluxo de trabalho padronizado',
      ],
    },
    {
      type: 'content',
      badge: 'Parte 01',
      title: 'Git — Controle de Versão',
      subtitle: 'O histórico do seu projeto é sagrado',
      color: '#a78bfa',
      blocks: [
        {
          icon: '🌿',
          label: 'Branch',
          text: 'Uma linha independente de desenvolvimento — trabalhe sem quebrar o principal',
        },
        {
          icon: '📸',
          label: 'Commit',
          text: 'Um ponto salvo na história do projeto com uma mensagem descritiva',
        },
        {
          icon: '🔀',
          label: 'Merge',
          text: 'Unir o trabalho de duas branches em uma só',
        },
        {
          icon: '🔍',
          label: 'Pull Request',
          text: 'Pedido para revisar e aprovar mudanças antes de integrar',
        },
      ],
    },
    {
      type: 'list',
      badge: 'Parte 01',
      title: 'Fluxo Git em Equipe',
      subtitle: 'O passo a passo que evita conflitos',
      color: '#a78bfa',
      items: [
        'git pull — sempre comece buscando as mudanças mais recentes',
        'git checkout -b feature/nome — crie uma branch para cada funcionalidade',
        'Faça commits pequenos e frequentes com mensagens claras',
        'git push — envie sua branch para o repositório remoto',
        'Abra um Pull Request e peça revisão de um colega',
        'Merge aprovado → delete a branch → repita o ciclo',
      ],
    },
    {
      type: 'highlight',
      badge: 'Parte 03',
      title: 'Segurança da Informação',
      color: '#a78bfa',
      quote: 'O que não deve estar no código nunca deve ter estado no código.',
      steps: [
        { num: '🚫', label: 'Nunca', text: 'Chaves de API, senhas, tokens no código' },
        { num: '🚫', label: 'Nunca', text: 'Dados de clientes ou cartão de crédito hardcoded' },
        { num: '✅', label: 'Sempre', text: 'Variáveis de ambiente para credenciais' },
        { num: '✅', label: 'Sempre', text: '.gitignore com .env, node_modules, builds' },
      ],
    },
    {
      type: 'content',
      badge: 'Parte 04',
      title: 'O Arquivo .env',
      subtitle: 'Separe configuração de código',
      color: '#a78bfa',
      blocks: [
        {
          icon: '🔧',
          label: '.env.development',
          text: 'Credenciais do ambiente local — banco de desenvolvimento, APIs de teste',
        },
        {
          icon: '🚀',
          label: '.env.production',
          text: 'Credenciais reais — nunca compartilhadas, nunca commitadas',
        },
        {
          icon: '📋',
          label: '.env.example',
          text: 'Template das variáveis necessárias — SEM os valores reais — este vai no Git',
        },
        {
          icon: '🚫',
          label: '.gitignore',
          text: 'Liste .env e .env.production para que nunca sejam commitados',
        },
      ],
    },
    {
      type: 'list',
      badge: 'Parte 05',
      title: 'Revisão Crítica de Código IA',
      subtitle: 'Confie, mas verifique',
      color: '#a78bfa',
      items: [
        'Leia cada arquivo gerado antes de commitar',
        'Procure por credenciais hardcoded ou dados sensíveis',
        'Verifique se a lógica de negócio faz sentido para o seu contexto',
        'Teste as funcionalidades antes de fazer push',
        'Use o Claude para revisar o próprio código: "Tem alguma vulnerabilidade aqui?"',
        'Um código não entendido em produção é uma bomba-relógio',
      ],
    },
    {
      type: 'deliverables',
      title: 'Entregáveis do Encontro',
      color: '#a78bfa',
      icon: '🔐',
      items: [
        'Repositório versionado com histórico de commits organizado',
        'Arquivo .env configurado com separação entre desenvolvimento e produção',
        'Checklist de segurança da informação para projetos com IA',
        'Fluxo de trabalho documentado e validado para uso contínuo pela equipe',
      ],
    },
    {
      type: 'closing',
      title: 'Próxima Aula',
      date: '30 de Maio',
      next: 'Deploy em Ambiente de Produção',
      nextDesc: 'Publicar a aplicação para o mundo — com segurança, estabilidade e monitoramento.',
      color: '#a78bfa',
      icon: '🌐',
    },
  ],

  4: [
    {
      type: 'cover',
      aula: 'Encontro 4',
      date: '30 de Maio de 2026',
      title: 'Deploy em Ambiente de Produção',
      subtitle: 'Do localhost para o mundo — com segurança e estabilidade',
      color: '#6ee7b7',
      icon: '🌐',
    },
    {
      type: 'agenda',
      title: 'O que vamos ver hoje',
      color: '#6ee7b7',
      items: [
        '01 — Preparação da aplicação para produção',
        '02 — Variáveis de ambiente em produção',
        '03 — Plataformas e estratégias de deploy',
        '04 — Monitoramento pós-deploy',
        '05 — Próximos passos após a mentoria',
      ],
    },
    {
      type: 'list',
      badge: 'Parte 01',
      title: 'Preparação para Produção',
      subtitle: 'Produção não é desenvolvimento',
      color: '#6ee7b7',
      items: [
        'Build de produção: npm run build gera os arquivos otimizados',
        'Remover console.log, dados de teste e usuários fictícios',
        'Garantir que todas as variáveis de ambiente estão configuradas',
        'Testar o fluxo completo em ambiente de staging antes',
        'Revisar dependências: remover pacotes não utilizados',
        'Verificar se o .gitignore está correto e nada sensível foi commitado',
      ],
    },
    {
      type: 'content',
      badge: 'Parte 02',
      title: 'Variáveis de Ambiente em Produção',
      subtitle: 'Configuração segura no servidor',
      color: '#6ee7b7',
      blocks: [
        {
          icon: '🔑',
          label: 'DATABASE_URL',
          text: 'String de conexão com o banco de dados de produção',
        },
        {
          icon: '🔐',
          label: 'JWT_SECRET',
          text: 'Chave secreta para autenticação — longa, aleatória, única',
        },
        {
          icon: '🌐',
          label: 'API_URL',
          text: 'URL do backend em produção — diferente do localhost',
        },
        {
          icon: '📧',
          label: 'SMTP / RESEND_KEY',
          text: 'Credenciais do serviço de e-mail transacional',
        },
      ],
    },
    {
      type: 'layers',
      badge: 'Parte 03',
      title: 'Plataformas de Deploy',
      color: '#6ee7b7',
      layers: [
        { icon: '🚂', label: 'Railway', text: 'Deploy simples de containers Docker — recomendado para o curso', color: '#6ee7b7' },
        { icon: '▲', label: 'Vercel', text: 'Ideal para frontends estáticos e Next.js — CDN global automática', color: '#6ea8fe' },
        { icon: '🟣', label: 'Render', text: 'Boa alternativa ao Railway com free tier generoso', color: '#a78bfa' },
        { icon: '☁️', label: 'VPS / DigitalOcean', text: 'Controle total — mais complexo, mais flexível', color: '#f472b6' },
      ],
    },
    {
      type: 'list',
      badge: 'Parte 04',
      title: 'Monitoramento Pós-Deploy',
      subtitle: 'A aplicação está no ar — e agora?',
      color: '#6ee7b7',
      items: [
        'Verifique os logs imediatamente após o deploy',
        'Teste todos os fluxos críticos na URL de produção',
        'Configure alertas de erro (Railway, Sentry, Logtail)',
        'Monitore uso de memória e CPU na plataforma de hosting',
        'Defina um processo para rollback em caso de falha crítica',
        'Documente o acesso ao painel de produção para a equipe',
      ],
    },
    {
      type: 'highlight',
      badge: 'Parte 05',
      title: 'Próximos Passos',
      color: '#6ee7b7',
      quote: 'A mentoria termina. A evolução técnica da equipe começa agora.',
      steps: [
        { num: '📚', label: 'Aprender', text: 'Continue iterando no projeto com Claude Code' },
        { num: '🔁', label: 'Revisar', text: 'Releia o material das 4 aulas periodicamente' },
        { num: '🤝', label: 'Colaborar', text: 'Use o fluxo Git que aprendemos em todo projeto novo' },
        { num: '🚀', label: 'Evoluir', text: 'Cada projeto novo é uma oportunidade de ir além' },
      ],
    },
    {
      type: 'deliverables',
      title: 'Entregáveis do Encontro',
      color: '#6ee7b7',
      icon: '🌐',
      items: [
        'Aplicação publicada e acessível em ambiente de produção',
        'Pipeline de deploy documentado e replicável pela equipe',
        'Relatório de configurações de ambiente e acessos registrados',
        'Guia de próximos passos para evolução técnica autônoma da equipe',
      ],
    },
    {
      type: 'final',
      title: 'Parabéns!',
      subtitle: 'Você completou a mentoria Claude Code',
      color: '#6ee7b7',
      icon: '🎉',
      message: 'Em 4 encontros, você instalou, construiu, versionou e publicou. Agora é sua vez de continuar.',
    },
  ],
};
