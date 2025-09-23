# MyPersn Single-Stage Pattern
FROM node:20

WORKDIR /app
COPY . .

# Install system dependencies for Prisma
RUN apt-get update && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*

# Install dependencies (MyPersn pattern)
RUN yarn install --frozen-lockfile --ignore-engines --network-timeout 1000000

# Generate Prisma client
RUN yarn prisma generate --schema=libs/database/src/lib/prisma/schema.prisma

# Build shared libraries first (Nx dependency order)
RUN yarn nx build shared-dto

# Build server (MyPersn pattern - direct Nx build with error handling)
RUN echo "Starting server build..." && \
    npx nx run server:build:production || (echo "Build failed! Let's check what happened:" && \
    echo "Nx cache status:" && npx nx show projects && \
    echo "Current directory contents:" && ls -la && \
    echo "Server directory:" && ls -la server/ && \
    echo "Build attempt details:" && \
    npx nx run server:build:production --verbose && \
    exit 1)

# Debug: Verify build output exists
RUN echo "Build completed, checking output..." && \
    ls -la dist/ && ls -la dist/server/ && echo "Build files:" && find dist -name "*.js" | head -10

# Create non-root user for security
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3000

# Health check for container monitoring
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Run the application (MyPersn pattern - direct execution)
CMD ["node", "dist/server/main.js"]