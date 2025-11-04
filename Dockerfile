# Multi-stage build to keep image size small
# Stage 1: Build stage with all dependencies
FROM node:20-slim AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json yarn.lock ./
COPY nx.json tsconfig*.json ./

# Copy source code
COPY apps ./apps
COPY libs ./libs
COPY server ./server

# Environment variables for build
ENV DISABLE_ERD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV NX_DAEMON=false

# Install ALL dependencies (needed for build)
RUN yarn install --frozen-lockfile --network-timeout 1000000 || \
    (echo "Retry 1/3..." && sleep 5 && yarn install --frozen-lockfile --network-timeout 1000000) || \
    (echo "Retry 2/3..." && sleep 10 && yarn install --frozen-lockfile --network-timeout 1000000) || \
    (echo "Retry 3/3..." && sleep 15 && yarn install --frozen-lockfile --network-timeout 1000000)

# Generate Prisma client
RUN yarn prisma generate --schema=libs/database/src/lib/prisma/schema.prisma

# Build server
RUN yarn nx build server --configuration=production

# Stage 2: Production stage with only runtime dependencies
FROM node:20-slim AS production

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json yarn.lock ./
COPY nx.json tsconfig*.json ./

# Copy source code (needed for Prisma schema and shared libraries)
COPY libs ./libs
COPY server ./server

# Environment variables
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Install ONLY production dependencies
RUN yarn install --production --frozen-lockfile --network-timeout 1000000 && \
    yarn cache clean

# Generate Prisma client (needed in production)
RUN yarn prisma generate --schema=libs/database/src/lib/prisma/schema.prisma

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Clean up unnecessary files
RUN rm -rf .nx /tmp/* /root/.cache

# Expose port
EXPOSE 3000

# Run the application
CMD ["node", "./dist/apps/server/main.js"]
