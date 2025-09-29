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
import { JobsService } from './jobs.service';
import { CreateJobDto, UpdateJobDto, JobResponseDto, JobSummaryDto } from '../common/dto/job.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JobStatus, JobType } from '@prisma/client';

@Controller('api/jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles('STAFF', 'ADMIN')
  create(@Body() createJobDto: CreateJobDto, @CurrentUser() user: any) {
    return this.jobsService.create(createJobDto, user.id);
  }

  @Get()
  @UseGuards(RoleGuard)
  @Roles('STAFF', 'ADMIN')
  findAll(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: JobStatus,
    @Query('jobType') jobType?: JobType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<JobResponseDto[]> {
    return this.jobsService.findAll({
      employeeId,
      status,
      jobType,
      startDate,
      endDate,
    });
  }

  @Get('summary')
  @UseGuards(RoleGuard)
  @Roles('ADMIN')
  getJobSummary(@Query('employeeId') employeeId?: string): Promise<JobSummaryDto> {
    return this.jobsService.getJobSummary(employeeId);
  }

  @Get('pending')
  @UseGuards(RoleGuard)
  @Roles('STAFF', 'ADMIN')
  findPendingJobs(): Promise<JobResponseDto[]> {
    return this.jobsService.findPendingJobs();
  }

  @Get('ready-for-payment')
  @UseGuards(RoleGuard)
  @Roles('ADMIN')
  findReadyForPayment(): Promise<JobResponseDto[]> {
    return this.jobsService.findReadyForPayment();
  }

  @Get('employee/:employeeId')
  @UseGuards(RoleGuard)
  @Roles('STAFF', 'ADMIN')
  findByEmployee(@Param('employeeId') employeeId: string): Promise<JobResponseDto[]> {
    return this.jobsService.findByEmployee(employeeId);
  }

  @Get(':id')
  @UseGuards(RoleGuard)
  @Roles('STAFF', 'ADMIN')
  findOne(@Param('id') id: string): Promise<JobResponseDto> {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @CurrentUser() user: any,
  ) {
    return this.jobsService.update(id, updateJobDto, user.id);
  }

  @Patch(':id/complete')
  @UseGuards(RoleGuard)
  @Roles('STAFF', 'ADMIN')
  markAsComplete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.jobsService.markAsComplete(id, user.id);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.jobsService.remove(id, user.id);
  }
}