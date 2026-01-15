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
  Tooltip,
  Collapse
} from '@mui/material';
import {
  Dashboard,
  Receipt,
  Assessment,
  Analytics,
  Logout,
  Menu as MenuIcon,
  AccountCircle,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  ExpandMore,
  ExpandLess,
  BarChart,
  AccountBalance
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../theme/colors';
import gtLogo from '../images-and-logos/gt-automotive-logo.svg';
import Footer from '../components/common/Footer';

const drawerWidth = 280;
const drawerCollapsedWidth = 72;

export function AccountantLayout() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [drawerCollapsed, setDrawerCollapsed] = React.useState(false);
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    financial: true,
    reports: true,
  });
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

  const handleSectionToggle = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const menuSections = [
    {
      title: 'Overview',
      items: [
        { text: 'Dashboard', icon: <Dashboard />, path: '/accountant/dashboard' },
      ]
    },
    {
      id: 'financial',
      title: 'Financial',
      icon: <AccountBalance />,
      items: [
        { text: 'Invoices', icon: <Receipt />, path: '/accountant/invoices' },
        { text: 'Cash Report', icon: <Assessment />, path: '/accountant/cash-report' },
        { text: 'Purchase & Expense', icon: <ShoppingCart />, path: '/accountant/purchase-invoices' },
      ]
    },
    {
      id: 'reports',
      title: 'Reports',
      icon: <BarChart />,
      items: [
        { text: 'Tax Report', icon: <Analytics />, path: '/accountant/reports' },
        { text: 'Analytics', icon: <Analytics />, path: '/accountant/analytics' },
      ]
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'white' }}>
      <Toolbar sx={{
        py: 2,
        px: drawerCollapsed ? 1 : 2,
        background: colors.primary.main,
        borderBottom: `1px solid ${colors.neutral[200]}`,
        justifyContent: drawerCollapsed ? 'center' : 'flex-start',
        minHeight: 80,
      }}>
        <Box
          component={Link}
          to="/accountant/dashboard"
          onClick={() => setMobileOpen(false)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: drawerCollapsed ? 0 : 1.5,
            width: '100%',
            justifyContent: drawerCollapsed ? 'center' : 'flex-start',
            textDecoration: 'none',
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.9,
            },
          }}
        >
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
            <Box sx={{ whiteSpace: 'nowrap' }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, lineHeight: 1, whiteSpace: 'nowrap' }}>
                GT Automotives
              </Typography>
              <Typography variant="caption" sx={{ color: colors.neutral[100], fontWeight: 500, whiteSpace: 'nowrap' }}>
                16472991 Canada INC.
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

      <List sx={{ flex: 1, py: 1, px: drawerCollapsed ? 0.5 : 1, overflowY: 'auto' }}>
        {menuSections.map((section, sectionIndex) => (
          <React.Fragment key={section.title}>
            {/* Section without expand (Overview) */}
            {!section.id && (
              <>
                {section.items.map((item) => {
                  const active = isActive(item.path);
                  const listButton = (
                    <ListItemButton
                      component={Link}
                      to={item.path}
                      sx={{
                        borderRadius: 1.5,
                        mx: 0.5,
                        mb: 0.5,
                        transition: 'all 0.2s',
                        backgroundColor: active ? colors.primary.lighter + '20' : 'transparent',
                        borderLeft: active ? `3px solid ${colors.primary.main}` : '3px solid transparent',
                        justifyContent: drawerCollapsed ? 'center' : 'flex-start',
                        px: drawerCollapsed ? 0 : 2,
                        '&:hover': {
                          backgroundColor: colors.neutral[100],
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
                    <ListItem key={item.text} disablePadding>
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
                <Divider sx={{ my: 1.5, mx: drawerCollapsed ? 1 : 0, borderColor: colors.neutral[200] }} />
              </>
            )}

            {/* Expandable sections */}
            {section.id && (
              <>
                {drawerCollapsed ? (
                  // Collapsed view - show section icon with tooltip
                  <Tooltip title={section.title} placement="right" arrow>
                    <ListItemButton
                      onClick={() => handleSectionToggle(section.id!)}
                      sx={{
                        borderRadius: 1.5,
                        mx: 0.5,
                        mb: 0.5,
                        justifyContent: 'center',
                        backgroundColor: colors.neutral[100],
                        '&:hover': {
                          backgroundColor: colors.neutral[200],
                        },
                      }}
                    >
                      <ListItemIcon sx={{
                        color: colors.neutral[700],
                        minWidth: 0,
                        justifyContent: 'center',
                      }}>
                        {section.icon}
                      </ListItemIcon>
                    </ListItemButton>
                  </Tooltip>
                ) : (
                  // Expanded view - show section header with minimal style
                  <ListItemButton
                    onClick={() => handleSectionToggle(section.id!)}
                    sx={{
                      borderRadius: 0,
                      mx: 0,
                      mb: 0.5,
                      py: 1,
                      px: 2,
                      borderLeft: `3px solid ${colors.primary.main}`,
                      backgroundColor: 'transparent',
                      '&:hover': {
                        backgroundColor: colors.primary.lighter + '10',
                      },
                    }}
                  >
                    <ListItemIcon sx={{
                      color: colors.primary.main,
                      minWidth: 40,
                    }}>
                      {section.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={section.title}
                      primaryTypographyProps={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: colors.primary.main,
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                      }}
                    />
                    {expandedSections[section.id] ? (
                      <ExpandLess sx={{ color: colors.primary.main, fontSize: '1.2rem' }} />
                    ) : (
                      <ExpandMore sx={{ color: colors.primary.main, fontSize: '1.2rem' }} />
                    )}
                  </ListItemButton>
                )}

                {/* Section items - always show when collapsed, conditionally when expanded */}
                <Collapse in={drawerCollapsed || expandedSections[section.id]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {section.items.map((item) => {
                      const active = isActive(item.path);
                      const listButton = (
                        <ListItemButton
                          component={Link}
                          to={item.path}
                          sx={{
                            borderRadius: 1.5,
                            mx: 0.5,
                            mb: 0.5,
                            pl: drawerCollapsed ? 0 : 4,
                            transition: 'all 0.2s',
                            backgroundColor: active ? colors.primary.lighter + '20' : 'transparent',
                            borderLeft: active ? `3px solid ${colors.primary.main}` : '3px solid transparent',
                            justifyContent: drawerCollapsed ? 'center' : 'flex-start',
                            '&:hover': {
                              backgroundColor: colors.neutral[100],
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
                                fontSize: '0.9rem',
                                fontWeight: active ? 600 : 400,
                                color: active ? colors.primary.main : colors.text.primary,
                              }}
                            />
                          )}
                        </ListItemButton>
                      );

                      return (
                        <ListItem key={item.text} disablePadding>
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
                </Collapse>

                {sectionIndex < menuSections.length - 1 && (
                  <Divider sx={{ my: 1.5, mx: drawerCollapsed ? 1 : 0, borderColor: colors.neutral[200] }} />
                )}
              </>
            )}
          </React.Fragment>
        ))}
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
      <Footer collapsed={drawerCollapsed} />
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

            {/* Logo for mobile - Clickable */}
            <Box
              component={Link}
              to="/accountant/dashboard"
              sx={{
                display: { xs: 'flex', md: 'none' },
                alignItems: 'center',
                gap: 1,
                flexGrow: 1,
                textDecoration: 'none',
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8,
                },
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
                GT Accounting
              </Typography>
            </Box>

            {/* Desktop title */}
            <Typography
              variant="h5"
              noWrap
              component={Link}
              to="/accountant/dashboard"
              sx={{
                flexGrow: 1,
                fontWeight: 600,
                color: colors.primary.main,
                display: { xs: 'none', md: 'block' },
                textDecoration: 'none',
                cursor: 'pointer',
                '&:hover': {
                  color: colors.primary.dark,
                },
              }}
            >
              Accountant Dashboard
            </Typography>

            {/* User info and actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                icon={<AccountCircle />}
                label={`${user?.firstName || user?.email || 'Accountant'}`}
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
            backgroundColor: 'white',
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
