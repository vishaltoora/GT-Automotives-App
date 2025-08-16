import { Module } from '@nestjs/common';
import { TiresController } from './tires.controller';
import { TiresService } from './tires.service';
import { TireRepository } from './repositories/tire.repository';
import { AuditRepository } from '../audit/repositories/audit.repository';
import { DatabaseModule } from '@gt-automotive/database';

@Module({
  imports: [DatabaseModule],
  controllers: [TiresController],
  providers: [TiresService, TireRepository, AuditRepository],
  exports: [TiresService, TireRepository],
})
export class TiresModule {}