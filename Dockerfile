# 1. Base image
FROM node:20-slim AS base

# 2. Builder stage - Build the Next.js application
FROM base AS builder
WORKDIR /app

# Install dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends openssl && \
    rm -rf /var/lib/apt/lists/*

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Generate the Prisma client first
RUN npx prisma generate

# Build the Next.js application
# This will generate the .next/standalone directory because of `output: 'standalone'` in next.config.mjs
RUN npm run build

# 3. Runner stage - Production server
FROM base AS runner
WORKDIR /app

# Set the NODE_ENV to production
ENV NODE_ENV=production

# Copy the standalone output from the builder stage
COPY --from=builder /app/.next/standalone ./

# Copy the public and static assets
# The server.js file in the standalone output needs these to serve static files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Expose the port the app runs on
EXPOSE 3000

# Start the application
# The server.js file is the entrypoint for the standalone application
CMD ["node", "server.js"]
