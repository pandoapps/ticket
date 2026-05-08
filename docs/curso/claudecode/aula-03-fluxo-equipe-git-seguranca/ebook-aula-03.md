# Aula 03 — Fluxo de Trabalho em Equipe, Versionamento e Segurança

## Curso de Claude Code — Pandô APPs

---

## Sumário

1. [Introdução](#1-introdução)
2. [Git — O que é e Por que Usar](#2-git--o-que-é-e-por-que-usar)
3. [Conceitos Fundamentais do Git](#3-conceitos-fundamentais-do-git)
4. [Fluxo de Trabalho com Git](#4-fluxo-de-trabalho-com-git)
5. [Branches — Trabalhando em Paralelo](#5-branches--trabalhando-em-paralelo)
6. [Merge e Resolução de Conflitos](#6-merge-e-resolução-de-conflitos)
7. [Git com Claude Code](#7-git-com-claude-code)
8. [Segurança da Informação](#8-segurança-da-informação)
9. [O Arquivo .env](#9-o-arquivo-env)
10. [Revisão de Código Gerado por IA](#10-revisão-de-código-gerado-por-ia)
11. [Fluxo de Trabalho Padronizado para Equipe](#11-fluxo-de-trabalho-padronizado-para-equipe)
12. [Checklist de Entregáveis](#12-checklist-de-entregáveis)

---

## 1. Introdução

Neste encontro, saímos do desenvolvimento individual e entramos na dimensão colaborativa. Vamos aprender a:

- Versionar código com Git (guardar histórico de todas as mudanças)
- Trabalhar em equipe sem conflitos
- Proteger informações sensíveis
- Criar um fluxo de trabalho profissional

Estas habilidades são **essenciais** para qualquer projeto real.

---

## 2. Git — O que é e Por que Usar

### O que é Git?

Git é um **sistema de controle de versão** — ele rastreia todas as mudanças feitas nos arquivos do seu projeto ao longo do tempo.

**Analogia**: Imagine o Google Docs, onde você pode ver o histórico de todas as edições e voltar para qualquer versão anterior. O Git faz isso para todo o seu projeto de código.

### Por que usar?

| Sem Git | Com Git |
|---|---|
| "Qual era a versão que funcionava?" | `git log` — vejo todo o histórico |
| "Quem mudou esse arquivo?" | `git blame` — sei exatamente quem e quando |
| "Perdi meu código!" | `git checkout` — recupero qualquer versão |
| "Vamos trabalhar no mesmo arquivo" | Branches — cada um trabalha isolado |
| "A mudança quebrou tudo!" | `git revert` — desfaço com segurança |

### Onde hospedar o repositório

| Plataforma | Ideal para |
|---|---|
| **GitHub** | Projetos open source e equipes |
| **GitLab** | Empresas que querem CI/CD integrado |
| **Bitbucket** | Equipes que usam ferramentas Atlassian |

---

## 3. Conceitos Fundamentais do Git

### Repositório (Repo)
A pasta do projeto rastreada pelo Git. Contém todo o código e o histórico de mudanças.

```bash
# Criar um novo repositório
git init

# Clonar um repositório existente
git clone https://github.com/usuario/projeto.git
```

### Commit
Um "snapshot" do estado do projeto em um momento específico. Cada commit tem:
- **Hash**: Identificador único (ex: `a1b2c3d`)
- **Mensagem**: Descrição do que foi mudado
- **Autor**: Quem fez a mudança
- **Data**: Quando foi feita

```bash
# Adicionar arquivos ao staging
git add arquivo.js

# Criar o commit
git commit -m "adiciona validação no formulário de tarefas"
```

### Os 3 Estados do Git

```
┌──────────────┐     git add     ┌──────────────┐    git commit   ┌──────────────┐
│  WORKING     │ ──────────────→ │   STAGING    │ ──────────────→ │  REPOSITORY  │
│  DIRECTORY   │                 │   AREA       │                 │  (Histórico) │
│              │                 │              │                 │              │
│ Seus arquivos│                 │ Preparados   │                 │ Salvos no    │
│ locais       │                 │ para commit  │                 │ histórico    │
└──────────────┘                 └──────────────┘                 └──────────────┘
```

1. **Working Directory**: Seus arquivos como estão agora
2. **Staging Area**: Arquivos marcados para o próximo commit
3. **Repository**: Histórico de commits salvo

### Comandos Essenciais

| Comando | O que faz |
|---|---|
| `git init` | Inicializa um repositório |
| `git status` | Mostra o estado atual |
| `git add <arquivo>` | Adiciona ao staging |
| `git add .` | Adiciona todos os arquivos |
| `git commit -m "msg"` | Cria um commit |
| `git log` | Mostra o histórico |
| `git log --oneline` | Histórico resumido |
| `git diff` | Mostra mudanças não commitadas |
| `git checkout <hash>` | Volta para um commit específico |

---

## 4. Fluxo de Trabalho com Git

### Fluxo Básico (para iniciantes)

```bash
# 1. Ver o que mudou
git status

# 2. Adicionar mudanças
git add .

# 3. Criar commit com mensagem descritiva
git commit -m "adiciona funcionalidade X"

# 4. Enviar para o repositório remoto
git push
```

### Boas Práticas de Commit

#### Mensagens de Commit

Use mensagens claras e descritivas no formato:

```
tipo: descrição curta do que foi feito

Corpo opcional com mais detalhes sobre o porquê.
```

**Tipos comuns**:
| Tipo | Quando usar | Exemplo |
|---|---|---|
| `feat` | Nova funcionalidade | `feat: adiciona filtro de tarefas por prioridade` |
| `fix` | Correção de bug | `fix: corrige erro ao salvar tarefa sem título` |
| `docs` | Documentação | `docs: atualiza README com instruções de instalação` |
| `style` | Formatação (sem mudar lógica) | `style: ajusta indentação no arquivo de rotas` |
| `refactor` | Refatoração | `refactor: simplifica lógica de validação` |
| `test` | Testes | `test: adiciona testes para endpoint de tarefas` |
| `chore` | Manutenção geral | `chore: atualiza dependências do projeto` |

#### Frequência de Commits

- Faça commits **pequenos e frequentes**
- Cada commit deve representar **uma mudança lógica**
- Evite commits gigantes com muitas mudanças misturadas

---

## 5. Branches — Trabalhando em Paralelo

### O que é uma Branch?

Uma **branch** (ramificação) é uma cópia independente do código onde você pode fazer mudanças sem afetar o código principal.

```
main ─────●─────●─────●─────●─────●──────
                │                  ↑
                └──●──●──●────────┘
                feature/filtro
```

### Branches Principais

| Branch | Finalidade |
|---|---|
| `main` (ou `master`) | Código estável, pronto para produção |
| `develop` | Código de desenvolvimento |
| `feature/*` | Novas funcionalidades |
| `fix/*` | Correções de bugs |
| `release/*` | Preparação para deploy |

### Comandos de Branch

```bash
# Criar nova branch
git checkout -b feature/filtro-tarefas

# Listar branches
git branch

# Trocar de branch
git checkout main

# Ver branches remotas
git branch -r
```

### Fluxo com Branches

```bash
# 1. Criar branch para a feature
git checkout -b feature/nova-funcionalidade

# 2. Trabalhar e fazer commits
git add .
git commit -m "feat: implementa nova funcionalidade"

# 3. Enviar branch para o remoto
git push -u origin feature/nova-funcionalidade

# 4. Criar Pull Request no GitHub para revisão

# 5. Após aprovação, fazer merge na main
git checkout main
git merge feature/nova-funcionalidade

# 6. Deletar branch (já foi integrada)
git branch -d feature/nova-funcionalidade
```

---

## 6. Merge e Resolução de Conflitos

### O que é Merge?

**Merge** é o processo de combinar as mudanças de uma branch em outra.

```bash
# Estando na main, trazer mudanças da feature
git checkout main
git merge feature/filtro-tarefas
```

### Conflitos de Merge

Conflitos acontecem quando **duas pessoas editam a mesma parte do mesmo arquivo**.

O Git marca o conflito assim:

```
<<<<<<< HEAD
código da branch atual (main)
=======
código da branch sendo mesclada (feature)
>>>>>>> feature/filtro-tarefas
```

### Resolvendo Conflitos

1. Abra o arquivo com conflito
2. Escolha qual versão manter (ou combine ambas)
3. Remova os marcadores (`<<<<<<<`, `=======`, `>>>>>>>`)
4. Faça `git add` e `git commit`

**Com Claude Code**:
```
tem conflitos de merge no meu projeto, me ajude a resolver
```

### Pull Request (PR)

Em equipes, usamos **Pull Requests** para:
- Solicitar revisão de código antes do merge
- Discutir mudanças em equipe
- Manter um registro de decisões

```bash
# Usando GitHub CLI
gh pr create --title "feat: filtro de tarefas" --body "Adiciona filtro por status"
```

---

## 7. Git com Claude Code

O Claude Code tem integração nativa com Git. Use linguagem natural:

### Comandos Git via Claude

```
quais arquivos foram modificados?
```
→ Equivalente a `git status`

```
me mostre o que mudou nos arquivos
```
→ Equivalente a `git diff`

```
faça commit das minhas mudanças com uma mensagem descritiva
```
→ O Claude analisa as mudanças e cria um commit com mensagem adequada

```
crie uma branch para a funcionalidade de filtro
```
→ Equivalente a `git checkout -b feature/filtro`

```
mostre os últimos 5 commits
```
→ Equivalente a `git log --oneline -5`

```
ajude-me a resolver os conflitos de merge
```
→ O Claude identifica e ajuda a resolver conflitos

### Usando /commit

O Claude Code tem um comando especial para commits:

```
/commit
```

Ele analisa suas mudanças e sugere uma mensagem de commit apropriada.

---

## 8. Segurança da Informação

### O que NUNCA deve ser exposto no código

| Tipo de informação | Exemplo | Risco |
|---|---|---|
| **Chaves de API** | `sk-abc123...` | Acesso não autorizado a serviços |
| **Senhas de banco** | `password: "minhasenha"` | Acesso ao banco de dados |
| **Tokens de autenticação** | `token: "eyJ..."` | Roubo de identidade |
| **Chaves privadas SSH** | `id_rsa` | Acesso a servidores |
| **Credenciais de serviços** | AWS, GCP, etc. | Custos e vazamentos |
| **Dados pessoais** | CPF, emails de usuários | Violação de privacidade (LGPD) |

### O arquivo .gitignore

O `.gitignore` diz ao Git quais arquivos **não devem ser rastreados**:

```gitignore
# Variáveis de ambiente (NUNCA commitar!)
.env
.env.local
.env.production

# Dependências (reinstalar com npm install)
node_modules/

# Banco de dados local
*.sqlite
*.db

# Logs
*.log

# Arquivos do sistema
.DS_Store
Thumbs.db

# Build
dist/
build/

# IDE
.vscode/
.idea/
```

### Regra de Ouro

> **Se um arquivo contém credenciais, ele NÃO pode estar no Git.**
> Mesmo que você delete depois, o histórico do Git guarda TUDO.

### Se você acidentalmente commitou um segredo

1. **Troque a credencial imediatamente** (revogue a chave antiga)
2. Remova do histórico:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" HEAD
   ```
3. Force push (com cuidado):
   ```bash
   git push --force
   ```

**Com Claude Code**:
```
verifique se existe alguma credencial ou informação sensível
exposta no código deste projeto
```

---

## 9. O Arquivo .env

### O que é?

O `.env` é um arquivo que armazena **variáveis de ambiente** — configurações que mudam entre ambientes (desenvolvimento, teste, produção) e informações sensíveis.

### Estrutura

```env
# Configuração do servidor
PORT=3000
NODE_ENV=development

# Banco de dados
DATABASE_URL=sqlite://./database.sqlite

# Chaves de API (NUNCA commitar!)
API_KEY=sua-chave-aqui
SECRET_KEY=seu-segredo-aqui

# URLs de serviços externos
FRONTEND_URL=http://localhost:3000
```

### Separação de Ambientes

Crie arquivos `.env` diferentes para cada ambiente:

| Arquivo | Ambiente | Exemplo |
|---|---|---|
| `.env.development` | Desenvolvimento local | `PORT=3000`, `DEBUG=true` |
| `.env.test` | Testes automatizados | `DATABASE_URL=sqlite://:memory:` |
| `.env.production` | Produção | `PORT=80`, `DEBUG=false` |

### Como Usar no Código

```javascript
// Usando a biblioteca dotenv
require('dotenv').config();

const port = process.env.PORT || 3000;
const apiKey = process.env.API_KEY;
const dbUrl = process.env.DATABASE_URL;

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
```

### Arquivo .env.example

Crie um `.env.example` (este SIM vai para o Git) como template:

```env
# Copie este arquivo para .env e preencha os valores
PORT=3000
NODE_ENV=development
DATABASE_URL=
API_KEY=
SECRET_KEY=
```

**Prompt para configurar**:
```
crie um arquivo .env com as variáveis necessárias para este projeto,
um .env.example como template e garanta que .env está no .gitignore
```

---

## 10. Revisão de Código Gerado por IA

### Checklist de Revisão

Sempre que o Claude gerar código, revise com estes critérios:

#### Segurança
- [ ] Não há credenciais hardcoded?
- [ ] Inputs do usuário são validados?
- [ ] Queries SQL usam parâmetros (não concatenação)?
- [ ] CORS está configurado corretamente?
- [ ] Dados sensíveis estão no .env?

#### Qualidade
- [ ] O código faz o que foi pedido?
- [ ] Não há código duplicado desnecessário?
- [ ] Os nomes de variáveis/funções são claros?
- [ ] Há tratamento de erros adequado?
- [ ] As dependências são necessárias?

#### Performance
- [ ] Queries ao banco são eficientes?
- [ ] Não há loops desnecessários?
- [ ] Arquivos estáticos são servidos corretamente?

### Prompts de Revisão

```
revise o código gerado e identifique problemas de segurança
```

```
esse código segue boas práticas? sugira melhorias
```

```
tem algum problema de performance neste código?
```

```
verifique se todas as credenciais estão protegidas via .env
```

---

## 11. Fluxo de Trabalho Padronizado para Equipe

### Fluxo Recomendado

```
┌──────────────────────────────────────────────────────────┐
│                FLUXO DE TRABALHO DA EQUIPE                │
│                                                          │
│  1. PEGAR TAREFA                                         │
│     ↓                                                    │
│  2. CRIAR BRANCH (feature/nome-da-tarefa)                │
│     ↓                                                    │
│  3. DESENVOLVER (com Claude Code)                        │
│     ↓                                                    │
│  4. TESTAR LOCALMENTE                                    │
│     ↓                                                    │
│  5. FAZER COMMITS (pequenos e descritivos)               │
│     ↓                                                    │
│  6. PUSH PARA O REMOTO                                   │
│     ↓                                                    │
│  7. CRIAR PULL REQUEST                                   │
│     ↓                                                    │
│  8. REVISÃO DE CÓDIGO (por outro membro)                 │
│     ↓                                                    │
│  9. MERGE NA MAIN                                        │
│     ↓                                                    │
│  10. DEPLOY (Aula 04!)                                   │
└──────────────────────────────────────────────────────────┘
```

### Regras da Equipe

1. **Nunca commitar direto na `main`** — sempre usar branches
2. **Nunca commitar arquivos .env** — usar .env.example
3. **Sempre criar Pull Request** — código revisado por pelo menos 1 pessoa
4. **Mensagens de commit descritivas** — usar padrão de tipos (feat, fix, etc.)
5. **Rodar testes antes de push** — `npm test`
6. **Revisar código gerado por IA** — nunca aceitar sem entender

### Resumo do Fluxo Diário

```bash
# Início do dia
git checkout main
git pull                              # Atualizar código
git checkout -b feature/minha-tarefa  # Criar branch

# Durante o trabalho
claude                                # Abrir Claude Code
> implementar feature X               # Trabalhar
> rode os testes                       # Testar
git add .                             # Staging
git commit -m "feat: implementa X"    # Commit

# Final do dia
git push -u origin feature/minha-tarefa  # Enviar
# Criar PR no GitHub para revisão
```

---

## 12. Checklist de Entregáveis

- [ ] **Repositório Git** configurado com histórico organizado
- [ ] **Branches** criadas e merge realizado com sucesso
- [ ] **.gitignore** configurado (protege .env, node_modules, etc.)
- [ ] **.env** configurado com variáveis de ambiente
- [ ] **.env.example** criado como template (no Git)
- [ ] **Checklist de segurança** revisado e aplicado
- [ ] **Fluxo de trabalho** documentado e validado pela equipe
- [ ] Todos conseguem fazer: branch → commit → push → PR

---

## Checklist de Segurança (para imprimir e manter visível)

```
╔══════════════════════════════════════════════════════╗
║           CHECKLIST DE SEGURANÇA - PROJETOS IA       ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║  [ ] .env está no .gitignore                         ║
║  [ ] Nenhuma credencial está hardcoded no código     ║
║  [ ] .env.example existe (sem valores reais)         ║
║  [ ] Chaves de API são lidas de process.env          ║
║  [ ] Inputs do usuário são validados                 ║
║  [ ] SQL usa parâmetros (não concatenação)           ║
║  [ ] CORS está configurado corretamente              ║
║  [ ] node_modules/ está no .gitignore                ║
║  [ ] Arquivos de banco local estão no .gitignore     ║
║  [ ] Nenhum dado pessoal está no código fonte        ║
║  [ ] Dependências estão atualizadas                  ║
║  [ ] Código gerado por IA foi revisado               ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
```

---

## Recursos Adicionais

- **Git oficial**: [git-scm.com/doc](https://git-scm.com/doc)
- **GitHub Guides**: [guides.github.com](https://guides.github.com/)
- **Git interativo**: [learngitbranching.js.org](https://learngitbranching.js.org/)
- **OWASP Top 10**: [owasp.org/Top10](https://owasp.org/www-project-top-ten/)

---

> **Próxima Aula**: No Encontro 4, vamos publicar a aplicação em produção com deploy profissional!
