import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Stack,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
} from '@mui/icons-material';
import { colors } from '../theme/colors';
import gtLogo from '../images-and-logos/gt-automotive-logo.svg';

export function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Services', path: '/services' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const drawer = (
    <Box sx={{ width: 280, pt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
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
              alt="GT Automotives Logo"
              style={{
                width: '90%',
                height: '90%',
                objectFit: 'contain',
              }}
            />
          </Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: colors.primary.main,
            }}
          >
            GT Automotives
          </Typography>
        </Box>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              onClick={handleDrawerToggle}
              selected={isActive(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: colors.primary.light + '20',
                  borderLeft: `4px solid ${colors.primary.main}`,
                },
              }}
            >
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{
                  fontWeight: isActive(item.path) ? 600 : 400,
                  color: isActive(item.path) ? colors.primary.main : 'text.primary',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/login" onClick={handleDrawerToggle}>
            <ListItemText primary="Login" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton 
            component={Link} 
            to="/register" 
            onClick={handleDrawerToggle}
            sx={{
              m: 1,
              backgroundColor: colors.secondary.main,
              color: 'white',
              '&:hover': {
                backgroundColor: colors.secondary.dark,
              },
              borderRadius: 1,
            }}
          >
            <ListItemText primary="Get Started" primaryTypographyProps={{ align: 'center' }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar 
        position="sticky" 
        elevation={1}
        sx={{ 
          backgroundColor: 'white',
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          {/* Logo and Brand */}
          <Box 
            component={Link} 
            to="/" 
            sx={{ 
              textDecoration: 'none',
              flexGrow: { xs: 1, md: 0 },
              mr: { md: 4 },
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: isMobile ? 40 : 48,
                height: isMobile ? 40 : 48,
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
                alt="GT Automotives Logo"
                style={{
                  width: '90%',
                  height: '90%',
                  objectFit: 'contain',
                }}
              />
            </Box>
            <Typography
              variant={isMobile ? 'h6' : 'h5'}
              sx={{
                fontWeight: 700,
                color: colors.primary.main,
                display: { xs: 'none', sm: 'block' },
              }}
            >
              GT Automotives
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <>
              <Box sx={{ flexGrow: 1, display: 'flex', gap: 1, ml: 2 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.label}
                    component={Link}
                    to={item.path}
                    sx={{
                      color: isActive(item.path) ? colors.primary.main : colors.text.primary,
                      fontWeight: isActive(item.path) ? 600 : 500,
                      borderBottom: isActive(item.path) ? `2px solid ${colors.primary.main}` : 'none',
                      borderRadius: 0,
                      px: 2,
                      '&:hover': {
                        backgroundColor: colors.primary.light + '10',
                        color: colors.primary.main,
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  component={Link} 
                  to="/login"
                  variant="text"
                  sx={{ 
                    color: colors.primary.main,
                    fontWeight: 500,
                  }}
                >
                  Login
                </Button>
                <Button 
                  component={Link} 
                  to="/register"
                  variant="contained"
                  sx={{ 
                    backgroundColor: colors.secondary.main,
                    '&:hover': {
                      backgroundColor: colors.secondary.dark,
                    },
                    fontWeight: 600,
                  }}
                >
                  Get Started
                </Button>
              </Box>
            </>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Container 
        component="main" 
        sx={{ 
          flex: 1, 
          py: { xs: 3, md: 6 },
          px: { xs: 2, sm: 3, md: 4 },
        }}
        maxWidth="xl"
      >
        <Outlet />
      </Container>

      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ 
          py: 4,
          px: 2,
          mt: 'auto',
          background: colors.gradients.dark,
          color: 'white',
        }}
      >
        <Container maxWidth="lg">
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={{ xs: 3, md: 6 }}
            sx={{ mb: 3 }}
          >
            {/* Company Info */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                GT Automotives
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                Your trusted partner for quality tires and professional automotive services.
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Serving the community since 2010
              </Typography>
            </Box>

            {/* Quick Links */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Quick Links
              </Typography>
              <Stack spacing={1}>
                {navItems.map((item) => (
                  <Typography
                    key={item.label}
                    component={Link}
                    to={item.path}
                    variant="body2"
                    sx={{
                      color: 'white',
                      opacity: 0.9,
                      textDecoration: 'none',
                      '&:hover': {
                        opacity: 1,
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    {item.label}
                  </Typography>
                ))}
              </Stack>
            </Box>

            {/* Contact Info */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Contact Us
              </Typography>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon fontSize="small" />
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    (250) 986-9191 / (250) 565-1571
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon fontSize="small" />
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    gt-automotives@outlook.com
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <LocationIcon fontSize="small" />
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    British Columbia<br />
                    Canada
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* Business Hours */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Business Hours
              </Typography>
              <Stack spacing={0.5}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Monday - Friday: 8:00 AM - 6:00 PM
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Saturday - Sunday: 9:00 AM - 5:00 PM
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600, mt: 1 }}>
                  24/7 Emergency Service Available
                </Typography>
              </Stack>
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <IconButton 
                  size="small" 
                  sx={{ 
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  <FacebookIcon />
                </IconButton>
                <IconButton 
                  size="small" 
                  sx={{ 
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  <InstagramIcon />
                </IconButton>
              </Box>
            </Box>
          </Stack>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 2 }} />
          
          <Typography variant="body2" align="center" sx={{ opacity: 0.8 }}>
            © {new Date().getFullYear()} GT Automotives. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}