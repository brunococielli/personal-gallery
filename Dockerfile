# syntax = docker/dockerfile:1

FROM node:20-slim AS base

LABEL fly_launch_runtime="Node.js/Prisma"

WORKDIR /app
ENV NODE_ENV="production"

# ---------- Build stage ----------
FROM base AS build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    build-essential node-gyp openssl pkg-config python-is-python3

COPY package.json package-lock.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

# ---------- Final stage ----------
FROM base

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y openssl && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

COPY --from=build /app /app

EXPOSE 3000
CMD ["npm", "start"]
