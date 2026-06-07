# Guía de deploy — Supabase Cloud + Vercel (gratis)

Stack de producción: **Supabase Cloud** (Postgres + Auth + Storage, free) +
**Vercel Hobby** (Next.js + crons). Todo gratis. ~20 min.

Necesitás cuentas (gratis) en: **GitHub**, **Supabase** y **Vercel**.

---

## 1. Subir el código a GitHub

```bash
# Creá un repo vacío en github.com (sin README), después:
git remote add origin https://github.com/<usuario>/prode-mundial-2026.git
git push -u origin main
```

> `.env.local` está en `.gitignore`: no se sube (bien, son secretos).

## 2. Supabase Cloud

1. En https://supabase.com → **New project**. Elegí región cercana y **anotá la
   contraseña** de la base. Esperá a que termine de aprovisionar.
2. Linkear el CLI local al proyecto y aplicar el esquema:
   ```bash
   npx supabase login            # abre el navegador
   npx supabase link --project-ref <REF>   # REF está en Settings → General
   npx supabase db push          # aplica TODAS las migraciones (incl. datos de referencia)
   ```
3. **Cerrar el registro** (lista cerrada): Dashboard → **Authentication → Sign In /
   Providers → Email** → desactivá *"Allow new users to sign up"*. Confirmá que
   *Confirm email* esté **off** (para poder crear usuarios sin verificación).
4. Copiá las credenciales: Dashboard → **Settings → API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` (secreto) → `SUPABASE_SERVICE_ROLE_KEY`
5. **Crear los usuarios y traer el fixture en la nube** (apuntando los scripts a
   cloud; las vars del shell tienen prioridad sobre `.env.local`):
   ```bash
   NEXT_PUBLIC_SUPABASE_URL="https://<REF>.supabase.co" \
   SUPABASE_SERVICE_ROLE_KEY="<service_role>" \
   npm run seed:users

   NEXT_PUBLIC_SUPABASE_URL="https://<REF>.supabase.co" \
   SUPABASE_SERVICE_ROLE_KEY="<service_role>" \
   FOOTBALL_DATA_TOKEN="<token>" \
   npm run sync:fixtures
   ```

## 3. Vercel

1. https://vercel.com → **Add New → Project** → importá el repo de GitHub.
   Next.js se detecta solo.
2. **Environment Variables** (Production): cargá todas:
   | Variable | Valor |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://<REF>.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role key |
   | `GEMINI_API_KEY` | tu key de Google AI Studio |
   | `FOOTBALL_DATA_TOKEN` | tu token de football-data.org |
   | `CRON_SECRET` | generá uno: `openssl rand -hex 32` |
3. **Deploy**.
4. En Supabase → **Authentication → URL Configuration** → poné el dominio de
   Vercel en **Site URL** (ej. `https://prode-mundial-2026.vercel.app`).

## 4. Verificar

- Entrá a la URL de Vercel y logueate con un usuario sembrado
  (ej. `omar@prode.local` / `prode2026`).
- Probá el sync manual en prod (opcional):
  `curl -H "Authorization: Bearer <CRON_SECRET>" https://<app>.vercel.app/api/cron/sync-fixtures`

## Notas
- **Crons**: en Vercel **Hobby** corren ~1 vez/día (definidos en `vercel.json`:
  sync 08:00, mensajes 09:00 UTC). Durante el torneo, para resultados más
  seguidos, dispará el cron de sync manualmente (con el header `Authorization`)
  o pasá a Pro.
- Cambios de esquema futuros: nueva migración + `supabase db push`.
- Re-deploy al hacer `git push` (Vercel lo hace automático).
