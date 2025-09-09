import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../users/repositories/user.repository';
import { RoleRepository } from '../roles/repositories/role.repository';
import { AuditRepository } from '../audit/repositories/audit.repository';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private roleRepository: RoleRepository,
    private auditRepository: AuditRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateClerkUser(clerkUserId: string) {
    let user = await this.userRepository.findByClerkId(clerkUserId);
    
    if (!user) {
      // Try to get Clerk client if available
      let clerkUser;
      try {
        const clerkSecretKey = this.configService.get<string>('CLERK_SECRET_KEY');
        if (clerkSecretKey) {
          const { clerkClient } = await import('@clerk/clerk-sdk-node');
          clerkUser = await clerkClient.users.getUser(clerkUserId);
        } else {
          throw new Error('Clerk not configured');
        }
      } catch (error) {
        console.warn('Clerk client not available:', error);
        return null;
      }
      
      const customerRole = await this.roleRepository.findByName('customer');
      if (!customerRole) {
        throw new Error('Customer role not found in database');
      }
      
      user = await this.userRepository.create({
        clerkId: clerkUserId,
        email: clerkUser.emailAddresses[0].emailAddress,
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        roleId: customerRole.id,
      });
      
      await this.auditRepository.create({
        userId: user.id,
        action: 'USER_CREATED',
        entityType: 'user',
        entityId: user.id,
        details: { source: 'clerk_webhook' },
      });
    }
    
    return user;
  }

  async login(email: string, password: string) {
    // Since we're using Clerk for authentication, this method is deprecated
    // It's kept for backward compatibility or local testing without Clerk
    throw new UnauthorizedException('Please use Clerk authentication through the UI');
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    // Since we're using Clerk for authentication, this method is deprecated
    // Registration should be done through Clerk UI
    throw new ConflictException('Please use Clerk registration through the UI');
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepository.findById(payload.sub);
      
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid token');
      }
      
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async generateJWT(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role?.name || 'customer',
    };
    
    return this.jwtService.sign(payload);
  }

  async syncUserFromClerk(data: {
    clerkId: string;
    email: string;
    firstName: string;
    lastName: string;
  }) {
    // Check if user already exists
    let user = await this.userRepository.findByClerkId(data.clerkId);
    
    if (!user) {
      // Check if email exists with different clerkId
      const emailUser = await this.userRepository.findByEmail(data.email);
      if (emailUser && emailUser.clerkId && emailUser.clerkId !== data.clerkId) {
        throw new ConflictException('Email already registered with different account');
      }
      
      // Get customer role
      const customerRole = await this.roleRepository.findByName('customer');
      if (!customerRole) {
        throw new Error('Customer role not found in database');
      }
      
      // Create new user
      user = await this.userRepository.create({
        clerkId: data.clerkId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        roleId: customerRole.id,
      });
      
      await this.auditRepository.create({
        userId: user.id,
        action: 'USER_SYNCED',
        entityType: 'user',
        entityId: user.id,
        details: { source: 'clerk_sync' },
      });
    } else {
      // Update existing user if needed
      if (user.email !== data.email || 
          user.firstName !== data.firstName || 
          user.lastName !== data.lastName) {
        user = await this.userRepository.update(user.id, {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
        });
      }
    }
    
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role || { name: 'customer' },
      isActive: user.isActive,
    };
  }
}