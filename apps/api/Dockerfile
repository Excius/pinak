# --- base ---
FROM node:20-alpine AS base
# Highly recommended: Alpine requires this for Turborepo and Prisma binaries to work reliably
RUN apk update && apk add --no-cache libc6-compat
RUN npm install -g turbo

# --- prune ---
FROM base AS builder
WORKDIR /app
COPY . .
# This securely extracts only the workspace packages 'api' depends on.
# It creates out/json (for deps) and out/full (for source code)
RUN turbo prune api --docker

# --- installer (Install deps & Build) ---
FROM base AS installer
WORKDIR /app

# 1. CACHE LAYER: Copy ONLY the json/lock files.
# Docker will cache this layer as long as package.json/package-lock.json remain unchanged.
COPY --from=builder /app/out/json/ .

# 2. CACHED INSTALL: This will completely skip if dependencies haven't changed.
RUN npm ci

# 3. SOURCE LAYER: Copy the actual source code. 
# Whenever you edit a file, the cache breaks *here*, safely bypassing the npm ci step above!
COPY --from=builder /app/out/full/ .

# 4. BUILD: Build the project and its dependencies (types, etc.)
RUN turbo run build --filter=api

# 5. PRUNE: Remove devDependencies to keep the final image size small
RUN npm prune --omit=dev

# --- runner (Production) ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

# Copy the workspace structure over to maintain monorepo symlinks
COPY --from=installer --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=installer --chown=nodejs:nodejs /app/packages ./packages
COPY --from=installer --chown=nodejs:nodejs /app/apps/api/package.json ./apps/api/package.json
COPY --from=installer --chown=nodejs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=installer --chown=nodejs:nodejs /app/apps/api/prisma ./apps/api/prisma
COPY --from=installer --chown=nodejs:nodejs /app/apps/api/src/generated ./apps/api/src/generated

# Set working directory specifically to the api app for execution
WORKDIR /app/apps/api
EXPOSE 3000

CMD ["node", "dist/server.js"]