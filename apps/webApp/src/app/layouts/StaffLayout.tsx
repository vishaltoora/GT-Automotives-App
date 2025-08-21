import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
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
  Divider,
  useTheme,
  useMediaQuery,
  Avatar,
  Chip
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
  DirectionsCar,
  AccountCircle
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../theme/colors';
import gtLogo from '../images-and-logos/gt-automotive-logo.svg';

const drawerWidth = 280;

export function StaffLayout() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: colors.gradients.dark }}>
      <Toolbar sx={{ 
        py: 2,
        px: 2,
        background: 'linear-gradient(135deg, #2c5282 0%, #4a90e2 100%)',
        borderBottom: `1px solid ${colors.primary.dark}`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: 'white',
              border: `2px solid ${colors.primary.light}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            <img
              src={gtLogo}
              alt="GT Logo"
              style={{
                width: '85%',
                height: '85%',
                objectFit: 'contain',
              }}
            />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 700, lineHeight: 1.2 }}>
              GT Automotives
            </Typography>
            <Typography variant="caption" sx={{ color: colors.primary.lighter, fontWeight: 500 }}>
              Staff Portal
            </Typography>
          </Box>
        </Box>
      </Toolbar>
      
      <Box sx={{ p: 2, borderBottom: `1px solid rgba(255,255,255,0.1)` }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          p: 1.5,
          borderRadius: 2,
          background: 'rgba(255,255,255,0.05)',
        }}>
          <Avatar sx={{ 
            bgcolor: colors.primary.light,
            width: 36,
            height: 36,
          }}>
            {user?.firstName?.[0]?.toUpperCase() || 'S'}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.primary.lighter }}>
              Staff Member
            </Typography>
          </Box>
        </Box>
      </Box>

      <List sx={{ flex: 1, py: 1, px: 1 }}>
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton 
                component={Link} 
                to={item.path}
                sx={{
                  borderRadius: 1.5,
                  mx: 0.5,
                  transition: 'all 0.2s',
                  backgroundColor: active ? 'rgba(74,144,226,0.15)' : 'transparent',
                  borderLeft: active ? `3px solid ${colors.primary.lighter}` : '3px solid transparent',
                  '&:hover': {
                    backgroundColor: active ? 'rgba(74,144,226,0.2)' : 'rgba(255,255,255,0.05)',
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  color: active ? colors.primary.lighter : 'rgba(255,255,255,0.7)',
                  minWidth: 40,
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: active ? 600 : 400,
                    color: active ? 'white' : 'rgba(255,255,255,0.85)',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<Logout />}
          onClick={handleSignOut}
          sx={{
            backgroundColor: colors.primary.light,
            color: 'white',
            fontWeight: 600,
            py: 1.2,
            '&:hover': {
              backgroundColor: colors.primary.main,
            },
          }}
        >
          Sign Out
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        elevation={1}
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'white',
          color: 'text.primary',
          borderBottom: `1px solid ${colors.neutral[200]}`,
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <IconButton
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { md: 'none' },
              color: colors.primary.main,
            }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Logo for mobile */}
          <Box 
            sx={{ 
              display: { xs: 'flex', md: 'none' },
              alignItems: 'center',
              gap: 1,
              flexGrow: 1,
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                overflow: 'hidden',
                backgroundColor: 'white',
                border: `2px solid ${colors.primary.main}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={gtLogo}
                alt="GT Logo"
                style={{
                  width: '85%',
                  height: '85%',
                  objectFit: 'contain',
                }}
              />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: colors.primary.main,
              }}
            >
              GT Staff
            </Typography>
          </Box>

          {/* Desktop title */}
          <Typography 
            variant="h5" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 600,
              color: colors.primary.main,
              display: { xs: 'none', md: 'block' },
              ml: { md: `${drawerWidth}px` },
            }}
          >
            Staff Dashboard
          </Typography>

          {/* User info and actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              icon={<AccountCircle />}
              label={`${user?.firstName || 'Staff'}`}
              variant="outlined"
              sx={{ 
                display: { xs: 'none', sm: 'flex' },
                borderColor: colors.primary.main,
                color: colors.primary.main,
                fontWeight: 500,
              }}
            />
            <Button 
              variant="contained"
              size="small"
              onClick={handleSignOut} 
              startIcon={<Logout />}
              sx={{
                backgroundColor: colors.primary.main,
                fontWeight: 600,
                display: { xs: 'none', sm: 'flex' },
                '&:hover': {
                  backgroundColor: colors.primary.dark,
                },
              }}
            >
              Sign Out
            </Button>
            <IconButton
              onClick={handleSignOut}
              sx={{ 
                display: { xs: 'flex', sm: 'none' },
                color: colors.primary.main,
              }}
            >
              <Logout />
            </IconButton>
          </Box>
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
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 'none',
              boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 'none',
              boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
            },
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
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: colors.background.light,
          minHeight: '100vh',
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