import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { TiresModule } from '../tires/tires.module';
import { CustomersModule } from '../customers/customers.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { QuotationsModule } from '../quotations/quotations.module';
import { CompaniesModule } from '../companies/companies.module';
import { JobsModule } from '../jobs/jobs.module';
import { PaymentsModule } from '../payments/payments.module';
import { HealthModule } from '../health/health.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { CommonModule } from '../common/common.module';
import { VendorsModule } from '../vendors/vendors.module';
import { PurchaseInvoicesModule } from '../purchase-invoices/purchase-invoices.module';
import { ExpenseInvoicesModule } from '../expense-invoices/expense-invoices.module';
import { ReportsModule } from '../reports/reports.module';
import { AppointmentsModule } from '../appointments/appointments.module';
import { SmsModule } from '../sms/sms.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    CommonModule,
    AuthModule,
    UsersModule,
    TiresModule,
    CustomersModule,
    VehiclesModule,
    InvoicesModule,
    QuotationsModule,
    CompaniesModule,
    JobsModule,
    PaymentsModule,
    HealthModule,
    DashboardModule,
    VendorsModule,
    PurchaseInvoicesModule,
    ExpenseInvoicesModule,
    ReportsModule,
    AppointmentsModule,
    SmsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class AppModule {}
