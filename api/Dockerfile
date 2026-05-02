# syntax=docker/dockerfile:1.7

# ──────────────────────────────────────────────────────────
# Stage 1 — install deps (layer cached on package*.json change)
# ──────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# ──────────────────────────────────────────────────────────
# Stage 2 — generate prisma client + build TS
# ──────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json* tsconfig.json ./
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

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/prisma ./prisma

USER app
EXPOSE 3000
ENV PORT=3000 HOST=0.0.0.0

# Run migrations on boot, then start the server.
# This is safe because Prisma migrate deploy is idempotent.
CMD ["dumb-init", "sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
