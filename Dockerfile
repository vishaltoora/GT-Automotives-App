# Base Image - MyPersn pattern with shared library fix
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

# Build shared-dto library first
RUN yarn nx build shared-dto

# Create symlink for shared-dto in node_modules (required for external webpack resolution)
RUN mkdir -p node_modules/@gt-automotive && \
    ln -sf /app/dist/libs/shared-dto node_modules/@gt-automotive/shared-dto

# Build server (will output to dist/apps/server)
RUN yarn nx build server --configuration=production

# Expose port
EXPOSE 3000

# Run the application
WORKDIR /app/dist/apps/server
CMD ["node", "main.js"]