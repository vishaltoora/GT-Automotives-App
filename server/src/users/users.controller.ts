import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/users')
@UseGuards(JwtAuthGuard, RoleGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles('admin', 'staff')
  async findAll(
    @Query('roleId') roleId?: string,
    @Query('isActive') isActive?: string,
  ) {
    const filters = {
      roleId: roleId ? parseInt(roleId, 10) : undefined,
      isActive: isActive === 'true',
    };
    return this.usersService.findAll(filters);
  }

  @Get(':id')
  @Roles('admin', 'staff')
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @Roles('admin')
  async create(
    @Body(new ValidationPipe()) createUserDto: {
      email: string;
      password?: string;
      firstName: string;
      lastName: string;
      phone?: string;
      roleId: number;
    },
    @CurrentUser() currentUser: any,
  ) {
    return this.usersService.create({
      ...createUserDto,
      createdBy: currentUser.id,
    });
  }

  @Put(':id')
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateUserDto: {
      email?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      isActive?: boolean;
    },
    @CurrentUser() currentUser: any,
  ) {
    return this.usersService.update(id, {
      ...updateUserDto,
      updatedBy: currentUser.id,
    });
  }

  @Put(':id/role')
  @Roles('admin')
  async assignRole(
    @Param('id') id: string,
    @Body('roleId') roleId: number,
    @CurrentUser() currentUser: any,
  ) {
    return this.usersService.assignRole(id, roleId, currentUser.id);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ) {
    return this.usersService.delete(id, currentUser.id);
  }

  @Post(':id/change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Param('id') id: string,
    @Body() body: {
      oldPassword: string;
      newPassword: string;
    },
    @CurrentUser() currentUser: any,
  ) {
    // Users can only change their own password
    if (currentUser.id !== id) {
      throw new Error('You can only change your own password');
    }
    return this.usersService.changePassword(id, body.oldPassword, body.newPassword);
  }

  @Post(':id/reset-password')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Param('id') id: string,
    @Body('newPassword') newPassword: string,
    @CurrentUser() currentUser: any,
  ) {
    return this.usersService.resetPassword(id, newPassword, currentUser.id);
  }

  @Get('profile/me')
  async getMyProfile(@CurrentUser() currentUser: any) {
    return this.usersService.findById(currentUser.id);
  }

  @Put('profile/me')
  async updateMyProfile(
    @Body() updateProfileDto: {
      firstName?: string;
      lastName?: string;
      phone?: string;
    },
    @CurrentUser() currentUser: any,
  ) {
    return this.usersService.update(currentUser.id, {
      ...updateProfileDto,
      updatedBy: currentUser.id,
    });
  }
}