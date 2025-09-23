# Base Image - MyPersn Pattern
FROM node:20

WORKDIR /app
COPY . .

# Install system dependencies for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Install dependencies
RUN yarn install --frozen-lockfile --ignore-engines --network-timeout 1000000

# Generate Prisma client
RUN yarn prisma generate --schema=libs/database/src/lib/prisma/schema.prisma

# Build shared libraries first (Nx dependency order)
RUN yarn nx build shared-dto

# Build server (Nx handles shared library resolution automatically)
RUN npx nx run server:build:production

# Expose port
EXPOSE 3000

# Health check for container monitoring
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Run the application (MyPersn pattern - direct path)
CMD ["node", "dist/server/main.js"]