import { Injectable } from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';
import { AuditLog, Prisma } from '@prisma/client';

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId: string;
    action: string;
    entityType?: string;
    entityId?: string;
    resource?: string;
    resourceId?: string;
    oldValue?: any;
    newValue?: any;
    details?: any;
    ipAddress?: string;
  }): Promise<AuditLog> {
    return this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        resource: data.entityType || data.resource || 'unknown',
        resourceId: data.entityId || data.resourceId || '',
        oldValue: data.oldValue || undefined,
        newValue: data.newValue || data.details || undefined,
        ipAddress: data.ipAddress,
      },
    });
  }

  async findByUser(userId: string, limit = 100): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findByAction(action: string, limit = 100): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany({
      where: { action },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findByEntity(
    entityType: string,
    entityId: string,
  ): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany({
      where: {
        resource: entityType,
        resourceId: entityId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(filters?: {
    userId?: string;
    action?: string;
    entityType?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<AuditLog[]> {
    const where: Prisma.AuditLogWhereInput = {};
    
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.action) where.action = filters.action;
    if (filters?.entityType) where.resource = filters.entityType;
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters?.startDate) where.createdAt.gte = filters.startDate;
      if (filters?.endDate) where.createdAt.lte = filters.endDate;
    }

    return this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }
}