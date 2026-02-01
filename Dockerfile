# syntax=docker/dockerfile:1

FROM node:22-slim

WORKDIR /app

# Install system deps
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    build-essential node-gyp openssl pkg-config python-is-python3 && \
    rm -rf /var/lib/apt/lists/*

# Prisma safety
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
ENV PRISMA_CLI_BINARY_TARGETS=debian-openssl-3.0.x

# IMPORTANT: install deps BEFORE production mode
COPY package.json ./
RUN npm install --omit=optional

# Prisma
COPY prisma ./prisma
RUN npx prisma generate

# App code
COPY . .

# Runtime env (safe here)
ENV NODE_ENV=production

EXPOSE 3000
CMD ["npm", "start"]