/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  try {
    Logger.log('🔄 Starting GT Automotive backend...');
    Logger.log('📋 Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      HOST: process.env.HOST,
      PORT: process.env.PORT,
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ? 'SET' : 'NOT SET',
    });

    const app = await NestFactory.create(AppModule);
    Logger.log('✅ NestJS application created');

    // Enable CORS
    app.enableCors({
      origin: process.env.FRONTEND_URL || 'http://localhost:4200',
      credentials: true,
    });
    Logger.log('✅ CORS enabled');

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
