#!/bin/bash

echo "🚀 Testing GT Automotive Docker Image"
echo "======================================"

# Build a simple test image
echo "📦 Building Docker image..."
docker build -f - -t gt-automotive-test . <<EOF
FROM node:20-alpine
WORKDIR /app
COPY server/dist ./dist
COPY libs ./libs
COPY node_modules/.prisma ./node_modules/.prisma
COPY node_modules/@prisma ./node_modules/@prisma
COPY package.json ./
RUN npm install --production --no-optional
EXPOSE 3000
CMD ["node", "dist/main.js"]
EOF

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed"
    exit 1
fi

echo "✅ Docker image built successfully"

# Run the container
echo "🔄 Starting container..."
docker run -d --name gt-test-container \
    -e NODE_ENV=development \
    -e PORT=3000 \
    -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/gt_automotive" \
    -e CLERK_SECRET_KEY="sk_test_z1yz3LAc4dQglp0oCUWxscpuKWqh8mnCsYHT5hYjxB" \
    -e JWT_SECRET="your-super-secret-jwt-key-change-in-production" \
    -e CORS_ORIGIN="http://localhost:4200" \
    -p 3001:3000 \
    gt-automotive-test

if [ $? -ne 0 ]; then
    echo "❌ Container failed to start"
    exit 1
fi

echo "✅ Container started successfully"

# Wait for startup
echo "⏳ Waiting for service to start..."
sleep 5

# Test endpoints
echo "🔍 Testing API endpoints..."
echo "Testing root endpoint..."
curl -f http://localhost:3001/ && echo "✅ Root endpoint OK" || echo "❌ Root endpoint failed"

echo "Testing health endpoint..."
curl -f http://localhost:3001/health && echo "✅ Health endpoint OK" || echo "❌ Health endpoint failed"

# Show logs
echo "📄 Container logs:"
docker logs gt-test-container

# Cleanup
echo "🧹 Cleaning up..."
docker stop gt-test-container
docker rm gt-test-container
docker rmi gt-automotive-test

echo "✅ Test completed"