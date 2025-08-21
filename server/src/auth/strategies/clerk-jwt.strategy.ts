import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../../users/repositories/user.repository';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class ClerkJwtStrategy extends PassportStrategy(Strategy, 'clerk-jwt') {
  constructor(
    private configService: ConfigService,
    private userRepository: UserRepository,
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
    const user = await this.userRepository.findByClerkId(clerkUserId);
    
    if (!user) {
      // If user doesn't exist, we might want to create them
      // For now, throw an error - the user should be created via webhook
      throw new UnauthorizedException('User not found. Please ensure your account is properly synced.');
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