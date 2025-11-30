# 1. Base image
FROM node:18-alpine AS base

# 2. Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl1.1-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install packages but SKIP scripts (prevents "prisma generate" failing before schema exists)
RUN npm install --ignore-scripts

# 3. Builder Stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set a dummy DATABASE_URL for build time
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public"

# CRITICAL STEP: Explicitly generate the client here with the schema present
RUN npx prisma generate

# Now run the build
RUN npm run build

# 4. Runner Stage (Production)
FROM base AS runner
WORKDIR /app

# Install OpenSSL 1.1 for Prisma Client
RUN apk add --no-cache openssl1.1-compat

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the PUBLIC folder
COPY --from=builder /app/public ./public

# Copy the STANDALONE build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# --- CLAUDE'S FIX (Essential for DB) ---
# Copy the generated Prisma client binaries to the runner
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
# Copy the schema just in case we need it for migrations later
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
