import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../../users/repositories/user.repository';
import { passportJwtSecret } from 'jwks-rsa';
import { PrismaService } from '@gt-automotive/database';

@Injectable()
export class ClerkJwtStrategy extends PassportStrategy(Strategy, 'clerk-jwt') {
  constructor(
    private userRepository: UserRepository,
    private prismaService: PrismaService,
    configService: ConfigService,
  ) {
    const jwksUrl = configService.get<string>('CLERK_JWKS_URL', 'https://clean-dove-53.clerk.accounts.dev/.well-known/jwks.json');
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: jwksUrl,
      }),
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any) {
    // Clerk JWT payload contains 'sub' as the Clerk user ID
    const clerkUserId = payload.sub;
    
    if (!clerkUserId) {
      throw new UnauthorizedException('Invalid token: no user ID');
    }

    // Find user by Clerk ID
    let user = await this.userRepository.findByClerkId(clerkUserId);
    
    if (!user) {
      // Auto-create user if they don't exist
      // This handles the case where Clerk webhook hasn't fired yet
      const email = payload.email;
      const firstName = payload.given_name || payload.first_name || 'User';
      const lastName = payload.family_name || payload.last_name || '';
      
      if (!email) {
        throw new UnauthorizedException('Invalid token: no email found');
      }

      // Determine role based on email
      let roleName = 'CUSTOMER'; // Default to customer role
      if (email === 'vishal.alawalpuria@gmail.com') {
        roleName = 'ADMIN'; // Admin role
      }


      // Look up the role ID by name
      const role = await this.prismaService.role.findUnique({
        where: { name: roleName as any }
      });

      if (!role) {
        throw new UnauthorizedException(`Role ${roleName} not found in database`);
      }

      try {
        user = await this.userRepository.create({
          clerkId: clerkUserId,
          email,
          firstName,
          lastName,
          role: { connect: { id: role.id } },
          isActive: true,
        });
      } catch (error) {
        // If creation fails, maybe the user was created in parallel
        user = await this.userRepository.findByClerkId(clerkUserId);
        if (!user) {
          throw new UnauthorizedException('Failed to create or find user');
        }
      }
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Return user with role information
    return {
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
    };
  }
}