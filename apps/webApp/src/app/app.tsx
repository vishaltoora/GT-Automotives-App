import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { theme } from './theme/theme';

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

// Customer Pages
import { CustomerDashboard } from './pages/customer/Dashboard';

// Staff Pages
import { StaffDashboard } from './pages/staff/Dashboard';

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard';

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

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="unauthorized" element={<Unauthorized />} />
          <Route path="services" element={<Services />} />
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
          <Route path="vehicles" element={<div>My Vehicles</div>} />
          <Route path="invoices" element={<div>My Invoices</div>} />
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
          <Route path="customers" element={<div>Customers</div>} />
          <Route path="invoices" element={<div>Invoices</div>} />
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
          <Route path="users" element={<div>User Management</div>} />
          <Route path="customers" element={<div>All Customers</div>} />
          <Route path="invoices" element={<div>All Invoices</div>} />
          <Route path="appointments" element={<div>All Appointments</div>} />
          <Route path="reports" element={<div>Financial Reports</div>} />
          <Route path="analytics" element={<div>Analytics</div>} />
          <Route path="security" element={<div>Security Settings</div>} />
          <Route path="settings" element={<div>System Settings</div>} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Shared Inventory Routes - Available to all authenticated users */}
        <Route
          path="/inventory"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={['customer', 'staff', 'admin']}>
                <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
                  <Outlet />
                </Box>
              </RoleGuard>
            </AuthGuard>
          }
        >
          <Route index element={<TireListSimple />} />
          <Route path="new" element={
            <RoleGuard allowedRoles={['staff', 'admin']}>
              <TireFormSimple />
            </RoleGuard>
          } />
          <Route path=":id" element={<TireDetails />} />
          <Route path=":id/edit" element={
            <RoleGuard allowedRoles={['staff', 'admin']}>
              <TireFormSimple />
            </RoleGuard>
          } />
          <Route path="dashboard" element={
            <RoleGuard allowedRoles={['staff', 'admin']}>
              <InventoryDashboard />
            </RoleGuard>
          } />
        </Route>

        {/* Customer Management Routes - Available to all authenticated users */}
        <Route
          path="/customers"
          element={
            <AuthGuard>
              <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
                <Outlet />
              </Box>
            </AuthGuard>
          }
        >
          <Route index element={<CustomerList />} />
          <Route path="new" element={
            <RoleGuard allowedRoles={['staff', 'admin']}>
              <CustomerForm />
            </RoleGuard>
          } />
          <Route path=":id/edit" element={<CustomerForm />} />
        </Route>

        {/* Vehicle Management Routes - Available to all authenticated users */}
        <Route
          path="/vehicles"
          element={
            <AuthGuard>
              <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
                <Outlet />
              </Box>
            </AuthGuard>
          }
        >
          <Route index element={<VehicleList />} />
          <Route path="new" element={<VehicleForm />} />
          <Route path=":id/edit" element={<VehicleForm />} />
        </Route>

        {/* Invoice Routes - Available to all authenticated users */}
        <Route
          path="/invoices"
          element={
            <AuthGuard>
              <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
                <Outlet />
              </Box>
            </AuthGuard>
          }
        >
          <Route index element={<InvoiceList />} />
          <Route path="new" element={
            <RoleGuard allowedRoles={['staff', 'admin']}>
              <InvoiceForm />
            </RoleGuard>
          } />
          <Route path="cash-report" element={
            <RoleGuard allowedRoles={['staff', 'admin']}>
              <CashReport />
            </RoleGuard>
          } />
          <Route path=":id" element={<InvoiceDetails />} />
        </Route>

        {/* Catch all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;