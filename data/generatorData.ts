import type { Slide } from './slidesData';

export const generatorData: Record<number, Slide[]> = {
  2: [
    {
      type: 'cover',
      aula: 'Aula 02 — Material Complementar',
      date: '16 de Maio de 2026',
      title: 'Gerador de Projetos',
      subtitle: 'Construa o prompt do seu projeto passo a passo',
      color: '#6ea8fe',
      icon: '✨',
    },
    {
      type: 'promptBuilder',
      badge: 'Gerador de Projetos',
      title: 'FRONTEND',
      subtitle: 'Gerando as interfaces do seu projeto',
      color: '#6ea8fe',
      buttonLabel: 'Gerar prompt de telas',
      responseLabel: 'Resposta do claude',
      instructions: [
        'Preencha o formulário e clique em Gerar Prompt de Telas',
        'Copie o prompt gerado e envie para o [claude.ai](https://claude.ai)',
        'Cole a resposta do claude no campo de resposta',
      ],
      inputs: [
        { id: 'NOME', label: 'Qual o nome da plataforma?' },
        { id: 'OBJETIVO', label: 'Qual objetivo da plataforma?' },
        { id: 'CORES', label: 'Quais as cores principais?' },
        { id: 'ATORES', label: 'Quais atores do sistema e o que cada um pode fazer?', multiline: true },
      ],
      promptTemplate: `Estou criando as telas da plataforma chamada {NOME}, que terá como cores principais {CORES}

Quero que vc crie um prompt com o descritivo de todas minhas telas. O sistema tem como objetivo {OBJETIVO}

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
      type: 'promptBuilder',
      badge: 'Gerador de Projetos',
      title: 'REQUISITOS',
      subtitle: 'Gerando o documento de requisitos do projeto',
      color: '#6ea8fe',
      buttonLabel: 'Gerar prompt de requisitos',
      responseLabel: 'Resposta do claude',
      instructions: [
        'Preencha o formulário e clique em Gerar Prompt de Requisitos',
        'Copie o prompt gerado e envie para o [claude.ai](https://claude.ai)',
        'Cole a resposta do claude no campo de resposta',
      ],
      hiddenVars: {
        PROMPT_ANTERIOR: 'pb-FRONTEND|Gerando as interfaces do seu projeto:response',
      },
      inputs: [
        {
          id: 'GATEWAY',
          label: 'Qual gateway de pagamento usaremos?',
          options: [
            { label: 'Nenhum', value: 'Não usaremos gateway de pagamento' },
            { label: 'Asaas', value: 'Para o gateway de pagamento usaremos Asaas' },
            { label: 'AbacatePay', value: 'Para o gateway de pagamento usaremos AbacatePay' },
            { label: 'Stripe', value: 'Para o gateway de pagamento usaremos Stripe' },
            { label: 'Outro', value: 'Para o gateway de pagamento usaremos outro (a definir)' },
          ],
        },
        {
          id: 'SENTRY',
          label: 'Usaremos Sentry para coleta de erros?',
          options: [
            { label: 'Não', value: 'Não usaremos nenhuma ferramenta de coleta de erros' },
            { label: 'Sim', value: 'Para coleta de erros usaremos Sentry' },
          ],
        },
        {
          id: 'STORAGE',
          label: 'Onde faremos o storage de arquivos em produção?',
          options: [
            { label: 'Local', value: 'usaremos o disco local' },
            { label: 'AWS S3', value: 'usaremos AWS S3' },
            { label: 'DigitalOcean Spaces', value: 'usaremos DigitalOcean Spaces' },
            { label: 'Outro', value: 'usaremos outra solução (a definir)' },
          ],
        },
        {
          id: 'BANCO',
          label: 'Onde ficará o banco de dados em produção?',
          options: [
            { label: 'Banco local (Docker)', value: 'usaremos banco MySQL via Docker' },
            { label: 'Banco externo', value: 'usaremos banco em servidor externo' },
          ],
        },
        {
          id: 'EMAIL',
          label: 'Como enviaremos e-mails?',
          options: [
            { label: 'Mailgun', value: 'Para envio de e-mails usaremos Mailgun' },
            { label: 'Mailtrap', value: 'Para envio de e-mails usaremos Mailtrap' },
            { label: 'SendGrid', value: 'Para envio de e-mails usaremos SendGrid' },
            { label: 'Resend', value: 'Para envio de e-mails usaremos Resend' },
            { label: 'Não enviaremos', value: 'Não enviaremos e-mails' },
          ],
        },
        {
          id: 'AUTH_SOCIAL',
          label: 'Teremos autenticação social?',
          options: [
            { label: 'Não', value: 'Não teremos autenticação social' },
            { label: 'Login com Google', value: 'Teremos login com Google' },
            { label: 'Login com Facebook', value: 'Teremos login com Facebook' },
            { label: 'Google e Facebook', value: 'Teremos login com Google e Facebook' },
          ],
        },
        {
          id: 'PUSH',
          label: 'Teremos notificações push?',
          options: [
            { label: 'Não', value: 'Não teremos notificações push' },
            { label: 'Sim (Firebase FCM)', value: 'Para notificações push usaremos Firebase FCM' },
            { label: 'Sim (OneSignal)', value: 'Para notificações push usaremos OneSignal' },
          ],
        },
      ],
      promptTemplate: `Estou criando uma plataforma web e para gerar as telas usei o seguinte prompt: {PROMPT_ANTERIOR}

Quero que você analise esse prompt e gere o documento de requisitos funcionais do projeto. Não fale nada sobre a Stack, eu decidirei... descreva a lista de todas as funcionalidades e a descrição delas. Lembre-se de solicitar a criação de uma landing page e colocar um botão no topo para a tela de login

Preencha todas as variáveis de ambiente no .env

{GATEWAY}
{SENTRY}
Para storage de arquivos: localmente usaremos o disco local para armazenar imagens; em produção, {STORAGE}
Para o banco de dados: localmente usaremos banco MySQL via Docker; em produção, {BANCO}
{EMAIL}
{AUTH_SOCIAL}
{PUSH}`,
    },
    {
      type: 'promptBuilder',
      badge: 'Gerador de Projetos',
      title: 'CLAUDE CLI',
      subtitle: 'Contexto completo para iniciar o projeto',
      color: '#6ea8fe',
      buttonLabel: '',
      confirmGenerate: true,
      instructions: [
        'O texto foi preenchido automaticamente com o documento de requisitos do slide anterior',
        'Copie o texto e cole no Claude CLI para iniciar o projeto',
      ],
      hiddenVars: {
        'RESPOSTA DO CLAUDE': 'pb-REQUISITOS|Gerando o documento de requisitos do projeto:response',
      },
      inputs: [],
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

9️⃣  Deployment Standard


Architecture
Production runs entirely on Docker Compose (docker-compose.prod.yml), separate from the local dev compose. Services:
- app — PHP-FPM (or your runtime), built from a dedicated Dockerfile.prod with OPcache enabled and opcache.validate_timestamps=0 (code is cached, not re-read per request).
- nginx (nginx:alpine) — reverse proxy / web server, ports 80 + 443.
- scheduler — runs the cron loop (schedule:run every 60s) as its own container.
- queue — dedicated queue worker container.
- redis — cache / sessions / queue (with healthcheck).
- Any auxiliary services (e.g. extra DBs, integrations) with depends_on + healthchecks.
- node — build-only container, NOT a long-running service.
- certbot — Let's Encrypt issuance/renewal.
All app/scheduler/queue containers share the same Dockerfile.prod and mount the code via volume.

Nginx config (production.conf)
Must include:
- HTTP → HTTPS redirect (port 80 → 301 to 443), with /.well-known/acme-challenge/ left open for certbot.
- SSL/TLS: TLSv1.2 + TLSv1.3, modern ciphers, session cache, HSTS.
- Security headers: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy.
- Gzip enabled: gzip on, gzip_vary on, comp level 6, covering text/css/js/json/svg/xml.
- SPA / app fallback: location / { try_files $uri $uri/ /index.php?$query_string; }.
- Long-cache for static + fingerprinted build assets: expires 1y; Cache-Control "public, immutable"; on /build/ and *.(js|css|png|woff2|...), with access_log off.
- Deny dotfiles: block /.ht and /.env.
- client_max_body_size aligned with the app's upload limit.
Keep a two-config bootstrap for first deploy: an initial.conf (HTTP only, no SSL block) copied to active.conf so nginx can boot before certs exist; certbot issues the cert; then swap to the full SSL production.conf.

Two-phase workflow
Phase 1 — make send (code → main)
One command from working tree to merged main:
  1. Run make lint first.
  2. Prompt for a commit message.
  3. Create a timestamped branch auto/YYYYMMDD-HHMMSS, add -A, commit (bail cleanly if nothing to commit).
  4. Push and open an MR/PR via CLI (glab/gh).
  5. Auto-merge into main with source-branch removal, then checkout main && pull and delete the local branch.

Phase 2 — make deploy (main → production)

git stash + git pull, then call deploy-full.

  deploy-full — the core deploy (6 steps, with timing)

  Colored, numbered output. Track total time and maintenance downtime separately.
  1. Prepare env — fix storage/bootstrap/cache perms, remove public/hot, ensure nginx active.conf exists.
  2. Install backend deps — composer install --no-dev --optimize-autoloader --no-interaction inside the app container.
  3. Isolated frontend build — docker compose run --rm node sh -c "npm install && npm run build". Abort the whole deploy if the build fails (don't take the app down for a broken build).
  4. Maintenance mode — artisan down --secret="..." --retry=10 (the secret lets you preview prod while it's down). Start the downtime timer here.
  5. Migrations + caches + restart:
    - artisan migrate --force
    - config:cache, route:cache, view:clear + view:cache
    - storage:link
    - bring up infra (up -d redis nginx ...) and up -d --force-recreate app scheduler queue
    - re-fix perms, nginx -s reload
  6. Exit maintenance — artisan up. Stop timers, write public/version.json with { git short hash, commit date }, print total time + downtime.

Deploy variants

  - make deploy — normal path: git pull + deploy-full, no image rebuild (fast; volume-mounted code).
  - make deploy-rebuild — when Dockerfile.prod or PHP/Node packages changed: compose build → up -d app → rebuild client-side route helpers (e.g. Ziggy) → deploy-full.
  - make deploy-first — initial server bring-up: nginx initial.conf, compose build, key:generate --force, rebuild route helpers, deploy-full, final config:cache.

  Development (hot reload, no down/up cycle)

- Code is volume-mounted, so backend changes are picked up live — no rebuild needed for normal edits.
- Frontend dev server (Vite or equivalent) runs in the node container under a dev profile with its port exposed and HMR on; make up starts everything and you edit-and-save without make down/make up.
- make up should self-heal: compose down --remove-orphans then up -d so stale containers never block a restart.
- Keep dev OPcache timestamp validation ON (opposite of prod) so PHP changes reload.



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


🕐 Timezone Standard
All dates and times in this project use UTC-3 (America/Sao_Paulo). All date/time data provided will be in UTC-3. Store dates with timezone awareness and always display them in UTC-3 format — never convert to UTC or other offsets when saving or showing dates to the user.

Project context

{RESPOSTA DO CLAUDE}

Note: Ignore all the instructions in PROJECT CONTEXT that are divergent of the previous instructions

⚖️ LGPD Compliance
All features involving personal data (names, emails, CPF, phone numbers, addresses, payment info, etc.) must comply with Brazil's Lei Geral de Proteção de Dados (LGPD — Law 13,709/2018). This means:
- Collect only the minimum data necessary for each feature (data minimization).
- Never store sensitive data (passwords, payment credentials, tokens) in plain text — always hash or encrypt.
- Provide clear user consent before collecting personal data.
- Allow users to view, correct, and delete their own data upon request.
- Do not share or expose personal data to third parties without explicit consent.
- Log data access and mutations for audit purposes.
- Apply these rules to every model, migration, API endpoint, and UI form that handles personal data.`,
    },
  ],
};
