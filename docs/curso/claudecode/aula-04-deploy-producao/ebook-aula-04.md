# Aula 04 — Deploy em Ambiente de Produção

## Curso de Claude Code — Pandô APPs

---

## Sumário

1. [Introdução](#1-introdução)
2. [Desenvolvimento vs Produção](#2-desenvolvimento-vs-produção)
3. [Preparação da Aplicação para Produção](#3-preparação-da-aplicação-para-produção)
4. [Variáveis de Ambiente em Produção](#4-variáveis-de-ambiente-em-produção)
5. [Plataformas de Deploy](#5-plataformas-de-deploy)
6. [Deploy na Prática — Railway](#6-deploy-na-prática--railway)
7. [Deploy na Prática — Vercel](#7-deploy-na-prática--vercel)
8. [Deploy na Prática — Render](#8-deploy-na-prática--render)
9. [Deploy com Docker](#9-deploy-com-docker)
10. [Monitoramento Pós-Deploy](#10-monitoramento-pós-deploy)
11. [Tratamento de Problemas Comuns](#11-tratamento-de-problemas-comuns)
12. [Guia de Próximos Passos](#12-guia-de-próximos-passos)
13. [Checklist de Entregáveis](#13-checklist-de-entregáveis)

---

## 1. Introdução

Este é o encontro final da mentoria. Vamos publicar a aplicação que construímos nas aulas anteriores em um ambiente acessível pela internet.

**Objetivo**: Ao final desta aula, sua aplicação estará:
- Publicada e acessível por qualquer pessoa com o link
- Configurada com boas práticas de segurança
- Com pipeline de deploy documentado e replicável

---

## 2. Desenvolvimento vs Produção

### As Diferenças Fundamentais

| Aspecto | Desenvolvimento | Produção |
|---|---|---|
| **Quem acessa** | Só você | Qualquer pessoa |
| **Erros** | Mostrados em detalhe | Mensagens genéricas |
| **Performance** | Não é prioridade | Essencial |
| **Dados** | Fictícios/teste | Reais |
| **URL** | localhost:3000 | seusite.com |
| **HTTPS** | Não obrigatório | Obrigatório |
| **Debug** | Ativado | Desativado |
| **Logs** | Verbosos | Estruturados |

### O que muda no código

```javascript
// Desenvolvimento
const port = 3000;
const debug = true;
const dbUrl = 'sqlite://./dev.sqlite';

// Produção
const port = process.env.PORT;
const debug = false;
const dbUrl = process.env.DATABASE_URL;
```

---

## 3. Preparação da Aplicação para Produção

### Checklist de Preparação

Use o Claude Code para preparar o projeto:

```
prepare esta aplicação para deploy em produção.
verifique e ajuste:
1. todas as configurações hardcoded devem usar variáveis de ambiente
2. remova console.log de debug
3. configure CORS adequadamente
4. adicione tratamento de erros global
5. otimize a entrega de arquivos estáticos
6. adicione um health check endpoint
```

### 1. Variáveis de Ambiente

Nunca use valores fixos no código:

```javascript
// ERRADO
const port = 3000;
const apiKey = 'sk-abc123';

// CORRETO
const port = process.env.PORT || 3000;
const apiKey = process.env.API_KEY;
```

### 2. Health Check Endpoint

Adicione um endpoint para verificar se a aplicação está funcionando:

```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});
```

### 3. Tratamento de Erros Global

```javascript
// Middleware de erro (deve ser o último middleware)
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Em produção, não expor detalhes do erro
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: 'Erro interno do servidor' });
  } else {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});
```

### 4. CORS em Produção

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
```

### 5. Arquivo start para produção

No `package.json`, configure os scripts:

```json
{
  "scripts": {
    "start": "node server/index.js",
    "dev": "nodemon server/index.js",
    "build": "echo 'No build step needed'",
    "test": "jest"
  }
}
```

---

## 4. Variáveis de Ambiente em Produção

### Configurando nas Plataformas

Cada plataforma de deploy tem seu painel para configurar variáveis de ambiente. Nunca faça upload do arquivo `.env` — configure manualmente no painel.

### Variáveis Essenciais

```env
# Servidor
NODE_ENV=production
PORT=3000

# Banco de Dados
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Segurança
SECRET_KEY=chave-aleatoria-muito-longa-e-segura
CORS_ORIGIN=https://seu-dominio.com

# Serviços Externos
API_KEY=sua-chave-de-api
```

### Gerando Chaves Seguras

```bash
# No terminal, gere chaves aleatórias:
openssl rand -hex 32
```

**Prompt para o Claude**:
```
liste todas as variáveis de ambiente que preciso configurar
para colocar este projeto em produção
```

---

## 5. Plataformas de Deploy

### Comparativo de Plataformas

| Plataforma | Melhor para | Gratuito? | Dificuldade |
|---|---|---|---|
| **Railway** | Full-stack com banco | Sim (limitado) | Fácil |
| **Vercel** | Frontend e APIs | Sim (generoso) | Muito fácil |
| **Render** | Full-stack | Sim (limitado) | Fácil |
| **Fly.io** | Docker/containers | Sim (limitado) | Médio |
| **AWS** | Projetos grandes | Pago | Difícil |
| **DigitalOcean** | Servidores completos | Pago | Médio |
| **Heroku** | Prototipagem | Pago | Fácil |

### Recomendação para Iniciantes

Para o nosso projeto To-Do List, recomendamos:

1. **Railway** — para o backend + banco de dados
2. **Vercel** — se separar frontend do backend
3. **Render** — alternativa ao Railway

---

## 6. Deploy na Prática — Railway

### Passo a Passo

#### 1. Criar conta e projeto

1. Acesse [railway.app](https://railway.app)
2. Faça login com sua conta do GitHub
3. Clique em **"New Project"**
4. Selecione **"Deploy from GitHub repo"**
5. Conecte seu repositório

#### 2. Configurar variáveis de ambiente

1. No painel do Railway, clique no seu serviço
2. Vá em **"Variables"**
3. Adicione cada variável:
   ```
   NODE_ENV=production
   SECRET_KEY=(gere com openssl rand -hex 32)
   ```

#### 3. Adicionar banco de dados (se necessário)

1. Clique em **"+ New"** no projeto
2. Selecione **"Database" > "PostgreSQL"**
3. O Railway cria automaticamente a variável `DATABASE_URL`

#### 4. Configurar deploy

O Railway detecta automaticamente que é um projeto Node.js e roda:
- `npm install` (instalar dependências)
- `npm start` (iniciar o servidor)

#### 5. Acessar a aplicação

1. Vá em **"Settings" > "Networking"**
2. Clique em **"Generate Domain"**
3. Sua aplicação estará disponível em `seu-projeto.up.railway.app`

**Prompt para o Claude**:
```
prepare este projeto para deploy no Railway.
ajuste o código para usar PostgreSQL em produção
e SQLite em desenvolvimento
```

---

## 7. Deploy na Prática — Vercel

### Ideal para Frontend ou APIs Simples

#### 1. Instalar CLI da Vercel

```bash
npm install -g vercel
```

#### 2. Deploy

```bash
cd ~/meu-projeto-todo
vercel
```

Siga as instruções interativas:
- Confirme o diretório
- Vincule ao seu projeto Vercel
- Configure o framework (se aplicável)

#### 3. Configurar variáveis de ambiente

```bash
vercel env add SECRET_KEY
# Cole o valor quando solicitado
```

Ou configure pelo painel: [vercel.com/dashboard](https://vercel.com/dashboard) > Settings > Environment Variables

#### 4. Deploy em produção

```bash
vercel --prod
```

---

## 8. Deploy na Prática — Render

### Passo a Passo

1. Acesse [render.com](https://render.com) e crie conta
2. Clique em **"New +" > "Web Service"**
3. Conecte seu repositório GitHub
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Adicione variáveis de ambiente em "Environment"
6. Clique em **"Create Web Service"**

O Render faz deploy automático a cada push na `main`.

---

## 9. Deploy com Docker

Se seu projeto tem `Dockerfile` e `docker-compose.yml`, muitas plataformas suportam deploy direto de containers.

### Dockerfile para Produção

```dockerfile
# Imagem base
FROM node:20-alpine

# Diretório de trabalho
WORKDIR /app

# Copiar dependências primeiro (cache de build)
COPY package*.json ./
RUN npm ci --only=production

# Copiar código
COPY . .

# Porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Iniciar
CMD ["node", "server/index.js"]
```

### docker-compose para Produção

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "${PORT:-3000}:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - SECRET_KEY=${SECRET_KEY}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 3s
      retries: 3

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=${DB_USER:-app}
      - POSTGRES_PASSWORD=${DB_PASS}
      - POSTGRES_DB=${DB_NAME:-todoapp}
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  pgdata:
```

**Prompt para o Claude**:
```
otimize o Dockerfile deste projeto para produção,
usando multi-stage build e boas práticas de segurança
```

---

## 10. Monitoramento Pós-Deploy

### O que monitorar

| Métrica | Por quê | Como verificar |
|---|---|---|
| **Uptime** | Aplicação está no ar? | Health check endpoint |
| **Tempo de resposta** | Performance aceitável? | Painel da plataforma |
| **Erros** | Algo está quebrando? | Logs da plataforma |
| **Uso de recursos** | CPU/RAM sob controle? | Painel da plataforma |

### Health Check

Teste manualmente:
```bash
curl https://seu-app.up.railway.app/health
```

Resposta esperada:
```json
{ "status": "ok", "timestamp": "2025-05-10T10:00:00.000Z" }
```

### Logs

Todas as plataformas oferecem visualização de logs:

- **Railway**: Painel > Serviço > Logs
- **Vercel**: Painel > Functions > Logs
- **Render**: Painel > Serviço > Logs

### Ferramentas de Monitoramento Gratuitas

| Ferramenta | O que faz |
|---|---|
| **UptimeRobot** | Verifica se o site está no ar a cada 5 min |
| **Sentry** | Captura erros em tempo real |
| **LogDNA/Papertrail** | Agregação de logs |

---

## 11. Tratamento de Problemas Comuns

### Problema: Build falhou

**Causa provável**: Dependência faltando ou versão de Node incorreta

**Solução**:
```
o build do meu projeto falhou no deploy. aqui está o log de erro:
[cole o log]
ajude a diagnosticar e corrigir
```

Verifique o `package.json`:
```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Problema: Aplicação não inicia

**Causa provável**: Variável de ambiente faltando

**Solução**: Verifique se todas as variáveis estão configuradas na plataforma

```
liste todas as variáveis de ambiente necessárias para este projeto rodar
```

### Problema: Erro 500 em produção

**Causa provável**: Erro no código não tratado

**Solução**: Verifique os logs da plataforma e use o Claude:

```
estou recebendo erro 500 em produção. aqui está o log:
[cole o log]
diagnostique o problema
```

### Problema: Banco de dados não conecta

**Causa provável**: `DATABASE_URL` incorreta

**Solução**: Verifique a connection string e se o banco está acessível

### Problema: CORS bloqueando requisições

**Causa provável**: `origin` não configurado corretamente

**Solução**:
```
configure CORS para permitir requisições do meu frontend em
https://meu-frontend.vercel.app
```

---

## 12. Guia de Próximos Passos

### Evolução Técnica da Equipe

Após a mentoria, sugerimos o seguinte roadmap de aprendizado:

#### Mês 1-2: Consolidação
- [ ] Praticar Git diariamente
- [ ] Usar Claude Code em todos os projetos
- [ ] Melhorar a qualidade dos prompts
- [ ] Adicionar testes automatizados

#### Mês 3-4: Aprofundamento
- [ ] Aprender TypeScript
- [ ] Explorar frameworks frontend (React ou Vue)
- [ ] Implementar autenticação de usuários
- [ ] Configurar CI/CD (GitHub Actions)

#### Mês 5-6: Profissionalização
- [ ] Aprender sobre microserviços
- [ ] Explorar bancos de dados avançados (PostgreSQL, MongoDB)
- [ ] Implementar cache (Redis)
- [ ] Estudar arquitetura de software

### Recursos de Aprendizado Contínuo

| Recurso | O que oferece |
|---|---|
| **freeCodeCamp** | Cursos gratuitos de programação |
| **The Odin Project** | Currículo completo de web dev |
| **MDN Web Docs** | Referência de HTML, CSS, JS |
| **Node.js Docs** | Documentação oficial do Node |
| **Claude Code Docs** | Documentação do Claude Code |
| **YouTube** | Fireship, Traversy Media, The Net Ninja |

### Dicas para Evolução Autônoma

1. **Construa projetos reais** — Não fique só em tutoriais
2. **Leia código de outros** — Open source no GitHub
3. **Use o Claude como tutor** — Peça explicações detalhadas
4. **Contribua em projetos** — Comece com "good first issues"
5. **Participe de comunidades** — Discord, Reddit, Stack Overflow

### Usando Claude Code como Tutor

```
explique o conceito de [assunto] como se eu fosse um iniciante
```

```
me dê um exercício prático sobre [assunto] e depois corrija minha solução
```

```
quais são os próximos passos para eu evoluir como desenvolvedor
considerando o que já aprendi neste curso?
```

---

## 13. Checklist de Entregáveis

### Aplicação em Produção
- [ ] Aplicação publicada e acessível via URL
- [ ] HTTPS ativo
- [ ] Health check respondendo corretamente
- [ ] Variáveis de ambiente configuradas na plataforma

### Documentação
- [ ] Pipeline de deploy documentado (passo a passo)
- [ ] Variáveis de ambiente listadas e documentadas
- [ ] URL de produção registrada
- [ ] Credenciais de acesso à plataforma registradas (seguras)

### Qualidade
- [ ] Tratamento de erros global
- [ ] CORS configurado para produção
- [ ] Console.log de debug removidos
- [ ] .env não está no repositório

### Equipe
- [ ] Todos sabem fazer deploy
- [ ] Fluxo de deploy documentado e testado
- [ ] Guia de próximos passos revisado
- [ ] Canais de comunicação definidos

---

## Pipeline de Deploy — Referência Rápida

```
╔══════════════════════════════════════════════════════╗
║              PIPELINE DE DEPLOY                       ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║  1. CÓDIGO PRONTO (na branch main)                   ║
║     ↓                                                ║
║  2. TESTES PASSANDO (npm test)                       ║
║     ↓                                                ║
║  3. PUSH PARA O GITHUB                               ║
║     ↓                                                ║
║  4. PLATAFORMA DETECTA A MUDANÇA                     ║
║     ↓                                                ║
║  5. BUILD AUTOMÁTICO (npm install + npm build)       ║
║     ↓                                                ║
║  6. DEPLOY AUTOMÁTICO                                ║
║     ↓                                                ║
║  7. HEALTH CHECK VERIFICADO                          ║
║     ↓                                                ║
║  8. APLICAÇÃO NO AR!                                 ║
║                                                      ║
║  Se algo falhar → Verificar logs → Corrigir → Push   ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
```

---

## Encerramento

Parabéns por completar a mentoria! Vocês agora têm:

1. **Ambiente configurado** para desenvolvimento com IA
2. **Vocabulário técnico** para comunicar com precisão
3. **Fluxo de trabalho profissional** com Git e equipe
4. **Aplicação em produção** acessível pela internet
5. **Claude Code** como parceiro de desenvolvimento contínuo

> A jornada de aprendizado não termina aqui — ela apenas começa com as ferramentas certas!

---

## Recursos Adicionais

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Docker Docs**: [docs.docker.com](https://docs.docker.com/)
- **Claude Code**: [code.claude.com/docs](https://code.claude.com/docs)
