# CLAUDE.md — Ticketeira

Guia obrigatório para uso do Claude no projeto **Ticketeira** (plataforma de venda de ingressos integrada ao Abacate Pay).

---

## 1. Regras inegociáveis

- **Nunca faça commit automático.** Commits só via `make send`, executado manualmente pelo Thiago após revisão.
- **Nunca use `php artisan` diretamente.** Toda interação com o Laravel passa pelo Makefile (`make migrate`, `make seed`, `make thinker` etc.).
- **Acentuação portuguesa correta** em todo conteúdo em português (código, UI, mensagens, comentários). Sem "nao", "voce", "acao" — use **não**, **você**, **ação**.
- **Escolha um padrão de idioma por projeto e mantenha.** Neste projeto: UI e mensagens ao usuário final em **português**; código, nomes de variáveis, commits e documentação técnica em **inglês**.

---

## 2. Stack oficial

### Backend
- Laravel 11+
- PHP 8.4+
- MySQL 8
- Laravel Sanctum (autenticação de API)
- Arquitetura MVC
- REST JSON API

### Frontend
- React 19
- TypeScript 5+
- Vite
- Tailwind CSS
- React Router

### Infra
- Docker + Docker Compose
- Nginx como proxy reverso
- Cloudflare (quando aplicável)
- Git
- Makefile obrigatório

---

## 3. Estrutura de pastas

```
/
├── backend/           # Laravel
├── pages/             # Páginas React (rotas)
├── components/        # Componentes reutilizáveis
├── services/          # Chamadas de API / integrações
├── hooks/             # Hooks customizados
├── utils/             # Helpers puros
├── docker/            # Dockerfiles e configs de Nginx
├── CLAUDE.md
├── README.md
├── Makefile
├── docker-compose.yml
└── package.json
```

---

## 4. Comandos do Makefile

| Comando           | O que faz                                                      |
| ----------------- | -------------------------------------------------------------- |
| `make up`         | Sobe dev (app + nginx + db + node)                             |
| `make up-prod`    | Sobe produção                                                  |
| `make down`       | Para todos os containers                                       |
| `make install`    | Instala dependências (composer + npm)                          |
| `make migrate`    | Roda migrations                                                |
| `make seed`       | Roda seeders                                                   |
| `make fresh`      | Drop + migrate + seed                                          |
| `make db`         | Abre shell MySQL                                               |
| `make thinker`    | Abre Laravel Tinker                                            |
| `make shell`      | Shell no container do app                                      |
| `make deploy`     | Pull + build + migrate --force + cache (produção)              |
| `make send`       | Lint + pede mensagem de commit + commit                        |

---

## 5. Convenções de código

### React
- Apenas componentes funcionais.
- Hooks são obrigatórios para estado e efeitos.
- Props tipadas via `interface`.
- Serviços isolados em `services/` — **nunca** fetch/axios direto em componentes.
- Nomes de arquivo: `PascalCase.tsx` para componentes/páginas, `camelCase.ts` para hooks/services/utils.

### Laravel
- Controllers retornam JSON consistente.
- Validação via `FormRequest`.
- Respostas via `API Resources`.
- Regra de negócio em `app/Services/` — nunca no Controller.
- Sem lógica pesada em Controller.

### Banco de dados
Toda tabela:

```php
$table->id();
$table->timestamps();
$table->softDeletes();
```

Relacionamentos:

```php
$table->foreignId('user_id')->constrained()->onDelete('cascade');
```

Seeders sempre idempotentes (`updateOrCreate`), nunca `insert` estático.

---

## 6. Padrões de UI

- **Mobile-first.**
- **Modais:**
  - Fechar ao clicar fora.
  - Fechar ao pressionar `ESC`.
  - Foco preso dentro do modal enquanto aberto.
- **Toasts** para feedback de sucesso/erro (nunca `alert()`).
- **Tratamento de erro** sempre via toast + mensagem clara, nunca stack trace.

---

## 7. Padrão de resposta JSON (backend)

Sucesso:

```json
{ "data": { ... } }
```

Lista:

```json
{ "data": [ ... ], "meta": { "total": 42, "page": 1 } }
```

Erro:

```json
{ "message": "Mensagem legível", "errors": { "campo": ["detalhe"] } }
```

Status codes corretos: `200`, `201`, `204`, `400`, `401`, `403`, `404`, `422`, `500`.

---

## 8. Git

- Branches: `main` (produção), `develop` (opcional), `feature/xxx`, `fix/xxx`.
- Commits descritivos, em inglês, um assunto por commit.
- Nunca misturar features não relacionadas.

---

## 9. Integração Abacate Pay

- Cada **produtor** configura suas próprias credenciais (public key + secret key).
- Validar credenciais antes de liberar publicação de eventos.
- Criação de cobrança, webhook de confirmação e tratamento dos status `paid`, `pending`, `cancelled`.
- Todo payload de webhook é verificado por assinatura antes de mutar estado.
- Nunca commitar credenciais — sempre via `.env` e criptografadas em banco quando persistidas.

---

## 10. Checklist de pré-produção

- [ ] `.env` configurado
- [ ] `APP_KEY` gerada
- [ ] Sanctum funcionando
- [ ] CORS configurado
- [ ] Migrations executadas
- [ ] Seeders idempotentes
- [ ] Login funcionando
- [ ] Rotas protegidas funcionando
- [ ] Logs limpos
- [ ] Erros tratados com JSON consistente
- [ ] Build de frontend otimizado
- [ ] Cache habilitado
- [ ] Fluxo completo de autenticação testado

---

## 11. Perfis de usuário

- **Admin** — controle total, moderação de produtores, dashboard global, configuração de taxas e comissões, auditoria.
- **Produtor** — cria/gerencia eventos, configura credenciais Abacate Pay, define ingressos, acompanha vendas, exporta relatórios.
- **Cliente** — navega eventos, compra ingressos, recebe ingresso digital (QR Code), acessa histórico.

Arquitetura **multi-tenant por produtor**. Todo recurso de evento/venda/ticket é escopado ao `producer_id` autenticado.
