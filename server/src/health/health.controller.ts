import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async check() {
    return await this.healthService.check();
  }

  @Get('detailed')
  async checkDetailed() {
    return await this.healthService.checkDetailed();
  }
}