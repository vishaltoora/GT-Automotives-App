import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { CreateQuoteDto } from '../common/dto/quotation.dto';
import { UpdateQuoteDto } from '../common/dto/quotation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('quotations')
@UseGuards(JwtAuthGuard, RoleGuard)
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Post()
  @Roles('ADMIN', 'STAFF')
  create(@Body() createQuoteDto: CreateQuoteDto, @Request() req: any) {
    const userId = req.user?.sub || req.user?.id || 'system';
    console.log('=== QUOTATION CREATE REQUEST ===');
    console.log('User ID:', userId);
    console.log('Request Body:', JSON.stringify(createQuoteDto, null, 2));
    console.log('DTO Type:', typeof createQuoteDto);
    console.log('Items:', createQuoteDto.items);
    console.log('Status:', createQuoteDto.status);
    console.log('================================');
    return this.quotationsService.create(createQuoteDto, userId);
  }

  @Get()
  @Roles('ADMIN', 'STAFF')
  findAll() {
    return this.quotationsService.findAll();
  }

  @Get('search')
  @Roles('ADMIN', 'STAFF')
  search(
    @Query('customerName') customerName?: string,
    @Query('quotationNumber') quotationNumber?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.quotationsService.search({
      customerName,
      quotationNumber,
      status,
      startDate,
      endDate,
    });
  }

  @Get(':id')
  @Roles('ADMIN', 'STAFF')
  findOne(@Param('id') id: string) {
    return this.quotationsService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'STAFF')
  update(@Param('id') id: string, @Body() updateQuoteDto: UpdateQuoteDto) {
    return this.quotationsService.update(id, updateQuoteDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'STAFF')
  remove(@Param('id') id: string) {
    return this.quotationsService.remove(id);
  }

  @Post(':id/convert')
  @Roles('ADMIN', 'STAFF')
  convertToInvoice(
    @Param('id') id: string,
    @Body() body: { customerId: string; vehicleId?: string }
  ) {
    return this.quotationsService.convertToInvoice(id, body.customerId, body.vehicleId);
  }
}