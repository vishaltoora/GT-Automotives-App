import { Box, Tab, Tabs, Typography } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

/**
 * Shell for the system settings area.
 *
 * Everything under here configures how the shop runs rather than doing a day's
 * work with it — invoice terms, inspection pricing, appointment payout rules,
 * and how each employee is paid. These used to sit in the Business and
 * Operations menus, next to the screens that consume them, which made them read
 * as daily work. Each tab keeps its own URL so it stays linkable and
 * bookmarkable.
 */
const TABS = [
  { label: 'General', segment: '' },
  { label: 'Inspection Items & Pricing', segment: 'inspection-items' },
  { label: 'Payout Rules', segment: 'payout-rules' },
  { label: 'Compensation & Bonus', segment: 'compensation' },
];

export function SettingsLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Derived from the URL rather than held in state, so a deep link, a back
  // button and a tab click all land on the same tab.
  const base = location.pathname.replace(/\/settings(\/.*)?$/, '/settings');
  const segment = location.pathname.slice(base.length).replace(/^\/|\/$/g, '');
  const activeIndex = Math.max(
    TABS.findIndex((tab) => tab.segment === segment),
    0
  );

  return (
    <Box>
      <Box sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <SettingsIcon color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            System Settings
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Configuration that applies across the shop. Changes here take effect
          immediately.
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
        <Tabs
          value={activeIndex}
          onChange={(_event, index) =>
            navigate(`${base}/${TABS[index].segment}`.replace(/\/$/, ''))
          }
          variant="scrollable"
          scrollButtons="auto"
          aria-label="settings tabs"
          sx={{
            px: { xs: 1, sm: 2 },
            '& .MuiTab-root': {
              fontWeight: 600,
              textTransform: 'none',
              fontSize: { xs: '0.85rem', sm: '0.95rem' },
            },
          }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.label} label={tab.label} />
          ))}
        </Tabs>
      </Box>

      <Outlet />
    </Box>
  );
}

export default SettingsLayout;
