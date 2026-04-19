# Ticketeira

Plataforma digital para gestão e comercialização de ingressos para eventos, com integração ao gateway **Abacate Pay**.

## Stack

- **Backend:** Laravel 11 · PHP 8.4 · MySQL 8 · Sanctum
- **Frontend:** React 19 · TypeScript · Vite · Tailwind CSS · React Router
- **Infra:** Docker · Nginx

## Requisitos

- Docker + Docker Compose
- Make
- Git

Para desenvolvimento fora do container: PHP 8.4+, Composer 2, Node 20+.

## Primeiros passos

```bash
cp .env.example .env
cp backend/.env.example backend/.env
make up
make install
make fresh
```

Acesse:
- API: http://localhost:8080
- Frontend (dev): http://localhost:5173

## Comandos do Makefile

```bash
make help        # lista completa
make up          # sobe ambiente de dev
make down        # derruba containers
make migrate     # roda migrations
make seed        # roda seeders
make fresh       # drop + migrate + seed
make db          # shell do MySQL
make thinker     # Laravel Tinker
make shell       # bash dentro do container PHP
make deploy      # deploy em produção (pull + build + migrate --force)
make send        # lint + pede mensagem de commit e commita
```

> **Nunca** use `php artisan` diretamente — sempre pelo Makefile.

## Estrutura

```
/
├── backend/           # Laravel
├── pages/             # Páginas React
├── components/        # Componentes reutilizáveis
├── services/          # API e integrações
├── hooks/             # Hooks customizados
├── utils/             # Helpers
├── docker/            # Dockerfiles e configs Nginx
├── CLAUDE.md
├── Makefile
├── docker-compose.yml
└── package.json
```

## Documentação

- [`CLAUDE.md`](./CLAUDE.md) — padrões de código, UI e regras do projeto.

## Licença

Proprietária.
