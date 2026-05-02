# DEPLOY — Dokploy on 204.168.178.180 (turkistudio environment)

> **Audience:** the operator deploying this stack (you, or whoever has SSH/Dokploy access).
> Claude does NOT have SSH from this conversation; this guide is what gets handed off.

## Existing state (as of 2026-05-03)

The Dokploy project **`turkistudio`** already exists with:
- A **Frontend** service serving the current `turkistudio.ai` (legacy Framer build).
- An **existing Postgres database** (details to confirm with the operator before first API boot).

We do NOT replace the Frontend service immediately. We add the new stack in parallel,
verify it on a staging subdomain, then cut over.

## TL;DR — services to add

| Service | Type | Build path | Port | Domain | Status |
|---|---|---|---|---|---|
| `turki-postgres` | (existing) Postgres | — | 5432 | internal | already deployed — use it |
| `turki-api` | Application (Dockerfile) | `api/` | 3000 | `api.turkistudio.ai` | **new** |
| `turki-web-staging` | Application (Dockerfile) | `web/` | 80 | `staging.turkistudio.ai` | **new** (parallel to current Frontend) |
| `Frontend` (existing) | … | — | — | `turkistudio.ai` | leave as-is until cutover |

---

## 1) Postgres service — use the existing one

You already have a Postgres DB in the `turkistudio` Dokploy project. Reuse it:

1. In Dokploy → `turkistudio` → Postgres service → copy the internal connection string.
   It will look like:
   ```
   postgresql://<user>:<password>@<service-name>:5432/<db>
   ```
   (the `<service-name>` is the Dokploy hostname inside the docker network — usually
   the lowercase service name).

2. **Decide:** does this DB already hold data we need to preserve, or can we create a
   fresh schema?
   - If the existing DB is empty / unused → we can `prisma migrate deploy` straight against it.
   - If it has data we must preserve → create a separate logical database in the same
     Postgres instance: `CREATE DATABASE turki;` and use that in `DATABASE_URL`.

   Confirm with the operator before first API boot.

3. Use that connection string as `DATABASE_URL` in step 2.

---

## 2) API service (`turki-api`)

Dokploy → **Add Service → Application → Dockerfile**.

- Name: `turki-api`
- Repository: `https://github.com/<you>/turki-Portfolio` (after we push)
- Branch: `main`
- Build path: `/api`
- Dockerfile path: `/api/Dockerfile`
- Port: `3000`
- Domain: `api.turkistudio.ai` (or chosen subdomain) — let Dokploy auto-issue the cert

### Environment variables (required)

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
LOG_LEVEL=info

# DATABASE_URL — paste the connection string from the existing Postgres service.
# Inside Dokploy's docker network, the host is the service name (NOT the public IP).
# Example shape:
DATABASE_URL=postgresql://<user>:<password>@<existing-postgres-service>:5432/<db>?schema=public

# Generate with:  openssl rand -hex 32
JWT_SECRET=<32+ char random string>
COOKIE_SECRET=<32+ char random string>
JWT_EXPIRES_IN=12h

# Comma-separated. Put the production web origin first.
CORS_ORIGINS=https://turkistudio.ai,https://www.turkistudio.ai
PUBLIC_SITE_URL=https://turkistudio.ai

# First-time admin seed — only used if no admin exists yet.
# After first boot, change the password from the admin UI and rotate this var.
ADMIN_EMAIL=fgoafaf@gmail.com
ADMIN_PASSWORD=<strong password — not committed anywhere>

# Optional — lead-notification email
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
LEAD_NOTIFY_TO=fgoafaf@gmail.com
```

The Dockerfile runs `prisma migrate deploy` on boot. First start will create all tables and seed the admin.

### Health check

```
GET https://api.turkistudio.ai/health → { ok: true, version: "0.1.0" }
```

---

## 3) Web service (`turki-web-staging`) — parallel to existing Frontend

Dokploy → **Add Service → Application → Dockerfile**.

- Name: `turki-web-staging`
- Repository: same repo, same branch
- Build path: `/web`
- Dockerfile path: `/web/Dockerfile`
- Port: `80`
- Domain: `staging.turkistudio.ai` (or any non-production subdomain you control)

**Do NOT touch the existing Frontend service** until the staging deploy is verified.
After verification (see §5), the cutover is one of:
- Repoint `turkistudio.ai` to this service in Dokploy and decommission Frontend, OR
- Replace the Frontend service's repo/Dockerfile to use `web/` from this repo.

### Build args (Vite inlines these at build time, NOT runtime env)

```
VITE_API_URL=https://api.turkistudio.ai
VITE_PUBLIC_SITE_URL=https://staging.turkistudio.ai
```

After cutover, change `VITE_PUBLIC_SITE_URL` to `https://turkistudio.ai` and rebuild.

In Dokploy, set these under **Build → Build Args**, not **Environment**.

### Health check

```
GET https://turkistudio.ai/ → returns the SPA HTML
```

---

## 4) DNS

Cloudflare zone `turkistudio.ai` (zone id is in `~/.claude/.env`):

```
turkistudio.ai            A     <Dokploy server IP>   (already configured — leave as-is)
www.turkistudio.ai        CNAME turkistudio.ai        (already configured — leave as-is)
api.turkistudio.ai        A     <Dokploy server IP>   (NEW)
staging.turkistudio.ai    A     <Dokploy server IP>   (NEW, can remove after cutover)
```

The two new records should be **proxied** (orange cloud) for free WAF + caching.
Do NOT modify the two existing records until cutover.

---

## 5) First-boot checklist

- [ ] Postgres healthy
- [ ] API `/health` returns 200
- [ ] API logs show `seeded initial admin` exactly once
- [ ] Web loads, `/admin/login` accepts the seeded admin credentials
- [ ] Submitting `/booking` form creates a `lead_requests` row (`docker exec -it turki-postgres psql -U turki -d turki -c "select id, name, email, created_date from lead_requests order by created_date desc limit 5"`)
- [ ] Lighthouse mobile ≥ 80 on `/` (run `psi https://turkistudio.ai`)

---

## 6) Rollback

Each Dokploy deploy is a separate Docker image. To roll back:

1. Dokploy UI → service → Deployments → select previous deployment → **Redeploy**.
2. If a migration broke something, restore the DB from snapshot (Dokploy daily backups).

**Migrations are forward-only.** Never roll back the DB schema by re-running an old image — only data restore.

---

## 7) Post-deploy hardening

After first successful deploy:

1. Change the admin password from the UI; clear `ADMIN_PASSWORD` from Dokploy env.
2. Rotate `JWT_SECRET` and `COOKIE_SECRET` (will log everyone out — fine for a 1-admin app).
3. Enable Dokploy daily backups for `turki-postgres`.
4. Add Cloudflare rate-limit rule for `/api/leads` and `/api/admin/login` as a second layer.
