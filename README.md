# Wi-Fi Hotspot Billing System (M-Pesa + MikroTik)

Production-oriented Node.js billing backend and captive portal for MikroTik hotspots, integrated with Safaricom Daraja STK Push.

## Features

- Captive portal with mobile-first package selection UI
- M-Pesa STK Push payment initiation
- Daraja callback listener with immediate ACK
- MongoDB transaction persistence for payment and provisioning state
- MikroTik user provisioning with `limit-uptime` on successful payment
- Client-side polling for payment completion and auto redirect to `http://logout.net`

## Project Structure

```
wifi-billing-system/
├── public/
│   ├── index.html
│   └── app.js
├── src/
│   ├── config/
│   │   └── config.js
│   ├── controllers/
│   │   └── paymentController.js
│   ├── models/
│   │   └── Transaction.js
│   ├── routes/
│   │   └── paymentRoutes.js
│   ├── services/
│   │   ├── mpesa.js
│   │   └── router.js
│   └── server.js
├── tests/
│   └── smoke.test.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Linux Deployment Steps

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Update `.env` with your real credentials:

- Daraja keys and passkey
- Public callback URL (must be HTTPS and reachable by Safaricom)
- MongoDB URI
- MikroTik API credentials

4. Start server:

```bash
npm start
```

5. Run smoke tests:

```bash
npm test
```

## Cloudflare KV and Turnstile setup

This app can store rate-limit state in Cloudflare Workers KV and uses Cloudflare Turnstile for STK request protection.

1. Install Terraform and log into Cloudflare if needed.
2. Copy `terraform.tfvars.example` to `terraform.tfvars` and fill in your credentials.
2. Create a Cloudflare account token with enough permissions to create KV namespaces and application tokens.
3. Run Terraform in the project root:

```bash
terraform init
terraform apply
```

4. Copy the output values:
- `cloudflare_kv_namespace_id`
- `cloudflare_api_token`

5. Add them to `.env` along with Turnstile keys:

```env
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_KV_NAMESPACE_ID=cloudflare_kv_namespace_id_from_output
CLOUDFLARE_API_TOKEN=cloudflare_api_token_from_output
TURNSTILE_SITE_KEY=your_turnstile_site_key
TURNSTILE_SECRET_KEY=your_turnstile_secret_key
```

6. Restart the server.

## API Endpoints

- `POST /api/pay` - Start M-Pesa STK push
- `POST /api/callback` - Daraja callback URL
- `GET /api/status/:phone` - Poll transaction status
- `GET /api/packages` - List available packages
- `GET /health` - Health check

## MikroTik Captive Portal Redirect

Set your hotspot login redirect URL to this app's URL, and pass query values including `mac` and `ip`.

Example:

```
https://your-domain.com/?mac=$(mac)&ip=$(ip)
```

## Production Notes

- Use HTTPS in production.
- Protect callback route with additional network controls (firewall/IP restrictions).
- Keep RouterOS API inaccessible from public internet.
- Run app via systemd or PM2.
- Enable MongoDB backups and log monitoring.
