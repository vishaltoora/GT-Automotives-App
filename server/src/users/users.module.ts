import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserRepository } from './repositories/user.repository';
import { RoleRepository } from '../roles/repositories/role.repository';
import { AuditRepository } from '../audit/repositories/audit.repository';
import { PrismaService } from '@gt-automotive/database';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    UserRepository,
    RoleRepository,
    AuditRepository,
    PrismaService,
  ],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}