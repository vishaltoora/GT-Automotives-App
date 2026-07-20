import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InspectionType } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import {
  CreateInspectionDto,
  CreateInspectionFeeItemDto,
  GenerateInspectionInvoiceDto,
  UpdateInspectionDto,
  UpdateInspectionFeeItemDto,
  UpdateInspectionResultDto,
} from '@gt-automotive/data';
import { InspectionsService } from './inspections.service';

@Controller('inspections')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('ADMIN', 'FOREMAN', 'SUPERVISOR', 'STAFF')
export class InspectionsController {
  constructor(private readonly inspectionsService: InspectionsService) {}

  @Get('templates')
  findTemplates(@Query('type') type?: InspectionType) {
    return this.inspectionsService.findTemplates(type);
  }

  // --- Admin-managed inspection fee catalog ---
  // Declared before the ':id' routes so 'fee-items' is not captured as an id.

  @Get('fee-items')
  findFeeItems(@CurrentUser() user: any) {
    return this.inspectionsService.findFeeItems(user.role.name);
  }

  @Post('fee-items')
  @Roles('ADMIN', 'FOREMAN')
  createFeeItem(
    @Body() dto: CreateInspectionFeeItemDto,
    @CurrentUser() user: any
  ) {
    return this.inspectionsService.createFeeItem(dto, user.role.name);
  }

  @Patch('fee-items/:itemId')
  @Roles('ADMIN', 'FOREMAN')
  updateFeeItem(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateInspectionFeeItemDto,
    @CurrentUser() user: any
  ) {
    return this.inspectionsService.updateFeeItem(itemId, dto, user.role.name);
  }

  @Delete('fee-items/:itemId')
  @Roles('ADMIN', 'FOREMAN')
  removeFeeItem(@Param('itemId') itemId: string, @CurrentUser() user: any) {
    return this.inspectionsService.removeFeeItem(itemId, user.role.name);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.inspectionsService.findAll(user.role.name);
  }

  @Post()
  create(@Body() dto: CreateInspectionDto, @CurrentUser() user: any) {
    return this.inspectionsService.create(dto, user.id, user.role.name);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.inspectionsService.findOne(id, user.role.name);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateInspectionDto,
    @CurrentUser() user: any
  ) {
    return this.inspectionsService.update(id, dto, user.role.name);
  }

  @Patch(':inspectionId/results/:resultId')
  updateResult(
    @Param('inspectionId') inspectionId: string,
    @Param('resultId') resultId: string,
    @Body() dto: UpdateInspectionResultDto,
    @CurrentUser() user: any
  ) {
    return this.inspectionsService.updateResult(
      inspectionId,
      resultId,
      dto,
      user.role.name
    );
  }

  @Post(':id/complete')
  complete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.inspectionsService.complete(id, user.id, user.role.name);
  }

  @Post(':id/generate-invoice')
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR')
  generateInvoice(
    @Param('id') id: string,
    @Body() dto: GenerateInspectionInvoiceDto,
    @CurrentUser() user: any
  ) {
    return this.inspectionsService.generateInvoice(
      id,
      dto,
      user.id,
      user.role.name
    );
  }

  @Post(':id/send-report-email')
  sendReportEmail(
    @Param('id') id: string,
    @Body()
    body: { email?: string; emails?: string[]; saveToCustomer?: boolean },
    @CurrentUser() user: any
  ) {
    // Accept either a single `email` (legacy) or an `emails` array (multi-recipient)
    const emails =
      body.emails && body.emails.length > 0
        ? body.emails
        : body.email
        ? [body.email]
        : undefined;
    return this.inspectionsService.sendInspectionReportEmail(
      id,
      user.id,
      user.role.name,
      emails,
      body.saveToCustomer
    );
  }

  @Delete(':id')
  @Roles('ADMIN', 'FOREMAN')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.inspectionsService.remove(id, user.id, user.role.name);
  }
}
