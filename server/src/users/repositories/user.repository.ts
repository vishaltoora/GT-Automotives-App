import { Injectable } from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';
import { User, Prisma, Role } from '@prisma/client';

type UserWithRole = User & {
  role: Role;
};

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: {
    roleId?: string;
    isActive?: boolean;
  }): Promise<UserWithRole[]> {
    return this.prisma.user.findMany({
      where: filters,
      include: {
        role: true,
      },
    }) as Promise<UserWithRole[]>;
  }

  async findById(id: string): Promise<UserWithRole | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
      },
    }) as Promise<UserWithRole | null>;
  }

  async findByEmail(email: string): Promise<UserWithRole | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    }) as Promise<UserWithRole | null>;
  }

  async findByClerkId(clerkId: string): Promise<UserWithRole | null> {
    return this.prisma.user.findUnique({
      where: { clerkId },
      include: {
        role: true,
      },
    }) as Promise<UserWithRole | null>;
  }

  async create(data: Prisma.UserCreateInput): Promise<UserWithRole> {
    return this.prisma.user.create({
      data,
      include: {
        role: true,
      },
    }) as Promise<UserWithRole>;
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<UserWithRole> {
    return this.prisma.user.update({
      where: { id },
      data,
      include: {
        role: true,
      },
    }) as Promise<UserWithRole>;
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async assignRole(userId: string, roleId: string): Promise<UserWithRole> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { roleId },
      include: {
        role: true,
      },
    }) as Promise<UserWithRole>;
  }

  async findAllWithRoles(filters?: {
    roleId?: string;
    isActive?: boolean;
  }): Promise<UserWithRole[]> {
    return this.prisma.user.findMany({
      where: filters,
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    }) as Promise<UserWithRole[]>;
  }
}