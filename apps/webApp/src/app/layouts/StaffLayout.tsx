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
  Chip,
  Tooltip
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
  AccountCircle,
  Description,
  ChevronLeft,
  ChevronRight
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../theme/colors';
import gtLogo from '../images-and-logos/gt-automotive-logo.svg';

const drawerWidth = 280;
const drawerCollapsedWidth = 72;

export function StaffLayout() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [drawerCollapsed, setDrawerCollapsed] = React.useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerCollapse = () => {
    setDrawerCollapsed(!drawerCollapsed);
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/staff/dashboard' },
    { text: 'Customers', icon: <People />, path: '/staff/customers' },
    { text: 'Vehicles', icon: <DirectionsCar />, path: '/staff/vehicles' },
    { text: 'Inventory', icon: <Inventory />, path: '/staff/inventory' },
    { text: 'Invoices', icon: <Receipt />, path: '/staff/invoices' },
    { text: 'Quotations', icon: <Description />, path: '/staff/quotations' },
    { text: 'Appointments', icon: <CalendarMonth />, path: '/staff/appointments' },
    { divider: true },
    { text: 'Reports', icon: <Assessment />, path: '/staff/reports' },
    { divider: true },
    { text: 'Settings', icon: <Settings />, path: '/staff/settings' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: colors.neutral[50] }}>
      <Toolbar sx={{
        py: 2,
        px: drawerCollapsed ? 1 : 2,
        background: colors.primary.main,
        borderBottom: `1px solid ${colors.neutral[200]}`,
        justifyContent: drawerCollapsed ? 'center' : 'flex-start',
        minHeight: 80,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: drawerCollapsed ? 0 : 1.5, width: '100%', justifyContent: drawerCollapsed ? 'center' : 'flex-start' }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: 'white',
              border: `2px solid ${colors.secondary.main}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              flexShrink: 0,
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
          {!drawerCollapsed && (
            <Box>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, lineHeight: 1 }}>
                GT Automotives
              </Typography>
              <Typography variant="caption" sx={{ color: colors.neutral[100], fontWeight: 500 }}>
                Staff Portal
              </Typography>
            </Box>
          )}
        </Box>
      </Toolbar>

      {/* Collapse Toggle Button - Only on Desktop */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: drawerCollapsed ? 'center' : 'flex-end', px: 1, py: 0.5 }}>
        <IconButton
          onClick={handleDrawerCollapse}
          size="small"
          sx={{
            color: colors.neutral[600],
            backgroundColor: colors.neutral[100],
            '&:hover': {
              backgroundColor: colors.neutral[200],
            },
          }}
        >
          {drawerCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>

      <List sx={{ flex: 1, py: 1, px: drawerCollapsed ? 0.5 : 1 }}>
        {menuItems.map((item, index) => {
          if (item.divider) {
            return <Divider key={index} sx={{ my: 1, mx: drawerCollapsed ? 1 : 0, borderColor: colors.neutral[200] }} />;
          }
          const active = item.path ? isActive(item.path) : false;
          const listButton = (
            <ListItemButton
              component={Link}
              to={item.path!}
              sx={{
                borderRadius: 1.5,
                mx: 0.5,
                transition: 'all 0.2s',
                backgroundColor: active ? colors.primary.lighter + '20' : 'transparent',
                borderLeft: active ? `3px solid ${colors.secondary.main}` : '3px solid transparent',
                justifyContent: drawerCollapsed ? 'center' : 'flex-start',
                px: drawerCollapsed ? 0 : 2,
                '&:hover': {
                  backgroundColor: active ? colors.primary.lighter + '30' : colors.neutral[100],
                },
              }}
            >
              <ListItemIcon sx={{
                color: active ? colors.primary.main : colors.neutral[600],
                minWidth: drawerCollapsed ? 0 : 40,
                justifyContent: 'center',
              }}>
                {item.icon}
              </ListItemIcon>
              {!drawerCollapsed && (
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: active ? 600 : 400,
                    color: active ? colors.primary.main : colors.text.primary,
                  }}
                />
              )}
            </ListItemButton>
          );

          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              {drawerCollapsed ? (
                <Tooltip title={item.text} placement="right" arrow>
                  {listButton}
                </Tooltip>
              ) : (
                listButton
              )}
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: colors.neutral[200] }} />

      <Box sx={{ p: drawerCollapsed ? 1 : 2 }}>
        {drawerCollapsed ? (
          <Tooltip title="Sign Out" placement="right" arrow>
            <IconButton
              onClick={handleSignOut}
              sx={{
                color: colors.neutral[600],
                width: '100%',
                '&:hover': {
                  backgroundColor: colors.neutral[100],
                  color: colors.text.primary,
                },
              }}
            >
              <Logout />
            </IconButton>
          </Tooltip>
        ) : (
          <Button
            fullWidth
            variant="text"
            startIcon={<Logout />}
            onClick={handleSignOut}
            sx={{
              color: colors.neutral[600],
              fontWeight: 500,
              py: 1.2,
              '&:hover': {
                backgroundColor: colors.neutral[100],
                color: colors.text.primary,
              },
            }}
          >
            Sign Out
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Box
        component="nav"
        sx={{
          width: { sm: drawerCollapsed ? drawerCollapsedWidth : drawerWidth, md: drawerCollapsed ? drawerCollapsedWidth : drawerWidth },
          flexShrink: { sm: 0 },
          transition: 'width 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
        }}
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
              height: '100vh',
              borderRadius: 0,
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
              width: drawerCollapsed ? drawerCollapsedWidth : drawerWidth,
              borderRight: 'none',
              boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
              height: '100vh',
              borderRadius: 0,
              transition: 'width 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
              overflowX: 'hidden',
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
          display: 'flex',
          flexDirection: 'column',
          width: { md: `calc(100% - ${drawerCollapsed ? drawerCollapsedWidth : drawerWidth}px)` },
          height: '100vh',
          overflow: 'hidden',
          transition: 'width 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms, margin 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
        }}
      >
        <AppBar
          position="static"
          elevation={0}
          sx={{
            backgroundColor: 'transparent',
            color: 'text.primary',
            boxShadow: 'none',
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
              }}
            >
              Staff Dashboard
            </Typography>

            {/* User info and actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                icon={<AccountCircle />}
                label={`${user?.firstName || user?.email || 'Staff'}`}
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
                  backgroundColor: colors.secondary.main,
                  fontWeight: 600,
                  display: { xs: 'none', sm: 'flex' },
                  '&:hover': {
                    backgroundColor: colors.secondary.dark,
                  },
                }}
              >
                Sign Out
              </Button>
              <IconButton
                onClick={handleSignOut}
                sx={{
                  display: { xs: 'flex', sm: 'none' },
                  color: colors.secondary.main,
                }}
              >
                <Logout />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            p: { xs: 2, sm: 3 },
            backgroundColor: colors.background.light,
          }}
        >
          <Container maxWidth="xl">
            <Outlet />
          </Container>
        </Box>
      </Box>
    </Box>
  );
}