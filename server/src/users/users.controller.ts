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

@Controller('users')
@UseGuards(JwtAuthGuard, RoleGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles('ADMIN', 'STAFF')
  async findAll(
    @Query('roleId') roleId?: string,
    @Query('isActive') isActive?: string,
  ) {
    const filters = {
      roleId: roleId || undefined,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    };
    return this.usersService.findAll(filters);
  }

  @Get(':id')
  @Roles('ADMIN', 'STAFF')
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @Roles('ADMIN')
  async create(
    @Body(new ValidationPipe()) createUserDto: {
      email: string;
      firstName: string;
      lastName: string;
      roleId: string;
    },
    @CurrentUser() currentUser: any,
  ) {
    return this.usersService.create({
      ...createUserDto,
      createdBy: currentUser.id,
    });
  }

  @Post('admin-staff')
  @Roles('ADMIN')
  async createAdminOrStaff(
    @Body(new ValidationPipe()) createUserDto: {
      email: string;
      username: string;
      firstName: string;
      lastName: string;
      phone?: string;
      roleName: 'ADMIN' | 'SUPERVISOR' | 'STAFF';
      password: string;
    },
    @CurrentUser() currentUser: any,
  ) {
    return this.usersService.createAdminOrStaff({
      ...createUserDto,
      createdBy: currentUser.id,
    });
  }

  @Put(':id')
  @Roles('ADMIN')
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
  @Roles('ADMIN')
  async assignRole(
    @Param('id') id: string,
    @Body('roleId') roleId: string,
    @CurrentUser() currentUser: any,
  ) {
    return this.usersService.assignRole(id, roleId, currentUser.id);
  }

  @Put(':id/role-by-name')
  @Roles('ADMIN')
  async assignRoleByName(
    @Param('id') id: string,
    @Body('roleName') roleName: 'ADMIN' | 'SUPERVISOR' | 'STAFF',
    @CurrentUser() currentUser: any,
  ) {
    return this.usersService.assignRoleByName(id, roleName, currentUser.id);
  }

  @Delete(':id')
  @Roles('ADMIN')
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
  @Roles('ADMIN')
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
    },
    @CurrentUser() currentUser: any,
  ) {
    return this.usersService.update(currentUser.id, {
      ...updateProfileDto,
      updatedBy: currentUser.id,
    });
  }
}