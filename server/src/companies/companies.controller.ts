import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateCompanyTermsDto } from '@gt-automotive/data';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @Roles('ADMIN', 'FOREMAN', 'ACCOUNTANT', 'STAFF', 'SUPERVISOR')
  findAll() {
    return this.companiesService.findAll();
  }

  @Get('default')
  @Roles('ADMIN', 'FOREMAN', 'ACCOUNTANT', 'STAFF', 'SUPERVISOR')
  findDefault() {
    return this.companiesService.findDefault();
  }

  // Admin-only: the terms & conditions are a liability statement, so editing
  // them is deliberately not a general staff permission.
  @Patch(':id/terms')
  @Roles('ADMIN')
  updateTerms(@Param('id') id: string, @Body() dto: UpdateCompanyTermsDto) {
    return this.companiesService.updateTermsAndConditions(
      id,
      dto.termsAndConditions ?? null
    );
  }
}
