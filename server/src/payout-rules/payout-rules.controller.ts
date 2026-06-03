import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PayoutRulesService } from './payout-rules.service';
import { CreatePayoutRuleDto, PayoutRuleResponseDto, UpdatePayoutRuleDto } from '@gt-automotive/data';

@Controller('payout-rules')
@UseGuards(JwtAuthGuard)
export class PayoutRulesController {
  constructor(private readonly service: PayoutRulesService) {}

  @Get()
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR')
  findAll(): Promise<PayoutRuleResponseDto[]> {
    return this.service.findAll();
  }

  @Get(':id')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR')
  findOne(@Param('id') id: string): Promise<PayoutRuleResponseDto> {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(RoleGuard)
  @Roles('ADMIN')
  create(@Body() dto: CreatePayoutRuleDto): Promise<PayoutRuleResponseDto> {
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdatePayoutRuleDto): Promise<PayoutRuleResponseDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
