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
  UnauthorizedException,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto, UpdateJobDto, JobResponseDto, JobSummaryDto } from '../common/dto/job.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JobStatus, JobType } from '@prisma/client';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  create(@Body() createJobDto: CreateJobDto, @CurrentUser() user: any) {
    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated properly');
    }
    return this.jobsService.create(createJobDto, user.id);
  }

  @Get()
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
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
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  getJobSummary(@Query('employeeId') employeeId?: string): Promise<JobSummaryDto> {
    return this.jobsService.getJobSummary(employeeId);
  }

  @Get('pending')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  findPendingJobs(): Promise<JobResponseDto[]> {
    return this.jobsService.findPendingJobs();
  }

  @Get('ready-for-payment')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR')
  findReadyForPayment(): Promise<JobResponseDto[]> {
    return this.jobsService.findReadyForPayment();
  }

  @Get('my-jobs')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  findMyJobs(@CurrentUser() user: any): Promise<JobResponseDto[]> {
    // Always use the authenticated user's ID from token - staff can only see their own
    return this.jobsService.findByEmployee(user.id);
  }

  @Get('my-summary')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  getMyJobSummary(@CurrentUser() user: any): Promise<JobSummaryDto> {
    // Always use the authenticated user's ID from token - staff can only see their own
    return this.jobsService.getJobSummary(user.id);
  }

  @Get('employee/:employeeId')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR')
  findByEmployee(@Param('employeeId') employeeId: string): Promise<JobResponseDto[]> {
    return this.jobsService.findByEmployee(employeeId);
  }

  @Get(':id')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  findOne(@Param('id') id: string): Promise<JobResponseDto> {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @CurrentUser() user: any,
  ) {
    return this.jobsService.update(id, updateJobDto, user.id);
  }

  @Patch(':id/complete')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  markAsComplete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.jobsService.markAsComplete(id, user.id);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.jobsService.remove(id, user.id);
  }
}