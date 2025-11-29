import { Controller, Post, Body, Logger, Get, Param, Delete, Patch } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { BookingRequestsService } from './booking-requests.service';
import { CreateBookingRequestDto } from './dto/create-booking-request.dto';
import { UpdateBookingRequestDto } from './dto/update-booking-request.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('booking-requests')
export class BookingRequestsController {
  private readonly logger = new Logger(BookingRequestsController.name);

  constructor(private readonly bookingRequestsService: BookingRequestsService) {}

  @Public()
  @Post()
  async create(@Body() createBookingRequestDto: CreateBookingRequestDto) {
    this.logger.log('Received booking request from public form');
    return this.bookingRequestsService.create(createBookingRequestDto);
  }

  @Get()
  @Roles('ADMIN', 'STAFF', 'SUPERVISOR')
  async findAll() {
    this.logger.log('Fetching all booking requests');
    return this.bookingRequestsService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'STAFF', 'SUPERVISOR')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching booking request ${id}`);
    return this.bookingRequestsService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'STAFF', 'SUPERVISOR')
  async update(@Param('id') id: string, @Body() updateBookingRequestDto: UpdateBookingRequestDto) {
    this.logger.log(`Updating booking request ${id}`);
    return this.bookingRequestsService.update(id, updateBookingRequestDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'STAFF', 'SUPERVISOR')
  async delete(@Param('id') id: string) {
    this.logger.log(`Deleting booking request ${id}`);
    return this.bookingRequestsService.delete(id);
  }
}
