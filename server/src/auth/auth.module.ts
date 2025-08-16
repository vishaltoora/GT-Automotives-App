import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RoleGuard } from './guards/role.guard';
import { ClerkWebhookController } from './webhooks/clerk-webhook.controller';
import { UserRepository } from '../users/repositories/user.repository';
import { RoleRepository } from '../roles/repositories/role.repository';
import { AuditRepository } from '../audit/repositories/audit.repository';
import { PrismaService } from '@gt-automotive/database';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'default-jwt-secret'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '24h'),
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  controllers: [AuthController, ClerkWebhookController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RoleGuard,
    UserRepository,
    RoleRepository,
    AuditRepository,
    PrismaService,
  ],
  exports: [AuthService, JwtAuthGuard, RoleGuard],
})
export class AuthModule {}