import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from '../common/dto/customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles('STAFF', 'ADMIN')
  create(
    @Body() createCustomerDto: CreateCustomerDto,
    @CurrentUser() user: any,
  ) {
    return this.customersService.create(createCustomerDto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.customersService.findAll(user.id, user.role.name);
  }

  @Get('search')
  @UseGuards(RoleGuard)
  @Roles('STAFF', 'ADMIN')
  search(
    @Query('q') searchTerm: string,
    @CurrentUser() user: any,
  ) {
    return this.customersService.search(searchTerm, user.id, user.role.name);
  }


  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.customersService.findOne(id, user.id, user.role.name);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @CurrentUser() user: any,
  ) {
    return this.customersService.update(id, updateCustomerDto, user.id, user.role.name);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('ADMIN')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.customersService.remove(id, user.id);
  }
}