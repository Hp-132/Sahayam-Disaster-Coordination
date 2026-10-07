# SAHAYAM Frontend

Vite + React + TypeScript frontend for the SAHAYAM disaster-relief coordination platform.

## Setup

```bash
cp .env.example .env
# edit .env if needed
npm install
npm run dev
```

App: http://localhost:5173  
API default: http://localhost:8000

## Demo admin credentials

This is an intentionally public demo account for evaluators; it is pre-filled on the Admin Login page:

- Email: `adming4@gmail.com`
- Password: `sahayamg4`

They can be overridden with `VITE_ADMIN_EMAIL` / `VITE_ADMIN_PASSWORD` (see `.env.example`). Any `VITE_*` value ends up in the public JS bundle, so never use a real password there.

Citizen and volunteer profiles are stored in the browser (localStorage). Admin session uses sessionStorage.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run preview` — preview production build
