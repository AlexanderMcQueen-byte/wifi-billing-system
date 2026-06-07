# Wi-Fi Billing System — Production Deployment

This document covers deploying the Wi-Fi billing system in production.

1) Prepare server

- Create a non-root user (e.g., `deploy`) and install Node.js 18+, MongoDB or Docker/Podman.
- Secure the server with a firewall allowing ports 22 (SSH), 443 (HTTPS), and 3000 (app) only as needed.

2) Environment

- Copy `.env.example` to `.env` and fill in:
  - `DARAJA_CONSUMER_KEY`, `DARAJA_CONSUMER_SECRET`, `DARAJA_PASSKEY`, `DARAJA_SHORTCODE`, `DARAJA_CALLBACK_URL`, `DARAJA_CALLBACK_SECRET`
  - `MONGO_URI` (point to production MongoDB)
  - `ROUTER_HOST`, `ROUTER_USER`, `ROUTER_PASSWORD`

3) Docker / Docker Compose (recommended)

- Build and run with docker-compose:

```bash
docker compose up -d --build
```

The app will be available on port 3000. Use a reverse proxy (Nginx) to terminate TLS and forward to port 3000.

TLS provisioning with Certbot (webroot)
-------------------------------------

1. Ensure `deploy/nginx/wifi-billing.conf` exists and contains a valid `server_name your-domain.com` entry. Replace `your-domain.com` with your domain.

2. Create the `www` folder used for the ACME webroot:

```bash
mkdir -p deploy/nginx/www
```

3. Obtain certificates using the provided Makefile (replace domain and email):

```bash
make certs DOMAIN=your-domain.com EMAIL=admin@your-domain.com
```

This runs the `certbot` service from `docker-compose.prod.yml` with webroot set to `deploy/nginx/www`. It will place certificates under the `certbot-etc` volume which is mounted into the `nginx` container at `/etc/letsencrypt`.

4. Start the production stack:

```bash
make up
```

5. Renewing certificates:

```bash
make renew
```

Notes:
- The `certbot` service uses a one-shot `certonly` command. After obtaining certs, `nginx` will serve TLS using `/etc/letsencrypt` mounted from the `certbot-etc` volume.
- For automation, add a cron job that runs `docker run --rm -v $(pwd)/certbot-etc:/etc/letsencrypt quay.io/letsencrypt/letsencrypt:latest renew --webroot -w /var/www/letsencrypt` and reload `nginx` when certs are renewed.


4) Systemd (alternative)

- Copy the app to `/opt/wifi-billing-system` and create the systemd unit from `deploy/wifi-billing.service`.

```bash
sudo cp deploy/wifi-billing.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now wifi-billing.service
```

5) Securing Daraja callbacks

- Configure `DARAJA_CALLBACK_URL` to use HTTPS.
- Set `DARAJA_CALLBACK_SECRET` and configure Daraja to include a signature header (if supported). The app expects either an `x-callback-signature` header containing HMAC-SHA256(payload, secret) in hex, or the legacy `x-callback-secret` header or `?secret=` query parameter.

6) Logging and monitoring

- Configure `morgan` and consider shipping logs to an external system.
- Add health checks and uptime monitoring.

7) Notes

- Ensure MikroTik Router API credentials are stored securely and the router is network-reachable from the app server.
