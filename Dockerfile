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

# Build server (MyPersn pattern - direct Nx build)
RUN npx nx run server:build:production

# Create non-root user for security
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3000

# Health check for container monitoring (Azure best practice: 40s start-period for Node.js)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Run the application (MyPersn pattern - change to dist/server directory first)
WORKDIR /app/dist/server
CMD ["node", "main.js"]