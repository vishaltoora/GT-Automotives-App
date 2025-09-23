import { Injectable } from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  async checkDetailed() {
    const basicHealth = await this.check();

    // Check database connectivity using PrismaService health check
    const databaseHealth = await this.prisma.healthCheck();

    return {
      ...basicHealth,
      database: {
        status: databaseHealth.status,
        connected: databaseHealth.connected,
        error: databaseHealth.error,
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB',
      },
      version: process.env.APP_VERSION || '1.0.0',
    };
  }
}