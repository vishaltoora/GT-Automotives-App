# Simplified Dockerfile - MyPersn pattern without shared-dto complexity
FROM node:20

WORKDIR /app
COPY . .

# Environment variables for build
ENV DISABLE_ERD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NX_DAEMON=false

# Install dependencies
RUN yarn install --frozen-lockfile --network-timeout 1000000

# Generate Prisma client
RUN yarn prisma generate --schema=libs/database/src/lib/prisma/schema.prisma

# Build server (simplified - no shared library complications)
RUN yarn nx build server --configuration=production

# Expose port
EXPOSE 3000

# Run the application (simple path)
CMD ["node", "./dist/apps/server/main.js"]