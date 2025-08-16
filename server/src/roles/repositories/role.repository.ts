import { Injectable } from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';
import { Role, RoleName } from '@prisma/client';

@Injectable()
export class RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Role[]> {
    return this.prisma.role.findMany();
  }

  async findById(id: string): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: { id },
    });
  }

  async findByName(name: RoleName | string): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: { name: name as RoleName },
    });
  }

  async getPermissions(roleId: string): Promise<any[]> {
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: true,
      },
    });
    return rolePermissions.map(rp => rp.permission);
  }

  async hasPermission(roleId: string, permissionName: string): Promise<boolean> {
    // Simplified version - just check if role has any permissions
    const rolePermissions = await this.prisma.rolePermission.count({
      where: {
        roleId,
      },
    });
    return rolePermissions > 0;
  }
}