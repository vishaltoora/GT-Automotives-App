import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { CustomerRepository } from './repositories/customer.repository';
import { UserRepository } from '../users/repositories/user.repository';
import { AuditRepository } from '../audit/repositories/audit.repository';
import { DatabaseModule } from '@gt-automotive/database';

@Module({
  imports: [DatabaseModule],
  controllers: [CustomersController],
  providers: [
    CustomersService,
    CustomerRepository,
    UserRepository,
    AuditRepository,
  ],
  exports: [CustomersService, CustomerRepository],
})
export class CustomersModule {}