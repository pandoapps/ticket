.DEFAULT_GOAL := help
SHELL := /bin/bash

COMPOSE        := docker compose
COMPOSE_PROD   := docker compose -f docker-compose.yml -f docker-compose.prod.yml
APP            := $(COMPOSE) exec app
APP_NOTTY      := $(COMPOSE) exec -T app
NODE           := $(COMPOSE) exec node

.PHONY: help up up-prod down restart logs ps install migrate seed fresh db thinker shell shell-node deploy send lint

help:
	@echo ""
	@echo "Ticketeira — Makefile"
	@echo ""
	@echo "  make up           Start dev environment (app + nginx + db + node)"
	@echo "  make up-prod      Start production environment"
	@echo "  make down         Stop all containers"
	@echo "  make restart      Restart all containers"
	@echo "  make logs         Tail logs"
	@echo "  make ps           List containers"
	@echo "  make install      Install backend + frontend dependencies"
	@echo "  make migrate      Run Laravel migrations"
	@echo "  make seed         Run Laravel seeders"
	@echo "  make fresh        Drop database and re-run migrations + seeders"
	@echo "  make db           Open MySQL shell"
	@echo "  make thinker      Open Laravel Tinker"
	@echo "  make shell        Open a bash shell inside the app container"
	@echo "  make shell-node   Open a sh shell inside the node container"
	@echo "  make deploy       Pull latest and deploy to production"
	@echo "  make send         Lint, prompt for commit message, and commit"
	@echo "  make lint         Run linters (backend + frontend)"
	@echo ""

up:
	$(COMPOSE) up -d --build

up-prod:
	$(COMPOSE_PROD) up -d --build

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) restart

logs:
	$(COMPOSE) logs -f --tail=100

ps:
	$(COMPOSE) ps

install:
	$(APP) composer install
	$(NODE) npm install

migrate:
	$(APP) php artisan migrate

seed:
	$(APP) php artisan db:seed

fresh:
	$(APP) php artisan migrate:fresh --seed

db:
	$(COMPOSE) exec db bash -lc 'mysql -u$${MYSQL_USER:-ticketeira} -p$${MYSQL_PASSWORD:-secret} $${MYSQL_DATABASE:-ticketeira}'

thinker:
	$(APP) php artisan tinker

shell:
	$(APP) bash

shell-node:
	$(NODE) sh

lint:
	@echo "▶ Backend: Laravel Pint"
	-$(APP_NOTTY) ./vendor/bin/pint
	@echo "▶ Frontend: ESLint"
	-$(NODE) npm run lint --silent || true

deploy:
	@echo "▶ Pulling latest from origin..."
	git pull --rebase
	@echo "▶ Building frontend bundle..."
	npm ci
	npm run build
	@echo "▶ Rebuilding production containers..."
	$(COMPOSE_PROD) up -d --build
	@echo "▶ Installing backend dependencies (no-dev)..."
	$(COMPOSE_PROD) exec -T app composer install --no-dev --optimize-autoloader
	@echo "▶ Running migrations (forced)..."
	$(COMPOSE_PROD) exec -T app php artisan migrate --force
	@echo "▶ Caching config/routes/views..."
	$(COMPOSE_PROD) exec -T app php artisan config:cache
	$(COMPOSE_PROD) exec -T app php artisan route:cache
	$(COMPOSE_PROD) exec -T app php artisan view:cache
	@echo "✔ Deploy finished."

send:
	@$(MAKE) lint
	@read -r -p "Commit message: " msg; \
	if [ -z "$$msg" ]; then echo "✘ empty message, aborting."; exit 1; fi; \
	git add -A && git commit -m "$$msg" && echo "✔ Committed: $$msg"
