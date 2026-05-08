export interface CourseDownload {
  name: string;
  url: string;
}

export interface CourseModule {
  id: number;
  slug: string;
  date: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  icon: string;
  topics: string[];
  deliverables: string[];
  tags: string[];
  downloads: CourseDownload[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const courseModules: CourseModule[] = [
  {
    id: 1,
    slug: 'projeto-do-zero',
    date: '09 de Maio',
    title: 'Projeto Exemplo do Zero',
    subtitle: 'Instalação, configuração e primeiro projeto completo',
    description:
      'Instalação e configuração do Claude Code, primeiros comandos e construção completa de um projeto exemplo do início ao fim.',
    color: '#d97757',
    icon: '🚀',
    topics: [
      'Instalação e configuração do ambiente Claude Code',
      'Primeiros comandos e fluxo de desenvolvimento',
      'Construção guiada de projeto exemplo do início ao fim',
      'Boas práticas iniciais de prompt aplicadas ao desenvolvimento de software',
    ],
    deliverables: [
      'Ambiente Claude Code instalado e configurado',
      'Projeto exemplo funcional desenvolvido durante o encontro',
      'Repositório inicial do projeto criado',
      'Guia de referência rápida de comandos',
    ],
    tags: ['VS Code', 'WSL', 'Docker', 'Claude Code', 'Primeiro Projeto'],
    downloads: [
      { name: 'Visual Studio Code', url: 'https://code.visualstudio.com/download' },
      { name: 'WSL (Windows Subsystem for Linux)', url: 'https://learn.microsoft.com/pt-br/windows/wsl/install' },
      { name: 'Docker Desktop', url: 'https://www.docker.com/get-started/' },
      { name: 'Claude Code Quickstart', url: 'https://code.claude.com/docs/en/quickstart' },
    ],
  },
  {
    id: 2,
    slug: 'stack-completa',
    date: '16 de Maio',
    title: 'Stack Completa de um Projeto',
    subtitle: 'Arquitetura, vocabulário técnico e entendimento profundo',
    description:
      'Análise detalhada da arquitetura gerada, construção de vocabulário técnico e capacidade de nomear cada elemento da stack.',
    color: '#6ea8fe',
    icon: '🏗️',
    topics: [
      'Estrutura de pastas e decisões de arquitetura',
      'Camadas da aplicação: frontend, backend, banco de dados e integrações',
      'Leitura e interpretação de código gerado por IA',
      'Vocabulário técnico essencial para equipes',
      'Técnicas de prompt orientadas ao conhecimento da stack',
    ],
    deliverables: [
      'Mapa visual da stack com anotações técnicas',
      'Glossário de vocabulário técnico produzido coletivamente',
      'Documentação básica da arquitetura do projeto',
      'Prompts eficazes catalogados por camada da aplicação',
    ],
    tags: ['Arquitetura', 'Frontend', 'Backend', 'API REST', 'Banco de Dados'],
    downloads: [],
  },
  {
    id: 3,
    slug: 'fluxo-equipe-git-seguranca',
    date: '23 de Maio',
    title: 'Fluxo de Equipe, Git e Segurança',
    subtitle: 'Colaboração profissional e proteção de dados',
    description:
      'Versionamento com Git, trabalho em equipe com branches e PRs, e práticas essenciais de segurança da informação.',
    color: '#a78bfa',
    icon: '🔐',
    topics: [
      'Git e versionamento: branches, commits e merge',
      'Estruturação e organização de projetos com IA',
      'Segurança da informação: o que nunca deve ser exposto',
      'Uso do arquivo .env: boas práticas e separação de ambientes',
      'Revisão e validação crítica de código gerado por IA',
      'Definição de fluxo de trabalho padronizado para a equipe',
    ],
    deliverables: [
      'Repositório versionado com histórico de commits organizado',
      'Arquivo .env configurado com separação de ambientes',
      'Checklist de segurança da informação para projetos com IA',
      'Fluxo de trabalho documentado e validado pela equipe',
    ],
    tags: ['Git', 'Branches', 'Pull Requests', '.env', 'Segurança'],
    downloads: [],
  },
  {
    id: 4,
    slug: 'deploy-producao',
    date: '30 de Maio',
    title: 'Deploy em Ambiente de Produção',
    subtitle: 'Do localhost para o mundo',
    description:
      'Publicação da aplicação em produção com atenção a segurança, estabilidade e monitoramento pós-deploy.',
    color: '#6ee7b7',
    icon: '🌐',
    topics: [
      'Preparação da aplicação para produção com Claude Code',
      'Configuração de variáveis de ambiente e segurança',
      'Plataformas e estratégias de deploy recomendadas',
      'Monitoramento e tratamento de problemas pós-deploy',
      'Orientações para evolução técnica contínua da equipe',
    ],
    deliverables: [
      'Aplicação publicada e acessível em produção',
      'Pipeline de deploy documentado e replicável',
      'Relatório de configurações de ambiente e acessos',
      'Guia de próximos passos para evolução técnica autônoma',
    ],
    tags: ['Deploy', 'Railway', 'HTTPS', 'Monitoramento', 'Produção'],
    downloads: [],
  },
];

export const faqItems: FaqItem[] = [
  {
    question: 'Preciso saber programar?',
    answer:
      'Não. O curso é pensado para quem está começando. Você vai aprender do zero, usando IA como parceira para acelerar o aprendizado.',
  },
  {
    question: 'Preciso de computador potente?',
    answer:
      'Um notebook com Windows 10/11, 8GB de RAM e 20GB de espaço livre é suficiente. Recomendamos 16GB para maior conforto.',
  },
  {
    question: 'Funciona no Windows?',
    answer: 'Sim! O curso inteiro é pensado para Windows. Usamos WSL para ter o melhor dos dois mundos.',
  },
  {
    question: 'Preciso de conta no Claude?',
    answer:
      'Sim, é necessária uma assinatura Claude (Pro, Max, Team ou Enterprise). Orientamos como criar a conta na primeira aula.',
  },
  {
    question: 'E se eu perder uma aula?',
    answer:
      'Todo o material (ebooks, apresentações, guias) ficará disponível. Mas recomendamos participar de todas as aulas.',
  },
  {
    question: 'É só teoria?',
    answer:
      '100% prático. Cada aula tem mão na massa. Você sai do curso com um projeto real publicado na internet.',
  },
  {
    question: 'Quais dias e horários?',
    answer: 'Sábados de manhã: 09, 16, 23 e 30 de maio de 2026.',
  },
];
