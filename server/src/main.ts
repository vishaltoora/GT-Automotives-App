/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { InternalApiGuard } from './common/guards/internal-api.guard';

async function bootstrap() {
  try {
    Logger.log('🔄 Starting GT Automotive backend...');
    Logger.log('📋 Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      HOST: process.env.HOST,
      PORT: process.env.PORT,
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ? 'SET' : 'NOT SET',
      INTERNAL_API_KEY: process.env.INTERNAL_API_KEY ? 'SET' : 'NOT SET',
    });

    const app = await NestFactory.create(AppModule);
    Logger.log('✅ NestJS application created');

    // Secure CORS configuration
    const isProduction = process.env.NODE_ENV === 'production';

    // Define allowed origins
    const allowedOrigins = [
      'https://gt-automotives.com',
      'https://www.gt-automotives.com',
      'http://localhost:4200',
      'http://localhost:3000',
    ];

    // Add additional origins from environment if provided
    if (process.env.ALLOWED_ORIGINS) {
      const additionalOrigins = process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
      allowedOrigins.push(...additionalOrigins);
    }

    app.enableCors({
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (mobile apps, Postman, server-to-server)
        if (!origin) {
          return callback(null, true);
        }

        // In development, allow any localhost origin
        if (!isProduction && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
          return callback(null, true);
        }

        // Check against allowed origins
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          Logger.warn(`🚫 CORS blocked origin: ${origin}`);
          if (isProduction) {
            callback(new Error(`Origin ${origin} not allowed by CORS policy`));
          } else {
            // In development, log but allow (helps with debugging)
            Logger.warn(`⚠️  Development mode: Allowing despite not in whitelist`);
            callback(null, true);
          }
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    });

    Logger.log(`✅ CORS configured (${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode)`);
    Logger.log(`📋 Allowed origins: ${allowedOrigins.join(', ')}`);

    // Global Internal API Guard - Validates X-Internal-API-Key header
    app.useGlobalGuards(new InternalApiGuard());
    Logger.log('🔒 Internal API guard enabled');

    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));
    Logger.log('✅ Validation pipe configured');

    const port = process.env.PORT || 3000;
    const host = process.env.HOST || '0.0.0.0';

    Logger.log(`🚀 Starting server on ${host}:${port}...`);
    await app.listen(port, host);
    Logger.log(`✅ Application is running on: http://${host}:${port}`);
    Logger.log('🎯 Health endpoint available at: /health');
  } catch (error) {
    Logger.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
