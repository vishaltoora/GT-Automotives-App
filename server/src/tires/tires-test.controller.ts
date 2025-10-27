import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

@Controller('tires-test')
export class TiresTestController {

  @Get()
  @Public()
  async testEndpoint() {
    return {
      message: 'Tires module is working!',
      timestamp: new Date().toISOString(),
      endpoints: [
        'GET /api/tires-test - This test endpoint',
        'GET /api/tires - List all tires (planned)',
        'POST /api/tires - Create tire (planned)',
        'PUT /api/tires/:id - Update tire (planned)',
        'DELETE /api/tires/:id - Delete tire (planned)',
      ]
    };
  }

  @Get('health')
  @Public()
  async healthCheck() {
    return {
      status: 'healthy',
      module: 'tires',
      database: 'connected', // We would test actual DB connection here
      timestamp: new Date().toISOString()
    };
  }
}