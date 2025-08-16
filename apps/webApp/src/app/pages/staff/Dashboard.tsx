import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { People, Inventory, Receipt, CalendarMonth, TrendingUp } from '@mui/icons-material';
import { Link } from 'react-router-dom';

export function StaffDashboard() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Staff Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage customers, inventory, and daily operations.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <People sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Customers</Typography>
              </Box>
              <Typography variant="h3">0</Typography>
              <Typography variant="body2" color="text.secondary">
                Total customers
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Inventory sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Inventory</Typography>
              </Box>
              <Typography variant="h3">0</Typography>
              <Typography variant="body2" color="text.secondary">
                Items in stock
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Receipt sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">Today's Sales</Typography>
              </Box>
              <Typography variant="h3">0</Typography>
              <Typography variant="body2" color="text.secondary">
                Invoices today
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarMonth sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h6">Appointments</Typography>
              </Box>
              <Typography variant="h3">0</Typography>
              <Typography variant="body2" color="text.secondary">
                Scheduled today
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" component={Link} to="/staff/invoices/new">
                  Create Invoice
                </Button>
                <Button variant="outlined" component={Link} to="/staff/customers/new">
                  Add Customer
                </Button>
                <Button variant="outlined" component={Link} to="/staff/inventory">
                  Check Inventory
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Appointments
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No appointments scheduled for today.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}