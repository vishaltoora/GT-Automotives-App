import { Module } from '@nestjs/common';
import { DatabaseModule } from '@gt-automotive/database';
import { InspectionsController } from './inspections.controller';
import { InspectionsService } from './inspections.service';
import { AuditRepository } from '../audit/repositories/audit.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [InspectionsController],
  providers: [InspectionsService, AuditRepository],
  exports: [InspectionsService],
})
export class InspectionsModule {}
