import { Module } from '@nestjs/common';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';
import { VendorRepository } from './vendor.repository';

@Module({
  controllers: [VendorsController],
  providers: [VendorsService, VendorRepository],
  exports: [VendorsService],
})
export class VendorsModule {}
