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
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from '@gt-automotive/shared-dto';
import { UpdateVehicleDto } from '@gt-automotive/shared-dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RoleGuard } from '../auth/guards/role.guard';
// import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/vehicles')
@UseGuards(JwtAuthGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  create(
    @Body() createVehicleDto: CreateVehicleDto,
    @CurrentUser() user: any,
  ) {
    return this.vehiclesService.create(createVehicleDto, user.id, user.role.name);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.vehiclesService.findAll(user.id, user.role.name);
  }

  @Get('search')
  search(
    @Query('q') searchTerm: string,
    @CurrentUser() user: any,
  ) {
    return this.vehiclesService.search(searchTerm, user.id, user.role.name);
  }

  @Get('customer/:customerId')
  findByCustomer(
    @Param('customerId') customerId: string,
    @CurrentUser() user: any,
  ) {
    return this.vehiclesService.findByCustomer(customerId, user.id, user.role.name);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.vehiclesService.findOne(id, user.id, user.role.name);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
    @CurrentUser() user: any,
  ) {
    return this.vehiclesService.update(id, updateVehicleDto, user.id, user.role.name);
  }

  @Patch(':id/mileage')
  updateMileage(
    @Param('id') id: string,
    @Body('mileage') mileage: number,
    @CurrentUser() user: any,
  ) {
    return this.vehiclesService.updateMileage(id, mileage, user.id, user.role.name);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.vehiclesService.remove(id, user.id, user.role.name);
  }
}