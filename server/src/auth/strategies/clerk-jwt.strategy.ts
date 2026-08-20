import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../../users/repositories/user.repository';
import { passportJwtSecret } from 'jwks-rsa';
import { PrismaService } from '@gt-automotive/database';
import { isAuthDebugEnabled } from '../auth-logging';

@Injectable()
export class ClerkJwtStrategy extends PassportStrategy(Strategy, 'clerk-jwt') {
  private readonly logger = new Logger(ClerkJwtStrategy.name);

  constructor(
    private userRepository: UserRepository,
    private prismaService: PrismaService,
    private configService: ConfigService
  ) {
    const jwksUrl = configService.get<string>(
      'CLERK_JWKS_URL',
      'https://clerk.gt-automotives.com/.well-known/jwks.json'
    );

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
    // Never log the payload itself — it is the decoded token, and this runs on
    // every authenticated request. Subject id only, and only when debugging.
    if (isAuthDebugEnabled()) {
      this.logger.debug(`Validating token for Clerk user ${payload?.sub}`);
    }

    // Clerk JWT payload contains 'sub' as the Clerk user ID
    const clerkUserId = payload.sub;

    if (!clerkUserId) {
      throw new UnauthorizedException('Invalid token: no user ID');
    }

    // Find user by Clerk ID
    let user = await this.userRepository.findByClerkId(clerkUserId);

    if (!user) {
      // Auto-create user if they don't exist by fetching from Clerk API
      let clerkUser;
      try {
        const clerkSecretKey =
          this.configService.get<string>('CLERK_SECRET_KEY');
        if (clerkSecretKey) {
          const { createClerkClient } = await import('@clerk/clerk-sdk-node');

          const clerkClient = createClerkClient({
            secretKey: clerkSecretKey,
            apiUrl:
              this.configService.get<string>('CLERK_API_URL') ||
              'https://api.clerk.com',
          });

          clerkUser = await clerkClient.users.getUser(clerkUserId);
        } else {
          throw new UnauthorizedException(
            'Clerk not configured - missing CLERK_SECRET_KEY'
          );
        }
      } catch (error) {
        this.logger.error(
          `Failed to fetch Clerk user ${clerkUserId}`,
          error instanceof Error ? error.stack : String(error)
        );
        throw new UnauthorizedException(
          'Failed to fetch user details from Clerk'
        );
      }

      if (
        !clerkUser ||
        !clerkUser.emailAddresses ||
        clerkUser.emailAddresses.length === 0
      ) {
        throw new UnauthorizedException('User has no email addresses in Clerk');
      }

      const email = clerkUser.emailAddresses[0].emailAddress;
      const firstName = clerkUser.firstName || 'User';
      const lastName = clerkUser.lastName || '';

      // Determine role based on email
      let roleName = 'CUSTOMER'; // Default to customer role
      if (email === 'vishal.alawalpuria@gmail.com') {
        roleName = 'ADMIN'; // Admin role
      }

      // Look up the role ID by name
      const role = await this.prismaService.role.findUnique({
        where: { name: roleName as any },
      });

      if (!role) {
        throw new UnauthorizedException(
          `Role ${roleName} not found in database`
        );
      }

      try {
        user = await this.userRepository.create({
          clerkId: clerkUserId,
          email,
          firstName,
          lastName,
          roleId: role.id,
        });
        this.logger.log(`Provisioned user ${user.id} with role ${roleName}`);
      } catch (error) {
        this.logger.error(
          `Failed to provision user for Clerk id ${clerkUserId}`,
          error instanceof Error ? error.stack : String(error)
        );
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
