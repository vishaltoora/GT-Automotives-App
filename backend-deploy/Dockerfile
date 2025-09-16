FROM node:20-slim

WORKDIR /app

# Install system dependencies for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy deployment package (contains all necessary files)
COPY . ./

# Install dependencies and generate Prisma client with proper WASM binaries
RUN npm install --production && \
    npm install prisma@latest && \
    npx prisma generate --schema=./prisma/schema.prisma

# Create proper node_modules structure for shared libraries (critical architectural fix)
RUN mkdir -p ./node_modules/@gt-automotive/shared-dto/dist/ && \
    cp -r ./shared-dto-temp/* ./node_modules/@gt-automotive/shared-dto/dist/ && \
    cp ./shared-dto-package.json ./node_modules/@gt-automotive/shared-dto/package.json && \
    rm -rf ./shared-dto-temp ./shared-dto-package.json

# Create non-root user for security
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs && \
    chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

# Use webpack-built main.js with externalized dependencies
CMD ["node", "server/main.js"]
