# Multi-stage build for optimized production image
FROM node:18-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY yarn.lock ./
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
COPY ../libs ./libs
COPY ../tsconfig.base.json ./tsconfig.base.json
RUN yarn build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

# Copy Prisma schema and generate client
COPY --chown=nodejs:nodejs ../libs/database/src/lib/prisma ./prisma
RUN npx prisma generate

USER nodejs

EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]