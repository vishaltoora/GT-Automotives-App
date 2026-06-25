import { Module } from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';
import { CarfaxService } from './carfax.service';
import { CarfaxController } from './carfax.controller';
import { CarfaxTransport } from './carfax-transport';

@Module({
  controllers: [CarfaxController],
  providers: [CarfaxService, CarfaxTransport, PrismaService],
  exports: [CarfaxService],
})
export class CarfaxModule {}
