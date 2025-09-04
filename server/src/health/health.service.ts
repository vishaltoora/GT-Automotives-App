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
    
    // Check database connectivity
    let databaseStatus = 'unknown';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      databaseStatus = 'connected';
    } catch (error) {
      databaseStatus = 'disconnected';
    }

    return {
      ...basicHealth,
      database: databaseStatus,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB',
      },
      version: process.env.APP_VERSION || '1.0.0',
    };
  }
}