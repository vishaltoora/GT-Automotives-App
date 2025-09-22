import React from 'react';
import { Typography, Grid, Paper, Box, Button } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import { colors } from '../../theme/colors';

const teamMembers = [
  {
    name: 'Johny',
    role: 'Mechanic/Tire Specialist',
    phone: '(250) 986-9191',
    color: colors.primary.main,
  },
  {
    name: 'Harjinder Gill',
    role: 'Sales/Marketing',
    phone: '(250) 565-1571',
    color: colors.secondary.main,
  },
  {
    name: 'Vishal',
    role: 'Sales/Marketing',
    phone: '(250) 649-9699',
    color: colors.semantic.success,
  },
  {
    name: 'Karan',
    role: 'Tire Specialist',
    phone: '(250) 986-9794',
    color: colors.semantic.warning,
  },
  {
    name: 'Mandeep',
    role: 'Car Detailing',
    phone: '(250) 331-1025',
    color: colors.semantic.info,
  },
];

export const ContactTeam: React.FC = () => {
  return (
    <>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          textAlign: 'center',
          mb: 1,
        }}
      >
        Our Team is Ready to Help
      </Typography>
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
          color: colors.text.secondary,
          mb: 5,
        }}
      >
        Connect directly with our automotive specialists
      </Typography>

      <Grid container spacing={3}>
        {teamMembers.map((member, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={index}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                textAlign: 'center',
                border: `1px solid ${colors.neutral[200]}`,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: colors.primary.main,
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 24px ${colors.primary.main}15`,
                },
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: member.color + '15',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <PersonIcon sx={{ fontSize: 40, color: member.color }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {member.name}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.text.secondary, mb: 2 }}>
                {member.role}
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<PhoneIcon />}
                href={`tel:${member.phone.replace(/[^\d]/g, '')}`}
                sx={{
                  borderColor: member.color,
                  color: member.color,
                  fontSize: '0.75rem',
                  '&:hover': {
                    borderColor: member.color,
                    backgroundColor: member.color + '10',
                  },
                }}
              >
                {member.phone}
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </>
  );
};