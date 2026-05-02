# DEPLOY — Dokploy on 204.168.178.180 (turkistudio environment)

> **Audience:** the operator deploying this stack (server-conversation agent or human).
> The site **has not been publicly launched yet** — direct cutover is fine, no staging needed.

## Existing state (verify before acting)

The Dokploy project **`turkistudio`** has a service named **`turkistudio-frontend`** (or similar)
that currently serves the legacy Framer static site at `turkistudio.ai`. There may also be an
existing Postgres service.

**Decisions taken (override prior staging-first guidance):**
- Create a **fresh** Postgres service `turki-postgres`. Do NOT reuse a shared Postgres — clean
  isolation, no risk of clashing with anything else in this Dokploy instance.
- **Modify the existing `turkistudio-frontend` service in place** to build the new React app
  from `web/`. Do NOT create a parallel staging service — the site has no public users yet,
  and a clean swap is simpler than maintaining two URLs.
- Add a new `turki-api` service for the backend.
- Cutover is immediate once the three services pass health checks.

## TL;DR — services after this deploy

| Service | Action | Build path | Port | Domain |
|---|---|---|---|---|
| `turki-postgres` | **create new** (Database → PostgreSQL 16) | — | 5432 | internal only |
| `turki-api` | **create new** (Application → Dockerfile) | `./api` | 3000 | `api.turkistudio.ai` |
| `turkistudio-frontend` | **modify in place** (switch to Dockerfile build) | `./web` | 80 | `turkistudio.ai` (existing) |

---

## 1) Postgres service — `turki-postgres`

Dokploy → project `turkistudio` → **Add Service → Database → PostgreSQL**.

- Name: `turki-postgres`
- Version: `16`
- Database: `turki`
- User: `turki`
- Password: **generate a strong one** (`openssl rand -hex 24`) — copy for step 2
- External port: leave unexposed (internal only)

Daily backups: enable in Dokploy after first successful API deploy.

---

## 2) API service — `turki-api`

Dokploy → project `turkistudio` → **Add Service → Application**.

- Name: `turki-api`
- Source: `https://github.com/fahad-ghazi/turki-Portfolio` (the repo Dokploy already uses)
- Branch: `main` (the new code is now on main, commit `b283ae5` or later)
- Build Type: **Dockerfile**
- Build Path / Context: `./api`
- Dockerfile Path: `./api/Dockerfile`
- Port: `3000`
- Domain: `api.turkistudio.ai` — let Dokploy issue the cert via Let's Encrypt

### Environment variables (required)

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
LOG_LEVEL=info

# Use the Postgres service hostname inside Dokploy's docker network.
# It's the lowercase service name. Confirm in Dokploy after step 1.
DATABASE_URL=postgresql://turki:<PASSWORD_FROM_STEP_1>@turki-postgres:5432/turki?schema=public

# openssl rand -hex 32  for both
JWT_SECRET=<32+ char random hex>
COOKIE_SECRET=<32+ char random hex>
JWT_EXPIRES_IN=12h

# The new public origin (and any aliases). Frontend lives here.
CORS_ORIGINS=https://turkistudio.ai,https://www.turkistudio.ai
PUBLIC_SITE_URL=https://turkistudio.ai

# First-boot admin seed — used ONCE if the admins table is empty.
# Change the password from the admin UI after first login, then clear
# ADMIN_PASSWORD from this env so it doesn't sit in plain text.
ADMIN_EMAIL=fgoafaf@gmail.com
ADMIN_PASSWORD=<strong, set here only for first boot>

# Optional — lead-notification email
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
LEAD_NOTIFY_TO=fgoafaf@gmail.com
```

The Dockerfile runs `npx prisma migrate deploy` on boot. First start creates all tables and
seeds the admin idempotently.

### Health check

```
GET https://api.turkistudio.ai/health → { ok: true, version: "0.1.0" }
```

If this fails, check container logs first — the most common failures are a wrong
`DATABASE_URL` (host unreachable) or a too-short `JWT_SECRET`.

---

## 3) Frontend service — modify the existing `turkistudio-frontend`

This is the **existing** service that currently builds Framer. Edit its config in place:

| Field | Old value | **New value** |
|---|---|---|
| Branch | (likely `main`) | `main` (no change — main now has the new code) |
| Build Type | Static / Buildpack | **Dockerfile** |
| Build Path / Context | `./` | `./web` |
| Dockerfile Path | (none) | `./web/Dockerfile` |
| Port | (whatever) | `80` |
| Domain | `turkistudio.ai` | `turkistudio.ai` (no change) |

### Build args (Vite inlines these at build time, NOT runtime env)

In Dokploy, set these under **Build → Build Args** (NOT Environment):

```
VITE_API_URL=https://api.turkistudio.ai
VITE_PUBLIC_SITE_URL=https://turkistudio.ai
```

### Health check

```
GET https://turkistudio.ai/ → returns the SPA HTML
```

---

## 4) DNS

Cloudflare zone `turkistudio.ai` (zone-manager conversation handles this).

**New record needed:**
```
api.turkistudio.ai      A → <Dokploy server IP>   (Proxied — orange cloud)
```

Existing records (`turkistudio.ai`, `www.turkistudio.ai`) stay as-is — the existing
`turkistudio-frontend` service keeps the same domain, only its build pipeline changes.

---

## 5) Suggested order of operations

1. Create `turki-postgres`. Wait until healthy.
2. Add the `api.turkistudio.ai` DNS record.
3. Create `turki-api` with the env vars above. Deploy.
4. Verify `https://api.turkistudio.ai/health` returns `{ ok: true }`.
5. Modify `turkistudio-frontend` config (Build Type / Path / Dockerfile / Build Args).
6. Trigger Redeploy on `turkistudio-frontend`.
7. Verify `https://turkistudio.ai/` loads the new React app and `/admin/login` accepts
   the seeded admin credentials.
8. Submit a test booking from `/booking` and confirm a row appears in the API logs (or
   `psql -c "select id, name, created_date from lead_requests order by created_date desc limit 1"`).

If step 7 fails, the most common cause is `VITE_API_URL` not being set as a Build Arg
(it must be a build-time arg, not a runtime env — Vite inlines it into the JS bundle).

---

## 6) Rollback

The legacy Framer build is still in git history (commit `aba36ab` and earlier). If the
new Frontend deploy fails, in Dokploy → `turkistudio-frontend` → **Deployments** → pick the
last green deployment → **Redeploy**. That brings Framer back instantly.

If a DB migration broke something, the migrations are forward-only — restore from
Dokploy's daily Postgres backup rather than rolling back the schema.

---

## 7) Post-deploy hardening

Once the three services are green:

1. Change the admin password from the UI; remove `ADMIN_PASSWORD` from Dokploy env vars.
2. Rotate `JWT_SECRET` and `COOKIE_SECRET` (logs everyone out — fine for a 1-admin app).
3. Enable Dokploy daily backups for `turki-postgres`.
4. Add a Cloudflare rate-limit rule for `/api/leads` and `/api/admin/login` as a second
   layer of spam/brute-force protection (the API also rate-limits itself).
