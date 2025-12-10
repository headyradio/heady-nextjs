# Payload server scaffold

This folder runs Payload CMS as a separate service that your Vite/React app can call. It assumes a Postgres database (Supabase is fine) and can be deployed to any long‑lived Node host (Payload Cloud, Fly.io, Render, Railway, etc.).

## Quick start
1) Copy env values (Supabase Postgres works):
   - `PAYLOAD_SECRET=change-me`
   - `DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/dbname?sslmode=require`
   - `PAYLOAD_PUBLIC_SERVER_URL=http://localhost:4000`
   - `PAYLOAD_CORS=http://localhost:5173`
   - `PAYLOAD_CSRF=http://localhost:5173`
   - `PORT=4000`
   - `DATABASE_SSL=true` (Supabase typically requires SSL)

2) Install deps:
   ```
   cd payload-server
   npm install
   ```

3) Run locally:
   ```
   npm run dev
   ```
   Admin/UI will be at `http://localhost:4000/admin`.

## What’s included
- `payload.config.ts`: collections for `users` (auth), `heroCards` (public read), `media` (uploads). Uses Postgres adapter with optional SSL (Supabase friendly).
- `src/server.ts`: Express bootstrap, CORS wired from `PAYLOAD_CORS`, exposes `/admin` and `/api/*`.
- `tsconfig.json`: NodeNext setup for ESM + tsx.

## Notes
- For uploads, `media` writes to `payload-server/media` by default. On hosts without persistent disk, switch to S3 via a Payload upload adapter.
- Keep your Vite app pointed to this server with `VITE_PAYLOAD_API=https://your-payload-host`.
- If you need stricter access, tighten `heroCards` access in `payload.config.ts`.



