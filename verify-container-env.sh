#!/bin/bash

# Container Environment Verification Script (Based on MyPersn Patterns)
# This script helps debug container startup issues

echo "🔍 GT Automotive Container Environment Verification"
echo "=================================================="

# Check Node.js and npm versions
echo ""
echo "📦 Runtime Versions:"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "yarn: $(yarn --version 2>/dev/null || echo 'Not available')"

# Check working directory and files
echo ""
echo "📁 Working Directory: $(pwd)"
echo "📋 Available files:"
ls -la

echo ""
echo "📋 Dist directory contents:"
if [ -d "dist" ]; then
    ls -la dist/
    if [ -d "dist/server" ]; then
        echo "📋 Server dist contents:"
        ls -la dist/server/
    fi
else
    echo "❌ No dist directory found"
fi

# Check critical environment variables
echo ""
echo "🔧 Environment Variables:"
echo "NODE_ENV: ${NODE_ENV:-'Not set'}"
echo "PORT: ${PORT:-'Not set'}"
echo "DATABASE_URL: ${DATABASE_URL:+***CONFIGURED***}"
echo "CLERK_SECRET_KEY: ${CLERK_SECRET_KEY:+***CONFIGURED***}"
echo "FRONTEND_URL: ${FRONTEND_URL:-'Not set'}"

# Check for node_modules and critical dependencies
echo ""
echo "📦 Node Modules Check:"
if [ -d "node_modules" ]; then
    echo "✅ node_modules exists"

    # Check critical dependencies
    if [ -d "node_modules/@prisma" ]; then
        echo "✅ @prisma/client available"
    else
        echo "❌ @prisma/client missing"
    fi

    if [ -d "node_modules/@gt-automotive" ]; then
        echo "✅ @gt-automotive/shared-dto available"
    else
        echo "❌ @gt-automotive/shared-dto missing"
    fi

    if [ -f "node_modules/reflect-metadata/index.js" ]; then
        echo "✅ reflect-metadata available"
    else
        echo "❌ reflect-metadata missing (critical for NestJS)"
    fi
else
    echo "❌ node_modules missing"
fi

# Check if main application file exists
echo ""
echo "🎯 Application Entry Point:"
if [ -f "dist/server/main.js" ]; then
    echo "✅ Main application file exists: dist/server/main.js"
    echo "📊 File size: $(stat -f%z dist/server/main.js 2>/dev/null || stat -c%s dist/server/main.js) bytes"

    # Check if the file has content and isn't corrupted
    if [ -s "dist/server/main.js" ]; then
        echo "✅ Main application file has content"
        echo "🔍 First few lines:"
        head -5 dist/server/main.js
    else
        echo "❌ Main application file is empty"
    fi
else
    echo "❌ Main application file missing: dist/server/main.js"
    echo "🔍 Available files in dist/:"
    find dist/ -name "*.js" 2>/dev/null || echo "No JS files found in dist/"
fi

# Test basic Node.js functionality
echo ""
echo "🧪 Basic Node.js Test:"
node -e "console.log('✅ Node.js basic execution works')" 2>/dev/null || echo "❌ Node.js basic execution failed"

# Test reflect-metadata loading
echo ""
echo "🧪 Reflect-metadata Test:"
node -e "require('reflect-metadata'); console.log('✅ reflect-metadata loads successfully')" 2>/dev/null || echo "❌ reflect-metadata loading failed"

# Test Prisma client loading
echo ""
echo "🧪 Prisma Client Test:"
node -e "const { PrismaClient } = require('@prisma/client'); console.log('✅ Prisma client loads successfully')" 2>/dev/null || echo "❌ Prisma client loading failed"

# Test shared DTO loading
echo ""
echo "🧪 Shared DTO Test:"
node -e "require('@gt-automotive/shared-dto'); console.log('✅ Shared DTO loads successfully')" 2>/dev/null || echo "❌ Shared DTO loading failed"

echo ""
echo "=================================================="
echo "🏁 Environment verification complete"
echo ""
echo "💡 If you see issues above, they likely explain why the container isn't starting"
echo "💡 Common fixes:"
echo "   - Ensure all dependencies are installed"
echo "   - Check that build process completed successfully"
echo "   - Verify environment variables are set correctly"
echo "   - Make sure reflect-metadata is available for NestJS"