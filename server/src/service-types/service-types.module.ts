import { Module } from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';
import { ServiceTypesController } from './service-types.controller';
import { ServiceTypesService } from './service-types.service';
import { ServiceTypeRepository } from './service-type.repository';

@Module({
  controllers: [ServiceTypesController],
  providers: [ServiceTypesService, ServiceTypeRepository, PrismaService],
  exports: [ServiceTypesService],
})
export class ServiceTypesModule {}
