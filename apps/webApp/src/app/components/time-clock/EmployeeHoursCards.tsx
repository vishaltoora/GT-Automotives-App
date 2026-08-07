import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import { CheckCircle, HourglassEmpty, PlayArrow } from '@mui/icons-material';
import { PayPeriodHoursDto } from '@gt-automotive/data';
import { colors } from '../../theme/colors';

const formatHours = (hours: number) => `${hours.toFixed(2)} hrs`;

const employeeName = (row: PayPeriodHoursDto) =>
  [row.employee?.firstName, row.employee?.lastName].filter(Boolean).join(' ') ||
  row.employee?.email ||
  'Unknown employee';

interface EmployeeHoursCardsProps {
  rows: PayPeriodHoursDto[];
  /** The card currently expanded, if any. */
  selectedEmployeeId?: string;
  /** Omit to render the cards as plain figures rather than a selector. */
  onSelect?: (employeeId: string) => void;
  emptyMessage?: string;
}

/**
 * A card per employee showing where their pay period stands.
 *
 * The whole team is on screen at once so the person whose hours look wrong can
 * be spotted without selecting anyone first — which is the difference between
 * catching a discrepancy during the period and catching it at payroll time.
 *
 * Approved and unapproved are shown side by side rather than as a total,
 * because the gap between them is the actionable number: only approved hours
 * are payable, so unapproved hours are what still has to be chased.
 */
export function EmployeeHoursCards({
  rows,
  selectedEmployeeId,
  onSelect,
  emptyMessage = 'No active employees to show for this pay period',
}: EmployeeHoursCardsProps) {
  if (rows.length === 0) {
    return (
      <Paper
        variant="outlined"
        sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}
      >
        {emptyMessage}
      </Paper>
    );
  }

  return (
    <Grid container spacing={{ xs: 1.5, sm: 2 }}>
      {rows.map((row) => {
        const selected = row.employeeId === selectedEmployeeId;
        const needsChasing = row.unapprovedHours > 0;

        const body = (
          <CardContent sx={{ p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 1,
                mb: 1.5,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, lineHeight: 1.3 }}
                >
                  {employeeName(row)}
                </Typography>
                {row.role && (
                  <Typography variant="caption" color="text.secondary">
                    {row.role}
                  </Typography>
                )}
              </Box>
              {row.openEntryCount > 0 && (
                <Chip
                  size="small"
                  color="info"
                  variant="outlined"
                  icon={<PlayArrow />}
                  label="On the clock"
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: colors.semantic.success,
                  }}
                >
                  <CheckCircle sx={{ fontSize: 16 }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    Approved
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '1.1rem', sm: '1.3rem' },
                  }}
                >
                  {formatHours(row.approvedHours)}
                </Typography>
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: needsChasing
                      ? colors.semantic.warning
                      : 'text.secondary',
                  }}
                >
                  <HourglassEmpty sx={{ fontSize: 16 }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    Unapproved
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '1.1rem', sm: '1.3rem' },
                    color: needsChasing
                      ? colors.semantic.warning
                      : 'text.secondary',
                  }}
                >
                  {formatHours(row.unapprovedHours)}
                </Typography>
              </Box>
            </Box>

            {/* Paid hours are part of the approved figure above, so they are a
                footnote rather than a third column — the card is about what
                still needs attention. */}
            {row.processedHours > 0 && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 1.25 }}
              >
                {formatHours(row.processedHours)} already paid
              </Typography>
            )}
          </CardContent>
        );

        return (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={row.employeeId}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                border: `1px solid ${
                  selected ? colors.primary.main : colors.neutral[200]
                }`,
                borderWidth: selected ? 2 : 1,
                backgroundColor: selected
                  ? `${colors.primary.main}0A`
                  : undefined,
              }}
            >
              {onSelect ? (
                <CardActionArea
                  onClick={() => onSelect(row.employeeId)}
                  aria-pressed={selected}
                  sx={{ height: '100%' }}
                >
                  {body}
                </CardActionArea>
              ) : (
                body
              )}
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}

export default EmployeeHoursCards;
