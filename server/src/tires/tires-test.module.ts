import { Module } from '@nestjs/common';
import { TiresTestController } from './tires-test.controller';
import { DatabaseModule } from '@gt-automotive/database';

@Module({
  imports: [DatabaseModule],
  controllers: [TiresTestController],
  providers: [],
  exports: [],
})
export class TiresTestModule {}