import { Module } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { VinDecoderService } from './vin-decoder.service';
import { VehicleRepository } from './repositories/vehicle.repository';
import { CustomerRepository } from '../customers/repositories/customer.repository';
import { AuditRepository } from '../audit/repositories/audit.repository';
import { DatabaseModule } from '@gt-automotive/database';

@Module({
  imports: [DatabaseModule],
  controllers: [VehiclesController],
  providers: [
    VehiclesService,
    VinDecoderService,
    VehicleRepository,
    CustomerRepository,
    AuditRepository,
  ],
  exports: [VehiclesService, VehicleRepository],
})
export class VehiclesModule {}
