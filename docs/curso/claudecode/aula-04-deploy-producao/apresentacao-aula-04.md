---
marp: true
theme: default
paginate: true
backgroundColor: #1a1a2e
color: #eee
style: |
  section { font-family: 'Segoe UI', sans-serif; }
  h1 { color: #d97757; }
  h2 { color: #e8a87c; }
  code { background: #16213e; padding: 2px 8px; border-radius: 4px; }
  table { font-size: 0.8em; }
---

# Curso de Claude Code
## Encontro 4 — Deploy em Produção

**Pandô APPs**

Do seu computador para o mundo!

---

# Agenda

1. Desenvolvimento vs Produção
2. Preparação para Produção
3. Plataformas de Deploy
4. Deploy na Prática
5. Monitoramento Pós-Deploy
6. Resolução de Problemas
7. Próximos Passos

---

# Desenvolvimento vs Produção

| | Dev | Produção |
|---|---|---|
| **Quem acessa** | Só você | Todo mundo |
| **Erros** | Detalhados | Genéricos |
| **Performance** | Não importa | Essencial |
| **URL** | localhost | seusite.com |
| **HTTPS** | Opcional | Obrigatório |
| **Debug** | ON | OFF |
| **Dados** | Teste | Reais |

---

# Preparação: Checklist

Use o Claude Code:
```
prepare esta aplicação para produção:
1. usar variáveis de ambiente para tudo
2. remover console.log de debug
3. configurar CORS
4. adicionar tratamento de erros global
5. adicionar health check endpoint
```

---

# Preparação: Variáveis de Ambiente

```javascript
// ERRADO (hardcoded)
const port = 3000;
const apiKey = 'sk-abc123';

// CORRETO (variáveis de ambiente)
const port = process.env.PORT || 3000;
const apiKey = process.env.API_KEY;
```

> Configure nas plataformas, NUNCA no código!

---

# Preparação: Health Check

```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});
```

Permite verificar se a aplicação está viva.

---

# Preparação: Tratamento de Erros

```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  } else {
    res.status(500).json({
      error: err.message,
      stack: err.stack
    });
  }
});
```

---

# Plataformas de Deploy

| Plataforma | Melhor para | Free? | Dificuldade |
|---|---|---|---|
| **Railway** | Full-stack + DB | Sim* | Fácil |
| **Vercel** | Frontend/APIs | Sim | Muito fácil |
| **Render** | Full-stack | Sim* | Fácil |
| **Fly.io** | Docker | Sim* | Médio |
| **AWS** | Grande escala | Pago | Difícil |

*Plano gratuito limitado

---

# Deploy: Railway

### Passo a passo:

1. Acesse **railway.app** e faça login com GitHub
2. **"New Project"** > **"Deploy from GitHub repo"**
3. Selecione o repositório
4. Configure **variáveis de ambiente** no painel
5. Adicione **PostgreSQL** se necessário
6. Gere o **domínio** em Settings > Networking

```
seu-projeto.up.railway.app
```

---

# Deploy: Vercel

```bash
# Instalar CLI
npm install -g vercel

# Deploy
cd ~/meu-projeto-todo
vercel

# Deploy em produção
vercel --prod
```

Configurar variáveis:
```bash
vercel env add SECRET_KEY
```

---

# Deploy: Render

1. Acesse **render.com** e crie conta
2. **"New +"** > **"Web Service"**
3. Conecte repositório GitHub
4. Configure:
   - Build: `npm install`
   - Start: `npm start`
5. Adicione variáveis de ambiente
6. **"Create Web Service"**

Deploy automático a cada push na main!

---

# Deploy com Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --spider http://localhost:3000/health || exit 1
CMD ["node", "server/index.js"]
```

---

# Pipeline de Deploy

```
Código pronto (main)
    ↓
Testes passando (npm test)
    ↓
Push para GitHub
    ↓
Plataforma detecta mudança
    ↓
Build automático
    ↓
Deploy automático
    ↓
Health check OK
    ↓
Aplicação no ar!
```

---

# Monitoramento

| O que monitorar | Como |
|---|---|
| **Uptime** | Health check endpoint |
| **Tempo de resposta** | Painel da plataforma |
| **Erros** | Logs da plataforma |
| **CPU/RAM** | Métricas da plataforma |

```bash
# Teste manual
curl https://seu-app.railway.app/health
```

### Ferramentas gratuitas:
- **UptimeRobot** — alerta se cair
- **Sentry** — captura erros

---

# Problemas Comuns

### Build falhou
→ Verificar dependências e versão do Node

### Aplicação não inicia
→ Variável de ambiente faltando

### Erro 500
→ Verificar logs na plataforma

### Banco não conecta
→ Verificar DATABASE_URL

### CORS bloqueando
→ Configurar origin correto

**Use o Claude**:
```
o deploy falhou com este erro: [log]
diagnostique e corrija
```

---

# Relatório de Configuração

Documente tudo:

```
╔════════════════════════════════════════╗
║    CONFIGURAÇÕES DE PRODUÇÃO           ║
╠════════════════════════════════════════╣
║ Plataforma: Railway                    ║
║ URL: https://todo.up.railway.app       ║
║ Banco: PostgreSQL (Railway)            ║
║ Domínio: configurado                   ║
║ HTTPS: ativo (automático)              ║
║ Variáveis: 5 configuradas             ║
║ Health Check: /health                  ║
║ Deploy: automático via GitHub          ║
╚════════════════════════════════════════╝
```

---

# Próximos Passos — Mês 1-2

- [ ] Praticar Git diariamente
- [ ] Usar Claude Code em todo projeto
- [ ] Melhorar qualidade dos prompts
- [ ] Adicionar testes automatizados
- [ ] Explorar a documentação das ferramentas

---

# Próximos Passos — Mês 3-6

- [ ] Aprender TypeScript
- [ ] Explorar React ou Vue
- [ ] Implementar autenticação
- [ ] Configurar CI/CD (GitHub Actions)
- [ ] Aprender PostgreSQL avançado
- [ ] Estudar arquitetura de software

---

# Usando Claude Code como Tutor

```
explique [conceito] como se eu fosse iniciante
```

```
me dê um exercício prático sobre [assunto]
```

```
quais próximos passos para eu evoluir
considerando o que já aprendi?
```

```
revise meu código e sugira melhorias
```

---

# O que vocês conquistaram

1. **Ambiente configurado** para dev com IA
2. **Vocabulário técnico** preciso
3. **Fluxo profissional** com Git e equipe
4. **Aplicação em produção** na internet
5. **Claude Code** como parceiro permanente

---

# Checklist Final

- [ ] Aplicação publicada e acessível
- [ ] HTTPS ativo
- [ ] Health check respondendo
- [ ] Variáveis de ambiente configuradas
- [ ] Pipeline de deploy documentado
- [ ] Configurações registradas
- [ ] Guia de próximos passos revisado
- [ ] Todos sabem fazer deploy

---

# Obrigado!

## Curso de Claude Code — Pandô APPs

A jornada não termina aqui — ela começa com as ferramentas certas!

```bash
claude "o que eu deveria aprender em seguida?"
```

---

# Recursos

- **Railway**: [docs.railway.app](https://docs.railway.app)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Render**: [render.com/docs](https://render.com/docs)
- **Docker**: [docs.docker.com](https://docs.docker.com)
- **Claude Code**: [code.claude.com/docs](https://code.claude.com/docs)
- **Discord**: [anthropic.com/discord](https://www.anthropic.com/discord)
