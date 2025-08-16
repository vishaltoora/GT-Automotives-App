import { 
  Injectable, 
  NotFoundException, 
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { RoleRepository } from '../roles/repositories/role.repository';
import { AuditRepository } from '../audit/repositories/audit.repository';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    private userRepository: UserRepository,
    private roleRepository: RoleRepository,
    private auditRepository: AuditRepository,
  ) {}

  async findAll(filters?: { roleId?: number; isActive?: boolean }) {
    return this.userRepository.findAll(filters);
  }

  async findById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async create(data: {
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    phone?: string;
    roleId: number;
    createdBy: string;
  }) {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const role = await this.roleRepository.findById(data.roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const hashedPassword = data.password 
      ? await bcrypt.hash(data.password, 10)
      : undefined;

    const user = await this.userRepository.create({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: {
        connect: { id: data.roleId },
      },
    });

    await this.auditRepository.create({
      userId: data.createdBy,
      action: 'USER_CREATED',
      entityType: 'user',
      entityId: user.id,
      details: { email: data.email, roleId: data.roleId },
    });

    return user;
  }

  async update(id: string, data: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    isActive?: boolean;
    updatedBy: string;
  }) {
    const user = await this.findById(id);

    if (data.email && data.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }

    const updatedUser = await this.userRepository.update(id, {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      isActive: data.isActive,
    });

    await this.auditRepository.create({
      userId: data.updatedBy,
      action: 'USER_UPDATED',
      entityType: 'user',
      entityId: id,
      details: data,
    });

    return updatedUser;
  }

  async assignRole(userId: string, roleId: number, assignedBy: string) {
    const user = await this.findById(userId);
    const role = await this.roleRepository.findById(roleId);
    
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Prevent changing admin users by non-admins
    if (user.role.name === 'admin') {
      const assigningUser = await this.userRepository.findById(assignedBy);
      if (assigningUser?.role.name !== 'admin') {
        throw new ForbiddenException('Only admins can modify admin users');
      }
    }

    const updatedUser = await this.userRepository.assignRole(userId, roleId);

    await this.auditRepository.create({
      userId: assignedBy,
      action: 'ROLE_ASSIGNED',
      entityType: 'user',
      entityId: userId,
      details: { 
        oldRole: user.role.name, 
        newRole: role.name 
      },
    });

    return updatedUser;
  }

  async delete(id: string, deletedBy: string) {
    const user = await this.findById(id);

    // Prevent deleting admin users
    if (user.role.name === 'admin') {
      const deletingUser = await this.userRepository.findById(deletedBy);
      if (deletingUser?.role.name !== 'admin') {
        throw new ForbiddenException('Only admins can delete admin users');
      }
    }

    // Soft delete by deactivating
    const deactivatedUser = await this.userRepository.update(id, {
      isActive: false,
    });

    await this.auditRepository.create({
      userId: deletedBy,
      action: 'USER_DEACTIVATED',
      entityType: 'user',
      entityId: id,
      details: { email: user.email },
    });

    return deactivatedUser;
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.findById(userId);

    if (!user.password) {
      throw new ForbiddenException('Password change not allowed for SSO users');
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new ForbiddenException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await this.userRepository.update(userId, {
      password: hashedPassword,
    });

    await this.auditRepository.create({
      userId,
      action: 'PASSWORD_CHANGED',
      entityType: 'user',
      entityId: userId,
    });

    return { message: 'Password changed successfully' };
  }

  async resetPassword(userId: string, newPassword: string, resetBy: string) {
    const user = await this.findById(userId);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await this.userRepository.update(userId, {
      password: hashedPassword,
    });

    await this.auditRepository.create({
      userId: resetBy,
      action: 'PASSWORD_RESET',
      entityType: 'user',
      entityId: userId,
      details: { targetEmail: user.email },
    });

    return { message: 'Password reset successfully' };
  }
}