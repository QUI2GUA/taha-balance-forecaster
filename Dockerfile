# 1. Base image
FROM node:18-alpine AS base

# 2. Install dependencies only when needed
FROM base AS deps
# FIX: Install libraries required by Next.js (libc6-compat) and Prisma (openssl)
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy package.json (and lock file if it exists)
COPY package.json package-lock.json* ./

# FIX: Use 'npm install' instead of 'ci' to generate lockfile automatically
RUN npm install

# 3. Rebuild the source code
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client (requires openssl from base/deps if needed, but usually self-contained)
RUN npx prisma generate

# Build Next.js
RUN npm run build

# 4. Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
