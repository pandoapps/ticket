.DEFAULT_GOAL := help
SHELL := /bin/bash

ifneq (,$(wildcard .env))
  include .env
  export
endif

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
	@test -f .env || (echo "✘ .env not found. Create it before deploying." && exit 1)
	@test -f backend/.env || (echo "✘ backend/.env not found. Create it before deploying." && exit 1)
	@echo "▶ Pulling latest from origin..."
	git pull --rebase
	@echo "▶ Building frontend bundle (via docker, no host Node required)..."
	docker run --rm -v "$$PWD:/app" -w /app node:20-alpine sh -c "npm ci && npm run build"
	@echo "▶ Rebuilding production containers..."
	$(COMPOSE_PROD) up -d --build --remove-orphans
	@echo "▶ Installing backend dependencies (no-dev, optimized)..."
	$(COMPOSE_PROD) exec -T app composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist
	@echo "▶ Entering maintenance mode..."
	-$(COMPOSE_PROD) exec -T app php artisan down --render="errors::503" --retry=60
	@echo "▶ Clearing stale caches..."
	$(COMPOSE_PROD) exec -T app php artisan config:clear
	$(COMPOSE_PROD) exec -T app php artisan route:clear
	$(COMPOSE_PROD) exec -T app php artisan view:clear
	$(COMPOSE_PROD) exec -T app php artisan event:clear
	@echo "▶ Running migrations (forced)..."
	$(COMPOSE_PROD) exec -T app php artisan migrate --force
	@echo "▶ Ensuring storage symlink..."
	-$(COMPOSE_PROD) exec -T app php artisan storage:link
	@echo "▶ Caching config, routes, views and events..."
	$(COMPOSE_PROD) exec -T app php artisan config:cache
	$(COMPOSE_PROD) exec -T app php artisan route:cache
	$(COMPOSE_PROD) exec -T app php artisan view:cache
	$(COMPOSE_PROD) exec -T app php artisan event:cache
	@echo "▶ Restarting queue workers (graceful)..."
	-$(COMPOSE_PROD) exec -T app php artisan queue:restart
	@echo "▶ Restarting php-fpm to flush opcache..."
	$(COMPOSE_PROD) restart app
	@echo "▶ Waiting for app to come back up..."
	@sleep 3
	@echo "▶ Leaving maintenance mode..."
	$(COMPOSE_PROD) exec -T app php artisan up
	@echo "▶ Health check..."
	@set -e; \
	for i in 1 2 3 4 5; do \
	  if curl -fsSk "https://localhost/up" > /dev/null; then \
	    echo "✔ Health check passed."; exit 0; \
	  fi; \
	  echo "  …retrying ($$i/5)"; sleep 2; \
	done; \
	echo "✘ Health check failed after 5 attempts."; exit 1
	@echo "✔ Deploy finished."

send:
	@$(MAKE) lint
	@read -r -p "Commit message: " msg; \
	if [ -z "$$msg" ]; then echo "✘ empty message, aborting."; exit 1; fi; \
	git add -A && git commit -m "$$msg" && echo "✔ Committed: $$msg" && \
	echo "▶ Pushing to origin..." && \
	git push && echo "✔ Pushed."
