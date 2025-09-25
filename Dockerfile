# Multi-stage build for optimized production container
# Stage 1: Builder
FROM node:20 AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json yarn.lock ./
COPY nx.json tsconfig.base.json ./

# Copy source code
COPY apps ./apps
COPY libs ./libs
COPY server ./server

# Install all dependencies (including dev dependencies for building)
RUN yarn install --frozen-lockfile --network-timeout 1000000

# Generate Prisma client
RUN yarn prisma generate --schema=libs/database/src/lib/prisma/schema.prisma

# Disable Nx daemon for Docker builds
ENV NX_DAEMON=false

# Clear any existing builds
RUN rm -rf dist/

# Build shared libraries first (Nx dependency order)
RUN yarn nx build shared-dto --skip-nx-cache

# Verify shared-dto build output
RUN ls -la dist/libs/shared-dto/ && ls -la dist/libs/shared-dto/src/

# Build server (production mode is default for server:build)
RUN yarn nx build server --skip-nx-cache

# Debug: Verify server build output structure
RUN echo "Debugging server build output structure:" && \
    ls -la dist/ && \
    echo "Contents of dist/server:" && \
    ls -la dist/server/ && \
    echo "Size of main.js:" && \
    du -h dist/server/main.js

# Stage 2: Production
FROM node:20-slim AS production

WORKDIR /app

# Install system dependencies for Prisma
RUN apt-get update && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*

# Copy built application from builder stage
COPY --from=builder /app/dist/server ./dist/server
COPY --from=builder /app/dist/libs ./dist/libs

# Copy Prisma schema for migrations and client generation
COPY --from=builder /app/libs/database/src/lib/prisma ./prisma

# Copy node_modules with Prisma client already generated
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy shared-dto built output
COPY --from=builder /app/node_modules/@gt-automotive ./node_modules/@gt-automotive

# Install only production dependencies based on generated package.json
WORKDIR /app/dist/server
RUN npm install --production --ignore-scripts

# Create non-root user for security
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3000

# Health check for container monitoring (Azure best practice: 40s start-period for Node.js)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Run the application
CMD ["node", "main.js"]