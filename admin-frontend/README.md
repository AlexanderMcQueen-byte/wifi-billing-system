# WiFi Admin Frontend

This admin frontend now uses a standalone static dashboard served from `admin-frontend/index.html`.

Quick start:

```bash
cd admin-frontend
npm run serve
```

Then open `http://localhost:4173` in your browser.

Notes:
- The admin UI is currently a static HTML dashboard with inline JavaScript.
- It no longer relies on the React/Vite application entrypoint.
- The admin auth flow is simulated via `localStorage` and `sessionStorage` in the browser.
