import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  UseGuards,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: { email: string; password: string }
  ) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Public()
  @Post('register')
  async register(
    @Body(new ValidationPipe()) registerDto: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
    }
  ) {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@CurrentUser() user: any) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: any) {
    // In a JWT-based system, logout is typically handled on the client side
    // by removing the token. Here we can log the logout action.
    return { message: 'Logged out successfully' };
  }

  @Public()
  @Post('refresh')
  async refreshToken(@Body() body: { refresh_token: string }) {
    // Implement refresh token logic if needed
    return { message: 'Token refresh not implemented yet' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('sync')
  async syncUser(
    @Body() syncDto: {
      clerkId: string;
      email: string;
      firstName: string;
      lastName: string;
    }
  ) {
    // Sync user from Clerk to our database
    return this.authService.syncUserFromClerk(syncDto);
  }
}