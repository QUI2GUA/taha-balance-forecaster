# 1. Base image - Debian-based slim image
FROM node:20-slim AS base

# 2. Builder stage
FROM base AS builder
WORKDIR /app

# Install dependencies and immediately clean up apt cache to save space
RUN apt-get update && \
    apt-get install -y --no-install-recommends openssl && \
    rm -rf /var/lib/apt/lists/*

# Copy source code and install npm dependencies
COPY package.json package-lock.json* ./
RUN npm install
COPY . .

# Set dummy DATABASE_URL and run the build
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public"
RUN npx prisma generate
RUN npm run build

# 3. Runner Stage (Production)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Install only necessary runtime dependencies and clean up
RUN apt-get update && \
    apt-get install -y --no-install-recommends openssl && \
    rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only the necessary build artifacts
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# --- THE DEFINITIVE FIX ---
# Manually copy the Prisma CLI and all its related packages from the builder stage's node_modules.
# This augments the stripped-down node_modules from the standalone output.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Final command, executing prisma CLI's main script directly with node
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node server.js"]
