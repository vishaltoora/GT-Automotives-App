import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  TextField,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Print as PrintIcon,
  Today as TodayIcon,
} from '@mui/icons-material';
import { invoiceService } from '../../services/invoice.service';
import { useAuth } from '../../hooks/useAuth';

const CashReport: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReport();
  }, [reportDate]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await invoiceService.getDailyCashReport(reportDate);
      setReport(data);
    } catch (error) {
      console.error('Error loading cash report:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const getPaymentMethodLabel = (method: string) => {
    return method ? method.replace(/_/g, ' ') : 'Unknown';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button startIcon={<BackIcon />} onClick={() => {
          const basePath = role === 'admin' ? '/admin' : role === 'staff' ? '/staff' : '/customer';
          navigate(`${basePath}/invoices`);
        }}>
          Back to Invoices
        </Button>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            size="small"
          />
          <Button
            variant="outlined"
            startIcon={<TodayIcon />}
            onClick={() => setReportDate(new Date().toISOString().split('T')[0])}
          >
            Today
          </Button>
          <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint}>
            Print Report
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Daily Cash Report
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {new Date(reportDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Typography>

        {loading ? (
          <Typography>Loading report...</Typography>
        ) : report ? (
          <>
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Total Invoices
                    </Typography>
                    <Typography variant="h4">{report.totalInvoices}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Total Revenue
                    </Typography>
                    <Typography variant="h4">{formatCurrency(report.totalRevenue)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {report.byPaymentMethod && report.byPaymentMethod.length > 0 && (
              <>
                <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                  Revenue by Payment Method
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Payment Method</TableCell>
                        <TableCell align="center">Count</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {report.byPaymentMethod.map((method: any) => (
                        <TableRow key={method.paymentMethod || 'unknown'}>
                          <TableCell>
                            {getPaymentMethodLabel(method.paymentMethod)}
                          </TableCell>
                          <TableCell align="center">{method._count}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(method._sum.total || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {report.invoices && report.invoices.length > 0 && (
              <>
                <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                  Invoice Details
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Invoice #</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Payment Method</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {report.invoices.map((invoice: any) => (
                        <TableRow key={invoice.id}>
                          <TableCell>{invoice.invoiceNumber}</TableCell>
                          <TableCell>
                            {invoice.customer?.user?.firstName} {invoice.customer?.user?.lastName}
                          </TableCell>
                          <TableCell>
                            {getPaymentMethodLabel(invoice.paymentMethod)}
                          </TableCell>
                          <TableCell align="right">{formatCurrency(invoice.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {report.totalInvoices === 0 && (
              <Typography variant="body1" sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
                No paid invoices found for this date.
              </Typography>
            )}
          </>
        ) : (
          <Typography>No data available</Typography>
        )}
      </Paper>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .MuiPaper-root {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .MuiButton-root {
            display: none;
          }
          .MuiTextField-root {
            display: none;
          }
        }
      `}</style>
    </Box>
  );
};

export default CashReport;