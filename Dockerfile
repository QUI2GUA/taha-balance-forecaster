# 1. Base image
FROM node:18-alpine AS base

# 2. Install dependencies only when needed
FROM base AS deps
# Install system libraries required by Next.js and Prisma
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy package.json (and lock file if it exists)
COPY package.json package-lock.json* ./

# --- FIX IS HERE ---
# Added '--ignore-scripts' to prevent "prisma generate" from running 
# before the schema file is copied.
RUN npm install --ignore-scripts

# 3. Rebuild the source code
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Now that we have copied all files (including prisma/schema.prisma), 
# we can generate the client safely.
RUN npx prisma generate

# Build Next.js
RUN npm run build

# 4. Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
