import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider
} from '@mui/material';
import {
  Dashboard,
  People,
  SupervisorAccount,
  Inventory,
  Receipt,
  CalendarMonth,
  Assessment,
  Analytics,
  Settings,
  Security,
  Logout,
  Menu as MenuIcon,
  DirectionsCar
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

const drawerWidth = 240;

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSignOut = async () => {
    // Handle signout - in dev mode just navigate
    try {
      const { useClerk } = await import('@clerk/clerk-react');
      const { signOut } = useClerk();
      await signOut();
    } catch (error) {
      console.log('Clerk not available, navigating to home');
    }
    navigate('/');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
    { text: 'Users', icon: <SupervisorAccount />, path: '/admin/users' },
    { text: 'Customers', icon: <People />, path: '/customers' },
    { text: 'Vehicles', icon: <DirectionsCar />, path: '/vehicles' },
    { text: 'Inventory', icon: <Inventory />, path: '/inventory' },
    { text: 'Invoices', icon: <Receipt />, path: '/admin/invoices' },
    { text: 'Appointments', icon: <CalendarMonth />, path: '/admin/appointments' },
    { divider: true },
    { text: 'Reports', icon: <Assessment />, path: '/admin/reports' },
    { text: 'Analytics', icon: <Analytics />, path: '/admin/analytics' },
    { divider: true },
    { text: 'Security', icon: <Security />, path: '/admin/security' },
    { text: 'Settings', icon: <Settings />, path: '/admin/settings' },
  ];

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6">Admin Panel</Typography>
      </Toolbar>
      <List>
        {menuItems.map((item, index) => {
          if (item.divider) {
            return <Divider key={index} sx={{ my: 1 }} />;
          }
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton component={Link} to={item.path}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            GT Automotive - Admin Panel
          </Typography>
          <Typography sx={{ mr: 2 }}>
            {user?.firstName} {user?.lastName} (Admin)
          </Typography>
          <Button color="inherit" onClick={handleSignOut} startIcon={<Logout />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}