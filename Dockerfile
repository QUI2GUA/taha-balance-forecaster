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
