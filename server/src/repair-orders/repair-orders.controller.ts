import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RepairOrdersService } from './repair-orders.service';
import { AzureBlobService } from '../common/services/azure-blob.service';
import {
  CreateRepairOrderDto,
  UpdateRepairOrderDto,
  CreateROServiceDto,
  UpdateROServiceDto,
  ROQueryDto,
  UpdateROMediaDto,
  CreateServiceCatalogItemDto,
  UpdateServiceCatalogItemDto,
} from '@gt-automotive/data';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';

@Controller('repair-orders')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('ADMIN', 'SUPERVISOR', 'STAFF', 'ACCOUNTANT')
export class RepairOrdersController {
  constructor(
    private readonly roService: RepairOrdersService,
    private readonly azureBlobService: AzureBlobService
  ) {}

  // ---- Service Catalog (managed list for the "Choose a Service" dialog) ----
  // NOTE: these static 'catalog' routes must precede the ':id' routes below so
  // that "catalog" is not captured as a repair-order id.

  @Get('catalog')
  getCatalog() {
    return this.roService.getCatalog();
  }

  @Post('catalog')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  createCatalogItem(@Body() dto: CreateServiceCatalogItemDto) {
    return this.roService.createCatalogItem(dto);
  }

  @Patch('catalog/:itemId')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  updateCatalogItem(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateServiceCatalogItemDto
  ) {
    return this.roService.updateCatalogItem(itemId, dto);
  }

  @Delete('catalog/:itemId')
  @Roles('ADMIN', 'SUPERVISOR')
  removeCatalogItem(@Param('itemId') itemId: string) {
    return this.roService.removeCatalogItem(itemId);
  }

  // ---- Repair Orders ----

  @Get()
  findAll(@Query() query: ROQueryDto, @CurrentUser() user: any) {
    return this.roService.findAll(query, user.role.name, user.id);
  }

  @Get('vehicle/:vehicleId')
  findByVehicle(@Param('vehicleId') vehicleId: string) {
    return this.roService.findByVehicle(vehicleId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.roService.findOne(id, user.role.name, user.id);
  }

  @Post()
  @Roles('ADMIN', 'SUPERVISOR')
  create(@Body() dto: CreateRepairOrderDto) {
    return this.roService.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRepairOrderDto,
    @CurrentUser() user: any
  ) {
    return this.roService.update(id, dto, user.role.name);
  }

  @Post(':id/close')
  @Roles('ADMIN', 'SUPERVISOR')
  closeAndConvert(
    @Param('id') id: string,
    @Body('companyId') companyId: string,
    @Body('feeItemId') feeItemId: string | undefined,
    @CurrentUser() user: any
  ) {
    if (!companyId) throw new BadRequestException('companyId is required');
    return this.roService.closeAndConvert(
      id,
      companyId,
      user.role.name,
      user.id,
      feeItemId
    );
  }

  @Post(':id/reopen')
  @Roles('ADMIN', 'SUPERVISOR')
  reopen(@Param('id') id: string, @CurrentUser() user: any) {
    return this.roService.reopen(id, user.role.name);
  }

  // ---- Services ----

  @Post(':id/services')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  addService(@Param('id') id: string, @Body() dto: CreateROServiceDto) {
    return this.roService.addService(id, dto);
  }

  @Patch(':id/services/:serviceId')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  updateService(
    @Param('id') id: string,
    @Param('serviceId') serviceId: string,
    @Body() dto: UpdateROServiceDto,
    @CurrentUser() user: any
  ) {
    return this.roService.updateService(id, serviceId, dto, user.id);
  }

  @Delete(':id/services/:serviceId')
  @Roles('ADMIN', 'SUPERVISOR')
  removeService(
    @Param('id') id: string,
    @Param('serviceId') serviceId: string
  ) {
    return this.roService.removeService(id, serviceId);
  }

  // ---- Media (Photos) ----

  @Post(':id/media')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(
    @Param('id') id: string,
    @UploadedFile() file: any,
    @Body('mediaType') mediaType: string,
    @Body('caption') caption: string,
    @Body('roServiceId') roServiceId: string,
    @CurrentUser() user: any
  ) {
    if (!file) throw new BadRequestException('File is required');

    const validation = this.azureBlobService.validateFile(file);
    if (!validation.valid) throw new BadRequestException(validation.error);

    // Compress with sharp if available, upload to Azure
    let buffer = file.buffer as Buffer;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const sharp = require('sharp');
      buffer = await sharp(buffer)
        .resize({
          width: 1920,
          height: 1920,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 80 })
        .toBuffer();
    } catch {
      // sharp not available — upload original
    }

    const uploadResult = await this.azureBlobService.uploadROMedia(
      buffer,
      file.originalname,
      file.mimetype
    );

    return this.roService.addMedia(
      id,
      {
        fileUrl: uploadResult.blobUrl,
        blobName: uploadResult.blobName,
        containerName: uploadResult.containerName,
        mimeType: file.mimetype,
        fileName: file.originalname,
        size: uploadResult.size,
      },
      user.id,
      mediaType ?? 'OTHER',
      caption,
      roServiceId || undefined
    );
  }

  @Post(':id/services/:serviceId/media')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  @UseInterceptors(FileInterceptor('file'))
  async uploadServiceMedia(
    @Param('id') id: string,
    @Param('serviceId') serviceId: string,
    @UploadedFile() file: any,
    @Body('mediaType') mediaType: string,
    @Body('caption') caption: string,
    @CurrentUser() user: any
  ) {
    if (!file) throw new BadRequestException('File is required');

    const validation = this.azureBlobService.validateFile(file);
    if (!validation.valid) throw new BadRequestException(validation.error);

    let buffer = file.buffer as Buffer;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const sharp = require('sharp');
      buffer = await sharp(buffer)
        .resize({
          width: 1920,
          height: 1920,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 80 })
        .toBuffer();
    } catch {
      // sharp not available — upload original
    }

    const uploadResult = await this.azureBlobService.uploadROMedia(
      buffer,
      file.originalname,
      file.mimetype
    );

    return this.roService.addMedia(
      id,
      {
        fileUrl: uploadResult.blobUrl,
        blobName: uploadResult.blobName,
        containerName: uploadResult.containerName,
        mimeType: file.mimetype,
        fileName: file.originalname,
        size: uploadResult.size,
      },
      user.id,
      mediaType ?? 'WORK_IN_PROGRESS',
      caption,
      serviceId
    );
  }

  @Patch(':id/media/:mediaId')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  updateMedia(
    @Param('id') id: string,
    @Param('mediaId') mediaId: string,
    @Body() dto: UpdateROMediaDto
  ) {
    return this.roService.updateMedia(id, mediaId, dto);
  }

  @Delete(':id/media/:mediaId')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  removeMedia(@Param('id') id: string, @Param('mediaId') mediaId: string) {
    return this.roService.removeMedia(id, mediaId, this.azureBlobService);
  }
}
