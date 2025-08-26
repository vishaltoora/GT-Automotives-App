import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { DirectionsCar, Receipt, CalendarMonth, Person } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

export function CustomerDashboard() {
  const { user } = useAuth();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.firstName}!
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage your vehicles, view invoices, and schedule appointments from your dashboard.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DirectionsCar sx={{ mr: 1 }} />
                <Typography variant="h6">Vehicles</Typography>
              </Box>
              <Typography variant="h3">0</Typography>
              <Button 
                component={Link} 
                to="/customer/vehicles" 
                size="small" 
                sx={{ mt: 1 }}
              >
                Manage Vehicles
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Receipt sx={{ mr: 1 }} />
                <Typography variant="h6">Invoices</Typography>
              </Box>
              <Typography variant="h3">0</Typography>
              <Button 
                component={Link} 
                to="/customer/invoices" 
                size="small" 
                sx={{ mt: 1 }}
              >
                View Invoices
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarMonth sx={{ mr: 1 }} />
                <Typography variant="h6">Appointments</Typography>
              </Box>
              <Typography variant="h3">0</Typography>
              <Button 
                component={Link} 
                to="/customer/appointments" 
                size="small" 
                sx={{ mt: 1 }}
              >
                Schedule
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Person sx={{ mr: 1 }} />
                <Typography variant="h6">Profile</Typography>
              </Box>
              <Typography variant="body2">Complete</Typography>
              <Button 
                component={Link} 
                to="/customer/profile" 
                size="small" 
                sx={{ mt: 1 }}
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" component={Link} to="/customer/appointments/new">
              Schedule Service
            </Button>
            <Button variant="outlined" component={Link} to="/customer/vehicles/add">
              Add Vehicle
            </Button>
            <Button variant="outlined" component={Link} to="/customer/invoices">
              View Recent Invoices
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}