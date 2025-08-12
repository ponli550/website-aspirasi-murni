import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  BarChart as ChartIcon,
  GetApp as ExportIcon
} from '@mui/icons-material';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { getDashboardSummary, getMonthlyReport, exportEInvoice } from '../services/api';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableMonths, setAvailableMonths] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    fetchSummaryData();
  }, []);

  useEffect(() => {
    if (selectedMonth && selectedYear) {
      fetchMonthlyReport(selectedMonth, selectedYear);
    }
  }, [selectedMonth, selectedYear]);

  const fetchSummaryData = async () => {
    try {
      setLoading(true);
      const summary = await getDashboardSummary();
      setSummaryData(summary);

      // Extract available months and years from the data
      const months = new Set();
      const years = new Set();

      summary.monthlyPayments.forEach(item => {
        months.add(item._id);
      });

      // Add current year and previous year
      const currentYear = new Date().getFullYear();
      years.add(currentYear);
      years.add(currentYear - 1);

      setAvailableMonths(Array.from(months));
      setAvailableYears(Array.from(years).sort((a, b) => b - a)); // Sort years in descending order

      // Set default selected month to current month
      setSelectedMonth(summary.currentMonth);
      setSelectedYear(summary.currentYear);

      setError(null);
    } catch (err) {
      console.error('Error fetching summary data:', err);
      setError('Failed to load summary data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyReport = async (month, year) => {
    try {
      setLoading(true);
      const report = await getMonthlyReport(month, year);
      setMonthlyReport(report);
      setError(null);
    } catch (err) {
      console.error(`Error fetching monthly report for ${month} ${year}:`, err);
      setError(`Failed to load report for ${month} ${year}. Please try again later.`);
      setMonthlyReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };



  const handleExportEInvoice = async (format) => {
    try {
      setLoading(true);
      const filters = {
        month: selectedMonth,
        year: selectedYear
      };
      
      await exportEInvoice(format, filters);
      setError(null);
    } catch (err) {
      console.error(`Error exporting e-invoice as ${format}:`, err);
      setError(`Failed to export e-invoice as ${format.toUpperCase()}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data for payment methods
  const paymentMethodsData = {
    labels: monthlyReport?.paymentMethodSummary.map(item => item._id) || [],
    datasets: [
      {
        label: 'Payment Methods',
        data: monthlyReport?.paymentMethodSummary.map(item => item.total) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  if (loading && !monthlyReport) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Payment Reports
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="month-select-label">Month</InputLabel>
              <Select
                labelId="month-select-label"
                value={selectedMonth}
                label="Month"
                onChange={handleMonthChange}
              >
                {availableMonths.map((month) => (
                  <MenuItem key={month} value={month}>{month}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="year-select-label">Year</InputLabel>
              <Select
                labelId="year-select-label"
                value={selectedYear}
                label="Year"
                onChange={handleYearChange}
              >
                {availableYears.map((year) => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>

              <Button
                variant="outlined"
                color="secondary"
                startIcon={<ExportIcon />}
                onClick={() => handleExportEInvoice('xml')}
                disabled={!monthlyReport || loading}
                size="small"
              >
                Export XML
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<ExportIcon />}
                onClick={() => handleExportEInvoice('json')}
                disabled={!monthlyReport || loading}
                size="small"
              >
                Export JSON
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<PdfIcon />}
                onClick={() => handleExportEInvoice('pdf')}
                disabled={!monthlyReport || loading}
                size="small"
              >
                Export PDF
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {monthlyReport ? (
        <Box id="printable-report">
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5">
              {monthlyReport.month} {monthlyReport.year} Report
            </Typography>
            <Typography variant="h6" color="primary">
              Total: RM {monthlyReport.totalAmount.toFixed(2)}
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Summary</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Total Amount</Typography>
                      <Typography variant="h6">RM {monthlyReport.totalAmount.toFixed(2)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Number of Payments</Typography>
                      <Typography variant="h6">{monthlyReport.paymentCount}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Average Payment</Typography>
                      <Typography variant="h6">
                        RM {monthlyReport.paymentCount > 0 
                          ? (monthlyReport.totalAmount / monthlyReport.paymentCount).toFixed(2) 
                          : '0.00'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Payment Methods</Typography>
                      <Typography variant="h6">{monthlyReport.paymentMethodSummary.length}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Payment Methods</Typography>
                  <Box sx={{ height: 200 }}>
                    {monthlyReport.paymentMethodSummary.length > 0 ? (
                      <Pie data={paymentMethodsData} options={{ maintainAspectRatio: false }} />
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Typography variant="body1" color="textSecondary">No payment method data available</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom>Payment Details</Typography>
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Student</TableCell>
                    <TableCell>Amount (RM)</TableCell>
                    <TableCell>Payment Method</TableCell>
                    <TableCell>Receipt #</TableCell>
                    <TableCell>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {monthlyReport.payments.length > 0 ? (
                    monthlyReport.payments.map((payment) => (
                      <TableRow key={payment._id}>
                        <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                        <TableCell>{payment.student?.name || 'Unknown Student'}</TableCell>
                        <TableCell>{payment.amount.toFixed(2)}</TableCell>
                        <TableCell>{payment.paymentMethod}</TableCell>
                        <TableCell>{payment.receiptNumber || '-'}</TableCell>
                        <TableCell>{payment.description || '-'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No payment records found for this month.
                      </TableCell>
                    </TableRow>
                  )}
                  {monthlyReport.payments.length > 0 && (
                    <TableRow>
                      <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>Total</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>RM {monthlyReport.totalAmount.toFixed(2)}</TableCell>
                      <TableCell colSpan={3}></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>Payment Method Breakdown</Typography>
            <Grid container spacing={2}>
              {monthlyReport.paymentMethodSummary.map((method) => (
                <Grid item xs={12} sm={6} md={4} key={method._id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6">{method._id}</Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {method.count} payment{method.count !== 1 ? 's' : ''}
                      </Typography>
                      <Typography variant="h5" color="primary">
                        RM {method.total.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {((method.total / monthlyReport.totalAmount) * 100).toFixed(1)}% of total
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Select a month and year to view the report
          </Typography>
          <ChartIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5 }} />
        </Box>
      )}
    </Box>
  );
};

export default Reports;