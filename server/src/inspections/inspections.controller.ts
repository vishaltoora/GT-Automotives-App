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
  UpdateInspectionDto,
  UpdateInspectionResultDto,
} from '@gt-automotive/data';
import { InspectionsService } from './inspections.service';

@Controller('inspections')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('ADMIN', 'SUPERVISOR', 'STAFF')
export class InspectionsController {
  constructor(private readonly inspectionsService: InspectionsService) {}

  @Get('templates')
  findTemplates(@Query('type') type?: InspectionType) {
    return this.inspectionsService.findTemplates(type);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.inspectionsService.findAll(user.role.name);
  }

  @Post()
  create(
    @Body() dto: CreateInspectionDto,
    @CurrentUser() user: any,
  ) {
    return this.inspectionsService.create(dto, user.id, user.role.name);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.inspectionsService.findOne(id, user.role.name);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateInspectionDto,
    @CurrentUser() user: any,
  ) {
    return this.inspectionsService.update(id, dto, user.role.name);
  }

  @Patch(':inspectionId/results/:resultId')
  updateResult(
    @Param('inspectionId') inspectionId: string,
    @Param('resultId') resultId: string,
    @Body() dto: UpdateInspectionResultDto,
    @CurrentUser() user: any,
  ) {
    return this.inspectionsService.updateResult(inspectionId, resultId, dto, user.role.name);
  }

  @Post(':id/complete')
  complete(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.inspectionsService.complete(id, user.id, user.role.name);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.inspectionsService.remove(id, user.id, user.role.name);
  }
}
