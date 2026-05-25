# Multi-stage Dockerfile for the web app.
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9 --activate

# ---- deps ----
FROM base AS deps
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml turbo.json ./
COPY apps ./apps
COPY packages ./packages
RUN pnpm install --frozen-lockfile

# ---- builder ----
FROM deps AS builder
RUN pnpm db:generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @astrotalk/web build
RUN pnpm --filter @astrotalk/admin build

# ---- runner: web ----
FROM base AS web
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
