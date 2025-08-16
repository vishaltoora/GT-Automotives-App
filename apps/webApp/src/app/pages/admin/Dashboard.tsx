import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { 
  People, 
  AttachMoney, 
  TrendingUp, 
  Inventory,
  SupervisorAccount,
  Analytics
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

export function AdminDashboard() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Complete business overview and management tools.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoney sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Revenue</Typography>
              </Box>
              <Typography variant="h3">$0</Typography>
              <Typography variant="body2" color="text.secondary">
                Month to date
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <People sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Customers</Typography>
              </Box>
              <Typography variant="h3">0</Typography>
              <Typography variant="body2" color="text.secondary">
                Active customers
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SupervisorAccount sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h6">Staff</Typography>
              </Box>
              <Typography variant="h3">0</Typography>
              <Typography variant="body2" color="text.secondary">
                Active employees
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">Growth</Typography>
              </Box>
              <Typography variant="h3">0%</Typography>
              <Typography variant="body2" color="text.secondary">
                vs last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                <Button variant="contained" component={Link} to="/admin/users/new">
                  Add User
                </Button>
                <Button variant="outlined" component={Link} to="/admin/reports">
                  View Reports
                </Button>
                <Button variant="outlined" component={Link} to="/admin/inventory">
                  Manage Inventory
                </Button>
                <Button variant="outlined" component={Link} to="/admin/settings">
                  Settings
                </Button>
              </Box>

              <Typography variant="h6" gutterBottom>
                System Status
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Database:</strong> Connected ✓
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Authentication:</strong> Active ✓
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Last Backup:</strong> Never
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>System Version:</strong> 1.0.0
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No recent activity to display.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}