# 🚀 GT Automotive Backend - Hybrid MyPersn Pattern Dockerfile
# Combines MyPersn source-based approach with optimized container features

# Multi-stage build for optimization
FROM node:20 AS builder

WORKDIR /app

# Copy source code (MyPersn pattern - not artifacts)
COPY . .

# Install system dependencies for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Install dependencies with optimized settings
RUN yarn install --frozen-lockfile --ignore-engines --network-timeout 1000000

# Generate Prisma client
RUN yarn prisma generate --schema=libs/database/src/lib/prisma/schema.prisma

# Build shared libraries first (Nx dependency order)
RUN yarn nx build shared-dto

# Build server (Nx handles shared library resolution)
RUN npx nx run server:build:production

# Production stage
FROM node:20-slim AS production

WORKDIR /app

# Install only runtime dependencies
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy built application from builder stage
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json

# Expose port
EXPOSE 3000

# Health check for container monitoring
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Run the application (MyPersn pattern - clean command)
CMD ["node", "dist/server/main.js"]