export const ebookContent: Record<number, string> = {
  1: `# Aula 01 — Projeto Exemplo do Zero

## Pré-requisitos e Downloads

Antes de começar, faça o download de todas as ferramentas:

| Ferramenta | Finalidade |
|---|---|
| **Visual Studio Code** | Editor de código principal |
| **WSL** | Ambiente Linux dentro do Windows |
| **Docker Desktop** | Containerização de aplicações |
| **Claude Code** | Assistente de IA para desenvolvimento |

### Requisitos de Sistema
- Windows 10 versão 2004+ ou Windows 11
- RAM: Mínimo 8 GB (recomendado 16 GB)
- Espaço em disco: 20 GB livres
- Conta Claude: Pro, Max, Team ou Enterprise

---

## Instalação do Visual Studio Code

1. Acesse o site oficial e baixe o instalador
2. Marque: "Adicionar ao PATH", "Abrir com Code" no menu de contexto
3. Extensões recomendadas: **WSL**, **Claude Code**, **Portuguese Language Pack**

---

## Instalação do WSL

\`\`\`powershell
# PowerShell como Administrador
wsl --install
\`\`\`

Reinicie o computador. Crie usuário e senha no Ubuntu. Verifique:

\`\`\`powershell
wsl --list --verbose
\`\`\`

---

## Instalação do Docker Desktop

1. Baixe e instale o Docker Desktop
2. Marque **"Use WSL 2 instead of Hyper-V"**
3. Habilite a integração Ubuntu em Settings > Resources > WSL Integration

\`\`\`bash
docker --version
docker run hello-world
\`\`\`

---

## Instalação do Claude Code

**PowerShell:**
\`\`\`powershell
irm https://claude.ai/install.ps1 | iex
\`\`\`

**WSL/Linux:**
\`\`\`bash
curl -fsSL https://claude.ai/install.sh | bash
\`\`\`

Primeiro login:
\`\`\`bash
claude
# Siga as instruções para autenticar
\`\`\`

---

## Primeiros Comandos

| Comando | O que faz |
|---|---|
| \`claude\` | Inicia o modo interativo |
| \`claude "tarefa"\` | Executa uma tarefa pontual |
| \`claude -p "pergunta"\` | Consulta rápida |
| \`claude -c\` | Continua a conversa mais recente |
| \`/help\` | Mostra comandos disponíveis |
| \`/clear\` | Limpa o histórico |
| \`exit\` ou \`Ctrl+D\` | Sai do Claude Code |

### Ciclo de Trabalho

\`\`\`
DESCREVA → ANALISE → PROPONHA → APROVE → EXECUTE → VALIDE
\`\`\`

---

## Construção do Projeto Exemplo

\`\`\`bash
mkdir ~/meu-projeto-todo
cd ~/meu-projeto-todo
claude
\`\`\`

**Prompt:**
\`\`\`
crie um projeto de lista de tarefas (to-do list) com:
1. Backend em Node.js com Express
2. Frontend em HTML, CSS e JavaScript puro
3. Banco de dados SQLite
4. API REST completa
5. Interface limpa e responsiva
6. docker-compose.yml
\`\`\`

---

## Boas Práticas de Prompt

| Ruim | Bom |
|---|---|
| "arrume o bug" | "corrija o bug onde o formulário aceita campos vazios" |
| "faça o site" | "crie uma página de cadastro com campos nome, email e senha" |
| "melhore o código" | "refatore calcularTotal() para usar async/await" |

**Dicas:**
- Seja específico
- Use instruções passo a passo
- Deixe o Claude explorar primeiro
- Peça explicações
- Itere sobre o resultado
`,

  2: `# Aula 02 — Stack Completa de um Projeto

## O que é uma Stack?

**Stack** = conjunto de tecnologias usadas em um projeto.

Nossa stack:
- **Frontend**: HTML + CSS + JavaScript
- **Backend**: Node.js + Express
- **Banco de Dados**: SQLite
- **Infraestrutura**: Docker
- **IA**: Claude Code

---

## Estrutura de Pastas

\`\`\`
meu-projeto-todo/
├── package.json          # Manifesto do projeto
├── docker-compose.yml    # Orquestração de containers
├── server/
│   ├── index.js          # Ponto de entrada do backend
│   ├── routes/tasks.js   # Rotas da API
│   └── database/db.js    # Configuração do banco
├── public/
│   ├── index.html        # Página principal
│   ├── style.css         # Estilos visuais
│   └── app.js            # Lógica do frontend
└── tests/
    └── tasks.test.js     # Testes automatizados
\`\`\`

---

## Frontend — Os 3 Pilares

| Tecnologia | Papel | Analogia |
|---|---|---|
| **HTML** | Estrutura | Esqueleto |
| **CSS** | Aparência | Roupa |
| **JavaScript** | Comportamento | Cérebro |

---

## Backend — API REST

| Verbo | Ação | Endpoint |
|---|---|---|
| \`GET\` | Ler | \`/api/tasks\` |
| \`POST\` | Criar | \`/api/tasks\` |
| \`PUT\` | Atualizar | \`/api/tasks/1\` |
| \`DELETE\` | Deletar | \`/api/tasks/1\` |

**Status Codes**: 200 OK, 201 Created, 400 Bad Request, 404 Not Found, 500 Error

---

## Banco de Dados — CRUD

| Operação | SQL |
|---|---|
| **C**reate | \`INSERT INTO tasks (title) VALUES ('Estudar')\` |
| **R**ead | \`SELECT * FROM tasks\` |
| **U**pdate | \`UPDATE tasks SET completed = 1 WHERE id = 1\` |
| **D**elete | \`DELETE FROM tasks WHERE id = 1\` |

---

## Fluxo de uma Requisição

\`\`\`
1. Usuário clica "Adicionar"
2. JavaScript captura o evento
3. Fetch API → POST /api/tasks
4. Express recebe → Middleware processa
5. Rota encontrada → Controller executa
6. INSERT no SQLite → Banco retorna ID
7. Resposta 201 → JavaScript atualiza DOM
8. Tarefa aparece na tela
\`\`\`

---

## Vocabulário Técnico Essencial

| Termo | Definição |
|---|---|
| **Stack** | Conjunto de tecnologias |
| **API** | Interface de comunicação entre sistemas |
| **REST** | Padrão de arquitetura para APIs |
| **Endpoint** | URL específica da API |
| **Middleware** | Função intermediária no processamento |
| **CRUD** | Create, Read, Update, Delete |
| **Schema** | Estrutura do banco de dados |
| **Container** | Ambiente isolado (Docker) |
| **DOM** | Representação da página HTML |
| **Deploy** | Publicação em produção |

---

## Prompts por Camada

**Frontend:**
\`\`\`
explique como HTML, CSS e JS se conectam nesta página
\`\`\`

**Backend:**
\`\`\`
liste todos os endpoints com verbos HTTP e parâmetros
\`\`\`

**Banco:**
\`\`\`
mostre o schema com todas as tabelas e colunas
\`\`\`

**Infra:**
\`\`\`
explique o docker-compose.yml linha por linha
\`\`\`
`,

  3: `# Aula 03 — Fluxo de Equipe, Git e Segurança

## O que é Git?

Sistema de **controle de versão** — rastreia todas as mudanças do projeto.

| Sem Git | Com Git |
|---|---|
| "Qual versão funcionava?" | \`git log\` |
| "Quem mudou isso?" | \`git blame\` |
| "Perdi meu código!" | \`git checkout\` |
| "Quebrou tudo!" | \`git revert\` |

---

## Os 3 Estados do Git

\`\`\`
Working Directory → Staging Area → Repository
     (edições)       (git add)     (git commit)
\`\`\`

### Comandos Essenciais

\`\`\`bash
git status              # O que mudou?
git add arquivo.js      # Preparar
git commit -m "msg"     # Salvar no histórico
git push                # Enviar ao remoto
git log --oneline       # Ver histórico
\`\`\`

---

## Boas Mensagens de Commit

| Tipo | Quando |
|---|---|
| \`feat\` | Nova funcionalidade |
| \`fix\` | Correção de bug |
| \`docs\` | Documentação |
| \`refactor\` | Refatoração |
| \`test\` | Testes |
| \`chore\` | Manutenção |

Exemplo: \`feat: adiciona filtro de tarefas por prioridade\`

---

## Branches

\`\`\`bash
git checkout -b feature/filtro     # Criar branch
git branch                          # Listar
git checkout main                   # Trocar
\`\`\`

**Fluxo:**
1. Criar branch → 2. Desenvolver → 3. Push → 4. Pull Request → 5. Revisão → 6. Merge

---

## Git com Claude Code

\`\`\`
quais arquivos foram modificados?
faça commit com mensagem descritiva
crie branch para funcionalidade X
ajude a resolver conflitos de merge
\`\`\`

---

## Segurança: O que NUNCA expor

| NUNCA no código | Risco |
|---|---|
| Chaves de API | Acesso não autorizado |
| Senhas de banco | Dados comprometidos |
| Tokens de auth | Roubo de identidade |
| Dados pessoais | Violação LGPD |

---

## O Arquivo .env

\`\`\`env
PORT=3000
NODE_ENV=development
DATABASE_URL=sqlite://./database.sqlite
API_KEY=sua-chave-secreta
\`\`\`

**Regras:**
- \`.env\` no \`.gitignore\` (NUNCA commitar)
- \`.env.example\` como template (SIM, vai pro Git)
- Variáveis separadas por ambiente (dev, test, prod)

---

## Checklist de Segurança

- [ ] .env no .gitignore
- [ ] Nenhuma credencial hardcoded
- [ ] .env.example existe (sem valores reais)
- [ ] Inputs do usuário validados
- [ ] SQL parametrizado
- [ ] Código da IA revisado

---

## Fluxo de Trabalho da Equipe

\`\`\`
1. Pegar tarefa
2. Criar branch (feature/nome)
3. Desenvolver com Claude Code
4. Testar localmente
5. Commits pequenos e descritivos
6. Push para o remoto
7. Criar Pull Request
8. Revisão por outro membro
9. Merge na main
10. Deploy
\`\`\`
`,

  4: `# Aula 04 — Deploy em Produção

## Desenvolvimento vs Produção

| Aspecto | Dev | Produção |
|---|---|---|
| Quem acessa | Só você | Qualquer pessoa |
| Erros | Detalhados | Genéricos |
| URL | localhost:3000 | seusite.com |
| HTTPS | Opcional | Obrigatório |
| Debug | ON | OFF |

---

## Preparação para Produção

\`\`\`javascript
// ERRADO
const port = 3000;
const apiKey = 'sk-abc123';

// CORRETO
const port = process.env.PORT || 3000;
const apiKey = process.env.API_KEY;
\`\`\`

### Health Check
\`\`\`javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});
\`\`\`

---

## Plataformas de Deploy

| Plataforma | Melhor para | Free? |
|---|---|---|
| **Railway** | Full-stack + DB | Sim* |
| **Vercel** | Frontend/APIs | Sim |
| **Render** | Full-stack | Sim* |
| **Fly.io** | Docker | Sim* |

---

## Deploy no Railway

1. Login com GitHub em railway.app
2. "New Project" → "Deploy from GitHub repo"
3. Selecionar repositório
4. Configurar variáveis de ambiente
5. Adicionar banco PostgreSQL se necessário
6. Gerar domínio em Settings > Networking

---

## Dockerfile para Produção

\`\`\`dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s \\
  CMD wget --spider http://localhost:3000/health || exit 1
CMD ["node", "server/index.js"]
\`\`\`

---

## Monitoramento

| Métrica | Como verificar |
|---|---|
| Uptime | Health check endpoint |
| Tempo de resposta | Painel da plataforma |
| Erros | Logs da plataforma |
| CPU/RAM | Métricas da plataforma |

Ferramentas: **UptimeRobot**, **Sentry**, **LogDNA**

---

## Pipeline de Deploy

\`\`\`
Código pronto (main) → Testes passando → Push
→ Plataforma detecta → Build automático
→ Deploy automático → Health check OK
→ Aplicação no ar!
\`\`\`

---

## Próximos Passos

**Mês 1-2:** Git diário, Claude Code em tudo, testes automatizados

**Mês 3-4:** TypeScript, React/Vue, autenticação, CI/CD

**Mês 5-6:** Microserviços, PostgreSQL avançado, Redis, arquitetura
`,
};
