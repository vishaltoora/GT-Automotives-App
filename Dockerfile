# =============================================================================
# GT Automotives Backend - Optimized Multi-Stage Dockerfile
# =============================================================================
# Strategy: Multi-stage build with Alpine for 90%+ size reduction
# Key: Nx generatePackageJson creates pruned dependencies
# =============================================================================

# =============================================================================
# STAGE 1: Builder - Full Node.js environment for building
# =============================================================================
FROM node:20-alpine AS builder

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++ git

WORKDIR /workspace

# Copy everything (dockerignore excludes unnecessary files)
COPY . .

# Environment variables for build
ENV DISABLE_ERD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NX_DAEMON=false

# Install dependencies with retry logic
RUN yarn install --frozen-lockfile --network-timeout 1000000 || \
    (echo "⏳ Retry 1/3..." && sleep 5 && yarn install --frozen-lockfile --network-timeout 1000000) || \
    (echo "⏳ Retry 2/3..." && sleep 10 && yarn install --frozen-lockfile --network-timeout 1000000) || \
    (echo "⏳ Retry 3/3..." && sleep 15 && yarn install --frozen-lockfile --network-timeout 1000000)

# Generate Prisma Client
RUN yarn prisma generate --schema=libs/database/src/lib/prisma/schema.prisma

# Build server with Nx (generatePackageJson: true creates pruned package.json)
RUN yarn nx build server --configuration=production

# Verify generated package.json exists
RUN ls -la /workspace/dist/apps/server/package.json && \
    echo "✅ Generated pruned package.json" && \
    wc -l /workspace/dist/apps/server/package.json

# =============================================================================
# STAGE 2: Production Runtime - Minimal Alpine image
# =============================================================================
FROM node:20-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache dumb-init tzdata

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy generated package.json (pruned dependencies from Nx)
COPY --from=builder --chown=nodejs:nodejs /workspace/dist/apps/server/package.json ./
COPY --from=builder --chown=nodejs:nodejs /workspace/yarn.lock ./

# Install ONLY production dependencies
# Note: No --frozen-lockfile because generated package.json may have different versions
RUN yarn install --production=true && \
    yarn cache clean && \
    rm -rf /tmp/*

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /workspace/dist/apps/server/main.js ./
COPY --from=builder --chown=nodejs:nodejs /workspace/dist/apps/server/assets ./assets

# Copy Prisma client
COPY --from=builder --chown=nodejs:nodejs /workspace/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nodejs:nodejs /workspace/node_modules/@prisma/client ./node_modules/@prisma/client

# Set environment
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# Switch to non-root user
USER nodejs

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "main.js"]
