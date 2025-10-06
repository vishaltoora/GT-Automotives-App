import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme/theme';
import { ConfirmationProvider } from './contexts/ConfirmationContext';
import { ErrorProvider } from './contexts/ErrorContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { CustomerLayout } from './layouts/CustomerLayout';
import { StaffLayout } from './layouts/StaffLayout';
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

// Customer Pages
import { CustomerDashboard } from './pages/customer/Dashboard';

// Staff Pages
import { StaffDashboard } from './pages/staff/Dashboard';
import { MyJobs } from './pages/staff/MyJobs';

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard';
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
import InvoiceForm from './pages/invoices/InvoiceForm';
import InvoiceDetails from './pages/invoices/InvoiceDetails';
import CashReport from './pages/invoices/CashReport';

// Quote Pages
import QuoteList from './pages/quotations/QuotationList';
import QuotationDetails from './pages/quotations/QuotationDetails';

// Vendor Pages
import VendorManagement from './pages/vendors/VendorManagement';

// Purchase Invoice Pages
import PurchaseInvoiceManagement from './pages/purchase-invoices/PurchaseInvoiceManagement';

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
          <Route path="invoices/new" element={<InvoiceForm />} />
          <Route path="invoices/:id" element={<InvoiceDetails />} />
          <Route path="invoices/cash-report" element={<CashReport />} />
          <Route path="quotations" element={<QuoteList />} />
          <Route path="quotations/:id" element={<QuotationDetails />} />
          <Route path="jobs" element={<MyJobs />} />
          <Route path="appointments" element={<div>Appointments</div>} />
          <Route path="reports" element={<div>Reports</div>} />
          <Route path="settings" element={<div>Settings</div>} />
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
          <Route path="invoices/new" element={<InvoiceForm />} />
          <Route path="invoices/:id" element={<InvoiceDetails />} />
          <Route path="invoices/cash-report" element={<CashReport />} />
          <Route path="quotations" element={<QuoteList />} />
          <Route path="quotations/:id" element={<QuotationDetails />} />
          <Route path="vendors" element={<VendorManagement />} />
          <Route path="purchase-invoices" element={<PurchaseInvoiceManagement />} />
          <Route path="appointments" element={<div>All Appointments</div>} />
          <Route path="payroll" element={<PayrollDashboard />} />
          <Route path="payroll/jobs" element={<JobsManagement />} />
          <Route path="payroll/payments" element={<PaymentsManagement />} />
          <Route path="reports" element={<div>Financial Reports</div>} />
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