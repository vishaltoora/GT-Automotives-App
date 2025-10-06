import { Module, Global } from '@nestjs/common';
import { AzureBlobService } from './services/azure-blob.service';

@Global()
@Module({
  providers: [AzureBlobService],
  exports: [AzureBlobService],
})
export class CommonModule {}
