import { 
  Injectable, 
  NotFoundException, 
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from './repositories/user.repository';
import { RoleRepository } from '../roles/repositories/role.repository';
import { AuditRepository } from '../audit/repositories/audit.repository';
// import * as bcrypt from 'bcryptjs'; // Currently unused

@Injectable()
export class UsersService {
  constructor(
    private userRepository: UserRepository,
    private roleRepository: RoleRepository,
    private auditRepository: AuditRepository,
    private configService: ConfigService,
  ) {}

  async findAll(filters?: { roleId?: string; isActive?: boolean }) {
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
    roleId: string;
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

    // const hashedPassword = data.password 
    //   ? await bcrypt.hash(data.password, 10)
    //   : undefined;

    const user = await this.userRepository.create({
      clerkId: '', // Will need proper Clerk ID if using Clerk
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      roleId: data.roleId,
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

  async createAdminOrStaff(data: {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    phone?: string;
    roleName: 'ADMIN' | 'SUPERVISOR' | 'STAFF';
    createdBy: string;
    password: string;
  }) {
    // Check if user already exists in our database
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Get role by name
    const role = await this.roleRepository.findByName(data.roleName);
    if (!role) {
      throw new NotFoundException(`Role ${data.roleName} not found`);
    }

    let clerkUserId: string | null = null;

    // Create user in Clerk if configured
    const clerkSecretKey = this.configService.get<string>('CLERK_SECRET_KEY');
    if (clerkSecretKey) {
      try {
        const { createClerkClient } = await import('@clerk/clerk-sdk-node');

        // Create configured Clerk client with secret key
        const clerkClient = createClerkClient({
          secretKey: clerkSecretKey,
          apiUrl: this.configService.get<string>('CLERK_API_URL') || 'https://api.clerk.com'
        });

        console.log('Creating Clerk user with data:', {
          email: data.email,
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
          hasPassword: !!data.password,
          passwordLength: data.password?.length,
        });

        // Create user in Clerk with proper v5 API format
        const clerkUser = await clerkClient.users.createUser({
          emailAddress: [data.email],
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
          password: data.password,
        });

        clerkUserId = clerkUser.id;
        console.log('Clerk user created successfully:', clerkUserId);

        // Set metadata for role
        await clerkClient.users.updateUserMetadata(clerkUserId, {
          publicMetadata: {
            role: data.roleName,
          },
        });

      } catch (clerkError: any) {
        console.error('Failed to create user in Clerk:', clerkError);
        console.error('Clerk error type:', typeof clerkError);
        console.error('Clerk error keys:', Object.keys(clerkError));
        console.error('Clerk error full object:', JSON.stringify(clerkError, null, 2));

        // Extract detailed error information
        let errorMessage = 'Unprocessable Entity';

        if (clerkError.errors && Array.isArray(clerkError.errors)) {
          errorMessage = clerkError.errors.map((e: any) => `${e.message} (${e.longMessage || e.code})`).join(', ');
        } else if (clerkError.message) {
          errorMessage = clerkError.message;
        } else if (clerkError.status) {
          errorMessage = `Status ${clerkError.status}`;
        }

        console.error('Extracted error message:', errorMessage);

        throw new InternalServerErrorException(
          `Failed to create user in Clerk: ${errorMessage}`
        );
      }
    }

    // Create user in our database
    const user = await this.userRepository.create({
      clerkId: clerkUserId || '',
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      roleId: role.id,
    });

    // Create audit log
    await this.auditRepository.create({
      userId: data.createdBy,
      action: 'ADMIN_STAFF_USER_CREATED',
      entityType: 'user',
      entityId: user.id,
      details: { 
        email: data.email, 
        role: data.roleName,
        clerkId: clerkUserId,
      },
    });

    return {
      ...user,
      clerkCreated: !!clerkUserId,
    };
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

  async assignRole(userId: string, roleId: string, assignedBy: string) {
    const user = await this.findById(userId);
    const role = await this.roleRepository.findById(roleId);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Prevent changing admin users by non-admins
    if (user.role.name === 'ADMIN') {
      const assigningUser = await this.userRepository.findById(assignedBy);
      if (assigningUser?.role.name !== 'ADMIN') {
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

  async assignRoleByName(userId: string, roleName: 'ADMIN' | 'SUPERVISOR' | 'STAFF', assignedBy: string) {
    const user = await this.findById(userId);
    const role = await this.roleRepository.findByName(roleName);

    if (!role) {
      throw new NotFoundException(`Role ${roleName} not found`);
    }

    // Prevent changing admin users by non-admins
    if (user.role.name === 'ADMIN') {
      const assigningUser = await this.userRepository.findById(assignedBy);
      if (assigningUser?.role.name !== 'ADMIN') {
        throw new ForbiddenException('Only admins can modify admin users');
      }
    }

    const updatedUser = await this.userRepository.assignRole(userId, role.id);

    await this.auditRepository.create({
      userId: assignedBy,
      action: 'ROLE_ASSIGNED',
      entityType: 'user',
      entityId: userId,
      details: {
        oldRole: user.role.name,
        newRole: roleName
      },
    });

    return updatedUser;
  }

  async delete(id: string, deletedBy: string) {
    const user = await this.findById(id);

    // Prevent deleting admin users
    if (user.role.name === 'ADMIN') {
      const deletingUser = await this.userRepository.findById(deletedBy);
      if (deletingUser?.role.name !== 'ADMIN') {
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

  async changePassword(_userId: string, _oldPassword: string, _newPassword: string) {
    // Passwords are managed by Clerk, not our system
    throw new ForbiddenException('Password management is handled by Clerk authentication system');
  }

  async resetPassword(_userId: string, _newPassword: string, _resetBy: string) {
    // Passwords are managed by Clerk, not our system
    throw new ForbiddenException('Password management is handled by Clerk authentication system');
  }
}