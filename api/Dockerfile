# syntax=docker/dockerfile:1.7

# ──────────────────────────────────────────────────────────
# Stage 1 — install deps (layer cached on package*.json change)
# ──────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
COPY package.json ./
RUN npm install --no-audit --no-fund --ignore-scripts

# ──────────────────────────────────────────────────────────
# Stage 2 — generate prisma client + build TS
# ──────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY package.json tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
RUN npx prisma generate
RUN npm run build

# ──────────────────────────────────────────────────────────
# Stage 3 — runtime (slim, prod deps only)
# ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl libc6-compat dumb-init && \
    addgroup -S app && adduser -S app -G app

COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund --ignore-scripts && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/prisma ./prisma
# Seed JSON files — read at runtime by seedContent.ts. They live in src/
# in dev and beside the compiled JS in prod, so we copy them into both.
COPY --from=build /app/src/seed ./src/seed
COPY --from=build /app/src/seed ./dist/seed

USER app
EXPOSE 3000
ENV PORT=3000 HOST=0.0.0.0

# Sync schema on boot, then start the server.
# We use `prisma db push` (not `migrate deploy`) because we ship the
# schema without migration files yet — prisma generates the tables
# directly from prisma/schema.prisma. Idempotent for a matching schema.
CMD ["dumb-init", "sh", "-c", "npx prisma db push --accept-data-loss --skip-generate && node dist/server.js"]
