# syntax=docker/dockerfile:1

FROM node:22-slim

WORKDIR /app

# System dependencies (for Prisma + native modules)
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    build-essential node-gyp openssl pkg-config python-is-python3 && \
    rm -rf /var/lib/apt/lists/*

# Copy package files first (better caching)
COPY package.json package-lock.json ./

# Install deps
RUN npm ci

# Copy Prisma schema BEFORE generating
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy rest of the app
COPY . .

# Runtime environment
ENV NODE_ENV=production

EXPOSE 3000
CMD ["npm", "start"]