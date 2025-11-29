import { Controller, Get } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @Roles('ADMIN', 'STAFF', 'SUPERVISOR')
  findAll() {
    return this.companiesService.findAll();
  }

  @Get('default')
  @Roles('ADMIN', 'STAFF', 'SUPERVISOR')
  findDefault() {
    return this.companiesService.findDefault();
  }
}