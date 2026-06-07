# Makefile to provision TLS certs and run production stack
DOMAIN ?= your-domain.com
EMAIL ?= admin@your-domain.com

.PHONY: help certs up down renew

help:
	@echo "Usage: make [target]"
	@echo "  certs DOMAIN=example.com EMAIL=you@example.com  - obtain TLS certs via certbot"
	@echo "  up     - start production stack (docker compose)"
	@echo "  down   - stop production stack"
	@echo "  renew  - renew certs (runs certbot renew)")

certs:
	@echo "Obtaining TLS certs for $(DOMAIN)"
	LETSENCRYPT_EMAIL=$(EMAIL) DOMAIN=$(DOMAIN) docker compose -f docker-compose.prod.yml run --rm certbot

up:
	docker compose -f docker-compose.prod.yml up -d --build

down:
	docker compose -f docker-compose.prod.yml down

renew:
	@echo "Run renew inside certbot image (requires config in certbot-etc)"
	docker run --rm -v $(pwd)/certbot-etc:/etc/letsencrypt quay.io/letsencrypt/letsencrypt:latest renew --webroot -w /var/www/letsencrypt
