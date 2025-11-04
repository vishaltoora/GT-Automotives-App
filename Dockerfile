# Simplified Dockerfile - MyPersn pattern without shared-dto complexity
FROM node:20-slim

WORKDIR /app
COPY . .

# Environment variables for build
ENV DISABLE_ERD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NX_DAEMON=false

# Install dependencies with retry logic for transient network errors
RUN yarn install --frozen-lockfile --network-timeout 1000000 || \
    (echo "Retry 1/3..." && sleep 5 && yarn install --frozen-lockfile --network-timeout 1000000) || \
    (echo "Retry 2/3..." && sleep 10 && yarn install --frozen-lockfile --network-timeout 1000000) || \
    (echo "Retry 3/3..." && sleep 15 && yarn install --frozen-lockfile --network-timeout 1000000)

# Generate Prisma client
RUN yarn prisma generate --schema=libs/database/src/lib/prisma/schema.prisma

# Build server (simplified - no shared library complications)
RUN yarn nx build server --configuration=production

# Remove dev dependencies and clean cache to reduce image size
RUN rm -rf node_modules && \
    yarn install --production --frozen-lockfile --network-timeout 1000000 && \
    yarn cache clean && \
    rm -rf .nx /tmp/* /root/.cache

# Expose port
EXPOSE 3000

# Run the application (simple path)
CMD ["node", "./dist/apps/server/main.js"]
