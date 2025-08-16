import { 
  Controller, 
  Post, 
  Body, 
  Headers, 
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Webhook } from 'svix';
import { AuthService } from '../auth.service';
import { Public } from '../decorators/public.decorator';

@Controller('api/webhooks')
export class ClerkWebhookController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Public()
  @Post('clerk')
  @HttpCode(HttpStatus.OK)
  async handleClerkWebhook(
    @Body() body: any,
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
  ) {
    const webhookSecret = this.configService.get<string>('CLERK_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      console.warn('Clerk webhook secret not configured, skipping webhook processing');
      return { received: true, message: 'Webhook not configured' };
    }

    const wh = new Webhook(webhookSecret);
    let evt: any;

    try {
      evt = wh.verify(JSON.stringify(body), {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      });
    } catch (err) {
      throw new BadRequestException('Invalid webhook signature');
    }

    switch (evt.type) {
      case 'user.created':
      case 'user.updated':
        await this.handleUserEvent(evt);
        break;
      case 'user.deleted':
        await this.handleUserDeleted(evt);
        break;
      default:
        console.log(`Unhandled webhook event type: ${evt.type}`);
    }

    return { received: true };
  }

  private async handleUserEvent(evt: any) {
    const { id, email_addresses } = evt.data as any;
    
    if (!email_addresses || email_addresses.length === 0) {
      return;
    }
    
    await this.authService.validateClerkUser(id);
  }

  private async handleUserDeleted(evt: any) {
    const { id } = evt.data as any;
    // Implement user deactivation logic
    console.log(`User ${id} deleted in Clerk`);
  }
}