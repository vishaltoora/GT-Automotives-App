import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Skeleton } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  ShoppingCart as PurchaseIcon,
  AccountBalance as ExpenseIcon,
} from '@mui/icons-material';

export interface AnalyticsCardData {
  title: string;
  mtdValue: number;
  ytdValue: number;
  mtdCount?: number;
  ytdCount?: number;
  icon?: React.ReactNode;
  color?: string;
  formatValue?: (value: number) => string;
}

interface AnalyticsCardsProps {
  cards: AnalyticsCardData[];
  loading?: boolean;
}

const AnalyticsCards: React.FC<AnalyticsCardsProps> = ({ cards, loading = false }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const defaultFormatValue = (value: number) => formatCurrency(value);

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {cards.map((card, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
          <Card
            sx={{
              height: '100%',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <CardContent sx={{ py: 2 }}>
              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <Box
                  sx={{
                    mr: 1,
                    color: card.color || 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {card.icon || <MoneyIcon />}
                </Box>
                <Typography variant="subtitle1" color="text.secondary" fontWeight={600}>
                  {card.title}
                </Typography>
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {/* MTD Sub-Card */}
                  <Box
                    sx={{
                      flex: 1,
                      p: 1.5,
                      borderRadius: 1,
                      background: `linear-gradient(135deg, ${card.color || '#1976d2'}15 0%, ${card.color || '#1976d2'}05 100%)`,
                      border: `1px solid ${card.color || '#1976d2'}30`,
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      MTD
                    </Typography>
                    {card.mtdCount !== undefined && (
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.7rem', mt: 0.25 }}>
                        ({card.mtdCount} invoices)
                      </Typography>
                    )}
                    <Typography variant="h6" fontWeight={700} color={card.color || 'primary.main'} sx={{ mt: 0.5 }}>
                      {(card.formatValue || defaultFormatValue)(card.mtdValue)}
                    </Typography>
                  </Box>

                  {/* YTD Sub-Card */}
                  <Box
                    sx={{
                      flex: 1,
                      p: 1.5,
                      borderRadius: 1,
                      background: `linear-gradient(135deg, ${card.color || '#1976d2'}15 0%, ${card.color || '#1976d2'}05 100%)`,
                      border: `1px solid ${card.color || '#1976d2'}30`,
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      YTD
                    </Typography>
                    {card.ytdCount !== undefined && (
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.7rem', mt: 0.25 }}>
                        ({card.ytdCount} invoices)
                      </Typography>
                    )}
                    <Typography variant="h6" fontWeight={700} color={card.color || 'primary.main'} sx={{ mt: 0.5 }}>
                      {(card.formatValue || defaultFormatValue)(card.ytdValue)}
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default AnalyticsCards;

// Predefined icon exports for convenience
export const AnalyticsIcons = {
  Money: <MoneyIcon />,
  Receipt: <ReceiptIcon />,
  Purchase: <PurchaseIcon />,
  Expense: <ExpenseIcon />,
  TrendingUp: <TrendingUpIcon />,
  TrendingDown: <TrendingDownIcon />,
};
