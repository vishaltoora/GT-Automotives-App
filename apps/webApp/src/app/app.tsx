import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme/theme';
import { ConfirmationProvider } from './contexts/ConfirmationContext';
import { ErrorProvider } from './contexts/ErrorContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { CustomerLayout } from './layouts/CustomerLayout';
import { StaffLayout } from './layouts/StaffLayout';
import { SupervisorLayout } from './layouts/SupervisorLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Guards
import { AuthGuard } from './guards/AuthGuard';
import { RoleGuard } from './guards/RoleGuard';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Unauthorized } from './pages/auth/Unauthorized';

// Public Pages
import { Home } from './pages/public/Home';
import { Services } from './pages/public/Services';
import { Contact } from './pages/public/Contact';
import { About } from './pages/public/About';
import { Products } from './pages/public/Products';
import { Pricing } from './pages/public/Pricing';
import { BookAppointment } from './pages/public/BookAppointment';

// Customer Pages
import { CustomerDashboard } from './pages/customer/Dashboard';

// Staff Pages
import { StaffDashboard } from './pages/staff/Dashboard';
import { MyJobs } from './pages/staff/MyJobs';
import { MyEarnings } from './pages/staff/MyEarnings';

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { DaySummary } from './pages/admin/DaySummary';
import UserManagement from '../pages/admin/UserManagement';

// Payroll Pages
import { PayrollDashboard } from './pages/admin/payroll/PayrollDashboard';
import { JobsManagement } from './pages/admin/payroll/JobsManagement';
import { PaymentsManagement } from './pages/admin/payroll/PaymentsManagement';


// Inventory Pages
import TireListSimple from './pages/inventory/TireListSimple';
import TireFormSimple from './pages/inventory/TireFormSimple';
import TireDetails from './pages/inventory/TireDetails';
import InventoryDashboard from './pages/inventory/InventoryDashboard';

// Customer Management Pages
import { CustomerList } from './pages/customers/CustomerList';
import { CustomerForm } from './pages/customers/CustomerForm';
import { VehicleList } from './pages/customers/VehicleList';
import { VehicleForm } from './pages/customers/VehicleForm';

// Invoice Pages
import InvoiceList from './pages/invoices/InvoiceList';
import InvoiceDetails from './pages/invoices/InvoiceDetails';
import CashReport from './pages/invoices/CashReport';

// Quote Pages
import QuoteList from './pages/quotations/QuotationList';
import QuotationDetails from './pages/quotations/QuotationDetails';

// Purchase Invoice Pages (Legacy - will be removed)
// import PurchaseInvoiceManagement from './pages/purchase-invoices/PurchaseInvoiceManagement';

// Unified Purchase & Expense Invoice Pages
import PurchaseExpenseInvoiceManagement from './pages/purchase-expense-invoices/PurchaseExpenseInvoiceManagement';

// Appointment Pages
import { AppointmentsManagement } from './pages/admin/appointments/AppointmentsManagement';
import { EmployeeAvailabilityManagement } from './pages/admin/appointments/EmployeeAvailabilityManagement';
import { BookingRequests } from './pages/admin/BookingRequests';

// SMS Pages
import { SmsHistory } from './pages/admin/sms/SmsHistory';

// Email Pages
import EmployeeSchedule from './pages/admin/EmployeeSchedule';

// Reports Pages
import Reports from './pages/admin/Reports';

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorProvider>
        <ConfirmationProvider>
          <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="unauthorized" element={<Unauthorized />} />
          <Route path="services" element={<Services />} />
          <Route path="products" element={<Products />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="book-appointment" element={<BookAppointment />} />
        </Route>

        {/* Customer Routes */}
        <Route
          path="/customer/*"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={['customer']}>
                <CustomerLayout />
              </RoleGuard>
            </AuthGuard>
          }
        >
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="inventory" element={<TireListSimple />} />
          <Route path="inventory/:id" element={<TireDetails />} />
          <Route path="vehicles" element={<VehicleList />} />
          <Route path="vehicles/new" element={<VehicleForm />} />
          <Route path="vehicles/:id/edit" element={<VehicleForm />} />
          <Route path="invoices" element={<InvoiceList />} />
          <Route path="invoices/:id" element={<InvoiceDetails />} />
          <Route path="appointments" element={<div>My Appointments</div>} />
          <Route path="profile" element={<div>My Profile</div>} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Staff Routes */}
        <Route
          path="/staff/*"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={['staff', 'admin']}>
                <StaffLayout />
              </RoleGuard>
            </AuthGuard>
          }
        >
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="customers/new" element={<CustomerForm />} />
          <Route path="customers/:id/edit" element={<CustomerForm />} />
          <Route path="vehicles" element={<VehicleList />} />
          <Route path="vehicles/new" element={<VehicleForm />} />
          <Route path="vehicles/:id/edit" element={<VehicleForm />} />
          <Route path="inventory" element={<TireListSimple />} />
          <Route path="inventory/new" element={<TireFormSimple />} />
          <Route path="inventory/:id" element={<TireDetails />} />
          <Route path="inventory/:id/edit" element={<TireFormSimple />} />
          <Route path="inventory/dashboard" element={<InventoryDashboard />} />
          <Route path="invoices" element={<InvoiceList />} />
          <Route path="invoices/:id" element={<InvoiceDetails />} />
          <Route path="invoices/cash-report" element={<CashReport />} />
          <Route path="quotations" element={<QuoteList />} />
          <Route path="quotations/:id" element={<QuotationDetails />} />
          <Route path="jobs" element={<MyJobs />} />
          <Route path="earnings" element={<MyEarnings />} />
          <Route path="appointments" element={<AppointmentsManagement />} />
          <Route path="availability" element={<EmployeeAvailabilityManagement />} />
          <Route path="reports" element={<div>Reports</div>} />
          <Route path="settings" element={<div>Settings</div>} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Supervisor Routes */}
        <Route
          path="/supervisor/*"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={['supervisor', 'admin']}>
                <SupervisorLayout />
              </RoleGuard>
            </AuthGuard>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="day-summary" element={<DaySummary />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="customers/new" element={<CustomerForm />} />
          <Route path="customers/:id/edit" element={<CustomerForm />} />
          <Route path="vehicles" element={<VehicleList />} />
          <Route path="vehicles/new" element={<VehicleForm />} />
          <Route path="vehicles/:id/edit" element={<VehicleForm />} />
          <Route path="inventory" element={<TireListSimple />} />
          <Route path="inventory/new" element={<TireFormSimple />} />
          <Route path="inventory/:id" element={<TireDetails />} />
          <Route path="inventory/:id/edit" element={<TireFormSimple />} />
          <Route path="inventory/dashboard" element={<InventoryDashboard />} />
          <Route path="invoices" element={<InvoiceList />} />
          <Route path="invoices/:id" element={<InvoiceDetails />} />
          <Route path="invoices/cash-report" element={<CashReport />} />
          <Route path="quotations" element={<QuoteList />} />
          <Route path="quotations/:id" element={<QuotationDetails />} />
          <Route path="purchase-invoices" element={<PurchaseExpenseInvoiceManagement />} />
          <Route path="appointments" element={<AppointmentsManagement />} />
          <Route path="booking-requests" element={<BookingRequests />} />
          <Route path="availability" element={<EmployeeAvailabilityManagement />} />
          <Route path="employee-schedule" element={<EmployeeSchedule />} />
          <Route path="jobs" element={<JobsManagement />} />
          <Route path="jobs/:employeeId" element={<JobsManagement />} />
          <Route path="my-jobs" element={<MyJobs />} />
          <Route path="my-earnings" element={<MyEarnings />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={['admin']}>
                <AdminLayout />
              </RoleGuard>
            </AuthGuard>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="day-summary" element={<DaySummary />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="customers/new" element={<CustomerForm />} />
          <Route path="customers/:id/edit" element={<CustomerForm />} />
          <Route path="vehicles" element={<VehicleList />} />
          <Route path="vehicles/new" element={<VehicleForm />} />
          <Route path="vehicles/:id/edit" element={<VehicleForm />} />
          <Route path="inventory" element={<TireListSimple />} />
          <Route path="inventory/new" element={<TireFormSimple />} />
          <Route path="inventory/:id" element={<TireDetails />} />
          <Route path="inventory/:id/edit" element={<TireFormSimple />} />
          <Route path="inventory/dashboard" element={<InventoryDashboard />} />
          <Route path="invoices" element={<InvoiceList />} />
          <Route path="invoices/:id" element={<InvoiceDetails />} />
          <Route path="invoices/cash-report" element={<CashReport />} />
          <Route path="quotations" element={<QuoteList />} />
          <Route path="quotations/:id" element={<QuotationDetails />} />
          <Route path="purchase-invoices" element={<PurchaseExpenseInvoiceManagement />} />
          {/* Unified purchase & expense invoices */}
          <Route path="appointments" element={<AppointmentsManagement />} />
          <Route path="booking-requests" element={<BookingRequests />} />
          <Route path="availability" element={<EmployeeAvailabilityManagement />} />
          <Route path="sms-history" element={<SmsHistory />} />
          <Route path="employee-schedule" element={<EmployeeSchedule />} />
          <Route path="payroll" element={<PayrollDashboard />} />
          <Route path="jobs" element={<JobsManagement />} />
          <Route path="jobs/:employeeId" element={<JobsManagement />} />
          <Route path="payments" element={<PaymentsManagement />} />
          <Route path="reports" element={<Reports />} />
          <Route path="analytics" element={<div>Analytics</div>} />
          <Route path="security" element={<div>Security Settings</div>} />
          <Route path="settings" element={<div>System Settings</div>} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>


        {/* Catch all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ConfirmationProvider>
      </ErrorProvider>
    </ThemeProvider>
  );
}

export default App;