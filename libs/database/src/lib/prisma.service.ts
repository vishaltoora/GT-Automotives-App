import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  private isConnected = false;

  async onModuleInit() {
    try {
      this.logger.log('🔌 Attempting to connect to database...');
      await this.$connect();
      this.isConnected = true;
      this.logger.log('✅ Database connected successfully');
    } catch (error) {
      this.isConnected = false;
      this.logger.error('❌ Failed to connect to database during startup:', error.message);
      this.logger.warn('⚠️ Application will continue without database connection');
      this.logger.warn('🔄 Database operations will fail until connection is restored');
      // Don't throw - allow app to start without database
    }
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      try {
        await this.$disconnect();
        this.logger.log('✅ Database disconnected successfully');
      } catch (error) {
        this.logger.error('❌ Error disconnecting from database:', error.message);
      }
    }
  }

  // Override database operations to check connection
  async $connect() {
    try {
      await super.$connect();
      this.isConnected = true;
      return;
    } catch (error) {
      this.isConnected = false;
      throw error;
    }
  }

  // Health check method
  async healthCheck(): Promise<{ status: string; connected: boolean; error?: string }> {
    if (!this.isConnected) {
      try {
        await this.$connect();
        return { status: 'ok', connected: true };
      } catch (error) {
        return {
          status: 'error',
          connected: false,
          error: error.message
        };
      }
    }
    return { status: 'ok', connected: true };
  }
}