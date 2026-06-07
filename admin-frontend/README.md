# WiFi Admin Frontend

Admin frontend built with Vite + React. Talks to backend at `http://localhost:3000/api` by default. Set `LOCAL_API_URL` to change.

Quick start:

```bash
cd admin-frontend
npm install
npm run dev
```

Login: use the API `POST /api/admin/auth/signup` to create first admin user or `POST /api/admin/auth/login` to sign in.

Notes:
- JWT stored in `localStorage` under `admin_token`.
- The UI is minimal; it demonstrates login, dashboard, settings, routers, and packages interfaces wired to backend APIs.
