# syntax=docker/dockerfile:1.7

# ──────────────────────────────────────────────────────────
# Stage 1 — install + build
# ──────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Build-time public env (Vite inlines these into the bundle)
ARG VITE_API_URL=http://localhost:3000
ARG VITE_PUBLIC_SITE_URL=http://localhost:5173
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_PUBLIC_SITE_URL=${VITE_PUBLIC_SITE_URL}

COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

# ──────────────────────────────────────────────────────────
# Stage 2 — nginx serve
# ──────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
