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
  IconButton
} from '@mui/material';
import {
  Dashboard,
  People,
  Inventory,
  Receipt,
  CalendarMonth,
  Assessment,
  Settings,
  Logout,
  Menu as MenuIcon,
  DirectionsCar
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

const drawerWidth = 240;

export function StaffLayout() {
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
    { text: 'Dashboard', icon: <Dashboard />, path: '/staff/dashboard' },
    { text: 'Customers', icon: <People />, path: '/customers' },
    { text: 'Vehicles', icon: <DirectionsCar />, path: '/vehicles' },
    { text: 'Inventory', icon: <Inventory />, path: '/inventory' },
    { text: 'Invoices', icon: <Receipt />, path: '/invoices' },
    { text: 'Appointments', icon: <CalendarMonth />, path: '/staff/appointments' },
    { text: 'Reports', icon: <Assessment />, path: '/staff/reports' },
    { text: 'Settings', icon: <Settings />, path: '/staff/settings' },
  ];

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6">Staff Dashboard</Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton component={Link} to={item.path}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
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
            GT Automotive - Staff Dashboard
          </Typography>
          <Typography sx={{ mr: 2 }}>
            {user?.firstName} {user?.lastName} (Staff)
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