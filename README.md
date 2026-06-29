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

---

## Ambiente local (desenvolvimento)

### 1. Copiar os arquivos de ambiente

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Edite `backend/.env` com as credenciais do banco e demais variáveis necessárias.

### 2. Subir os containers

```bash
make up
```

Isso inicia o container PHP (app), Nginx, MySQL e o servidor Vite (node).

### 3. Instalar dependências e gerar APP_KEY

```bash
make install
```

Instala dependências do Composer e do npm. Se `APP_KEY` estiver ausente no `backend/.env`, ela é gerada automaticamente.

### 4. Criar o banco e popular dados iniciais

```bash
make fresh
```

Executa `migrate:fresh --seed` — apaga o banco, roda todas as migrations e os seeders.

### Acessos locais

| Serviço        | URL                      |
| -------------- | ------------------------ |
| API (Laravel)  | http://localhost:8080    |
| Frontend (dev) | http://localhost:5173    |
| MySQL          | localhost:3306           |

> **Nunca** use `php artisan` diretamente — sempre pelo Makefile.

---

## Ambiente de produção

### Pré-requisitos no servidor

- Docker + Docker Compose
- Make
- Git

### 1. Clonar o repositório

```bash
git clone <repo-url> /var/www/ticketeira
cd /var/www/ticketeira
```

### 2. Criar e preencher os arquivos de ambiente

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Edite **obrigatoriamente** em `backend/.env`:

| Variável       | Descrição                                   |
| -------------- | ------------------------------------------- |
| `APP_ENV`      | `production`                                |
| `APP_DEBUG`    | `false`                                     |
| `APP_URL`      | URL pública da aplicação                    |
| `DB_HOST`      | Host do banco de dados externo              |
| `DB_DATABASE`  | Nome do banco                               |
| `DB_USERNAME`  | Usuário do banco                            |
| `DB_PASSWORD`  | Senha do banco                              |

> O banco de dados em produção é externo — o container MySQL **não** sobe (`profiles: ["local-db"]`).

### 3. Marcar o host como produção

Esse arquivo impede que `make up` (dev) seja executado acidentalmente no servidor:

```bash
sudo touch /etc/ticketeira-prod
```

### 4. Subir os containers de produção

```bash
make up-prod
```

### 5. Instalar dependências e gerar APP_KEY

```bash
make install
```

Se `APP_KEY` estiver ausente, é gerada automaticamente neste passo.

### 6. Criar o banco e popular dados iniciais (primeira vez)

```bash
make fresh
```

> Em deploys subsequentes use `make deploy`, que roda `migrate --force` sem apagar dados.

### 7. Deploy de atualizações

Para atualizar a aplicação após o setup inicial:

```bash
make deploy
```

O comando executa, na ordem: `git pull`, build do frontend, rebuild dos containers, `composer install --no-dev`, `migrate --force`, cache de config/routes/views e health check.

### Acessos em produção

O Nginx escuta nas portas **80** e **443** internamente. O acesso externo depende do mapeamento do seu host/proxy:

| Protocolo | Porta interna | Exemplo externo           |
| --------- | ------------- | ------------------------- |
| HTTP      | 80            | http://servidor:1180      |
| HTTPS     | 443           | https://servidor:1443     |

> A porta **5173** (Vite dev server) **não existe em produção** — o container `node` nunca sobe. O frontend é servido como bundle estático pelo Nginx a partir do diretório `./dist`.

---

## Comandos do Makefile

```bash
make help        # lista completa
make up          # sobe ambiente de dev
make up-prod     # sobe ambiente de produção
make down        # derruba containers
make install     # instala dependências + gera APP_KEY se ausente
make migrate     # roda migrations
make seed        # roda seeders
make fresh       # drop + migrate + seed
make db          # shell do MySQL
make thinker     # Laravel Tinker
make shell       # bash dentro do container PHP
make deploy      # deploy em produção (pull + build + migrate --force)
make send        # lint + pede mensagem de commit e commita
```

---

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
