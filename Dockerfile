# Ultra-minimal production Docker image
# Uses pre-built artifacts from GitHub Actions, only installs runtime deps

FROM node:20-slim

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy ONLY the files needed for production runtime
COPY package.json yarn.lock ./
COPY libs/database/src/lib/prisma/schema.prisma ./libs/database/src/lib/prisma/

# Environment variables
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Install ONLY production dependencies (no dev deps, no build tools)
RUN yarn install --production --frozen-lockfile --ignore-optional --network-timeout 1000000 && \
    yarn cache clean && \
    rm -rf /root/.cache /tmp/*

# Generate Prisma client (small, needed at runtime)
RUN yarn prisma generate --schema=libs/database/src/lib/prisma/schema.prisma

# Copy pre-built server from GitHub Actions
# This is built during GitHub Actions workflow and will be copied here
COPY dist ./dist

# Copy shared libs source (needed for shared-dto imports)
COPY libs/data ./libs/data

# Clean up
RUN rm -rf /root/.cache /tmp/* /root/.npm

# Expose port
EXPOSE 3000

# Run the application
CMD ["node", "./dist/apps/server/main.js"]
