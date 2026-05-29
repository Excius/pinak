# --- prune (minimal workspace for api) ---
FROM node:20-alpine AS prune
WORKDIR /repo
RUN npm install -g turbo

COPY package.json package-lock.json turbo.json ./
COPY apps ./apps
COPY packages ./packages

RUN turbo prune --scope=api --docker

# --- deps (install pruned deps) ---
FROM node:20-alpine AS deps
WORKDIR /app

COPY --from=prune /repo/out/json/package.json ./package.json
COPY --from=prune /repo/out/json/package-lock.json ./package-lock.json
COPY --from=prune /repo/out/full/ ./

RUN npm ci

# --- build (compile api + generate prisma client) ---
FROM node:20-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=prune /repo/out/full/ ./

RUN npm run build:packages
RUN npm run build --workspace=api

# --- prod-deps (production-only deps for api) ---
FROM node:20-alpine AS prod-deps
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=prune /repo/out/json/package.json ./package.json
COPY --from=prune /repo/out/json/package-lock.json ./package-lock.json
COPY --from=prune /repo/out/full/apps ./apps
COPY --from=prune /repo/out/full/packages ./packages

RUN npm prune --omit=dev --workspace=api --include-workspace-root

# --- runtime ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/packages/types ./packages/types
COPY --from=build /app/apps/api/package.json ./package.json
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/prisma ./prisma
COPY --from=build /app/apps/api/src/generated ./src/generated

EXPOSE 3000
CMD ["node", "dist/index.js"]
