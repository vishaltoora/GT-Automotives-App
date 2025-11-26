import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { SquareWebhookService } from './square-webhook.service';

@Controller('square/webhooks')
export class SquareWebhookController {
  private readonly logger = new Logger(SquareWebhookController.name);

  constructor(private readonly webhookService: SquareWebhookService) {}

  /**
   * Square Webhook Endpoint
   * POST /api/square/webhooks
   *
   * Receives notifications from Square when payments are completed
   * No authentication guard - Square validates via signature
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() body: any,
    @Headers('x-square-hmacsha256-signature') signature: string,
  ): Promise<{ received: boolean }> {
    this.logger.log(`Received Square webhook: ${body.type}`);

    if (!signature) {
      this.logger.warn('Webhook received without signature');
      throw new BadRequestException('Missing webhook signature');
    }

    try {
      await this.webhookService.handleWebhook(body, signature);
      return { received: true };
    } catch (error: any) {
      this.logger.error(`Webhook processing failed: ${error.message}`, error.stack);
      // Return 200 anyway to prevent Square from retrying
      // (logged errors can be reviewed manually)
      return { received: true };
    }
  }
}
