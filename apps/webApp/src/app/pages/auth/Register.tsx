import { Box, Container, Typography, Alert, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Lock } from '@mui/icons-material';

export function Register() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        <Lock sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography component="h1" variant="h4" sx={{ mb: 2 }}>
          Registration Not Available
        </Typography>
        <Alert severity="warning" sx={{ mb: 3, width: '100%' }}>
          Public registration is disabled. Only administrators can create new user accounts.
        </Alert>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          If you need access to the system, please contact your administrator who can create an account for you.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/login')}
          sx={{ mt: 2 }}
        >
          Go to Sign In
        </Button>
      </Box>
    </Container>
  );
}