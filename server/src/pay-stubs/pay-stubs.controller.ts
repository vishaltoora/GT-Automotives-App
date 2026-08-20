import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  CreatePayStubDto,
  PayStubDeductionEstimateRequestDto,
  UpdatePayStubDto,
} from '@gt-automotive/data';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleGuard } from '../auth/guards/role.guard';
import { PayStubsService } from './pay-stubs.service';

@Controller('pay-stubs')
@UseGuards(RoleGuard)
export class PayStubsController {
  constructor(private readonly payStubsService: PayStubsService) {}

  /** Raise a pay stub. Accountants and admins only. */
  @Post()
  @Roles('ADMIN', 'ACCOUNTANT')
  create(@Body() dto: CreatePayStubDto, @CurrentUser() user: any) {
    return this.payStubsService.create(dto, user.id);
  }

  /**
   * Correct an issued stub. Accountants and admins only — the same people who
   * raise them. The amendment is audited with the figures before and after.
   */
  @Patch(':id')
  @Roles('ADMIN', 'ACCOUNTANT')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePayStubDto,
    @CurrentUser() user: any
  ) {
    return this.payStubsService.update(id, dto, user.id);
  }

  /**
   * Suggested CPP, EI and income tax for a gross the accountant is about to
   * enter. Read-only: nothing is stored, and the caller is free to ignore it.
   *
   * A POST because it needs a body and depends on the employee's year-to-date
   * withholding, which is not something to put in a cacheable URL.
   */
  @Post('deduction-estimate')
  @Roles('ADMIN', 'ACCOUNTANT')
  estimateDeductions(@Body() dto: PayStubDeductionEstimateRequestDto) {
    return this.payStubsService.estimateDeductions(dto);
  }

  /** Every pay stub, optionally filtered to one employee. Payroll roles only. */
  /**
   * What an employee has banked in vacation, so the pay stub form can show it
   * before a payout is typed. Employees may read their own; payroll roles may
   * read anyone's.
   */
  @Get('employees/:employeeId/vacation-balance')
  // The service still checks the caller may see this employee, so an employee
  // reading their own balance is fine and reading anyone else's is not.
  @Roles('ADMIN', 'ACCOUNTANT', 'FOREMAN', 'SUPERVISOR', 'STAFF')
  getVacationBalance(
    @Param('employeeId') employeeId: string,
    @CurrentUser() user: any
  ) {
    return this.payStubsService.getVacationBalance(employeeId, user);
  }

  @Get()
  @Roles('ADMIN', 'ACCOUNTANT')
  findAll(@CurrentUser() user: any, @Query('employeeId') employeeId?: string) {
    return this.payStubsService.findAll(user, employeeId);
  }

  /**
   * The signed-in employee's own pay stubs. Open to every payroll-eligible
   * role because it can only ever return the caller's own records.
   */
  @Get('mine')
  @Roles('ADMIN', 'ACCOUNTANT', 'FOREMAN', 'SUPERVISOR', 'STAFF')
  findMine(@CurrentUser() user: any) {
    return this.payStubsService.findForEmployee(user.id, user);
  }

  @Get('employees/:employeeId')
  @Roles('ADMIN', 'ACCOUNTANT', 'FOREMAN', 'SUPERVISOR', 'STAFF')
  findForEmployee(
    @Param('employeeId') employeeId: string,
    @CurrentUser() user: any
  ) {
    return this.payStubsService.findForEmployee(employeeId, user);
  }

  @Get(':id')
  @Roles('ADMIN', 'ACCOUNTANT', 'FOREMAN', 'SUPERVISOR', 'STAFF')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.payStubsService.findOne(id, user);
  }

  /**
   * The stub as a PDF, rendered on demand. This is the only place the document
   * is produced — the on-screen view and the print action both display this
   * response, so there is a single template and nothing to drift.
   *
   * The service re-checks ownership, so an employee cannot fetch a colleague's
   * stub by guessing an id.
   */
  @Get(':id/pdf')
  @Roles('ADMIN', 'ACCOUNTANT', 'FOREMAN', 'SUPERVISOR', 'STAFF')
  async getPdf(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Res() res: Response
  ) {
    const [pdf, filename] = await Promise.all([
      this.payStubsService.generatePdf(id, user),
      this.payStubsService.getPdfFilename(id, user),
    ]);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Content-Length', pdf.length);
    // Pay data must not sit in a shared or browser cache.
    res.setHeader('Cache-Control', 'private, no-store');
    res.end(pdf);
  }
}
