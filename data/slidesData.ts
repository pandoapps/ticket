export interface CoverSlide {
  type: 'cover';
  aula: string;
  date: string;
  title: string;
  subtitle: string;
  color: string;
  icon: string;
}

export interface PresenterSlide {
  type: 'presenter';
  name: string;
  role: string;
  color: string;
  bullets: string[];
  cta: string;
  photoUrl?: string;
}

export interface StorySlide {
  type: 'story';
  title: string;
  color: string;
  hint: string;
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

export interface ListSlide {
  type: 'list';
  badge: string;
  title: string;
  subtitle?: string;
  color: string;
  items: string[];
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
    },
    {
      type: 'presenter',
      name: 'Thiago Ferreira',
      role: 'Mentor de Vibe Coding · São José dos Campos',
      color: '#d97757',
      photoUrl: '/images/thiago.png',
      bullets: [
        'Desenvolvedor há mais de duas décadas, com mais de 100 projetos publicados',
        'Criador do método Vibe Coding — programar conversando com IA',
        'Acredita que programar é transformar ideias em realidade, não decorar sintaxe',
        'Ajuda pessoas comuns a criar suas próprias soluções com tecnologia',
      ],
      cta: '@cafecomcifrao',
    },
    {
      type: 'presenter',
      name: 'Jéfte Pavam',
      role: 'Empresário · Necsos',
      color: '#d97757',
      photoUrl: '/images/jefte.jpeg',
      bullets: [
        'Empresário e fundador da Necsos',
        'Atuante na área de telecomunicações',
        'Diretor BNI',
        'Pai de 2 programadores em crescimento',
      ],
      cta: '@jeftepavam',
    },
    {
      type: 'story',
      title: 'Minha História',
      color: '#d97757',
      hint: '— espaço para você contar —',
    },
    {
      type: 'agenda',
      title: 'O que vamos ver hoje',
      color: '#d97757',
      items: [
        '01 — Instalação e configuração do ambiente',
        '02 — Quando criar um projeto',
        '03 — Criando as interfaces',
        '04 — Primeiros comandos e fluxo de trabalho',
        '05 — Construção do projeto do zero ao fim',
        '06 — Boas práticas de prompt',
      ],
    },
    {
      type: 'content',
      badge: 'Parte 01',
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
      type: 'list',
      badge: 'Parte 02',
      title: 'Quando Criar um Projeto',
      subtitle: 'Identificando a oportunidade certa',
      color: '#d97757',
      items: [
        'Quando você consegue descrever em uma frase o que o projeto faz',
        'Quando há um problema real seu ou de alguém próximo',
        'Quando o esforço de criar é menor que o esforço de não ter',
        'Quando você sabe quem vai usar e como',
        'Quando o escopo cabe em um fim de semana — comece pequeno',
      ],
    },
    {
      type: 'list',
      badge: 'Parte 03',
      title: 'Criando as Interfaces',
      subtitle: 'Conhecendo o Google AI Studio',
      color: '#d97757',
      items: [
        'Comece pelas telas que o usuário toca primeiro',
        'Descreva a UI em linguagem natural: "uma página com X, Y e Z"',
        'Pense mobile-first — funciona no celular, funciona em qualquer lugar',
        'Itere com o Claude: peça, veja o resultado, ajuste',
        'Use componentes reutilizáveis para manter o visual consistente',
      ],
    },
    {
      type: 'list',
      badge: 'Parte 04',
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
      type: 'deliverables',
      title: 'Entregáveis do Encontro',
      color: '#d97757',
      icon: '🚀',
      items: [
        'Ambiente Claude Code instalado e configurado em todas as máquinas',
        'Projeto exemplo funcional, desenvolvido durante o encontro',
        'Repositório inicial do projeto criado e acessível à equipe',
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
